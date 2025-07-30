import type { Event } from 'vue'

declare global {
  interface HTMLElement {
    clickOutsideEvent?: (event: Event) => void;
  }
}
