"use client"
import {apiFetch} from '@/lib/api'
import {useRouter} from 'next/navigation'

export default function LogoutButton() {
  const router = useRouter();
  async function doLogout(){
    await apiFetch('/auth/logout', {method: 'POST'})
    router.push('/login')
  }
  return <button onClick={doLogout} className="text-sm underline">Logout</button>
}
