import { describe, it, expect, vi, beforeEach, afterEach, Mock } from 'vitest'
import { render, screen, fireEvent, waitFor, within, act } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { AdvancedSearch } from '../AdvancedSearch'
import { malService } from '../../../services/mal'

// Mock the MAL service
vi.mock('../../../services/mal', () => ({
  malService: {
    getGenres: vi.fn(),
    searchAnime: vi.fn()
  }
}))

// Mock the ExpandableGrid component
vi.mock('../../ExpandableGrid', () => ({
  ExpandableGrid: ({ anime, title }: { anime: any[], title?: string }) => (
    <div data-testid="expandable-grid">
      {title && <h3>{title}</h3>}
      {anime.map((item, index) => (
        <div key={index} data-testid={`anime-${item.id}`}>
          {item.title}
        </div>
      ))}
    </div>
  )
}))

// Mock the UI components to match what's actually used
vi.mock('../../ui', () => ({
  Typography: ({ children, variant, className, color }: any) => (
    <div data-variant={variant} data-color={color} className={className}>
      {children}
    </div>
  ),
  Button: ({ children, onClick, disabled, variant, className }: any) => (
    <button 
      onClick={onClick} 
      disabled={disabled} 
      data-variant={variant} 
      className={className}
      data-testid="button"
    >
      {children}
    </button>
  ),
  AnimeGridSkeleton: () => <div data-testid="loading-skeleton">Loading...</div>,
  Spinner: ({ className }: any) => <div data-testid="spinner" className={className}>Spinning...</div>
}))

const mockGenres = [
  { mal_id: 1, name: 'Action' },
  { mal_id: 2, name: 'Adventure' },
  { mal_id: 8, name: 'Drama' },
  { mal_id: 22, name: 'Romance' }
]

const mockSearchResults = [
  {
    id: '1',
    title: 'Attack on Titan',
    source: 'mal',
    image: 'https://example.com/aot.jpg',
    score: 9.0,
    episodes: 25,
    year: 2013,
    status: 'Completed',
    format: 'TV',
    genres: ['Action', 'Drama'],
    synopsis: 'Humanity fights for survival against giant humanoid Titans.'
  },
  {
    id: '2', 
    title: 'Death Note',
    source: 'mal',
    image: 'https://example.com/deathnote.jpg',
    score: 9.0,
    episodes: 37,
    year: 2006,
    status: 'Completed',
    format: 'TV',
    genres: ['Supernatural', 'Thriller'],
    synopsis: 'A high school student discovers a supernatural notebook.'
  }
]

// Get mocked functions
const mockedMalService = malService as {
  getGenres: Mock
  searchAnime: Mock
}

describe('AdvancedSearch Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockedMalService.getGenres.mockResolvedValue(mockGenres)
    mockedMalService.searchAnime.mockResolvedValue(mockSearchResults)
  })

  describe('Component Rendering', () => {
    it('should render the advanced search header', () => {
      act(() => {
        render(
          <BrowserRouter>
            <AdvancedSearch />
          </BrowserRouter>
        )
      })

      expect(screen.getByText('🔍 Advanced Search')).toBeInTheDocument()
      expect(screen.getByText('🌐')).toBeInTheDocument()
      expect(screen.getByText('Powered by MyAnimeList')).toBeInTheDocument()
    })

    it('should render all search form fields', () => {
      act(() => {
        render(
          <BrowserRouter>
            <AdvancedSearch />
          </BrowserRouter>
        )
      })

      // Check for search query input
      expect(screen.getByPlaceholderText('Enter anime title, character, or keyword...')).toBeInTheDocument()
      
      // Check for filter labels
      expect(screen.getByText('Search Query')).toBeInTheDocument()
      expect(screen.getByText('Type')).toBeInTheDocument()
      expect(screen.getByText('Status')).toBeInTheDocument()
      expect(screen.getByText('Rating')).toBeInTheDocument()
      expect(screen.getByText('Genre')).toBeInTheDocument()
    })

    it('should render search and reset buttons', () => {
      act(() => {
        render(
          <BrowserRouter>
            <AdvancedSearch />
          </BrowserRouter>
        )
      })

      expect(screen.getByText('Search Anime')).toBeInTheDocument()
      expect(screen.getByText('Reset Filters')).toBeInTheDocument()
    })

    it('should load and display genres in the genre dropdown', async () => {
      act(() => {
        render(
          <BrowserRouter>
            <AdvancedSearch />
          </BrowserRouter>
        )
      })

      // Wait for genres to load
      await waitFor(() => {
        expect(mockedMalService.getGenres).toHaveBeenCalled()
      })

      // Check if genre options are available by looking for genre names
      await waitFor(() => {
        expect(screen.getByText('Action')).toBeInTheDocument()
        expect(screen.getByText('Adventure')).toBeInTheDocument()
        expect(screen.getByText('Drama')).toBeInTheDocument()
        expect(screen.getByText('Romance')).toBeInTheDocument()
      })
    })
  })

  describe('User Interactions', () => {
    it('should update search query when user types', () => {
      act(() => {
        render(
          <BrowserRouter>
            <AdvancedSearch />
          </BrowserRouter>
        )
      })

      const queryInput = screen.getByPlaceholderText('Enter anime title, character, or keyword...')
      
      act(() => {
        fireEvent.change(queryInput, { target: { value: 'Attack on Titan' } })
      })
      
      expect(queryInput).toHaveValue('Attack on Titan')
    })

    it('should update filters when user selects options', () => {
      act(() => {
        render(
          <BrowserRouter>
            <AdvancedSearch />
          </BrowserRouter>
        )
      })

      const typeSelect = screen.getAllByRole('combobox')[0]  // First select is type
      const statusSelect = screen.getAllByRole('combobox')[1] // Second select is status
      
      act(() => {
        fireEvent.change(typeSelect, { target: { value: 'tv' } })
        fireEvent.change(statusSelect, { target: { value: 'complete' } })
      })
      
      expect(typeSelect).toHaveValue('tv')
      expect(statusSelect).toHaveValue('complete')
    })

    it('should trigger search when search button is clicked', async () => {
      act(() => {
        render(
          <BrowserRouter>
            <AdvancedSearch />
          </BrowserRouter>
        )
      })

      const searchButton = screen.getByText('Search Anime')
      
      act(() => {
        fireEvent.click(searchButton)
      })
      
      await waitFor(() => {
        expect(mockedMalService.searchAnime).toHaveBeenCalled()
      })
    })

    it('should clear all filters when reset button is clicked', () => {
      act(() => {
        render(
          <BrowserRouter>
            <AdvancedSearch />
          </BrowserRouter>
        )
      })

      // Set some values first
      const queryInput = screen.getByPlaceholderText('Enter anime title, character, or keyword...')
      const typeSelect = screen.getAllByRole('combobox')[0]
      
      act(() => {
        fireEvent.change(queryInput, { target: { value: 'Test Query' } })
        fireEvent.change(typeSelect, { target: { value: 'tv' } })
      })
      
      expect(queryInput).toHaveValue('Test Query')
      expect(typeSelect).toHaveValue('tv')
      
      // Click reset button
      const resetButton = screen.getByText('Reset Filters')
      act(() => {
        fireEvent.click(resetButton)
      })
      
      // Values should be reset
      expect(queryInput).toHaveValue('')
      expect(typeSelect).toHaveValue('')
    })
  })

  describe('Search UI States', () => {
    it('should display loading state during search', async () => {
      // Make search take some time
      mockedMalService.searchAnime.mockImplementation(() => 
        new Promise(resolve => setTimeout(() => resolve(mockSearchResults), 100))
      )

      act(() => {
        render(
          <BrowserRouter>
            <AdvancedSearch />
          </BrowserRouter>
        )
      })

      const searchButton = screen.getByText('Search Anime')
      
      act(() => {
        fireEvent.click(searchButton)
      })
      
      // Should show loading state
      expect(screen.getByTestId('loading-skeleton')).toBeInTheDocument()
      
      // Wait for search to complete
      await waitFor(() => {
        expect(screen.queryByTestId('loading-skeleton')).not.toBeInTheDocument()
      })
    })

    it('should display search results in expandable grid', async () => {
      act(() => {
        render(
          <BrowserRouter>
            <AdvancedSearch />
          </BrowserRouter>
        )
      })

      const searchButton = screen.getByText('Search Anime')
      
      act(() => {
        fireEvent.click(searchButton)
      })
      
      await waitFor(() => {
        expect(screen.getByTestId('expandable-grid')).toBeInTheDocument()
        expect(screen.getByTestId('anime-1')).toBeInTheDocument()
        expect(screen.getByTestId('anime-2')).toBeInTheDocument()
        expect(screen.getByText('Attack on Titan')).toBeInTheDocument()
        expect(screen.getByText('Death Note')).toBeInTheDocument()
      })
    })

    it('should show error message when search fails', async () => {
      mockedMalService.searchAnime.mockRejectedValue(new Error('Search failed'))

      act(() => {
        render(
          <BrowserRouter>
            <AdvancedSearch />
          </BrowserRouter>
        )
      })

      const searchButton = screen.getByText('Search Anime')
      
      act(() => {
        fireEvent.click(searchButton)
      })
      
      await waitFor(() => {
        expect(screen.getByText('Search failed. Please try again.')).toBeInTheDocument()
      })
    })

    it('should show no results message when search returns empty', async () => {
      mockedMalService.searchAnime.mockResolvedValue([])

      act(() => {
        render(
          <BrowserRouter>
            <AdvancedSearch />
          </BrowserRouter>
        )
      })

      const searchButton = screen.getByText('Search Anime')
      
      act(() => {
        fireEvent.click(searchButton)
      })
      
      await waitFor(() => {
        expect(screen.getByText('No Results Found')).toBeInTheDocument()
      })
    })
  })

  describe('Conditional UI States', () => {
    it('should not show results section before first search', () => {
      act(() => {
        render(
          <BrowserRouter>
            <AdvancedSearch />
          </BrowserRouter>
        )
      })

      expect(screen.queryByTestId('expandable-grid')).not.toBeInTheDocument()
      expect(screen.getByText('Advanced Anime Search')).toBeInTheDocument() // Shows initial state
    })

    it('should disable search button while loading', async () => {
      mockedMalService.searchAnime.mockImplementation(() => 
        new Promise(resolve => setTimeout(() => resolve(mockSearchResults), 100))
      )

      act(() => {
        render(
          <BrowserRouter>
            <AdvancedSearch />
          </BrowserRouter>
        )
      })

      const searchButton = screen.getByText('Search Anime')
      
      act(() => {
        fireEvent.click(searchButton)
      })
      
      expect(searchButton).toBeDisabled()
      
      await waitFor(() => {
        expect(searchButton).not.toBeDisabled()
      })
    })

    it('should show loading text during search', async () => {
      mockedMalService.searchAnime.mockImplementation(() => 
        new Promise(resolve => setTimeout(() => resolve(mockSearchResults), 100))
      )

      act(() => {
        render(
          <BrowserRouter>
            <AdvancedSearch />
          </BrowserRouter>
        )
      })

      const searchButton = screen.getByText('Search Anime')
      
      act(() => {
        fireEvent.click(searchButton)
      })
      
      expect(screen.getByText('Searching...')).toBeInTheDocument()
      expect(screen.getByTestId('spinner')).toBeInTheDocument()
      
      await waitFor(() => {
        expect(screen.queryByText('Searching...')).not.toBeInTheDocument()
        expect(screen.queryByTestId('spinner')).not.toBeInTheDocument()
      })
    })
  })

  describe('Accessibility', () => {
    it('should have proper form inputs with labels', () => {
      act(() => {
        render(
          <BrowserRouter>
            <AdvancedSearch />
          </BrowserRouter>
        )
      })

      const queryInput = screen.getByPlaceholderText('Enter anime title, character, or keyword...')
      expect(queryInput).toHaveAttribute('type', 'text')
      
      // Check that form inputs exist
      const selects = screen.getAllByRole('combobox')
      expect(selects).toHaveLength(4) // type, status, rating, genre
    })

    it('should have proper button roles and text', () => {
      act(() => {
        render(
          <BrowserRouter>
            <AdvancedSearch />
          </BrowserRouter>
        )
      })

      const searchButton = screen.getByRole('button', { name: /search anime/i })
      const resetButton = screen.getByRole('button', { name: /reset filters/i })
      
      expect(searchButton).toBeInTheDocument()
      expect(resetButton).toBeInTheDocument()
    })
  })
})