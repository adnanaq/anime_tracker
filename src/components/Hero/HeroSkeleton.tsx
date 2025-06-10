export const HeroSkeleton = () => {
  return (
    <div className="relative h-96 md:h-[500px] lg:h-[600px] overflow-hidden bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 animate-pulse">
      <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
      
      <div className="relative h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center">
        <div className="max-w-2xl space-y-6">
          <div className="w-24 h-6 bg-white/30 rounded-full"></div>
          
          <div className="space-y-3">
            <div className="h-12 md:h-16 lg:h-20 bg-white/30 rounded-lg w-3/4"></div>
            <div className="h-12 md:h-16 lg:h-20 bg-white/30 rounded-lg w-1/2"></div>
          </div>
          
          <div className="space-y-2">
            <div className="h-4 bg-white/20 rounded w-full"></div>
            <div className="h-4 bg-white/20 rounded w-4/5"></div>
            <div className="h-4 bg-white/20 rounded w-3/5"></div>
          </div>
          
          <div className="flex space-x-4">
            <div className="h-12 w-32 bg-white/30 rounded-lg"></div>
            <div className="h-12 w-36 bg-white/20 rounded-lg"></div>
          </div>
        </div>
      </div>
      
      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-2">
        {Array.from({ length: 5 }).map((_, index) => (
          <div
            key={index}
            className="w-2 h-2 rounded-full bg-white/30"
          />
        ))}
      </div>
    </div>
  )
}