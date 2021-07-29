const route = require('express').Router()
const clossing = require('../controllers/clossing')

route.post('/create', clossing.addClossing)

module.exports = route
