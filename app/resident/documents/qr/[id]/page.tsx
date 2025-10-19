"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowLeft, Download, Share2, MapPin, Clock, CheckCircle, QrCodeIcon } from "lucide-react"
import Link from "next/link"
import { QRCodeGenerator } from "@/components/qr-code-generator"

export default function DocumentQRPage({ params }: { params: { id: string } }) {
  const [documentData, setDocumentData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulate API call to fetch document data
    const fetchDocumentData = async () => {
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Mock document data
      setDocumentData({
        id: params.id,
        type: "Barangay Clearance",
        requestorName: "Juan Dela Cruz",
        status: "Ready for Pickup",
        requestDate: "2024-01-15",
        readyDate: "2024-01-18",
        fee: 50,
        purpose: "Employment Requirements",
        pickupHall: "Greenpark Hall",
        qrCode: `DOC-${params.id}-${Date.now()}`,
        validUntil: "2024-02-18",
      })
      setLoading(false)
    }

    fetchDocumentData()
  }, [params.id])

  const handleDownloadQR = () => {
    // In a real app, this would generate and download the QR code image
    const canvas = document.querySelector("canvas")
    if (canvas) {
      const link = document.createElement("a")
      link.download = `document-qr-${params.id}.png`
      link.href = canvas.toDataURL()
      link.click()
    }
  }

  const handleShareQR = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Document QR Code",
          text: `QR Code for document ${params.id}`,
          url: window.location.href,
        })
      } catch (error) {
        console.log("Error sharing:", error)
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href)
      alert("Link copied to clipboard!")
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-2xl mx-auto px-4">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded mb-4"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  if (!documentData) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-2xl mx-auto px-4">
          <Card>
            <CardContent className="p-8 text-center">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Document Not Found</h2>
              <p className="text-gray-600 mb-6">The requested document could not be found.</p>
              <Link href="/resident/dashboard">
                <Button>Back to Dashboard</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <Link href="/resident/dashboard" className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Document QR Code</h1>
          <p className="text-gray-600 mt-2">Present this QR code when picking up your document</p>
        </div>

        <div className="space-y-6">
          {/* Document Information */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-xl">{documentData.type}</CardTitle>
                  <CardDescription>Document ID: {documentData.id}</CardDescription>
                </div>
                <Badge className="bg-green-100 text-green-800">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  {documentData.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="font-medium text-gray-900">Requestor</p>
                  <p className="text-gray-600">{documentData.requestorName}</p>
                </div>
                <div>
                  <p className="font-medium text-gray-900">Purpose</p>
                  <p className="text-gray-600">{documentData.purpose}</p>
                </div>
                <div>
                  <p className="font-medium text-gray-900">Request Date</p>
                  <p className="text-gray-600">{new Date(documentData.requestDate).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="font-medium text-gray-900">Ready Date</p>
                  <p className="text-gray-600">{new Date(documentData.readyDate).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="font-medium text-gray-900">Fee</p>
                  <p className="text-gray-600">₱{documentData.fee}</p>
                </div>
                <div>
                  <p className="font-medium text-gray-900">Valid Until</p>
                  <p className="text-gray-600">{new Date(documentData.validUntil).toLocaleDateString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* QR Code */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <QrCodeIcon className="h-5 w-5" />
                <span>QR Code for Pickup</span>
              </CardTitle>
              <CardDescription>Show this QR code to the staff when picking up your document</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center space-y-4">
                <div className="p-4 bg-white rounded-lg border-2 border-gray-200">
                  <QRCodeGenerator value={documentData.qrCode} size={200} />
                </div>

                <div className="text-center">
                  <p className="text-sm font-mono text-gray-600 mb-4">{documentData.qrCode}</p>

                  <div className="flex space-x-2">
                    <Button onClick={handleDownloadQR} variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                    <Button onClick={handleShareQR} variant="outline" size="sm">
                      <Share2 className="h-4 w-4 mr-2" />
                      Share
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Pickup Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <MapPin className="h-5 w-5" />
                <span>Pickup Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="font-medium text-gray-900 mb-1">{documentData.pickupHall}</p>
                  <p className="text-sm text-gray-600">
                    {documentData.pickupHall === "Greenpark Hall" && "Greenpark Village, Barangay Manggahan"}
                    {documentData.pickupHall === "Napico Hall" && "Napico Village, Barangay Manggahan"}
                    {documentData.pickupHall === "Karangalan Hall" && "Karangalan Village, Barangay Manggahan"}
                    {documentData.pickupHall === "Manggahan Proper Hall" && "Manggahan Proper, Barangay Manggahan"}
                  </p>
                </div>

                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Clock className="h-4 w-4" />
                  <span>Office Hours: Monday - Friday, 8:00 AM - 5:00 PM</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Important Reminders */}
          <Alert>
            <QrCodeIcon className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-2">
                <p className="font-medium">Important Reminders:</p>
                <ul className="list-disc list-inside text-sm space-y-1">
                  <li>Bring a valid ID for verification</li>
                  <li>Present this QR code to the staff</li>
                  <li>Payment of ₱{documentData.fee} is required upon pickup</li>
                  <li>QR code is valid until {new Date(documentData.validUntil).toLocaleDateString()}</li>
                  <li>Only the requestor or authorized representative can pick up the document</li>
                </ul>
              </div>
            </AlertDescription>
          </Alert>

          {/* Action Buttons */}
          <div className="flex space-x-4">
            <Link href="/resident/dashboard" className="flex-1">
              <Button variant="outline" className="w-full bg-transparent">
                Back to Dashboard
              </Button>
            </Link>
            <Link href="/contact" className="flex-1">
              <Button className="w-full bg-blue-600 hover:bg-blue-700">Contact Hall</Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
