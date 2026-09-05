import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { problemsAPI, dataAPI } from '../services/api'
import { AlertCircle, Loader } from 'lucide-react'

export default function SubmitProblem() {
  const navigate = useNavigate()
  const { user } = useAuth()

  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    location: '',
    latitude: '',
    longitude: '',
    affected_population: '',
    number_affected: '',
    current_situation: '',
    existing_solutions: '',
    why_insufficient: '',
    urgency: 'medium',
    expected_outcome: '',
  })

  useEffect(() => {
    loadCategories()
  }, [])

  const loadCategories = async () => {
    try {
      const res = await dataAPI.getCategories()
      setCategories(res.data.categories)
    } catch (error) {
      console.error('Failed to load categories:', error)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not available in this browser.')
      return
    }

    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        setFormData(prev => ({
          ...prev,
          latitude: coords.latitude.toFixed(6),
          longitude: coords.longitude.toFixed(6),
        }))
      },
      () => {
        setError('Location access was denied. You can still enter the coordinates manually.')
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0,
      }
    )
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)

    try {
      const submitData = {
        ...formData,
        latitude: formData.latitude ? parseFloat(formData.latitude) : null,
        longitude: formData.longitude ? parseFloat(formData.longitude) : null,
        number_affected: formData.number_affected ? parseInt(formData.number_affected) : null,
      }

      const response = await problemsAPI.create(submitData, user.id)
      const problemId = response.data.id

      navigate('/map', {
        state: {
          newProblemCreated: true,
          problemTitle: submitData.title,
          problemLocation: submitData.location,
          problemCoords: submitData.latitude && submitData.longitude
            ? { lat: submitData.latitude, lng: submitData.longitude }
            : null,
        },
      })
    } catch (error) {
      setError(error.response?.data?.detail || 'Failed to submit problem')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Submit a Challenge</h1>
          <p className="text-gray-600">Share a real-world problem you'd like to solve</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex gap-3">
            <AlertCircle size={20} className="text-red-600 flex-shrink-0" />
            <p className="text-red-700">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg card-shadow space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-semibold mb-2">Problem Title</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="A clear, concise title for the problem"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold mb-2">Detailed Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 h-32"
              placeholder="Describe the problem in detail"
              required
            />
          </div>

          {/* Category & Location */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold mb-2">Category</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Select a category</option>
                {categories.map(cat => (
                  <option key={cat.name} value={cat.name}>
                    {cat.icon} {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Location</label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="City, State or Region"
                required
              />
            </div>
          </div>

          {/* Coordinates */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold mb-2">Latitude (Optional)</label>
              <input
                type="number"
                name="latitude"
                value={formData.latitude}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="0.0000"
                step="0.0001"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Longitude (Optional)</label>
              <input
                type="number"
                name="longitude"
                value={formData.longitude}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="0.0000"
                step="0.0001"
              />
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleUseCurrentLocation}
              className="inline-flex items-center rounded-lg border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-100"
            >
              Use my current location
            </button>
          </div>

          {/* Affected Population */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold mb-2">Who is affected?</label>
              <input
                type="text"
                name="affected_population"
                value={formData.affected_population}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Healthcare workers, students, farmers"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Number Affected (Approx)</label>
              <input
                type="number"
                name="number_affected"
                value={formData.number_affected}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., 1000"
              />
            </div>
          </div>

          {/* Current Situation */}
          <div>
            <label className="block text-sm font-semibold mb-2">Current Situation</label>
            <textarea
              name="current_situation"
              value={formData.current_situation}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 h-24"
              placeholder="Describe the current state of the problem"
            />
          </div>

          {/* Existing Solutions */}
          <div>
            <label className="block text-sm font-semibold mb-2">Existing Solutions</label>
            <textarea
              name="existing_solutions"
              value={formData.existing_solutions}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 h-24"
              placeholder="What solutions already exist?"
            />
          </div>

          {/* Why Insufficient */}
          <div>
            <label className="block text-sm font-semibold mb-2">Why are current solutions insufficient?</label>
            <textarea
              name="why_insufficient"
              value={formData.why_insufficient}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 h-24"
              placeholder="Explain gaps in current solutions"
            />
          </div>

          {/* Urgency */}
          <div>
            <label className="block text-sm font-semibold mb-2">Urgency Level</label>
            <select
              name="urgency"
              value={formData.urgency}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="low">🟢 Low</option>
              <option value="medium">🟡 Medium</option>
              <option value="high">🔴 High</option>
              <option value="critical">⚫ Critical</option>
            </select>
          </div>

          {/* Expected Outcome */}
          <div>
            <label className="block text-sm font-semibold mb-2">Expected Outcome</label>
            <textarea
              name="expected_outcome"
              value={formData.expected_outcome}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 h-24"
              placeholder="What should success look like?"
            />
          </div>

          {/* Submit Button */}
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 btn-primary py-3 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <Loader size={18} className="animate-spin" />
                  Submitting...
                </>
              ) : (
                'Submit & Analyze with AI'
              )}
            </button>
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="px-6 py-3 btn-outline"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
