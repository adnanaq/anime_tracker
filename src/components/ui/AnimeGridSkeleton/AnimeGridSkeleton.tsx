import React from 'react'
import { Skeleton } from '../Skeleton'
import { cn } from '../../../utils/cn'

export interface AnimeGridSkeletonProps {
  count?: number
  className?: string
  cardClassName?: string
  showDetails?: boolean
}

export const AnimeGridSkeleton = React.forwardRef<HTMLDivElement, AnimeGridSkeletonProps>(
  ({ 
    count = 10, 
    className,
    cardClassName,
    showDetails = false,
    ...props 
  }, ref) => {
    return (
      <div 
        className={cn(
          'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6',
          className
        )}
        ref={ref}
        {...props}
      >
        {Array.from({ length: count }).map((_, index) => (
          <div 
            key={index}
            className={cn('space-y-3', cardClassName)}
          >
            {/* Main card skeleton */}
            <Skeleton 
              variant="card" 
              delay={index * 150}
              className="w-full"
            />
            
            {/* Card details */}
            {showDetails && (
              <div className="space-y-2 px-1">
                {/* Title */}
                <Skeleton 
                  variant="text" 
                  height="1rem"
                  delay={index * 150 + 100}
                />
                
                {/* Subtitle */}
                <Skeleton 
                  variant="text" 
                  height="0.75rem"
                  width="60%"
                  delay={index * 150 + 200}
                />
                
                {/* Metadata */}
                <div className="flex gap-2">
                  <Skeleton 
                    variant="text" 
                    height="0.75rem"
                    width="30%"
                    delay={index * 150 + 300}
                  />
                  <Skeleton 
                    variant="text" 
                    height="0.75rem"
                    width="25%"
                    delay={index * 150 + 350}
                  />
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    )
  }
)

AnimeGridSkeleton.displayName = 'AnimeGridSkeleton'