<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8">
      <div class="text-center">
        <h2 class="mt-6 text-3xl font-extrabold text-gray-900">Sign in to your account</h2>
        <p class="mt-2 text-sm text-gray-600">
          Or
          <RouterLink
            to="/register"
            class="font-medium text-blue-600 hover:text-blue-500 transition-colors"
          >
            create a new account
          </RouterLink>
        </p>
      </div>

      <div class="bg-white py-8 px-6 shadow rounded-lg">
        <LoginForm />
      </div>

      <div class="text-center">
        <RouterLink to="/" class="text-sm text-gray-600 hover:text-gray-900 transition-colors">
          ← Back to home
        </RouterLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { RouterLink } from 'vue-router'
import LoginForm from '@/components/auth/LoginForm.vue'
</script>
