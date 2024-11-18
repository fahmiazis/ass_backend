const route = require('express').Router()
const show = require('../controllers/show')

route.get('/doc/:id', show.showDokumen)
route.get('/tes', show.tesDok)
route.get('/api', show.showApi)

module.exports = route
