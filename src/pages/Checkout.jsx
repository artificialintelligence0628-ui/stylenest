import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../context/StoreContext.jsx'
import { useCustomerAuth } from '../context/CustomerAuthContext.jsx'
import { initializePayment, verifyPayment } from '../api/payments.js'
import { fmt } from '../data/products.js'

const PAYSTACK_PUBLIC_KEY = import.meta.env?.VITE_PAYSTACK_PUBLIC_KEY || ''

export default function Checkout() {
  const navigate = useNavigate()
  const {
    cart, cartSubtotal, cartDelivery, cartTotal, placeOrder, placingOrder,
    showToast, cartItemsPayload, finalizeOrder,
  } = useStore()
  const { user, token, isAuthenticated } = useCustomerAuth()
  const [payment, setPayment] = useState('momo')
  const [form, setForm] = useState({ name: '', phone: '', email: '', address: '', city: '', region: 'Greater Accra' })
  const [payingWithPaystack, setPayingWithPaystack] = useState(false)

  useEffect(() => {
    if (isAuthenticated && user) {
      setForm(f => ({
        ...f,
        name: f.name || user.name || '',
        email: f.email || user.email || '',
        phone: f.phone || user.phone || '',
      }))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated])

  const update = (key) => (e) => setForm(f => ({ ...f, [key]: e.target.value }))

  if (cart.length === 0) {
    return (
      <div className="wrap">
        <div className="confirm">
          <h2>Your bag is empty</h2>
          <p>Add something you love before checking out.</p>
          <button className="btn btn-primary" onClick={() => navigate('/shop')}>Shop Now</button>
        </div>
      </div>
    )
  }

  // Mobile Money and Card both route through Paystack's own secure popup —
  // it presents the right channel (MoMo number entry or card entry) itself,
  // so this store never touches raw card numbers or MoMo PINs directly.
  const payWithPaystack = () => new Promise((resolve, reject) => {
    if (!window.PaystackPop) {
      reject(new Error('Payment system failed to load. Check your connection and try again.'))
      return
    }
    if (!PAYSTACK_PUBLIC_KEY) {
      reject(new Error('Payments are not configured yet — missing Paystack public key.'))
      return
    }
    if (!form.email) {
      reject(new Error('Email is required to pay by Mobile Money or Card.'))
      return
    }

    initializePayment({ items: cartItemsPayload(), email: form.email }, token)
      .then(({ reference, amount }) => {
        const handler = window.PaystackPop.setup({
          key: PAYSTACK_PUBLIC_KEY,
          email: form.email,
          amount: Math.round(amount * 100),
          currency: 'GHS',
          ref: reference,
          onClose: () => reject(new Error('Payment was cancelled.')),
          callback: (response) => {
            verifyPayment({
              reference: response.reference,
              items: cartItemsPayload(),
              customerName: form.name,
              email: form.email,
              phone: form.phone,
              address: form.address,
              city: form.city,
              region: form.region,
            }, token).then(resolve).catch(reject)
          },
        })
        handler.openIframe()
      })
      .catch(reject)
  })

  const submit = async () => {
    if (!form.name || !form.address) {
      showToast('Please fill in your name and address')
      return
    }

    if (payment === 'bank') {
      const result = await placeOrder({ ...form, paymentMethod: payment }, token)
      if (result.ok) {
        navigate('/confirmation')
      } else {
        showToast(result.error || 'Something went wrong placing your order')
      }
      return
    }

    setPayingWithPaystack(true)
    try {
      const apiOrder = await payWithPaystack()
      finalizeOrder(apiOrder, form.name)
      navigate('/confirmation')
    } catch (err) {
      showToast(err.message || 'Payment failed')
    } finally {
      setPayingWithPaystack(false)
    }
  }

  const busy = placingOrder || payingWithPaystack

  return (
    <div className="wrap">
      <div className="crumb"><button onClick={() => navigate('/')}>Home</button> / Checkout</div>
      <div className="co-layout">
        <div>
          <div className="co-steps">
            <span className="active">1. Delivery Details</span>
            <span className="active">2. Payment</span>
          </div>

          <div className="co-section">
            <h3>Contact &amp; Delivery Address</h3>
            <div className="field-row">
              <div className="field"><label>Full Name</label><input placeholder="Ama Mensah" value={form.name} onChange={update('name')} /></div>
              <div className="field"><label>Phone Number</label><input placeholder="024 000 0000" value={form.phone} onChange={update('phone')} /></div>
            </div>
            <div className="field-row">
              <div className="field full"><label>Email</label><input type="email" placeholder="you@email.com" value={form.email} onChange={update('email')} /></div>
            </div>
            <div className="field-row">
              <div className="field full"><label>Delivery Address</label><input placeholder="House number, street, area" value={form.address} onChange={update('address')} /></div>
            </div>
            <div className="field-row">
              <div className="field"><label>City / Town</label><input placeholder="Accra" value={form.city} onChange={update('city')} /></div>
              <div className="field">
                <label>Region</label>
                <select value={form.region} onChange={update('region')}>
                  <option>Greater Accra</option>
                  <option>Ashanti</option>
                  <option>Western</option>
                  <option>Eastern</option>
                  <option>Central</option>
                  <option>Northern</option>
                  <option>Other</option>
                </select>
              </div>
            </div>
          </div>

          <div className="co-section">
            <h3>Payment Method</h3>
            <label className={`pay-opt ${payment === 'momo' ? 'sel' : ''}`} onClick={() => setPayment('momo')}>
              <input type="radio" name="pay" checked={payment === 'momo'} readOnly />
              <div><strong>Mobile Money</strong><div style={{ fontSize: 12, color: 'var(--muted)' }}>MTN MoMo, Telecel Cash, AirtelTigo Money — via Paystack</div></div>
            </label>
            <label className={`pay-opt ${payment === 'card' ? 'sel' : ''}`} onClick={() => setPayment('card')}>
              <input type="radio" name="pay" checked={payment === 'card'} readOnly />
              <div><strong>Visa / Mastercard</strong><div style={{ fontSize: 12, color: 'var(--muted)' }}>Pay securely with your debit or credit card — via Paystack</div></div>
            </label>
            <label className={`pay-opt ${payment === 'bank' ? 'sel' : ''}`} onClick={() => setPayment('bank')}>
              <input type="radio" name="pay" checked={payment === 'bank'} readOnly />
              <div><strong>Bank Transfer</strong><div style={{ fontSize: 12, color: 'var(--muted)' }}>Direct transfer, confirmed within 1 business day</div></div>
            </label>

            {(payment === 'momo' || payment === 'card') && (
              <div className="pay-note">
                You'll enter your {payment === 'momo' ? 'Mobile Money number' : 'card details'} securely on the next step — we never see or store it directly.
              </div>
            )}
          </div>

          <button className="btn btn-primary btn-full" onClick={submit} disabled={busy}>
            {busy
              ? (payingWithPaystack ? 'Waiting for payment…' : 'Placing Order…')
              : payment === 'bank'
                ? `Place Order — ${fmt(cartTotal)}`
                : `Pay ${fmt(cartTotal)}`}
          </button>
        </div>

        <div className="order-summary">
          <h3>Order Summary</h3>
          {cart.map(i => (
            <div className="os-item" key={i.key}>
              <span>{i.name} × {i.qty} <span style={{ color: 'var(--muted)' }}>({i.color}{i.size !== 'One Size' ? `, ${i.size}` : ''})</span></span>
              <span className="mono">{fmt(i.price * i.qty)}</span>
            </div>
          ))}
          <div className="sum-row" style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--line)' }}>
            <span>Subtotal</span><span className="mono">{fmt(cartSubtotal)}</span>
          </div>
          <div className="sum-row"><span>Delivery</span><span className="mono">{cartDelivery === 0 ? 'Free' : fmt(cartDelivery)}</span></div>
          <div className="sum-row total"><span>Total</span><span className="mono">{fmt(cartTotal)}</span></div>
        </div>
      </div>
    </div>
  )
}
