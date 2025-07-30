// Simple test to verify components can be imported
import { describe, it, expect } from 'vitest'

describe('Admin Components', () => {
  it('DataTable component can be imported', async () => {
    const DataTable = await import('@/components/admin/DataTable.vue')
    expect(DataTable.default).toBeDefined()
  })

  it('FormBuilder component can be imported', async () => {
    const FormBuilder = await import('@/components/admin/FormBuilder.vue')
    expect(FormBuilder.default).toBeDefined()
  })

  it('ConfirmationDialog component can be imported', async () => {
    const ConfirmationDialog = await import('@/components/admin/ConfirmationDialog.vue')
    expect(ConfirmationDialog.default).toBeDefined()
  })

  it('ImageUpload component can be imported', async () => {
    const ImageUpload = await import('@/components/admin/ImageUpload.vue')
    expect(ImageUpload.default).toBeDefined()
  })
})
