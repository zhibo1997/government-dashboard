# CODEBUDDY.md

This file provides guidance to CodeBuddy Code when working with code in this repository.

## Project Overview

A government safety monitoring dashboard system built with Vue 3, TypeScript, Cesium/Vue-Cesium for 3D mapping, and specialized modules for monitoring gas, water supply, and other urban infrastructure. The system displays real-time monitoring data, alerts, and emergency resources on a high-resolution dashboard (4096x1920).

## Development Commands

### Installation
```bash
# Install dependencies (Node.js ^20.19.0 || >=22.12.0 required)
npm install
# or
pnpm install
```

### Development
```bash
# Start dev server (runs on http://0.0.0.0:5174)
npm run dev
```

### Build
```bash
# Production build
npm run build
```

### Preview
```bash
# Preview production build
npm run preview
```

### API Code Generation
```bash
# Generate API client from OpenAPI/Swagger spec
npm run swagger
```

## Architecture Overview

### Core Technology Stack
- **Frontend Framework**: Vue 3 (Composition API with `<script setup>`)
- **Type System**: TypeScript (with `noImplicitAny: false` for flexibility)
- **State Management**: Pinia stores
- **UI Libraries**: 
  - Naive UI (primary UI components)
  - Ant Design Vue icons
- **Map/3D Visualization**: 
  - Cesium (3D globe)
  - vue-cesium (Vue integration)
  - MVT (Mapbox Vector Tiles)
- **Data Visualization**: ECharts (with echarts-gl for 3D charts)
- **Styling**: SCSS with global variables
- **Build Tool**: Vite
- **HTTP Client**: Axios

### Project Structure

```
src/
├── views/                    # Page-level components
│   ├── GasModule/           # Gas monitoring module (6 sub-modules)
│   ├── WaterSupply/         # Water supply module (6 sub-modules)
│   ├── LoginView.vue        # Authentication page
│   └── MapView.vue          # Standalone map view
├── components/              # Shared components
│   ├── DashboardHeader.vue  # Module header with title/time
│   ├── ResponsiveWrapper.vue # 4096x1920 responsive scaling
│   └── TimeDisplay.vue      # Real-time clock
├── mapComponents/           # Map-related components
│   ├── Map.vue              # Main Cesium map component
│   ├── MapToolbar.vue       # Map tools (layers, measure, 2D/3D toggle)
│   ├── OptimizedLayerTree.vue # Layer management tree
│   └── MeasureTool.vue      # Distance/area measurement
├── stores/                  # Pinia state management
│   ├── mapStore.ts          # Map/viewer state
│   ├── mapLayers.ts         # Layer visibility state
│   ├── dictionaryStore.ts   # Cached dictionary data
│   └── auth.ts              # Authentication state
├── services/                # API service layer
│   ├── gasService.ts        # Gas module APIs
│   ├── waterSupplyService.ts # Water supply APIs
│   ├── commonService.ts     # Common/dictionary APIs
│   ├── dictionaryService.ts # Dictionary caching wrapper
│   ├── wfsService.ts        # WFS layer loading
│   └── loginService.ts      # Authentication
├── api/                     # Auto-generated API clients
│   ├── gas.ts               # Gas module types/endpoints
│   ├── waterSupplyAndDrainage.ts
│   ├── common.ts            # Common endpoints
│   ├── apiFactory.ts        # API instance factory
│   └── apiConfig.ts         # Base URL/timeout config
├── mapUtils/                # Map utility functions
│   ├── mapUtils.ts          # Cesium operations (load MVT, 3D Tiles)
│   ├── layerTreeUtils.ts    # Layer tree data transformations
│   └── dataUtils.ts         # Data processing utilities
├── router/                  # Vue Router
│   └── index.ts             # Route definitions (hash mode)
├── types/                   # TypeScript type definitions
├── assets/                  # Static assets
│   ├── styles/              # Global SCSS (variables.scss)
│   ├── img/                 # Images per module
│   ├── font/                # Custom fonts (YouSheBiaoTiHei)
│   └── map/                 # Map icons/assets
└── main.ts                  # Application entry
```

### Module Architecture Pattern

Both GasModule and WaterSupply follow a consistent **left-right-center layout pattern**:

```
┌─────────────────────────────────────────────────────┐
│              DashboardHeader                        │
├──────────┬─────────────────────────┬────────────────┤
│  Left    │    Center Map           │     Right      │
│ Content  │   (Cesium Viewer)       │   Content      │
│          │   + MapToolbar          │                │
│ (3 modules)│                       │  (3 modules)   │
└──────────┴─────────────────────────┴────────────────┘
```

**Structure:**
- `index.vue`: Main container with ResponsiveWrapper, DashboardHeader, and Map
- `leftContent.vue`: Container for 3 left-side modules
- `rightContent.vue`: Container for 3 right-side modules
- `components/`: 6 feature modules (e.g., InfrastructureModule, RiskHazardModule)

**Key Points:**
- All modules use `.data-module` class for consistent styling (glass morphism effect)
- Module headers use `YouSheBiaoTiHei` font at 44px
- Base resolution: 4096x1920, left/right panels: 820px width
- Center map has `data-interactive` attribute for pointer events
- Components are cached with `keep-alive` in App.vue

### Map Component Architecture

The map system uses a **parent-child communication pattern**:

```
Map.vue (Parent)
├── Manages viewer instance lifecycle
├── Handles core state (base map, scene mode, compass rotation)
├── Monitors camera changes
└── Contains child components:
    ├── MapToolbar.vue (Child)
    │   ├── Receives viewer via props
    │   ├── Emits events to parent (update:scene-mode, update:base-map, reset-map)
    │   └── Contains OptimizedLayerTree
    └── MeasureTool.vue (Sibling)
```

**Critical Vue-Cesium Pattern:**
- Viewer instance is obtained in `Map.vue` via `@ready` event on `<vc-viewer>`
- Pass viewer to children via props (never use `useVueCesium()` in children)
- Camera event listeners are registered ONCE in parent, state passed down as props
- This avoids duplicate listeners and state management issues

**Data Flow:**
- Props (parent → child): `viewerInstance`, `sceneMode`, `currentBaseMap`, `compassRotation`
- Emits (child → parent): `update:scene-mode`, `update:base-map`, `reset-map`, `toggle-measure`

### Dictionary Data Caching System

The project implements a **centralized dictionary caching** to avoid redundant API calls:

**Core Files:**
- `stores/dictionaryStore.ts`: Pinia store with cache Map and pending request tracking
- `services/dictionaryService.ts`: Wrapper functions (`getCachedDictionary`, `getCachedDictionaries`)
- `services/commonService.ts`: Low-level API calls

**Usage Pattern:**
```typescript
import { getCachedDictionaries } from '@/services/dictionaryService'

// Preload dictionaries on page mount
onMounted(async () => {
  await getCachedDictionaries([
    'jcssdstjlx_gs',  // Monitoring facility types
    'gwcz',           // Pipe materials
    // ... other codes
  ])
})
```

**Benefits:**
- Same dictionary code only fetched once per session
- Concurrent requests for same code are deduplicated
- Manual cache invalidation available via `clearDictionary(code)`

### API Layer

**Pattern:**
1. OpenAPI spec at `http://127.0.0.1:4523/export/openapi/2?version=3.0`
2. Run `npm run swagger` to generate types in `src/api/`
3. Use `apiFactory.ts` to create service instances with base config
4. Service files (e.g., `gasService.ts`) import generated API and wrap with error handling

**Example:**
```typescript
// src/services/gasService.ts
import { createGasApi } from '@/api/apiFactory'

const gasApi = createGasApi()

export async function getGasPipelines() {
  const res = await gasApi.pipelineList()
  return res.data
}
```

### Styling System

**Global Styles:**
- `App.vue` defines non-scoped `.data-module`, `.module-container`, `.left-content`, `.right-content`
- Variables in `src/assets/styles/variables.scss` (auto-injected via vite.config.js)
- Color scheme: 
  - Primary: `#1677ff` (Ant Design blue)
  - Success: `#52c41a`, Warning: `#faad14`, Error: `#ff4d4f`
  - Glass effect: `backdrop-filter: blur(10px)` + semi-transparent backgrounds

**Module-Specific:**
- Water supply: Blue gradients (`#1677ff`)
- Gas: Yellow gradients (`#faad14`)

### Environment Configuration

**Files:**
- `.env`: Development config (API points to `https://test.cityfun.com.cn`)
- `.env.production`: Production config

**Key Variables:**
- `VITE_API_BASE_URL=/clapi` - Proxied API path
- `VITE_API_URL` - Backend server URL
- `VITE_BASE_URL=/clmap/` - Static asset base path
- `VITE_TIANDITU_KEY` - Tianditu (天地图) API key for base maps
- `VITE_MAP_CENTER_LNG`, `VITE_MAP_CENTER_LAT`, `VITE_MAP_ZOOM` - Default map view

**Proxy Setup (vite.config.js):**
```javascript
proxy: {
  [env.VITE_API_BASE_URL]: {  // /clapi
    target: env.VITE_API_URL,  // https://test.cityfun.com.cn
    changeOrigin: true,
  }
}
```

## Important Development Guidelines

### When Adding New Modules

1. **Follow the established pattern**: Use GasModule or WaterSupply as reference
2. **Structure**: Create `index.vue`, `leftContent.vue`, `rightContent.vue`, `components/` folder
3. **Styling**: Reuse `.data-module` class, don't duplicate global styles
4. **Dictionary preloading**: Identify all dictionary codes needed and preload in `onMounted`
5. **Keep-alive**: Add module name to `keep-alive :include` in `App.vue`
6. **Responsive wrapper**: Wrap content in `<ResponsiveWrapper :base-width="4096" :base-height="1920">`

### When Working with Maps

1. **Never directly access `useVueCesium()` in child components** - always receive viewer via props
2. **Register camera listeners only in Map.vue** - pass derived state (like compass rotation) as props
3. **MVT layers**: Ensure `loadMVTLayer` returns `ImageryLayer` (not Provider) so `.show` property works
4. **3D Tiles**: Use `mapUtils.load3DTiles()`, returns `Cesium3DTileset` instance
5. **Layer state**: Store loaded layer instances in a Map for toggling visibility/opacity

### When Creating New API Endpoints

1. Update OpenAPI spec (or mock server at apifox/similar)
2. Run `npm run swagger` to regenerate `src/api/`
3. Create/update service file in `src/services/` to wrap generated API
4. Add error handling and response transformations in service layer

### Naming Conventions

- **Components**: PascalCase (e.g., `WaterQualityModule.vue`)
- **Stores**: camelCase files (e.g., `dictionaryStore.ts`), store names match file (`useDictionaryStore`)
- **Services**: camelCase files (e.g., `gasService.ts`), exported functions use camelCase
- **Props/Events**: Use kebab-case in templates (`:scene-mode`), camelCase in script (`sceneMode`)
- **Emits**: Use `update:` prefix for two-way binding, verb prefix for actions (`reset-map`)

### Module Design Principles (Per GAS_MODULE_README.md)

**严格按照设计图纸** (Strictly follow design specifications):
- Do NOT invent module names - use exact names from design docs
- Module functionality must match design specifications precisely
- Color schemes and layouts must follow the established design system
- Reference existing modules (WaterSupply) for consistency

**Left-Right 3+3 Pattern:**
- Left panel: 3 modules (e.g., Infrastructure, Pipeline Network, Monitoring Devices)
- Right panel: 3 modules (e.g., Risk Hazards, Warnings, Emergency Resources)
- Center: Map/visualization core

## Testing & Debugging

### Common Issues

**Map not rendering:**
- Check if `viewerInstance.value` is not null before operations
- Verify Cesium static files in `public/Cesium/` are accessible
- Check console for Cesium-related errors (often CORS or asset loading)

**Dictionary data not loading:**
- Check network tab for API call to `/clapi/...`
- Verify `dictionaryStore` has cached the code
- Use `clearDictionary(code)` to force refresh during dev

**Layer tree not showing layers:**
- API `getLayerTree()` must return properly formatted tree structure
- During dev, mock data in `src/assets/mockLayerTree.json` is used
- Check `OptimizedLayerTree.vue` console logs for loading status

**Responsive scaling issues:**
- Ensure content is wrapped in `<ResponsiveWrapper>`
- Base resolution is 4096x1920, component calculates scale factor
- Don't use fixed viewport units (vh/vw) inside ResponsiveWrapper

### Development Workflow

1. **Start dev server**: `npm run dev` (auto-opens browser to `http://localhost:5174`)
2. **Hot reload**: Changes auto-refresh (Vite HMR)
3. **TypeScript errors**: Handled as warnings due to `noImplicitAny: false`
4. **Build before deploy**: `npm run build` creates `dist/` folder
5. **Check bundle**: `npm run preview` to test production build locally

### Router Configuration

- **Mode**: Hash mode (`createWebHashHistory()`)
- **Default route**: Redirects `/` to `/gas`
- **Auth**: Uses `useAuthStore` with token validation in `router.beforeEach`
- **Meta fields**: `requiresAuth`, `title` (sets document.title)
- **Keep-alive**: Managed in `App.vue` with `include` list

## Additional Context

### Relevant Documentation Files

The following files contain detailed technical documentation:
- `GAS_MODULE_README.md`: Gas module structure, components, and design compliance
- `WATER_SUPPLY_MODULE_README.md`: Water supply module architecture (similar to gas)
- `SAFETY_MONITORING_MODULE_README.md`: Safety monitoring module overview
- `MAP_TOOLBAR_INTEGRATION.md`: Complete guide to map toolbar parent-child pattern
- `LAYER_TREE_QUICK_START.md`: Quick start for layer tree functionality
- `DICTIONARY_CACHE_OPTIMIZATION.md`: Dictionary caching system details

### Chinese Language Notes

- UI text is in Chinese (Simplified)
- Comments may mix Chinese and English
- Font `YouSheBiaoTiHei` (优设标题黑) is used for module titles
- Dictionary codes use Chinese pinyin abbreviations (e.g., `gs_szjcsb` = 燃气数字监测设备)

### Build Output

- **Target**: ES2015 (for broad browser compatibility)
- **Minifier**: Terser (with configurable console/debugger removal)
- **Chunks**: Manual chunks for `vue` ecosystem and `utils` (axios, jsencrypt)
- **Base URL**: `/clmap/` (configured for deployment subdirectory)
