import { renderHook } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, Mock } from 'vitest'
import { useAuth, useAnimeAuth, useMultiSourceAuth } from '../useAuth'
import { getAuthService } from '../../services/shared'

// Mock the auth service
vi.mock('../../services/shared', () => ({
  getAuthService: vi.fn()
}))

const mockGetAuthService = getAuthService as Mock

describe('useAuth', () => {
  const mockAuthService = {
    isAuthenticated: vi.fn(),
    getToken: vi.fn(),
    initiateLogin: vi.fn(),
    logout: vi.fn(),
    refreshToken: vi.fn()
  }

  beforeEach(() => {
    vi.clearAllMocks()
    mockGetAuthService.mockReturnValue(mockAuthService)
  })

  it('should return auth service for given source', () => {
    const { result } = renderHook(() => useAuth('mal'))
    
    expect(mockGetAuthService).toHaveBeenCalledWith('mal')
    expect(result.current.authService).toBe(mockAuthService)
  })

  it('should return authentication status', () => {
    mockAuthService.isAuthenticated.mockReturnValue(true)
    
    const { result } = renderHook(() => useAuth('mal'))
    
    expect(result.current.isAuthenticated).toBe(true)
    expect(mockAuthService.isAuthenticated).toHaveBeenCalled()
  })

  it('should return false when auth service is not available', () => {
    mockGetAuthService.mockReturnValue(undefined)
    
    const { result } = renderHook(() => useAuth('mal'))
    
    expect(result.current.isAuthenticated).toBe(false)
    expect(result.current.authService).toBeUndefined()
  })

  it('should return token from auth service', () => {
    const mockToken = { access_token: 'test-token', refresh_token: 'refresh-token' }
    mockAuthService.getToken.mockReturnValue(mockToken)
    
    const { result } = renderHook(() => useAuth('mal'))
    
    expect(result.current.token).toBe(mockToken)
    expect(result.current.accessToken).toBe('test-token')
  })

  it('should return null token when not available', () => {
    mockAuthService.getToken.mockReturnValue(null)
    
    const { result } = renderHook(() => useAuth('mal'))
    
    expect(result.current.token).toBeNull()
    expect(result.current.accessToken).toBeNull()
  })

  it('should return null token when auth service is not available', () => {
    mockGetAuthService.mockReturnValue(undefined)
    
    const { result } = renderHook(() => useAuth('mal'))
    
    expect(result.current.token).toBeNull()
    expect(result.current.accessToken).toBeNull()
  })

  it('should provide login method', () => {
    const { result } = renderHook(() => useAuth('mal'))
    
    result.current.login()
    expect(mockAuthService.initiateLogin).toHaveBeenCalled()
  })

  it('should provide logout method', () => {
    const { result } = renderHook(() => useAuth('mal'))
    
    result.current.logout()
    expect(mockAuthService.logout).toHaveBeenCalled()
  })

  it('should provide refresh token method', () => {
    const { result } = renderHook(() => useAuth('mal'))
    
    result.current.refreshToken()
    expect(mockAuthService.refreshToken).toHaveBeenCalled()
  })

  it('should handle auth service without refresh token method', () => {
    const serviceWithoutRefresh = { ...mockAuthService }
    delete serviceWithoutRefresh.refreshToken
    mockGetAuthService.mockReturnValue(serviceWithoutRefresh)
    
    const { result } = renderHook(() => useAuth('mal'))
    
    expect(() => result.current.refreshToken()).not.toThrow()
  })

  it('should handle undefined auth service for helper methods', () => {
    mockGetAuthService.mockReturnValue(undefined)
    
    const { result } = renderHook(() => useAuth('mal'))
    
    expect(() => result.current.login()).not.toThrow()
    expect(() => result.current.logout()).not.toThrow()
    expect(() => result.current.refreshToken()).not.toThrow()
  })

  it('should memoize auth service based on source', () => {
    const { result, rerender } = renderHook(
      ({ source }) => useAuth(source),
      { initialProps: { source: 'mal' as const } }
    )
    
    const firstAuthService = result.current.authService
    
    // Re-render with same source - should use memoized value
    rerender({ source: 'mal' as const })
    expect(result.current.authService).toBe(firstAuthService)
    expect(mockGetAuthService).toHaveBeenCalledTimes(1)
    
    // Re-render with different source - should get new auth service
    rerender({ source: 'anilist' as const })
    expect(mockGetAuthService).toHaveBeenCalledTimes(2)
    expect(mockGetAuthService).toHaveBeenLastCalledWith('anilist')
  })
})

describe('useAnimeAuth', () => {
  const mockAuthService = {
    isAuthenticated: vi.fn(),
    getToken: vi.fn(),
    initiateLogin: vi.fn(),
    logout: vi.fn(),
    refreshToken: vi.fn()
  }

  beforeEach(() => {
    vi.clearAllMocks()
    mockGetAuthService.mockReturnValue(mockAuthService)
  })

  it('should include all useAuth properties', () => {
    mockAuthService.isAuthenticated.mockReturnValue(true)
    const mockToken = { access_token: 'test-token' }
    mockAuthService.getToken.mockReturnValue(mockToken)
    
    const { result } = renderHook(() => useAnimeAuth('mal'))
    
    expect(result.current.authService).toBe(mockAuthService)
    expect(result.current.isAuthenticated).toBe(true)
    expect(result.current.token).toBe(mockToken)
    expect(result.current.accessToken).toBe('test-token')
    expect(result.current.login).toBeDefined()
    expect(result.current.logout).toBeDefined()
    expect(result.current.refreshToken).toBeDefined()
  })

  it('should provide anime-specific permissions when authenticated', () => {
    mockAuthService.isAuthenticated.mockReturnValue(true)
    
    const { result } = renderHook(() => useAnimeAuth('mal'))
    
    expect(result.current.canUpdateStatus).toBe(true)
    expect(result.current.canUpdateScore).toBe(true)
    expect(result.current.canAddToList).toBe(true)
  })

  it('should deny anime-specific permissions when not authenticated', () => {
    mockAuthService.isAuthenticated.mockReturnValue(false)
    
    const { result } = renderHook(() => useAnimeAuth('mal'))
    
    expect(result.current.canUpdateStatus).toBe(false)
    expect(result.current.canUpdateScore).toBe(false)
    expect(result.current.canAddToList).toBe(false)
  })
})

describe('useMultiSourceAuth', () => {
  const mockMalAuthService = {
    isAuthenticated: vi.fn(),
    getToken: vi.fn(),
    initiateLogin: vi.fn(),
    logout: vi.fn(),
    refreshToken: vi.fn()
  }

  const mockAnilistAuthService = {
    isAuthenticated: vi.fn(),
    getToken: vi.fn(),
    initiateLogin: vi.fn(),
    logout: vi.fn(),
    refreshToken: vi.fn()
  }

  beforeEach(() => {
    vi.clearAllMocks()
    mockGetAuthService.mockImplementation((source: string) => {
      if (source === 'mal') return mockMalAuthService
      if (source === 'anilist') return mockAnilistAuthService
      return undefined
    })
  })

  it('should provide auth for both MAL and AniList', () => {
    const { result } = renderHook(() => useMultiSourceAuth())
    
    expect(result.current.mal.authService).toBe(mockMalAuthService)
    expect(result.current.anilist.authService).toBe(mockAnilistAuthService)
    expect(mockGetAuthService).toHaveBeenCalledWith('mal')
    expect(mockGetAuthService).toHaveBeenCalledWith('anilist')
  })

  it('should return true for isAnyAuthenticated when MAL is authenticated', () => {
    mockMalAuthService.isAuthenticated.mockReturnValue(true)
    mockAnilistAuthService.isAuthenticated.mockReturnValue(false)
    
    const { result } = renderHook(() => useMultiSourceAuth())
    
    expect(result.current.isAnyAuthenticated).toBe(true)
    expect(result.current.authenticatedSources).toEqual(['mal'])
  })

  it('should return true for isAnyAuthenticated when AniList is authenticated', () => {
    mockMalAuthService.isAuthenticated.mockReturnValue(false)
    mockAnilistAuthService.isAuthenticated.mockReturnValue(true)
    
    const { result } = renderHook(() => useMultiSourceAuth())
    
    expect(result.current.isAnyAuthenticated).toBe(true)
    expect(result.current.authenticatedSources).toEqual(['anilist'])
  })

  it('should return true for isAnyAuthenticated when both are authenticated', () => {
    mockMalAuthService.isAuthenticated.mockReturnValue(true)
    mockAnilistAuthService.isAuthenticated.mockReturnValue(true)
    
    const { result } = renderHook(() => useMultiSourceAuth())
    
    expect(result.current.isAnyAuthenticated).toBe(true)
    expect(result.current.authenticatedSources).toEqual(['mal', 'anilist'])
  })

  it('should return false for isAnyAuthenticated when neither is authenticated', () => {
    mockMalAuthService.isAuthenticated.mockReturnValue(false)
    mockAnilistAuthService.isAuthenticated.mockReturnValue(false)
    
    const { result } = renderHook(() => useMultiSourceAuth())
    
    expect(result.current.isAnyAuthenticated).toBe(false)
    expect(result.current.authenticatedSources).toEqual([])
  })

  it('should provide individual auth objects with all properties', () => {
    const mockMalToken = { access_token: 'mal-token' }
    const mockAnilistToken = { access_token: 'anilist-token' }
    
    mockMalAuthService.isAuthenticated.mockReturnValue(true)
    mockMalAuthService.getToken.mockReturnValue(mockMalToken)
    mockAnilistAuthService.isAuthenticated.mockReturnValue(false)
    mockAnilistAuthService.getToken.mockReturnValue(mockAnilistToken)
    
    const { result } = renderHook(() => useMultiSourceAuth())
    
    // Check MAL auth
    expect(result.current.mal.isAuthenticated).toBe(true)
    expect(result.current.mal.token).toBe(mockMalToken)
    expect(result.current.mal.accessToken).toBe('mal-token')
    expect(result.current.mal.login).toBeDefined()
    
    // Check AniList auth
    expect(result.current.anilist.isAuthenticated).toBe(false)
    expect(result.current.anilist.token).toBe(mockAnilistToken)
    expect(result.current.anilist.accessToken).toBe('anilist-token')
    expect(result.current.anilist.logout).toBeDefined()
  })
})