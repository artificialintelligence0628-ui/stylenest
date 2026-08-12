// Product data now comes from the live backend API (see src/api/products.js).
// This file just keeps the small shared constants that don't need a network call.

export const CATEGORIES = ['Women', 'Men', 'Kids', 'Shoes', 'Accessories']

export function fmt(n) {
  return 'GHS ' + n.toLocaleString()
}
