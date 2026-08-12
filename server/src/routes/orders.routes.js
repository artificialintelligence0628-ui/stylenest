import { Router } from 'express'
import {
  createOrder, listMyOrders, getOrder, listAllOrders, updateOrderStatus,
} from '../controllers/orders.controller.js'
import { requireAuth, requireAdmin, optionalAuth } from '../middleware/auth.js'
import { asyncHandler } from '../utils/asyncHandler.js'

const router = Router()

// Guest checkout allowed — optionalAuth attaches req.user if a token is present
router.post('/', optionalAuth, asyncHandler(createOrder))

router.get('/mine', requireAuth, asyncHandler(listMyOrders))
router.get('/admin/all', requireAuth, requireAdmin, asyncHandler(listAllOrders))
router.get('/:id', requireAuth, asyncHandler(getOrder))
router.patch('/:id/status', requireAuth, requireAdmin, asyncHandler(updateOrderStatus))

export default router
