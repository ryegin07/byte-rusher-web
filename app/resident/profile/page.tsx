"use client"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { QRCodeGenerator } from "@/components/qr-code-generator"
import { toast } from "sonner"
import { apiFetch } from "@/lib/api"
import {
  User as UserIcon,
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
  Bell
} from "lucide-react"
import { Navbar } from "@/components/navbar"

interface ResidentProfile {
  id?: string
  email?: string
  fullName?: string
  firstName?: string
  lastName?: string
  phone?: string
  occupation?: string
  address?: string
  houseNumber?: string
  street?: string
  purok?: string
  barangayHall?: string
  hall?: string
  birthDate?: string
  civilStatus?: string
  emergencyContact?: string
  emergencyPhone?: string
  registrationDate?: string
  residentId?: string
  avatar?: string
  middleName?: string
  emailVerified?: boolean
  enableSMSNotif?: boolean
  enableEmailNotif?: boolean
}


export default function ProfilePage() {
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<ResidentProfile | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [editedProfile, setEditedProfile] = useState<ResidentProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const router = useRouter()
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

  // Load current user & profile from API
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const me = await apiFetch('/auth/me');
        if (!me?.authenticated) { setIsLoading(false); return; }
        setUser({
          ...me.user,
          name: `${me.user.firstName} ${me.user.lastName}`,
          address: `${me.user.houseNumber}, ${me.user.street}, ${me.user.purok} ${me.user.barangayHall}`,
          hall: me.user.barangayHall,
          registrationDate: me.user.createdAt,
        });
        try {
          const prof = await apiFetch('/users/me');
          if (!cancelled && prof?.authenticated && prof.user) {
            setProfile({
              ...prof.user,
              name: `${prof.user.firstName} ${prof.user.lastName}`,
              address: `${prof.user.houseNumber}, ${prof.user.street}, ${prof.user.purok} ${prof.user.barangayHall}`,
              hall: prof.user.barangayHall,
              registrationDate: prof.user.createdAt,
            });
            setEditedProfile({
              ...prof.user,
              name: `${prof.user.firstName} ${prof.user.lastName}`,
              address: `${prof.user.houseNumber}, ${prof.user.street}, ${prof.user.purok} ${prof.user.barangayHall}`,
              hall: prof.user.barangayHall,
              registrationDate: prof.user.createdAt,
            });
          }
        } catch { /* ignore */ }
      } catch { /* ignore */ }
      finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => { cancelled = true };
  }, []);

  const handleEdit = () => setIsEditing(true)

  const handleSave = async () => {
    if (!editedProfile) return;
    // Client-side required validation
    const requiredFields = {
      firstName: editedProfile.firstName,
      lastName: editedProfile.lastName,
      email: editedProfile.email,
      phone: editedProfile.phone,
      civilStatus: editedProfile.civilStatus,
      purok: editedProfile.purok,
      barangayHall: editedProfile.barangayHall,
      houseNumber: editedProfile.houseNumber,
      street: editedProfile.street,
    } as Record<string, any>;
    for (const [k,v] of Object.entries(requiredFields)) {
      if (!v || String(v).trim() === '') { toast.error(`Please complete the required field: ${k}`); return; }
    }
    if (!editedProfile) return;
    try {
      const payload = {
        middleName: editedProfile.middleName,
        email: editedProfile.email,
        firstName: editedProfile.firstName,
        lastName: editedProfile.lastName,
        phone: editedProfile.phone,
        occupation: editedProfile.occupation,
        houseNumber: editedProfile.houseNumber,
        street: editedProfile.street,
        purok: editedProfile.purok,
        barangayHall: editedProfile.barangayHall,
        civilStatus: editedProfile.civilStatus,
        birthDate: editedProfile.birthDate,
        emergencyContact: editedProfile.emergencyContact,
        emergencyPhone: editedProfile.emergencyPhone,
        enableSMSNotif: editedProfile.enableSMSNotif,
        enableEmailNotif: editedProfile.enableEmailNotif,
      };
      const res = await apiFetch('/users/me', {
        method: 'PATCH',
        body: JSON.stringify(payload),
      });
      if (res?.ok) {
        setProfile(prev => ({ ...prev, ...res.user }));
        setEditedProfile(prev => ({ ...(prev || {}), ...res.user }));
        setUser((u: any) => ({ ...u, ...res.user }));
        setIsEditing(false);
        if (res.emailVerificationSent) toast.message('Verification required', { description: 'We sent a verification link to your new email.' });
        toast.success('Profile updated successfully!');
      } else {
        toast.error(res?.message || 'Unable to save changes');
      }
    } catch {
      toast.error('Failed to save changes');
    }
  }

  const handleCancel = () => {
    setEditedProfile(profile)
    setIsEditing(false)
  }

  const handleInputChange = (field: keyof ResidentProfile, value: string | boolean) => {
    setEditedProfile(prev => ({ ...(prev || {}), [field]: value }))
  }

  const copyQRCode = () => {
    if (profile?.residentId) {
      navigator.clipboard.writeText(profile.residentId)
      toast.success("Resident ID copied to clipboard!")
    }
  }

  const downloadQRCode = () => {
    const canvas = document.querySelector("canvas")
    if (canvas) {
      const link = document.createElement("a")
      link.download = `resident-qr-${profile?.residentId || "id"}.png`
      link.href = (canvas as HTMLCanvasElement).toDataURL()
      link.click()
      toast.success("QR Code downloaded!")
    }
  }

  // Safe initials for avatar (no .split on undefined)
  const initials = (() => {
    const rawName = typeof profile?.fullName === 'string' ? profile.fullName.trim() : ''
    const hasEmail = typeof profile?.email === 'string' && profile.email.includes('@')
    const fallback = hasEmail ? profile!.email!.slice(0, profile!.email!.indexOf('@')) : 'U'
    const source = rawName || fallback
    const parts = source ? source.split(/\s+/).filter(Boolean) : []
    const letters = (parts.length ? parts.slice(0, 2) : [source]).map(p => (p?.[0] || '')).join('')
    return (letters || 'U').toUpperCase()
  })()

  const fmtDate = (iso?: string) => {
    if (!iso) return "—"
    const d = new Date(iso)
    return isNaN(d.getTime()) ? "—" : d.toLocaleDateString()
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
            <h1 className="text-3xl font-bold text-gray-900 mb-2">My Profile</h1>
            <p className="text-gray-600">Manage your personal information and view your unique resident QR code</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Profile Information */}
            <div className="lg:col-span-2 space-y-6">
              {/* Basic Information Card */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center space-x-2">
                      <UserIcon className="h-5 w-5 text-blue-600" />
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
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {(profile.fullName || `${profile.firstName || ''} ${profile.lastName || ''}` || profile.fullName || profile.email || 'Resident').toString().trim()}
                      </h3>
                      <p className="text-gray-600">Resident ID: {profile.residentId || "—"}</p>
                      <Badge className="bg-blue-100 text-blue-800 border-0 mt-1">
                        <Shield className="h-3 w-3 mr-1" />
                        Verified Resident
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
                          value={editedProfile?.fullName || ""}
                          onChange={(e) => handleInputChange("fullName", e.target.value)}
                          disabled
                        />
                      ) : (
                        <p className="mt-1 text-gray-900 font-medium">{profile.fullName || "—"}</p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="firstName">First Name</Label>
                      {isEditing ? (
                        <Input id="firstName" value={editedProfile?.firstName || ""} onChange={(e) => handleInputChange("firstName", e.target.value)} required/>
                      ) : (
                        <p className="mt-1 text-gray-900 font-medium">{profile.firstName || "—"}</p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="middleName">Middle Name</Label>
                      {isEditing ? (
                        <Input id="middleName" value={editedProfile?.middleName || ""} onChange={(e)=>handleInputChange("middleName", e.target.value)} />
                      ) : (
                        <p className="mt-1 text-gray-900 font-medium">{profile.middleName || "—"}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="lastName">Last Name</Label>
                      {isEditing ? (
                        <Input id="lastName" value={editedProfile?.lastName || ""} onChange={(e) => handleInputChange("lastName", e.target.value)} required/>
                      ) : (
                        <p className="mt-1 text-gray-900 font-medium">{profile.lastName || "—"}</p>
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
                          required
                        />
                      ) : (
                        <p className="mt-1 text-gray-900 font-medium flex items-center">
                          <Mail className="h-4 w-4 mr-2 text-gray-500" />
                          {profile.email || "—"}
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
                          required
                        />
                      ) : (
                        <p className="mt-1 text-gray-900 font-medium flex items-center">
                          <Phone className="h-4 w-4 mr-2 text-gray-500" />
                          {profile.phone || "—"}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="birthDate">Date of Birth</Label>
                      {isEditing ? (
                        <Input
                          id="birthDate"
                          type="date"
                          value={editedProfile?.birthDate || ""}
                          onChange={(e) => handleInputChange("birthDate", e.target.value)}
                          required
                        />
                      ) : (
                        <p className="mt-1 text-gray-900 font-medium flex items-center">
                          <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                          {fmtDate(profile.birthDate)}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="civilStatus">Civil Status</Label>
                      {isEditing ? (
                        <Select value={editedProfile?.civilStatus || ""} onValueChange={(value)=>handleInputChange("civilStatus", value)} required>
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="single">Single</SelectItem>
                            <SelectItem value="married">Married</SelectItem>
                            <SelectItem value="divorced">Divorced</SelectItem>
                            <SelectItem value="widowed">Widowed</SelectItem>
                          </SelectContent>
                        </Select>
                      ) : (
                        <p className="mt-1 text-gray-900 font-medium">{profile.civilStatus || "—"}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="occupation">Occupation</Label>
                      {isEditing ? (
                        <Input
                          id="occupation"
                          value={editedProfile?.occupation || ""}
                          onChange={(e) => handleInputChange("occupation", e.target.value)}
                        />
                      ) : (
                        <p className="mt-1 text-gray-900 font-medium">{profile.occupation || "—"}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="address">Address</Label>
                    {isEditing ? (
                      <Textarea id="address" value={(editedProfile?.address || "").toString()} disabled rows={2} />
                    ) : (
                      <p className="mt-1 text-gray-900 font-medium flex items-start">
                        <MapPin className="h-4 w-4 mr-2 text-gray-500 mt-0.5" />
                        {profile.address || "—"}
                      </p>
                    )}

                    {isEditing && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                        <div>
                          <Label htmlFor="houseNumber">House Number</Label>
                          <Input id="houseNumber" value={editedProfile?.houseNumber || ""} onChange={(e) => handleInputChange("houseNumber", e.target.value)} required/>
                        </div>
                        <div>
                          <Label htmlFor="street">Street</Label>
                          <Input id="street" value={editedProfile?.street || ""} onChange={(e) => handleInputChange("street", e.target.value)} required/>
                        </div>
                        <div>
                          <Label htmlFor="purok">Purok</Label>
                          <Select value={editedProfile?.purok || ""} onValueChange={(value)=>handleInputChange("purok", value)} required>
                          <SelectTrigger>
                            <SelectValue placeholder="Select purok" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="purok-1">Purok 1</SelectItem>
                            <SelectItem value="purok-2">Purok 2</SelectItem>
                            <SelectItem value="purok-3">Purok 3</SelectItem>
                            <SelectItem value="purok-4">Purok 4</SelectItem>
                            <SelectItem value="purok-5">Purok 5</SelectItem>
                          </SelectContent>
                        </Select>
                        </div>
                        <div>
                          <Label htmlFor="barangayHall">Barangay Hall</Label>
                          <Select value={editedProfile?.barangayHall || ""} onValueChange={(value)=>handleInputChange("barangayHall", value)} required>
                          <SelectTrigger>
                            <SelectValue placeholder="Select purok" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="napico">Napico Hall</SelectItem>
                            <SelectItem value="greenpark">Greenpark Hall</SelectItem>
                            <SelectItem value="karangalan">Karangalan Hall</SelectItem>
                            <SelectItem value="manggahan-proper">Manggahan Proper Hall</SelectItem>
                          </SelectContent>
                        </Select>
                        </div>
                      </div>
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
                        <p className="mt-1 text-gray-900 font-medium">{profile.emergencyContact || "—"}</p>
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
                        <p className="mt-1 text-gray-900 font-medium">{profile.emergencyPhone || "—"}</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Notification Settings Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Bell className="h-5 w-5 text-red-600" />
                    <span>Notification Settings</span>
                  </CardTitle>
                  <CardDescription>Manage your notification preferences</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="enableEmailNotif">Email Notifications</Label>
                      {isEditing ? (
                        <Input
                          id="enableEmailNotif"
                          type="checkbox"
                          checked={editedProfile?.enableEmailNotif || false}
                          onChange={(e) => handleInputChange("enableEmailNotif", e.target.checked)}
                        />
                      ) : (
                        <p className="mt-1 text-gray-900 font-medium">{profile.enableEmailNotif ? "Enabled" : "Disabled"}</p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="enableSMSNotif">SMS Notifications</Label>
                      {isEditing ? (
                        <Input
                          id="enableSMSNotif"
                          type="checkbox"
                          checked={editedProfile?.enableSMSNotif || false}
                          onChange={(e) => handleInputChange("enableSMSNotif", e.target.checked)}
                        />
                      ) : (
                        <p className="mt-1 text-gray-900 font-medium">{profile.enableSMSNotif ? "Enabled" : "Disabled"}</p>
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
                    <span>Your Unique QR Code</span>
                  </CardTitle>
                  <CardDescription>Use this QR code for quick identification and services</CardDescription>
                </CardHeader>
                <CardContent className="text-center space-y-4">
                  <div className="flex justify-center">
                    <QRCodeGenerator value={profile.residentId || user?.id || user?.email || "RESIDENT"} size={200} />
                  </div>

                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Resident ID</p>
                    <p className="font-mono text-lg font-bold text-gray-900">{profile.residentId || "—"}</p>
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
                    <p>• Show this QR code when requesting services</p>
                    <p>• Use for document verification</p>
                    <p>• Quick identification at barangay events</p>
                  </div>
                </CardContent>
              </Card>

              {/* Account Information Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Shield className="h-5 w-5 text-green-600" />
                    <span>Account Information</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Hall Assignment</span>
                    <Badge className="bg-blue-100 text-blue-800 border-0">{profile.hall || "—"}</Badge>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Registration Date</span>
                    <span className="text-sm font-medium text-gray-900">
                      {fmtDate(profile.registrationDate)}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Account Status</span>
                    {profile.emailVerified ? (
                      <Badge className="bg-green-100 text-green-800 border-0">
                        <Shield className="h-3 w-3 mr-1" />
                        Verified
                      </Badge>
                    ) : (
                      <Badge className="bg-red-100 text-red-800 border-0">
                        <Shield className="h-3 w-3 mr-1" />
                        Not Verified
                      </Badge>
                    )}
                  </div>

                  <Separator />

                  <div className="text-xs text-gray-500 space-y-1">
                    {profile.emailVerified ? (
                      <>
                        <p>• Your account is verified and active</p>
                        <p>• All services are available to you</p>
                      </>
                    ) : (
                      <>
                        <p>• Your email is not verified yet</p>
                        <p>• Some services may be limited until verification</p>
                      </>
                    )}
                    <p>• Contact barangay office for any issues</p>
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
