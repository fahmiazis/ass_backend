const route = require('express').Router()
const pengadaan = require('../controllers/pengadaan')

route.get('/get', pengadaan.home)
route.get('/approve/:no', pengadaan.getApproveIo)
route.get('/document/:no', pengadaan.getDocumentIo)
route.patch('/appdoc/:id', pengadaan.approveDokumen)
route.patch('/rejdoc/:id', pengadaan.rejectDokumen)
route.post('/upload/:id', pengadaan.uploadDocument)
route.post('/post', pengadaan.postApi)
route.get('/check', pengadaan.cekApi)
route.get('/detail/:no', pengadaan.getDetail)
route.get('/tesemail', pengadaan.tesEmail)
route.patch('/upasset/:id', pengadaan.updateDataIo)
route.patch('/upnoio/:no', pengadaan.updateNoIo)
route.patch('/subasset/:no', pengadaan.submitIsAsset)
route.patch('/subbudget/:no', pengadaan.submitBudget)

module.exports = route
