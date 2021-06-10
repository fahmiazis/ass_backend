const route = require('express').Router()
const show = require('../controllers/show')

route.get('/doc/:id', show.showDokumen)

module.exports = route
