<template>
  <Teleport to="body">
    <div
      v-if="isVisible"
      class="fixed inset-0 z-[9999] flex items-center justify-center bg-background/80 backdrop-blur-sm"
      :class="{ 'animate-in fade-in-0': isVisible }"
    >
      <div class="flex flex-col items-center space-y-4">
        <div class="relative">
          <div
            class="w-12 h-12 border-4 border-muted rounded-full animate-spin border-t-primary"
          ></div>
        </div>
        <div class="text-center space-y-1">
          <p class="text-sm font-medium">{{ message }}</p>
          <p v-if="description" class="text-xs text-muted-foreground">{{ description }}</p>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
interface Props {
  isVisible: boolean
  message?: string
  description?: string
}

withDefaults(defineProps<Props>(), {
  message: 'Loading...',
  description: '',
})
</script>
