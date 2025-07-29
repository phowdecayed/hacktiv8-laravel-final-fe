# Technology Stack

## Frontend Framework

- **Vue 3** with Composition API and `<script setup>` syntax
- **TypeScript** for type safety
- **Vite** as build tool and dev server

## UI & Styling

- **Tailwind CSS v4** for utility-first styling
- **shadcn-vue** component library (New York style)
- **Reka UI** for headless component primitives
- **Lucide Vue Next** for icons
- **Class Variance Authority** for component variants

## State Management & Routing

- **Pinia** for state management
- **Vue Router v4** for client-side routing
- **VueUse** for composition utilities

## Form Handling & Validation

- **Vee-Validate** with Zod schema validation
- **@vee-validate/zod** for seamless integration

## Data & UI Components

- **@tanstack/vue-table** for data tables
- **Embla Carousel Vue** for carousels
- **Vue Sonner** for toast notifications
- **Vaul Vue** for drawer components

## Development Tools

- **Vue DevTools** for debugging
- **Prettier** for code formatting
- **vue-tsc** for TypeScript checking

## Build Configuration

- **Node.js**: ^20.19.0 || >=22.12.0
- **Module Type**: ESM
- **Path Alias**: `@/` maps to `src/`

## Common Commands

### Development

```bash
npm run dev          # Start development server
npm run preview      # Preview production build
```

### Building

```bash
npm run build        # Type-check and build for production
npm run build-only   # Build without type checking
npm run type-check   # Run TypeScript compiler
```

### Code Quality

```bash
npm run format       # Format code with Prettier
```

## Project Configuration

### TypeScript

- Uses project references for better performance
- Separate configs for app (`tsconfig.app.json`) and Node.js (`tsconfig.node.json`)
- Path mapping configured for `@/*` imports

### Vite Plugins

- `@vitejs/plugin-vue` - Vue SFC support
- `@vitejs/plugin-vue-jsx` - JSX support
- `vite-plugin-vue-devtools` - Enhanced debugging
- `@tailwindcss/vite` - Tailwind CSS integration

### Component Library Setup

- shadcn-vue configured with New York style
- CSS variables enabled for theming
- Neutral base color scheme
- Components aliased to `@/components/ui`
