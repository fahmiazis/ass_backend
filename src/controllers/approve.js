const { approve, nameApprove } = require('../models')
const joi = require('joi')
const response = require('../helpers/response')
const { Op } = require('sequelize')
const { pagination } = require('../helpers/pagination')

module.exports = {
  createApprove: async (req, res) => {
    try {
      const level = req.user.level
      const schema = joi.object({
        jabatan: joi.string().required(),
        jenis: joi.string().required(),
        sebagai: joi.string().required(),
        kategori: joi.string().allow(''),
        nama_approve: joi.string().required()
      })
      const { value: results, error } = schema.validate(req.body)
      if (error) {
        return response(res, 'Error', { error: error.message }, 401, false)
      } else {
        if (level === 1) {
          const result = await approve.findAll({
            where: {
              [Op.and]: [
                { jabatan: results.jabatan },
                { nama_approve: results.nama_approve }
              ]
            }
          })
          if (result.length > 0) {
            return response(res, 'Telah terdaftar', {}, 404, false)
          } else {
            const result = await approve.create(results)
            if (result) {
              return response(res, 'succesfully create approve', { result })
            } else {
              return response(res, 'failed to create', {}, 404, false)
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
  createNameApprove: async (req, res) => {
    try {
      const level = req.user.level
      const schema = joi.object({
        name: joi.string().required()
      })
      const { value: results, error } = schema.validate(req.body)
      if (error) {
        return response(res, 'Error', { error: error.message }, 401, false)
      } else {
        if (level === 1) {
          const result = await nameApprove.findAll({
            where: {
              name: results.name
            }
          })
          if (result.length > 0) {
            return response(res, 'Telah terdaftar', {}, 404, false)
          } else {
            const result = await nameApprove.create(results)
            if (result) {
              return response(res, 'succesfully create approve', { result })
            } else {
              return response(res, 'failed to create approve', {}, 404, false)
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
  updateApprove: async (req, res) => {
    try {
      const id = req.params.id
      const level = req.user.level
      const schema = joi.object({
        jabatan: joi.string().required(),
        jenis: joi.string().allow(''),
        sebagai: joi.string().allow(''),
        kategori: joi.string().allow(''),
        nama_approve: joi.string().required()
      })
      const { value: results, error } = schema.validate(req.body)
      if (error) {
        return response(res, 'Error', { error: error.message }, 401, false)
      } else {
        if (level === 1) {
          const result = await approve.findAll({
            where: {
              [Op.and]: [
                { jabatan: results.jabatan },
                { nama_approve: results.nama_approve }
              ],
              [Op.not]: {
                id: id
              }
            }
          })
          if (result.length > 0) {
            return response(res, 'Telah terdaftar', {}, 404, false)
          } else {
            const result = await approve.findByPk(id)
            if (result) {
              await result.update(results)
              return response(res, 'successfully update master approve')
            } else {
              return response(res, 'failed to create', {}, 404, false)
            }
          }
        } else {
          return response(res, "you're not super admin", {}, 400, false)
        }
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  getApprove: async (req, res) => {
    try {
      let { limit, page, search, sort } = req.query
      let searchValue = ''
      let sortValue = ''
      if (typeof search === 'object') {
        searchValue = Object.values(search)[0]
      } else {
        searchValue = search || ''
      }
      if (typeof sort === 'object') {
        sortValue = Object.values(sort)[0]
      } else {
        sortValue = sort || 'id'
      }
      if (!limit) {
        limit = 100
      } else {
        limit = parseInt(limit)
      }
      if (!page) {
        page = 1
      } else {
        page = parseInt(page)
      }
      const result = await approve.findAndCountAll({
        where: {
          [Op.or]: [
            { jabatan: { [Op.like]: `%${searchValue}%` } },
            { jenis: { [Op.like]: `%${searchValue}%` } },
            { sebagai: { [Op.like]: `%${searchValue}%` } },
            { kategori: { [Op.like]: `%${searchValue}%` } }
          ]
        },
        order: [[sortValue, 'ASC']],
        limit: limit,
        offset: (page - 1) * limit
      })
      const pageInfo = pagination('/email/get', req.query, page, limit, result.count)
      if (result) {
        return response(res, 'list approve', { result, pageInfo })
      } else {
        return response(res, 'failed to get user', {}, 404, false)
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  getDetailApprove: async (req, res) => {
    try {
      const nama = req.params.nama
      const result = await approve.findAll({
        where: {
          nama_approve: nama
        }
      })
      if (result) {
        return response(res, 'success get detail disposal', { result })
      } else {
        return response(res, 'failed get detail disposal', {}, 404, false)
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  getNameApprove: async (req, res) => {
    try {
      let { limit, page, search, sort } = req.query
      let searchValue = ''
      let sortValue = ''
      if (typeof search === 'object') {
        searchValue = Object.values(search)[0]
      } else {
        searchValue = search || ''
      }
      if (typeof sort === 'object') {
        sortValue = Object.values(sort)[0]
      } else {
        sortValue = sort || 'id'
      }
      if (!limit) {
        limit = 100
      } else {
        limit = parseInt(limit)
      }
      if (!page) {
        page = 1
      } else {
        page = parseInt(page)
      }
      const result = await nameApprove.findAndCountAll({
        where: {
          [Op.or]: [
            { name: { [Op.like]: `%${searchValue}%` } }
          ]
        },
        order: [[sortValue, 'ASC']],
        limit: limit,
        offset: (page - 1) * limit
      })
      const pageInfo = pagination('/approve/name', req.query, page, limit, result.count)
      if (result) {
        return response(res, 'list approve', { result, pageInfo })
      } else {
        return response(res, 'failed to get user', {}, 404, false)
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  deleteApprove: async (req, res) => {
    try {
      const id = req.params.id
      const level = req.user.level
      if (level === 1) {
        const result = await approve.findByPk(id)
        if (result) {
          await result.destroy()
          return response(res, 'success delete approve')
        } else {
          return response(res, 'failed to delete approve', {}, 404, false)
        }
      } else {
        return response(res, "you're not super admin", {}, 400, false)
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  }
}
