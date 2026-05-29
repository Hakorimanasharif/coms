import { useState, useEffect } from 'react'
import api from '../api/axios'
import toast from 'react-hot-toast'
import { validatePositiveNumber, validateRequired, validateDate } from '../utils/validation'

const paymentMethods = ['Cash', 'Mobile Money', 'Bank Transfer', 'Credit Card']

export default function Payments() {
  const [payments, setPayments] = useState([])
  const [orders, setOrders] = useState([])
  const [customers, setCustomers] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})

  const [form, setForm] = useState({
    order: '',
    customer: '',
    paymentAmount: '',
    paymentMethod: 'Cash',
    paymentDate: new Date().toISOString().split('T')[0],
  })

  useEffect(() => {
    fetchPayments()
    fetchOrders()
    fetchCustomers()
  }, [])

  const fetchPayments = async () => {
    try {
      const res = await api.get('/payments')
      setPayments(res.data)
    } catch {
      toast.error('Failed to load payments')
    }
  }

  const fetchOrders = async () => {
    try {
      const res = await api.get('/orders')
      setOrders(res.data)
    } catch {
      toast.error('Failed to load orders')
    }
  }

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
    setForm((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) setErrors({ ...errors, [name]: '' })

    if (name === 'order') {
      const selectedOrder = orders.find((o) => o._id === value)
      if (selectedOrder && selectedOrder.customer) {
        setForm((prev) => ({
          ...prev,
          order: value,
          customer: selectedOrder.customer._id || selectedOrder.customer,
          paymentAmount: selectedOrder.totalAmount,
        }))
      }
    }
  }

  const validate = () => {
    const errs = {}
    errs.order = validateRequired(form.order, 'Order')
    errs.paymentAmount = validatePositiveNumber(form.paymentAmount, 'Payment amount')
    errs.paymentDate = validateDate(form.paymentDate)
    setErrors(errs)
    return !Object.values(errs).some(Boolean)
  }

  const resetForm = () => {
    setForm({
      order: '',
      customer: '',
      paymentAmount: '',
      paymentMethod: 'Cash',
      paymentDate: new Date().toISOString().split('T')[0],
    })
    setErrors({})
    setEditing(null)
    setShowForm(false)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)
    try {
      if (editing) {
        await api.put(`/payments/${editing}`, form)
        toast.success('Payment updated successfully')
      } else {
        await api.post('/payments', form)
        toast.success('Payment recorded successfully')
      }
      resetForm()
      fetchPayments()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Operation failed')
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (payment) => {
    setForm({
      order: payment.order?._id || '',
      customer: payment.customer?._id || '',
      paymentAmount: payment.paymentAmount,
      paymentMethod: payment.paymentMethod,
      paymentDate: new Date(payment.paymentDate).toISOString().split('T')[0],
    })
    setEditing(payment._id)
    setErrors({})
    setShowForm(true)
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this payment?')) return
    try {
      await api.delete(`/payments/${id}`)
      toast.success('Payment deleted successfully')
      fetchPayments()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed')
    }
  }

  const inputClass = (field) => `
    w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition
    ${errors[field] ? 'border-red-400 bg-red-50' : 'border-gray-300'}
  `

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Payments</h2>
        <button
          onClick={() => { resetForm(); setShowForm(!showForm) }}
          className="bg-blue-700 hover:bg-blue-800 text-white px-4 py-2 rounded-lg text-sm font-medium transition flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          {showForm ? 'Cancel' : 'Add Payment'}
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            {editing ? 'Edit Payment' : 'New Payment'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Order</label>
                <select
                  name="order"
                  value={form.order}
                  onChange={handleChange}
                  className={`${inputClass('order')} bg-white`}
                >
                  <option value="">Select an order</option>
                  {orders.map((o) => (
                    <option key={o._id} value={o._id}>
                      {o.productName} - {o.totalAmount?.toLocaleString()} RWF
                    </option>
                  ))}
                </select>
                {errors.order && <p className="text-xs text-red-500 mt-1">{errors.order}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
                <select
                  name="paymentMethod"
                  value={form.paymentMethod}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition bg-white"
                >
                  {paymentMethods.map((m) => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Payment Amount (RWF)</label>
                <input
                  type="number"
                  name="paymentAmount"
                  value={form.paymentAmount}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  className={inputClass('paymentAmount')}
                />
                {errors.paymentAmount && <p className="text-xs text-red-500 mt-1">{errors.paymentAmount}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Payment Date</label>
                <input
                  type="date"
                  name="paymentDate"
                  value={form.paymentDate}
                  onChange={handleChange}
                  max={new Date().toISOString().split('T')[0]}
                  className={inputClass('paymentDate')}
                />
                {errors.paymentDate && <p className="text-xs text-red-500 mt-1">{errors.paymentDate}</p>}
              </div>
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={loading}
                className="bg-blue-700 hover:bg-blue-800 text-white px-6 py-2.5 rounded-lg font-medium transition disabled:opacity-50"
              >
                {loading ? 'Saving...' : editing ? 'Update Payment' : 'Save Payment'}
              </button>
              <button
                type="button"
                onClick={resetForm}
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
                <th className="text-left px-4 py-3">Customer</th>
                <th className="text-left px-4 py-3">Product</th>
                <th className="text-right px-4 py-3">Amount</th>
                <th className="text-left px-4 py-3">Method</th>
                <th className="text-left px-4 py-3">Date</th>
                <th className="text-center px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {payments.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-8 text-gray-500">No payments recorded yet</td>
                </tr>
              ) : (
                payments.map((p) => (
                  <tr key={p._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">{p.customer?.customerName || 'N/A'}</td>
                    <td className="px-4 py-3">{p.order?.productName || 'N/A'}</td>
                    <td className="px-4 py-3 text-right font-medium">
                      {p.paymentAmount?.toLocaleString()} RWF
                    </td>
                    <td className="px-4 py-3">{p.paymentMethod}</td>
                    <td className="px-4 py-3">{new Date(p.paymentDate).toLocaleDateString()}</td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleEdit(p)}
                          className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded text-xs font-medium transition"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(p._id)}
                          className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-xs font-medium transition"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
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
