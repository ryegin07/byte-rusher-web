"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, Calendar, MapPin, Users, Plus } from "lucide-react"

interface AnnouncementsProps {
  onNavigate: (page: string) => void
}

export function Announcements({ onNavigate }: AnnouncementsProps) {
  const [searchTerm, setSearchTerm] = useState("")

  const announcements = [
    {
      id: 1,
      title: "Community Clean-up Drive",
      content:
        "Join us this Saturday, January 20th, for our monthly community clean-up drive. Meeting point: Barangay Hall at 6:00 AM.",
      date: "2024-01-15",
      category: "Community Event",
      location: "Barangay Hall",
      priority: "High",
      author: "Barangay Captain",
    },
    {
      id: 2,
      title: "New Document Processing Hours",
      content: "Effective January 22nd, document processing hours will be extended until 6:00 PM on weekdays.",
      date: "2024-01-14",
      category: "Service Update",
      location: "All Offices",
      priority: "Medium",
      author: "Administrative Office",
    },
    {
      id: 3,
      title: "Senior Citizens Health Program",
      content: "Free health check-up for senior citizens. Schedule: January 25-26 at the Community Center.",
      date: "2024-01-12",
      category: "Health Program",
      location: "Community Center",
      priority: "High",
      author: "Health Committee",
    },
  ]

  const filteredAnnouncements = announcements.filter(
    (announcement) =>
      announcement.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      announcement.content.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "High":
        return "bg-red-100 text-red-800"
      case "Medium":
        return "bg-yellow-100 text-yellow-800"
      case "Low":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "Community Event":
        return "bg-blue-100 text-blue-800"
      case "Service Update":
        return "bg-purple-100 text-purple-800"
      case "Health Program":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Announcements</h1>
          <p className="text-gray-600 mt-2">Stay updated with the latest barangay news and events</p>
        </div>
        <Button className="flex items-center space-x-2">
          <Plus className="h-4 w-4" />
          <span>New Announcement</span>
        </Button>
      </div>

      {/* Search Bar */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search announcements..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Announcements List */}
      <div className="space-y-6">
        {filteredAnnouncements.map((announcement) => (
          <Card key={announcement.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <CardTitle className="text-xl mb-2">{announcement.title}</CardTitle>
                  <div className="flex flex-wrap gap-2 mb-3">
                    <Badge className={getCategoryColor(announcement.category)}>{announcement.category}</Badge>
                    <Badge className={getPriorityColor(announcement.priority)}>{announcement.priority} Priority</Badge>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 mb-4 leading-relaxed">{announcement.content}</p>

              <div className="grid md:grid-cols-3 gap-4 text-sm text-gray-600 mb-4">
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4" />
                  <span>Posted: {new Date(announcement.date).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <MapPin className="h-4 w-4" />
                  <span>{announcement.location}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Users className="h-4 w-4" />
                  <span>{announcement.author}</span>
                </div>
              </div>

              <div className="flex space-x-2">
                <Button variant="outline" size="sm">
                  Share
                </Button>
                <Button variant="outline" size="sm">
                  Save
                </Button>
                <Button variant="outline" size="sm">
                  Edit
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredAnnouncements.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <h3 className="text-lg font-medium text-gray-900 mb-2">No announcements found</h3>
            <p className="text-gray-600">
              {searchTerm ? "Try adjusting your search terms." : "No announcements available at the moment."}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
