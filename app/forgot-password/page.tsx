"use client"

import {useEffect, useState} from "react"
import {Button} from "@/components/ui/button"
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card"
import {Input} from "@/components/ui/input"
import {Label} from "@/components/ui/label"
import {Alert, AlertDescription} from "@/components/ui/alert"
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs"
import {ArrowLeft, Mail, Shield, CheckCircle, AlertCircle, Eye, EyeOff} from "lucide-react"
import Link from "next/link"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3001"

type Step = "request" | "verify" | "reset" | "success"
type AccountType = "resident" | "staff"

export default function ForgotPasswordPage() {
  const [currentStep, setCurrentStep] = useState<Step>("request")
  const [accountType, setAccountType] = useState<AccountType>("resident")
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [expiresAt, setExpiresAt] = useState<string | null>(null)
  const [secondsLeft, setSecondsLeft] = useState(0)

  const [formData, setFormData] = useState({
    email: "",
    staffId: "",
    verificationCode: "",
    newPassword: "",
    confirmPassword: "",
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  // countdown for verify step
  useEffect(() => {
    if (!expiresAt || currentStep !== "verify") return
    const tick = () => {
      const diff = Math.max(0, Math.floor((Date.parse(expiresAt) - Date.now()) / 1000))
      setSecondsLeft(diff)
    }
    tick()
    const timer = setInterval(tick, 1000)
    return () => clearInterval(timer)
  }, [expiresAt, currentStep])

  const validateEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  const validatePassword = (password: string) =>
    password.length >= 8 && /[A-Z]/.test(password) && /[a-z]/.test(password) && /\d/.test(password)

  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setErrors({})

    const newErrors: Record<string, string> = {}
    if (accountType === "resident") {
      if (!formData.email) newErrors.email = "Email is required"
      else if (!validateEmail(formData.email)) newErrors.email = "Please enter a valid email address"
    } else {
      if (!formData.staffId) newErrors.staffId = "Staff ID is required"
    }
    if (Object.keys(newErrors).length) {
      setErrors(newErrors)
      setIsLoading(false)
      return
    }

    try {
      const res = await fetch(
        API_BASE_URL + (accountType === "staff" ? "/auth/forgot-staff" : "/auth/forgot"),
        {
          method: "POST",
          headers: {"Content-Type": "application/json"},
          body: JSON.stringify(
            accountType === "staff" ? {staffId: formData.staffId} : {email: formData.email},
          ),
        },
      )
      const data = await res.json()
      if (!data.ok) {
        setErrors(
          accountType === "staff"
            ? {staffId: data.message || "Staff not found"}
            : {email: data.message || "Email not found"},
        )
        return
      }
      if (data.expiresAt) setExpiresAt(data.expiresAt)
      setCurrentStep("verify")
    } catch {
      setErrors(accountType === "staff" ? {staffId: "Request failed"} : {email: "Request failed"})
    } finally {
      setIsLoading(false)
    }
  }

  const resendCode = async () => {
    setIsLoading(true)
    try {
      const res = await fetch(
        API_BASE_URL + (accountType === "staff" ? "/auth/resend-code-staff" : "/auth/resend-code"),
        {
          method: "POST",
          headers: {"Content-Type": "application/json"},
          body: JSON.stringify(
            accountType === "staff" ? {staffId: formData.staffId} : {email: formData.email},
          ),
        },
      )
      const data = await res.json()
      if (data.expiresAt) setExpiresAt(data.expiresAt)
    } catch {
      // ignore
    } finally {
      setIsLoading(false)
    }
  }

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setErrors({})

    if (!formData.verificationCode) {
      setErrors({verificationCode: "Verification code is required"})
      setIsLoading(false)
      return
    }
    if (formData.verificationCode.length !== 6) {
      setErrors({verificationCode: "Code must be 6 digits"})
      setIsLoading(false)
      return
    }

    try {
      const res = await fetch(
        API_BASE_URL + (accountType === "staff" ? "/auth/verify-code-staff" : "/auth/verify-code"),
        {
          method: "POST",
          headers: {"Content-Type": "application/json"},
          body: JSON.stringify(
            accountType === "staff"
              ? {staffId: formData.staffId, code: formData.verificationCode}
              : {email: formData.email, code: formData.verificationCode},
          ),
        },
      )
      const data = await res.json()
      if (!data.ok) {
        setErrors({verificationCode: data.message || "Invalid or expired code"})
        return
      }
      setCurrentStep("reset")
    } catch {
      setErrors({verificationCode: "Verification failed"})
    } finally {
      setIsLoading(false)
    }
  }

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setErrors({})

    const errs: Record<string, string> = {}
    if (!formData.newPassword) errs.newPassword = "New password is required"
    if (!formData.confirmPassword) errs.confirmPassword = "Please confirm your password"
    if (formData.newPassword && !validatePassword(formData.newPassword))
      errs.newPassword = "Must be 8+ chars with upper, lower, number"
    if (formData.confirmPassword && formData.newPassword !== formData.confirmPassword)
      errs.confirmPassword = "Passwords do not match"
    if (Object.keys(errs).length) {
      setErrors(errs)
      setIsLoading(false)
      return
    }

    try {
      const res = await fetch(
        API_BASE_URL +
          (accountType === "staff" ? "/auth/reset-password-staff" : "/auth/reset-password"),
        {
          method: "POST",
          headers: {"Content-Type": "application/json"},
          body: JSON.stringify(
            accountType === "staff"
              ? {
                  staffId: formData.staffId,
                  code: formData.verificationCode,
                  password: formData.newPassword,
                }
              : {
                  email: formData.email,
                  code: formData.verificationCode,
                  password: formData.newPassword,
                },
          ),
        },
      )
      const data = await res.json()
      if (!data.ok) {
        setErrors({newPassword: data.message || "Unable to reset password"})
        return
      }
      setCurrentStep("success")
    } catch {
      setErrors({newPassword: "Request failed"})
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Reset Password</h1>
          <p className="text-gray-600 mt-2">Recover access to your barangay account</p>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              {currentStep !== "request" && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    if (currentStep === "verify") setCurrentStep("request")
                    if (currentStep === "reset") setCurrentStep("verify")
                  }}
                  className="p-1"
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              )}
              <div>
                <CardTitle>
                  {currentStep === "request" && "Reset Password"}
                  {currentStep === "verify" && "Verify Your Identity"}
                  {currentStep === "reset" && "Create New Password"}
                  {currentStep === "success" && "Password Reset Complete"}
                </CardTitle>
                <CardDescription>
                  {currentStep === "request" && "Enter your account details to receive a reset code"}
                  {currentStep === "verify" && "Enter the verification code sent to your contact method"}
                  {currentStep === "reset" && "Choose a strong new password for your account"}
                  {currentStep === "success" && "Your password has been successfully updated"}
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent>
            {/* Step 1: Request Reset */}
            {currentStep === "request" && (
              <form onSubmit={handleRequestReset} className="space-y-4">
                <Tabs value={accountType} onValueChange={(v) => setAccountType(v as AccountType)}>
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="resident">Resident</TabsTrigger>
                    <TabsTrigger value="staff">Staff</TabsTrigger>
                  </TabsList>

                  <div className="mt-6">
                    <TabsContent value="resident" className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="email">Email Address</Label>
                        <Input
                          id="email"
                          type="email"
                          required
                          placeholder="your.email@example.com"
                          value={formData.email}
                          onChange={(e) => setFormData({...formData, email: e.target.value})}
                          className={errors.email ? "border-red-500" : ""}
                        />
                        {errors.email && <p className="text-sm text-red-600">{errors.email}</p>}
                      </div>
                    </TabsContent>

                    <TabsContent value="staff" className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="staffId">Staff ID</Label>
                        <Input
                          id="staffId"
                          placeholder="Enter your staff ID"
                          value={formData.staffId}
                          onChange={(e) => setFormData({...formData, staffId: e.target.value})}
                          className={errors.staffId ? "border-red-500" : ""}
                        />
                        {errors.staffId && <p className="text-sm text-red-600">{errors.staffId}</p>}
                      </div>
                    </TabsContent>
                  </div>
                </Tabs>

                <Alert className="border-blue-200 bg-blue-50">
                  <AlertCircle className="h-4 w-4 text-blue-600" />
                  <AlertDescription className="text-blue-800">
                    A verification code will be sent to your registered{" "}
                    {accountType === "resident" ? "email" : "contact method"}.
                  </AlertDescription>
                </Alert>

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Sending..." : "Send Reset Code"}
                </Button>
              </form>
            )}

            {/* Step 2: Verify Code */}
            {currentStep === "verify" && (
              <form onSubmit={handleVerifyCode} className="space-y-4">
                <div className="text-center mb-4">
                  <Mail className="h-12 w-12 text-blue-500 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">
                    We've sent a 6-digit verification code to{" "}
                    <span className="font-medium">
                      {accountType === "resident" ? formData.email : "your registered contact"}
                    </span>
                  </p>
                </div>

                {/* countdown */}
                {secondsLeft > 0 ? (
                  <p className="text-xs text-gray-500 text-center">
                    Time remaining: {String(Math.floor(secondsLeft / 60)).padStart(2, "0")}:
                    {String(secondsLeft % 60).padStart(2, "0")}
                  </p>
                ) : (
                  <p className="text-xs text-red-600 text-center">Code expired. Please resend.</p>
                )}

                <div className="space-y-2">
                  <Label htmlFor="verificationCode">Verification Code</Label>
                  <Input
                    id="verificationCode"
                    placeholder="Enter 6-digit code"
                    inputMode="numeric"
                    pattern="\d*"
                    value={formData.verificationCode}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        verificationCode: e.target.value.replace(/\D/g, "").slice(0, 6),
                      })
                    }
                    className={`text-center text-lg tracking-widest ${
                      errors.verificationCode ? "border-red-500" : ""
                    }`}
                    maxLength={6}
                  />
                  {errors.verificationCode && (
                    <p className="text-sm text-red-600">{errors.verificationCode}</p>
                  )}
                </div>

                <div className="text-center">
                  <Button
                    type="button"
                    variant="link"
                    onClick={resendCode}
                    disabled={isLoading}
                    className="text-sm"
                  >
                    Didn't receive the code? Resend
                  </Button>
                </div>

                <Button type="submit" className="w-full" disabled={isLoading || secondsLeft <= 0}>
                  {isLoading ? "Verifying..." : "Verify Code"}
                </Button>
              </form>
            )}

            {/* Step 3: Reset Password */}
            {currentStep === "reset" && (
              <form onSubmit={handleResetPassword} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="newPassword">New Password</Label>
                  <div className="relative">
                    <Input
                      id="newPassword"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter new password"
                      value={formData.newPassword}
                      onChange={(e) => setFormData({...formData, newPassword: e.target.value})}
                      className={errors.newPassword ? "border-red-500" : ""}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                  {errors.newPassword && (
                    <p className="text-sm text-red-600">{errors.newPassword}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirm new password"
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                      className={errors.confirmPassword ? "border-red-500" : ""}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="text-sm text-red-600">{errors.confirmPassword}</p>
                  )}
                </div>

                <Alert className="border-amber-200 bg-amber-50">
                  <AlertCircle className="h-4 w-4 text-amber-600" />
                  <AlertDescription className="text-amber-800 text-sm">
                    Password must be at least 8 characters with uppercase, lowercase, and number.
                  </AlertDescription>
                </Alert>

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Updating..." : "Update Password"}
                </Button>
              </form>
            )}

            {/* Step 4: Success */}
            {currentStep === "success" && (
              <div className="text-center space-y-4">
                <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Password Reset Successful!</h3>
                  <p className="text-sm text-gray-600 mt-2">
                    Your password has been updated successfully. You can now sign in with your new password.
                  </p>
                </div>

                <Alert className="border-green-200 bg-green-50">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800">
                    For security, you've been logged out of all devices. Please sign in again.
                  </AlertDescription>
                </Alert>

                <Link href="/">
                  <Button className="w-full">Return to Sign In</Button>
                </Link>
              </div>
            )}

            {/* Help Section */}
            {currentStep !== "success" && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="text-center space-y-2">
                  <p className="text-sm text-gray-600">Need help?</p>
                  <div className="space-y-1">
                    <Link href="/contact" className="text-sm text-blue-600 hover:underline block">
                      Contact Barangay Support
                    </Link>
                    <Link href="/" className="text-sm text-blue-600 hover:underline block">
                      Back to Sign In
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
