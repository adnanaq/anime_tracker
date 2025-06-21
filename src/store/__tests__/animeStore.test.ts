import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useAnimeStore } from '../animeStore'
import { AnimeBase } from '../../types/anime'

// Mock dependencies
vi.mock('../../services/animeService', () => ({
  animeService: {
    setSource: vi.fn(),
    getTrendingAnime: vi.fn(),
    getPopularAnime: vi.fn(),
    getTopRatedAnime: vi.fn(),
    getCurrentSeasonAnime: vi.fn(),
    searchAnime: vi.fn(),
  }
}))

vi.mock('../../services/shared', () => ({
  getAuthService: vi.fn(() => ({
    isAuthenticated: vi.fn(() => false),
    getToken: vi.fn(() => null),
  }))
}))

vi.mock('../../services/anilist', () => ({
  anilistService: {
    getCurrentUser: vi.fn(),
    getUserAnimeList: vi.fn(),
    getUserWatchingAnime: vi.fn(),
    getUserAnimeStatusMap: vi.fn(),
  }
}))

vi.mock('../../services/mal', () => ({
  malService: {
    getUserScoresForAnime: vi.fn(),
    getUserWatchingAnime: vi.fn(),
    getUserAnimeStatusMap: vi.fn(),
  }
}))

// Mock anime data
const mockAnime: AnimeBase = {
  id: 1,
  title: 'Test Anime',
  source: 'mal' as const,
  coverImage: 'test.jpg',
  userScore: 8,
  userStatus: 'watching'
}

const mockAnimeList: AnimeBase[] = [
  mockAnime,
  { ...mockAnime, id: 2, title: 'Test Anime 2', userStatus: 'completed' },
  { ...mockAnime, id: 3, title: 'Test Anime 3', userStatus: undefined }
]

describe('AnimeStore', () => {
  beforeEach(() => {
    // Reset store state before each test
    useAnimeStore.setState({
      currentSource: 'mal',
      trendingAnime: [],
      popularAnime: [],
      topRatedAnime: [],
      currentSeasonAnime: [],
      searchResults: [],
      currentlyWatching: [],
      userAnimeScores: new Map(),
      userAnimeStatus: new Map(),
      loading: {
        trending: false,
        popular: false,
        topRated: false,
        currentSeason: false,
        search: false,
        userScores: false,
        currentlyWatching: false
      }
    })
    vi.clearAllMocks()
  })

  describe('setSource', () => {
    it('should update current source and clear data', () => {
      // Setup initial state with data
      useAnimeStore.setState({
        trendingAnime: mockAnimeList,
        popularAnime: mockAnimeList,
        currentSource: 'mal'
      })

      const { setSource } = useAnimeStore.getState()
      setSource('anilist')

      const state = useAnimeStore.getState()
      expect(state.currentSource).toBe('anilist')
      expect(state.trendingAnime).toEqual([])
      expect(state.popularAnime).toEqual([])
      expect(state.topRatedAnime).toEqual([])
      expect(state.currentSeasonAnime).toEqual([])
      expect(state.searchResults).toEqual([])
      expect(state.currentlyWatching).toEqual([])
    })
  })

  describe('getAuthToken', () => {
    it('should return undefined when not authenticated', () => {
      const { getAuthToken } = useAnimeStore.getState()
      const token = getAuthToken()
      expect(token).toBeUndefined()
    })

    it('should return token when authenticated', async () => {
      const mockAuthService = {
        isAuthenticated: vi.fn(() => true),
        getToken: vi.fn(() => ({ access_token: 'test-token', token_type: 'Bearer' })),
        initiateLogin: vi.fn(),
        exchangeCodeForToken: vi.fn(),
        logout: vi.fn()
      }
      
      const { getAuthService } = await import('../../services/shared')
      vi.mocked(getAuthService).mockReturnValue(mockAuthService)

      const { getAuthToken } = useAnimeStore.getState()
      const token = getAuthToken()
      expect(token).toBe('test-token')
    })
  })

  describe('mergeUserScores', () => {
    it('should merge user scores from the store map', () => {
      useAnimeStore.setState({
        userAnimeScores: new Map([[1, 9], [2, 7]])
      })

      const { mergeUserScores } = useAnimeStore.getState()
      const result = mergeUserScores(mockAnimeList)

      expect(result[0].userScore).toBe(9) // From map
      expect(result[1].userScore).toBe(7) // From map
      expect(result[2].userScore).toBe(8) // Original value preserved
    })

    it('should preserve original scores when not in map', () => {
      useAnimeStore.setState({
        userAnimeScores: new Map() // Empty map
      })

      const { mergeUserScores } = useAnimeStore.getState()
      const result = mergeUserScores(mockAnimeList)

      expect(result[0].userScore).toBe(8) // Original preserved
      expect(result[1].userScore).toBe(8) // Original preserved
    })
  })

  describe('mergeUserStatus', () => {
    it('should merge user status from the store map', () => {
      useAnimeStore.setState({
        userAnimeStatus: new Map([[1, 'completed'], [2, 'dropped']])
      })

      const { mergeUserStatus } = useAnimeStore.getState()
      const result = mergeUserStatus(mockAnimeList)

      expect(result[0].userStatus).toBe('completed') // From map
      expect(result[1].userStatus).toBe('dropped') // From map
      expect(result[2].userStatus).toBe(undefined) // Original preserved
    })
  })

  describe('applyUserData', () => {
    it('should apply both scores and status', () => {
      useAnimeStore.setState({
        userAnimeScores: new Map([[1, 10]]),
        userAnimeStatus: new Map([[1, 'completed']])
      })

      const { applyUserData } = useAnimeStore.getState()
      const result = applyUserData([mockAnime])

      expect(result[0].userScore).toBe(10)
      expect(result[0].userStatus).toBe('completed')
    })
  })

  describe('withLoading', () => {
    it('should set and unset loading state', async () => {
      const { withLoading } = useAnimeStore.getState()
      const mockAction = vi.fn().mockResolvedValue('success')

      const promise = withLoading('trending', mockAction)
      
      // Check loading state is set
      expect(useAnimeStore.getState().loading.trending).toBe(true)
      
      await promise
      
      // Check loading state is unset
      expect(useAnimeStore.getState().loading.trending).toBe(false)
      expect(mockAction).toHaveBeenCalledOnce()
    })

    it('should handle errors and still unset loading state', async () => {
      const { withLoading } = useAnimeStore.getState()
      const mockAction = vi.fn().mockRejectedValue(new Error('Test error'))
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      await withLoading('trending', mockAction)
      
      expect(useAnimeStore.getState().loading.trending).toBe(false)
      expect(consoleSpy).toHaveBeenCalled()
      
      consoleSpy.mockRestore()
    })
  })

  describe('getCurrentlyWatching', () => {
    it('should return anime with watching status', () => {
      useAnimeStore.setState({
        trendingAnime: [
          { ...mockAnime, id: 1, userStatus: 'watching' },
          { ...mockAnime, id: 2, userStatus: 'completed' },
          { ...mockAnime, id: 3, userStatus: 'CURRENT' },
        ],
        popularAnime: [
          { ...mockAnime, id: 4, userStatus: 'dropped' }
        ]
      })

      const { getCurrentlyWatching } = useAnimeStore.getState()
      const result = getCurrentlyWatching()

      expect(result).toHaveLength(2)
      expect(result[0].userStatus).toBe('watching')
      expect(result[1].userStatus).toBe('CURRENT')
    })

    it('should return empty array when no watching anime', () => {
      useAnimeStore.setState({
        trendingAnime: [
          { ...mockAnime, id: 1, userStatus: 'completed' },
          { ...mockAnime, id: 2, userStatus: 'dropped' },
        ]
      })

      const { getCurrentlyWatching } = useAnimeStore.getState()
      const result = getCurrentlyWatching()

      expect(result).toHaveLength(0)
    })
  })

  describe('updateAnimeStatus', () => {
    beforeEach(() => {
      useAnimeStore.setState({
        trendingAnime: [...mockAnimeList],
        currentlyWatching: [mockAnimeList[0]], // First anime is watching
        userAnimeStatus: new Map([[1, 'watching'], [2, 'completed']])
      })
    })

    it('should update anime status in all relevant lists', () => {
      const { updateAnimeStatus } = useAnimeStore.getState()
      updateAnimeStatus(1, 'mal', 'completed')

      const state = useAnimeStore.getState()
      expect(state.trendingAnime[0].userStatus).toBe('completed')
      expect(state.userAnimeStatus.get(1)).toBe('completed')
    })

    it('should add anime to currentlyWatching when status is watching', () => {
      const { updateAnimeStatus } = useAnimeStore.getState()
      updateAnimeStatus(2, 'mal', 'watching')

      const state = useAnimeStore.getState()
      expect(state.currentlyWatching).toHaveLength(2)
      expect(state.currentlyWatching.some(anime => anime.id === 2)).toBe(true)
    })

    it('should remove anime from currentlyWatching when status changes from watching', () => {
      const { updateAnimeStatus } = useAnimeStore.getState()
      updateAnimeStatus(1, 'mal', 'completed') // Change from watching to completed

      const state = useAnimeStore.getState()
      expect(state.currentlyWatching).toHaveLength(0)
    })

    it('should remove anime status when removing from list', () => {
      const { updateAnimeStatus } = useAnimeStore.getState()
      updateAnimeStatus(1, 'mal', '') // Empty string means remove

      const state = useAnimeStore.getState()
      expect(state.trendingAnime[0].userStatus).toBeUndefined()
      expect(state.userAnimeStatus.has(1)).toBe(false)
    })

    it('should not update if status is the same', () => {
      const { updateAnimeStatus } = useAnimeStore.getState()
      const initialState = useAnimeStore.getState()
      
      updateAnimeStatus(1, 'mal', 'watching') // Same status

      const newState = useAnimeStore.getState()
      expect(newState.trendingAnime).toBe(initialState.trendingAnime) // Same reference
    })
  })

  describe('removeAnimeFromStore', () => {
    beforeEach(() => {
      useAnimeStore.setState({
        trendingAnime: [...mockAnimeList],
        popularAnime: [...mockAnimeList],
        currentlyWatching: [mockAnimeList[0]],
        userAnimeStatus: new Map([[1, 'watching'], [2, 'completed']])
      })
    })

    it('should remove anime from all lists', () => {
      const { removeAnimeFromStore } = useAnimeStore.getState()
      removeAnimeFromStore(1, 'mal')

      const state = useAnimeStore.getState()
      expect(state.trendingAnime).toHaveLength(2)
      expect(state.popularAnime).toHaveLength(2)
      expect(state.currentlyWatching).toHaveLength(0)
      expect(state.trendingAnime.some(anime => anime.id === 1)).toBe(false)
    })

    it('should remove anime from status map', () => {
      const { removeAnimeFromStore } = useAnimeStore.getState()
      removeAnimeFromStore(1, 'mal')

      const state = useAnimeStore.getState()
      expect(state.userAnimeStatus.has(1)).toBe(false)
      expect(state.userAnimeStatus.has(2)).toBe(true) // Other statuses preserved
    })
  })

  describe('clearSearch', () => {
    it('should clear search results', () => {
      useAnimeStore.setState({ searchResults: mockAnimeList })

      const { clearSearch } = useAnimeStore.getState()
      clearSearch()

      const state = useAnimeStore.getState()
      expect(state.searchResults).toEqual([])
    })
  })
})