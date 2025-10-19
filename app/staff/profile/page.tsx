"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { QRCodeGenerator } from "@/components/qr-code-generator"
import { toast } from "sonner"
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Shield,
  QrCode,
  Edit,
  Save,
  X,
  Download,
  Copy,
  Camera,
  Building,
  Award as IdCard,
} from "lucide-react"
import { Navbar } from "@/components/navbar"
import { useRouter } from "next/navigation"
import { apiFetch } from "@/lib/api"

interface StaffProfile {
  id: string
  name: string
  email: string
  phone: string
  address: string
  position: string
  department: string
  employeeId: string
  dateOfBirth: string
  hireDate: string
  emergencyContact: string
  emergencyPhone: string
  avatar?: string
}

export default function StaffProfilePage() {
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
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<StaffProfile | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [editedProfile, setEditedProfile] = useState<StaffProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Get current user from localStorage
    const currentUser = localStorage.getItem("currentUser")
    if (currentUser) {
      const userData = JSON.parse(currentUser)
      setUser(userData)

      // Mock profile data - in real app, fetch from API
      const mockProfile: StaffProfile = {
        id: userData.id || "STAFF-001",
        name: userData.name || "Juan Dela Cruz",
        email: userData.email || "juan.delacruz@manggahan.gov.ph",
        phone: "+63 912 345 6789",
        address: "456 Barangay Hall Street, Manggahan, Pasig City",
        position: userData.position || "Barangay Secretary",
        department: "Administrative Services",
        employeeId: userData.employeeId || `EMP-${userData.id || "001"}`,
        dateOfBirth: "1985-03-20",
        hireDate: "2020-06-15",
        emergencyContact: "Maria Dela Cruz",
        emergencyPhone: "+63 912 345 6788",
        avatar: userData.avatar,
      }

      setProfile(mockProfile)
      setEditedProfile(mockProfile)
    }
    setIsLoading(false)
  }, [])

  const handleEdit = () => {
    setIsEditing(true)
  }

  const handleSave = () => {
    if (editedProfile) {
      setProfile(editedProfile)
      // Update localStorage
      const updatedUser = { ...user, ...editedProfile }
      localStorage.setItem("currentUser", JSON.stringify(updatedUser))
      setUser(updatedUser)
      setIsEditing(false)
      toast.success("Profile updated successfully!")
    }
  }

  const handleCancel = () => {
    setEditedProfile(profile)
    setIsEditing(false)
  }

  const handleInputChange = (field: keyof StaffProfile, value: string) => {
    if (editedProfile) {
      setEditedProfile({ ...editedProfile, [field]: value })
    }
  }

  const copyQRCode = () => {
    if (profile) {
      navigator.clipboard.writeText(profile.employeeId)
      toast.success("Employee ID copied to clipboard!")
    }
  }

  const downloadQRCode = () => {
    const canvas = document.querySelector("canvas")
    if (canvas) {
      const link = document.createElement("a")
      link.download = `staff-qr-${profile?.employeeId}.png`
      link.href = canvas.toDataURL()
      link.click()
      toast.success("QR Code downloaded!")
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-yellow-50">
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    )
  }

  if (!user || !profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-yellow-50">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Profile Not Found</h2>
            <p className="text-gray-600">Please log in to view your profile.</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-yellow-50">
      <Navbar user={user} />

      <div className="pt-20 pb-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Staff Profile</h1>
            <p className="text-gray-600">Manage your staff information and view your unique employee QR code</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Profile Information */}
            <div className="lg:col-span-2 space-y-6">
              {/* Basic Information Card */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center space-x-2">
                      <User className="h-5 w-5 text-blue-600" />
                      <span>Personal Information</span>
                    </CardTitle>
                    <CardDescription>Your basic personal details</CardDescription>
                  </div>
                  <div className="flex space-x-2">
                    {isEditing ? (
                      <>
                        <Button onClick={handleSave} size="sm" className="bg-green-600 hover:bg-green-700">
                          <Save className="h-4 w-4 mr-1" />
                          Save
                        </Button>
                        <Button onClick={handleCancel} variant="outline" size="sm">
                          <X className="h-4 w-4 mr-1" />
                          Cancel
                        </Button>
                      </>
                    ) : (
                      <Button onClick={handleEdit} variant="outline" size="sm">
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Avatar Section */}
                  <div className="flex items-center space-x-4 mb-6">
                    <Avatar className="h-20 w-20">
                      <AvatarImage src={profile.avatar || "/placeholder.svg"} />
                      <AvatarFallback className="bg-gradient-to-br from-blue-500 to-yellow-500 text-white text-xl font-bold">
                        {profile.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{profile.name}</h3>
                      <p className="text-gray-600">Employee ID: {profile.employeeId}</p>
                      <Badge className="bg-yellow-100 text-yellow-800 border-0 mt-1">
                        <Shield className="h-3 w-3 mr-1" />
                        {profile.position}
                      </Badge>
                    </div>
                    {isEditing && (
                      <Button variant="outline" size="sm">
                        <Camera className="h-4 w-4 mr-1" />
                        Change Photo
                      </Button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Full Name</Label>
                      {isEditing ? (
                        <Input
                          id="name"
                          value={editedProfile?.name || ""}
                          onChange={(e) => handleInputChange("name", e.target.value)}
                        />
                      ) : (
                        <p className="mt-1 text-gray-900 font-medium">{profile.name}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="email">Email Address</Label>
                      {isEditing ? (
                        <Input
                          id="email"
                          type="email"
                          value={editedProfile?.email || ""}
                          onChange={(e) => handleInputChange("email", e.target.value)}
                        />
                      ) : (
                        <p className="mt-1 text-gray-900 font-medium flex items-center">
                          <Mail className="h-4 w-4 mr-2 text-gray-500" />
                          {profile.email}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="phone">Phone Number</Label>
                      {isEditing ? (
                        <Input
                          id="phone"
                          value={editedProfile?.phone || ""}
                          onChange={(e) => handleInputChange("phone", e.target.value)}
                        />
                      ) : (
                        <p className="mt-1 text-gray-900 font-medium flex items-center">
                          <Phone className="h-4 w-4 mr-2 text-gray-500" />
                          {profile.phone}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="dateOfBirth">Date of Birth</Label>
                      {isEditing ? (
                        <Input
                          id="dateOfBirth"
                          type="date"
                          value={editedProfile?.dateOfBirth || ""}
                          onChange={(e) => handleInputChange("dateOfBirth", e.target.value)}
                        />
                      ) : (
                        <p className="mt-1 text-gray-900 font-medium flex items-center">
                          <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                          {new Date(profile.dateOfBirth).toLocaleDateString()}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="position">Position</Label>
                      {isEditing ? (
                        <Input
                          id="position"
                          value={editedProfile?.position || ""}
                          onChange={(e) => handleInputChange("position", e.target.value)}
                        />
                      ) : (
                        <p className="mt-1 text-gray-900 font-medium flex items-center">
                          <IdCard className="h-4 w-4 mr-2 text-gray-500" />
                          {profile.position}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="department">Department</Label>
                      {isEditing ? (
                        <Input
                          id="department"
                          value={editedProfile?.department || ""}
                          onChange={(e) => handleInputChange("department", e.target.value)}
                        />
                      ) : (
                        <p className="mt-1 text-gray-900 font-medium flex items-center">
                          <Building className="h-4 w-4 mr-2 text-gray-500" />
                          {profile.department}
                        </p>
                      )}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="address">Address</Label>
                    {isEditing ? (
                      <Textarea
                        id="address"
                        value={editedProfile?.address || ""}
                        onChange={(e) => handleInputChange("address", e.target.value)}
                        rows={2}
                      />
                    ) : (
                      <p className="mt-1 text-gray-900 font-medium flex items-start">
                        <MapPin className="h-4 w-4 mr-2 text-gray-500 mt-0.5" />
                        {profile.address}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Emergency Contact Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Phone className="h-5 w-5 text-red-600" />
                    <span>Emergency Contact</span>
                  </CardTitle>
                  <CardDescription>Contact person in case of emergency</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="emergencyContact">Contact Name</Label>
                      {isEditing ? (
                        <Input
                          id="emergencyContact"
                          value={editedProfile?.emergencyContact || ""}
                          onChange={(e) => handleInputChange("emergencyContact", e.target.value)}
                        />
                      ) : (
                        <p className="mt-1 text-gray-900 font-medium">{profile.emergencyContact}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="emergencyPhone">Contact Phone</Label>
                      {isEditing ? (
                        <Input
                          id="emergencyPhone"
                          value={editedProfile?.emergencyPhone || ""}
                          onChange={(e) => handleInputChange("emergencyPhone", e.target.value)}
                        />
                      ) : (
                        <p className="mt-1 text-gray-900 font-medium">{profile.emergencyPhone}</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* QR Code and Additional Info */}
            <div className="space-y-6">
              {/* Unique QR Code Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <QrCode className="h-5 w-5 text-purple-600" />
                    <span>Your Staff QR Code</span>
                  </CardTitle>
                  <CardDescription>Use this QR code for staff identification and access</CardDescription>
                </CardHeader>
                <CardContent className="text-center space-y-4">
                  <div className="flex justify-center">
                    <QRCodeGenerator value={profile.employeeId} size={200} />
                  </div>

                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Employee ID</p>
                    <p className="font-mono text-lg font-bold text-gray-900">{profile.employeeId}</p>
                  </div>

                  <div className="flex space-x-2">
                    <Button onClick={copyQRCode} variant="outline" size="sm" className="flex-1 bg-transparent">
                      <Copy className="h-4 w-4 mr-1" />
                      Copy ID
                    </Button>
                    <Button onClick={downloadQRCode} variant="outline" size="sm" className="flex-1 bg-transparent">
                      <Download className="h-4 w-4 mr-1" />
                      Download
                    </Button>
                  </div>

                  <div className="text-xs text-gray-500 space-y-1">
                    <p>• Use for staff access control</p>
                    <p>• Quick identification at events</p>
                    <p>• Digital staff verification</p>
                  </div>
                </CardContent>
              </Card>

              {/* Employment Information Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Shield className="h-5 w-5 text-green-600" />
                    <span>Employment Information</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Position</span>
                    <Badge className="bg-blue-100 text-blue-800 border-0">{profile.position}</Badge>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Department</span>
                    <span className="text-sm font-medium text-gray-900">{profile.department}</span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Hire Date</span>
                    <span className="text-sm font-medium text-gray-900">
                      {new Date(profile.hireDate).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Status</span>
                    <Badge className="bg-green-100 text-green-800 border-0">
                      <Shield className="h-3 w-3 mr-1" />
                      Active
                    </Badge>
                  </div>

                  <Separator />

                  <div className="text-xs text-gray-500 space-y-1">
                    <p>• Full access to staff systems</p>
                    <p>• Authorized barangay representative</p>
                    <p>• Contact HR for any employment issues</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
