import { useMemo, useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import ProductCard from '../components/ProductCard.jsx'
import { CATEGORIES, fmt } from '../data/products.js'
import { useProducts } from '../hooks/useProducts.js'

export default function Shop() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const initialCat = searchParams.get('cat')
  const query = (searchParams.get('q') || '').toLowerCase()
  const { products, loading, error } = useProducts()

  const [selectedCats, setSelectedCats] = useState(() => new Set(initialCat ? [initialCat] : []))
  const [selectedColors, setSelectedColors] = useState(() => new Set())
  const [selectedSizes, setSelectedSizes] = useState(() => new Set())
  const [maxPrice, setMaxPrice] = useState(600)
  const [sort, setSort] = useState('featured')

  // Keep category filter in sync if the user navigates here again with a new ?cat=
  useEffect(() => {
    if (initialCat) setSelectedCats(new Set([initialCat]))
  }, [initialCat])

  const allColors = useMemo(() => {
    const map = new Map()
    products.forEach(p => p.colors.forEach(c => map.set(c.n, c)))
    return [...map.values()]
  }, [products])

  const allSizes = useMemo(() => {
    const set = new Set()
    products.forEach(p => p.sizes.forEach(s => { if (s !== 'One Size') set.add(s) }))
    return [...set]
  }, [products])

  const toggleSet = (setter) => (val) => {
    setter(prev => {
      const next = new Set(prev)
      if (next.has(val)) next.delete(val)
      else next.add(val)
      return next
    })
  }
  const toggleCat = toggleSet(setSelectedCats)
  const toggleColor = toggleSet(setSelectedColors)
  const toggleSize = toggleSet(setSelectedSizes)

  const clearFilters = () => {
    setSelectedCats(new Set())
    setSelectedColors(new Set())
    setSelectedSizes(new Set())
    setMaxPrice(600)
    navigate('/shop')
  }

  const filtered = useMemo(() => {
    let list = products.filter(p => {
      if (selectedCats.size && !selectedCats.has(p.cat)) return false
      if (selectedColors.size && !p.colors.some(c => selectedColors.has(c.n))) return false
      if (selectedSizes.size && !p.sizes.some(s => selectedSizes.has(s))) return false
      if (p.price > maxPrice) return false
      if (query && !p.name.toLowerCase().includes(query) && !p.cat.toLowerCase().includes(query)) return false
      return true
    })
    if (sort === 'price-asc') list = [...list].sort((a, b) => a.price - b.price)
    else if (sort === 'price-desc') list = [...list].sort((a, b) => b.price - a.price)
    else if (sort === 'rating') list = [...list].sort((a, b) => b.rating - a.rating)
    else if (sort === 'newest') list = [...list].sort((a, b) => (b.tag === 'NEW') - (a.tag === 'NEW'))
    return list
  }, [products, selectedCats, selectedColors, selectedSizes, maxPrice, sort, query])

  return (
    <div className="wrap">
      <div className="crumb">
        <button onClick={() => navigate('/')}>Home</button> / Shop
      </div>
      <div className="shop-layout">
        <aside className="filters">
          <div className="filter-group">
            <h4>Category</h4>
            {CATEGORIES.map(c => (
              <label className="filter-opt" key={c}>
                <input type="checkbox" checked={selectedCats.has(c)} onChange={() => toggleCat(c)} /> {c}
              </label>
            ))}
          </div>
          <div className="filter-group">
            <h4>Price up to {fmt(maxPrice)}</h4>
            <input
              type="range" min="80" max="600" step="20" value={maxPrice}
              style={{ width: '100%', accentColor: 'var(--forest)' }}
              onChange={e => setMaxPrice(+e.target.value)}
            />
          </div>
          <div className="filter-group">
            <h4>Color</h4>
            <div className="filter-color-row">
              {allColors.map(c => (
                <div
                  key={c.n}
                  className={`filter-color ${selectedColors.has(c.n) ? 'sel' : ''}`}
                  style={{ background: c.h }}
                  title={c.n}
                  onClick={() => toggleColor(c.n)}
                />
              ))}
            </div>
          </div>
          <div className="filter-group">
            <h4>Size</h4>
            <div className="filter-size-row">
              {allSizes.map(s => (
                <div
                  key={s}
                  className={`filter-size ${selectedSizes.has(s) ? 'sel' : ''}`}
                  onClick={() => toggleSize(s)}
                >
                  {s}
                </div>
              ))}
            </div>
          </div>
          <button className="clear-filters" onClick={clearFilters}>Clear all filters</button>
        </aside>
        <div>
          <div className="shop-top">
            <div className="shop-count">{loading ? 'Loading…' : `${filtered.length} products`}</div>
            <select className="sort" value={sort} onChange={e => setSort(e.target.value)}>
              <option value="featured">Featured</option>
              <option value="newest">Newest</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="rating">Top Rated</option>
            </select>
          </div>
          {loading && <div className="empty-hint">Loading products…</div>}
          {error && <div className="empty-hint">Couldn't load products — is the backend running? ({error})</div>}
          {!loading && !error && (
            <div className="grid">
              {filtered.length
                ? filtered.map(p => <ProductCard key={p.id} product={p} />)
                : <div className="empty-hint">No products match those filters.</div>}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
