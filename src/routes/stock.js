const route = require('express').Router()
const stock = require('../controllers/stock')

route.get('/submit', stock.submit)
route.get('/get', stock.getStockAll)
route.get('/detail/:id', stock.getDetailStock)
route.delete('/delete/:id', stock.deleteStock)
route.get('/approve/:no/:nama', stock.getApproveStock)

module.exports = route
