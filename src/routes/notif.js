const route = require('express').Router()
const notif = require('../controllers/notif')

route.get('/get', notif.getNotif)
route.patch('/update/:id', notif.updateNotif)
route.patch('/upall', notif.updateAllNotif)
route.delete('/delete/:id', notif.deleteNotif)
route.delete('/delall', notif.deleteAllNotif)

module.exports = route
