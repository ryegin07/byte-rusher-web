"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { QRCodeScanner } from "@/components/qr-code-scanner"
import { QrCode, CheckCircle, XCircle, User, FileText, Calendar, MapPin, AlertTriangle, Camera, Search } from 'lucide-react'
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { apiFetch } from "@/lib/api"

export default function DocumentVerifyPage() {
    const router = useRouter();
    useEffect(() => {
      let cancelled = false;
      (async () => {
        try {
          const me = await apiFetch('/auth/me');
          if (cancelled) return;
          if (!me?.authenticated) { router.replace('/'); return; }
          const t = String(me.user?.type || 'staff').toLowerCase();
          if (t !== 'staff') { router.replace('/resident/dashboard'); return; }
        } catch { router.replace('/'); }
      })();
      return () => { cancelled = true as any; };
    }, []);
  const [showScanner, setShowScanner] = useState(false)
  const [verificationResult, setVerificationResult] = useState<any>(null)
  const [manualCode, setManualCode] = useState("")
  const [isVerifying, setIsVerifying] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("");
  const handleMarkCollected = async () => {
    if (!verificationResult?.document?.id) return;
    setIsVerifying(true);
    setError("");
    setSuccess("");
    try {
      const resp = await apiFetch(`/submissions/${verificationResult.document.id}/complete`, {
        method: "POST",
      });
      if (!resp?.ok) throw new Error(resp?.message || "Failed to update");
      // flip status locally
      setVerificationResult((prev:any) =>
        prev ? {...prev, document: {...prev.document!, status: "completed"}} : prev
      );
      setSuccess("Document marked as collected successfully.");
    } catch (e: any) {
      setError(e?.message || "Failed to mark as collected");
    } finally {
      setIsVerifying(false);
    }
  };

  
  const handleQRScan = async (qrData: string) => {
    setIsVerifying(true);
    setError("");
    setShowScanner(false);
    try {
      // Accept either plain code or a JSON payload with documentId
      let code = qrData;
      try {
        const obj = JSON.parse(qrData);
        code = obj.documentId || obj.id || obj.documentReqId || qrData;
      } catch {}
      const resp = await apiFetch(`/submissions/document/${encodeURIComponent(code)}`);
      if (!resp?.ok) throw new Error(resp?.message || 'Invalid or unknown document');
      const d = resp.data;
      setVerificationResult({
        isValid: true,
        message: 'The document was found and is valid for release.',
        document: {
          id: d.id,
          code: d.documentReqId || d.id,
          title: d.title || 'Document',
          type: d.type,
          issueDate: d.issueDate,
          expiryDate: d.expiryDate,
          hall: d.hall,
          status: d.status,
          purpose: d.purpose,
          fee: d.fee,
        },
        resident: {
          name: d.resident?.name,
          address: d.resident?.address,
          phone: d.resident?.phone,
          email: d.resident?.email,
        }
      });
    } catch (e:any) {
      setError(e?.message || 'Invalid QR code');
    } finally {
      setIsVerifying(false);
    }
  }

  
  const handleManualVerify = async () => {
    if (!manualCode.trim()) {
      setError("Please enter a document code");
      return;
    }
    setIsVerifying(true);
    setError("");
    try {
      const resp = await apiFetch(`/submissions/document/${encodeURIComponent(manualCode.trim())}`);
      if (!resp?.ok) throw new Error(resp?.message || 'Document not found');
      const d = resp.data;
      setVerificationResult({
        isValid: true,
        message: 'The document was found and is valid for release.',
        document: {
          id: d.id,
          code: d.documentReqId || d.id,
          title: d.title || 'Document',
          type: d.type,
          issueDate: d.issueDate,
          expiryDate: d.expiryDate,
          hall: d.hall,
          status: d.status,
          purpose: d.purpose,
          fee: d.fee,
        },
        resident: {
          name: d.resident?.name,
          address: d.resident?.address,
          phone: d.resident?.phone,
          email: d.resident?.email,
        }
      });
    } catch (e:any) {
      setError(e?.message || 'Unable to verify document');
    } finally {
      setIsVerifying(false);
    }
  }

  const handleReset = () => {
    setVerificationResult(null)
    setManualCode("")
    setError("")
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                <QrCode className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Document Verification</h1>
                <p className="text-gray-600">Verify document authenticity using QR codes</p>
              </div>
            </div>
            <Link href="/staff/dashboard">
              <Button variant="outline">
                Back to Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {!verificationResult ? (
          <div className="max-w-2xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle>Verify Document</CardTitle>
                <CardDescription>
                  Scan the QR code on the document or enter the document code manually
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {success && (
                  <Alert className="mb-6 border-green-200 bg-green-50">
                    <CheckCircle className="h-4 w-4" />
                    <AlertDescription className="text-green-800">{success}</AlertDescription>
                  </Alert>
                )}
                {error && (
                  <Alert className="border-red-200 bg-red-50">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription className="text-red-800">{error}</AlertDescription>
                  </Alert>
                )}

                {/* QR Code Scanning */}
                <div className="text-center space-y-4">
                  <div className="w-32 h-32 bg-blue-50 rounded-lg flex items-center justify-center mx-auto">
                    <QrCode className="h-16 w-16 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Scan QR Code</h3>
                    <p className="text-sm text-gray-600 mb-4">
                      Use your device camera to scan the QR code on the document
                    </p>
                    <Button 
                      onClick={() => setShowScanner(true)}
                      className="w-full"
                      disabled={isVerifying}
                    >
                      <Camera className="h-4 w-4 mr-2" />
                      {isVerifying ? "Verifying..." : "Start QR Scanner"}
                    </Button>
                  </div>
                </div>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-500">OR</span>
                  </div>
                </div>

                {/* Manual Code Entry */}
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold mb-2">Enter Document Code</h3>
                    <p className="text-sm text-gray-600 mb-4">
                      If you can't scan the QR code, enter the document code manually
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="documentCode">Document Code</Label>
                    <Input
                      id="documentCode"
                      placeholder="e.g., DOC-2024-001"
                      value={manualCode}
                      onChange={(e) => setManualCode(e.target.value)}
                    />
                  </div>
                  
                  <Button 
                    onClick={handleManualVerify}
                    variant="outline"
                    className="w-full"
                    disabled={isVerifying}
                  >
                    <Search className="h-4 w-4 mr-2" />
                    {isVerifying ? "Verifying..." : "Verify Document"}
                  </Button>
                </div>

                {/* Instructions */}
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">Verification Instructions</h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Ensure the QR code is clearly visible and not damaged</li>
                    <li>• Hold the device steady when scanning</li>
                    <li>• For manual entry, use the exact document code format</li>
                    <li>• Contact IT support if you encounter technical issues</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto">
            {/* Verification Result */}
            <Card className={`mb-6 ${verificationResult.isValid ? 'border-green-200' : 'border-red-200'}`}>
              <CardHeader>
                <div className="flex items-center space-x-3">
                  {verificationResult.isValid ? (
                    <CheckCircle className="h-8 w-8 text-green-600" />
                  ) : (
                    <XCircle className="h-8 w-8 text-red-600" />
                  )}
                  <div>
                    <CardTitle className={verificationResult.isValid ? 'text-green-900' : 'text-red-900'}>
                      {verificationResult.isValid ? 'Document Verified' : 'Verification Failed'}
                    </CardTitle>
                    <CardDescription>
                      {verificationResult.isValid 
                        ? 'This document is authentic and valid'
                        : verificationResult.error
                      }
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
            </Card>

            {verificationResult.isValid && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Document Information */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <FileText className="h-5 w-5" />
                      <span>Document Details</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm font-medium text-gray-500">Document ID</Label>
                        <p className="font-mono text-sm">{verificationResult.document.id}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-500">Type</Label>
                        <p>{verificationResult.document.type}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm font-medium text-gray-500">Issue Date</Label>
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          <span>{new Date(verificationResult.document.issueDate).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-500">Expiry Date</Label>
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          <span>{new Date(verificationResult.document.expiryDate).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm font-medium text-gray-500">Issuing Hall</Label>
                        <div className="flex items-center space-x-2">
                          <MapPin className="h-4 w-4 text-gray-400" />
                          <span>{verificationResult.document.hall}</span>
                        </div>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-500">Status</Label>
                        <Badge className="bg-green-100 text-green-800">
                          {verificationResult.document.status}
                        </Badge>
                      </div>
                    </div>

                    <div>
                      <Label className="text-sm font-medium text-gray-500">Purpose</Label>
                      <p>{verificationResult.document.purpose}</p>
                    </div>
                  </CardContent>
                </Card>

                {/* Resident Information */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <User className="h-5 w-5" />
                      <span>Resident Information</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Full Name</Label>
                      <p className="font-semibold">{verificationResult.resident.name}</p>
                    </div>

                    <div>
                      <Label className="text-sm font-medium text-gray-500">Address</Label>
                      <p>{verificationResult.resident.address}</p>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                      <div>
                        <Label className="text-sm font-medium text-gray-500">Phone Number</Label>
                        <p>{verificationResult.resident.phone}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-500">Email Address</Label>
                        <p>{verificationResult.resident.email}</p>
                      </div>
                    </div>

                    <div className="pt-4 border-t">
                      <div className="flex items-center space-x-2 text-sm text-green-600">
                        <CheckCircle className="h-4 w-4" />
                        <span>Identity Verified</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-center space-x-4 mt-8">
              <Button onClick={handleReset} variant="outline">
                Verify Another Document
              </Button>
              {verificationResult.isValid && (
                <Button
                  onClick={handleMarkCollected}
                  disabled={isVerifying || verificationResult.document?.status === "completed"}
                >
                  {verificationResult.document?.status === "completed" ? "Already Collected" : "Mark as Collected"}
                </Button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* QR Scanner Modal */}
      {showScanner && (
        <QRCodeScanner
          onScan={handleQRScan}
          onClose={() => setShowScanner(false)}
        />
      )}
    </div>
  )
}
