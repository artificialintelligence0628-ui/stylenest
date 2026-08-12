import { Op } from 'sequelize'
import { Product } from '../models/index.js'

// Looks up real product prices from the database and computes the order
// total server-side. Never trust a price the client sends — this is the one
// source of truth both the direct-order flow and the Paystack payment flow
// use, so a tampered client request can't change what anyone gets charged.
export async function computeOrderPricing(items) {
  if (!items || !Array.isArray(items) || items.length === 0) {
    const err = new Error('Order must include at least one item')
    err.status = 400
    throw err
  }

  const productIds = [...new Set(items.map(i => i.productId))]
  const products = await Product.findAll({ where: { id: { [Op.in]: productIds } } })
  const productMap = new Map(products.map(p => [p.id, p]))

  let subtotal = 0
  const orderItemsData = []

  for (const item of items) {
    const product = productMap.get(item.productId)
    if (!product) {
      const err = new Error(`Product ${item.productId} not found`)
      err.status = 400
      throw err
    }
    const qty = Number(item.qty) || 1
    subtotal += product.price * qty
    orderItemsData.push({
      productId: product.id,
      name: product.name,
      color: item.color || '',
      size: item.size || 'One Size',
      price: product.price,
      qty,
    })
  }

  const delivery = subtotal >= 300 ? 0 : 25
  const total = subtotal + delivery

  return { subtotal, delivery, total, orderItemsData }
}
