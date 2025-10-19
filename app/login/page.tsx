"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { apiFetch } from '@/lib/api'

type PortalType = 'resident' | 'staff'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [userType, setUserType] = useState<PortalType>('resident')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true); setError(null)
    try {
      const res = await apiFetch('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password, userType })
      })
      if (res?.ok) {
        const t = String(res.user?.type || userType).toLowerCase() as PortalType
        router.replace(t === 'staff' ? '/staff/dashboard' : '/resident/dashboard')
      } else {
        setError(res?.message || 'Invalid credentials')
      }
    } catch {
      setError('Unable to login')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <form onSubmit={onSubmit} className="w-full max-w-sm space-y-4">
        <h1 className="text-2xl font-bold">Sign in</h1>
        {error && <p className="text-sm text-red-600">{error}</p>}

        <input
          className="w-full border rounded p-2"
          placeholder="Email"
          type="email"
          value={email}
          onChange={e=>setEmail(e.target.value)}
          required
        />

        <input
          className="w-full border rounded p-2"
          placeholder="Password"
          type="password"
          value={password}
          onChange={e=>setPassword(e.target.value)}
          required
        />

        <div className="w-full">
          <label htmlFor="portal" className="block text-sm mb-1">Portal</label>
          <select
            id="portal"
            value={userType}
            onChange={e=>setUserType(e.target.value as PortalType)}
            className="w-full border rounded p-2"
          >
            <option value="resident">Resident</option>
            <option value="staff">Staff</option>
          </select>
        </div>

        <button disabled={loading} className="w-full rounded p-2 border">
          {loading ? 'Signing in...' : 'Sign in'}
        </button>
      </form>
    </div>
  )
}
