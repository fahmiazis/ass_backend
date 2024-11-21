const route = require('express').Router()
const asset = require('../controllers/asset')

route.post('/add', asset.addAsset)
route.get('/get', asset.getAsset)
route.get('/detail/:id', asset.getDetailAsset)
route.get('/all', asset.getAssetAll)
route.patch('/update/:id', asset.updateAsset)
route.delete('/delete/:id', asset.deleteAsset)
route.post('/master', asset.uploadMasterAsset)
route.get('/export', asset.exportSqlAsset)

module.exports = route
