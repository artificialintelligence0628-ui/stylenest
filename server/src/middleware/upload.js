import multer from 'multer'

const storage = multer.memoryStorage()

function fileFilter(req, file, cb) {
  if (!file.mimetype.startsWith('image/')) {
    return cb(new Error('Only image files are allowed'))
  }
  cb(null, true)
}

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
})

// Wraps multer's single-file middleware so upload errors (wrong file type,
// too large) come back as a normal JSON error response instead of an
// unhandled exception.
export function uploadSingleImage(req, res, next) {
  upload.single('image')(req, res, (err) => {
    if (err) {
      return res.status(400).json({ error: err.message })
    }
    next()
  })
}
