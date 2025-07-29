<template>
  <nav :class="navClass">
    <template v-for="item in items" :key="item.path">
      <RouterLink
        :to="item.path"
        :class="linkClass"
        active-class="text-primary"
        @click="handleLinkClick"
      >
        <component v-if="item.icon" :is="item.icon" class="h-4 w-4" />
        {{ item.label }}
      </RouterLink>
      <Separator v-if="item.separator" class="my-2" />
    </template>
  </nav>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import { Separator } from '@/components/ui/separator'
import type { Component } from 'vue'

interface NavigationItem {
  label: string
  path: string
  icon?: Component
  separator?: boolean
}

interface Props {
  items: NavigationItem[]
  orientation?: 'horizontal' | 'vertical'
  variant?: 'default' | 'mobile'
}

interface Emits {
  (e: 'link-click', path: string): void
}

const props = withDefaults(defineProps<Props>(), {
  orientation: 'horizontal',
  variant: 'default',
})

const emit = defineEmits<Emits>()

const navClass = computed(() => {
  const baseClass = 'flex'
  const orientationClass = props.orientation === 'vertical' ? 'flex-col' : 'items-center'
  const spacingClass = props.orientation === 'vertical' ? 'gap-4' : 'gap-6'

  return `${baseClass} ${orientationClass} ${spacingClass}`
})

const linkClass = computed(() => {
  const baseClass = 'text-sm font-medium transition-colors hover:text-primary'
  const variantClass = props.variant === 'mobile' ? 'flex items-center gap-2' : ''

  return `${baseClass} ${variantClass}`
})

const handleLinkClick = (event: Event) => {
  const target = event.currentTarget as HTMLAnchorElement
  const path = target.getAttribute('to') || ''
  emit('link-click', path)
}
</script>
