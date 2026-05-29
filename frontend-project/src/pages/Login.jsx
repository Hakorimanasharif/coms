import { useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/axios'
import toast from 'react-hot-toast'
import { NAME_REGEX } from '../utils/validation'

function EyeIcon({ open }) {
  return open ? (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
    </svg>
  ) : (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  )
}

export default function Login({ onLogin }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = {}
    if (!username.trim()) errs.username = 'Username is required'
    else if (!NAME_REGEX.test(username)) errs.username = 'Username cannot contain special characters'
    if (!password) errs.password = 'Password is required'
    setErrors(errs)
    if (Object.keys(errs).length) return

    setLoading(true)
    try {
      const res = await api.post('/auth/login', { username, password })
      toast.success(res.data.message)
      onLogin({ username: res.data.username })
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  const inputClass = (field) => `
    w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition
    ${errors[field] ? 'border-red-400 bg-red-50' : 'border-gray-300'}
  `

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-600 to-blue-900 px-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">COMS</h1>
          <p className="text-gray-500 mt-1">Customer Order Management System</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => { setUsername(e.target.value); if (errors.username) setErrors({ ...errors, username: '' }) }}
              className={inputClass('username')}
              placeholder="Enter username"
            />
            {errors.username && <p className="text-xs text-red-500 mt-1">{errors.username}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => { setPassword(e.target.value); if (errors.password) setErrors({ ...errors, password: '' }) }}
                className={`${inputClass('password')} pr-11`}
                placeholder="Enter password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <EyeIcon open={showPassword} />
              </button>
            </div>
            {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password}</p>}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-700 hover:bg-blue-800 text-white py-2.5 rounded-lg font-medium transition disabled:opacity-50"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="mt-5 text-center">
          <p className="text-sm text-gray-500">
            Don't have an account?{' '}
            <Link to="/signup" className="text-blue-700 hover:text-blue-800 font-medium">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
