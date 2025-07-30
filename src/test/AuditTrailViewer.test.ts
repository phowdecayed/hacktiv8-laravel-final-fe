import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import AuditTrailViewer from '@/views/admin/AuditTrailViewer.vue'
import { useAuditTrailStore } from '@/stores/auditTrail'

// Mock the admin API service
vi.mock('@/services/api/admin', () => ({
  adminApiService: {
    getUsers: vi.fn().mockResolvedValue({
      data: [
        { id: 1, name: 'Admin User', email: 'admin@test.com' },
        { id: 2, name: 'Editor User', email: 'editor@test.com' },
      ],
    }),
  },
}))

// Mock the notifications composable
vi.mock('@/composables/useNotifications', () => ({
  useNotifications: () => ({
    showSuccess: vi.fn(),
    showError: vi.fn(),
  }),
}))

describe('AuditTrailViewer', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('renders the audit trail viewer correctly', () => {
    const wrapper = mount(AuditTrailViewer, {
      global: {
        stubs: {
          // Stub complex UI components
          Card: { template: '<div><slot /></div>' },
          CardHeader: { template: '<div><slot /></div>' },
          CardTitle: { template: '<div><slot /></div>' },
          CardDescription: { template: '<div><slot /></div>' },
          CardContent: { template: '<div><slot /></div>' },
          Button: { template: '<button><slot /></button>' },
          Select: { template: '<div><slot /></div>' },
          SelectTrigger: { template: '<div><slot /></div>' },
          SelectValue: { template: '<div><slot /></div>' },
          SelectContent: { template: '<div><slot /></div>' },
          SelectItem: { template: '<div><slot /></div>' },
          Label: { template: '<label><slot /></label>' },
          Badge: { template: '<span><slot /></span>' },
          Popover: { template: '<div><slot /></div>' },
          PopoverTrigger: { template: '<div><slot /></div>' },
          PopoverContent: { template: '<div><slot /></div>' },
          Calendar: { template: '<div />' },
          AuditChangesSummary: { template: '<div />' },
          AuditEntryDetailDialog: { template: '<div />' },
        },
      },
    })

    expect(wrapper.find('h1').text()).toBe('Audit Trail')
    expect(wrapper.text()).toContain('Monitor system activities and changes')
  })

  it('initializes with correct default state', () => {
    const store = useAuditTrailStore()

    expect(store.auditEntries).toEqual([])
    expect(store.isLoading).toBe(false)
    expect(store.hasEntries).toBe(false)
  })

  it('handles filter changes correctly', async () => {
    const store = useAuditTrailStore()
    const mockFilters = {
      user_id: 1,
      model_type: 'User',
      action: 'created' as const,
    }

    store.setFilters(mockFilters)

    expect(store.filters).toEqual(expect.objectContaining(mockFilters))
  })

  it('formats action variants correctly', () => {
    const wrapper = mount(AuditTrailViewer, {
      global: {
        stubs: {
          Card: { template: '<div><slot /></div>' },
          CardHeader: { template: '<div><slot /></div>' },
          CardTitle: { template: '<div><slot /></div>' },
          CardDescription: { template: '<div><slot /></div>' },
          CardContent: { template: '<div><slot /></div>' },
          Button: { template: '<button><slot /></button>' },
          Select: { template: '<div><slot /></div>' },
          SelectTrigger: { template: '<div><slot /></div>' },
          SelectValue: { template: '<div><slot /></div>' },
          SelectContent: { template: '<div><slot /></div>' },
          SelectItem: { template: '<div><slot /></div>' },
          Label: { template: '<label><slot /></label>' },
          Badge: { template: '<span><slot /></span>' },
          Popover: { template: '<div><slot /></div>' },
          PopoverTrigger: { template: '<div><slot /></div>' },
          PopoverContent: { template: '<div><slot /></div>' },
          Calendar: { template: '<div />' },
          AuditChangesSummary: { template: '<div />' },
          AuditEntryDetailDialog: { template: '<div />' },
        },
      },
    })

    const vm = wrapper.vm as any

    expect(vm.getActionVariant('created')).toBe('default')
    expect(vm.getActionVariant('updated')).toBe('secondary')
    expect(vm.getActionVariant('deleted')).toBe('destructive')
    expect(vm.getActionVariant('restored')).toBe('outline')
  })
})
