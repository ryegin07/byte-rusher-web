"use client"

import { useRouter } from "next/navigation"

import { useState, useEffect } from "react"
import { apiFetch } from "@/lib/api"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  FileText,
  MessageSquare,
  Bell,
  Clock,
  CheckCircle,
  AlertTriangle,
  TrendingUp,
  Calendar,
  MapPin,
  Phone,
  User,
  Star,
  Activity,
  Sparkles,
  Award,
  Heart,
  QrCode,
} from "lucide-react"
import Link from "next/link"
import { Navbar } from "@/components/navbar"
import Image from "next/image"

export default function ResidentDashboard() {
  
  const router = useRouter();
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const me = await apiFetch('/auth/me');
        if (cancelled) return;
        if (!me?.authenticated) { router.replace('/'); return; }
        const t = String(me.user?.type || 'resident').toLowerCase();
        if (t !== 'resident') { router.replace('/staff/dashboard'); return; }
      } catch { router.replace('/'); }
    })();
    return () => { cancelled = true as any; };
  }, []);
const [user, setUser] = useState({
    name: "Maria Santos",
    email: "maria.santos@gmail.com",
    avatar: "/placeholder.svg?height=40&width=40",
    type: "resident" as const,
    address: "Block 5, Lot 12, Greenpark Village",
    phone: "09171234567",
    memberSince: "January 2023",
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


  const [stats, setStats] = useState({
    totalRequests: 0,
    pendingRequests: 0,
    completedRequests: 0,
    activeComplaints: 0,
  })

  const [residentStats, setResidentStats] = useState({
    totalRequests: 0,
    pending: 0,
    completed: 0,
    activeIssues: 0,
    issuesResolved: 0,
    communityEngagement: 0,
  })


  
  const downloadSubmissionQR = async (id: string | number, title?: string) => {
    try {
      const res = await fetch(`/api/submissions/${String(id)}/qr`, { method: 'GET' });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `Failed to generate QR (${res.status})`);
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${(title || 'Document').replace(/[^a-z0-9-_]/gi,'_')}-QR.png`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Download QR error', err);
      alert('Unable to download QR. Please try again later.');
    }
  };

  // Helpers for Recent Activity typing inconsistencies
  const isDocumentActivity = (activity: any) => {
    const t = (activity?.type || activity?.submissionType || "").toString().toLowerCase();
    return t.includes("document") && activity?.status === "ready";
  };
  const getActivityId = (activity: any): string => {
    const id = activity?.id ?? activity?._id ?? activity?.documentReqId ?? activity?.documentId;
    return String(id ?? "");
  };

  const [recentActivity, setRecentActivity] = useState([
    {
      id: 1,
      type: "document",
      title: "Barangay Clearance Request",
      status: "completed",
      date: "2024-01-15",
      description: "Your barangay clearance is ready for pickup",
    },
    {
      id: 2,
      type: "complaint",
      title: "Street Light Maintenance",
      date: "2024-01-12",
      description: "Complaint has been assigned to maintenance team",
    },
    {
      id: 3,
      type: "announcement",
      title: "Community Clean-up Drive",
      status: "new",
      date: "2024-01-10",
      description: "Join us this Saturday for our monthly clean-up",
    },
  ])

  const [showAllActivity, setShowAllActivity] = useState(false)
  const [quickServices] = useState([
    {
      title: "File New Complaint",
      description: "Report issues in your community",
      icon: MessageSquare,
      color: "from-red-500 to-red-600",
      bgColor: "from-red-50 to-red-100",
      link: "/resident/complaints/new",
      popular: true,
    },
    {
      title: "Request Documents",
      description: "Apply for certificates and clearances",
      icon: FileText,
      color: "from-blue-500 to-blue-600",
      bgColor: "from-blue-50 to-blue-100",
      link: "/resident/documents/request",
      popular: true,
    },
    {
      title: "View Announcements",
      description: "Stay updated with community news",
      icon: Bell,
      color: "from-green-500 to-green-600",
      bgColor: "from-green-50 to-green-100",
      link: "/announcements",
      popular: false,
    },
    {
      title: "Contact Barangay",
      description: "Get in touch with officials",
      icon: Phone,
      color: "from-yellow-500 to-yellow-600",
      bgColor: "from-yellow-50 to-yellow-100",
      link: "/contact",
      popular: false,
    },
  ])

  
  // Animate stats on load (after fetching server values)
  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      try {
        // get current user email first
        const me = await apiFetch("/auth/me");
        if (!me?.user?.email) return;
        const email = String(me.user.email);
        // fetch resident dashboard stats
        const data = await apiFetch(`/stats/dashboard/resident?email=${encodeURIComponent(email)}`);
        if (cancelled || !data) return;
        const rs = {
          totalRequests: Number(data.totalRequests || 0),
          pending: Number(data.pending || 0),
          completed: Number(data.completed || 0),
          activeIssues: Number(data.activeIssues || 0),
          issuesResolved: Number(data.issuesResolved || 0),
          communityEngagement: Number(data.communityEngagement || 0),
        };
        setResidentStats(rs);

        // animate the four headline tiles using the fetched values
        const targetStats = {
          totalRequests: rs.totalRequests,
          pendingRequests: rs.pending,
          completedRequests: rs.completed,
          activeComplaints: rs.activeIssues,
        };
        const duration = 1000;
        const steps = 60;
        const stepDuration = duration / steps;
        let step = 0;
        const interval = setInterval(() => {
          step++;
          const progress = step / steps;
          setStats({
            totalRequests: Math.floor(targetStats.totalRequests * progress),
            pendingRequests: Math.floor(targetStats.pendingRequests * progress),
            completedRequests: Math.floor(targetStats.completedRequests * progress),
            activeComplaints: Math.floor(targetStats.activeComplaints * progress),
          });
          if (step >= steps) clearInterval(interval);
        }, stepDuration);
      } catch {}
    };
    run();
    return () => { cancelled = false } // placeholder to be replaced
  }, []);

    


  const getStatusColor = (status?: string) => {
    switch (status || "pending") {
      case "completed":
        return "bg-gradient-to-r from-green-100 to-green-200 text-green-800"
      case "resolved":
        return "bg-gradient-to-r from-green-100 to-green-200 text-green-800"
      case "active":
        return "bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800"
      case "pending":
        return "bg-gradient-to-r from-yellow-100 to-yellow-200 text-yellow-800"
      default:
        return "bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800"
    }
  }

  const getStatusIcon = (status?: string) => {
    switch (status || "pending") {
      case "completed":
        return <CheckCircle className="h-4 w-4" />
      case "in-progress":
        return <Clock className="h-4 w-4" />
      case "pending":
        return <AlertTriangle className="h-4 w-4" />
      default:
        return <Bell className="h-4 w-4" />
    }
  }


  // Load actual logged-in user info
  // Load actual logged-in user info
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const me = await apiFetch("/auth/me");
        const u = me && me.user ? me.user : null;
        if (u && !cancelled) {
          const fullName = [u.firstName, u.lastName].filter(Boolean).join(" ") || u.email || "User";
          setUser(prev => ({
            ...prev,
            name: fullName,
            email: u.email || prev.email,
            address: (u as any).address || prev.address,
            memberSince: (() => {
              const created = (u as any).createdAt || (u as any).created || (u as any).created_on || (u as any).created_at;
              let dt: Date | undefined;
              if (created) { dt = new Date(created as any); }
              else if (typeof u.id === "string" && /^[a-f0-9]{24}$/i.test(u.id)) {
                const ts = parseInt(u.id.substring(0,8), 16) * 1000;
                dt = new Date(ts);
              }
              return dt ? dt.toLocaleDateString(undefined, { month: "long", year: "numeric" }) : prev.memberSince;
            })(),
            phone: (u as any).phone || prev.phone,
          }));
        }
      } catch (e) {
        // ignore
      }
    })();
    return () => { cancelled = true };
  }, []);
  // Load recent activity from Submissions for the current user
  useEffect(() => {
    const load = async () => {
      if (!user.email) return;
      try {
        const list = await apiFetch("/submissions");
        const mine = Array.isArray(list) ? list.filter((s: any) => (s.email || "").toLowerCase() === (user.email || "").toLowerCase()) : [];
        const mapped = mine.map((s: any, i: number) => ({
          id: s.id || s.complaintId || s.documentReqId || i + 1,
          type: (s.submissionType || s.type || "submission").toString().toLowerCase(),
          title: s.subject || `${s.submissionType || "Submission"} ${s.complaintId || s.documentReqId || ""}`.trim(),
          status: s.status,
          date: s.createdAt || s.created || new Date().toISOString(),
          description: s.description || (s.complaintId ? `Reference: ${s.complaintId}` : s.documentReqId ? `Reference: ${s.documentReqId}` : "Submitted"),
        }));
        setRecentActivity(mapped);
      } catch (e) { /* noop */ }
    };
    load();
  }, [user.email]);
  const displayedActivity = showAllActivity ? recentActivity : recentActivity.slice(0, 5);

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
                    <p className="text-blue-100 text-lg">Here's what's happening in your barangay today</p>
                  </div>
                  <div className="hidden md:block">
                    <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center animate-float">
                      <User className="h-10 w-10 text-white" />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
                  <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 text-center">
                    <div className="text-2xl font-bold">{stats.totalRequests}</div>
                    <div className="text-sm text-blue-100">Total Requests</div>
                  </div>
                  <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 text-center">
                    <div className="text-2xl font-bold">{stats.pendingRequests}</div>
                    <div className="text-sm text-blue-100">Pending</div>
                  </div>
                  <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 text-center">
                    <div className="text-2xl font-bold">{stats.completedRequests}</div>
                    <div className="text-sm text-blue-100">Completed</div>
                  </div>
                  <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 text-center">
                    <div className="text-2xl font-bold">{stats.activeComplaints}</div>
                    <div className="text-sm text-blue-100">Active Issues</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Services */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold gradient-text">Quick Services</h2>
              <Badge className="bg-gradient-to-r from-blue-100 to-yellow-100 text-blue-800 border-0">
                <Sparkles className="h-3 w-3 mr-1" />
                Most Popular
              </Badge>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {quickServices.map((service, index) => {
                const Icon = service.icon
                return (
                  <Link key={index} href={service.link}>
                    <Card className="border-0 shadow-lg card-hover bg-gradient-to-br from-white to-gray-50 h-full relative">
                      {service.popular && (
                        <div className="absolute -top-2 -right-2 z-10">
                          <Badge className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-yellow-900 border-0 shadow-lg">
                            <Star className="h-3 w-3 mr-1" />
                            Popular
                          </Badge>
                        </div>
                      )}
                      <CardContent className="p-6">
                        <div
                          className={`w-16 h-16 bg-gradient-to-br ${service.color} rounded-2xl flex items-center justify-center mb-4 animate-float`}
                        >
                          <Icon className="h-8 w-8 text-white" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-800 mb-2">{service.title}</h3>
                        <p className="text-gray-600 text-sm leading-relaxed">{service.description}</p>
                      </CardContent>
                    </Card>
                  </Link>
                )
              })}
            </div>
          </div>

          {/* Main Content */}
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left Column - Recent Activity */}
            <div className="lg:col-span-2">
              <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-blue-50">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-3 text-blue-800">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                      <Activity className="h-5 w-5 text-white" />
                    </div>
                    <span>Recent Activity</span>
                    <Badge className="bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 border-0">
                      {recentActivity.length} items
                    </Badge>
                  </CardTitle>
                  <CardDescription>Track your requests, complaints, and community updates in one place</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {displayedActivity.map((activity) => (
                      <div
                        key={activity.id}
                        className="flex items-start space-x-4 p-4 bg-white/80 backdrop-blur-sm rounded-xl shadow-sm card-hover"
                      >
                        <div className="flex-shrink-0">
                          <div
                            className={`w-10 h-10 rounded-xl flex items-center justify-center ${getStatusColor(activity.status || "pending")}`}
                          >
                            {getStatusIcon(activity.status || "pending")}
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <h4 className="font-semibold text-gray-800 truncate">{activity.title}</h4>
                            <Badge className={`${getStatusColor(activity.status || "pending")} border-0 text-xs`}>
                              {(activity.status ?? "pending").replace("-", " ")}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">{activity.description}</p>
                          <div className="flex items-center text-xs text-gray-500">
                            <div className="flex items-center mr-4">
                              <Calendar className="h-3 w-3 mr-1" />
                              {new Date(activity.date).toLocaleDateString()}
                            </div>
                            <div className="flex items-center">
                            {isDocumentActivity(activity) && (
                            <div className="mt-2">
                              <Button variant="outline" size="sm" className="flex items-center space-x-1 bg-transparent" onClick={() => downloadSubmissionQR(getActivityId(activity), activity.title)}>
                               <QrCode className="h-3 w-3" />
                                <span>QR Code</span>
                              </Button>
                            </div>
                            )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 text-center">
                    <Button onClick={() => setShowAllActivity(v => !v)} variant="outline" className="border-blue-200 text-blue-600 hover:bg-blue-50 bg-transparent">
                      <Activity className="h-4 w-4 mr-2" />
                      {showAllActivity ? "Collapse Activity" : "View All Activity"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Profile & Quick Info */}
            <div className="space-y-6">
              {/* Profile Card */}
              <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-yellow-50">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-3 text-yellow-800">
                    <div className="w-8 h-8 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-lg flex items-center justify-center">
                      <User className="h-5 w-5 text-white" />
                    </div>
                    <span>Profile Information</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center">
                    <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-yellow-500 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-pulse-glow">
                      <span className="text-2xl font-bold text-white">
                        {user.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </span>
                    </div>
                    <h3 className="font-bold text-lg text-gray-800">{user.name}</h3>
                    <p className="text-gray-600">{user.email}</p>
                  </div>

                  <div className="space-y-3 pt-4 border-t border-yellow-200">
                    <div className="flex items-center space-x-3">
                      <MapPin className="h-4 w-4 text-yellow-600" />
                      <span className="text-sm text-gray-600">{user.address}</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Phone className="h-4 w-4 text-yellow-600" />
                      <span className="text-sm text-gray-600">{user.phone}</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Calendar className="h-4 w-4 text-yellow-600" />
                      <span className="text-sm text-gray-600">Member since {user.memberSince}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Community Stats */}
              <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-green-50">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-3 text-green-800">
                    <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center">
                      <TrendingUp className="h-5 w-5 text-white" />
                    </div>
                    <span>Community Impact</span>
                  </CardTitle>
                  <CardDescription>Your contribution to the community</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-600">Community Engagement</span>
                      <span className="text-sm font-bold text-green-600">{residentStats.communityEngagement}%</span>
                    </div>
                    <Progress value={residentStats.communityEngagement} className="h-2" />
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-4">
                    <div className="text-center p-3 bg-green-50 rounded-xl">
                      <div className="text-lg font-bold text-green-700">{residentStats.completed}</div>
                      <div className="text-xs text-green-600">Requests Filed</div>
                    </div>
                    <div className="text-center p-3 bg-blue-50 rounded-xl">
                      <div className="text-lg font-bold text-blue-700">{residentStats.issuesResolved}</div>
                      <div className="text-xs text-blue-600">Issues Resolved</div>
                    </div>
                  </div>

                  {residentStats.communityEngagement > 75 && (
                    <div className="flex items-center justify-center space-x-2 pt-4 border-t border-green-200">
                      <Award className="h-4 w-4 text-yellow-500" />
                      <span className="text-sm font-medium text-gray-700">Active Community Member</span>
                    </div>)
                  }

                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}