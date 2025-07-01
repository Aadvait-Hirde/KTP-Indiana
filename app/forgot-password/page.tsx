"use client"

import { useState, useEffect } from 'react'
import { useAuth, useSignIn } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { useTheme } from 'next-themes'
import Image from 'next/image'
import Link from 'next/link'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { ThemeToggle } from '@/components/theme-toggle'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [code, setCode] = useState('')
  const [successfulCreation, setSuccessfulCreation] = useState(false)
  const [secondFactor, setSecondFactor] = useState(false)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [mounted, setMounted] = useState(false)

  const router = useRouter()
  const { isSignedIn } = useAuth()
  const { isLoaded, signIn, setActive } = useSignIn()
  const { theme } = useTheme()

  useEffect(() => {
    setMounted(true)
    if (isSignedIn) {
      router.push('/')
    }
  }, [isSignedIn, router])

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background dark:bg-zinc-900">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 animate-spin mx-auto border-2 border-zinc-300 border-t-zinc-900 dark:border-zinc-600 dark:border-t-zinc-100 rounded-full" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  // Send the password reset code to the user's email
  async function create(e: React.FormEvent) {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      await signIn?.create({
        strategy: 'reset_password_email_code',
        identifier: email,
      })
      setSuccessfulCreation(true)
    } catch (err) {
      const error = err as { errors?: { longMessage: string }[] }
      setError(error.errors?.[0]?.longMessage || 'An error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  // Reset the user's password
  async function reset(e: React.FormEvent) {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const result = await signIn?.attemptFirstFactor({
        strategy: 'reset_password_email_code',
        code,
        password,
      })

      if (result?.status === 'needs_second_factor') {
        setSecondFactor(true)
      } else if (result?.status === 'complete') {
        await setActive?.({ session: result.createdSessionId })
        router.push('/member-portal')
      }
    } catch (err) {
      const error = err as { errors?: { longMessage: string }[] }
      setError(error.errors?.[0]?.longMessage || 'An error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex transition-all duration-300 ease-in-out">
      {/* Left side - Background image with text overlay */}
      <div className="hidden lg:flex lg:w-1/2 relative">
        <Image
          src="/auth-bg.jpg"
          alt="KTP Background"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
        
        {/* Back to website link */}
        <div className="absolute top-8 left-8">
          <Link href="/" className="text-white/80 hover:text-white text-sm flex items-center space-x-2">
            <span>← Back to website</span>
          </Link>
        </div>
        
        {/* Text overlay - moved right and up */}
        <div className="absolute bottom-16 left-16 text-white">
          <h1 className="text-7xl font-bold tracking-tighter font-inter mb-4 leading-tight">
            Welcome<br />
            to the KTP<br />
            Member Portal
          </h1>
          <p className="text-lg text-white/80 tracking-normal">
            Your one stop for everything KTP
          </p>
        </div>
      </div>

      {/* Right side - Reset password form */}
      <div className="flex-1 flex flex-col bg-background dark:bg-zinc-900 p-8">
        {/* Theme toggle and Logo at top */}
        <div className="flex justify-between items-center pt-2 pb-4">
          <div className="w-9"></div>
          <Image
            src={mounted && theme === 'dark' ? "/ktp-logos/KTP Logo Dark Plain No BG.png" : "/ktp-logos/KTP Logo Plain Text.png"}
            alt="KTP Logo"
            width={80}
            height={40}
            className="mx-auto transition-opacity duration-200"
          />
          <ThemeToggle />
        </div>
        
        <div className="flex-1 flex items-center justify-center">
          <div className="w-full max-w-md space-y-8 animate-in fade-in duration-300">



          {/* Header text */}
          <div className="text-center space-y-3">
            <h2 className="text-4xl font-bold tracking-tight text-foreground">
              {!successfulCreation ? 'Reset Password' : 'Enter New Password'}
            </h2>
            <p className="text-muted-foreground text-lg">
              {!successfulCreation 
                ? 'Enter your email address and we\'ll send you a reset code'
                : 'Enter the code sent to your email and your new password'
              }
            </p>
          </div>

          {/* Error message */}
          {error && (
            <div className="p-3 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-md">
              {error}
            </div>
          )}

          {/* Form */}
          <Card className="dark:bg-zinc-800 dark:border-zinc-700">
            <CardContent className="pt-6">
              <form onSubmit={!successfulCreation ? create : reset} className="space-y-4">
                {!successfulCreation ? (
                  <>
                    <div className="space-y-2">
                      <label htmlFor="email" className="text-sm font-medium text-left block text-foreground">
                        Email
                      </label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                        required
                        className="rounded-md dark:bg-zinc-700 dark:border-zinc-600 dark:text-white"
                      />
                    </div>

                    <Button
                      type="submit"
                      className="w-full bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-600 dark:hover:bg-zinc-700 text-white"
                      disabled={isLoading}
                    >
                      {isLoading ? 'Sending...' : 'Send Reset Code'}
                    </Button>
                  </>
                ) : (
                  <>
                    <div className="space-y-2">
                      <label htmlFor="code" className="text-sm font-medium text-left block text-foreground">
                        Reset Code
                      </label>
                      <Input
                        id="code"
                        type="text"
                        placeholder="Enter the code from your email"
                        value={code}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCode(e.target.value)}
                        required
                        className="rounded-md dark:bg-zinc-700 dark:border-zinc-600 dark:text-white"
                      />
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="password" className="text-sm font-medium text-left block text-foreground">
                        New Password
                      </label>
                      <Input
                        id="password"
                        type="password"
                        placeholder="Enter your new password"
                        value={password}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                        required
                        className="rounded-md dark:bg-zinc-700 dark:border-zinc-600 dark:text-white"
                      />
                    </div>

                    {secondFactor && (
                      <div className="p-3 text-sm text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-md">
                        Two-factor authentication is required. Please complete the 2FA process.
                      </div>
                    )}

                    <Button
                      type="submit"
                      className="w-full bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-600 dark:hover:bg-zinc-700 text-white"
                      disabled={isLoading}
                    >
                      {isLoading ? 'Resetting...' : 'Reset Password'}
                    </Button>
                  </>
                )}
              </form>
            </CardContent>
          </Card>

          {/* Sign up and sign in links */}
          <div className="text-center space-y-2">
            <p className="text-muted-foreground tracking-tight">
              Don&apos;t have an account?{' '}
              <Link href="/sign-up" className="text-zinc-900 dark:text-zinc-200 font-medium hover:underline">
                Sign up
              </Link>
            </p>
            <p className="text-muted-foreground tracking-tight">
              <Link href="/sign-in" className="text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 hover:underline">
                Sign in
              </Link>
            </p>
          </div>
          </div>
        </div>
      </div>
    </div>
  )
} 