const { docUser } = require('../models')
const response = require('../helpers/response')
const axios = require('axios')
const fs = require('fs')

module.exports = {
  showDokumen: async (req, res) => {
    try {
      const id = req.params.id
      const result = await docUser.findByPk(id)
      if (result) {
        const filePath = result.path
        fs.readFile(filePath, function (err, data) {
          if (err) {
            console.log(err)
          }
          res.contentType('application/pdf')
          res.send(data)
        })
      } else {
        return response(res, "can't show document", {}, 404, false)
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  showApi: async (req, res) => {
    try {
      const findAset = await axios.get('http://10.3.212.38:8000/sap/bc/zast/?sap-client=300&pgmna=zfir0090&p_anln1=4200000002&p_bukrs=pp01&p_gjahr=2021&p_monat=06')
      console.log(findAset.status)
      if (findAset.status === 200) {
        return response(res, 'success get api', { data: findAset.data })
      } else {
        return response(res, 'failed get api', {}, 404, false)
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  }
}
