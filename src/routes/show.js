const route = require('express').Router()
const show = require('../controllers/show')

route.get('/doc/:id', show.showDokumen)
route.get('/tes/:id', show.tesDok)
route.get('/api', show.showApi)

module.exports = route
