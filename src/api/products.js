import { request } from './client.js'

// The backend's product shape (category/compareAtPrice/reviewCount/colors as
// {name,hex}) differs slightly from what the UI components were built around
// (cat/was/reviews/colors as {n,h}). Normalizing here means ProductCard,
// Shop's filters, and the Product detail page don't need to change at all.
function normalizeProduct(p) {
  return {
    id: p.id,
    name: p.name,
    cat: p.category,
    type: p.type,
    price: p.price,
    was: p.compareAtPrice || undefined,
    tag: p.tag || '',
    rating: p.rating,
    reviews: p.reviewCount,
    colors: (p.colors || []).map(c => ({ n: c.name, h: c.hex })),
    sizes: p.sizes || [],
    desc: p.description,
    image: p.imageUrl || null,
  }
}

export async function fetchProducts(params = {}) {
  const query = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      query.set(key, value)
    }
  })
  const qs = query.toString()
  const data = await request(`/products${qs ? `?${qs}` : ''}`)
  return data.products.map(normalizeProduct)
}

export async function fetchProduct(id) {
  const data = await request(`/products/${id}`)
  return normalizeProduct(data.product)
}
