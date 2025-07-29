<template>
  <Transition
    enter-active-class="transition-all duration-200 ease-out"
    enter-from-class="opacity-0 transform -translate-y-1"
    enter-to-class="opacity-100 transform translate-y-0"
    leave-active-class="transition-all duration-150 ease-in"
    leave-from-class="opacity-100 transform translate-y-0"
    leave-to-class="opacity-0 transform -translate-y-1"
  >
    <div
      v-if="hasError"
      class="flex items-start gap-2 mt-1 text-sm text-destructive"
      :class="containerClass"
    >
      <AlertCircle v-if="showIcon" class="w-4 h-4 mt-0.5 flex-shrink-0" :class="iconClass" />
      <div class="flex-1 min-w-0">
        <p v-if="typeof error === 'string'" class="break-words">
          {{ error }}
        </p>
        <ul v-else-if="Array.isArray(error)" class="space-y-1">
          <li v-for="(message, index) in error" :key="index" class="break-words">
            {{ message }}
          </li>
        </ul>
        <div v-else-if="error && typeof error === 'object'">
          <div v-for="(messages, field) in error" :key="field" class="mb-1 last:mb-0">
            <span v-if="showFieldNames" class="font-medium">{{ formatFieldName(field) }}:</span>
            <ul
              v-if="Array.isArray(messages)"
              class="space-y-1"
              :class="{ 'ml-2': showFieldNames }"
            >
              <li v-for="(message, index) in messages" :key="index" class="break-words">
                {{ message }}
              </li>
            </ul>
            <p v-else class="break-words" :class="{ 'ml-2': showFieldNames }">
              {{ messages }}
            </p>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { AlertCircle } from 'lucide-vue-next'

interface Props {
  error?: string | string[] | Record<string, string | string[]> | null
  showIcon?: boolean
  showFieldNames?: boolean
  containerClass?: string
  iconClass?: string
}

const props = withDefaults(defineProps<Props>(), {
  error: null,
  showIcon: true,
  showFieldNames: false,
  containerClass: '',
  iconClass: '',
})

const hasError = computed(() => {
  if (!props.error) return false

  if (typeof props.error === 'string') {
    return props.error.trim().length > 0
  }

  if (Array.isArray(props.error)) {
    return props.error.length > 0
  }

  if (typeof props.error === 'object') {
    return Object.keys(props.error).length > 0
  }

  return false
})

const formatFieldName = (fieldName: string): string => {
  return fieldName
    .replace(/_/g, ' ')
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (str) => str.toUpperCase())
    .trim()
}
</script>
