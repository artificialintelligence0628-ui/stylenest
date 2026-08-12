import { request } from './client.js'

function authHeaders(token) {
  return { Authorization: `Bearer ${token}` }
}

// Products — raw backend shape (category/compareAtPrice/reviewCount/colors as
// {name,hex}), deliberately NOT normalized like src/api/products.js does for
// the storefront. The admin forms work directly against what the API expects.
export async function adminFetchProducts(token) {
  const data = await request('/products', { headers: authHeaders(token) })
  return data.products
}

export async function adminCreateProduct(token, payload) {
  const data = await request('/products', {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify(payload),
  })
  return data.product
}

export async function adminUpdateProduct(token, id, payload) {
  const data = await request(`/products/${id}`, {
    method: 'PUT',
    headers: authHeaders(token),
    body: JSON.stringify(payload),
  })
  return data.product
}

export async function adminDeleteProduct(token, id) {
  await request(`/products/${id}`, {
    method: 'DELETE',
    headers: authHeaders(token),
  })
}

// Orders
export async function adminFetchOrders(token) {
  const data = await request('/orders/admin/all', { headers: authHeaders(token) })
  return data.orders
}

export async function adminUpdateOrderStatus(token, id, status) {
  const data = await request(`/orders/${id}/status`, {
    method: 'PATCH',
    headers: authHeaders(token),
    body: JSON.stringify({ status }),
  })
  return data.order
}
