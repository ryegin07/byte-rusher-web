"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { GoogleLoginButton } from "@/components/google-login-button"
import { User, Shield } from 'lucide-react'
import Link from "next/link"
import type { GoogleUser } from "@/lib/google-auth"

interface LoginProps {
  onLogin: (userData: any) => void
}

export function Login({ onLogin }: LoginProps) {
  const [loginType, setLoginType] = useState("resident")
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    staffId: "",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Mock login - in real app, this would call an API
    const userData = {
      name: loginType === "resident" ? "Juan Dela Cruz" : "Maria Santos",
      role: loginType === "resident" ? "Resident" : "Staff",
      email: formData.email || "staff@barangay.gov.ph",
      id: loginType === "resident" ? "RES-001" : formData.staffId || "STF-001",
    }

    onLogin(userData)
  }

  const handleGoogleSuccess = (user: GoogleUser) => {
    // Handle Google login success
    const userData = {
      name: user.name,
      role: "Resident", // Default to resident for Google login
      email: user.email,
      id: `GOOGLE-${user.id}`,
      picture: user.picture,
      isGoogleUser: true
    }

    onLogin(userData)
  }

  const handleGoogleError = (error: string) => {
    console.error("Google login error:", error)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Barangay Portal</h1>
          <p className="text-gray-600 mt-2">Access your barangay services</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Sign In</CardTitle>
            <CardDescription>Choose your account type and enter your credentials</CardDescription>
          </CardHeader>
          <CardContent>
            {/* Google Login */}
            <div className="space-y-4 mb-6">
              <GoogleLoginButton
                onSuccess={handleGoogleSuccess}
                onError={handleGoogleError}
              />
              
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <Separator className="w-full" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-gray-500">Or continue with</span>
                </div>
              </div>
            </div>

            <Tabs value={loginType} onValueChange={setLoginType}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="resident" className="flex items-center space-x-2">
                  <User className="h-4 w-4" />
                  <span>Resident</span>
                </TabsTrigger>
                <TabsTrigger value="staff" className="flex items-center space-x-2">
                  <Shield className="h-4 w-4" />
                  <span>Staff</span>
                </TabsTrigger>
              </TabsList>

              <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                <TabsContent value="resident" className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="your.email@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      required
                    />
                  </div>
                </TabsContent>

                <TabsContent value="staff" className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="staffId">Staff ID</Label>
                    <Input
                      id="staffId"
                      placeholder="Enter your staff ID"
                      value={formData.staffId}
                      onChange={(e) => setFormData({ ...formData, staffId: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="staffPassword">Password</Label>
                    <Input
                      id="staffPassword"
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      required
                    />
                  </div>
                </TabsContent>

                <Button type="submit" className="w-full">
                  Sign In
                </Button>
              </form>
            </Tabs>

            <div className="mt-6 text-center space-y-2">
              <Link href="/forgot-password" className="text-sm text-blue-600 hover:underline block">
                Forgot your password?
              </Link>
              <p className="text-sm text-gray-600">
                Don't have an account?{" "}
                <Link href="/register" className="text-blue-600 hover:underline">
                  Register here
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
