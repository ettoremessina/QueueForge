import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Slider } from './components/Slider/Slider';
import { Chart } from './components/Chart/Chart';
import { Controls } from './components/Controls/Controls';
import { MMCQueueingModel, QueueingParameters } from './models/QueueingModel';
import { QueueSimulation } from './simulation/QueueSimulation';
import styles from './App.module.scss';

interface DataPoint {
  time: number;
  queueLength: number;
}

/**
 * Main Application Component
 *
 * This component orchestrates the M/M/c queueing simulation by:
 * 1. Managing user-adjustable parameters (λ, μ, c, speed)
 * 2. Running the discrete event simulation
 * 3. Displaying theoretical vs. simulated metrics
 * 4. Rendering real-time visualization
 */
function App() {
  // Simulation parameters (adjustable by user)
  const [arrivalRate, setArrivalRate] = useState(10); // λ (customers per minute)
  const [serviceRate, setServiceRate] = useState(12); // μ (customers per minute per server)
  const [numServers, setNumServers] = useState(2); // c (number of servers)
  const [simulationSpeed, setSimulationSpeed] = useState(1); // Speed multiplier

  // Simulation state
  const [isRunning, setIsRunning] = useState(false);
  const [data, setData] = useState<DataPoint[]>([{ time: 0, queueLength: 0 }]);

  // Simulation engine instance (persistent across renders)
  const simulationRef = useRef<QueueSimulation>(
    new QueueSimulation({
      arrivalRate,
      serviceRate,
      numServers,
      timeStep: 0.1, // Update every 0.1 seconds
    })
  );

  // Update simulation config when parameters change
  useEffect(() => {
    simulationRef.current.updateConfig({
      arrivalRate,
      serviceRate,
      numServers,
    });
  }, [arrivalRate, serviceRate, numServers]);

  // Calculate theoretical metrics using M/M/c queueing model
  const theoreticalMetrics = useCallback(() => {
    const params: QueueingParameters = {
      arrivalRate,
      serviceRate,
      numServers,
    };
    return MMCQueueingModel.calculateMetrics(params);
  }, [arrivalRate, serviceRate, numServers]);

  const metrics = theoreticalMetrics();

  /**
   * Simulation loop - runs at ~100ms intervals
   *
   * Each tick:
   * 1. Advances simulation by timeStep * simulationSpeed
   * 2. Records queue length for visualization
   * 3. Throttles data points to avoid chart performance issues
   */
  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      const simulation = simulationRef.current;

      // Run simulation steps based on speed multiplier
      const stepsToRun = Math.ceil(simulationSpeed);
      for (let i = 0; i < stepsToRun; i++) {
        simulation.step();
      }

      const currentTime = simulation.getCurrentTime();
      const queueLength = simulation.getQueueLength();

      // Record every tick — the interval itself is the throttle (100ms = 10 samples/sec)
      setData((prevData) => {
        const newData = [...prevData, { time: currentTime, queueLength }];
        // Keep last 600 points (~60s of history at 1× speed) as a rolling window
        return newData.slice(-600);
      });
    }, 100); // Update every 100ms for smooth animation

    return () => clearInterval(interval);
  }, [isRunning, simulationSpeed]);

  const handlePlayPause = () => {
    setIsRunning((prev) => !prev);
  };

  const handleReset = () => {
    setIsRunning(false);
    simulationRef.current.reset();
    setData([{ time: 0, queueLength: 0 }]);
  };

  const currentState = simulationRef.current.getState();

  return (
    <div className={styles.app}>
      <aside className={styles.sidebar}>
        <div className={styles.header}>
          <h1>QueueForge</h1>
          <p>M/M/c Queue Simulation</p>
        </div>

        <div className={styles.parameters}>
          <h2>Parameters</h2>
          <Slider
            label="Arrival Rate (λ)"
            value={arrivalRate}
            min={1}
            max={30}
            step={1}
            unit=" customers/min"
            tooltip="Average number of customers arriving per minute (Poisson process)"
            onChange={setArrivalRate}
          />
          <Slider
            label="Service Rate (μ)"
            value={serviceRate}
            min={1}
            max={30}
            step={1}
            unit=" customers/min"
            tooltip="Average number of customers one server can handle per minute (Exponential service times)"
            onChange={setServiceRate}
          />
          <Slider
            label="Number of Servers (c)"
            value={numServers}
            min={1}
            max={10}
            step={1}
            tooltip="Number of servers available to handle customers (M/M/c model)"
            onChange={setNumServers}
          />
          <Slider
            label="Simulation Speed"
            value={simulationSpeed}
            min={0.5}
            max={5}
            step={0.5}
            unit="×"
            tooltip="Speed multiplier for the simulation (1× = real-time)"
            onChange={setSimulationSpeed}
          />
        </div>

        <Controls
          isRunning={isRunning}
          onPlayPause={handlePlayPause}
          onReset={handleReset}
        />

        <div className={styles.metrics}>
          <h3>Current Metrics</h3>
          <div className={styles.metric}>
            <span className={styles.metricLabel}>Simulation Time</span>
            <span className={styles.metricValue}>
              {currentState.currentTime.toFixed(1)}s
            </span>
          </div>
          <div className={styles.metric}>
            <span className={styles.metricLabel}>Queue Length</span>
            <span className={styles.metricValue}>{currentState.queueLength}</span>
          </div>
          <div className={styles.metric}>
            <span className={styles.metricLabel}>Servers Busy</span>
            <span className={styles.metricValue}>
              {currentState.serversBusy} / {numServers}
            </span>
          </div>
          <div className={styles.metric}>
            <span className={styles.metricLabel}>Utilization</span>
            <span className={styles.metricValue}>
              {(metrics.utilization * 100).toFixed(1)}%
            </span>
          </div>
        </div>

        <div className={styles.metrics}>
          <h3>Theoretical (M/M/c)</h3>
          {metrics.isStable ? (
            <>
              <div className={styles.metric}>
                <span className={styles.metricLabel}>Avg Queue Length (Lq)</span>
                <span className={styles.metricValue}>
                  {metrics.averageQueueLength.toFixed(2)}
                </span>
              </div>
              <div className={styles.metric}>
                <span className={styles.metricLabel}>Avg Wait Time (Wq)</span>
                <span className={styles.metricValue}>
                  {metrics.averageWaitTime.toFixed(2)} min
                </span>
              </div>
              <div className={styles.metric}>
                <span className={styles.metricLabel}>Avg System Length (L)</span>
                <span className={styles.metricValue}>
                  {metrics.averageSystemLength.toFixed(2)}
                </span>
              </div>
              <div className={styles.metric}>
                <span className={styles.metricLabel}>Avg System Time (W)</span>
                <span className={styles.metricValue}>
                  {metrics.averageSystemTime.toFixed(2)} min
                </span>
              </div>
            </>
          ) : (
            <div className={styles.warning}>
              ⚠️ System Unstable
              <div className={styles.warningDetail}>
                Arrival rate (λ = {arrivalRate}) exceeds capacity (c×μ ={' '}
                {numServers}×{serviceRate} = {numServers * serviceRate}). Queue will
                grow infinitely.
              </div>
            </div>
          )}
        </div>
      </aside>

      <main className={styles.main}>
        <Chart
          data={data}
          title="Queue Length Over Time"
          yAxisLabel="Queue Length (customers)"
          xAxisLabel="Time (seconds)"
        />
      </main>
    </div>
  );
}

export default App;
