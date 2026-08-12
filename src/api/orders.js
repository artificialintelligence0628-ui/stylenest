import { request } from './client.js'

export async function createOrder(payload, token) {
  const data = await request('/orders', {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: JSON.stringify(payload),
  })
  return data.order
}

export async function fetchMyOrders(token) {
  const data = await request('/orders/mine', {
    headers: { Authorization: `Bearer ${token}` },
  })
  return data.orders
}
