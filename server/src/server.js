import 'dotenv/config'
import { createApp } from './app.js'
import { syncDb } from './models/index.js'

const PORT = process.env.PORT || 4000

async function start() {
  try {
    await syncDb({ alter: process.env.NODE_ENV !== 'production' })
    console.log('Database connected and models synced.')
  } catch (err) {
    console.error('Failed to connect to the database:', err.message)
    process.exit(1)
  }

  const app = createApp()
  app.listen(PORT, () => {
    console.log(`StyleNest API running on http://localhost:${PORT}`)
  })
}

start()
