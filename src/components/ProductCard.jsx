import { useNavigate } from 'react-router-dom'
import GarmentIcon from './GarmentIcon.jsx'
import { HeartIcon } from './Icons.jsx'
import { useStore } from '../context/StoreContext.jsx'
import { fmt } from '../data/products.js'

export default function ProductCard({ product }) {
  const navigate = useNavigate()
  const { wishlist, toggleWishlist } = useStore()
  const wished = wishlist.includes(product.id)

  return (
    <div className="tag-card" onClick={() => navigate(`/product/${product.id}`)}>
      <div className="tag-hole" />
      {product.tag && (
        <div className={`tag-flag ${product.tag === 'SALE' ? 'sale' : 'new'}`}>{product.tag}</div>
      )}
      <button
        className={`wish-btn ${wished ? 'active' : ''}`}
        style={{ position: 'absolute', bottom: 16, right: 14, zIndex: 2 }}
        onClick={(e) => { e.stopPropagation(); toggleWishlist(product.id) }}
      >
        <HeartIcon />
      </button>
      <div className="tag-art">
        {product.image
          ? <img src={product.image} alt={product.name} />
          : <GarmentIcon type={product.type} color={product.colors[0].h} />}
      </div>
      <div className="tag-cat">{product.cat}</div>
      <div className="tag-name">{product.name}</div>
      <div className="tag-price-row">
        <div className="tag-price">
          {product.was && <span className="was">{fmt(product.was)}</span>}
          {fmt(product.price)}
        </div>
      </div>
      <div className="swatch-row">
        {product.colors.map(c => (
          <div key={c.n} className="swatch-dot" style={{ background: c.h }} />
        ))}
      </div>
    </div>
  )
}
