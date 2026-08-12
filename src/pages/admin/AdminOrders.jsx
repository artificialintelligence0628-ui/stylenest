import { useState, useEffect, useCallback, Fragment } from 'react'
import { useAuth } from '../../context/AuthContext.jsx'
import { adminFetchOrders, adminUpdateOrderStatus } from '../../api/admin.js'
import { fmt } from '../../data/products.js'

const STATUSES = ['RECEIVED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED']

export default function AdminOrders() {
  const { token } = useAuth()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [updatingId, setUpdatingId] = useState(null)
  const [expandedId, setExpandedId] = useState(null)

  const load = useCallback(() => {
    setLoading(true)
    setError('')
    adminFetchOrders(token)
      .then(setOrders)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [token])

  useEffect(() => { load() }, [load])

  const handleStatusChange = async (order, status) => {
    setUpdatingId(order.id)
    try {
      const updated = await adminUpdateOrderStatus(token, order.id, status)
      setOrders(prev => prev.map(o => o.id === order.id ? { ...o, status: updated.status } : o))
    } catch (err) {
      window.alert(err.message)
    } finally {
      setUpdatingId(null)
    }
  }

  return (
    <div>
      <div className="admin-page-head">
        <h1>Orders</h1>
      </div>

      {loading && <div className="admin-empty">Loading…</div>}
      {error && <div className="admin-empty">Couldn't load orders: {error}</div>}

      {!loading && !error && (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Order</th><th>Customer</th><th>Total</th><th>Status</th><th>Placed</th><th></th>
              </tr>
            </thead>
            <tbody>
              {orders.map(o => (
                <Fragment key={o.id}>
                  <tr>
                    <td className="mono">{o.number}</td>
                    <td>{o.customerName}</td>
                    <td className="mono">{fmt(o.total)}</td>
                    <td>
                      <select
                        className="admin-select"
                        value={o.status}
                        disabled={updatingId === o.id}
                        onChange={e => handleStatusChange(o, e.target.value)}
                      >
                        {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </td>
                    <td>{new Date(o.createdAt).toLocaleDateString()}</td>
                    <td>
                      <button onClick={() => setExpandedId(expandedId === o.id ? null : o.id)}>
                        {expandedId === o.id ? 'Hide' : 'Details'}
                      </button>
                    </td>
                  </tr>
                  {expandedId === o.id && (
                    <tr>
                      <td colSpan={6} className="admin-order-details">
                        <div><strong>Phone:</strong> {o.phone} &nbsp;&nbsp; <strong>Email:</strong> {o.email || '—'}</div>
                        <div><strong>Address:</strong> {o.address}{o.city ? `, ${o.city}` : ''}{o.region ? `, ${o.region}` : ''}</div>
                        <div><strong>Payment method:</strong> {o.paymentMethod}</div>
                        <ul>
                          {o.items?.map(item => (
                            <li key={item.id}>
                              {item.name} × {item.qty} ({item.color}, {item.size}) — {fmt(item.price * item.qty)}
                            </li>
                          ))}
                        </ul>
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))}
              {orders.length === 0 && (
                <tr><td colSpan={6} className="admin-empty">No orders yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
