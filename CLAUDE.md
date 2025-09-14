# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Development
```bash
npm run dev      # Start Vite dev server with HMR
npm run build    # Build for production
npm run preview  # Preview production build
npm run lint     # Run ESLint
```

## Architecture

### Tech Stack
- **React 19** with Vite bundler
- **Redux Toolkit** for state management
- **React Router v7** for routing
- ESLint with React-specific rules

### Project Structure
```
src/
├── component/   # Reusable UI components (Header, Hero, Aside, Widgets)
├── page/        # Route page components (HomePage, Ai, ResultPgae, ErrorPage)
├── utils/       # Redux store and slices
├── style/       # Global styles
└── assets/      # Static assets
```

### Core Patterns

#### Routing
- Routes defined in `src/main.jsx` using React Router's `createBrowserRouter`
- App component serves as layout wrapper with Header and Outlet
- Three main routes: `/` (HomePage), `/ai` (Ai), `/result` (ResultPgae)

#### State Management
- Redux store configured in `src/utils/store.js`
- Redux slices in `src/utils/data.js` using Redux Toolkit's `createSlice`
- Store wrapped around entire app via Provider in `src/main.jsx`

#### Component Structure
- Pages combine layout components (Aside) with content components (Hero, Widgets)
- All pages follow pattern: import components → render layout → export default

## ESLint Configuration
- Custom rules in `eslint.config.js`
- Ignores variables starting with uppercase or underscore (`^[A-Z_]`)
- React Hooks and React Refresh plugins enabled

## Demo Implementation
See `DEMO_STRATEGY.md` for the complete mock implementation approach. This project is a visualization showcase for the CURATE PDF extraction system, designed to:
- Mock file upload and processing
- Display pre-generated JSON results from CURATE
- Replicate the UI style of https://curate.cockpit.management/board