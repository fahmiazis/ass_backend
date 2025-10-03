const route = require('express').Router()
const dashboard = require('../controllers/dashboard')

route.get('/get', dashboard.getDashboard)

module.exports = route
