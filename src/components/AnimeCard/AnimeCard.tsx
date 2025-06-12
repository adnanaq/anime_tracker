import { useRef, useEffect, memo } from 'react'
import { Link } from 'react-router-dom'
import { animate } from 'animejs'
import { AnimeBase } from '../../types/anime'
// import { HoverCard } from '../HoverCard/HoverCard'
import { useAnimeAuth } from '../../hooks/useAuth'
import { Typography, Badge } from '../ui'

interface AnimeCardProps {
  anime: AnimeBase
}

const AnimeCardComponent = ({ anime: animeItem }: AnimeCardProps) => {
  const cardRef = useRef<HTMLDivElement>(null)
  const imageRef = useRef<HTMLImageElement>(null)
  const overlayRef = useRef<HTMLDivElement>(null)
  const badgeRef = useRef<HTMLDivElement>(null)
  const titleRef = useRef<HTMLDivElement>(null)
  const hoverTimeoutRef = useRef<number | null>(null)
  
  // Check if user is authenticated for this anime's source
  const { isAuthenticated } = useAnimeAuth(animeItem.source)

  const handleMouseEnter = () => {
    if (!cardRef.current) return
    
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current)
      hoverTimeoutRef.current = null
    }
    
    if (imageRef.current) {
      animate(imageRef.current, {
        scale: [1, 1.1],
        duration: 300,
        easing: 'easeOutQuart'
      })
    }
    
    if (overlayRef.current) {
      animate(overlayRef.current, {
        opacity: [0, 1],
        duration: 300,
        easing: 'easeOutQuart'
      })
    }
    
    if (badgeRef.current) {
      animate(badgeRef.current, {
        scale: [1, 1.1],
        rotateZ: [0, -5],
        duration: 300,
        easing: 'easeOutQuart'
      })
    }
    
    if (titleRef.current) {
      animate(titleRef.current, {
        translateY: [20, 0],
        opacity: [0, 1],
        duration: 300,
        delay: 100,
        easing: 'easeOutQuart'
      })
    }
  }

  const handleMouseLeave = () => {
    if (!cardRef.current) return
    
    hoverTimeoutRef.current = window.setTimeout(() => {
      if (imageRef.current) {
        animate(imageRef.current, {
          scale: [1.1, 1],
          duration: 250,
          easing: 'easeOutQuart'
        })
      }
      
      if (overlayRef.current) {
        animate(overlayRef.current, {
          opacity: [1, 0],
          duration: 250,
          easing: 'easeOutQuart'
        })
      }
      
      if (badgeRef.current) {
        animate(badgeRef.current, {
          scale: [1.1, 1],
          rotateZ: [-5, 0],
          duration: 250,
          easing: 'easeOutQuart'
        })
      }
      
      if (titleRef.current) {
        animate(titleRef.current, {
          translateY: [0, 20],
          opacity: [1, 0],
          duration: 250,
          easing: 'easeOutQuart'
        })
      }
    }, 100)
  }

  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current)
      }
    }
  }, [])

  return (
    <div className="relative anime-card-container group/card hover:z-[1000]">
      <div
        ref={cardRef}
        className="relative bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden cursor-pointer"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <Link to={`/anime/${animeItem.source}/${animeItem.id}`}>
          <div className="aspect-[3/4] relative">
            {animeItem.image ? (
              <img
                ref={imageRef}
                src={animeItem.image}
                alt={animeItem.title}
                className="w-full h-full object-cover transform-gpu"
                loading="lazy"
                style={{ 
                  transform: 'scale(1)',
                  transformOrigin: 'center center'
                }}
              />
            ) : (
              <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                <span className="text-gray-400 text-sm">No Image</span>
              </div>
            )}
            
            <div 
              ref={overlayRef}
              className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0"
              style={{ opacity: 0 }}
            />
            
            {animeItem.score && (
              <div 
                ref={badgeRef}
                className="absolute top-3 left-3 transform-gpu"
                style={{ 
                  transform: 'scale(1) rotateZ(0deg)',
                  transformOrigin: 'center center'
                }}
              >
                <Badge 
                  variant="warning" 
                  size="sm" 
                  icon="⭐"
                  className="shadow-lg backdrop-blur-sm font-bold"
                >
                  {animeItem.score.toFixed(1)}
                </Badge>
              </div>
            )}
            
            {isAuthenticated && animeItem.userScore && (
              <div 
                className="absolute top-3 right-3 transform-gpu"
                style={{ 
                  transform: 'scale(1) rotateZ(0deg)',
                  transformOrigin: 'center center'
                }}
              >
                <Badge 
                  variant="success" 
                  size="sm" 
                  icon="💯"
                  className="shadow-lg backdrop-blur-sm font-bold"
                >
                  {animeItem.userScore}
                </Badge>
              </div>
            )}
            
            <div 
              ref={titleRef}
              className="absolute bottom-0 left-0 right-0 p-4 text-white opacity-0 transform-gpu"
              style={{ 
                transform: 'translateY(20px)', 
                opacity: 0,
                background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)'
              }}
            >
              <Typography variant="h6" color="inverse" className="mb-2 line-clamp-2 tracking-wide">
                {animeItem.title}
              </Typography>
              <div className="flex items-center gap-3 text-sm opacity-90">
                {animeItem.episodes && (
                  <span className="flex items-center gap-1">
                    📺 {animeItem.episodes} eps
                  </span>
                )}
                {animeItem.year && (
                  <span className="flex items-center gap-1">
                    📅 {animeItem.year}
                  </span>
                )}
              </div>
            </div>
          </div>
        </Link>
      </div>

      {/* HoverCard temporarily commented out for expandable grid implementation */}
      {/* <div className="absolute z-50 top-0 left-full ml-4 w-80 hover-card-container opacity-0 invisible group-hover/card:opacity-100 group-hover/card:visible transition-all duration-200 pointer-events-none group-hover/card:pointer-events-auto">
        <HoverCard anime={animeItem} />
      </div> */}
    </div>
  )
}

export const AnimeCard = memo(AnimeCardComponent, (prevProps, nextProps) => {
  return prevProps.anime.id === nextProps.anime.id &&
         prevProps.anime.userStatus === nextProps.anime.userStatus
})