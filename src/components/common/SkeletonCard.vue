<template>
  <div class="space-y-3">
    <!-- Image Skeleton -->
    <Skeleton
      :class="[
        'w-full rounded-lg',
        variant === 'product' ? 'aspect-square' : 'h-48',
        variant === 'list' ? 'w-48 h-48 flex-shrink-0' : '',
      ]"
    />

    <!-- Content Skeleton -->
    <div class="space-y-2">
      <!-- Title -->
      <Skeleton class="h-4 w-3/4" />

      <!-- Description (only for certain variants) -->
      <Skeleton v-if="variant === 'article' || variant === 'list'" class="h-3 w-full" />
      <Skeleton v-if="variant === 'article' || variant === 'list'" class="h-3 w-2/3" />

      <!-- Price/Meta info -->
      <div class="flex items-center justify-between">
        <Skeleton class="h-5 w-1/3" />
        <Skeleton v-if="variant === 'product'" class="h-4 w-16" />
      </div>

      <!-- Actions -->
      <div v-if="showActions" class="flex gap-2 mt-3">
        <Skeleton class="h-9 flex-1" />
        <Skeleton v-if="variant === 'product'" class="h-9 w-9" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Skeleton } from '@/components/ui/skeleton'

interface Props {
  variant?: 'product' | 'article' | 'list' | 'card'
  showActions?: boolean
}

withDefaults(defineProps<Props>(), {
  variant: 'card',
  showActions: true,
})
</script>
