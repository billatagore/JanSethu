import React, { useEffect, useState } from 'react'
import { analyticsAPI } from '../services/api'
import { BarChart, Bar, PieChart, Pie, Cell, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts'

export default function ImpactDashboard() {
  const [impact, setImpact] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadImpact()
  }, [])

  const loadImpact = async () => {
    try {
      const res = await analyticsAPI.getImpact()
      setImpact(res.data)
    } catch (error) {
      console.error('Failed to load impact:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div className="p-8">Loading...</div>

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Impact Dashboard</h1>

        {impact && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg card-shadow">
              <p className="text-gray-600">Problems Implemented</p>
              <p className="text-4xl font-bold text-green-600">{impact.problems_implemented}</p>
            </div>
            <div className="bg-white p-6 rounded-lg card-shadow">
              <p className="text-gray-600">Active Teams</p>
              <p className="text-4xl font-bold text-blue-600">{impact.active_teams}</p>
            </div>
            <div className="bg-white p-6 rounded-lg card-shadow">
              <p className="text-gray-600">Contributors</p>
              <p className="text-4xl font-bold text-purple-600">{impact.total_contributors}</p>
            </div>
            <div className="bg-white p-6 rounded-lg card-shadow">
              <p className="text-gray-600">People Impacted</p>
              <p className="text-4xl font-bold text-orange-600">{(impact.estimated_people_impacted).toLocaleString()}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
