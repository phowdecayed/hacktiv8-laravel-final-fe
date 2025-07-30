<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Storage Management</h1>
        <p class="text-gray-600">Manage files and media assets</p>
      </div>
      <Button>
        <Plus class="w-4 h-4 mr-2" />
        Upload Files
      </Button>
    </div>

    <Card>
      <CardContent class="p-6">
        <p class="text-gray-500 text-center py-12">
          Storage management interface will be implemented in future tasks.
        </p>
      </CardContent>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-vue-next'
</script>
