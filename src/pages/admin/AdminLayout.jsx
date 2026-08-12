import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'

export default function AdminLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/admin/login')
  }

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <div className="admin-logo" onClick={() => navigate('/')}>
          StyleNest <span>Admin</span>
        </div>
        <nav className="admin-nav">
          <NavLink to="/admin/products" className={({ isActive }) => isActive ? 'active' : ''}>
            Products
          </NavLink>
          <NavLink to="/admin/orders" className={({ isActive }) => isActive ? 'active' : ''}>
            Orders
          </NavLink>
        </nav>
        <div className="admin-user">
          <div className="admin-user-name">{user?.name}</div>
          <div className="admin-user-email">{user?.email}</div>
          <button className="admin-logout" onClick={handleLogout}>Log out</button>
        </div>
      </aside>
      <main className="admin-main">
        <Outlet />
      </main>
    </div>
  )
}
