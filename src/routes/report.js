const route = require('express').Router()
const report = require('../controllers/report')

route.get('/disposal', report.getReportDisposal)
route.get('/mutasi', report.getReportMutasi)
route.get('/io', report.getReportIo)

module.exports = route
