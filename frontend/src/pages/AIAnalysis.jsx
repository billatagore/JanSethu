import React, { useEffect, useState } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { problemsAPI, dataAPI } from '../services/api'
import { Loader, AlertCircle, CheckCircle, Edit, RotateCcw } from 'lucide-react'

export default function AIAnalysis() {
  const { id } = useParams()
  const navigate = useNavigate()
  const location = useLocation()

  const [problem, setProblem] = useState(null)
  const [loading, setLoading] = useState(true)
  const [analyzing, setAnalyzing] = useState(false)
  const [analyzed, setAnalyzed] = useState(false)
  const [error, setError] = useState('')
  const [sdgs, setSdgs] = useState([])

  useEffect(() => {
    loadProblem()
    loadSDGs()
    // Auto-analyze if coming from submit page
    if (location.state?.auto) {
      setTimeout(() => runAnalysis(), 500)
    }
  }, [id])

  const loadProblem = async () => {
    try {
      const res = await problemsAPI.getOne(id)
      setProblem(res.data)
      setAnalyzed(!!res.data.analysis)
      setLoading(false)
    } catch (error) {
      setError('Failed to load problem')
      setLoading(false)
    }
  }

  const loadSDGs = async () => {
    try {
      const res = await dataAPI.getSdgs()
      setSdgs(res.data.sdgs)
    } catch (error) {
      console.error('Failed to load SDGs:', error)
    }
  }

  const runAnalysis = async () => {
    setAnalyzing(true)
    setError('')

    try {
      const res = await problemsAPI.analyze(id)
      setProblem(prev => ({
        ...prev,
        status: 'ai_analyzed',
      }))
      setAnalyzed(true)
      await loadProblem()
    } catch (error) {
      setError(error.response?.data?.detail || 'Failed to analyze problem')
    } finally {
      setAnalyzing(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    )
  }

  if (!problem) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-red-600">Problem not found</p>
        </div>
      </div>
    )
  }

  const analysis = problem.analysis

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">AI Analysis</h1>
          <h2 className="text-2xl text-gray-700">{problem.title}</h2>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex gap-3">
            <AlertCircle size={20} className="text-red-600 flex-shrink-0" />
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {!analyzed ? (
          <div className="bg-white p-8 rounded-lg card-shadow text-center">
            <Loader size={48} className="mx-auto mb-4 text-blue-600 animate-spin" />
            <p className="text-lg mb-6">Ready to analyze this problem with AI?</p>
            <button
              onClick={runAnalysis}
              disabled={analyzing}
              className="btn-primary px-8 py-3 disabled:opacity-50 flex items-center gap-2 mx-auto"
            >
              {analyzing ? (
                <>
                  <Loader size={18} className="animate-spin" />
                  Analyzing...
                </>
              ) : (
                'Analyze with AI'
              )}
            </button>
          </div>
        ) : analysis ? (
          <div className="space-y-6">
            {/* Success Message */}
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg flex gap-3">
              <CheckCircle size={20} className="text-green-600 flex-shrink-0" />
              <div>
                <p className="font-semibold text-green-800">Analysis Complete!</p>
                <p className="text-green-700 text-sm">AI has generated comprehensive insights.</p>
              </div>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-lg card-shadow">
                <p className="text-gray-600 mb-2">Priority Score</p>
                <p className="text-4xl font-bold text-blue-600">{analysis.priority_score.toFixed(0)}/100</p>
              </div>

              <div className="bg-white p-6 rounded-lg card-shadow">
                <p className="text-gray-600 mb-2">Urgency Level</p>
                <p className="text-2xl font-bold text-red-600">{analysis.urgency_level}</p>
              </div>

              <div className="bg-white p-6 rounded-lg card-shadow">
                <p className="text-gray-600 mb-2">Complexity</p>
                <p className="text-2xl font-bold text-orange-600">{analysis.complexity}</p>
              </div>
            </div>

            {/* Analysis Details */}
            <div className="bg-white p-6 rounded-lg card-shadow space-y-6">
              {/* Category & Summary */}
              <div>
                <h3 className="text-xl font-bold mb-3">Problem Analysis</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <p className="text-gray-600 font-semibold mb-2">Category</p>
                    <p className="text-lg">{analysis.category}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 font-semibold mb-2">Affected Population</p>
                    <p className="text-lg">{analysis.affected_population_detailed}</p>
                  </div>
                </div>
              </div>

              {/* Summary */}
              <div>
                <p className="text-gray-600 font-semibold mb-2">Summary</p>
                <p className="text-gray-700 leading-relaxed">{analysis.summary}</p>
              </div>

              {/* Required Skills */}
              <div>
                <p className="text-gray-600 font-semibold mb-3">Required Skills</p>
                <div className="flex flex-wrap gap-2">
                  {analysis.required_skills && analysis.required_skills.map((skill, idx) => (
                    <span key={idx} className="badge-primary">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Suggested Solutions */}
              <div>
                <p className="text-gray-600 font-semibold mb-3">Suggested Solutions</p>
                <ul className="space-y-2">
                  {analysis.suggested_solutions && analysis.suggested_solutions.map((sol, idx) => (
                    <li key={idx} className="flex gap-3">
                      <span className="text-blue-600 font-bold flex-shrink-0">{idx + 1}.</span>
                      <span className="text-gray-700">{sol}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Technologies */}
              <div>
                <p className="text-gray-600 font-semibold mb-3">Suggested Technologies</p>
                <div className="flex flex-wrap gap-2">
                  {analysis.suggested_technologies && analysis.suggested_technologies.map((tech, idx) => (
                    <span key={idx} className="badge-secondary">
                      {tech}
                    </span>
                  ))}
                </div>
              </div>

              {/* Expected Impact */}
              <div>
                <p className="text-gray-600 font-semibold mb-2">Expected Social Impact</p>
                <p className="text-gray-700 p-4 bg-blue-50 rounded-lg">{analysis.expected_social_impact}</p>
              </div>

              {/* Potential Collaborators */}
              <div>
                <p className="text-gray-600 font-semibold mb-3">Potential Partners & Collaborators</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <p className="font-semibold text-sm text-gray-600 mb-2">Stakeholders</p>
                    <ul className="space-y-1">
                      {analysis.potential_stakeholders && analysis.potential_stakeholders.map((s, idx) => (
                        <li key={idx} className="text-gray-700">• {s}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-gray-600 mb-2">Collaborators</p>
                    <ul className="space-y-1">
                      {analysis.potential_collaborators && analysis.potential_collaborators.map((c, idx) => (
                        <li key={idx} className="text-gray-700">• {c}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* Next Steps */}
              <div>
                <p className="text-gray-600 font-semibold mb-3">Recommended Next Steps</p>
                <ol className="space-y-2">
                  {analysis.recommended_next_steps && analysis.recommended_next_steps.map((step, idx) => (
                    <li key={idx} className="flex gap-3">
                      <span className="text-green-600 font-bold flex-shrink-0">{idx + 1}.</span>
                      <span className="text-gray-700">{step}</span>
                    </li>
                  ))}
                </ol>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-4 justify-center">
              <button
                onClick={() => navigate(`/problems/${id}`)}
                className="btn-primary px-8 py-3 flex items-center gap-2"
              >
                <CheckCircle size={18} />
                Accept & Continue
              </button>
              <button
                onClick={runAnalysis}
                disabled={analyzing}
                className="btn-outline px-8 py-3 flex items-center gap-2 disabled:opacity-50"
              >
                <RotateCcw size={18} />
                Re-analyze
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-white p-8 rounded-lg card-shadow text-center">
            <p className="text-lg text-gray-600">No analysis available</p>
          </div>
        )}
      </div>
    </div>
  )
}
