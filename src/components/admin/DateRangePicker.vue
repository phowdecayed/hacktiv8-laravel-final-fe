<template>
  <div class="space-y-2">
    <Label v-if="label">{{ label }}</Label>
    <Popover>
      <PopoverTrigger as-child>
        <Button
          variant="outline"
          :class="cn('w-full justify-start text-left font-normal', !modelValue?.start && 'text-muted-foreground')"
        >
          <CalendarIcon class="mr-2 h-4 w-4" />
          <span>
            {{ dateRangeText }}
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent class="w-auto p-0" align="start">
        <Calendar
          v-model="modelValue"
          mode="range"
          :columns="2"
          @update:model-value="onDateRangeChange"
        />
      </PopoverContent>
    </Popover>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { CalendarIcon } from 'lucide-vue-next'
import { cn } from '@/lib/utils'

interface Props {
  modelValue: any
  label?: string
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'update:modelValue': [value: any]
}>()

// Computed properties
const dateRangeText = computed(() => {
  if (!props.modelValue) return 'Select date range'
  const { start, end } = props.modelValue
  if (start && end) {
    return `${new Date(start.toString()).toLocaleDateString()} - ${new Date(end.toString()).toLocaleDateString()}`
  } else if (start) {
    return `From ${new Date(start.toString()).toLocaleDateString()}`
  }
  return 'Select date range'
})

// Methods
const onDateRangeChange = (range: any) => {
  emit('update:modelValue', range)
}
</script>