<template>
  <div class="w-full" :class="containerClass">
    <!-- Progress Header -->
    <div v-if="showHeader" class="flex items-center justify-between mb-2">
      <h3 v-if="title" class="text-sm font-medium text-foreground">
        {{ title }}
      </h3>
      <span v-if="showPercentage" class="text-sm text-muted-foreground">
        {{ Math.round(percentage) }}%
      </span>
    </div>

    <!-- Progress Bar -->
    <div class="relative">
      <div class="w-full bg-secondary rounded-full overflow-hidden" :class="barHeightClass">
        <div
          class="h-full transition-all duration-300 ease-out rounded-full"
          :class="[barColorClass, { 'animate-pulse': isIndeterminate }]"
          :style="{ width: isIndeterminate ? '100%' : `${percentage}%` }"
        >
          <!-- Animated stripe for indeterminate progress -->
          <div
            v-if="isIndeterminate"
            class="h-full w-full bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer"
          />
        </div>
      </div>

      <!-- Step indicators for stepped progress -->
      <div v-if="steps && steps.length > 0" class="flex justify-between mt-3">
        <div
          v-for="(step, index) in steps"
          :key="index"
          class="flex flex-col items-center"
          :class="{ 'flex-1': index < steps.length - 1 }"
        >
          <!-- Step circle -->
          <div
            class="w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium border-2 transition-colors duration-200"
            :class="getStepClasses(index)"
          >
            <Check v-if="index < currentStep" class="w-3 h-3" />
            <Loader2 v-else-if="index === currentStep && isLoading" class="w-3 h-3 animate-spin" />
            <span v-else>{{ index + 1 }}</span>
          </div>

          <!-- Step label -->
          <span
            class="mt-1 text-xs text-center max-w-20 leading-tight"
            :class="getStepLabelClasses(index)"
          >
            {{ step.label }}
          </span>

          <!-- Step description -->
          <span
            v-if="step.description && index === currentStep"
            class="mt-1 text-xs text-muted-foreground text-center max-w-24 leading-tight"
          >
            {{ step.description }}
          </span>
        </div>
      </div>
    </div>

    <!-- Status message -->
    <div v-if="statusMessage" class="mt-2 flex items-center gap-2">
      <Loader2 v-if="isLoading" class="w-4 h-4 animate-spin text-primary" />
      <CheckCircle v-else-if="isComplete" class="w-4 h-4 text-green-600" />
      <AlertCircle v-else-if="hasError" class="w-4 h-4 text-red-600" />
      <span class="text-sm" :class="getStatusMessageClass()">
        {{ statusMessage }}
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Check, Loader2, CheckCircle, AlertCircle } from 'lucide-vue-next'

interface Step {
  label: string
  description?: string
}

interface Props {
  percentage?: number
  currentStep?: number
  steps?: Step[]
  title?: string
  statusMessage?: string
  isLoading?: boolean
  isComplete?: boolean
  hasError?: boolean
  isIndeterminate?: boolean
  showHeader?: boolean
  showPercentage?: boolean
  variant?: 'default' | 'success' | 'warning' | 'error'
  size?: 'sm' | 'md' | 'lg'
  containerClass?: string
}

const props = withDefaults(defineProps<Props>(), {
  percentage: 0,
  currentStep: 0,
  steps: () => [],
  title: '',
  statusMessage: '',
  isLoading: false,
  isComplete: false,
  hasError: false,
  isIndeterminate: false,
  showHeader: true,
  showPercentage: true,
  variant: 'default',
  size: 'md',
  containerClass: '',
})

const barHeightClass = computed(() => {
  switch (props.size) {
    case 'sm':
      return 'h-1'
    case 'lg':
      return 'h-3'
    default:
      return 'h-2'
  }
})

const barColorClass = computed(() => {
  if (props.hasError) {
    return 'bg-red-600'
  }
  if (props.isComplete) {
    return 'bg-green-600'
  }

  switch (props.variant) {
    case 'success':
      return 'bg-green-600'
    case 'warning':
      return 'bg-yellow-600'
    case 'error':
      return 'bg-red-600'
    default:
      return 'bg-primary'
  }
})

const getStepClasses = (index: number) => {
  if (index < props.currentStep) {
    // Completed step
    return 'bg-green-600 border-green-600 text-white'
  } else if (index === props.currentStep) {
    // Current step
    if (props.hasError) {
      return 'bg-red-600 border-red-600 text-white'
    }
    return 'bg-primary border-primary text-primary-foreground'
  } else {
    // Future step
    return 'bg-background border-border text-muted-foreground'
  }
}

const getStepLabelClasses = (index: number) => {
  if (index < props.currentStep) {
    return 'text-green-600 font-medium'
  } else if (index === props.currentStep) {
    if (props.hasError) {
      return 'text-red-600 font-medium'
    }
    return 'text-primary font-medium'
  } else {
    return 'text-muted-foreground'
  }
}

const getStatusMessageClass = () => {
  if (props.hasError) {
    return 'text-red-600'
  }
  if (props.isComplete) {
    return 'text-green-600'
  }
  return 'text-muted-foreground'
}
</script>

<style scoped>
@keyframes shimmer {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(100%);
  }
}

.animate-shimmer {
  animation: shimmer 2s infinite;
}
</style>
