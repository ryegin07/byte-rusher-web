"use client"
import FeedbackModal from "@/components/feedback-modal";

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowLeft, FileText, MapPin, Phone, CreditCard, Clock, Info } from "lucide-react"
import Link from "next/link"
import { createSubmission } from "@/lib/api";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"

export default function DocumentRequestPage() {
  const [confirmOpen, setConfirmOpen] = useState(false)

  const [formData, setFormData] = useState({
    requestorName: "",
    email: "",
    phone: "",
    address: "",
    documentType: "",
    purpose: "",
    pickupHall: "",
    urgentRequest: false,
    smsNotifications: true,
    additionalNotes: "",
    status: "pending",
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [feedbackDone, setFeedbackDone] = useState(false)

  const documentTypes = [
    {
      name: "Barangay Clearance",
      fee: 50,
      processingTime: "3-5 days",
      requirements: ["Valid ID", "Proof of Residency"],
    },
    {
      name: "Certificate of Residency",
      fee: 30,
      processingTime: "2-3 days",
      requirements: ["Valid ID", "Proof of Address"],
    },
    {
      name: "Certificate of Indigency",
      fee: 20,
      processingTime: "3-5 days",
      requirements: ["Valid ID", "Income Statement"],
    },
    {
      name: "Business Permit",
      fee: 100,
      processingTime: "5-7 days",
      requirements: ["Valid ID", "Business Registration", "Location Map"],
    },
    {
      name: "Community Tax Certificate (Cedula)",
      fee: 25,
      processingTime: "1-2 days",
      requirements: ["Valid ID", "Income Declaration"],
    },
    {
      name: "Certificate of Good Moral Character",
      fee: 40,
      processingTime: "3-4 days",
      requirements: ["Valid ID", "Character References"],
    },
  ]

  const barangayHalls = [
    { name: "Napico Hall", address: "Napico Village, Barangay Manggahan", hours: "8AM-5PM" },
    { name: "Greenpark Hall", address: "Greenpark Village, Barangay Manggahan", hours: "8AM-5PM" },
    { name: "Karangalan Hall", address: "Karangalan Village, Barangay Manggahan", hours: "8AM-5PM" },
    { name: "Manggahan Proper Hall", address: "Manggahan Proper, Barangay Manggahan", hours: "8AM-5PM" },
  ]

  const selectedDocument = documentTypes.find((doc) => doc.name === formData.documentType)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const api = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001';
      const payload = {
        name: formData.requestorName,
        requestorName: formData.requestorName,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        submissionType: 'Document',
        documentType: formData.documentType,
        purpose: formData.purpose,
        pickupHall: formData.pickupHall,
        urgentRequest: formData.urgentRequest,
        smsNotifications: formData.smsNotifications,
        additionalNotes: formData.additionalNotes,
        status: formData.status,
        fee: ((selectedDocument?.fee || 0) + (formData.urgentRequest ? 20 : 0)),
        urgent: formData.urgentRequest,
      };
      const res = await createSubmission(payload);
      // Store the returned documentReqId to show in success screen
      (res && res.documentReqId) && (window.sessionStorage.setItem('last_doc_id', res.documentReqId));
      setSubmitted(true);
    } catch (err) {
      console.error(err);
      alert('Failed to submit. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }

  
    
  const openConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    setConfirmOpen(true);
  };
  // Calls existing handleSubmit but bypasses the native event since it only uses preventDefault()
  const handleConfirmSubmit = async () => {
    try {
      await handleSubmit({ preventDefault: () => {} } as unknown as React.FormEvent);
    } finally {
      setConfirmOpen(false);
    }
  };
if (submitted) {
return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-2xl mx-auto px-4">
          <Card>
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="h-8 w-8 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Request Submitted Successfully</h2>
              <FeedbackModal pagePath="/resident/documents/request" forceOpen onSubmitted={() => setFeedbackDone(true)} />
              <p className="text-gray-600 mb-6">
                Your document request has been received and assigned ID: <strong>{typeof window !== 'undefined' ? (sessionStorage.getItem('last_doc_id') || 'N/A') : 'N/A'}</strong>
              </p>
              <div className="bg-blue-50 p-4 rounded-lg mb-6 text-left">
                <h3 className="font-semibold text-blue-900 mb-2">Next Steps:</h3>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Processing will begin within 24 hours</li>
                  <li>• You'll receive SMS updates at {formData.phone}</li>
                  <li>• A QR code will be generated when ready for pickup</li>
                  <li>• Pickup location: {formData.pickupHall}</li>
                  <li>• Fee: ₱{selectedDocument?.fee} (payable upon pickup)</li>
                </ul>
              </div>
              <div className="flex space-x-4 justify-center">
                {feedbackDone ? (
                  <Link href="/resident/dashboard"><Button>Go to Dashboard</Button></Link>
                ) : (
                  <Button disabled>Go to Dashboard</Button>
                )}
                {feedbackDone ? (
                  <Button variant="outline" onClick={() => setSubmitted(false)}>Request Another</Button>
                ) : (
                  <Button variant="outline" disabled>Request Another</Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <Link href="/resident/dashboard" className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Request Document</h1>
          <p className="text-gray-600 mt-2">
            Request official barangay documents online. Choose your pickup location and track your request status.
          </p>
        </div>

        <form onSubmit={openConfirm} className="space-y-8">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Form */}
            <div className="lg:col-span-2 space-y-6">
              {/* Personal Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <FileText className="h-5 w-5" />
                    <span>Requestor Information</span>
                  </CardTitle>
                  <CardDescription>Your personal information for document processing</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name *</Label>
                      <Input
                        id="name"
                        value={formData.requestorName}
                        onChange={(e) => setFormData({ ...formData, requestorName: e.target.value })}
                        placeholder="As it appears on your ID"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number *</Label>
                      <Input
                        id="phone"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="0917-123-4567"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="address">Complete Address *</Label>
                      <Input
                        id="address"
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        placeholder="Block, Lot, Street, Village"
                        required
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Document Details */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <CreditCard className="h-5 w-5" />
                    <span>Document Details</span>
                  </CardTitle>
                  <CardDescription>Select the document you need and provide purpose</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="documentType">Document Type *</Label>
                    <Select
                      value={formData.documentType}
                      onValueChange={(value) => setFormData({ ...formData, documentType: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select document type" />
                      </SelectTrigger>
                      <SelectContent>
                        {documentTypes.map((doc) => (
                          <SelectItem key={doc.name} value={doc.name}>
                            {doc.name} - ₱{doc.fee}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {selectedDocument && (
                    <Alert>
                      <Info className="h-4 w-4" />
                      <AlertDescription>
                        <div className="space-y-1">
                          <p>
                            <strong>Fee:</strong> ₱{selectedDocument.fee}
                          </p>
                          <p>
                            <strong>Processing Time:</strong> {selectedDocument.processingTime}
                          </p>
                          <p>
                            <strong>Requirements:</strong> {selectedDocument.requirements.join(", ")}
                          </p>
                        </div>
                      </AlertDescription>
                    </Alert>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="purpose">Purpose *</Label>
                    <Input
                      id="purpose"
                      value={formData.purpose}
                      onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                      placeholder="e.g., Employment, School enrollment, Business registration"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="pickupHall">Pickup Location *</Label>
                    <Select
                      value={formData.pickupHall}
                      onValueChange={(value) => setFormData({ ...formData, pickupHall: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Choose your preferred pickup hall" />
                      </SelectTrigger>
                      <SelectContent>
                        {barangayHalls.map((hall) => (
                          <SelectItem key={hall.name} value={hall.name}>
                            {hall.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="notes">Additional Notes (Optional)</Label>
                    <Textarea
                      id="notes"
                      value={formData.additionalNotes}
                      onChange={(e) => setFormData({ ...formData, additionalNotes: e.target.value })}
                      placeholder="Any special instructions or additional information..."
                      rows={3}
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="urgent"
                      checked={formData.urgentRequest}
                      onCheckedChange={(checked) => setFormData({ ...formData, urgentRequest: checked as boolean })}
                    />
                    <Label htmlFor="urgent" className="text-sm">
                      Urgent request (additional ₱20 fee for expedited processing)
                    </Label>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Pickup Information */}
              {formData.pickupHall && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <MapPin className="h-5 w-5" />
                      <span>Pickup Details</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {(() => {
                      const selectedHall = barangayHalls.find((hall) => hall.name === formData.pickupHall)
                      return selectedHall ? (
                        <div className="space-y-2 text-sm">
                          <p>
                            <strong>{selectedHall.name}</strong>
                          </p>
                          <p className="text-gray-600">{selectedHall.address}</p>
                          <p className="text-gray-600">Hours: {selectedHall.hours}</p>
                          <p className="text-gray-600">Monday - Friday</p>
                        </div>
                      ) : null
                    })()}
                  </CardContent>
                </Card>
              )}

              {/* Fee Summary */}
              {selectedDocument && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <CreditCard className="h-5 w-5" />
                      <span>Fee Summary</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Document Fee:</span>
                        <span>₱{selectedDocument.fee}</span>
                      </div>
                      {formData.urgentRequest && (
                        <div className="flex justify-between">
                          <span>Urgent Processing:</span>
                          <span>₱20</span>
                        </div>
                      )}
                      <div className="border-t pt-2 flex justify-between font-semibold">
                        <span>Total:</span>
                        <span>₱{selectedDocument.fee + (formData.urgentRequest ? 20 : 0)}</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-2">Payment is due upon document pickup</p>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Notification Settings */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Phone className="h-5 w-5" />
                    <span>Notifications</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="sms"
                      checked={formData.smsNotifications}
                      onCheckedChange={(checked) => setFormData({ ...formData, smsNotifications: checked as boolean })}
                    />
                    <Label htmlFor="sms" className="text-sm">
                      Receive SMS updates about request status
                    </Label>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    You'll receive notifications when your document is ready for pickup with QR code.
                  </p>
                </CardContent>
              </Card>

              {/* Processing Timeline */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Clock className="h-5 w-5" />
                    <span>Processing Timeline</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="text-sm space-y-2">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span>Request submitted</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                      <span>Under review (1-2 days)</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                      <span>Processing ({selectedDocument?.processingTime || "3-5 days"})</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                      <span>Ready for pickup</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Requirements Reminder */}
              {selectedDocument && (
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Bring these during pickup:</strong>
                    <ul className="list-disc list-inside mt-1 text-sm">
                      {selectedDocument.requirements.map((req, index) => (
                        <li key={index}>{req}</li>
                      ))}
                      <li>QR code (will be sent via SMS)</li>
                      <li>Payment for document fee</li>
                    </ul>
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-4">
            <Link href="/resident/dashboard">
              <Button variant="outline">Cancel</Button>
            </Link>
            <Button
              type="submit"
              disabled={isSubmitting || !formData.documentType}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isSubmitting ? "Submitting..." : "Submit Request"}
            </Button>
          </div>
        </form>

        <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirm Submission</DialogTitle>
              <DialogDescription>
                By submitting, I confirm that the details provided are true and correct.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="sm:justify-end">
              <Button type="button" variant="outline" onClick={() => setConfirmOpen(false)}>
                Cancel
              </Button>
              <Button type="button" onClick={handleConfirmSubmit} disabled={isSubmitting}>
                {isSubmitting ? "Submitting..." : "Submit"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}