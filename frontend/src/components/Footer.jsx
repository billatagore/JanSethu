import React from 'react'
import { Link } from 'react-router-dom'
import { Facebook, Twitter, Linkedin, Mail } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* About */}
          <div>
            <h3 className="text-white font-bold mb-4">About Us</h3>
            <p className="text-sm">
              Societal Solutions Hub connects communities, students, and innovators to solve real-world challenges.
            </p>
          </div>

          {/* Links */}
          <div>
            <h3 className="text-white font-bold mb-4">Resources</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/" className="hover:text-white">Home</Link></li>
              <li><Link to="/about" className="hover:text-white">About</Link></li>
              <li><Link to="/how-it-works" className="hover:text-white">How It Works</Link></li>
              <li><Link to="/explore" className="hover:text-white">Explore</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-bold mb-4">Contact</h3>
            <div className="space-y-2 text-sm">
              <p>Email: info@hub.solutions</p>
              <p>Phone: +91-xxxx-xxx-xxx</p>
            </div>
          </div>

          {/* Social */}
          <div>
            <h3 className="text-white font-bold mb-4">Follow Us</h3>
            <div className="flex space-x-4">
              <Facebook className="cursor-pointer hover:text-white" size={20} />
              <Twitter className="cursor-pointer hover:text-white" size={20} />
              <Linkedin className="cursor-pointer hover:text-white" size={20} />
              <Mail className="cursor-pointer hover:text-white" size={20} />
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm">
          <p>&copy; 2024 Societal Solutions Hub. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
