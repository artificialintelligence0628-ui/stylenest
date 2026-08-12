export function errorHandler(err, req, res, next) {
  console.error(err)
  const status = err.status || 500
  // 4xx errors are validation messages we wrote ourselves and are safe (and
  // helpful) to show as-is. 5xx errors might contain internals (stack traces,
  // library error text), so those stay generic.
  const message = status < 500 ? (err.publicMessage || err.message) : (err.publicMessage || 'Something went wrong. Please try again.')
  res.status(status).json({ error: message })
}

export function notFound(req, res) {
  res.status(404).json({ error: 'Route not found' })
}
