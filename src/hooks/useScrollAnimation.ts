import { useEffect, useRef, useState } from 'react'

interface ScrollAnimationOptions {
  threshold?: number
  rootMargin?: string
  triggerOnce?: boolean
  animation?: 'fadeIn' | 'slideUp' | 'slideLeft' | 'slideRight' | 'scaleIn' | 'flipIn'
}

export const useScrollAnimation = (options: ScrollAnimationOptions = {}) => {
  const {
    threshold = 0.1,
    rootMargin = '0px 0px -100px 0px',
    triggerOnce = true,
    animation = 'fadeIn'
  } = options

  const elementRef = useRef<HTMLElement>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const element = elementRef.current
    if (!element) return

    const animationClasses = {
      fadeIn: 'animate-fade-in',
      slideUp: 'animate-slide-up',
      slideLeft: 'animate-slide-left',
      slideRight: 'animate-slide-right',
      scaleIn: 'animate-scale-in',
      flipIn: 'animate-flip-in'
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !isVisible) {
            setIsVisible(true)
            element.classList.add(animationClasses[animation])

            if (triggerOnce) {
              observer.unobserve(element)
            }
          }
        })
      },
      { threshold, rootMargin }
    )

    observer.observe(element)

    return () => {
      observer.unobserve(element)
    }
  }, [threshold, rootMargin, triggerOnce, animation, isVisible])

  return { elementRef, isVisible }
}

// Simplified hook for multiple elements
export const useStaggeredScrollAnimation = (count: number) => {
  const refs = useRef<(HTMLElement | null)[]>(Array(count).fill(null))
  const [visibleItems, setVisibleItems] = useState<boolean[]>(Array(count).fill(false))

  useEffect(() => {
    const observers = refs.current.map((element, index) => {
      if (!element) return null

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting && !visibleItems[index]) {
              setVisibleItems(prev => {
                const newState = [...prev]
                newState[index] = true
                return newState
              })

              element.classList.add('animate-fade-in-up')
              element.style.animationDelay = `${index * 100}ms`
              observer.unobserve(element)
            }
          })
        },
        { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
      )

      observer.observe(element)
      return observer
    })

    return () => {
      observers.forEach(observer => observer?.disconnect())
    }
  }, [count, visibleItems])

  const setRef = (index: number) => (el: HTMLElement | null) => {
    refs.current[index] = el
  }

  return { setRef, visibleItems }
}