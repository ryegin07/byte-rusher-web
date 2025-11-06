"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, Plus, FileText, Clock, CheckCircle, QrCode, DollarSign, Calendar, XCircle } from "lucide-react"
import { apiFetch } from "@/lib/api"

interface DocumentRequestProps {
  user: any
  onNavigate: (page: string) => void
}

type DocRow = {
  id: string
  rawId: string
  type: string
  resident: string
  status: string
  requestDate: string
  completedDate: string | null
  fee: number | null
  purpose: string
  qrCode: boolean
}

export function DocumentRequest({ user, onNavigate }: DocumentRequestProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [documentRequests, setDocumentRequests] = useState<DocRow[]>([])
  const isStaff = user?.role === "Staff"

  // --- helpers ---
  const mapStatus = (stRaw: string) => {
    const st = (stRaw || "").toLowerCase()
    return st === "pending" ? "Processing"
      : st === "ready" ? "Ready for Pickup"
      : st === "completed" ? "Completed"
      : st === "cancelled" ? "Cancelled"
      : stRaw || "Processing"
  }

  const shape = (s: any): DocRow => {
    const status = mapStatus(s.status)
    return {
      id: String(s.documentReqId || s.id),
      rawId: String(s.id),
      type: s.documentType || "Document",
      resident: s.name || s.requestorName || "Unknown",
      status,
      requestDate: (s.createdAt || "").slice(0, 10),
      completedDate: status === "Completed" ? (s.updatedAt || "").slice(0, 10) : null,
      fee: s.fee ?? null,
      purpose: s.purpose || s.reason || "",
      qrCode: true,
    }
  }

  const reloadDocs = async () => {
    const data = await apiFetch("/submissions")
    const docs = (Array.isArray(data) ? data : [])
      .filter((s: any) => (s.submissionType || "").toLowerCase() === "document")
      .map(shape)
    setDocumentRequests(docs)
  }

  // --- effects ---
  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        if (!mounted) return
        await reloadDocs()
      } catch {/* ignore */}
    })()
    return () => { mounted = false }
  }, [])

  // --- actions ---
  async function markReady(rawId: string) {
    try {
      await apiFetch(`/submissions/${rawId}/status`, {
        method: "POST",
        body: JSON.stringify({ status: "ready" }),
      })
      await reloadDocs()
    } catch {}
  }

  async function cancelRequest(rawId: string) {
    try {
      await apiFetch(`/submissions/${rawId}/status`, {
        method: "POST",
        body: JSON.stringify({ status: "cancelled" }),
      })
      await reloadDocs()
    } catch {}
  }

  async function downloadQr(rawId: string) {
    try {
      const res = await fetch(`/api/submissions/${rawId}/qr`)
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `Document-${rawId}-QR.png`
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(url)
    } catch {}
  }

  // --- UI helpers ---
  const documentTypes = [
    { name: "Barangay Clearance", fee: 50, processingTime: "3-5 days" },
    { name: "Certificate of Residency", fee: 30, processingTime: "2-3 days" },
    { name: "Certificate of Indigency", fee: 20, processingTime: "3-5 days" },
    { name: "Business Permit", fee: 100, processingTime: "5-7 days" },
    { name: "Community Tax Certificate", fee: 25, processingTime: "1-2 days" },
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Ready for Pickup":
        return "bg-green-100 text-green-800"
      case "Processing":
        return "bg-yellow-100 text-yellow-800"
      case "Under Review":
        return "bg-blue-100 text-blue-800"
      case "Completed":
        return "bg-green-100 text-green-800"
      case "Cancelled":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Ready for Pickup":
        return <CheckCircle className="h-4 w-4" />
      case "Processing":
        return <Clock className="h-4 w-4" />
      case "Under Review":
        return <FileText className="h-4 w-4" />
      case "Cancelled":
        return <XCircle className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  // --- filters ---
  const processingRequests = documentRequests.filter(r => (r.status || "").toLowerCase().includes("processing"))
  const readyRequests = documentRequests.filter(r => (r.status || "").toLowerCase().includes("ready"))
  const completedRequests = documentRequests.filter(r => (r.status || "").toLowerCase().includes("completed"))
  const cancelledRequests = documentRequests.filter(r => (r.status || "").toLowerCase().includes("cancelled"))

  const filteredRequests = documentRequests.filter((request) => {
    const q = searchTerm.toLowerCase()
    return (
      (request.type || "").toLowerCase().includes(q) ||
      (request.resident || "").toLowerCase().includes(q) ||
      String(request.id || "").toLowerCase().includes(q)
    )
  })

  // --- card renderer (to avoid duplicating JSX) ---
  const RequestCard = (request: DocRow, { showReadyButton = false, showCancelButton = false }: { showReadyButton?: boolean; showCancelButton?: boolean } = {}) => (
    <Card key={request.id} className="hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <CardTitle className="text-lg mb-2">{request.type}</CardTitle>
            <CardDescription className="mb-3">
              ID: {request.id} • {request.resident}
            </CardDescription>
            <Badge className={getStatusColor(request.status)}>
              {getStatusIcon(request.status)}
              <span className="ml-1">{request.status}</span>
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid md:grid-cols-3 gap-4 text-sm text-gray-600 mb-4">
          <div className="flex items-center space-x-2">
            <Calendar className="h-4 w-4" />
            <div>
              <span className="font-medium">Requested:</span>
              <p>{new Date(request.requestDate).toLocaleDateString()}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <DollarSign className="h-4 w-4" />
            <div>
              <span className="font-medium">Fee:</span>
              <p>₱{request.fee}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <FileText className="h-4 w-4" />
            <div>
              <span className="font-medium">Purpose:</span>
              <p>{request.purpose}</p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {request.qrCode && (
            <Button
              variant="outline"
              size="sm"
              className="flex items-center space-x-1 bg-transparent"
              onClick={() => downloadQr(request.rawId)}
            >
              <QrCode className="h-3 w-3" />
              <span>QR Code</span>
            </Button>
          )}

          {showReadyButton && (
            <Button size="sm" onClick={() => markReady(request.rawId)}>Ready for pickup</Button>
          )}

          {showCancelButton && (
            <Button
              variant="destructive"
              size="sm"
              onClick={() => cancelRequest(request.rawId)}
            >
              Cancel
            </Button>
          )}

          {isStaff && (
            <>
              <Button variant="outline" size="sm">Process</Button>
              <Button variant="outline" size="sm">Generate QR</Button>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{isStaff ? "Document Management" : "Document Requests"}</h1>
          <p className="text-gray-600 mt-2">
            {isStaff ? "Process and manage document requests" : "Request and track your barangay documents"}
          </p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Document Types (for residents) or Search (for staff) */}
        <div className="lg:col-span-1">
          {!isStaff ? (
            <Card>
              <CardHeader>
                <CardTitle>Available Documents</CardTitle>
                <CardDescription>Select a document type to request</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {documentTypes.map((doc, index) => (
                  <div key={index} className="p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-medium text-sm">{doc.name}</h4>
                      <span className="text-sm font-bold text-green-600">₱{doc.fee}</span>
                    </div>
                    <p className="text-xs text-gray-600">{doc.processingTime}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-4">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search requests..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Document Requests */}
        <div className="lg:col-span-2">
          <Tabs defaultValue="all" className="space-y-6">
            <TabsList>
              <TabsTrigger value="all">All Requests</TabsTrigger>
              <TabsTrigger value="processing">Processing</TabsTrigger>
              <TabsTrigger value="ready">Ready</TabsTrigger>
              <TabsTrigger value="completed">Completed</TabsTrigger>
              <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-4">
              {filteredRequests.map((r) => RequestCard(r))}
            </TabsContent>

            {/* Processing: includes Cancel button */}
            <TabsContent value="processing" className="space-y-4">
              {processingRequests.map((r) =>
                RequestCard(r, { showReadyButton: true, showCancelButton: true })
              )}
            </TabsContent>

            <TabsContent value="ready" className="space-y-4">
              {readyRequests.map((r) => RequestCard(r))}
            </TabsContent>

            <TabsContent value="completed" className="space-y-4">
              {completedRequests.map((r) => RequestCard(r))}
            </TabsContent>

            {/* Cancelled tab: only cancelled */}
            <TabsContent value="cancelled" className="space-y-4">
              {cancelledRequests.map((r) => RequestCard(r))}
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {filteredRequests.length === 0 && (
        <Card className="mt-6">
          <CardContent className="p-8 text-center">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No document requests found</h3>
            <p className="text-gray-600">
              {searchTerm ? "Try adjusting your search terms." : "No document requests have been made yet."}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
