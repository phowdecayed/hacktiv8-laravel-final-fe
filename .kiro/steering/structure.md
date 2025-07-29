# Project Structure

## Root Directory

- `src/` - Main application source code
- `docs/` - API documentation and project guides
- `public/` - Static assets served directly
- `node_modules/` - Dependencies (auto-generated)

## Source Code Organization (`src/`)

### Core Application Files

- `main.ts` - Application entry point, plugin registration
- `App.vue` - Root component with router outlet and global layout
- `env.d.ts` - TypeScript environment declarations

### Feature Directories

#### `components/`

- `HelloWorld.vue`, `TheWelcome.vue`, `WelcomeItem.vue` - Demo components
- `icons/` - SVG icon components (Community, Documentation, Ecosystem, Support, Tooling)
- `ui/` - shadcn-vue component library (comprehensive UI components)

#### `views/`

- `HomeView.vue` - Home page component
- `AboutView.vue` - About page component
- Route-level components that correspond to router paths

#### `router/`

- Vue Router configuration and route definitions
- Handles client-side navigation between views

#### `stores/`

- `counter.ts` - Example Pinia store
- Centralized state management using Pinia stores

#### `assets/`

- `main.css` - Global styles and Tailwind imports
- `base.css` - Base CSS variables and resets
- `logo.svg` - Application logo

#### `lib/`

- `utils.ts` - Utility functions (likely includes cn() for class merging)
- Shared helper functions and utilities

## UI Component Structure (`src/components/ui/`)

The UI components follow shadcn-vue conventions with comprehensive component coverage:

### Layout & Navigation

- `sidebar/` - Sidebar navigation components
- `navigation-menu/` - Navigation menu components
- `menubar/` - Menu bar components
- `breadcrumb/` - Breadcrumb navigation

### Forms & Input

- `form/` - Form wrapper and field components
- `input/` - Text input components
- `textarea/` - Multi-line text input
- `select/` - Dropdown selection
- `combobox/` - Searchable select
- `checkbox/` - Checkbox input
- `radio-group/` - Radio button groups
- `switch/` - Toggle switch
- `slider/` - Range slider
- `number-field/` - Numeric input with controls
- `pin-input/` - PIN/OTP input
- `tags-input/` - Tag input component

### Data Display

- `table/` - Data table components
- `card/` - Card layout components
- `badge/` - Status badges
- `avatar/` - User avatar components
- `skeleton/` - Loading placeholders
- `progress/` - Progress indicators
- `calendar/` - Date picker calendar
- `range-calendar/` - Date range picker

### Feedback & Overlays

- `dialog/` - Modal dialogs
- `sheet/` - Side sheet/drawer
- `drawer/` - Bottom drawer
- `alert-dialog/` - Confirmation dialogs
- `alert/` - Alert messages
- `sonner/` - Toast notifications
- `tooltip/` - Hover tooltips
- `hover-card/` - Hover card popover
- `popover/` - Popover components

### Interactive Components

- `button/` - Button components
- `dropdown-menu/` - Dropdown menus
- `context-menu/` - Right-click context menus
- `command/` - Command palette
- `accordion/` - Collapsible sections
- `collapsible/` - Simple collapse/expand
- `tabs/` - Tab navigation
- `toggle/` - Toggle buttons
- `toggle-group/` - Toggle button groups
- `carousel/` - Image/content carousel
- `stepper/` - Step-by-step navigation
- `pagination/` - Page navigation

### Utilities

- `separator/` - Visual separators
- `scroll-area/` - Custom scrollbars
- `resizable/` - Resizable panels
- `aspect-ratio/` - Aspect ratio containers
- `label/` - Form labels

## Configuration Files

### TypeScript Configuration

- `tsconfig.json` - Root TypeScript config with project references
- `tsconfig.app.json` - Application-specific TypeScript settings
- `tsconfig.node.json` - Node.js/build tool TypeScript settings

### Build & Development

- `vite.config.ts` - Vite configuration with plugins
- `package.json` - Dependencies and scripts
- `components.json` - shadcn-vue component configuration

### Code Quality

- `.prettierrc.json` - Prettier formatting rules
- `.gitignore` - Git ignore patterns
- `.gitattributes` - Git file handling rules

## Documentation (`docs/`)

- `index.md` - Main API documentation index
- `apps_flow.md` - Application flow and architecture
- `postman_collection.json` - API testing collection
- `api/` - Detailed API endpoint documentation

## Naming Conventions

- **Components**: PascalCase (e.g., `HelloWorld.vue`)
- **Files**: kebab-case for multi-word files
- **Directories**: kebab-case
- **Imports**: Use `@/` alias for src imports
- **UI Components**: Follow shadcn-vue naming (Component + subcomponents)
