import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import GarmentIcon from '../components/GarmentIcon.jsx'
import ProductCard from '../components/ProductCard.jsx'
import { CATEGORIES } from '../data/products.js'
import { useProducts } from '../hooks/useProducts.js'
import { useStore } from '../context/StoreContext.jsx'

const CAT_ICON = {
  Women: 'dress', Men: 'jacket', Kids: 'tshirt', Shoes: 'shoe', Accessories: 'bag',
}

export default function Home() {
  const navigate = useNavigate()
  const { showToast } = useStore()
  const [email, setEmail] = useState('')
  const { products, loading, error } = useProducts()

  const newArrivals = products.filter(p => p.tag === 'NEW').slice(0, 4)
  const bestSellers = products.filter(p => p.tag === 'BESTSELLER' || p.rating >= 4.7).slice(0, 4)

  const subscribe = () => {
    if (email.includes('@')) {
      showToast('You are on the list')
      setEmail('')
    } else {
      showToast('Enter a valid email')
    }
  }

  return (
    <>
      <section className="hero">
        <div className="hero-inner">
          <div>
            <div className="hero-eyebrow">Autumn / Winter Edit</div>
            <h1>Dress for the<br /><em>life you're</em> building.</h1>
            <p>Considered clothing in natural fibres — cut for movement, built to be worn for years, not seasons.</p>
            <button className="btn btn-primary" onClick={() => navigate('/shop')}>Shop the Edit</button>
          </div>
          <div className="hero-art">
            <div className="hero-tag">NEW SEASON</div>
            <GarmentIcon type="jacket" color="#c9a86a" />
          </div>
        </div>
      </section>

      <div className="marquee">
        <div className="marquee-track">
          {Array.from({ length: 2 }).map((_, i) => (
            <span key={i}>
              <span>FREE DELIVERY OVER GHS 300</span>
              <span>MOBILE MONEY ACCEPTED</span>
              <span>NEW ARRIVALS WEEKLY</span>
              <span>EASY 14-DAY RETURNS</span>
            </span>
          ))}
        </div>
      </div>

      <div className="wrap">
        <section className="section">
          <div className="section-head"><h2>Shop by Category</h2></div>
          <div className="cat-row">
            {CATEGORIES.map(c => (
              <div key={c} className="cat-tile" onClick={() => navigate(`/shop?cat=${encodeURIComponent(c)}`)}>
                <GarmentIcon type={CAT_ICON[c]} color="#c9a86a" style={{ width: 34, height: 34 }} />
                <span>{c}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="section" style={{ paddingTop: 0 }}>
          <div className="section-head">
            <h2>New Arrivals</h2>
            <button className="view-all" onClick={() => navigate('/shop')}>View All</button>
          </div>
          {loading && <div className="empty-hint">Loading products…</div>}
          {error && <div className="empty-hint">Couldn't load products — is the backend running? ({error})</div>}
          {!loading && !error && (
            <div className="grid">
              {newArrivals.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          )}
        </section>

        <section className="section" style={{ paddingTop: 0 }}>
          <div className="editorial">
            <div className="editorial-text">
              <div className="hero-eyebrow">The Nest Journal</div>
              <h2>Woven from what lasts.</h2>
              <p>Every StyleNest piece starts with fibre, not fashion. We work with mills who share our patience for doing it right.</p>
              <button className="btn btn-outline" style={{ borderColor: '#241c10', color: '#241c10' }} onClick={() => navigate('/shop')}>
                Discover the Story
              </button>
            </div>
            <div className="editorial-art">
              <GarmentIcon type="bag" color="#c9a86a" />
            </div>
          </div>
        </section>

        <section className="section" style={{ paddingTop: 0 }}>
          <div className="section-head">
            <h2>Best Sellers</h2>
            <button className="view-all" onClick={() => navigate('/shop')}>View All</button>
          </div>
          {!loading && !error && (
            <div className="grid">
              {bestSellers.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          )}
        </section>

        <section className="section" style={{ paddingTop: 0 }}>
          <div className="newsletter">
            <h2>Join the Nest</h2>
            <p>Get first access to new arrivals and members-only offers.</p>
            <div className="newsletter-form">
              <input
                type="email"
                placeholder="Your email address"
                value={email}
                onChange={e => setEmail(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && subscribe()}
              />
              <button onClick={subscribe}>Subscribe</button>
            </div>
          </div>
        </section>
      </div>
    </>
  )
}
