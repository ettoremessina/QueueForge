# Mathematical Verification

This document demonstrates that the QueueForge simulation correctly implements the M/M/c queueing model through comparison with known theoretical results.

## M/M/c Queueing Model Overview

The M/M/c model represents:
- **M** (First M): Markovian (memoryless) arrivals following a Poisson process
- **M** (Second M): Markovian (memoryless) service times following an Exponential distribution
- **c**: Number of identical servers

### Key Parameters

- **λ (lambda)**: Arrival rate (customers per unit time)
- **μ (mu)**: Service rate per server (customers per unit time)
- **c**: Number of servers
- **ρ (rho)**: System utilization = λ / (c × μ)

### Stability Condition

A queueing system is stable when: **ρ < 1** (arrivals < capacity)

## Example 1: Single Server Queue (M/M/1)

### Configuration
```
λ = 6 customers/minute
μ = 10 customers/minute
c = 1 server
```

### Theoretical Calculations

**Utilization:**
```
ρ = λ / (c × μ) = 6 / (1 × 10) = 0.6
```

**Average Queue Length (Lq):**
```
Lq = ρ² / (1 - ρ) = 0.36 / 0.4 = 0.9 customers
```

**Average System Length (L):**
```
L = ρ / (1 - ρ) = 0.6 / 0.4 = 1.5 customers
```

**Average Wait Time (Wq):**
```
Wq = Lq / λ = 0.9 / 6 = 0.15 minutes = 9 seconds
```

**Average System Time (W):**
```
W = L / λ = 1.5 / 6 = 0.25 minutes = 15 seconds
```

### Verification

Run the simulation with these parameters and observe:
1. Utilization converges to **60%**
2. Average queue length approaches **0.9 customers**
3. Average wait time approaches **9 seconds**

## Example 2: Call Center (M/M/2)

### Configuration
```
λ = 10 customers/minute
μ = 8 customers/minute per server
c = 2 servers
```

### Theoretical Calculations

**Utilization:**
```
ρ = λ / (c × μ) = 10 / (2 × 8) = 0.625
```

**Offered Load (a):**
```
a = λ / μ = 10 / 8 = 1.25
```

**Erlang C Formula (Probability of Waiting):**

The Erlang C formula calculates P(wait), the probability that all servers are busy:

```
C(c, a) = [a^c / c!] × [c / (c - a)] / [Σ(a^k / k!) for k=0 to c-1 + [a^c / c!] × [c / (c - a)]]
```

For our parameters (c=2, a=1.25):
```
Numerator = (1.25^2 / 2!) × (2 / (2 - 1.25))
         = (1.5625 / 2) × (2 / 0.75)
         = 0.78125 × 2.667
         = 2.083

Denominator = (1.25^0 / 0!) + (1.25^1 / 1!) + 2.083
           = 1 + 1.25 + 2.083
           = 4.333

C(2, 1.25) = 2.083 / 4.333 ≈ 0.481
```

**Average Queue Length (Lq):**
```
Lq = C(c,a) × ρ / (1 - ρ)
   = 0.481 × 0.625 / (1 - 0.625)
   = 0.301 / 0.375
   ≈ 0.803 customers
```

**Average Wait Time (Wq):**
```
Wq = Lq / λ = 0.803 / 10 ≈ 0.08 minutes ≈ 4.8 seconds
```

### Verification

Run the simulation with these parameters and observe:
1. Utilization converges to **62.5%**
2. Average queue length approaches **~0.8 customers**
3. About **48%** of customers must wait (Erlang C probability)

## Example 3: Unstable System

### Configuration
```
λ = 15 customers/minute
μ = 10 customers/minute
c = 1 server
```

### Theoretical Analysis

**Utilization:**
```
ρ = λ / (c × μ) = 15 / 10 = 1.5
```

Since ρ > 1, the system is **unstable**. Arrivals exceed capacity, causing:
- Queue length grows without bound (→ ∞)
- Wait times grow without bound (→ ∞)

### Verification

Run the simulation with these parameters and observe:
1. Utilization shows **150%** (exceeds capacity)
2. Queue length continuously grows
3. Warning message: "System Unstable"

## Little's Law Verification

Little's Law is a fundamental theorem that must hold for **any** stable queueing system:

**L = λ × W** (Average customers in system = arrival rate × average time in system)

**Lq = λ × Wq** (Average customers in queue = arrival rate × average wait time)

### Example Verification (M/M/1 from Example 1)

```
L = λ × W
1.5 = 6 × 0.25 ✓

Lq = λ × Wq
0.9 = 6 × 0.15 ✓
```

This relationship holds for **all** our simulations, validating the mathematical correctness.

## Testing Procedure

### Running Mathematical Verification Tests

```bash
npm test
```

This runs the test suite that verifies:

1. **Utilization Calculations**: Correct ρ = λ/(c×μ)
2. **M/M/1 Known Results**: Match textbook values exactly
3. **M/M/c Erlang C**: Probabilities in valid range [0,1]
4. **Little's Law**: L = λ×W and Lq = λ×Wq for all cases
5. **Stability Detection**: Correctly identifies ρ ≥ 1
6. **Edge Cases**: Handles boundary conditions properly

### Expected Test Results

All tests should pass, confirming:
- ✅ Mathematical model matches queueing theory formulas
- ✅ Simulation converges to theoretical values (within stochastic tolerance)
- ✅ Little's Law satisfied for all stable configurations
- ✅ Unstable systems correctly identified

### Test Coverage

Current test coverage exceeds 70% as required by PRD (NFR-C3):

```bash
npm run test:coverage
```

## References

1. Gross, D., & Harris, C. M. (1998). *Fundamentals of Queueing Theory* (3rd ed.). Wiley.
2. Kleinrock, L. (1975). *Queueing Systems, Volume 1: Theory*. Wiley-Interscience.
3. Cooper, R. B. (1981). *Introduction to Queueing Theory* (2nd ed.). North Holland.
4. Erlang C Formula: https://en.wikipedia.org/wiki/Erlang_(unit)#Erlang_C_formula
5. Little's Law: https://en.wikipedia.org/wiki/Little%27s_law

## Simulation vs. Theory: Expected Differences

The simulation is **stochastic** (random), so results will vary between runs. However:

- **Short runs** (< 100 seconds): May differ significantly from theory due to randomness
- **Long runs** (> 500 seconds): Should converge within 10-20% of theoretical values
- **Very long runs** (> 5000 seconds): Should converge within 5-10% of theoretical values

This is expected behavior for discrete event simulations and demonstrates the **Law of Large Numbers**.
