<template>
  <form @submit="onSubmit" class="space-y-6">
    <div class="space-y-4">
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
    </div>

    <Button type="submit" class="w-full" :disabled="isLoading">
      <template v-if="isLoading">
        <div
          class="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
        />
        Signing in...
      </template>
      <template v-else> Sign In </template>
    </Button>

    <div v-if="error" class="text-sm text-red-600 text-center">
      {{ error }}
    </div>
  </form>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { useAuth } from '@/composables/useAuth'
import type { LoginCredentials } from '@/types/api'

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

const { login, isLoading } = useAuth()
const error = ref<string>('')

const loginSchema = toTypedSchema(
  z.object({
    email: z.string().min(1, 'Email is required').email('Please enter a valid email address'),
    password: z
      .string()
      .min(1, 'Password is required')
      .min(6, 'Password must be at least 6 characters'),
  }),
)

const form = useForm({
  validationSchema: loginSchema,
})

const onSubmit = form.handleSubmit(async (values: LoginCredentials) => {
  error.value = ''

  try {
    await login(values, props.redirectTo)
    emit('success')
  } catch (err: any) {
    error.value = err.message || 'Login failed. Please try again.'
    emit('error', err)
  }
})
</script>
