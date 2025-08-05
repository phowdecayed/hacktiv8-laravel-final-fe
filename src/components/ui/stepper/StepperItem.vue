<script setup lang="ts">
import { inject, computed } from 'vue'

const props = defineProps<{
  step: number
}>()

const currentStep = inject(
  'currentStep',
  computed(() => 0),
)

const state = computed(() => {
  if (props.step < currentStep.value) return 'completed'
  if (props.step === currentStep.value) return 'active'
  return 'inactive'
})
</script>
<template>
  <div :data-state="state" class="group relative flex w-full flex-col items-center justify-center">
    <slot :state="state" />
  </div>
</template>
