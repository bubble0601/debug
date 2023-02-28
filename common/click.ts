import { useRef } from 'react'

type LongPressOpitons = {
  threshold?: number
  interval?: number
}
export const useLongPress = (
  onShortPress: () => void,
  onLongPress: () => void,
  { threshold = 300, interval }: LongPressOpitons
) => {
  const pressing = useRef(false)
  const longPress = useRef(false)
  const longPressTimeout = useRef<number | NodeJS.Timeout>()
  const longPressIntervalTimeout = useRef<number | NodeJS.Timeout>()

  const handlePointerDown = () => {
    pressing.current = true
    longPressTimeout.current = setTimeout(() => {
      if (!pressing.current) return
      onLongPress()
      longPress.current = true

      if (!interval) return

      longPressIntervalTimeout.current = setInterval(() => {
        if (!pressing.current) return
        onLongPress()
      }, interval)
    }, threshold)
  }
  const handlePointerUp = () => {
    pressing.current = false
    if (!longPress.current) {
      onShortPress()
    }
    longPress.current = false
    clearTimeout(longPressTimeout.current)
    longPressTimeout.current = undefined
    clearInterval(longPressIntervalTimeout.current)
    longPressIntervalTimeout.current = undefined
  }

  return {
    handlePointerDown,
    handlePointerUp,
  }
}
