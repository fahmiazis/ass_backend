const { disposal, asset, depo, ttd, docUser, mutasi, pengadaan, assettemp } = require('../models')
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
          {
            model: docUser,
            as: 'docAsset'
          },
          {
            model: depo,
            as: 'depo'
          }
        ]
      })
      const pageInfo = pagination('/report/disposal', req.query, page, limit, result.count)
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
  },
  getReportIo: async (req, res) => {
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
        sortValue = sort || 'tglIo'
      }
      if (!status) {
        status = 8
      } else {
        status = parseInt(status)
      }
      if (!limit) {
        limit = 100
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
      const level = req.user.level
      const kode = req.user.kode
      const name = req.user.name
      const fullname = req.user.fullname
      const statTrans = status === 'undefined' || status === null ? 'all' : status
      if (level === 5 || level === 9) {
        const result = await pengadaan.findAll({
          where: {
            kode_plant: level === 5 ? kode : name,
            [Op.and]: [
              statTrans === 'all' ? { [Op.not]: { no_pengadaan: null } } : { status_form: `${statTrans}` }
            ],
            [Op.or]: [
              { no_pengadaan: { [Op.like]: `%${searchValue}%` } },
              { no_io: { [Op.like]: `%${searchValue}%` } },
              { nama: { [Op.like]: `%${searchValue}%` } }
            ],
            [Op.not]: { no_pengadaan: null }
          },
          order: [
            [sortValue, 'ASC'],
            [{ model: ttd, as: 'appForm' }, 'id', 'DESC']
          ],
          include: [
            {
              model: depo,
              as: 'depo'
            },
            {
              model: assettemp,
              as: 'temp'
            },
            {
              model: ttd,
              as: 'appForm'
            }
          ],
          limit: limit,
          offset: (page - 1) * limit
          // group: ['pengadaan.no_pengadaan'],
          // distinct: true
        })
        if (result.rows.length > 0) {
          const pageInfo = pagination('/report/io', req.query, page, limit, result.count)
          return response(res, 'success get', { result: result.rows, pageInfo })
        } else {
          const pageInfo = pagination('/report/io', req.query, page, limit, result.count)
          return response(res, 'success get', { result: [], pageInfo })
        }
      } else if (level === 12 || level === 7 || level === 28) {
        const findDepo = await depo.findAll({
          where: {
            [Op.or]: [
              { nama_bm: level === 12 ? fullname : 'undefined' },
              { nama_om: level === 7 ? fullname : 'undefined' },
              { nama_nom: level === 28 ? fullname : 'undefined' }
            ]
          }
        })
        if (findDepo.length > 0) {
          const hasil = []
          for (let i = 0; i < findDepo.length; i++) {
            const result = await pengadaan.findAndCountAll({
              where: {
                kode_plant: findDepo[i].kode_plant,
                [Op.and]: [
                  statTrans === 'all' ? { [Op.not]: { no_pengadaan: null } } : { status_form: `${statTrans}` }
                ],
                [Op.or]: [
                  { no_pengadaan: { [Op.like]: `%${searchValue}%` } },
                  { no_io: { [Op.like]: `%${searchValue}%` } },
                  { nama: { [Op.like]: `%${searchValue}%` } }
                ],
                [Op.not]: { no_pengadaan: null }
              },
              order: [
                ['tglIo', 'ASC'],
                [{ model: ttd, as: 'appForm' }, 'id', 'DESC']
              ],
              include: [
                {
                  model: depo,
                  as: 'depo'
                },
                {
                  model: assettemp,
                  as: 'temp'
                },
                {
                  model: ttd,
                  as: 'appForm'
                }
              ],
              limit: limit,
              offset: (page - 1) * limit
              // group: ['pengadaan.no_pengadaan'],
              // distinct: true
            })
            if (result) {
              for (let j = 0; j < result.rows.length; j++) {
                hasil.push(result.rows[j])
              }
            }
          }
          if (hasil.length > 0) {
            const pageInfo = pagination('/report/io', req.query, page, limit, hasil.length)
            return response(res, 'success get', { result: hasil, findDepo, pageInfo })
          } else {
            const pageInfo = pagination('/report/io', req.query, page, limit, hasil.length)
            return response(res, 'success get', { result: hasil, pageInfo })
          }
        } else {
          return response(res, 'failed get data', { result: [] })
        }
      } else {
        const result = await pengadaan.findAndCountAll({
          where: {
            [Op.and]: [
              statTrans === 'all' ? { [Op.not]: { no_pengadaan: null } } : { status_form: `${statTrans}` }
            ],
            [Op.not]: { no_pengadaan: null }
          },
          order: [
            ['id', 'ASC'],
            [{ model: ttd, as: 'appForm' }, 'id', 'DESC']
          ],
          include: [
            {
              model: depo,
              as: 'depo'
            },
            {
              model: assettemp,
              as: 'temp'
            },
            {
              model: ttd,
              as: 'appForm'
            }
          ],
          limit: limit,
          offset: (page - 1) * limit
          // group: ['pengadaan.no_pengadaan'],
          // distinct: true
        })
        if (result.rows.length > 0) {
          const data = result.rows
          const finData = []
          for (let i = 0; i < data.length; i++) {
            if (data[i].temp.length > 0) {
              const dataTemp = data[i].temp
              for (let j = 0; j < dataTemp.length; j++) {
                const dataSend = {
                  ...data[i].dataValues,
                  no_asset_temp: dataTemp[j].no_asset
                }
                finData.push(dataSend)
              }
            } else {
              const dataSend = {
                ...data[i].dataValues,
                no_asset_temp: ''
              }
              finData.push(dataSend)
            }
          }
          const pageInfo = pagination('/report/io', req.query, page, limit, result.count)
          return response(res, 'success get', { result: finData, pageInfo })
        } else {
          const pageInfo = pagination('/report/io', req.query, page, limit, result.count)
          return response(res, 'failed get data', { result: [], pageInfo })
        }
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  }
}
