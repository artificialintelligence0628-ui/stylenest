import { createContext, useContext, useState, useCallback, useRef } from 'react'
import { createOrder } from '../api/orders.js'

const StoreContext = createContext(null)

export function StoreProvider({ children }) {
  const [cart, setCart] = useState([])
  const [wishlist, setWishlist] = useState([])
  const [cartOpen, setCartOpen] = useState(false)
  const [toastMsg, setToastMsg] = useState(null)
  const [lastOrder, setLastOrder] = useState(null)
  const [placingOrder, setPlacingOrder] = useState(false)
  const toastTimer = useRef(null)

  const showToast = useCallback((msg) => {
    setToastMsg(msg)
    clearTimeout(toastTimer.current)
    toastTimer.current = setTimeout(() => setToastMsg(null), 2200)
  }, [])

  const addToCart = useCallback((product, color, size, qty) => {
    if (product.sizes[0] !== 'One Size' && !size) {
      showToast('Select a size first')
      return false
    }
    const key = `${product.id}|${color}|${size || 'One Size'}`
    setCart(prev => {
      const existing = prev.find(i => i.key === key)
      if (existing) {
        return prev.map(i => i.key === key ? { ...i, qty: i.qty + qty } : i)
      }
      return [...prev, {
        key, id: product.id, name: product.name, price: product.price,
        color, size: size || 'One Size', qty, type: product.type, image: product.image || null,
      }]
    })
    showToast('Added to bag')
    setCartOpen(true)
    return true
  }, [showToast])

  const changeCartQty = useCallback((key, delta) => {
    setCart(prev => prev
      .map(i => i.key === key ? { ...i, qty: i.qty + delta } : i)
      .filter(i => i.qty > 0))
  }, [])

  const removeCartItem = useCallback((key) => {
    setCart(prev => prev.filter(i => i.key !== key))
  }, [])

  const toggleWishlist = useCallback((id) => {
    setWishlist(prev => {
      if (prev.includes(id)) {
        showToast('Removed from wishlist')
        return prev.filter(x => x !== id)
      }
      showToast('Saved to wishlist')
      return [...prev, id]
    })
  }, [showToast])

  const cartCount = cart.reduce((s, i) => s + i.qty, 0)
  const cartSubtotal = cart.reduce((s, i) => s + i.qty * i.price, 0)
  const cartDelivery = cartSubtotal === 0 || cartSubtotal >= 300 ? 0 : 25
  const cartTotal = cartSubtotal + cartDelivery

  // Shared shape for the order-items payload the backend expects — used by
  // both the direct order flow and the Paystack initialize/verify calls.
  const cartItemsPayload = useCallback(() => cart.map(i => ({
    productId: i.id,
    qty: i.qty,
    color: i.color,
    size: i.size,
  })), [cart])

  // Records a completed order in local state (for the confirmation page) and
  // empties the cart. Used after either a direct order or a verified Paystack
  // payment succeeds, so both paths end up in the same place.
  const finalizeOrder = useCallback((apiOrder, name) => {
    const order = {
      number: apiOrder.number,
      items: cart,
      total: apiOrder.total,
      name,
    }
    setLastOrder(order)
    setCart([])
    return order
  }, [cart])

  const placeOrder = useCallback(async (form, token) => {
    setPlacingOrder(true)
    try {
      const payload = {
        items: cartItemsPayload(),
        customerName: form.name,
        email: form.email,
        phone: form.phone,
        address: form.address,
        city: form.city,
        region: form.region,
        paymentMethod: form.paymentMethod,
      }
      const apiOrder = await createOrder(payload, token)
      const order = finalizeOrder(apiOrder, form.name)
      return { ok: true, order }
    } catch (err) {
      return { ok: false, error: err.message }
    } finally {
      setPlacingOrder(false)
    }
  }, [cartItemsPayload, finalizeOrder])

  const value = {
    cart, wishlist, cartOpen, toastMsg, lastOrder, placingOrder,
    setCartOpen, addToCart, changeCartQty, removeCartItem, toggleWishlist,
    cartCount, cartSubtotal, cartDelivery, cartTotal, showToast, placeOrder,
    cartItemsPayload, finalizeOrder,
  }

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
}

export function useStore() {
  const ctx = useContext(StoreContext)
  if (!ctx) throw new Error('useStore must be used inside StoreProvider')
  return ctx
}
