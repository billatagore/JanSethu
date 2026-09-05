import React, { useEffect, useMemo, useRef, useState } from 'react'
import { MapPin, Filter, Building2, GraduationCap, Factory, Users, Search, Landmark, ArrowRight } from 'lucide-react'
import { problemsAPI } from '../services/api'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import L from 'leaflet'

const defaultCenter = { lat: 20.5937, lng: 78.9629 }

function getUrgencyColor(urgency) {
  if (urgency === 'critical') return '#ef4444'
  if (urgency === 'high') return '#f97316'
  if (urgency === 'medium') return '#facc15'
  return '#22c55e'
}

function getMarkerIcon(urgency) {
  return L.divIcon({
    className: 'map-pin-wrapper',
    html: `<span style="display:flex;align-items:center;justify-content:center;width:18px;height:18px;border-radius:50%;background:${getUrgencyColor(urgency)};border:2px solid white;box-shadow:0 5px 15px rgba(15,23,42,0.2);color:#fff;font-size:9px;font-weight:700;">${urgency === 'critical' ? 'C' : urgency === 'high' ? 'H' : urgency === 'medium' ? 'M' : 'L'}</span>`,
    iconSize: [18, 18],
    iconAnchor: [9, 9],
  })
}

async function geocodeLocation(location) {
  if (!location) return null

  try {
    const response = await fetch(`https://nominatim.openstreetmap.org/search?format=jsonv2&q=${encodeURIComponent(location)}`)
    const data = await response.json()
    if (data && data[0]) {
      return {
        lat: Number(data[0].lat),
        lng: Number(data[0].lon),
      }
    }
  } catch (error) {
    console.warn('Geocoding failed for location:', location, error)
  }

  return null
}

function getOpportunityCards(role, problems, currentLocation) {
  const locationHint = currentLocation || 'India'
  const byCategory = problems.reduce((acc, problem) => {
    acc[problem.category] = (acc[problem.category] || 0) + 1
    return acc
  }, {})

  const topCategory = Object.entries(byCategory).sort((a, b) => b[1] - a[1])[0]
  const strongestCategory = topCategory ? topCategory[0] : 'Community Development'

  if (role === 'student' || role === 'researcher' || role === 'mentor') {
    return [
      {
        title: 'University collaboration',
        value: `${problems.filter((p) => p.category === strongestCategory).length || 0} nearby ${strongestCategory.toLowerCase()} problems`,
        detail: `Research teams and student groups can match with local needs in ${locationHint}.`,
      },
      {
        title: 'Industry sponsors',
        value: `${Math.max(2, Math.min(9, problems.length))} active sponsorship opportunities`,
        detail: 'Industry partners can fund prototypes, labs, and deployment pilots near this region.',
      },
      {
        title: 'Faculty mentors',
        value: `${Math.max(3, Math.min(12, problems.length * 2))} mentor-led problem tracks`,
        detail: 'Use this region to form interdisciplinary teams with technical and social impact goals.',
      },
    ]
  }

  if (role === 'industry') {
    return [
      {
        title: 'Prototype demand',
        value: `${problems.length} local challenge areas ready for industrial action`,
        detail: 'Match technical teams with region-specific issues that can become pilot projects.',
      },
      {
        title: 'University partners',
        value: `${Math.max(2, Math.min(8, problems.length))} campus clusters available`,
        detail: 'Connect with universities in this region to co-build and validate solutions.',
      },
      {
        title: 'Deployment pipeline',
        value: `${Math.max(1, Math.min(6, problems.filter((p) => p.urgency === 'high' || p.urgency === 'critical').length))} urgent pilots`,
        detail: 'Prioritize the highest-urgency issues for pilot testing and implementation.',
      },
    ]
  }

  return [
    {
      title: 'Community action',
      value: `${problems.length} local issues are visible on the map`,
      detail: 'Residents can coordinate with NGOs, institutions, and support groups in this city.',
    },
    {
      title: 'Institutional support',
      value: `${Math.max(2, Math.min(10, problems.length))} partner groups in the region`,
      detail: 'Connect civic organizations, colleges, and local leaders around shared needs.',
    },
    {
      title: 'Priority areas',
      value: `${strongestCategory} is the leading challenge area`,
      detail: 'This cluster is the clearest entry point for multi-stakeholder collaboration.',
    },
  ]
}

export default function ProblemMapPage() {
  const { user } = useAuth()
  const mapRef = useRef(null)
  const mapInstanceRef = useRef(null)
  const markersRef = useRef([])
  const [problems, setProblems] = useState([])
  const [filter, setFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [regionFilter, setRegionFilter] = useState('')
  const [loading, setLoading] = useState(true)
  const [selectedProblemId, setSelectedProblemId] = useState(null)

  useEffect(() => {
    const loadProblems = async () => {
      try {
        const res = await problemsAPI.list({ sort_by: 'newest' })
        const problemList = res.data || []

        const normalized = await Promise.all(
          problemList.map(async (problem) => {
            const hasCoordinates = Number.isFinite(problem.latitude) && Number.isFinite(problem.longitude)
            if (hasCoordinates) {
              return { ...problem, resolvedCoords: { lat: Number(problem.latitude), lng: Number(problem.longitude) } }
            }

            const resolved = await geocodeLocation(problem.location)
            return { ...problem, resolvedCoords: resolved }
          })
        )

        setProblems(normalized)
        if (normalized.length > 0) {
          setSelectedProblemId(normalized[0].id)
        }
      } catch (error) {
        console.error('Failed to load map data:', error)
      } finally {
        setLoading(false)
      }
    }

    loadProblems()
  }, [])

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return

    mapInstanceRef.current = L.map(mapRef.current, { zoomControl: true }).setView([defaultCenter.lat, defaultCenter.lng], 5)

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(mapInstanceRef.current)
  }, [])

  const filteredProblems = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase()
    const normalizedRegion = regionFilter.trim().toLowerCase()

    return problems.filter((problem) => {
      const matchesCategory = filter === 'all' || problem.category === filter
      const matchesSearch = !normalizedSearch || [problem.title, problem.description, problem.location, problem.category].join(' ').toLowerCase().includes(normalizedSearch)
      const matchesRegion = !normalizedRegion || (problem.location || '').toLowerCase().includes(normalizedRegion)
      return matchesCategory && matchesSearch && matchesRegion
    })
  }, [problems, filter, searchTerm, regionFilter])

  useEffect(() => {
    if (!mapInstanceRef.current || !problems.length) return

    markersRef.current.forEach((marker) => marker.remove())
    markersRef.current = []

    const map = mapInstanceRef.current
    const visibleProblems = filteredProblems

    if (!visibleProblems.length) return

    const bounds = []
    visibleProblems.forEach((problem) => {
      if (!problem.resolvedCoords) return
      const marker = L.marker([problem.resolvedCoords.lat, problem.resolvedCoords.lng], {
        icon: getMarkerIcon(problem.urgency || 'medium'),
      }).addTo(map)

      marker.bindPopup(`<strong>${problem.title}</strong><br />${problem.location}<br /><small>${problem.category}</small>`)
      marker.on('click', () => setSelectedProblemId(problem.id))
      markersRef.current.push(marker)
      bounds.push([problem.resolvedCoords.lat, problem.resolvedCoords.lng])
    })

    if (bounds.length) {
      map.fitBounds(bounds, { padding: [30, 30] })
    }
  }, [filteredProblems, problems.length])

  const categories = useMemo(
    () => [...new Set((problems || []).map((problem) => problem.category).filter(Boolean))],
    [problems]
  )

  const selectedProblem = useMemo(
    () => filteredProblems.find((problem) => problem.id === selectedProblemId) || filteredProblems[0] || null,
    [filteredProblems, selectedProblemId]
  )

  useEffect(() => {
    if (!selectedProblem || !selectedProblem.resolvedCoords || !mapInstanceRef.current) return
    mapInstanceRef.current.flyTo([selectedProblem.resolvedCoords.lat, selectedProblem.resolvedCoords.lng], 10, {
      animate: true,
      duration: 1.2,
    })
  }, [selectedProblem])

  const userLocation = user?.location || 'India'
  const opportunityCards = getOpportunityCards(user?.role, filteredProblems, userLocation)

  const regionalClusters = useMemo(() => {
    const map = new Map()

    filteredProblems.forEach((problem) => {
      const key = problem.location || 'Unspecified region'
      map.set(key, (map.get(key) || 0) + 1)
    })

    return [...map.entries()]
      .map(([region, count]) => ({ region, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 4)
  }, [filteredProblems])

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-600">Real-world map</p>
            <h1 className="text-4xl font-bold text-slate-900 mt-2">Problem map</h1>
            <p className="text-slate-600 mt-2">
              Problems are mapped by geo-location so students, universities, and industries can see exact regional opportunities for collaboration.
            </p>
          </div>

          <div className="flex items-center gap-3 bg-white rounded-xl p-3 shadow-sm border border-slate-200">
            <MapPin className="text-blue-600" size={18} />
            <div>
              <p className="text-xs text-slate-500">Current focus</p>
              <p className="font-semibold text-slate-800">{userLocation}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold mb-2">Search problem</label>
              <div className="relative">
                <Search size={16} className="absolute left-3 top-3 text-slate-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by title, category, or city"
                  className="w-full border border-slate-200 rounded-lg pl-10 pr-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Region</label>
              <input
                type="text"
                value={regionFilter}
                onChange={(e) => setRegionFilter(e.target.value)}
                placeholder="e.g. Delhi"
                className="w-full border border-slate-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Category</label>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="w-full border border-slate-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All categories</option>
                {categories.map((category) => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-[1.5fr,0.9fr] gap-6">
          <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-200 p-4">
              <div className="flex items-center gap-2">
                <Filter size={18} className="text-blue-600" />
                <p className="font-semibold text-slate-800">Map filters</p>
              </div>
              <span className="text-sm text-slate-600">{filteredProblems.length} issues shown</span>
            </div>

            <div className="h-[620px] w-full">
              <div ref={mapRef} className="h-full w-full" />
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-5">
              <div className="flex items-center gap-2 mb-4">
                {user?.role === 'industry' ? <Factory size={18} className="text-blue-600" /> : user?.role === 'student' || user?.role === 'researcher' ? <GraduationCap size={18} className="text-violet-600" /> : <Users size={18} className="text-emerald-600" />}
                <p className="font-semibold text-slate-800">{user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'Community'} view</p>
              </div>

              {loading ? (
                <p className="text-slate-600">Loading nearby issues...</p>
              ) : selectedProblem ? (
                <>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <h2 className="text-xl font-bold text-slate-900">{selectedProblem.title}</h2>
                    <span className="px-2 py-1 rounded-full text-xs font-semibold" style={{ backgroundColor: `${getUrgencyColor(selectedProblem.urgency || 'medium')}20`, color: getUrgencyColor(selectedProblem.urgency || 'medium') }}>
                      {selectedProblem.urgency}
                    </span>
                  </div>

                  <p className="text-sm text-slate-600 mb-4">{selectedProblem.description}</p>

                  <div className="space-y-3 text-sm text-slate-700">
                    <div className="flex items-center gap-2"><MapPin size={16} className="text-blue-600" /> {selectedProblem.location}</div>
                    <div className="flex items-center gap-2"><Building2 size={16} className="text-blue-600" /> {selectedProblem.category}</div>
                    <div className="flex items-center gap-2"><Users size={16} className="text-blue-600" /> {selectedProblem.number_affected ? `${selectedProblem.number_affected.toLocaleString()} people affected` : 'Community impact'}</div>
                  </div>

                  <Link
                    to={`/problems/${selectedProblem.id}`}
                    className="mt-5 inline-flex items-center justify-center w-full rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-700"
                  >
                    View full problem
                  </Link>
                </>
              ) : (
                <p className="text-slate-600">No issue selected.</p>
              )}
            </div>

            <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-5">
              <div className="flex items-center gap-2 mb-4">
                <Landmark size={18} className="text-indigo-600" />
                <p className="font-semibold text-slate-800">Bridge opportunities</p>
              </div>

              <div className="space-y-3">
                {opportunityCards.map((card) => (
                  <div key={card.title} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                    <p className="font-semibold text-slate-800">{card.title}</p>
                    <p className="text-lg font-bold text-blue-700 mt-1">{card.value}</p>
                    <p className="text-xs text-slate-600 mt-1">{card.detail}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-5">
              <div className="flex items-center gap-2 mb-4">
                <Building2 size={18} className="text-emerald-600" />
                <p className="font-semibold text-slate-800">Regional clusters</p>
              </div>

              <div className="space-y-3">
                {regionalClusters.map((cluster) => (
                  <div key={cluster.region} className="flex items-center justify-between rounded-xl border border-slate-200 p-3">
                    <div>
                      <p className="font-semibold text-slate-800">{cluster.region}</p>
                      <p className="text-xs text-slate-500">Local issue cluster</p>
                    </div>
                    <div className="flex items-center gap-2 text-blue-600 font-semibold">
                      {cluster.count} <ArrowRight size={16} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-5">
              <p className="font-semibold text-slate-800 mb-4">Nearby issue list</p>
              <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
                {filteredProblems.slice(0, 8).map((problem) => (
                  <button
                    key={problem.id}
                    onClick={() => setSelectedProblemId(problem.id)}
                    className={`w-full text-left rounded-xl border p-3 transition ${selectedProblem?.id === problem.id ? 'border-blue-500 bg-blue-50' : 'border-slate-200 hover:border-slate-300'}`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-semibold text-slate-800 text-sm">{problem.title}</p>
                      <span className="px-2 py-1 rounded-full text-[10px] font-bold" style={{ backgroundColor: `${getUrgencyColor(problem.urgency || 'medium')}20`, color: getUrgencyColor(problem.urgency || 'medium') }}>
                        {problem.urgency}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-2 flex items-center gap-1"><MapPin size={12} /> {problem.location}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
