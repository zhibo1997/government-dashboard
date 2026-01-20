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
- **Generate API types from Swagger**: `pnpm swagger`

### Environment Requirements
- Node.js: `^20.19.0 || >=22.12.0`
- Package manager: `pnpm`

## Technology Stack

### Frontend Framework
- **Vue 3** (^3.5.18) - Progressive JavaScript framework
- **Pinia** (^3.0.3) - State management
- **Vue Router** (^4.5.1) - Client-side routing
- **Naive UI** (^2.40.1) - Component library
- **Vite** (^7.0.6) - Build tool and dev server

### Mapping & Visualization
- **Vue Cesium** (^3.2.9) - 3D map component based on CesiumJS
- **ECharts** (^6.0.0) - Data visualization library
- **ECharts GL** (^2.0.9) - 3D visualization extension for ECharts
- **Turf.js** (^7.2.0) - Advanced geospatial analysis

### Utilities
- **Axios** (^1.11.0) - HTTP client
- **Day.js** (^1.11.15) - Date manipulation
- **Lodash ES** (^4.17.21) - Utility library
- **jsencrypt** (^3.5.4) - RSA encryption
- **mvt-imagery-provider** (^1.0.3) - MVT vector tile support

## Project Structure

```
src/
├── api/                    # Auto-generated API types
├── assets/                 # Static assets (styles, fonts, images)
├── components/             # Reusable Vue components
├── config/                 # Configuration files (map, monitoring icons)
├── hook/                   # Vue composition hooks
├── layouts/                # Page layout components
├── mapComponents/          # Map-related components
├── router/                 # Route definitions
├── services/               # API services
├── stores/                 # Pinia store definitions
├── types/                  # TypeScript type definitions
├── views/                  # Page components (by business module)
├── App.vue                 # Root component
└── main.ts                 # Application entry point
```

## Business Modules

The application is organized into 5 main business modules:

1. **HomeModule** (`/src/views/HomeModule/`) - Comprehensive态势 overview
2. **WaterSupply** (`/src/views/WaterSupply/`) - 供水专项
3. **GasModule** (`/src/views/GasModule/`) - 燃气专项
4. **BridgeModule** (`/src/views/BridgeModule/`) - 桥梁专项
5. **DrainageModule** (`/src/views/DrainageModule/`) - 排水专项

## Key Architecture Patterns

### State Management
- **Pinia stores** (src/stores/):
  - `auth.ts` - Authentication and user state
  - `mapStore.ts` - Map-related state (camera, layers, selection)
  - `mapLayers.ts` - Layer management state
  - `dictionaryStore.ts` - Dictionary/reference data

### API Communication
- Centralized HTTP client: `/src/services/httpClient.ts`
- Service layer: `/src/services/` (waterSupplyService.ts, gasService.ts, bridgeService.ts, etc.)
- Auto-generated API types: `/src/api/comprehensiveStatus.ts` (via Swagger)

### Environment Configuration
- **Development**: `.env` (test environment)
- **Production**: `.env.production` (production environment)
- Key variables: `VITE_API_URL`, `VITE_BASE_URL`, `VITE_MAP_CENTER_*`, `VITE_TIANDITU_KEY`

## Build Configuration

### Vite Config
- Configuration file: `vite.config.js`
- Base path: `/clmap/`
- Output directory: `dist/`
- Sourcemap: Only in development
- Minification: Terser (with console/debugger removal option)
- Manual chunking: Vue ecosystem, utility libraries separated for better caching

### Dev Server
- Host: `0.0.0.0` (all interfaces)
- Auto-open: Disabled
- CORS: Enabled
- Proxy: `/clapi` endpoint proxied to `VITE_API_URL`

## Important Files

| File | Purpose |
|------|---------|
| `/src/main.ts` | Application initialization |
| `/src/router/index.ts` | Route definitions with authentication guard |
| `/src/stores/auth.ts` | Authentication state and token management |
| `/src/config/mapConfig.ts` | Map configuration (layers, providers) |
| `/src/services/httpClient.ts` | HTTP client setup with interceptors |
| `/vite.config.js` | Build and dev server configuration |
| `/.env` | Development environment variables |
