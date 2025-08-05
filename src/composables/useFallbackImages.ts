import { ref, onMounted } from 'vue'
import type { Product } from '@/types/api'

interface FakeStoreProduct {
  id: number
  title: string
  price: number
  description: string
  category: string
  image: string
  rating: {
    rate: number
    count: number
  }
}

const fallbackImages = ref<string[]>([])
const isLoading = ref(false)
const error = ref<string | null>(null)

async function fetchFallbackImages() {
  if (fallbackImages.value.length > 0 || isLoading.value) return

  isLoading.value = true
  error.value = null
  try {
    const response = await fetch('https://fakestoreapi.com/products')
    if (!response.ok) {
      throw new Error('Failed to fetch fallback images')
    }
    const data: FakeStoreProduct[] = await response.json()
    fallbackImages.value = data.map((p) => p.image)
  } catch (e: any) {
    error.value = e.message
    console.error('Error fetching fallback images:', e)
  } finally {
    isLoading.value = false
  }
}

export function useFallbackImages() {
  onMounted(() => {
    fetchFallbackImages()
  })

  const getFallbackImage = (productId: number): string => {
    if (fallbackImages.value.length === 0) {
      return 'https://via.placeholder.com/300x300.png?text=No+Image'
    }
    // Simple logic to get a somewhat consistent image based on product ID
    const index = productId % fallbackImages.value.length
    return fallbackImages.value[index]
  }

  const getProductImage = (product: Product | null): string => {
    if (!product) {
      return 'https://via.placeholder.com/300x300.png?text=No+Product'
    }

    if (product.images && product.images.length > 0 && product.images[0].image_path) {
      // Assuming the API returns a relative path, construct the full URL
      const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'
      // Check if image_path is already a full URL
      if (product.images[0].image_path.startsWith('http')) {
        return product.images[0].image_path
      }
      return `${baseUrl}/storage/${product.images[0].image_path}`
    }

    return getFallbackImage(product.id)
  }

  return {
    getProductImage,
    getFallbackImage,
    isLoading,
    error,
    fetchFallbackImages,
  }
}
