import { useTheme } from '../context/ThemeContext'

export const ThemeToggle = () => {
  const { isDark, toggleTheme } = useTheme()

  const handleToggle = () => {
    toggleTheme()
  }

  return (
    <button
      onClick={handleToggle}
      className="relative w-12 h-6 bg-gray-300 dark:bg-gray-600 rounded-full p-1 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-yellow-400 dark:focus:ring-offset-gray-900 overflow-hidden hover:scale-105 active:scale-95"
      aria-label="Toggle theme"
    >
      {/* Track background */}
      <div className="absolute inset-1 bg-gradient-to-r from-blue-400 to-yellow-400 dark:from-purple-600 dark:to-blue-600 rounded-full opacity-20 transition-all duration-300" />
      
      {/* Moving circle */}
      <div
        className={`relative w-4 h-4 rounded-full shadow-lg flex items-center justify-center transition-all duration-300 hover:shadow-xl transform ${
          isDark ? 'translate-x-5 bg-gray-700' : 'translate-x-0 bg-yellow-400'
        }`}
        style={{ 
          boxShadow: isDark 
            ? '0 2px 8px rgba(31, 41, 55, 0.5), inset 0 1px 2px rgba(255, 255, 255, 0.2)' 
            : '0 2px 8px rgba(251, 191, 36, 0.5), inset 0 1px 2px rgba(255, 255, 255, 0.8)'
        }}
      >
        {/* Light mode icon (sun) */}
        <div
          className={`absolute inset-0 flex items-center justify-center transition-all duration-300 ${
            isDark ? 'opacity-0 scale-50 rotate-180' : 'opacity-100 scale-100 rotate-0'
          }`}
        >
          <div className="w-2 h-2 bg-orange-500 rounded-full relative">
            {/* Sun rays */}
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="absolute w-0.5 h-1 bg-orange-500 rounded-full"
                style={{
                  transform: `rotate(${i * 45}deg) translateY(-6px)`,
                  transformOrigin: 'center 6px'
                }}
              />
            ))}
          </div>
        </div>

        {/* Dark mode icon (moon) */}
        <div
          className={`absolute inset-0 flex items-center justify-center transition-all duration-300 ${
            isDark ? 'opacity-100 scale-100 rotate-0' : 'opacity-0 scale-50 -rotate-180'
          }`}
        >
          <div className="w-3 h-3 bg-gray-200 rounded-full relative overflow-hidden">
            <div className="absolute top-0.5 left-0.5 w-2 h-2 bg-gray-700 rounded-full transform -translate-x-0.5 -translate-y-0.5" />
          </div>
        </div>
      </div>
    </button>
  )
}