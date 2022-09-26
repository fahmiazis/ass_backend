const route = require('express').Router()
const disposal = require('../controllers/disposal')

route.get('/get', disposal.getDisposal)
route.get('/cart', disposal.getCartDisposal)
route.get('/approve/:no', disposal.getApproveDisposal)
route.get('/detail/:nomor', disposal.getDetailDisposal)
route.post('/add/:no', disposal.addDisposal)
route.post('/sell/:no', disposal.addSell)
route.delete('/delete/:asset', disposal.deleteDisposal)
route.post('/img/:asset', disposal.uploadImage)
route.post('/submit', disposal.submitDisposal)
route.patch('/app/:no', disposal.approveDisposal)
route.patch('/rej/:no', disposal.rejectDisposal)
route.patch('/update/:id/:tipe', disposal.updateDisposal)
route.get('/doc/:no', disposal.getDocumentDis)
route.post('/upload/:id', disposal.uploadDocument)
route.patch('/docapp/:id', disposal.approveDokumen)
route.patch('/docrej/:id', disposal.rejectDokumen)
route.get('/setuju/submit', disposal.submitSetDisposal)
route.get('/setuju/get', disposal.getSetDisposal)
route.get('/setuju/approve/:no', disposal.getApproveSetDisposal)
route.patch('/setuju/app/:no', disposal.approveSetDisposal)
route.patch('/setuju/rej/:no', disposal.rejectSetDisposal)
route.patch('/eks/submit/:no', disposal.submitEksDisposal)
route.patch('/taxfin/submit/:no', disposal.submitTaxFin)
route.patch('/final/submit/:no', disposal.submitFinal)
route.patch('/purch/submit/:no', disposal.submitPurch)
route.patch('/taxfin/rej/:no', disposal.rejectTaxFin)
route.patch('/taxfin/edit/:no', disposal.submitEditTaxFin)
route.patch('/asset', disposal.updateStatus)
route.get('/purch/get', disposal.getDocumentPurch)
route.patch('/editdis/:no', disposal.submitEditDis)
route.patch('/rejeks', disposal.rejectEks)
route.patch('/editeks', disposal.submitEditEks)

module.exports = route
