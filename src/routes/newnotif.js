const route = require('express').Router()
const newnotif = require('../controllers/newnotif')

route.post('/add', newnotif.addNotif)
route.get('/all', newnotif.getAllNotif)
route.get('/get', newnotif.getNotif)
route.patch('/read/:id', newnotif.readNotif)
route.delete('/del/:id', newnotif.deleteNotif)
route.delete('/delall', newnotif.deleteAll)

module.exports = route
