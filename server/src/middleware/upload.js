const multer = require('multer')
const cloudinary = require('../config/cloudinary')
const { Readable } = require('stream')

const storage = multer.memoryStorage()
const upload = multer({
  storage,
  limits: { fileSize: 100 * 1024 * 1024 } // 100MB
})

async function uploadToCloudinary(buffer, options = {}) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { resource_type: 'auto', folder: 'sheild-evidence', ...options },
      (err, result) => err ? reject(err) : resolve(result)
    )
    Readable.from(buffer).pipe(stream)
  })
}

module.exports = { upload, uploadToCloudinary }
