const route = require('express').Router()
const stock = require('../controllers/stock')

route.get('/submit', stock.submit)
route.get('/get', stock.getStockAll)
route.get('/report', stock.getReportAll)
route.get('/detail/:id', stock.getDetailStock)
route.delete('/delete/:id', stock.deleteStock)
route.get('/approve/:no/:nama', stock.getApproveStock)
route.patch('/app/:no', stock.approveStock)
route.patch('/rej/:no', stock.rejectStock)
route.post('/img/:no', stock.uploadPicture)
route.post('/status/add', stock.addStatus)
route.get('/status/get', stock.getStatus)
route.get('/status/all', stock.getStatusAll)
route.get('/doc/:no', stock.getDocument)
route.get('/cekdoc/:no', stock.cekDokumen)

module.exports = route
