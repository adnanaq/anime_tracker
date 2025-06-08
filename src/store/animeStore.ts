import { create } from 'zustand'
import { AnimeBase, AnimeSource } from '../types/anime'
import { animeService } from '../services/animeService'
import { getAuthService } from '../services/auth'
import { anilistService } from '../services/anilistApiFetch'
import { malService } from '../services/malApi'

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
  currentlyWatching: AnimeBase[]

  // User data
  userAnimeScores: Map<number, number>
  
  // Loading states
  loading: {
    trending: boolean
    popular: boolean
    topRated: boolean
    currentSeason: boolean
    search: boolean
    userScores: boolean
    currentlyWatching: boolean
  }

  // Actions
  fetchTrendingAnime: () => Promise<void>
  fetchPopularAnime: () => Promise<void>
  fetchTopRatedAnime: () => Promise<void>
  fetchCurrentSeasonAnime: () => Promise<void>
  searchAnime: (query: string) => Promise<void>
  clearSearch: () => void
  fetchUserScores: () => Promise<void>
  fetchCurrentlyWatching: () => Promise<void>
  mergeUserScores: (animeList: AnimeBase[]) => AnimeBase[]
}

export const useAnimeStore = create<AnimeStore>((set, get) => ({
  // Initial state
  currentSource: 'mal',
  trendingAnime: [],
  popularAnime: [],
  topRatedAnime: [],
  currentSeasonAnime: [],
  searchResults: [],
  currentlyWatching: [],
  userAnimeScores: new Map<number, number>(),
  loading: {
    trending: false,
    popular: false,
    topRated: false,
    currentSeason: false,
    search: false,
    userScores: false,
    currentlyWatching: false
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
      searchResults: [],
      currentlyWatching: []
    })
  },

  fetchTrendingAnime: async () => {
    set(state => ({ loading: { ...state.loading, trending: true } }))
    try {
      const anime = await animeService.getTrendingAnime()
      const animeWithUserScores = get().mergeUserScores(anime)
      set({ trendingAnime: animeWithUserScores })
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
      const animeWithUserScores = get().mergeUserScores(anime)
      set({ popularAnime: animeWithUserScores })
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
      const animeWithUserScores = get().mergeUserScores(anime)
      set({ topRatedAnime: animeWithUserScores })
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
      const animeWithUserScores = get().mergeUserScores(anime)
      set({ currentSeasonAnime: animeWithUserScores })
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
      const animeWithUserScores = get().mergeUserScores(anime)
      set({ searchResults: animeWithUserScores })
    } catch (error) {
      // Error handling - anime search failed
    } finally {
      set(state => ({ loading: { ...state.loading, search: false } }))
    }
  },

  clearSearch: () => {
    set({ searchResults: [] })
  },

  fetchUserScores: async () => {
    const { currentSource } = get()
    
    // Use the correct auth service
    const authServiceInstance = getAuthService(currentSource)
    if (!authServiceInstance) {
      return
    }
    
    // Debug authentication status
    const isAuth = authServiceInstance.isAuthenticated()
    
    if (!isAuth) {
      return
    }

    set(state => ({ loading: { ...state.loading, userScores: true } }))
    
    try {
      const tokenObj = authServiceInstance.getToken()
      if (!tokenObj) {
        return
      }
      
      const token = tokenObj.access_token

      let userScoreMap: Map<number, number>

      if (currentSource === 'anilist') {
        const user = await anilistService.getCurrentUser(token)
        userScoreMap = await anilistService.getUserAnimeList(user.id)
      } else {
        // For MAL, we need to fetch user scores for each anime individually
        const state = get()
        const allAnime = [
          ...state.trendingAnime,
          ...state.popularAnime,
          ...state.topRatedAnime,
          ...state.currentSeasonAnime,
          ...state.searchResults
        ]
        
        // Get unique anime IDs
        const animeIds = [...new Set(allAnime.map(anime => anime.id))]
        
        // Only fetch if we have anime to check
        if (animeIds.length > 0) {
          userScoreMap = await malService.getUserScoresForAnime(animeIds, token)
        } else {
          userScoreMap = new Map()
        }
      }

      set({ userAnimeScores: userScoreMap })
      
      // Re-merge user scores with existing anime data
      const state = get()
      const updatedData = {
        trendingAnime: state.mergeUserScores(state.trendingAnime),
        popularAnime: state.mergeUserScores(state.popularAnime),
        topRatedAnime: state.mergeUserScores(state.topRatedAnime),
        currentSeasonAnime: state.mergeUserScores(state.currentSeasonAnime),
        searchResults: state.mergeUserScores(state.searchResults)
      }
      
      set(updatedData)
    } catch (error) {
      console.error('Failed to fetch user scores:', error)
    } finally {
      set(state => ({ loading: { ...state.loading, userScores: false } }))
    }
  },

  fetchCurrentlyWatching: async () => {
    const { currentSource } = get()
    
    
    // Use the correct auth service
    const authServiceInstance = getAuthService(currentSource)
    if (!authServiceInstance) {
      return
    }
    
    // Debug authentication status
    const isAuth = authServiceInstance.isAuthenticated()
    
    if (!isAuth) {
      return
    }

    set(state => ({ loading: { ...state.loading, currentlyWatching: true } }))
    
    try {
      const tokenObj = authServiceInstance.getToken()
      if (!tokenObj) {
        return
      }
      
      const token = tokenObj.access_token
      let watchingAnime: AnimeBase[]

      if (currentSource === 'mal') {
        watchingAnime = await malService.getUserWatchingAnime(token)
      } else {
        watchingAnime = await anilistService.getUserWatchingAnime(token)
      }

      set({ currentlyWatching: watchingAnime })
    } catch (error) {
      console.error('Failed to fetch currently watching anime:', error)
    } finally {
      set(state => ({ loading: { ...state.loading, currentlyWatching: false } }))
    }
  },

  mergeUserScores: (animeList: AnimeBase[]) => {
    const { userAnimeScores } = get()
    
    return animeList.map(anime => {
      const scoreFromMap = userAnimeScores.get(anime.id)
      // Preserve existing userScore if map doesn't have a score for this anime
      const finalScore = scoreFromMap !== undefined ? scoreFromMap : anime.userScore
      
      return {
        ...anime,
        userScore: finalScore
      }
    })
  }
}))