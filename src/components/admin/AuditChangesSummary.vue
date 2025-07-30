<template>
  <div class="space-y-2">
    <div v-if="hasChanges" class="text-xs text-gray-600">
      <div v-if="entry.action === 'created'" class="text-green-600">
        <span class="font-medium">Created:</span>
        {{ getCreatedFieldsText() }}
      </div>
      <div v-else-if="entry.action === 'updated'" class="text-blue-600">
        <span class="font-medium">Updated:</span>
        {{ getUpdatedFieldsText() }}
      </div>
      <div v-else-if="entry.action === 'deleted'" class="text-red-600">
        <span class="font-medium">Deleted:</span>
        {{ getDeletedFieldsText() }}
      </div>
      <div v-else-if="entry.action === 'restored'" class="text-green-600">
        <span class="font-medium">Restored:</span>
        {{ getRestoredFieldsText() }}
      </div>
    </div>
    <div v-if="keyChanges.length > 0" class="flex flex-wrap gap-1">
      <Badge v-for="field in keyChanges.slice(0, 3)" :key="field" variant="outline" class="text-xs">
        {{ formatFieldName(field) }}
      </Badge>
      <Badge v-if="keyChanges.length > 3" variant="outline" class="text-xs">
        +{{ keyChanges.length - 3 }} more
      </Badge>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { AuditTrail } from '@/types'
import { Badge } from '@/components/ui/badge'

interface Props {
  entry: AuditTrail
}

const props = defineProps<Props>()

const hasChanges = computed(() => {
  return props.entry.old_values || props.entry.new_values
})

const keyChanges = computed(() => {
  const changes: string[] = []

  if (props.entry.new_values) {
    changes.push(...Object.keys(props.entry.new_values))
  }

  if (props.entry.old_values) {
    changes.push(...Object.keys(props.entry.old_values))
  }

  // Remove duplicates and filter out common fields
  return [...new Set(changes)].filter(
    (field) => !['id', 'created_at', 'updated_at', 'deleted_at'].includes(field),
  )
})

const getCreatedFieldsText = () => {
  if (!props.entry.new_values) return 'New record created'

  const fields = Object.keys(props.entry.new_values).filter(
    (field) => !['id', 'created_at', 'updated_at'].includes(field),
  )

  if (fields.length === 0) return 'New record created'
  if (fields.length <= 2) return fields.map(formatFieldName).join(', ')
  return `${fields.length} fields set`
}

const getUpdatedFieldsText = () => {
  if (keyChanges.value.length === 0) return 'Record updated'
  if (keyChanges.value.length <= 2) {
    return keyChanges.value.map(formatFieldName).join(', ')
  }
  return `${keyChanges.value.length} fields changed`
}

const getDeletedFieldsText = () => {
  return 'Record moved to trash'
}

const getRestoredFieldsText = () => {
  return 'Record restored from trash'
}

const formatFieldName = (field: string) => {
  return field.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())
}
</script>
