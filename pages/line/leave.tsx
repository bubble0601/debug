import { useEffect } from 'react'

let initialized = false

const Page = () => {
  useEffect(() => {
    if (initialized) {
      return
    }
    alert('init')
    window.addEventListener('beforeunload', (e) => {
      e.preventDefault()
      e.returnValue = ''
      fetch('https://debug.bubble0601.workers.dev', {
        method: 'POST',
        body: 'beforeunload',
      })
      alert('beforeunload')
    })
    window.addEventListener('unload', () => {
      fetch('https://debug.bubble0601.workers.dev', {
        method: 'POST',
        body: 'unload',
      })
      alert('unload')
    })
    document.addEventListener('visibilitychange', () => {
      fetch('https://debug.bubble0601.workers.dev', {
        method: 'POST',
        body: document.visibilityState,
      })
    })
    window.addEventListener('pagehide', () => {
      fetch('https://debug.bubble0601.workers.dev', {
        method: 'POST',
        body: 'pagehide',
      })
      alert('pagehide')
    })
    initialized = true
    // navigator.sendBeacon('https://debug.bubble0601.workers.dev', 'end')
  }, [])

  return (
    <div>
      <h1>Line leave</h1>
    </div>
  )
}

export default Page
