"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, Plus, FileText, Clock, CheckCircle, QrCode, DollarSign, Calendar } from "lucide-react"
import { apiFetch } from "@/lib/api"

interface DocumentRequestProps {
  user: any
  onNavigate: (page: string) => void
}

export function DocumentRequest({ user, onNavigate }: DocumentRequestProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const isStaff = user?.role === "Staff"

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const data = await apiFetch('/submissions');
        const docs = (Array.isArray(data) ? data : [])
          .filter((s:any) => (s.submissionType||'').toLowerCase() === 'document')
          .map((s:any) => {
            const st = (s.status||'').toLowerCase();
            const status =
              st === 'pending' ? 'Processing' :
              st === 'ready' ? 'Ready for Pickup' :
              st === 'completed' ? 'Completed' :
              s.status || 'Processing';
            return {
              id: s.documentReqId || s.id,
              rawId: s.id,
              type: s.documentType || 'Document',
              resident: s.name || s.requestorName || 'Unknown',
              status,
              requestDate: (s.createdAt || '').slice(0,10),
              completedDate: status === 'Completed' ? (s.updatedAt || '').slice(0,10) : null,
              fee: s.fee ?? null,
              purpose: s.purpose || s.reason || '',
              qrCode: true,
            };
          });
        if (mounted) setDocumentRequests(docs);
      } catch {
        /* ignore */
      }
    })();
    return () => { mounted = false; };
  }, []);

  async function markReady(rawId: string) {
    try {
      await apiFetch(`/submissions/${rawId}/status`, { method: 'POST', body: JSON.stringify({status: 'ready'}) });
      // Reload
      const data = await apiFetch('/submissions');
      const docs = (Array.isArray(data) ? data : [])
        .filter((s:any) => (s.submissionType||'').toLowerCase() === 'document')
        .map((s:any) => {
          const st = (s.status||'').toLowerCase();
          const status =
            st === 'pending' ? 'Processing' :
            st === 'ready' ? 'Ready for Pickup' :
            st === 'completed' ? 'Completed' :
            s.status || 'Processing';
          return {
            id: s.documentReqId || s.id,
            rawId: s.id,
            type: s.documentType || 'Document',
            resident: s.name || s.requestorName || 'Unknown',
            status,
            requestDate: (s.createdAt || '').slice(0,10),
            completedDate: status === 'Completed' ? (s.updatedAt || '').slice(0,10) : null,
            fee: s.fee ?? null,
            purpose: s.purpose || s.reason || '',
            qrCode: true,
          };
        });
      setDocumentRequests(docs);
    } catch {}
  }

  async function downloadQr(rawId: string) {
    try {
      const res = await fetch(`/api/submissions/${rawId}/qr`);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Document-${rawId}-QR.png`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch {}
  }

  const [documentRequests, setDocumentRequests] = useState<any[]>([]);

    
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const data = await apiFetch('/submissions');
        const docs = (Array.isArray(data) ? data : [])
          .filter((s:any) => (s.submissionType || '').toLowerCase() === 'document')
          .map((s:any) => {
            const st = (s.status || '').toLowerCase();
            const status =
              st === 'pending'   ? 'Processing' :
              st === 'ready'     ? 'Ready for Pickup' :
              st === 'completed' ? 'Completed' : (s.status || 'Processing');
            return {
              id: s.documentReqId || s.id,
              rawId: s.id,
              type: s.documentType || 'Document',
              resident: s.name || s.requestorName || 'Unknown',
              status,
              requestDate: (s.createdAt || '').slice(0,10),
              completedDate: status === 'Completed' ? (s.updatedAt || '').slice(0,10) : null,
              fee: s.fee ?? null,
              purpose: s.purpose || s.reason || '',
              qrCode: true,
            };
          });
        if (mounted) setDocumentRequests(docs);
      } catch { /* silent */ }
    })();
    return () => { mounted = false; };
  }, []);

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
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  const processingRequests = documentRequests.filter(r => (r.status||'').toLowerCase().includes('processing'));
  const readyRequests = documentRequests.filter(r => (r.status||'').toLowerCase().includes('ready'));
  const completedRequests = documentRequests.filter(r => (r.status||'').toLowerCase().includes('completed'));

  const filteredRequests = documentRequests.filter(
    (request) =>
      request.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.resident.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.id.toLowerCase().includes(searchTerm.toLowerCase()),
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
            </TabsList>

            <TabsContent value="all" className="space-y-4">
              {filteredRequests.map((request) => (
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

                    <div className="flex space-x-2">
                      {request.qrCode && (
                        <Button variant="outline" size="sm" className="flex items-center space-x-1 bg-transparent" onClick={() => downloadQr(request.rawId)}>
                          <QrCode className="h-3 w-3" />
                          <span>QR Code</span>
                        </Button>
                      )}
                      {isStaff && (
                        <>
                          <Button variant="outline" size="sm">
                            Process
                          </Button>
                          <Button variant="outline" size="sm">
                            Generate QR
                          </Button>
                        </>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            {/* Other tab contents would be similar but filtered by status */}
            <TabsContent value="processing" className="space-y-4">
              {processingRequests.map((request) => (
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

                    <div className="flex space-x-2">
                      {(request.status||"").toLowerCase().includes("processing") && (
                        <Button size="sm" onClick={() => markReady(request.rawId)}>Ready for pickup</Button>
                      )}
                      {true && (
                        <Button variant="outline" size="sm" className="flex items-center space-x-1 bg-transparent" onClick={() => downloadQr(request.rawId)}>
                          <QrCode className="h-3 w-3" />
                          <span>QR Code</span>
                        </Button>
                      )}
                      {isStaff && (
                        <>
                          <Button variant="outline" size="sm">
                            Process
                          </Button>
                          <Button variant="outline" size="sm">
                            Generate QR
                          </Button>
                        </>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="ready" className="space-y-4">
              {readyRequests.map((request) => (
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

                    <div className="flex space-x-2">
                      {(request.status||"").toLowerCase().includes("processing") && (
                        <Button size="sm" onClick={() => markReady(request.rawId)}>Ready for pickup</Button>
                      )}
                      {true && (
                        <Button variant="outline" size="sm" className="flex items-center space-x-1 bg-transparent" onClick={() => downloadQr(request.rawId)}>
                          <QrCode className="h-3 w-3" />
                          <span>QR Code</span>
                        </Button>
                      )}
                      {isStaff && (
                        <>
                          <Button variant="outline" size="sm">
                            Process
                          </Button>
                          <Button variant="outline" size="sm">
                            Generate QR
                          </Button>
                        </>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="completed" className="space-y-4">
              {completedRequests.map((request) => (
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

                    <div className="flex space-x-2">
                      {(request.status||"").toLowerCase().includes("processing") && (
                        <Button size="sm" onClick={() => markReady(request.rawId)}>Ready for pickup</Button>
                      )}
                      {true && (
                        <Button variant="outline" size="sm" className="flex items-center space-x-1 bg-transparent" onClick={() => downloadQr(request.rawId)}>
                          <QrCode className="h-3 w-3" />
                          <span>QR Code</span>
                        </Button>
                      )}
                      {isStaff && (
                        <>
                          <Button variant="outline" size="sm">
                            Process
                          </Button>
                          <Button variant="outline" size="sm">
                            Generate QR
                          </Button>
                        </>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
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
