/**
 * Touch utilities for mobile optimization
 */

export interface TouchOptions {
  threshold?: number
  timeout?: number
}

export interface SwipeDirection {
  direction: 'left' | 'right' | 'up' | 'down'
  distance: number
  duration: number
}

/**
 * Detect swipe gestures on an element
 */
export function useSwipe(
  element: HTMLElement,
  onSwipe: (direction: SwipeDirection) => void,
  options: TouchOptions = {},
) {
  const { threshold = 50, timeout = 300 } = options

  let startX = 0
  let startY = 0
  let startTime = 0

  const handleTouchStart = (e: TouchEvent) => {
    const touch = e.touches[0]
    startX = touch.clientX
    startY = touch.clientY
    startTime = Date.now()
  }

  const handleTouchEnd = (e: TouchEvent) => {
    const touch = e.changedTouches[0]
    const endX = touch.clientX
    const endY = touch.clientY
    const endTime = Date.now()

    const deltaX = endX - startX
    const deltaY = endY - startY
    const duration = endTime - startTime

    // Check if the swipe is within the timeout
    if (duration > timeout) return

    // Determine the primary direction
    const absDeltaX = Math.abs(deltaX)
    const absDeltaY = Math.abs(deltaY)

    if (absDeltaX > threshold || absDeltaY > threshold) {
      if (absDeltaX > absDeltaY) {
        // Horizontal swipe
        const direction = deltaX > 0 ? 'right' : 'left'
        onSwipe({ direction, distance: absDeltaX, duration })
      } else {
        // Vertical swipe
        const direction = deltaY > 0 ? 'down' : 'up'
        onSwipe({ direction, distance: absDeltaY, duration })
      }
    }
  }

  element.addEventListener('touchstart', handleTouchStart, { passive: true })
  element.addEventListener('touchend', handleTouchEnd, { passive: true })

  // Return cleanup function
  return () => {
    element.removeEventListener('touchstart', handleTouchStart)
    element.removeEventListener('touchend', handleTouchEnd)
  }
}

/**
 * Add touch-friendly styles to buttons and interactive elements
 */
export const touchStyles = {
  // Minimum touch target size (44px recommended by Apple/Google)
  minTouchTarget: 'min-h-[44px] min-w-[44px]',

  // Touch feedback
  touchFeedback: 'active:scale-95 transition-transform duration-75',

  // Prevent text selection on touch
  noSelect: 'select-none',

  // Improve touch scrolling
  touchScroll: 'overflow-auto -webkit-overflow-scrolling-touch',
}

/**
 * Detect if the device supports touch
 */
export function isTouchDevice(): boolean {
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0
}

/**
 * Get viewport dimensions for responsive calculations
 */
export function getViewportDimensions() {
  return {
    width: window.innerWidth,
    height: window.innerHeight,
    isMobile: window.innerWidth < 768,
    isTablet: window.innerWidth >= 768 && window.innerWidth < 1024,
    isDesktop: window.innerWidth >= 1024,
  }
}

/**
 * Debounce function for resize events
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number,
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null

  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}
