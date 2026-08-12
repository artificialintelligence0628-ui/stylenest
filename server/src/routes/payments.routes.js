import { Router } from 'express'
import { initializePayment, verifyPayment } from '../controllers/payments.controller.js'
import { optionalAuth } from '../middleware/auth.js'
import { asyncHandler } from '../utils/asyncHandler.js'

const router = Router()

// Guest checkout is allowed here too, same as orders — optionalAuth attaches
// req.user if a token is present so paid orders link to an account when
// the customer happens to be logged in.
router.post('/initialize', optionalAuth, asyncHandler(initializePayment))
router.post('/verify', optionalAuth, asyncHandler(verifyPayment))

export default router
