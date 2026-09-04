import React, { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { solutionsAPI } from '../services/api'
import { useAuth } from '../context/AuthContext'

export default function SolutionSubmission() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    technology: '',
    expected_impact: '',
    estimated_cost: '',
    implementation_timeline: '',
    prototype_link: '',
  })
  const [submitting, setSubmitting] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      await solutionsAPI.create(id, formData)
      alert('Solution submitted successfully!')
      navigate(`/problems/${id}`)
    } catch (error) {
      alert('Failed to submit solution')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Propose a Solution</h1>

        <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg card-shadow space-y-6">
          <div>
            <label className="block text-sm font-semibold mb-2">Solution Title</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg h-32"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">Technology & Approach</label>
            <input
              type="text"
              name="technology"
              value={formData.technology}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              placeholder="e.g., Python, IoT, Machine Learning"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold mb-2">Expected Impact</label>
              <input
                type="text"
                name="expected_impact"
                value={formData.expected_impact}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Estimated Cost</label>
              <input
                type="text"
                name="estimated_cost"
                value={formData.estimated_cost}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                placeholder="e.g., ₹5-10 lakhs"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold mb-2">Implementation Timeline</label>
              <input
                type="text"
                name="implementation_timeline"
                value={formData.implementation_timeline}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                placeholder="e.g., 6 months"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Prototype Link (Optional)</label>
              <input
                type="url"
                name="prototype_link"
                value={formData.prototype_link}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>
          </div>

          <div className="flex gap-4">
            <button
              type="submit"
              disabled={submitting}
              className="btn-primary px-8 py-3 disabled:opacity-50"
            >
              {submitting ? 'Submitting...' : 'Submit Solution'}
            </button>
            <button
              type="button"
              onClick={() => navigate(`/problems/${id}`)}
              className="btn-outline px-8 py-3"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
