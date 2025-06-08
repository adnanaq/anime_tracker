import { AnimeBase, AnimeSource } from '../types/anime'
import { malService } from './malApi'
import { anilistService } from './anilistApiFetch'

export class AnimeService {
  private currentSource: AnimeSource = 'mal'

  setSource(source: AnimeSource) {
    this.currentSource = source
  }

  getSource(): AnimeSource {
    return this.currentSource
  }

  async getTrendingAnime(): Promise<AnimeBase[]> {
    if (this.currentSource === 'mal') {
      try {
        // MAL doesn't have a direct trending endpoint, use ranking instead
        return await malService.getRankingAnime('all')
      } catch (error) {
        // Fall back to AniList data and keep AniList source for proper detail page routing
        const anilistData = await anilistService.getTrendingAnime()
        return anilistData // Keep original AniList source
      }
    } else {
      return await anilistService.getTrendingAnime()
    }
  }

  async getPopularAnime(): Promise<AnimeBase[]> {
    if (this.currentSource === 'mal') {
      try {
        return await malService.getRankingAnime('bypopularity')
      } catch (error) {
        const anilistData = await anilistService.getPopularAnime()
        return anilistData // Keep original AniList source
      }
    } else {
      return await anilistService.getPopularAnime()
    }
  }

  async getTopRatedAnime(): Promise<AnimeBase[]> {
    if (this.currentSource === 'mal') {
      try {
        return await malService.getRankingAnime('all')
      } catch (error) {
        const anilistData = await anilistService.getTopRatedAnime()
        return anilistData // Keep original AniList source
      }
    } else {
      return await anilistService.getTopRatedAnime()
    }
  }

  async getCurrentSeasonAnime(): Promise<AnimeBase[]> {
    if (this.currentSource === 'mal') {
      try {
        const currentDate = new Date()
        const year = currentDate.getFullYear()
        const month = currentDate.getMonth() + 1
        
        let season = 'winter'
        if (month >= 4 && month <= 6) season = 'spring'
        else if (month >= 7 && month <= 9) season = 'summer'
        else if (month >= 10 && month <= 12) season = 'fall'
        
        return await malService.getSeasonalAnime(season, year)
      } catch (error) {
        const anilistData = await anilistService.getCurrentSeasonAnime()
        return anilistData // Keep original AniList source
      }
    } else {
      return await anilistService.getCurrentSeasonAnime()
    }
  }

  async searchAnime(query: string): Promise<AnimeBase[]> {
    if (this.currentSource === 'mal') {
      try {
        return await malService.searchAnime(query)
      } catch (error) {
        const anilistData = await anilistService.searchAnime(query)
        return anilistData // Keep original AniList source
      }
    } else {
      return await anilistService.searchAnime(query)
    }
  }

  async getAnimeDetails(id: number): Promise<AnimeBase> {
    if (this.currentSource === 'mal') {
      try {
        return await malService.getAnimeDetails(id)
      } catch (error) {
        // Note: This fallback won't work perfectly as MAL and AniList have different IDs
        // In a real app, you'd need ID mapping
        throw error // For now, just throw the error since ID mapping is complex
      }
    } else {
      return await anilistService.getAnimeDetails(id)
    }
  }
}

export const animeService = new AnimeService()