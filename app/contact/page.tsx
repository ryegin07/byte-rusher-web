"use client"
import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Phone, Mail, MapPin, Clock, AlertTriangle, MessageSquare, FileText, Users, Bell, Shield, Building, Globe } from 'lucide-react'
import Link from "next/link"
import { createSubmission, apiFetch } from "@/lib/api"

export default function ContactPage() {
  const [isAuthed, setIsAuthed] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    category: "",
    message: "",
    urgent: false,
    status: "active",
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const me = await apiFetch('/auth/me');
        const ok = me && !me.error && (me.user || me.email || me.id);
        if (!cancelled) setIsAuthed(!!ok);
      } catch {
        if (!cancelled) setIsAuthed(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const [submitted, setSubmitted] = useState(false)

  const emergencyContacts = [
    {
      service: "Emergency Hotline",
      number: "911",
      description: "For life-threatening emergencies",
      available: "24/7",
      icon: AlertTriangle,
      color: "text-red-600",
      bgColor: "bg-red-50",
    },
    {
      service: "Barangay Emergency",
      number: "8-BARANGAY (8-227-2642)",
      description: "Local emergency response",
      available: "24/7",
      icon: Shield,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      service: "Fire Department",
      number: "116",
      description: "Fire and rescue services",
      available: "24/7",
      icon: AlertTriangle,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
    },
    {
      service: "Police Hotline",
      number: "117",
      description: "Police assistance",
      available: "24/7",
      icon: Shield,
      color: "text-indigo-600",
      bgColor: "bg-indigo-50",
    },
  ]

  const barangayHalls = [
    {
      name: "Napico Hall",
      address: "123 Napico Street, Barangay Manggahan, Pasig City",
      phone: "(02) 8641-1234",
      email: "napico@manggahan.gov.ph",
      hours: "Monday - Friday: 8:00 AM - 5:00 PM",
      services: ["Document Processing", "Complaint Resolution", "Community Services"],
      captain: "Hon. Maria Santos",
    },
    {
      name: "Greenpark Hall",
      address: "456 Greenpark Avenue, Barangay Manggahan, Pasig City",
      phone: "(02) 8641-5678",
      email: "greenpark@manggahan.gov.ph",
      hours: "Monday - Friday: 8:00 AM - 5:00 PM",
      services: ["Business Permits", "Certificates", "Blotter Reports"],
      captain: "Hon. Juan Dela Cruz",
    },
    {
      name: "Karangalan Hall",
      address: "789 Karangalan Road, Barangay Manggahan, Pasig City",
      phone: "(02) 8641-9012",
      email: "karangalan@manggahan.gov.ph",
      hours: "Monday - Friday: 8:00 AM - 5:00 PM",
      services: ["Health Services", "Social Services", "Senior Citizen Affairs"],
      captain: "Hon. Ana Rodriguez",
    },
    {
      name: "Manggahan Proper Hall",
      address: "321 Main Street, Barangay Manggahan, Pasig City",
      phone: "(02) 8641-3456",
      email: "proper@manggahan.gov.ph",
      hours: "Monday - Friday: 8:00 AM - 5:00 PM",
      services: ["General Services", "Youth Affairs", "Environmental Programs"],
      captain: "Hon. Carlos Mendoza",
    },
  ]

  const onlineServices = [
    {
      service: "File Complaints",
      description: "Report issues and concerns online",
      link: "/resident/complaints/new",
      icon: MessageSquare,
      color: "text-red-600",
    },
    {
      service: "Request Documents",
      description: "Apply for certificates and clearances",
      link: "/resident/documents/request",
      icon: FileText,
      color: "text-blue-600",
    },
    {
      service: "View Announcements",
      description: "Stay updated with community news",
      link: "/announcements",
      icon: Bell,
      color: "text-green-600",
    },
    {
      service: "Resident Portal",
      description: "Access your account and services",
      link: "/resident/dashboard",
      icon: Users,
      color: "text-purple-600",
    },
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
    await createSubmission({ ...(formData as any), submissionType: 'Inquiry' });
  } catch (err) {
    console.error(err);
    alert('Failed to submit. Please try again.');
  }

    setIsSubmitting(false)
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-2xl mx-auto px-4">
          <Card>
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail className="h-8 w-8 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Message Sent Successfully</h2>
              <p className="text-gray-600 mb-6">
                Thank you for contacting us. We'll get back to you within 24 hours.
              </p>
              <div className="flex space-x-4 justify-center">
                <Link href={isAuthed ? "/resident/dashboard" : "/"}>
                  <Button>Back to Home</Button>
                </Link>
                <Button variant="outline" onClick={() => setSubmitted(false)}>
                  Send Another Message
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Contact Us</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Get in touch with Barangay Manggahan. We're here to serve you and address your concerns.
          </p>
        </div>

        {/* Emergency Contacts */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-red-600">
              <AlertTriangle className="h-6 w-6" />
              <span>Emergency Contacts</span>
            </CardTitle>
            <CardDescription>For urgent matters requiring immediate attention</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              {emergencyContacts.map((contact, index) => {
                const Icon = contact.icon
                return (
                  <div key={index} className={`p-4 rounded-lg ${contact.bgColor}`}>
                    <div className="flex items-center space-x-3 mb-2">
                      <Icon className={`h-5 w-5 ${contact.color}`} />
                      <h4 className="font-semibold">{contact.service}</h4>
                    </div>
                    <p className={`text-2xl font-bold ${contact.color} mb-1`}>{contact.number}</p>
                    <p className="text-sm text-gray-600 mb-1">{contact.description}</p>
                    <Badge variant="outline" className="text-xs">
                      {contact.available}
                    </Badge>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Contact Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <MessageSquare className="h-5 w-5" />
                  <span>Send us a Message</span>
                </CardTitle>
                <CardDescription>We'll respond to your inquiry within 24 hours</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name *</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="0917-123-4567"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="category">Category</Label>
                      <Select
                        value={formData.category}
                        onValueChange={(value) => setFormData({ ...formData, category: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="general">General Inquiry</SelectItem>
                          <SelectItem value="complaint">Complaint</SelectItem>
                          <SelectItem value="document">Document Request</SelectItem>
                          <SelectItem value="service">Service Information</SelectItem>
                          <SelectItem value="feedback">Feedback</SelectItem>
                          <SelectItem value="technical">Technical Support</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="subject">Subject *</Label>
                    <Input
                      id="subject"
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      placeholder="Brief description of your inquiry"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message">Message *</Label>
                    <Textarea
                      id="message"
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      placeholder="Please provide detailed information about your inquiry..."
                      rows={6}
                      required
                    />
                  </div>

                  <Button type="submit" disabled={isSubmitting} className="w-full">
                    {isSubmitting ? "Sending..." : "Send Message"}
                  </Button>
              <Button asChild variant="outline" className="w-full mt-2">
                <Link href={isAuthed ? "/resident/dashboard" : "/"}>Back to Home</Link>
              </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Online Services */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Globe className="h-5 w-5" />
                  <span>Online Services</span>
                </CardTitle>
                <CardDescription>Access our digital services</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {onlineServices.map((service, index) => {
                  const Icon = service.icon
                  return (
                    <Link key={index} href={(!isAuthed && service.link === '/resident/dashboard') ? '/' : service.link}>
                      <div className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                        <Icon className={`h-5 w-5 ${service.color}`} />
                        <div>
                          <h4 className="font-medium">{service.service}</h4>
                          <p className="text-sm text-gray-600">{service.description}</p>
                        </div>
                      </div>
                    </Link>
                  )
                })}
              </CardContent>
            </Card>

            {/* Quick Info */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start space-x-3">
                  <Clock className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium">Office Hours</h4>
                    <p className="text-sm text-gray-600">Monday - Friday: 8:00 AM - 5:00 PM</p>
                    <p className="text-sm text-gray-600">Saturday: 8:00 AM - 12:00 PM</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <Phone className="h-5 w-5 text-green-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium">SMS Support</h4>
                    <p className="text-sm text-gray-600">Text HELP to 2366 for assistance</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <Mail className="h-5 w-5 text-purple-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium">Email Support</h4>
                    <p className="text-sm text-gray-600">info@manggahan.gov.ph</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Barangay Halls */}
        <div className="mt-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Our Barangay Halls</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {barangayHalls.map((hall, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Building className="h-5 w-5 text-blue-600" />
                    <span>{hall.name}</span>
                  </CardTitle>
                  <CardDescription>Captain: {hall.captain}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <MapPin className="h-4 w-4 text-gray-600 mt-1" />
                    <p className="text-sm text-gray-600">{hall.address}</p>
                  </div>

                  <div className="flex items-center space-x-3">
                    <Phone className="h-4 w-4 text-gray-600" />
                    <p className="text-sm text-gray-600">{hall.phone}</p>
                  </div>

                  <div className="flex items-center space-x-3">
                    <Mail className="h-4 w-4 text-gray-600" />
                    <p className="text-sm text-gray-600">{hall.email}</p>
                  </div>

                  <div className="flex items-center space-x-3">
                    <Clock className="h-4 w-4 text-gray-600" />
                    <p className="text-sm text-gray-600">{hall.hours}</p>
                  </div>

                  <Separator />

                  <div>
                    <h4 className="font-medium mb-2">Services Offered:</h4>
                    <div className="flex flex-wrap gap-1">
                      {hall.services.map((service, idx) => (
                        <Badge key={idx} variant="secondary" className="text-xs">
                          {service}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
