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

module.exports = route
