import { useState, useEffect, useCallback, Fragment } from 'react'
import { useNavigate } from 'react-router-dom'
import ProductCard from '../components/ProductCard.jsx'
import { useProducts } from '../hooks/useProducts.js'
import { useStore } from '../context/StoreContext.jsx'
import { useCustomerAuth } from '../context/CustomerAuthContext.jsx'
import { fetchMyOrders } from '../api/orders.js'
import { fmt } from '../data/products.js'

const STATUS_CLASS = {
  RECEIVED: '', PROCESSING: 'processing', SHIPPED: 'shipped',
  DELIVERED: 'delivered', CANCELLED: 'cancelled',
}

function OrderHistory() {
  const { token } = useCustomerAuth()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [expandedId, setExpandedId] = useState(null)

  const load = useCallback(() => {
    setLoading(true)
    setError('')
    fetchMyOrders(token)
      .then(setOrders)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [token])

  useEffect(() => { load() }, [load])

  if (loading) return <div className="empty-hint">Loading your orders…</div>
  if (error) return <div className="empty-hint">Couldn't load your orders: {error}</div>
  if (orders.length === 0) {
    return <div className="empty-hint">You haven't placed any orders yet.</div>
  }

  return (
    <div className="order-history">
      {orders.map(o => (
        <div className="order-row" key={o.id}>
          <div className="order-row-top" onClick={() => setExpandedId(expandedId === o.id ? null : o.id)}>
            <div className="order-row-main">
              <div className="order-row-number">{o.number}</div>
              <div className="order-row-meta">
                {new Date(o.createdAt).toLocaleDateString()} · {o.items?.length || 0} item{o.items?.length === 1 ? '' : 's'}
              </div>
            </div>
            <div className="order-row-right">
              <span className={`order-status-badge ${STATUS_CLASS[o.status] || ''}`}>{o.status}</span>
              <span className="order-row-total mono">{fmt(o.total)}</span>
            </div>
          </div>
          {expandedId === o.id && (
            <div className="order-row-details">
              <ul>
                {o.items?.map(item => (
                  <li key={item.id}>
                    {item.name} × {item.qty} ({item.color}, {item.size}) — {fmt(item.price * item.qty)}
                  </li>
                ))}
              </ul>
              <div className="order-row-address">
                Delivering to: {o.address}{o.city ? `, ${o.city}` : ''}{o.region ? `, ${o.region}` : ''}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

export default function Account() {
  const navigate = useNavigate()
  const { wishlist } = useStore()
  const { products, loading } = useProducts()
  const { user, isAuthenticated, loading: authLoading, logout } = useCustomerAuth()
  const [tab, setTab] = useState('wishlist')
  const items = products.filter(p => wishlist.includes(p.id))

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <div className="wrap">
      <div className="crumb"><button onClick={() => navigate('/')}>Home</button> / My Account</div>
      <section className="section">
        <div className="account-head">
          <h2>My Account</h2>
          {!authLoading && isAuthenticated && (
            <div className="account-head-user">
              <span>Signed in as {user?.name}</span>
              <button className="admin-logout" onClick={handleLogout}>Log out</button>
            </div>
          )}
        </div>

        <div className="account-tabs">
          <button className={tab === 'wishlist' ? 'active' : ''} onClick={() => setTab('wishlist')}>Wishlist</button>
          <button className={tab === 'orders' ? 'active' : ''} onClick={() => setTab('orders')}>Orders</button>
        </div>

        {tab === 'wishlist' && (
          loading ? (
            <div className="empty-hint">Loading…</div>
          ) : items.length ? (
            <div className="grid">
              {items.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          ) : (
            <div className="empty-hint">
              Your wishlist is empty.{' '}
              <button style={{ textDecoration: 'underline' }} onClick={() => navigate('/shop')}>Browse products</button>
            </div>
          )
        )}

        {tab === 'orders' && (
          authLoading ? (
            <div className="empty-hint">Loading…</div>
          ) : isAuthenticated ? (
            <OrderHistory />
          ) : (
            <div className="empty-hint">
              Sign in to see your order history.{' '}
              <button style={{ textDecoration: 'underline' }} onClick={() => navigate('/login')}>Sign In</button>
              {' '}or{' '}
              <button style={{ textDecoration: 'underline' }} onClick={() => navigate('/register')}>Create an account</button>
            </div>
          )
        )}
      </section>
    </div>
  )
}
