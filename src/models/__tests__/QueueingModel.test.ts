/**
 * Unit Tests for M/M/c Queueing Model
 *
 * These tests verify that our mathematical implementation matches
 * known theoretical results from queueing theory literature.
 */

import { describe, it, expect } from 'vitest';
import { MMCQueueingModel, QueueingParameters } from '../QueueingModel';

describe('MMCQueueingModel', () => {
  describe('Utilization Calculation', () => {
    it('should calculate utilization correctly for single server', () => {
      const params: QueueingParameters = {
        arrivalRate: 6,
        serviceRate: 10,
        numServers: 1,
      };

      const utilization = MMCQueueingModel.calculateUtilization(params);
      expect(utilization).toBeCloseTo(0.6, 2);
    });

    it('should calculate utilization correctly for multiple servers', () => {
      const params: QueueingParameters = {
        arrivalRate: 12,
        serviceRate: 10,
        numServers: 2,
      };

      const utilization = MMCQueueingModel.calculateUtilization(params);
      expect(utilization).toBeCloseTo(0.6, 2);
    });

    it('should identify stable system when utilization < 1', () => {
      const params: QueueingParameters = {
        arrivalRate: 8,
        serviceRate: 10,
        numServers: 1,
      };

      expect(MMCQueueingModel.isSystemStable(params)).toBe(true);
    });

    it('should identify unstable system when utilization >= 1', () => {
      const params: QueueingParameters = {
        arrivalRate: 15,
        serviceRate: 10,
        numServers: 1,
      };

      expect(MMCQueueingModel.isSystemStable(params)).toBe(false);
    });
  });

  describe('M/M/1 Queue (Single Server) - Known Results', () => {
    /**
     * Test Case from queueing theory textbook:
     * λ = 6 customers/min, μ = 10 customers/min
     * ρ = 0.6
     *
     * Known theoretical values:
     * - L (avg system length) = ρ/(1-ρ) = 0.6/0.4 = 1.5
     * - Lq (avg queue length) = ρ²/(1-ρ) = 0.36/0.4 = 0.9
     * - W (avg system time) = 1/(μ-λ) = 1/4 = 0.25 min
     * - Wq (avg wait time) = ρ/(μ-λ) = 0.6/4 = 0.15 min
     */
    it('should match known M/M/1 theoretical values', () => {
      const params: QueueingParameters = {
        arrivalRate: 6,
        serviceRate: 10,
        numServers: 1,
      };

      const metrics = MMCQueueingModel.calculateMetrics(params);

      expect(metrics.utilization).toBeCloseTo(0.6, 2);
      expect(metrics.isStable).toBe(true);

      // For M/M/1: Lq = ρ²/(1-ρ) = 0.36/0.4 = 0.9
      expect(metrics.averageQueueLength).toBeCloseTo(0.9, 2);

      // For M/M/1: L = ρ/(1-ρ) = 0.6/0.4 = 1.5
      expect(metrics.averageSystemLength).toBeCloseTo(1.5, 2);

      // For M/M/1: Wq = Lq/λ = 0.9/6 = 0.15 min
      expect(metrics.averageWaitTime).toBeCloseTo(0.15, 2);

      // For M/M/1: W = L/λ = 1.5/6 = 0.25 min
      expect(metrics.averageSystemTime).toBeCloseTo(0.25, 2);
    });
  });

  describe('M/M/c Queue (Multiple Servers) - Known Results', () => {
    /**
     * Test Case: Call center with 2 servers
     * λ = 10 customers/min, μ = 8 customers/min per server, c = 2
     * ρ = 10/(2*8) = 0.625
     *
     * This is a standard example from queueing theory courses
     */
    it('should handle 2-server call center example', () => {
      const params: QueueingParameters = {
        arrivalRate: 10,
        serviceRate: 8,
        numServers: 2,
      };

      const metrics = MMCQueueingModel.calculateMetrics(params);

      expect(metrics.utilization).toBeCloseTo(0.625, 3);
      expect(metrics.isStable).toBe(true);

      // Values should be finite and positive
      expect(metrics.averageQueueLength).toBeGreaterThan(0);
      expect(metrics.averageQueueLength).toBeLessThan(Infinity);

      expect(metrics.averageSystemLength).toBeGreaterThan(
        metrics.averageQueueLength
      );

      expect(metrics.averageWaitTime).toBeGreaterThan(0);
      expect(metrics.averageSystemTime).toBeGreaterThan(metrics.averageWaitTime);
    });

    /**
     * Test Case: High utilization scenario
     * λ = 14 customers/min, μ = 8 customers/min per server, c = 2
     * ρ = 14/(2*8) = 0.875 (close to capacity)
     */
    it('should handle high utilization scenario correctly', () => {
      const params: QueueingParameters = {
        arrivalRate: 14,
        serviceRate: 8,
        numServers: 2,
      };

      const metrics = MMCQueueingModel.calculateMetrics(params);

      expect(metrics.utilization).toBeCloseTo(0.875, 3);
      expect(metrics.isStable).toBe(true);

      // Higher utilization should mean longer queues and wait times
      expect(metrics.averageQueueLength).toBeGreaterThan(1);
      expect(metrics.averageWaitTime).toBeGreaterThan(0.1);
    });
  });

  describe('Littles Law Verification', () => {
    /**
     * Little's Law states: L = λ × W and Lq = λ × Wq
     * This fundamental law must hold for any stable queueing system
     */
    it('should satisfy Littles Law: L = λ × W', () => {
      const params: QueueingParameters = {
        arrivalRate: 12,
        serviceRate: 15,
        numServers: 1,
      };

      const metrics = MMCQueueingModel.calculateMetrics(params);

      const expectedL = params.arrivalRate * metrics.averageSystemTime;
      expect(metrics.averageSystemLength).toBeCloseTo(expectedL, 6);
    });

    it('should satisfy Littles Law: Lq = λ × Wq', () => {
      const params: QueueingParameters = {
        arrivalRate: 10,
        serviceRate: 8,
        numServers: 2,
      };

      const metrics = MMCQueueingModel.calculateMetrics(params);

      const expectedLq = params.arrivalRate * metrics.averageWaitTime;
      expect(metrics.averageQueueLength).toBeCloseTo(expectedLq, 6);
    });

    it('should satisfy Littles Law for various parameter combinations', () => {
      const testCases: QueueingParameters[] = [
        { arrivalRate: 5, serviceRate: 10, numServers: 1 },
        { arrivalRate: 15, serviceRate: 10, numServers: 2 },
        { arrivalRate: 20, serviceRate: 8, numServers: 3 },
        { arrivalRate: 8, serviceRate: 12, numServers: 1 },
      ];

      testCases.forEach((params) => {
        const metrics = MMCQueueingModel.calculateMetrics(params);

        if (metrics.isStable) {
          const littleLawL = params.arrivalRate * metrics.averageSystemTime;
          const littleLawLq = params.arrivalRate * metrics.averageWaitTime;

          expect(metrics.averageSystemLength).toBeCloseTo(littleLawL, 6);
          expect(metrics.averageQueueLength).toBeCloseTo(littleLawLq, 6);
        }
      });
    });
  });

  describe('Edge Cases and Boundary Conditions', () => {
    it('should return Infinity for unstable system metrics', () => {
      const params: QueueingParameters = {
        arrivalRate: 20,
        serviceRate: 10,
        numServers: 1,
      };

      const metrics = MMCQueueingModel.calculateMetrics(params);

      expect(metrics.isStable).toBe(false);
      expect(metrics.averageQueueLength).toBe(Infinity);
      expect(metrics.averageSystemLength).toBe(Infinity);
      expect(metrics.averageWaitTime).toBe(Infinity);
      expect(metrics.averageSystemTime).toBe(Infinity);
    });

    it('should handle system at exactly capacity boundary', () => {
      const params: QueueingParameters = {
        arrivalRate: 10,
        serviceRate: 10,
        numServers: 1,
      };

      const metrics = MMCQueueingModel.calculateMetrics(params);

      expect(metrics.utilization).toBe(1.0);
      expect(metrics.isStable).toBe(false);
    });

    it('should handle very low utilization (underutilized system)', () => {
      const params: QueueingParameters = {
        arrivalRate: 1,
        serviceRate: 20,
        numServers: 2,
      };

      const metrics = MMCQueueingModel.calculateMetrics(params);

      expect(metrics.utilization).toBeCloseTo(0.025, 3);
      expect(metrics.isStable).toBe(true);

      // Low utilization should mean very short queues
      expect(metrics.averageQueueLength).toBeLessThan(0.1);
    });
  });

  describe('Erlang C Formula Validation', () => {
    it('should calculate Erlang C probability correctly', () => {
      const params: QueueingParameters = {
        arrivalRate: 10,
        serviceRate: 8,
        numServers: 2,
      };

      const erlangC = MMCQueueingModel.calculateErlangC(params);

      // Erlang C must be between 0 and 1 (it's a probability)
      expect(erlangC).toBeGreaterThanOrEqual(0);
      expect(erlangC).toBeLessThanOrEqual(1);
    });

    it('should return 1 for unstable systems (all customers wait)', () => {
      const params: QueueingParameters = {
        arrivalRate: 20,
        serviceRate: 10,
        numServers: 1,
      };

      const erlangC = MMCQueueingModel.calculateErlangC(params);
      expect(erlangC).toBe(1.0);
    });
  });
});
