const route = require('express').Router()
const dokumen = require('../controllers/document')

route.post('/add', dokumen.addDocument)
route.get('/area/get', dokumen.getDocumentsArea)
route.get('/get', dokumen.getDocuments)
route.patch('/update/:id', dokumen.updateDocument)
route.delete('/delete/:id', dokumen.deleteDocuments)
route.post('/master', dokumen.uploadMasterDokumen)
route.get('/export', dokumen.exportSqlDocument)

module.exports = route
