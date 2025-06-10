import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { AnimeBase } from '../../types/anime'

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
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
              Trending #{currentIndex + 1}
            </span>
          </div>
          
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 leading-tight">
            {currentAnime?.title || 'Loading...'}
          </h1>
          
          <p className="text-lg md:text-xl text-gray-200 mb-6 line-clamp-3 leading-relaxed">
            {currentAnime?.synopsis 
              ? (currentAnime.synopsis.length > 200 
                  ? currentAnime.synopsis.slice(0, 200) + '...'
                  : currentAnime.synopsis)
              : 'Discover this amazing anime and dive into its captivating story filled with adventure, emotion, and unforgettable characters.'
            }
          </p>
          
          <div className="flex flex-wrap items-center gap-4 mb-8">
            {currentAnime?.score && (
              <div className="flex items-center space-x-2 bg-yellow-500 text-black px-3 py-1 rounded-lg font-semibold">
                <span>⭐</span>
                <span>{currentAnime.score.toFixed(1)}</span>
              </div>
            )}
            
            {currentAnime?.year && (
              <div className="flex items-center space-x-2 bg-white/20 text-white px-3 py-1 rounded-lg backdrop-blur-sm">
                <span>📅</span>
                <span>{currentAnime.year}</span>
              </div>
            )}
            
            {currentAnime?.episodes && (
              <div className="flex items-center space-x-2 bg-white/20 text-white px-3 py-1 rounded-lg backdrop-blur-sm">
                <span>📺</span>
                <span>{currentAnime.episodes} episodes</span>
              </div>
            )}
            
            {/* Always show source badge */}
            <div className="flex items-center space-x-2 bg-blue-500/20 text-blue-200 px-3 py-1 rounded-lg backdrop-blur-sm border border-blue-400/30">
              <span>🌐</span>
              <span className="uppercase text-xs font-semibold">{currentAnime?.source || 'Unknown'}</span>
            </div>
          </div>
          
          <div className="flex space-x-4">
            {currentAnime?.source && currentAnime?.id ? (
              <Link
                to={`/anime/${currentAnime.source}/${currentAnime.id}`}
                className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors shadow-lg hover:shadow-xl transform hover:scale-105 transition-transform"
              >
                <span className="mr-2">🔍</span>
                View Details
              </Link>
            ) : (
              <button 
                disabled
                className="inline-flex items-center px-6 py-3 bg-gray-600 text-gray-300 font-semibold rounded-lg cursor-not-allowed"
              >
                <span className="mr-2">🔍</span>
                View Details
              </button>
            )}
            
            <button className="inline-flex items-center px-6 py-3 bg-white/20 hover:bg-white/30 text-white font-semibold rounded-lg transition-colors backdrop-blur-sm border border-white/30 hover:border-white/50">
              <span className="mr-2">▶️</span>
              Watch Trailer
            </button>
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