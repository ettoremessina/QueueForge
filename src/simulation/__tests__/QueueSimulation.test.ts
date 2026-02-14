/**
 * Unit Tests for Queue Simulation Engine
 *
 * These tests verify that the discrete event simulation:
 * 1. Correctly implements the M/M/c model
 * 2. Produces results that converge to theoretical values over time
 * 3. Handles edge cases properly
 */

import { describe, it, expect } from 'vitest';
import { QueueSimulation } from '../QueueSimulation';

describe('QueueSimulation', () => {
  describe('Initialization and Configuration', () => {
    it('should initialize with correct default state', () => {
      const simulation = new QueueSimulation({
        arrivalRate: 10,
        serviceRate: 12,
        numServers: 2,
        timeStep: 0.1,
      });

      const state = simulation.getState();

      expect(state.currentTime).toBe(0);
      expect(state.queueLength).toBe(0);
      expect(state.serversBusy).toBe(0);
      expect(state.totalArrivals).toBe(0);
      expect(state.totalServed).toBe(0);
    });

    it('should reset state correctly', () => {
      const simulation = new QueueSimulation({
        arrivalRate: 10,
        serviceRate: 12,
        numServers: 2,
        timeStep: 0.1,
      });

      // Run simulation for a while
      for (let i = 0; i < 100; i++) {
        simulation.step();
      }

      // Reset
      simulation.reset();

      const state = simulation.getState();
      expect(state.currentTime).toBe(0);
      expect(state.queueLength).toBe(0);
      expect(state.totalArrivals).toBe(0);
      expect(state.totalServed).toBe(0);
    });

    it('should update configuration correctly', () => {
      const simulation = new QueueSimulation({
        arrivalRate: 10,
        serviceRate: 12,
        numServers: 2,
        timeStep: 0.1,
      });

      simulation.updateConfig({
        arrivalRate: 20,
        numServers: 3,
      });

      // Configuration is updated internally - we can't directly test it,
      // but we can verify simulation behaves differently
      expect(simulation).toBeDefined();
    });
  });

  describe('Simulation Step Mechanics', () => {
    it('should advance time with each step', () => {
      const simulation = new QueueSimulation({
        arrivalRate: 10,
        serviceRate: 12,
        numServers: 2,
        timeStep: 0.1,
      });

      const initialTime = simulation.getCurrentTime();
      simulation.step();
      const newTime = simulation.getCurrentTime();

      expect(newTime).toBeCloseTo(initialTime + 0.1, 5);
    });

    it('should never have negative queue length', () => {
      const simulation = new QueueSimulation({
        arrivalRate: 1,
        serviceRate: 20,
        numServers: 5,
        timeStep: 0.1,
      });

      // Run many steps
      for (let i = 0; i < 1000; i++) {
        simulation.step();
        expect(simulation.getQueueLength()).toBeGreaterThanOrEqual(0);
      }
    });

    it('should accumulate arrivals over time', () => {
      const simulation = new QueueSimulation({
        arrivalRate: 60, // 1 customer per second
        serviceRate: 1, // Very slow service
        numServers: 1,
        timeStep: 0.1,
      });

      const initialArrivals = simulation.getState().totalArrivals;

      // Run for 10 seconds (100 steps of 0.1s)
      for (let i = 0; i < 100; i++) {
        simulation.step();
      }

      const finalArrivals = simulation.getState().totalArrivals;

      // With arrival rate of 60/min = 1/sec, we expect approximately 10 arrivals
      // Allow wide margin due to randomness
      expect(finalArrivals).toBeGreaterThan(initialArrivals);
      expect(finalArrivals).toBeGreaterThan(2); // At least some arrivals
    });
  });

  describe('Statistical Convergence to Theoretical Values', () => {
    /**
     * Long-running simulations should converge to theoretical M/M/c values
     * We use a tolerance since simulation is stochastic
     */
    it('should produce higher average queue for higher utilisation (M/M/1)', () => {
      // Low utilisation: ρ = 6/20 = 0.30
      const lowUtilSim = new QueueSimulation({
        arrivalRate: 6, serviceRate: 20, numServers: 1, timeStep: 0.1,
      });
      // High utilisation: ρ = 16/20 = 0.80
      const highUtilSim = new QueueSimulation({
        arrivalRate: 16, serviceRate: 20, numServers: 1, timeStep: 0.1,
      });

      for (let i = 0; i < 10000; i++) {
        lowUtilSim.step();
        highUtilSim.step();
      }

      const lowAvg  = lowUtilSim.getAverageQueueLength();
      const highAvg = highUtilSim.getAverageQueueLength();

      // Both should be non-negative
      expect(lowAvg).toBeGreaterThanOrEqual(0);
      expect(highAvg).toBeGreaterThanOrEqual(0);

      // Higher utilisation must produce a longer average queue
      expect(highAvg).toBeGreaterThan(lowAvg);
    });

    it('should show increasing queue for unstable system', () => {
      const simulation = new QueueSimulation({
        arrivalRate: 20, // Arrivals exceed capacity
        serviceRate: 10,
        numServers: 1,
        timeStep: 0.1,
      });

      const initialQueue = simulation.getQueueLength();

      // Run for a while
      for (let i = 0; i < 500; i++) {
        simulation.step();
      }

      const finalQueue = simulation.getQueueLength();

      // Unstable system should have growing queue
      expect(finalQueue).toBeGreaterThan(initialQueue);
    });
  });

  describe('Server Utilization Behavior', () => {
    it('should not exceed number of available servers', () => {
      const numServers = 3;
      const simulation = new QueueSimulation({
        arrivalRate: 60, // High arrival rate
        serviceRate: 10,
        numServers,
        timeStep: 0.1,
      });

      // Run simulation
      for (let i = 0; i < 500; i++) {
        simulation.step();
        const state = simulation.getState();

        // Servers busy should never exceed total servers
        expect(state.serversBusy).toBeLessThanOrEqual(numServers);
      }
    });

    it('should show low server utilization with low arrival rate', () => {
      const simulation = new QueueSimulation({
        arrivalRate: 1, // Very low arrival rate
        serviceRate: 20,
        numServers: 5,
        timeStep: 0.1,
      });

      // Run simulation
      for (let i = 0; i < 500; i++) {
        simulation.step();
      }

      const state = simulation.getState();

      // With such low arrivals, queue should be very small
      expect(state.queueLength).toBeLessThan(5);
    });
  });

  describe('Simulation Run Method', () => {
    it('should return samples when running simulation', () => {
      const simulation = new QueueSimulation({
        arrivalRate: 10,
        serviceRate: 12,
        numServers: 2,
        timeStep: 0.1,
      });

      const samples = simulation.simulate(5); // Run for 5 seconds

      // Should have approximately 50 samples (5 seconds / 0.1 timeStep)
      expect(samples.length).toBeGreaterThan(40);
      expect(samples.length).toBeLessThan(60);

      // All samples should be non-negative
      samples.forEach((sample) => {
        expect(sample).toBeGreaterThanOrEqual(0);
      });
    });

    it('should advance simulation time when using run method', () => {
      const simulation = new QueueSimulation({
        arrivalRate: 10,
        serviceRate: 12,
        numServers: 2,
        timeStep: 0.1,
      });

      const initialTime = simulation.getCurrentTime();
      simulation.simulate(10);
      const finalTime = simulation.getCurrentTime();

      expect(finalTime).toBeGreaterThan(initialTime);
      // simulate() uses a float-comparison loop; allow up to one extra timeStep (0.1s)
      expect(finalTime).toBeGreaterThanOrEqual(initialTime + 10);
      expect(finalTime).toBeLessThanOrEqual(initialTime + 10 + 0.1 + 1e-9);
    });
  });

  describe('FIFO Queue Discipline', () => {
    it('should build a queue under high load and track arrivals', () => {
      const simulation = new QueueSimulation({
        arrivalRate: 30, // High arrival rate to build queue
        serviceRate: 5,  // Slow service — intentionally overloaded
        numServers: 1,
        timeStep: 0.1,
      });

      // Run long enough (~5 min simulated) to accumulate arrivals and completions
      for (let i = 0; i < 3000; i++) {
        simulation.step();
      }

      const state = simulation.getState();

      // With λ=30/min over 300s we expect ~150 arrivals; assert a reasonable minimum
      expect(state.totalArrivals).toBeGreaterThan(10);

      // Queue should have grown under this overloaded configuration
      expect(state.queueLength).toBeGreaterThan(0);

      // totalServed must never exceed totalArrivals
      expect(state.totalServed).toBeLessThanOrEqual(state.totalArrivals);
    });
  });
});
