# Comuneo - CURATE Visualization Dashboard

A React-based visualization dashboard for the CURATE PDF extraction system, showcasing entity extraction and relationship mapping capabilities.

## Getting Started

### Prerequisites
- Node.js (v18 or higher recommended)
- npm or yarn package manager

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd comuneo
```

2. Install dependencies:
```bash
npm install
```

### Running the Project

#### Development Mode
Start the development server with hot module replacement:
```bash
npm run dev
```
The application will be available at `http://localhost:5173` (or the port shown in terminal).

#### Production Build
Build the application for production:
```bash
npm run build
```

Preview the production build locally:
```bash
npm run preview
```

### Other Commands

- **Run ESLint:** `npm run lint`

## Tech Stack

- **React 19** - UI framework
- **Vite** - Build tool and dev server
- **Redux Toolkit** - State management
- **React Router v7** - Routing
- **ESLint** - Code linting

## Project Structure

```
src/
├── component/   # Reusable UI components
├── page/        # Route page components
├── utils/       # Redux store and utilities
├── style/       # Global styles
└── assets/      # Static assets
```
