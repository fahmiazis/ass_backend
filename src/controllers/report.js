const { disposal, asset, depo, ttd, docUser, mutasi } = require('../models')
const response = require('../helpers/response')
const { Op } = require('sequelize')
const { pagination } = require('../helpers/pagination')

module.exports = {
  getReportDisposal: async (req, res) => {
    try {
      let { limit, page, search, sort, status } = req.query
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
      if (!status) {
        status = 1
      } else {
        status = parseInt(status)
      }
      if (!limit) {
        limit = 10
      } else if (limit === 'All') {
        limit = null
      } else {
        limit = parseInt(limit)
      }
      if (!page) {
        page = 1
      } else {
        page = parseInt(page)
      }
      const result = await disposal.findAndCountAll({
        where: {
          [Op.or]: [
            { no_disposal: { [Op.like]: `%${searchValue}%` } },
            { no_asset: { [Op.like]: `%${searchValue}%` } }
          ]
        },
        order: [
          [sortValue, 'ASC'],
          // [{ model: ttd, as: 'appForm' }, 'id', 'DESC'],
          [{ model: ttd, as: 'ttdSet' }, 'id', 'DESC']
        ],
        limit: limit,
        offset: (page - 1) * limit,
        include: [
          {
            model: ttd,
            as: 'appForm'
          },
          {
            model: ttd,
            as: 'ttdSet'
          },
          {
            model: asset,
            as: 'dataAsset'
          },
          // {
          //   model: docUser,
          //   as: 'docAsset',
          //   where: {
          //     jenis_form: 'disposal'
          //   }
          // },
          {
            model: depo,
            as: 'depo'
          }
        ]
      })
      const pageInfo = pagination('/report/get', req.query, page, limit, result.count)
      if (result) {
        return response(res, 'success get report disposal', { result, pageInfo })
      } else {
        return response(res, 'failed get report disposal', {}, 400, false)
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  getReportMutasi: async (req, res) => {
    try {
      let { limit, page, search, sort, status } = req.query
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
      if (!status) {
        status = 1
      } else {
        status = parseInt(status)
      }
      if (!limit) {
        limit = 10
      } else if (limit === 'All') {
        limit = null
      } else {
        limit = parseInt(limit)
      }
      if (!page) {
        page = 1
      } else {
        page = parseInt(page)
      }
      const result = await mutasi.findAndCountAll({
        where: {
          [Op.or]: [
            { no_mutasi: { [Op.like]: `%${searchValue}%` } },
            { no_asset: { [Op.like]: `%${searchValue}%` } }
          ]
        },
        order: [
          [sortValue, 'ASC'],
          [{ model: ttd, as: 'appForm' }, 'id', 'DESC']
        ],
        limit: limit,
        offset: (page - 1) * limit,
        include: [
          {
            model: ttd,
            as: 'appForm'
          },
          {
            model: asset,
            as: 'dataAsset'
          },
          {
            model: depo,
            as: 'depo'
          },
          {
            model: docUser,
            as: 'docAsset'
          }
        ]
      })
      const pageInfo = pagination('/report/mutasi', req.query, page, limit, result.count)
      if (result) {
        return response(res, 'success get report', { result, pageInfo })
      } else {
        return response(res, 'failed get report', {}, 400, false)
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  }
}
