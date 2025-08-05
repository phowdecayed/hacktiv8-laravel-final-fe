<script setup lang="ts">
import { provide, computed } from 'vue'

const props = defineProps<{
  modelValue?: number
}>()

provide(
  'currentStep',
  computed(() => props.modelValue),
)
</script>
<template>
  <div class="flex w-full items-start gap-2">
    <slot />
  </div>
</template>
