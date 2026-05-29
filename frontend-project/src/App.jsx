import { useState, useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import api from './api/axios'
import Sidebar from './components/Sidebar'
import TopHeader from './components/TopHeader'
import ProtectedRoute from './components/ProtectedRoute'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Dashboard from './pages/Dashboard'
import Customers from './pages/Customers'
import Orders from './pages/Orders'
import Payments from './pages/Payments'
import Reports from './pages/Reports'

function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await api.get('/auth/me')
        setUser(res.data)
      } catch {
        setUser(null)
      } finally {
        setLoading(false)
      }
    }
    checkAuth()
  }, [])

  const handleLogin = (userData) => {
    setUser(userData)
  }

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout')
    } catch {
      // ignore
    }
    setUser(null)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    )
  }

  if (!user) {
    return (
      <Routes>
        <Route path="/login" element={<Login onLogin={handleLogin} />} />
        <Route path="/signup" element={<Signup onLogin={handleLogin} />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="lg:ml-64 flex flex-col min-h-screen">
        <TopHeader
          user={user}
          onLogout={handleLogout}
          onMenuClick={() => setSidebarOpen(true)}
        />

        <main className="flex-1 p-4 md:p-6 lg:p-8">
          <Routes>
            <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/customers" element={<ProtectedRoute><Customers /></ProtectedRoute>} />
            <Route path="/orders" element={<ProtectedRoute><Orders /></ProtectedRoute>} />
            <Route path="/payments" element={<ProtectedRoute><Payments /></ProtectedRoute>} />
            <Route path="/reports" element={<ProtectedRoute><Reports /></ProtectedRoute>} />
            <Route path="*" element={<Navigate to="/customers" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  )
}

export default App
