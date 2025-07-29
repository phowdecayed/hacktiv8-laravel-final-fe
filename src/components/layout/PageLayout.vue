<template>
  <div class="space-y-6">
    <!-- Breadcrumbs -->
    <AppBreadcrumb v-if="showBreadcrumbs" :items="breadcrumbItems" />

    <!-- Page Header -->
    <div v-if="title || $slots.header" class="space-y-2">
      <div v-if="title" class="flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-bold tracking-tight">{{ title }}</h1>
          <p v-if="description" class="text-muted-foreground mt-2">
            {{ description }}
          </p>
        </div>
        <div v-if="$slots.actions" class="flex items-center gap-2">
          <slot name="actions" />
        </div>
      </div>
      <slot name="header" />
    </div>

    <!-- Page Content -->
    <div class="space-y-6">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
import AppBreadcrumb from './AppBreadcrumb.vue'

interface BreadcrumbItem {
  label: string
  path: string
}

interface Props {
  title?: string
  description?: string
  showBreadcrumbs?: boolean
  breadcrumbItems?: BreadcrumbItem[]
}

withDefaults(defineProps<Props>(), {
  showBreadcrumbs: true,
})
</script>
