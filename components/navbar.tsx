"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import {
  Bell,
  Menu,
  User,
  LogOut,
  Shield,
  FileText,
  MessageSquare,
  Home,
  Brain,
  Users,
  Activity,
  Sparkles,
} from "lucide-react"
import Link from "next/link"
import {apiFetch} from '@/lib/api'
import {useRouter} from 'next/navigation'
interface NavbarProps {
  user: {
    name: string
    email: string
    avatar?: string
    type: "resident" | "staff"
    position?: string
    hall?: string
    employeeId?: string
  }
}

export function Navbar({ user }: NavbarProps) {
  const [notifications] = useState([
    {
      id: 1,
      title: "Document Ready",
      message: "Your barangay clearance is ready for pickup",
      time: "2 hours ago",
      type: "success",
    },
    {
      id: 2,
      title: "Complaint Update",
      message: "Street light repair has been scheduled",
      time: "1 day ago",
      type: "info",
    },
    {
      id: 3,
      title: "New Announcement",
      message: "Community cleanup drive this Saturday",
      time: "2 days ago",
      type: "announcement",
    },
  ])

  const router = useRouter()
  const handleLogout = async() => {
    try { await apiFetch('/auth/logout', { method: 'POST' }) } catch { }
    localStorage.removeItem("currentUser")
    router.push('/')
  }

  const residentMenuItems = [
    { label: "Dashboard", href: "/resident/dashboard", icon: Home },
    { label: "File Complaint", href: "/resident/complaints/new", icon: MessageSquare },
    { label: "Request Documents", href: "/resident/documents/request", icon: FileText },
    { label: "View Announcements", href: "/announcements", icon: Bell },
  ]

  const staffMenuItems = [
    { label: "Staff Dashboard", href: "/staff/dashboard", icon: Shield },
    { label: "ML Analytics", href: "/staff/ml-analytics", icon: Brain },
    { label: "Verify Documents", href: "/staff/documents/verify", icon: FileText },
    { label: "Manage Users", href: "/staff/users", icon: Users },
    { label: "System Reports", href: "/staff/reports", icon: Activity },
  ]

  const menuItems = user.type === "staff" ? staffMenuItems : residentMenuItems

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-blue-100 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-yellow-500 rounded-xl flex items-center justify-center animate-pulse-glow">
              <Shield className="h-6 w-6 text-white" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-xl font-bold gradient-text">Ugnayan sa Manggahan</h1>
              <p className="text-xs text-gray-600">Digital Barangay Services</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            {user.type === "staff" ? (
              <>
                <Link
                  href="/staff/dashboard"
                  className="text-gray-700 hover:text-blue-600 font-medium transition-colors"
                >
                  Dashboard
                </Link>
                <Link
                  href="/staff/ml-analytics"
                  className="text-gray-700 hover:text-purple-600 font-medium transition-colors flex items-center space-x-1"
                >
                  <Brain className="h-4 w-4" />
                  <span>AI Analytics</span>
                </Link>
                <Link
                  href="/staff/documents/verify"
                  className="text-gray-700 hover:text-green-600 font-medium transition-colors"
                >
                  Verify Docs
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/resident/dashboard"
                  className="text-gray-700 hover:text-blue-600 font-medium transition-colors"
                >
                  Dashboard
                </Link>
                <Link
                  href="/resident/complaints/new"
                  className="text-gray-700 hover:text-red-600 font-medium transition-colors"
                >
                  File Complaint
                </Link>
                <Link
                  href="/resident/documents/request"
                  className="text-gray-700 hover:text-green-600 font-medium transition-colors"
                >
                  Request Docs
                </Link>
              </>
            )}
          </div>

          {/* Right Side - Notifications & User Menu */}
          <div className="flex items-center space-x-4">

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center space-x-2 px-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-yellow-500 rounded-full flex items-center justify-center">
                    <span className="text-sm font-bold text-white">
                      {user.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </span>
                  </div>
                  <div className="hidden sm:block text-left">
                    <div className="text-sm font-semibold text-gray-800">{user.name}</div>
                    <div className="text-xs text-gray-600">{user.type === "staff" ? user.position : "Resident"}</div>
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-yellow-500 rounded-full flex items-center justify-center">
                    <span className="text-sm font-bold text-white">
                      {user.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </span>
                  </div>
                  <div>
                    <div className="font-semibold">{user.name}</div>
                    <div className="text-xs text-gray-600">{user.email}</div>
                    {user.type === "staff" && (
                      <Badge className="bg-gradient-to-r from-yellow-100 to-yellow-200 text-yellow-800 border-0 text-xs mt-1">
                        <Shield className="h-3 w-3 mr-1" />
                        {user.position}
                      </Badge>
                    )}
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link
                    href={user.type === "staff" ? "/staff/dashboard" : "/resident/dashboard"}
                    className="flex items-center space-x-2"
                  >
                    <Home className="h-4 w-4" />
                    <span>Dashboard</span>
                  </Link>
                </DropdownMenuItem>
                {
                  user.type === "resident" && (
                    <DropdownMenuItem className="flex items-center space-x-2">
                      <Link
                        href="/resident/profile"
                        className="flex items-center space-x-2"
                      >
                        <User className="h-4 w-4" />
                        <span>Profile</span>
                      </Link>
                    </DropdownMenuItem>
                  )
                }
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="flex items-center space-x-2 text-red-600 focus:text-red-600"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Sign Out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Mobile Menu */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="md:hidden">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80">
                <SheetHeader>
                  <SheetTitle className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-yellow-500 rounded-xl flex items-center justify-center">
                      <Shield className="h-6 w-6 text-white" />
                    </div>
                    <span className="gradient-text">Barangay Portal</span>
                  </SheetTitle>
                  <SheetDescription>{user.type === "staff" ? "Staff Dashboard" : "Resident Services"}</SheetDescription>
                </SheetHeader>

                <div className="mt-8 space-y-4">
                  {/* User Info */}
                  <div className="p-4 bg-gradient-to-r from-blue-50 to-yellow-50 rounded-xl">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-yellow-500 rounded-full flex items-center justify-center">
                        <span className="text-sm font-bold text-white">
                          {user.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </span>
                      </div>
                      <div>
                        <div className="font-semibold text-gray-800">{user.name}</div>
                        <div className="text-sm text-gray-600">
                          {user.type === "staff" ? user.position : "Resident"}
                        </div>
                        {user.hall && <div className="text-xs text-gray-500">{user.hall}</div>}
                      </div>
                    </div>
                  </div>

                  {/* Menu Items */}
                  <div className="space-y-2">
                    {menuItems.map((item, index) => {
                      const Icon = item.icon
                      return (
                        <Link key={index} href={item.href}>
                          <Button variant="ghost" className="w-full justify-start text-left hover:bg-blue-50">
                            <Icon className="h-4 w-4 mr-3" />
                            {item.label}
                          </Button>
                        </Link>
                      )
                    })}
                  </div>

                  {/* Special Features */}
                  {user.type === "staff" && (
                    <div className="pt-4 border-t border-gray-200">
                      <Link href="/staff/ml-analytics">
                        <Button className="w-full bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white">
                          <Sparkles className="h-4 w-4 mr-2" />
                          AI Analytics Dashboard
                        </Button>
                      </Link>
                    </div>
                  )}

                  {/* Logout */}
                  <div className="pt-4 border-t border-gray-200">
                    <Button
                      onClick={handleLogout}
                      variant="outline"
                      className="w-full border-red-200 text-red-600 hover:bg-red-50 bg-transparent"
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Sign Out
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  )
}
