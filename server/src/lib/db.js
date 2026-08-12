import { Sequelize } from 'sequelize'
import 'dotenv/config'

const DATABASE_URL = process.env.DATABASE_URL

if (!DATABASE_URL) {
  throw new Error('DATABASE_URL is not set. Copy .env.example to .env and fill it in.')
}

// Hosted providers (Neon, Render, Supabase, Railway) require SSL connections.
// A plain local Postgres install typically doesn't need this, so it's opt-in
// via an env var rather than always-on.
const useSSL = process.env.DB_SSL !== 'false'

export const sequelize = new Sequelize(DATABASE_URL, {
  dialect: 'postgres',
  logging: false,
  dialectOptions: useSSL
    ? { ssl: { require: true, rejectUnauthorized: false } }
    : {},
})
