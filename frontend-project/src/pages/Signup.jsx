import { useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/axios'
import toast from 'react-hot-toast'
import { NAME_REGEX } from '../utils/validation'

function getPasswordStrength(pw) {
  let score = 0
  if (pw.length >= 8) score++
  if (pw.length >= 12) score++
  if (/[a-z]/.test(pw) && /[A-Z]/.test(pw)) score++
  if (/\d/.test(pw)) score++
  if (/[^a-zA-Z0-9]/.test(pw)) score++
  return score
}

const strengthLabels = ['', 'Weak', 'Fair', 'Good', 'Strong', 'Very Strong']
const strengthColors = ['', 'bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-lime-500', 'bg-green-500']

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

export default function Signup({ onLogin }) {
  const [form, setForm] = useState({ username: '', password: '', confirmPassword: '' })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm({ ...form, [name]: value })
    if (errors[name]) setErrors({ ...errors, [name]: '' })
  }

  const strength = getPasswordStrength(form.password)
  const passwordsMatch = form.password === form.confirmPassword

  const validate = () => {
    const errs = {}
    if (!form.username.trim()) errs.username = 'Username is required'
    else if (!NAME_REGEX.test(form.username)) errs.username = 'Username cannot contain special characters'
    else if (form.username.trim().length < 3) errs.username = 'Username must be at least 3 characters'

    if (!form.password) errs.password = 'Password is required'
    else if (form.password.length < 8) errs.password = 'Password must be at least 8 characters'
    else if (strength < 2) errs.password = 'Password is too weak. Use mixed case, numbers, or symbols'

    if (!form.confirmPassword) errs.confirmPassword = 'Please confirm your password'
    else if (form.password !== form.confirmPassword) errs.confirmPassword = 'Passwords do not match'

    setErrors(errs)
    return !Object.values(errs).some(Boolean)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)
    try {
      const res = await api.post('/auth/register', {
        username: form.username,
        password: form.password,
      })
      toast.success('Account created successfully!')
      onLogin({ username: res.data.username })
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed')
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
          <h1 className="text-3xl font-bold text-gray-800">Create Account</h1>
          <p className="text-gray-500 mt-1">Register for COMS</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
            <input
              type="text"
              name="username"
              value={form.username}
              onChange={handleChange}
              className={inputClass('username')}
              placeholder="Choose a username"
            />
            {errors.username && <p className="text-xs text-red-500 mt-1">{errors.username}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={form.password}
                onChange={handleChange}
                className={`${inputClass('password')} pr-11`}
                placeholder="Create a strong password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <EyeIcon open={showPassword} />
              </button>
            </div>
            {form.password && (
              <div className="mt-2">
                <div className="flex gap-1 mb-1">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div
                      key={i}
                      className={`h-1.5 flex-1 rounded-full ${i <= strength ? strengthColors[strength] : 'bg-gray-200'}`}
                    />
                  ))}
                </div>
                <p className={`text-xs ${strength >= 3 ? 'text-green-600' : 'text-gray-400'}`}>
                  {strengthLabels[strength]}
                </p>
              </div>
            )}
            {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
            <div className="relative">
              <input
                type={showConfirm ? 'text' : 'password'}
                name="confirmPassword"
                value={form.confirmPassword}
                onChange={handleChange}
                className={`${inputClass('confirmPassword')} pr-11`}
                placeholder="Confirm your password"
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <EyeIcon open={showConfirm} />
              </button>
            </div>
            {form.confirmPassword && (
              <p className={`text-xs mt-1 ${passwordsMatch ? 'text-green-600' : 'text-red-500'}`}>
                {passwordsMatch ? 'Passwords match' : 'Passwords do not match'}
              </p>
            )}
            {errors.confirmPassword && <p className="text-xs text-red-500 mt-1">{errors.confirmPassword}</p>}
          </div>

          <button
            type="submit"
            disabled={loading || (form.password && form.confirmPassword && !passwordsMatch)}
            className="w-full bg-blue-700 hover:bg-blue-800 text-white py-2.5 rounded-lg font-medium transition disabled:opacity-50"
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <div className="mt-5 text-center">
          <p className="text-sm text-gray-500">
            Already have an account?{' '}
            <Link to="/login" className="text-blue-700 hover:text-blue-800 font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
