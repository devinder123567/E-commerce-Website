'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from '@/lib/hooks/useViteNavigation'
import { Search, Mic } from 'lucide-react'
import { Input } from '../ui/input'
import { cn } from '@/lib/utils'

export function SearchBar() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [query, setQuery] = useState(searchParams.get('q') || '')
  const [isListening, setIsListening] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      router.push(`/products?q=${encodeURIComponent(query.trim())}`)
    }
  }

  const handleVoiceSearch = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SpeechRecognition) {
      // Fallback: Simulate voice listening
      setIsListening(true)
      setTimeout(() => {
        setQuery('titan watch')
        setIsListening(false)
        router.push(`/products?q=${encodeURIComponent('titan watch')}`)
      }, 1800)
      return
    }

    try {
      const recognition = new SpeechRecognition()
      recognition.lang = 'en-US'
      recognition.interimResults = false
      recognition.maxAlternatives = 1

      recognition.onstart = () => {
        setIsListening(true)
      }

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript
        setQuery(transcript)
        setIsListening(false)
        if (transcript.trim()) {
          router.push(`/products?q=${encodeURIComponent(transcript.trim())}`)
        }
      }

      recognition.onerror = () => {
        // Fallback on error
        setTimeout(() => {
          setQuery('titan watch')
          setIsListening(false)
          router.push(`/products?q=${encodeURIComponent('titan watch')}`)
        }, 1200)
      }

      recognition.onend = () => {
        setIsListening(false)
      }

      recognition.start()
    } catch (e) {
      setIsListening(true)
      setTimeout(() => {
        setQuery('titan watch')
        setIsListening(false)
        router.push(`/products?q=${encodeURIComponent('titan watch')}`)
      }, 1500)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="relative w-full max-w-sm">
      <Input
        type="search"
        placeholder="Search products..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="w-full pl-10 pr-10 py-2 bg-muted focus:bg-background border-muted border-2 transition-all duration-200 rounded-full"
      />
      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none">
        <Search size={18} />
      </div>
      
      <button
        type="button"
        onClick={handleVoiceSearch}
        className={cn(
          "absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors focus:outline-none bg-transparent border-none p-0 cursor-pointer",
          isListening && "text-primary animate-pulse"
        )}
        title="Voice Search"
      >
        <Mic size={18} />
      </button>

      {isListening && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center">
          <div className="bg-background border border-muted/80 rounded-3xl p-8 max-w-xs text-center space-y-4 shadow-2xl flex flex-col items-center">
            <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center text-primary relative">
              <div className="absolute inset-0 rounded-full bg-primary/30 animate-ping" />
              <Mic size={28} className="relative z-10" />
            </div>
            <div className="space-y-1">
              <h3 className="font-extrabold text-sm uppercase tracking-wide">Listening...</h3>
              <p className="text-xs text-muted-foreground">Try saying &quot;titan watch&quot; or &quot;apparel&quot;</p>
            </div>
          </div>
        </div>
      )}
    </form>
  )
}
