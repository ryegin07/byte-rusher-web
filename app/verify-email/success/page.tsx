"use client"

import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle2 } from "lucide-react"

export default function VerifyEmailSuccessPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-2">
            <CheckCircle2 className="h-12 w-12" />
          </div>
          <CardTitle className="text-2xl">Email Verified</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-center">
          <p>Thank you for verifying your email. Your account is activated; you may log in now.</p>
          <div className="flex gap-3 justify-center">
            <Link href="/"><Button variant="outline">Go to Login</Button></Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
