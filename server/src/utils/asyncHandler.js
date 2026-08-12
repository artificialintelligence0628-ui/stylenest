// Express 4 doesn't catch rejected promises from async route handlers on its own.
// Wrapping each handler in this forwards any thrown/rejected error to next(),
// so it reaches the centralized error handler instead of crashing the process.
export function asyncHandler(fn) {
  return (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next)
}
