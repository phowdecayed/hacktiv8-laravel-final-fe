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

const { register, isLoading } = useAuth()
const error = ref<string>('')

const registerSchema = toTypedSchema(
  z
    .object({
      name: z
        .string()
        .min(1, 'Name is required')
        .min(2, 'Name must be at least 2 characters')
        .max(255, 'Name must not exceed 255 characters'),
      email: z
        .string()
        .min(1, 'Email is required')
        .email('Please enter a valid email address')
        .max(255, 'Email must not exceed 255 characters'),
      password: z
        .string()
        .min(1, 'Password is required')
        .min(8, 'Password must be at least 8 characters')
        .max(255, 'Password must not exceed 255 characters'),
      password_confirmation: z.string().min(1, 'Password confirmation is required'),
    })
    .refine((data) => data.password === data.password_confirmation, {
      message: "Passwords don't match",
      path: ['password_confirmation'],
    }),
)

const form = useForm({
  validationSchema: registerSchema,
})

const onSubmit = form.handleSubmit(async (values: RegisterData) => {
  error.value = ''

  try {
    await register(values, props.redirectTo)
    emit('success')
  } catch (err: any) {
    error.value = err.message || 'Registration failed. Please try again.'
    emit('error', err)
  }
})
</script>
