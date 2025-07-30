<template>
  <form @submit="handleSubmit" class="space-y-6">
    <div v-for="field in visibleFields" :key="field.name" class="space-y-2">
      <!-- Field Label -->
      <Label
        v-if="field.label"
        :for="field.name"
        :class="field.required ? 'after:content-[\'*\'] after:text-destructive after:ml-1' : ''"
      >
        {{ field.label }}
      </Label>

      <!-- Field Description -->
      <p v-if="field.description" class="text-sm text-muted-foreground">
        {{ field.description }}
      </p>

      <!-- Input Field -->
      <div v-if="field.type === 'input'" class="space-y-1">
        <Input
          :id="field.name"
          v-model="formData[field.name]"
          :type="field.inputType || 'text'"
          :placeholder="field.placeholder"
          :disabled="field.disabled || loading"
          :class="errors[field.name] ? 'border-destructive' : ''"
        />
      </div>

      <!-- Textarea Field -->
      <div v-else-if="field.type === 'textarea'" class="space-y-1">
        <Textarea
          :id="field.name"
          v-model="formData[field.name]"
          :placeholder="field.placeholder"
          :disabled="field.disabled || loading"
          :rows="field.rows || 3"
          :class="errors[field.name] ? 'border-destructive' : ''"
        />
      </div>

      <!-- Select Field -->
      <div v-else-if="field.type === 'select'" class="space-y-1">
        <Select v-model="formData[field.name]" :disabled="field.disabled || loading">
          <SelectTrigger :class="errors[field.name] ? 'border-destructive' : ''">
            <SelectValue :placeholder="field.placeholder || 'Select an option'" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem v-for="option in field.options" :key="option.value" :value="option.value">
              {{ option.label }}
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      <!-- Multi-Select Field -->
      <div v-else-if="field.type === 'multiselect'" class="space-y-1">
        <div class="flex flex-wrap gap-2 mb-2">
          <Badge
            v-for="selectedValue in formData[field.name] || []"
            :key="selectedValue"
            variant="secondary"
            class="cursor-pointer"
            @click="removeMultiSelectValue(field.name, selectedValue)"
          >
            {{ getOptionLabel(field.options, selectedValue) }}
            <X class="ml-1 h-3 w-3" />
          </Badge>
        </div>
        <Select
          :model-value="''"
          @update:model-value="
            (value: any) => value && addMultiSelectValue(field.name, String(value))
          "
          :disabled="field.disabled || loading"
        >
          <SelectTrigger :class="errors[field.name] ? 'border-destructive' : ''">
            <SelectValue :placeholder="field.placeholder || 'Select options'" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem
              v-for="option in getAvailableOptions(field)"
              :key="option.value"
              :value="option.value"
            >
              {{ option.label }}
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      <!-- Checkbox Field -->
      <div v-else-if="field.type === 'checkbox'" class="flex items-center space-x-2">
        <Checkbox
          :id="field.name"
          v-model:checked="formData[field.name]"
          :disabled="field.disabled || loading"
        />
        <Label :for="field.name" class="text-sm font-normal cursor-pointer">
          {{ field.checkboxLabel || field.label }}
        </Label>
      </div>

      <!-- Radio Group Field -->
      <div v-else-if="field.type === 'radio'" class="space-y-2">
        <RadioGroup v-model="formData[field.name]" :disabled="field.disabled || loading">
          <div
            v-for="option in field.options"
            :key="option.value"
            class="flex items-center space-x-2"
          >
            <RadioGroupItem :value="option.value" :id="`${field.name}-${option.value}`" />
            <Label :for="`${field.name}-${option.value}`" class="font-normal">
              {{ option.label }}
            </Label>
          </div>
        </RadioGroup>
      </div>

      <!-- Switch Field -->
      <div v-else-if="field.type === 'switch'" class="flex items-center space-x-2">
        <Switch
          :id="field.name"
          v-model:checked="formData[field.name]"
          :disabled="field.disabled || loading"
        />
        <Label :for="field.name" class="text-sm font-normal cursor-pointer">
          {{ field.switchLabel || field.label }}
        </Label>
      </div>

      <!-- Number Field -->
      <div v-else-if="field.type === 'number'" class="space-y-1">
        <NumberField
          v-model="formData[field.name]"
          :min="field.min"
          :max="field.max"
          :step="field.step"
          :disabled="field.disabled || loading"
        >
          <NumberFieldContent>
            <NumberFieldDecrement />
            <NumberFieldInput
              :placeholder="field.placeholder"
              :class="errors[field.name] ? 'border-destructive' : ''"
            />
            <NumberFieldIncrement />
          </NumberFieldContent>
        </NumberField>
      </div>

      <!-- Date Field -->
      <div v-else-if="field.type === 'date'" class="space-y-1">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              :class="[
                'w-full justify-start text-left font-normal',
                !formData[field.name] && 'text-muted-foreground',
                errors[field.name] ? 'border-destructive' : '',
              ]"
              :disabled="field.disabled || loading"
            >
              <CalendarIcon class="mr-2 h-4 w-4" />
              {{
                formData[field.name]
                  ? formatDate(formData[field.name])
                  : field.placeholder || 'Pick a date'
              }}
            </Button>
          </PopoverTrigger>
          <PopoverContent class="w-auto p-0" align="start">
            <Calendar v-model="formData[field.name]" :disabled="field.disabled || loading" />
          </PopoverContent>
        </Popover>
      </div>

      <!-- File Upload Field -->
      <div v-else-if="field.type === 'file'" class="space-y-1">
        <slot
          :name="`field-${field.name}`"
          :field="field"
          :value="formData[field.name]"
          :error="errors[field.name]"
          :update-value="(value: any) => updateFieldValue(field.name, value)"
        >
          <div
            class="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center hover:border-muted-foreground/50 transition-colors"
            :class="errors[field.name] ? 'border-destructive' : ''"
          >
            <Upload class="mx-auto h-8 w-8 text-muted-foreground mb-2" />
            <p class="text-sm text-muted-foreground">
              {{ field.placeholder || 'Click to upload or drag and drop' }}
            </p>
            <input
              :id="field.name"
              type="file"
              :multiple="field.multiple"
              :accept="field.accept"
              :disabled="field.disabled || loading"
              class="hidden"
              @change="handleFileChange(field.name, $event)"
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              class="mt-2"
              :disabled="field.disabled || loading"
              @click="openFileDialog"
            >
              Choose Files
            </Button>
          </div>
        </slot>
      </div>

      <!-- Custom Field Slot -->
      <div v-else-if="field.type === 'custom'">
        <slot
          :name="`field-${field.name}`"
          :field="field"
          :value="formData[field.name]"
          :error="errors[field.name]"
          :update-value="(value: any) => updateFieldValue(field.name, value)"
        />
      </div>

      <!-- Field Error -->
      <p v-if="errors[field.name]" class="text-sm text-destructive">
        {{ errors[field.name] }}
      </p>
    </div>

    <!-- Form Actions -->
    <div class="flex items-center justify-end space-x-2 pt-4 border-t">
      <Button
        v-if="showCancel"
        type="button"
        variant="outline"
        @click="handleCancel"
        :disabled="loading"
      >
        {{ cancelLabel }}
      </Button>
      <Button type="submit" :disabled="loading || !isFormValid" :class="submitButtonClass">
        <Loader2 v-if="loading" class="mr-2 h-4 w-4 animate-spin" />
        {{ loading ? loadingLabel : submitLabel }}
      </Button>
    </div>
  </form>
</template>

<script setup lang="ts">
import { computed, reactive, watch } from 'vue'
import { format } from 'date-fns'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import {
  NumberField,
  NumberFieldContent,
  NumberFieldDecrement,
  NumberFieldIncrement,
  NumberFieldInput,
} from '@/components/ui/number-field'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { CalendarIcon, Upload, X, Loader2 } from 'lucide-vue-next'

export interface FormFieldOption {
  label: string
  value: string | number
}

export interface FormField {
  name: string
  type:
    | 'input'
    | 'textarea'
    | 'select'
    | 'multiselect'
    | 'checkbox'
    | 'radio'
    | 'switch'
    | 'number'
    | 'date'
    | 'file'
    | 'custom'
  label?: string
  description?: string
  placeholder?: string
  required?: boolean
  disabled?: boolean

  // Input specific
  inputType?: 'text' | 'email' | 'password' | 'url' | 'tel'

  // Textarea specific
  rows?: number

  // Select/Radio specific
  options?: FormFieldOption[]

  // Checkbox/Switch specific
  checkboxLabel?: string
  switchLabel?: string

  // Number specific
  min?: number
  max?: number
  step?: number

  // File specific
  multiple?: boolean
  accept?: string

  // Conditional rendering
  condition?: (formData: Record<string, any>) => boolean
}

export interface FormSchema {
  fields: FormField[]
}

interface Props {
  schema: FormSchema
  initialValues?: Record<string, any>
  loading?: boolean
  showCancel?: boolean
  submitLabel?: string
  cancelLabel?: string
  loadingLabel?: string
  submitButtonClass?: string
}

const props = withDefaults(defineProps<Props>(), {
  initialValues: () => ({}),
  loading: false,
  showCancel: true,
  submitLabel: 'Submit',
  cancelLabel: 'Cancel',
  loadingLabel: 'Submitting...',
  submitButtonClass: '',
})

const emit = defineEmits<{
  submit: [data: Record<string, any>]
  cancel: []
  change: [{ field: string; value: any; formData: Record<string, any> }]
}>()

// Form state
const formData = reactive<Record<string, any>>({ ...props.initialValues })
const errors = reactive<Record<string, string>>({})

// Computed properties
const visibleFields = computed(() =>
  props.schema.fields.filter((field) => !field.condition || field.condition(formData)),
)

const isFormValid = computed(() => {
  const requiredFields = visibleFields.value.filter((field) => field.required)
  return requiredFields.every((field) => {
    const value = formData[field.name]
    return value !== null && value !== undefined && value !== ''
  })
})

// Methods
const updateFieldValue = (fieldName: string, value: any) => {
  formData[fieldName] = value
  emit('change', { field: fieldName, value, formData: { ...formData } })
}

const addMultiSelectValue = (fieldName: string, value: string) => {
  if (!formData[fieldName]) {
    formData[fieldName] = []
  }
  if (!formData[fieldName].includes(value)) {
    formData[fieldName].push(value)
    emit('change', { field: fieldName, value: formData[fieldName], formData: { ...formData } })
  }
}

const removeMultiSelectValue = (fieldName: string, value: string) => {
  if (formData[fieldName]) {
    const index = formData[fieldName].indexOf(value)
    if (index > -1) {
      formData[fieldName].splice(index, 1)
      emit('change', { field: fieldName, value: formData[fieldName], formData: { ...formData } })
    }
  }
}

const getOptionLabel = (options: FormFieldOption[] = [], value: string | number): string => {
  const option = options.find((opt) => opt.value === value)
  return option?.label || String(value)
}

const getAvailableOptions = (field: FormField): FormFieldOption[] => {
  if (!field.options) return []
  const selectedValues = formData[field.name] || []
  return field.options.filter((option) => !selectedValues.includes(option.value))
}

const openFileDialog = () => {
  // This would be handled by the parent component or custom slot
}

const handleFileChange = (fieldName: string, event: Event) => {
  const target = event.target as HTMLInputElement
  const files = target.files
  if (files) {
    const fileArray = Array.from(files)
    updateFieldValue(fieldName, fileArray)
  }
}

const formatDate = (date: Date): string => {
  return format(date, 'PPP')
}

const handleSubmit = (event: Event) => {
  event.preventDefault()

  // Clear previous errors
  Object.keys(errors).forEach((key) => {
    delete errors[key]
  })

  // Validate required fields
  let hasErrors = false
  visibleFields.value.forEach((field) => {
    if (field.required) {
      const value = formData[field.name]
      if (value === null || value === undefined || value === '') {
        errors[field.name] = `${field.label || field.name} is required`
        hasErrors = true
      }
    }
  })

  if (!hasErrors) {
    emit('submit', { ...formData })
  }
}

const handleCancel = () => {
  emit('cancel')
}

// Watch for initial values changes
watch(
  () => props.initialValues,
  (newValues) => {
    Object.assign(formData, newValues)
  },
  { deep: true },
)
</script>
