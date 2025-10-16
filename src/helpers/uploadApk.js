const multer = require('multer')

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (!file) {
      return cb(new Error('file cant be null'), false)
    }
    cb(null, 'assets/android')
  },
  filename: (req, file, cb) => {
    const ext = file.originalname.split('.')[file.originalname.split('.').length - 1]
    const fileName = `${req.user.name}_${new Date().getTime().toString().concat('.').concat(ext)}`
    cb(null, fileName)
  },
  name: (req, file, cb) => {
    const name = file.originalname
    cb(null, name)
  }
})

const fileFilter = (req, file, cb) => {
  const allowedMimes = ['application/vnd.android.package-archive', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/pdf', 'application/x-7z-compressed', 'application/vnd.rar', 'application/zip', 'image/jpeg', 'image/png']
  if (allowedMimes.includes(file.mimetype)) {
    return cb(null, true)
  }
  return cb(null, true)
  // return cb(new Error('Invalid file type. Only excel, pdf, zip, rar, 7zip, and image files are allowed.'), false)
}

module.exports = multer({ storage, fileFilter, limits: { fileSize: 75000000 } }).single('file')
