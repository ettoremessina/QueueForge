/**
 * Queueing Theory Mathematical Models — M/M/c/K (Finite Capacity)
 *
 * This module implements the M/M/c/K queueing model:
 * - M: Markovian (Poisson) arrivals
 * - M: Markovian (exponential) service times
 * - c: Number of servers
 * - K: Maximum customers in system (queue + servers)
 *
 * Arrivals that find the system at capacity K are rejected (lost).
 * Because the queue is bounded, the system is always stable.
 */

export interface MMCKQueueingParameters {
  /** λ (lambda) - Average arrival rate (customers per minute) */
  arrivalRate: number;

  /** μ (mu) - Average service rate per server (customers per minute) */
  serviceRate: number;

  /** c - Number of servers available */
  numServers: number;

  /** K - Maximum customers in system (queue + servers). Must be ≥ c+1 */
  maxCapacity: number;
}

export interface MMCKQueueMetrics {
  /** ρ (rho) - Server utilization (λ / (c × μ)) */
  utilization: number;

  /** Average number of customers waiting in queue (Lq) */
  averageQueueLength: number;

  /** Average number of customers in system (L = Lq + λ_eff/μ) */
  averageSystemLength: number;

  /** Average wait time in queue (Wq = Lq / λ_eff) */
  averageWaitTime: number;

  /** Average time in system (W = L / λ_eff) */
  averageSystemTime: number;

  /** Probability that an arriving customer is rejected (Pb = P(K)) */
  rejectionProbability: number;

  /** M/M/c/K is always stable — finite capacity prevents infinite growth */
  isStable: true;
}

export class MMCKQueueingModel {
  /**
   * Calculate P0 — probability that the system is empty
   *
   * sum1 = Σ(k=0..c-1) a^k/k!
   * sum2 = (a^c/c!) × geometric sum over k=c..K
   *      = (a^c/c!) × (1 - ρ^(K-c+1))/(1-ρ)   if ρ ≠ 1
   *      = (a^c/c!) × (K-c+1)                   if ρ = 1
   * P0 = 1 / (sum1 + sum2)
   */
  static calculateP0(params: MMCKQueueingParameters): number {
    const { arrivalRate, serviceRate, numServers, maxCapacity } = params;
    const a = arrivalRate / serviceRate; // offered load
    const rho = arrivalRate / (numServers * serviceRate);
    const c = numServers;
    const K = maxCapacity;

    let sum1 = 0;
    for (let k = 0; k < c; k++) {
      sum1 += Math.pow(a, k) / this.factorial(k);
    }

    const acOverCFact = Math.pow(a, c) / this.factorial(c);
    let sum2: number;
    if (Math.abs(rho - 1) < 1e-10) {
      sum2 = acOverCFact * (K - c + 1);
    } else {
      sum2 = acOverCFact * (1 - Math.pow(rho, K - c + 1)) / (1 - rho);
    }

    return 1 / (sum1 + sum2);
  }

  /**
   * Calculate rejection probability Pb = P(K)
   * — probability that an arriving customer finds a full system
   *
   * If K ≤ c:  Pb = P0 × a^K / K!
   * If K > c:  Pb = P0 × (a^c / c!) × ρ^(K-c)
   */
  static calculateRejectionProbability(params: MMCKQueueingParameters): number {
    const { arrivalRate, serviceRate, numServers, maxCapacity } = params;
    const a = arrivalRate / serviceRate;
    const rho = arrivalRate / (numServers * serviceRate);
    const c = numServers;
    const K = maxCapacity;
    const p0 = this.calculateP0(params);

    if (K <= c) {
      return p0 * Math.pow(a, K) / this.factorial(K);
    }
    return p0 * (Math.pow(a, c) / this.factorial(c)) * Math.pow(rho, K - c);
  }

  /**
   * Calculate average queue length (Lq)
   *
   * If ρ ≠ 1:
   *   Lq = (a^c × ρ × P0 / c!) × [1 - ρ^(K-c+1) - (K-c+1)×ρ^(K-c)×(1-ρ)] / (1-ρ)^2
   * If ρ = 1:
   *   Lq = (a^c × P0 / c!) × (K-c)×(K-c+1)/2
   */
  static calculateAverageQueueLength(params: MMCKQueueingParameters): number {
    const { arrivalRate, serviceRate, numServers, maxCapacity } = params;
    const a = arrivalRate / serviceRate;
    const rho = arrivalRate / (numServers * serviceRate);
    const c = numServers;
    const K = maxCapacity;
    const p0 = this.calculateP0(params);

    const acOverCFact = Math.pow(a, c) / this.factorial(c);

    if (Math.abs(rho - 1) < 1e-10) {
      return acOverCFact * p0 * ((K - c) * (K - c + 1)) / 2;
    }

    const n = K - c;
    const numerator =
      1 - Math.pow(rho, n + 1) - (n + 1) * Math.pow(rho, n) * (1 - rho);
    return (acOverCFact * rho * p0 * numerator) / Math.pow(1 - rho, 2);
  }

  /**
   * Calculate all M/M/c/K metrics at once
   */
  static calculateMetrics(params: MMCKQueueingParameters): MMCKQueueMetrics {
    const { arrivalRate, serviceRate, numServers } = params;
    const rho = arrivalRate / (numServers * serviceRate);

    const rejectionProbability = this.calculateRejectionProbability(params);
    const lambdaEff = arrivalRate * (1 - rejectionProbability);

    const lq = this.calculateAverageQueueLength(params);
    const l = lq + (lambdaEff > 0 ? lambdaEff / serviceRate : 0);
    const wq = lambdaEff > 0 ? lq / lambdaEff : 0;
    const w = lambdaEff > 0 ? l / lambdaEff : 0;

    return {
      utilization: rho,
      averageQueueLength: lq,
      averageSystemLength: l,
      averageWaitTime: wq,
      averageSystemTime: w,
      rejectionProbability,
      isStable: true as const,
    };
  }

  private static factorial(n: number): number {
    if (n <= 1) return 1;
    let result = 1;
    for (let i = 2; i <= n; i++) {
      result *= i;
    }
    return result;
  }
}
