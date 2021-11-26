const route = require('express').Router()
const notif = require('../controllers/notif')

route.get('/get', notif.getNotif)

module.exports = route
