import { Router } from 'express'
import { uploadSingleImage } from '../middleware/upload.js'
import { uploadImage } from '../controllers/uploads.controller.js'
import { requireAuth, requireAdmin } from '../middleware/auth.js'
import { asyncHandler } from '../utils/asyncHandler.js'

const router = Router()

router.post('/', requireAuth, requireAdmin, uploadSingleImage, asyncHandler(uploadImage))

export default router
