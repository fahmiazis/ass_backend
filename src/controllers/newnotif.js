const { newnotif, pengadaan, disposal, stock, role, mutasi } = require('../models')
const { Op } = require('sequelize')
const response = require('../helpers/response')
const moment = require('moment')
const { pagination } = require('../helpers/pagination')

module.exports = {
  addNotif: async (req, res) => {
    try {
      const level = req.user.level
      const { nameTo, no, tipe, jenis, menu, proses, route, draft } = req.body
      const findRole = await role.findOne({
        where: {
          nomor: level
        }
      })
      if (findRole) {
        const transaksi = tipe === 'pengadaan' ? pengadaan : tipe === 'disposal' ? disposal : tipe === 'mutasi' ? mutasi : stock
        const noTrans = tipe === 'pengadaan'
        ? { no_pengadaan: no } : tipe === 'disposal'   // eslint-disable-line
            ? { no_disposal: no } : tipe === 'mutasi'  // eslint-disable-line
                ? { no_mutasi: no } : { no_stock: no }  // eslint-disable-line
        const findData = await transaksi.findAll({
          where: {
            [Op.and]: [
              noTrans
            ]
          }
        })
        if (findData) {
          if (jenis === 'ajuan') {
            console.log('ajuan bayar king')
            const cekData = []
            const dataTo = draft.to !== undefined && draft.to.length !== undefined && draft.to.length > 0 ? draft.to : [{ username: nameTo }]
            console.log(dataTo)
            for (let i = 0; i < dataTo.length; i++) {
              const findNotif = await newnotif.findOne({
                where: {
                  [Op.and]: [
                    { user: { [Op.like]: `%${dataTo[i].username}` } },
                    { no_transaksi: { [Op.like]: `%${no}` } },
                    { proses: { [Op.like]: `%${menu}%` } },
                    { tipe: { [Op.like]: `%${proses}%` } },
                    { status: 100 }
                  ]
                }
              })
              if (findNotif) {
                return response(res, 'success create newnotif', { findNotif, dataTo, tipe: 'ajuan bayar' })
              } else {
                const data = {
                  user: dataTo[i].username,
                  kode_plant: findData[0].kode_plant,
                  transaksi: tipe,
                  proses: menu,
                  no_transaksi: no,
                  tipe: proses,
                  routes: route
                }
                const createNotif = await newnotif.create(data)
                if (createNotif) {
                  cekData.push(createNotif)
                }
              }
            }
            if (cekData.length) {
              return response(res, 'success create newnotif', { cekData, dataTo, tipe: 'ajuan bayar' })
            } else {
              return response(res, 'failed create newnotif', { cekData, dataTo, tipe: 'ajuan bayar' })
            }
          } else {
            const findNotif = await newnotif.findOne({
              where: {
                [Op.and]: [
                  { user: { [Op.like]: `%${nameTo}%` } },
                  { no_transaksi: { [Op.like]: `%${no}%` } },
                  { proses: { [Op.like]: `%${menu}%` } },
                  { tipe: { [Op.like]: `%${proses}%` } },
                  { status: 100 }
                ]
              }
            })
            if (findNotif) {
              return response(res, 'success create newnotif', { findNotif })
            } else {
              const data = {
                user: nameTo,
                kode_plant: findData[0].kode_plant,
                transaksi: tipe,
                proses: menu,
                no_transaksi: no,
                tipe: proses,
                routes: route
              }
              const createNotif = await newnotif.create(data)
              if (createNotif) {
                return response(res, 'success create newnotif', { createNotif, nameTo })
              } else {
                return response(res, 'failed create newnotif 1', { createNotif, nameTo })
              }
            }
          }
        } else {
          return response(res, 'failed create newnotif 2', { findData, nameTo })
        }
      } else {
        return response(res, 'failed get newnotif 3', { findRole, nameTo })
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  readNotif: async (req, res) => {
    try {
      const id = req.params.id
      const findNotif = await newnotif.findByPk(id)
      if (findNotif) {
        const data = {
          status: 1
        }
        const updateNotif = await findNotif.update(data)
        if (updateNotif) {
          return response(res, 'success read newnotif')
        } else {
          return response(res, 'failed read newnotif', {}, 404, false)
        }
      } else {
        return response(res, 'failed read newnotif', {}, 404, false)
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  getAllNotif: async (req, res) => {
    try {
      const name = req.user.name
      const fullname = req.user.fullname
      const kode = req.user.kode
      const level = req.user.level
      const timeV1 = moment().startOf('month')
      const timeV2 = moment().endOf('month').add(1, 'd')
      const { tipe } = req.query
      const findNotif = await newnotif.findAll({
        where: {
          [Op.and]: [
            level === 5 || level === '5'
              ? {
                  [Op.and]: [
                    {
                      [Op.or]: [
                        { user: { [Op.like]: `%${name}%` } },
                        { user: { [Op.like]: `%${fullname}%` } }
                      ]
                    },
                    {
                      [Op.or]: [
                        { kode_plant: { [Op.like]: `%${kode}%` } },
                        { proses: { [Op.like]: '%mutasi asset%' } }
                      ]
                    }
                  ]
                }
              : {
                  [Op.or]: [
                    { user: { [Op.like]: `%${name}%` } },
                    { user: { [Op.like]: `%${fullname}%` } }
                  ]
                },
            {
              createdAt: {
                [Op.gte]: timeV1,
                [Op.lt]: timeV2
              }
            },
            tipe === 'read' ? { [Op.not]: { status: null } } : tipe === 'unread' ? { status: null } : { [Op.not]: { id: null } }
          ]
        },
        order: [['id', 'DESC']]
      })
      if (findNotif.length > 0) {
        return response(res, 'succes get newnotif', { result: findNotif, length: findNotif.length })
      } else {
        return response(res, 'failed get newnotif', { result: [], length: 0 })
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  getNotif: async (req, res) => {
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
        limit = 10
      } else {
        limit = parseInt(limit)
      }
      if (!page) {
        page = 1
      } else {
        page = parseInt(page)
      }
      const findNotif = await newnotif.findAndCountAll({
        where: {
          [Op.or]: [
            { tipe: { [Op.like]: `%${searchValue}%` } },
            { proses: { [Op.like]: `%${searchValue}%` } }
          ]
        },
        order: [[sortValue, 'DESC']],
        limit: limit,
        offset: (page - 1) * limit
      })
      const pageInfo = pagination('/newnotif/get', req.query, page, limit, findNotif.count)
      if (findNotif.rows.length > 0) {
        return response(res, 'succes get newnotif', { result: findNotif, pageInfo })
      } else {
        return response(res, 'failed get newnotif', { findNotif }, 404, false)
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  deleteNotif: async (req, res) => {
    try {
      const id = req.params.id
      const findNotif = await newnotif.findByPk(id)
      if (findNotif) {
        const desNotif = await findNotif.destroy()
        if (desNotif) {
          return response(res, 'success delete newnotif', { findNotif })
        } else {
          return response(res, 'failed delete newnotif', {}, 404, false)
        }
      } else {
        return response(res, 'failed delete newnotif', {}, 404, false)
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  deleteAll: async (req, res) => {
    try {
      const name = req.user.name
      const findNotif = await newnotif.findAll({
        where: {
          user: { [Op.like]: `%${name}%` }
        }
      })
      if (findNotif) {
        const temp = []
        for (let i = 0; i < findNotif.length; i++) {
          const findDel = await newnotif.findByPk(findNotif[i].id)
          if (findDel) {
            await findDel.destroy()
            temp.push(1)
          }
        }
        if (temp.length > 0) {
          return response(res, 'success delete all', { findNotif })
        } else {
          return response(res, 'failed delete all', {}, 404, false)
        }
      } else {
        return response(res, 'failed delete all', {}, 404, false)
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  }
}
