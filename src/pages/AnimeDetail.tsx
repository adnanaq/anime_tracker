import { useEffect, useState, useRef } from 'react'
import { useParams, Link } from 'react-router-dom'
import { animate, stagger } from 'animejs'
import { AnimeBase } from '../types/anime'
import { animeService } from '../services/animeService'
import { LoadingSpinner } from '../components/LoadingSpinner'

export const AnimeDetail = () => {
  const { source, id } = useParams<{ source: string; id: string }>()
  const [animeData, setAnimeData] = useState<AnimeBase | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const headerRef = useRef<HTMLElement>(null)
  const imageRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const titleRef = useRef<HTMLHeadingElement>(null)
  const genresRef = useRef<HTMLDivElement>(null)
  const synopsisRef = useRef<HTMLDivElement>(null)
  const buttonsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const fetchAnime = async () => {
      if (!source || !id) {
        return
      }

      try {
        setLoading(true)
        setError(null)
        
        // Set the service source to match the requested anime
        animeService.setSource(source as 'mal' | 'anilist')
        
        const animeData = await animeService.getAnimeDetails(parseInt(id))
        setAnimeData(animeData)
        
        // Trigger animations when data loads
        setTimeout(() => {
          animatePageElements()
        }, 100)
      } catch (err) {
        const errorMessage = `Failed to load anime details: ${err instanceof Error ? err.message : 'Unknown error'}`
        setError(errorMessage)
        console.error('Error fetching anime details:', {
          source,
          id,
          error: err,
          errorMessage: err instanceof Error ? err.message : err
        })
      } finally {
        setLoading(false)
      }
    }

    fetchAnime()
  }, [source, id])

  const animatePageElements = () => {
    // Header animation
    if (headerRef.current) {
      animate(headerRef.current, {
        translateY: [-30, 0],
        opacity: [0, 1],
        duration: 600,
        easing: 'easeOutQuart'
      })
    }

    // Image animation with 3D effect
    if (imageRef.current) {
      animate(imageRef.current, {
        scale: [0.8, 1],
        rotateY: [-10, 0],
        opacity: [0, 1],
        duration: 800,
        easing: 'easeOutBack',
        delay: 200
      })
    }

    // Title animation
    if (titleRef.current) {
      animate(titleRef.current, {
        translateX: [-50, 0],
        opacity: [0, 1],
        duration: 600,
        easing: 'easeOutQuart',
        delay: 400
      })
    }

    // Content stagger animation
    if (contentRef.current?.children) {
      animate(Array.from(contentRef.current.children), {
        translateY: [30, 0],
        opacity: [0, 1],
        duration: 500,
        easing: 'easeOutQuart',
        delay: stagger(100, { start: 600 })
      })
    }

    // Genres animation
    if (genresRef.current?.children) {
      animate(Array.from(genresRef.current.children), {
        scale: [0, 1],
        opacity: [0, 1],
        duration: 400,
        easing: 'easeOutBack',
        delay: stagger(50, { start: 800 })
      })
    }

    // Synopsis animation
    if (synopsisRef.current) {
      animate(synopsisRef.current, {
        translateY: [20, 0],
        opacity: [0, 1],
        duration: 600,
        easing: 'easeOutQuart',
        delay: 1000
      })
    }

    // Buttons animation
    if (buttonsRef.current?.children) {
      animate(Array.from(buttonsRef.current.children), {
        scale: [0.8, 1],
        translateY: [20, 0],
        opacity: [0, 1],
        duration: 500,
        easing: 'easeOutElastic(1, .8)',
        delay: stagger(100, { start: 1200 })
      })
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50/80 backdrop-blur-sm flex items-center justify-center">
        <LoadingSpinner size="lg" message="Loading anime details..." />
      </div>
    )
  }

  if (error || !animeData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Error Loading Anime</h2>
          <p className="text-gray-600 mb-4">{error || 'Anime not found'}</p>
          <Link
            to="/"
            className="inline-flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            ← Back to Dashboard
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50/80 backdrop-blur-sm">
      {/* Header */}
      <header 
        ref={headerRef}
        className="bg-white/90 backdrop-blur-md shadow-sm border-b opacity-0"
        style={{ transform: 'translateY(-30px)' }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link
              to="/"
              className="flex items-center text-blue-600 hover:text-blue-700 transition-colors"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Dashboard
            </Link>
            <span className="text-sm text-gray-500 uppercase font-medium">{animeData.source}</span>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white/90 backdrop-blur-md rounded-lg shadow-lg overflow-hidden">
          <div className="md:flex">
            {/* Image */}
            <div className="md:flex-shrink-0">
              <div 
                ref={imageRef}
                className="h-96 w-full md:w-72 opacity-0"
                style={{ transform: 'scale(0.8) rotateY(-10deg)' }}
              >
                {animeData.coverImage || animeData.image ? (
                  <img
                    src={animeData.coverImage || animeData.image}
                    alt={animeData.title}
                    className="w-full h-full object-cover rounded-lg"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-200 flex items-center justify-center rounded-lg">
                    <span className="text-gray-400">No Image Available</span>
                  </div>
                )}
              </div>
            </div>

            {/* Content */}
            <div className="p-8 flex-1">
              <div className="mb-6">
                <h1 
                  ref={titleRef}
                  className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2 opacity-0"
                  style={{ transform: 'translateX(-50px)' }}
                >
                  {animeData.title}
                </h1>
                
                {/* Stats */}
                <div 
                  ref={contentRef}
                  className="flex flex-wrap gap-4 text-sm text-gray-600 mb-4"
                >
                  {animeData.score && (
                    <div className="flex items-center">
                      <span className="font-medium mr-1">Score:</span>
                      <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded font-semibold">
                        {animeData.score.toFixed(1)}
                      </span>
                    </div>
                  )}
                  
                  {animeData.episodes && (
                    <div className="flex items-center">
                      <span className="font-medium mr-1">Episodes:</span>
                      <span>{animeData.episodes}</span>
                    </div>
                  )}
                  
                  {animeData.status && (
                    <div className="flex items-center">
                      <span className="font-medium mr-1">Status:</span>
                      <span className="capitalize">{animeData.status.toLowerCase()}</span>
                    </div>
                  )}
                  
                  {animeData.year && (
                    <div className="flex items-center">
                      <span className="font-medium mr-1">Year:</span>
                      <span>{animeData.year}</span>
                    </div>
                  )}
                  
                  {animeData.format && (
                    <div className="flex items-center">
                      <span className="font-medium mr-1">Format:</span>
                      <span className="capitalize">{animeData.format.toLowerCase()}</span>
                    </div>
                  )}
                </div>

                {/* Genres */}
                {animeData.genres && animeData.genres.length > 0 && (
                  <div className="mb-4">
                    <h3 className="font-medium text-gray-900 mb-2">Genres</h3>
                    <div ref={genresRef} className="flex flex-wrap gap-2">
                      {animeData.genres.map((genre, index) => (
                        <span
                          key={index}
                          className="bg-gradient-to-r from-blue-100 to-purple-100 text-blue-800 text-sm px-3 py-1 rounded-full opacity-0"
                          style={{ transform: 'scale(0)' }}
                        >
                          {genre}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Synopsis */}
                {animeData.synopsis && (
                  <div 
                    ref={synopsisRef}
                    className="opacity-0"
                    style={{ transform: 'translateY(20px)' }}
                  >
                    <h3 className="font-medium text-gray-900 mb-2">Synopsis</h3>
                    <p className="text-gray-700 leading-relaxed">{animeData.synopsis}</p>
                  </div>
                )}
              </div>

              {/* Action buttons */}
              <div ref={buttonsRef} className="flex space-x-4">
                <button 
                  className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-2 rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl opacity-0"
                  style={{ transform: 'scale(0.8) translateY(20px)' }}
                >
                  Add to Watchlist
                </button>
                <button 
                  className="bg-gradient-to-r from-gray-200 to-gray-300 text-gray-800 px-6 py-2 rounded-lg hover:from-gray-300 hover:to-gray-400 transition-all duration-300 shadow-lg hover:shadow-xl opacity-0"
                  style={{ transform: 'scale(0.8) translateY(20px)' }}
                >
                  Mark as Watched
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Related anime section placeholder */}
        <div className="mt-8 bg-white/90 backdrop-blur-md rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">Related Anime</h2>
          <div className="text-gray-500 text-center py-8">
            Related anime feature coming soon...
          </div>
        </div>
      </main>
    </div>
  )
}