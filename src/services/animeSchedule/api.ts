import { AnimeBase } from '../../types/anime'

// Use proxy in development to avoid CORS issues
const isDevelopment = import.meta.env.DEV
const ANIME_SCHEDULE_BASE_URL = isDevelopment
  ? 'http://localhost:3002/animeschedule'
  : 'https://animeschedule.net/api/v3'

// Rate limiting: 120 requests per minute
const RATE_LIMIT_DELAY = 500 // 500ms between requests (safe margin)
let lastRequestTime = 0

const rateLimitedFetch = async (url: string): Promise<Response> => {
  const now = Date.now()
  const timeSinceLastRequest = now - lastRequestTime
  
  if (timeSinceLastRequest < RATE_LIMIT_DELAY) {
    await new Promise(resolve => setTimeout(resolve, RATE_LIMIT_DELAY - timeSinceLastRequest))
  }
  
  lastRequestTime = Date.now()
  
  // In development, use proxy (no need for auth header as proxy handles it)
  const headers: Record<string, string> = {
    'Content-Type': 'application/json'
  }
  
  if (!isDevelopment) {
    headers['Authorization'] = 'Bearer MDnyW7kcDAMtyiaIg4bc2IIMOrHpbQ'
  }
  
  return fetch(url, { headers })
}

// AnimeSchedule.net response types
export interface AnimeScheduleEntry {
  title: string
  route: string
  romaji?: string
  english?: string
  native?: string
  episodeDate: string
  episodeNumber: number
  lengthMin?: number
  airType: 'raw' | 'sub' | 'dub'
  delayedFrom?: string
  delayedUntil?: string
  episodeDelay?: number
  airingStatus: 'aired' | 'airing' | 'delayed' | 'skipped' | 'tba'
  streams?: {
    crunchyroll?: string
    funimation?: string
    youtube?: string
    amazon?: string
    apple?: string
    hidive?: string
    [key: string]: string | undefined
  }
  malId?: number
  anilistId?: number
  status?: string
  episodes?: number
  donghua?: boolean
  imageVersionRoute?: string
}

export interface AnimeScheduleResponse {
  data: AnimeScheduleEntry[]
  meta: {
    total: number
    perPage: number
    currentPage: number
    lastPage: number
  }
}

const normalizeAnimeScheduleEntry = (entry: AnimeScheduleEntry): AnimeBase => {
  const hasValidMalId = !!(entry.malId && entry.malId > 0)
  
  return {
    id: hasValidMalId ? entry.malId! : Math.floor(Math.random() * 1000000), // Use random ID for display only
    title: entry.english || entry.romaji || entry.title,
    synopsis: undefined, // AnimeSchedule doesn't provide synopsis
    image: undefined, // AnimeSchedule doesn't provide images
    coverImage: undefined,
    score: undefined,
    episodes: entry.episodes, // Total episodes if available
    status: entry.airingStatus === 'aired' ? 'finished_airing' : 
            entry.airingStatus === 'airing' ? 'currently_airing' : 'not_yet_aired',
    genres: [],
    source: 'mal' as const, // Using mal as source since these are MAL IDs
    // Additional AnimeSchedule-specific data
    episodeNumber: entry.episodeNumber,
    episodeDate: entry.episodeDate,
    lengthMin: entry.lengthMin,
    airingStatus: entry.airingStatus,
    episodeDelay: entry.episodeDelay,
    hasValidId: hasValidMalId, // Flag to indicate this has a valid MAL ID
    malId: entry.malId // Store the original MAL ID
  }
}

export const animeScheduleService = {
  async getTimetables(params?: {
    date?: string // Format: YYYY-MM-DD
    timezone?: string // e.g., 'America/New_York', 'Europe/London'
    limit?: number
    page?: number
  }): Promise<AnimeBase[]> {
    try {
      const searchParams = new URLSearchParams()
      
      if (params?.date) searchParams.append('date', params.date)
      if (params?.timezone) searchParams.append('timezone', params.timezone)
      if (params?.limit) searchParams.append('limit', params.limit.toString())
      if (params?.page) searchParams.append('page', params.page.toString())
      
      const url = `${ANIME_SCHEDULE_BASE_URL}/timetables${searchParams.toString() ? `?${searchParams}` : ''}`
      const response = await rateLimitedFetch(url)
      
      if (!response.ok) {
        throw new Error(`AnimeSchedule API error: ${response.status} ${response.statusText}`)
      }
      
      const data: AnimeScheduleEntry[] = await response.json()
      return data.map(normalizeAnimeScheduleEntry)
    } catch (error) {
      console.error('AnimeSchedule timetables error:', error)
      return []
    }
  },

  async getWeeklySchedule(timezone?: string): Promise<{ [day: string]: AnimeBase[] }> {
    try {
      const weeklySchedule: { [day: string]: AnimeBase[] } = {
        monday: [],
        tuesday: [],
        wednesday: [],
        thursday: [],
        friday: [],
        saturday: [],
        sunday: []
      }
      
      // Get upcoming episodes for the next 7 days
      const allEpisodes = await this.getUpcomingEpisodes(7, timezone)
      
      // Group episodes by the day they actually air (based on episodeDate)
      allEpisodes.forEach(episode => {
        if (episode.episodeDate) {
          const airDate = new Date(episode.episodeDate)
          const dayName = airDate.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase()
          
          if (weeklySchedule[dayName]) {
            weeklySchedule[dayName].push(episode)
          }
        }
      })
      
      return weeklySchedule
    } catch (error) {
      console.error('AnimeSchedule weekly schedule error:', error)
      return {
        monday: [],
        tuesday: [],
        wednesday: [],
        thursday: [],
        friday: [],
        saturday: [],
        sunday: []
      }
    }
  },

  async getTodaySchedule(timezone?: string): Promise<AnimeBase[]> {
    try {
      const today = new Date().toISOString().split('T')[0]
      return await this.getTimetables({
        date: today,
        timezone: timezone || 'UTC',
        limit: 50
      })
    } catch (error) {
      console.error('AnimeSchedule today schedule error:', error)
      return []
    }
  },

  async getDaySchedule(date: string, timezone?: string): Promise<AnimeBase[]> {
    try {
      return await this.getTimetables({
        date,
        timezone: timezone || 'UTC',
        limit: 50
      })
    } catch (error) {
      console.error(`AnimeSchedule day schedule error for ${date}:`, error)
      return []
    }
  },

  async getUpcomingEpisodes(days: number = 7, timezone?: string): Promise<AnimeBase[]> {
    try {
      // Get upcoming episodes from timetables
      const allEpisodes = await this.getTimetables({
        timezone: timezone || 'UTC',
        limit: 200
      })
      
      // Filter to only episodes within the next `days` days
      const now = new Date()
      const futureDate = new Date(now.getTime() + (days * 24 * 60 * 60 * 1000))
      
      const upcomingEpisodes = allEpisodes.filter(episode => {
        if (!episode.episodeDate) return false
        
        const episodeDate = new Date(episode.episodeDate)
        return episodeDate >= now && episodeDate <= futureDate
      })
      
      // Sort by episode date
      return upcomingEpisodes.sort((a, b) => {
        const dateA = new Date(a.episodeDate || 0)
        const dateB = new Date(b.episodeDate || 0)
        return dateA.getTime() - dateB.getTime()
      })
    } catch (error) {
      console.error('AnimeSchedule upcoming episodes error:', error)
      return []
    }
  }
}