// Falls back to localhost:4000 for local dev if VITE_API_URL isn't set.
// import.meta.env is only populated by Vite, so the optional chaining here
// also lets this file be imported safely from plain Node (used in testing).
const BASE_URL = import.meta.env?.VITE_API_URL || 'http://localhost:4000/api'

export async function request(path, options = {}) {
  let res
  try {
    res = await fetch(`${BASE_URL}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
      },
    })
  } catch (err) {
    throw new Error('Could not reach the server. Is the backend running?')
  }

  const data = await res.json().catch(() => ({}))

  if (!res.ok) {
    throw new Error(data?.error || `Request failed (${res.status})`)
  }
  return data
}

export { BASE_URL }
