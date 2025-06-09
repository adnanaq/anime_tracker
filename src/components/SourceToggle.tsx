import { useAnimeStore } from '../store/animeStore'

export const SourceToggle = () => {
  const { currentSource, setSource } = useAnimeStore()

  const handleToggle = () => {
    setSource(currentSource === 'mal' ? 'anilist' : 'mal')
  }

  return (
    <div className="flex items-center space-x-3">
      <span className={`text-sm font-medium transition-colors ${
        currentSource === 'mal' ? 'text-blue-600' : 'text-gray-400'
      }`}>
        MAL
      </span>
      
      <button
        onClick={handleToggle}
        className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 hover:bg-gray-300"
        role="switch"
        aria-checked={currentSource === 'anilist'}
        aria-label="Toggle between MyAnimeList and AniList"
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-lg transition-transform ${
            currentSource === 'anilist' ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
        <span
          className={`absolute inset-0 flex items-center justify-center text-xs font-bold transition-opacity ${
            currentSource === 'mal' 
              ? 'opacity-100 text-blue-600' 
              : 'opacity-0'
          }`}
          style={{ left: currentSource === 'mal' ? '2px' : '-20px' }}
        >
        </span>
        <span
          className={`absolute inset-0 flex items-center justify-center text-xs font-bold transition-opacity ${
            currentSource === 'anilist' 
              ? 'opacity-100 text-purple-600' 
              : 'opacity-0'
          }`}
          style={{ right: currentSource === 'anilist' ? '2px' : '-20px' }}
        >
        </span>
      </button>
      
      <span className={`text-sm font-medium transition-colors ${
        currentSource === 'anilist' ? 'text-purple-600' : 'text-gray-400'
      }`}>
        AniList
      </span>
    </div>
  )
}