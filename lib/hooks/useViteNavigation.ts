import { useLocation } from 'wouter'
import { useEffect, useState } from 'react'

// Override pushState and replaceState to trigger custom locationchange events.
// This allows search parameter updates on the same path to trigger reactive hook updates.
if (typeof window !== 'undefined') {
  const origPush = window.history.pushState
  window.history.pushState = function (...args) {
    origPush.apply(this, args)
    window.dispatchEvent(new Event('locationchange'))
  }

  const origReplace = window.history.replaceState
  window.history.replaceState = function (...args) {
    origReplace.apply(this, args)
    window.dispatchEvent(new Event('locationchange'))
  }

  window.addEventListener('popstate', () => {
    window.dispatchEvent(new Event('locationchange'))
  })
}

export function useRouter() {
  const [_, setLocation] = useLocation()
  return {
    push(url: string) {
      setLocation(url)
      window.dispatchEvent(new Event('locationchange'))
    },
    replace(url: string) {
      setLocation(url, { replace: true })
      window.dispatchEvent(new Event('locationchange'))
    },
    back() {
      window.history.back()
    },
    forward() {
      window.history.forward()
    },
    refresh() {
      window.location.reload()
    }
  }
}

export function useSearchParams() {
  const [location] = useLocation()
  const [search, setSearch] = useState(() => typeof window !== 'undefined' ? window.location.search : '')

  useEffect(() => {
    const handleOnChange = () => {
      setSearch(window.location.search)
    }
    window.addEventListener('locationchange', handleOnChange)
    handleOnChange()
    return () => window.removeEventListener('locationchange', handleOnChange)
  }, [location])

  return new URLSearchParams(search)
}

export function usePathname() {
  const [location] = useLocation()
  return location
}
