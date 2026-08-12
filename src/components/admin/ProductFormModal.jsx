import { useState } from 'react'
import { useAuth } from '../../context/AuthContext.jsx'
import { adminCreateProduct, adminUpdateProduct } from '../../api/admin.js'
import { uploadImage } from '../../api/uploads.js'
import { CATEGORIES } from '../../data/products.js'

const TYPES = ['tshirt', 'dress', 'jacket', 'trousers', 'skirt', 'shoe', 'bag', 'hat']
const TAGS = ['', 'NEW', 'SALE', 'BESTSELLER']

function slugify(name) {
  return name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}

export default function ProductFormModal({ product, onClose, onSaved }) {
  const { token } = useAuth()
  const isNew = !product?.id

  const [form, setForm] = useState({
    name: product?.name || '',
    category: product?.category || CATEGORIES[0],
    type: product?.type || TYPES[0],
    description: product?.description || '',
    price: product?.price ?? '',
    compareAtPrice: product?.compareAtPrice ?? '',
    tag: product?.tag || '',
    stock: product?.stock ?? 100,
    colors: product?.colors?.length ? product.colors : [{ name: '', hex: '#1c1c1c' }],
    sizesText: (product?.sizes || []).join(', '),
    imageUrl: product?.imageUrl || '',
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [uploading, setUploading] = useState(false)

  const update = (key) => (e) => setForm(f => ({ ...f, [key]: e.target.value }))

  const updateColor = (i, key, val) => {
    setForm(f => {
      const colors = [...f.colors]
      colors[i] = { ...colors[i], [key]: val }
      return { ...f, colors }
    })
  }
  const addColorRow = () => setForm(f => ({ ...f, colors: [...f.colors, { name: '', hex: '#1c1c1c' }] }))
  const removeColorRow = (i) => setForm(f => ({ ...f, colors: f.colors.filter((_, idx) => idx !== i) }))

  const handleImageSelect = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setError('')
    setUploading(true)
    try {
      const url = await uploadImage(token, file)
      setForm(f => ({ ...f, imageUrl: url }))
    } catch (err) {
      setError(err.message)
    } finally {
      setUploading(false)
      e.target.value = '' // allow re-selecting the same file if needed
    }
  }

  const submit = async (e) => {
    e.preventDefault()
    setError('')

    if (!form.name.trim() || !form.price) {
      setError('Name and price are required.')
      return
    }
    const validColors = form.colors.filter(c => c.name.trim())
    if (validColors.length === 0) {
      setError('Add at least one color.')
      return
    }
    const sizes = form.sizesText.split(',').map(s => s.trim()).filter(Boolean)
    if (sizes.length === 0) {
      setError('Add at least one size (or "One Size").')
      return
    }

    const payload = {
      name: form.name.trim(),
      category: form.category,
      type: form.type,
      description: form.description.trim(),
      price: Number(form.price),
      compareAtPrice: form.compareAtPrice ? Number(form.compareAtPrice) : null,
      tag: form.tag || null,
      stock: Number(form.stock) || 0,
      colors: validColors,
      sizes,
      imageUrl: form.imageUrl || null,
    }
    if (isNew) payload.slug = slugify(form.name)

    setSaving(true)
    try {
      const saved = isNew
        ? await adminCreateProduct(token, payload)
        : await adminUpdateProduct(token, product.id, payload)
      onSaved(saved, isNew)
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="admin-modal-overlay" onClick={onClose}>
      <div className="admin-modal" onClick={e => e.stopPropagation()}>
        <div className="admin-modal-head">
          <h2>{isNew ? 'Add Product' : 'Edit Product'}</h2>
          <button className="admin-modal-close" onClick={onClose}>×</button>
        </div>
        <form onSubmit={submit} className="admin-form">
          {error && <div className="admin-error">{error}</div>}

          <div className="field">
            <label>Name</label>
            <input value={form.name} onChange={update('name')} required />
          </div>

          <div className="field-row">
            <div className="field">
              <label>Category</label>
              <select value={form.category} onChange={update('category')}>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="field">
              <label>Type (icon style)</label>
              <select value={form.type} onChange={update('type')}>
                {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>

          <div className="field">
            <label>Product Photo</label>
            {form.imageUrl && (
              <div className="admin-image-preview">
                <img src={form.imageUrl} alt="Product preview" />
                <button type="button" className="admin-remove-row" onClick={() => setForm(f => ({ ...f, imageUrl: '' }))}>
                  Remove photo
                </button>
              </div>
            )}
            <input type="file" accept="image/*" onChange={handleImageSelect} disabled={uploading} />
            {uploading && <div className="admin-upload-status">Uploading…</div>}
            {!form.imageUrl && !uploading && (
              <div className="admin-upload-status">No photo yet — falls back to an illustrated icon on the storefront.</div>
            )}
          </div>

          <div className="field">
            <label>Description</label>
            <textarea rows={3} value={form.description} onChange={update('description')} />
          </div>

          <div className="field-row">
            <div className="field">
              <label>Price (GHS)</label>
              <input type="number" min="0" value={form.price} onChange={update('price')} required />
            </div>
            <div className="field">
              <label>Compare-at price (optional)</label>
              <input type="number" min="0" value={form.compareAtPrice} onChange={update('compareAtPrice')} />
            </div>
          </div>

          <div className="field-row">
            <div className="field">
              <label>Tag</label>
              <select value={form.tag} onChange={update('tag')}>
                {TAGS.map(t => <option key={t} value={t}>{t || 'None'}</option>)}
              </select>
            </div>
            <div className="field">
              <label>Stock</label>
              <input type="number" min="0" value={form.stock} onChange={update('stock')} />
            </div>
          </div>

          <div className="field">
            <label>Sizes (comma separated — e.g. S, M, L, XL or One Size)</label>
            <input value={form.sizesText} onChange={update('sizesText')} />
          </div>

          <div className="field">
            <label>Colors</label>
            {form.colors.map((c, i) => (
              <div className="admin-color-row" key={i}>
                <input placeholder="Name (e.g. Forest)" value={c.name} onChange={e => updateColor(i, 'name', e.target.value)} />
                <input type="color" value={c.hex} onChange={e => updateColor(i, 'hex', e.target.value)} />
                {form.colors.length > 1 && (
                  <button type="button" className="admin-remove-row" onClick={() => removeColorRow(i)}>Remove</button>
                )}
              </div>
            ))}
            <button type="button" className="admin-add-row" onClick={addColorRow}>+ Add color</button>
          </div>

          <div className="admin-form-actions">
            <button type="button" className="btn btn-outline" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Saving…' : isNew ? 'Create Product' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
