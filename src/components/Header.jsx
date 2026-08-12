import { useNavigate, useLocation } from 'react-router-dom'
import { useState } from 'react'
import { useStore } from '../context/StoreContext.jsx'
import { useCustomerAuth } from '../context/CustomerAuthContext.jsx'
import { SearchIcon, HeartIcon, UserIcon, BagIcon } from './Icons.jsx'

export default function Header() {
  const navigate = useNavigate()
  const location = useLocation()
  const { wishlist, cartCount, setCartOpen } = useStore()
  const { isAuthenticated } = useCustomerAuth()
  const [query, setQuery] = useState('')

  const goShopWithCategory = (cat) => navigate(`/shop?cat=${encodeURIComponent(cat)}`)

  const onSearchKey = (e) => {
    if (e.key === 'Enter') {
      navigate(`/shop${query ? `?q=${encodeURIComponent(query)}` : ''}`)
    }
  }

  // Guests get sent to sign in; logged-in customers go straight to their
  // account. Wishlist always goes to /account (the Wishlist tab there works
  // for guests too) — kept as a separate destination from the user icon so
  // the two buttons don't do the exact same thing.
  const goToAccount = () => navigate(isAuthenticated ? '/account' : '/login')

  return (
    <header className="site">
      <div className="nav-top">
        <div className="logo" onClick={() => navigate('/')}>
          <img src="/logo.jpeg" alt="StyleNest" className="logo-mark" />
          StyleNest
        </div>
        <nav className="links">
          <button className={location.pathname === '/' ? 'active' : ''} onClick={() => navigate('/')}>Home</button>
          <button className={location.pathname === '/shop' ? 'active' : ''} onClick={() => navigate('/shop')}>Shop</button>
          <button onClick={() => goShopWithCategory('Women')}>Women</button>
          <button onClick={() => goShopWithCategory('Men')}>Men</button>
          <button onClick={() => goShopWithCategory('Kids')}>Kids</button>
        </nav>
        <div className="nav-actions">
          <div className="search-bar">
            <SearchIcon />
            <input
              placeholder="Search..."
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={onSearchKey}
            />
          </div>
          <button className="icon-btn" onClick={() => navigate('/account')} data-tooltip="Wishlist" aria-label="Wishlist">
            <HeartIcon />
            {wishlist.length > 0 && <span className="badge">{wishlist.length}</span>}
          </button>
          <button className="icon-btn" onClick={goToAccount} data-tooltip={isAuthenticated ? 'Account' : 'Sign In'} aria-label="Account">
            <UserIcon />
          </button>
          <button className="icon-btn" onClick={() => setCartOpen(true)} data-tooltip="Cart" aria-label="Cart">
            <BagIcon />
            {cartCount > 0 && <span className="badge">{cartCount}</span>}
          </button>
        </div>
      </div>
    </header>
  )
}
