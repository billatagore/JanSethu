import React, { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { problemsAPI, teamsAPI, solutionsAPI, commentsAPI, usersAPI } from '../services/api'
import { useAuth } from '../context/AuthContext'
import { Loader, AlertCircle, MessageSquare, Users, Plus, MapPin, TrendingUp, ThumbsUp, Bookmark } from 'lucide-react'

export default function ProblemDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()

  const [problem, setProblem] = useState(null)
  const [solutions, setSolutions] = useState([])
  const [comments, setComments] = useState([])
  const [loading, setLoading] = useState(true)
  const [newComment, setNewComment] = useState('')
  const [posting, setPosting] = useState(false)
  const [matches, setMatches] = useState([])
  const [voted, setVoted] = useState(false)
  const [following, setFollowing] = useState(false)
  const [socialLoading, setSocialLoading] = useState(false)

  useEffect(() => {
    loadProblem()
  }, [id])

  const loadProblem = async () => {
    try {
      const [problemRes, solutionsRes, commentsRes, matchesRes] = await Promise.all([
        problemsAPI.getOne(id),
        solutionsAPI.list(id),
        commentsAPI.list(id),
        problemsAPI.getMatches(id).catch(() => ({ data: { matches: [] } })),
      ])

      setProblem(problemRes.data)
      setSolutions(solutionsRes.data)
      setComments(commentsRes.data.comments || [])
      setMatches(matchesRes.data.matches || [])
    } catch (error) {
      console.error('Failed to load problem:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateTeam = () => {
    if (!user) {
      navigate('/login')
      return
    }

    const teamName = prompt('Team name:')
    if (!teamName) return

    teamsAPI.create({
      name: teamName,
      description: `Team for solving: ${problem.title}`,
      problem_id: id,
      required_roles: [],
    }, user.id).then(() => {
      alert('Team created successfully!')
      loadProblem()
    }).catch(error => {
      alert('Failed to create team: ' + error.message)
    })
  }

  const handleAddComment = async () => {
    if (!newComment.trim()) return
    if (!user) {
      navigate('/login')
      return
    }

    setPosting(true)
    try {
      await commentsAPI.create(id, { content: newComment }, user.id)
      setNewComment('')
      await loadProblem()
    } catch (error) {
      alert('Failed to post comment')
    } finally {
      setPosting(false)
    }
  }

  const handleVote = async () => {
    if (!user) {
      navigate('/login')
      return
    }

    setSocialLoading(true)
    try {
      const response = voted
        ? await problemsAPI.removeVote(id)
        : await problemsAPI.vote(id)
      setVoted(response.data.voted)
      setProblem((current) => ({ ...current, vote_count: response.data.vote_count }))
    } catch (error) {
      alert('Unable to update your vote')
    } finally {
      setSocialLoading(false)
    }
  }

  const handleFollow = async () => {
    if (!user) {
      navigate('/login')
      return
    }

    setSocialLoading(true)
    try {
      const response = following
        ? await problemsAPI.unfollow(id)
        : await problemsAPI.follow(id)
      setFollowing(response.data.following)
      setProblem((current) => ({ ...current, follower_count: response.data.follower_count }))
    } catch (error) {
      alert('Unable to update following status')
    } finally {
      setSocialLoading(false)
    }
  }

  const handleSolutionStage = async (solutionId, status) => {
    try {
      await solutionsAPI.updateStage(id, solutionId, status)
      await loadProblem()
    } catch (error) {
      alert('Unable to update solution stage')
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen"><Loader className="animate-spin" size={40} /></div>
  }

  if (!problem) {
    return <div className="p-8"><p className="text-red-600">Problem not found</p></div>
  }

  const analysis = problem.analysis

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Link to="/explore" className="text-blue-600 hover:underline mb-4 inline-block">← Back to Challenges</Link>
          <div>
            <span className="badge-secondary mb-3 inline-block">{problem.category}</span>
            <h1 className="text-4xl font-bold mb-3">{problem.title}</h1>
            <p className="text-gray-600 mb-4">{problem.description}</p>

            <div className="flex flex-wrap gap-6 text-sm">
              <div className="flex items-center gap-2">
                <MapPin size={18} className="text-gray-500" />
                <span>{problem.location}</span>
              </div>
              <div className="flex items-center gap-2">
                <TrendingUp size={18} className="text-blue-600" />
                <span className="font-semibold">Priority: {problem.priority_score.toFixed(0)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-4 mb-8">
          <button
            onClick={handleVote}
            disabled={socialLoading}
            className={`px-5 py-2 rounded-lg border flex items-center gap-2 transition ${voted ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 border-gray-300 hover:border-blue-500'} disabled:opacity-50`}
          >
            <ThumbsUp size={18} />
            {voted ? 'Supported' : 'Support'} ({problem.vote_count || 0})
          </button>
          <button
            onClick={handleFollow}
            disabled={socialLoading}
            className={`px-5 py-2 rounded-lg border flex items-center gap-2 transition ${following ? 'bg-amber-500 text-white border-amber-500' : 'bg-white text-gray-700 border-gray-300 hover:border-amber-500'} disabled:opacity-50`}
          >
            <Bookmark size={18} />
            {following ? 'Following' : 'Follow'} ({problem.follower_count || 0})
          </button>
          <button
            onClick={handleCreateTeam}
            className="btn-primary px-6 py-2 flex items-center gap-2"
          >
            <Users size={18} />
            Create Team
          </button>
          <Link
            to={`/problems/${id}/solution`}
            className="btn-primary px-6 py-2 flex items-center gap-2"
          >
            <Plus size={18} />
            Propose Solution
          </Link>
          {!analysis && (
            <Link
              to={`/problems/${id}/analyze`}
              className="btn-primary px-6 py-2 flex items-center gap-2"
            >
              Analyze with AI
            </Link>
          )}
        </div>

        {/* AI Analysis */}
        {analysis && (
          <div className="bg-white p-6 rounded-lg card-shadow mb-8">
            <h2 className="text-2xl font-bold mb-4">AI Analysis</h2>
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div>
                <p className="text-gray-600">Priority</p>
                <p className="text-3xl font-bold text-blue-600">{analysis.priority_score.toFixed(0)}</p>
              </div>
              <div>
                <p className="text-gray-600">Urgency</p>
                <p className="text-2xl font-bold text-red-600">{analysis.urgency_level}</p>
              </div>
              <div>
                <p className="text-gray-600">Complexity</p>
                <p className="text-2xl font-bold">{analysis.complexity}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <p className="font-semibold text-gray-600 mb-2">Required Skills</p>
                <div className="flex gap-2 flex-wrap">
                  {analysis.required_skills && analysis.required_skills.map((skill, idx) => (
                    <span key={idx} className="badge-primary">{skill}</span>
                  ))}
                </div>
              </div>

              <div>
                <p className="font-semibold text-gray-600 mb-2">Summary</p>
                <p className="text-gray-700">{analysis.summary}</p>
              </div>
            </div>
          </div>
        )}

        {/* Matched Users */}
        {matches.length > 0 && (
          <div className="bg-white p-6 rounded-lg card-shadow mb-8">
            <h2 className="text-2xl font-bold mb-4">Matched Solvers</h2>
            <div className="space-y-4">
              {matches.slice(0, 5).map((match) => (
                <div key={match.user_id} className="border-l-4 border-blue-500 p-4 bg-blue-50 rounded">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold">{match.user_name}</p>
                      <p className="text-sm text-gray-600">{match.reason}</p>
                    </div>
                    <span className="badge-primary">{match.match_percentage}% Match</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Solutions */}
        <div className="bg-white p-6 rounded-lg card-shadow mb-8">
          <h2 className="text-2xl font-bold mb-4">Proposed Solutions ({solutions.length})</h2>
          {solutions.length === 0 ? (
            <p className="text-gray-600">No solutions yet. Be the first to propose one!</p>
          ) : (
            <div className="space-y-4">
              {solutions.map((sol) => (
                <div key={sol.id} className="border rounded p-4">
                  <p className="font-semibold">{sol.title}</p>
                  <p className="text-sm text-gray-600 mt-2">{sol.description}</p>
                  <div className="flex items-center gap-3 mt-3">
                    <span className="text-xs font-semibold text-gray-500">Stage</span>
                    <select
                      value={sol.status}
                      onChange={(event) => handleSolutionStage(sol.id, event.target.value)}
                      className="text-sm px-2 py-1 border rounded"
                    >
                      <option value="proposed">Proposed</option>
                      <option value="under_review">Under Review</option>
                      <option value="approved">Approved</option>
                      <option value="implemented">Implemented</option>
                      <option value="rejected">Rejected</option>
                    </select>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Comments */}
        <div className="bg-white p-6 rounded-lg card-shadow">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <MessageSquare size={24} />
            Discussion
          </h2>

          {/* Add Comment */}
          <div className="mb-6">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-2"
              placeholder="Share your thoughts..."
              rows="3"
            />
            <button
              onClick={handleAddComment}
              disabled={posting || !newComment.trim()}
              className="btn-primary px-6 py-2 disabled:opacity-50"
            >
              {posting ? 'Posting...' : 'Post Comment'}
            </button>
          </div>

          {/* Comments List */}
          <div className="space-y-4">
            {comments.length === 0 ? (
              <p className="text-gray-600">No comments yet. Start the discussion!</p>
            ) : (
              comments.map((comment) => (
                <div key={comment.id} className="border-l-4 border-gray-300 p-4 bg-gray-50">
                  <div className="flex justify-between">
                    <p className="font-semibold">{comment.user_name}</p>
                    <p className="text-xs text-gray-500">{new Date(comment.created_at).toLocaleDateString()}</p>
                  </div>
                  <p className="text-gray-700 mt-2">{comment.content}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
