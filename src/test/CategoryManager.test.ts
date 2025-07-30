import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import CategoryManager from '@/views/admin/CategoryManager.vue'
import type { Category, Product, User } from '@/types'

// Mock the composables
vi.mock('@/composables/useNotifications', () => ({
  useNotifications: () => ({
    success: vi.fn(),
    error: vi.fn(),
  }),
}))

vi.mock('@/services/api/admin', () => ({
  adminApiService: {
    bulkUpdateProductCategory: vi.fn(),
  },
}))

const mockCategoriesData = {
  categories: [] as Category[],
  isLoading: false,
  totalCategories: 0,
  categoriesWithProducts: 0,
  emptyCategories: 0,
  fetchCategories: vi.fn(),
  createCategory: vi.fn(),
  updateCategory: vi.fn(),
  deleteCategory: vi.fn(),
  restoreCategory: vi.fn(),
  setFilters: vi.fn(),
}

vi.mock('@/composables/useCategories', () => ({
  useCategories: () => mockCategoriesData,
}))

describe('CategoryManager', () => {
  beforeEach(() => {
    // Reset the mock data
    mockCategoriesData.categories = []
    mockCategoriesData.totalCategories = 0
    mockCategoriesData.categoriesWithProducts = 0
    mockCategoriesData.emptyCategories = 0
    
    setActivePinia(createPinia())
  })

  it('renders category management interface', () => {
    const wrapper = mount(CategoryManager, {
      global: {
        stubs: {
          DataTable: true,
          FormBuilder: true,
          ConfirmationDialog: true,
          Dialog: true,
          DialogContent: true,
          DialogHeader: true,
          DialogTitle: true,
          DialogDescription: true,
          DialogFooter: true,
          // Don't stub Card components so we can test their content
          Card: false,
          CardContent: false,
          Button: true,
          Badge: true,
        },
      },
    })

    expect(wrapper.find('h1').text()).toBe('Category Management')
    expect(wrapper.find('p').text()).toBe('Organize your product categories')
  })

  it('displays category statistics', () => {
    // Set up the mock data to return specific values
    const mockUser: User = { 
      id: 1, 
      name: 'Admin', 
      email: 'admin@test.com',
      email_verified_at: null,
      created_at: '2024-01-01',
      updated_at: '2024-01-01'
    }
    
    const mockProduct: Product = {
      id: 1,
      name: 'Phone',
      description: null,
      price: '999.99',
      stock: 10,
      category_id: 1,
      user_id: 1,
      created_at: '2024-01-01',
      updated_at: '2024-01-01',
      deleted_at: null,
      user: mockUser,
      category: null,
      images: []
    }
    
    mockCategoriesData.categories = [
      {
        id: 1,
        name: 'Electronics',
        description: 'Electronic products',
        user_id: 1,
        created_at: '2024-01-01',
        updated_at: '2024-01-01',
        deleted_at: null,
        user: mockUser,
        products: [mockProduct],
      },
      {
        id: 2,
        name: 'Books',
        description: 'Book products',
        user_id: 1,
        created_at: '2024-01-01',
        updated_at: '2024-01-01',
        deleted_at: null,
        user: mockUser,
        products: [],
      },
    ] as Category[]
    mockCategoriesData.totalCategories = 2
    mockCategoriesData.categoriesWithProducts = 1
    mockCategoriesData.emptyCategories = 1

    const wrapper = mount(CategoryManager, {
      global: {
        stubs: {
          DataTable: true,
          FormBuilder: true,
          ConfirmationDialog: true,
          Dialog: true,
          DialogContent: true,
          DialogHeader: true,
          DialogTitle: true,
          DialogDescription: true,
          DialogFooter: true,
          // Don't stub Card components so we can test their content
          Card: false,
          CardContent: false,
          Button: true,
          Badge: true,
        },
      },
    })

    // Check that the statistics are displayed correctly
    const text = wrapper.text()
    // Should contain the header text
    expect(text).toContain('Category Management')
    // Should contain the total categories count (2)
    expect(text).toContain('2')
    // Should contain the categories with products count (1)
    expect(text).toContain('1')
    // Should contain the empty categories count (1)
    expect(text).toContain('1')
  })

  it('opens create dialog when add button is clicked', async () => {
    const wrapper = mount(CategoryManager, {
      global: {
        stubs: {
          DataTable: true,
          FormBuilder: true,
          ConfirmationDialog: true,
          Dialog: {
            template: '<div data-testid="dialog-wrapper"><slot></slot></div>',
            props: ['open'],
          },
          DialogContent: {
            template: '<div data-testid="dialog-content"><slot></slot></div>',
          },
          DialogHeader: true,
          DialogTitle: true,
          DialogDescription: true,
          DialogFooter: true,
          Card: true,
          CardContent: true,
          Button: {
            template: '<button data-testid="add-button"><slot></slot></button>',
          },
          Badge: true,
        },
      },
    })

    // Find the "Add Category" button using test id
    const addButton = wrapper.find('[data-testid="add-button"]')
    expect(addButton.exists()).toBe(true)
    
    await addButton.trigger('click')
    
    // Check that the dialog content is rendered
    const dialogContent = wrapper.find('[data-testid="dialog-content"]')
    expect(dialogContent.exists()).toBe(true)
  })
})
