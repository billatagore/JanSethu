import React, { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { analyticsAPI } from '../services/api'
import { Link } from 'react-router-dom'
import { TrendingUp, Users, Zap, BarChart3, Plus, Map, Building2, GraduationCap } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { getRoleDashboardConfig } from '../utils/dashboardConfig'

export default function Dashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const variant = getRoleDashboardConfig(user?.role)

  useEffect(() => {
    loadDashboard()
  }, [])

  const loadDashboard = async () => {
    try {
      const res = await analyticsAPI.getDashboard()
      setStats(res.data)
    } catch (error) {
      console.error('Failed to load dashboard:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl text-gray-600">Loading dashboard...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:justify-between lg:items-center">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-blue-600">{variant.focusLabel}</p>
            <h1 className="text-4xl font-bold mb-2 mt-2">{variant.title}</h1>
            <p className="text-gray-600">Welcome, {user?.name}. {variant.subtitle}</p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link to="/map" className="btn-primary px-6 py-3 flex items-center gap-2">
              <Map size={18} />
              {variant.primaryAction}
            </Link>
            <Link to="/submit-problem" className="btn-secondary px-6 py-3 flex items-center gap-2">
              <Plus size={20} />
              Submit Challenge
            </Link>
          </div>
        </div>

        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg card-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 mb-2">{variant.cards[0].label}</p>
                  <p className="text-3xl font-bold text-blue-600">{stats.total_problems}</p>
                </div>
                <BarChart3 size={40} className="text-blue-100" />
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg card-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 mb-2">{variant.cards[1].label}</p>
                  <p className="text-3xl font-bold text-green-600">{stats.total_teams}</p>
                </div>
                <Users size={40} className="text-green-100" />
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg card-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 mb-2">{variant.cards[2].label}</p>
                  <p className="text-3xl font-bold text-purple-600">{stats.total_solutions}</p>
                </div>
                <Zap size={40} className="text-purple-100" />
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg card-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 mb-2">{variant.cards[3].label}</p>
                  <p className="text-3xl font-bold text-orange-600">{stats.total_users}</p>
                </div>
                <TrendingUp size={40} className="text-orange-100" />
              </div>
            </div>
          </div>
        )}

        {stats && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <div className="bg-white p-6 rounded-lg card-shadow">
              <h3 className="text-xl font-bold mb-4">Problems by Category</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={stats.problems_by_category}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="category" angle={-45} textAnchor="end" height={80} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white p-6 rounded-lg card-shadow">
              <h3 className="text-xl font-bold mb-4">Issue Status</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={stats.problems_by_status}
                    dataKey="count"
                    nameKey="status"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                  >
                    {stats.problems_by_status.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'][index % 5]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {stats && stats.top_problems && (
          <div className="bg-white p-6 rounded-lg card-shadow">
            <h3 className="text-xl font-bold mb-4">Priority issues near your region</h3>
            <div className="space-y-4">
              {stats.top_problems.slice(0, 5).map((problem) => (
                <Link
                  key={problem.id}
                  to={`/problems/${problem.id}`}
                  className="flex items-center justify-between p-4 border-l-4 border-blue-500 hover:bg-blue-50 transition rounded"
                >
                  <div>
                    <p className="font-semibold">{problem.title}</p>
                    <p className="text-sm text-gray-600">Priority Score: {problem.priority_score}</p>
                  </div>
                  <div className="text-right">
                    <div className="inline-block bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-semibold">
                      {problem.priority_score}%
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
