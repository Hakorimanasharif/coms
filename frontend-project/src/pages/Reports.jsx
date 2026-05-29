import { useState, useEffect } from 'react'
import api from '../api/axios'
import toast from 'react-hot-toast'
import jsPDF from 'jspdf'
import { applyPlugin } from 'jspdf-autotable'
applyPlugin(jsPDF)

function formatDate(d) {
  return new Date(d).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
  })
}

export default function Reports() {
  const [activeTab, setActiveTab] = useState('daily-orders')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [dailyReport, setDailyReport] = useState(null)
  const [paymentReport, setPaymentReport] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (activeTab === 'daily-orders') {
      fetchDailyReport()
    } else {
      fetchPaymentReport()
    }
  }, [activeTab])

  const fetchDailyReport = async (downloadPdf = false) => {
    setLoading(true)
    try {
      const res = await api.get(`/reports/daily-orders?date=${date}`)
      setDailyReport(res.data)
      if (res.data.orders?.length === 0) {
        toast('No orders found for this date', { icon: '📋' })
      }
      if (downloadPdf && res.data.orders?.length > 0) {
        generateDailyPDF(res.data)
      }
    } catch {
      toast.error('Failed to load daily report')
    } finally {
      setLoading(false)
    }
  }

  const fetchPaymentReport = async (downloadPdf = false) => {
    setLoading(true)
    try {
      const res = await api.get('/reports/payment-status')
      setPaymentReport(res.data)
      if (downloadPdf && res.data.length > 0) {
        generatePaymentPDF(res.data)
      }
    } catch {
      toast.error('Failed to load payment report')
    } finally {
      setLoading(false)
    }
  }

  const generateDailyPDF = (data) => {
    const report = data || dailyReport
    if (!report || report.orders.length === 0) {
      toast.error('No data to generate PDF')
      return
    }
    const doc = new jsPDF()
    const pageW = doc.internal.pageSize.getWidth()

    doc.setFontSize(18)
    doc.setTextColor(30, 64, 175)
    doc.text('DAB Enterprise Ltd', pageW / 2, 20, { align: 'center' })
    doc.setFontSize(11)
    doc.setTextColor(100)
    doc.text('Daily Orders Report', pageW / 2, 28, { align: 'center' })
    doc.text(`Date: ${report.date}`, pageW / 2, 35, { align: 'center' })

    doc.setDrawColor(200)
    doc.line(14, 40, pageW - 14, 40)

    doc.setFontSize(10)
    doc.setTextColor(60)
    doc.text(`Total Orders: ${report.totalOrders}`, 14, 50)
    doc.text(`Total Revenue: ${report.totalRevenue.toLocaleString()} RWF`, 14, 57)

    const rows = report.orders.map((o, i) => [
      i + 1,
      o.customer?.customerName || 'N/A',
      o.productName,
      o.orderedQuantity,
      `${o.unitPrice.toLocaleString()} RWF`,
      `${o.totalAmount.toLocaleString()} RWF`,
    ])

    doc.autoTable({
      startY: 65,
      head: [['#', 'Customer', 'Product', 'Qty', 'Unit Price', 'Total']],
      body: rows,
      theme: 'grid',
      headStyles: { fillColor: [30, 64, 175], textColor: 255, fontSize: 9 },
      bodyStyles: { fontSize: 8 },
      styles: { halign: 'center' },
      columnStyles: {
        0: { cellWidth: 10 },
        4: { halign: 'right' },
        5: { halign: 'right' },
      },
    })

    doc.save(`daily-orders-${report.date}.pdf`)
    toast.success('PDF downloaded')
  }

  const generatePaymentPDF = (data) => {
    const report = data || paymentReport
    if (report.length === 0) {
      toast.error('No data to generate PDF')
      return
    }
    const doc = new jsPDF()
    const pageW = doc.internal.pageSize.getWidth()

    doc.setFontSize(18)
    doc.setTextColor(30, 64, 175)
    doc.text('DAB Enterprise Ltd', pageW / 2, 20, { align: 'center' })
    doc.setFontSize(11)
    doc.setTextColor(100)
    doc.text('Payment Status Report', pageW / 2, 28, { align: 'center' })
    doc.text(`Generated: ${formatDate(new Date())}`, pageW / 2, 35, { align: 'center' })

    doc.setDrawColor(200)
    doc.line(14, 40, pageW - 14, 40)

    const rows = report.map((p, i) => [
      i + 1,
      p.customerName,
      p.productName,
      `${p.orderTotal.toLocaleString()} RWF`,
      `${p.paymentAmount.toLocaleString()} RWF`,
      p.paymentMethod,
      formatDate(p.paymentDate),
      p.paymentAmount >= p.orderTotal ? 'Paid' : 'Partial',
    ])

    doc.autoTable({
      startY: 45,
      head: [['#', 'Customer', 'Product', 'Order Total', 'Paid', 'Method', 'Date', 'Status']],
      body: rows,
      theme: 'grid',
      headStyles: { fillColor: [30, 64, 175], textColor: 255, fontSize: 8 },
      bodyStyles: { fontSize: 7 },
      styles: { halign: 'center' },
      columnStyles: {
        0: { cellWidth: 8 },
        3: { halign: 'right' },
        4: { halign: 'right' },
      },
    })

    doc.save(`payment-status-${new Date().toISOString().split('T')[0]}.pdf`)
    toast.success('PDF downloaded')
  }

  return (
    <div className="max-w-6xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Reports</h2>

      <div className="flex border-b border-gray-300 mb-6">
        <button
          onClick={() => setActiveTab('daily-orders')}
          className={`px-5 py-2.5 text-sm font-medium transition ${
            activeTab === 'daily-orders'
              ? 'border-b-2 border-blue-700 text-blue-700'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Daily Orders Report
        </button>
        <button
          onClick={() => setActiveTab('payment-status')}
          className={`px-5 py-2.5 text-sm font-medium transition ${
            activeTab === 'payment-status'
              ? 'border-b-2 border-blue-700 text-blue-700'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Payment Status Report
        </button>
      </div>

      {activeTab === 'daily-orders' && (
        <div>
          <div className="flex flex-wrap items-center gap-3 mb-6">
            <label className="text-sm font-medium text-gray-700">Select Date:</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
            />
            <button
              onClick={() => fetchDailyReport(true)}
              className="bg-blue-700 hover:bg-blue-800 text-white px-5 py-2.5 rounded-lg text-sm font-medium transition flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Generate Report
            </button>
          </div>

          {loading ? (
            <div className="text-center py-8 text-gray-500">Loading...</div>
          ) : dailyReport ? (
            <div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-white rounded-xl shadow-md p-5">
                  <p className="text-sm text-gray-500">Report Date</p>
                  <p className="text-xl font-bold text-gray-800">{dailyReport.date}</p>
                </div>
                <div className="bg-white rounded-xl shadow-md p-5">
                  <p className="text-sm text-gray-500">Total Orders</p>
                  <p className="text-xl font-bold text-blue-700">{dailyReport.totalOrders}</p>
                </div>
                <div className="bg-white rounded-xl shadow-md p-5">
                  <p className="text-sm text-gray-500">Total Revenue</p>
                  <p className="text-xl font-bold text-green-700">
                    {dailyReport.totalRevenue?.toLocaleString()} RWF
                  </p>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-md overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
                      <tr>
                        <th className="text-left px-4 py-3">Customer</th>
                        <th className="text-left px-4 py-3">Phone</th>
                        <th className="text-left px-4 py-3">Product</th>
                        <th className="text-right px-4 py-3">Qty</th>
                        <th className="text-right px-4 py-3">Unit Price</th>
                        <th className="text-right px-4 py-3">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {dailyReport.orders?.length === 0 ? (
                        <tr>
                          <td colSpan="6" className="text-center py-8 text-gray-500">No orders on this date</td>
                        </tr>
                      ) : (
                        dailyReport.orders?.map((o) => (
                          <tr key={o._id} className="hover:bg-gray-50">
                            <td className="px-4 py-3">{o.customer?.customerName}</td>
                            <td className="px-4 py-3">{o.customer?.phoneNumber}</td>
                            <td className="px-4 py-3">{o.productName}</td>
                            <td className="px-4 py-3 text-right">{o.orderedQuantity}</td>
                            <td className="px-4 py-3 text-right">{o.unitPrice?.toLocaleString()} RWF</td>
                            <td className="px-4 py-3 text-right font-medium">{o.totalAmount?.toLocaleString()} RWF</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      )}

      {activeTab === 'payment-status' && (
        <div>
          {loading ? (
            <div className="text-center py-8 text-gray-500">Loading...</div>
          ) : (
            <div>
              {paymentReport.length > 0 && (
                <div className="flex justify-end mb-3">
                  <button
                    onClick={() => generatePaymentPDF()}
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Download PDF
                  </button>
                </div>
              )}

              <div className="bg-white rounded-xl shadow-md overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
                      <tr>
                        <th className="text-left px-4 py-3">Customer Name</th>
                        <th className="text-left px-4 py-3">Product Name</th>
                        <th className="text-right px-4 py-3">Order Total</th>
                        <th className="text-right px-4 py-3">Payment Amount</th>
                        <th className="text-left px-4 py-3">Method</th>
                        <th className="text-left px-4 py-3">Payment Date</th>
                        <th className="text-left px-4 py-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {paymentReport.length === 0 ? (
                        <tr>
                          <td colSpan="7" className="text-center py-8 text-gray-500">No payments found</td>
                        </tr>
                      ) : (
                        paymentReport.map((p, i) => (
                          <tr key={i} className="hover:bg-gray-50">
                            <td className="px-4 py-3">{p.customerName}</td>
                            <td className="px-4 py-3">{p.productName}</td>
                            <td className="px-4 py-3 text-right">{p.orderTotal?.toLocaleString()} RWF</td>
                            <td className="px-4 py-3 text-right font-medium">{p.paymentAmount?.toLocaleString()} RWF</td>
                            <td className="px-4 py-3">{p.paymentMethod}</td>
                            <td className="px-4 py-3">{formatDate(p.paymentDate)}</td>
                            <td className="px-4 py-3">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                p.paymentAmount >= p.orderTotal
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-yellow-100 text-yellow-800'
                              }`}>
                                {p.paymentAmount >= p.orderTotal ? 'Paid' : 'Partial'}
                              </span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
