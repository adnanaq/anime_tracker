import '@testing-library/jest-dom'
import { vi } from 'vitest'

// Global test setup for vitest
declare global {
  const global: typeof globalThis
}

// Mock global fetch if not available
if (!global.fetch) {
  global.fetch = vi.fn()
}

// Setup ResizeObserver mock
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}))

// Setup IntersectionObserver mock
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}))

// Remove explicit matchMedia mock - let jsdom handle it natively
// jsdom provides matchMedia by default, so we don't need to override it

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
}
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
})

// Mock sessionStorage
Object.defineProperty(window, 'sessionStorage', {
  value: localStorageMock
})