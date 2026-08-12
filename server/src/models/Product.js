import { DataTypes } from 'sequelize'
import { sequelize } from '../lib/db.js'

export const Product = sequelize.define('Product', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  name: { type: DataTypes.STRING, allowNull: false },
  slug: { type: DataTypes.STRING, allowNull: false, unique: true },
  category: { type: DataTypes.STRING, allowNull: false },
  type: { type: DataTypes.STRING, allowNull: false },
  description: { type: DataTypes.TEXT, allowNull: false, defaultValue: '' },
  price: { type: DataTypes.INTEGER, allowNull: false },
  compareAtPrice: { type: DataTypes.INTEGER, allowNull: true },
  colors: { type: DataTypes.JSONB, allowNull: false, defaultValue: [] },
  sizes: { type: DataTypes.JSONB, allowNull: false, defaultValue: [] },
  imageUrl: { type: DataTypes.STRING, allowNull: true },
  rating: { type: DataTypes.FLOAT, defaultValue: 0 },
  reviewCount: { type: DataTypes.INTEGER, defaultValue: 0 },
  tag: { type: DataTypes.STRING, allowNull: true },
  stock: { type: DataTypes.INTEGER, defaultValue: 100 },
}, {
  tableName: 'products',
  timestamps: true,
})
