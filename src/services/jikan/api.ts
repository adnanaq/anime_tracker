import { AnimeBase } from '../../types/anime'
import { jikanCache, jikanRequestManager } from '../../lib/cache'

// MAL API Constants for user operations
const MAL_API_BASE_URL = 'https://api.myanimelist.net/v2'

// Jikan API v4 Base URL
const JIKAN_BASE_URL = 'https://api.jikan.moe/v4'

// Rate limiting: 30 requests per minute, 2 requests per second
const RATE_LIMIT_DELAY = 500 // 500ms between requests

let lastRequestTime = 0

const rateLimitedFetch = async (url: string): Promise<Response> => {
  const now = Date.now()
  const timeSinceLastRequest = now - lastRequestTime
  
  if (timeSinceLastRequest < RATE_LIMIT_DELAY) {
    await new Promise(resolve => setTimeout(resolve, RATE_LIMIT_DELAY - timeSinceLastRequest))
  }
  
  lastRequestTime = Date.now()
  return fetch(url)
}

export interface JikanAnime {
  mal_id: number
  title: string
  synopsis?: string
  images: {
    jpg: {
      image_url: string
      small_image_url: string
      large_image_url: string
    }
    webp: {
      image_url: string
      small_image_url: string
      large_image_url: string
    }
  }
  score?: number
  episodes?: number
  status?: string
  genres?: Array<{ mal_id: number; name: string }>
  year?: number
  season?: string
  type?: string
  aired?: {
    from?: string
    to?: string
  }
  studios?: Array<{ mal_id: number; name: string }>
  relations?: Array<{
    relation: string
    entry: Array<{
      mal_id: number
      type: string
      name: string
      url: string
    }>
  }>
  recommendations?: Array<{
    entry: {
      mal_id: number
      title: string
      images: {
        jpg: { image_url: string }
      }
    }
    votes: number
  }>
}

export interface JikanPicture {
  jpg: {
    image_url: string
    small_image_url: string
    large_image_url: string
  }
  webp: {
    image_url: string
    small_image_url: string
    large_image_url: string
  }
}

export interface JikanScheduleEntry {
  mal_id: number
  title: string
  images: JikanAnime['images']
  synopsis?: string
  score?: number
  episodes?: number
  broadcast: {
    day?: string
    time?: string
    timezone?: string
    string?: string
  }
  genres?: Array<{ mal_id: number; name: string }>
}

export const normalizeJikanAnime = (anime: JikanAnime, includeRelated: boolean = false): AnimeBase => {
  const normalized: AnimeBase = {
    id: anime.mal_id,
    title: anime.title,
    synopsis: anime.synopsis,
    image: anime.images?.jpg?.large_image_url || anime.images?.jpg?.image_url,
    coverImage: anime.images?.jpg?.large_image_url || anime.images?.jpg?.image_url,
    score: anime.score,
    episodes: anime.episodes,
    status: anime.status,
    genres: anime.genres?.map(g => g.name) || [],
    year: anime.year || (anime.aired?.from ? new Date(anime.aired.from).getFullYear() : undefined),
    format: anime.type,
    source: 'jikan' as const
  }

  // Process related anime if requested and available
  if (includeRelated && anime.relations) {
    normalized.relatedAnime = anime.relations
      .flatMap(relation => relation.entry)
      .filter(entry => entry.type === 'anime' && entry.mal_id !== anime.mal_id)
      .slice(0, 10)
      .map(entry => ({
        id: entry.mal_id,
        title: entry.name,
        source: 'jikan' as const,
        // Basic info only - would need separate API calls for full details
      }))
  }

  return normalized
}

// MAL User Operations (integrated into Jikan service)
const malApiRequest = async (endpoint: string, options: RequestInit = {}, accessToken?: string): Promise<Response> => {
  const url = `${MAL_API_BASE_URL}${endpoint}`
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {})
  }
  
  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`
  }
  
  return fetch(url, {
    ...options,
    headers
  })
}

export const jikanService = {
  async getTrendingAnime(): Promise<AnimeBase[]> {
    const requestKey = 'jikan:trending:airing'
    
    return await jikanRequestManager.enhancedRequest(
      requestKey,
      async () => {
        return await jikanCache.getTrendingAnime(
          'trending',
          async () => {
            const response = await rateLimitedFetch(`${JIKAN_BASE_URL}/top/anime?filter=airing&limit=6`)
            
            if (!response.ok) {
              throw new Error(`Jikan API error: ${response.status} ${response.statusText}`)
            }
            
            const data = await response.json()
            return data.data.map((anime: JikanAnime) => normalizeJikanAnime(anime))
          }
        )
      }
    )
  },

  async getPopularAnime(): Promise<AnimeBase[]> {
    const requestKey = 'jikan:popular:bypopularity'
    
    return await jikanRequestManager.enhancedRequest(
      requestKey,
      async () => {
        return await jikanCache.getTrendingAnime(
          'popular',
          async () => {
            const response = await rateLimitedFetch(`${JIKAN_BASE_URL}/top/anime?filter=bypopularity&limit=6`)
            
            if (!response.ok) {
              throw new Error(`Jikan API error: ${response.status} ${response.statusText}`)
            }
            
            const data = await response.json()
            return data.data.map((anime: JikanAnime) => normalizeJikanAnime(anime))
          }
        )
      }
    )
  },

  async getTopRatedAnime(): Promise<AnimeBase[]> {
    const requestKey = 'jikan:top:favorite'
    
    return await jikanRequestManager.enhancedRequest(
      requestKey,
      async () => {
        return await jikanCache.getTrendingAnime(
          'top',
          async () => {
            const response = await rateLimitedFetch(`${JIKAN_BASE_URL}/top/anime?filter=favorite&limit=6`)
            
            if (!response.ok) {
              throw new Error(`Jikan API error: ${response.status} ${response.statusText}`)
            }
            
            const data = await response.json()
            return data.data.map((anime: JikanAnime) => normalizeJikanAnime(anime))
          }
        )
      }
    )
  },

  async getCurrentSeasonAnime(): Promise<AnimeBase[]> {
    const requestKey = 'jikan:season:current'
    
    return await jikanRequestManager.enhancedRequest(
      requestKey,
      async () => {
        return await jikanCache.getCurrentSeasonAnime(
          async () => {
            const response = await rateLimitedFetch(`${JIKAN_BASE_URL}/seasons/now?limit=6`)
            
            if (!response.ok) {
              throw new Error(`Jikan API error: ${response.status} ${response.statusText}`)
            }
            
            const data = await response.json()
            return data.data.map((anime: JikanAnime) => normalizeJikanAnime(anime))
          }
        )
      }
    )
  },

  async searchAnime(query: string): Promise<AnimeBase[]> {
    const requestKey = `jikan:search:${query}`
    
    return await jikanRequestManager.enhancedRequest(
      requestKey,
      async () => {
        return await jikanCache.searchAnime(
          query,
          async () => {
            const encodedQuery = encodeURIComponent(query)
            const response = await rateLimitedFetch(`${JIKAN_BASE_URL}/anime?q=${encodedQuery}&limit=6`)
            
            if (!response.ok) {
              throw new Error(`Jikan API error: ${response.status} ${response.statusText}`)
            }
            
            const data = await response.json()
            return data.data.map((anime: JikanAnime) => normalizeJikanAnime(anime))
          }
        )
      }
    )
  },

  async findAnimeByTitle(title: string): Promise<AnimeBase | null> {
    try {
      // Clean up the title for better search results
      const cleanTitle = title
        .replace(/\s*-\s*\d+nd\s+season/i, ' Season 2')
        .replace(/\s*-\s*2nd\s+season/i, ' Season 2')
        .replace(/\s*-\s*season\s*2/i, ' Season 2')
        .replace(/\s*\bseason\s*2\b/i, ' Season 2')
        .replace(/\s*\b2nd\s+season\b/i, ' Season 2')
        .replace(/\s+/g, ' ')
        .trim()

      const encodedQuery = encodeURIComponent(cleanTitle)
      const response = await rateLimitedFetch(`${JIKAN_BASE_URL}/anime?q=${encodedQuery}&limit=10`)
      
      if (!response.ok) {
        throw new Error(`Jikan API error: ${response.status} ${response.statusText}`)
      }
      
      const data = await response.json()
      const results = data.data || []
      
      if (results.length === 0) {
        return null
      }
      
      // Find the best match by comparing titles
      const exactMatch = results.find((anime: JikanAnime) => {
        const animeTitle = anime.title.toLowerCase()
        const searchTitle = cleanTitle.toLowerCase()
        return animeTitle === searchTitle || 
               animeTitle.includes(searchTitle) ||
               searchTitle.includes(animeTitle)
      })
      
      if (exactMatch) {
        return normalizeJikanAnime(exactMatch)
      }
      
      // If no exact match, return the first result
      return normalizeJikanAnime(results[0])
    } catch (error) {
      console.error('Jikan find anime by title error:', error)
      return null
    }
  },

  async advancedSearchAnime(params: {
    query?: string
    type?: 'tv' | 'movie' | 'ova' | 'special' | 'ona' | 'music'
    status?: 'airing' | 'complete' | 'upcoming'
    rating?: 'g' | 'pg' | 'pg13' | 'r17' | 'r' | 'rx'
    genre?: string
    min_score?: number
    max_score?: number
    limit?: number
  }): Promise<AnimeBase[]> {
    try {
      const searchParams = new URLSearchParams()
      
      if (params.query) searchParams.append('q', params.query)
      if (params.type) searchParams.append('type', params.type)
      if (params.status) searchParams.append('status', params.status)
      if (params.rating) searchParams.append('rating', params.rating)
      if (params.genre) searchParams.append('genres', params.genre)
      if (params.min_score) searchParams.append('min_score', params.min_score.toString())
      if (params.max_score) searchParams.append('max_score', params.max_score.toString())
      searchParams.append('limit', (params.limit || 12).toString())
      
      const response = await rateLimitedFetch(`${JIKAN_BASE_URL}/anime?${searchParams}`)
      
      if (!response.ok) {
        throw new Error(`Jikan API error: ${response.status} ${response.statusText}`)
      }
      
      const data = await response.json()
      return data.data.map((anime: JikanAnime) => normalizeJikanAnime(anime))
    } catch (error) {
      console.error('Jikan advanced search error:', error)
      throw error
    }
  },

  async getGenres(): Promise<Array<{ mal_id: number; name: string }>> {
    const requestKey = 'jikan:genres:anime'
    
    return await jikanRequestManager.enhancedRequest(
      requestKey,
      async () => {
        return await jikanCache.cacheJikanData(
          'genres',
          async () => {
            const response = await rateLimitedFetch(`${JIKAN_BASE_URL}/genres/anime`)
            
            if (!response.ok) {
              throw new Error(`Jikan API error: ${response.status} ${response.statusText}`)
            }
            
            const data = await response.json()
            return data.data || []
          },
          {
            ttl: 24 * 60 * 60 * 1000, // 24 hours - genres rarely change
            persistent: true
          }
        )
      }
    ).catch((error) => {
      console.error('Jikan genres error:', error)
      return []
    })
  },

  async getAnimeDetails(id: number): Promise<AnimeBase> {
    const requestKey = `jikan:details:${id}`
    
    return await jikanRequestManager.enhancedRequest(
      requestKey,
      async () => {
        return await jikanCache.getAnimeDetails(
          id,
          async () => {
            const response = await rateLimitedFetch(`${JIKAN_BASE_URL}/anime/${id}/full`)
            
            if (!response.ok) {
              throw new Error(`Jikan API error: ${response.status} ${response.statusText}`)
            }
            
            const data = await response.json()
            return normalizeJikanAnime(data.data, true) // Include related anime for detail view
          }
        )
      }
    )
  },

  async getAnimePictures(id: number): Promise<JikanPicture[]> {
    try {
      const response = await rateLimitedFetch(`${JIKAN_BASE_URL}/anime/${id}/pictures`)
      
      if (!response.ok) {
        throw new Error(`Jikan API error: ${response.status} ${response.statusText}`)
      }
      
      const data = await response.json()
      return data.data || []
    } catch (error) {
      console.error('Jikan anime pictures error:', error)
      return []
    }
  },

  async getRandomAnime(): Promise<AnimeBase> {
    // Random anime bypasses cache entirely for true randomness
    const response = await rateLimitedFetch(`${JIKAN_BASE_URL}/random/anime`)
    
    if (!response.ok) {
      throw new Error(`Jikan API error: ${response.status} ${response.statusText}`)
    }
    
    const data = await response.json()
    return normalizeJikanAnime(data.data)
  },

  async getAnimeRecommendations(id: number): Promise<AnimeBase[]> {
    const requestKey = `jikan:recommendations:${id}`
    
    return await jikanRequestManager.enhancedRequest(
      requestKey,
      async () => {
        return await jikanCache.getRecommendations(
          id,
          async () => {
            const response = await rateLimitedFetch(`${JIKAN_BASE_URL}/anime/${id}/recommendations`)
            
            if (!response.ok) {
              throw new Error(`Jikan API error: ${response.status} ${response.statusText}`)
            }
            
            const data = await response.json()
            return data.data.slice(0, 6).map((rec: any) => ({
              id: rec.entry.mal_id,
              title: rec.entry.title,
              image: rec.entry.images?.jpg?.image_url,
              coverImage: rec.entry.images?.jpg?.large_image_url || rec.entry.images?.jpg?.image_url,
              source: 'jikan' as const,
              // Basic info only from recommendations endpoint
            }))
          }
        )
      }
    ).catch((error) => {
      console.error('Jikan recommendations error:', error)
      return []
    })
  },

  async getWeeklySchedule(): Promise<{ [day: string]: JikanScheduleEntry[] }> {
    try {
      const response = await rateLimitedFetch(`${JIKAN_BASE_URL}/schedules`)
      
      if (!response.ok) {
        throw new Error(`Jikan API error: ${response.status} ${response.statusText}`)
      }
      
      const data = await response.json()
      const animeList = data.data || []
      
      // Group anime by broadcast day
      const weeklySchedule: { [day: string]: JikanScheduleEntry[] } = {
        monday: [],
        tuesday: [],
        wednesday: [],
        thursday: [],
        friday: [],
        saturday: [],
        sunday: []
      }
      
      animeList.forEach((anime: any) => {
        if (anime.broadcast?.day) {
          const broadcastDay = anime.broadcast.day.toLowerCase()
          // Handle plural forms (e.g., "mondays" -> "monday")
          const dayKey = broadcastDay.endsWith('s') ? broadcastDay.slice(0, -1) : broadcastDay
          
          if (weeklySchedule[dayKey]) {
            weeklySchedule[dayKey].push(anime)
          }
        }
      })
      
      return weeklySchedule
    } catch (error) {
      console.error('Jikan schedule error:', error)
      return {}
    }
  },

  async getDaySchedule(day: string): Promise<JikanScheduleEntry[]> {
    try {
      const response = await rateLimitedFetch(`${JIKAN_BASE_URL}/schedules?filter=${day.toLowerCase()}`)
      
      if (!response.ok) {
        throw new Error(`Jikan API error: ${response.status} ${response.statusText}`)
      }
      
      const data = await response.json()
      return data.data || []
    } catch (error) {
      console.error(`Jikan ${day} schedule error:`, error)
      return []
    }
  },

  async getSeasonalAnime(year: number, season: string): Promise<AnimeBase[]> {
    const requestKey = `jikan:seasonal:${year}:${season}`
    
    return await jikanRequestManager.enhancedRequest(
      requestKey,
      async () => {
        return await jikanCache.cacheJikanData(
          `seasonal:${year}:${season}`,
          async () => {
            const response = await rateLimitedFetch(`${JIKAN_BASE_URL}/seasons/${year}/${season.toLowerCase()}?limit=6`)
            
            if (!response.ok) {
              throw new Error(`Jikan API error: ${response.status} ${response.statusText}`)
            }
            
            const data = await response.json()
            return data.data.map((anime: JikanAnime) => normalizeJikanAnime(anime))
          },
          {
            ttl: 60 * 60 * 1000, // 1 hour - seasonal data doesn't change much
            persistent: true
          }
        )
      }
    )
  },

  async getUpcomingAnime(): Promise<AnimeBase[]> {
    const requestKey = 'jikan:upcoming:seasons'
    
    return await jikanRequestManager.enhancedRequest(
      requestKey,
      async () => {
        return await jikanCache.cacheJikanData(
          'upcoming',
          async () => {
            const response = await rateLimitedFetch(`${JIKAN_BASE_URL}/seasons/upcoming?limit=6`)
            
            if (!response.ok) {
              throw new Error(`Jikan API error: ${response.status} ${response.statusText}`)
            }
            
            const data = await response.json()
            return data.data.map((anime: JikanAnime) => normalizeJikanAnime(anime))
          },
          {
            ttl: 30 * 60 * 1000, // 30 minutes - upcoming changes more frequently
            persistent: false
          }
        )
      }
    )
  },

  async getAnimeReviews(id: number): Promise<any[]> {
    try {
      const response = await rateLimitedFetch(`${JIKAN_BASE_URL}/anime/${id}/reviews?limit=6`)
      
      if (!response.ok) {
        throw new Error(`Jikan API error: ${response.status} ${response.statusText}`)
      }
      
      const data = await response.json()
      return data.data || []
    } catch (error) {
      console.error('Jikan anime reviews error:', error)
      return []
    }
  },

  async getAnimeStatistics(id: number): Promise<any> {
    try {
      const response = await rateLimitedFetch(`${JIKAN_BASE_URL}/anime/${id}/statistics`)
      
      if (!response.ok) {
        throw new Error(`Jikan API error: ${response.status} ${response.statusText}`)
      }
      
      const data = await response.json()
      return data.data || null
    } catch (error) {
      console.error('Jikan anime statistics error:', error)
      return null
    }
  },

  // ===== MAL User Operations (integrated) =====
  
  async getCurrentUser(accessToken: string): Promise<any> {
    try {
      const response = await malApiRequest('/users/@me', {}, accessToken)
      
      if (!response.ok) {
        throw new Error(`MAL API error: ${response.status} ${response.statusText}`)
      }
      
      return await response.json()
    } catch (error) {
      console.error('MAL get current user error:', error)
      throw error
    }
  },

  async updateAnimeStatus(animeId: number, accessToken: string, statusData: {
    status?: string
    score?: number
    num_watched_episodes?: number
    start_date?: string
    finish_date?: string
    comments?: string
  }): Promise<void> {
    try {
      // Convert to form data as MAL expects application/x-www-form-urlencoded
      const formData = new URLSearchParams()
      
      if (statusData.status) formData.append('status', statusData.status)
      if (statusData.score !== undefined) formData.append('score', statusData.score.toString())
      if (statusData.num_watched_episodes !== undefined) formData.append('num_watched_episodes', statusData.num_watched_episodes.toString())
      if (statusData.start_date) formData.append('start_date', statusData.start_date)
      if (statusData.finish_date) formData.append('finish_date', statusData.finish_date)
      if (statusData.comments) formData.append('comments', statusData.comments)

      const response = await malApiRequest(`/anime/${animeId}/my_list_status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: formData.toString()
      }, accessToken)

      if (!response.ok) {
        throw new Error(`MAL API error: ${response.status} ${response.statusText}`)
      }
    } catch (error) {
      console.error('MAL update anime status error:', error)
      throw error
    }
  },

  async deleteAnimeFromList(animeId: number, accessToken: string): Promise<void> {
    try {
      const response = await malApiRequest(`/anime/${animeId}/my_list_status`, {
        method: 'DELETE'
      }, accessToken)

      if (!response.ok) {
        throw new Error(`MAL API error: ${response.status} ${response.statusText}`)
      }
    } catch (error) {
      console.error('MAL delete anime from list error:', error)
      throw error
    }
  },

  async getUserWatchingAnime(accessToken: string): Promise<AnimeBase[]> {
    try {
      const response = await malApiRequest('/users/@me/animelist?status=watching&limit=50&fields=list_status{score,status,num_episodes_watched,start_date,finish_date},alternative_titles,synopsis,mean,num_episodes,status,genres,start_date,media_type', {}, accessToken)
      
      if (!response.ok) {
        throw new Error(`MAL API error: ${response.status} ${response.statusText}`)
      }
      
      const data = await response.json()
      
      return data.data.map((item: any) => ({
        id: item.node.id,
        title: item.node.title,
        synopsis: item.node.synopsis,
        image: item.node.main_picture?.large || item.node.main_picture?.medium,
        coverImage: item.node.main_picture?.large || item.node.main_picture?.medium,
        score: item.node.mean,
        userScore: item.list_status?.score,
        userStatus: item.list_status?.status,
        userProgress: item.list_status?.num_episodes_watched,
        episodes: item.node.num_episodes,
        status: item.node.status,
        genres: item.node.genres?.map((g: any) => g.name) || [],
        year: item.node.start_date ? new Date(item.node.start_date).getFullYear() : undefined,
        format: item.node.media_type,
        source: 'jikan' as const
      }))
    } catch (error) {
      console.error('MAL get user watching anime error:', error)
      return []
    }
  },

  async getUserAnimeStatusMap(accessToken: string): Promise<Map<number, string>> {
    const statusMap = new Map<number, string>()
    const statuses = ['watching', 'completed', 'on_hold', 'dropped', 'plan_to_watch']
    
    try {
      const promises = statuses.map(async (status) => {
        try {
          const response = await malApiRequest(`/users/@me/animelist?status=${status}&limit=1000&fields=list_status`, {}, accessToken)
          
          if (response.ok) {
            const data = await response.json()
            data.data.forEach((item: any) => {
              statusMap.set(item.node.id, item.list_status.status)
            })
          }
        } catch (error) {
          console.error(`Error fetching ${status} anime:`, error)
        }
      })

      await Promise.all(promises)
    } catch (error) {
      console.error('MAL get user anime status map error:', error)
    }
    
    return statusMap
  },

  async getUserScoresForAnime(animeIds: number[], accessToken: string): Promise<Map<number, number>> {
    const scoreMap = new Map<number, number>()
    
    try {
      const promises = animeIds.map(async (animeId) => {
        try {
          const response = await malApiRequest(`/anime/${animeId}?fields=my_list_status`, {}, accessToken)
          
          if (response.ok) {
            const data = await response.json()
            if (data.my_list_status?.score) {
              scoreMap.set(animeId, data.my_list_status.score)
            }
          }
        } catch (error) {
          // Silently continue for individual anime errors
        }
      })

      await Promise.all(promises)
    } catch (error) {
      console.error('MAL get user scores error:', error)
    }
    
    return scoreMap
  },

  async getUserAnimeDetails(animeId: number, accessToken: string): Promise<any> {
    try {
      const response = await malApiRequest(`/anime/${animeId}?fields=my_list_status`, {}, accessToken)
      
      if (!response.ok) {
        return null
      }
      
      const data = await response.json()
      return data.my_list_status
    } catch (error) {
      console.error('MAL get user anime details error:', error)
      return null
    }
  }
}