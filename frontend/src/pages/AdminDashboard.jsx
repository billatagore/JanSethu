import React from 'react'

export default function AdminDashboard() {
  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Admin Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg card-shadow">
            <h2 className="font-bold text-lg mb-4">User Management</h2>
            <p className="text-gray-600">Manage users and roles</p>
          </div>
          <div className="bg-white p-6 rounded-lg card-shadow">
            <h2 className="font-bold text-lg mb-4">Problem Verification</h2>
            <p className="text-gray-600">Review and approve problems</p>
          </div>
          <div className="bg-white p-6 rounded-lg card-shadow">
            <h2 className="font-bold text-lg mb-4">Analytics</h2>
            <p className="text-gray-600">Platform statistics and metrics</p>
          </div>
        </div>
      </div>
    </div>
  )
}
