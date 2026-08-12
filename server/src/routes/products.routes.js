import { Router } from 'express'
import {
  listProducts, getProduct, createProduct, updateProduct, deleteProduct,
} from '../controllers/products.controller.js'
import { requireAuth, requireAdmin } from '../middleware/auth.js'
import { asyncHandler } from '../utils/asyncHandler.js'

const router = Router()

router.get('/', asyncHandler(listProducts))
router.get('/:id', asyncHandler(getProduct))

// Admin-only management
router.post('/', requireAuth, requireAdmin, asyncHandler(createProduct))
router.put('/:id', requireAuth, requireAdmin, asyncHandler(updateProduct))
router.delete('/:id', requireAuth, requireAdmin, asyncHandler(deleteProduct))

export default router
