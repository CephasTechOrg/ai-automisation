'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function FormLinkRedirect() {
  const router = useRouter()
  useEffect(() => { router.replace('/dashboard/form') }, [router])
  return null
}
