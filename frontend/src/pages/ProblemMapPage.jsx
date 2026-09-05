import React, { useEffect, useMemo, useRef, useState } from 'react'
import { MapPin, Filter, Building2, GraduationCap, Factory, Users, Search, Landmark, ArrowRight, X } from 'lucide-react'
import { problemsAPI } from '../services/api'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import L from 'leaflet'

const defaultCenter = { lat: 20.5937, lng: 78.9629 }

function getUrgencyColor(urgency) {
  if (urgency === 'critical') return '#ef4444'
  if (urgency === 'high') return '#f97316'
  if (urgency === 'medium') return '#facc15'
  return '#22c55e'
}

function getUrgencyLabel(urgency) {
  if (urgency === 'critical') return 'Crucial'
  if (urgency === 'high') return 'Urgent'
  if (urgency === 'medium') return 'Moderate'
  return 'Low'
}

function getMarkerIcon(urgency) {
  const label = urgency === 'critical' ? 'CR' : urgency === 'high' ? 'UR' : urgency === 'medium' ? 'MD' : 'LO'

  return L.divIcon({
    className: 'map-pin-wrapper',
    html: `<span style="display:flex;align-items:center;justify-content:center;width:22px;height:22px;border-radius:50%;background:${getUrgencyColor(urgency)};border:2px solid white;box-shadow:0 5px 15px rgba(15,23,42,0.2);color:#fff;font-size:8px;font-weight:800;letter-spacing:0.02em;">${label}</span>`,
    iconSize: [22, 22],
    iconAnchor: [11, 11],
  })
}

function getUserLocationIcon() {
  return L.divIcon({
    className: 'user-location-wrapper',
    html: `<span style="display:flex;align-items:center;justify-content:center;width:20px;height:20px;border-radius:50%;background:#ef4444;border:3px solid white;box-shadow:0 0 0 6px rgba(239,68,68,0.15),0 10px 20px rgba(239,68,68,0.25);position:relative;"><span style="width:8px;height:8px;border-radius:50%;background:white;display:block;"></span></span>`,
    iconSize: [20, 20],
    iconAnchor: [10, 10],
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

function generateNearbyDemoProblems(center, count = 15) {
  const categories = ['Water & Sanitation', 'Waste Management', 'Transportation', 'Healthcare', 'Education', 'Agriculture', 'Digital Inclusion', 'Climate Action', 'Accessibility', 'Energy']
  const titles = [
    'Broken water pipeline',
    'Street lighting outage',
    'Waste dumping hotspot',
    'School transport risk',
    'Flood drainage blockage',
    'Rural internet gap',
    'Waste segregation challenge',
    'Public health sanitation issue',
    'Road safety concern',
    'Air pollution hotspot',
    'E-waste collection gap',
    'Food insecurity support point',
    'Community clinic shortage',
    'Cycle lane safety issue',
    'Water quality testing need',
    'School bus route problem',
    'Power backup gap',
    'Smart irrigation need',
    'Youth skill center demand',
    'Disaster shelter readiness'
  ]

  return Array.from({ length: count }, (_, index) => {
    const angle = (index / count) * Math.PI * 2
    const distanceKm = 2 + ((index * 7) % 30)
    const latOffset = (distanceKm / 111.32) * Math.cos(angle)
    const lngOffset = (distanceKm / (111.32 * Math.cos((center.lat * Math.PI) / 180))) * Math.sin(angle)

    const urgency = index % 6 === 0 ? 'critical' : index % 3 === 0 ? 'high' : index % 2 === 0 ? 'medium' : 'low'
    const category = categories[index % categories.length]

    return {
      id: `demo-${index + 1}`,
      title: titles[index % titles.length],
      description: 'Demo issue generated around the user location to showcase local challenge visibility, urgency, and collaboration potential.',
      category,
      location: `${Math.abs(latOffset).toFixed(3)}° ${center.lat >= 0 ? 'N' : 'S'}, ${Math.abs(lngOffset).toFixed(3)}° ${center.lng >= 0 ? 'E' : 'W'}`,
      resolvedCoords: {
        lat: Number((center.lat + latOffset).toFixed(5)),
        lng: Number((center.lng + lngOffset).toFixed(5)),
      },
      urgency,
      number_affected: 200 + index * 140,
      isDemo: true,
      outcome: 'Demo dataset',
    }
  })
}

function getDistanceKm(from, to) {
  if (!from || !to) return Number.POSITIVE_INFINITY

  const toRadians = (value) => (value * Math.PI) / 180
  const earthRadiusKm = 6371
  const dLat = toRadians(to.lat - from.lat)
  const dLng = toRadians(to.lng - from.lng)
  const lat1 = toRadians(from.lat)
  const lat2 = toRadians(to.lat)

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLng / 2) * Math.sin(dLng / 2) * Math.cos(lat1) * Math.cos(lat2)

  return 2 * earthRadiusKm * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

function getUrgencyPriority(urgency) {
  if (urgency === 'critical') return 4
  if (urgency === 'high') return 3
  if (urgency === 'medium') return 2
  return 1
}

function isProblemActiveOnMap(problem) {
  const status = String(problem?.status || '').toLowerCase()
  return !['closed', 'implemented', 'impact_measured', 'resolved', 'solved'].includes(status)
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
  const location = useLocation()
  const mapRef = useRef(null)
  const mapInstanceRef = useRef(null)
  const markersRef = useRef([])
  const userLocationMarkerRef = useRef(null)
  const radiusCircleRef = useRef(null)
  const [problems, setProblems] = useState([])
  const [filter, setFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [regionFilter, setRegionFilter] = useState('')
  const [loading, setLoading] = useState(true)
  const [selectedProblemId, setSelectedProblemId] = useState(null)
  const [userCoords, setUserCoords] = useState(null)
  const [radiusKm, setRadiusKm] = useState(25)
  const [submissionNotice, setSubmissionNotice] = useState(null)

  const pinpointUserLocation = () => {
    if (!navigator.geolocation) {
      return
    }

    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        const nextCoords = { lat: coords.latitude, lng: coords.longitude }
        setUserCoords(nextCoords)
        setProblems((currentProblems) => {
          const realProblems = currentProblems.filter((problem) => !problem.isDemo)
          const demoProblems = generateNearbyDemoProblems(nextCoords, 15)
          const merged = realProblems.length > 0 ? [...realProblems, ...demoProblems] : demoProblems
          setSelectedProblemId((previous) => previous || merged[0]?.id || null)
          return merged
        })
      },
      () => {
        setUserCoords(null)
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0,
      }
    )
  }

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

      setProblems((currentProblems) => {
        const demoProblems = currentProblems.filter((problem) => problem.isDemo)
        const merged = [...normalized, ...demoProblems]
        if (merged.length > 0) {
          setSelectedProblemId((previous) => previous || merged[0].id)
        }
        return merged
      })
    } catch (error) {
      console.error('Failed to load map data:', error)
      setProblems((currentProblems) => {
        if (currentProblems.length > 0) return currentProblems

        const fallbackProblems = generateNearbyDemoProblems(defaultCenter, 15)
        setSelectedProblemId('demo-1')
        return fallbackProblems
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadProblems()
  }, [])

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return

    mapInstanceRef.current = L.map(mapRef.current, { zoomControl: true }).setView([defaultCenter.lat, defaultCenter.lng], 5)

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(mapInstanceRef.current)

    pinpointUserLocation()
  }, [])

  useEffect(() => {
    if (!mapInstanceRef.current || !userCoords) return

    const map = mapInstanceRef.current
    const location = [userCoords.lat, userCoords.lng]

    if (userLocationMarkerRef.current) {
      userLocationMarkerRef.current.setLatLng(location)
    } else {
      userLocationMarkerRef.current = L.marker(location, {
        icon: getUserLocationIcon(),
      })
        .addTo(map)
        .bindPopup('Your current location')
    }

    if (radiusCircleRef.current) {
      radiusCircleRef.current.setLatLng(location)
      radiusCircleRef.current.setRadius(radiusKm * 1000)
    } else {
      radiusCircleRef.current = L.circle(location, {
        radius: radiusKm * 1000,
        color: '#ef4444',
        fillColor: '#ef4444',
        fillOpacity: 0.12,
        weight: 2,
      }).addTo(map)
    }

    map.flyTo(location, 12, { animate: true, duration: 1.2 })
  }, [userCoords, radiusKm])

  const filteredProblems = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase()
    const normalizedRegion = regionFilter.trim().toLowerCase()

    return problems
      .filter((problem) => {
        const matchesCategory = filter === 'all' || problem.category === filter
        const matchesSearch = !normalizedSearch || [problem.title, problem.description, problem.location, problem.category].join(' ').toLowerCase().includes(normalizedSearch)
        const matchesRegion = !normalizedRegion || (problem.location || '').toLowerCase().includes(normalizedRegion)
        const matchesRadius = !userCoords || !problem.resolvedCoords || getDistanceKm(userCoords, problem.resolvedCoords) <= radiusKm
        const isActive = isProblemActiveOnMap(problem)

        return isActive && matchesCategory && matchesSearch && matchesRegion && matchesRadius
      })
      .map((problem) => ({
        ...problem,
        distanceKm: userCoords && problem.resolvedCoords ? Math.round(getDistanceKm(userCoords, problem.resolvedCoords)) : null,
      }))
      .sort((a, b) => {
        const urgencyDiff = getUrgencyPriority(b.urgency || 'low') - getUrgencyPriority(a.urgency || 'low')
        if (urgencyDiff !== 0) return urgencyDiff

        if (a.distanceKm === null || b.distanceKm === null) return 0
        return a.distanceKm - b.distanceKm
      })
  }, [problems, filter, searchTerm, regionFilter, radiusKm, userCoords])

  const nearbyProblemCount = filteredProblems.length

  useEffect(() => {
    if (!mapInstanceRef.current || !problems.length) return

    markersRef.current.forEach((marker) => marker.remove())
    markersRef.current = []

    const map = mapInstanceRef.current
    const visibleProblems = filteredProblems

    if (radiusCircleRef.current && userCoords) {
      radiusCircleRef.current.setLatLng([userCoords.lat, userCoords.lng])
      radiusCircleRef.current.setRadius(radiusKm * 1000)
    }

    if (!visibleProblems.length) return

    const bounds = []
    visibleProblems.forEach((problem) => {
      if (!problem.resolvedCoords) return

      const marker = L.marker([problem.resolvedCoords.lat, problem.resolvedCoords.lng], {
        icon: getMarkerIcon(problem.urgency || 'medium'),
      }).addTo(map)

      const distanceText = userCoords
        ? `${Math.round(getDistanceKm(userCoords, problem.resolvedCoords))} km away`
        : 'Location unavailable'

      const label = document.createElement('div')
      label.className = 'text-[10px] text-slate-700 bg-white/90 shadow-sm px-2 py-1 rounded-full border border-slate-200'
      label.textContent = distanceText
      label.style.position = 'absolute'
      label.style.transform = 'translate(-50%, -140%)'
      label.style.pointerEvents = 'none'
      label.style.whiteSpace = 'nowrap'

      const markerContainer = marker.getElement()
      if (markerContainer) {
        markerContainer.style.position = 'relative'
        markerContainer.appendChild(label)
      }

      marker.bindPopup(`<strong>${problem.title}</strong><br />${problem.location}<br /><small>${problem.category}</small><br /><strong>${getUrgencyLabel(problem.urgency || 'medium')}</strong><br /><small>${distanceText}</small>`)
      marker.on('click', () => setSelectedProblemId(problem.id))
      markersRef.current.push(marker)
      bounds.push([problem.resolvedCoords.lat, problem.resolvedCoords.lng])
    })

    // Keep the map stable while the user explores nearby issues. Auto-fitting on every
    // selection or radius change causes markers to collapse unexpectedly and can make
    // the rest of the map disappear during navigation.
  }, [filteredProblems, problems.length, radiusKm, userCoords])

  const categories = useMemo(
    () => [...new Set((problems || []).map((problem) => problem.category).filter(Boolean))],
    [problems]
  )

  const selectedProblem = useMemo(
    () => filteredProblems.find((problem) => problem.id === selectedProblemId) || filteredProblems[0] || null,
    [filteredProblems, selectedProblemId]
  )

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

  const nearestMatches = useMemo(() => {
    if (!userCoords) return []

    return [...filteredProblems]
      .filter((problem) => problem.resolvedCoords)
      .map((problem) => ({
        ...problem,
        distanceKm: Math.round(getDistanceKm(userCoords, problem.resolvedCoords)),
      }))
      .sort((a, b) => {
        const urgencyDiff = getUrgencyPriority(b.urgency || 'low') - getUrgencyPriority(a.urgency || 'low')
        if (urgencyDiff !== 0) return urgencyDiff
        return a.distanceKm - b.distanceKm
      })
      .slice(0, 3)
  }, [filteredProblems, userCoords])

  const focusProblemOnMap = (problem) => {
    if (!problem?.resolvedCoords || !mapInstanceRef.current) return
    setSelectedProblemId(problem.id)
    mapInstanceRef.current.flyTo([problem.resolvedCoords.lat, problem.resolvedCoords.lng], 12, {
      animate: true,
      duration: 1.1,
    })
  }

  useEffect(() => {
    const notice = location.state?.newProblemCreated
    if (notice && location.state?.problemTitle) {
      setSubmissionNotice({
        title: location.state.problemTitle,
        location: location.state.problemLocation || 'near your current location',
      })
    }
  }, [location.state])

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

        {submissionNotice && (
          <div className="mb-6 rounded-2xl border border-green-200 bg-green-50 p-4 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-green-700">Problem created near you</p>
                <h2 className="mt-2 text-xl font-bold text-slate-900">{submissionNotice.title}</h2>
                <p className="mt-1 text-sm text-slate-600">This problem has been added to the map at {submissionNotice.location} and is now visible in the active radius.</p>
              </div>
              <button
                type="button"
                onClick={() => setSubmissionNotice(null)}
                className="rounded-full p-1 text-slate-500 hover:bg-green-100 hover:text-slate-700"
                aria-label="Dismiss problem created notice"
              >
                <X size={18} />
              </button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 xl:grid-cols-[1.5fr,0.9fr] gap-6">
          <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-200 p-4">
              <div className="flex items-center gap-2">
                <Filter size={18} className="text-blue-600" />
                <p className="font-semibold text-slate-800">Map filters</p>
              </div>
              <span className="text-sm text-slate-600">{nearbyProblemCount} issues within {radiusKm} km</span>
            </div>

            <div className="h-[620px] w-full relative">
              <div ref={mapRef} className="h-full w-full" />

              <div className="absolute right-4 top-4 z-[500] flex flex-col gap-3 w-[250px]">
                <div className="bg-white/95 backdrop-blur-sm rounded-xl border border-slate-200 p-3 shadow-lg">
                  <div className="flex items-center justify-between gap-3 mb-2">
                    <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">Nearby radius</span>
                    <span className="text-sm font-bold text-red-600">{radiusKm} km</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="100"
                    step="1"
                    value={radiusKm}
                    disabled={!userCoords}
                    onChange={(event) => setRadiusKm(Number(event.target.value))}
                    className="w-full accent-red-500 disabled:cursor-not-allowed disabled:opacity-40"
                  />
                  <div className="mt-2 flex justify-between text-[10px] font-medium text-slate-500">
                    <span>1 km</span>
                    <span>100 km</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={pinpointUserLocation}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-100 transition shadow-lg"
                >
                  <MapPin size={16} />
                  Pinpoint my location
                </button>
              </div>
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
                <p className="font-semibold text-slate-800">Nearest matches</p>
              </div>

              {nearestMatches.length > 0 ? (
                <div className="space-y-3">
                  {nearestMatches.map((match) => (
                    <button
                      key={match.id}
                      type="button"
                      onClick={() => focusProblemOnMap(match)}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-left transition hover:border-blue-300 hover:bg-blue-50"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <p className="font-semibold text-slate-800 text-sm">{match.title}</p>
                        <span className="px-2 py-1 rounded-full text-[10px] font-bold" style={{ backgroundColor: `${getUrgencyColor(match.urgency || 'medium')}20`, color: getUrgencyColor(match.urgency || 'medium') }}>
                          {getUrgencyLabel(match.urgency || 'medium')}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-2">{match.distanceKm} km away</p>
                      <p className="text-xs text-slate-500">{match.location}</p>
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-500">Enable location access to see nearest university or industry matches.</p>
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
