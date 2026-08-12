import crypto from 'crypto'
import { sequelize, Order, OrderItem } from '../models/index.js'
import { computeOrderPricing } from '../lib/pricing.js'
import { initializeTransaction, verifyTransaction } from '../lib/paystack.js'

function generateOrderNumber() {
  return 'SN-' + Math.floor(100000 + Math.random() * 900000)
}

export async function initializePayment(req, res) {
  const { items, email } = req.body

  if (!email) {
    return res.status(400).json({ error: 'Email is required to start payment.' })
  }

  const { total } = await computeOrderPricing(items)
  const reference = 'SN-PAY-' + crypto.randomBytes(8).toString('hex')

  const data = await initializeTransaction({
    email,
    amountPesewas: Math.round(total * 100),
    reference,
    metadata: { source: 'stylenest' },
  })

  res.json({
    reference: data.reference,
    accessCode: data.access_code,
    authorizationUrl: data.authorization_url,
    amount: total,
  })
}

export async function verifyPayment(req, res) {
  const { reference, items, customerName, email, phone, address, city, region } = req.body

  if (!reference) {
    return res.status(400).json({ error: 'Missing payment reference.' })
  }
  if (!customerName || !address || !phone) {
    return res.status(400).json({ error: 'Customer name, phone, and address are required.' })
  }

  const verification = await verifyTransaction(reference)

  if (verification.status !== 'success') {
    return res.status(402).json({ error: 'Payment was not successful.' })
  }

  // Recompute the real total server-side and cross-check it against what
  // Paystack actually confirms was charged — the client's idea of the total
  // is never trusted, only what Paystack itself reports back.
  const { subtotal, delivery, total, orderItemsData } = await computeOrderPricing(items)
  const expectedPesewas = Math.round(total * 100)

  if (verification.amount !== expectedPesewas || verification.currency !== 'GHS') {
    return res.status(402).json({ error: 'Payment amount does not match the order total.' })
  }

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
      paymentMethod: 'paystack',
      paymentStatus: 'PAID',
      paystackReference: reference,
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
