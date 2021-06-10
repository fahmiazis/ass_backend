const route = require('express').Router()
const approve = require('../controllers/approve')

route.post('/create', approve.createApprove)
route.get('/get', approve.getApprove)
route.patch('/update/:id', approve.updateApprove)
route.delete('/delete/:id', approve.deleteApprove)

module.exports = route
