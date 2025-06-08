import { useEffect, useRef } from 'react'
import { animate } from 'animejs'
import { useAnimeStore } from '../../store/animeStore'
import { AnimeCard } from '../AnimeCard/AnimeCard'
import { SourceToggle } from '../SourceToggle'
import { SearchBar } from '../SearchBar'
import { AuthButton } from '../AuthButton'

export const Dashboard = () => {
  const headerRef = useRef<HTMLElement>(null)
  const mainRef = useRef<HTMLElement>(null)
  const titleRef = useRef<HTMLHeadingElement>(null)
  
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
    // Initial page load animations
    if (headerRef.current) {
      animate(headerRef.current, {
        translateY: [-50, 0],
        opacity: [0, 1],
        duration: 800,
        easing: 'easeOutQuart',
        delay: 200
      })
    }

    if (titleRef.current) {
      animate(titleRef.current, {
        scale: [0.8, 1],
        opacity: [0, 1],
        duration: 1000,
        easing: 'easeOutElastic(1, .8)',
        delay: 400
      })
    }

    if (mainRef.current) {
      animate(mainRef.current, {
        translateY: [30, 0],
        opacity: [0, 1],
        duration: 1000,
        easing: 'easeOutQuart',
        delay: 600
      })
    }
  }, [])

  const LoadingGrid = () => (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
      {Array.from({ length: 10 }).map((_, i) => (
        <div key={i} className="animate-pulse">
          <div className="bg-gray-300 aspect-[3/4] rounded-lg"></div>
        </div>
      ))}
    </div>
  )

  const AnimeSection = ({
    title,
    anime,
    isLoading,
  }: {
    title: string
    anime: any[]
    isLoading: boolean
  }) => (
    <section className="mb-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">{title}</h2>
      {isLoading ? (
        <LoadingGrid />
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {anime.map((item) => (
            <AnimeCard key={`${item.source}-${item.id}`} anime={item} />
          ))}
        </div>
      )}
    </section>
  )

  return (
    <div className="min-h-screen bg-gray-50/80 backdrop-blur-sm">
      {/* Header */}
      <header 
        ref={headerRef} 
        className="bg-white/90 backdrop-blur-md shadow-sm border-b opacity-0"
        style={{ transform: 'translateY(-50px)' }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <h1 
              ref={titleRef}
              className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent opacity-0"
              style={{ transform: 'scale(0.8)' }}
            >
              AnimeTrackr
            </h1>
            <div className="flex items-center space-x-4">
              <SearchBar />
              <SourceToggle />
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