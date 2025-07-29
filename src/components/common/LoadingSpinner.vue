<template>
  <div class="flex items-center justify-center" :class="containerClass">
    <div class="flex items-center gap-2">
      <Loader2 class="animate-spin" :class="spinnerClass" />
      <span v-if="message" class="text-sm" :class="textClass">
        {{ message }}
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Loader2 } from 'lucide-vue-next'

interface Props {
  message?: string
  size?: 'sm' | 'md' | 'lg'
  variant?: 'default' | 'muted' | 'primary'
  containerClass?: string
  spinnerClass?: string
  textClass?: string
}

const props = withDefaults(defineProps<Props>(), {
  message: '',
  size: 'md',
  variant: 'default',
  containerClass: '',
  spinnerClass: '',
  textClass: '',
})

const sizeClasses = {
  sm: 'w-4 h-4',
  md: 'w-6 h-6',
  lg: 'w-8 h-8',
}

const variantClasses = {
  default: 'text-foreground',
  muted: 'text-muted-foreground',
  primary: 'text-primary',
}

const computedSpinnerClass = [
  sizeClasses[props.size],
  variantClasses[props.variant],
  props.spinnerClass,
]
  .filter(Boolean)
  .join(' ')

const computedTextClass = [variantClasses[props.variant], props.textClass].filter(Boolean).join(' ')
</script>

<style scoped>
/* Additional spinner animation for smoother rotation */
.animate-spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>
