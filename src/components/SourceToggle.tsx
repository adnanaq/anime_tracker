import { useAnimeStore } from '../store/animeStore'
import { AnimeSource } from '../types/anime'

export const SourceToggle = () => {
  const { currentSource, setSource } = useAnimeStore()

  const handleSourceChange = (source: AnimeSource) => {
    setSource(source)
  }

  return (
    <div className="flex items-center space-x-2 bg-gray-100 rounded-lg p-1">
      <button
        onClick={() => handleSourceChange('mal')}
        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
          currentSource === 'mal'
            ? 'bg-blue-500 text-white shadow-sm'
            : 'text-gray-600 hover:text-gray-800'
        }`}
      >
        MyAnimeList
      </button>
      <button
        onClick={() => handleSourceChange('anilist')}
        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
          currentSource === 'anilist'
            ? 'bg-blue-500 text-white shadow-sm'
            : 'text-gray-600 hover:text-gray-800'
        }`}
      >
        AniList
      </button>
    </div>
  )
}