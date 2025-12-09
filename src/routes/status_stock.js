const route = require('express').Router()
const status = require('../controllers/status_stock')

route.post('/add', status.addStatusStock)
route.get('/all/:tipe', status.getStatusStock)
route.get('/get', status.getAllStatusStock)
route.get('/detail/:no', status.getDetailStatusStock)
route.patch('/update/:id', status.updateStatusStock)
route.post('/master', status.uploadMasterStatusStock)
route.delete('/del/:id', status.deleteStatusStock)
route.delete('/delall', status.deleteAll)
route.get('/export', status.exportSqlStatusStock)

module.exports = route
