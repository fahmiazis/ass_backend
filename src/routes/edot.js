const route = require('express').Router()
const edot = require('../controllers/edot')

// EDOT Token Management
route.post('/credential', edot.addEdotCredential)
route.post('/token', edot.updateEdotToken)
route.get('/token/:app_id', edot.getEdotTokenInfo)
route.get('/test-decode', edot.testDecodeToken)

// EDOT API
route.get('/onboarding', edot.getOnboarding)
route.get('/offboarding', edot.getOffboarding)

module.exports = route
