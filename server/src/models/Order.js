import { DataTypes } from 'sequelize'
import { sequelize } from '../lib/db.js'

export const Order = sequelize.define('Order', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  number: { type: DataTypes.STRING, allowNull: false, unique: true },
  userId: { type: DataTypes.UUID, allowNull: true },
  customerName: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING, allowNull: true },
  phone: { type: DataTypes.STRING, allowNull: false },
  address: { type: DataTypes.STRING, allowNull: false },
  city: { type: DataTypes.STRING, allowNull: true },
  region: { type: DataTypes.STRING, allowNull: true },
  paymentMethod: { type: DataTypes.STRING, allowNull: false, defaultValue: 'momo' },
  paymentStatus: {
    type: DataTypes.ENUM('PENDING', 'PAID', 'FAILED'),
    defaultValue: 'PENDING',
  },
  paystackReference: { type: DataTypes.STRING, allowNull: true, unique: true },
  status: {
    type: DataTypes.ENUM('RECEIVED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'),
    defaultValue: 'RECEIVED',
  },
  subtotal: { type: DataTypes.INTEGER, allowNull: false },
  delivery: { type: DataTypes.INTEGER, allowNull: false },
  total: { type: DataTypes.INTEGER, allowNull: false },
}, {
  tableName: 'orders',
  timestamps: true,
})
