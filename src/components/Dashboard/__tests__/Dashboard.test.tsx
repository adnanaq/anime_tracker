import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { Dashboard } from '../Dashboard'

// Mock all the child components
vi.mock('../../SourceToggle', () => ({
  SourceToggle: () => <div data-testid="source-toggle">Source Toggle</div>
}))

vi.mock('../../ThemeToggle', () => ({
  ThemeToggle: () => <div data-testid="theme-toggle">Theme Toggle</div>
}))

vi.mock('../../SearchBar', () => ({
  SearchBar: () => <div data-testid="search-bar">Search Bar</div>
}))

vi.mock('../../AuthButton', () => ({
  AuthButton: ({ source }: { source: string }) => <div data-testid="auth-button">Auth Button - {source}</div>
}))

vi.mock('../../Hero', () => ({
  Hero: ({ anime }: { anime: any[] }) => <div data-testid="hero">Hero - {anime.length} anime</div>,
  HeroSkeleton: () => <div data-testid="hero-skeleton">Hero Loading...</div>
}))

vi.mock('../../AnimeSchedule', () => ({
  AnimeSchedule: () => <div data-testid="anime-schedule">Anime Schedule</div>
}))

vi.mock('../../AdvancedSearch', () => ({
  AdvancedSearch: () => <div data-testid="advanced-search">Advanced Search</div>
}))

vi.mock('../../RandomAnime', () => ({
  RandomAnime: () => <div data-testid="random-anime">Random Anime</div>
}))

vi.mock('../../SeasonalAnime', () => ({
  SeasonalAnime: () => <div data-testid="seasonal-anime">Seasonal Anime</div>
}))

vi.mock('../../CacheManager/CacheStats', () => ({
  CacheStats: () => <div data-testid="cache-stats">Cache Stats</div>
}))

vi.mock('../../CacheTest', () => ({
  CacheTest: () => <div data-testid="cache-test">Cache Test</div>
}))

vi.mock('../../ExpandingAnimeCards', () => ({
  ExpandingAnimeCards: ({ anime, title, variant, maxCards }: { 
    anime: any[], 
    title: string, 
    variant: string, 
    maxCards: number 
  }) => (
    <div data-testid="expanding-anime-cards">
      {title} - {anime.length} anime - {variant} - max {maxCards}
    </div>
  )
}))

vi.mock('../../ExpandableGrid', () => ({
  ExpandableGrid: ({ anime, title, maxCards, variant }: { 
    anime: any[], 
    title: string, 
    maxCards: number,
    variant?: string 
  }) => (
    <div data-testid="expandable-grid">
      {title} - {anime.length} anime - max {maxCards} {variant ? `- ${variant}` : ''}
    </div>
  )
}))

vi.mock('../../ui', () => ({
  Typography: ({ children, variant, className }: { 
    children: React.ReactNode, 
    variant?: string, 
    className?: string 
  }) => (
    <div data-testid={`typography-${variant || 'default'}`} className={className}>
      {children}
    </div>
  ),
  AnimeGridSkeleton: ({ count }: { count: number }) => (
    <div data-testid="anime-grid-skeleton">Loading {count} anime...</div>
  ),
  BaseAnimeCard: ({ anime, children }: { anime: any, children?: React.ReactNode }) => (
    <div data-testid="base-anime-card">
      {anime.title}
      {children}
    </div>
  )
}))

// Mock the store
vi.mock('../../../store/animeStore', () => ({
  useAnimeStore: vi.fn()
}))

// Mock Zustand shallow utility
vi.mock('zustand/shallow', () => ({
  shallow: vi.fn((fn) => fn)
}))

const mockAnime = [
  { id: '1', title: 'Test Anime 1', source: 'mal' },
  { id: '2', title: 'Test Anime 2', source: 'mal' },
  { id: '3', title: 'Test Anime 3', source: 'mal' }
]

describe('Dashboard Component', () => {
  let mockUseAnimeStore: any
  let mockStore: any

  beforeEach(async () => {
    vi.clearAllMocks()
    
    // Get mock reference
    const storeModule = await import('../../../store/animeStore')
    mockUseAnimeStore = vi.mocked(storeModule.useAnimeStore)
    
    // Setup default store state
    mockStore = {
      currentSource: 'mal',
      loading: {
        trending: false,
        popular: false,
        topRated: false,
        currentSeason: false,
        search: false,
        currentlyWatching: false
      },
      trendingAnime: [],
      popularAnime: [],
      topRatedAnime: [],
      currentSeasonAnime: [],
      searchResults: [],
      currentlyWatching: [],
      fetchTrendingAnime: vi.fn(),
      fetchPopularAnime: vi.fn(),
      fetchTopRatedAnime: vi.fn(),
      fetchCurrentSeasonAnime: vi.fn(),
      fetchUserScores: vi.fn(),
      fetchUserStatus: vi.fn(),
      fetchCurrentlyWatching: vi.fn()
    }
    
    mockUseAnimeStore.mockImplementation((selector) => {
      return selector(mockStore)
    })
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('Header Rendering', () => {
    it('should render the main header with all components', () => {
      render(<Dashboard />)
      
      expect(screen.getByText('AnimeTrackr')).toBeInTheDocument()
      expect(screen.getAllByTestId('search-bar')).toHaveLength(2) // Desktop and mobile
      expect(screen.getByTestId('source-toggle')).toBeInTheDocument()
      expect(screen.getByTestId('auth-button')).toBeInTheDocument()
      expect(screen.getByTestId('theme-toggle')).toBeInTheDocument()
    })

    it('should pass current source to AuthButton', () => {
      render(<Dashboard />)
      
      expect(screen.getByText('Auth Button - mal')).toBeInTheDocument()
    })

    it('should show mobile search bar', () => {
      render(<Dashboard />)
      
      // Should have 2 search bars (desktop and mobile)
      const searchBars = screen.getAllByTestId('search-bar')
      expect(searchBars).toHaveLength(2)
    })
  })

  describe('Store Integration', () => {
    it('should call store selectors correctly', () => {
      render(<Dashboard />)
      
      // Should call useAnimeStore 3 times (3 optimized selectors)
      expect(mockUseAnimeStore).toHaveBeenCalledTimes(3)
    })

    it('should handle different sources correctly', () => {
      const anilistStore = { ...mockStore, currentSource: 'anilist' }
      mockUseAnimeStore.mockImplementation((selector) => selector(anilistStore))
      
      render(<Dashboard />)
      
      expect(screen.getByText('Auth Button - anilist')).toBeInTheDocument()
    })
  })

  describe('Loading States', () => {
    it('should show hero skeleton when trending is loading', () => {
      const loadingStore = {
        ...mockStore,
        loading: { ...mockStore.loading, trending: true }
      }
      mockUseAnimeStore.mockImplementation((selector) => selector(loadingStore))
      
      render(<Dashboard />)
      
      expect(screen.getByTestId('hero-skeleton')).toBeInTheDocument()
      expect(screen.queryByTestId('hero')).not.toBeInTheDocument()
    })

    it('should show anime grid skeleton when sections are loading', () => {
      const loadingStore = {
        ...mockStore,
        loading: { ...mockStore.loading, trending: true }
      }
      mockUseAnimeStore.mockImplementation((selector) => selector(loadingStore))
      
      render(<Dashboard />)
      
      expect(screen.getByTestId('anime-grid-skeleton')).toBeInTheDocument()
      expect(screen.getByText('Loading 10 anime...')).toBeInTheDocument()
    })
  })

  describe('Content Rendering', () => {
    it('should render hero when trending anime is available', () => {
      const storeWithTrending = {
        ...mockStore,
        trendingAnime: mockAnime
      }
      mockUseAnimeStore.mockImplementation((selector) => selector(storeWithTrending))
      
      render(<Dashboard />)
      
      expect(screen.getByTestId('hero')).toBeInTheDocument()
      expect(screen.getByText('Hero - 3 anime')).toBeInTheDocument()
    })

    it('should render trending anime sections when data is available', () => {
      const storeWithTrending = {
        ...mockStore,
        trendingAnime: mockAnime
      }
      mockUseAnimeStore.mockImplementation((selector) => selector(storeWithTrending))
      
      render(<Dashboard />)
      
      // Should show featured trending cards
      expect(screen.getByText('✨ Featured Trending Anime - 3 anime - horizontal - max 6')).toBeInTheDocument()
      
      // Should show trending grid
      expect(screen.getByText('Trending Now - 3 anime - max 12 - click')).toBeInTheDocument()
    })

    it('should render currently watching section when available', () => {
      const storeWithWatching = {
        ...mockStore,
        currentlyWatching: mockAnime
      }
      mockUseAnimeStore.mockImplementation((selector) => selector(storeWithWatching))
      
      render(<Dashboard />)
      
      // Should show continue watching cards
      expect(screen.getByText('📺 Continue Watching - 3 anime - vertical - max 5')).toBeInTheDocument()
      
      // Should show currently watching grid
      expect(screen.getByText('Currently Watching (Grid View) - 3 anime - max 12 - click')).toBeInTheDocument()
    })

    it('should render search results when available', () => {
      const storeWithSearch = {
        ...mockStore,
        searchResults: mockAnime
      }
      mockUseAnimeStore.mockImplementation((selector) => selector(storeWithSearch))
      
      render(<Dashboard />)
      
      expect(screen.getByText('Search Results - 3 anime - max 10')).toBeInTheDocument()
      
      // Hero should be hidden when search results are shown
      expect(screen.queryByTestId('hero')).not.toBeInTheDocument()
    })
  })

  describe('Conditional Rendering Logic', () => {
    it('should hide hero when search results are present', () => {
      const storeWithSearchAndTrending = {
        ...mockStore,
        searchResults: mockAnime,
        trendingAnime: mockAnime
      }
      mockUseAnimeStore.mockImplementation((selector) => selector(storeWithSearchAndTrending))
      
      render(<Dashboard />)
      
      expect(screen.getByText('Search Results - 3 anime - max 10')).toBeInTheDocument()
      expect(screen.queryByTestId('hero')).not.toBeInTheDocument()
    })

    it('should hide main sections when search results are present', () => {
      const storeWithSearchAndTrending = {
        ...mockStore,
        searchResults: mockAnime,
        trendingAnime: mockAnime,
        currentlyWatching: mockAnime
      }
      mockUseAnimeStore.mockImplementation((selector) => selector(storeWithSearchAndTrending))
      
      render(<Dashboard />)
      
      expect(screen.getByText('Search Results - 3 anime - max 10')).toBeInTheDocument()
      expect(screen.queryByText('✨ Featured Trending Anime')).not.toBeInTheDocument()
      expect(screen.queryByText('📺 Continue Watching')).not.toBeInTheDocument()
    })

    it('should show different sections based on available data', () => {
      const storeWithData = {
        ...mockStore,
        trendingAnime: mockAnime,
        popularAnime: mockAnime,
        topRatedAnime: mockAnime,
        currentSeasonAnime: mockAnime,
        currentlyWatching: mockAnime
      }
      mockUseAnimeStore.mockImplementation((selector) => selector(storeWithData))
      
      render(<Dashboard />)
      
      // Should show all main sections when data is available
      expect(screen.getByText('✨ Featured Trending Anime - 3 anime - horizontal - max 6')).toBeInTheDocument()
      expect(screen.getByText('📺 Continue Watching - 3 anime - vertical - max 5')).toBeInTheDocument()
      expect(screen.getByText('Currently Watching (Grid View) - 3 anime - max 12 - click')).toBeInTheDocument()
      expect(screen.getByText('Trending Now - 3 anime - max 12 - click')).toBeInTheDocument()
    })
  })

  describe('Data Fetching Logic', () => {
    it('should call fetchData on mount for MAL source', async () => {
      render(<Dashboard />)
      
      await waitFor(() => {
        expect(mockStore.fetchCurrentlyWatching).toHaveBeenCalled()
        expect(mockStore.fetchTrendingAnime).toHaveBeenCalled()
        expect(mockStore.fetchPopularAnime).toHaveBeenCalled()
        expect(mockStore.fetchTopRatedAnime).toHaveBeenCalled()
        expect(mockStore.fetchCurrentSeasonAnime).toHaveBeenCalled()
        
        // Should NOT call AniList-specific functions for MAL
        expect(mockStore.fetchUserScores).not.toHaveBeenCalled()
        expect(mockStore.fetchUserStatus).not.toHaveBeenCalled()
      })
    })

    it('should call additional functions for AniList source', async () => {
      const anilistStore = { ...mockStore, currentSource: 'anilist' }
      mockUseAnimeStore.mockImplementation((selector) => selector(anilistStore))
      
      render(<Dashboard />)
      
      await waitFor(() => {
        expect(mockStore.fetchUserScores).toHaveBeenCalled()
        expect(mockStore.fetchUserStatus).toHaveBeenCalled()
        expect(mockStore.fetchCurrentlyWatching).toHaveBeenCalled()
        expect(mockStore.fetchTrendingAnime).toHaveBeenCalled()
        expect(mockStore.fetchPopularAnime).toHaveBeenCalled()
        expect(mockStore.fetchTopRatedAnime).toHaveBeenCalled()
        expect(mockStore.fetchCurrentSeasonAnime).toHaveBeenCalled()
      })
    })
  })

  describe('Performance Optimizations', () => {
    it('should use memoized LoadingGrid component', () => {
      const loadingStore = {
        ...mockStore,
        loading: { ...mockStore.loading, trending: true }
      }
      mockUseAnimeStore.mockImplementation((selector) => selector(loadingStore))
      
      render(<Dashboard />)
      
      // LoadingGrid should be used in loading states
      expect(screen.getByTestId('anime-grid-skeleton')).toBeInTheDocument()
    })

    it('should handle AnimeSection memoization correctly', () => {
      const storeWithSearch = {
        ...mockStore,
        searchResults: mockAnime,
        loading: { ...mockStore.loading, search: false }
      }
      mockUseAnimeStore.mockImplementation((selector) => selector(storeWithSearch))
      
      render(<Dashboard />)
      
      // AnimeSection should render with ExpandableGrid
      expect(screen.getByText('Search Results - 3 anime - max 10')).toBeInTheDocument()
    })
  })

  describe('Error Handling', () => {
    it('should handle empty anime arrays gracefully', () => {
      const emptyStore = {
        ...mockStore,
        trendingAnime: [],
        popularAnime: [],
        topRatedAnime: [],
        currentSeasonAnime: [],
        searchResults: [],
        currentlyWatching: []
      }
      mockUseAnimeStore.mockImplementation((selector) => selector(emptyStore))
      
      render(<Dashboard />)
      
      // Should still render header
      expect(screen.getByText('AnimeTrackr')).toBeInTheDocument()
      
      // Should not render anime sections when arrays are empty
      expect(screen.queryByText('✨ Featured Trending Anime')).not.toBeInTheDocument()
      expect(screen.queryByText('📺 Continue Watching')).not.toBeInTheDocument()
    })

    it('should handle loading states gracefully', () => {
      const allLoadingStore = {
        ...mockStore,
        loading: {
          trending: true,
          popular: true,
          topRated: true,
          currentSeason: true,
          search: true,
          currentlyWatching: true
        }
      }
      mockUseAnimeStore.mockImplementation((selector) => selector(allLoadingStore))
      
      render(<Dashboard />)
      
      expect(screen.getByTestId('hero-skeleton')).toBeInTheDocument()
      expect(screen.getAllByTestId('anime-grid-skeleton')).toHaveLength(4) // One for each section
    })
  })
})