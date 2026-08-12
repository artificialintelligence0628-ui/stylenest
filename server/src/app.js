import express from 'express'
import cors from 'cors'
import morgan from 'morgan'
import authRoutes from './routes/auth.routes.js'
import productsRoutes from './routes/products.routes.js'
import ordersRoutes from './routes/orders.routes.js'
import uploadsRoutes from './routes/uploads.routes.js'
import paymentsRoutes from './routes/payments.routes.js'
import { errorHandler, notFound } from './middleware/errorHandler.js'

export function createApp() {
  const app = express()

  app.use(cors())
  app.use(express.json())
  app.use(morgan('dev'))

  app.get('/api/health', (req, res) => res.json({ ok: true }))

  app.use('/api/auth', authRoutes)
  app.use('/api/products', productsRoutes)
  app.use('/api/orders', ordersRoutes)
  app.use('/api/uploads', uploadsRoutes)
  app.use('/api/payments', paymentsRoutes)

  app.use(notFound)
  app.use(errorHandler)

  return app
}
