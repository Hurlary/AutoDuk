import { useEffect, useRef, type ReactNode } from 'react'
import { cn } from '@/lib/utils'

/**
 * Scroll-triggered reveal: elements start at 25% opacity + 1rem lift and
 * settle into place with a long, soft ease when they enter the viewport.
 * Media variant additionally scales 1.05 → 1.0.
 */
export function Reveal({ children, className, media = false, delay = 0 }: {
  children: ReactNode
  className?: string
  media?: boolean
  delay?: number
}) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            el.classList.add('visible')
            io.unobserve(el)
          }
        })
      },
      { rootMargin: '0px 0px -100px 0px', threshold: 0.08 },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      className={cn(media ? 'reveal-media' : 'reveal', className)}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
    >
      {children}
    </div>
  )
}
