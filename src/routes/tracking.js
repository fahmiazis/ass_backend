const route = require('express').Router()
const track = require('../controllers/tracking')

route.get('/get', track.getTracking)

module.exports = route
