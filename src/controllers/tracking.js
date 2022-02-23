const { disposal, path, ttd, mutasi, asset, clossing, stock } = require('../models')
const response = require('../helpers/response')
const moment = require('moment')
const { Op } = require('sequelize')

module.exports = {
  getTracking: async (req, res) => {
    const kode = req.user.kode
    const result = await disposal.findAndCountAll({
      where: {
        kode_plant: kode
        // [Op.not]: { status_form: 8 }
      },
      order: [
        ['id', 'DESC'],
        [{ model: ttd, as: 'appForm' }, 'id', 'DESC'],
        [{ model: ttd, as: 'ttdSet' }, 'id', 'DESC']
      ],
      include: [
        {
          model: path,
          as: 'pict'
        },
        {
          model: ttd,
          as: 'ttdSet'
        },
        {
          model: ttd,
          as: 'appForm'
        }
      ]
    })
    if (result) {
      const data = []
      result.rows.map(x => {
        return (
          data.push(x.no_disposal)
        )
      })
      const set = new Set(data)
      const noDis = [...set]
      return response(res, 'success get tracking', { result, noDis })
    } else {
      return response(res, 'failed get tracking', {}, 404, false)
    }
  },
  getTrackMutasi: async (req, res) => {
    try {
      const kode = req.user.kode
      const result = await mutasi.findAndCountAll({
        where: {
          kode_plant: kode
        },
        include: [
          {
            model: ttd,
            as: 'appForm'
          },
          {
            model: path,
            as: 'pict'
          },
          {
            model: asset,
            as: 'dataAsset'
          }
        ],
        order: [
          ['id', 'ASC'],
          [{ model: ttd, as: 'appForm' }, 'id', 'DESC']
        ]
      })
      if (result) {
        const data = []
        result.rows.map(x => {
          return (
            data.push(x.no_mutasi)
          )
        })
        const set = new Set(data)
        const noMut = [...set]
        return response(res, 'success get tracking', { result, noMut })
      } else {
        return response(res, 'failed to get tracking', {}, 404, false)
      }
    } catch (error) {
      return response(res, 'failed get tracking', {}, 404, false)
    }
  },
  getTrackStock: async (req, res) => {
    try {
      const kode = req.user.kode
      const findClose = await clossing.findAll({
        where: {
          jenis: 'stock'
        }
      })
      if (findClose.length > 0) {
        const time = moment().format('L').split('/')
        let start = ''
        let end = ''
        if (parseInt(time[1]) >= 1 && parseInt(time[1]) <= findClose[0].end) {
          const next = moment().subtract(1, 'month').format('L').split('/')
          end = `${time[2]}-${time[0]}-${findClose[0].end}`
          start = `${next[2]}-${next[0]}-${findClose[0].start}`
        } else {
          const next = moment().add(1, 'month').format('L').split('/')
          start = `${time[2]}-${time[0]}-${findClose[0].start}`
          end = `${next[2]}-${next[0]}-${findClose[0].end}`
        }
        const result = await stock.findAll({
          where: {
            [Op.and]: [
              { kode_plant: kode },
              {
                tanggalStock: {
                  [Op.lte]: end,
                  [Op.gte]: start
                }
              }
            ]
          },
          include: [
            {
              model: path,
              as: 'pict'
            },
            {
              model: ttd,
              as: 'appForm'
            }
          ],
          order: [
            ['id', 'ASC'],
            [{ model: ttd, as: 'appForm' }, 'id', 'DESC']
          ]
        })
        if (result) {
          return response(res, 'list asset', { result: { rows: result, count: result.length } })
        } else {
          return response(res, 'failed to get stock', {}, 404, false)
        }
      } else {
        return response(res, 'Buat clossing untuk stock opname terlebih dahulu', {}, 400, false)
      }
    } catch (error) {
      return response(res, 'failed get tracking', {}, 404, false)
    }
  }
}
