import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { teamsAPI } from '../services/api'
import { Plus } from 'lucide-react'

export default function TeamWorkspace() {
  const { id } = useParams()
  const [team, setTeam] = useState(null)
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [newTask, setNewTask] = useState('')

  useEffect(() => {
    loadTeam()
  }, [id])

  const loadTeam = async () => {
    try {
      const [teamRes, tasksRes] = await Promise.all([
        teamsAPI.getOne(id),
        teamsAPI.getTasks(id),
      ])
      setTeam(teamRes.data)
      setTasks(tasksRes.data.tasks || [])
    } catch (error) {
      console.error('Failed to load team:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddTask = async () => {
    if (!newTask.trim()) return
    try {
      await teamsAPI.createTask(id, { title: newTask, description: '' }, 0)
      setNewTask('')
      await loadTeam()
    } catch (error) {
      alert('Failed to create task')
    }
  }

  const handleUpdateTaskStatus = async (taskId, newStatus) => {
    try {
      await teamsAPI.updateTask(id, taskId, { status: newStatus })
      await loadTeam()
    } catch (error) {
      alert('Failed to update task')
    }
  }

  if (loading) return <div className="p-8">Loading...</div>
  if (!team) return <div className="p-8">Team not found</div>

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold mb-4">{team.name}</h1>
        <p className="text-gray-600 mb-8">{team.description}</p>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Members */}
          <div className="lg:col-span-1">
            <div className="bg-white p-6 rounded-lg card-shadow">
              <h2 className="text-xl font-bold mb-4">Team Members ({team.members?.length || 0})</h2>
              <div className="space-y-3">
                {team.members?.map((member) => (
                  <div key={member.id} className="p-3 bg-blue-50 rounded">
                    <p className="font-semibold text-sm">{member.name}</p>
                    <p className="text-xs text-gray-600">{member.role}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Tasks */}
          <div className="lg:col-span-3">
            <div className="bg-white p-6 rounded-lg card-shadow">
              <h2 className="text-2xl font-bold mb-6">Tasks</h2>

              {/* Add Task */}
              <div className="mb-6 flex gap-2">
                <input
                  type="text"
                  value={newTask}
                  onChange={(e) => setNewTask(e.target.value)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg"
                  placeholder="Add new task..."
                />
                <button
                  onClick={handleAddTask}
                  className="btn-primary px-4 py-2"
                >
                  <Plus size={18} />
                </button>
              </div>

              {/* Task Board */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {['todo', 'in_progress', 'completed'].map((status) => (
                  <div key={status} className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-bold mb-4 capitalize">{status.replace('_', ' ')}</h3>
                    <div className="space-y-3">
                      {tasks.filter(t => t.status === status).map((task) => (
                        <div key={task.id} className="bg-white p-3 rounded border-l-4 border-blue-500 cursor-move">
                          <p className="font-semibold text-sm">{task.title}</p>
                          <select
                            value={task.status}
                            onChange={(e) => handleUpdateTaskStatus(task.id, e.target.value)}
                            className="text-xs mt-2 px-2 py-1 border rounded"
                          >
                            <option value="todo">To Do</option>
                            <option value="in_progress">In Progress</option>
                            <option value="completed">Completed</option>
                          </select>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
