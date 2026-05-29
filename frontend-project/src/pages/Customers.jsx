import { useState, useEffect } from 'react'
import api from '../api/axios'
import toast from 'react-hot-toast'
import { validateName, validatePhone, validateText } from '../utils/validation'

export default function Customers() {
  const [customers, setCustomers] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ customerName: '', phoneNumber: '', address: '' })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchCustomers()
  }, [])

  const fetchCustomers = async () => {
    try {
      const res = await api.get('/customers')
      setCustomers(res.data)
    } catch {
      toast.error('Failed to load customers')
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm({ ...form, [name]: value })
    if (errors[name]) setErrors({ ...errors, [name]: '' })
  }

  const validate = () => {
    const errs = {}
    errs.customerName = validateName(form.customerName, 'Customer name')
    errs.phoneNumber = validatePhone(form.phoneNumber)
    errs.address = validateText(form.address, 'Address')
    setErrors(errs)
    return !Object.values(errs).some(Boolean)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)
    try {
      await api.post('/customers', form)
      toast.success('Customer added successfully')
      setForm({ customerName: '', phoneNumber: '', address: '' })
      setErrors({})
      setShowForm(false)
      fetchCustomers()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add customer')
    } finally {
      setLoading(false)
    }
  }

  const inputClass = (field) => `
    w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition
    ${errors[field] ? 'border-red-400 bg-red-50' : 'border-gray-300'}
  `

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Customers</h2>
        <button
          onClick={() => { setShowForm(!showForm); setForm({ customerName: '', phoneNumber: '', address: '' }); setErrors({}) }}
          className="bg-blue-700 hover:bg-blue-800 text-white px-4 py-2 rounded-lg text-sm font-medium transition flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          {showForm ? 'Cancel' : 'Add New Customer'}
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">New Customer</h3>
          <form onSubmit={handleSubmit} className="space-y-4 max-w-lg">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Customer Name</label>
              <input
                type="text"
                name="customerName"
                value={form.customerName}
                onChange={handleChange}
                className={inputClass('customerName')}
                placeholder="e.g. Jean Pierre"
              />
              {errors.customerName && <p className="text-xs text-red-500 mt-1">{errors.customerName}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
              <input
                type="text"
                name="phoneNumber"
                value={form.phoneNumber}
                onChange={handleChange}
                className={inputClass('phoneNumber')}
                placeholder="e.g. +250788123456"
              />
              {errors.phoneNumber && <p className="text-xs text-red-500 mt-1">{errors.phoneNumber}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
              <textarea
                name="address"
                value={form.address}
                onChange={handleChange}
                rows="2"
                className={inputClass('address')}
                placeholder="e.g. Kigali, Rwanda"
              />
              {errors.address && <p className="text-xs text-red-500 mt-1">{errors.address}</p>}
            </div>
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={loading}
                className="bg-blue-700 hover:bg-blue-800 text-white px-6 py-2.5 rounded-lg font-medium transition disabled:opacity-50"
              >
                {loading ? 'Saving...' : 'Save Customer'}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-6 py-2.5 rounded-lg font-medium transition"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
              <tr>
                <th className="text-left px-4 py-3">#</th>
                <th className="text-left px-4 py-3">Customer Name</th>
                <th className="text-left px-4 py-3">Phone Number</th>
                <th className="text-left px-4 py-3">Address</th>
                <th className="text-left px-4 py-3">Registered</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {customers.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center py-8 text-gray-500">No customers yet. Click "Add New Customer" to create one.</td>
                </tr>
              ) : (
                customers.map((c, i) => (
                  <tr key={c._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-400">{i + 1}</td>
                    <td className="px-4 py-3 font-medium">{c.customerName}</td>
                    <td className="px-4 py-3">{c.phoneNumber}</td>
                    <td className="px-4 py-3">{c.address}</td>
                    <td className="px-4 py-3 text-gray-500">{new Date(c.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
