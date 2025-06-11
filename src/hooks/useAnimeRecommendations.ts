import { useState, useEffect } from 'react'
import { AnimeBase } from '../types/anime'
import { jikanService } from '../services/jikan'

export const useAnimeRecommendations = (animeId: number | null, source: string) => {
  const [recommendations, setRecommendations] = useState<AnimeBase[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchRecommendations = async () => {
      if (!animeId) {
        setRecommendations([])
        return
      }

      // Only fetch recommendations for anime that might have MAL IDs
      // Jikan uses MAL IDs, so we can try for 'jikan' and 'mal' sources
      if (source !== 'jikan' && source !== 'mal') {
        setRecommendations([])
        return
      }

      setLoading(true)
      setError(null)

      try {
        const recs = await jikanService.getAnimeRecommendations(animeId)
        setRecommendations(recs)
      } catch (err) {
        console.debug(`Could not fetch recommendations for anime ${animeId}:`, err)
        setError('Failed to fetch recommendations')
        setRecommendations([])
      } finally {
        setLoading(false)
      }
    }

    fetchRecommendations()
  }, [animeId, source])

  return { recommendations, loading, error }
}