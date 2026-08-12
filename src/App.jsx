import { HashRouter, Routes, Route, Outlet, Navigate, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import { StoreProvider } from './context/StoreContext.jsx'
import { AuthProvider, useAuth } from './context/AuthContext.jsx'
import { CustomerAuthProvider } from './context/CustomerAuthContext.jsx'
import Header from './components/Header.jsx'
import Footer from './components/Footer.jsx'
import CartDrawer from './components/CartDrawer.jsx'
import Toast from './components/Toast.jsx'
import Home from './pages/Home.jsx'
import Shop from './pages/Shop.jsx'
import Product from './pages/Product.jsx'
import Checkout from './pages/Checkout.jsx'
import Confirmation from './pages/Confirmation.jsx'
import Account from './pages/Account.jsx'
import Login from './pages/Login.jsx'
import Register from './pages/Register.jsx'
import AdminLogin from './pages/admin/AdminLogin.jsx'
import AdminLayout from './pages/admin/AdminLayout.jsx'
import AdminProducts from './pages/admin/AdminProducts.jsx'
import AdminOrders from './pages/admin/AdminOrders.jsx'

function ScrollToTop() {
  const location = useLocation()
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [location.pathname])
  return null
}

function StorefrontLayout() {
  return (
    <>
      <Header />
      <main style={{ flex: 1 }}>
        <Outlet />
      </main>
      <Footer />
      <CartDrawer />
      <Toast />
    </>
  )
}

function ProtectedAdminRoute() {
  const { loading, isAdmin } = useAuth()

  if (loading) {
    return (
      <div style={{ padding: 80, textAlign: 'center', color: 'var(--muted)' }}>
        Loading…
      </div>
    )
  }
  if (!isAdmin) {
    return <Navigate to="/admin/login" replace />
  }
  return <AdminLayout />
}

export default function App() {
  return (
    <AuthProvider>
      <CustomerAuthProvider>
        <StoreProvider>
          <HashRouter>
            <ScrollToTop />
            <Routes>
              {/* Storefront */}
              <Route element={<StorefrontLayout />}>
                <Route path="/" element={<Home />} />
                <Route path="/shop" element={<Shop />} />
                <Route path="/product/:id" element={<Product />} />
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/confirmation" element={<Confirmation />} />
                <Route path="/account" element={<Account />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
              </Route>

              {/* Admin */}
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route path="/admin" element={<ProtectedAdminRoute />}>
                <Route index element={<Navigate to="products" replace />} />
                <Route path="products" element={<AdminProducts />} />
                <Route path="orders" element={<AdminOrders />} />
              </Route>
            </Routes>
          </HashRouter>
        </StoreProvider>
      </CustomerAuthProvider>
    </AuthProvider>
  )
}
