import { useNavigate } from 'react-router-dom'
import { CheckIcon } from '../components/Icons.jsx'
import { useStore } from '../context/StoreContext.jsx'

const STEPS = ['Received', 'Processing', 'Shipped', 'Delivered']

export default function Confirmation() {
  const navigate = useNavigate()
  const { lastOrder } = useStore()

  if (!lastOrder) {
    navigate('/')
    return null
  }

  return (
    <div className="wrap">
      <div className="confirm">
        <CheckIcon />
        <h2>Thank you, {lastOrder.name.split(' ')[0]}.</h2>
        <p>Your order has been placed. A confirmation has been sent to your email with delivery updates.</p>
        <div className="order-num">Order {lastOrder.number}</div>
        <div className="track-steps">
          {STEPS.map((s, i) => (
            <div className={`track-step ${i === 0 ? 'done' : ''}`} key={s}>
              <div className="track-dot" />
              <span>{s}</span>
            </div>
          ))}
        </div>
        <button className="btn btn-primary" onClick={() => navigate('/shop')}>Continue Shopping</button>
      </div>
    </div>
  )
}
