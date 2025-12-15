'use client'

import { useSignIn, useUser, useSession } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { redirect } from 'next/navigation'

import PasswordLogin from '@/components/auth/PasswordLogin'
import OTPLogin from '@/components/auth/OTPLogin'
import LoginMethodToggle from '@/components/auth/LoginMethodToggle'
import ErrorMessage from '@/components/auth/ErrorMessage'

export default function Page() {
  if (process.env.NEXT_PUBLIC_DISABLE_AUTH === 'true') {
    redirect('/')
  }
  const { isLoaded: isUserLoaded, isSignedIn, user } = useUser()
  const { isLoaded: isSignInLoaded, signIn } = useSignIn()
  const { isLoaded: isSessionLoaded } = useSession()
  const router = useRouter()

  const [phoneNumber, setPhoneNumber] = useState('')
  const [password, setPassword] = useState('')
  const [otpCode, setOtpCode] = useState('')
  const [loginMethod, setLoginMethod] = useState<'password' | 'otp'>('otp')
  const [pendingVerification, setPendingVerification] = useState(false)
  const [resendTimer, setResendTimer] = useState(0)
  const [isSending, setIsSending] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  const otpInputRef = useRef<HTMLInputElement>(null)

  // Check existing session
  useEffect(() => {
    if (!isUserLoaded || !isSessionLoaded) return
    setIsLoading(false)
    if (isSignedIn && user) {
      const role = user?.publicMetadata?.role
      if (role) {
        router.replace(`/${role}`)
      } else {
        setError('User role not found.')
      }
    }
  }, [isUserLoaded, isSessionLoaded, isSignedIn, user, router])

  // Focus OTP input
  useEffect(() => {
    if (pendingVerification && otpInputRef.current) otpInputRef.current.focus()
  }, [pendingVerification])

  // OTP resend timer
  useEffect(() => {
    let timer: NodeJS.Timeout
    if (resendTimer > 0) {
      timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000)
    }
    return () => clearTimeout(timer)
  }, [resendTimer])

  // Remember Me local storage
  useEffect(() => {
    const savedPhone = localStorage.getItem('rememberedPhone')
    if (savedPhone) setPhoneNumber(savedPhone)
  }, [])

  useEffect(() => {
    if (rememberMe) {
      localStorage.setItem('rememberedPhone', phoneNumber)
    } else {
      localStorage.removeItem('rememberedPhone')
    }
  }, [phoneNumber, rememberMe])

  const handleSendOTP = async () => {
    setError('')
    if (!isSignInLoaded || !signIn) {
      setError('Sign-in service not available.')
      return
    }

    try {
      setIsSending(true)
      const result = await signIn.create({
        identifier: `+91${phoneNumber}`,
        strategy: 'phone_code',
      })

      if (result.status === 'needs_first_factor') {
        setPendingVerification(true)
        setResendTimer(30)
      } else {
        throw new Error('Unexpected response: OTP generation failed.')
      }
    } catch (err: any) {
      console.error(err)
      setError(err?.message || 'Failed to send OTP.')
    } finally {
      setIsSending(false)
    }
  }

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!isSignInLoaded || !signIn) {
      setError('Sign-in service is not available.')
      return
    }

    try {
      if (loginMethod === 'password') {
        const result = await signIn.create({
          identifier: `+91${phoneNumber}`,
          password,
        })
        if (result.status === 'complete') window.location.reload()
        else setError('Authentication failed. Check your credentials.')
      } else {
        if (!pendingVerification) {
          setError('Please request an OTP first.')
          return
        }
        if (otpCode.trim().length !== 6) {
          setError('OTP must be 6 digits.')
          return
        }
        const result = await signIn.attemptFirstFactor({
          strategy: 'phone_code',
          code: otpCode,
        })
        if (result.status === 'complete') window.location.reload()
        else setError('OTP verification failed.')
      }
    } catch (err: any) {
      console.error(err)
      setError(err?.message || 'Sign-in failed.')
    }
  }

  if (isLoading || !isUserLoaded || !isSessionLoaded) {
    return (
      <div className="flex flex-col items-center justify-center h-screen space-y-4 animate-fadeIn bg-gray-50 dark:bg-gray-900">
        <div className="w-12 h-12 border-4 border-gray-300 dark:border-gray-600 rounded-full border-t-LamaYellow animate-spin"></div>
        <div className="text-lg font-semibold text-gray-700 dark:text-gray-300">Checking session...</div>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center w-full min-h-screen bg-gradient-to-br from-LamaPurple to-LamaYellow dark:from-gray-800 dark:to-gray-900 px-4 py-10 sm:py-16">
      <form className="flex flex-col gap-6 w-full max-w-md p-10 bg-white dark:bg-gray-800 rounded-3xl shadow-2xl" onSubmit={handleSignIn}>
        <header className="text-center mb-6">
          <img src="/logo.png" alt="Kotak Salesian School Logo" className="w-24 h-24 mx-auto mb-4" />
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Kotak Salesian School</h1>
        </header>

        <ErrorMessage message={error} />

        <LoginMethodToggle
          loginMethod={loginMethod}
          setLoginMethod={setLoginMethod}
          setPendingVerification={setPendingVerification}
          setError={setError}
        />

        {loginMethod === 'password' ? (
          <PasswordLogin
            phoneNumber={phoneNumber}
            password={password}
            setPhoneNumber={setPhoneNumber}
            setPassword={setPassword}
            rememberMe={rememberMe}
            setRememberMe={setRememberMe}
          />
        ) : (
          <OTPLogin
            phoneNumber={phoneNumber}
            otpCode={otpCode}
            setPhoneNumber={setPhoneNumber}
            setOtpCode={setOtpCode}
            pendingVerification={pendingVerification}
            otpInputRef={otpInputRef}
            isSending={isSending}
            resendTimer={resendTimer}
            handleSendOTP={handleSendOTP}
          />
        )}

        <button
          type="submit"
          disabled={isSending || (loginMethod === 'otp' && !pendingVerification && resendTimer > 0)}
          className="w-full px-4 py-3 text-base font-semibold text-white dark:text-black bg-zinc-700 dark:bg-zinc-600 rounded-xl hover:bg-LamaPurple dark:hover:bg-LamaPurple transition-all duration-200 disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          {loginMethod === 'password'
            ? 'Sign In'
            : pendingVerification
              ? 'Verify OTP'
              : resendTimer > 0
                ? `Resend OTP in ${resendTimer}s`
                : 'Send OTP'}
        </button>
      </form>
    </div>
  )
}
