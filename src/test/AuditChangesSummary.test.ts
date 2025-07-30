import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import AuditChangesSummary from '@/components/admin/AuditChangesSummary.vue'
import type { AuditTrail } from '@/types'

const mockUser = {
  id: 1,
  name: 'Test User',
  email: 'test@example.com',
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
  email_verified_at: null,
}

describe('AuditChangesSummary', () => {
  it('renders created action summary correctly', () => {
    const entry: AuditTrail = {
      id: 1,
      user_id: 1,
      model_type: 'Product',
      model_id: 123,
      action: 'created',
      old_values: null,
      new_values: {
        name: 'New Product',
        price: 99.99,
        stock: 10,
      },
      ip_address: '127.0.0.1',
      user_agent: 'Test Agent',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
      user: mockUser,
    }

    const wrapper = mount(AuditChangesSummary, {
      props: { entry },
      global: {
        stubs: {
          Badge: { template: '<span><slot /></span>' },
        },
      },
    })

    expect(wrapper.text()).toContain('Created:')
    expect(wrapper.text()).toContain('3 fields set')
  })

  it('renders updated action summary correctly', () => {
    const entry: AuditTrail = {
      id: 2,
      user_id: 1,
      model_type: 'Product',
      model_id: 123,
      action: 'updated',
      old_values: {
        name: 'Old Product',
        price: 89.99,
      },
      new_values: {
        name: 'Updated Product',
        price: 99.99,
      },
      ip_address: '127.0.0.1',
      user_agent: 'Test Agent',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
      user: mockUser,
    }

    const wrapper = mount(AuditChangesSummary, {
      props: { entry },
      global: {
        stubs: {
          Badge: { template: '<span><slot /></span>' },
        },
      },
    })

    expect(wrapper.text()).toContain('Updated:')
    expect(wrapper.text()).toContain('Name, Price')
  })

  it('renders deleted action summary correctly', () => {
    const entry: AuditTrail = {
      id: 3,
      user_id: 1,
      model_type: 'Product',
      model_id: 123,
      action: 'deleted',
      old_values: {
        name: 'Deleted Product',
        price: 99.99,
      },
      new_values: null,
      ip_address: '127.0.0.1',
      user_agent: 'Test Agent',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
      user: mockUser,
    }

    const wrapper = mount(AuditChangesSummary, {
      props: { entry },
      global: {
        stubs: {
          Badge: { template: '<span><slot /></span>' },
        },
      },
    })

    expect(wrapper.text()).toContain('Deleted:')
    expect(wrapper.text()).toContain('Record moved to trash')
  })

  it('formats field names correctly', () => {
    const entry: AuditTrail = {
      id: 4,
      user_id: 1,
      model_type: 'User',
      model_id: 123,
      action: 'updated',
      old_values: {
        first_name: 'John',
        last_name: 'Doe',
        email_verified_at: null,
      },
      new_values: {
        first_name: 'Jane',
        last_name: 'Smith',
        email_verified_at: '2024-01-01T00:00:00Z',
      },
      ip_address: '127.0.0.1',
      user_agent: 'Test Agent',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
      user: mockUser,
    }

    const wrapper = mount(AuditChangesSummary, {
      props: { entry },
      global: {
        stubs: {
          Badge: { template: '<span><slot /></span>' },
        },
      },
    })

    // Check that field names are properly formatted
    expect(wrapper.text()).toContain('First Name')
    expect(wrapper.text()).toContain('Last Name')
    expect(wrapper.text()).toContain('Email Verified At')
  })
})
