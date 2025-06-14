import { describe, it, expect } from 'vitest'
import {
  getStatusOptions,
  getStatusLabel,
  convertStatusBetweenSources,
  getAllStatusValues,
  isValidStatus
} from '../animeStatus'

describe('animeStatus utilities', () => {
  describe('getStatusOptions', () => {
    it('should return MAL status options', () => {
      const options = getStatusOptions('mal')
      const values = options.map(opt => opt.value)
      expect(values).toContain('watching')
      expect(values).toContain('completed')
      expect(values).toContain('on_hold')
      expect(values).toContain('dropped')
      expect(values).toContain('plan_to_watch')
    })

    it('should return AniList status options', () => {
      const options = getStatusOptions('anilist')
      const values = options.map(opt => opt.value)
      expect(values).toContain('CURRENT')
      expect(values).toContain('COMPLETED')
      expect(values).toContain('PAUSED')
      expect(values).toContain('DROPPED')
      expect(values).toContain('PLANNING')
      expect(values).toContain('REPEATING')
    })

    it('should return Jikan status options (same as MAL)', () => {
      const options = getStatusOptions('jikan' as any)
      expect(options).toEqual(getStatusOptions('mal'))
    })
  })

  describe('getStatusLabel', () => {
    it('should return correct labels for MAL statuses', () => {
      expect(getStatusLabel('watching')).toBe('Watching')
      expect(getStatusLabel('completed')).toBe('Completed')
      expect(getStatusLabel('on_hold')).toBe('On Hold')
      expect(getStatusLabel('dropped')).toBe('Dropped')
      expect(getStatusLabel('plan_to_watch')).toBe('Plan to Watch')
    })

    it('should return correct labels for AniList statuses', () => {
      expect(getStatusLabel('CURRENT')).toBe('Watching')
      expect(getStatusLabel('COMPLETED')).toBe('Completed')
      expect(getStatusLabel('PAUSED')).toBe('On Hold')
      expect(getStatusLabel('DROPPED')).toBe('Dropped')
      expect(getStatusLabel('PLANNING')).toBe('Plan to Watch')
    })

    it('should return "Unknown Status" for unknown statuses', () => {
      expect(getStatusLabel('unknown_status')).toBe('Unknown Status')
    })

    it('should handle null status', () => {
      expect(getStatusLabel(null)).toBe('Add to List')
    })
  })

  describe('convertStatusBetweenSources', () => {
    it('should convert MAL to AniList statuses', () => {
      expect(convertStatusBetweenSources('watching', 'mal', 'anilist')).toBe('CURRENT')
      expect(convertStatusBetweenSources('completed', 'mal', 'anilist')).toBe('COMPLETED')
      expect(convertStatusBetweenSources('on_hold', 'mal', 'anilist')).toBe('PAUSED')
      expect(convertStatusBetweenSources('dropped', 'mal', 'anilist')).toBe('DROPPED')
      expect(convertStatusBetweenSources('plan_to_watch', 'mal', 'anilist')).toBe('PLANNING')
    })

    it('should convert AniList to MAL statuses', () => {
      expect(convertStatusBetweenSources('CURRENT', 'anilist', 'mal')).toBe('watching')
      expect(convertStatusBetweenSources('COMPLETED', 'anilist', 'mal')).toBe('completed')
      expect(convertStatusBetweenSources('PAUSED', 'anilist', 'mal')).toBe('on_hold')
      expect(convertStatusBetweenSources('DROPPED', 'anilist', 'mal')).toBe('dropped')
      expect(convertStatusBetweenSources('PLANNING', 'anilist', 'mal')).toBe('plan_to_watch')
    })

    it('should return original status when same source', () => {
      expect(convertStatusBetweenSources('watching', 'mal', 'mal')).toBe('watching')
      expect(convertStatusBetweenSources('CURRENT', 'anilist', 'anilist')).toBe('CURRENT')
    })

    it('should return original status for unknown conversion', () => {
      expect(convertStatusBetweenSources('unknown', 'mal', 'anilist')).toBe('unknown')
    })

    it('should handle jikan as MAL equivalent', () => {
      expect(convertStatusBetweenSources('watching', 'jikan' as any, 'anilist')).toBe('CURRENT')
      expect(convertStatusBetweenSources('CURRENT', 'anilist', 'jikan' as any)).toBe('watching')
    })
  })

  describe('getAllStatusValues', () => {
    it('should return all MAL status values', () => {
      const values = getAllStatusValues('mal')
      expect(values).toEqual(['watching', 'completed', 'on_hold', 'dropped', 'plan_to_watch'])
    })

    it('should return all AniList status values', () => {
      const values = getAllStatusValues('anilist')
      expect(values).toEqual(['CURRENT', 'COMPLETED', 'PAUSED', 'DROPPED', 'PLANNING', 'REPEATING'])
    })
  })

  describe('isValidStatus', () => {
    it('should validate MAL statuses', () => {
      expect(isValidStatus('watching', 'mal')).toBe(true)
      expect(isValidStatus('completed', 'mal')).toBe(true)
      expect(isValidStatus('CURRENT', 'mal')).toBe(false)
      expect(isValidStatus('invalid', 'mal')).toBe(false)
    })

    it('should validate AniList statuses', () => {
      expect(isValidStatus('CURRENT', 'anilist')).toBe(true)
      expect(isValidStatus('COMPLETED', 'anilist')).toBe(true)
      expect(isValidStatus('watching', 'anilist')).toBe(false)
      expect(isValidStatus('invalid', 'anilist')).toBe(false)
    })

    it('should handle jikan as MAL equivalent', () => {
      expect(isValidStatus('watching', 'jikan' as any)).toBe(true)
      expect(isValidStatus('CURRENT', 'jikan' as any)).toBe(false)
    })
  })
})