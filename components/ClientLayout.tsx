'use client'

import { useEffect, useState, useRef } from 'react'
import { usePathname } from 'next/navigation'

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [displayChildren, setDisplayChildren] = useState(children)
  const [transitionDirection, setTransitionDirection] = useState<'left' | 'right'>('right')
  const [isTransitioning, setIsTransitioning] = useState(false)
  const prevPathnameRef = useRef<string>('')

  useEffect(() => {
    // Initialize on mount
    if (!prevPathnameRef.current) {
      prevPathnameRef.current = pathname
      setDisplayChildren(children)
      return
    }

    const prevPathname = prevPathnameRef.current
    
    // Only animate transitions between login and register pages
    if ((prevPathname === '/login' && pathname === '/register') || 
        (prevPathname === '/register' && pathname === '/login')) {
      
      // Determine direction: login -> register = right, register -> login = left
      if (prevPathname === '/login' && pathname === '/register') {
        setTransitionDirection('right')
      } else {
        setTransitionDirection('left')
      }

      setIsTransitioning(true)
      
      // Start exit animation, then update content
      const transitionTimer = setTimeout(() => {
        setDisplayChildren(children)
        // After content updates, start enter animation
        setTimeout(() => {
          setIsTransitioning(false)
        }, 50)
      }, 300) // Half of animation duration

      prevPathnameRef.current = pathname
      return () => clearTimeout(transitionTimer)
    } else {
      // For other pages, just update without animation
      setDisplayChildren(children)
      setIsTransitioning(false)
      prevPathnameRef.current = pathname
    }
  }, [pathname, children])

  // Check if current page should have transition
  const shouldAnimate = pathname === '/login' || pathname === '/register'

  return (
    <div className={shouldAnimate ? 'page-transition-wrapper' : ''}>
      <div 
        className={
          shouldAnimate 
            ? `page-transition-container ${
                isTransitioning 
                  ? (transitionDirection === 'right' ? 'slide-out-left' : 'slide-out-right')
                  : (transitionDirection === 'right' ? 'slide-in-right' : 'slide-in-left')
              }`
            : ''
        }
      >
        {displayChildren}
      </div>
    </div>
  )
}

