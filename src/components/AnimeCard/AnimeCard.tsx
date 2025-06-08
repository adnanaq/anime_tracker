import { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { animate } from 'animejs'
import { AnimeBase } from '../../types/anime'
import { HoverCard } from '../HoverCard/HoverCard'
import { getAuthService } from '../../services/auth'

interface AnimeCardProps {
  anime: AnimeBase
}

export const AnimeCard = ({ anime: animeItem }: AnimeCardProps) => {
  const [showHover, setShowHover] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)
  const imageRef = useRef<HTMLImageElement>(null)
  const overlayRef = useRef<HTMLDivElement>(null)
  const badgeRef = useRef<HTMLDivElement>(null)
  const titleRef = useRef<HTMLDivElement>(null)
  
  // Check if user is authenticated for this anime's source
  const authServiceInstance = getAuthService(animeItem.source)
  const isAuthenticated = authServiceInstance?.isAuthenticated() ?? false
  

  const handleMouseEnter = () => {
    setShowHover(true)
    
    // Card hover animation
    if (cardRef.current) {
      animate(cardRef.current, {
        scale: 1.05,
        translateY: -8,
        boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
        duration: 400,
        easing: 'easeOutQuart'
      })
    }

    // Image zoom animation
    if (imageRef.current) {
      animate(imageRef.current, {
        scale: 1.1,
        duration: 600,
        easing: 'easeOutQuart'
      })
    }

    // Badge animation
    if (badgeRef.current) {
      animate(badgeRef.current, {
        scale: 1.1,
        rotate: '5deg',
        duration: 300,
        easing: 'easeOutBack'
      })
    }

    // Overlay fade in
    if (overlayRef.current) {
      animate(overlayRef.current, {
        opacity: 1,
        duration: 300,
        easing: 'easeOutQuart'
      })
    }

    // Title slide up
    if (titleRef.current) {
      animate(titleRef.current, {
        translateY: 0,
        opacity: 1,
        duration: 400,
        delay: 100,
        easing: 'easeOutQuart'
      })
    }
  }

  const handleMouseLeave = () => {
    setShowHover(false)
    
    // Reset card animation
    if (cardRef.current) {
      animate(cardRef.current, {
        scale: 1,
        translateY: 0,
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
        duration: 300,
        easing: 'easeOutQuart'
      })
    }

    // Reset image
    if (imageRef.current) {
      animate(imageRef.current, {
        scale: 1,
        duration: 400,
        easing: 'easeOutQuart'
      })
    }

    // Reset badge
    if (badgeRef.current) {
      animate(badgeRef.current, {
        scale: 1,
        rotate: '0deg',
        duration: 300,
        easing: 'easeOutQuart'
      })
    }

    // Fade out overlay
    if (overlayRef.current) {
      animate(overlayRef.current, {
        opacity: 0,
        duration: 200,
        easing: 'easeOutQuart'
      })
    }

    // Hide title
    if (titleRef.current) {
      animate(titleRef.current, {
        translateY: 20,
        opacity: 0,
        duration: 200,
        easing: 'easeOutQuart'
      })
    }
  }

  useEffect(() => {
    // Initial entrance animation
    if (cardRef.current) {
      animate(cardRef.current, {
        opacity: [0, 1],
        translateY: [50, 0],
        scale: [0.8, 1],
        duration: 800,
        delay: Math.random() * 200,
        easing: 'easeOutElastic(1, .8)'
      })
    }
  }, [])

  return (
    <div className="relative">
      <div
        ref={cardRef}
        className="relative bg-white rounded-lg shadow-md overflow-hidden cursor-pointer group opacity-0"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        style={{ transform: 'translateY(0px)' }}
      >
        <Link to={`/anime/${animeItem.source}/${animeItem.id}`}>
          <div className="aspect-[3/4] relative">
            {animeItem.image ? (
              <img
                ref={imageRef}
                src={animeItem.image}
                alt={animeItem.title}
                className="w-full h-full object-cover transition-transform duration-300"
                loading="lazy"
                style={{ transform: 'scale(1)' }}
              />
            ) : (
              <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                <span className="text-gray-400 text-sm">No Image</span>
              </div>
            )}
            
            {/* Overlay with gradient */}
            <div 
              ref={overlayRef}
              className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0"
              style={{ opacity: 0 }}
            />
            
            {/* Global Score badge - top left */}
            {animeItem.score && (
              <div 
                ref={badgeRef}
                className="absolute top-2 left-2 bg-blue-500 text-white px-2 py-1 rounded-md text-sm font-semibold"
                style={{ transform: 'scale(1) rotateZ(0deg)' }}
              >
                {animeItem.score.toFixed(1)}
              </div>
            )}
            
            {/* User Score badge - top right (only show when authenticated) */}
            {isAuthenticated && animeItem.userScore && (
              <div 
                className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded-md text-sm font-semibold"
                style={{ transform: 'scale(1) rotateZ(0deg)' }}
              >
                {animeItem.userScore}
              </div>
            )}
            
            {/* Quick info overlay */}
            <div 
              ref={titleRef}
              className="absolute bottom-0 left-0 right-0 p-3 text-white opacity-0"
              style={{ transform: 'translateY(20px)', opacity: 0 }}
            >
              <h3 className="font-semibold text-sm mb-1 line-clamp-2">{animeItem.title}</h3>
              {animeItem.episodes && (
                <p className="text-xs opacity-90">{animeItem.episodes} episodes</p>
              )}
              {animeItem.year && (
                <p className="text-xs opacity-90">{animeItem.year}</p>
              )}
            </div>
          </div>
        </Link>
      </div>

      {/* Hover Card */}
      {showHover && (
        <div className="absolute z-50 top-0 left-full ml-4 w-80">
          <HoverCard anime={animeItem} />
        </div>
      )}
    </div>
  )
}