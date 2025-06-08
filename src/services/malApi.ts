import axios from 'axios'
import { MALAnime, AnimeBase } from '../types/anime'

// Use proxy in development to avoid CORS issues
const isDevelopment = import.meta.env.DEV
const MAL_BASE_URL = isDevelopment 
  ? 'http://localhost:3002/mal' 
  : 'https://api.myanimelist.net/v2'
const CLIENT_ID = import.meta.env.VITE_MAL_CLIENT_ID


const malApi = axios.create({
  baseURL: MAL_BASE_URL,
  headers: isDevelopment ? {
    'Content-Type': 'application/json',
  } : {
    'X-MAL-CLIENT-ID': CLIENT_ID,
    'Content-Type': 'application/json',
  },
})

// Add response interceptor for error handling
malApi.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('MAL API Error:', {
      status: error.response?.status,
      message: error.message
    })
    return Promise.reject(error)
  }
)

export const normalizeMALAnime = (anime: MALAnime): AnimeBase => ({
  id: anime.id,
  title: anime.title,
  synopsis: anime.synopsis,
  image: anime.main_picture?.large || anime.main_picture?.medium,
  coverImage: anime.main_picture?.large || anime.main_picture?.medium,
  score: anime.mean,
  episodes: anime.num_episodes,
  status: anime.status,
  genres: anime.genres?.map(g => g.name) || [],
  year: anime.start_date ? new Date(anime.start_date).getFullYear() : undefined,
  format: anime.media_type,
  source: 'mal'
})

export const malService = {
  async getSeasonalAnime(season?: string, year?: number) {
    try {
      if (!season || !year) {
        // Fallback to ranking if season/year not provided
        return await this.getRankingAnime('airing')
      }

      const response = await malApi.get(`/anime/season/${year}/${season}`, {
        params: {
          fields: 'id,title,main_picture,synopsis,mean,num_episodes,status,genres,start_date,media_type',
          limit: 20
        }
      })
      return response.data.data.map((item: { node: MALAnime }) => normalizeMALAnime(item.node))
    } catch (error) {
      console.error('MAL seasonal anime error:', error)
      // Fallback to ranking on error
      return await this.getRankingAnime('airing')
    }
  },

  async getRankingAnime(rankingType: string = 'all') {
    try {
      const response = await malApi.get('/anime/ranking', {
        params: {
          ranking_type: rankingType,
          fields: 'id,title,main_picture,synopsis,mean,num_episodes,status,genres,start_date,media_type',
          limit: 20
        }
      })
      return response.data.data.map((item: { node: MALAnime }) => normalizeMALAnime(item.node))
    } catch (error) {
      console.error('MAL ranking anime error:', error)
      throw error
    }
  },

  async searchAnime(query: string) {
    try {
      const response = await malApi.get('/anime', {
        params: {
          q: query,
          fields: 'id,title,main_picture,synopsis,mean,num_episodes,status,genres,start_date,media_type',
          limit: 20
        }
      })
      return response.data.data.map((item: { node: MALAnime }) => normalizeMALAnime(item.node))
    } catch (error) {
      console.error('MAL search error:', error)
      throw error
    }
  },

  async getAnimeDetails(id: number) {
    try {
      const response = await malApi.get(`/anime/${id}`, {
        params: {
          fields: 'id,title,main_picture,synopsis,mean,num_episodes,status,genres,start_date,media_type,related_anime'
        }
      })
      return normalizeMALAnime(response.data)
    } catch (error) {
      console.error('MAL anime details error:', error)
      throw error
    }
  }
}