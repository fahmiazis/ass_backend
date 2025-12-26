const route = require('express').Router()
const clossing = require('../controllers/clossing')

route.post('/add', clossing.addClossing)
route.patch('/update/:id', clossing.updateClossing)
route.get('/detail/:id', clossing.getDetailClossing)
route.get('/get', clossing.getClossing)
route.get('/all', clossing.getAllClossing)
route.delete('/delete', clossing.deleteClossing)

module.exports = route
