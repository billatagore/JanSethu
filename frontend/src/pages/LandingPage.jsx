import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronRight, TrendingUp, Users, Zap, BarChart3 } from 'lucide-react'
import { analyticsAPI, dataAPI } from '../services/api'
import { useAuth } from '../context/AuthContext'

export default function LandingPage() {
  const { user, token } = useAuth()
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (token) {
      loadStats()
    } else {
      setLoading(false)
    }
  }, [token])

  const loadStats = async () => {
    try {
      const res = await analyticsAPI.getDashboard()
      setStats(res.data)
    } catch (error) {
      console.error('Failed to load stats:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full">
      {/* Hero Section */}
      <section className="gradient-primary text-white py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
            Real Problems. <br />
            Collective Intelligence. <br />
            Real Solutions.
          </h1>
          <p className="text-xl mb-12 text-blue-100 max-w-2xl mx-auto">
            Connect communities, students, researchers and industries to solve the challenges that matter.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link
              to={token ? '/submit-problem' : '/register'}
              className="btn-primary bg-white text-blue-600 hover:bg-blue-50 px-8 py-3 rounded-lg font-bold flex items-center gap-2"
            >
              <span>Submit a Challenge</span>
              <ChevronRight size={20} />
            </Link>
            <Link
              to="/explore"
              className="btn-outline border-white text-white hover:bg-white/10 px-8 py-3 rounded-lg font-bold"
            >
              Explore Challenges
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      {stats && (
        <section className="bg-gray-100 py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="bg-white p-6 rounded-lg card-shadow text-center">
                <div className="text-4xl font-bold text-blue-600">{stats.total_problems || 0}</div>
                <p className="text-gray-600 mt-2">Problems Submitted</p>
              </div>
              <div className="bg-white p-6 rounded-lg card-shadow text-center">
                <div className="text-4xl font-bold text-green-600">{stats.total_solutions || 0}</div>
                <p className="text-gray-600 mt-2">Solutions Proposed</p>
              </div>
              <div className="bg-white p-6 rounded-lg card-shadow text-center">
                <div className="text-4xl font-bold text-purple-600">{stats.total_teams || 0}</div>
                <p className="text-gray-600 mt-2">Active Teams</p>
              </div>
              <div className="bg-white p-6 rounded-lg card-shadow text-center">
                <div className="text-4xl font-bold text-orange-600">{stats.total_users || 0}</div>
                <p className="text-gray-600 mt-2">Active Solvers</p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* How It Works */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-12">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              { icon: '1️', title: 'Submit', desc: 'Share real-world problems' },
              { icon: '2️', title: 'Analyze', desc: 'AI analyzes and prioritizes' },
              { icon: '3️', title: 'Match', desc: 'Connect with skilled solvers' },
              { icon: '4️', title: 'Build', desc: 'Collaborate on solutions' },
            ].map((step, idx) => (
              <div key={idx} className="text-center">
                <div className="text-6xl mb-4">{step.icon}</div>
                <h3 className="text-xl font-bold mb-2">{step.title}</h3>
                <p className="text-gray-600">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Challenges */}
      <section className="bg-gradient-to-b from-blue-50 to-white py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-12">Featured Challenges</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { title: 'Biomedical Waste', category: 'Waste', priority: 'Critical' },
              { title: 'Rural Water Access', category: 'Water', priority: 'High' },
              { title: 'Women Safety', category: 'Safety', priority: 'Critical' },
            ].map((challenge, idx) => (
              <div key={idx} className="bg-white p-6 rounded-lg card-shadow hover:card-shadow-lg transition">
                <div className="flex items-center justify-between mb-3">
                  <span className="badge-secondary">{challenge.category}</span>
                  <span className={`badge badge-${challenge.priority.toLowerCase()}`}>
                    {challenge.priority}
                  </span>
                </div>
                <h3 className="text-xl font-bold mb-3">{challenge.title}</h3>
                <Link to="/explore" className="text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-2">
                  Learn More <ChevronRight size={18} />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gray-900 text-white py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6">Ready to Make an Impact?</h2>
          <p className="text-xl mb-8 text-gray-300">
            Whether you're facing a challenge or ready to solve one, join thousands on the platform.
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              to={token ? '/submit-problem' : '/register'}
              className="btn-primary bg-white text-gray-900 hover:bg-gray-100 px-8 py-3"
            >
              Get Started
            </Link>
            <Link
              to="/about"
              className="btn-outline border-white text-white hover:bg-white/10 px-8 py-3"
            >
              Learn More
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
