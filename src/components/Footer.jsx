import { useNavigate } from 'react-router-dom'

export default function Footer() {
  const navigate = useNavigate()
  const goShopWithCategory = (cat) => navigate(`/shop?cat=${encodeURIComponent(cat)}`)

  return (
    <footer>
      <div className="wrap">
        <div className="footer-grid">
          <div>
            <div className="footer-logo">
              <img src="/logo.jpeg" alt="StyleNest" className="footer-logo-mark" />
              StyleNest
            </div>
            <p style={{ fontSize: 13, lineHeight: 1.6, maxWidth: 280 }}>
              Considered clothing in natural fibres, made to be worn for years. Based in Accra, shipping across Ghana.
            </p>
          </div>
          <div>
            <h4>Shop</h4>
            <ul>
              <li><a onClick={() => goShopWithCategory('Women')}>Women</a></li>
              <li><a onClick={() => goShopWithCategory('Men')}>Men</a></li>
              <li><a onClick={() => goShopWithCategory('Kids')}>Kids</a></li>
              <li><a onClick={() => goShopWithCategory('Accessories')}>Accessories</a></li>
            </ul>
          </div>
          <div>
            <h4>Support</h4>
            <ul>
              <li><a>FAQs</a></li>
              <li><a>Returns Policy</a></li>
              <li><a>Shipping Info</a></li>
              <li><a>Contact Us</a></li>
            </ul>
          </div>
          <div>
            <h4>Company</h4>
            <ul>
              <li><a>About Us</a></li>
              <li><a>Our Story</a></li>
              <li><a>Privacy Policy</a></li>
              <li><a>Terms &amp; Conditions</a></li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© 2026 StyleNest. All rights reserved.</span>
          <span>Accra, Ghana</span>
        </div>
      </div>
    </footer>
  )
}
