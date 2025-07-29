<template>
  <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
    <!-- Filters -->
    <div class="flex flex-col sm:flex-row gap-3">
      <Select :model-value="filters.status" @update:model-value="(value) => updateFilter('status', value)">
        <SelectTrigger class="w-full sm:w-[180px]">
          <SelectValue placeholder="Filter by status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Orders</SelectItem>
          <SelectItem value="pending">Pending</SelectItem>
          <SelectItem value="processing">Processing</SelectItem>
          <SelectItem value="shipped">Shipped</SelectItem>
          <SelectItem value="delivered">Completed</SelectItem>
          <SelectItem value="cancelled">Cancelled</SelectItem>
          <SelectItem value="refunded">Refunded</SelectItem>
        </SelectContent>
      </Select>

      <Select :model-value="filters.sort_by" @update:model-value="(value) => updateFilter('sort_by', value)">
        <SelectTrigger class="w-full sm:w-[180px]">
          <SelectValue placeholder="Sort by" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="created_at">Order Date</SelectItem>
          <SelectItem value="total_amount">Total Amount</SelectItem>
        </SelectContent>
      </Select>

      <Select :model-value="filters.sort_order" @update:model-value="(value) => updateFilter('sort_order', value)">
        <SelectTrigger class="w-full sm:w-[120px]">
          <SelectValue placeholder="Order" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="desc">Newest First</SelectItem>
          <SelectItem value="asc">Oldest First</SelectItem>
        </SelectContent>
      </Select>

      <Button v-if="showClearFiltersButton" variant="outline" @click="emit('clear-filters')">
        Clear Filters
      </Button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import type { OrderFilters as OrderFiltersType } from '@/stores/orders'

interface Props {
  filters: OrderFiltersType
  totalResults: number
  isLoading: boolean
}

const props = defineProps<Props>()
const emit = defineEmits(['update:filters', 'clear-filters'])

const updateFilter = (key: keyof OrderFiltersType, value: any) => {
  emit('update:filters', { [key]: value })
}

const showClearFiltersButton = computed(() => {
  return (
    props.filters.status !== 'all' ||
    props.filters.sort_by !== 'created_at' ||
    props.filters.sort_order !== 'desc'
  )
})
</script>
