"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import {
  Bell,
  Shield,
  Palette,
  Eye,
  Lock,
  Download,
  Save,
  Smartphone,
  Mail,
  MessageSquare,
  Moon,
  Sun,
  Monitor,
  Key,
  AlertTriangle,
  Database,
  Users,
  FileText,
  Megaphone,
} from "lucide-react"
import { Navbar } from "@/components/navbar"
import { useRouter } from "next/navigation"
import { apiFetch } from "@/lib/api"

interface StaffSettings {
  notifications: {
    email: boolean
    sms: boolean
    push: boolean
    systemAlerts: boolean
    complaints: boolean
    documents: boolean
    announcements: boolean
    staffUpdates: boolean
  }
  privacy: {
    profileVisibility: "staff" | "public" | "private"
    showEmail: boolean
    showPhone: boolean
    showPosition: boolean
  }
  preferences: {
    theme: "light" | "dark" | "system"
    language: string
    timezone: string
    dateFormat: string
    dashboardLayout: "compact" | "detailed" | "cards"
  }
  security: {
    twoFactorEnabled: boolean
    loginAlerts: boolean
    sessionTimeout: number
    passwordChangeRequired: boolean
    requirePasswordChange: boolean
  }
  permissions: {
    canManageComplaints: boolean
    canProcessDocuments: boolean
    canCreateAnnouncements: boolean
    canViewAnalytics: boolean
    canManageUsers: boolean
  }
}

export default function StaffSettingsPage() {
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
  const [settings, setSettings] = useState<StaffSettings>({
    notifications: {
      email: true,
      sms: true,
      push: true,
      systemAlerts: true,
      complaints: true,
      documents: true,
      announcements: true,
      staffUpdates: true,
    },
    privacy: {
      profileVisibility: "staff",
      showEmail: true,
      showPhone: false,
      showPosition: true,
    },
    preferences: {
      theme: "system",
      language: "en",
      timezone: "Asia/Manila",
      dateFormat: "MM/DD/YYYY",
      dashboardLayout: "detailed",
    },
    security: {
      twoFactorEnabled: true,
      loginAlerts: true,
      sessionTimeout: 60,
      passwordChangeRequired: false,
      requirePasswordChange: true,
    },
    permissions: {
      canManageComplaints: true,
      canProcessDocuments: true,
      canCreateAnnouncements: false,
      canViewAnalytics: true,
      canManageUsers: false,
    },
  })
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    // Get current user from localStorage
    const currentUser = localStorage.getItem("currentUser")
    if (currentUser) {
      const userData = JSON.parse(currentUser)
      setUser(userData)

      // Load saved settings or use defaults
      const savedSettings = localStorage.getItem(`staff_settings_${userData.id}`)
      if (savedSettings) {
        setSettings(JSON.parse(savedSettings))
      }
    }
    setIsLoading(false)
  }, [])

  const handleSaveSettings = async () => {
    if (!user) return

    setIsSaving(true)
    try {
      // Save settings to localStorage
      localStorage.setItem(`staff_settings_${user.id}`, JSON.stringify(settings))

      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 1000))

      toast.success("Settings saved successfully!")
    } catch (error) {
      toast.error("Failed to save settings. Please try again.")
    } finally {
      setIsSaving(false)
    }
  }

  const handlePasswordChange = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error("Please fill in all password fields.")
      return
    }

    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match.")
      return
    }

    if (newPassword.length < 8) {
      toast.error("Password must be at least 8 characters long.")
      return
    }

    try {
      // Simulate password change
      await new Promise((resolve) => setTimeout(resolve, 1000))

      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
      toast.success("Password changed successfully!")
    } catch (error) {
      toast.error("Failed to change password. Please try again.")
    }
  }

  const handleExportData = () => {
    const userData = {
      profile: user,
      settings: settings,
      exportDate: new Date().toISOString(),
      type: "staff_data",
    }

    const dataStr = JSON.stringify(userData, null, 2)
    const dataBlob = new Blob([dataStr], { type: "application/json" })
    const url = URL.createObjectURL(dataBlob)

    const link = document.createElement("a")
    link.href = url
    link.download = `staff-data-${user?.id || "unknown"}.json`
    link.click()

    URL.revokeObjectURL(url)
    toast.success("Staff data exported successfully!")
  }

  const updateNotificationSetting = (key: keyof StaffSettings["notifications"], value: boolean) => {
    setSettings((prev) => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [key]: value,
      },
    }))
  }

  const updatePrivacySetting = (key: keyof StaffSettings["privacy"], value: any) => {
    setSettings((prev) => ({
      ...prev,
      privacy: {
        ...prev.privacy,
        [key]: value,
      },
    }))
  }

  const updatePreferenceSetting = (key: keyof StaffSettings["preferences"], value: string) => {
    setSettings((prev) => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        [key]: value,
      },
    }))
  }

  const updateSecuritySetting = (key: keyof StaffSettings["security"], value: any) => {
    setSettings((prev) => ({
      ...prev,
      security: {
        ...prev.security,
        [key]: value,
      },
    }))
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

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-yellow-50">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Settings Not Available</h2>
            <p className="text-gray-600">Please log in to access your settings.</p>
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
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Staff Settings</h1>
            <p className="text-gray-600">Manage your staff account preferences and system settings</p>
          </div>

          <div className="space-y-8">
            {/* Staff Permissions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Shield className="h-5 w-5 text-yellow-600" />
                  <span>System Permissions</span>
                </CardTitle>
                <CardDescription>Your current system access permissions (managed by administrator)</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <MessageSquare className="h-4 w-4 text-blue-500" />
                      <span className="text-sm font-medium">Manage Complaints</span>
                    </div>
                    <Badge
                      className={
                        settings.permissions.canManageComplaints
                          ? "bg-green-100 text-green-800 border-0"
                          : "bg-gray-100 text-gray-800 border-0"
                      }
                    >
                      {settings.permissions.canManageComplaints ? "Enabled" : "Disabled"}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <FileText className="h-4 w-4 text-green-500" />
                      <span className="text-sm font-medium">Process Documents</span>
                    </div>
                    <Badge
                      className={
                        settings.permissions.canProcessDocuments
                          ? "bg-green-100 text-green-800 border-0"
                          : "bg-gray-100 text-gray-800 border-0"
                      }
                    >
                      {settings.permissions.canProcessDocuments ? "Enabled" : "Disabled"}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Megaphone className="h-4 w-4 text-purple-500" />
                      <span className="text-sm font-medium">Create Announcements</span>
                    </div>
                    <Badge
                      className={
                        settings.permissions.canCreateAnnouncements
                          ? "bg-green-100 text-green-800 border-0"
                          : "bg-gray-100 text-gray-800 border-0"
                      }
                    >
                      {settings.permissions.canCreateAnnouncements ? "Enabled" : "Disabled"}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Users className="h-4 w-4 text-red-500" />
                      <span className="text-sm font-medium">Manage Users</span>
                    </div>
                    <Badge
                      className={
                        settings.permissions.canManageUsers
                          ? "bg-green-100 text-green-800 border-0"
                          : "bg-gray-100 text-gray-800 border-0"
                      }
                    >
                      {settings.permissions.canManageUsers ? "Enabled" : "Disabled"}
                    </Badge>
                  </div>
                </div>
                <div className="text-xs text-gray-500 mt-4">
                  <AlertTriangle className="h-3 w-3 inline mr-1" />
                  Permissions are managed by your system administrator. Contact them to request changes.
                </div>
              </CardContent>
            </Card>

            {/* Notifications Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Bell className="h-5 w-5 text-blue-600" />
                  <span>Notification Preferences</span>
                </CardTitle>
                <CardDescription>Choose how you want to receive staff notifications</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Notification Methods */}
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-3">Notification Methods</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Mail className="h-4 w-4 text-gray-500" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">Email Notifications</p>
                          <p className="text-xs text-gray-500">Receive notifications via email</p>
                        </div>
                      </div>
                      <Switch
                        checked={settings.notifications.email}
                        onCheckedChange={(checked) => updateNotificationSetting("email", checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <MessageSquare className="h-4 w-4 text-gray-500" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">SMS Notifications</p>
                          <p className="text-xs text-gray-500">Receive urgent notifications via SMS</p>
                        </div>
                      </div>
                      <Switch
                        checked={settings.notifications.sms}
                        onCheckedChange={(checked) => updateNotificationSetting("sms", checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Smartphone className="h-4 w-4 text-gray-500" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">Push Notifications</p>
                          <p className="text-xs text-gray-500">Receive push notifications on your device</p>
                        </div>
                      </div>
                      <Switch
                        checked={settings.notifications.push}
                        onCheckedChange={(checked) => updateNotificationSetting("push", checked)}
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Staff Notification Types */}
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-3">Staff Notification Types</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900">System Alerts</p>
                        <p className="text-xs text-gray-500">Critical system notifications and alerts</p>
                      </div>
                      <Switch
                        checked={settings.notifications.systemAlerts}
                        onCheckedChange={(checked) => updateNotificationSetting("systemAlerts", checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900">New Complaints</p>
                        <p className="text-xs text-gray-500">Notifications for new resident complaints</p>
                      </div>
                      <Switch
                        checked={settings.notifications.complaints}
                        onCheckedChange={(checked) => updateNotificationSetting("complaints", checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900">Document Requests</p>
                        <p className="text-xs text-gray-500">New document processing requests</p>
                      </div>
                      <Switch
                        checked={settings.notifications.documents}
                        onCheckedChange={(checked) => updateNotificationSetting("documents", checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900">Staff Updates</p>
                        <p className="text-xs text-gray-500">Internal staff communications and updates</p>
                      </div>
                      <Switch
                        checked={settings.notifications.staffUpdates}
                        onCheckedChange={(checked) => updateNotificationSetting("staffUpdates", checked)}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Privacy Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Eye className="h-5 w-5 text-green-600" />
                  <span>Privacy Settings</span>
                </CardTitle>
                <CardDescription>Control who can see your staff information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label htmlFor="profileVisibility" className="text-sm font-medium text-gray-900">
                    Profile Visibility
                  </Label>
                  <Select
                    value={settings.privacy.profileVisibility}
                    onValueChange={(value: "staff" | "public" | "private") =>
                      updatePrivacySetting("profileVisibility", value)
                    }
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="staff">Staff Only - Only other staff members</SelectItem>
                      <SelectItem value="public">Public - Everyone can see</SelectItem>
                      <SelectItem value="private">Private - Only you and administrators</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-gray-500 mt-1">Choose who can view your staff profile information</p>
                </div>

                <Separator />

                <div className="space-y-3">
                  <h4 className="text-sm font-medium text-gray-900">Professional Information Display</h4>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">Show Email Address</p>
                      <p className="text-xs text-gray-500">Display your email in your staff profile</p>
                    </div>
                    <Switch
                      checked={settings.privacy.showEmail}
                      onCheckedChange={(checked) => updatePrivacySetting("showEmail", checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">Show Phone Number</p>
                      <p className="text-xs text-gray-500">Display your phone number in your profile</p>
                    </div>
                    <Switch
                      checked={settings.privacy.showPhone}
                      onCheckedChange={(checked) => updatePrivacySetting("showPhone", checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">Show Position</p>
                      <p className="text-xs text-gray-500">Display your job position and department</p>
                    </div>
                    <Switch
                      checked={settings.privacy.showPosition}
                      onCheckedChange={(checked) => updatePrivacySetting("showPosition", checked)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Preferences */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Palette className="h-5 w-5 text-purple-600" />
                  <span>Preferences</span>
                </CardTitle>
                <CardDescription>Customize your staff dashboard experience</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="theme" className="text-sm font-medium text-gray-900">
                      Theme
                    </Label>
                    <Select
                      value={settings.preferences.theme}
                      onValueChange={(value) => updatePreferenceSetting("theme", value)}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="light">
                          <div className="flex items-center space-x-2">
                            <Sun className="h-4 w-4" />
                            <span>Light</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="dark">
                          <div className="flex items-center space-x-2">
                            <Moon className="h-4 w-4" />
                            <span>Dark</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="system">
                          <div className="flex items-center space-x-2">
                            <Monitor className="h-4 w-4" />
                            <span>System</span>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="language" className="text-sm font-medium text-gray-900">
                      Language
                    </Label>
                    <Select
                      value={settings.preferences.language}
                      onValueChange={(value) => updatePreferenceSetting("language", value)}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="fil">Filipino</SelectItem>
                        <SelectItem value="tl">Tagalog</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="timezone" className="text-sm font-medium text-gray-900">
                      Timezone
                    </Label>
                    <Select
                      value={settings.preferences.timezone}
                      onValueChange={(value) => updatePreferenceSetting("timezone", value)}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Asia/Manila">Asia/Manila (GMT+8)</SelectItem>
                        <SelectItem value="UTC">UTC (GMT+0)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="dateFormat" className="text-sm font-medium text-gray-900">
                      Date Format
                    </Label>
                    <Select
                      value={settings.preferences.dateFormat}
                      onValueChange={(value) => updatePreferenceSetting("dateFormat", value)}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                        <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                        <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="dashboardLayout" className="text-sm font-medium text-gray-900">
                    Dashboard Layout
                  </Label>
                  <Select
                    value={settings.preferences.dashboardLayout}
                    onValueChange={(value) => updatePreferenceSetting("dashboardLayout", value)}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="compact">Compact - Dense information display</SelectItem>
                      <SelectItem value="detailed">Detailed - Full information display</SelectItem>
                      <SelectItem value="cards">Cards - Card-based layout</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-gray-500 mt-1">Choose how information is displayed on your dashboard</p>
                </div>
              </CardContent>
            </Card>

            {/* Enhanced Security Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Shield className="h-5 w-5 text-red-600" />
                  <span>Security Settings</span>
                </CardTitle>
                <CardDescription>Enhanced security settings for staff accounts</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">Two-Factor Authentication</p>
                      <p className="text-xs text-gray-500">Required for all staff accounts</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={settings.security.twoFactorEnabled}
                        onCheckedChange={(checked) => updateSecuritySetting("twoFactorEnabled", checked)}
                        disabled={true}
                      />
                      <Badge className="bg-green-100 text-green-800 border-0">Required</Badge>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">Login Alerts</p>
                      <p className="text-xs text-gray-500">Get notified when someone logs into your account</p>
                    </div>
                    <Switch
                      checked={settings.security.loginAlerts}
                      onCheckedChange={(checked) => updateSecuritySetting("loginAlerts", checked)}
                    />
                  </div>

                  <div>
                    <Label htmlFor="sessionTimeout" className="text-sm font-medium text-gray-900">
                      Session Timeout (minutes)
                    </Label>
                    <Select
                      value={settings.security.sessionTimeout.toString()}
                      onValueChange={(value) => updateSecuritySetting("sessionTimeout", Number.parseInt(value))}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="30">30 minutes</SelectItem>
                        <SelectItem value="60">1 hour</SelectItem>
                        <SelectItem value="120">2 hours</SelectItem>
                        <SelectItem value="240">4 hours</SelectItem>
                        <SelectItem value="480">8 hours</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-gray-500 mt-1">Extended timeout options for staff accounts</p>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">Require Password Change</p>
                      <p className="text-xs text-gray-500">Require password change every 90 days</p>
                    </div>
                    <Switch
                      checked={settings.security.requirePasswordChange}
                      onCheckedChange={(checked) => updateSecuritySetting("requirePasswordChange", checked)}
                    />
                  </div>
                </div>

                <Separator />

                {/* Password Change */}
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center space-x-2">
                    <Key className="h-4 w-4" />
                    <span>Change Password</span>
                  </h4>
                  <div className="space-y-3">
                    <div>
                      <Label htmlFor="currentPassword">Current Password</Label>
                      <Input
                        id="currentPassword"
                        type="password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        placeholder="Enter your current password"
                      />
                    </div>
                    <div>
                      <Label htmlFor="newPassword">New Password</Label>
                      <Input
                        id="newPassword"
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Enter your new password (min. 8 characters)"
                      />
                    </div>
                    <div>
                      <Label htmlFor="confirmPassword">Confirm New Password</Label>
                      <Input
                        id="confirmPassword"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Confirm your new password"
                      />
                    </div>
                    <Button onClick={handlePasswordChange} variant="outline" size="sm">
                      <Lock className="h-4 w-4 mr-2" />
                      Change Password
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Data Management */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Database className="h-5 w-5 text-gray-600" />
                  <span>Data Management</span>
                </CardTitle>
                <CardDescription>Manage your professional data</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-gray-900">Export Your Data</p>
                    <p className="text-xs text-gray-500">Download a copy of your professional data</p>
                  </div>
                  <Button onClick={handleExportData} variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Export Data
                  </Button>
                </div>

                <div className="p-4 border border-yellow-200 rounded-lg bg-yellow-50">
                  <div className="flex items-start space-x-3">
                    <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-yellow-900">Staff Account Notice</p>
                      <p className="text-xs text-yellow-700 mt-1">
                        Staff accounts cannot be deleted by users. Contact your administrator for account management.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Save Button */}
            <div className="flex justify-end">
              <Button onClick={handleSaveSettings} disabled={isSaving} className="bg-blue-600 hover:bg-blue-700">
                {isSaving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Settings
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
