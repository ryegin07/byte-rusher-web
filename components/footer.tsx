import { Building, Phone, Mail, MapPin, Facebook, Twitter, Instagram, Youtube } from "lucide-react"
import Link from "next/link"

export function Footer() {
  const currentYear = new Date().getFullYear()

  const quickLinks = [
    { name: "Home", href: "/" },
    { name: "Announcements", href: "/announcements" },
    { name: "Services", href: "/services" },
    { name: "Contact", href: "/contact" },
    { name: "About", href: "/about" },
  ]

  const services = [
    { name: "File Complaint", href: "/resident/complaints/new" },
    { name: "Request Document", href: "/resident/documents/request" },
    { name: "Track Request", href: "/resident/dashboard" },
    { name: "Register Account", href: "/register" },
  ]

  const barangayHalls = [
    { name: "Napico Hall", phone: "(02) 8641-1234" },
    { name: "Greenpark Hall", phone: "(02) 8641-5678" },
    { name: "Karangalan Hall", phone: "(02) 8641-9012" },
    { name: "Manggahan Proper Hall", phone: "(02) 8641-3456" },
  ]

  return (
    <footer className="bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* About Section */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Building className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-bold">Barangay Manggahan</h3>
            </div>
            <p className="text-gray-300 text-sm leading-relaxed">
              Serving over 120,000 residents across four barangay halls with modern, efficient, and transparent digital
              services. Building stronger communities through technology.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-blue-400 transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-blue-400 transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-blue-400 transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-blue-400 transition-colors">
                <Youtube className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Quick Links</h3>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="text-gray-300 hover:text-white transition-colors text-sm">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Online Services</h3>
            <ul className="space-y-2">
              {services.map((service) => (
                <li key={service.name}>
                  <Link href={service.href} className="text-gray-300 hover:text-white transition-colors text-sm">
                    {service.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Contact Information</h3>
            <div className="space-y-3">
              <div className="flex items-start space-x-2">
                <MapPin className="h-4 w-4 text-gray-400 mt-0.5" />
                <div className="text-sm text-gray-300">
                  <p>Barangay Manggahan</p>
                  <p>Pasig City, Metro Manila</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="h-4 w-4 text-gray-400" />
                <a href="tel:+6286413456" className="text-sm text-gray-300 hover:text-white">
                  (02) 8641-3456
                </a>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="h-4 w-4 text-gray-400" />
                <a href="mailto:info@manggahan.gov.ph" className="text-sm text-gray-300 hover:text-white">
                  info@manggahan.gov.ph
                </a>
              </div>
            </div>

            {/* Emergency Hotline */}
            <div className="bg-red-900 bg-opacity-50 p-3 rounded-lg">
              <p className="text-sm font-semibold text-red-200 mb-1">Emergency Hotline</p>
              <a href="tel:86414357" className="text-lg font-bold text-red-100 hover:text-white">
                8641-HELP (4357)
              </a>
              <p className="text-xs text-red-200">Available 24/7</p>
            </div>
          </div>
        </div>

        {/* Barangay Halls */}
        <div className="border-t border-gray-800 mt-8 pt-8">
          <h3 className="text-lg font-semibold mb-4">Our Four Barangay Halls</h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {barangayHalls.map((hall) => (
              <div key={hall.name} className="bg-gray-800 p-3 rounded-lg">
                <h4 className="font-medium text-sm mb-1">{hall.name}</h4>
                <a href={`tel:${hall.phone}`} className="text-xs text-gray-300 hover:text-white">
                  {hall.phone}
                </a>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <div className="text-sm text-gray-400 mb-4 md:mb-0">
            <p>&copy; {currentYear} Barangay Manggahan. All rights reserved.</p>
            <p className="mt-1">
              Powered by <span className="text-blue-400 font-medium">Ugnayan sa Manggahan</span> - Digital Barangay
              Management System
            </p>
          </div>
          <div className="flex space-x-6 text-sm">
            <Link href="/privacy" className="text-gray-400 hover:text-white transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="text-gray-400 hover:text-white transition-colors">
              Terms of Service
            </Link>
            <Link href="/accessibility" className="text-gray-400 hover:text-white transition-colors">
              Accessibility
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
