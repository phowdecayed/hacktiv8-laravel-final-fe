<template>
  <div v-if="selectedItems.length > 0" class="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-2">
        <Checkbox
          :checked="true"
          @update:checked="toggleSelectAll"
          class="border-blue-300"
        />
        <span class="text-sm font-medium text-blue-800">
          {{ selectedItems.length }} item{{ selectedItems.length !== 1 ? 's' : '' }} selected
        </span>
      </div>
      
      <div class="flex items-center gap-2">
        <slot name="actions" :selectedItems="selectedItems" />
        
        <Button
          v-if="showExport"
          variant="outline"
          size="sm"
          @click="exportSelected"
          class="text-blue-700 border-blue-300 hover:bg-blue-100"
        >
          <Download class="h-4 w-4 mr-2" />
          Export
        </Button>
        
        <Button
          v-if="showDelete"
          variant="outline"
          size="sm"
          @click="deleteSelected"
          class="text-red-700 border-red-300 hover:bg-red-100"
        >
          <Trash2 class="h-4 w-4 mr-2" />
          Delete
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          @click="clearSelection"
          class="text-blue-700 hover:bg-blue-100"
        >
          <X class="h-4 w-4" />
        </Button>
      </div>
    </div>
    
    <div v-if="showSelectAll && totalItems > selectedItems.length" class="mt-2 text-sm">
      <Button
        variant="link"
        size="sm"
        @click="selectAll"
        class="text-blue-700 p-0 h-auto"
      >
        Select all {{ totalItems }} items
      </Button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Download, Trash2, X } from 'lucide-vue-next'

interface Props {
  selectedItems: any[]
  totalItems: number
  showExport?: boolean
  showDelete?: boolean
  showSelectAll?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  showExport: false,
  showDelete: false,
  showSelectAll: false
})

const emit = defineEmits<{
  'update:selectedItems': [items: any[]]
  'export': [items: any[]]
  'delete': [items: any[]]
}>()

// Computed properties
const allSelected = computed(() => {
  return props.selectedItems.length === props.totalItems && props.totalItems > 0
})

// Methods
const toggleSelectAll = () => {
  if (allSelected.value) {
    clearSelection()
  } else {
    selectAll()
  }
}

const selectAll = () => {
  // In a real implementation, this would select all items
  // For now, we'll just emit an event that the parent can handle
  emit('update:selectedItems', [])
}

const clearSelection = () => {
  emit('update:selectedItems', [])
}

const exportSelected = () => {
  emit('export', props.selectedItems)
}

const deleteSelected = () => {
  if (confirm(`Are you sure you want to delete ${props.selectedItems.length} item(s)?`)) {
    emit('delete', props.selectedItems)
  }
}
</script>