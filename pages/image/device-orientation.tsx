import { useEffect, useState, useSyncExternalStore } from 'react'

const getOrientation = (
  current: OrientationType | undefined,
  beta: number,
  gamma: number
): OrientationType => {
  if (!current) {
    if (beta >= 45) {
      return 'portrait-primary'
    }
    if (beta >= -45 && beta < 45 && gamma >= 0) {
      return 'landscape-secondary'
    }
    if (beta < -45) {
      return 'portrait-secondary'
    }
    return 'landscape-primary'
  }

  if (current === 'portrait-primary') {
    if (beta >= 30) {
      return 'portrait-primary'
    }
    if (beta >= -45 && beta < 30 && gamma >= 0) {
      return 'landscape-secondary'
    }
    if (beta < -45) {
      return 'portrait-secondary'
    }
    return 'landscape-primary'
  }

  if (current === 'landscape-secondary') {
    if (beta >= 60) {
      return 'portrait-primary'
    }
    if (beta >= -60 && beta < 60 && gamma >= -30) {
      return 'landscape-secondary'
    }
    if (beta < -60) {
      return 'portrait-secondary'
    }
    return 'landscape-primary'
  }

  if (current === 'portrait-secondary') {
    if (beta >= 45) {
      return 'portrait-primary'
    }
    if (beta >= -30 && beta < 45 && gamma >= 0) {
      return 'landscape-secondary'
    }
    if (beta < -30) {
      return 'portrait-secondary'
    }
    return 'landscape-primary'
  }

  if (current === 'landscape-primary') {
    if (beta >= 60) {
      return 'portrait-primary'
    }
    if (beta >= -60 && beta < 60 && gamma >= 30) {
      return 'landscape-secondary'
    }
    if (beta < -60) {
      return 'portrait-secondary'
    }
    return 'landscape-primary'
  }

  throw new Error('Unreachable')
}

// デバイスの向きから取得した画面の向き
// 画面の向きをロックしていても向きを取得できるようにdeviceorientationを使用
const useDeviceScreenOrientation = () => {
  const [orientation, setOrientation] = useState<OrientationType>()

  useEffect(() => {
    const onOrientationChange = (e: DeviceOrientationEvent) => {
      if (!e.beta || !e.gamma) return
      const newOrientation = getOrientation(orientation, e.beta, e.gamma)
      if (orientation !== newOrientation) {
        setOrientation(newOrientation)
      }
    }
    window.addEventListener('deviceorientation', onOrientationChange)

    return () =>
      window.removeEventListener('deviceorientation', onOrientationChange)
  }, [orientation])

  return { orientation }
}

const useScreenOrientation = () => {
  const screenOrientation = useSyncExternalStore(
    (callback) => {
      screen.orientation.addEventListener('change', callback)
      return () => screen.orientation.removeEventListener('change', callback)
    },
    () => {
      return screen.orientation.type
    },
    () => undefined
  )

  return {
    screenOrientation,
  }
}

export default () => {
  const { orientation } = useDeviceScreenOrientation()
  const { screenOrientation } = useScreenOrientation()

  return (
    <div>
      <h1>DeviceOrientation</h1>
      <p>orientation: {orientation}</p>
      <p>screenOrientation: {screenOrientation}</p>
    </div>
  )
}
