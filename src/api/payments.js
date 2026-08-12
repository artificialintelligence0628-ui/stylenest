import { request } from './client.js'

export async function initializePayment(payload, token) {
  const data = await request('/payments/initialize', {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: JSON.stringify(payload),
  })
  return data // { reference, accessCode, authorizationUrl, amount }
}

export async function verifyPayment(payload, token) {
  const data = await request('/payments/verify', {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: JSON.stringify(payload),
  })
  return data.order
}
