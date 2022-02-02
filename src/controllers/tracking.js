const { disposal, path, ttd, mutasi, asset } = require('../models')
const response = require('../helpers/response')
// const { Op } = require('sequelize')

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
  }
}
