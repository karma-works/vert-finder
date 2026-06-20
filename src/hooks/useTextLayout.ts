import { useEffect, useRef } from 'react'
import { layout, prepare } from '@chenglou/pretext'

export function useTextLayout<T extends HTMLElement>() {
  const ref = useRef<T>(null)
  useEffect(() => {
    const element = ref.current
    if (!element) return
    let prepared: ReturnType<typeof prepare> | null = null
    const relayout = () => {
      if (!prepared || !element.clientWidth) return
      const lineHeight = Number.parseFloat(getComputedStyle(element).lineHeight)
      const result = layout(prepared, element.clientWidth, lineHeight)
      element.style.minHeight = `${result.height}px`
    }
    const setup = () => {
      prepared = prepare(element.textContent ?? '', getComputedStyle(element).font)
      relayout()
    }
    document.fonts.ready.then(setup)
    const observer = new ResizeObserver(relayout)
    observer.observe(element)
    return () => observer.disconnect()
  }, [])
  return ref
}
