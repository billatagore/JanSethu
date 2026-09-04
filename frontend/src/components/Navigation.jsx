import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Menu, X, Bell, MessageSquare, LogOut, Home, Plus, Search, FileText } from 'lucide-react'

export default function Navigation() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = React.useState(false)

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 font-bold text-xl text-blue-600">
            <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center text-white font-bold">
              S
            </div>
            <span>Solutions Hub</span>
          </Link>

          {/* Navigation Links - Desktop */}
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/dashboard" className="text-gray-600 hover:text-blue-600 flex items-center space-x-1">
              <Home size={18} />
              <span>Dashboard</span>
            </Link>
            <Link to="/explore" className="text-gray-600 hover:text-blue-600 flex items-center space-x-1">
              <Search size={18} />
              <span>Explore</span>
            </Link>
            <Link to="/submit-problem" className="text-gray-600 hover:text-blue-600 flex items-center space-x-1">
              <Plus size={18} />
              <span>Submit</span>
            </Link>
            <Link to="/my-problems" className="text-gray-600 hover:text-blue-600 flex items-center space-x-1">
              <FileText size={18} />
              <span>My Problems</span>
            </Link>
          </div>

          {/* Right side - User menu */}
          <div className="hidden md:flex items-center space-x-4">
            <Link to="/notifications" className="text-gray-600 hover:text-blue-600">
              <Bell size={20} />
            </Link>
            <Link to="/messages" className="text-gray-600 hover:text-blue-600">
              <MessageSquare size={20} />
            </Link>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-500 rounded-full" />
              <span className="text-sm font-semibold">{user?.name}</span>
            </div>
            <button
              onClick={handleLogout}
              className="text-red-600 hover:text-red-700 flex items-center space-x-1"
            >
              <LogOut size={18} />
              <span>Logout</span>
            </button>
          </div>

          {/* Mobile menu toggle */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden text-gray-600"
          >
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {menuOpen && (
          <div className="md:hidden pb-4 border-t">
            <Link to="/dashboard" className="block py-2 text-gray-600 hover:text-blue-600">
              Dashboard
            </Link>
            <Link to="/explore" className="block py-2 text-gray-600 hover:text-blue-600">
              Explore
            </Link>
            <Link to="/submit-problem" className="block py-2 text-gray-600 hover:text-blue-600">
              Submit Problem
            </Link>
            <Link to="/my-problems" className="block py-2 text-gray-600 hover:text-blue-600">
              My Problems
            </Link>
            <Link to="/notifications" className="block py-2 text-gray-600 hover:text-blue-600">
              Notifications
            </Link>
            <Link to="/messages" className="block py-2 text-gray-600 hover:text-blue-600">
              Messages
            </Link>
            <button
              onClick={handleLogout}
              className="block w-full text-left py-2 text-red-600 hover:text-red-700"
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </nav>
  )
}
