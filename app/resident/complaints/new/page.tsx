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
import { ArrowLeft, Upload, Phone, Mail, AlertTriangle } from "lucide-react"
import Link from "next/link"

export default function NewComplaintPage() {
  const [formData, setFormData] = useState({
    complainantName: "",
    email: "",
    phone: "",
    address: "",
    complaintType: "",
    priority: "",
    location: "",
    hall: "",
    subject: "",
    description: "",
    evidence: null as File | null,
    anonymous: false,
    smsNotifications: true,
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [feedbackDone, setFeedbackDone] = useState(false)
  const [submittedComplaintId, setSubmittedComplaintId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const complaintTypes = [
    "Infrastructure Issues",
    "Public Disturbance",
    "Environmental Concerns",
    "Public Safety",
    "Animal-related Issues",
    "Waste Management",
    "Traffic and Transportation",
    "Public Utilities",
    "Barangay Staff Misconduct",
    "Others",
  ]

  const priorityLevels = [
    { value: "low", label: "Low - Non-urgent matter" },
    { value: "medium", label: "Medium - Requires attention" },
    { value: "high", label: "High - Urgent issue" },
  ]

  const barangayHalls = ["Napico Hall", "Greenpark Hall", "Karangalan Hall", "Manggahan Proper Hall"]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsSubmitting(true)
    try {
      const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001'
      let res: Response
      if (formData.evidence) {
        const fd = new FormData()
        fd.append('name', formData.anonymous ? 'Anonymous' : formData.complainantName)
        fd.append('email', formData.anonymous ? 'anonymous@example.com' : formData.email)
        if (formData.phone) fd.append('phone', formData.phone)
        if (formData.address) fd.append('address', formData.address)
        if (formData.complaintType) fd.append('type', formData.complaintType)
        if (formData.priority) fd.append('priority', formData.priority)
        if (formData.location) fd.append('location', formData.location)
        if (formData.hall) fd.append('hall', formData.hall)
        if (formData.subject) fd.append('subject', formData.subject)
        if (formData.description) fd.append('message', formData.description)
        fd.append('anonymous', String(formData.anonymous ?? false))
        fd.append('smsNotifications', String(formData.smsNotifications ?? false))
        fd.append('submissionType', 'Complaint')
        fd.append('evidence', formData.evidence as Blob)
        fd.append('status', 'active')
        res = await fetch(`${API_BASE}/submissions/upload`, { method: 'POST', body: fd } as RequestInit)
      } else {
        const payload = {
          name: formData.anonymous ? 'Anonymous' : formData.complainantName,
          email: formData.anonymous ? 'anonymous@example.com' : formData.email,
          phone: formData.phone || undefined,
          address: formData.address || undefined,
          type: formData.complaintType || undefined,
          priority: formData.priority || undefined,
          location: formData.location || undefined,
          hall: formData.hall || undefined,
          subject: formData.subject || undefined,
          message: formData.description || undefined,
          anonymous: formData.anonymous ?? false,
          smsNotifications: formData.smsNotifications ?? false,
          submissionType: 'Complaint',
        }
        res = await fetch(`${API_BASE}/submissions`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
      }
      if (!res.ok) {
        const msg = await res.text()
        throw new Error(msg || `Request failed: ${res.status}`)
      }
      const data = await res.json()
      if (data?.complaintId) setSubmittedComplaintId(data.complaintId)
      setSubmitted(true)
    } catch (err: any) {
      setError(err?.message || 'Failed to submit complaint')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setFormData({ ...formData, evidence: file })
    }
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-2xl mx-auto px-4">
          <Card>
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="h-8 w-8 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Complaint Submitted Successfully</h2>
              <FeedbackModal pagePath="/resident/complaints/new" forceOpen onSubmitted={() => setFeedbackDone(true)} />
              <p className="text-gray-600 mb-6">
                Your complaint has been received and assigned ID: <strong>{submittedComplaintId}</strong>
              </p>
              <div className="bg-blue-50 p-4 rounded-lg mb-6">
                <p className="text-sm text-blue-800">
                  📱 You will receive SMS notifications about the status of your complaint at {formData.phone}
                </p>
              </div>
              <div className="flex space-x-4 justify-center">
                {feedbackDone ? (
                  <Link href="/resident/dashboard"><Button>Go to Dashboard</Button></Link>
                ) : (
                  <Button disabled>Go to Dashboard</Button>
                )}
                {feedbackDone ? (
                  <Button variant="outline" onClick={() => setSubmitted(false)}>Submit Another</Button>
                ) : (
                  <Button variant="outline" disabled>Submit Another</Button>
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
          <h1 className="text-3xl font-bold text-gray-900">File a Complaint</h1>
          <p className="text-gray-600 mt-2">
            Report issues and concerns in your community. We'll track your complaint and keep you updated.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Form */}
            <div className="lg:col-span-2 space-y-6">
              {/* Personal Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Mail className="h-5 w-5" />
                    <span>Personal Information</span>
                  </CardTitle>
                  <CardDescription>Your contact information for follow-up and notifications</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name *</Label>
                      <Input
                        id="name"
                        value={formData.complainantName}
                        onChange={(e) => setFormData({ ...formData, complainantName: e.target.value })}
                        required
                        disabled={formData.anonymous}
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
                        disabled={formData.anonymous}
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
                      <Label htmlFor="address">Address</Label>
                      <Input
                        id="address"
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        placeholder="Block, Lot, Street"
                      />
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="anonymous"
                      checked={formData.anonymous}
                      onCheckedChange={(checked) => setFormData({ ...formData, anonymous: checked as boolean })}
                    />
                    <Label htmlFor="anonymous" className="text-sm">
                      Submit anonymously (name and email will be hidden from staff)
                    </Label>
                  </div>
                </CardContent>
              </Card>

              {/* Complaint Details */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <AlertTriangle className="h-5 w-5" />
                    <span>Complaint Details</span>
                  </CardTitle>
                  <CardDescription>Provide detailed information about your complaint</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="type">Complaint Type *</Label>
                      <Select
                        value={formData.complaintType}
                        onValueChange={(value) => setFormData({ ...formData, complaintType: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select complaint type" />
                        </SelectTrigger>
                        <SelectContent>
                          {complaintTypes.map((type) => (
                            <SelectItem key={type} value={type}>
                              {type}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="priority">Priority Level *</Label>
                      <Select
                        value={formData.priority}
                        onValueChange={(value) => setFormData({ ...formData, priority: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select priority" />
                        </SelectTrigger>
                        <SelectContent>
                          {priorityLevels.map((priority) => (
                            <SelectItem key={priority.value} value={priority.value}>
                              {priority.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="location">Specific Location *</Label>
                      <Input
                        id="location"
                        value={formData.location}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                        placeholder="e.g., Main Street, Block 1"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="hall">Preferred Barangay Hall</Label>
                      <Select
                        value={formData.hall}
                        onValueChange={(value) => setFormData({ ...formData, hall: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select hall" />
                        </SelectTrigger>
                        <SelectContent>
                          {barangayHalls.map((hall) => (
                            <SelectItem key={hall} value={hall}>
                              {hall}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="subject">Subject/Title *</Label>
                    <Input
                      id="subject"
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      placeholder="Brief description of the issue"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Detailed Description *</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Provide a detailed description of the issue, including when it occurred, who was involved, and any other relevant information..."
                      rows={6}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="evidence">Supporting Evidence (Optional)</Label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                      <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-600 mb-2">Upload photos, documents, or other evidence</p>
                      <input
                        type="file"
                        id="evidence"
                        onChange={handleFileUpload}
                        accept="image/*,.pdf,.doc,.docx"
                        className="hidden"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => document.getElementById("evidence")?.click()}
                      >
                        Choose File
                      </Button>
                      {formData.evidence && (
                        <p className="text-sm text-green-600 mt-2">File selected: {formData.evidence.name}</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
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
                      Receive SMS updates about complaint status
                    </Label>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    You'll receive notifications when your complaint is reviewed, assigned, and resolved.
                  </p>
                </CardContent>
              </Card>

              {/* Guidelines */}
              <Card>
                <CardHeader>
                  <CardTitle>Filing Guidelines</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="text-sm space-y-2">
                    <p className="font-medium">Before filing:</p>
                    <ul className="list-disc list-inside space-y-1 text-gray-600">
                      <li>Ensure the issue is within barangay jurisdiction</li>
                      <li>Provide accurate and complete information</li>
                      <li>Include specific location details</li>
                      <li>Attach relevant evidence if available</li>
                    </ul>
                  </div>

                  <div className="text-sm space-y-2">
                    <p className="font-medium">Response time:</p>
                    <ul className="list-disc list-inside space-y-1 text-gray-600">
                      <li>High priority: 24-48 hours</li>
                      <li>Medium priority: 3-5 days</li>
                      <li>Low priority: 5-7 days</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>

              {/* Emergency Notice */}
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Emergency?</strong> For urgent matters requiring immediate attention, call our emergency
                  hotline: <strong>911</strong> or visit the nearest barangay hall.
                </AlertDescription>
              </Alert>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-4">
            <Link href="/resident/dashboard">
              <Button variant="outline">Cancel</Button>
            </Link>
            <Button type="submit" disabled={isSubmitting} className="bg-blue-600 hover:bg-blue-700">
              {isSubmitting ? "Submitting..." : "Submit Complaint"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
