<template>
  <div class="container mx-auto p-4 sm:p-6 lg:p-8">
    <h1 class="text-3xl font-bold mb-6">My Profile</h1>

    <div v-if="isLoading" class="flex justify-center items-center h-64">
      <LoadingSpinner />
    </div>

    <div
      v-if="error"
      class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
      role="alert"
    >
      <strong class="font-bold">Error:</strong>
      <span class="block sm:inline">{{ error }}</span>
    </div>

    <div v-if="user" class="grid grid-cols-1 md:grid-cols-3 gap-8">
      <!-- Profile Card -->
      <div class="md:col-span-1">
        <div class="bg-white shadow-md rounded-lg p-6">
          <div class="flex flex-col items-center">
            <img
              class="w-24 h-24 rounded-full mb-4"
              :src="`https://i.pravatar.cc/150?u=${user.email}`"
              alt="User Avatar"
            />
            <h2 class="text-xl font-semibold">{{ user.name }}</h2>
            <p class="text-gray-500">{{ user.email }}</p>
            <span
              class="mt-2 px-3 py-1 text-sm font-semibold rounded-full"
              :class="roleClass(user.role)"
            >
              {{ user.role }}
            </span>
          </div>
          <div class="mt-6 text-sm text-gray-600">
            <p><strong>Joined:</strong> {{ formatDate(user.created_at) }}</p>
            <p>
              <strong>Email Verified:</strong>
              {{ user.email_verified_at ? formatDate(user.email_verified_at) : 'No' }}
            </p>
          </div>
        </div>
      </div>

      <!-- Profile Forms with Tabs -->
      <div class="md:col-span-2">
        <Tabs default-value="profile" class="bg-white shadow-md rounded-lg p-6">
          <TabsList>
            <TabsTrigger value="profile"> Update Profile </TabsTrigger>
            <TabsTrigger value="password"> Change Password </TabsTrigger>
          </TabsList>
          <TabsContent value="profile">
            <form @submit.prevent="handleUpdateProfile" class="mt-4">
              <div class="mb-4">
                <label for="name" class="block text-sm font-medium text-gray-700">Name</label>
                <input
                  type="text"
                  id="name"
                  v-model="profileData.name"
                  class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
              <div class="mb-4">
                <label for="email" class="block text-sm font-medium text-gray-700">Email</label>
                <input
                  type="email"
                  id="email"
                  v-model="profileData.email"
                  class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  disabled
                />
              </div>
              <button
                type="submit"
                :disabled="isUpdating"
                class="w-full inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
              >
                <LoadingSpinner v-if="isUpdating" class="mr-2" />
                {{ isUpdating ? 'Updating...' : 'Update Profile' }}
              </button>
            </form>
          </TabsContent>
          <TabsContent value="password">
            <form @submit.prevent="handleChangePassword" class="mt-4">
              <div class="mb-4">
                <label for="current_password" class="block text-sm font-medium text-gray-700"
                  >Current Password</label
                >
                <input
                  type="password"
                  id="current_password"
                  v-model="passwordData.current_password"
                  class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
              <div class="mb-4">
                <label for="new_password" class="block text-sm font-medium text-gray-700"
                  >New Password</label
                >
                <input
                  type="password"
                  id="new_password"
                  v-model="passwordData.new_password"
                  class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
              <div class="mb-4">
                <label
                  for="new_password_confirmation"
                  class="block text-sm font-medium text-gray-700"
                  >Confirm New Password</label
                >
                <input
                  type="password"
                  id="new_password_confirmation"
                  v-model="passwordData.new_password_confirmation"
                  class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
              <button
                type="submit"
                :disabled="isChangingPassword"
                class="w-full inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-gray-600 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50"
              >
                <LoadingSpinner v-if="isChangingPassword" class="mr-2" />
                {{ isChangingPassword ? 'Changing...' : 'Change Password' }}
              </button>
            </form>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive } from 'vue'
import { useAuthStore } from '@/stores/auth'
import type { User, UserRole } from '@/types/user'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

const authStore = useAuthStore()
const user = ref<User | null>(null)
const isLoading = ref(true)
const error = ref<string | null>(null)
const isUpdating = ref(false)
const isChangingPassword = ref(false)

const profileData = reactive({
  name: '',
  email: '',
})

const passwordData = reactive({
  current_password: '',
  new_password: '',
  new_password_confirmation: '',
})

onMounted(async () => {
  isLoading.value = true
  error.value = null
  try {
    // Ensure user data is loaded from the store
    if (!authStore.user) {
      await authStore.checkAuth()
    }
    user.value = authStore.user
    if (user.value) {
      profileData.name = user.value.name
      profileData.email = user.value.email
    }
  } catch (err: any) {
    error.value = err.message || 'Failed to fetch user profile.'
  } finally {
    isLoading.value = false
  }
})

const handleUpdateProfile = async () => {
  isUpdating.value = true
  error.value = null
  try {
    await authStore.updateProfile({ name: profileData.name })
    // Optionally show a success message
    alert('Profile updated successfully!')
  } catch (err: any) {
    error.value = err.message || 'Failed to update profile.'
  } finally {
    isUpdating.value = false
  }
}

const handleChangePassword = async () => {
  isChangingPassword.value = true
  error.value = null
  try {
    await authStore.changePassword(passwordData)
    // Optionally show a success message
    alert('Password changed successfully!')
    // Clear password fields
    passwordData.current_password = ''
    passwordData.new_password = ''
    passwordData.new_password_confirmation = ''
  } catch (err: any) {
    error.value = err.message || 'Failed to change password.'
  } finally {
    isChangingPassword.value = false
  }
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

const roleClass = (role: UserRole | undefined) => {
  if (!role) return 'bg-gray-200 text-gray-800'
  switch (role) {
    case 'admin':
      return 'bg-red-200 text-red-800'
    case 'editor':
      return 'bg-yellow-200 text-yellow-800'
    case 'moderator':
      return 'bg-blue-200 text-blue-800'
    case 'customer':
      return 'bg-green-200 text-green-800'
    default:
      return 'bg-gray-200 text-gray-800'
  }
}
</script>
