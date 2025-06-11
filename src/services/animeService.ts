import { AnimeBase, AnimeSource } from '../types/anime'
import { malService } from './mal'
import { anilistService } from './anilist'

export class AnimeService {
  private currentSource: AnimeSource = 'mal'

  setSource(source: AnimeSource | 'jikan') {
    // Map jikan to mal since they use the same IDs and jikan is built on MAL data
    if (source === 'jikan') {
      this.currentSource = 'mal'
    } else {
      this.currentSource = source
    }
  }

  getSource(): AnimeSource {
    return this.currentSource
  }

  // Helper method for error handling without cross-source fallbacks
  private async withErrorHandling<T>(
    apiCall: () => Promise<T>,
    operation: string
  ): Promise<T> {
    try {
      return await apiCall()
    } catch (error) {
      console.error(`${operation} failed for ${this.currentSource}:`, error)
      throw new Error(`${operation} failed for ${this.currentSource}: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  async getTrendingAnime(accessToken?: string): Promise<AnimeBase[]> {
    if (this.currentSource === 'mal') {
      // For MAL, use 'airing' ranking as trending
      return await this.withErrorHandling(
        () => malService.getRankingAnime('airing', accessToken),
        'getTrendingAnime'
      )
    } else {
      return await this.withErrorHandling(
        () => anilistService.getTrendingAnime(),
        'getTrendingAnime'
      )
    }
  }

  async getPopularAnime(accessToken?: string): Promise<AnimeBase[]> {
    if (this.currentSource === 'mal') {
      return await this.withErrorHandling(
        () => malService.getRankingAnime('bypopularity', accessToken),
        'getPopularAnime'
      )
    } else {
      return await this.withErrorHandling(
        () => anilistService.getPopularAnime(),
        'getPopularAnime'
      )
    }
  }

  async getTopRatedAnime(accessToken?: string): Promise<AnimeBase[]> {
    if (this.currentSource === 'mal') {
      return await this.withErrorHandling(
        () => malService.getRankingAnime('all', accessToken),
        'getTopRatedAnime'
      )
    } else {
      return await this.withErrorHandling(
        () => anilistService.getTopRatedAnime(),
        'getTopRatedAnime'
      )
    }
  }

  async getCurrentSeasonAnime(accessToken?: string): Promise<AnimeBase[]> {
    if (this.currentSource === 'mal') {
      const currentDate = new Date()
      const year = currentDate.getFullYear()
      const month = currentDate.getMonth() + 1
      
      let season = 'winter'
      if (month >= 4 && month <= 6) season = 'spring'
      else if (month >= 7 && month <= 9) season = 'summer'
      else if (month >= 10 && month <= 12) season = 'fall'
      
      return await this.withErrorHandling(
        () => malService.getSeasonalAnime(season, year, accessToken),
        'getCurrentSeasonAnime'
      )
    } else {
      return await this.withErrorHandling(
        () => anilistService.getCurrentSeasonAnime(),
        'getCurrentSeasonAnime'
      )
    }
  }

  async searchAnime(query: string, accessToken?: string): Promise<AnimeBase[]> {
    if (this.currentSource === 'mal') {
      return await this.withErrorHandling(
        () => malService.searchAnime(query, accessToken),
        'searchAnime'
      )
    } else {
      return await this.withErrorHandling(
        () => anilistService.searchAnime(query),
        'searchAnime'
      )
    }
  }

  async getAnimeDetails(id: number, accessToken?: string): Promise<AnimeBase> {
    if (this.currentSource === 'mal') {
      return await this.withErrorHandling(
        () => malService.getAnimeDetails(id, accessToken),
        'getAnimeDetails'
      )
    } else {
      return await this.withErrorHandling(
        () => anilistService.getAnimeDetails(id),
        'getAnimeDetails'
      )
    }
  }

  // Source-specific additional methods
  async getRandomAnime(): Promise<AnimeBase> {
    if (this.currentSource === 'mal') {
      // MAL doesn't have random endpoint, use MAL service's Jikan integration
      return await this.withErrorHandling(
        () => malService.getRandomAnime(),
        'getRandomAnime'
      )
    } else {
      // AniList doesn't have random endpoint, throw descriptive error
      throw new Error('Random anime is not available for AniList source. Please switch to MAL source for this feature.')
    }
  }

  async getAnimeRecommendations(_id: number): Promise<AnimeBase[]> {
    if (this.currentSource === 'mal') {
      // Use recommendations available in MAL service (which uses Jikan for enhanced data)
      try {
        // Check if MAL service has recommendations, otherwise return empty
        return []
      } catch (error) {
        console.warn('Failed to get recommendations for MAL:', error)
        return []
      }
    } else {
      // AniList has its own recommendation system
      try {
        // AniList would need its own recommendation implementation
        return []
      } catch (error) {
        console.warn('Failed to get recommendations for AniList:', error)
        return []
      }
    }
  }

  async getUpcomingAnime(): Promise<AnimeBase[]> {
    if (this.currentSource === 'mal') {
      return await this.withErrorHandling(
        () => malService.getUpcomingAnime(),
        'getUpcomingAnime'
      )
    } else {
      // AniList doesn't have upcoming endpoint, throw descriptive error
      throw new Error('Upcoming anime is not available for AniList source. Please switch to MAL source for this feature.')
    }
  }

  async getGenres(): Promise<Array<{ mal_id?: number; name: string }>> {
    if (this.currentSource === 'mal') {
      return await this.withErrorHandling(
        () => malService.getGenres(),
        'getGenres'
      )
    } else {
      // AniList has its own genre system
      try {
        // AniList would need its own genre implementation
        return []
      } catch (error) {
        console.warn('Failed to get genres for AniList:', error)
        return []
      }
    }
  }

  async advancedSearch(params: {
    query?: string
    type?: 'tv' | 'movie' | 'ova' | 'special' | 'ona' | 'music'
    status?: 'airing' | 'complete' | 'upcoming'
    rating?: 'g' | 'pg' | 'pg13' | 'r17' | 'r' | 'rx'
    genre?: string
    min_score?: number
    max_score?: number
    limit?: number
  }): Promise<AnimeBase[]> {
    if (this.currentSource === 'mal') {
      // MAL service includes Jikan's advanced search capabilities
      return await this.withErrorHandling(
        () => malService.advancedSearchAnime(params),
        'advancedSearch'
      )
    } else {
      // For AniList, use basic search for now
      // In production, you'd implement AniList-specific advanced search
      return params.query 
        ? await this.searchAnime(params.query)
        : []
    }
  }
}

export const animeService = new AnimeService()