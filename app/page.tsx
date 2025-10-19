"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Users,
  FileText,
  MessageSquare,
  Bell,
  Shield,
  MapPin,
  Phone,
  Mail,
  Clock,
  TrendingUp,
  Activity,
  Eye,
  EyeOff,
  Sparkles,
  Heart,
  Award,
  Globe,
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { GoogleLoginButton } from "@/components/google-login-button"
import type { GoogleUser } from "@/lib/google-auth"
import { apiFetch } from '@/lib/api'

export default function HomePage() {
  const [sendingQuick, setSendingQuick] = useState(false);
  const [quickDone, setQuickDone] = useState<null | 'ok' | 'err'>(null);
  async function handleQuickContact(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (sendingQuick) return;
    setSendingQuick(true);
    setQuickDone(null);
    try {
      const nameEl = document.getElementById('contact-name') as HTMLInputElement | null;
      const emailEl = document.getElementById('contact-email') as HTMLInputElement | null;
      const msgEl = document.getElementById('contact-message') as HTMLTextAreaElement | null;
      const name = nameEl?.value?.trim() || '';
      const email = emailEl?.value?.trim() || '';
      const message = msgEl?.value?.trim() || '';
      if (!name || !email || !message) {
        throw new Error('Please fill out your name, email, and message.');
      }
      await apiFetch('/support/email', {
        method: 'POST',
        body: JSON.stringify({ name, email, message }),
      });
      setQuickDone('ok');
      // clear fields
      if (nameEl) nameEl.value = '';
      if (emailEl) emailEl.value = '';
      if (msgEl) msgEl.value = '';
    } catch (err) {
      console.error(err);
      setQuickDone('err');
    } finally {
      setSendingQuick(false);
    }
  }

  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
    userType: "resident",
  })
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [stats, setStats] = useState({ residents: 0, documents: 0, resolved: 0, staff: 0 })
  // Load home stats from API
  useEffect(() => {
    (async () => {
      try {
        const s = await apiFetch('/stats/dashboard');
        if (s && s.ok) setStats({ residents: s.residents, documents: s.documents, resolved: s.resolved, staff: s.staff });
      } catch { /* ignore */ }
    })();
  }, []);


  const handleLogin = async (e: React.FormEvent) => {
  e.preventDefault();
  setError("");
  setIsLoading(true);
  try {
    if (!loginData.email || !loginData.password) {
      setError("Please enter both email and password");
      setIsLoading(false);
      return;
    }
    const data = await apiFetch('/auth/login', {
      method: 'POST',
      headers: {'Content-Type':'application/json'},
      credentials: 'include',
      body: JSON.stringify({ email: loginData.email, password: loginData.password, userType: loginData.userType })
    });
    if (!data?.ok) { setError(data?.message || 'Invalid account'); setIsLoading(false); return; }
    window.location.href = (loginData.userType === 'staff') ? '/staff/dashboard' : '/resident/dashboard';
  } catch (err:any) {
    setError('Login failed');
  } finally {
    setIsLoading(false);
  }
};
const handleGoogleSuccess = (_user: any) => {
  // Google sign-in disabled for now; will be configured later.
  setError("Google sign-in will be configured later.");
};
const handleGoogleError = (error: string) => {
    console.error("Google login error:", error)
    setError("Google login failed. Please try again.")
  }

  const services = [
    {
      title: "File Complaints",
      description: "Report community issues and track their resolution",
      icon: MessageSquare,
      color: "from-red-500 to-red-600",
      bgColor: "from-red-50 to-red-100",
      link: "/resident/complaints/new",
      stats: "1,293 resolved this year",
    },
    {
      title: "Request Documents",
      description: "Apply for certificates, clearances, and permits online",
      icon: FileText,
      color: "from-blue-500 to-blue-600",
      bgColor: "from-blue-50 to-blue-100",
      link: "/resident/documents/request",
      stats: "2,847 processed this month",
    },
    {
      title: "Community Updates",
      description: "Stay informed with the latest barangay announcements",
      icon: Bell,
      color: "from-green-500 to-green-600",
      bgColor: "from-green-50 to-green-100",
      link: "/announcements",
      stats: "24 new announcements",
    },
    {
      title: "Emergency Services",
      description: "Quick access to emergency contacts and services",
      icon: Shield,
      color: "from-yellow-500 to-yellow-600",
      bgColor: "from-yellow-50 to-yellow-100",
      link: "/contact",
      stats: "24/7 availability",
    },
  ]

  const features = [
    {
      title: "Digital-First Approach",
      description: "Modern online services for all your barangay needs",
      icon: Globe,
    },
    {
      title: "Real-time Tracking",
      description: "Monitor your requests and complaints in real-time",
      icon: Activity,
    },
    {
      title: "AI-Powered Insights",
      description: "Smart analytics for better community management",
      icon: Sparkles,
    },
    {
      title: "24/7 Accessibility",
      description: "Access services anytime, anywhere from any device",
      icon: Clock,
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-yellow-50 to-white relative overflow-hidden">
      {/* Background Logo */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="relative w-full h-full max-w-4xl opacity-5">
          <Image
            src="/images/manggahan-banner.png"
            alt="Anak ng Manggahan Background"
            fill
            className="object-contain"
            priority
          />
        </div>
      </div>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 to-yellow-600/10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Column - Hero Content */}
            <div className="space-y-8">
              <div className="space-y-4">
                <Badge className="bg-gradient-to-r from-blue-100 to-yellow-100 text-blue-800 border-0 px-4 py-2">
                  <Sparkles className="h-4 w-4 mr-2" />
                  Digital Barangay Services
                </Badge>
                <h1 className="text-5xl lg:text-6xl font-bold leading-tight">
                  <span className="gradient-text">Ugnayan sa</span>
                  <br />
                  <span className="text-gray-800">Manggahan</span>
                </h1>
                <p className="text-xl text-gray-600 leading-relaxed">
                  Your digital gateway to efficient barangay services. File complaints, request documents, and stay
                  connected with your community through our modern platform.
                </p>
                <div className="flex items-center space-x-2 text-blue-600 font-medium">
                  <Heart className="h-5 w-5 text-red-500" />
                  <span className="italic">Tayong lahat, Bahagi ng Kinabukasan</span>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg card-hover">
                  <div className="text-2xl font-bold gradient-text">{stats.residents.toLocaleString()}</div>
                  <div className="text-sm text-gray-600">Residents</div>
                </div>
                <div className="text-center p-4 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg card-hover">
                  <div className="text-2xl font-bold gradient-text">{stats.documents.toLocaleString()}</div>
                  <div className="text-sm text-gray-600">Documents</div>
                </div>
                <div className="text-center p-4 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg card-hover">
                  <div className="text-2xl font-bold gradient-text">{stats.resolved.toLocaleString()}</div>
                  <div className="text-sm text-gray-600">Resolved</div>
                </div>
                <div className="text-center p-4 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg card-hover">
                  <div className="text-2xl font-bold gradient-text">{stats.staff}</div>
                  <div className="text-sm text-gray-600">Staff</div>
                </div>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/register">
                  <Button className="gradient-primary text-white px-8 py-3 text-lg shadow-lg hover:shadow-xl transition-all duration-300">
                    <Users className="h-5 w-5 mr-2" />
                    Register Now
                  </Button>
                </Link>
                <Link href="/contact">
                  <Button
                    variant="outline"
                    className="border-2 border-blue-200 text-blue-600 hover:bg-blue-50 px-8 py-3 text-lg bg-transparent"
                  >
                    <Phone className="h-5 w-5 mr-2" />
                    Contact Us
                  </Button>
                </Link>
              </div>
            </div>

            {/* Right Column - Login Form */}
            <div className="lg:pl-8">
              <Card className="border-0 shadow-2xl bg-white/95 backdrop-blur-md">
                <CardHeader className="text-center pb-6">
                  <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-4 animate-float">
                    <Image
                      src="/images/logo_manggahan.png"
                      alt="Barangay Manggahan Logo"
                      width={64}
                      height={64}
                      className="rounded-full"
                    />
                  </div>
                  <CardTitle className="text-2xl gradient-text">Welcome Back</CardTitle>
                  <CardDescription className="text-gray-600">Sign in to access your barangay services</CardDescription>
                </CardHeader>

                <CardContent className="space-y-6">
                  {error && (
                    <Alert className="border-red-200 bg-red-50">
                      <AlertDescription className="text-red-800">{error}</AlertDescription>
                    </Alert>
                  )}

                  <Tabs
                    value={loginData.userType}
                    onValueChange={(value) => setLoginData({ ...loginData, userType: value })}
                  >
                    <TabsList className="grid w-full grid-cols-2 bg-gradient-to-r from-blue-100 to-yellow-100 p-1">
                      <TabsTrigger
                        value="resident"
                        className="data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-md font-semibold"
                      >
                        <Users className="h-4 w-4 mr-2" />
                        Resident
                      </TabsTrigger>
                      <TabsTrigger
                        value="staff"
                        className="data-[state=active]:bg-white data-[state=active]:text-yellow-600 data-[state=active]:shadow-md font-semibold"
                      >
                        <Shield className="h-4 w-4 mr-2" />
                        Staff
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="resident" className="space-y-4 mt-6">
                      <form onSubmit={handleLogin} className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="resident-email">Email Address</Label>
                          <Input
                            id="resident-email"
                            type="email"
                            placeholder="your.email@example.com"
                            value={loginData.email}
                            onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                            className="border-blue-200 focus:border-blue-400"
                            required
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="resident-password">Password</Label>
                          <div className="relative">
                            <Input
                              id="resident-password"
                              type={showPassword ? "text" : "password"}
                              placeholder="Enter your password"
                              value={loginData.password}
                              onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                              className="border-blue-200 focus:border-blue-400 pr-10"
                              required
                              autoComplete="off"
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                              onClick={() => setShowPassword(!showPassword)}
                            >
                              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </Button>
                          </div>
                        </div>

                        <Button
                          type="submit"
                          className="w-full gradient-primary text-white shadow-lg hover:shadow-xl transition-all duration-300"
                          disabled={isLoading}
                        >
                          {isLoading ? "Signing in..." : "Sign In as Resident"}
                        </Button>
                      </form>

                      <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                          <div className="w-full border-t border-gray-300" />
                        </div>
                        <div className="relative flex justify-center text-sm">
                          <span className="px-2 bg-white text-gray-500">OR</span>
                        </div>
                      </div>

                      <GoogleLoginButton onSuccess={handleGoogleSuccess} onError={handleGoogleError} />

                      <div className="text-center space-y-2">
                        <Link href="/forgot-password" className="text-sm text-blue-600 hover:text-blue-800">
                          Forgot your password?
                        </Link>
                        <div className="text-sm text-gray-600">
                          Don't have an account?{" "}
                          <Link href="/register" className="text-blue-600 hover:text-blue-800 font-semibold">
                            Register here
                          </Link>
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="staff" className="space-y-4 mt-6">
                      <form onSubmit={handleLogin} className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="staff-email">Staff Email</Label>
                          <Input
                            id="staff-email"
                            type="email"
                            placeholder=""
                            value={loginData.email}
                            onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                            className="border-yellow-200 focus:border-yellow-400"
                            required
                          /></div>

                        <div className="space-y-2">
                          <Label htmlFor="staff-password">Password</Label>
                          <div className="relative">
                            <Input
                              id="staff-password"
                              type={showPassword ? "text" : "password"}
                              placeholder="Enter your password"
                              value={loginData.password}
                              onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                              className="border-yellow-200 focus:border-yellow-400 pr-10"
                              required
                              autoComplete="off"
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                              onClick={() => setShowPassword(!showPassword)}
                            >
                              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </Button>
                          </div></div>

                        <Button
                          type="submit"
                          className="w-full bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                          disabled={isLoading}
                        >
                          {isLoading ? "Signing in..." : "Sign In as Staff"}
                        </Button>
                      </form>

                      <div className="text-center">
                        <Link href="/forgot-password" className="text-sm text-yellow-600 hover:text-yellow-800">
                          Forgot your password?
                        </Link>
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20 bg-white/50 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold gradient-text mb-4">Our Digital Services</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Experience modern, efficient barangay services designed for the digital age
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {services.map((service, index) => {
              const Icon = service.icon
              return (
                <Link key={index} href={service.link}>
                  <Card className="border-0 shadow-lg card-hover bg-gradient-to-br from-white to-gray-50 h-full">
                    <CardContent className="p-6">
                      <div
                        className={`w-16 h-16 bg-gradient-to-br ${service.color} rounded-2xl flex items-center justify-center mb-6 animate-float`}
                      >
                        <Icon className="h-8 w-8 text-white" />
                      </div>
                      <h3 className="text-xl font-bold text-gray-800 mb-3">{service.title}</h3>
                      <p className="text-gray-600 mb-4 leading-relaxed">{service.description}</p>
                      <Badge className={`bg-gradient-to-r ${service.bgColor} text-gray-700 border-0`}>
                        <TrendingUp className="h-3 w-3 mr-1" />
                        {service.stats}
                      </Badge>
                    </CardContent>
                  </Card>
                </Link>
              )
            })}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gradient-to-br from-blue-50 to-yellow-50 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold gradient-text mb-4">Why Choose Our Platform?</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">Built with modern technology to serve you better</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <div key={index} className="text-center">
                  <div className="w-20 h-20 gradient-primary rounded-2xl flex items-center justify-center mx-auto mb-6 animate-pulse-glow">
                    <Icon className="h-10 w-10 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-3">{feature.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-20 bg-white relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold gradient-text mb-6">Get in Touch</h2>
              <p className="text-xl text-gray-600 mb-8">
                Need help or have questions? Our team is here to assist you 24/7.
              </p>

              <div className="space-y-6">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                    <Phone className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800">Emergency Hotline</h4>
                    <p className="text-gray-600">8-BARANGAY (8-227-2642)</p>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl flex items-center justify-center">
                    <Mail className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800">Email Support</h4>
                    <p className="text-gray-600">info@manggahan.gov.ph</p>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center">
                    <MapPin className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800">Visit Us</h4>
                    <p className="text-gray-600">Barangay Manggahan, Pasig City</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-yellow-50 p-8 rounded-3xl">
              <h3 className="text-2xl font-bold text-gray-800 mb-6">Quick Contact</h3>
              <form className="space-y-4" onSubmit={handleQuickContact}>
                {quickDone === "ok" && (<div className="text-green-600 text-sm">Message sent! We'll get back to you soon.</div>)}
                {quickDone === "err" && (<div className="text-red-600 text-sm">Failed to send. Please try again.</div>)}
                <div>
                  <Label htmlFor="contact-name">Name</Label>
                  <Input id="contact-name" required placeholder="Your full name" className="border-blue-200" />
                </div>
                <div>
                  <Label htmlFor="contact-email">Email</Label>
                  <Input
                    id="contact-email"
                    type="email"
                    placeholder="your.email@example.com"
                    className="border-blue-200"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="contact-message">Message</Label>
                  <textarea
                    id="contact-message"
                    rows={4}
                    placeholder="How can we help you?"
                    className="w-full px-3 py-2 border border-blue-200 rounded-lg focus:outline-none focus:border-blue-400"
                    required
                  />
                </div>
                <Button disabled={sendingQuick} className="w-full gradient-primary text-white shadow-lg hover:shadow-xl transition-all duration-300">
                  <Mail className="h-4 w-4 mr-2" />
                  Send Message
                </Button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gradient-to-r from-blue-900 to-blue-800 text-white py-16 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="col-span-2">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-xl flex items-center justify-center">
                  <Shield className="h-6 w-6 text-blue-900" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold">Ugnayan sa Manggahan</h3>
                  <p className="text-blue-200">Digital Barangay Services</p>
                </div>
              </div>
              <p className="text-blue-200 leading-relaxed mb-6">
                Connecting communities through modern technology. Your trusted partner for efficient and accessible
                barangay services.
              </p>
              <div className="flex space-x-4">
                <Badge className="bg-white/20 text-white border-0">
                  <Heart className="h-3 w-3 mr-1" />
                  Serving 15,420+ residents
                </Badge>
                <Badge className="bg-white/20 text-white border-0">
                  <Award className="h-3 w-3 mr-1" />
                  Award-winning platform
                </Badge>
              </div>
            </div>

            <div>
              <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-blue-200">
                <li>
                  <Link href="/register" className="hover:text-white transition-colors">
                    Register
                  </Link>
                </li>
                <li>
                  <Link href="/announcements" className="hover:text-white transition-colors">
                    Announcements
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="hover:text-white transition-colors">
                    Contact Us
                  </Link>
                </li>
                <li>
                  <Link href="/forgot-password" className="hover:text-white transition-colors">
                    Reset Password
                  </Link>
                </li>
                
                <li>
                  <Link href="/api/budget-transparency/download" className="hover:text-white transition-colors" target="_blank" rel="noopener noreferrer">
                    Budget Transparency Report
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-lg font-semibold mb-4">Services</h4>
              <ul className="space-y-2 text-blue-200">
                <li>
                  <Link href="/resident/complaints/new" className="hover:text-white transition-colors">
                    File Complaints
                  </Link>
                </li>
                <li>
                  <Link href="/resident/documents/request" className="hover:text-white transition-colors">
                    Request Documents
                  </Link>
                </li>
                <li>
                  <Link href="/staff/dashboard" className="hover:text-white transition-colors">
                    Staff Portal
                  </Link>
                </li>
                <li>
                  <Link href="/staff/ml-analytics" className="hover:text-white transition-colors">
                    AI Analytics
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-blue-700 mt-12 pt-8 text-center text-blue-200">
            <p>&copy; 2025 Barangay Manggahan. All rights reserved. Built with ❤️ for our community.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}