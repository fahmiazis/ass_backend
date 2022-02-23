const route = require('express').Router()
const track = require('../controllers/tracking')

route.get('/get', track.getTracking)
route.get('/mutasi', track.getTrackMutasi)
route.get('/stock', track.getTrackStock)

module.exports = route
