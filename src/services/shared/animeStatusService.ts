import { AnimeSource } from '../../types/anime'
import { getAuthService } from './index'
import { malService } from '../mal'
import { anilistService } from '../anilist'

export interface AnimeStatusUpdate {
  status?: string
  score?: number
  progress?: number
  notes?: string
}

interface MalStatusUpdate {
  status?: string
  score?: number
  num_watched_episodes?: number
  comments?: string
}

interface AnilistStatusUpdate {
  status?: string
  score?: number
  progress?: number
  notes?: string
}

export const animeStatusService = {
  async updateAnimeStatus(
    animeId: number,
    source: AnimeSource,
    statusUpdate: AnimeStatusUpdate
  ): Promise<void> {
    const authService = getAuthService(source)
    if (!authService?.isAuthenticated()) {
      throw new Error(`Not authenticated with ${source}`)
    }

    const token = authService.getToken()?.access_token
    if (!token) {
      throw new Error('No access token available')
    }

    try {
      if (source === 'mal') {
        // Convert status values for MAL
        const malStatusUpdate: MalStatusUpdate = {}
        
        if (statusUpdate.status) {
          malStatusUpdate.status = statusUpdate.status
        }
        if (statusUpdate.score !== undefined) {
          malStatusUpdate.score = statusUpdate.score
        }
        if (statusUpdate.progress !== undefined) {
          malStatusUpdate.num_watched_episodes = statusUpdate.progress
        }
        if (statusUpdate.notes) {
          malStatusUpdate.comments = statusUpdate.notes
        }

        await malService.updateAnimeStatus(animeId, token, malStatusUpdate)
      } else {
        // Convert status values for AniList
        const anilistStatusUpdate: AnilistStatusUpdate = {}
        
        if (statusUpdate.status) {
          // Convert MAL status to AniList status
          const statusMapping: Record<string, string> = {
            'watching': 'CURRENT',
            'completed': 'COMPLETED',
            'on_hold': 'PAUSED',
            'dropped': 'DROPPED',
            'plan_to_watch': 'PLANNING'
          }
          anilistStatusUpdate.status = statusMapping[statusUpdate.status] || statusUpdate.status
        }
        if (statusUpdate.score !== undefined) {
          anilistStatusUpdate.score = statusUpdate.score
        }
        if (statusUpdate.progress !== undefined) {
          anilistStatusUpdate.progress = statusUpdate.progress
        }
        if (statusUpdate.notes) {
          anilistStatusUpdate.notes = statusUpdate.notes
        }

        await anilistService.updateAnimeStatus(animeId, token, anilistStatusUpdate)
      }
    } catch (error) {
      console.error(`Failed to update anime status on ${source}:`, error)
      throw error
    }
  },

  async removeAnimeFromList(animeId: number, source: AnimeSource): Promise<void> {
    const authService = getAuthService(source)
    if (!authService?.isAuthenticated()) {
      throw new Error(`Not authenticated with ${source}`)
    }

    const token = authService.getToken()?.access_token
    if (!token) {
      throw new Error('No access token available')
    }

    try {
      if (source === 'mal') {
        await malService.deleteAnimeFromList(animeId, token)
      } else {
        await anilistService.deleteAnimeFromList(animeId, token)
      }
    } catch (error) {
      console.error(`Failed to remove anime from ${source} list:`, error)
      throw error
    }
  }
}