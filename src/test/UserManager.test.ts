import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import UserManager from '@/views/admin/UserManager.vue'
import { useUsersStore } from '@/stores/users'

// Mock the composables
vi.mock('@/composables/useNotifications', () => ({
  useNotifications: () => ({
    showSuccess: vi.fn(),
    showError: vi.fn(),
  }),
}))

// Mock lodash-es
vi.mock('lodash-es', () => ({
  debounce: (fn: Function) => fn,
}))

// Mock date-fns
vi.mock('date-fns', () => ({
  format: (date: Date, formatStr: string) => '2024-01-01',
}))

describe('UserManager', () => {
  let pinia: ReturnType<typeof createPinia>

  beforeEach(() => {
    pinia = createPinia()
    setActivePinia(pinia)
  })

  it('renders correctly', () => {
    const wrapper = mount(UserManager, {
      global: {
        plugins: [pinia],
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
          Card: true,
          CardContent: true,
          Button: true,
          Input: true,
          Select: true,
          SelectTrigger: true,
          SelectValue: true,
          SelectContent: true,
          SelectItem: true,
          Badge: true,
          Label: true,
        },
      },
    })

    expect(wrapper.find('h1').text()).toBe('User Management')
    expect(wrapper.find('p').text()).toBe('Manage user accounts and roles')
  })

  it('initializes with correct default state', () => {
    const usersStore = useUsersStore()

    expect(usersStore.users).toEqual([])
    expect(usersStore.isLoading).toBe(false)
    expect(usersStore.error).toBe(null)
  })

  it('has correct table columns configuration', () => {
    const wrapper = mount(UserManager, {
      global: {
        plugins: [pinia],
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
          Card: true,
          CardContent: true,
          Button: true,
          Input: true,
          Select: true,
          SelectTrigger: true,
          SelectValue: true,
          SelectContent: true,
          SelectItem: true,
          Badge: true,
          Label: true,
        },
      },
    })

    const vm = wrapper.vm as any
    expect(vm.tableColumns).toHaveLength(5)
    expect(vm.tableColumns[0].key).toBe('name')
    expect(vm.tableColumns[1].key).toBe('role')
  })

  it('has correct form schema for user creation', () => {
    const wrapper = mount(UserManager, {
      global: {
        plugins: [pinia],
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
          Card: true,
          CardContent: true,
          Button: true,
          Input: true,
          Select: true,
          SelectTrigger: true,
          SelectValue: true,
          SelectContent: true,
          SelectItem: true,
          Badge: true,
          Label: true,
        },
      },
    })

    const vm = wrapper.vm as any
    expect(vm.userFormSchema.fields).toHaveLength(5)
    expect(vm.userFormSchema.fields[0].name).toBe('name')
    expect(vm.userFormSchema.fields[1].name).toBe('email')
    expect(vm.userFormSchema.fields[2].name).toBe('password')
    expect(vm.userFormSchema.fields[3].name).toBe('password_confirmation')
    expect(vm.userFormSchema.fields[4].name).toBe('role')
  })
})
