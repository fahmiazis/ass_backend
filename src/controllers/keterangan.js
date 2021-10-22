const { keterangan } = require('../models')
const joi = require('joi')
const response = require('../helpers/response')

module.exports = {
  addKet: async (req, res) => {
    try {
      const level = req.user.level
      const schema = joi.object({
        nama: joi.string().required()
      })
      const { value: results, error } = schema.validate(req.body)
      if (error) {
        return response(res, 'Error', { error: error.message }, 404, false)
      } else {
        if (level === 1) {
          const data = {
            nama: results.nama,
            status: 'active'
          }
          const cek = await keterangan.findAll({
            where: {
              nama: results.nama
            }
          })
          if (cek.length > 0) {
            return response(res, 'keterangan already exist', {}, 400, false)
          } else {
            const result = await keterangan.create(data)
            if (result) {
              return response(res, 'success create keterangan')
            } else {
              return response(res, 'failed create keterangan', {}, 400, false)
            }
          }
        } else {
          return response(res, "you're not super administrator", {}, 400, false)
        }
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  getKet: async (req, res) => {
    try {
      const nijul = req.params.nijul
      if (nijul === '0' || nijul === 0) {
        const result = await keterangan.findAll({
          where: {
            kategori: 'dispose'
          }
        })
        if (result) {
          return response(res, 'success get keterangan', { result })
        } else {
          return response(res, 'failed get keterangan', {}, 400, false)
        }
      } else {
        const result = await keterangan.findAll({
          where: {
            kategori: 'sell'
          }
        })
        if (result) {
          return response(res, 'success get keterangan', { result })
        } else {
          return response(res, 'failed get keterangan', {}, 400, false)
        }
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  }
}
