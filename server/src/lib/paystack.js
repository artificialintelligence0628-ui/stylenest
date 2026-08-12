import 'dotenv/config'

const PAYSTACK_BASE = 'https://api.paystack.co'
const SECRET_KEY = process.env.PAYSTACK_SECRET_KEY

function authHeaders() {
  return {
    Authorization: `Bearer ${SECRET_KEY}`,
    'Content-Type': 'application/json',
  }
}

export async function initializeTransaction({ email, amountPesewas, reference, metadata }) {
  if (!SECRET_KEY) {
    const err = new Error('Payments are not configured yet. Add PAYSTACK_SECRET_KEY to the backend .env.')
    err.status = 500
    err.publicMessage = err.message
    throw err
  }

  let res
  try {
    res = await fetch(`${PAYSTACK_BASE}/transaction/initialize`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({
        email,
        amount: amountPesewas,
        currency: 'GHS',
        reference,
        metadata,
      }),
    })
  } catch (err) {
    const wrapped = new Error('Could not reach Paystack. Check your connection and try again.')
    wrapped.status = 502
    wrapped.publicMessage = wrapped.message
    throw wrapped
  }

  const data = await res.json().catch(() => ({}))
  if (!res.ok || !data.status) {
    const err = new Error(data?.message || 'Could not start payment with Paystack.')
    err.status = 502
    err.publicMessage = err.message
    throw err
  }
  return data.data // { authorization_url, access_code, reference }
}

export async function verifyTransaction(reference) {
  if (!SECRET_KEY) {
    const err = new Error('Payments are not configured yet. Add PAYSTACK_SECRET_KEY to the backend .env.')
    err.status = 500
    err.publicMessage = err.message
    throw err
  }

  let res
  try {
    res = await fetch(`${PAYSTACK_BASE}/transaction/verify/${encodeURIComponent(reference)}`, {
      headers: authHeaders(),
    })
  } catch (err) {
    const wrapped = new Error('Could not reach Paystack. Check your connection and try again.')
    wrapped.status = 502
    wrapped.publicMessage = wrapped.message
    throw wrapped
  }

  const data = await res.json().catch(() => ({}))
  if (!res.ok || !data.status) {
    const err = new Error(data?.message || 'Could not verify payment with Paystack.')
    err.status = 502
    err.publicMessage = err.message
    throw err
  }
  return data.data // { status, amount, currency, reference, ... }
}
