const route = require('express').Router()
const track = require('../controllers/tracking')

route.get('/get', track.getTracking)
route.get('/mutasi', track.getTrackMutasi)

module.exports = route
