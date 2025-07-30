<template>
  <Dialog :open="open" @update:open="$emit('close')">
    <DialogContent class="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
      <DialogHeader>
        <DialogTitle class="flex items-center gap-2">
          <Badge :variant="getActionVariant(entry?.action || '')">
            {{ entry?.action }}
          </Badge>
          Audit Entry #{{ entry?.id }}
        </DialogTitle>
        <DialogDescription> Detailed information about this audit trail entry </DialogDescription>
      </DialogHeader>

      <div v-if="entry" class="flex-1 overflow-auto space-y-6">
        <!-- Basic Information -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader class="pb-3">
              <CardTitle class="text-sm font-medium">Basic Information</CardTitle>
            </CardHeader>
            <CardContent class="space-y-3">
              <div class="flex justify-between">
                <span class="text-sm text-gray-500">User:</span>
                <span class="text-sm font-medium">{{ entry.user.name }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-sm text-gray-500">Email:</span>
                <span class="text-sm">{{ entry.user.email }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-sm text-gray-500">Model:</span>
                <span class="text-sm font-medium"
                  >{{ entry.model_type }} #{{ entry.model_id }}</span
                >
              </div>
              <div class="flex justify-between">
                <span class="text-sm text-gray-500">Action:</span>
                <Badge :variant="getActionVariant(entry.action)">{{ entry.action }}</Badge>
              </div>
              <div class="flex justify-between">
                <span class="text-sm text-gray-500">Date:</span>
                <span class="text-sm">{{ formatDateTime(entry.created_at) }}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader class="pb-3">
              <CardTitle class="text-sm font-medium">Technical Details</CardTitle>
            </CardHeader>
            <CardContent class="space-y-3">
              <div class="flex justify-between">
                <span class="text-sm text-gray-500">IP Address:</span>
                <span class="text-sm font-mono">{{ entry.ip_address }}</span>
              </div>
              <div class="space-y-1">
                <span class="text-sm text-gray-500">User Agent:</span>
                <p class="text-xs text-gray-600 break-all">{{ entry.user_agent }}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <!-- Changes Comparison -->
        <div v-if="entry.old_values || entry.new_values">
          <Card>
            <CardHeader>
              <CardTitle class="text-sm font-medium">Changes</CardTitle>
              <CardDescription> Comparison of values before and after the change </CardDescription>
            </CardHeader>
            <CardContent>
              <div class="space-y-4">
                <!-- Created Action -->
                <div v-if="entry.action === 'created' && entry.new_values">
                  <h4 class="text-sm font-medium text-green-600 mb-3">New Values</h4>
                  <div class="space-y-2">
                    <div
                      v-for="[key, value] in Object.entries(entry.new_values)"
                      :key="key"
                      class="grid grid-cols-3 gap-4 py-2 border-b border-gray-100 last:border-b-0"
                    >
                      <div class="text-sm font-medium text-gray-700">
                        {{ formatFieldName(key) }}
                      </div>
                      <div class="col-span-2">
                        <div class="text-sm text-green-600 bg-green-50 px-2 py-1 rounded">
                          {{ formatValue(value) }}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Updated Action -->
                <div v-else-if="entry.action === 'updated'">
                  <h4 class="text-sm font-medium text-blue-600 mb-3">Field Changes</h4>
                  <div class="space-y-4">
                    <div
                      v-for="field in getChangedFields()"
                      :key="field"
                      class="border border-gray-200 rounded-lg p-3"
                    >
                      <div class="text-sm font-medium text-gray-700 mb-2">
                        {{ formatFieldName(field) }}
                      </div>
                      <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <div class="text-xs text-gray-500 mb-1">Before</div>
                          <div class="text-sm text-red-600 bg-red-50 px-2 py-1 rounded">
                            {{ formatValue(entry.old_values?.[field]) }}
                          </div>
                        </div>
                        <div>
                          <div class="text-xs text-gray-500 mb-1">After</div>
                          <div class="text-sm text-green-600 bg-green-50 px-2 py-1 rounded">
                            {{ formatValue(entry.new_values?.[field]) }}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Deleted Action -->
                <div v-else-if="entry.action === 'deleted' && entry.old_values">
                  <h4 class="text-sm font-medium text-red-600 mb-3">Deleted Values</h4>
                  <div class="space-y-2">
                    <div
                      v-for="[key, value] in Object.entries(entry.old_values)"
                      :key="key"
                      class="grid grid-cols-3 gap-4 py-2 border-b border-gray-100 last:border-b-0"
                    >
                      <div class="text-sm font-medium text-gray-700">
                        {{ formatFieldName(key) }}
                      </div>
                      <div class="col-span-2">
                        <div class="text-sm text-red-600 bg-red-50 px-2 py-1 rounded">
                          {{ formatValue(value) }}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Restored Action -->
                <div v-else-if="entry.action === 'restored' && entry.new_values">
                  <h4 class="text-sm font-medium text-green-600 mb-3">Restored Values</h4>
                  <div class="space-y-2">
                    <div
                      v-for="[key, value] in Object.entries(entry.new_values)"
                      :key="key"
                      class="grid grid-cols-3 gap-4 py-2 border-b border-gray-100 last:border-b-0"
                    >
                      <div class="text-sm font-medium text-gray-700">
                        {{ formatFieldName(key) }}
                      </div>
                      <div class="col-span-2">
                        <div class="text-sm text-green-600 bg-green-50 px-2 py-1 rounded">
                          {{ formatValue(value) }}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <!-- Raw Data (for debugging) -->
        <Collapsible>
          <CollapsibleTrigger as-child>
            <Button variant="outline" class="w-full">
              <Code class="h-4 w-4 mr-2" />
              Show Raw Data
              <ChevronDown class="h-4 w-4 ml-2" />
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <Card class="mt-2">
              <CardContent class="p-4">
                <pre class="text-xs text-gray-600 overflow-auto">{{
                  JSON.stringify(entry, null, 2)
                }}</pre>
              </CardContent>
            </Card>
          </CollapsibleContent>
        </Collapsible>
      </div>

      <DialogFooter>
        <Button variant="outline" @click="$emit('close')">Close</Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { AuditTrail } from '@/types'

// UI Components
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'

// Icons
import { Code, ChevronDown } from 'lucide-vue-next'

interface Props {
  entry: AuditTrail | null
  open: boolean
}

interface Emits {
  (e: 'close'): void
}

const props = defineProps<Props>()
defineEmits<Emits>()

const getChangedFields = () => {
  if (!props.entry?.old_values || !props.entry?.new_values) return []

  const oldKeys = Object.keys(props.entry.old_values)
  const newKeys = Object.keys(props.entry.new_values)
  const allKeys = [...new Set([...oldKeys, ...newKeys])]

  return allKeys.filter((key) => {
    const oldValue = props.entry?.old_values?.[key]
    const newValue = props.entry?.new_values?.[key]
    return JSON.stringify(oldValue) !== JSON.stringify(newValue)
  })
}

const getActionVariant = (action: string) => {
  switch (action) {
    case 'created':
      return 'default'
    case 'updated':
      return 'secondary'
    case 'deleted':
      return 'destructive'
    case 'restored':
      return 'outline'
    default:
      return 'secondary'
  }
}

const formatFieldName = (field: string) => {
  return field.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())
}

const formatValue = (value: any) => {
  if (value === null || value === undefined) {
    return '(empty)'
  }

  if (typeof value === 'boolean') {
    return value ? 'Yes' : 'No'
  }

  if (typeof value === 'object') {
    return JSON.stringify(value, null, 2)
  }

  if (typeof value === 'string' && value.length > 100) {
    return value.substring(0, 100) + '...'
  }

  return String(value)
}

const formatDateTime = (dateString: string) => {
  return new Date(dateString).toLocaleString()
}
</script>
