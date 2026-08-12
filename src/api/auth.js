import { request } from './client.js'

export async function register(name, email, password, phone) {
  const data = await request('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ name, email, password, phone }),
  })
  return data // { token, user }
}

export async function login(email, password) {
  const data = await request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  })
  return data // { token, user }
}

export async function fetchMe(token) {
  const data = await request('/auth/me', {
    headers: { Authorization: `Bearer ${token}` },
  })
  return data.user
}
