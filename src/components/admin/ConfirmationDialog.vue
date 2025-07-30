<template>
  <AlertDialog v-model:open="isOpen">
    <AlertDialogContent>
      <AlertDialogHeader>
        <div class="flex items-center space-x-2">
          <component
            :is="iconComponent"
            :class="['h-6 w-6', variant === 'destructive' ? 'text-destructive' : 'text-primary']"
          />
          <AlertDialogTitle>{{ title }}</AlertDialogTitle>
        </div>
        <AlertDialogDescription v-if="description">
          {{ description }}
        </AlertDialogDescription>
      </AlertDialogHeader>

      <!-- Custom Content Slot -->
      <div v-if="$slots.default" class="py-4">
        <slot />
      </div>

      <!-- Details List -->
      <div v-if="details && details.length > 0" class="space-y-2">
        <h4 class="text-sm font-medium">Details:</h4>
        <ul class="text-sm text-muted-foreground space-y-1">
          <li v-for="detail in details" :key="detail" class="flex items-center space-x-2">
            <div class="w-1 h-1 bg-muted-foreground rounded-full"></div>
            <span>{{ detail }}</span>
          </li>
        </ul>
      </div>

      <!-- Warning Message -->
      <div
        v-if="variant === 'destructive' && showWarning"
        class="flex items-start space-x-2 p-3 bg-destructive/10 border border-destructive/20 rounded-md"
      >
        <AlertTriangle class="h-4 w-4 text-destructive mt-0.5 flex-shrink-0" />
        <div class="text-sm">
          <p class="font-medium text-destructive">Warning</p>
          <p class="text-destructive/80">
            {{ warningMessage || 'This action cannot be undone.' }}
          </p>
        </div>
      </div>

      <!-- Confirmation Input -->
      <div v-if="requireConfirmation" class="space-y-2">
        <Label :for="confirmationInputId">
          Type <strong>{{ confirmationText }}</strong> to confirm:
        </Label>
        <Input
          :id="confirmationInputId"
          v-model="confirmationInput"
          :placeholder="confirmationText"
          :disabled="loading"
          class="font-mono"
        />
      </div>

      <AlertDialogFooter>
        <AlertDialogCancel :disabled="loading" @click="handleCancel">
          {{ cancelLabel }}
        </AlertDialogCancel>
        <AlertDialogAction
          :disabled="loading || !isConfirmationValid"
          :class="[
            variant === 'destructive'
              ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90'
              : '',
          ]"
          @click="handleConfirm"
        >
          <Loader2 v-if="loading" class="mr-2 h-4 w-4 animate-spin" />
          {{ loading ? loadingLabel : confirmLabel }}
        </AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { AlertTriangle, Trash2, AlertCircle, Info, CheckCircle, Loader2 } from 'lucide-vue-next'

interface Props {
  open?: boolean
  title: string
  description?: string
  details?: string[]
  variant?: 'default' | 'destructive'
  icon?: 'warning' | 'danger' | 'info' | 'success' | 'delete'
  confirmLabel?: string
  cancelLabel?: string
  loadingLabel?: string
  loading?: boolean
  showWarning?: boolean
  warningMessage?: string
  requireConfirmation?: boolean
  confirmationText?: string
}

const props = withDefaults(defineProps<Props>(), {
  open: false,
  variant: 'default',
  icon: 'warning',
  confirmLabel: 'Confirm',
  cancelLabel: 'Cancel',
  loadingLabel: 'Processing...',
  loading: false,
  showWarning: true,
  requireConfirmation: false,
  confirmationText: 'DELETE',
})

const emit = defineEmits<{
  'update:open': [value: boolean]
  confirm: []
  cancel: []
}>()

// Local state
const isOpen = ref(props.open)
const confirmationInput = ref('')
const confirmationInputId = `confirmation-${Math.random().toString(36).substr(2, 9)}`

// Computed properties
const iconComponent = computed(() => {
  switch (props.icon) {
    case 'danger':
    case 'warning':
      return AlertTriangle
    case 'delete':
      return Trash2
    case 'info':
      return Info
    case 'success':
      return CheckCircle
    default:
      return AlertCircle
  }
})

const isConfirmationValid = computed(() => {
  if (!props.requireConfirmation) return true
  return confirmationInput.value === props.confirmationText
})

// Methods
const handleConfirm = () => {
  if (!isConfirmationValid.value) return
  emit('confirm')
}

const handleCancel = () => {
  emit('cancel')
  closeDialog()
}

const closeDialog = () => {
  isOpen.value = false
  confirmationInput.value = ''
}

// Watchers
watch(
  () => props.open,
  (newValue) => {
    isOpen.value = newValue
  },
)

watch(isOpen, (newValue) => {
  emit('update:open', newValue)
  if (!newValue) {
    confirmationInput.value = ''
  }
})

// Reset confirmation input when dialog opens
watch(
  () => props.open,
  (newValue) => {
    if (newValue) {
      confirmationInput.value = ''
    }
  },
)
</script>
