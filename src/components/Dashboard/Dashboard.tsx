import { useEffect, useRef } from 'react'
import { animate, createScope, stagger, onScroll } from 'animejs'
import { useAnimeStore } from '../../store/animeStore'
import { AnimeCard } from '../AnimeCard/AnimeCard'
import { SourceToggle } from '../SourceToggle'
import { ThemeToggle } from '../ThemeToggle'
import { SearchBar } from '../SearchBar'
import { AuthButton } from '../AuthButton'

export const Dashboard = () => {
  const headerRef = useRef<HTMLElement>(null)
  const mainRef = useRef<HTMLElement>(null)
  const titleRef = useRef<HTMLHeadingElement>(null)
  const scope = useRef<any>(null)
  
  const {
    currentSource,
    trendingAnime,
    popularAnime,
    topRatedAnime,
    currentSeasonAnime,
    searchResults,
    currentlyWatching,
    loading,
    fetchTrendingAnime,
    fetchPopularAnime,
    fetchTopRatedAnime,
    fetchCurrentSeasonAnime,
    fetchUserScores,
    fetchCurrentlyWatching,
  } = useAnimeStore()

  useEffect(() => {
    // Fetch initial data when component mounts or source changes
    const fetchData = async () => {
      // First fetch the anime lists
      await Promise.all([
        fetchTrendingAnime(),
        fetchPopularAnime(),
        fetchTopRatedAnime(),
        fetchCurrentSeasonAnime()
      ])
      
      // Then fetch user-specific data after anime lists are loaded
      fetchUserScores()
      fetchCurrentlyWatching()
    }
    
    fetchData()
  }, [currentSource, fetchTrendingAnime, fetchPopularAnime, fetchTopRatedAnime, fetchCurrentSeasonAnime, fetchUserScores, fetchCurrentlyWatching])

  useEffect(() => {
    if (!headerRef.current || !mainRef.current || !titleRef.current) return

    // Create main dashboard scope
    scope.current = createScope({ root: document.body }).add(() => {
      // Cinematic header entrance
      animate(headerRef.current!, {
        translateY: [-80, 0],
        opacity: [0, 1],
        scale: [0.95, 1],
        backdropFilter: ['blur(0px)', 'blur(20px)'],
        duration: 1200,
        ease: 'outElastic(1, 0.8)',
        delay: 100
      })

      // Title with glitch effect
      animate(titleRef.current!, {
        scale: [0.7, 1.05, 1],
        opacity: [0, 1],
        textShadow: [
          '0 0 0px rgba(99, 102, 241, 0)',
          '0 0 20px rgba(99, 102, 241, 0.5)',
          '0 0 0px rgba(99, 102, 241, 0)'
        ],
        duration: 1500,
        ease: 'outElastic(1, 0.6)',
        delay: 300
      })

      // Main content with depth
      animate(mainRef.current!, {
        translateY: [50, 0],
        opacity: [0, 1],
        scale: [0.98, 1],
        rotateX: [5, 0],
        duration: 1200,
        ease: 'outQuart',
        delay: 500
      })

      // Floating background elements
      const bgElements = document.querySelectorAll('.floating-bg')
      if (bgElements.length > 0) {
        animate(Array.from(bgElements), {
          translateY: [100, 0],
          opacity: [0, 0.1],
          scale: stagger([0.5, 1.2]),
          rotate: stagger([-10, 10]),
          delay: stagger(200),
          duration: 2000,
          ease: 'outQuart'
        })
      }
    })

    return () => {
      if (scope.current) {
        scope.current.revert()
      }
    }
  }, [])

  const LoadingGrid = () => {
    const loadingRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
      if (!loadingRef.current) return

      const cards = Array.from(loadingRef.current.children)
      
      // Organic breathing animation
      animate(cards, {
        scale: [1, 1.02, 1],
        opacity: [0.3, 0.7, 0.3],
        background: [
          'linear-gradient(45deg, #e5e7eb, #f3f4f6)',
          'linear-gradient(45deg, #f3f4f6, #e5e7eb)',
          'linear-gradient(45deg, #e5e7eb, #f3f4f6)'
        ],
        delay: stagger(150),
        duration: 2000,
        loop: true,
        ease: 'inOutSine'
      })
    }, [])

    return (
      <div ref={loadingRef} className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {Array.from({ length: 10 }).map((_, i) => (
          <div 
            key={i} 
            className="bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 aspect-[3/4] rounded-xl shadow-lg"
            style={{ opacity: 0.3 }}
          >
            <div className="p-4 h-full flex flex-col justify-between">
              <div className="space-y-2">
                <div className="h-3 bg-white/30 rounded-full"></div>
                <div className="h-2 bg-white/20 rounded-full w-3/4"></div>
              </div>
              <div className="space-y-1">
                <div className="h-2 bg-white/20 rounded-full w-1/2"></div>
                <div className="h-2 bg-white/20 rounded-full w-1/3"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  const AnimeSection = ({
    title,
    anime,
    isLoading,
  }: {
    title: string
    anime: any[]
    isLoading: boolean
  }) => {
    const sectionRef = useRef<HTMLElement>(null)
    const gridRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
      if (!sectionRef.current || isLoading || anime.length === 0) return

      // Create scroll-triggered section animation
      const sectionScope = createScope({ root: sectionRef.current }).add(() => {
        // Title animation with typewriter effect
        const titleElement = sectionRef.current?.querySelector('h2')
        if (titleElement) {
          animate(titleElement, {
            opacity: [0, 1],
            translateY: [30, 0],
            scale: [0.9, 1],
            duration: 800,
            ease: 'outElastic(1, 0.8)',
            autoplay: onScroll({
              onEnter: () => console.log(`${title} section entered`)
            })
          })
        }

        // Grid stagger animation with wave effect
        if (gridRef.current) {
          const cards = gridRef.current.children
          animate(Array.from(cards), {
            opacity: [0, 1],
            translateY: [60, 0],
            scale: [0.8, 1],
            rotateX: [20, 0],
            delay: stagger(120, { from: 'center', grid: [5, 2] }),
            duration: 1000,
            ease: 'outElastic(1, 0.6)',
            autoplay: onScroll({
              onEnter: () => console.log(`${title} cards animated`)
            })
          })
        }
      })

      return () => sectionScope.revert()
    }, [title, anime.length, isLoading])

    return (
      <section ref={sectionRef} className="mb-12">
        <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-200 mb-6 transition-theme tracking-tight">
          {title}
        </h2>
        {isLoading ? (
          <LoadingGrid />
        ) : (
          <div 
            ref={gridRef}
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6"
          >
            {anime.map((item) => (
              <AnimeCard key={`${item.source}-${item.id}`} anime={item} />
            ))}
          </div>
        )}
      </section>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50/80 dark:bg-gray-900/80 backdrop-blur-sm transition-theme">
      {/* Header */}
      <header 
        ref={headerRef} 
        className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-md shadow-sm border-b border-gray-200 dark:border-gray-700 opacity-0 transition-theme"
        style={{ transform: 'translateY(-50px)' }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <h1 
              ref={titleRef}
              className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent opacity-0 transition-theme"
              style={{ transform: 'scale(0.8)' }}
            >
              AnimeTrackr
            </h1>
            <div className="flex items-center space-x-4">
              <SearchBar />
              <SourceToggle />
              <ThemeToggle />
              <AuthButton source={currentSource} />
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main 
        ref={mainRef}
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 opacity-0"
        style={{ transform: 'translateY(30px)' }}
      >
        {/* Search Results */}
        {searchResults.length > 0 && (
          <AnimeSection
            title="Search Results"
            anime={searchResults}
            isLoading={loading.search}
          />
        )}

        {/* Content sections - only show if no search results */}
        {searchResults.length === 0 && (
          <>
            {/* Currently Watching section - only show when authenticated and has watching anime */}
            {currentlyWatching.length > 0 && (
              <AnimeSection
                title="Currently Watching"
                anime={currentlyWatching}
                isLoading={loading.currentlyWatching}
              />
            )}

            <AnimeSection
              title="Trending Now"
              anime={trendingAnime}
              isLoading={loading.trending}
            />

            <AnimeSection
              title="Most Popular"
              anime={popularAnime}
              isLoading={loading.popular}
            />

            <AnimeSection
              title="Top Rated"
              anime={topRatedAnime}
              isLoading={loading.topRated}
            />

            <AnimeSection
              title="Current Season"
              anime={currentSeasonAnime}
              isLoading={loading.currentSeason}
            />
          </>
        )}

        {/* Empty state */}
        {!loading.trending &&
          !loading.popular &&
          !loading.topRated &&
          !loading.currentSeason &&
          trendingAnime.length === 0 &&
          popularAnime.length === 0 &&
          topRatedAnime.length === 0 &&
          currentSeasonAnime.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-400 text-lg">
                No anime data available. Please try switching sources or check your connection.
              </div>
            </div>
          )}
      </main>
    </div>
  )
}