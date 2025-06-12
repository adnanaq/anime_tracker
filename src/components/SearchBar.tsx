import { useState, useCallback } from 'react'
import { useAnimeStore } from '../store/animeStore'
import { Button } from './ui'

export const SearchBar = () => {
  const [query, setQuery] = useState('')
  const { searchAnime, clearSearch, loading } = useAnimeStore()

  const handleSearch = useCallback(
    async (searchQuery: string) => {
      if (searchQuery.trim()) {
        await searchAnime(searchQuery)
      } else {
        clearSearch()
      }
    },
    [searchAnime, clearSearch]
  )

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    handleSearch(query)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setQuery(value)
    
    // Clear search when input is empty
    if (!value.trim()) {
      clearSearch()
    }
  }

  const handleClear = () => {
    setQuery('')
    clearSearch()
  }

  return (
    <form onSubmit={handleSubmit} className="relative">
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={handleInputChange}
          placeholder="Search anime..."
          className="w-64 px-4 py-2 pl-10 pr-10 text-sm at-border at-bg-surface rounded-lg focus:ring-2 focus:at-border-focus focus:border-transparent at-transition-colors font-primary"
          disabled={loading.search}
        />
        
        {/* Search icon */}
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <svg
            className="h-4 w-4 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>

        {/* Clear button or loading spinner */}
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
          {loading.search ? (
            <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
          ) : query ? (
            <Button
              variant="ghost"
              size="xs"
              onClick={handleClear}
              className="!p-1 !h-auto !min-w-auto at-text-muted hover:at-text-secondary"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </Button>
          ) : null}
        </div>
      </div>
    </form>
  )
}