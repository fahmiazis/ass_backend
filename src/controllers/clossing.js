const { clossing } = require('../models')
const response = require('../helpers/response')
const joi = require('joi')
const { Op } = require('sequelize')
const { pagination } = require('../helpers/pagination')
const moment = require('moment')

module.exports = {
  addClossing: async (req, res) => {
    try {
      const schema = joi.object({
        jenis: joi.string().required(),
        periode: joi.string().required(),
        type_clossing: joi.string().required(),
        start: joi.number().required(),
        end: joi.number().required()
      })
      const { value: results, error } = schema.validate(req.body)
      if (error) {
        return response(res, 'Error', { error: error.message }, 401, false)
      } else {
        const result = await clossing.findOne({
          where: {
            [Op.and]: [
              { jenis: results.jenis },
              { type_clossing: results.type_clossing },
              results.type_clossing === 'all' ? { [Op.not]: { id: null } } : { periode: { [Op.like]: `%${moment(results.periode).format('YYYY-MM')}%` } }
            ]
          }
        })
        if (result) {
          return response(res, 'settingan clossing telah terdaftar', {}, 404, false)
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
  },
  updateClossing: async (req, res) => {
    try {
      const id = req.params.id
      const schema = joi.object({
        jenis: joi.string().required(),
        periode: joi.string().required(),
        type_clossing: joi.string().required(),
        start: joi.number().required(),
        end: joi.number().required()
      })
      const { value: results, error } = schema.validate(req.body)
      if (error) {
        return response(res, 'Error', { error: error.message }, 401, false)
      } else {
        const result = await clossing.findOne({
          where: {
            [Op.and]: [
              { jenis: results.jenis },
              { type_clossing: results.type_clossing },
              results.type_clossing === 'all' ? { [Op.not]: { id: null } } : { periode: { [Op.like]: `%${moment(results.periode).format('YYYY-MM')}%` } },
              { [Op.not]: { id: id } }
            ]
          }
        })
        if (result) {
          return response(res, 'settingan clossing telah terdaftar', {}, 404, false)
        } else {
          const findUpdate = await clossing.findByPk(id)
          if (findUpdate) {
            await findUpdate.update(results)
            return response(res, 'success update stock clossing')
          } else {
            return response(res, 'failed update clossing', {}, 404, false)
          }
        }
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  getAllClossing: async (req, res) => {
    try {
      const findClossing = await clossing.findAll()
      if (findClossing.length > 0) {
        return response(res, 'succes get clossing', { result: findClossing, length: findClossing.length })
      } else {
        return response(res, 'failed get clossing', {}, 404, false)
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  getClossing: async (req, res) => {
    try {
      let { limit, page, search, sort } = req.query
      let searchValue = ''
      let sortValue = ''
      if (typeof search === 'object') {
        searchValue = Object.values(search)[0]
      } else {
        searchValue = search || '' // eslint-disable-line
      }
      if (typeof sort === 'object') {
        sortValue = Object.values(sort)[0]
      } else {
        sortValue = sort || 'id'
      }
      if (!limit) {
        limit = 10
      } else if (limit === 'all') {
        const findLimit = await clossing.findAll()
        limit = findLimit.length
      } else {
        limit = parseInt(limit)
      }
      if (!page) {
        page = 1
      } else {
        page = parseInt(page)
      }
      const findClossing = await clossing.findAndCountAll({
        // where: {
        //   [Op.or]: [
        //     { periode: { [Op.like]: `%${searchValue}%` } }
        //   ]
        // },
        order: [[sortValue, 'ASC']],
        limit: limit,
        offset: (page - 1) * limit
      })
      const pageInfo = pagination('/status-stock/get', req.query, page, limit, findClossing.count)
      if (findClossing.rows.length > 0) {
        return response(res, 'succes get clossing', { result: findClossing, pageInfo })
      } else {
        return response(res, 'failed get clossing', { findClossing }, 404, false)
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  getDetailClossing: async (req, res) => {
    try {
      const id = req.params.id
      const findClossing = await clossing.findByPk(id)
      if (findClossing) {
        return response(res, 'succes get detail clossing', { result: findClossing })
      } else {
        return response(res, 'failed get clossing', {}, 404, false)
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  deleteClossing: async (req, res) => {
    try {
      const id = req.params.id
      const findClossing = await clossing.findByPk(id)
      if (findClossing) {
        const delClossing = await findClossing.destroy()
        if (delClossing) {
          return response(res, 'succes delete clossing', { result: findClossing })
        } else {
          return response(res, 'failed destroy clossing', {}, 404, false)
        }
      } else {
        return response(res, 'failed get clossing', {}, 404, false)
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  }
}
