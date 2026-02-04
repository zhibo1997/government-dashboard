```
# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.
```

## Project Overview

This is a **Government Safety Comprehensive Detection and Early Warning Platform** - a Vue 3-based web application for monitoring and managing urban infrastructure safety, including water supply, gas, bridges, and drainage systems.

## Development Commands

### Core Commands
- **Install dependencies**: `pnpm install`
- **Start development server**: `pnpm dev`
- **Build for production**: `pnpm build`
- **Preview production build**: `pnpm preview`
- **Generate API types from Swagger**: `pnpm swagger` (generates types from local Swagger/OpenAPI v3.0 endpoint)

### Environment Requirements
- Node.js: `^20.19.0 || >=22.12.0`
- Package manager: `pnpm` (required)

## Technology Stack

### Frontend Framework
- **Vue 3** (^3.5.18) - Progressive JavaScript framework with Composition API
- **Pinia** (^3.0.3) - State management
- **Vue Router** (^4.5.1) - Client-side routing with hash history
- **Naive UI** (^2.40.1) - Vue 3 component library
- **Vite** (^7.0.6) - Build tool and dev server

### Mapping & Visualization
- **Vue Cesium** (^3.2.9) - 3D map component based on CesiumJS
- **ECharts** (^6.0.0) - 2D/3D data visualization library
- **ECharts GL** (^2.0.9) - 3D visualization extension for ECharts
- **Turf.js** (^7.2.0) - Advanced geospatial analysis
- **mvt-imagery-provider** (^1.0.3) - MVT vector tile support

### Utilities
- **Axios** (^1.11.0) - HTTP client with interceptors
- **Day.js** (^1.11.15) - Lightweight date manipulation
- **Lodash ES** (^4.17.21) - Utility library (ES modules)
- **jsencrypt** (^3.5.4) - RSA encryption
- **lossless-json** (^4.3.0) - Lossless JSON parsing

### Development Tools
- **ESLint** (^9.34.0) - JavaScript/TypeScript linting
- **Prettier** (^3.6.2) - Code formatter
- **TypeScript** (^5.9.2) - Type safety
- **Sass** (^1.90.0) - CSS preprocessor

## Project Structure

```
src/
├── api/                    # Auto-generated API types (via Swagger)
├── assets/                 # Static assets (styles, fonts, images, scss variables)
├── components/             # Reusable Vue components
├── config/                 # Configuration files (map, monitoring icons, dictionaries)
├── hook/                   # Vue composition hooks
├── layouts/                # Page layout components (PersistentLayout)
├── mapComponents/          # Map-related components (layers, controls, markers)
├── mapUtils/               # Map utility functions
├── router/                 # Route definitions with authentication guard
├── services/               # API services (per business module)
├── stores/                 # Pinia store definitions
├── types/                  # TypeScript type definitions
├── views/                  # Page components (by business module)
├── App.vue                 # Root component
└── main.ts                 # Application entry point
```

## Business Modules

The application is organized into 5 main business modules, all requiring authentication:

1. **HomeModule** (`/src/views/HomeModule/`) - 综合态势 overview (dashboard)
2. **WaterSupply** (`/src/views/WaterSupply/`) - 供水专项
3. **GasModule** (`/src/views/GasModule/`) - 燃气专项
4. **BridgeModule** (`/src/views/BridgeModule/`) - 桥梁专项
5. **DrainageModule** (`/src/views/DrainageModule/`) - 排水专项

Additionally, there's a **LoginView** for authentication.

## Key Architecture Patterns

### State Management
- **Pinia stores** (src/stores/):
  - `auth.ts` - Authentication and user state (token management, login/logout)
  - `mapStore.ts` - Map-related state (camera, layers, selection)
  - `mapLayers.ts` - Layer management state (add/remove layers)
  - `dictionaryStore.ts` - Dictionary/reference data (static data)

### API Communication
- Centralized HTTP client: `/src/services/httpClient.ts` (with request/response interceptors)
- Service layer: `/src/services/` (waterSupplyService.ts, gasService.ts, bridgeService.ts, etc.)
- Auto-generated API types: `/src/api/comprehensiveStatus.ts` (via Swagger)
- API base URL: `/clapi` (proxied to backend in dev)

### Routing
- **Router configuration**: `/src/router/index.ts`
- **History mode**: Hash history (`createWebHashHistory`)
- **Authentication guard**: BeforeEach guard validates token before accessing protected routes
- **Layout structure**:
  - Public layout: Login page (no sidebar/navbar)
  - Persistent layout: All business modules (with sidebar, navbar, and main content area)

### Environment Configuration
- **Development**: `.env` (test environment)
- **Production**: `.env.production` (production environment)
- Key variables (see `.env` for full list):
  - `VITE_API_URL` - Backend API base URL
  - `VITE_API_BASE_URL` - API endpoint prefix
  - `VITE_BASE_URL` - Application base path
  - `VITE_MAP_CENTER_LNG/LAT` - Initial map center coordinates
  - `VITE_MAP_ZOOM` - Initial map zoom level
  - `VITE_TIANDITU_KEY` - Tianditu map API key
  - `VITE_DROP_CONSOLE` - Remove console.log in production build
  - `VITE_DROP_DEBUGGER` - Remove debugger statements in production build

## Build Configuration

### Vite Config
- Configuration file: `vite.config.js`
- Base path: `/clmap/`
- Output directory: `dist/`
- Sourcemap: Only in development
- Minification: Terser (with console/debugger removal option)
- Manual chunking:
  - `vue` chunk: Vue, Vue Router, Pinia
  - `utils` chunk: Axios, jsencrypt
- SCSS variables: Auto-injected from `@/assets/styles/variables.scss`
- Dev server: `0.0.0.0:5173` (CORS enabled, API proxy to `/clapi`)

### TypeScript Configuration
- Strict mode: Enabled (with some exceptions for compatibility)
- Target: ESNext
- Module resolution: Node
- Path aliases: `@/*` maps to `src/*` (with additional aliases for common directories)
- Type definitions: Includes Vue, Vue Cesium, and Vite client types

## Important Files

| File | Purpose |
|------|---------|
| `/src/main.ts` | Application initialization (Vue, Pinia, Router, Naive UI, Vue Cesium setup) |
| `/src/router/index.ts` | Route definitions with authentication guard |
| `/src/stores/auth.ts` | Authentication state and token management |
| `/src/config/mapConfig.ts` | Map configuration (layers, providers, Tianditu settings) |
| `/src/services/httpClient.ts` | HTTP client setup with request/response interceptors |
| `/vite.config.js` | Build and dev server configuration |
| `/.env` | Development environment variables |
| `/.env.production` | Production environment variables |
| `/tsconfig.json` | TypeScript configuration |
| `/package.json` | Project dependencies and scripts
