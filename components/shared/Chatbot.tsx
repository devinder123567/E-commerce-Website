'use client'

import { useState, useRef, useEffect } from 'react'
import { MessageSquare, X, Send, Bot, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface Message {
  id: string
  text: string
  sender: 'bot' | 'user'
  time: string
}

export function Chatbot() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      text: 'Hello! I am EliteBot, your shopping assistant. How can I help you today?',
      sender: 'bot',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ])
  const [inputValue, setInputValue] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const quickReplies = [
    { label: 'Track Order', query: 'How do I track my order?' },
    { label: 'Refund Policy', query: 'What is your refund policy?' },
    { label: 'Promo Code', query: 'Are there any discount codes?' },
    { label: 'Marketplace Seller', query: 'How do I list products as a seller?' }
  ]

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages])

  const addMessage = (text: string, sender: 'bot' | 'user') => {
    const newMsg: Message = {
      id: Math.random().toString(),
      text,
      sender,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
    setMessages(prev => [...prev, newMsg])
  }

  const getBotResponse = (userQuery: string): string => {
    const q = userQuery.toLowerCase()
    if (q.includes('track') || q.includes('order')) {
      return 'You can view the progress of your shipments in your Account -> Order History tab. We update tracking milestones dynamically!'
    }
    if (q.includes('refund') || q.includes('return')) {
      return 'We offer a 30-day return window on all clothing and electronics. You can click the "Return & Refund" request button next to any delivered order in your history.'
    }
    if (q.includes('promo') || q.includes('discount') || q.includes('coupon') || q.includes('code')) {
      return 'Yes! You can use code SUMMERDROP20 during checkout to get 20% off all orders over $50.'
    }
    if (q.includes('seller') || q.includes('marketplace') || q.includes('dashboard') || q.includes('list')) {
      return 'To list your own products, simply navigate to My Account and click "Switch to Seller Mode". This opens the Seller Portal dashboard where you can list products, inspect inventory, and view mock sales curves.'
    }
    return `Thank you for asking! I've noted down your question: "${userQuery}". Our team has been notified. How else can I assist you?`
  }

  const handleSend = (textToSend: string) => {
    if (!textToSend.trim()) return
    addMessage(textToSend, 'user')
    setInputValue('')
    
    // Simulate thinking delay
    setTimeout(() => {
      const reply = getBotResponse(textToSend)
      addMessage(reply, 'bot')
    }, 800)
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {/* Expanded Chat Dialog */}
      {isOpen && (
        <Card className="w-80 sm:w-96 h-[450px] mb-4 border border-muted/80 bg-background/95 backdrop-blur-xl rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-slide-up">
          {/* Header */}
          <CardHeader className="h-14 border-b border-muted/50 flex flex-row items-center justify-between px-4 py-0 bg-primary text-primary-foreground flex-shrink-0">
            <div className="flex items-center gap-2">
              <Bot size={20} className="text-primary-foreground animate-bounce" />
              <div>
                <h4 className="font-extrabold text-xs uppercase tracking-wider">EliteBot Support</h4>
                <p className="text-[9px] opacity-80 font-bold">Online AI Assistant</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(false)}
              className="text-primary-foreground hover:bg-white/10 rounded-full h-8 w-8"
            >
              <X size={16} />
            </Button>
          </CardHeader>

          {/* Messages Container */}
          <CardContent className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0 scrollbar-none bg-muted/5">
            {messages.map((msg) => {
              const isBot = msg.sender === 'bot'
              return (
                <div
                  key={msg.id}
                  className={cn(
                    "flex gap-2.5 max-w-[85%]",
                    isBot ? "self-start text-left" : "self-end flex-row-reverse text-right ml-auto"
                  )}
                >
                  <div
                    className={cn(
                      "w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-[10px]",
                      isBot ? "bg-primary/10 text-primary border border-primary/20" : "bg-muted text-muted-foreground border border-muted"
                    )}
                  >
                    {isBot ? <Bot size={12} /> : <User size={12} />}
                  </div>
                  <div className="space-y-0.5">
                    <div
                      className={cn(
                        "p-3 rounded-2xl text-xs leading-relaxed shadow-sm",
                        isBot
                          ? "bg-background border border-muted/50 text-foreground rounded-tl-none"
                          : "bg-primary text-primary-foreground rounded-tr-none font-medium"
                      )}
                    >
                      {msg.text}
                    </div>
                    <span className="text-[8px] text-muted-foreground/60 block px-1 font-semibold">{msg.time}</span>
                  </div>
                </div>
              )
            })}
            <div ref={messagesEndRef} />
          </CardContent>

          {/* Quick Replies Panel */}
          <div className="px-4 py-2 border-t border-muted/30 bg-muted/10 flex flex-wrap gap-1.5 flex-shrink-0">
            {quickReplies.map((qr, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(qr.query)}
                className="text-[9px] font-bold uppercase tracking-wider px-2.5 py-1 bg-background border border-muted hover:border-primary hover:text-primary rounded-full transition-colors focus:outline-none"
              >
                {qr.label}
              </button>
            ))}
          </div>

          {/* Footer Input */}
          <CardFooter className="p-3 border-t border-muted/50 bg-background flex-shrink-0 gap-2">
            <Input
              type="text"
              placeholder="Ask anything..."
              value={inputValue}
              onChange={e => setInputValue(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSend(inputValue)}
              className="rounded-full text-xs h-9 border-muted"
            />
            <Button
              onClick={() => handleSend(inputValue)}
              size="icon"
              className="rounded-full w-9 h-9 flex-shrink-0"
              title="Send Message"
            >
              <Send size={14} />
            </Button>
          </CardFooter>
        </Card>
      )}

      {/* Floating Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-14 h-14 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-2xl hover:scale-108 transition-all hover:shadow-primary/30 focus:outline-none",
          isOpen && "bg-rose-500 hover:shadow-rose-500/30"
        )}
        title="Open Support Chatbot"
      >
        {isOpen ? <X size={24} /> : <MessageSquare size={24} />}
      </button>
    </div>
  )
}
