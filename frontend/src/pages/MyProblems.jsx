import React, { useEffect, useState } from 'react'
import { usersAPI } from '../services/api'
import { useAuth } from '../context/AuthContext'

export default function MyProblems() {
  const { user } = useAuth()
  const [problems, setProblems] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) loadProblems()
  }, [user])

  const loadProblems = async () => {
    try {
      const res = await usersAPI.getProblems(user.id)
      setProblems(res.data.problems || [])
    } catch (error) {
      console.error('Failed to load problems:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">My Problems</h1>

        {loading ? (
          <div className="text-center py-12">Loading...</div>
        ) : problems.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg">
            <p className="text-gray-600 mb-4">You haven't submitted any problems yet.</p>
            <a href="/submit-problem" className="btn-primary px-6 py-2 inline-block">
              Submit Your First Challenge
            </a>
          </div>
        ) : (
          <div className="space-y-4">
            {problems.map((prob) => (
              <div key={prob.id} className="bg-white p-6 rounded-lg card-shadow">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xl font-bold mb-2">{prob.title}</h3>
                    <span className="badge-secondary">{prob.category}</span>
                  </div>
                  <span className={`badge ${prob.status === 'implemented' ? 'badge-secondary' : 'badge-warning'}`}>
                    {prob.status}
                  </span>
                </div>
                <p className="text-gray-600 mt-2 text-sm">Priority: {prob.priority_score.toFixed(0)}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
