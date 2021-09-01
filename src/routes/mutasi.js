const route = require('express').Router()
const mutasi = require('../controllers/mutasi')

route.post('/add/:no/:plant', mutasi.addMutasi)
route.get('/get', mutasi.getMutasi)
route.delete('/del/:no', mutasi.deleteItem)
route.post('/submit', mutasi.submitMutasi)
route.get('/detail/:no', mutasi.getDetailMutasi)
route.get('/approve/:no/:nama', mutasi.getApproveMut)
route.patch('/app/:no', mutasi.approveMutasi)
route.patch('/rej/:no', mutasi.rejectMutasi)
route.get('/rec', mutasi.getMutasiRec)
route.get('/doc/:no/:nomut', mutasi.getDocumentMut)

module.exports = route
