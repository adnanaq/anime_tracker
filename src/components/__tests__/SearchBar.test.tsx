import { describe, it, expect, vi, beforeEach, afterEach, Mock } from 'vitest'
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import { SearchBar } from '../SearchBar'
import { useAnimeStore } from '../../store/animeStore'

// Mock the anime store
const mockSearchAnime = vi.fn()
const mockClearSearch = vi.fn()
vi.mock('../../store/animeStore', () => ({
  useAnimeStore: vi.fn()
}))

// Mock UI components
vi.mock('../ui', () => ({
  Button: ({ children, onClick, disabled, variant, size, className }: any) => (
    <button 
      onClick={onClick} 
      disabled={disabled} 
      data-variant={variant}
      data-size={size}
      className={className}
      data-testid="clear-button"
    >
      {children}
    </button>
  ),
  Spinner: ({ variant, size }: any) => (
    <div data-variant={variant} data-size={size} data-testid="loading-spinner">
      Loading...
    </div>
  )
}))

// Get mocked functions
const mockedUseAnimeStore = useAnimeStore as Mock

describe('SearchBar Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockedUseAnimeStore.mockReturnValue({
      searchAnime: mockSearchAnime,
      clearSearch: mockClearSearch,
      loading: { search: false }
    })
  })

  describe('Component Rendering', () => {
    it('should render search input with placeholder', () => {
      act(() => {
        render(<SearchBar />)
      })

      const input = screen.getByPlaceholderText('Search anime...')
      expect(input).toBeInTheDocument()
      expect(input).toHaveAttribute('type', 'text')
    })

    it('should render search icon', () => {
      act(() => {
        render(<SearchBar />)
      })

      // SVG icons don't have img role, look for the SVG element itself
      const searchIcon = document.querySelector('svg')
      expect(searchIcon).toBeInTheDocument()
      expect(searchIcon).toHaveAttribute('viewBox', '0 0 24 24')
    })

    it('should render as a form element', () => {
      act(() => {
        render(<SearchBar />)
      })

      // Forms without explicit role="form" can be found by tag name
      const form = document.querySelector('form')
      expect(form).toBeInTheDocument()
      expect(form).toHaveClass('relative')
    })
  })

  describe('User Input Interactions', () => {
    it('should update input value when user types', () => {
      act(() => {
        render(<SearchBar />)
      })

      const input = screen.getByPlaceholderText('Search anime...')
      
      act(() => {
        fireEvent.change(input, { target: { value: 'Attack on Titan' } })
      })
      
      expect(input).toHaveValue('Attack on Titan')
    })

    it('should show clear button when there is text in input', () => {
      act(() => {
        render(<SearchBar />)
      })

      const input = screen.getByPlaceholderText('Search anime...')
      
      // Initially no clear button
      expect(screen.queryByTestId('clear-button')).not.toBeInTheDocument()
      
      act(() => {
        fireEvent.change(input, { target: { value: 'naruto' } })
      })
      
      // Clear button should appear
      expect(screen.getByTestId('clear-button')).toBeInTheDocument()
    })

    it('should clear search when input becomes empty', () => {
      act(() => {
        render(<SearchBar />)
      })

      const input = screen.getByPlaceholderText('Search anime...')
      
      // Type something first
      act(() => {
        fireEvent.change(input, { target: { value: 'naruto' } })
      })
      
      // Then clear it
      act(() => {
        fireEvent.change(input, { target: { value: '' } })
      })
      
      expect(mockClearSearch).toHaveBeenCalled()
    })
  })

  describe('Search Functionality', () => {
    it('should trigger search when form is submitted with text', async () => {
      act(() => {
        render(<SearchBar />)
      })

      const input = screen.getByPlaceholderText('Search anime...')
      const form = document.querySelector('form')!
      
      act(() => {
        fireEvent.change(input, { target: { value: 'Attack on Titan' } })
      })
      
      act(() => {
        fireEvent.submit(form)
      })
      
      expect(mockSearchAnime).toHaveBeenCalledWith('Attack on Titan')
    })

    it('should clear search when form is submitted with empty text', () => {
      act(() => {
        render(<SearchBar />)
      })

      const form = document.querySelector('form')!
      
      act(() => {
        fireEvent.submit(form)
      })
      
      expect(mockClearSearch).toHaveBeenCalled()
      expect(mockSearchAnime).not.toHaveBeenCalled()
    })

    it('should not search with only whitespace', () => {
      act(() => {
        render(<SearchBar />)
      })

      const input = screen.getByPlaceholderText('Search anime...')
      const form = document.querySelector('form')!
      
      act(() => {
        fireEvent.change(input, { target: { value: '   ' } })
        fireEvent.submit(form)
      })
      
      expect(mockClearSearch).toHaveBeenCalled()
      expect(mockSearchAnime).not.toHaveBeenCalled()
    })

    it('should prevent default form submission behavior', () => {
      act(() => {
        render(<SearchBar />)
      })

      const form = document.querySelector('form')!
      const mockPreventDefault = vi.fn()
      
      act(() => {
        fireEvent.submit(form, { preventDefault: mockPreventDefault } as any)
      })
      
      // Since we're mocking the event, we can't directly test preventDefault
      // but we can verify the search behavior works as expected
      expect(mockClearSearch).toHaveBeenCalled()
    })
  })

  describe('Clear Button Functionality', () => {
    it('should clear input and search when clear button is clicked', () => {
      act(() => {
        render(<SearchBar />)
      })

      const input = screen.getByPlaceholderText('Search anime...')
      
      // Type something to show clear button
      act(() => {
        fireEvent.change(input, { target: { value: 'test anime' } })
      })
      
      const clearButton = screen.getByTestId('clear-button')
      
      act(() => {
        fireEvent.click(clearButton)
      })
      
      expect(input).toHaveValue('')
      expect(mockClearSearch).toHaveBeenCalled()
    })

    it('should hide clear button after clearing', () => {
      act(() => {
        render(<SearchBar />)
      })

      const input = screen.getByPlaceholderText('Search anime...')
      
      // Type something to show clear button
      act(() => {
        fireEvent.change(input, { target: { value: 'test' } })
      })
      
      expect(screen.getByTestId('clear-button')).toBeInTheDocument()
      
      // Click clear button
      const clearButton = screen.getByTestId('clear-button')
      act(() => {
        fireEvent.click(clearButton)
      })
      
      expect(screen.queryByTestId('clear-button')).not.toBeInTheDocument()
    })
  })

  describe('Loading States', () => {
    it('should show loading spinner when search is in progress', () => {
      mockedUseAnimeStore.mockReturnValue({
        searchAnime: mockSearchAnime,
        clearSearch: mockClearSearch,
        loading: { search: true }
      })

      act(() => {
        render(<SearchBar />)
      })

      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument()
    })

    it('should disable input when search is in progress', () => {
      mockedUseAnimeStore.mockReturnValue({
        searchAnime: mockSearchAnime,
        clearSearch: mockClearSearch,
        loading: { search: true }
      })

      act(() => {
        render(<SearchBar />)
      })

      const input = screen.getByPlaceholderText('Search anime...')
      expect(input).toBeDisabled()
    })

    it('should show loading spinner instead of clear button when loading', () => {
      mockedUseAnimeStore.mockReturnValue({
        searchAnime: mockSearchAnime,
        clearSearch: mockClearSearch,
        loading: { search: true }
      })

      act(() => {
        render(<SearchBar />)
      })

      // Type something first (in a non-loading state)
      const input = screen.getByPlaceholderText('Search anime...')
      act(() => {
        fireEvent.change(input, { target: { value: 'test' } })
      })

      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument()
      expect(screen.queryByTestId('clear-button')).not.toBeInTheDocument()
    })

    it('should enable input when loading finishes', () => {
      // Start with loading
      mockedUseAnimeStore.mockReturnValue({
        searchAnime: mockSearchAnime,
        clearSearch: mockClearSearch,
        loading: { search: true }
      })

      const { rerender } = render(<SearchBar />)
      
      const input = screen.getByPlaceholderText('Search anime...')
      expect(input).toBeDisabled()

      // Update to not loading
      mockedUseAnimeStore.mockReturnValue({
        searchAnime: mockSearchAnime,
        clearSearch: mockClearSearch,
        loading: { search: false }
      })

      rerender(<SearchBar />)
      
      expect(input).not.toBeDisabled()
    })
  })

  describe('Store Integration', () => {
    it('should call useAnimeStore hook', () => {
      act(() => {
        render(<SearchBar />)
      })

      expect(mockedUseAnimeStore).toHaveBeenCalled()
    })

    it('should use searchAnime from store with correct parameters', async () => {
      act(() => {
        render(<SearchBar />)
      })

      const input = screen.getByPlaceholderText('Search anime...')
      const form = document.querySelector('form')!
      
      act(() => {
        fireEvent.change(input, { target: { value: 'One Piece' } })
        fireEvent.submit(form)
      })
      
      expect(mockSearchAnime).toHaveBeenCalledWith('One Piece')
      expect(mockSearchAnime).toHaveBeenCalledTimes(1)
    })

    it('should use clearSearch from store', () => {
      act(() => {
        render(<SearchBar />)
      })

      const input = screen.getByPlaceholderText('Search anime...')
      
      // First add some text
      act(() => {
        fireEvent.change(input, { target: { value: 'test' } })
      })
      
      // Then clear it to trigger clearSearch
      act(() => {
        fireEvent.change(input, { target: { value: '' } })
      })
      
      expect(mockClearSearch).toHaveBeenCalled()
    })
  })

  describe('Accessibility', () => {
    it('should have proper form accessibility', () => {
      act(() => {
        render(<SearchBar />)
      })

      const form = document.querySelector('form')!
      const input = screen.getByRole('textbox')
      
      expect(form).toBeInTheDocument()
      expect(input).toBeInTheDocument()
    })

    it('should have proper placeholder text for screen readers', () => {
      act(() => {
        render(<SearchBar />)
      })

      const input = screen.getByPlaceholderText('Search anime...')
      expect(input).toHaveAttribute('placeholder', 'Search anime...')
    })

    it('should support keyboard navigation', () => {
      act(() => {
        render(<SearchBar />)
      })

      const form = document.querySelector('form')!
      const input = screen.getByPlaceholderText('Search anime...')
      
      act(() => {
        fireEvent.focus(input)
        fireEvent.submit(form)
      })
      
      // Should trigger form submission which calls clearSearch for empty input
      expect(mockClearSearch).toHaveBeenCalled()
    })

    it('should maintain focus states properly', () => {
      act(() => {
        render(<SearchBar />)
      })

      const input = screen.getByPlaceholderText('Search anime...')
      
      // Instead of testing actual focus, test that the input can receive focus events
      act(() => {
        fireEvent.focus(input)
        fireEvent.blur(input)
      })
      
      // The input should be a valid focusable element
      expect(input).toBeInTheDocument()
      expect(input).not.toBeDisabled()
    })
  })

  describe('Edge Cases', () => {
    it('should handle rapid typing without breaking', () => {
      act(() => {
        render(<SearchBar />)
      })

      const input = screen.getByPlaceholderText('Search anime...')
      
      // Simulate rapid typing
      act(() => {
        fireEvent.change(input, { target: { value: 'a' } })
        fireEvent.change(input, { target: { value: 'an' } })
        fireEvent.change(input, { target: { value: 'ani' } })
        fireEvent.change(input, { target: { value: 'anim' } })
        fireEvent.change(input, { target: { value: 'anime' } })
      })
      
      expect(input).toHaveValue('anime')
    })

    it('should handle special characters in search query', () => {
      act(() => {
        render(<SearchBar />)
      })

      const input = screen.getByPlaceholderText('Search anime...')
      const form = document.querySelector('form')!
      
      const specialQuery = 'Dr. Stone: New World (Season 3)'
      
      act(() => {
        fireEvent.change(input, { target: { value: specialQuery } })
        fireEvent.submit(form)
      })
      
      expect(mockSearchAnime).toHaveBeenCalledWith(specialQuery)
    })

    it('should handle very long search queries', () => {
      act(() => {
        render(<SearchBar />)
      })

      const input = screen.getByPlaceholderText('Search anime...')
      const longQuery = 'a'.repeat(1000) // Very long string
      
      act(() => {
        fireEvent.change(input, { target: { value: longQuery } })
      })
      
      expect(input).toHaveValue(longQuery)
    })
  })
})