import { ref, onMounted, onUnmounted } from 'vue'
import { debounce } from '@/lib/utils'

export interface BreakpointConfig {
  sm: number
  md: number
  lg: number
  xl: number
  '2xl': number
}

const defaultBreakpoints: BreakpointConfig = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
}

export function useResponsive(breakpoints: Partial<BreakpointConfig> = {}) {
  const config = { ...defaultBreakpoints, ...breakpoints }

  const windowWidth = ref(0)
  const windowHeight = ref(0)

  const updateDimensions = () => {
    windowWidth.value = window.innerWidth
    windowHeight.value = window.innerHeight
  }

  const debouncedUpdate = debounce(updateDimensions, 100)

  onMounted(() => {
    updateDimensions()
    window.addEventListener('resize', debouncedUpdate)
  })

  onUnmounted(() => {
    window.removeEventListener('resize', debouncedUpdate)
  })

  // Computed breakpoint checks
  const isMobile = () => windowWidth.value < config.md
  const isTablet = () => windowWidth.value >= config.md && windowWidth.value < config.lg
  const isDesktop = () => windowWidth.value >= config.lg
  const isLargeDesktop = () => windowWidth.value >= config.xl

  // Specific breakpoint checks
  const isSmUp = () => windowWidth.value >= config.sm
  const isMdUp = () => windowWidth.value >= config.md
  const isLgUp = () => windowWidth.value >= config.lg
  const isXlUp = () => windowWidth.value >= config.xl
  const is2xlUp = () => windowWidth.value >= config['2xl']

  const isSmDown = () => windowWidth.value < config.sm
  const isMdDown = () => windowWidth.value < config.md
  const isLgDown = () => windowWidth.value < config.lg
  const isXlDown = () => windowWidth.value < config.xl
  const is2xlDown = () => windowWidth.value < config['2xl']

  // Touch device detection
  const isTouchDevice = () => {
    return 'ontouchstart' in window || navigator.maxTouchPoints > 0
  }

  // Orientation detection
  const isPortrait = () => windowHeight.value > windowWidth.value
  const isLandscape = () => windowWidth.value > windowHeight.value

  return {
    windowWidth,
    windowHeight,
    isMobile,
    isTablet,
    isDesktop,
    isLargeDesktop,
    isSmUp,
    isMdUp,
    isLgUp,
    isXlUp,
    is2xlUp,
    isSmDown,
    isMdDown,
    isLgDown,
    isXlDown,
    is2xlDown,
    isTouchDevice,
    isPortrait,
    isLandscape,
  }
}

// Utility function for responsive classes
export function responsiveClass(
  base: string,
  responsive: Partial<Record<keyof BreakpointConfig, string>> = {},
): string {
  const classes = [base]

  Object.entries(responsive).forEach(([breakpoint, className]) => {
    if (className) {
      classes.push(`${breakpoint}:${className}`)
    }
  })

  return classes.join(' ')
}

// Utility for responsive values
export function useResponsiveValue<T>(values: {
  default: T
  sm?: T
  md?: T
  lg?: T
  xl?: T
  '2xl'?: T
}) {
  const { windowWidth } = useResponsive()

  const getValue = (): T => {
    const width = windowWidth.value

    if (width >= defaultBreakpoints['2xl'] && values['2xl'] !== undefined) {
      return values['2xl']
    }
    if (width >= defaultBreakpoints.xl && values.xl !== undefined) {
      return values.xl
    }
    if (width >= defaultBreakpoints.lg && values.lg !== undefined) {
      return values.lg
    }
    if (width >= defaultBreakpoints.md && values.md !== undefined) {
      return values.md
    }
    if (width >= defaultBreakpoints.sm && values.sm !== undefined) {
      return values.sm
    }

    return values.default
  }

  return { getValue }
}
