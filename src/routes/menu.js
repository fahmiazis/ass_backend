const route = require('express').Router()
const menu = require('../controllers/menu')

route.post('/create', menu.createMenu)
route.post('/add', menu.createNameMenu)
route.get('/get', menu.getMenu)
route.get('/all/:type', menu.getAllMenu)
route.get('/detail/:nama', menu.getDetailMenu)
route.get('/name', menu.getNameMenu)
route.patch('/update/:id', menu.updateMenu)
route.delete('/delete/:id', menu.deleteMenu)

module.exports = route
