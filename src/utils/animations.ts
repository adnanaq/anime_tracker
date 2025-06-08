// Simple animation utilities using Web Animations API and CSS transitions
// This avoids complex library import issues while providing smooth animations

export const fadeIn = (element: HTMLElement, duration = 300, delay = 0) => {
  if (!element) return

  element.style.opacity = '0'
  element.style.transform = 'translateY(20px)'
  element.style.transition = `opacity ${duration}ms ease-out ${delay}ms, transform ${duration}ms ease-out ${delay}ms`
  
  setTimeout(() => {
    element.style.opacity = '1'
    element.style.transform = 'translateY(0)'
  }, 50)
}

export const slideInFromLeft = (element: HTMLElement, duration = 400, delay = 0) => {
  if (!element) return

  element.style.opacity = '0'
  element.style.transform = 'translateX(-50px)'
  element.style.transition = `opacity ${duration}ms ease-out ${delay}ms, transform ${duration}ms ease-out ${delay}ms`
  
  setTimeout(() => {
    element.style.opacity = '1'
    element.style.transform = 'translateX(0)'
  }, 50)
}

export const scaleIn = (element: HTMLElement, duration = 500, delay = 0) => {
  if (!element) return

  element.style.opacity = '0'
  element.style.transform = 'scale(0.8)'
  element.style.transition = `opacity ${duration}ms ease-out ${delay}ms, transform ${duration}ms cubic-bezier(0.34, 1.56, 0.64, 1) ${delay}ms`
  
  setTimeout(() => {
    element.style.opacity = '1'
    element.style.transform = 'scale(1)'
  }, 50)
}

export const hoverScale = (element: HTMLElement, scale = 1.05) => {
  if (!element) return

  element.style.transition = 'transform 300ms ease-out, box-shadow 300ms ease-out'
  element.style.transform = `scale(${scale}) translateY(-8px)`
  element.style.boxShadow = '0 20px 40px rgba(0,0,0,0.2)'
}

export const resetHover = (element: HTMLElement) => {
  if (!element) return

  element.style.transform = 'scale(1) translateY(0)'
  element.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)'
}

export const staggerChildren = (container: HTMLElement, duration = 400, staggerDelay = 100) => {
  if (!container) return

  Array.from(container.children).forEach((child, index) => {
    const element = child as HTMLElement
    element.style.opacity = '0'
    element.style.transform = 'translateY(30px)'
    element.style.transition = `opacity ${duration}ms ease-out, transform ${duration}ms ease-out`
    
    setTimeout(() => {
      element.style.opacity = '1'
      element.style.transform = 'translateY(0)'
    }, index * staggerDelay + 50)
  })
}

export const bounceIn = (element: HTMLElement, duration = 600, delay = 0) => {
  if (!element) return

  element.style.opacity = '0'
  element.style.transform = 'scale(0)'
  element.style.transition = `opacity ${duration}ms ease-out ${delay}ms, transform ${duration}ms cubic-bezier(0.68, -0.55, 0.265, 1.55) ${delay}ms`
  
  setTimeout(() => {
    element.style.opacity = '1'
    element.style.transform = 'scale(1)'
  }, 50)
}

export const slideInFromTop = (element: HTMLElement, duration = 600, delay = 0) => {
  if (!element) return

  element.style.opacity = '0'
  element.style.transform = 'translateY(-30px)'
  element.style.transition = `opacity ${duration}ms ease-out ${delay}ms, transform ${duration}ms ease-out ${delay}ms`
  
  setTimeout(() => {
    element.style.opacity = '1'
    element.style.transform = 'translateY(0)'
  }, 50)
}