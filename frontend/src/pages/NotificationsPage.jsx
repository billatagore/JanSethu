import React, { useEffect, useState } from 'react'
import { usersAPI } from '../services/api'
import { useAuth } from '../context/AuthContext'

export default function NotificationsPage() {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) loadNotifications()
  }, [user])

  const loadNotifications = async () => {
    try {
      const res = await usersAPI.getNotifications(user.id)
      setNotifications(res.data.notifications || [])
    } catch (error) {
      console.error('Failed to load notifications:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div className="p-8">Loading...</div>

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Notifications</h1>

        {notifications.length === 0 ? (
          <div className="bg-white p-8 rounded-lg card-shadow text-center">
            <p className="text-gray-600">No notifications yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {notifications.map((notif) => (
              <div key={notif.id} className="bg-white p-6 rounded-lg card-shadow">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-bold">{notif.title}</p>
                    <p className="text-gray-600 text-sm mt-1">{notif.message}</p>
                  </div>
                  <span className={`badge ${notif.is_read ? 'badge-secondary' : 'badge-primary'}`}>
                    {notif.is_read ? 'Read' : 'New'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
