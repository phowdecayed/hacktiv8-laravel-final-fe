<template>
  <form @submit="onSubmit" class="space-y-6">
    <div class="space-y-4">
      <FormField v-slot="{ componentField }" name="name">
        <FormItem>
          <FormLabel>Full Name</FormLabel>
          <FormControl>
            <Input
              type="text"
              placeholder="Enter your full name"
              v-bind="componentField"
              :disabled="isLoading"
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      </FormField>

      <FormField v-slot="{ componentField }" name="email">
        <FormItem>
          <FormLabel>Email</FormLabel>
          <FormControl>
            <Input
              type="email"
              placeholder="Enter your email"
              v-bind="componentField"
              :disabled="isLoading"
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      </FormField>

      <FormField v-slot="{ componentField }" name="password">
        <FormItem>
          <FormLabel>Password</FormLabel>
          <FormControl>
            <Input
              type="password"
              placeholder="Enter your password"
              v-bind="componentField"
              :disabled="isLoading"
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      </FormField>

      <FormField v-slot="{ componentField }" name="password_confirmation">
        <FormItem>
          <FormLabel>Confirm Password</FormLabel>
          <FormControl>
            <Input
              type="password"
              placeholder="Confirm your password"
              v-bind="componentField"
              :disabled="isLoading"
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      </FormField>
    </div>

    <Button type="submit" class="w-full" :disabled="isLoading">
      <template v-if="isLoading">
        <div
          class="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
        />
        Creating account...
      </template>
      <template v-else> Create Account </template>
    </Button>

    <div v-if="error || hasError" class="text-sm text-red-600 text-center">
      {{ error || authError?.message || 'Registration failed. Please try again.' }}
    </div>
  </form>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { useAuth } from '@/composables/useAuth'
import { registerSchema, type RegisterFormData } from '@/lib/validationSchemas'
import type { RegisterData } from '@/types/api'

interface Props {
  redirectTo?: string
}

const props = withDefaults(defineProps<Props>(), {
  redirectTo: undefined,
})

const emit = defineEmits<{
  success: []
  error: [error: any]
}>()

const { register, isLoading, hasError, error: authError, clearError } = useAuth()
const error = ref<string>('')

const validationSchema = toTypedSchema(registerSchema)

const form = useForm({
  validationSchema,
})

const onSubmit = form.handleSubmit(async (values: RegisterFormData) => {
  error.value = ''
  clearError()

  try {
    await register(values as RegisterData, props.redirectTo)
    emit('success')
  } catch (err: any) {
    error.value = err.message || 'Registration failed. Please try again.'
    emit('error', err)
  }
})
</script>
