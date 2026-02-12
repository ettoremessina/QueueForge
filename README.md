# QueueForge — M/M/c Queue Simulation

An interactive M/M/c queueing theory simulation built with React, TypeScript, and Vite. This educational tool demonstrates how mathematical models can solve real-world problems by simulating a call center with adjustable parameters.

## Features

- **Real-time M/M/c Queue Simulation**: Poisson arrivals, exponential service times, multiple servers
- **Interactive Parameters**: Adjust arrival rate (λ), service rate (μ), number of servers (c), and simulation speed
- **Live Visualization**: Real-time chart showing queue length over time
- **Educational Tooltips**: Hover over parameter labels for explanations
- **System Metrics**: Current queue length, utilization, theoretical averages
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

### Understanding the Parameters

- **Arrival Rate (λ)**: Average number of customers arriving per minute
- **Service Rate (μ)**: Average number of customers one server can handle per minute
- **Number of Servers (c)**: Total servers available to handle customers
- **Utilization**: λ / (c × μ) - Should be < 100% for stable system

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
│   └── __tests__/             # Mathematical verification tests
├── simulation/          # Discrete event simulation engine
│   ├── QueueSimulation.ts     # Time-stepped simulation logic
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

1. **Models Layer** (`models/`): Pure mathematical functions implementing M/M/c queueing theory formulas (Erlang C, Little's Law, etc.)
2. **Simulation Layer** (`simulation/`): Discrete event simulation engine that generates empirical data matching theoretical predictions
3. **Visualization Layer** (`visualization/`): Canvas-based rendering optimized for real-time updates
4. **UI Layer** (`components/`, `App.tsx`): React components orchestrating user interaction

This separation makes the code:
- ✅ Testable (each layer tested independently)
- ✅ Maintainable (clear responsibilities)
- ✅ Extensible (easy to add new scenarios)
- ✅ Portfolio-grade (demonstrates software architecture skills)

## Mathematical Verification

This simulation implements the **M/M/c queueing model** with mathematically verified accuracy.

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
- ✅ **Stability detection**: Correctly identifies ρ ≥ 1 (unstable systems)
- ✅ **Simulation convergence**: Empirical results match theoretical predictions

### Example: Verifying M/M/1 Queue

Configuration: λ=6/min, μ=10/min, c=1

**Theoretical (from formulas):**
- Utilization (ρ) = 0.60
- Avg Queue Length (Lq) = 0.90 customers
- Avg Wait Time (Wq) = 0.15 min = 9 seconds

**Simulation (after ~10 minutes runtime):**
- Observed values converge to theoretical within 10-15%
- This validates both the math and simulation implementation

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
