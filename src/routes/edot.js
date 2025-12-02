const route = require('express').Router()
const edot = require('../controllers/edot')

// EDOT Token Management
route.post('/edot/credential', edot.addEdotCredential)
route.post('/edot/token', edot.updateEdotToken)
route.get('/edot/token/:app_id', edot.getEdotTokenInfo)
route.get('/edot/test-decode', edot.testDecodeToken)

// EDOT API
route.get('/edot/onboarding', edot.getOnboarding)
route.get('/edot/offboarding', edot.getOffboarding)

module.exports = route
