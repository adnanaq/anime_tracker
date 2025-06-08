import axios from 'axios'
import { AniListAnime, AnimeBase } from '../types/anime'

const ANILIST_BASE_URL = 'https://graphql.anilist.co'

const anilistApi = axios.create({
  baseURL: ANILIST_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 second timeout
})

// Add response interceptor for error handling
anilistApi.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('AniList API Error:', {
      status: error.response?.status,
      message: error.message
    })
    return Promise.reject(error)
  }
)

export const normalizeAniListAnime = (anime: AniListAnime): AnimeBase => ({
  id: anime.id,
  title: anime.title.romaji || anime.title.english || anime.title.native || '',
  synopsis: anime.description?.replace(/<[^>]*>/g, ''), // Remove HTML tags
  image: anime.coverImage?.large || anime.coverImage?.medium,
  coverImage: anime.coverImage?.large || anime.coverImage?.medium,
  score: anime.averageScore ? anime.averageScore / 10 : undefined,
  episodes: anime.episodes,
  status: anime.status,
  genres: anime.genres || [],
  year: anime.startDate?.year,
  season: anime.season,
  format: anime.format,
  source: 'anilist'
})

const ANIME_FIELDS = `
  id
  title {
    romaji
    english
    native
  }
  description
  coverImage {
    medium
    large
  }
  averageScore
  episodes
  status
  genres
  startDate {
    year
  }
  season
  format
`

export const anilistService = {
  async getTrendingAnime() {
    const query = `
      query {
        Page(page: 1, perPage: 20) {
          media(type: ANIME, sort: TRENDING_DESC) {
            ${ANIME_FIELDS}
          }
        }
      }
    `
    
    try {
      const response = await anilistApi.post('', { query })
      return response.data.data.Page.media.map(normalizeAniListAnime)
    } catch (error) {
      console.error('AniList trending error:', error)
      throw error
    }
  },

  async getPopularAnime() {
    const query = `
      query {
        Page(page: 1, perPage: 20) {
          media(type: ANIME, sort: POPULARITY_DESC) {
            ${ANIME_FIELDS}
          }
        }
      }
    `
    
    try {
      const response = await anilistApi.post('', { query })
      return response.data.data.Page.media.map(normalizeAniListAnime)
    } catch (error) {
      console.error('AniList popular error:', error)
      throw error
    }
  },

  async getTopRatedAnime() {
    const query = `
      query {
        Page(page: 1, perPage: 20) {
          media(type: ANIME, sort: SCORE_DESC) {
            ${ANIME_FIELDS}
          }
        }
      }
    `
    
    try {
      const response = await anilistApi.post('', { query })
      return response.data.data.Page.media.map(normalizeAniListAnime)
    } catch (error) {
      console.error('AniList top rated error:', error)
      throw error
    }
  },

  async getCurrentSeasonAnime() {
    const query = `
      query {
        Page(page: 1, perPage: 20) {
          media(type: ANIME, status: RELEASING, sort: POPULARITY_DESC) {
            ${ANIME_FIELDS}
          }
        }
      }
    `
    
    try {
      const response = await anilistApi.post('', { query })
      return response.data.data.Page.media.map(normalizeAniListAnime)
    } catch (error) {
      console.error('AniList current season error:', error)
      throw error
    }
  },

  async searchAnime(searchQuery: string) {
    const query = `
      query($search: String) {
        Page(page: 1, perPage: 20) {
          media(type: ANIME, search: $search) {
            ${ANIME_FIELDS}
          }
        }
      }
    `
    
    try {
      const response = await anilistApi.post('', {
        query,
        variables: { search: searchQuery }
      })
      return response.data.data.Page.media.map(normalizeAniListAnime)
    } catch (error) {
      console.error('AniList search error:', error)
      throw error
    }
  },

  async getAnimeDetails(id: number) {
    const query = `
      query($id: Int) {
        Media(id: $id, type: ANIME) {
          ${ANIME_FIELDS}
          relations {
            edges {
              relationType
              node {
                ${ANIME_FIELDS}
              }
            }
          }
        }
      }
    `
    
    try {
      const response = await anilistApi.post('', {
        query,
        variables: { id }
      })
      return normalizeAniListAnime(response.data.data.Media)
    } catch (error) {
      console.error('AniList anime details error:', error)
      throw error
    }
  }
}