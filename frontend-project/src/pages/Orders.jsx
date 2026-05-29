import { useState, useEffect } from 'react'
import api from '../api/axios'
import toast from 'react-hot-toast'
import { validateProductName, validatePositiveNumber, validateRequired } from '../utils/validation'

export default function Orders() {
  const [orders, setOrders] = useState([])
  const [customers, setCustomers] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({
    customer: '',
    productName: '',
    orderedQuantity: '',
    unitPrice: '',
  })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchOrders()
    fetchCustomers()
  }, [])

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
    setForm({ ...form, [name]: value })
    if (errors[name]) setErrors({ ...errors, [name]: '' })
  }

  const validate = () => {
    const errs = {}
    errs.customer = validateRequired(form.customer, 'Customer')
    errs.productName = validateProductName(form.productName)
    errs.orderedQuantity = validatePositiveNumber(form.orderedQuantity, 'Quantity')
    errs.unitPrice = validatePositiveNumber(form.unitPrice, 'Unit price')
    setErrors(errs)
    return !Object.values(errs).some(Boolean)
  }

  const calculateTotal = () => {
    const qty = parseFloat(form.orderedQuantity) || 0
    const price = parseFloat(form.unitPrice) || 0
    return qty * price
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)
    try {
      await api.post('/orders', {
        customer: form.customer,
        productName: form.productName,
        orderedQuantity: parseFloat(form.orderedQuantity),
        unitPrice: parseFloat(form.unitPrice),
      })
      toast.success('Order created successfully')
      setForm({ customer: '', productName: '', orderedQuantity: '', unitPrice: '' })
      setErrors({})
      setShowForm(false)
      fetchOrders()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create order')
    } finally {
      setLoading(false)
    }
  }

  const inputClass = (field) => `
    w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition
    ${errors[field] ? 'border-red-400 bg-red-50' : 'border-gray-300'}
  `

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Orders</h2>
        <button
          onClick={() => { setShowForm(!showForm); setForm({ customer: '', productName: '', orderedQuantity: '', unitPrice: '' }); setErrors({}) }}
          className="bg-blue-700 hover:bg-blue-800 text-white px-4 py-2 rounded-lg text-sm font-medium transition flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          {showForm ? 'Cancel' : 'Add New Order'}
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">New Order</h3>
          <form onSubmit={handleSubmit} className="space-y-4 max-w-lg">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Customer</label>
              <select
                name="customer"
                value={form.customer}
                onChange={handleChange}
                className={`${inputClass('customer')} bg-white`}
              >
                <option value="">Select a customer</option>
                {customers.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.customerName} - {c.phoneNumber}
                  </option>
                ))}
              </select>
              {errors.customer && <p className="text-xs text-red-500 mt-1">{errors.customer}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
              <input
                type="text"
                name="productName"
                value={form.productName}
                onChange={handleChange}
                className={inputClass('productName')}
                placeholder="e.g. Laptop HP"
              />
              {errors.productName && <p className="text-xs text-red-500 mt-1">{errors.productName}</p>}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                <input
                  type="number"
                  name="orderedQuantity"
                  value={form.orderedQuantity}
                  onChange={handleChange}
                  min="1"
                  className={inputClass('orderedQuantity')}
                  placeholder="Qty"
                />
                {errors.orderedQuantity && <p className="text-xs text-red-500 mt-1">{errors.orderedQuantity}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Unit Price (RWF)</label>
                <input
                  type="number"
                  name="unitPrice"
                  value={form.unitPrice}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  className={inputClass('unitPrice')}
                  placeholder="Price"
                />
                {errors.unitPrice && <p className="text-xs text-red-500 mt-1">{errors.unitPrice}</p>}
              </div>
            </div>
            {calculateTotal() > 0 && (
              <div className="bg-blue-50 p-3 rounded-lg">
                <p className="text-sm text-blue-800">
                  Total Amount: <span className="font-bold">{calculateTotal().toLocaleString()} RWF</span>
                </p>
              </div>
            )}
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={loading}
                className="bg-blue-700 hover:bg-blue-800 text-white px-6 py-2.5 rounded-lg font-medium transition disabled:opacity-50"
              >
                {loading ? 'Saving...' : 'Save Order'}
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
                <th className="text-left px-4 py-3">Customer</th>
                <th className="text-left px-4 py-3">Product</th>
                <th className="text-right px-4 py-3">Qty</th>
                <th className="text-right px-4 py-3">Unit Price</th>
                <th className="text-right px-4 py-3">Total</th>
                <th className="text-left px-4 py-3">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {orders.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-8 text-gray-500">No orders yet. Click "Add New Order" to create one.</td>
                </tr>
              ) : (
                orders.map((o, i) => (
                  <tr key={o._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-400">{i + 1}</td>
                    <td className="px-4 py-3 font-medium">{o.customer?.customerName}</td>
                    <td className="px-4 py-3">{o.productName}</td>
                    <td className="px-4 py-3 text-right">{o.orderedQuantity}</td>
                    <td className="px-4 py-3 text-right">{o.unitPrice?.toLocaleString()} RWF</td>
                    <td className="px-4 py-3 text-right font-medium">{o.totalAmount?.toLocaleString()} RWF</td>
                    <td className="px-4 py-3 text-gray-500">{new Date(o.orderDate).toLocaleDateString()}</td>
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
