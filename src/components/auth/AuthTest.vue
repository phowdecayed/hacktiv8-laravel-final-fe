<template>
  <div class="max-w-md mx-auto p-6 space-y-8">
    <div class="text-center">
      <h1 class="text-2xl font-bold">Authentication Test</h1>
      <p class="text-gray-600">Test the login and register forms</p>
    </div>

    <div class="space-y-4">
      <Button @click="showLogin = !showLogin" variant="outline" class="w-full">
        {{ showLogin ? 'Hide' : 'Show' }} Login Form
      </Button>

      <Button @click="showRegister = !showRegister" variant="outline" class="w-full">
        {{ showRegister ? 'Hide' : 'Show' }} Register Form
      </Button>
    </div>

    <div v-if="showLogin" class="border rounded-lg p-4">
      <h2 class="text-lg font-semibold mb-4">Login Form</h2>
      <LoginForm @success="onSuccess" @error="onError" />
    </div>

    <div v-if="showRegister" class="border rounded-lg p-4">
      <h2 class="text-lg font-semibold mb-4">Register Form</h2>
      <RegisterForm @success="onSuccess" @error="onError" />
    </div>

    <div v-if="user" class="border rounded-lg p-4 bg-green-50">
      <h3 class="font-semibold text-green-800">Authenticated User:</h3>
      <pre class="text-sm text-green-700">{{ JSON.stringify(user, null, 2) }}</pre>
      <Button @click="handleLogout" variant="destructive" class="mt-2"> Logout </Button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Button } from '@/components/ui/button'
import LoginForm from './LoginForm.vue'
import RegisterForm from './RegisterForm.vue'
import { useAuth } from '@/composables/useAuth'

const { user, logout } = useAuth()
const showLogin = ref(false)
const showRegister = ref(false)

const onSuccess = () => {
  showLogin.value = false
  showRegister.value = false
}

const onError = (error: any) => {
  console.error('Auth error:', error)
}

const handleLogout = async () => {
  await logout()
}
</script>
