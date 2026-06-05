'use client'

import { Suspense, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

function Spinner() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="spinner" style={{ width: 32, height: 32 }} />
    </div>
  )
}

function CallbackHandler() {
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const supabase = createClient()
    const code = searchParams.get('code')
    const type = searchParams.get('type')
    const next = type === 'invite' ? '/auth/set-password' : '/'

    async function handle() {
      // ── PKCE code flow (invite links sent by invite_user_by_email or sign_in_with_otp) ──
      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code)
        if (error) {
          console.error('[callback] exchangeCodeForSession:', error.message)
          router.replace('/login?error=invalid_code')
          return
        }
        router.replace(next)
        return
      }

      // ── Implicit / fragment flow (reset_password_for_email, older invite links) ──
      // Fragments are never sent to the server, so we read them here in the browser.
      const hash = typeof window !== 'undefined' ? window.location.hash.slice(1) : ''
      const params = new URLSearchParams(hash)
      const accessToken = params.get('access_token')
      const refreshToken = params.get('refresh_token')

      if (accessToken && refreshToken) {
        const { error } = await supabase.auth.setSession({ access_token: accessToken, refresh_token: refreshToken })
        if (error) {
          console.error('[callback] setSession:', error.message)
          router.replace('/login?error=invalid_session')
          return
        }
        router.replace(next)
        return
      }

      // ── Nothing usable in URL — send to login ──
      router.replace('/login?error=missing_code')
    }

    handle()
  }, [router, searchParams])

  return <Spinner />
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={<Spinner />}>
      <CallbackHandler />
    </Suspense>
  )
}
