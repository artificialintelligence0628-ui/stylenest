import { DataTypes } from 'sequelize'
import { sequelize } from '../lib/db.js'

export const User = sequelize.define('User', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  name: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING, allowNull: false, unique: true },
  password: { type: DataTypes.STRING, allowNull: false },
  phone: { type: DataTypes.STRING, allowNull: true },
  role: { type: DataTypes.ENUM('CUSTOMER', 'ADMIN'), defaultValue: 'CUSTOMER' },
}, {
  tableName: 'users',
  timestamps: true,
})
