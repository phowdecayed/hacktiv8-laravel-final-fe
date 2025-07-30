<template>
  <Card>
    <CardHeader>
      <CardTitle class="text-lg flex items-center justify-between">
        <span>Filters</span>
        <Button
          v-if="hasActiveFilters"
          variant="ghost"
          size="sm"
          @click="clearFilters"
          class="text-red-600 hover:text-red-800"
        >
          <X class="h-4 w-4 mr-2" />
          Clear All
        </Button>
      </CardTitle>
    </CardHeader>
    <CardContent class="space-y-4">
      <slot />

      <div class="flex gap-2">
        <Button @click="applyFilters">
          <Filter class="h-4 w-4 mr-2" />
          Apply Filters
        </Button>
        <Button v-if="hasActiveFilters" variant="outline" @click="clearFilters">
          <X class="h-4 w-4 mr-2" />
          Clear
        </Button>
      </div>
    </CardContent>
  </Card>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Filter, X } from 'lucide-vue-next'

interface Props {
  filters: Record<string, any>
}

const props = defineProps<Props>()
const emit = defineEmits<{
  apply: [filters: Record<string, any>]
  clear: []
}>()

// Computed properties
const hasActiveFilters = computed(() => {
  return Object.values(props.filters).some((value) => {
    if (value === null || value === undefined) return false
    if (typeof value === 'string') return value.trim() !== ''
    if (Array.isArray(value)) return value.length > 0
    return true
  })
})

// Methods
const applyFilters = () => {
  emit('apply', props.filters)
}

const clearFilters = () => {
  emit('clear')
}
</script>
