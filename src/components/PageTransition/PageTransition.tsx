interface PageTransitionProps {
  children: React.ReactNode
  direction?: 'slide' | 'fade' | 'scale' | 'flip'
}

export const PageTransition = ({ 
  children, 
  direction = 'slide'
}: PageTransitionProps) => {
  const animationClasses = {
    slide: 'animate-slide-in',
    fade: 'animate-fade-in',
    scale: 'animate-scale-in',
    flip: 'animate-flip-in'
  }

  return (
    <div className={`page-transition-container ${animationClasses[direction]}`}>
      {children}
    </div>
  )
}

// Route-specific transition wrapper
export const RouteTransition = ({ 
  children, 
  routeName 
}: { 
  children: React.ReactNode
  routeName: string 
}) => {
  // Different animations for different routes
  const transitionMap: Record<string, 'slide' | 'fade' | 'scale' | 'flip'> = {
    dashboard: 'fade',
    animeDetail: 'slide',
    authCallback: 'scale'
  }

  return (
    <PageTransition direction={transitionMap[routeName] || 'slide'}>
      {children}
    </PageTransition>
  )
}