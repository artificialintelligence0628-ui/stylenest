import { Op } from 'sequelize'
import { Product } from '../models/index.js'

export async function listProducts(req, res) {
  const { category, maxPrice, colors, sizes, search, sort } = req.query

  const where = {}
  if (category) where.category = category
  if (maxPrice) where.price = { [Op.lte]: Number(maxPrice) }
  if (search) {
    where[Op.or] = [
      { name: { [Op.iLike]: `%${search}%` } },
      { category: { [Op.iLike]: `%${search}%` } },
    ]
  }

  let order = [['createdAt', 'DESC']]
  if (sort === 'price-asc') order = [['price', 'ASC']]
  else if (sort === 'price-desc') order = [['price', 'DESC']]
  else if (sort === 'rating') order = [['rating', 'DESC']]

  let products = await Product.findAll({ where, order })

  // Color/size filters need in-memory filtering since they live in JSONB columns
  if (colors) {
    const wanted = String(colors).split(',')
    products = products.filter(p => p.colors.some(c => wanted.includes(c.name)))
  }
  if (sizes) {
    const wanted = String(sizes).split(',')
    products = products.filter(p => p.sizes.some(s => wanted.includes(s)))
  }

  res.json({ products })
}

export async function getProduct(req, res) {
  const product = await Product.findByPk(req.params.id)
  if (!product) return res.status(404).json({ error: 'Product not found' })
  res.json({ product })
}

export async function createProduct(req, res) {
  const product = await Product.create(req.body)
  res.status(201).json({ product })
}

export async function updateProduct(req, res) {
  const product = await Product.findByPk(req.params.id)
  if (!product) return res.status(404).json({ error: 'Product not found' })
  await product.update(req.body)
  res.json({ product })
}

export async function deleteProduct(req, res) {
  const product = await Product.findByPk(req.params.id)
  if (!product) return res.status(404).json({ error: 'Product not found' })
  await product.destroy()
  res.status(204).send()
}
