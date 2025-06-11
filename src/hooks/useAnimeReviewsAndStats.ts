import { useState, useEffect } from 'react'
import { jikanService } from '../services/jikan'

interface ReviewsAndStatsData {
  reviews: any[]
  statistics: any
  loading: boolean
  error: string | null
}

export const useAnimeReviewsAndStats = (animeId: number | null, source: string): ReviewsAndStatsData => {
  const [reviews, setReviews] = useState<any[]>([])
  const [statistics, setStatistics] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchReviewsAndStats = async () => {
      if (!animeId || (source !== 'jikan' && source !== 'mal')) {
        setReviews([])
        setStatistics(null)
        return
      }

      setLoading(true)
      setError(null)

      try {
        const [reviewsData, statsData] = await Promise.all([
          jikanService.getAnimeReviews(animeId),
          jikanService.getAnimeStatistics(animeId)
        ])

        setReviews(reviewsData)
        setStatistics(statsData)
      } catch (err) {
        console.debug(`Could not fetch reviews/stats for anime ${animeId}:`, err)
        setError('Failed to fetch reviews and statistics')
        setReviews([])
        setStatistics(null)
      } finally {
        setLoading(false)
      }
    }

    fetchReviewsAndStats()
  }, [animeId, source])

  return { reviews, statistics, loading, error }
}