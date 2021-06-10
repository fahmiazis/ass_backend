const route = require('express').Router()
const user = require('../controllers/user')

route.post('/add', user.addUser)
route.get('/get', user.getUser)
route.patch('/update/:id', user.updateUser)
route.delete('/delete/:id', user.deleteUser)
route.get('/detail/:id', user.getDetailUser)
route.post('/master', user.uploadMasterUser)
route.get('/export', user.exportSqlUser)

module.exports = route
