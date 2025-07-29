<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition-opacity duration-200 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition-opacity duration-150 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="isVisible"
        class="fixed inset-0 z-50 flex items-center justify-center"
        :class="overlayClass"
        @click="handleOverlayClick"
      >
        <div
          class="bg-background border rounded-lg shadow-lg p-6 max-w-sm mx-4"
          :class="contentClass"
          @click.stop
        >
          <div class="flex items-center gap-4">
            <!-- Loading spinner -->
            <div class="flex-shrink-0">
              <Loader2 class="animate-spin" :class="spinnerClass" />
            </div>

            <!-- Content -->
            <div class="flex-1 min-w-0">
              <h3 v-if="title" class="font-medium text-foreground mb-1" :class="titleClass">
                {{ title }}
              </h3>
              <p v-if="message" class="text-sm text-muted-foreground" :class="messageClass">
                {{ message }}
              </p>

              <!-- Progress indicator -->
              <div v-if="showProgress && (progress !== undefined || isIndeterminate)" class="mt-3">
                <div class="flex items-center justify-between mb-1">
                  <span class="text-xs text-muted-foreground">
                    {{ progressLabel }}
                  </span>
                  <span
                    v-if="!isIndeterminate && progress !== undefined"
                    class="text-xs text-muted-foreground"
                  >
                    {{ Math.round(progress) }}%
                  </span>
                </div>
                <div class="w-full bg-secondary rounded-full h-1.5">
                  <div
                    class="bg-primary h-1.5 rounded-full transition-all duration-300"
                    :class="{ 'animate-pulse': isIndeterminate }"
                    :style="{
                      width: isIndeterminate ? '100%' : `${progress || 0}%`,
                    }"
                  />
                </div>
              </div>
            </div>
          </div>

          <!-- Actions -->
          <div v-if="showCancel || actions.length > 0" class="flex gap-2 mt-4 justify-end">
            <Button
              v-if="showCancel"
              variant="outline"
              size="sm"
              @click="handleCancel"
              :disabled="!cancellable"
            >
              {{ cancelText }}
            </Button>

            <Button
              v-for="action in actions"
              :key="action.label"
              :variant="action.variant || 'outline'"
              size="sm"
              @click="action.onClick"
              :disabled="action.disabled"
            >
              {{ action.label }}
            </Button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-vue-next'

interface Action {
  label: string
  onClick: () => void
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'
  disabled?: boolean
}

interface Props {
  isVisible: boolean
  title?: string
  message?: string
  progress?: number
  progressLabel?: string
  isIndeterminate?: boolean
  showProgress?: boolean
  showCancel?: boolean
  cancellable?: boolean
  cancelText?: string
  actions?: Action[]
  dismissible?: boolean
  variant?: 'default' | 'blur'
  size?: 'sm' | 'md' | 'lg'
  overlayClass?: string
  contentClass?: string
  titleClass?: string
  messageClass?: string
  spinnerClass?: string
}

interface Emits {
  (e: 'update:isVisible', value: boolean): void
  (e: 'cancel'): void
  (e: 'dismiss'): void
}

const props = withDefaults(defineProps<Props>(), {
  title: '',
  message: '',
  progress: undefined,
  progressLabel: 'Progress',
  isIndeterminate: false,
  showProgress: false,
  showCancel: false,
  cancellable: true,
  cancelText: 'Cancel',
  actions: () => [],
  dismissible: false,
  variant: 'default',
  size: 'md',
  overlayClass: '',
  contentClass: '',
  titleClass: '',
  messageClass: '',
  spinnerClass: '',
})

const emit = defineEmits<Emits>()

const overlayClass = computed(() => {
  const baseClass =
    props.variant === 'blur' ? 'bg-background/80 backdrop-blur-sm' : 'bg-background/50'

  return [baseClass, props.overlayClass].filter(Boolean).join(' ')
})

const spinnerClass = computed(() => {
  const sizeClass = {
    sm: 'w-5 h-5',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  }[props.size]

  return [sizeClass, 'text-primary', props.spinnerClass].filter(Boolean).join(' ')
})

const handleOverlayClick = () => {
  if (props.dismissible) {
    emit('dismiss')
    emit('update:isVisible', false)
  }
}

const handleCancel = () => {
  emit('cancel')
  emit('update:isVisible', false)
}
</script>
