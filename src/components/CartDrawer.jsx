import { useNavigate } from 'react-router-dom'
import GarmentIcon from './GarmentIcon.jsx'
import { CloseIcon, BagIcon } from './Icons.jsx'
import { useStore } from '../context/StoreContext.jsx'
import { fmt } from '../data/products.js'

export default function CartDrawer() {
  const navigate = useNavigate()
  const {
    cart, cartOpen, setCartOpen, changeCartQty, removeCartItem,
    cartCount, cartSubtotal, cartDelivery, cartTotal,
  } = useStore()

  const close = () => setCartOpen(false)

  return (
    <>
      <div className={`overlay ${cartOpen ? 'show' : ''}`} onClick={close} />
      <div className={`drawer ${cartOpen ? 'show' : ''}`}>
        <div className="drawer-head">
          <h3>Your Bag ({cartCount})</h3>
          <button className="icon-btn" onClick={close}><CloseIcon /></button>
        </div>
        <div className="drawer-body">
          {cart.length === 0 ? (
            <div className="empty-state">
              <BagIcon />
              <div>Your bag is empty</div>
            </div>
          ) : cart.map(i => (
            <div className="cart-item" key={i.key}>
              <div className="cart-item-art">
                {i.image
                  ? <img src={i.image} alt={i.name} />
                  : <GarmentIcon type={i.type} color="#c9a86a" />}
              </div>
              <div className="cart-item-info">
                <div className="cart-item-name">{i.name}</div>
                <div className="cart-item-meta">{i.color}{i.size !== 'One Size' ? ` · ${i.size}` : ''}</div>
                <div className="cart-item-row">
                  <div className="mini-qty">
                    <button onClick={() => changeCartQty(i.key, -1)}>−</button>
                    <span>{i.qty}</span>
                    <button onClick={() => changeCartQty(i.key, 1)}>+</button>
                  </div>
                  <span className="mono">{fmt(i.price * i.qty)}</span>
                </div>
                <button className="remove-link" onClick={() => removeCartItem(i.key)}>Remove</button>
              </div>
            </div>
          ))}
        </div>
        {cart.length > 0 && (
          <div className="drawer-foot">
            <div className="sum-row"><span>Subtotal</span><span className="mono">{fmt(cartSubtotal)}</span></div>
            <div className="sum-row"><span>Delivery</span><span className="mono">{cartDelivery === 0 ? 'Free' : fmt(cartDelivery)}</span></div>
            <div className="sum-row total"><span>Total</span><span className="mono">{fmt(cartTotal)}</span></div>
            <button
              className="btn btn-primary btn-full"
              style={{ marginTop: 14 }}
              onClick={() => { close(); navigate('/checkout') }}
            >
              Checkout
            </button>
          </div>
        )}
      </div>
    </>
  )
}
