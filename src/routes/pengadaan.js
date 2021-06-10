const route = require('express').Router()
const pengadaan = require('../controllers/pengadaan')

route.get('/get', pengadaan.home)
route.get('/approve/:no', pengadaan.getApproveIo)
route.get('/document/:no', pengadaan.getDocumentIo)
route.patch('/appdoc/:id', pengadaan.approveDokumen)
route.patch('/rejdoc/:id', pengadaan.rejectDokumen)
route.post('/upload/:id', pengadaan.uploadDocument)

module.exports = route
