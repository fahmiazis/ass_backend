const route = require('express').Router()
const apk = require('../controllers/apk')

route.get('/get', apk.getApk)
route.get('/detail/:id', apk.getDetailApk)
route.post('/add', apk.addApk)

module.exports = route
