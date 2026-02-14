/**
 * Unit Tests for M/M/c/K Queueing Model (Finite Capacity)
 *
 * These tests verify that our mathematical implementation matches
 * known theoretical results from queueing theory literature.
 */

import { describe, it, expect } from 'vitest';
import { MMCKQueueingModel, MMCKQueueingParameters } from '../MMCKQueueingModel';

describe('MMCKQueueingModel', () => {
  describe('isStable is always true', () => {
    it('should always return isStable === true regardless of ρ', () => {
      // ρ < 1 (underloaded)
      const stable: MMCKQueueingParameters = { arrivalRate: 5, serviceRate: 10, numServers: 2, maxCapacity: 10 };
      expect(MMCKQueueingModel.calculateMetrics(stable).isStable).toBe(true);

      // ρ = 1 (exactly at capacity)
      const critical: MMCKQueueingParameters = { arrivalRate: 20, serviceRate: 10, numServers: 2, maxCapacity: 10 };
      expect(MMCKQueueingModel.calculateMetrics(critical).isStable).toBe(true);

      // ρ > 1 (overloaded)
      const overloaded: MMCKQueueingParameters = { arrivalRate: 20, serviceRate: 5, numServers: 2, maxCapacity: 10 };
      expect(MMCKQueueingModel.calculateMetrics(overloaded).isStable).toBe(true);
    });
  });

  describe('All metrics are finite when ρ > 1', () => {
    it('should return all finite numeric fields for λ=20, μ=5, c=2, K=10 (ρ=2)', () => {
      const params: MMCKQueueingParameters = { arrivalRate: 20, serviceRate: 5, numServers: 2, maxCapacity: 10 };
      const metrics = MMCKQueueingModel.calculateMetrics(params);

      expect(Number.isFinite(metrics.utilization)).toBe(true);
      expect(Number.isFinite(metrics.averageQueueLength)).toBe(true);
      expect(Number.isFinite(metrics.averageSystemLength)).toBe(true);
      expect(Number.isFinite(metrics.averageWaitTime)).toBe(true);
      expect(Number.isFinite(metrics.averageSystemTime)).toBe(true);
      expect(Number.isFinite(metrics.rejectionProbability)).toBe(true);
      expect(metrics.isStable).toBe(true);
      // Overloaded — Pb should be close to 1
      expect(metrics.rejectionProbability).toBeGreaterThan(0.5);
    });
  });

  describe('Rejection probability bounds', () => {
    const testCases: MMCKQueueingParameters[] = [
      { arrivalRate: 5, serviceRate: 10, numServers: 2, maxCapacity: 5 },
      { arrivalRate: 10, serviceRate: 8, numServers: 2, maxCapacity: 8 },
      { arrivalRate: 20, serviceRate: 5, numServers: 2, maxCapacity: 10 },
      { arrivalRate: 1, serviceRate: 10, numServers: 3, maxCapacity: 20 },
    ];

    testCases.forEach((params) => {
      it(`Pb ∈ [0,1] for λ=${params.arrivalRate}, μ=${params.serviceRate}, c=${params.numServers}, K=${params.maxCapacity}`, () => {
        const { rejectionProbability } = MMCKQueueingModel.calculateMetrics(params);
        expect(rejectionProbability).toBeGreaterThanOrEqual(0);
        expect(rejectionProbability).toBeLessThanOrEqual(1);
      });
    });
  });

  describe('M/M/1/K known result', () => {
    /**
     * λ=6, μ=10, c=1, K=5
     * ρ = 0.6
     *
     * For M/M/1/K:
     *   P0 = (1-ρ) / (1-ρ^(K+1))
     *      = 0.4 / (1 - 0.6^6) = 0.4 / (1 - 0.046656) = 0.4 / 0.953344 ≈ 0.41956
     *   Pb = P(K) = P0 × ρ^K = 0.41956 × 0.6^5 = 0.41956 × 0.07776 ≈ 0.03262
     */
    it('should match known M/M/1/K result: λ=6, μ=10, c=1, K=5 → Pb ≈ 0.033', () => {
      const params: MMCKQueueingParameters = { arrivalRate: 6, serviceRate: 10, numServers: 1, maxCapacity: 5 };
      const metrics = MMCKQueueingModel.calculateMetrics(params);
      expect(metrics.rejectionProbability).toBeCloseTo(0.033, 2);
    });
  });

  describe('Large K degrades to M/M/c behaviour', () => {
    it('should give near-zero Pb for K=1000, λ=10, μ=8, c=2 (ρ=0.625)', () => {
      const params: MMCKQueueingParameters = { arrivalRate: 10, serviceRate: 8, numServers: 2, maxCapacity: 1000 };
      const metrics = MMCKQueueingModel.calculateMetrics(params);
      expect(metrics.rejectionProbability).toBeLessThan(0.001);
    });
  });

  describe("Little's Law with effective rate", () => {
    it('should satisfy L ≈ λ_eff × W and Lq ≈ λ_eff × Wq', () => {
      const params: MMCKQueueingParameters = { arrivalRate: 10, serviceRate: 8, numServers: 2, maxCapacity: 15 };
      const metrics = MMCKQueueingModel.calculateMetrics(params);
      const lambdaEff = params.arrivalRate * (1 - metrics.rejectionProbability);

      expect(metrics.averageSystemLength).toBeCloseTo(lambdaEff * metrics.averageSystemTime, 4);
      expect(metrics.averageQueueLength).toBeCloseTo(lambdaEff * metrics.averageWaitTime, 4);
    });
  });

  describe('K=c edge case (no waiting room)', () => {
    it('should give Lq=0 and Pb>0 when K equals numServers', () => {
      const params: MMCKQueueingParameters = { arrivalRate: 10, serviceRate: 8, numServers: 3, maxCapacity: 3 };
      const metrics = MMCKQueueingModel.calculateMetrics(params);
      expect(metrics.averageQueueLength).toBeCloseTo(0, 4);
      expect(metrics.rejectionProbability).toBeGreaterThan(0);
    });
  });
});
