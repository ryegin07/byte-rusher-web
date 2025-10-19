"use client"

import { Complaints } from "@/components/complaints"
import { Navbar } from "@/components/navbar"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { apiFetch } from "@/lib/api"

export default function StaffComplaintsPage() {
    const router = useRouter();
    useEffect(() => {
      let cancelled = false;
      (async () => {
        try {
          const me = await apiFetch('/auth/me');
          if (cancelled) return;
          if (!me?.authenticated) { router.replace('/'); return; }
          const t = String(me.user?.type || 'staff').toLowerCase();
          if (t !== 'staff') { router.replace('/resident/dashboard'); return; }
        } catch { router.replace('/'); }
      })();
      return () => { cancelled = true as any; };
    }, []);
  const user = {
    name: "Juan Dela Cruz",
    email: "juan.delacruz@manggahan.gov.ph",
    avatar: "/placeholder.svg?height=40&width=40",
    type: "staff" as const,
    position: "Barangay Secretary",
    hall: "Napico Hall",
    employeeId: "EMP-2024-001",
  }

  const handleNavigation = (page: string) => {
    // Handle navigation if needed
    console.log("Navigate to:", page)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-yellow-50 to-white">
      <Navbar user={user} />
      <div className="pt-20">
        <Complaints user={user} onNavigate={handleNavigation} />
      </div>
    </div>
  )
}
