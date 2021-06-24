const { disposal, asset, depo, path } = require('../models')
// const joi = require('joi')
const response = require('../helpers/response')
const { Op } = require('sequelize')
const { pagination } = require('../helpers/pagination')
const multer = require('multer')
const uploadHelper = require('../helpers/upload')

module.exports = {
  addDisposal: async (req, res) => {
    try {
      const id = req.params.id
      const kode = req.user.kode
      const result = await asset.findByPk(id)
      if (result) {
        const findAsset = await disposal.findAll({
          where: {
            no_asset: result.no_asset
          }
        })
        if (findAsset.length > 0) {
          return response(res, 'success add disposal', { result: findAsset })
        } else if (result.kode_plant === kode) {
          const findDepo = await depo.findAll({
            where: {
              kode_plant: kode
            }
          })
          if (findDepo.length > 0) {
            const send = {
              kode_plant: result.kode_plant,
              area: findDepo[0].nama_area,
              no_doc: result.no_doc,
              no_asset: result.no_asset,
              nama_asset: result.nama_asset,
              cost_center: findDepo[0].cost_center,
              status_depo: findDepo[0].status_area,
              nilai_jual: 0,
              status_form: 1
            }
            const make = await disposal.create(send)
            if (make) {
              return response(res, 'success add disposal', { result: make })
            } else {
              return response(res, 'failed add disposal', {}, 400, false)
            }
          } else {
            return response(res, 'failed add disposal', {}, 400, false)
          }
        } else {
          return response(res, 'failed add disposal', {}, 400, false)
        }
      } else {
        return response(res, 'failed add disposal', {}, 400, false)
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  deleteDisposal: async (req, res) => {
    try {
      const noAsset = req.params.asset
      const kode = req.user.kode
      const result = await disposal.findOne({
        where: {
          [Op.and]: [
            { no_asset: noAsset },
            { status_form: 1 }
          ]
        }
      })
      if (result) {
        if (result[0].kode_plant === kode) {
          const del = await result.destroy()
          if (del) {
            return response(res, 'success delete disposal')
          } else {
            return response(res, 'failed delete disposal', {}, 400, false)
          }
        } else {
          return response(res, "failed delete disposal, you havn't access", {}, 400, false)
        }
      } else {
        return response(res, 'failed delete disposal', {}, 400, false)
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  getDisposal: async (req, res) => {
    try {
      const level = req.user.level
      const kode = req.user.kode
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
        sortValue = sort || 'no_disposal'
      }
      if (!limit) {
        limit = 10
      } else {
        limit = parseInt(limit)
      }
      if (!page) {
        page = 1
      } else {
        page = parseInt(page)
      }
      if (level === 1) {
        const result = await disposal.findAndCountAll({
          where: {
            [Op.or]: [
              { kode_plant: { [Op.like]: `%${searchValue}%` } },
              { no_io: { [Op.like]: `%${searchValue}%` } },
              { no_doc: { [Op.like]: `%${searchValue}%` } },
              { nama_asset: { [Op.like]: `%${searchValue}%` } },
              { kategori: { [Op.like]: `%${searchValue}%` } },
              { keterangan: { [Op.like]: `%${searchValue}%` } }
            ],
            status_form: 2
          },
          order: [[sortValue, 'ASC']],
          limit: limit,
          offset: (page - 1) * limit
        })
        const pageInfo = pagination('/asset/get', req.query, page, limit, result.count)
        if (result) {
          const data = []
          result.rows.map(x => {
            return (
              data.push(x.no_disposal)
            )
          })
          const set = new Set(data)
          const noDis = [...set]
          return response(res, 'success get disposal', { result, pageInfo, noDis })
        } else {
          return response(res, 'failed get disposal', {}, 400, false)
        }
      } else if (level === 5) {
        const result = await disposal.findAndCountAll({
          where: {
            [Op.and]: [
              { kode_plant: kode },
              { status_form: 1 }
            ]
          }
        })
        if (result) {
          return response(res, 'success get disposal', { result })
        } else {
          return response(res, 'failed get disposal', {}, 400, false)
        }
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  uploadImage: async (req, res) => {
    const asset = req.params.asset
    uploadHelper(req, res, async function (err) {
      try {
        if (err instanceof multer.MulterError) {
          if (err.code === 'LIMIT_UNEXPECTED_FILE' && req.files.length === 0) {
            console.log(err.code === 'LIMIT_UNEXPECTED_FILE' && req.files.length > 0)
            return response(res, 'fieldname doesnt match', {}, 500, false)
          }
          return response(res, err.message, {}, 500, false)
        } else if (err) {
          return response(res, err.message, {}, 401, false)
        }
        const dokumen = `uploads/${req.file.filename}`
        const send = {
          path: dokumen,
          no_asset: asset
        }
        const result = await path.create(send)
        if (result) {
          return response(res, 'successfully upload', { send })
        } else {
          return response(res, 'failed upload', {}, 404, false)
        }
      } catch (error) {
        return response(res, error.message, {}, 500, false)
      }
    })
  },
  submitDisposal: async (req, res) => {
    try {
      const kode = req.user.kode
      const result = await disposal.findAll({
        where: {
          [Op.and]: [
            { kode_plant: kode },
            { status_form: 1 }
          ]
        }
      })
      const findNo = await disposal.findAll()
      if (result) {
        const cekNo = []
        for (let i = 0; i < findNo.length; i++) {
          cekNo.push(parseInt(findNo[i].no_disposal === null ? 0 : findNo[i].no_disposal))
        }
        const noDis = Math.max(...cekNo) + 1
        const send = {
          status_form: 2,
          no_disposal: noDis === undefined ? 1 : noDis
        }
        const temp = []
        for (let i = 0; i < result.length; i++) {
          const find = await disposal.findOne({
            where: {
              no_asset: result[i].no_asset
            }
          })
          if (find) {
            await find.update(send)
            temp.push(1)
          }
        }
        if (temp.length === result.length) {
          return response(res, 'success submit', { cekNo })
        } else {
          return response(res, 'failed submit', {}, 404, false)
        }
      } else {
        return response(res, 'failed submit', {}, 404, false)
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  getDetailDisposal: async (req, res) => {
    try {
      const nomor = req.params.nomor
      const result = await disposal.findAll({
        where: {
          no_disposal: nomor
        }
      })
      if (result.length > 0) {
        return response(res, 'succesfully get detail disposal', { result })
      } else {
        return response(res, 'failed get detail disposal', {}, 404, false)
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  }
  // getImage: async (req, res) => {
  //   try {
  //     const asset = req.params.asset
  //   } catch (error) {
  //     return response(res, error.message, {}, 500, false)
  //   }
  // }
}
