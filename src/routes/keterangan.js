const route = require('express').Router()
const keterangan = require('../controllers/keterangan')

route.post('/add', keterangan.addKet)
route.get('/get/:nijul', keterangan.getKet)

module.exports = route
