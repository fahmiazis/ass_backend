const route = require('express').Router()
const tempmail = require('../controllers/tempmail')

route.post('/add', tempmail.addEmail)
route.get('/all', tempmail.getAllEmail)
route.get('/get', tempmail.getEmail)
route.get('/detail/:no', tempmail.getDetailEmail)
route.patch('/update/:id', tempmail.updateEmail)
route.delete('/del/:id', tempmail.deleteEmail)
route.delete('/delall', tempmail.deleteAll)
route.patch('/draft', tempmail.draftEmail)
// route.patch('/drajuan', tempmail.draftEmailAjuan)
route.patch('/send', tempmail.sendEmail)
route.patch('/resmail', tempmail.getResmail)
route.patch('/go', tempmail.tesEmail)

module.exports = route
