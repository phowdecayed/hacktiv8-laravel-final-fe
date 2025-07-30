<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Settings</h1>
        <p class="text-gray-600">Configure system settings and preferences</p>
      </div>
      <Button @click="saveSettings" :disabled="isSaving">
        <Save class="h-4 w-4 mr-2" :class="{ 'animate-spin': isSaving }" />
        {{ isSaving ? 'Saving...' : 'Save Changes' }}
      </Button>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- General Settings -->
      <Card class="lg:col-span-2">
        <CardHeader>
          <CardTitle class="text-lg">General Settings</CardTitle>
          <CardDescription>Configure basic system settings</CardDescription>
        </CardHeader>
        <CardContent class="space-y-6">
          <div class="space-y-4">
            <div>
              <Label for="site-name">Site Name</Label>
              <Input
                id="site-name"
                v-model="settings.siteName"
                placeholder="Enter site name"
              />
            </div>

            <div>
              <Label for="site-description">Site Description</Label>
              <Textarea
                id="site-description"
                v-model="settings.siteDescription"
                placeholder="Enter site description"
                rows="3"
              />
            </div>

            <div>
              <Label for="contact-email">Contact Email</Label>
              <Input
                id="contact-email"
                v-model="settings.contactEmail"
                type="email"
                placeholder="Enter contact email"
              />
            </div>

            <div>
              <Label for="timezone">Timezone</Label>
              <Select v-model="settings.timezone">
                <SelectTrigger>
                  <SelectValue placeholder="Select timezone" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="UTC">UTC</SelectItem>
                  <SelectItem value="America/New_York">Eastern Time (ET)</SelectItem>
                  <SelectItem value="America/Chicago">Central Time (CT)</SelectItem>
                  <SelectItem value="America/Denver">Mountain Time (MT)</SelectItem>
                  <SelectItem value="America/Los_Angeles">Pacific Time (PT)</SelectItem>
                  <SelectItem value="Europe/London">London (GMT)</SelectItem>
                  <SelectItem value="Europe/Paris">Paris (CET)</SelectItem>
                  <SelectItem value="Asia/Tokyo">Tokyo (JST)</SelectItem>
                  <SelectItem value="Asia/Shanghai">Shanghai (CST)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <!-- Appearance -->
      <Card>
        <CardHeader>
          <CardTitle class="text-lg">Appearance</CardTitle>
          <CardDescription>Customize the look and feel</CardDescription>
        </CardHeader>
        <CardContent class="space-y-6">
          <div class="space-y-4">
            <div>
              <Label>Theme</Label>
              <div class="grid grid-cols-2 gap-2 mt-2">
                <Button
                  variant="outline"
                  :class="{ 'border-2 border-blue-500': settings.theme === 'light' }"
                  @click="settings.theme = 'light'"
                >
                  <Sun class="h-4 w-4 mr-2" />
                  Light
                </Button>
                <Button
                  variant="outline"
                  :class="{ 'border-2 border-blue-500': settings.theme === 'dark' }"
                  @click="settings.theme = 'dark'"
                >
                  <Moon class="h-4 w-4 mr-2" />
                  Dark
                </Button>
              </div>
            </div>

            <div>
              <Label for="logo">Logo</Label>
              <div class="mt-2">
                <div
                  class="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:border-gray-400 transition-colors"
                  @click="triggerLogoUpload"
                >
                  <Image class="h-8 w-8 mx-auto text-gray-400 mb-2" />
                  <p class="text-sm font-medium text-gray-900">Upload Logo</p>
                  <p class="text-xs text-gray-500 mt-1">PNG, JPG up to 2MB</p>
                  <input
                    ref="logoInput"
                    type="file"
                    accept="image/*"
                    class="hidden"
                    @change="handleLogoUpload"
                  />
                </div>
                <div v-if="settings.logoUrl" class="mt-2 relative">
                  <img
                    :src="settings.logoUrl"
                    alt="Current logo"
                    class="h-12 w-auto"
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    class="absolute -top-2 -right-2"
                    @click="removeLogo"
                  >
                    <X class="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <!-- Notifications -->
      <Card class="lg:col-span-3">
        <CardHeader>
          <CardTitle class="text-lg">Notifications</CardTitle>
          <CardDescription>Configure notification preferences</CardDescription>
        </CardHeader>
        <CardContent class="space-y-6">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div class="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <p class="font-medium">Email Notifications</p>
                <p class="text-sm text-gray-500">Receive email alerts</p>
              </div>
              <Switch
                v-model="settings.emailNotifications"
                aria-readonly="false"
              />
            </div>

            <div class="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <p class="font-medium">Slack Integration</p>
                <p class="text-sm text-gray-500">Send alerts to Slack</p>
              </div>
              <Switch
                v-model="settings.slackNotifications"
                aria-readonly="false"
              />
            </div>

            <div class="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <p class="font-medium">Low Stock Alerts</p>
                <p class="text-sm text-gray-500">Notify when stock is low</p>
              </div>
              <Switch
                v-model="settings.lowStockAlerts"
                aria-readonly="false"
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useNotifications } from '@/composables/useNotifications'

// UI Components
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

// Icons
import {
  Save,
  Sun,
  Moon,
  Image,
  X,
} from 'lucide-vue-next'

// Reactive state
const settings = ref({
  siteName: 'Hacktiv8 E-Commerce',
  siteDescription: 'A modern e-commerce platform built with Laravel and Vue.js',
  contactEmail: 'admin@example.com',
  timezone: 'UTC',
  theme: 'light',
  logoUrl: '',
  emailNotifications: true,
  slackNotifications: false,
  lowStockAlerts: true,
})

const isSaving = ref(false)
const logoInput = ref<HTMLInputElement | null>(null)
const { showSuccess, showError } = useNotifications()

// Methods
const saveSettings = async () => {
  isSaving.value = true
  try {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    showSuccess('Settings saved successfully')
  } catch (error) {
    showError('Failed to save settings')
  } finally {
    isSaving.value = false
  }
}

const triggerLogoUpload = () => {
  logoInput.value?.click()
}

const handleLogoUpload = (event: Event) => {
  const input = event.target as HTMLInputElement
  if (input.files && input.files[0]) {
    const file = input.files[0]
    // In a real app, you would upload this file to your server
    // For now, we'll just create a local preview
    const reader = new FileReader()
    reader.onload = (e) => {
      settings.value.logoUrl = e.target?.result as string
    }
    reader.readAsDataURL(file)
  }
}

const removeLogo = () => {
  settings.value.logoUrl = ''
}

// Lifecycle
onMounted(() => {
  // In a real app, you would load settings from an API
  console.log('Loading settings from API...')
})
</script>
