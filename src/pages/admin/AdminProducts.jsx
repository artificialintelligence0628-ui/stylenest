import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../../context/AuthContext.jsx'
import { adminFetchProducts, adminDeleteProduct } from '../../api/admin.js'
import { fmt } from '../../data/products.js'
import ProductFormModal from '../../components/admin/ProductFormModal.jsx'

export default function AdminProducts() {
  const { token } = useAuth()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [editingProduct, setEditingProduct] = useState(null) // null = closed, {} = new, {...} = edit
  const [busyId, setBusyId] = useState(null)

  const load = useCallback(() => {
    setLoading(true)
    setError('')
    adminFetchProducts(token)
      .then(setProducts)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [token])

  useEffect(() => { load() }, [load])

  const handleDelete = async (product) => {
    if (!window.confirm(`Delete "${product.name}"? This can't be undone.`)) return
    setBusyId(product.id)
    try {
      await adminDeleteProduct(token, product.id)
      setProducts(prev => prev.filter(p => p.id !== product.id))
    } catch (err) {
      window.alert(err.message)
    } finally {
      setBusyId(null)
    }
  }

  const handleSaved = (saved, isNew) => {
    setProducts(prev => isNew ? [saved, ...prev] : prev.map(p => p.id === saved.id ? saved : p))
    setEditingProduct(null)
  }

  return (
    <div>
      <div className="admin-page-head">
        <h1>Products</h1>
        <button className="btn btn-primary" onClick={() => setEditingProduct({})}>+ Add Product</button>
      </div>

      {loading && <div className="admin-empty">Loading…</div>}
      {error && <div className="admin-empty">Couldn't load products: {error}</div>}

      {!loading && !error && (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Name</th><th>Category</th><th>Price</th><th>Stock</th><th>Tag</th><th></th>
              </tr>
            </thead>
            <tbody>
              {products.map(p => (
                <tr key={p.id}>
                  <td>{p.name}</td>
                  <td>{p.category}</td>
                  <td className="mono">{fmt(p.price)}</td>
                  <td>{p.stock}</td>
                  <td>{p.tag || '—'}</td>
                  <td className="admin-row-actions">
                    <button onClick={() => setEditingProduct(p)}>Edit</button>
                    <button className="danger" disabled={busyId === p.id} onClick={() => handleDelete(p)}>
                      {busyId === p.id ? 'Deleting…' : 'Delete'}
                    </button>
                  </td>
                </tr>
              ))}
              {products.length === 0 && (
                <tr><td colSpan={6} className="admin-empty">No products yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {editingProduct !== null && (
        <ProductFormModal
          product={editingProduct}
          onClose={() => setEditingProduct(null)}
          onSaved={handleSaved}
        />
      )}
    </div>
  )
}
