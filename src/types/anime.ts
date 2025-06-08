export interface AnimeBase {
  id: number
  title: string
  synopsis?: string
  image?: string
  coverImage?: string
  score?: number
  episodes?: number
  status?: string
  genres?: string[]
  year?: number
  season?: string
  format?: string
  source: 'mal' | 'anilist'
}

export interface MALAnime {
  id: number
  title: string
  main_picture?: {
    medium: string
    large: string
  }
  synopsis?: string
  mean?: number
  num_episodes?: number
  status?: string
  genres?: Array<{ id: number; name: string }>
  start_date?: string
  media_type?: string
}

export interface AniListAnime {
  id: number
  title: {
    romaji: string
    english?: string
    native?: string
  }
  description?: string
  coverImage?: {
    medium: string
    large: string
  }
  averageScore?: number
  episodes?: number
  status?: string
  genres?: string[]
  startDate?: {
    year?: number
  }
  season?: string
  format?: string
}

export interface AnimeListResponse {
  data: AnimeBase[]
  pagination?: {
    currentPage: number
    totalPages: number
    hasNext: boolean
  }
}

export type AnimeSource = 'mal' | 'anilist'