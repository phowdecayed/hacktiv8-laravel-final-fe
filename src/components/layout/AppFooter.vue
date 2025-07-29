<template>
  <footer class="border-t bg-background">
    <div class="container py-12">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-8">
        <!-- Company Info -->
        <div class="space-y-4">
          <div class="flex items-center gap-2">
            <img alt="Logo" src="@/assets/logo.svg" class="h-6 w-6" />
            <span class="font-bold text-lg">E-Commerce</span>
          </div>
          <p class="text-sm text-muted-foreground max-w-xs">
            Your trusted online marketplace for quality products at competitive prices.
          </p>
          <div class="flex items-center gap-4">
            <a
              href="#"
              class="text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Facebook"
            >
              <Facebook class="h-5 w-5" />
            </a>
            <a
              href="#"
              class="text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Twitter"
            >
              <Twitter class="h-5 w-5" />
            </a>
            <a
              href="#"
              class="text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Instagram"
            >
              <Instagram class="h-5 w-5" />
            </a>
          </div>
        </div>

        <!-- Quick Links -->
        <div class="space-y-4">
          <h3 class="font-semibold">Quick Links</h3>
          <nav class="flex flex-col space-y-2">
            <RouterLink
              to="/"
              class="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Home
            </RouterLink>
            <RouterLink
              to="/products"
              class="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Products
            </RouterLink>
            <RouterLink
              to="/about"
              class="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              About Us
            </RouterLink>
            <RouterLink
              to="/contact"
              class="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Contact
            </RouterLink>
          </nav>
        </div>

        <!-- Customer Service -->
        <div class="space-y-4">
          <h3 class="font-semibold">Customer Service</h3>
          <nav class="flex flex-col space-y-2">
            <a
              href="#"
              class="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Help Center
            </a>
            <a
              href="#"
              class="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Shipping Info
            </a>
            <a
              href="#"
              class="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Returns & Exchanges
            </a>
            <a
              href="#"
              class="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Size Guide
            </a>
          </nav>
        </div>

        <!-- Contact Info -->
        <div class="space-y-4">
          <h3 class="font-semibold">Contact Info</h3>
          <div class="space-y-2">
            <div class="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin class="h-4 w-4 flex-shrink-0" />
              <span>123 Commerce Street, Jakarta, Indonesia</span>
            </div>
            <div class="flex items-center gap-2 text-sm text-muted-foreground">
              <Phone class="h-4 w-4 flex-shrink-0" />
              <span>+62 21 1234 5678</span>
            </div>
            <div class="flex items-center gap-2 text-sm text-muted-foreground">
              <Mail class="h-4 w-4 flex-shrink-0" />
              <span>support@ecommerce.com</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Bottom Section -->
      <Separator class="my-8" />
      <div class="flex flex-col md:flex-row justify-between items-center gap-4">
        <p class="text-sm text-muted-foreground">
          © {{ currentYear }} E-Commerce. All rights reserved.
        </p>
        <div class="flex items-center gap-6">
          <a href="#" class="text-sm text-muted-foreground hover:text-foreground transition-colors">
            Privacy Policy
          </a>
          <a href="#" class="text-sm text-muted-foreground hover:text-foreground transition-colors">
            Terms of Service
          </a>
          <a href="#" class="text-sm text-muted-foreground hover:text-foreground transition-colors">
            Cookie Policy
          </a>
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import { Separator } from '@/components/ui/separator'
import { Facebook, Twitter, Instagram, MapPin, Phone, Mail } from 'lucide-vue-next'

const currentYear = computed(() => new Date().getFullYear())
</script>
