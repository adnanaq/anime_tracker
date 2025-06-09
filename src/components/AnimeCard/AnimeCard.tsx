import { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { animate, createScope, stagger, createSpring } from 'animejs'
import { AnimeBase } from '../../types/anime'
import { HoverCard } from '../HoverCard/HoverCard'
import { getAuthService } from '../../services/auth'

interface AnimeCardProps {
  anime: AnimeBase
}

export const AnimeCard = ({ anime: animeItem }: AnimeCardProps) => {
  const cardRef = useRef<HTMLDivElement>(null)
  const imageRef = useRef<HTMLImageElement>(null)
  const overlayRef = useRef<HTMLDivElement>(null)
  const badgeRef = useRef<HTMLDivElement>(null)
  const titleRef = useRef<HTMLDivElement>(null)
  const scope = useRef<any>(null)
  const hoverTimeoutRef = useRef<number | null>(null)
  
  // Check if user is authenticated for this anime's source
  const authServiceInstance = getAuthService(animeItem.source)
  const isAuthenticated = authServiceInstance?.isAuthenticated() ?? false

  const handleMouseEnter = () => {
    // Clear any existing timeout
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current)
    }

    // Only trigger hover animation after a delay (user actually wants to hover)
    hoverTimeoutRef.current = window.setTimeout(() => {
      scope.current?.methods.hoverIn()
    }, 200) // 200ms delay before triggering animations
  }

  const handleMouseLeave = () => {
    // Clear pending hover animation
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current)
      hoverTimeoutRef.current = null
    }

    // Always trigger hover out immediately (no delay for leaving)
    scope.current?.methods.hoverOut()
  }

  useEffect(() => {
    if (!cardRef.current) return

    // Create scoped animations for this card
    scope.current = createScope({ root: cardRef.current }).add(self => {
      // Initial entrance animation with organic feel
      animate(cardRef.current!, {
        opacity: [0, 1],
        translateY: [60, 0],
        scale: [0.85, 1],
        rotateX: [15, 0],
        duration: 1200,
        delay: Math.random() * 300,
        ease: 'outElastic(1, 0.6)'
      })

      // Hover in animation with morphing effects
      self.add('hoverIn', () => {
        // Card morphing with depth
        animate(cardRef.current!, {
          scale: 1.08,
          translateY: -12,
          rotateX: 3,
          rotateY: 2,
          boxShadow: [
            '0 4px 6px rgba(0,0,0,0.1)', 
            '0 25px 50px rgba(0,0,0,0.25), 0 0 20px rgba(99, 102, 241, 0.1)'
          ],
          duration: 500,
          ease: 'outElastic(1, 0.8)'
        })

        // Image zoom with slight rotation
        if (imageRef.current) {
          animate(imageRef.current, {
            scale: 1.15,
            rotate: 1,
            filter: ['brightness(1)', 'brightness(1.1)'],
            duration: 800,
            ease: 'outQuart'
          })
        }

        // Staggered badge animations
        const badges = [badgeRef.current].filter(Boolean)
        if (badges.length > 0) {
          animate(badges, {
            scale: [1, 1.2, 1.1],
            rotate: stagger([5, -5]),
            duration: 600,
            delay: stagger(100),
            ease: 'outElastic(1, 0.8)'
          })
        }

        // Overlay with gradient animation
        if (overlayRef.current) {
          animate(overlayRef.current, {
            opacity: [0, 1],
            background: [
              'linear-gradient(to top, rgba(0,0,0,0.6), transparent)',
              'linear-gradient(to top, rgba(99, 102, 241, 0.8), rgba(99, 102, 241, 0.2))'
            ],
            duration: 400,
            ease: 'outQuart'
          })
        }

        // Title reveal with spring physics
        if (titleRef.current) {
          animate(titleRef.current, {
            translateY: [30, 0],
            opacity: [0, 1],
            scale: [0.9, 1],
            duration: 600,
            delay: 150,
            ease: createSpring({ stiffness: 200, damping: 20 })
          })
        }

      })

      // Hover out with smooth return
      self.add('hoverOut', () => {
        // Reset card with gentle bounce
        animate(cardRef.current!, {
          scale: 1,
          translateY: 0,
          rotateX: 0,
          rotateY: 0,
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
          duration: 400,
          ease: 'outQuart'
        })

        // Reset image
        if (imageRef.current) {
          animate(imageRef.current, {
            scale: 1,
            rotate: 0,
            filter: 'brightness(1)',
            duration: 500,
            ease: 'outQuart'
          })
        }

        // Reset badges
        const badges = [badgeRef.current].filter(Boolean)
        if (badges.length > 0) {
          animate(badges, {
            scale: 1,
            rotate: 0,
            duration: 300,
            ease: 'outQuart'
          })
        }

        // Fade overlay
        if (overlayRef.current) {
          animate(overlayRef.current, {
            opacity: 0,
            duration: 250,
            ease: 'outQuart'
          })
        }

        // Hide title
        if (titleRef.current) {
          animate(titleRef.current, {
            translateY: 20,
            opacity: 0,
            scale: 0.95,
            duration: 250,
            ease: 'outQuart'
          })
        }

      })
    })

    // Cleanup
    return () => {
      if (scope.current) {
        scope.current.revert()
      }
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current)
      }
    }
  }, [])

  return (
    <div className="relative anime-card-container group/card hover:z-[1000]">
      <div
        ref={cardRef}
        className="relative bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden cursor-pointer opacity-0"
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
                className="absolute top-3 left-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-3 py-1.5 rounded-lg text-sm font-bold shadow-lg backdrop-blur-sm transform-gpu"
                style={{ 
                  transform: 'scale(1) rotateZ(0deg)',
                  transformOrigin: 'center center'
                }}
              >
                ⭐ {animeItem.score.toFixed(1)}
              </div>
            )}
            
            {/* User Score badge - top right (only show when authenticated) */}
            {isAuthenticated && animeItem.userScore && (
              <div 
                className="absolute top-3 right-3 bg-gradient-to-r from-green-500 to-green-600 text-white px-3 py-1.5 rounded-lg text-sm font-bold shadow-lg backdrop-blur-sm transform-gpu"
                style={{ 
                  transform: 'scale(1) rotateZ(0deg)',
                  transformOrigin: 'center center'
                }}
              >
                💯 {animeItem.userScore}
              </div>
            )}
            
            {/* Quick info overlay */}
            <div 
              ref={titleRef}
              className="absolute bottom-0 left-0 right-0 p-4 text-white opacity-0 transform-gpu"
              style={{ 
                transform: 'translateY(20px)', 
                opacity: 0,
                background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)'
              }}
            >
              <h3 className="font-bold text-base mb-2 line-clamp-2 tracking-wide">{animeItem.title}</h3>
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

      {/* Hover Card */}
      <div className="absolute z-50 top-0 left-full ml-4 w-80 hover-card-container opacity-0 invisible group-hover/card:opacity-100 group-hover/card:visible transition-all duration-200 pointer-events-none group-hover/card:pointer-events-auto">
        <HoverCard anime={animeItem} />
      </div>
    </div>
  )
}