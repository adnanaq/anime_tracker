import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { AnimeBase, AnimeSource } from '../types/anime'
import { animeService } from '../services/animeService'
import { getAuthService } from '../services/shared'
import { anilistService } from '../services/anilist'
import { malService } from '../services/mal'

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
  
  // Computed property - no longer stored
  getCurrentlyWatching: () => AnimeBase[]

  // User data
  userAnimeScores: Map<number, number>
  userAnimeStatus: Map<number, string>
  
  // Force re-render tracking
  _lastUpdate?: number
  
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
  getAuthToken: () => string | undefined
  applyUserData: (animeList: AnimeBase[]) => AnimeBase[]
  withLoading: <T>(loadingKey: keyof AnimeStore['loading'], action: () => Promise<T>) => Promise<T | void>
  fetchTrendingAnime: () => Promise<void>
  fetchPopularAnime: () => Promise<void>
  fetchTopRatedAnime: () => Promise<void>
  fetchCurrentSeasonAnime: () => Promise<void>
  searchAnime: (query: string) => Promise<void>
  clearSearch: () => void
  fetchUserScores: () => Promise<void>
  fetchUserStatus: () => Promise<void>
  fetchCurrentlyWatching: () => Promise<void>
  mergeUserScores: (animeList: AnimeBase[]) => AnimeBase[]
  mergeUserStatus: (animeList: AnimeBase[]) => AnimeBase[]
  updateAnimeStatus: (animeId: number, source: string, newStatus: string) => void
  removeAnimeFromStore: (animeId: number, source: string) => void
}

export const useAnimeStore = create<AnimeStore>()(
  devtools(
    (set, get) => ({
  // Initial state
  currentSource: 'mal',
  trendingAnime: [],
  popularAnime: [],
  topRatedAnime: [],
  currentSeasonAnime: [],
  searchResults: [],
  currentlyWatching: [],
  userAnimeScores: new Map<number, number>(),
  userAnimeStatus: new Map<number, string>(),
  loading: {
    trending: false,
    popular: false,
    topRated: false,
    currentSeason: false,
    search: false,
    userScores: false,
    currentlyWatching: false
  },

  // Computed property for currently watching anime
  getCurrentlyWatching: () => {
    const state = get()
    const allAnime = [
      ...state.trendingAnime,
      ...state.popularAnime, 
      ...state.topRatedAnime,
      ...state.currentSeasonAnime,
      ...state.searchResults
    ]
    
    return allAnime.filter(anime => {
      const status = anime.userStatus
      return status === 'watching' || status === 'CURRENT'
    })
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

  // Helper: Get authentication token for current source
  getAuthToken: () => {
    const { currentSource } = get()
    const authService = getAuthService(currentSource)
    return authService?.isAuthenticated() ? authService.getToken()?.access_token : undefined
  },

  // Helper: Apply user scores and status to anime list
  applyUserData: (animeList: AnimeBase[]) => {
    const store = get()
    const animeWithUserScores = store.mergeUserScores(animeList)
    return store.mergeUserStatus(animeWithUserScores)
  },

  // Helper: Execute action with loading state management
  withLoading: async <T>(
    loadingKey: keyof AnimeStore['loading'],
    action: () => Promise<T>
  ): Promise<T | void> => {
    set(state => ({ loading: { ...state.loading, [loadingKey]: true } }))
    try {
      return await action()
    } catch (error) {
      console.error('Error in withLoading:', error)
    } finally {
      set(state => ({ loading: { ...state.loading, [loadingKey]: false } }))
    }
  },

  fetchTrendingAnime: async () => {
    await get().withLoading('trending', async () => {
      const accessToken = get().getAuthToken()
      const anime = await animeService.getTrendingAnime(accessToken)
      const processedAnime = get().applyUserData(anime)
      set({ trendingAnime: processedAnime })
    })
  },

  fetchPopularAnime: async () => {
    await get().withLoading('popular', async () => {
      const accessToken = get().getAuthToken()
      const anime = await animeService.getPopularAnime(accessToken)
      const processedAnime = get().applyUserData(anime)
      set({ popularAnime: processedAnime })
    })
  },

  fetchTopRatedAnime: async () => {
    await get().withLoading('topRated', async () => {
      const accessToken = get().getAuthToken()
      const anime = await animeService.getTopRatedAnime(accessToken)
      const processedAnime = get().applyUserData(anime)
      set({ topRatedAnime: processedAnime })
    })
  },

  fetchCurrentSeasonAnime: async () => {
    await get().withLoading('currentSeason', async () => {
      const accessToken = get().getAuthToken()
      const anime = await animeService.getCurrentSeasonAnime(accessToken)
      const processedAnime = get().applyUserData(anime)
      set({ currentSeasonAnime: processedAnime })
    })
  },

  searchAnime: async (query: string) => {
    if (!query.trim()) {
      set({ searchResults: [] })
      return
    }

    set(state => ({ loading: { ...state.loading, search: true } }))
    try {
      const { currentSource } = get()
      let accessToken: string | undefined
      
      // Get access token if user is authenticated
      const authService = getAuthService(currentSource)
      if (authService?.isAuthenticated()) {
        accessToken = authService.getToken()?.access_token
      }
      
      const anime = await animeService.searchAnime(query, accessToken)
      const animeWithUserScores = get().mergeUserScores(anime)
      const animeWithUserStatus = get().mergeUserStatus(animeWithUserScores)
      set({ searchResults: animeWithUserStatus })
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

  fetchUserStatus: async () => {
    const { currentSource } = get()
    
    // Check authentication for the current source
    const authServiceInstance = getAuthService(currentSource)
    if (!authServiceInstance || !authServiceInstance.isAuthenticated()) {
      return
    }
    try {
      const tokenObj = authServiceInstance.getToken()
      if (!tokenObj) {
        return
      }
      
      const token = tokenObj.access_token
      let userStatusMap: Map<number, string>

      // Also check if we need status from other sources due to fallback data
      const currentState = get()
      const allAnime = [
        ...currentState.trendingAnime,
        ...currentState.popularAnime,
        ...currentState.topRatedAnime,
        ...currentState.currentSeasonAnime,
        ...currentState.searchResults
      ]
      
      const hasOtherSource = allAnime.some(anime => anime.source !== currentSource)

      if (currentSource === 'mal') {
        userStatusMap = await malService.getUserAnimeStatusMap(token)
        
        // Also get AniList status if we have AniList anime from fallbacks
        if (hasOtherSource) {
          const anilistAuth = getAuthService('anilist')
          if (anilistAuth?.isAuthenticated()) {
            try {
              const anilistToken = anilistAuth.getToken()?.access_token
              if (anilistToken) {
                const anilistStatusMap = await anilistService.getUserAnimeStatusMap(anilistToken)
                // Merge AniList status into the main map (they have different ID ranges so no conflicts)
                anilistStatusMap.forEach((status, id) => userStatusMap.set(id, status))
              }
            } catch (error) {
              // Silently continue if AniList fallback fails
            }
          }
        }
      } else {
        userStatusMap = await anilistService.getUserAnimeStatusMap(token)
        
        // Also get MAL status if we have MAL anime from fallbacks
        if (hasOtherSource) {
          const malAuth = getAuthService('mal')
          if (malAuth?.isAuthenticated()) {
            try {
              const malToken = malAuth.getToken()?.access_token
              if (malToken) {
                const malStatusMap = await malService.getUserAnimeStatusMap(malToken)
                // Merge MAL status into the main map
                malStatusMap.forEach((status, id) => userStatusMap.set(id, status))
              }
            } catch (error) {
              // Silently continue if MAL fallback fails
            }
          }
        }
      }

      set({ userAnimeStatus: userStatusMap })
      
      // Re-merge user status with existing anime data
      const state = get()
      const updatedData = {
        trendingAnime: state.mergeUserStatus(state.trendingAnime),
        popularAnime: state.mergeUserStatus(state.popularAnime),
        topRatedAnime: state.mergeUserStatus(state.topRatedAnime),
        currentSeasonAnime: state.mergeUserStatus(state.currentSeasonAnime),
        searchResults: state.mergeUserStatus(state.searchResults)
      }
      
      set(updatedData)
    } catch (error) {
      console.error('Failed to fetch user status:', error)
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

      // Build user status map from currently watching anime
      const statusMap = new Map<number, string>()
      watchingAnime.forEach(anime => {
        if (anime.userStatus) {
          statusMap.set(anime.id, anime.userStatus)
        }
      })
      
      set({ 
        currentlyWatching: watchingAnime,
        userAnimeStatus: statusMap
      })
      
      // Re-merge user status with existing anime data
      const state = get()
      const updatedData = {
        trendingAnime: state.mergeUserStatus(state.trendingAnime),
        popularAnime: state.mergeUserStatus(state.popularAnime),
        topRatedAnime: state.mergeUserStatus(state.topRatedAnime),
        currentSeasonAnime: state.mergeUserStatus(state.currentSeasonAnime),
        searchResults: state.mergeUserStatus(state.searchResults)
      }
      
      set(updatedData)
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
  },

  mergeUserStatus: (animeList: AnimeBase[]) => {
    const { userAnimeStatus } = get()
    
    return animeList.map(anime => {
      // Now we fetch status from both sources, so we can merge regardless of anime source
      const statusFromMap = userAnimeStatus.get(anime.id)
      
      // Preserve existing userStatus if map doesn't have a status for this anime
      const finalStatus = statusFromMap !== undefined ? statusFromMap : anime.userStatus
      
      return {
        ...anime,
        userStatus: finalStatus
      }
    })
  },

  updateAnimeStatus: (animeId: number, source: string, newStatus: string) => {
    const state = get()
    const isRemovingFromList = newStatus === '' || newStatus === null || newStatus === undefined
    
    // Helper function to update anime and return new array (minimal new references)
    const updateAnimeInArray = (animeList: AnimeBase[]) => {
      const animeIndex = animeList.findIndex(anime => anime.id === animeId && anime.source === source)
      if (animeIndex === -1) return null // Anime not found in this list
      
      // Check if status actually changed
      const currentStatus = animeList[animeIndex].userStatus
      const targetStatus = isRemovingFromList ? undefined : newStatus
      
      if (currentStatus === targetStatus) {
        return null // No change needed
      }
      
      // Create new array with updated object (preserving all other references)
      const newArray = [...animeList]
      const updatedAnime = { ...animeList[animeIndex] }
      
      if (isRemovingFromList) {
        // Remove userStatus field entirely when removing from list
        delete updatedAnime.userStatus
      } else {
        // Update userStatus field
        updatedAnime.userStatus = newStatus
      }
      
      newArray[animeIndex] = updatedAnime
      return newArray
    }
    
    // Track which arrays were actually modified
    const updates: Partial<Pick<AnimeStore, 'trendingAnime' | 'popularAnime' | 'topRatedAnime' | 'currentSeasonAnime' | 'currentlyWatching' | 'searchResults' | 'userAnimeStatus'>> = {}
    let anyChanges = false
    
    // Update arrays with minimal new references
    const newTrending = updateAnimeInArray(state.trendingAnime)
    if (newTrending) {
      updates.trendingAnime = newTrending
      anyChanges = true
    }
    
    const newPopular = updateAnimeInArray(state.popularAnime)
    if (newPopular) {
      updates.popularAnime = newPopular
      anyChanges = true
    }
    
    const newTopRated = updateAnimeInArray(state.topRatedAnime)
    if (newTopRated) {
      updates.topRatedAnime = newTopRated
      anyChanges = true
    }
    
    const newCurrentSeason = updateAnimeInArray(state.currentSeasonAnime)
    if (newCurrentSeason) {
      updates.currentSeasonAnime = newCurrentSeason
      anyChanges = true
    }
    
    const newSearchResults = updateAnimeInArray(state.searchResults)
    if (newSearchResults) {
      updates.searchResults = newSearchResults
      anyChanges = true
    }
    
    const newCurrentlyWatching = updateAnimeInArray(state.currentlyWatching)
    if (newCurrentlyWatching) {
      updates.currentlyWatching = newCurrentlyWatching
      anyChanges = true
    }
    
    // Handle adding/removing from currentlyWatching
    const isWatchingStatus = newStatus === 'watching' || newStatus === 'CURRENT'
    const currentlyWatchingIndex = state.currentlyWatching.findIndex(anime => anime.id === animeId && anime.source === source)
    
    // Find the updated anime object from any list
    let targetAnime: AnimeBase | undefined
    if (newTrending) {
      targetAnime = newTrending.find(anime => anime.id === animeId && anime.source === source)
    } else if (newPopular) {
      targetAnime = newPopular.find(anime => anime.id === animeId && anime.source === source)
    } else if (newTopRated) {
      targetAnime = newTopRated.find(anime => anime.id === animeId && anime.source === source)
    } else if (newCurrentSeason) {
      targetAnime = newCurrentSeason.find(anime => anime.id === animeId && anime.source === source)
    } else if (newSearchResults) {
      targetAnime = newSearchResults.find(anime => anime.id === animeId && anime.source === source)
    } else {
      // Try to find from any of the original arrays
      targetAnime = state.trendingAnime.find(anime => anime.id === animeId && anime.source === source) ||
                   state.popularAnime.find(anime => anime.id === animeId && anime.source === source) ||
                   state.topRatedAnime.find(anime => anime.id === animeId && anime.source === source) ||
                   state.currentSeasonAnime.find(anime => anime.id === animeId && anime.source === source) ||
                   state.searchResults.find(anime => anime.id === animeId && anime.source === source)
    }
    
    // Handle adding to currently watching (only if anime exists in other arrays)
    if (targetAnime && isWatchingStatus && currentlyWatchingIndex === -1) {
      // Add to currently watching
      const currentWatchingArray = updates.currentlyWatching || state.currentlyWatching
      updates.currentlyWatching = [...currentWatchingArray, targetAnime]
      anyChanges = true
    }
    
    // Handle removing from currently watching (works regardless of whether anime exists elsewhere)
    if ((!isWatchingStatus || isRemovingFromList) && currentlyWatchingIndex !== -1) {
      // Remove from currently watching (either changing to non-watching status or removing from list entirely)
      const currentWatchingArray = updates.currentlyWatching || [...state.currentlyWatching]
      if (updates.currentlyWatching) {
        // Already have a new array, find the index again
        const newIndex = currentWatchingArray.findIndex((anime: AnimeBase) => anime.id === animeId && anime.source === source)
        if (newIndex !== -1) {
          currentWatchingArray.splice(newIndex, 1)
        }
      } else {
        currentWatchingArray.splice(currentlyWatchingIndex, 1)
        updates.currentlyWatching = currentWatchingArray
      }
      anyChanges = true
    }
    
    // Update the userAnimeStatus map
    if (anyChanges) {
      const newStatusMap = new Map(state.userAnimeStatus)
      if (isRemovingFromList) {
        // Remove the status entirely when removing from list
        newStatusMap.delete(animeId)
      } else {
        // Update the status
        newStatusMap.set(animeId, newStatus)
      }
      updates.userAnimeStatus = newStatusMap
      
      // Update with new array references so React can detect changes
      set(updates)
    }
  },

  removeAnimeFromStore: (animeId: number, source: string) => {
    const state = get()
    
    // Helper function to remove anime from a list
    const removeAnimeFromList = (animeList: AnimeBase[]) => {
      return animeList.filter(anime => !(anime.id === animeId && anime.source === source))
    }
    
    // Update all lists including currentlyWatching
    set({
      trendingAnime: removeAnimeFromList(state.trendingAnime),
      popularAnime: removeAnimeFromList(state.popularAnime),
      topRatedAnime: removeAnimeFromList(state.topRatedAnime),
      currentSeasonAnime: removeAnimeFromList(state.currentSeasonAnime),
      searchResults: removeAnimeFromList(state.searchResults),
      currentlyWatching: removeAnimeFromList(state.currentlyWatching)
    })
    
    // Also remove from the userAnimeStatus map
    const newStatusMap = new Map(state.userAnimeStatus)
    newStatusMap.delete(animeId)
    set({ userAnimeStatus: newStatusMap })
  }
}),
{ name: 'anime-store' }
)
)