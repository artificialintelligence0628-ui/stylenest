import { sequelize } from '../lib/db.js'
import { User } from './User.js'
import { Product } from './Product.js'
import { Order } from './Order.js'
import { OrderItem } from './OrderItem.js'

// Associations
User.hasMany(Order, { foreignKey: 'userId' })
Order.belongsTo(User, { foreignKey: 'userId' })

Order.hasMany(OrderItem, { foreignKey: 'orderId', as: 'items', onDelete: 'CASCADE' })
OrderItem.belongsTo(Order, { foreignKey: 'orderId' })

Product.hasMany(OrderItem, { foreignKey: 'productId' })
OrderItem.belongsTo(Product, { foreignKey: 'productId' })

// In development this creates/updates tables to match the models above.
// For production, prefer proper migrations — see README for notes on that.
export async function syncDb({ alter = false } = {}) {
  await sequelize.authenticate()
  await sequelize.sync({ alter })
}

export { sequelize, User, Product, Order, OrderItem }
