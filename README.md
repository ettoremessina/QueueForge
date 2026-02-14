# QueueForge — M/M/c & M/M/c/K Queue Simulation

An interactive queueing theory simulation built with React, TypeScript, and Vite. Supports two classic Kendall-notation models — **M/M/c** (infinite capacity) and **M/M/c/K** (finite capacity) — selectable via a dropdown. This educational tool demonstrates how mathematical models can solve real-world problems by simulating a call center with adjustable parameters.

## Features

- **Two queue models**: Switch between M/M/c (infinite queue) and M/M/c/K (finite capacity with rejection) via a dropdown
- **Real-time simulation**: Poisson arrivals, exponential service times, multiple servers
- **Interactive Parameters**: Adjust arrival rate (λ), service rate (μ), number of servers (c), simulation speed — and max capacity (K) when using M/M/c/K
- **Live Visualization**: Real-time chart showing queue length over time
- **Educational Tooltips**: Hover over parameter labels for explanations
- **System Metrics**: Current queue length, utilization, theoretical averages, and rejection probability (M/M/c/K)
- **Professional UI**: Clean, minimal design inspired by Linear, Stripe, and GitHub

## Quick Start

### Install Dependencies

```bash
npm install
```

### Run Development Server

```bash
npm run dev
```

Open your browser to the URL shown (typically http://localhost:5173)

### Build for Production

```bash
npm run build
```

The production-ready files will be in the `dist/` directory.

### Preview Production Build

```bash
npm run preview
```

## Usage

1. **Adjust Parameters**: Use the sliders to change arrival rate, service rate, number of servers, and simulation speed
2. **Start Simulation**: Click the "Play" button to start the simulation
3. **Observe Results**: Watch the queue length change in real-time on the chart
4. **Reset**: Click "Reset" to clear the simulation and start fresh

### Selecting a Queue Model

Use the **Queue Model** dropdown at the top of the parameters panel, or set it directly via the `model` URL query parameter:

| Model | Dropdown label | URL parameter |
|-------|---------------|---------------|
| **M/M/c** | M/M/c — Infinite capacity | *(default, no parameter needed)* |
| **M/M/c/K** | M/M/c/K — Finite capacity | `?model=mmck` |

**Examples:**
```
https://example.com/queueforge/           → opens with M/M/c (default)
https://example.com/queueforge/?model=mmck → opens with M/M/c/K pre-selected
```

The parameter is case-insensitive (`?model=MMCK` and `?model=mmck` both work). Invalid values silently fall back to M/M/c. Switching the dropdown updates the URL automatically so the link stays shareable.

### Understanding the Parameters

- **Arrival Rate (λ)**: Average number of customers arriving per minute
- **Service Rate (μ)**: Average number of customers one server can handle per minute
- **Number of Servers (c)**: Total servers available to handle customers
- **Max Capacity (K)** *(M/M/c/K only)*: Maximum customers allowed in the system (queue + in service); arrivals beyond K are rejected
- **Utilization**: λ / (c × μ) - Should be < 100% for a stable M/M/c system (M/M/c/K is always stable due to finite K)

## Tech Stack

- **React 18** - UI library
- **TypeScript** - Type safety with strict mode enabled
- **Vite** - Fast build tool and dev server
- **SCSS** - CSS with variables and modules
- **Canvas API** - Custom chart rendering for performance

## Project Structure

```
src/
├── models/              # Mathematical queueing theory models
│   ├── QueueingModel.ts       # M/M/c theoretical calculations (Erlang C)
│   ├── MMCKQueueingModel.ts   # M/M/c/K theoretical calculations (finite capacity, Erlang B)
│   └── __tests__/             # Mathematical verification tests
├── simulation/          # Discrete event simulation engine
│   ├── QueueSimulation.ts     # Time-stepped simulation logic (supports both M/M/c and M/M/c/K via maxCapacity)
│   └── __tests__/             # Simulation convergence tests
├── visualization/       # Chart rendering utilities
│   └── ChartRenderer.ts       # Canvas-based charting
├── components/          # React UI components
│   ├── Slider/                # Parameter control sliders
│   ├── Chart/                 # Real-time chart display
│   └── Controls/              # Play/Pause/Reset buttons
├── styles/
│   ├── tokens.scss            # Design tokens (colors, spacing, etc.)
│   ├── reset.scss             # Minimal CSS reset
│   └── global.scss            # Global base styles
├── App.tsx              # Main application orchestration
└── main.tsx             # React entry point
```

### Architecture Principles

The codebase follows **clean separation of concerns**:

1. **Models Layer** (`models/`): Pure mathematical functions implementing M/M/c (Erlang C) and M/M/c/K (Erlang B / finite-capacity) queueing theory formulas
2. **Simulation Layer** (`simulation/`): Discrete event simulation engine that generates empirical data matching theoretical predictions
3. **Visualization Layer** (`visualization/`): Canvas-based rendering optimized for real-time updates
4. **UI Layer** (`components/`, `App.tsx`): React components orchestrating user interaction

This separation makes the code:
- ✅ Testable (each layer tested independently)
- ✅ Maintainable (clear responsibilities)
- ✅ Extensible (easy to add new scenarios)
- ✅ Portfolio-grade (demonstrates software architecture skills)

## Mathematical Verification

This simulation implements two queueing models with mathematically verified accuracy.

### Running Tests

```bash
# Run all tests
npm test

# Run tests with coverage report
npm run test:coverage

# Run tests with interactive UI
npm run test:ui
```

### Test Coverage

- ✅ **70%+ code coverage** (PRD requirement NFR-C3)
- ✅ **M/M/1 known results**: Matches textbook examples exactly
- ✅ **M/M/c Erlang C formula**: Verified against published tables
- ✅ **Little's Law**: L = λ×W holds for all configurations
- ✅ **Stability detection**: Correctly identifies ρ ≥ 1 (unstable M/M/c systems)
- ✅ **M/M/c/K finite capacity**: Erlang B blocking probability verified
- ✅ **Simulation convergence**: Higher utilisation produces longer queues

### Example: Verifying M/M/1 Queue

Configuration: λ=6/min, μ=10/min, c=1

**Theoretical (from formulas):**
- Utilization (ρ) = 0.60
- Avg Queue Length (Lq) = 0.90 customers
- Avg Wait Time (Wq) = 0.15 min = 9 seconds

**Simulation (after ~10 minutes runtime):**
- Observed values converge to theoretical within 10-15%
- This validates both the math and simulation implementation

### Example: Verifying M/M/1/5 Queue (M/M/c/K with c=1, K=5)

Configuration: λ=10/min, μ=8/min, c=1, K=5

**Theoretical (from Erlang B formulas):**
- System is always stable (finite K absorbs any λ)
- Rejection probability (Pb) indicates the fraction of arrivals turned away
- Effective throughput = λ × (1 − Pb)

📖 **Full mathematical derivations**: See [docs/MATHEMATICAL_VERIFICATION.md](docs/MATHEMATICAL_VERIFICATION.md)

## Performance

- **<100ms** parameter response time (updates immediately)
- **<3s** page load time
- **60 FPS** smooth animation
- **Client-side only** - No backend required
- **Test suite**: Runs in <5 seconds

## Code Quality

- ✅ **TypeScript strict mode** enabled (zero type errors)
- ✅ **70%+ test coverage** for core logic
- ✅ **ESLint + Prettier** enforced
- ✅ **Comprehensive comments** explaining queueing theory concepts
- ✅ **Modular architecture** (models / simulation / visualization / UI)

## Browser Support

Modern browsers only (Chrome, Firefox, Safari, Edge - last 2 versions)

## License

Open Source - MIT License

## Author

Ettore - Portfolio showcase demonstrating queueing theory simulation
