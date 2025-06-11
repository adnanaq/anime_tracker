import { useState, useEffect } from 'react'
import { jikanService } from '../services/jikan'
import { AnimeBase } from '../types/anime'

interface EnhancedImage {
  id: number
  originalImage: string
  enhancedImages: string[]
  bestImage: string
}

export const useEnhancedImages = (anime: AnimeBase[]): EnhancedImage[] => {
  const [enhancedImages, setEnhancedImages] = useState<EnhancedImage[]>([])

  useEffect(() => {
    const fetchEnhancedImages = async () => {
      if (anime.length === 0) {
        setEnhancedImages([])
        return
      }
      const enhanced: EnhancedImage[] = []

      // Process anime items and fetch Jikan pictures for better quality
      for (const item of anime.slice(0, 5)) {
        const originalImage = item.coverImage || item.image || ''
        let enhancedImageUrls: string[] = []
        let bestImage = originalImage

        try {
          // Only fetch from Jikan if we have a MAL ID (Jikan uses MAL IDs)
          // For now, we'll try fetching assuming the ID might work
          if (item.source === 'jikan' || item.source === 'mal') {
            const pictures = await jikanService.getAnimePictures(item.id)
            
            if (pictures && pictures.length > 0) {
              // Extract high-quality images
              enhancedImageUrls = pictures
                .map(pic => pic.jpg.large_image_url || pic.jpg.image_url)
                .filter(url => url && url !== originalImage)
                .slice(0, 3) // Limit to 3 additional images
              
              // Use the first enhanced image as the best option, or original if none
              bestImage = enhancedImageUrls[0] || originalImage
            }
          }
        } catch (error) {
          // Silently fall back to original image if Jikan fetch fails
          console.debug(`Could not fetch enhanced images for anime ${item.id}:`, error)
        }

        enhanced.push({
          id: item.id,
          originalImage,
          enhancedImages: enhancedImageUrls,
          bestImage
        })
      }

      setEnhancedImages(enhanced)
    }

    fetchEnhancedImages()
  }, [anime])

  return enhancedImages
}

// Hook for getting a single enhanced image
export const useEnhancedImage = (animeId: number, source: string, originalImage?: string) => {
  const [enhancedImage, setEnhancedImage] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const fetchEnhancedImage = async () => {
      if (!originalImage || (source !== 'jikan' && source !== 'mal')) {
        setEnhancedImage(originalImage || null)
        return
      }

      setLoading(true)
      try {
        const pictures = await jikanService.getAnimePictures(animeId)
        
        if (pictures && pictures.length > 0) {
          // Get the highest quality image available
          const bestPicture = pictures[0]
          const bestImage = bestPicture.jpg.large_image_url || bestPicture.jpg.image_url
          setEnhancedImage(bestImage)
        } else {
          setEnhancedImage(originalImage)
        }
      } catch (error) {
        console.debug(`Could not fetch enhanced image for anime ${animeId}:`, error)
        setEnhancedImage(originalImage)
      } finally {
        setLoading(false)
      }
    }

    fetchEnhancedImage()
  }, [animeId, source, originalImage])

  return { enhancedImage: enhancedImage || originalImage, loading }
}