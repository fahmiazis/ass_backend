const { clossing } = require('../models')
const response = require('../helpers/response')
const joi = require('joi')

module.exports = {
  addClossing: async (req, res) => {
    try {
      const schema = joi.object({
        jenis: joi.string().required(),
        start: joi.number().required(),
        end: joi.number().required()
      })
      const { value: results, error } = schema.validate(req.body)
      if (error) {
        return response(res, 'Error', { error: error.message }, 401, false)
      } else {
        const result = await clossing.findOne({
          where: {
            jenis: results.jenis
          }
        })
        if (result) {
          const send = await result.update(results)
          if (send) {
            return response(res, `success create ${results.jenis} clossing`)
          } else {
            return response(res, 'failed create clossing', {}, 404, false)
          }
        } else {
          const send = await clossing.create(results)
          if (send) {
            return response(res, `success create ${results.jenis} clossing`)
          } else {
            return response(res, 'failed create clossing', {}, 404, false)
          }
        }
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  }
}
