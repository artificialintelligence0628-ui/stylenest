import bcrypt from 'bcryptjs'
import { User } from '../models/index.js'
import { signToken } from '../utils/jwt.js'

function publicUser(user) {
  const { password, ...rest } = user.toJSON ? user.toJSON() : user
  return rest
}

export async function register(req, res) {
  const { name, email, password, phone } = req.body

  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Name, email, and password are required' })
  }
  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters' })
  }

  const existing = await User.findOne({ where: { email: email.toLowerCase() } })
  if (existing) {
    return res.status(409).json({ error: 'An account with that email already exists' })
  }

  const hashed = await bcrypt.hash(password, 10)
  const user = await User.create({ name, email: email.toLowerCase(), password: hashed, phone })

  const token = signToken({ id: user.id, role: user.role })
  res.status(201).json({ token, user: publicUser(user) })
}

export async function login(req, res) {
  const { email, password } = req.body
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' })
  }

  const user = await User.findOne({ where: { email: email.toLowerCase() } })
  if (!user) {
    return res.status(401).json({ error: 'Invalid email or password' })
  }

  const valid = await bcrypt.compare(password, user.password)
  if (!valid) {
    return res.status(401).json({ error: 'Invalid email or password' })
  }

  const token = signToken({ id: user.id, role: user.role })
  res.json({ token, user: publicUser(user) })
}

export async function me(req, res) {
  const user = await User.findByPk(req.user.id)
  if (!user) return res.status(404).json({ error: 'User not found' })
  res.json({ user: publicUser(user) })
}
