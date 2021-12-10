const route = require('express').Router()
const report = require('../controllers/report')

route.get('/disposal', report.getReportDisposal)

module.exports = route
