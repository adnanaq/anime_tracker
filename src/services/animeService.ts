import { AnimeBase, AnimeSource } from '../types/anime'
import { malService } from './mal'
import { anilistService } from './anilist'
import { jikanService } from './jikan'

export class AnimeService {
  private currentSource: AnimeSource = 'mal'

  setSource(source: AnimeSource) {
    this.currentSource = source
  }

  getSource(): AnimeSource {
    return this.currentSource
  }

  // Helper method for cascading API calls with better error handling
  private async withFallback<T>(
    primaryCall: () => Promise<T>,
    fallbackCall: () => Promise<T>,
    operation: string
  ): Promise<T> {
    try {
      return await primaryCall()
    } catch (error) {
      console.warn(`${operation} failed for ${this.currentSource}, falling back:`, error)
      try {
        return await fallbackCall()
      } catch (fallbackError) {
        console.error(`${operation} fallback also failed:`, fallbackError)
        throw new Error(`Both ${this.currentSource} and fallback failed for ${operation}`)
      }
    }
  }

  async getTrendingAnime(accessToken?: string): Promise<AnimeBase[]> {
    if (this.currentSource === 'mal') {
      return await this.withFallback(
        () => malService.getRankingAnime('airing', accessToken), // Use 'airing' for trending
        () => jikanService.getTrendingAnime(), // Jikan has a proper trending endpoint
        'getTrendingAnime'
      )
    } else {
      return await this.withFallback(
        () => anilistService.getTrendingAnime(),
        () => jikanService.getTrendingAnime(),
        'getTrendingAnime'
      )
    }
  }

  async getPopularAnime(accessToken?: string): Promise<AnimeBase[]> {
    if (this.currentSource === 'mal') {
      return await this.withFallback(
        () => malService.getRankingAnime('bypopularity', accessToken),
        () => jikanService.getPopularAnime(),
        'getPopularAnime'
      )
    } else {
      return await this.withFallback(
        () => anilistService.getPopularAnime(),
        () => jikanService.getPopularAnime(),
        'getPopularAnime'
      )
    }
  }

  async getTopRatedAnime(accessToken?: string): Promise<AnimeBase[]> {
    if (this.currentSource === 'mal') {
      return await this.withFallback(
        () => malService.getRankingAnime('all', accessToken),
        () => jikanService.getTopRatedAnime(),
        'getTopRatedAnime'
      )
    } else {
      return await this.withFallback(
        () => anilistService.getTopRatedAnime(),
        () => jikanService.getTopRatedAnime(),
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
      
      return await this.withFallback(
        () => malService.getSeasonalAnime(season, year, accessToken),
        () => jikanService.getCurrentSeasonAnime(),
        'getCurrentSeasonAnime'
      )
    } else {
      return await this.withFallback(
        () => anilistService.getCurrentSeasonAnime(),
        () => jikanService.getCurrentSeasonAnime(),
        'getCurrentSeasonAnime'
      )
    }
  }

  async searchAnime(query: string, accessToken?: string): Promise<AnimeBase[]> {
    if (this.currentSource === 'mal') {
      return await this.withFallback(
        () => malService.searchAnime(query, accessToken),
        () => jikanService.searchAnime(query),
        'searchAnime'
      )
    } else {
      return await this.withFallback(
        () => anilistService.searchAnime(query),
        () => jikanService.searchAnime(query),
        'searchAnime'
      )
    }
  }

  async getAnimeDetails(id: number, accessToken?: string): Promise<AnimeBase> {
    if (this.currentSource === 'mal') {
      return await this.withFallback(
        () => malService.getAnimeDetails(id, accessToken),
        () => jikanService.getAnimeDetails(id), // Jikan uses MAL IDs, so this fallback works
        'getAnimeDetails'
      )
    } else {
      // For AniList, we can't easily fall back to MAL/Jikan since IDs are different
      // In a production app, you'd implement ID mapping between services
      return await anilistService.getAnimeDetails(id)
    }
  }

  // Additional cached methods leveraging Jikan's enhanced features
  async getRandomAnime(): Promise<AnimeBase> {
    // Always use Jikan for random anime as it has the best random endpoint
    return await jikanService.getRandomAnime()
  }

  async getAnimeRecommendations(id: number): Promise<AnimeBase[]> {
    // Use Jikan for recommendations as it has comprehensive data
    try {
      return await jikanService.getAnimeRecommendations(id)
    } catch (error) {
      console.warn('Failed to get recommendations from Jikan:', error)
      return []
    }
  }

  async getUpcomingAnime(): Promise<AnimeBase[]> {
    if (this.currentSource === 'mal') {
      // For MAL source, try MAL first then Jikan
      return await this.withFallback(
        () => malService.getUpcomingAnime(),
        () => jikanService.getUpcomingAnime(),
        'getUpcomingAnime'
      )
    } else {
      // For AniList source, use Jikan directly (AniList doesn't have upcoming endpoint)
      return await jikanService.getUpcomingAnime()
    }
  }

  async getGenres(): Promise<Array<{ mal_id?: number; name: string }>> {
    // Use Jikan for genres as it has comprehensive genre data
    try {
      return await jikanService.getGenres()
    } catch (error) {
      console.warn('Failed to get genres from Jikan:', error)
      return []
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
      // For MAL, use Jikan's advanced search capabilities  
      return await jikanService.advancedSearchAnime(params)
    } else {
      // For AniList, fall back to basic search for now
      // In production, you'd implement AniList advanced search
      return params.query 
        ? await this.searchAnime(params.query)
        : []
    }
  }
}

export const animeService = new AnimeService()