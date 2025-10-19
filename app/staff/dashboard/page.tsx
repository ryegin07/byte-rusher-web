"use client"

import UploadBudgetDialog from "@/components/upload-budget-dialog"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  Users,
  FileText,
  MessageSquare,
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingUp,
  Activity,
  Brain,
  Shield,
  Star,
  Zap,
  Target,
  Award,
  BarChart3,
  Calendar,
  Megaphone,
} from "lucide-react"
import Link from "next/link"
import { Navbar } from "@/components/navbar"
import { DocumentRequest } from "@/components/document-request"
import { Complaints } from "@/components/complaints"
import { CreateAnnouncement } from "@/components/create-announcement"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { apiFetch } from "@/lib/api"
import ResidentLookup from "@/components/resident-lookup"
import DownloadResidentFeedbackButton from "@/components/download-resident-feedback-button"

export default function StaffDashboard() {
    const [residentLookupOpen, setResidentLookupOpen] = useState(false);
    const [uploadDialogOpen, setUploadDialogOpen] = useState(false)
    const [user, setUser] = useState({
      name: "Juan Dela Cruz",
      email: "juan.delacruz@manggahan.gov.ph",
      avatar: "/placeholder.svg?height=40&width=40",
      type: "staff" as const,
      position: "Barangay Secretary",
      hall: "Napico Hall",
      employeeId: "EMP-2024-001",
    })
  const [greeting, setGreeting] = useState("Hello");
  const [greetingEmoji, setGreetingEmoji] = useState("👋");
  useEffect(() => {
    try {
      const hour = new Date().getHours();
      let g = "Hello";
      let e = "👋";
      if (hour < 12) { g = "Good morning"; e = "🌅"; }
      else if (hour < 18) { g = "Good afternoon"; e = "🌤️"; }
      else if (hour < 22) { g = "Good evening"; e = "🌆"; }
      else { g = "Good night"; e = "🌙"; }
      setGreeting(g);
      setGreetingEmoji(e);
    } catch {}
  }, []);

    const router = useRouter();
    
  // Load Today's Tasks from Submissions
  useEffect(() => {
    let cancelled = false as any;
    (async () => {
      try {
        const filter = encodeURIComponent(JSON.stringify({
          where: { or: [{status: 'pending'}, {status: 'ready'}, {status: 'active'}] },
          order: ["createdAt DESC"]
        }));
        const res = await apiFetch(`/submissions?filter=${filter}`);
        const arr = Array.isArray(res) ? res : (res?.data || []);
        const mapped = arr.map((s: any, i: number) => {
          const rawStatus = lc(s.status);
          const status = mapStatus(rawStatus);
          const submittedAt = s.createdAt || s.created || new Date().toISOString();
          const type = (s.submissionType || s.type || 'submission').toString();
          const title = s.subject || `${type} - ${s.name || ''}`.trim();
          return {
            id: s.id || s.complaintId || s.documentReqId || i + 1,
            type: type,
            title,
            priority: s.priority || (rawStatus === 'active' ? 'high' : 'medium'),
            status,
            dueDate: submittedAt,
            description: s.description || (s.complaintId ? `Complaint ${s.complaintId}` : s.documentReqId ? `Document ${s.documentReqId}` : 'Submission'),
            location: s.location || '',
            _rawStatus: rawStatus,
            _rawCreatedAt: submittedAt,
          };
        })
        // Keep "today" focused but don't hide if empty; prefer today's or pending/active
        const todays = mapped.filter((t: any) => isToday(t._rawCreatedAt) || t.status !== 'completed');
        if (!cancelled) setRecentTasks(todays);
      } catch (e) {
        // silent fail
      }
    })();
    return () => { cancelled = true as any };
  }, []);
useEffect(() => {
      let cancelled = false;
      (async () => {
        try {
          const me = await apiFetch('/auth/me');
          if (cancelled) return;
          if (!me?.authenticated) { router.replace('/'); return; }
          const t = String(me.user?.type || 'staff').toLowerCase();
          if (t !== 'staff') { router.replace('/resident/dashboard'); return; }
          setUser(prev => ({ 
            ...prev, 
            name: `${me.user?.firstName || ''} ${me.user?.lastName || ''}` || prev.name,
            email: me.user?.email || prev.email,  
            position: me.user?.occupation || prev.position,
            hall: me.user?.hall || prev.hall,
            employeeId: me.user?.staffId || prev.employeeId,
          }));
        } catch { router.replace('/'); }
      })();
      return () => { cancelled = true as any; };
    }, []);

  const [currentView, setCurrentView] = useState("dashboard")

  const [stats, setStats] = useState({
    totalResidents: 0,
    pendingRequests: 0,
    completedToday: 0,
    activeComplaints: 0,
    documentsProcessed: 0,
  })
const [recentTasks, setRecentTasks] = useState<any[]>([])
  const [showAllTasks, setShowAllTasks] = useState(false)
  const displayedTasks = showAllTasks ? recentTasks : recentTasks.slice(0, 5)

  const [quickActions] = useState([
    {
      title: "Create Announcement",
      description: "Post new announcements for residents",
      icon: Megaphone,
      color: "from-orange-500 to-orange-600",
      bgColor: "from-orange-50 to-orange-100",
      action: () => setCurrentView("announcements"),
      featured: true,
    },
    {
      title: "Process Requests",
      description: "Handle resident document requests",
      icon: FileText,
      color: "from-green-500 to-green-600",
      bgColor: "from-green-50 to-green-100",
      action: () => setCurrentView("requests"),
      featured: true,
    },
    {
      title: "Manage Complaints",
      description: "Review and resolve complaints",
      icon: MessageSquare,
      color: "from-red-500 to-red-600",
      bgColor: "from-red-50 to-red-100",
      action: () => setCurrentView("complaints"),
      featured: true,
    },
    {
      title: "ML Analytics",
      description: "AI-powered insights and predictions",
      icon: Brain,
      color: "from-purple-500 to-purple-600",
      bgColor: "from-purple-50 to-purple-100",
      link: "/staff/ml-analytics",
      featured: true,
    },
    {
      title: "Verify Documents",
      description: "QR code verification system",
      icon: Shield,
      color: "from-blue-500 to-blue-600",
      bgColor: "from-blue-50 to-blue-100",
      link: "/staff/documents/verify",
      featured: false,
    },
  ])

  // Animate stats on load
  useEffect(() => {
    let stats = {
      totalResidents: 0,
      pendingRequests: 0,
      completedToday: 0,
      activeComplaints: 0,
      documentsProcessed: 0,
    };
    const fetchStats = async () => {
      try {
        const data = await apiFetch("/stats/dashboard/staff")
        stats = {
          totalResidents: Number(data?.totalResidents || 0),
          pendingRequests: Number(data?.pending || 0),
          completedToday: Number(data?.completedToday || 0),
          activeComplaints: Number(data?.activeIssue || 0),
          documentsProcessed: Number(data?.documents || 0),
        }
      } catch {
        // optionally toast error, but silently ignore is fine for now
      }
    }

    fetchStats()

    const animateStats = () => {
      const duration = 2000
      const steps = 60
      const stepDuration = duration / steps

      let step = 0
      const interval = setInterval(() => {
        step++
        const progress = step / steps

        setStats({
          totalResidents: Math.floor(stats.totalResidents * progress),
          pendingRequests: Math.floor(stats.pendingRequests * progress),
          completedToday: Math.floor(stats.completedToday * progress),
          activeComplaints: Math.floor(stats.activeComplaints * progress),
          documentsProcessed: Math.floor(stats.documentsProcessed * progress),
        })

        if (step >= steps) {
          clearInterval(interval)
        }
      }, stepDuration)
    }

    if (currentView === "dashboard") {
      animateStats()
    }
  }, [currentView])

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-gradient-to-r from-red-100 to-red-200 text-red-800"
      case "medium":
        return "bg-gradient-to-r from-yellow-100 to-yellow-200 text-yellow-800"
      case "low":
        return "bg-gradient-to-r from-green-100 to-green-200 text-green-800"
      default:
        return "bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800"
    }
  }

  
  // Helpers for Today's Tasks data mapping
  const lc = (v: unknown) => (v ?? '').toString().toLowerCase();
  const mapStatus = (s?: string) => {
    const v = lc(s);
    if (v === 'completed' || v === 'resolved') return 'completed';
    if (v === 'pending' || v === 'new') return 'pending';
    return 'in-progress'; // active, ready, etc.
  };
  const isToday = (iso?: string) => {
    if (!iso) return false;
    const d = new Date(iso); const n = new Date();
    return d.getFullYear()===n.getFullYear() && d.getMonth()===n.getMonth() && d.getDate()===n.getDate();
  };
const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-gradient-to-r from-green-100 to-green-200 text-green-800"
      case "in-progress":
        return "bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800"
      case "pending":
        return "bg-gradient-to-r from-yellow-100 to-yellow-200 text-yellow-800"
      default:
        return "bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4" />
      case "in-progress":
        return <Clock className="h-4 w-4" />
      case "pending":
        return <AlertTriangle className="h-4 w-4" />
      default:
        return <Activity className="h-4 w-4" />
    }
  }

  const handleNavigation = (page: string) => {
    setCurrentView(page)
  }

  // Render different views based on currentView
  if (currentView === "requests") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-yellow-50 to-white">
        <Navbar user={user} />
        <div className="pt-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-6">
            <Button variant="outline" onClick={() => setCurrentView("dashboard")} className="mb-4">
              ← Back to Dashboard
            </Button>
          </div>
          <DocumentRequest user={user} onNavigate={handleNavigation} />
        </div>
      </div>
    )
  }

  if (currentView === "complaints") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-yellow-50 to-white">
        <Navbar user={user} />
        <div className="pt-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-6">
            <Button variant="outline" onClick={() => setCurrentView("dashboard")} className="mb-4">
              ← Back to Dashboard
            </Button>
          </div>
          <Complaints user={user} onNavigate={handleNavigation} />
        </div>
      </div>
    )
  }

  if (currentView === "announcements") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-yellow-50 to-white">
        <Navbar user={user} />
        <div className="pt-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-6">
            <Button variant="outline" onClick={() => setCurrentView("dashboard")} className="mb-4">
              ← Back to Dashboard
            </Button>
          </div>
          <CreateAnnouncement user={user} onNavigate={handleNavigation} />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-yellow-50 to-white">
      <Navbar user={user} />

      <div className="pt-20 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Welcome Section */}
          <div className="mb-8">
            <div className="bg-gradient-to-r from-blue-600 to-yellow-500 rounded-3xl p-8 text-white relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600/90 to-yellow-500/90"></div>
              <div className="relative z-10">
                {/* Logo Section */}
                <div className="flex justify-center mb-6">
                  <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full p-2 animate-float">
                    <Image
                      src="/images/logo_manggahan.png"
                      alt="Barangay Manggahan Logo"
                      width={64}
                      height={64}
                      className="w-full h-full object-contain rounded-full"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="text-center w-full md:text-left md:w-auto">
                    <h1 className="text-3xl font-bold mb-2">{greeting}, {user.name}! {greetingEmoji}</h1>
                    <p className="text-blue-100 text-lg mb-2">
                      {user.position} • {user.hall}
                    </p>
                    <p className="text-blue-100">Ready to serve the community today</p>
                  </div>
                  <div className="hidden md:block">
                    <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center animate-float">
                      <Shield className="h-10 w-10 text-white" />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-8">
                  <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 text-center">
                    <div className="text-2xl font-bold">{stats.totalResidents.toLocaleString()}</div>
                    <div className="text-sm text-blue-100">Total Residents</div>
                  </div>
                  <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 text-center">
                    <div className="text-2xl font-bold">{stats.pendingRequests}</div>
                    <div className="text-sm text-blue-100">Pending</div>
                  </div>
                  <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 text-center">
                    <div className="text-2xl font-bold">{stats.completedToday}</div>
                    <div className="text-sm text-blue-100">Completed Today</div>
                  </div>
                  <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 text-center">
                    <div className="text-2xl font-bold">{stats.activeComplaints}</div>
                    <div className="text-sm text-blue-100">Active Issues</div>
                  </div>
                  <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 text-center">
                    <div className="text-2xl font-bold">{stats.documentsProcessed}</div>
                    <div className="text-sm text-blue-100">Documents</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold gradient-text">Staff Tools</h2>
              <Badge className="bg-gradient-to-r from-purple-100 to-purple-200 text-purple-800 border-0">
                <Brain className="h-3 w-3 mr-1" />
                AI-Enhanced
              </Badge>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {quickActions.map((action, index) => {
                const Icon = action.icon
                return (
                  <div key={index}>
                    {action.link ? (
                      <Link href={action.link}>
                        <Card className="border-0 shadow-lg card-hover bg-gradient-to-br from-white to-gray-50 h-full relative cursor-pointer">
                          {action.featured && (
                            <div className="absolute -top-2 -right-2 z-10">
                              <Badge className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-yellow-900 border-0 shadow-lg">
                                <Star className="h-3 w-3 mr-1" />
                                Featured
                              </Badge>
                            </div>
                          )}
                          <CardContent className="p-6">
                            <div
                              className={`w-16 h-16 bg-gradient-to-br ${action.color} rounded-2xl flex items-center justify-center mb-4 animate-float`}
                            >
                              <Icon className="h-8 w-8 text-white" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-800 mb-2">{action.title}</h3>
                            <p className="text-gray-600 text-sm leading-relaxed">{action.description}</p>
                          </CardContent>
                        </Card>
                      </Link>
                    ) : (
                      <Card
                        className="border-0 shadow-lg card-hover bg-gradient-to-br from-white to-gray-50 h-full relative cursor-pointer"
                        onClick={action.action}
                      >
                        {action.featured && (
                          <div className="absolute -top-2 -right-2 z-10">
                            <Badge className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-yellow-900 border-0 shadow-lg">
                              <Star className="h-3 w-3 mr-1" />
                              Featured
                            </Badge>
                          </div>
                        )}
                        <CardContent className="p-6">
                          <div
                            className={`w-16 h-16 bg-gradient-to-br ${action.color} rounded-2xl flex items-center justify-center mb-4 animate-float`}
                          >
                            <Icon className="h-8 w-8 text-white" />
                          </div>
                          <h3 className="text-lg font-bold text-gray-800 mb-2">{action.title}</h3>
                          <p className="text-gray-600 text-sm leading-relaxed">{action.description}</p>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          {/* Main Content */}
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left Column - Tasks & Workflow */}
            <div className="lg:col-span-2">
              <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-blue-50">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-3 text-blue-800">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                      <Activity className="h-5 w-5 text-white" />
                    </div>
                    <span>Today's Tasks</span>
                    <Badge className="bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 border-0">
                      {recentTasks.length} items
                    </Badge>
                  </CardTitle>
                  <CardDescription>Manage your daily workflow and priorities</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {displayedTasks.map((task) => (
                      <div
                        key={task.id}
                        className="flex items-start space-x-4 p-4 bg-white/80 backdrop-blur-sm rounded-xl shadow-sm card-hover"
                      >
                        <div className="flex-shrink-0">
                          <div
                            className={`w-10 h-10 rounded-xl flex items-center justify-center ${getStatusColor(task.status)}`}
                          >
                            {getStatusIcon(task.status)}
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <h4 className="font-semibold text-gray-800 truncate">{task.title}</h4>
                            <div className="flex items-center space-x-2">
                              <Badge className={`${getPriorityColor(task.priority)} border-0 text-xs`}>
                                {task.priority} priority
                              </Badge>
                              <Badge className={`${getStatusColor(task.status)} border-0 text-xs`}>
                                {task.status.replace("-", " ")}
                              </Badge>
                            </div>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">{task.description}</p>
                          <div className="flex items-center text-xs text-gray-500">
                            <Calendar className="h-3 w-3 mr-1" />
                            Due: {new Date(task.dueDate).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 text-center">
                    <Button  onClick={() => setShowAllTasks(v => !v)} variant="outline" className="border-blue-200 text-blue-600 hover:bg-blue-50 bg-transparent">
                      <Activity className="h-4 w-4 mr-2" />
                       {showAllTasks ? "Collapse Tasks" : "View All Tasks"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Performance & Tools */}
            <div className="space-y-6">
              {/* AI Insights */}
              <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-purple-50">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-3 text-purple-800">
                    <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
                      <Brain className="h-5 w-5 text-white" />
                    </div>
                    <span>AI Insights</span>
                  </CardTitle>
                  <CardDescription>Smart recommendations for today</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 bg-purple-50 rounded-xl">
                    <div className="flex items-start space-x-3">
                      <Target className="h-5 w-5 text-purple-600 mt-0.5" />
                      <div>
                        <h4 className="font-semibold text-purple-800 text-sm">Priority Alert</h4>
                        <p className="text-xs text-purple-600 mt-1">
                          Block 5 area shows 78% complaint risk. Consider proactive measures.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-blue-50 rounded-xl">
                    <div className="flex items-start space-x-3">
                      <BarChart3 className="h-5 w-5 text-blue-600 mt-0.5" />
                      <div>
                        <h4 className="font-semibold text-blue-800 text-sm">Demand Forecast</h4>
                        <p className="text-xs text-blue-600 mt-1">
                          Document requests expected to increase by 23% this week.
                        </p>
                      </div>
                    </div>
                  </div>

                  <Link href="/staff/ml-analytics">
                    <Button className="w-full bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white shadow-lg">
                      <Brain className="h-4 w-4 mr-2" />
                      View Full Analytics
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              {/* Quick Tools */}
              <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-yellow-50">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-3 text-yellow-800">
                    <div className="w-8 h-8 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-lg flex items-center justify-center">
                      <Zap className="h-5 w-5 text-white" />
                    </div>
                    <span>Quick Tools</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button
                    variant="outline"
                    className="w-full justify-start border-orange-200 text-orange-600 hover:bg-orange-50 bg-transparent"
                    onClick={() => setCurrentView("announcements")}
                  >
                    <Megaphone className="h-4 w-4 mr-3" />
                    Create Announcement
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start border-blue-200 text-blue-600 hover:bg-blue-50 bg-transparent"
                    onClick={() => router.push("/staff/documents/verify")}
                  >
                    <Shield className="h-4 w-4 mr-3" />
                    Verify QR Code
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start border-green-200 text-green-600 hover:bg-green-50 bg-transparent"
                    onClick={() => setCurrentView("requests")}
                  >
                    <FileText className="h-4 w-4 mr-3" />
                    Process Requests
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start border-red-200 text-red-600 hover:bg-red-50 bg-transparent"
                    onClick={() => setCurrentView("complaints")}
                  >
                    <MessageSquare className="h-4 w-4 mr-3" />
                    Manage Complaints
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start border-blue-200 text-blue-600 hover:bg-blue-50 bg-transparent"
                    onClick={() => setUploadDialogOpen(true)}
                  >
                    <FileText className="h-4 w-4 mr-3" />
                    Upload Budget Transparency Report
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start border-purple-200 text-purple-600 hover:bg-purple-50 bg-transparent"
                    onClick={() => setResidentLookupOpen(true)}
                  >
                    <Users className="h-4 w-4 mr-3" />
                    Resident Lookup
                  </Button>
                  <DownloadResidentFeedbackButton />
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
      <UploadBudgetDialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen} />
      <ResidentLookup open={residentLookupOpen} onClose={() => setResidentLookupOpen(false)} />
    </div>
  )
}
