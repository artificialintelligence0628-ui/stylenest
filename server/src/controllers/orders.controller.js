import { sequelize, Order, OrderItem } from '../models/index.js'
import { computeOrderPricing } from '../lib/pricing.js'

function generateOrderNumber() {
  return 'SN-' + Math.floor(100000 + Math.random() * 900000)
}

export async function createOrder(req, res) {
  const { items, customerName, email, phone, address, city, region, paymentMethod } = req.body

  if (!customerName || !address || !phone) {
    return res.status(400).json({ error: 'Customer name, phone, and address are required' })
  }

  const { subtotal, delivery, total, orderItemsData } = await computeOrderPricing(items)

  const order = await sequelize.transaction(async (t) => {
    const created = await Order.create({
      number: generateOrderNumber(),
      userId: req.user?.id || null,
      customerName,
      email: email || '',
      phone,
      address,
      city: city || '',
      region: region || '',
      paymentMethod: paymentMethod || 'bank',
      // Orders created through this direct path haven't gone through Paystack
      // verification — they're marked PENDING until manually confirmed
      // (e.g. a bank transfer the store owner checks by hand).
      paymentStatus: 'PENDING',
      subtotal,
      delivery,
      total,
    }, { transaction: t })

    await OrderItem.bulkCreate(
      orderItemsData.map(i => ({ ...i, orderId: created.id })),
      { transaction: t },
    )

    return created
  })

  const fullOrder = await Order.findByPk(order.id, { include: { model: OrderItem, as: 'items' } })
  res.status(201).json({ order: fullOrder })
}

export async function listMyOrders(req, res) {
  const orders = await Order.findAll({
    where: { userId: req.user.id },
    include: { model: OrderItem, as: 'items' },
    order: [['createdAt', 'DESC']],
  })
  res.json({ orders })
}

export async function getOrder(req, res) {
  const order = await Order.findByPk(req.params.id, { include: { model: OrderItem, as: 'items' } })
  if (!order) return res.status(404).json({ error: 'Order not found' })

  // Non-admins may only view their own orders
  if (req.user.role !== 'ADMIN' && order.userId !== req.user.id) {
    return res.status(403).json({ error: 'Not authorized to view this order' })
  }
  res.json({ order })
}

export async function listAllOrders(req, res) {
  const orders = await Order.findAll({
    include: { model: OrderItem, as: 'items' },
    order: [['createdAt', 'DESC']],
  })
  res.json({ orders })
}

export async function updateOrderStatus(req, res) {
  const { status } = req.body
  const valid = ['RECEIVED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED']
  if (!valid.includes(status)) {
    return res.status(400).json({ error: `Status must be one of: ${valid.join(', ')}` })
  }
  const order = await Order.findByPk(req.params.id)
  if (!order) return res.status(404).json({ error: 'Order not found' })
  await order.update({ status })
  res.json({ order })
}
