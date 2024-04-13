cloudinary = require('cloudinary').v2
const { CloudinaryStorage } = require('multer-storage-cloudinary')

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME_CLOUDINARY,
  api_key: process.env.API_CLOUDINARY,
  api_secret: process.env.SECRET_CLOUDINARY
})

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'YelpCamp',
    allowedFormats: ['jpeg', 'jpg', 'png']
  }
})

module.exports = {
  cloudinary,
  storage
}
