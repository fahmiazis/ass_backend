const route = require('express').Router()
const lokasi = require('../controllers/lokasi')

route.post('/import', lokasi.uploadMasterLokasi)

module.exports = route
