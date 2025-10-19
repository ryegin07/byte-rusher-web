"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Users,
  FileText,
  MessageSquare,
  Bell,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertTriangle,
  Plus,
  Eye,
  BarChart3,
} from "lucide-react"
import { useRouter } from "next/navigation"

interface DashboardProps {
  user: any
  onNavigate: (page: string) => void
}

export function Dashboard({ user, onNavigate }: DashboardProps) {
  const router = useRouter()
  const isStaff = user?.role === "Staff"

  const residentStats = [
    {
      label: "Active Requests",
      value: "3",
      icon: FileText,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      href: "/resident/documents",
    },
    {
      label: "Pending Complaints",
      value: "1",
      icon: MessageSquare,
      color: "text-yellow-600",
      bgColor: "bg-yellow-50",
      href: "/resident/complaints",
    },
    {
      label: "Resolved Issues",
      value: "12",
      icon: CheckCircle,
      color: "text-green-600",
      bgColor: "bg-green-50",
      href: "/resident/complaints",
    },
    {
      label: "Announcements",
      value: "5",
      icon: Bell,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      href: "/announcements",
    },
  ]

  const staffStats = [
    {
      label: "Total Residents",
      value: "1,247",
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      href: "/staff/residents",
    },
    {
      label: "Pending Requests",
      value: "23",
      icon: Clock,
      color: "text-yellow-600",
      bgColor: "bg-yellow-50",
      href: "/staff/documents",
    },
    {
      label: "Resolved Today",
      value: "8",
      icon: CheckCircle,
      color: "text-green-600",
      bgColor: "bg-green-50",
      href: "/staff/complaints",
    },
    {
      label: "Urgent Issues",
      value: "2",
      icon: AlertTriangle,
      color: "text-red-600",
      bgColor: "bg-red-50",
      href: "/staff/complaints",
    },
  ]

  const stats = isStaff ? staffStats : residentStats

  const recentActivities = [
    {
      id: 1,
      title: "Document Request Approved",
      description: "Your barangay clearance is ready for pickup",
      time: "2 hours ago",
      type: "success",
      action: () => router.push(isStaff ? "/staff/documents" : "/resident/documents"),
    },
    {
      id: 2,
      title: "New Announcement",
      description: "Community cleanup drive scheduled for Saturday",
      time: "1 day ago",
      type: "info",
      action: () => router.push("/announcements"),
    },
    {
      id: 3,
      title: "Complaint Update",
      description: "Street light repair has been scheduled",
      time: "2 days ago",
      type: "warning",
      action: () => router.push(isStaff ? "/staff/complaints" : "/resident/complaints"),
    },
  ]

  const quickActions = isStaff
    ? [
        {
          label: "Process Documents",
          action: () => router.push("/staff/documents"),
          color: "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800",
          icon: FileText,
        },
        {
          label: "Review Complaints",
          action: () => router.push("/staff/complaints"),
          color: "bg-gradient-to-r from-yellow-600 to-yellow-700 hover:from-yellow-700 hover:to-yellow-800",
          icon: MessageSquare,
        },
        {
          label: "Post Announcement",
          action: () => router.push("/staff/announcements/new"),
          color: "bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800",
          icon: Bell,
        },
        {
          label: "Generate Reports",
          action: () => router.push("/staff/reports"),
          color: "bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800",
          icon: BarChart3,
        },
      ]
    : [
        {
          label: "File Complaint",
          action: () => router.push("/resident/complaints/new"),
          color: "bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800",
          icon: MessageSquare,
        },
        {
          label: "Request Document",
          action: () => router.push("/resident/documents/request"),
          color: "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800",
          icon: FileText,
        },
        {
          label: "View Announcements",
          action: () => router.push("/announcements"),
          color: "bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800",
          icon: Bell,
        },
        {
          label: "Give Feedback",
          action: () => router.push("/feedback"),
          color: "bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800",
          icon: Users,
        },
      ]

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
          Welcome back, {user?.name}!
        </h1>
        <p className="text-gray-600 mt-2">
          {isStaff
            ? "Manage barangay services and assist residents with their needs"
            : "Access your barangay services and track your requests seamlessly"}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => {
          const Icon = stat.icon
          return (
            <Card
              key={index}
              className="hover:shadow-lg transition-all duration-200 cursor-pointer transform hover:scale-105 border-0 shadow-md"
              onClick={() => router.push(stat.href)}
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">{stat.label}</p>
                    <p className={`text-3xl font-bold ${stat.color}`}>{stat.value}</p>
                  </div>
                  <div className={`p-3 rounded-full ${stat.bgColor}`}>
                    <Icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <Card className="lg:col-span-1 shadow-md border-0">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Plus className="h-5 w-5 text-blue-600" />
              <span>Quick Actions</span>
            </CardTitle>
            <CardDescription>{isStaff ? "Common administrative tasks" : "Frequently used services"}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {quickActions.map((action, index) => {
              const Icon = action.icon
              return (
                <Button
                  key={index}
                  onClick={action.action}
                  className={`w-full justify-start text-white shadow-md transition-all duration-200 transform hover:scale-105 ${action.color}`}
                >
                  <Icon className="h-4 w-4 mr-3" />
                  {action.label}
                </Button>
              )
            })}
          </CardContent>
        </Card>

        {/* Recent Activities */}
        <Card className="lg:col-span-2 shadow-md border-0">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-green-600" />
              <span>Recent Activities</span>
            </CardTitle>
            <CardDescription>Latest updates and notifications</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-start space-x-3 p-4 rounded-lg bg-gradient-to-r from-gray-50 to-gray-100 hover:from-gray-100 hover:to-gray-200 transition-all cursor-pointer"
                  onClick={activity.action}
                >
                  <div
                    className={`w-3 h-3 rounded-full mt-2 ${
                      activity.type === "success"
                        ? "bg-green-500"
                        : activity.type === "warning"
                          ? "bg-yellow-500"
                          : "bg-blue-500"
                    }`}
                  />
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{activity.title}</h4>
                    <p className="text-sm text-gray-600">{activity.description}</p>
                    <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                  </div>
                  <Button variant="outline" size="sm" className="bg-transparent hover:bg-white">
                    <Eye className="h-3 w-3 mr-1" />
                    View
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* System Status */}
      <Card className="mt-6 shadow-md border-0">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5 text-blue-600" />
            <span>System Status</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-green-800">All Services Online</span>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-green-800">Database Connected</span>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-green-800">SMS Service Active</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
