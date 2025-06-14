import { describe, it, expect } from 'vitest'
import { cn } from '../cn'

describe('cn utility', () => {
  it('should merge simple class names', () => {
    expect(cn('px-2', 'py-1')).toBe('px-2 py-1')
  })

  it('should handle conditional classes', () => {
    expect(cn('base', true && 'conditional', false && 'hidden')).toBe('base conditional')
  })

  it('should resolve Tailwind conflicts', () => {
    expect(cn('px-2', 'px-4')).toBe('px-4')
    expect(cn('text-red-500', 'text-blue-500')).toBe('text-blue-500')
  })

  it('should handle undefined and null values', () => {
    expect(cn('base', undefined, null, 'end')).toBe('base end')
  })

  it('should handle arrays', () => {
    expect(cn(['px-2', 'py-1'], 'rounded')).toBe('px-2 py-1 rounded')
  })

  it('should handle objects', () => {
    expect(cn({
      'active': true,
      'inactive': false,
      'base': true
    })).toBe('active base')
  })

  it('should handle complex Tailwind conflicts', () => {
    expect(cn(
      'bg-red-500 text-white',
      'bg-blue-500', // Should override bg-red-500
      'text-black'   // Should override text-white
    )).toBe('bg-blue-500 text-black')
  })

  it('should preserve non-conflicting classes', () => {
    expect(cn(
      'px-4 py-2 rounded-lg',
      'bg-blue-500 text-white',
      'hover:bg-blue-600'
    )).toBe('px-4 py-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600')
  })

  it('should handle empty inputs', () => {
    expect(cn()).toBe('')
    expect(cn('')).toBe('')
    expect(cn(undefined, null, false)).toBe('')
  })
})