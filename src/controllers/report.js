const { disposal, asset, depo, ttd, docUser, mutasi, pengadaan, assettemp } = require('../models')
const response = require('../helpers/response')
const { Op } = require('sequelize')
const moment = require('moment')
const { pagination } = require('../helpers/pagination')

module.exports = {
  getReportDisposal: async (req, res) => {
    try {
      let { limit, page, search, sort, status } = req.query
      const { time1, time2 } = req.query
      const timeVal1 = time1 === 'undefined' ? 'all' : time1
      const timeVal2 = time2 === 'undefined' ? 'all' : time2
      const timeV1 = moment(timeVal1)
      const timeV2 = timeVal1 !== 'all' && timeVal1 === timeVal2 ? moment(timeVal2).add(1, 'd') : moment(timeVal2).add(1, 'd')
      const statTrans = status === 'undefined' || status === null ? 'all' : status
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
          [Op.and]: [
            statTrans === 'all'
              ? { [Op.not]: { no_disposal: null } }
              : { status_form: parseInt(statTrans) },
            timeVal1 === 'all'
              ? { [Op.not]: { id: null } }
              : {
                  tanggalDis: {
                    [Op.gte]: timeV1,
                    [Op.lt]: timeV2
                  }
                },
            { [Op.not]: { status_form: 1 } },
            { [Op.not]: { no_disposal: null } }
          ],
          [Op.or]: [
            { no_disposal: { [Op.like]: `%${searchValue}%` } },
            { no_asset: { [Op.like]: `%${searchValue}%` } },
            { area: { [Op.like]: `%${searchValue}%` } },
            { kode_plant: { [Op.like]: `%${searchValue}%` } },
            { nama_asset: { [Op.like]: `%${searchValue}%` } }
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
      const { time1, time2 } = req.query
      const timeVal1 = time1 === 'undefined' ? 'all' : time1
      const timeVal2 = time2 === 'undefined' ? 'all' : time2
      const timeV1 = moment(timeVal1)
      const timeV2 = timeVal1 !== 'all' && timeVal1 === timeVal2 ? moment(timeVal2).add(1, 'd') : moment(timeVal2).add(1, 'd')
      const statTrans = status === 'undefined' || status === null ? 'all' : status
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
      const result = await mutasi.findAll({
        where: {
          [Op.and]: [
            statTrans === 'all'
              ? { [Op.not]: { no_mutasi: null } }
              : { status_form: parseInt(statTrans) },
            timeVal1 === 'all'
              ? { [Op.not]: { id: null } }
              : {
                  tanggalMut: {
                    [Op.gte]: timeV1,
                    [Op.lt]: timeV2
                  }
                },
            { [Op.not]: { status_form: 1 } },
            { [Op.not]: { no_mutasi: null } }
          ],
          [Op.or]: [
            { no_mutasi: { [Op.like]: `%${searchValue}%` } },
            { no_asset: { [Op.like]: `%${searchValue}%` } },
            { area: { [Op.like]: `%${searchValue}%` } },
            { no_asset: { [Op.like]: `%${searchValue}%` } },
            { nama_asset: { [Op.like]: `%${searchValue}%` } }
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
      const pageInfo = pagination('/report/mutasi', req.query, page, limit, result.length)
      if (result) {
        return response(res, 'success get report', { result: { rows: result, count: result.length }, pageInfo })
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
      const { time1, time2 } = req.query
      const timeVal1 = time1 === 'undefined' ? 'all' : time1
      const timeVal2 = time2 === 'undefined' ? 'all' : time2
      const timeV1 = moment(timeVal1)
      const timeV2 = timeVal1 !== 'all' && timeVal1 === timeVal2 ? moment(timeVal2).add(1, 'd') : moment(timeVal2).add(1, 'd')
      const statTrans = status === 'undefined' || status === null || status === '' ? 'all' : status
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
      if (level === 5 || level === 9) {
        const result = await pengadaan.findAll({
          where: {
            kode_plant: level === 5 ? kode : name,
            [Op.and]: [
              statTrans === 'all' ? { [Op.not]: { no_pengadaan: null } } : { status_form: `${statTrans}` },
              timeVal1 === 'all'
                ? { [Op.not]: { id: null } }
                : {
                    tglIo: {
                      [Op.gte]: timeV1,
                      [Op.lt]: timeV2
                    }
                  }
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
              model: assettemp,
              as: 'temp_return'
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
                  statTrans === 'all' ? { [Op.not]: { no_pengadaan: null } } : { status_form: `${statTrans}` },
                  timeVal1 === 'all'
                    ? { [Op.not]: { id: null } }
                    : {
                        tglIo: {
                          [Op.gte]: timeV1,
                          [Op.lt]: timeV2
                        }
                      }
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
                  model: assettemp,
                  as: 'temp_return'
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
              statTrans === 'all' ? { [Op.not]: { no_pengadaan: null } } : { status_form: `${statTrans}` },
              timeVal1 === 'all'
                ? { [Op.not]: { id: null } }
                : {
                    tglIo: {
                      [Op.gte]: timeV1,
                      [Op.lt]: timeV2
                    }
                  }
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
              model: assettemp,
              as: 'temp_return'
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
                if (finData.find(item => item.no_asset === dataTemp[j].no_asset && item.no_pengadaan === data[i].no_pengadaan) !== undefined) {
                  finData.push()
                } else {
                  finData.push(dataSend)
                }
              }
            } else if (data[i].temp_return.length > 0) {
              const dataTemp = data[i].temp_return
              for (let j = 0; j < dataTemp.length; j++) {
                const dataSend = {
                  ...data[i].dataValues,
                  no_asset_temp: dataTemp[j].no_asset
                }
                if (finData.find(item => item.no_asset === dataTemp[j].no_asset && item.no_pengadaan === data[i].no_pengadaan) !== undefined) {
                  finData.push()
                } else {
                  finData.push(dataSend)
                }
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
