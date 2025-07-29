# Design Document

## Overview

This design document outlines the architecture and implementation approach for a user-facing e-commerce website frontend. The application will be built using Vue 3 with TypeScript, leveraging shadcn-vue components for a minimalist yet modern design. The frontend will communicate with the Laravel API backend to provide a complete e-commerce experience including product browsing, cart management, and order processing.

## Architecture

### Frontend Architecture Pattern

- **Single Page Application (SPA)** using Vue 3 with Composition API
- **Component-based architecture** with reusable UI components
- **State management** using Pinia for global state
- **Client-side routing** using Vue Router 4
- **API communication** using native fetch with custom composables

### Project Structure

```
src/
├── components/
│   ├── ui/                    # shadcn-vue components
│   ├── layout/                # Layout components (Header, Footer, Sidebar)
│   ├── product/               # Product-related components
│   ├── cart/                  # Shopping cart components
│   └── common/                # Shared components
├── views/                     # Page components
├── composables/               # Vue composables for API and logic
├── stores/                    # Pinia stores
├── types/                     # TypeScript type definitions
├── utils/                     # Utility functions
├── router/                    # Vue Router configuration
└── assets/                    # Static assets
```

### Technology Stack Integration

- **Vue 3** with `<script setup>` syntax and Composition API
- **TypeScript** for type safety and better developer experience
- **Tailwind CSS v4** for utility-first styling
- **shadcn-vue** component library for consistent UI
- **Pinia** for state management
- **Vue Router v4** for navigation
- **Vee-Validate + Zod** for form validation
- **Vue Sonner** for toast notifications

## Components and Interfaces

### Core Layout Components

#### AppHeader

- **Purpose**: Main navigation and user authentication status
- **Features**: Logo, navigation menu, search bar, cart icon with count, user menu
- **Responsive**: Collapsible mobile menu using shadcn-vue Sheet component

#### AppFooter

- **Purpose**: Footer information and links
- **Features**: Company info, quick links, social media links

#### AppSidebar (Mobile)

- **Purpose**: Mobile navigation drawer
- **Features**: Category navigation, user account links

### Product Components

#### ProductCard

- **Purpose**: Display product summary in grid/list views
- **Features**: Product image, name, price, stock status, quick add to cart
- **Props**: `product: Product`, `variant: 'grid' | 'list'`

#### ProductGrid

- **Purpose**: Display multiple products in responsive grid
- **Features**: Pagination, loading states, empty states
- **Props**: `products: Product[]`, `loading: boolean`

#### ProductDetail

- **Purpose**: Detailed product view with full information
- **Features**: Image gallery, description, price, stock, quantity selector, add to cart

#### ProductFilters

- **Purpose**: Filter and sort products
- **Features**: Category filter, price range, search, sort options
- **Uses**: shadcn-vue Select, Input, and Checkbox components

### Shopping Cart Components

#### CartDrawer

- **Purpose**: Slide-out cart summary
- **Features**: Cart items list, total calculation, checkout button
- **Uses**: shadcn-vue Sheet component

#### CartItem

- **Purpose**: Individual cart item display and management
- **Features**: Product info, quantity controls, remove button, price calculation

#### CartSummary

- **Purpose**: Order total and checkout initiation
- **Features**: Subtotal, total, checkout button, empty cart state

### Authentication Components

#### LoginForm

- **Purpose**: User authentication
- **Features**: Email/password fields, validation, remember me option
- **Uses**: shadcn-vue Form components with Vee-Validate

#### RegisterForm

- **Purpose**: New user registration
- **Features**: Name, email, password fields with validation
- **Uses**: shadcn-vue Form components with Zod validation

#### UserMenu

- **Purpose**: Authenticated user options
- **Features**: Profile link, order history, logout
- **Uses**: shadcn-vue DropdownMenu component

### Order Components

#### OrderHistory

- **Purpose**: Display user's past orders
- **Features**: Order list, status indicators, order details
- **Uses**: shadcn-vue Table and Badge components

#### OrderDetail

- **Purpose**: Detailed view of specific order
- **Features**: Order items, status timeline, total breakdown

#### CheckoutForm

- **Purpose**: Order confirmation and completion
- **Features**: Order summary, customer notes, place order button

## Data Models

### TypeScript Interfaces

```typescript
// User related types
interface User {
  id: number
  name: string
  email: string
  email_verified_at: string | null
  created_at: string
  updated_at: string
}

interface AuthResponse {
  user: User
  token: string
}

// Product related types
interface Product {
  id: number
  name: string
  description: string | null
  price: string
  stock: number
  category_id: number | null
  user_id: number
  created_at: string
  updated_at: string
  deleted_at: string | null
  user: User
  category: Category | null
  images: ProductImage[]
}

interface ProductImage {
  id: number
  product_id: number
  image_path: string
  user_id: number
  created_at: string
  updated_at: string
  deleted_at: string | null
}

interface Category {
  id: number
  name: string
  description: string | null
  user_id: number
  created_at: string
  updated_at: string
  deleted_at: string | null
  user: User
  products: Product[]
}

// Cart related types
interface CartItem {
  id: number
  user_id: number
  product_id: number
  quantity: number
  price: string
  total: string
  created_at: string
  updated_at: string
  product: Product
}

interface CartSummary {
  data: CartItem[]
  total: string
  item_count: number
}

// Transaction related types
interface Transaction {
  id: number
  user_id: number
  total_amount: string
  status: TransactionStatus
  notes: string | null
  created_at: string
  updated_at: string
  deleted_at: string | null
  user: User
  items: TransactionItem[]
}

interface TransactionItem {
  id: number
  transaction_id: number
  product_id: number
  quantity: number
  price: string
  total: string
  created_at: string
  updated_at: string
  product: Product
}

type TransactionStatus =
  | 'pending'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'refunded'

// API response types
interface ApiResponse<T> {
  data: T
  message?: string
}

interface ApiError {
  message: string
  errors?: Record<string, string[]>
}
```

## Error Handling

### Error Management Strategy

#### API Error Handling

- **Network Errors**: Display user-friendly messages with retry options
- **Validation Errors**: Show field-specific error messages inline
- **Authentication Errors**: Redirect to login page and show appropriate message
- **Server Errors**: Display generic error message with support contact info

#### Error Display Components

- **Toast Notifications**: For temporary success/error messages using Vue Sonner
- **Inline Validation**: For form field errors using Vee-Validate
- **Error Boundaries**: For component-level error handling
- **Empty States**: For no data scenarios with helpful actions

#### Error Recovery

- **Retry Mechanisms**: For failed API calls with exponential backoff
- **Offline Handling**: Detect offline state and queue actions
- **Graceful Degradation**: Fallback UI when features are unavailable

### HTTP Status Code Handling

```typescript
// Error handling utility
const handleApiError = (error: any) => {
  switch (error.status) {
    case 401:
      // Redirect to login
      router.push('/login')
      toast.error('Please log in to continue')
      break
    case 403:
      toast.error('You do not have permission to perform this action')
      break
    case 404:
      toast.error('The requested resource was not found')
      break
    case 422:
      // Handle validation errors
      return error.errors
    case 500:
      toast.error('Server error. Please try again later.')
      break
    default:
      toast.error('An unexpected error occurred')
  }
}
```

## Testing Strategy

### Testing Approach

- **Unit Tests**: For utility functions and composables using Vitest
- **Component Tests**: For individual components using Vue Test Utils
- **Integration Tests**: For API integration and user flows
- **E2E Tests**: For critical user journeys using Playwright

### Test Coverage Areas

1. **Authentication Flow**: Login, register, logout, token management
2. **Product Browsing**: Search, filter, pagination, product details
3. **Cart Management**: Add, update, remove items, stock validation
4. **Checkout Process**: Order creation, validation, confirmation
5. **Order History**: View orders, order details, status updates

### Testing Tools

- **Vitest**: Unit and integration testing
- **Vue Test Utils**: Component testing
- **MSW (Mock Service Worker)**: API mocking for tests
- **Playwright**: End-to-end testing

## State Management Design

### Pinia Stores

#### Auth Store

```typescript
interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
}

// Actions: login, register, logout, refreshUser, checkAuth
```

#### Products Store

```typescript
interface ProductsState {
  products: Product[]
  categories: Category[]
  currentProduct: Product | null
  filters: ProductFilters
  pagination: PaginationState
  isLoading: boolean
}

// Actions: fetchProducts, fetchCategories, fetchProduct, updateFilters
```

#### Cart Store

```typescript
interface CartState {
  items: CartItem[]
  total: string
  itemCount: number
  isLoading: boolean
}

// Actions: addToCart, updateQuantity, removeItem, clearCart, fetchCart
```

#### Orders Store

```typescript
interface OrdersState {
  orders: Transaction[]
  currentOrder: Transaction | null
  isLoading: boolean
}

// Actions: fetchOrders, fetchOrder, createOrder
```

## API Integration Design

### API Service Layer

```typescript
// Base API configuration
class ApiService {
  private baseURL = 'http://localhost:8000/api'
  private token: string | null = null

  setToken(token: string) {
    this.token = token
  }

  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    // Implementation with error handling, token injection, etc.
  }

  // CRUD methods
  get<T>(endpoint: string): Promise<T>
  post<T>(endpoint: string, data: any): Promise<T>
  put<T>(endpoint: string, data: any): Promise<T>
  delete<T>(endpoint: string): Promise<T>
}
```

### API Composables

```typescript
// useAuth composable
export const useAuth = () => {
  const login = async (credentials: LoginCredentials) => {
    /* */
  }
  const register = async (userData: RegisterData) => {
    /* */
  }
  const logout = async () => {
    /* */
  }

  return { login, register, logout }
}

// useProducts composable
export const useProducts = () => {
  const fetchProducts = async (filters?: ProductFilters) => {
    /* */
  }
  const fetchProduct = async (id: number) => {
    /* */
  }

  return { fetchProducts, fetchProduct }
}

// useCart composable
export const useCart = () => {
  const addToCart = async (productId: number, quantity: number) => {
    /* */
  }
  const updateQuantity = async (itemId: number, quantity: number) => {
    /* */
  }

  return { addToCart, updateQuantity }
}
```

## Routing Design

### Route Structure

```typescript
const routes = [
  {
    path: '/',
    name: 'home',
    component: HomeView,
  },
  {
    path: '/products',
    name: 'products',
    component: ProductsView,
  },
  {
    path: '/products/:id',
    name: 'product-detail',
    component: ProductDetailView,
  },
  {
    path: '/cart',
    name: 'cart',
    component: CartView,
    meta: { requiresAuth: true },
  },
  {
    path: '/checkout',
    name: 'checkout',
    component: CheckoutView,
    meta: { requiresAuth: true },
  },
  {
    path: '/orders',
    name: 'orders',
    component: OrdersView,
    meta: { requiresAuth: true },
  },
  {
    path: '/orders/:id',
    name: 'order-detail',
    component: OrderDetailView,
    meta: { requiresAuth: true },
  },
  {
    path: '/login',
    name: 'login',
    component: LoginView,
    meta: { requiresGuest: true },
  },
  {
    path: '/register',
    name: 'register',
    component: RegisterView,
    meta: { requiresGuest: true },
  },
]
```

### Route Guards

```typescript
// Authentication guard
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()

  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next('/login')
  } else if (to.meta.requiresGuest && authStore.isAuthenticated) {
    next('/')
  } else {
    next()
  }
})
```

## UI/UX Design Principles

### Design System

- **Color Palette**: Neutral base with accent colors for actions
- **Typography**: Clean, readable fonts with proper hierarchy
- **Spacing**: Consistent spacing using Tailwind's spacing scale
- **Components**: shadcn-vue components for consistency

### Responsive Design

- **Mobile-first**: Design for mobile and scale up
- **Breakpoints**: sm (640px), md (768px), lg (1024px), xl (1280px)
- **Navigation**: Collapsible mobile menu, full desktop navigation
- **Grid**: Responsive product grid (1 col mobile, 2-4 cols desktop)

### Accessibility

- **Keyboard Navigation**: Full keyboard accessibility
- **Screen Readers**: Proper ARIA labels and semantic HTML
- **Color Contrast**: WCAG AA compliant color combinations
- **Focus Management**: Clear focus indicators

### Performance Optimization

- **Code Splitting**: Route-based code splitting
- **Image Optimization**: Lazy loading and responsive images
- **Caching**: API response caching with proper invalidation
- **Bundle Size**: Tree shaking and minimal dependencies

## Security Considerations

### Authentication Security

- **Token Storage**: Secure token storage in httpOnly cookies or secure localStorage
- **Token Expiration**: Handle token expiration gracefully
- **CSRF Protection**: Implement CSRF tokens for state-changing operations

### Data Validation

- **Client-side Validation**: Immediate feedback using Zod schemas
- **Server-side Validation**: Always validate on server side
- **Input Sanitization**: Sanitize user inputs to prevent XSS

### API Security

- **HTTPS Only**: All API calls over HTTPS in production
- **Rate Limiting**: Respect API rate limits
- **Error Handling**: Don't expose sensitive information in errors
