import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { AnimeBase } from '../../types/anime'
import { Typography, Button, Badge } from '../ui'

interface HeroProps {
  anime: AnimeBase[]
}

export const Hero = ({ anime }: HeroProps) => {
  const [currentIndex, setCurrentIndex] = useState(0)
  const heroRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const imageRef = useRef<HTMLDivElement>(null)

  const heroAnime = anime.slice(0, 5).filter(item => item.image || item.coverImage)

  // Preload next images for smoother transitions
  useEffect(() => {
    heroAnime.forEach((anime, index) => {
      if (index !== currentIndex) {
        const img = new Image()
        const imageUrl = anime.coverImage || anime.image
        if (imageUrl) {
          img.src = imageUrl
        }
      }
    })
  }, [heroAnime, currentIndex])

  const handleTransition = (newIndex: number) => {
    if (newIndex === currentIndex || heroAnime.length === 0) return
    setCurrentIndex(newIndex)
  }

  useEffect(() => {
    if (heroAnime.length === 0) return

    const interval = setInterval(() => {
      const nextIndex = (currentIndex + 1) % heroAnime.length
      handleTransition(nextIndex)
    }, 5000)

    return () => clearInterval(interval)
  }, [heroAnime.length, currentIndex])

  if (heroAnime.length === 0) return null

  // Ensure currentIndex is within bounds
  const safeIndex = Math.max(0, Math.min(currentIndex, heroAnime.length - 1))
  const currentAnime = heroAnime[safeIndex]
  
  if (!currentAnime) return null

  return (
    <div 
      ref={heroRef}
      className="relative h-96 md:h-[500px] lg:h-[600px] overflow-hidden"
    >
      <div 
        ref={imageRef}
        className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-all duration-1000"
        style={{
          backgroundImage: (() => {
            const imageUrl = currentAnime?.coverImage || currentAnime?.image
            return imageUrl ? `url(${imageUrl})` : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
          })(),
          filter: 'brightness(0.6) contrast(1.1) saturate(1.1)',
          backgroundPosition: 'center center'
        }}
      />
      
      <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
      
      <div className="relative h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center">
        <div key={currentAnime.id} ref={contentRef} className="max-w-2xl" style={{ opacity: 1 }}>
          <div className="mb-4">
            <Badge variant="primary" size="sm" className="backdrop-blur-sm">
              Trending #{currentIndex + 1}
            </Badge>
          </div>
          
          <Typography variant="h1" color="inverse" className="mb-4 leading-tight">
            {currentAnime?.title || 'Loading...'}
          </Typography>
          
          <Typography variant="bodyLarge" color="inverse" className="mb-6 line-clamp-3 leading-relaxed opacity-90">
            {currentAnime?.synopsis 
              ? (currentAnime.synopsis.length > 200 
                  ? currentAnime.synopsis.slice(0, 200) + '...'
                  : currentAnime.synopsis)
              : 'Discover this amazing anime and dive into its captivating story filled with adventure, emotion, and unforgettable characters.'
            }
          </Typography>
          
          <div className="flex flex-wrap items-center gap-4 mb-8">
            {currentAnime?.score && (
              <Badge variant="warning" size="md" icon="⭐" className="backdrop-blur-sm">
                {currentAnime.score.toFixed(1)}
              </Badge>
            )}
            
            {currentAnime?.year && (
              <Badge variant="neutral" size="md" icon="📅" className="backdrop-blur-sm !bg-white/20 !text-white">
                {currentAnime.year}
              </Badge>
            )}
            
            {currentAnime?.episodes && (
              <Badge variant="neutral" size="md" icon="📺" className="backdrop-blur-sm !bg-white/20 !text-white">
                {currentAnime.episodes} episodes
              </Badge>
            )}
            
            {/* Always show source badge */}
            <Badge variant="info" size="md" icon="🌐" className="backdrop-blur-sm !bg-blue-500/20 !text-blue-200 !border !border-blue-400/30">
              {currentAnime?.source?.toUpperCase() || 'UNKNOWN'}
            </Badge>
          </div>
          
          <div className="flex space-x-4">
            {currentAnime?.source && currentAnime?.id ? (
              <Button
                as={Link}
                to={`/anime/${currentAnime.source}/${currentAnime.id}`}
                variant="primary"
                size="lg"
                leftIcon="🔍"
                animated
                className="shadow-lg hover:shadow-xl"
              >
                View Details
              </Button>
            ) : (
              <Button 
                variant="primary"
                size="lg"
                disabled
                leftIcon="🔍"
              >
                View Details
              </Button>
            )}
            
            <Button
              variant="outline"
              size="lg"
              leftIcon="▶️"
              className="!bg-white/20 hover:!bg-white/30 !text-white backdrop-blur-sm !border-white/30 hover:!border-white/50"
            >
              Watch Trailer
            </Button>
          </div>
        </div>
      </div>
      
      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-2">
        {heroAnime.map((_, index) => (
          <button
            key={index}
            onClick={() => handleTransition(index)}
            className={`w-2 h-2 rounded-full transition-all ${
              index === currentIndex 
                ? 'bg-white w-8' 
                : 'bg-white/50 hover:bg-white/75'
            }`}
          />
        ))}
      </div>
    </div>
  )
}