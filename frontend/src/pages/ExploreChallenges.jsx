import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { problemsAPI, dataAPI } from '../services/api'
import { Search, Filter, MapPin, Zap, Users } from 'lucide-react'

export default function ExploreChallenges() {
  const [problems, setProblems] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    category: '',
    location: '',
    urgency: '',
    search: '',
  })

  useEffect(() => {
    loadProblems()
    loadCategories()
  }, [])

  useEffect(() => {
    loadProblems()
  }, [filters.category, filters.urgency])

  const loadProblems = async () => {
    try {
      const params = {}
      if (filters.category) params.category = filters.category
      if (filters.urgency) params.urgency = filters.urgency
      if (filters.location) params.location = filters.location

      const res = await problemsAPI.list(params)
      let data = res.data

      // Client-side search
      if (filters.search) {
        const search = filters.search.toLowerCase()
        data = data.filter(p =>
          p.title.toLowerCase().includes(search) ||
          p.description.toLowerCase().includes(search)
        )
      }

      setProblems(data)
    } catch (error) {
      console.error('Failed to load problems:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadCategories = async () => {
    try {
      const res = await dataAPI.getCategories()
      setCategories(res.data.categories)
    } catch (error) {
      console.error('Failed to load categories:', error)
    }
  }

  const handleFilterChange = (e) => {
    const { name, value } = e.target
    setFilters(prev => ({
      ...prev,
      [name]: value,
    }))
  }

  const getPriorityColor = (score) => {
    if (score >= 80) return 'text-red-600 bg-red-50'
    if (score >= 60) return 'text-orange-600 bg-orange-50'
    if (score >= 40) return 'text-yellow-600 bg-yellow-50'
    return 'text-green-600 bg-green-50'
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Explore Challenges</h1>
          <p className="text-gray-600">Discover real-world problems solving community</p>
        </div>

        {/* Filters */}
        <div className="bg-white p-6 rounded-lg card-shadow mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Filter size={20} className="text-blue-600" />
            <h2 className="text-lg font-semibold">Filters</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search */}
            <div>
              <label className="block text-sm font-semibold mb-2">Search</label>
              <div className="relative">
                <Search size={18} className="absolute left-3 top-2.5 text-gray-400" />
                <input
                  type="text"
                  name="search"
                  value={filters.search}
                  onChange={handleFilterChange}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg"
                  placeholder="Search problems..."
                />
              </div>
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-semibold mb-2">Category</label>
              <select
                name="category"
                value={filters.category}
                onChange={handleFilterChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              >
                <option value="">All Categories</option>
                {categories.map(cat => (
                  <option key={cat.name} value={cat.name}>
                    {cat.icon} {cat.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-semibold mb-2">Location</label>
              <input
                type="text"
                name="location"
                value={filters.location}
                onChange={handleFilterChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                placeholder="City or region..."
              />
            </div>

            {/* Urgency */}
            <div>
              <label className="block text-sm font-semibold mb-2">Urgency</label>
              <select
                name="urgency"
                value={filters.urgency}
                onChange={handleFilterChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              >
                <option value="">All Urgencies</option>
                <option value="critical">⚫ Critical</option>
                <option value="high">🔴 High</option>
                <option value="medium">🟡 Medium</option>
                <option value="low">🟢 Low</option>
              </select>
            </div>
          </div>
        </div>

        {/* Results */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-600">Loading challenges...</p>
          </div>
        ) : problems.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600">No challenges found. Try adjusting your filters.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {problems.map(problem => (
              <Link
                key={problem.id}
                to={`/problems/${problem.id}`}
                className="bg-white rounded-lg card-shadow hover:card-shadow-lg transition overflow-hidden"
              >
                <div className="p-6">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="text-lg font-bold mb-2">{problem.title}</h3>
                      <div className="flex gap-2 flex-wrap">
                        <span className="badge-secondary">{problem.category}</span>
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {problem.description}
                  </p>

                  {/* Info */}
                  <div className="space-y-2 mb-4 text-sm">
                    <div className="flex items-center gap-2 text-gray-600">
                      <MapPin size={16} />
                      <span>{problem.location}</span>
                    </div>
                    {problem.number_affected && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <Users size={16} />
                        <span>{problem.number_affected.toLocaleString()} people affected</span>
                      </div>
                    )}
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-4 border-t">
                    <div className={`px-3 py-1 rounded-full text-sm font-semibold ${getPriorityColor(problem.priority_score)}`}>
                      Priority: {problem.priority_score.toFixed(0)}
                    </div>
                    <span className={`badge ${{
                      critical: 'badge-danger',
                      high: 'badge-warning',
                      medium: 'badge-secondary',
                      low: 'badge-primary',
                    }[problem.urgency] || 'badge-secondary'}`}>
                      {problem.urgency}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
