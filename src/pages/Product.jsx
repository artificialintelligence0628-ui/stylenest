import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import GarmentIcon from '../components/GarmentIcon.jsx'
import ProductCard from '../components/ProductCard.jsx'
import { fmt } from '../data/products.js'
import { fetchProduct, fetchProducts } from '../api/products.js'
import { useStore } from '../context/StoreContext.jsx'

export default function Product() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { addToCart, wishlist, toggleWishlist } = useStore()

  const [product, setProduct] = useState(null)
  const [related, setRelated] = useState([])
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  const [color, setColor] = useState('')
  const [size, setSize] = useState(null)
  const [qty, setQty] = useState(1)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setNotFound(false)
    setProduct(null)
    setColor('')
    setSize(null)
    setQty(1)

    fetchProduct(id)
      .then(async (p) => {
        if (cancelled) return
        setProduct(p)
        setColor(p.colors[0]?.n || '')
        const sameCategory = await fetchProducts({ category: p.cat })
        if (!cancelled) {
          setRelated(sameCategory.filter(r => r.id !== p.id).slice(0, 4))
        }
      })
      .catch(() => { if (!cancelled) setNotFound(true) })
      .finally(() => { if (!cancelled) setLoading(false) })

    return () => { cancelled = true }
  }, [id])

  if (loading) {
    return (
      <div className="wrap">
        <div className="confirm"><h2>Loading…</h2></div>
      </div>
    )
  }

  if (notFound || !product) {
    return (
      <div className="wrap">
        <div className="confirm">
          <h2>Product not found</h2>
          <button className="btn btn-primary" onClick={() => navigate('/shop')}>Back to Shop</button>
        </div>
      </div>
    )
  }

  const wished = wishlist.includes(product.id)
  const colorObj = product.colors.find(c => c.n === color) || product.colors[0]

  return (
    <div className="wrap">
      <div className="crumb">
        <button onClick={() => navigate('/')}>Home</button> / <button onClick={() => navigate('/shop')}>Shop</button> / {product.cat} / {product.name}
      </div>
      <div className="pd-layout">
        <div className="pd-art">
          {product.image
            ? <img src={product.image} alt={product.name} />
            : <GarmentIcon type={product.type} color={colorObj.h} />}
        </div>
        <div>
          <div className="pd-cat">{product.cat}{product.tag ? ` · ${product.tag}` : ''}</div>
          <h1 className="pd-name">{product.name}</h1>
          <div className="pd-price">
            {product.was && <span className="was">{fmt(product.was)}</span>}
            {fmt(product.price)}
          </div>
          <p className="pd-desc">{product.desc}</p>

          <div className="pd-block">
            <h4>Color — {color}</h4>
            <div className="pd-colors">
              {product.colors.map(c => (
                <div
                  key={c.n}
                  className={`pd-color ${c.n === color ? 'sel' : ''}`}
                  style={{ background: c.h }}
                  onClick={() => setColor(c.n)}
                />
              ))}
            </div>
          </div>

          {product.sizes[0] !== 'One Size' && (
            <div className="pd-block">
              <h4>Size {size ? `— ${size}` : ''}</h4>
              <div className="pd-sizes">
                {product.sizes.map(s => (
                  <div
                    key={s}
                    className={`pd-size ${s === size ? 'sel' : ''}`}
                    onClick={() => setSize(s)}
                  >
                    {s}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="pd-block">
            <h4>Quantity</h4>
            <div className="qty-row">
              <button onClick={() => setQty(q => Math.max(1, q - 1))}>−</button>
              <span>{qty}</span>
              <button onClick={() => setQty(q => q + 1)}>+</button>
            </div>
          </div>

          <div className="pd-actions">
            <button
              className="btn btn-primary"
              style={{ flex: 1 }}
              onClick={() => addToCart(product, color, size, qty)}
            >
              Add to Bag
            </button>
            <button
              className="btn btn-outline"
              style={wished ? { borderColor: 'var(--rust)', color: 'var(--rust)' } : undefined}
              onClick={() => toggleWishlist(product.id)}
            >
              {wished ? 'Saved' : 'Save'}
            </button>
          </div>

          <div className="pd-meta">
            <span>★ {product.rating} ({product.reviews} reviews) · Verified purchases</span>
            <span>Free delivery on orders over GHS 300 · Ships in 2–4 business days</span>
            <span>14-day returns on unworn items with tags attached</span>
          </div>
        </div>
      </div>

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="section-head"><h2>You may also like</h2></div>
        <div className="grid">
          {related.map(p => <ProductCard key={p.id} product={p} />)}
        </div>
      </section>
    </div>
  )
}
