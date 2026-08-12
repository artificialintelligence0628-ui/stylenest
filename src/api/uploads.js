import { BASE_URL } from './client.js'

export async function uploadImage(token, file) {
  const formData = new FormData()
  formData.append('image', file)

  let res
  try {
    res = await fetch(`${BASE_URL}/uploads`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
      // Note: no Content-Type header here on purpose — the browser sets the
      // correct multipart boundary automatically for FormData bodies.
    })
  } catch {
    throw new Error('Could not reach the server. Is the backend running?')
  }

  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error(data?.error || `Upload failed (${res.status})`)
  }
  return data.url
}
