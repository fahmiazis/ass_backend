const route = require('express').Router()
const disposal = require('../controllers/disposal')

route.get('/get', disposal.getDisposal)
route.get('/detail/:nomor', disposal.getDetailDisposal)
route.post('/add/:id', disposal.addDisposal)
route.delete('/delete/:asset', disposal.deleteDisposal)
route.post('/img/:asset', disposal.uploadImage)
route.post('/submit', disposal.submitDisposal)

module.exports = route
