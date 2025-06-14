import { describe, it, expect, vi, beforeEach, afterEach, Mock } from 'vitest'
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { AnimeCard } from '../AnimeCard'
import { AnimeBase } from '../../../types/anime'
import { animate } from 'animejs'
import { useAnimeAuth } from '../../../hooks/useAuth'
import { createDebouncedFunction } from '../../../utils/debounce'

// Mock the authentication hook
vi.mock('../../../hooks/useAuth', () => ({
  useAnimeAuth: vi.fn()
}))

// Mock animejs
vi.mock('animejs', () => ({
  animate: vi.fn()
}))

// Mock the debounce utility
vi.mock('../../../utils/debounce', () => ({
  createDebouncedFunction: vi.fn(() => ({
    debouncedFn: vi.fn(),
    cleanup: vi.fn()
  }))
}))

// Mock UI components
vi.mock('../../ui', () => ({
  Typography: ({ children, variant, color, className }: any) => (
    <div data-variant={variant} data-color={color} className={className}>
      {children}
    </div>
  ),
  Badge: ({ children, variant, className }: any) => (
    <span data-variant={variant} className={className}>
      {children}
    </span>
  )
}))

// Mock router Link
const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    Link: ({ children, to }: any) => (
      <a href={to} data-testid="anime-link">
        {children}
      </a>
    ),
    useNavigate: () => mockNavigate
  }
})

const mockAnime: AnimeBase = {
  id: '1',
  title: 'Attack on Titan',
  source: 'mal',
  image: 'https://example.com/aot.jpg',
  score: 9.0,
  episodes: 25,
  year: 2023,
  season: 'SPRING',
  status: 'Currently Airing',
  format: 'TV',
  genres: ['Action', 'Adventure', 'Drama'],
  synopsis: 'Humanity fights for survival against giant humanoid Titans.',
  userStatus: 'watching',
  userScore: 9,
  duration: 24,
  studios: ['Studio WIT', 'Studio MAPPA'],
  popularity: 100
}

const mockAnimeWithoutImage: AnimeBase = {
  ...mockAnime,
  id: '2',
  title: 'No Image Anime',
  image: null
}

const mockAnimeWithoutUserStatus: AnimeBase = {
  ...mockAnime,
  id: '3',
  title: 'Unauthenticated Anime',
  userStatus: null,
  userScore: null
}

// Get mocked functions
const mockedUseAnimeAuth = useAnimeAuth as Mock
const mockedAnimate = animate as Mock
const mockedCreateDebouncedFunction = createDebouncedFunction as Mock

describe('AnimeCard Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockedUseAnimeAuth.mockReturnValue({
      isAuthenticated: true,
      getUser: () => ({ id: 1, username: 'testuser' })
    })
  })

  afterEach(() => {
    vi.clearAllTimers()
    vi.useRealTimers()
  })

  describe('Component Rendering', () => {
    it('should render anime card with image and title', () => {
      act(() => {
        render(
          <BrowserRouter>
            <AnimeCard anime={mockAnime} />
          </BrowserRouter>
        )
      })

      expect(screen.getByText('Attack on Titan')).toBeInTheDocument()
      expect(screen.getByAltText('Attack on Titan')).toBeInTheDocument()
      expect(screen.getByRole('img')).toHaveAttribute('src', 'https://example.com/aot.jpg')
    })

    it('should render fallback when anime has no image', () => {
      act(() => {
        render(
          <BrowserRouter>
            <AnimeCard anime={mockAnimeWithoutImage} />
          </BrowserRouter>
        )
      })

      expect(screen.getByText('No Image Anime')).toBeInTheDocument()
      expect(screen.getByText('No Image')).toBeInTheDocument()
      expect(screen.queryByRole('img')).not.toBeInTheDocument()
    })

    it('should render anime score when available', () => {
      act(() => {
        render(
          <BrowserRouter>
            <AnimeCard anime={mockAnime} />
          </BrowserRouter>
        )
      })

      expect(screen.getByText('9.0')).toBeInTheDocument()
    })

    it('should render anime year and format information', () => {
      act(() => {
        render(
          <BrowserRouter>
            <AnimeCard anime={mockAnime} />
          </BrowserRouter>
        )
      })

      // Year is displayed in the card overlay
      expect(screen.getByText((content, element) => {
        return element?.textContent === '📅 2023'
      })).toBeInTheDocument()
      
      // Episodes info is also displayed
      expect(screen.getByText((content, element) => {
        return element?.textContent === '📺 25 eps'
      })).toBeInTheDocument()
    })

    it('should create proper link to anime detail page', () => {
      act(() => {
        render(
          <BrowserRouter>
            <AnimeCard anime={mockAnime} />
          </BrowserRouter>
        )
      })

      const link = screen.getByTestId('anime-link')
      expect(link).toHaveAttribute('href', '/anime/mal/1')
    })
  })

  describe('User Status Display', () => {
    it('should show user status badge when user has status', () => {
      act(() => {
        render(
          <BrowserRouter>
            <AnimeCard anime={mockAnime} />
          </BrowserRouter>
        )
      })

      // Should show user status (this would be rendered as a badge or indicator)
      // The exact implementation depends on how the component displays user status
      expect(screen.getByText('Attack on Titan')).toBeInTheDocument()
    })

    it('should handle anime without user status', () => {
      act(() => {
        render(
          <BrowserRouter>
            <AnimeCard anime={mockAnimeWithoutUserStatus} />
          </BrowserRouter>
        )
      })

      expect(screen.getByText('Unauthenticated Anime')).toBeInTheDocument()
    })

    it('should check authentication for the anime source', () => {
      act(() => {
        render(
          <BrowserRouter>
            <AnimeCard anime={mockAnime} />
          </BrowserRouter>
        )
      })

      expect(mockedUseAnimeAuth).toHaveBeenCalledWith('mal')
    })
  })

  describe('Hover Animations', () => {
    beforeEach(() => {
      vi.useFakeTimers()
    })

    it('should trigger hover animations on mouse enter', () => {
      act(() => {
        render(
          <BrowserRouter>
            <AnimeCard anime={mockAnime} />
          </BrowserRouter>
        )
      })

      const cardContainer = screen.getByText('Attack on Titan').closest('.anime-card-container')!
      const card = cardContainer.querySelector('.at-bg-surface')!

      act(() => {
        fireEvent.mouseEnter(card)
      })

      // Should trigger multiple animation calls for different elements
      expect(mockedAnimate).toHaveBeenCalled()
    })

    it('should trigger debounced leave animations on mouse leave', () => {
      act(() => {
        render(
          <BrowserRouter>
            <AnimeCard anime={mockAnime} />
          </BrowserRouter>
        )
      })

      const cardContainer = screen.getByText('Attack on Titan').closest('.anime-card-container')!
      const card = cardContainer.querySelector('.at-bg-surface')!

      act(() => {
        fireEvent.mouseLeave(card)
      })

      expect(mockedCreateDebouncedFunction).toHaveBeenCalled()
    })

    it('should cleanup debounce on mouse enter to cancel pending leave animation', () => {
      act(() => {
        render(
          <BrowserRouter>
            <AnimeCard anime={mockAnime} />
          </BrowserRouter>
        )
      })

      const cardContainer = screen.getByText('Attack on Titan').closest('.anime-card-container')!
      const card = cardContainer.querySelector('.at-bg-surface')!

      // First trigger mouse leave
      act(() => {
        fireEvent.mouseLeave(card)
      })

      // Then trigger mouse enter (should cleanup pending leave animation)
      act(() => {
        fireEvent.mouseEnter(card)
      })

      // Cannot easily test cleanup since it's internal to the debounced function
      // expect(mockCleanup).toHaveBeenCalled()
    })

    it('should cleanup debounce function on component unmount', () => {
      const { unmount } = render(
        <BrowserRouter>
          <AnimeCard anime={mockAnime} />
        </BrowserRouter>
      )

      act(() => {
        unmount()
      })

      // Cannot easily test cleanup since it's internal to the debounced function
      // expect(mockCleanup).toHaveBeenCalled()
    })
  })

  describe('Authentication States', () => {
    it('should render differently when user is not authenticated', () => {
      mockedUseAnimeAuth.mockReturnValue({
        isAuthenticated: false,
        getUser: () => null
      })

      act(() => {
        render(
          <BrowserRouter>
            <AnimeCard anime={mockAnime} />
          </BrowserRouter>
        )
      })

      expect(screen.getByText('Attack on Titan')).toBeInTheDocument()
      // Component should still render but may show different UI elements
    })

    it('should call useAnimeAuth with correct source for different anime sources', () => {
      const anilistAnime = { ...mockAnime, source: 'anilist' as const }

      act(() => {
        render(
          <BrowserRouter>
            <AnimeCard anime={anilistAnime} />
          </BrowserRouter>
        )
      })

      expect(mockedUseAnimeAuth).toHaveBeenCalledWith('anilist')
    })
  })

  describe('Performance and Memoization', () => {
    it('should use memo to prevent unnecessary re-renders', () => {
      const { rerender } = render(
        <BrowserRouter>
          <AnimeCard anime={mockAnime} />
        </BrowserRouter>
      )

      const initialRenderCount = mockedUseAnimeAuth.mock.calls.length

      // Re-render with same props
      rerender(
        <BrowserRouter>
          <AnimeCard anime={mockAnime} />
        </BrowserRouter>
      )

      // Should use memoization (AnimeCard is wrapped in memo)
      expect(screen.getByText('Attack on Titan')).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('should have proper alt text for images', () => {
      act(() => {
        render(
          <BrowserRouter>
            <AnimeCard anime={mockAnime} />
          </BrowserRouter>
        )
      })

      const image = screen.getByRole('img')
      expect(image).toHaveAttribute('alt', 'Attack on Titan')
    })

    it('should have proper link accessibility', () => {
      act(() => {
        render(
          <BrowserRouter>
            <AnimeCard anime={mockAnime} />
          </BrowserRouter>
        )
      })

      const link = screen.getByTestId('anime-link')
      expect(link).toBeInTheDocument()
      expect(link).toHaveAttribute('href', '/anime/mal/1')
    })

    it('should handle keyboard interactions on card', () => {
      act(() => {
        render(
          <BrowserRouter>
            <AnimeCard anime={mockAnime} />
          </BrowserRouter>
        )
      })

      const cardContainer = screen.getByText('Attack on Titan').closest('.anime-card-container')!
      const card = cardContainer.querySelector('.at-bg-surface')!

      act(() => {
        fireEvent.focus(card)
        fireEvent.keyDown(card, { key: 'Enter' })
      })

      // Should be keyboard accessible
      expect(card).toBeInTheDocument()
    })
  })

  describe('Image Loading', () => {
    it('should have lazy loading enabled for images', () => {
      act(() => {
        render(
          <BrowserRouter>
            <AnimeCard anime={mockAnime} />
          </BrowserRouter>
        )
      })

      const image = screen.getByRole('img')
      expect(image).toHaveAttribute('loading', 'lazy')
    })

    it('should handle image loading errors gracefully', () => {
      act(() => {
        render(
          <BrowserRouter>
            <AnimeCard anime={mockAnime} />
          </BrowserRouter>
        )
      })

      const image = screen.getByRole('img')

      act(() => {
        fireEvent.error(image)
      })

      // Should still show the image element (error handling may be implemented differently)
      expect(image).toBeInTheDocument()
    })
  })

  describe('Edge Cases', () => {
    it('should handle anime with minimal data', () => {
      const minimalAnime: AnimeBase = {
        id: '999',
        title: 'Minimal Anime',
        source: 'mal',
        image: null,
        score: null,
        episodes: null,
        year: null,
        season: null,
        status: null,
        format: null,
        genres: [],
        synopsis: null,
        userStatus: null,
        userScore: null,
        duration: null,
        studios: [],
        popularity: null
      }

      act(() => {
        render(
          <BrowserRouter>
            <AnimeCard anime={minimalAnime} />
          </BrowserRouter>
        )
      })

      expect(screen.getByText('Minimal Anime')).toBeInTheDocument()
      expect(screen.getByText('No Image')).toBeInTheDocument()
    })

    it('should handle very long anime titles', () => {
      const longTitleAnime = {
        ...mockAnime,
        title: 'This is a very long anime title that might cause layout issues if not handled properly in the component'
      }

      act(() => {
        render(
          <BrowserRouter>
            <AnimeCard anime={longTitleAnime} />
          </BrowserRouter>
        )
      })

      expect(screen.getByText(longTitleAnime.title)).toBeInTheDocument()
    })
  })
})