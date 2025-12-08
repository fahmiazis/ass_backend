const route = require('express').Router()
const edot = require('../controllers/edot')

// EDOT Token Management
route.post('/credential', edot.addEdotCredential)
route.post('/token', edot.updateEdotToken)
route.get('/token/:app_id', edot.getEdotTokenInfo)
route.get('/test-decode', edot.testDecodeToken)

// EDOT API
route.get('/onboarding', edot.getOnboardingHC)
route.get('/offboarding', edot.getOffboardingHC)

// sync data hc portal
route.get('/sync-onboarding', edot.syncOnBoarding)
route.get('/sync-offboarding', edot.syncOffBoarding)

// get data local
route.get('/aset-onboarding', edot.getOnBoardingAsset)
route.get('/aset-offboarding', edot.getOffBoardingAsset)

module.exports = route
