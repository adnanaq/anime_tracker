import { create } from 'zustand'
import { AnimeBase, AnimeSource } from '../types/anime'
import { animeService } from '../services/animeService'

interface AnimeStore {
  // Source management
  currentSource: AnimeSource
  setSource: (source: AnimeSource) => void

  // Anime data
  trendingAnime: AnimeBase[]
  popularAnime: AnimeBase[]
  topRatedAnime: AnimeBase[]
  currentSeasonAnime: AnimeBase[]
  searchResults: AnimeBase[]

  // Loading states
  loading: {
    trending: boolean
    popular: boolean
    topRated: boolean
    currentSeason: boolean
    search: boolean
  }

  // Actions
  fetchTrendingAnime: () => Promise<void>
  fetchPopularAnime: () => Promise<void>
  fetchTopRatedAnime: () => Promise<void>
  fetchCurrentSeasonAnime: () => Promise<void>
  searchAnime: (query: string) => Promise<void>
  clearSearch: () => void
}

export const useAnimeStore = create<AnimeStore>((set) => ({
  // Initial state
  currentSource: 'mal',
  trendingAnime: [],
  popularAnime: [],
  topRatedAnime: [],
  currentSeasonAnime: [],
  searchResults: [],
  loading: {
    trending: false,
    popular: false,
    topRated: false,
    currentSeason: false,
    search: false
  },

  // Actions
  setSource: (source: AnimeSource) => {
    animeService.setSource(source)
    set({ currentSource: source })
    
    // Clear existing data when switching sources
    set({
      trendingAnime: [],
      popularAnime: [],
      topRatedAnime: [],
      currentSeasonAnime: [],
      searchResults: []
    })
  },

  fetchTrendingAnime: async () => {
    set(state => ({ loading: { ...state.loading, trending: true } }))
    try {
      const anime = await animeService.getTrendingAnime()
      set({ trendingAnime: anime })
    } catch (error) {
      // Error handling - trending anime fetch failed
    } finally {
      set(state => ({ loading: { ...state.loading, trending: false } }))
    }
  },

  fetchPopularAnime: async () => {
    set(state => ({ loading: { ...state.loading, popular: true } }))
    try {
      const anime = await animeService.getPopularAnime()
      set({ popularAnime: anime })
    } catch (error) {
      // Error handling - popular anime fetch failed
    } finally {
      set(state => ({ loading: { ...state.loading, popular: false } }))
    }
  },

  fetchTopRatedAnime: async () => {
    set(state => ({ loading: { ...state.loading, topRated: true } }))
    try {
      const anime = await animeService.getTopRatedAnime()
      set({ topRatedAnime: anime })
    } catch (error) {
      // Error handling - top rated anime fetch failed
    } finally {
      set(state => ({ loading: { ...state.loading, topRated: false } }))
    }
  },

  fetchCurrentSeasonAnime: async () => {
    set(state => ({ loading: { ...state.loading, currentSeason: true } }))
    try {
      const anime = await animeService.getCurrentSeasonAnime()
      set({ currentSeasonAnime: anime })
    } catch (error) {
      // Error handling - current season anime fetch failed
    } finally {
      set(state => ({ loading: { ...state.loading, currentSeason: false } }))
    }
  },

  searchAnime: async (query: string) => {
    if (!query.trim()) {
      set({ searchResults: [] })
      return
    }

    set(state => ({ loading: { ...state.loading, search: true } }))
    try {
      const anime = await animeService.searchAnime(query)
      set({ searchResults: anime })
    } catch (error) {
      // Error handling - anime search failed
    } finally {
      set(state => ({ loading: { ...state.loading, search: false } }))
    }
  },

  clearSearch: () => {
    set({ searchResults: [] })
  }
}))