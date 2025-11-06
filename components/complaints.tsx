"use client"

import { useEffect, useMemo, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, Plus, Filter, Clock, CheckCircle, AlertCircle, MessageSquare } from "lucide-react"
import { apiFetch } from "@/lib/api"

interface ComplaintsProps {
  user: any
  onNavigate: (page: string) => void
}

export function Complaints({ user, onNavigate }: ComplaintsProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const isStaff = user?.role === "Staff"

  // safe lowercase helper to avoid "toLowerCase of undefined" errors
  const lc = (v: unknown) => (v ?? "").toString().toLowerCase()

  // Fetch submissions (Complaints/Inquiry) once and normalize to your card shape
  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        setLoading(true); setError(null)
        const filter = encodeURIComponent(
          JSON.stringify({
            where: { submissionType: "Complaints/Inquiry" },
            order: ["createdAt DESC"],
          }),
        )
        const res = await apiFetch(`/submissions?filter=${filter}`)
        const raw: any[] = Array.isArray(res) ? res : res?.data || []

        // Normalize API fields to the UI fields you already render
        // status mapping: active -> "Under Investigation", resolved -> "Resolved"
        const mapped = raw.map((r) => ({
          id: r.id,
          title: r.title || r.subject || r.category || "Complaint",
          description: r.description ?? r.details ?? "",
          category: r.category ?? "",
          status:
            lc(r.status) === "active"
              ? "Under Investigation"
              : lc(r.status) === "resolved"
              ? "Resolved"
              : r.status || "New",
          priority: r.priority || "Medium",
          resident: r.name || "Anonymous",
          date: r.createdAt || r.date || new Date().toISOString(),
          location: r.location || "",
          // keep original status for logic checks
          _rawStatus: lc(r.status || ""),
          _rawCreatedAt: r.createdAt,
        }))

        if (mounted) setItems(mapped)
      } catch {
        if (mounted) setError("Failed to load complaints")
      } finally {
        if (mounted) setLoading(false)
      }
    })()
    return () => {
      mounted = false
    }
  }, [])

  const isToday = (iso?: string) => {
    if (!iso) return false
    const d = new Date(iso)
    const n = new Date()
    return d.getFullYear() === n.getFullYear() && d.getMonth() === n.getMonth() && d.getDate() === n.getDate()
  }

  // Base filtering by search term (title/description/category)
  const filtered = useMemo(() => {
    if (!searchTerm.trim()) return items
    const q = lc(searchTerm)
    return items.filter(
      (c) => lc(c.title).includes(q) || lc(c.description).includes(q) || lc(c.category).includes(q),
    )
  }, [items, searchTerm])

  // Tabs
  const allComplaints = filtered
  const newComplaints = filtered.filter((c) => c._rawStatus === "active" && isToday(c._rawCreatedAt))
  const investigating = filtered.filter((c) => c._rawStatus === "active")
  const resolved = filtered.filter((c) => c._rawStatus === "resolved")

  // Mark resolved (only for active items)
  async function markResolved(id: string) {
    try {
      await apiFetch(`/submissions/${id}/status`, {
        method: "POST",
        body: JSON.stringify({ status: "resolved" }),
      })
      setItems((prev) =>
        prev.map((c) =>
          c.id === id
            ? {
                ...c,
                status: "Resolved",
                _rawStatus: "resolved",
              }
            : c,
        ),
      )
    } catch {
      // optional: toast
    }
  }

  // UI helpers (unchanged)
  const getStatusColor = (status: string) => {
    switch (status) {
      case "New":
        return "bg-blue-100 text-blue-800"
      case "Under Investigation":
        return "bg-yellow-100 text-yellow-800"
      case "Resolved":
        return "bg-green-100 text-green-800"
      case "Closed":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "High":
        return "bg-red-100 text-red-800"
      case "Medium":
        return "bg-yellow-100 text-yellow-800"
      case "Low":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "New":
        return <AlertCircle className="h-4 w-4" />
      case "Under Investigation":
        return <Clock className="h-4 w-4" />
      case "Resolved":
        return <CheckCircle className="h-4 w-4" />
      default:
        return <MessageSquare className="h-4 w-4" />
    }
  }

  // Keep your UI the same below — only swap the mapped arrays and add the Mark resolved button where _rawStatus === 'active'
  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{isStaff ? "Complaint Management" : "My Complaints"}</h1>
          <p className="text-gray-600 mt-2">
            {isStaff ? "Review and manage resident complaints" : "Track your submitted complaints and file new ones"}
          </p>
        </div>
      </div>

      {/* Search and Filter */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex space-x-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search complaints..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline" className="flex items-center space-x-2 bg-transparent">
              <Filter className="h-4 w-4" />
              <span>Filter</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Complaints Tabs */}
      <Tabs defaultValue="all" className="space-y-6">
        <TabsList>
          <TabsTrigger value="all">All Complaints</TabsTrigger>
          <TabsTrigger value="new">New</TabsTrigger>
          <TabsTrigger value="investigating">Under Investigation</TabsTrigger>
          <TabsTrigger value="resolved">Resolved</TabsTrigger>
        </TabsList>

        {/* ALL */}
        <TabsContent value="all" className="space-y-4">
          {loading && <div className="text-sm text-gray-500">Loading…</div>}
          {error && <div className="text-sm text-red-500">{error}</div>}
          {!loading &&
            !error &&
            allComplaints.map((complaint) => (
              <Card key={complaint.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <CardTitle className="text-lg mb-2">{complaint.title}</CardTitle>
                      <CardDescription className="mb-3">
                        ID: {complaint.id} • {complaint.resident}
                      </CardDescription>
                      <div className="flex flex-wrap gap-2">
                        <Badge className={getStatusColor(complaint.status)}>
                          {getStatusIcon(complaint.status)}
                          <span className="ml-1">{complaint.status}</span>
                        </Badge>
                        <Badge className={getPriorityColor(complaint.priority)}>{complaint.priority}</Badge>
                        <Badge variant="outline">{complaint.category}</Badge>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 mb-4">{complaint.description}</p>

                  <div className="grid md:grid-cols-3 gap-4 text-sm text-gray-600 mb-4">
                    <div>
                      <span className="font-medium">Location:</span>
                      <p>{complaint.location}</p>
                    </div>
                    <div>
                      <span className="font-medium">Date Filed:</span>
                      <p>{new Date(complaint.date).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <span className="font-medium">Category:</span>
                      <p>{complaint.category}</p>
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    {isStaff && (
                      <>
                        <Button variant="outline" size="sm">
                          Update Status
                        </Button>
                        <Button variant="outline" size="sm">
                          Assign
                        </Button>
                      </>
                    )}
                    {complaint._rawStatus === "active" && (
                      <Button size="sm" onClick={() => markResolved(complaint.id!)}>
                        Mark resolved
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
        </TabsContent>

        {/* NEW (active today) */}
        <TabsContent value="new">
          {newComplaints.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600">New complaints will appear here</p>
            </div>
          ) : (
            newComplaints.map((complaint) => (
              <Card key={complaint.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <CardTitle className="text-lg mb-2">{complaint.title}</CardTitle>
                      <CardDescription className="mb-3">
                        ID: {complaint.id} • {complaint.resident}
                      </CardDescription>
                      <div className="flex flex-wrap gap-2">
                        <Badge className={getStatusColor(complaint.status)}>
                          {getStatusIcon(complaint.status)}
                          <span className="ml-1">{complaint.status}</span>
                        </Badge>
                        <Badge className={getPriorityColor(complaint.priority)}>{complaint.priority}</Badge>
                        <Badge variant="outline">{complaint.category}</Badge>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 mb-4">{complaint.description}</p>

                  <div className="grid md:grid-cols-3 gap-4 text-sm text-gray-600 mb-4">
                    <div>
                      <span className="font-medium">Location:</span>
                      <p>{complaint.location}</p>
                    </div>
                    <div>
                      <span className="font-medium">Date Filed:</span>
                      <p>{new Date(complaint.date).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <span className="font-medium">Category:</span>
                      <p>{complaint.category}</p>
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    {complaint._rawStatus === "active" && (
                      <Button size="sm" onClick={() => markResolved(complaint.id!)}>
                        Mark resolved
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        {/* UNDER INVESTIGATION (active) */}
        <TabsContent value="investigating">
          {investigating.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600">Complaints under investigation will appear here</p>
            </div>
          ) : (
            investigating.map((complaint) => (
              <Card key={complaint.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <CardTitle className="text-lg mb-2">{complaint.title}</CardTitle>
                      <CardDescription className="mb-3">
                        ID: {complaint.id} • {complaint.resident}
                      </CardDescription>
                      <div className="flex flex-wrap gap-2">
                        <Badge className={getStatusColor(complaint.status)}>
                          {getStatusIcon(complaint.status)}
                          <span className="ml-1">{complaint.status}</span>
                        </Badge>
                        <Badge className={getPriorityColor(complaint.priority)}>{complaint.priority}</Badge>
                        <Badge variant="outline">{complaint.category}</Badge>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 mb-4">{complaint.description}</p>

                  <div className="grid md:grid-cols-3 gap-4 text-sm text-gray-600 mb-4">
                    <div>
                      <span className="font-medium">Location:</span>
                      <p>{complaint.location}</p>
                    </div>
                    <div>
                      <span className="font-medium">Date Filed:</span>
                      <p>{new Date(complaint.date).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <span className="font-medium">Category:</span>
                      <p>{complaint.category}</p>
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    {complaint._rawStatus === "active" && (
                      <Button size="sm" onClick={() => markResolved(complaint.id!)}>
                        Mark resolved
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        {/* RESOLVED */}
        <TabsContent value="resolved">
          {resolved.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600">Resolved complaints will appear here</p>
            </div>
          ) : (
            resolved.map((complaint) => (
              <Card key={complaint.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <CardTitle className="text-lg mb-2">{complaint.title}</CardTitle>
                      <CardDescription className="mb-3">
                        ID: {complaint.id} • {complaint.resident}
                      </CardDescription>
                      <div className="flex flex-wrap gap-2">
                        <Badge className={getStatusColor(complaint.status)}>
                          {getStatusIcon(complaint.status)}
                          <span className="ml-1">{complaint.status}</span>
                        </Badge>
                        <Badge className={getPriorityColor(complaint.priority)}>{complaint.priority}</Badge>
                        <Badge variant="outline">{complaint.category}</Badge>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 mb-4">{complaint.description}</p>

                  <div className="grid md:grid-cols-3 gap-4 text-sm text-gray-600 mb-4">
                    <div>
                      <span className="font-medium">Location:</span>
                      <p>{complaint.location}</p>
                    </div>
                    <div>
                      <span className="font-medium">Date Filed:</span>
                      <p>{new Date(complaint.date).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <span className="font-medium">Category:</span>
                      <p>{complaint.category}</p>
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    {/* no Mark resolved here — already resolved */}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>

      {!loading && !error && allComplaints.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No complaints found</h3>
            <p className="text-gray-600">
              {searchTerm ? "Try adjusting your search terms." : "No complaints have been filed yet."}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
