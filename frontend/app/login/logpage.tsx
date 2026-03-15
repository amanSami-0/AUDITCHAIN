'use client'

import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const formRef = useRef<HTMLFormElement>(null)

  useEffect(() => {
    // Animate elements on mount
    const container = containerRef.current
    if (!container) return

    const elements = container.querySelectorAll('[data-animate]')
    elements.forEach((el, index) => {
      ;(el as HTMLElement).style.opacity = '0'
      ;(el as HTMLElement).style.transform = 'translateY(20px)'
      setTimeout(() => {
        ;(el as HTMLElement).style.transition = 'all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)'
        ;(el as HTMLElement).style.opacity = '1'
        ;(el as HTMLElement).style.transform = 'translateY(0)'
      }, index * 100)
    })
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false)
      console.log('Login attempt:', { email, password })
    }, 1500)
  }

  return (
    <div 
      ref={containerRef}
      className="min-h-screen bg-gradient-to-br from-background via-background to-[#f5ede4] flex items-center justify-center px-4 py-8 relative overflow-hidden"
    >
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#d4a574] opacity-10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#8b6f47] opacity-5 rounded-full blur-3xl" />

      <div className="w-full max-w-md relative z-10">
        {/* Header */}
        <div data-animate className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-6 mx-auto">
            <svg
              className="w-8 h-8 text-primary"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
          </div>
          <h1 className="font-serif text-5xl font-bold text-foreground mb-3 text-balance">
            Welcome Back
          </h1>
          <p className="text-muted-foreground text-base leading-relaxed">
            Sign in to your account to continue your journey
          </p>
        </div>

        {/* Form Card */}
        <form ref={formRef} onSubmit={handleSubmit} data-animate className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="email" className="block text-sm font-semibold text-foreground">
              Email Address
            </label>
            <div className="relative group">
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 bg-card border-2 border-border rounded-xl focus:border-primary transition-all duration-300 placeholder:text-muted-foreground"
              />
              <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary/0 to-primary/0 group-hover:from-primary/5 group-hover:to-primary/0 pointer-events-none transition-all duration-300" />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label htmlFor="password" className="block text-sm font-semibold text-foreground">
                Password
              </label>
              <a href="#" className="text-xs font-medium text-primary hover:text-primary/80 transition-colors">
                Forgot?
              </a>
            </div>
            <div className="relative group">
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 bg-card border-2 border-border rounded-xl focus:border-primary transition-all duration-300 placeholder:text-muted-foreground"
              />
              <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary/0 to-primary/0 group-hover:from-primary/5 group-hover:to-primary/0 pointer-events-none transition-all duration-300" />
            </div>
          </div>

          <div className="flex items-center space-x-2 py-1">
            <input
              type="checkbox"
              id="remember"
              className="w-4 h-4 rounded border-2 border-border bg-card text-primary cursor-pointer accent-primary"
            />
            <label htmlFor="remember" className="text-sm text-muted-foreground cursor-pointer hover:text-foreground transition-colors">
              Remember me
            </label>
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className={`w-full py-3 px-4 rounded-xl font-semibold text-base transition-all duration-300 ${
              isLoading
                ? 'bg-primary/80 cursor-not-allowed'
                : 'bg-primary hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/20'
            }`}
          >
            {isLoading ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                <span>Signing in...</span>
              </div>
            ) : (
              'Sign In'
            )}
          </Button>
        </form>

        {/* Footer */}
        <div data-animate className="mt-8 pt-8 border-t border-border text-center">
          <p className="text-sm text-muted-foreground">
            Don't have an account?{' '}
            <a href="#" className="font-semibold text-primary hover:text-primary/80 transition-colors">
              Create one
            </a>
          </p>
        </div>

        {/* Social Login */}
        <div data-animate className="mt-8 space-y-3">
          <div className="relative flex items-center">
            <div className="flex-1 border-t border-border" />
            <span className="px-3 text-xs font-medium text-muted-foreground">OR CONTINUE WITH</span>
            <div className="flex-1 border-t border-border" />
          </div>

          <div className="grid grid-cols-3 gap-3">
            {['Google', 'GitHub', 'Apple'].map((provider) => (
              <button
                key={provider}
                type="button"
                className="py-2.5 px-3 rounded-lg border-2 border-border bg-card hover:bg-muted hover:border-primary/30 transition-all duration-300 text-xs font-semibold text-foreground"
              >
                {provider === 'Google' && '🔍'}
                {provider === 'GitHub' && '⚡'}
                {provider === 'Apple' && '🍎'}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}