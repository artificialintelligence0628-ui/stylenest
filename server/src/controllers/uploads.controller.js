import { cloudinary } from '../lib/cloudinary.js'

export async function uploadImage(req, res) {
  if (!req.file) {
    return res.status(400).json({ error: 'No image file provided' })
  }

  const result = await new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: 'stylenest' },
      (error, result) => {
        if (error) reject(error)
        else resolve(result)
      },
    )
    stream.end(req.file.buffer)
  })

  res.status(201).json({ url: result.secure_url })
}
