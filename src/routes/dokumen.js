const route = require('express').Router()
const dokumen = require('../controllers/document')

route.post('/add', dokumen.addDocument)
route.get('/area/get', dokumen.getDocumentsArea)
route.get('/get', dokumen.getDocuments)
route.patch('/update/:id', dokumen.updateDocument)
route.delete('/delete/:id', dokumen.deleteDocuments)
route.post('/master', dokumen.uploadMasterDokumen)
route.get('/export', dokumen.exportSqlDocument)

route.patch('/approve/:id', dokumen.approveDoc)
route.patch('/reject/:id', dokumen.rejectDoc)
route.patch('/docuser', dokumen.getDocuser)

route.post('/create', dokumen.createNameDocument)
route.patch('/name/edit/:id', dokumen.updateNameDocument)
route.delete('/delete/name/:id', dokumen.deleteNameDocument)
route.get('/name', dokumen.getNameDocument)
route.get('/detail', dokumen.getDetailDocument)
route.get('/detail/name/:id', dokumen.getDetailId)
route.get('/template', dokumen.getTempDocument)

module.exports = route
