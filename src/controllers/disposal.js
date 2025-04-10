const { disposal, asset, depo, path, ttd, approve, role, document, docUser, email, user, notif, reservoir } = require('../models')
const joi = require('joi')
const response = require('../helpers/response')
const { Op } = require('sequelize')
const { pagination } = require('../helpers/pagination')
const multer = require('multer')
const uploadHelper = require('../helpers/upload')
const moment = require('moment')
const wrapMail = require('../helpers/wrapMail')
const axios = require('axios')

const emailAss = 'fahmi_aziz@pinusmerahabadi.co.id'
const emailAss2 = 'fahmi_aziz@pinusmerahabadi.co.id'

module.exports = {
  addDisposal: async (req, res) => {
    try {
      const no = req.params.no
      const kode = req.user.kode
      const name = req.user.name
      const level = req.user.level
      const result = await asset.findOne({
        where: {
          no_asset: no
        }
      })
      if (result) {
        const findAsset = await disposal.findAll({
          where: {
            no_asset: result.no_asset
          }
        })
        if (findAsset.length > 0) {
          return response(res, 'success add disposal', { result: findAsset })
        } else if ((level === 5 && result.kode_plant === kode) || (level === 9 && name === result.cost_center)) {
          const findDepo = await depo.findAll({
            where: {
              kode_plant: level === 9 ? result.cost_center : kode
            }
          })
          if (findDepo.length > 0) {
            const send = {
              kode_plant: findDepo[0].kode_plant,
              area: findDepo[0].nama_area,
              no_doc: result.no_doc,
              no_asset: result.no_asset,
              nama_asset: result.nama_asset,
              cost_center: findDepo[0].cost_center,
              status_depo: findDepo[0].status_area,
              nilai_jual: 0,
              nilai_buku: result.nilai_buku,
              status_form: 1,
              kategori: result.kategori,
              merk: result.merk
            }
            const make = await disposal.create(send)
            if (make) {
              const data = {
                status: 1
              }
              const update = await result.update(data)
              if (update) {
                return response(res, 'success add disposal', { result: make })
              } else {
                return response(res, 'failed add disposal 09', {}, 400, false)
              }
            } else {
              return response(res, 'failed add disposal 0', {}, 400, false)
            }
          } else {
            return response(res, 'failed add disposal 1', {}, 400, false)
          }
        } else {
          return response(res, 'failed add disposal 2', {}, 400, false)
        }
      } else {
        return response(res, 'failed add disposal 3', {}, 400, false)
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  addSell: async (req, res) => {
    try {
      const name = req.user.name
      const level = req.user.level
      const no = req.params.no
      const kode = req.user.kode
      const result = await asset.findOne({
        where: {
          no_asset: no
        }
      })
      if (result) {
        const findAsset = await disposal.findAll({
          where: {
            no_asset: result.no_asset
          }
        })
        if (findAsset.length > 0) {
          return response(res, 'success add sell', { result: findAsset })
        } else if ((level === 5 && result.kode_plant === kode) || (level === 9 && name === result.cost_center)) {
          const findDepo = await depo.findAll({
            where: {
              kode_plant: level === 9 ? result.cost_center : kode
            }
          })
          if (findDepo.length > 0) {
            const send = {
              kode_plant: findDepo[0].kode_plant,
              area: findDepo[0].nama_area,
              no_doc: result.no_doc,
              no_asset: result.no_asset,
              nama_asset: result.nama_asset,
              cost_center: findDepo[0].cost_center,
              status_depo: findDepo[0].status_area,
              nilai_buku: result.nilai_buku,
              status_form: 1,
              kategori: result.kategori,
              merk: result.merk
            }
            const make = await disposal.create(send)
            if (make) {
              const data = {
                status: 1
              }
              const update = await result.update(data)
              if (update) {
                return response(res, 'success add sell', { result: make })
              } else {
                return response(res, 'failed add sell', {}, 400, false)
              }
            } else {
              return response(res, 'failed add sell', {}, 400, false)
            }
          } else {
            return response(res, 'failed add sell', {}, 400, false)
          }
        } else {
          return response(res, 'failed add sell', {}, 400, false)
        }
      } else {
        return response(res, 'failed add sell', {}, 400, false)
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  getCartDisposal: async (req, res) => {
    try {
      const kode = req.user.kode
      const name = req.user.name
      const level = req.user.level
      const result = await disposal.findAndCountAll({
        where: {
          [Op.and]: [
            { kode_plant: level === 5 ? kode : name },
            { status_form: 1 }
          ]
        },
        order: [
          ['id', 'ASC']
        ],
        include: [
          {
            model: path,
            as: 'pict'
          }
        ]
      })
      if (result) {
        return response(res, 'success get disposal', { result })
      } else {
        return response(res, 'failed get disposal', {}, 404, false)
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  deleteDisposal: async (req, res) => {
    try {
      const noAsset = req.params.asset
      const result = await disposal.findOne({
        where: {
          [Op.and]: [
            { no_asset: noAsset },
            { status_form: 1 }
          ]
        }
      })
      if (result) {
        const findAsset = await asset.findOne({
          where: {
            no_asset: noAsset
          }
        })
        if (findAsset) {
          const data = {
            status: null
          }
          const sent = await findAsset.update(data)
          if (sent) {
            const del = await result.destroy()
            if (del) {
              const findDoc = await docUser.findAll({
                where: {
                  no_pengadaan: noAsset,
                  [Op.and]: [
                    { jenis_form: 'disposal' },
                    {
                      [Op.or]: [
                        { tipe: 'pengajuan' },
                        { tipe: 'jual' },
                        { tipe: 'purch' }
                      ]
                    }
                  ]
                }
              })
              if (findDoc.length > 0) {
                const cekdok = []
                for (let i = 0; i < findDoc.length; i++) {
                  const findOne = await docUser.findByPk(findDoc[i].id)
                  if (findOne) {
                    await findOne.destroy()
                    cekdok.push(1)
                  }
                }
                if (cekdok.length === findDoc.length) {
                  return response(res, 'success delete disposal')
                } else {
                  return response(res, 'failed delete disposal', {}, 400, false)
                }
              } else {
                return response(res, 'success delete disposal')
              }
            } else {
              return response(res, 'failed delete disposal', {}, 400, false)
            }
          } else {
            return response(res, 'failed delete disposal', {}, 400, false)
          }
        } else {
          return response(res, 'failed delete disposal', {}, 400, false)
        }
      } else {
        return response(res, 'failed delete disposal', {}, 400, false)
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  getDisposal: async (req, res) => {
    // try {
    const level = req.user.level
    const kode = req.user.kode
    const fullname = req.user.name
    let { limit, page, search, sort, status, tipe, form } = req.query
    const { time1, time2 } = req.query
    const timeVal1 = time1 === 'undefined' ? 'all' : time1
    const timeVal2 = time2 === 'undefined' ? 'all' : time2
    const timeV1 = moment(timeVal1)
    const timeV2 = timeVal1 !== 'all' && timeVal1 === timeVal2 ? moment(timeVal2).add(1, 'd') : moment(timeVal2).add(1, 'd')
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
    if (limit) {
      limit = 1000
    } else {
      limit = 1000
    }
    if (!page) {
      page = 1
    } else {
      page = parseInt(page)
    }
    if (level === 5 || level === 9) {
      const result = await disposal.findAll({
        where: {
          [Op.and]: [
            { kode_plant: kode },
            {
              [Op.or]: [
                { status_form: status },
                { status_form: status === 2 ? 9 : status },
                { status_form: status === 2 ? 26 : status },
                { status_form: status === 2 ? 3 : status }
              ]
            },
            timeVal1 === 'all'
              ? { [Op.not]: { id: null } }
              : {
                  tanggalDis: {
                    [Op.gte]: timeV1,
                    [Op.lt]: timeV2
                  }
                },
            { [Op.not]: { status_form: 1 } }
          ]
        },
        order: [
          [sortValue, 'DESC'],
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
          },
          {
            model: docUser,
            as: 'docAsset'
          }
        ]
      })
      if (result) {
        return response(res, 'success get disposal', { result: { rows: result, count: result.length }, form: form })
      } else {
        return response(res, 'success get disposal', { result: { rows: result, count: result.length }, form: form })
      }
    } else if (level === 12 || level === 7 || level === 26 || level === 27) {
      const findDepo = await depo.findAll({
        where: {
          [Op.or]: [
            { nama_bm: level === 12 || level === 27 ? fullname : 'undefined' },
            { nama_om: level === 7 ? fullname : 'undefined' },
            { nama_asman: level === 26 ? fullname : 'undefined' }
          ]
        }
      })
      if (findDepo.length > 0) {
        const hasil = []
        for (let i = 0; i < findDepo.length; i++) {
          const result = await disposal.findAll({
            where: {
              [Op.and]: [
                { kode_plant: findDepo[i].kode_plant },
                {
                  [Op.or]: [
                    { no_disposal: { [Op.like]: `%${searchValue}%` } },
                    { nama_asset: { [Op.like]: `%${searchValue}%` } },
                    { kategori: { [Op.like]: `%${searchValue}%` } },
                    { keterangan: { [Op.like]: `%${searchValue}%` } }
                  ]
                },
                {
                  [Op.or]: [
                    { status_form: status },
                    { status_form: status === 2 ? 9 : status },
                    { status_form: status === 2 ? 26 : status }
                  ]
                },
                timeVal1 === 'all'
                  ? { [Op.not]: { id: null } }
                  : {
                      tanggalDis: {
                        [Op.gte]: timeV1,
                        [Op.lt]: timeV2
                      }
                    },
                { [Op.not]: { status_form: 1 } }
              ]
            },
            order: [
              [sortValue, 'DESC'],
              [{ model: ttd, as: 'appForm' }, 'id', 'DESC']
            ],
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
                model: docUser,
                as: 'docAsset'
              }
            ]
          })
          if (result.length > 0) {
            for (let j = 0; j < result.length; j++) {
              hasil.push(result[j])
            }
          }
        }
        if (hasil.length > 0) {
          const data = []
          hasil.map(x => {
            return (
              data.push(x.no_disposal)
            )
          })
          const set = new Set(data)
          const noDis = [...set]
          const result = { rows: hasil, count: hasil.length }
          const pageInfo = pagination('/disposal/get', req.query, page, limit, result.count)
          return response(res, 'success get disposal', { result, pageInfo, noDis, findDepo })
        } else {
          const result = { rows: hasil, count: 0 }
          const noDis = []
          const pageInfo = pagination('/disposal/get', req.query, page, limit, result.count)
          return response(res, 'success get disposal', { result, pageInfo, noDis, findDepo })
        }
      } else {
        return response(res, 'failed get disposal', {}, 400, false)
      }
    } else if (level === 13 || level === 16) {
      const findRole = await role.findOne({
        where: {
          nomor: '27'
        }
      })
      const findDepo = await depo.findAll({
        where: {
          [Op.or]: [
            { nama_bm: fullname },
            { nama_om: fullname }
          ]
        }
      })
      if (findDepo.length > 0 && findRole) {
        const hasil = []
        for (let i = 0; i < findDepo.length; i++) {
          const result = await disposal.findAll({
            where: {
              [Op.and]: [
                { kode_plant: findDepo[i].kode_plant },
                {
                  [Op.or]: [
                    { no_disposal: { [Op.like]: `%${searchValue}%` } },
                    { nama_asset: { [Op.like]: `%${searchValue}%` } },
                    { kategori: { [Op.like]: `%${searchValue}%` } },
                    { keterangan: { [Op.like]: `%${searchValue}%` } }
                  ]
                },
                {
                  [Op.or]: [
                    { status_form: status },
                    { status_form: status === 2 ? 9 : status },
                    { status_form: status === 2 ? 26 : status }
                  ]
                },
                timeVal1 === 'all'
                  ? { [Op.not]: { id: null } }
                  : {
                      tanggalDis: {
                        [Op.gte]: timeV1,
                        [Op.lt]: timeV2
                      }
                    },
                { [Op.not]: { status_form: 1 } }
              ]
            },
            order: [
              [sortValue, 'DESC'],
              [{ model: ttd, as: 'appForm' }, 'id', 'DESC']
            ],
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
                model: docUser,
                as: 'docAsset'
              }
            ]
          })
          if (result.length > 0) {
            for (let j = 0; j < result.length; j++) {
              hasil.push(result[j])
            }
          }
        }
        if (hasil.length > 0) {
          const tempDis = []
          hasil.map(x => {
            return (
              tempDis.push(x.no_disposal)
            )
          })
          const setDis = new Set(tempDis)
          const noSet = [...setDis]
          if (level === 13) {
            const result = await disposal.findAndCountAll({
              where: {
                [Op.and]: [
                  { kategori: 'IT' },
                  {
                    [Op.or]: [
                      { kode_plant: { [Op.like]: `%${searchValue}%` } },
                      { no_io: { [Op.like]: `%${searchValue}%` } },
                      { no_disposal: { [Op.like]: `%${searchValue}%` } },
                      { nama_asset: { [Op.like]: `%${searchValue}%` } },
                      { kategori: { [Op.like]: `%${searchValue}%` } },
                      { keterangan: { [Op.like]: `%${searchValue}%` } }
                    ]
                  },
                  {
                    [Op.or]: [
                      { status_form: status },
                      { status_form: status === 2 ? 9 : status },
                      { status_form: status === 2 ? 26 : status }
                    ]
                  },
                  timeVal1 === 'all'
                    ? { [Op.not]: { id: null } }
                    : {
                        tanggalDis: {
                          [Op.gte]: timeV1,
                          [Op.lt]: timeV2
                        }
                      },
                  { [Op.not]: { status_form: 1 } }
                ]
              },
              order: [
                [sortValue, 'DESC'],
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
                  model: path,
                  as: 'pict'
                },
                {
                  model: docUser,
                  as: 'docAsset'
                }
              ],
              group: 'no_disposal'
            })
            if (result.rows.length > 0) {
              const data = []
              for (let i = 0; i < result.rows.length; i++) {
                if (result.rows[i].appForm.length > 0) {
                  const app = result.rows[i].appForm
                  // console.log(app.find(({ jabatan }) => jabatan === findRole.name))
                  if (app.find(({ jabatan }) => jabatan === findRole.name) === undefined) {
                    data.push(result.rows[i].no_disposal)
                  } else if (app.find(({ jabatan }) => jabatan === findRole.name) !== undefined && app.find(({ jabatan }) => jabatan === findRole.name).status !== null) {
                    data.push(result.rows[i].no_disposal)
                  }
                }
              }
              const set = new Set(data)
              const noDis = [...set]
              const newData = []
              for (let i = 0; i < result.rows.length; i++) {
                for (let j = 0; j < noDis.length; j++) {
                  if (result.rows[i].no_disposal === noDis[j]) {
                    newData.push(result.rows[i])
                  }
                }
              }
              const tempAll = hasil.concat(newData)
              const setMerge = new Set(tempAll)
              const mergeData = [...setMerge]
              const tempNo = noDis.concat(noSet)
              const setNo = new Set(tempNo)
              const mergeNo = [...setNo]
              if (newData.length) {
                const result = { rows: mergeData, count: mergeData.length }
                const pageInfo = pagination('/disposal/get', req.query, page, limit, result.count)
                return response(res, 'success get disposal', { result, pageInfo, noDis: mergeNo })
              } else {
                const result = { rows: [], count: 0 }
                const noDis = []
                const pageInfo = pagination('/disposal/get', req.query, page, limit, result.count)
                return response(res, 'success get disposal', { result, pageInfo, noDis })
              }
            } else {
              const result = { rows: [], count: 0 }
              const noDis = []
              const pageInfo = pagination('/disposal/get', req.query, page, limit, result.count)
              return response(res, 'success get disposal', { result, pageInfo, noDis })
            }
          } else {
            const result = await disposal.findAndCountAll({
              where: {
                [Op.and]: [
                  {
                    [Op.or]: [
                      { kode_plant: { [Op.like]: `%${searchValue}%` } },
                      { no_io: { [Op.like]: `%${searchValue}%` } },
                      { no_disposal: { [Op.like]: `%${searchValue}%` } },
                      { nama_asset: { [Op.like]: `%${searchValue}%` } },
                      { kategori: { [Op.like]: `%${searchValue}%` } },
                      { keterangan: { [Op.like]: `%${searchValue}%` } }
                    ]
                  },
                  {
                    [Op.or]: [
                      { status_form: status },
                      { status_form: status === 2 ? 9 : status },
                      { status_form: status === 2 ? 26 : status }
                    ]
                  },
                  timeVal1 === 'all'
                    ? { [Op.not]: { id: null } }
                    : {
                        tanggalDis: {
                          [Op.gte]: timeV1,
                          [Op.lt]: timeV2
                        }
                      },
                  { [Op.not]: { status_form: 1 } }
                ]
              },
              order: [
                [sortValue, 'DESC'],
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
                  model: path,
                  as: 'pict'
                },
                {
                  model: docUser,
                  as: 'docAsset'
                }
              ],
              group: 'no_disposal'
            })
            if (result.rows.length > 0) {
              const data = []
              for (let i = 0; i < result.rows.length; i++) {
                if (result.rows[i].appForm.length > 0) {
                  const app = result.rows[i].appForm
                  if (app.find(({ jabatan }) => jabatan === findRole.name) === undefined) {
                    data.push(result.rows[i].no_disposal)
                  } else if (app.find(({ jabatan }) => jabatan === findRole.name) !== undefined && app.find(({ jabatan }) => jabatan === findRole.name).status !== null) {
                    data.push(result.rows[i].no_disposal)
                  }
                }
              }
              const set = new Set(data)
              const noDis = [...set]
              const newData = []
              for (let i = 0; i < result.rows.length; i++) {
                for (let j = 0; j < noDis.length; j++) {
                  if (result.rows[i].no_disposal === noDis[j]) {
                    newData.push(result.rows[i])
                  }
                }
              }
              const tempAll = hasil.concat(newData)
              const setMerge = new Set(tempAll)
              const mergeData = [...setMerge]
              const tempNo = noDis.concat(noSet)
              const setNo = new Set(tempNo)
              const mergeNo = [...setNo]
              if (newData.length) {
                const result = { rows: mergeData, count: mergeData.length }
                const pageInfo = pagination('/disposal/get', req.query, page, limit, result.count)
                return response(res, 'success get disposal', { result, pageInfo, noDis: mergeNo })
              } else {
                const result = { rows: [], count: 0 }
                const noDis = []
                const pageInfo = pagination('/disposal/get', req.query, page, limit, result.count)
                return response(res, 'success get disposal', { result, pageInfo, noDis })
              }
            } else {
              const result = { rows: [], count: 0 }
              const noDis = []
              const pageInfo = pagination('/disposal/get', req.query, page, limit, result.count)
              return response(res, 'success get disposal', { result, pageInfo, noDis })
            }
          }
        } else {
          const tempDis = []
          const setDis = new Set(tempDis)
          const noSet = [...setDis]
          if (level === 13) {
            const result = await disposal.findAndCountAll({
              where: {
                [Op.and]: [
                  { kategori: 'IT' },
                  {
                    [Op.or]: [
                      { kode_plant: { [Op.like]: `%${searchValue}%` } },
                      { no_io: { [Op.like]: `%${searchValue}%` } },
                      { no_disposal: { [Op.like]: `%${searchValue}%` } },
                      { nama_asset: { [Op.like]: `%${searchValue}%` } },
                      { kategori: { [Op.like]: `%${searchValue}%` } },
                      { keterangan: { [Op.like]: `%${searchValue}%` } }
                    ]
                  },
                  {
                    [Op.or]: [
                      { status_form: status },
                      { status_form: status === 2 ? 9 : status },
                      { status_form: status === 2 ? 26 : status }
                    ]
                  },
                  timeVal1 === 'all'
                    ? { [Op.not]: { id: null } }
                    : {
                        tanggalDis: {
                          [Op.gte]: timeV1,
                          [Op.lt]: timeV2
                        }
                      },
                  { [Op.not]: { status_form: 1 } }
                ]
              },
              order: [
                [sortValue, 'DESC'],
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
                  model: path,
                  as: 'pict'
                },
                {
                  model: docUser,
                  as: 'docAsset'
                }
              ],
              group: 'no_disposal'
            })
            if (result.rows.length > 0) {
              const data = []
              for (let i = 0; i < result.rows.length; i++) {
                if (result.rows[i].appForm.length > 0) {
                  const app = result.rows[i].appForm
                  // console.log(app.find(({ jabatan }) => jabatan === findRole.name))
                  if (app.find(({ jabatan }) => jabatan === findRole.name) === undefined) {
                    data.push(result.rows[i].no_disposal)
                  } else if (app.find(({ jabatan }) => jabatan === findRole.name) !== undefined && app.find(({ jabatan }) => jabatan === findRole.name).status !== null) {
                    data.push(result.rows[i].no_disposal)
                  }
                }
              }
              const set = new Set(data)
              const noDis = [...set]
              const newData = []
              for (let i = 0; i < result.rows.length; i++) {
                for (let j = 0; j < noDis.length; j++) {
                  if (result.rows[i].no_disposal === noDis[j]) {
                    newData.push(result.rows[i])
                  }
                }
              }
              const tempAll = hasil.concat(newData)
              const setMerge = new Set(tempAll)
              const mergeData = [...setMerge]
              const tempNo = noDis.concat(noSet)
              const setNo = new Set(tempNo)
              const mergeNo = [...setNo]
              if (newData.length) {
                const result = { rows: mergeData, count: mergeData.length }
                const pageInfo = pagination('/disposal/get', req.query, page, limit, result.count)
                return response(res, 'success get disposal', { result, pageInfo, noDis: mergeNo })
              } else {
                const result = { rows: [], count: 0 }
                const noDis = []
                const pageInfo = pagination('/disposal/get', req.query, page, limit, result.count)
                return response(res, 'success get disposal', { result, pageInfo, noDis })
              }
            } else {
              const result = { rows: [], count: 0 }
              const noDis = []
              const pageInfo = pagination('/disposal/get', req.query, page, limit, result.count)
              return response(res, 'success get disposal', { result, pageInfo, noDis })
            }
          } else {
            const result = await disposal.findAndCountAll({
              where: {
                [Op.and]: [
                  {
                    [Op.or]: [
                      { kode_plant: { [Op.like]: `%${searchValue}%` } },
                      { no_io: { [Op.like]: `%${searchValue}%` } },
                      { no_disposal: { [Op.like]: `%${searchValue}%` } },
                      { nama_asset: { [Op.like]: `%${searchValue}%` } },
                      { kategori: { [Op.like]: `%${searchValue}%` } },
                      { keterangan: { [Op.like]: `%${searchValue}%` } }
                    ]
                  },
                  {
                    [Op.or]: [
                      { status_form: status },
                      { status_form: status === 2 ? 9 : status },
                      { status_form: status === 2 ? 26 : status }
                    ]
                  },
                  timeVal1 === 'all'
                    ? { [Op.not]: { id: null } }
                    : {
                        tanggalDis: {
                          [Op.gte]: timeV1,
                          [Op.lt]: timeV2
                        }
                      },
                  { [Op.not]: { status_form: 1 } }
                ]
              },
              order: [
                [sortValue, 'DESC'],
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
                  model: path,
                  as: 'pict'
                },
                {
                  model: docUser,
                  as: 'docAsset'
                }
              ],
              group: 'no_disposal'
            })
            if (result.rows.length > 0) {
              const data = []
              for (let i = 0; i < result.rows.length; i++) {
                if (result.rows[i].appForm.length > 0) {
                  const app = result.rows[i].appForm
                  if (app.find(({ jabatan }) => jabatan === findRole.name) === undefined) {
                    data.push(result.rows[i].no_disposal)
                  } else if (app.find(({ jabatan }) => jabatan === findRole.name) !== undefined && app.find(({ jabatan }) => jabatan === findRole.name).status !== null) {
                    data.push(result.rows[i].no_disposal)
                  }
                }
              }
              const set = new Set(data)
              const noDis = [...set]
              const newData = []
              for (let i = 0; i < result.rows.length; i++) {
                for (let j = 0; j < noDis.length; j++) {
                  if (result.rows[i].no_disposal === noDis[j]) {
                    newData.push(result.rows[i])
                  }
                }
              }
              const tempAll = hasil.concat(newData)
              const setMerge = new Set(tempAll)
              const mergeData = [...setMerge]
              const tempNo = noDis.concat(noSet)
              const setNo = new Set(tempNo)
              const mergeNo = [...setNo]
              if (newData.length) {
                const result = { rows: mergeData, count: mergeData.length }
                const pageInfo = pagination('/disposal/get', req.query, page, limit, result.count)
                return response(res, 'success get disposal', { result, pageInfo, noDis: mergeNo })
              } else {
                const result = { rows: [], count: 0 }
                const noDis = []
                const pageInfo = pagination('/disposal/get', req.query, page, limit, result.count)
                return response(res, 'success get disposal', { result, pageInfo, noDis })
              }
            } else {
              const result = { rows: [], count: 0 }
              const noDis = []
              const pageInfo = pagination('/disposal/get', req.query, page, limit, result.count)
              return response(res, 'success get disposal', { result, pageInfo, noDis })
            }
          }
        }
      } else {
        return response(res, 'failed get disposal', {}, 400, false)
      }
    } else {
      const result = await disposal.findAll({
        where: {
          [Op.and]: [
            {
              [Op.or]: [
                { kode_plant: { [Op.like]: `%${searchValue}%` } },
                { no_disposal: { [Op.like]: `%${searchValue}%` } },
                { nama_asset: { [Op.like]: `%${searchValue}%` } },
                { no_asset: { [Op.like]: `%${searchValue}%` } }
              ]
            },
            {
              [Op.or]: [
                { status_form: status },
                { status_form: status === 2 ? 9 : status },
                { status_form: status === 2 ? 26 : status }
              ]
            },
            timeVal1 === 'all'
              ? { [Op.not]: { id: null } }
              : {
                  tanggalDis: {
                    [Op.gte]: timeV1,
                    [Op.lt]: timeV2
                  }
                },
            { [Op.not]: { status_form: 1 } }
          ]
        },
        order: [
          [sortValue, 'DESC'],
          [{ model: ttd, as: 'appForm' }, 'id', 'DESC'],
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
            model: path,
            as: 'pict'
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
          }
        ]
      })
      const pageInfo = pagination('/disposal/get', req.query, page, limit, result.length)
      if (result) {
        const data = []
        if (tipe === 'persetujuan') {
          result.map(x => {
            return (
              data.push(x.no_persetujuan)
            )
          })
          const set = new Set(data)
          const noDis = [...set]
          return response(res, 'success get disposal', { result: { rows: result, count: result.length }, pageInfo, noDis })
        } else {
          result.map(x => {
            return (
              data.push(x.no_disposal)
            )
          })
          const set = new Set(data)
          const noDis = [...set]
          return response(res, 'success get disposal', { result: { rows: result, count: result.length }, pageInfo, noDis })
        }
      } else {
        return response(res, 'failed get disposal', {}, 400, false)
      }
    }
    // } catch (error) {
    //   return response(res, error.message, {}, 500, false)
    // }
  },
  uploadImage: async (req, res) => {
    const asset = req.params.asset
    uploadHelper(req, res, async function (err) {
      try {
        if (err instanceof multer.MulterError) {
          if (err.code === 'LIMIT_UNEXPECTED_FILE' && req.files.length === 0) {
            // console.log(err.code === 'LIMIT_UNEXPECTED_FILE' && req.files.length > 0)
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
      const timeV1 = moment().startOf('month')
      const timeV2 = moment().endOf('month').add(1, 'd')
      const kode = req.user.kode
      const findNo = await reservoir.findAll({
        where: {
          transaksi: 'disposal',
          tipe: 'area',
          createdAt: {
            [Op.gte]: timeV1,
            [Op.lt]: timeV2
          }
        },
        order: [['id', 'DESC']],
        limit: 50
      })
      const cekNo = []
      if (findNo.length > 0) {
        for (let i = 0; i < findNo.length; i++) {
          const no = findNo[i].no_transaksi.split('/')
          cekNo.push(parseInt(no[0]))
        }
      } else {
        cekNo.push(0)
      }
      const noMut = Math.max(...cekNo) + 1
      const findMut = await disposal.findAll({
        where: {
          [Op.and]: [
            { kode_plant: kode },
            { status_form: 1 }
          ]
        }
      })
      if (findMut.length > 0) {
        const temp = []
        const change = noMut.toString().split('')
        const notrans = change.length === 2 ? '00' + noMut : change.length === 1 ? '000' + noMut : change.length === 3 ? '0' + noMut : noMut
        const month = parseInt(moment().format('MM'))
        const year = moment().format('YYYY')
        let rome = ''
        if (month === 1) {
          rome = 'I'
        } else if (month === 2) {
          rome = 'II'
        } else if (month === 3) {
          rome = 'III'
        } else if (month === 4) {
          rome = 'IV'
        } else if (month === 5) {
          rome = 'V'
        } else if (month === 6) {
          rome = 'VI'
        } else if (month === 7) {
          rome = 'VII'
        } else if (month === 8) {
          rome = 'VIII'
        } else if (month === 9) {
          rome = 'IX'
        } else if (month === 10) {
          rome = 'X'
        } else if (month === 11) {
          rome = 'XI'
        } else if (month === 12) {
          rome = 'XII'
        }
          const tempData = findMut.find(({no_disposal}) => no_disposal !== null) // eslint-disable-line
        const cekData = tempData === undefined ? 'ya' : 'no'
        const noTrans = `${notrans}/${kode}/${findMut[0].area}/${rome}/${year}-DPSL`
        const data = {
          no_disposal: noTrans
        }
        for (let i = 0; i < findMut.length; i++) {
          const find = await disposal.findByPk(findMut[i].id)
          if (find) {
            await find.update(data)
            temp.push(1)
          }
        }
        if (temp.length === findMut.length) {
          if (cekData === 'no') {
            const findReser = await reservoir.findOne({
              where: {
                no_transaksi: tempData.no_disposal
              }
            })
            const findNewReser = await reservoir.findOne({
              where: {
                no_transaksi: noTrans
              }
            })
            const upDataReser = {
              status: 'expired'
            }
            const creDataReser = {
              no_transaksi: noTrans,
              kode_plant: kode,
              transaksi: 'disposal',
              tipe: 'area',
              status: 'delayed'
            }
            if (findReser && !findNewReser) {
              await findReser.update(upDataReser)
              await reservoir.create(creDataReser)
              return response(res, 'success submit cart', { no_disposal: noTrans })
            } else {
              return response(res, 'success submit cart', { no_disposal: noTrans })
            }
          } else {
            const findNewReser = await reservoir.findOne({
              where: {
                no_transaksi: noTrans
              }
            })
            if (findNewReser) {
              return response(res, 'success submit cart', { no_disposal: noTrans })
            } else {
              const creDataReser = {
                no_transaksi: noTrans,
                kode_plant: kode,
                transaksi: 'disposal',
                tipe: 'area',
                status: 'delayed'
              }
              await reservoir.create(creDataReser)
              return response(res, 'success submit cart', { no_disposal: noTrans })
            }
          }
        } else {
          return response(res, 'failed submit', {}, 404, false)
        }
      } else {
        return response(res, 'data disposal is empty', {}, 404, false)
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  submitDisposalFinal: async (req, res) => {
    try {
      const kode = req.user.kode
      const { no } = req.body
      const result = await disposal.findAll({
        where: {
          [Op.and]: [
            { kode_plant: kode },
            { status_form: 1 }
          ]
        }
      })
      if (result.length > 0) {
        const noTrans = no

        const temp = []
        for (let i = 0; i < result.length; i++) {
          const find = await disposal.findByPk(result[i].id)
          if (find) {
            const cekJual = find.nilai_jual !== '0' || find.nilai_jual !== 0
            const prev = moment().subtract(1, 'month').format('L').split('/')
            const findApi = await axios.get(`http://10.3.212.38:8000/sap/bc/zast/?sap-client=300&pgmna=zfir0090&p_anln1=${find.no_asset}&p_bukrs=pp01&p_gjahr=${prev[2]}&p_monat=${prev[0]}`).then(response => { return (response) }).catch(err => { return (err.isAxiosError) })
            if (findApi.status === 200) {
              const send = {
                status_form: cekJual ? 26 : 2,
                no_disposal: noTrans,
                nilai_buku: findApi.data[0].nafap === undefined ? find.nilai_buku : findApi.data[0].nafap,
                tanggalDis: moment()
              }
              await find.update(send)
              temp.push(cekJual ? 'jual' : 'musnah')
            } else {
              const send = {
                status_form: cekJual ? 26 : 2,
                no_disposal: noTrans,
                nilai_buku: findApi.data === undefined ? find.nilai_buku : findApi.data[0].nafap,
                tanggalDis: moment()
              }
              await find.update(send)
              temp.push(cekJual ? 'jual' : 'musnah')
            }
          }
        }
        if (temp.length > 0) {
          const findNewReser = await reservoir.findOne({
            where: {
              no_transaksi: no
            }
          })
          if (findNewReser) {
            const upDataReser = {
              status: 'used',
              createdAt: moment()
            }
            await findNewReser.update(upDataReser)
            return response(res, 'success submit cart')
          } else {
            return response(res, 'success submit cart')
          }
        } else {
          return response(res, 'failed submit 9', {}, 404, false)
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
      const { nomor } = req.body
      let { tipe } = req.query
      if (!tipe) {
        tipe = 'pengajuan'
      }
      if (tipe === 'persetujuan') {
        const result = await disposal.findAll({
          where: {
            no_persetujuan: nomor
          },
          order: [
            [{ model: ttd, as: 'appForm' }, 'id', 'DESC'],
            [{ model: ttd, as: 'ttdSet' }, 'id', 'DESC']
          ],
          include: [
            {
              model: asset,
              as: 'dataAsset'
            },
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
            },
            {
              model: docUser,
              as: 'docAsset'
            }
          ]
        })
        if (result.length > 0) {
          return response(res, 'succesfully get detail disposal', { result })
        } else {
          return response(res, 'failed get detail disposal', {}, 404, false)
        }
      } else {
        const result = await disposal.findAll({
          where: {
            no_disposal: nomor
          },
          order: [
            [{ model: ttd, as: 'appForm' }, 'id', 'DESC'],
            [{ model: ttd, as: 'ttdSet' }, 'id', 'DESC']
          ],
          include: [
            {
              model: asset,
              as: 'dataAsset'
            },
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
            },
            {
              model: docUser,
              as: 'docAsset'
            }
          ]
        })
        if (result.length > 0) {
          return response(res, 'succesfully get detail disposal', { result })
        } else {
          return response(res, 'failed get detail disposal', {}, 404, false)
        }
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  getApproveDisposal: async (req, res) => {
    try {
      const { no } = req.body
      const { nama } = req.query
      const result = await ttd.findAll({
        where: {
          no_doc: no
        }
      })
      if (result.length > 0) {
        const penyetuju = []
        const pembuat = []
        const pemeriksa = []
        for (let i = 0; i < result.length; i++) {
          if (result[i].sebagai === 'pembuat') {
            pembuat.push(result[i])
          } else if (result[i].sebagai === 'pemeriksa') {
            pemeriksa.push(result[i])
          } else if (result[i].sebagai === 'penyetuju') {
            penyetuju.push(result[i])
          }
        }
        return response(res, 'success get template approve', { result: { pembuat, pemeriksa, penyetuju, result } })
      } else {
        const findDis = await disposal.findAll({
          where: {
            no_disposal: no
          }
        })
        if (findDis) {
          const cekIt = []
          for (let i = 0; i < findDis.length; i++) {
            if (findDis[i].kategori === 'IT') {
              cekIt.push(1)
            }
          }
          const getDepo = await depo.findOne({
            where: {
              kode_plant: findDis[0].kode_plant
            }
          })
          const getApp = await approve.findAll({
            where: {
              nama_approve: nama,
              [Op.or]: [
                { jenis: cekIt.length > 0 ? 'it' : 'all' },
                { jenis: 'all' }
              ]
            }
          })
          if (getApp.length > 0 && getDepo) {
            const hasil = []
            for (let i = 0; i < getApp.length; i++) {
              const send = {
                jabatan: getApp[i].jabatan === '' || getApp[i].jabatan === null ? null : getApp[i].jabatan,
                jenis: getApp[i].jenis === '' || getApp[i].jenis === null ? null : getApp[i].jenis,
                sebagai: getApp[i].sebagai === '' || getApp[i].sebagai === null ? null : getApp[i].sebagai,
                kategori: null,
                no_doc: no
              }
              const make = await ttd.create(send)
              if (make) {
                hasil.push(make)
              }
            }
            if (hasil.length === getApp.length) {
              const result = await ttd.findAll({
                where: {
                  no_doc: no
                }
              })
              if (result.length > 0) {
                const findArea = await ttd.findByPk(result[0].id)
                const findUser = await user.findOne({
                  where: {
                    kode_plant: getDepo.kode_plant
                  }
                })
                if (findArea && findUser) {
                  const data = {
                    nama: findUser.fullname,
                    status: 1
                  }
                  const updateArea = await findArea.update(data)
                  if (updateArea) {
                    const findRes = await ttd.findAll({
                      where: {
                        no_doc: no
                      }
                    })
                    if (findRes.length > 0) {
                      const penyetuju = []
                      const pembuat = []
                      const pemeriksa = []
                      for (let i = 0; i < findRes.length; i++) {
                        if (findRes[i].sebagai === 'pembuat') {
                          pembuat.push(findRes[i])
                        } else if (findRes[i].sebagai === 'pemeriksa') {
                          pemeriksa.push(findRes[i])
                        } else if (findRes[i].sebagai === 'penyetuju') {
                          penyetuju.push(findRes[i])
                        }
                      }
                      return response(res, 'success get template approve', { result: { pembuat, pemeriksa, penyetuju, getApp } })
                    }
                  }
                }
              }
            } else {
              return response(res, 'failed get data', { getApp }, 404, false)
            }
          } else {
            return response(res, 'failed get data', { getApp }, 404, false)
          }
        } else {
          return response(res, 'failed get data', {}, 404, false)
        }
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  approveDisposal: async (req, res) => {
    try {
      const level = req.user.level
      const name = req.user.name
      const { no } = req.body
      const result = await role.findAll({
        where: {
          nomor: level
        }
      })
      if (result.length > 0) {
        const find = await ttd.findAll({
          where: {
            no_doc: no
          }
        })
        if (find.length > 0) {
          const divisi = (level === 13 || level === 16) && 'Manager'
          let hasil = 0
          let div = 0
          let arr = null
          // let num = null
          // let post = ''
          // let position = ''
          for (let i = 0; i < find.length; i++) {
            if (result[0].name === find[i].jabatan) {
              hasil = find[i].id
              arr = i
              // position = find[i].jabatan
            } else if ((level === 13 || level === 16) && divisi === find[i].jabatan) {
              div = find[i].id
              // num = i
              // post = find[i].jabatan
            }
          }
          if (level === 2 || level === 12) {
            if (hasil !== 0) {
              if (arr !== find.length - 1 && (find[arr + 1].status !== null || find[arr + 1].status === 1 || find[arr + 1].status === 0)) {
                return response(res, 'Anda tidak memiliki akses lagi untuk mengapprove', {}, 404, false)
              } else {
                if (arr === 0 || find[arr - 1].status === 1) {
                  const findDisposal = await disposal.findAll({
                    where: {
                      no_disposal: no
                    }
                  })
                  if (findDisposal.length > 0) {
                    const dataLength = []
                    const cekfile = []
                    const rejfile = []
                    for (let i = 0; i < findDisposal.length; i++) {
                      const findFile = await docUser.findAll({
                        where: {
                          no_pengadaan: findDisposal[i].no_asset,
                          [Op.and]: [
                            { jenis_form: 'disposal' },
                            {
                              [Op.or]: [
                                { tipe: 'pengajuan' },
                                { tipe: findDisposal.nilai_jual === '0' ? 'pengajuan' : 'jual' },
                                { tipe: findDisposal.nilai_jual === '0' ? 'pengajuan' : 'purch' }
                              ]
                            }
                          ]
                        }
                      })
                      if (findFile.length > 0) {
                        if (level === 12) {
                          for (let j = 0; j < findFile.length; j++) {
                            dataLength.push(1)
                            if (findFile[j].status === 3) {
                              cekfile.push(1)
                            } else if (findFile[j].status === 0) {
                              rejfile.push(1)
                            }
                          }
                        } else {
                          for (let j = 0; j < findFile.length; j++) {
                            dataLength.push(1)
                            if (findFile[j].divisi === '3') {
                              cekfile.push(1)
                            } else if (findFile[j].divisi === '0') {
                              rejfile.push(1)
                            }
                          }
                        }
                      }
                    }
                    if (cekfile.length === dataLength.length) {
                      const data = {
                        nama: name,
                        status: 1,
                        path: null
                      }
                      const findTtd = await ttd.findByPk(hasil)
                      if (findTtd) {
                        const sent = await findTtd.update(data)
                        if (sent) {
                          const results = await ttd.findAll({
                            where: {
                              [Op.and]: [
                                { no_doc: no },
                                { status: 1 }
                              ]
                            }
                          })
                          if (results.length) {
                            const findDoc = await disposal.findOne({
                              where: {
                                no_disposal: no
                              }
                            })
                            if (findDoc) {
                              const findRole = await role.findAll({
                                where: {
                                  name: find[arr + 1].jabatan
                                }
                              })
                              if (findRole.length > 0) {
                                const findDis = await disposal.findAll({
                                  where: {
                                    no_disposal: no
                                  }
                                })
                                if (findDis.length > 0) {
                                  return response(res, 'success approve disposal')
                                } else {
                                  return response(res, 'failed approve disposal 1a', {}, 404, false)
                                }
                              }
                            }
                          }
                        } else {
                          return response(res, 'failed approve disposal 2a', {}, 404, false)
                        }
                      } else {
                        return response(res, 'failed approve disposal 3a', {}, 404, false)
                      }
                    } else if (rejfile.length > 0) {
                      return response(res, 'salah satu lampiran telah direject, hanya bisa melakukan reject form', {}, 404, false)
                    } else {
                      return response(res, 'approve dokumen lampiran pengajuan terlebih dahulu', {}, 404, false)
                    }
                  } else {
                    return response(res, 'failed approve disposal 4a', {}, 404, false)
                  }
                } else {
                  return response(res, `${find[arr - 1].jabatan} belum approve atau telah mereject`, {}, 404, false)
                }
              }
            } else {
              return response(res, 'failed approve disposal 5a', {}, 404, false)
            }
          } else if (level === 13 || level === 16) {
            if (hasil !== 0 || div !== 0) {
              if (arr !== find.length - 1 && (find[arr + 1].status !== null || find[arr + 1].status === 1 || find[arr + 1].status === 0)) {
                return response(res, 'Anda tidak memiliki akses lagi untuk mengapprove', {}, 404, false)
              } else {
                const findDis = await disposal.findOne({
                  where: {
                    no_disposal: no
                  }
                })
                if (findDis) {
                  const data = {
                    nama: name,
                    status: 1,
                    path: null
                  }
                  const findTtd = await ttd.findByPk(hasil === 0 ? div : hasil)
                  if (findTtd && findDis) {
                    const findTd = await ttd.findByPk(div === 0 ? hasil : div)
                    const upTd = await findTd.update(data)
                    const sent = await findTtd.update(data)
                    if (sent && upTd) {
                      const results = await ttd.findAll({
                        where: {
                          [Op.and]: [
                            { no_doc: no },
                            { status: 1 }
                          ]
                        }
                      })
                      if (results.length > 0) {
                        const findDoc = await disposal.findOne({
                          where: {
                            no_disposal: no
                          }
                        })
                        if (findDoc) {
                          const findRole = await role.findAll({
                            where: {
                              name: find[arr + 1].jabatan
                            }
                          })
                          if (findRole.length > 0) {
                            const findDis = await disposal.findAll({
                              where: {
                                no_disposal: no
                              }
                            })
                            if (findDis.length > 0) {
                              return response(res, 'success approve disposal')
                            } else {
                              return response(res, 'failed approve disposal 1', {}, 404, false)
                            }
                          }
                        }
                      } else {
                        return response(res, 'failed approve disposal 2', {}, 404, false)
                      }
                    } else {
                      return response(res, 'failed approve disposal 3', {}, 404, false)
                    }
                  } else {
                    return response(res, 'failed approve disposal 4', {}, 404, false)
                  }
                } else {
                  return response(res, `${find[arr - 1].jabatan} belum approve atau telah mereject`, {}, 404, false)
                }
              }
            } else {
              return response(res, 'failed approve disposal 5', {}, 404, false)
            }
          } else {
            if (hasil !== 0) {
              if (arr !== find.length - 1 && (find[arr + 1].status !== null || find[arr + 1].status === 1 || find[arr + 1].status === 0)) {
                return response(res, 'Anda tidak memiliki akses lagi untuk mengapprove', {}, 404, false)
              } else {
                if (arr === 0 || find[arr - 1].status === 1) {
                  const data = {
                    nama: name,
                    status: 1,
                    path: null
                  }
                  const findTtd = await ttd.findByPk(hasil)
                  if (findTtd) {
                    const sent = await findTtd.update(data)
                    if (sent) {
                      const results = await ttd.findAll({
                        where: {
                          [Op.and]: [
                            { no_doc: no },
                            { status: 1 }
                          ]
                        }
                      })
                      if ((results.length === find.length) || level === 11) {
                        const findDoc = await disposal.findAll({
                          where: {
                            no_disposal: no
                          }
                        })
                        if (findDoc.length > 0) {
                          const data = {
                            status_form: 9
                          }
                          const valid = []
                          for (let i = 0; i < findDoc.length; i++) {
                            const findAsset = await disposal.findByPk(findDoc[i].id)
                            if (findAsset) {
                              await findAsset.update(data)
                              valid.push(1)
                            }
                          }
                          if (valid.length > 0) {
                            return response(res, 'success approve disposal')
                          } else {
                            return response(res, 'failed approve disposal 6a', {}, 404, false)
                          }
                        }
                      } else {
                        const findDoc = await disposal.findOne({
                          where: {
                            no_disposal: no
                          }
                        })
                        if (findDoc) {
                          const findRole = await role.findAll({
                            where: {
                              name: find[arr + 1].jabatan
                            }
                          })
                          if (findRole.length > 0) {
                            const findDis = await disposal.findAll({
                              where: {
                                no_disposal: no
                              }
                            })
                            if (findDis.length > 0) {
                              return response(res, 'success approve disposal')
                            } else {
                              return response(res, 'failed approve disposal 7a', {}, 404, false)
                            }
                          }
                        }
                      }
                    } else {
                      return response(res, 'failed approve disposal 8a', {}, 404, false)
                    }
                  } else {
                    return response(res, 'failed approve disposal 9a', {}, 404, false)
                  }
                } else {
                  return response(res, `${find[arr - 1].jabatan} belum approve atau telah mereject`, {}, 404, false)
                }
              }
            } else {
              return response(res, 'failed approve disposal 10a', {}, 404, false)
            }
          }
        } else {
          return response(res, 'failed approve disposal 11a', {}, 404, false)
        }
      } else {
        return response(res, 'failed approve disposal 12a', {}, 404, false)
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  rejectDisposal: async (req, res) => {
    try {
      const level = req.user.level
      const name = req.user.name
      const no = req.params.no
      const { tipe, status } = req.query
      const list = Object.values(req.body)
      const alasan = list[0]
      if (alasan === undefined || alasan === null) {
        return response(res, 'alasan must be filled', {}, 404, false)
      } else {
        const result = await role.findAll({
          where: {
            nomor: level
          }
        })
        if (result.length > 0) {
          const find = await ttd.findAll({
            where: {
              no_doc: no
            }
          })
          if (find.length > 0) {
            let hasil = 0
            let arr = null
            for (let i = 0; i < find.length; i++) {
              if (result[0].name === find[i].jabatan) {
                hasil = find[i].id
                arr = i
              }
            }
            if (hasil !== 0) {
              if (arr !== find.length - 1 && (find[arr + 1].status !== null || find[arr + 1].status === 1 || find[arr + 1].status === 0)) {
                return response(res, 'Anda tidak memiliki akses lagi untuk mereject', {}, 404, false)
              } else {
                if (arr === 0 || find[arr - 1].status === 1) {
                  const data = {
                    nama: name,
                    status: 0,
                    path: alasan
                  }
                  const findTtd = await ttd.findByPk(hasil)
                  if (findTtd) {
                    const sent = await findTtd.update(data)
                    if (tipe === 'batal') {
                      const findDis = await disposal.findAll({
                        where: {
                          no_disposal: no
                        }
                      })
                      if (findDis.length > 0) {
                        const cek = []
                        for (let i = 0; i < findDis.length; i++) {
                          const send = {
                            status: null
                          }
                          const data = {
                            status_form: 0,
                            status_reject: 0,
                            isreject: 0
                          }
                          const find = await disposal.findByPk(findDis[i].id)
                          const updateAsset = await asset.findOne({
                            where: {
                              no_asset: findDis[i].no_asset
                            }
                          })
                          if (find && updateAsset) {
                            await updateAsset.update(send)
                            await find.update(data)
                            cek.push(1)
                          }
                        }
                        if (cek.length === findDis.length) {
                          let draftEmail = ''
                          const draf = []
                          for (let i = 0; i < arr; i++) {
                            if (i === 0) {
                              const findEmail = await email.findOne({
                                where: {
                                  kode_plant: findDis[0].kode_plant
                                }
                              })
                              if (findEmail) {
                                draf.push(findEmail)
                                draftEmail += findEmail.email_area_aos + ', '
                              }
                            } else {
                              const result = await user.findOne({
                                where: {
                                  username: find[i].nama
                                }
                              })
                              if (result) {
                                draf.push(result)
                                draftEmail += result.email + ', '
                              }
                            }
                          }
                          if (draf.length > 0) {
                            // const valid = []
                            // for (let i = 0; i < find.length; i++) {
                            //   const serFind = await ttd.findByPk(find[i].id)
                            //   if (serFind) {
                            //     await serFind.destroy()
                            //     valid.push(1)
                            //   }
                            // }
                            // if (valid.length > 0) {
                            const cekDok = []
                            for (let i = 0; i < findDis.length; i++) {
                              const docFind = await docUser.findAll({
                                where: {
                                  no_pengadaan: findDis[i].no_asset,
                                  [Op.and]: [
                                    { jenis_form: 'disposal' },
                                    {
                                      [Op.or]: [
                                        { tipe: 'pengajuan' },
                                        { tipe: 'jual' },
                                        { tipe: 'purch' }
                                      ]
                                    }
                                  ]
                                }
                              })
                              if (docFind.length > 0) {
                                for (let j = 0; j < docFind.length; j++) {
                                  const docOne = await docUser.findByPk(docFind[j].id)
                                  if (docOne) {
                                    await docOne.destroy()
                                    cekDok.push(1)
                                  }
                                }
                              }
                            }
                            if (cekDok.length > 0) {
                              let tableTd = ''
                              for (let i = 0; i < findDis.length; i++) {
                                const element = `
                                    <tr>
                                      <td>${findDis.indexOf(findDis[i]) + 1}</td>
                                      <td>D${findDis[i].no_disposal}</td>
                                      <td>${findDis[i].no_asset}</td>
                                      <td>${findDis[i].nama_asset}</td>
                                      <td>${findDis[i].cost_center}</td>
                                      <td>${findDis[i].area}</td>
                                    </tr>`
                                tableTd = tableTd + element
                              }
                              const mailOptions = {
                                from: 'noreply_asset@pinusmerahabadi.co.id',
                                replyTo: 'noreply_asset@pinusmerahabadi.co.id',
                                // to: `${draftEmail}`,
                                to: `${emailAss}, ${emailAss2}`,
                                subject: 'Reject Pembatalan Disposal Asset ',
                                html: `
                                          <head>
                                            <style type="text/css">
                                            body {
                                                display: flexbox;
                                                flex-direction: column;
                                            }
                                            .tittle {
                                                font-size: 15px;
                                            }
                                            .mar {
                                                margin-bottom: 20px;
                                            }
                                            .mar1 {
                                                margin-bottom: 10px;
                                            }
                                            .foot {
                                                margin-top: 20px;
                                                margin-bottom: 10px;
                                            }
                                            .foot1 {
                                                margin-bottom: 50px;
                                            }
                                            .position {
                                                display: flexbox;
                                                flex-direction: row;
                                                justify-content: left;
                                                margin-top: 10px;
                                            }
                                            table {
                                                font-family: "Lucida Sans Unicode", "Lucida Grande", "Segoe Ui";
                                                font-size: 12px;
                                            }
                                            .demo-table {
                                                border-collapse: collapse;
                                                font-size: 13px;
                                            }
                                            .demo-table th, 
                                            .demo-table td {
                                                border-bottom: 1px solid #e1edff;
                                                border-left: 1px solid #e1edff;
                                                padding: 7px 17px;
                                            }
                                            .demo-table th, 
                                            .demo-table td:last-child {
                                                border-right: 1px solid #e1edff;
                                            }
                                            .demo-table td:first-child {
                                                border-top: 1px solid #e1edff;
                                            }
                                            .demo-table td:last-child{
                                                border-bottom: 0;
                                            }
                                            caption {
                                                caption-side: top;
                                                margin-bottom: 10px;
                                            }
                                            
                                            /* Table Header */
                                            .demo-table thead th {
                                                background-color: #508abb;
                                                color: #FFFFFF;
                                                border-color: #6ea1cc !important;
                                                text-transform: uppercase;
                                            }
                                            
                                            /* Table Body */
                                            .demo-table tbody td {
                                                color: #353535;
                                            }
                                            
                                            .demo-table tbody tr:nth-child(odd) td {
                                                background-color: #f4fbff;
                                            }
                                            .demo-table tbody tr:hover th,
                                            .demo-table tbody tr:hover td {
                                                background-color: #ffffa2;
                                                border-color: #ffff0f;
                                                transition: all .2s;
                                            }
                                        </style>
                                          </head>
                                          <body>
                                              <div class="tittle mar">
                                                  Dear ${find[0].nama},
                                              </div>
                                              <div class="tittle mar1">
                                                  <div>Pengajuan disposal asset telah direject dan dibatalkan</div>
                                                  <div>Alasan Reject: ${alasan}</div>
                                                  <div>Direject oleh: ${name}</div>
                                              </div>
                                              <div class="position">
                                                  <table class="demo-table">
                                                      <thead>
                                                          <tr>
                                                              <th>No</th>
                                                              <th>No Disposal</th>
                                                              <th>Asset</th>
                                                              <th>Asset description</th>
                                                              <th>Cost Ctr</th>
                                                              <th>Cost Ctr Name</th>
                                                          </tr>
                                                      </thead>
                                                      <tbody>
                                                        ${tableTd}
                                                      </tbody>
                                                  </table>
                                              </div>
                                              <div class="tittle foot">
                                                  Terima kasih,
                                              </div>
                                              <div class="tittle foot1">
                                                  Regards,
                                              </div>
                                              <div class="tittle">
                                                  Team Asset
                                              </div>
                                          </body>
                                          `
                              }
                              const sendEmail = await wrapMail.wrapedSendMail(mailOptions)
                              if (sendEmail) {
                                return response(res, 'success reject disposal', { sendEmail })
                              } else {
                                return response(res, 'berhasil reject disposal, tidak berhasil kirim notif email 1')
                              }
                            } else {
                              return response(res, 'failed reject disposal', {}, 404, false)
                            }
                            // }
                          }
                        } else {
                          return response(res, 'failed reject disposal', {}, 404, false)
                        }
                      } else {
                        return response(res, 'failed reject disposal', {}, 404, false)
                      }
                    } else {
                      if (sent) {
                        const findDis = await disposal.findAll({
                          where: {
                            no_disposal: no
                          }
                        })
                        if (findDis.length > 0) {
                          const cekdok = []
                          const dokpurch = []
                          const dokarea = []
                          for (let i = 1; i < list.length; i++) {
                            const cekDis = await disposal.findByPk(parseInt(list[i]))
                            if (cekDis) {
                              const docFind = await docUser.findAll({
                                where: {
                                  no_pengadaan: cekDis.no_asset,
                                  [Op.and]: [
                                    { jenis_form: 'disposal' },
                                    {
                                      [Op.or]: [
                                        { tipe: 'pengajuan' },
                                        { tipe: 'jual' },
                                        { tipe: 'purch' }
                                      ]
                                    }
                                  ]
                                }
                              })
                              if (docFind.length > 0) {
                                for (let j = 0; j < docFind.length; j++) {
                                  if (docFind[j].tipe === 'purch' && (docFind[j].status === 0 || docFind[j].divisi === '0')) {
                                    dokpurch.push(1)
                                  } else if (docFind[j].status === 0 || docFind[j].divisi === '0') {
                                    dokarea.push(1)
                                  } else {
                                    cekdok.push(1)
                                  }
                                }
                              }
                            } else {
                              cekdok.push(1)
                            }
                          }
                          if (cekdok.length > 0) {
                            const cekDis = []
                            for (let i = 0; i < findDis.length; i++) {
                              const stat = dokarea.length > 0 && dokpurch.length > 0 ? 3 : dokarea.length === 0 && dokpurch.length > 0 ? 2 : dokarea.length > 0 && dokpurch.length === 0 ? 1 : 4
                              const cekStat = stat === 3 ? stat : status.indexOf('2') !== -1 && stat === 4 ? 2 : status.indexOf('2') !== -1 && stat === 2 ? stat : status.indexOf('2') !== -1 && stat === 1 ? 3 : status.indexOf('2') === -1 && stat === 4 ? 1 : stat
                              const data = {
                                status_reject: cekStat,
                                reason: alasan,
                                isreject: null
                              }
                              const send = {
                                status_reject: cekStat,
                                reason: alasan,
                                isreject: 1
                              }
                              const resDis = await disposal.findByPk(findDis[i].id)
                              if (list.find(element => parseInt(element) === resDis.id) !== undefined) {
                                await resDis.update(send)
                                cekDis.push(1)
                              } else {
                                await resDis.update(data)
                                cekDis.push(1)
                              }
                            }
                            if (cekDis.length > 0) {
                              let draftEmail = ''
                              const draf = []
                              for (let i = 0; i < arr; i++) {
                                if (i === 0) {
                                  const findEmail = await email.findOne({
                                    where: {
                                      kode_plant: findDis[0].kode_plant
                                    }
                                  })
                                  if (findEmail) {
                                    draf.push(findEmail)
                                    draftEmail += findEmail.email_area_aos + ', '
                                  }
                                } else {
                                  const result = await user.findOne({
                                    where: {
                                      username: find[i].nama
                                    }
                                  })
                                  if (result) {
                                    draf.push(result)
                                    draftEmail += result.email + ', '
                                  }
                                }
                              }
                              // const data = {
                              //   list_appr: findDis[0].kode_plant,
                              //   response: 'reject'
                              // }
                              // const findNotif = await notif.findOne({
                              //   where: {
                              //     [Op.and]: [
                              //       { no_proses: 'D' + no },
                              //       { kode_plant: findDis[0].kode_plant }
                              //     ]
                              //   }
                              // })
                              // if (findNotif) {
                              //   const createNotif = await findNotif.update(data)
                              //   if (createNotif) {
                              let tableTd = ''
                              for (let i = 0; i < findDis.length; i++) {
                                const element = `
                              <tr>
                                <td>${findDis.indexOf(findDis[i]) + 1}</td>
                                <td>D${findDis[i].no_disposal}</td>
                                <td>${findDis[i].no_asset}</td>
                                <td>${findDis[i].nama_asset}</td>
                                <td>${findDis[i].cost_center}</td>
                                <td>${findDis[i].area}</td>
                              </tr>`
                                tableTd = tableTd + element
                              }
                              const mailOptions = {
                                from: 'noreply_asset@pinusmerahabadi.co.id',
                                replyTo: 'noreply_asset@pinusmerahabadi.co.id',
                                // to: `${draftEmail}`,
                                to: `${emailAss}, ${emailAss2}`,
                                subject: 'Reject Perbaikan Disposal Asset ',
                                html: `
                                  <head>
                                  <style type="text/css">
                                    body {
                                        display: flexbox;
                                        flex-direction: column;
                                    }
                                    .tittle {
                                        font-size: 15px;
                                    }
                                    .mar {
                                        margin-bottom: 20px;
                                    }
                                    .mar1 {
                                        margin-bottom: 10px;
                                    }
                                    .foot {
                                        margin-top: 20px;
                                        margin-bottom: 10px;
                                    }
                                    .foot1 {
                                        margin-bottom: 50px;
                                    }
                                    .position {
                                        display: flexbox;
                                        flex-direction: row;
                                        justify-content: left;
                                        margin-top: 10px;
                                    }
                                    table {
                                        font-family: "Lucida Sans Unicode", "Lucida Grande", "Segoe Ui";
                                        font-size: 12px;
                                    }
                                    .demo-table {
                                        border-collapse: collapse;
                                        font-size: 13px;
                                    }
                                    .demo-table th, 
                                    .demo-table td {
                                        border-bottom: 1px solid #e1edff;
                                        border-left: 1px solid #e1edff;
                                        padding: 7px 17px;
                                    }
                                    .demo-table th, 
                                    .demo-table td:last-child {
                                        border-right: 1px solid #e1edff;
                                    }
                                    .demo-table td:first-child {
                                        border-top: 1px solid #e1edff;
                                    }
                                    .demo-table td:last-child{
                                        border-bottom: 0;
                                    }
                                    caption {
                                        caption-side: top;
                                        margin-bottom: 10px;
                                    }
                                    
                                    /* Table Header */
                                    .demo-table thead th {
                                        background-color: #508abb;
                                        color: #FFFFFF;
                                        border-color: #6ea1cc !important;
                                        text-transform: uppercase;
                                    }
                                    
                                    /* Table Body */
                                    .demo-table tbody td {
                                        color: #353535;
                                    }
                                    
                                    .demo-table tbody tr:nth-child(odd) td {
                                        background-color: #f4fbff;
                                    }
                                    .demo-table tbody tr:hover th,
                                    .demo-table tbody tr:hover td {
                                        background-color: #ffffa2;
                                        border-color: #ffff0f;
                                        transition: all .2s;
                                    }
                                </style>
                                  </head>
                                  <body>
                                  <div class="tittle mar">
                                      Dear ${find[0].nama},
                                  </div>
                                  <div class="tittle mar1">
                                      <div>Pengajuan disposal asset telah direject, mohon untuk segera diperbaiki</div>
                                      <div>Alasan reject: ${alasan}</div>
                                      <div>Direject oleh: ${name}</div>
                                  </div>
                                  <div class="position">
                                      <table class="demo-table">
                                          <thead>
                                              <tr>
                                                  <th>No</th>
                                                  <th>No Disposal</th>
                                                  <th>Asset</th>
                                                  <th>Asset description</th>
                                                  <th>Cost Ctr</th>
                                                  <th>Cost Ctr Name</th>
                                              </tr>
                                          </thead>
                                          <tbody>
                                            ${tableTd}
                                          </tbody>
                                      </table>
                                  </div>
                                  <div class="tittle foot">
                                      Terima kasih,
                                  </div>
                                  <div class="tittle foot1">
                                      Regards,
                                  </div>
                                  <div class="tittle">
                                      Team Asset
                                  </div>
                              </body>
                          `
                              }
                              const sendEmail = await wrapMail.wrapedSendMail(mailOptions)
                              if (sendEmail) {
                                return response(res, 'success reject disposal', { sendEmail })
                              } else {
                                return response(res, 'berhasil reject disposal, tidak berhasil kirim notif email 1')
                              }
                              // }
                              // }
                            } else {
                              return response(res, 'success reject disposal failed send email', {}, 404, false)
                            }
                          } else {
                            return response(res, 'success reject disposal failed send email', {}, 404, false)
                          }
                        }
                      } else {
                        return response(res, 'failed reject disposal', {}, 404, false)
                      }
                    }
                  } else {
                    return response(res, 'failed reject disposal', {}, 404, false)
                  }
                } else {
                  return response(res, `${find[arr - 1].jabatan} belum approve atau telah mereject`, {}, 404, false)
                }
              }
            } else {
              return response(res, 'failed approve disposal', {}, 404, false)
            }
          } else {
            return response(res, 'failed approve disposal', {}, 404, false)
          }
        } else {
          return response(res, 'failed approve disposal', {}, 404, false)
        }
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  updateDisposal: async (req, res) => {
    try {
      const id = req.params.id
      const tipe = req.params.tipe
      const schema = joi.object({
        merk: joi.string().allow(''),
        keterangan: joi.string().allow(''),
        nilai_jual: joi.string().allow(''),
        nominal: joi.string().allow(''),
        no_fp: joi.string().allow(''),
        no_sap: joi.string().allow(''),
        doc_sap: joi.string().allow(''),
        npwp: joi.string().allow(''),
        doc_clearing: joi.string().allow('')
      })
      const { value: results, error } = schema.validate(req.body)
      if (error) {
        return response(res, 'Error', { error: error.message }, 404, false)
      } else {
        const result = await disposal.findByPk(id)
        if (result) {
          if (tipe === 'sell' || tipe === 'disposal') {
            const findDoc = await docUser.findAll({
              where: {
                no_pengadaan: result.no_asset,
                [Op.and]: [
                  { jenis_form: 'disposal' },
                  {
                    [Op.or]: [
                      { tipe: 'pengajuan' },
                      { tipe: 'jual' },
                      { tipe: 'purch' },
                      { tipe: 'npwp' }
                    ]
                  }
                ]
              }
            })
            if (findDoc.length > 0) {
              const cek = []
              for (let i = 0; i < findDoc.length; i++) {
                if (findDoc[i].path !== null) {
                  cek.push(1)
                }
              }
              if (cek.length === findDoc.length) {
                const update = await result.update(results)
                if (update) {
                  return response(res, 'success update disposal')
                } else {
                  return response(res, 'failed update disposal', {}, 400, false)
                }
              } else {
                return response(res, 'Lengkapi Dokumen terlebih dahulu', {}, 400, false)
              }
            } else {
              return response(res, 'Lengkapi Dokumen terlebih dahulu', {}, 400, false)
            }
          } else if (tipe === 'taxDis') {
            const findDoc = await docUser.findAll({
              where: {
                no_pengadaan: result.no_asset,
                [Op.and]: [
                  { jenis_form: 'disposal' },
                  { tipe: 'tax' }
                ]
              }
            })
            if (findDoc.length > 0) {
              const cek = []
              for (let i = 0; i < findDoc.length; i++) {
                if (findDoc[i].path !== null) {
                  cek.push(1)
                }
              }
              if (cek.length === findDoc.length) {
                const update = await result.update(results)
                if (update) {
                  return response(res, 'success update disposal')
                } else {
                  return response(res, 'failed update disposal', {}, 400, false)
                }
              } else {
                return response(res, 'Lengkapi Dokumen terlebih dahulu', {}, 400, false)
              }
            } else {
              return response(res, 'Lengkapi Dokumen terlebih dahulu', {}, 400, false)
            }
          } else if (tipe === 'financeDis') {
            const findDoc = await docUser.findAll({
              where: {
                no_pengadaan: result.no_asset,
                [Op.and]: [
                  { jenis_form: 'disposal' },
                  { tipe: 'finance' }
                ]
              }
            })
            if (findDoc.length > 0) {
              const cek = []
              for (let i = 0; i < findDoc.length; i++) {
                if (findDoc[i].path !== null) {
                  cek.push(1)
                }
              }
              if (cek.length === findDoc.length) {
                const update = await result.update(results)
                if (update) {
                  return response(res, 'success update disposal')
                } else {
                  return response(res, 'failed update disposal', {}, 400, false)
                }
              } else {
                return response(res, 'Lengkapi Dokumen terlebih dahulu', {}, 400, false)
              }
            } else {
              return response(res, 'Lengkapi Dokumen terlebih dahulu', {}, 400, false)
            }
          } else {
            const update = await result.update(results)
            if (update) {
              return response(res, 'success update disposal')
            } else {
              return response(res, 'failed update disposal', {}, 400, false)
            }
          }
        } else {
          return response(res, 'failed update disposal', {}, 400, false)
        }
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  getDocumentDis: async (req, res) => {
    try {
      const no = req.params.no
      let { tipeDokumen, tipe, npwp } = req.query
      let tipeDoValue = ''
      let tipeValue = ''
      if (typeof tipeDokumen === 'object') {
        tipeDoValue = Object.values(tipeDokumen)[0]
      } else {
        tipeDoValue = tipeDokumen || 'disposal'
      }
      if (typeof tipe === 'object') {
        tipeValue = Object.values(tipe)[0]
      } else {
        tipeValue = tipe || 'pengajuan'
      }
      if (!npwp) {
        npwp = ''
      }
      const results = await disposal.findOne({
        where: {
          no_asset: no
        }
      })
      if (tipeDoValue === 'disposal' && tipeValue === 'pengajuan') {
        if (results.nilai_jual !== '0') {
          const result = await docUser.findAll({
            where: {
              no_pengadaan: no,
              [Op.and]: [
                { jenis_form: tipeDoValue },
                {
                  [Op.or]: [
                    { tipe: tipeValue },
                    { tipe: 'jual' },
                    { tipe: 'purch' }
                  ]
                }
              ]
            }
          })
          if (result.length > 0) {
            return response(res, 'success get document', { result })
          } else {
            const getDoc = await document.findAll({
              where: {
                [Op.and]: [
                  { tipe_dokumen: tipeDoValue },
                  {
                    [Op.or]: [
                      { tipe: tipeValue },
                      { tipe: 'jual' }
                    ]
                  }
                ],
                [Op.or]: [
                  { jenis_dokumen: results.kategori },
                  { jenis_dokumen: 'all' }
                ]
              }
            })
            if (getDoc) {
              const hasil = []
              for (let i = 0; i < getDoc.length; i++) {
                const send = {
                  nama_dokumen: getDoc[i].nama_dokumen,
                  jenis_dokumen: getDoc[i].jenis_dokumen,
                  divisi: getDoc[i].divisi,
                  no_pengadaan: no,
                  jenis_form: tipeDoValue,
                  tipe: tipeValue,
                  path: null
                }
                const make = await docUser.create(send)
                if (make) {
                  hasil.push(make)
                }
              }
              if (hasil.length === getDoc.length) {
                return response(res, 'success get document', { result: hasil })
              } else {
                return response(res, 'failed get data', {}, 404, false)
              }
            } else {
              return response(res, 'failed get data', {}, 404, false)
            }
          }
        } else {
          const result = await docUser.findAll({
            where: {
              no_pengadaan: no,
              [Op.and]: [
                { jenis_form: tipeDoValue },
                { tipe: tipeValue }
              ]
            }
          })
          if (result.length > 0) {
            return response(res, 'success get document', { result })
          } else {
            const getDoc = await document.findAll({
              where: {
                [Op.and]: [
                  { tipe_dokumen: tipeDoValue },
                  { tipe: tipeValue }
                ],
                [Op.or]: [
                  { jenis_dokumen: results.kategori },
                  { jenis_dokumen: 'all' }
                ]
              }
            })
            if (getDoc) {
              const hasil = []
              for (let i = 0; i < getDoc.length; i++) {
                const send = {
                  nama_dokumen: getDoc[i].nama_dokumen,
                  jenis_dokumen: getDoc[i].jenis_dokumen,
                  divisi: getDoc[i].divisi,
                  no_pengadaan: no,
                  jenis_form: tipeDoValue,
                  tipe: tipeValue,
                  path: null
                }
                const make = await docUser.create(send)
                if (make) {
                  hasil.push(make)
                }
              }
              if (hasil.length === getDoc.length) {
                return response(res, 'success get document', { result: hasil })
              } else {
                return response(res, 'failed get data', {}, 404, false)
              }
            } else {
              return response(res, 'failed get data', {}, 404, false)
            }
          }
        }
      } else if (tipeDoValue === 'edit' && tipeValue === 'pengajuan') {
        const result = await docUser.findAll({
          where: {
            no_pengadaan: no,
            [Op.and]: [
              { jenis_form: 'disposal' },
              {
                [Op.or]: [
                  { tipe: tipeValue },
                  { tipe: 'jual' }
                ]
              }
            ]
          }
        })
        if (result.length > 0) {
          return response(res, 'success get document', { result })
        } else {
          return response(res, 'success get document', { result })
        }
      } else if (npwp === 'ada') {
        const findAsset = await disposal.findOne({
          where: {
            no_asset: no
          }
        })
        if (findAsset.npwp === 'ada') {
          const findDoc = await docUser.findAll({
            where: {
              [Op.and]: [
                { no_pengadaan: no },
                { tipe: 'npwp' }
              ]
            }
          })
          if (findDoc.length > 0) {
            const result = await docUser.findAll({
              where: {
                [Op.and]: [
                  { no_pengadaan: no },
                  { jenis_form: tipeDoValue }
                ],
                [Op.or]: [
                  { tipe: tipeValue },
                  { tipe: 'npwp' }
                ]
              }
            })
            if (result.length > 0) {
              return response(res, 'success get document', { result })
            } else {
              return response(res, 'failed get data', {}, 404, false)
            }
          } else {
            const findNpwp = await document.findOne({
              where: {
                [Op.and]: [
                  { tipe_dokumen: tipeDoValue },
                  { tipe: 'npwp' }
                ],
                [Op.or]: [
                  { jenis_dokumen: results.kategori },
                  { jenis_dokumen: 'all' }
                ]
              }
            })
            if (findNpwp) {
              const send = {
                nama_dokumen: findNpwp.nama_dokumen,
                jenis_dokumen: findNpwp.jenis_dokumen,
                divisi: findNpwp.divisi,
                no_pengadaan: no,
                jenis_form: tipeDoValue,
                tipe: 'npwp',
                path: null
              }
              const make = await docUser.create(send)
              if (make) {
                const result = await docUser.findAll({
                  where: {
                    [Op.and]: [
                      { no_pengadaan: no },
                      { jenis_form: tipeDoValue }
                    ],
                    [Op.or]: [
                      { tipe: tipeValue },
                      { tipe: 'npwp' }
                    ]
                  }
                })
                if (result.length > 1) {
                  return response(res, 'success get document', { result })
                } else {
                  const getDoc = await document.findAll({
                    where: {
                      [Op.and]: [
                        { tipe_dokumen: tipeDoValue },
                        { tipe: tipeValue }
                      ],
                      [Op.or]: [
                        { jenis_dokumen: results.kategori },
                        { jenis_dokumen: 'all' }
                      ]
                    }
                  })
                  if (getDoc) {
                    const hasil = []
                    for (let i = 0; i < getDoc.length; i++) {
                      const send = {
                        nama_dokumen: getDoc[i].nama_dokumen,
                        jenis_dokumen: getDoc[i].jenis_dokumen,
                        divisi: getDoc[i].divisi,
                        no_pengadaan: no,
                        jenis_form: tipeDoValue,
                        tipe: tipeValue,
                        path: null
                      }
                      const make = await docUser.create(send)
                      if (make) {
                        hasil.push(make)
                      }
                    }
                    if (hasil.length === getDoc.length) {
                      const result = await docUser.findAll({
                        where: {
                          [Op.and]: [
                            { no_pengadaan: no },
                            { jenis_form: tipeDoValue }
                          ],
                          [Op.or]: [
                            { tipe: tipeValue },
                            { tipe: 'npwp' }
                          ]
                        }
                      })
                      if (result.length > 0) {
                        return response(res, 'success get document', { result })
                      } else {
                        return response(res, 'failed get data', {}, 404, false)
                      }
                    } else {
                      return response(res, 'failed get data', {}, 404, false)
                    }
                  } else {
                    return response(res, 'failed get data', {}, 404, false)
                  }
                }
              } else {
                return response(res, 'failed get data', {}, 404, false)
              }
            } else {
              return response(res, 'failed get data npwp', {}, 404, false)
            }
          }
        } else {
          const findDoc = await docUser.findOne({
            where: {
              [Op.and]: [
                { no_pengadaan: no },
                { tipe: 'npwp' }
              ]
            }
          })
          if (findDoc) {
            const delDoc = await findDoc.destroy()
            if (delDoc) {
              const result = await docUser.findAll({
                where: {
                  no_pengadaan: no,
                  [Op.and]: [
                    { jenis_form: tipeDoValue },
                    { tipe: tipeValue }
                  ]
                }
              })
              if (result.length > 0) {
                return response(res, 'success get document', { result })
              } else {
                const getDoc = await document.findAll({
                  where: {
                    [Op.and]: [
                      { tipe_dokumen: tipeDoValue },
                      { tipe: tipeValue }
                    ],
                    [Op.or]: [
                      { jenis_dokumen: results.kategori },
                      { jenis_dokumen: 'all' }
                    ]
                  }
                })
                if (getDoc) {
                  const hasil = []
                  for (let i = 0; i < getDoc.length; i++) {
                    const send = {
                      nama_dokumen: getDoc[i].nama_dokumen,
                      jenis_dokumen: getDoc[i].jenis_dokumen,
                      divisi: getDoc[i].divisi,
                      no_pengadaan: no,
                      jenis_form: tipeDoValue,
                      tipe: tipeValue,
                      path: null
                    }
                    const make = await docUser.create(send)
                    if (make) {
                      hasil.push(make)
                    }
                  }
                  if (hasil.length === getDoc.length) {
                    return response(res, 'success get document', { result: hasil })
                  } else {
                    return response(res, 'failed get data', {}, 404, false)
                  }
                } else {
                  return response(res, 'failed get data', {}, 404, false)
                }
              }
            } else {
              return response(res, 'failed get data', {}, 404, false)
            }
          } else {
            const result = await docUser.findAll({
              where: {
                no_pengadaan: no,
                [Op.and]: [
                  { jenis_form: tipeDoValue },
                  { tipe: tipeValue }
                ]
              }
            })
            if (result.length > 0) {
              return response(res, 'success get document', { result })
            } else {
              const getDoc = await document.findAll({
                where: {
                  [Op.and]: [
                    { tipe_dokumen: tipeDoValue },
                    { tipe: tipeValue }
                  ],
                  [Op.or]: [
                    { jenis_dokumen: results.kategori },
                    { jenis_dokumen: 'all' }
                  ]
                }
              })
              if (getDoc) {
                const hasil = []
                for (let i = 0; i < getDoc.length; i++) {
                  const send = {
                    nama_dokumen: getDoc[i].nama_dokumen,
                    jenis_dokumen: getDoc[i].jenis_dokumen,
                    divisi: getDoc[i].divisi,
                    no_pengadaan: no,
                    jenis_form: tipeDoValue,
                    tipe: tipeValue,
                    path: null
                  }
                  const make = await docUser.create(send)
                  if (make) {
                    hasil.push(make)
                  }
                }
                if (hasil.length === getDoc.length) {
                  return response(res, 'success get document', { result: hasil })
                } else {
                  return response(res, 'failed get data', {}, 404, false)
                }
              } else {
                return response(res, 'failed get data', {}, 404, false)
              }
            }
          }
        }
      } else {
        const result = await docUser.findAll({
          where: {
            no_pengadaan: no,
            [Op.and]: [
              { jenis_form: tipeDoValue },
              { tipe: tipeValue }
            ]
          }
        })
        if (result.length > 0) {
          return response(res, 'success get document', { result })
        } else {
          const getDoc = await document.findAll({
            where: {
              [Op.and]: [
                { tipe_dokumen: tipeDoValue },
                { tipe: tipeValue }
              ],
              [Op.or]: [
                { jenis_dokumen: results.kategori },
                { jenis_dokumen: 'all' }
              ]
            }
          })
          if (getDoc) {
            const hasil = []
            for (let i = 0; i < getDoc.length; i++) {
              const send = {
                nama_dokumen: getDoc[i].nama_dokumen,
                jenis_dokumen: getDoc[i].jenis_dokumen,
                divisi: getDoc[i].divisi,
                no_pengadaan: no,
                jenis_form: tipeDoValue,
                tipe: tipeValue,
                path: null
              }
              const make = await docUser.create(send)
              if (make) {
                hasil.push(make)
              }
            }
            if (hasil.length === getDoc.length) {
              return response(res, 'success get document', { result: hasil })
            } else {
              return response(res, 'failed get data', {}, 404, false)
            }
          } else {
            return response(res, 'failed get data', {}, 404, false)
          }
        }
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  uploadDocument: async (req, res) => {
    const id = req.params.id
    const { tipe, ket } = req.query
    uploadHelper(req, res, async function (err) {
      try {
        if (err instanceof multer.MulterError) {
          if (err.code === 'LIMIT_UNEXPECTED_FILE' && req.files.length === 0) {
            // console.log(err.code === 'LIMIT_UNEXPECTED_FILE' && req.files.length > 0)
            return response(res, 'fieldname doesnt match', {}, 500, false)
          }
          return response(res, err.message, {}, 500, false)
        } else if (err) {
          return response(res, err.message, {}, 401, false)
        }
        const dokumen = `assets/documents/${req.file.filename}`
        const result = await docUser.findByPk(id)
        if (result) {
          if (tipe === 'edit' && ket === 'peng') {
            const send = {
              status: result.status === 0 ? 1 : result.status,
              path: dokumen,
              divisi: result.divisi === '0' ? 'asset' : result.divisi
            }
            await result.update(send)
            const findDis = await disposal.findOne({
              where: {
                no_asset: result.no_pengadaan
              }
            })
            if (findDis) {
              return response(res, 'success edit disposal')
            } else {
              return response(res, 'success edit disposal')
            }
          } else if (tipe === 'edit' && ket === 'eks') {
            const send = {
              status: result.status === 0 ? 1 : result.status,
              path: dokumen,
              divisi: 'asset'
            }
            await result.update(send)
            return response(res, 'successfully upload dokumen', { send })
          } else {
            const send = {
              status: tipe === 'disposal' ? 4 : 1,
              path: dokumen,
              divisi: 'asset'
            }
            await result.update(send)
            return response(res, 'successfully upload dokumen', { send })
          }
        } else {
          return response(res, 'failed upload dokumen', {}, 404, false)
        }
      } catch (error) {
        return response(res, error.message, {}, 500, false)
      }
    })
  },
  approveDokumen: async (req, res) => {
    try {
      const id = req.params.id
      const level = req.user.level
      const result = await docUser.findByPk(id)
      if (result) {
        if (level === 2) {
          const send = {
            divisi: '3',
            alasan: ''
          }
          const results = await result.update(send)
          return response(res, 'successfully approve dokumen', { result: results })
        } else {
          const send = {
            status: 3,
            alasan: ''
          }
          const results = await result.update(send)
          return response(res, 'successfully approve dokumen', { result: results })
        }
      } else {
        return response(res, 'failed approve dokumen', {}, 404, false)
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  rejectDokumen: async (req, res) => {
    try {
      const id = req.params.id
      const level = req.user.level
      const { tipe, ket } = req.query
      const schema = joi.object({
        alasan: joi.string().required()
      })
      const { value: results, error } = schema.validate(req.body)
      if (error) {
        return response(res, 'Error', { error: error.message }, 404, false)
      } else {
        const result = await docUser.findByPk(id)
        if (result) {
          if (level === 2) {
            const send = {
              alasan: results.alasan,
              divisi: '0'
            }
            const reject = await result.update(send)
            if (reject) {
              if (tipe === 'editking') {
                const findDis = await disposal.findOne({
                  where: {
                    no_asset: result.no_pengadaan
                  }
                })
                if (findDis) {
                  const findEmail = await email.findOne({
                    where: {
                      kode_plant: findDis.kode_plant
                    }
                  })
                  if (findEmail) {
                    const data = {
                      kode_plant: findDis.kode_plant,
                      jenis: 'disposal',
                      no_proses: `D${findDis.no_disposal}`,
                      list_appr: findDis.kode_plant,
                      keterangan: result.nama_dokumen,
                      response: 'revisi'
                    }
                    const createNotif = await notif.create(data)
                    if (createNotif) {
                      const ccIt = [findEmail.email_am, findEmail.email_aam, findEmail.email_spv_asset, findEmail.email_staff_asset1, findEmail.email_staff_asset2, findEmail.email_nom, findEmail.email_bm, findEmail.email_area_om, findEmail.email_it_spv, findEmail.email_ism, findEmail.email_staff_it, findEmail.email_ga_spv, findEmail.email_staff_ga]
                      const cc = [findEmail.email_am, findEmail.email_aam, findEmail.email_spv_asset, findEmail.email_staff_asset1, findEmail.email_staff_asset2, findEmail.email_nom, findEmail.email_bm, findEmail.email_area_om, findEmail.email_ga_spv, findEmail.email_staff_ga]
                      const tableTd = `
                      <tr>
                        <td>1</td>
                        <td>D${findDis.no_disposal}</td>
                        <td>${findDis.no_asset}</td>
                        <td>${findDis.nama_asset}</td>
                        <td>${findDis.cost_center}</td>
                        <td>${findDis.area}</td>
                      </tr>`
                      if (result.tipe === 'purch') {
                        const findUser = await user.findOne({
                          where: {
                            user_level: 6
                          }
                        })
                        if (findUser) {
                          const mailOptions = {
                            from: 'noreply_asset@pinusmerahabadi.co.id',
                            replyTo: 'noreply_asset@pinusmerahabadi.co.id',
                            // to: `${findUser.email}`,
                            to: `${emailAss}, ${emailAss2}`,
                            // cc: findDis.kategori === 'it' || findDis.kategori === 'IT' ? `${ccIt}` : `${cc}`,
                            subject: `REJECT KELENGKAPAN ${ket === 'peng' ? 'PENGAJUAN' : 'EKSEKUSI'} DISPOSAL ASSET ${findDis.area} `,
                            html: `
                            <head>
                              <style type="text/css">
                              body {
                                  display: flexbox;
                                  flex-direction: column;
                              }
                              .tittle {
                                  font-size: 15px;
                              }
                              .mar {
                                  margin-bottom: 20px;
                              }
                              .mar1 {
                                  margin-bottom: 10px;
                              }
                              .foot {
                                  margin-top: 20px;
                                  margin-bottom: 10px;
                              }
                              .foot1 {
                                  margin-bottom: 50px;
                              }
                              .position {
                                  display: flexbox;
                                  flex-direction: row;
                                  justify-content: left;
                                  margin-top: 10px;
                              }
                              table {
                                  font-family: "Lucida Sans Unicode", "Lucida Grande", "Segoe Ui";
                                  font-size: 12px;
                              }
                              .demo-table {
                                  border-collapse: collapse;
                                  font-size: 13px;
                              }
                              .demo-table th, 
                              .demo-table td {
                                  border-bottom: 1px solid #e1edff;
                                  border-left: 1px solid #e1edff;
                                  padding: 7px 17px;
                              }
                              .demo-table th, 
                              .demo-table td:last-child {
                                  border-right: 1px solid #e1edff;
                              }
                              .demo-table td:first-child {
                                  border-top: 1px solid #e1edff;
                              }
                              .demo-table td:last-child{
                                  border-bottom: 0;
                              }
                              caption {
                                  caption-side: top;
                                  margin-bottom: 10px;
                              }
                              
                              /* Table Header */
                              .demo-table thead th {
                                  background-color: #508abb;
                                  color: #FFFFFF;
                                  border-color: #6ea1cc !important;
                                  text-transform: uppercase;
                              }
                              
                              /* Table Body */
                              .demo-table tbody td {
                                  color: #353535;
                              }
                              
                              .demo-table tbody tr:nth-child(odd) td {
                                  background-color: #f4fbff;
                              }
                              .demo-table tbody tr:hover th,
                              .demo-table tbody tr:hover td {
                                  background-color: #ffffa2;
                                  border-color: #ffff0f;
                                  transition: all .2s;
                              }
                          </style>
                            </head>
                            <body>
                                <div class="tittle mar">
                                    Dear Bapak/Ibu,
                                </div>
                                <div class="tittle mar1">
                                    <div>Lampiran ${ket === 'peng' ? 'pengajuan' : 'eksekusi'} disposal asset telah direject dengan alasan sebagai berikut:</div>
                                    <div>Alasan reject: ${results.alasan}</div>
                                    <div>Direject oleh: ${level === 2 ? 'Team Asset' : level === 12 ? 'BM' : 'Team Purchasing'}</div>
                                </div>
                                <div class="position mar1">
                                    <table class="demo-table">
                                        <thead>
                                            <tr>
                                                <th>No</th>
                                                <th>No Disposal</th>
                                                <th>Asset</th>
                                                <th>Asset description</th>
                                                <th>Cost Ctr</th>
                                                <th>Cost Ctr Name</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                          ${tableTd}
                                        </tbody>
                                    </table>
                                </div>
                                <div class="tittle">Mohon agar melengkapi/memperbaiki kelengkapan eksekusi disposalnya untuk dapat diproses lebih lanjut.</div>
                                <a href="http://aset.pinusmerahabadi.co.id/">Klik link berikut untuk akses web asset</a>
                                <div class="tittle foot">
                                    Terima kasih,
                                </div>
                                <div class="tittle foot1">
                                    Regards,
                                </div>
                                <div class="tittle">
                                    Team Asset
                                </div>
                            </body>
                            `
                          }
                          const sendEmail = await wrapMail.wrapedSendMail(mailOptions)
                          if (sendEmail) {
                            return response(res, 'success reject disposal', { sendEmail })
                          } else {
                            return response(res, 'berhasil reject disposal, tidak berhasil kirim notif email 1')
                          }
                        } else {
                          return response(res, 'successfully reject dokumen', { result: reject })
                        }
                      } else {
                        const mailOptions = {
                          from: 'noreply_asset@pinusmerahabadi.co.id',
                          replyTo: 'noreply_asset@pinusmerahabadi.co.id',
                          // to: `${findEmail.email_area_aos}`,
                          to: `${emailAss}, ${emailAss2}`,
                          // cc: findDis.kategori === 'it' || findDis.kategori === 'IT' ? `${ccIt}` : `${cc}`,
                          subject: `REJECT KELENGKAPAN ${ket === 'peng' ? 'PENGAJUAN' : 'EKSEKUSI'} DISPOSAL ASSET ${findDis.area} `,
                          html: `
                          <head>
                            <style type="text/css">
                            body {
                                display: flexbox;
                                flex-direction: column;
                            }
                            .tittle {
                                font-size: 15px;
                            }
                            .mar {
                                margin-bottom: 20px;
                            }
                            .mar1 {
                                margin-bottom: 10px;
                            }
                            .foot {
                                margin-top: 20px;
                                margin-bottom: 10px;
                            }
                            .foot1 {
                                margin-bottom: 50px;
                            }
                            .position {
                                display: flexbox;
                                flex-direction: row;
                                justify-content: left;
                                margin-top: 10px;
                            }
                            table {
                                font-family: "Lucida Sans Unicode", "Lucida Grande", "Segoe Ui";
                                font-size: 12px;
                            }
                            .demo-table {
                                border-collapse: collapse;
                                font-size: 13px;
                            }
                            .demo-table th, 
                            .demo-table td {
                                border-bottom: 1px solid #e1edff;
                                border-left: 1px solid #e1edff;
                                padding: 7px 17px;
                            }
                            .demo-table th, 
                            .demo-table td:last-child {
                                border-right: 1px solid #e1edff;
                            }
                            .demo-table td:first-child {
                                border-top: 1px solid #e1edff;
                            }
                            .demo-table td:last-child{
                                border-bottom: 0;
                            }
                            caption {
                                caption-side: top;
                                margin-bottom: 10px;
                            }
                            
                            /* Table Header */
                            .demo-table thead th {
                                background-color: #508abb;
                                color: #FFFFFF;
                                border-color: #6ea1cc !important;
                                text-transform: uppercase;
                            }
                            
                            /* Table Body */
                            .demo-table tbody td {
                                color: #353535;
                            }
                            
                            .demo-table tbody tr:nth-child(odd) td {
                                background-color: #f4fbff;
                            }
                            .demo-table tbody tr:hover th,
                            .demo-table tbody tr:hover td {
                                background-color: #ffffa2;
                                border-color: #ffff0f;
                                transition: all .2s;
                            }
                        </style>
                          </head>
                          <body>
                              <div class="tittle mar">
                                  Dear Bapak/Ibu,
                              </div>
                              <div class="tittle mar1">
                                  <div>Lampiran ${ket === 'peng' ? 'pengajuan' : 'eksekusi'} disposal asset telah direject dengan alasan sebagai berikut:</div>
                                  <div>Alasan reject: ${results.alasan}</div>
                                  <div>Direject oleh: ${level === 2 ? 'Team Asset' : level === 12 ? 'BM' : 'Team Purchasing'}</div>
                              </div>
                              <div class="position mar1">
                                  <table class="demo-table">
                                      <thead>
                                          <tr>
                                              <th>No</th>
                                              <th>No Disposal</th>
                                              <th>Asset</th>
                                              <th>Asset description</th>
                                              <th>Cost Ctr</th>
                                              <th>Cost Ctr Name</th>
                                          </tr>
                                      </thead>
                                      <tbody>
                                        ${tableTd}
                                      </tbody>
                                  </table>
                              </div>
                              <div class="tittle">Mohon agar melengkapi/memperbaiki kelengkapan eksekusi disposalnya untuk dapat diproses lebih lanjut.</div>
                              <a href="http://aset.pinusmerahabadi.co.id/">Klik link berikut untuk akses web asset</a>
                              <div class="tittle foot">
                                  Terima kasih,
                              </div>
                              <div class="tittle foot1">
                                  Regards,
                              </div>
                              <div class="tittle">
                                  Team Asset
                              </div>
                          </body>
                          `
                        }
                        const sendEmail = await wrapMail.wrapedSendMail(mailOptions)
                        if (sendEmail) {
                          return response(res, 'success reject disposal', { sendEmail })
                        } else {
                          return response(res, 'berhasil reject disposal, tidak berhasil kirim notif email 1')
                        }
                      }
                    }
                  }
                } else {
                  return response(res, 'successfully reject dokumen', { result: reject })
                }
              } else {
                return response(res, 'successfully reject dokumen', { result: reject })
              }
            } else {
              return response(res, 'failed reject dokumen', {}, 404, false)
            }
          } else {
            const send = {
              alasan: results.alasan,
              status: 0
            }
            const reject = await result.update(send)
            if (reject) {
              if (tipe === 'editking') {
                const findDis = await disposal.findOne({
                  where: {
                    no_asset: result.no_pengadaan
                  }
                })
                if (findDis) {
                  const findEmail = await email.findOne({
                    where: {
                      kode_plant: findDis.kode_plant
                    }
                  })
                  if (findEmail) {
                    const data = {
                      kode_plant: findDis.kode_plant,
                      jenis: 'disposal',
                      no_proses: `D${findDis.no_disposal}`,
                      list_appr: findDis.kode_plant,
                      keterangan: result.nama_dokumen,
                      response: 'revisi'
                    }
                    const createNotif = await notif.create(data)
                    if (createNotif) {
                      const tableTd = `
                      <tr>
                        <td>1</td>
                        <td>D${findDis.no_disposal}</td>
                        <td>${findDis.no_asset}</td>
                        <td>${findDis.nama_asset}</td>
                        <td>${findDis.cost_center}</td>
                        <td>${findDis.area}</td>
                      </tr>`
                      if (result.tipe === 'purch') {
                        const findUser = await user.findOne({
                          where: {
                            user_level: 6
                          }
                        })
                        if (findUser) {
                          const mailOptions = {
                            from: 'noreply_asset@pinusmerahabadi.co.id',
                            replyTo: 'noreply_asset@pinusmerahabadi.co.id',
                            // to: `${findUser.email}`,
                            to: `${emailAss}, ${emailAss2}`,
                            subject: `Reject Dokumen ${ket === 'peng' ? 'Pengajuan' : 'Eksekusi'} Disposal No Asset ${result.no_asset} `,
                            html: `
                            <head>
                              <style type="text/css">
                              body {
                                  display: flexbox;
                                  flex-direction: column;
                              }
                              .tittle {
                                  font-size: 15px;
                              }
                              .mar {
                                  margin-bottom: 20px;
                              }
                              .mar1 {
                                  margin-bottom: 10px;
                              }
                              .foot {
                                  margin-top: 20px;
                                  margin-bottom: 10px;
                              }
                              .foot1 {
                                  margin-bottom: 50px;
                              }
                              .position {
                                  display: flexbox;
                                  flex-direction: row;
                                  justify-content: left;
                                  margin-top: 10px;
                              }
                              table {
                                  font-family: "Lucida Sans Unicode", "Lucida Grande", "Segoe Ui";
                                  font-size: 12px;
                              }
                              .demo-table {
                                  border-collapse: collapse;
                                  font-size: 13px;
                              }
                              .demo-table th, 
                              .demo-table td {
                                  border-bottom: 1px solid #e1edff;
                                  border-left: 1px solid #e1edff;
                                  padding: 7px 17px;
                              }
                              .demo-table th, 
                              .demo-table td:last-child {
                                  border-right: 1px solid #e1edff;
                              }
                              .demo-table td:first-child {
                                  border-top: 1px solid #e1edff;
                              }
                              .demo-table td:last-child{
                                  border-bottom: 0;
                              }
                              caption {
                                  caption-side: top;
                                  margin-bottom: 10px;
                              }
                              
                              /* Table Header */
                              .demo-table thead th {
                                  background-color: #508abb;
                                  color: #FFFFFF;
                                  border-color: #6ea1cc !important;
                                  text-transform: uppercase;
                              }
                              
                              /* Table Body */
                              .demo-table tbody td {
                                  color: #353535;
                              }
                              
                              .demo-table tbody tr:nth-child(odd) td {
                                  background-color: #f4fbff;
                              }
                              .demo-table tbody tr:hover th,
                              .demo-table tbody tr:hover td {
                                  background-color: #ffffa2;
                                  border-color: #ffff0f;
                                  transition: all .2s;
                              }
                          </style>
                            </head>
                            <body>
                                <div class="tittle mar">
                                    Dear Bapak/Ibu AOS,
                                </div>
                                <div class="tittle mar1">
                                    <div>Mohon untuk revisi dokumen ${result.nama_dokumen} disposal aset dibawah ini:</div>
                                    <div>Alasan reject: ${results.alasan}</div>
                                    <div>Direject oleh: ${level === 2 ? 'Team Asset' : level === 12 ? 'BM' : 'Team Purchasing'}</div>
                                </div>
                                <div class="position mar1">
                                    <table class="demo-table">
                                        <thead>
                                            <tr>
                                                <th>No</th>
                                                <th>No Disposal</th>
                                                <th>Asset</th>
                                                <th>Asset description</th>
                                                <th>Cost Ctr</th>
                                                <th>Cost Ctr Name</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                          ${tableTd}
                                        </tbody>
                                    </table>
                                </div>
                                <a href="http://aset.pinusmerahabadi.co.id/">Klik link berikut untuk akses web asset</a>
                                <div class="tittle foot">
                                    Terima kasih,
                                </div>
                                <div class="tittle foot1">
                                    Regards,
                                </div>
                                <div class="tittle">
                                    Team Asset
                                </div>
                            </body>
                            `
                          }
                          const sendEmail = await wrapMail.wrapedSendMail(mailOptions)
                          if (sendEmail) {
                            return response(res, 'success reject disposal', { sendEmail })
                          } else {
                            return response(res, 'berhasil reject disposal, tidak berhasil kirim notif email 1')
                          }
                        } else {
                          return response(res, 'successfully reject dokumen', { result: reject })
                        }
                      } else {
                        const mailOptions = {
                          from: 'noreply_asset@pinusmerahabadi.co.id',
                          replyTo: 'noreply_asset@pinusmerahabadi.co.id',
                          // to: `${findEmail.email_area_aos}`,
                          to: `${emailAss}, ${emailAss2}`,
                          subject: `Reject Dokumen ${ket === 'peng' ? 'Pengajuan' : 'Eksekusi'} Disposal No Asset ${result.no_asset} `,
                          html: `
                          <head>
                            <style type="text/css">
                            body {
                                display: flexbox;
                                flex-direction: column;
                            }
                            .tittle {
                                font-size: 15px;
                            }
                            .mar {
                                margin-bottom: 20px;
                            }
                            .mar1 {
                                margin-bottom: 10px;
                            }
                            .foot {
                                margin-top: 20px;
                                margin-bottom: 10px;
                            }
                            .foot1 {
                                margin-bottom: 50px;
                            }
                            .position {
                                display: flexbox;
                                flex-direction: row;
                                justify-content: left;
                                margin-top: 10px;
                            }
                            table {
                                font-family: "Lucida Sans Unicode", "Lucida Grande", "Segoe Ui";
                                font-size: 12px;
                            }
                            .demo-table {
                                border-collapse: collapse;
                                font-size: 13px;
                            }
                            .demo-table th, 
                            .demo-table td {
                                border-bottom: 1px solid #e1edff;
                                border-left: 1px solid #e1edff;
                                padding: 7px 17px;
                            }
                            .demo-table th, 
                            .demo-table td:last-child {
                                border-right: 1px solid #e1edff;
                            }
                            .demo-table td:first-child {
                                border-top: 1px solid #e1edff;
                            }
                            .demo-table td:last-child{
                                border-bottom: 0;
                            }
                            caption {
                                caption-side: top;
                                margin-bottom: 10px;
                            }
                            
                            /* Table Header */
                            .demo-table thead th {
                                background-color: #508abb;
                                color: #FFFFFF;
                                border-color: #6ea1cc !important;
                                text-transform: uppercase;
                            }
                            
                            /* Table Body */
                            .demo-table tbody td {
                                color: #353535;
                            }
                            
                            .demo-table tbody tr:nth-child(odd) td {
                                background-color: #f4fbff;
                            }
                            .demo-table tbody tr:hover th,
                            .demo-table tbody tr:hover td {
                                background-color: #ffffa2;
                                border-color: #ffff0f;
                                transition: all .2s;
                            }
                        </style>
                          </head>
                          <body>
                              <div class="tittle mar">
                                  Dear Bapak/Ibu AOS,
                              </div>
                              <div class="tittle mar1">
                                  <div>Mohon untuk revisi dokumen ${result.nama_dokumen} disposal aset dibawah ini:</div>
                                  <div>Alasan reject: ${results.alasan}</div>
                                  <div>Direject oleh: ${level === 2 ? 'Team Asset' : level === 12 ? 'BM' : 'Team Purchasing'}</div>
                              </div>
                              <div class="position mar1">
                                  <table class="demo-table">
                                      <thead>
                                          <tr>
                                              <th>No</th>
                                              <th>No Disposal</th>
                                              <th>Asset</th>
                                              <th>Asset description</th>
                                              <th>Cost Ctr</th>
                                              <th>Cost Ctr Name</th>
                                          </tr>
                                      </thead>
                                      <tbody>
                                        ${tableTd}
                                      </tbody>
                                  </table>
                              </div>
                              <a href="http://aset.pinusmerahabadi.co.id/">Klik link berikut untuk akses web asset</a>
                              <div class="tittle foot">
                                  Terima kasih,
                              </div>
                              <div class="tittle foot1">
                                  Regards,
                              </div>
                              <div class="tittle">
                                  Team Asset
                              </div>
                          </body>
                          `
                        }
                        const sendEmail = await wrapMail.wrapedSendMail(mailOptions)
                        if (sendEmail) {
                          return response(res, 'success reject disposal', { sendEmail })
                        } else {
                          return response(res, 'berhasil reject disposal, tidak berhasil kirim notif email 1')
                        }
                      }
                    }
                  }
                } else {
                  return response(res, 'successfully reject dokumen', { result: reject })
                }
              } else {
                return response(res, 'successfully reject dokumen', { result: reject })
              }
            } else {
              return response(res, 'failed reject dokumen', {}, 404, false)
            }
          }
        } else {
          return response(res, 'failed reject dokumen', {}, 404, false)
        }
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  rejectTaxFin: async (req, res) => {
    const no = req.params.no
    const { tipe } = req.query
    try {
      const result = await disposal.findOne({
        where: {
          no_asset: no
        }
      })
      if (result) {
        const findUser = await user.findOne({
          where: {
            user_level: tipe === 'tax' ? 3 : 4
          }
        })
        const findEmail = await email.findOne({
          where: {
            kode_plant: result.kode_plant
          }
        })
        if (findUser || findEmail) {
          const data = {
            kode_plant: result.kode_plant,
            jenis: 'disposal',
            no_proses: no,
            list_appr: findUser.username,
            keterangan: tipe,
            response: 'revisi'
          }
          const createNotif = await notif.create(data)
          if (createNotif) {
            const ccTax = [findEmail.email_am, findEmail.email_aam, findEmail.email_spv_asset, findEmail.email_staff_asset1, findEmail.email_staff_asset2, findEmail.email_nom, findEmail.email_bm, findEmail.email_area_om, findEmail.email_area_aos, findEmail.email_spv_tax]
            const ccFinIt = [findEmail.email_am, findEmail.email_aam, findEmail.email_spv_asset, findEmail.email_fm, findEmail.email_afm, findEmail.email_spv_finance, findEmail.email_staff_asset1, findEmail.email_staff_asset2, findEmail.email_nom, findEmail.email_bm, findEmail.email_area_om, findEmail.email_area_aos, findEmail.email_it_spv, findEmail.email_ism, findEmail.email_staff_it, findEmail.email_ga_spv, findEmail.email_staff_ga]
            const ccFin = [findEmail.email_am, findEmail.email_aam, findEmail.email_spv_asset, findEmail.email_fm, findEmail.email_afm, findEmail.email_spv_finance, findEmail.email_staff_asset1, findEmail.email_staff_asset2, findEmail.email_nom, findEmail.email_bm, findEmail.email_area_om, findEmail.email_area_aos, findEmail.email_ga_spv, findEmail.email_staff_ga]
            const tableTd = `
              <tr>
                <td>1</td>
                <td>D${result.no_disposal}</td>
                <td>${result.no_asset}</td>
                <td>${result.nama_asset}</td>
                <td>${result.cost_center}</td>
                <td>${result.area}</td>
              </tr>`
            const mailOptions = {
              from: 'noreply_asset@pinusmerahabadi.co.id',
              replyTo: 'noreply_asset@pinusmerahabadi.co.id',
              // to: `${findUser.email}`,
              to: `${emailAss}, ${emailAss2}`,
              // cc: tipe === 'tax' ? `${ccTax}` : tipe === 'finance' && (result.kategori === 'IT' || result.kategori === 'it') ? `${ccFinIt}` : `${ccFin}`,
              subject: `REJECT ${tipe === 'finance' ? 'JURNAL UANG MASUK' : 'FAKTUR PAJAK'} DISPOSAL ASSET ${result.area} `,
              html: `
              <head>
                <style type="text/css">
                body {
                    display: flexbox;
                    flex-direction: column;
                }
                .tittle {
                    font-size: 15px;
                }
                .mar {
                    margin-bottom: 20px;
                }
                .mar1 {
                    margin-bottom: 10px;
                }
                .foot {
                    margin-top: 20px;
                    margin-bottom: 10px;
                }
                .foot1 {
                    margin-bottom: 50px;
                }
                .position {
                    display: flexbox;
                    flex-direction: row;
                    justify-content: left;
                    margin-top: 10px;
                }
                table {
                    font-family: "Lucida Sans Unicode", "Lucida Grande", "Segoe Ui";
                    font-size: 12px;
                }
                .demo-table {
                    border-collapse: collapse;
                    font-size: 13px;
                }
                .demo-table th, 
                .demo-table td {
                    border-bottom: 1px solid #e1edff;
                    border-left: 1px solid #e1edff;
                    padding: 7px 17px;
                }
                .demo-table th, 
                .demo-table td:last-child {
                    border-right: 1px solid #e1edff;
                }
                .demo-table td:first-child {
                    border-top: 1px solid #e1edff;
                }
                .demo-table td:last-child{
                    border-bottom: 0;
                }
                caption {
                    caption-side: top;
                    margin-bottom: 10px;
                }
                
                /* Table Header */
                .demo-table thead th {
                    background-color: #508abb;
                    color: #FFFFFF;
                    border-color: #6ea1cc !important;
                    text-transform: uppercase;
                }
                
                /* Table Body */
                .demo-table tbody td {
                    color: #353535;
                }
                
                .demo-table tbody tr:nth-child(odd) td {
                    background-color: #f4fbff;
                }
                .demo-table tbody tr:hover th,
                .demo-table tbody tr:hover td {
                    background-color: #ffffa2;
                    border-color: #ffff0f;
                    transition: all .2s;
                }
            </style>
              </head>
              <body>
                  <div class="tittle mar">
                      Dear Bapak/Ibu,
                  </div>
                  <div class="tittle mar1">
                      <div>Lampiran ${tipe === 'tax' ? 'faktur pajak' : 'jurnal uang masuk'} telah direject dengan alasan sebagai berikut:</div>
                      <div>Alasan reject: Dokumen tidak sesuai</div>
                  </div>
                  <div class="position mar1">
                      <table class="demo-table">
                          <thead>
                              <tr>
                                  <th>No</th>
                                  <th>No Disposal</th>
                                  <th>Asset</th>
                                  <th>Asset description</th>
                                  <th>Cost Ctr</th>
                                  <th>Cost Ctr Name</th>
                              </tr>
                          </thead>
                          <tbody>
                            ${tableTd}
                          </tbody>
                      </table>
                  </div>
                  <div class="tittle">Mohon agar melengkapi/memperbaiki kelengkapan eksekusi disposalnya untuk dapat diproses lebih lanjut.</div>
                  <a href="http://aset.pinusmerahabadi.co.id/">Klik link berikut untuk akses web asset</a>
                  <div class="tittle foot">
                      Terima kasih,
                  </div>
                  <div class="tittle foot1">
                      Regards,
                  </div>
                  <div class="tittle">
                      Team Asset
                  </div>
              </body>
              `
            }
            const sendEmail = await wrapMail.wrapedSendMail(mailOptions)
            if (sendEmail) {
              if (result.no_io === 'finance' || result.no_io === 'tax' || result.no_io === 'taxfin') {
                const data = {
                  no_io: 'taxfin'
                }
                const sent = await result.update(data)
                if (sent) {
                  return response(res, 'success reject tax and finance')
                } else {
                  return response(res, 'failed reject tax and finance', {}, 404, false)
                }
              } else {
                const data = {
                  no_io: tipe
                }
                const sent = await result.update(data)
                if (sent) {
                  return response(res, 'success reject tax and finance')
                } else {
                  return response(res, 'failed reject tax and finance', {}, 404, false)
                }
              }
            } else {
              if (result.no_io === 'finance' || result.no_io === 'tax' || result.no_io === 'taxfin') {
                const data = {
                  no_io: 'taxfin'
                }
                const sent = await result.update(data)
                if (sent) {
                  return response(res, 'success reject tax and finance failed sendemail')
                } else {
                  return response(res, 'failed reject tax and finance', {}, 404, false)
                }
              } else {
                const data = {
                  no_io: tipe
                }
                const sent = await result.update(data)
                if (sent) {
                  return response(res, 'success reject tax and finance failed sendemail')
                } else {
                  return response(res, 'failed reject tax and finance', {}, 404, false)
                }
              }
            }
          }
        }
      } else {
        return response(res, 'failed reject tax and finance', {}, 404, false)
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  submitEditTaxFin: async (req, res) => {
    const no = req.params.no
    const level = req.user.level
    try {
      const result = await disposal.findOne({
        where: {
          no_asset: no
        }
      })
      if (result) {
        const findEmail = await email.findOne({
          where: {
            kode_plant: result.kode_plant
          }
        })
        if (findEmail) {
          const ccTax = [findEmail.email_am, findEmail.email_aam, findEmail.email_spv_asset, findEmail.email_fm, findEmail.email_afm, findEmail.email_spv_tax, findEmail.email_staff_tax, findEmail.email_nom, findEmail.email_bm, findEmail.email_area_om, findEmail.email_area_aos, findEmail.email_ga_spv, findEmail.email_staff_ga]
          const ccTaxIt = [findEmail.email_am, findEmail.email_aam, findEmail.email_spv_asset, findEmail.email_fm, findEmail.email_afm, findEmail.email_spv_tax, findEmail.email_staff_tax, findEmail.email_nom, findEmail.email_bm, findEmail.email_area_om, findEmail.email_area_aos, findEmail.email_it_spv, findEmail.email_ism, findEmail.email_staff_it, findEmail.email_ga_spv, findEmail.email_staff_ga]
          const ccFinIt = [findEmail.email_am, findEmail.email_aam, findEmail.email_spv_asset, findEmail.email_fm, findEmail.email_afm, findEmail.email_spv_finance, findEmail.email_staff_admbank, findEmail.email_nom, findEmail.email_bm, findEmail.email_area_om, findEmail.email_area_aos, findEmail.email_it_spv, findEmail.email_ism, findEmail.email_staff_it, findEmail.email_ga_spv, findEmail.email_staff_ga]
          const ccFin = [findEmail.email_am, findEmail.email_aam, findEmail.email_spv_asset, findEmail.email_fm, findEmail.email_afm, findEmail.email_spv_finance, findEmail.email_staff_admbank, findEmail.email_nom, findEmail.email_bm, findEmail.email_area_om, findEmail.email_area_aos, findEmail.email_ga_spv, findEmail.email_staff_ga]
          if (result.no_io === 'taxfin' && level === 3) {
            const findDoc = await docUser.findAll({
              where: {
                no_pengadaan: result.no_asset,
                [Op.and]: [
                  { jenis_form: 'disposal' },
                  { tipe: 'tax' }
                ]
              }
            })
            if (findDoc.length > 0) {
              const cek = []
              for (let i = 0; i < findDoc.length; i++) {
                if (findDoc[i].divisi !== '0') {
                  cek.push(1)
                }
              }
              if (cek.length === findDoc.length) {
                const data = {
                  status_form: 7,
                  no_io: 'finance'
                }
                const sent = await result.update(data)
                if (sent) {
                  const findUser = await user.findOne({
                    where: {
                      user_level: 2
                    }
                  })
                  if (findUser) {
                    const findNotif = await notif.findOne({
                      where: {
                        response: 'revisi',
                        [Op.and]: [
                          { no_proses: no },
                          { keterangan: 'tax' }
                        ]
                      }
                    })
                    if (findNotif) {
                      const data = {
                        list_appr: findUser.username,
                        keterangan: level === 3 ? 'tax' : 'finance',
                        response: 'request'
                      }
                      const createNotif = await findNotif.update(data)
                      if (createNotif) {
                        const tableTd = `
                        <tr>
                          <td>1</td>
                          <td>D${result.no_disposal}</td>
                          <td>${result.no_asset}</td>
                          <td>${result.nama_asset}</td>
                          <td>${result.cost_center}</td>
                          <td>${result.area}</td>
                        </tr>`
                        const mailOptions = {
                          from: 'noreply_asset@pinusmerahabadi.co.id',
                          replyTo: 'noreply_asset@pinusmerahabadi.co.id',
                          // to: `${findEmail.email_staff_asset1}, ${findEmail.email_staff_asset2}`,
                          to: `${emailAss}, ${emailAss2}`,
                          // cc: result.kategori === 'IT' || result.kategori === 'it' ? `${ccTaxIt}` : `${ccTax}`,
                          subject: `REVISI FAKTUR PAJAK DISPOSAL ASSET ${result.area} `,
                          html: `
                        <head>
                          <style type="text/css">
                          body {
                              display: flexbox;
                              flex-direction: column;
                          }
                          .tittle {
                              font-size: 15px;
                          }
                          .mar {
                              margin-bottom: 20px;
                          }
                          .mar1 {
                              margin-bottom: 10px;
                          }
                          .foot {
                              margin-top: 20px;
                              margin-bottom: 10px;
                          }
                          .foot1 {
                              margin-bottom: 50px;
                          }
                          .position {
                              display: flexbox;
                              flex-direction: row;
                              justify-content: left;
                              margin-top: 10px;
                          }
                          table {
                              font-family: "Lucida Sans Unicode", "Lucida Grande", "Segoe Ui";
                              font-size: 12px;
                          }
                          .demo-table {
                              border-collapse: collapse;
                              font-size: 13px;
                          }
                          .demo-table th, 
                          .demo-table td {
                              border-bottom: 1px solid #e1edff;
                              border-left: 1px solid #e1edff;
                              padding: 7px 17px;
                          }
                          .demo-table th, 
                          .demo-table td:last-child {
                              border-right: 1px solid #e1edff;
                          }
                          .demo-table td:first-child {
                              border-top: 1px solid #e1edff;
                          }
                          .demo-table td:last-child{
                              border-bottom: 0;
                          }
                          caption {
                              caption-side: top;
                              margin-bottom: 10px;
                          }
                          
                          /* Table Header */
                          .demo-table thead th {
                              background-color: #508abb;
                              color: #FFFFFF;
                              border-color: #6ea1cc !important;
                              text-transform: uppercase;
                          }
                          
                          /* Table Body */
                          .demo-table tbody td {
                              color: #353535;
                          }
                          
                          .demo-table tbody tr:nth-child(odd) td {
                              background-color: #f4fbff;
                          }
                          .demo-table tbody tr:hover th,
                          .demo-table tbody tr:hover td {
                              background-color: #ffffa2;
                              border-color: #ffff0f;
                              transition: all .2s;
                          }
                      </style>
                        </head>
                        <body>
                            <div class="tittle mar">
                                Dear Bapak/Ibu,
                            </div>
                            <div class="tittle mar1">
                                <div>Mohon untuk cek hasil revisi lampiran faktur pajak dibawah ini:</div>
                            </div>
                            <div class="position mar1">
                                <table class="demo-table">
                                    <thead>
                                        <tr>
                                            <th>No</th>
                                            <th>No Disposal</th>
                                            <th>Asset</th>
                                            <th>Asset description</th>
                                            <th>Cost Ctr</th>
                                            <th>Cost Ctr Name</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                      ${tableTd}
                                    </tbody>
                                </table>
                            </div>
                            <a href="http://aset.pinusmerahabadi.co.id/">Klik link berikut untuk akses web asset</a>
                            <div class="tittle foot">
                                Terima kasih,
                            </div>
                            <div class="tittle foot1">
                                Regards,
                            </div>
                            <div class="tittle">
                                Team Tax 
                            </div>
                        </body>
                        `
                        }
                        const sendEmail = await wrapMail.wrapedSendMail(mailOptions)
                        if (sendEmail) {
                          return response(res, 'success submit taxfin disposal', { sendEmail, findDoc, cek })
                        } else {
                          return response(res, 'berhasil submit taxfin disposal, tidak berhasil kirim notif email 1', { sendEmail, findDoc, cek })
                        }
                      }
                    }
                  }
                } else {
                  return response(res, 'failed submit tax and finance', {}, 404, false)
                }
              } else {
                return response(res, 'revisi dokumen terlebih dahulu', {}, 404, false)
              }
            } else {
              return response(res, 'revisi dokumen terlebih dahulu', {}, 404, false)
            }
          } else if (result.no_io === 'taxfin' && level === 4) {
            const findDoc = await docUser.findAll({
              where: {
                no_pengadaan: result.no_asset,
                [Op.and]: [
                  { jenis_form: 'disposal' },
                  { tipe: 'finance' }
                ]
              }
            })
            if (findDoc.length > 0) {
              const cek = []
              for (let i = 0; i < findDoc.length; i++) {
                if (findDoc[i].divisi !== '0') {
                  cek.push(1)
                }
              }
              if (cek.length === findDoc.length) {
                const data = {
                  status_form: 7,
                  no_io: 'tax'
                }
                const sent = await result.update(data)
                if (sent) {
                  const findUser = await user.findOne({
                    where: {
                      user_level: 2
                    }
                  })
                  if (findUser) {
                    const findNotif = await notif.findOne({
                      where: {
                        response: 'revisi',
                        [Op.and]: [
                          { no_proses: no },
                          { keterangan: 'finance' }
                        ]
                      }
                    })
                    if (findNotif) {
                      const data = {
                        list_appr: findUser.username,
                        keterangan: level === 3 ? 'tax' : 'finance',
                        response: 'request'
                      }
                      const createNotif = await findNotif.update(data)
                      if (createNotif) {
                        const tableTd = `
                        <tr>
                          <td>1</td>
                          <td>D${result.no_disposal}</td>
                          <td>${result.no_asset}</td>
                          <td>${result.nama_asset}</td>
                          <td>${result.cost_center}</td>
                          <td>${result.area}</td>
                        </tr>`
                        const mailOptions = {
                          from: 'noreply_asset@pinusmerahabadi.co.id',
                          replyTo: 'noreply_asset@pinusmerahabadi.co.id',
                          // to: `${findEmail.email_staff_asset1}, ${findEmail.email_staff_asset2}`,
                          to: `${emailAss}, ${emailAss2}`,
                          // cc: result.kategori === 'IT' || result.kategori === 'it' ? `${ccFinIt}` : `${ccFin}`,
                          subject: `REVISI JURNAL UANG MASUK DISPOSAL ASSET ${result.area} `,
                          html: `
                        <head>
                          <style type="text/css">
                          body {
                              display: flexbox;
                              flex-direction: column;
                          }
                          .tittle {
                              font-size: 15px;
                          }
                          .mar {
                              margin-bottom: 20px;
                          }
                          .mar1 {
                              margin-bottom: 10px;
                          }
                          .foot {
                              margin-top: 20px;
                              margin-bottom: 10px;
                          }
                          .foot1 {
                              margin-bottom: 50px;
                          }
                          .position {
                              display: flexbox;
                              flex-direction: row;
                              justify-content: left;
                              margin-top: 10px;
                          }
                          table {
                              font-family: "Lucida Sans Unicode", "Lucida Grande", "Segoe Ui";
                              font-size: 12px;
                          }
                          .demo-table {
                              border-collapse: collapse;
                              font-size: 13px;
                          }
                          .demo-table th, 
                          .demo-table td {
                              border-bottom: 1px solid #e1edff;
                              border-left: 1px solid #e1edff;
                              padding: 7px 17px;
                          }
                          .demo-table th, 
                          .demo-table td:last-child {
                              border-right: 1px solid #e1edff;
                          }
                          .demo-table td:first-child {
                              border-top: 1px solid #e1edff;
                          }
                          .demo-table td:last-child{
                              border-bottom: 0;
                          }
                          caption {
                              caption-side: top;
                              margin-bottom: 10px;
                          }
                          
                          /* Table Header */
                          .demo-table thead th {
                              background-color: #508abb;
                              color: #FFFFFF;
                              border-color: #6ea1cc !important;
                              text-transform: uppercase;
                          }
                          
                          /* Table Body */
                          .demo-table tbody td {
                              color: #353535;
                          }
                          
                          .demo-table tbody tr:nth-child(odd) td {
                              background-color: #f4fbff;
                          }
                          .demo-table tbody tr:hover th,
                          .demo-table tbody tr:hover td {
                              background-color: #ffffa2;
                              border-color: #ffff0f;
                              transition: all .2s;
                          }
                      </style>
                        </head>
                        <body>
                            <div class="tittle mar">
                                Dear Bapak/Ibu,
                            </div>
                            <div class="tittle mar1">
                                <div>Mohon untuk cek hasil revisi lampiran jurnal uang masuk dibawah ini:</div>
                            </div>
                            <div class="position mar1">
                                <table class="demo-table">
                                    <thead>
                                        <tr>
                                            <th>No</th>
                                            <th>No Disposal</th>
                                            <th>Asset</th>
                                            <th>Asset description</th>
                                            <th>Cost Ctr</th>
                                            <th>Cost Ctr Name</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                      ${tableTd}
                                    </tbody>
                                </table>
                            </div>
                            <a href="http://aset.pinusmerahabadi.co.id/">Klik link berikut untuk akses web asset</a>
                            <div class="tittle foot">
                                Terima kasih,
                            </div>
                            <div class="tittle foot1">
                                Regards,
                            </div>
                            <div class="tittle">
                              Team Finance 
                            </div>
                        </body>
                        `
                        }
                        const sendEmail = await wrapMail.wrapedSendMail(mailOptions)
                        if (sendEmail) {
                          return response(res, 'success submit tax and finance disposal', { sendEmail, findDoc, cek })
                        } else {
                          return response(res, 'berhasil submit tax and finance disposal, tidak berhasil kirim notif email 1', { sendEmail, findDoc, cek })
                        }
                      }
                    }
                  }
                } else {
                  return response(res, 'failed submit tax and finance', {}, 404, false)
                }
              } else {
                return response(res, 'revisi dokumen terlebih dahulu', {}, 404, false)
              }
            } else {
              return response(res, 'revisi dokumen terlebih dahulu', {}, 404, false)
            }
          } else {
            const findDoc = await docUser.findAll({
              where: {
                no_pengadaan: result.no_asset,
                [Op.and]: [
                  { jenis_form: 'disposal' },
                  { tipe: level === 3 ? 'tax' : 'finance' }
                ]
              }
            })
            if (findDoc.length > 0) {
              const cek = []
              for (let i = 0; i < findDoc.length; i++) {
                if (findDoc[i].divisi !== '0') {
                  cek.push(1)
                }
              }
              if (cek.length === findDoc.length) {
                const data = {
                  status_form: 7,
                  no_io: null
                }
                const sent = await result.update(data)
                if (sent) {
                  const findUser = await user.findOne({
                    where: {
                      user_level: 2
                    }
                  })
                  if (findUser) {
                    const findNotif = await notif.findOne({
                      where: {
                        response: 'revisi',
                        [Op.and]: [
                          { no_proses: no },
                          { keterangan: level === 3 ? 'tax' : 'finance' }
                        ]
                      }
                    })
                    if (findNotif) {
                      const data = {
                        list_appr: findUser.username,
                        keterangan: level === 3 ? 'tax' : 'finance',
                        response: 'request'
                      }
                      const createNotif = await findNotif.update(data)
                      if (createNotif) {
                        const tableTd = `
                        <tr>
                          <td>1</td>
                          <td>D${result.no_disposal}</td>
                          <td>${result.no_asset}</td>
                          <td>${result.nama_asset}</td>
                          <td>${result.cost_center}</td>
                          <td>${result.area}</td>
                        </tr>`
                        const mailOptions = {
                          from: 'noreply_asset@pinusmerahabadi.co.id',
                          replyTo: 'noreply_asset@pinusmerahabadi.co.id',
                          to: `${emailAss}, ${emailAss2}`,
                          // to: `${findEmail.email_staff_asset1}, ${findEmail.email_staff_asset2}`,
                          // cc: (level === 3 && result.kategori === 'IT') || (level === 3 && result.kategori === 'it') ? `${ccTaxIt}` : (level === 4 && result.kategori === 'IT') || (level === 4 && result.kategori === 'it') ? `${ccFinIt}` : (level === 3 && result.kategori !== 'IT') || (level === 3 && result.kategori !== 'it') ? `${ccTax}` : (level === 4 && result.kategori !== 'IT') || (level === 4 && result.kategori !== 'it') ? `${ccFin}` : '',
                          subject: `REVISI ${level === 3 ? 'FAKTUR PAJAK' : 'JURNAL UANG MASUK'} DISPOSAL ASSET ${result.area} `,
                          html: `
                        <head>
                          <style type="text/css">
                          body {
                              display: flexbox;
                              flex-direction: column;
                          }
                          .tittle {
                              font-size: 15px;
                          }
                          .mar {
                              margin-bottom: 20px;
                          }
                          .mar1 {
                              margin-bottom: 10px;
                          }
                          .foot {
                              margin-top: 20px;
                              margin-bottom: 10px;
                          }
                          .foot1 {
                              margin-bottom: 50px;
                          }
                          .position {
                              display: flexbox;
                              flex-direction: row;
                              justify-content: left;
                              margin-top: 10px;
                          }
                          table {
                              font-family: "Lucida Sans Unicode", "Lucida Grande", "Segoe Ui";
                              font-size: 12px;
                          }
                          .demo-table {
                              border-collapse: collapse;
                              font-size: 13px;
                          }
                          .demo-table th, 
                          .demo-table td {
                              border-bottom: 1px solid #e1edff;
                              border-left: 1px solid #e1edff;
                              padding: 7px 17px;
                          }
                          .demo-table th, 
                          .demo-table td:last-child {
                              border-right: 1px solid #e1edff;
                          }
                          .demo-table td:first-child {
                              border-top: 1px solid #e1edff;
                          }
                          .demo-table td:last-child{
                              border-bottom: 0;
                          }
                          caption {
                              caption-side: top;
                              margin-bottom: 10px;
                          }
                          
                          /* Table Header */
                          .demo-table thead th {
                              background-color: #508abb;
                              color: #FFFFFF;
                              border-color: #6ea1cc !important;
                              text-transform: uppercase;
                          }
                          
                          /* Table Body */
                          .demo-table tbody td {
                              color: #353535;
                          }
                          
                          .demo-table tbody tr:nth-child(odd) td {
                              background-color: #f4fbff;
                          }
                          .demo-table tbody tr:hover th,
                          .demo-table tbody tr:hover td {
                              background-color: #ffffa2;
                              border-color: #ffff0f;
                              transition: all .2s;
                          }
                      </style>
                        </head>
                        <body>
                            <div class="tittle mar">
                                Dear Bapak/Ibu,
                            </div>
                            <div class="tittle mar1">
                                <div>Mohon untuk cek hasil revisi ${level === 3 ? 'lampiran faktur pajak' : 'lampiran jurnal uang masuk'} dibawah ini:</div>
                            </div>
                            <div class="position mar1">
                                <table class="demo-table">
                                    <thead>
                                        <tr>
                                            <th>No</th>
                                            <th>No Disposal</th>
                                            <th>Asset</th>
                                            <th>Asset description</th>
                                            <th>Cost Ctr</th>
                                            <th>Cost Ctr Name</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                      ${tableTd}
                                    </tbody>
                                </table>
                            </div>
                            <a href="http://aset.pinusmerahabadi.co.id/">Klik link berikut untuk akses web asset</a>
                            <div class="tittle foot">
                                Terima kasih,
                            </div>
                            <div class="tittle foot1">
                                Regards,
                            </div>
                            <div class="tittle">
                                ${level === 3 ? 'Team Tax' : 'Team Finance'}
                            </div>
                        </body>
                        `
                        }
                        const sendEmail = await wrapMail.wrapedSendMail(mailOptions)
                        if (sendEmail) {
                          return response(res, 'success submit tax and finance disposal', { sendEmail, findDoc, cek })
                        } else {
                          return response(res, 'berhasil submit tax and finance disposal, tidak berhasil kirim notif email 1', { sendEmail, findDoc, cek })
                        }
                      }
                    }
                  }
                } else {
                  return response(res, 'failed submit tax and finance', {}, 404, false)
                }
              } else {
                return response(res, 'revisi dokumen terlebih dahulu', {}, 404, false)
              }
            } else {
              return response(res, 'failed submit tax and finance', {}, 404, false)
            }
          }
        } else {
          return response(res, 'failed submit tax and finance', {}, 404, false)
        }
      } else {
        return response(res, 'failed submit tax and finance', {}, 404, false)
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  getApproveSetDisposal: async (req, res) => {
    try {
      const no = req.params.no
      const { nama } = req.query
      const result = await ttd.findAll({
        where: {
          no_set: no
        }
      })
      if (result.length > 0) {
        const penyetuju = []
        const pembuat = []
        for (let i = 0; i < result.length; i++) {
          if (result[i].sebagai === 'pembuat') {
            pembuat.push(result[i])
          } else if (result[i].sebagai === 'penyetuju') {
            penyetuju.push(result[i])
          }
        }
        return response(res, 'success get template approve', { result: { pembuat, penyetuju } })
      } else {
        const result = await disposal.findAll({
          where: {
            no_persetujuan: no
          }
        })
        if (result) {
          const getApp = await approve.findAll({
            where: {
              nama_approve: nama
            }
          })
          if (getApp) {
            const hasil = []
            for (let i = 0; i < getApp.length; i++) {
              const send = {
                jabatan: getApp[i].jabatan === '' || getApp[i].jabatan === null ? null : getApp[i].jabatan,
                jenis: getApp[i].jenis === '' || getApp[i].jenis === null ? null : getApp[i].jenis,
                sebagai: getApp[i].sebagai === '' || getApp[i].sebagai === null ? null : getApp[i].sebagai,
                kategori: null,
                no_set: no
              }
              const make = await ttd.create(send)
              if (make) {
                hasil.push(make)
              }
            }
            if (hasil.length === getApp.length) {
              const result = await ttd.findAll({
                where: {
                  no_set: no
                }
              })
              if (result.length > 0) {
                const penyetuju = []
                const pembuat = []
                for (let i = 0; i < result.length; i++) {
                  if (result[i].sebagai === 'pembuat') {
                    pembuat.push(result[i])
                  } else if (result[i].sebagai === 'penyetuju') {
                    penyetuju.push(result[i])
                  }
                }
                return response(res, 'success get template approve', { result: { pembuat, penyetuju } })
              } else {
                return response(res, 'failed get data approve', {}, 404, false)
              }
            } else {
              return response(res, 'failed get data approve', {}, 404, false)
            }
          } else {
            return response(res, 'failed get data approve', {}, 404, false)
          }
        } else {
          return response(res, 'failed get data approve', {}, 404, false)
        }
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  approveSetDisposal: async (req, res) => {
    try {
      const level = req.user.level
      const name = req.user.name
      const no = req.params.no
      if (level === 22 || level === 23 || level === 25) {
        uploadHelper(req, res, async function (err) {
          if (err instanceof multer.MulterError) {
            if (err.code === 'LIMIT_UNEXPECTED_FILE' && req.files.length === 0) {
              console.log(err.code === 'LIMIT_UNEXPECTED_FILE' && req.files.length > 0)
              return response(res, 'fieldname doesnt match', {}, 500, false)
            }
            return response(res, err.message, {}, 500, false)
          } else if (err) {
            return response(res, err.message, {}, 401, false)
          } else {
            console.log(req.file)
            console.log(req.file.filename)
            const dokumen = `uploads/${req.file.filename}`
            const findTtd = await ttd.findAll({
              where: {
                no_set: no
              }
            })
            if (findTtd[1].status === 1) {
              const result = await role.findAll({
                where: {
                  [Op.or]: [
                    { nomor: 22 },
                    { nomor: 23 },
                    { nomor: 25 }
                  ]
                }
              })
              if (result.length > 0) {
                const cek = []
                for (let i = 0; i < result.length; i++) {
                  const findUser = await user.findOne({
                    where: {
                      user_level: result[i].nomor
                    }
                  })
                  if (findUser) {
                    const data = {
                      nama: findUser.username,
                      status: 1,
                      path: dokumen
                    }
                    const find = await ttd.findOne({
                      where: {
                        [Op.and]: [
                          { no_set: no },
                          { jabatan: result[i].name }
                        ]
                      }
                    })
                    if (find) {
                      await find.update(data)
                      cek.push(1)
                    }
                  }
                }
                if (cek.length > 0) {
                  const findDoc = await disposal.findAll({
                    where: {
                      no_persetujuan: no
                    }
                  })
                  if (findDoc.length > 0) {
                    const data = {
                      status_form: 4
                    }
                    const valid = []
                    for (let i = 0; i < findDoc.length; i++) {
                      const findAsset = await disposal.findByPk(findDoc[i].id)
                      if (findAsset) {
                        await findAsset.update(data)
                        valid.push(findAsset.kode_plant)
                      }
                    }
                    if (valid.length > 0) {
                      const set = new Set(valid)
                      const noDis = [...set]
                      const cekEmail = []
                      for (let i = 0; i < noDis.length; i++) {
                        const findEmail = await email.findOne({
                          where: {
                            kode_plant: noDis[i]
                          }
                        })
                        if (findEmail) {
                          const findDis = await disposal.findAll({
                            where: {
                              [Op.and]: [
                                { kode_plant: noDis[i] },
                                { no_persetujuan: no }
                              ]
                            }
                          })
                          if (findDis.length > 0) {
                            // const data = {
                            //   list_appr: noDis[i],
                            //   response: 'full'
                            // }
                            // const findNotif = await notif.findOne({
                            //   where: {
                            //     [Op.and]: [
                            //       { no_proses: 'D' + findDis[0].no_disposal },
                            //       { kode_plant: noDis[i] }
                            //     ]
                            //   }
                            // })
                            // if (findNotif) {
                            // const createNotif = await findNotif.update(data)
                            // if (createNotif) {
                            let tableTd = ''
                            for (let i = 0; i < findDis.length; i++) {
                              const element = `
                                    <tr>
                                      <td>${findDis.indexOf(findDis[i]) + 1}</td>
                                      <td>D${findDis[i].no_disposal}</td>
                                      <td>${findDis[i].no_asset}</td>
                                      <td>${findDis[i].nama_asset}</td>
                                      <td>${findDis[i].cost_center}</td>
                                      <td>${findDis[i].area}</td>
                                    </tr>`
                              tableTd = tableTd + element
                            }
                            const ccIt = [findEmail.email_am, findEmail.email_aam, findEmail.email_spv_asset, findEmail.email_staff_asset1, findEmail.email_staff_asset2, findEmail.email_nom, findEmail.email_bm, findEmail.email_area_om, findEmail.email_it_spv, findEmail.email_ism, findEmail.email_staff_it, findEmail.email_ga_spv, findEmail.email_staff_ga]
                            const cc = [findEmail.email_am, findEmail.email_aam, findEmail.email_spv_asset, findEmail.email_staff_asset1, findEmail.email_staff_asset2, findEmail.email_nom, findEmail.email_bm, findEmail.email_area_om, findEmail.email_ga_spv, findEmail.email_staff_ga]
                            const mailOptions = {
                              from: 'noreply_asset@pinusmerahabadi.co.id',
                              replyTo: 'noreply_asset@pinusmerahabadi.co.id',
                              // to: `${findEmail.email_area_aos}`,
                              to: `${emailAss}, ${emailAss2}`,
                              // cc: findDis.find(({ kategori }) => kategori === 'IT') === undefined && findDis.find(({ kategori }) => kategori === 'it') === undefined ? `${cc}` : `${ccIt}`,
                              subject: `DISPOSAL ASSET ${findDis[0].area} `,
                              html: `
                                    <head>
                                    <style type="text/css">
                                    body {
                                        display: flexbox;
                                        flex-direction: column;
                                    }
                                    .tittle {
                                      font-size: 15px;
                                      font-family: 'Gill Sans', 'Gill Sans MT', Calibri, 'Trebuchet MS', sans-serif;
                                    }
                                    .textItalic {
                                      font-style: italic;
                                      font-weight: bold;
                                      font-size: 15px;
                                      font-family: 'Gill Sans', 'Gill Sans MT', Calibri, 'Trebuchet MS', sans-serif;
                                      margin-top: 10px;
                                    }
                                    .tittleBold {
                                      font-weight: bold;
                                      font-size: 15px;
                                      font-family: 'Gill Sans', 'Gill Sans MT', Calibri, 'Trebuchet MS', sans-serif;
                                      margin-top: 10px;
                                    }
                                    .mar {
                                        margin-bottom: 20px;
                                    }
                                    .mar1 {
                                        margin-bottom: 10px;
                                    }
                                    .mar2 {
                                      margin-top: 10px;
                                    }
                                    .foot {
                                        font-size: 15px;
                                        font-family: 'Gill Sans', 'Gill Sans MT', Calibri, 'Trebuchet MS', sans-serif;
                                        margin-top: 20px;
                                        margin-bottom: 10px;
                                    }
                                    .foot1 {
                                        font-size: 15px;
                                        font-family: 'Gill Sans', 'Gill Sans MT', Calibri, 'Trebuchet MS', sans-serif;
                                        margin-bottom: 50px;
                                    }
                                    .position {
                                        display: flexbox;
                                        flex-direction: row;
                                        justify-content: left;
                                        margin-top: 10px;
                                        margin-bottom: 10px;
                                    }
                                    table {
                                        font-family: "Lucida Sans Unicode", "Lucida Grande", "Segoe Ui";
                                        font-size: 12px;
                                    }
                                    .demo-table {
                                        border-collapse: collapse;
                                        font-size: 13px;
                                    }
                                    .demo-table th, 
                                    .demo-table td {
                                        border-bottom: 1px solid #e1edff;
                                        border-left: 1px solid #e1edff;
                                        padding: 7px 17px;
                                    }
                                    .demo-table th, 
                                    .demo-table td:last-child {
                                        border-right: 1px solid #e1edff;
                                    }
                                    .demo-table td:first-child {
                                        border-top: 1px solid #e1edff;
                                    }
                                    .demo-table td:last-child{
                                        border-bottom: 0;
                                    }
                                    caption {
                                        caption-side: top;
                                        margin-bottom: 10px;
                                    }
                                    
                                    /* Table Header */
                                    .demo-table thead th {
                                        background-color: #508abb;
                                        color: #FFFFFF;
                                        border-color: #6ea1cc !important;
                                        text-transform: uppercase;
                                    }
                                    
                                    /* Table Body */
                                    .demo-table tbody td {
                                        color: #353535;
                                    }
                                    
                                    .demo-table tbody tr:nth-child(odd) td {
                                        background-color: #f4fbff;
                                    }
                                    .demo-table tbody tr:hover th
                                    .demo-table tbody tr:hover td {
                                        background-color: #ffffa2;
                                        border-color: #ffff0f;
                                        transition: all .2s;
                                    }
                                    .textUnder {
                                        text-decoration: underline;
                                        font-weight: bold;
                                    }
                                </style>
                                  </head>
                                  <body>
                                      <div class="tittle mar">
                                          Dear Bapak/Ibu AOS,
                                      </div>
                                      <div class="tittle mar1">
                                          <div class="tittle">Berikut list aset disposal yang sudah full approved, mohon segera dieksekusi.</div>
                                      </div>
                                      <div class="position mar1">
                                          <table class="demo-table">
                                              <thead>
                                                  <tr>
                                                      <th>No</th>
                                                      <th>No Disposal</th>
                                                      <th>Asset</th>
                                                      <th>Asset description</th>
                                                      <th>Cost Ctr</th>
                                                      <th>Cost Ctr Name</th>
                                                  </tr>
                                              </thead>
                                              <tbody>
                                                  ${tableTd}
                                              </tbody>
                                          </table>
                                      </div>
                                      <div class="tittle">Lengkapi dokumen eksekusi sbb:</div>
                                      <div></div>
                                      <div class="tittleBold">A. Penjualan Aset:</div>
                                      <div class="tittle">1. Kwitansi </div>
                                      <div class="tittle">2. Bukti Transfer</div>
                                      <div class="tittle">3. BAST penjualan aset (link download : https://pinusmerahabadi.co.id/portal)</div>
                                      <div class="tittle">4. Dokumentasi serah terima uang dan aset</div>
                                      <div class="tittle">5. Scan/copyan NPWP pembeli aset (Jika Ada)</div>
                                      <div class="tittle">6. Document eksekusi discan dan diupload ke web aset</div>
                                      <div class="tittle">7. Uang hasil penjualan aset maksimal di transfer ke rek HO H+1 (wajib cantumkan di berita transaksi/keterangan penjualan aset+nama area). Transfer ke No.rek : 130.007.611.2112</div>
                                      <div class="tittle">8. Ketika aset sudah dijual mohon segera diinformasikan ke tim aset, karena ada kaitannya dengan faktur pajak yang harus HO terbitkan ditanggal yang sama saat transaksi.</div>
                                      <div class="tittle">9. Document asli point 1-5 dikirim ke HO Bandung UP Rifaldi / Neng Rina / Ervyanty (Accounting Asset) PT. Pinus Merah Abadi (HO Bandung). Jl. Soekarno Hatta No. 112, Bandung, Jawa Barat - 40235.</div>
                                      <div></div>
                                      <div class="tittleBold">B. Pemusnahan Aset:</div>
                                      <div class="tittle">1. BA pemusnahan aset dan lampiran foto pemusnahan (link download : https://pinusmerahabadi.co.id/portal)</div>
                                      <div class="tittle">2. Document eksekusi discan dan diupload ke web aset</div>
                                      <div></div>
                                      <div class="textItalic">NOTE:</div>
                                      <div class="tittle">A. Aset yang sudah  diperbolehkan untuk dieksekusi maka segera eksekusi (maksimal 1 minggu dari tanggal email)</div>
                                      <div class="tittle">B. Jika aset sudah dijual/dimusnahkan area harap melengkapi semua dokumen yang di request aset (tanpa kekurangan apapun) jika belum mengerti dapat bertanya ke PIC aset</div>
                                      <div class="mar2"></div>
                                      <a href="http://aset.pinusmerahabadi.co.id/">Klik link berikut untuk akses web asset</a>
                                      <div class="tittle foot">
                                          Terima kasih,
                                      </div>
                                      <div class="tittle foot1">
                                          Regards,
                                      </div>
                                      <div class="tittle">
                                          Team Asset
                                      </div>
                                  </body>
                                    `
                            }
                            const sendEmail = await wrapMail.wrapedSendMail(mailOptions)
                            if (sendEmail) {
                              cekEmail.push('success send email')
                            } else {
                              cekEmail.push('failed send email')
                            }
                            // }
                            // }
                          }
                        }
                      }
                      if (cekEmail.length === noDis.length) {
                        return response(res, 'success approve disposal', { cekEmail, noDis })
                      } else {
                        return response(res, 'success approve fail send email', { cekEmail, noDis })
                      }
                    }
                  } else {
                    return response(res, 'success approve fail send email')
                  }
                } else {
                  return response(res, 'failed approve disposal', {}, 404, false)
                }
              } else {
                return response(res, 'failed approve disposal', {}, 404, false)
              }
            } else {
              return response(res, `${findTtd[1].jabatan} belum approve atau telah mereject`, {}, 404, false)
            }
          }
        })
      } else {
        const result = await role.findAll({
          where: {
            nomor: level
          }
        })
        if (result.length > 0) {
          const find = await ttd.findAll({
            where: {
              no_set: no
            }
          })
          if (find.length > 0) {
            let hasil = 0
            let arr = null
            for (let i = 0; i < find.length; i++) {
              if (result[0].name === find[i].jabatan) {
                hasil = find[i].id
                arr = i
              }
            }
            if (hasil !== 0) {
              if (arr !== find.length - 1 && (find[arr + 1].status !== null || find[arr + 1].status === 1 || find[arr + 1].status === 0)) {
                return response(res, 'Anda tidak memiliki akses lagi untuk mengapprove', {}, 404, false)
              } else {
                if (arr === 0 || find[arr - 1].status === 1) {
                  const data = {
                    nama: name,
                    status: 1,
                    path: null
                  }
                  const findTtd = await ttd.findByPk(hasil)
                  if (findTtd) {
                    const sent = await findTtd.update(data)
                    if (sent) {
                      const results = await ttd.findAll({
                        where: {
                          [Op.and]: [
                            { no_set: no },
                            { status: 1 }
                          ]
                        }
                      })
                      if (results.length) {
                        const findDoc = await disposal.findAll({
                          where: {
                            no_persetujuan: no
                          }
                        })
                        if (findDoc.length > 0) {
                          const findRole = await role.findAll({
                            where: {
                              name: find[arr + 1].jabatan
                            }
                          })
                          if (findRole.length > 0) {
                            const findDis = await disposal.findAll({
                              where: {
                                no_persetujuan: no
                              }
                            })
                            if (findDis.length > 0) {
                              const findUser = await user.findOne({
                                where: {
                                  user_level: findRole[0].nomor
                                }
                              })
                              if (findUser) {
                                const data = {
                                  list_appr: findUser.username
                                }
                                const findNotif = await notif.findOne({
                                  where: {
                                    keterangan: 'persetujuan',
                                    [Op.and]: [
                                      { no_proses: no },
                                      { jenis: 'disposal' }
                                    ]
                                  }
                                })
                                if (findNotif) {
                                  const createNotif = await findNotif.update(data)
                                  if (createNotif) {
                                    let tableTd = ''
                                    for (let i = 0; i < findDis.length; i++) {
                                      const element = `
                                        <tr>
                                          <td>${findDis.indexOf(findDis[i]) + 1}</td>
                                          <td>${findDis[i].no_persetujuan}</td>
                                          <td>${findDis[i].no_asset}</td>
                                          <td>${findDis[i].nama_asset}</td>
                                          <td>${findDis[i].cost_center}</td>
                                          <td>${findDis[i].area}</td>
                                        </tr>`
                                      tableTd = tableTd + element
                                    }
                                    const mailOptions = {
                                      from: 'noreply_asset@pinusmerahabadi.co.id',
                                      replyTo: 'noreply_asset@pinusmerahabadi.co.id',
                                      // to: `${findUser.email}`,
                                      to: `${emailAss}, ${emailAss2}`,
                                      subject: `Approve Persetujuan Disposal ${no} `,
                                      html: `
                                      <head>
                                        <style type="text/css">
                                        body {
                                            display: flexbox;
                                            flex-direction: column;
                                        }
                                        .tittle {
                                            font-size: 15px;
                                        }
                                        .mar {
                                            margin-bottom: 20px;
                                        }
                                        .mar1 {
                                            margin-bottom: 10px;
                                        }
                                        .foot {
                                            margin-top: 20px;
                                            margin-bottom: 10px;
                                        }
                                        .foot1 {
                                            margin-bottom: 50px;
                                        }
                                        .position {
                                            display: flexbox;
                                            flex-direction: row;
                                            justify-content: left;
                                            margin-top: 10px;
                                        }
                                        table {
                                            font-family: "Lucida Sans Unicode", "Lucida Grande", "Segoe Ui";
                                            font-size: 12px;
                                        }
                                        .demo-table {
                                            border-collapse: collapse;
                                            font-size: 13px;
                                        }
                                        .demo-table th, 
                                        .demo-table td {
                                            border-bottom: 1px solid #e1edff;
                                            border-left: 1px solid #e1edff;
                                            padding: 7px 17px;
                                        }
                                        .demo-table th, 
                                        .demo-table td:last-child {
                                            border-right: 1px solid #e1edff;
                                        }
                                        .demo-table td:first-child {
                                            border-top: 1px solid #e1edff;
                                        }
                                        .demo-table td:last-child{
                                            border-bottom: 0;
                                        }
                                        caption {
                                            caption-side: top;
                                            margin-bottom: 10px;
                                        }
                                        
                                        /* Table Header */
                                        .demo-table thead th {
                                            background-color: #508abb;
                                            color: #FFFFFF;
                                            border-color: #6ea1cc !important;
                                            text-transform: uppercase;
                                        }
                                        
                                        /* Table Body */
                                        .demo-table tbody td {
                                            color: #353535;
                                        }
                                        
                                        .demo-table tbody tr:nth-child(odd) td {
                                            background-color: #f4fbff;
                                        }
                                        .demo-table tbody tr:hover th,
                                        .demo-table tbody tr:hover td {
                                            background-color: #ffffa2;
                                            border-color: #ffff0f;
                                            transition: all .2s;
                                        }
                                    </style>
                                      </head>
                                      <body>
                                          <div class="tittle mar">
                                              Dear Bapak/Ibu ${find[arr + 1].jabatan},
                                          </div>
                                          <div class="tittle mar1">
                                              <div>Mohon untuk approve persetujuan disposal asset area.</div>
                                          </div>
                                          <div class="position">
                                              <table class="demo-table">
                                                  <thead>
                                                      <tr>
                                                          <th>No</th>
                                                          <th>No Persetujuan Disposal</th>
                                                          <th>Asset</th>
                                                          <th>Asset description</th>
                                                          <th>Cost Ctr</th>
                                                          <th>Cost Ctr Name</th>
                                                      </tr>
                                                  </thead>
                                                  <tbody>
                                                    ${tableTd}
                                                  </tbody>
                                              </table>
                                          </div>
                                          <a href="http://aset.pinusmerahabadi.co.id/">Klik link berikut untuk akses web asset</a>
                                          <div class="tittle foot">
                                              Terima kasih,
                                          </div>
                                          <div class="tittle foot1">
                                              Regards,
                                          </div>
                                          <div class="tittle">
                                              Team Asset
                                          </div>                                      
                                      </body>
                                      `
                                    }
                                    const sendEmail = await wrapMail.wrapedSendMail(mailOptions)
                                    if (sendEmail) {
                                      return response(res, 'success approve disposal', { sendEmail })
                                    } else {
                                      return response(res, 'berhasil approve disposal, tidak berhasil kirim notif email 1')
                                    }
                                  }
                                }
                              } else {
                                return response(res, 'berhasil approve disposal, tidak berhasil kirim notif email 2')
                              }
                            } else {
                              return response(res, 'failed approve disposal', {}, 404, false)
                            }
                          }
                        }
                      }
                    } else {
                      return response(res, 'failed approve disposal', {}, 404, false)
                    }
                  } else {
                    return response(res, 'failed approve disposal', {}, 404, false)
                  }
                } else {
                  return response(res, `${find[arr - 1].jabatan} belum approve atau telah mereject`, {}, 404, false)
                }
              }
            } else {
              return response(res, 'failed approve disposal', {}, 404, false)
            }
          } else {
            return response(res, 'failed approve disposal', {}, 404, false)
          }
        } else {
          return response(res, 'failed approve disposal', {}, 404, false)
        }
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  rejectSetDisposal: async (req, res) => {
    try {
      const level = req.user.level
      const name = req.user.name
      const no = req.params.no
      const { tipe, status } = req.query
      const list = Object.values(req.body)
      const alasan = list[0]
      const result = await role.findAll({
        where: {
          nomor: level
        }
      })
      if (result.length > 0) {
        const find = await ttd.findAll({
          where: {
            no_set: no
          }
        })
        if (find.length > 0) {
          let hasil = 0
          let arr = null
          for (let i = 0; i < find.length; i++) {
            if (result[0].name === find[i].jabatan) {
              hasil = find[i].id
              arr = i
            }
          }
          if (hasil !== 0) {
            if (arr !== find.length - 1 && (find[arr + 1].status !== null || find[arr + 1].status === 1 || find[arr + 1].status === 0)) {
              return response(res, 'Anda tidak memiliki akses lagi untuk mengapprove', {}, 404, false)
            } else {
              if (arr === 0 || find[arr - 1].status === 1) {
                const data = {
                  nama: name,
                  status: 0,
                  path: alasan
                }
                const findTtd = await ttd.findByPk(hasil)
                if (findTtd) {
                  const sent = await findTtd.update(data)
                  if (tipe === 'batal') {
                    const findDis = await disposal.findAll({
                      where: {
                        no_persetujuan: no
                      }
                    })
                    if (findDis.length > 0) {
                      const cek = []
                      for (let i = 0; i < findDis.length; i++) {
                        const send = {
                          status: null
                        }
                        const data = {
                          status_form: 0,
                          status_reject: 0,
                          isreject: 0
                        }
                        const find = await disposal.findByPk(findDis[i].id)
                        const updateAsset = await asset.findOne({
                          where: {
                            no_asset: findDis[i].no_asset
                          }
                        })
                        if (find && updateAsset) {
                          await updateAsset.update(send)
                          await find.update(data)
                          cek.push(1)
                        }
                      }
                      if (cek.length === findDis.length) {
                        let draftEmail = ''
                        const draf = []
                        const listPlant = []
                        for (let i = 0; i < arr; i++) {
                          const result = await user.findOne({
                            where: {
                              username: find[i].nama
                            }
                          })
                          if (result) {
                            draf.push(result)
                            draftEmail += result.email + ', '
                          }
                        }
                        findDis.map(x => {
                          return (
                            listPlant.push(x.kode_plant)
                          )
                        })
                        const set = new Set(listPlant)
                        const noPlant = [...set]
                        for (let i = 0; i < noPlant.length; i++) {
                          const findEmail = await email.findOne({
                            where: {
                              kode_plant: noPlant[i]
                            }
                          })
                          if (findEmail) {
                            draf.push(findEmail)
                            draftEmail += findEmail.email_area_aos + ', '
                          }
                        }
                        if (draf.length > 0) {
                          const valid = []
                          for (let i = 0; i < find.length; i++) {
                            // const serFind = await ttd.findByPk(find[i].id)
                            // if (serFind) {
                            //   await serFind.destroy()
                            valid.push(1)
                            // }
                          }
                          if (valid.length > 0) {
                            const findApp = await ttd.findAll({
                              where: {
                                no_doc: findDis[0].no_disposal
                              }
                            })
                            if (findApp.length > 0) {
                              const cekTtd = []
                              for (let i = 0; i < findApp.length; i++) {
                                // const ttdOne = await ttd.findByPk(findApp[i].id)
                                // if (ttdOne) {
                                //   await ttdOne.destroy()
                                cekTtd.push(1)
                                // }
                              }
                              if (cekTtd.length > 0) {
                                const cekDok = []
                                for (let i = 0; i < findDis.length; i++) {
                                  const docFind = await docUser.findAll({
                                    where: {
                                      no_pengadaan: findDis[i].no_asset,
                                      [Op.and]: [
                                        { jenis_form: 'disposal' },
                                        {
                                          [Op.or]: [
                                            { tipe: 'pengajuan' },
                                            { tipe: 'jual' },
                                            { tipe: 'purch' }
                                          ]
                                        }
                                      ]
                                    }
                                  })
                                  if (docFind.length > 0) {
                                    for (let j = 0; j < docFind.length; j++) {
                                      const docOne = await docUser.findByPk(docFind[j].id)
                                      if (docOne) {
                                        await docOne.destroy()
                                        cekDok.push(1)
                                      }
                                    }
                                  }
                                }
                                if (cekDok.length > 0) {
                                  let tableTd = ''
                                  for (let i = 0; i < findDis.length; i++) {
                                    const element = `
                                        <tr>
                                          <td>${findDis.indexOf(findDis[i]) + 1}</td>
                                          <td>D${findDis[i].no_disposal}</td>
                                          <td>${findDis[i].no_asset}</td>
                                          <td>${findDis[i].nama_asset}</td>
                                          <td>${findDis[i].cost_center}</td>
                                          <td>${findDis[i].area}</td>
                                        </tr>`
                                    tableTd = tableTd + element
                                  }
                                  const mailOptions = {
                                    from: 'noreply_asset@pinusmerahabadi.co.id',
                                    replyTo: 'noreply_asset@pinusmerahabadi.co.id',
                                    // to: `${draftEmail}`,
                                    to: `${emailAss}, ${emailAss2}`,
                                    subject: 'Reject Pembatalan Form Persetujuan Disposal Asset ',
                                    html: `
                                        <head>
                                        <style type="text/css">
                                          body {
                                              display: flexbox;
                                              flex-direction: column;
                                          }
                                          .tittle {
                                              font-size: 15px;
                                          }
                                          .mar {
                                              margin-bottom: 20px;
                                          }
                                          .mar1 {
                                              margin-bottom: 10px;
                                          }
                                          .foot {
                                              margin-top: 20px;
                                              margin-bottom: 10px;
                                          }
                                          .foot1 {
                                              margin-bottom: 50px;
                                          }
                                          .position {
                                              display: flexbox;
                                              flex-direction: row;
                                              justify-content: left;
                                              margin-top: 10px;
                                          }
                                          table {
                                              font-family: "Lucida Sans Unicode", "Lucida Grande", "Segoe Ui";
                                              font-size: 12px;
                                          }
                                          .demo-table {
                                              border-collapse: collapse;
                                              font-size: 13px;
                                          }
                                          .demo-table th, 
                                          .demo-table td {
                                              border-bottom: 1px solid #e1edff;
                                              border-left: 1px solid #e1edff;
                                              padding: 7px 17px;
                                          }
                                          .demo-table th, 
                                          .demo-table td:last-child {
                                              border-right: 1px solid #e1edff;
                                          }
                                          .demo-table td:first-child {
                                              border-top: 1px solid #e1edff;
                                          }
                                          .demo-table td:last-child{
                                              border-bottom: 0;
                                          }
                                          caption {
                                              caption-side: top;
                                              margin-bottom: 10px;
                                          }
                                          
                                          /* Table Header */
                                          .demo-table thead th {
                                              background-color: #508abb;
                                              color: #FFFFFF;
                                              border-color: #6ea1cc !important;
                                              text-transform: uppercase;
                                          }
                                          
                                          /* Table Body */
                                          .demo-table tbody td {
                                              color: #353535;
                                          }
                                          
                                          .demo-table tbody tr:nth-child(odd) td {
                                              background-color: #f4fbff;
                                          }
                                          .demo-table tbody tr:hover th,
                                          .demo-table tbody tr:hover td {
                                              background-color: #ffffa2;
                                              border-color: #ffff0f;
                                              transition: all .2s;
                                          }
                                      </style>
                                        </head>
                                        <body>
                                        <div class="tittle mar">
                                            Dear All,
                                        </div>
                                        <div class="tittle mar1">
                                            <div>Pengajuan disposal asset telah direject, mohon untuk segera diperbaiki</div>
                                            <div>Alasan reject: ${alasan}</div>
                                            <div>Direject oleh: ${name}</div>
                                        </div>
                                        <div class="position">
                                            <table class="demo-table">
                                                <thead>
                                                    <tr>
                                                        <th>No</th>
                                                        <th>No Disposal</th>
                                                        <th>Asset</th>
                                                        <th>Asset description</th>
                                                        <th>Cost Ctr</th>
                                                        <th>Cost Ctr Name</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                  ${tableTd}
                                                </tbody>
                                            </table>
                                        </div>
                                        <div class="tittle foot">
                                            Terima kasih,
                                        </div>
                                        <div class="tittle foot1">
                                            Regards,
                                        </div>
                                        <div class="tittle">
                                            Team Asset
                                        </div>
                                    </body>
                                    `
                                  }
                                  const sendEmail = await wrapMail.wrapedSendMail(mailOptions)
                                  if (sendEmail) {
                                    return response(res, 'success reject disposal', { sendEmail })
                                  } else {
                                    return response(res, 'berhasil reject disposal, tidak berhasil kirim notif email 1')
                                  }
                                } else {
                                  return response(res, 'failed reject persetujuan disposal', {}, 404, false)
                                }
                              } else {
                                return response(res, 'failed reject persetujuan disposal', {}, 404, false)
                              }
                            } else {
                              return response(res, 'failed reject persetujuan disposal', {}, 404, false)
                            }
                          } else {
                            return response(res, 'failed reject persetujuan disposal', {}, 404, false)
                          }
                        } else {
                          return response(res, 'failed reject persetujuan disposal', {}, 404, false)
                        }
                      } else {
                        return response(res, 'failed reject disposal', {}, 404, false)
                      }
                    } else {
                      return response(res, 'failed reject disposal', {}, 404, false)
                    }
                  } else {
                    if (sent) {
                      let draftEmail = ''
                      const draf = []
                      const listPlant = []
                      const findDis = await disposal.findAll({
                        where: {
                          no_persetujuan: no
                        }
                      })
                      if (findDis.length > 0) {
                        const cekdok = []
                        const dokpurch = []
                        const dokarea = []
                        for (let i = 1; i < list.length; i++) {
                          const cekDis = await disposal.findByPk(parseInt(list[i]))
                          if (cekDis) {
                            const docFind = await docUser.findAll({
                              where: {
                                no_pengadaan: cekDis.no_asset,
                                [Op.and]: [
                                  { jenis_form: 'disposal' },
                                  {
                                    [Op.or]: [
                                      { tipe: 'pengajuan' },
                                      { tipe: 'jual' },
                                      { tipe: 'purch' }
                                    ]
                                  }
                                ]
                              }
                            })
                            if (docFind.length > 0) {
                              for (let j = 0; j < docFind.length; j++) {
                                if (docFind[j].tipe === 'purch' && (docFind[j].status === 0 || docFind[j].divisi === '0')) {
                                  dokpurch.push(1)
                                } else if (docFind[j].status === 0 || docFind[j].divisi === '0') {
                                  dokarea.push(1)
                                } else {
                                  cekdok.push(1)
                                }
                              }
                            }
                          } else {
                            cekdok.push(1)
                          }
                        }
                        if (cekdok.length > 0) {
                          const cekDis = []
                          for (let i = 0; i < findDis.length; i++) {
                            const stat = dokarea.length > 0 && dokpurch.length > 0 ? 3 : dokarea.length === 0 && dokpurch.length > 0 ? 2 : dokarea.length > 0 && dokpurch.length === 0 ? 1 : 4
                            const cekStat = stat === 3 ? stat : status.indexOf('2') !== -1 && stat === 4 ? 2 : status.indexOf('2') !== -1 && stat === 2 ? stat : status.indexOf('2') !== -1 && stat === 1 ? 3 : status.indexOf('2') === -1 && stat === 4 ? 1 : stat
                            const data = {
                              status_reject: cekStat,
                              reason: alasan,
                              isreject: null
                            }
                            const send = {
                              status_reject: cekStat,
                              reason: alasan,
                              isreject: 1
                            }
                            const resDis = await disposal.findByPk(findDis[i].id)
                            if (list.find(element => parseInt(element) === resDis.id) !== undefined) {
                              await resDis.update(send)
                              cekDis.push(1)
                            } else {
                              await resDis.update(data)
                              cekDis.push(1)
                            }
                          }
                          if (cekDis.length > 0) {
                            for (let i = 0; i < arr; i++) {
                              const result = await user.findOne({
                                where: {
                                  username: find[i].nama
                                }
                              })
                              if (result) {
                                draf.push(result)
                                draftEmail += result.email + ', '
                              }
                            }
                            findDis.map(x => {
                              return (
                                listPlant.push({ kode_plant: x.kode_plant, no_disposal: x.no_disposal })
                              )
                            })
                            const set = new Set(listPlant)
                            const noPlant = [...set]
                            for (let i = 0; i < noPlant.length; i++) {
                              const findEmail = await email.findOne({
                                where: {
                                  kode_plant: noPlant[i].kode_plant
                                }
                              })
                              if (findEmail) {
                                draf.push(findEmail)
                                draftEmail += findEmail.email_area_aos + ', '
                                const data = {
                                  list_appr: noPlant[i].kode_plant,
                                  response: 'reject'
                                }
                                const findNotif = await notif.findOne({
                                  where: {
                                    [Op.and]: [
                                      { no_proses: 'D' + noPlant[i].no_disposal },
                                      { kode_plant: noPlant[i].kode_plant }
                                    ]
                                  }
                                })
                                if (findNotif) {
                                  await findNotif.update(data)
                                }
                              }
                            }
                            let tableTd = ''
                            for (let i = 0; i < findDis.length; i++) {
                              const element = `
                                  <tr>
                                    <td>${findDis.indexOf(findDis[i]) + 1}</td>
                                    <td>D${findDis[i].no_disposal}</td>
                                    <td>${findDis[i].no_asset}</td>
                                    <td>${findDis[i].nama_asset}</td>
                                    <td>${findDis[i].cost_center}</td>
                                    <td>${findDis[i].area}</td>
                                  </tr>`
                              tableTd = tableTd + element
                            }
                            const mailOptions = {
                              from: 'noreply_asset@pinusmerahabadi.co.id',
                              replyTo: 'noreply_asset@pinusmerahabadi.co.id',
                              // to: `${draftEmail}`,
                              to: `${emailAss}, ${emailAss2}`,
                              subject: 'Reject Perbaikan Disposal Asset ',
                              html: `
                                  <head>
                                  <style type="text/css">
                                    body {
                                        display: flexbox;
                                        flex-direction: column;
                                    }
                                    .tittle {
                                        font-size: 15px;
                                    }
                                    .mar {
                                        margin-bottom: 20px;
                                    }
                                    .mar1 {
                                        margin-bottom: 10px;
                                    }
                                    .foot {
                                        margin-top: 20px;
                                        margin-bottom: 10px;
                                    }
                                    .foot1 {
                                        margin-bottom: 50px;
                                    }
                                    .position {
                                        display: flexbox;
                                        flex-direction: row;
                                        justify-content: left;
                                        margin-top: 10px;
                                    }
                                    table {
                                        font-family: "Lucida Sans Unicode", "Lucida Grande", "Segoe Ui";
                                        font-size: 12px;
                                    }
                                    .demo-table {
                                        border-collapse: collapse;
                                        font-size: 13px;
                                    }
                                    .demo-table th, 
                                    .demo-table td {
                                        border-bottom: 1px solid #e1edff;
                                        border-left: 1px solid #e1edff;
                                        padding: 7px 17px;
                                    }
                                    .demo-table th, 
                                    .demo-table td:last-child {
                                        border-right: 1px solid #e1edff;
                                    }
                                    .demo-table td:first-child {
                                        border-top: 1px solid #e1edff;
                                    }
                                    .demo-table td:last-child{
                                        border-bottom: 0;
                                    }
                                    caption {
                                        caption-side: top;
                                        margin-bottom: 10px;
                                    }
                                    
                                    /* Table Header */
                                    .demo-table thead th {
                                        background-color: #508abb;
                                        color: #FFFFFF;
                                        border-color: #6ea1cc !important;
                                        text-transform: uppercase;
                                    }
                                    
                                    /* Table Body */
                                    .demo-table tbody td {
                                        color: #353535;
                                    }
                                    
                                    .demo-table tbody tr:nth-child(odd) td {
                                        background-color: #f4fbff;
                                    }
                                    .demo-table tbody tr:hover th,
                                    .demo-table tbody tr:hover td {
                                        background-color: #ffffa2;
                                        border-color: #ffff0f;
                                        transition: all .2s;
                                    }
                                </style>
                                  </head>
                                  <body>
                                  <div class="tittle mar">
                                      Dear All,
                                  </div>
                                  <div class="tittle mar1">
                                      <div>Persetujuan disposal asset telah direject, mohon untuk segera diperbaiki</div>
                                      <div>Alasan reject: ${alasan}</div>
                                      <div>Direject oleh: ${name}</div>
                                  </div>
                                  <div class="position">
                                      <table class="demo-table">
                                          <thead>
                                              <tr>
                                                  <th>No</th>
                                                  <th>No Disposal</th>
                                                  <th>Asset</th>
                                                  <th>Asset description</th>
                                                  <th>Cost Ctr</th>
                                                  <th>Cost Ctr Name</th>
                                              </tr>
                                          </thead>
                                          <tbody>
                                            ${tableTd}
                                          </tbody>
                                      </table>
                                  </div>
                                  <div class="tittle foot">
                                      Terima kasih,
                                  </div>
                                  <div class="tittle foot1">
                                      Regards,
                                  </div>
                                  <div class="tittle">
                                      Team Asset
                                  </div>
                              </body>
                                  `
                            }
                            const sendEmail = await wrapMail.wrapedSendMail(mailOptions)
                            if (sendEmail) {
                              return response(res, 'success reject disposal', { sendEmail })
                            } else {
                              return response(res, 'berhasil reject disposal, tidak berhasil kirim notif email 1')
                            }
                          } else {
                            return response(res, 'berhasil reject disposal, tidak berhasil kirim notif email 1')
                          }
                        } else {
                          return response(res, 'berhasil reject disposal, tidak berhasil kirim notif email 1')
                        }
                      } else {
                        return response(res, 'failed reject disposal', {}, 404, false)
                      }
                    } else {
                      return response(res, 'failed reject disposal', {}, 404, false)
                    }
                  }
                } else {
                  return response(res, 'failed reject disposal', {}, 404, false)
                }
              } else {
                return response(res, `${find[arr - 1].jabatan} belum approve atau telah mereject`, {}, 404, false)
              }
            }
          } else {
            return response(res, 'failed reject disposal', {}, 404, false)
          }
        } else {
          return response(res, 'failed reject disposal', {}, 404, false)
        }
      } else {
        return response(res, 'failed reject disposal', {}, 404, false)
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  submitSetDisposal: async (req, res) => {
    try {
      const result = await disposal.findAll({
        where: {
          status_form: 9
        }
      })
      const findNo = await disposal.findAll()
      if (result) {
        const cekNo = []
        for (let i = 0; i < findNo.length; i++) {
          cekNo.push(parseInt(findNo[i].no_persetujuan === null ? 0 : findNo[i].no_persetujuan))
        }
        const noDis = Math.max(...cekNo) + 1
        const send = {
          status_form: 3,
          no_persetujuan: noDis === undefined ? 1 : noDis
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
          const findUser = await user.findOne({
            where: {
              user_level: 17
            }
          })
          if (findUser) {
            const data = {
              kode_plant: '',
              jenis: 'disposal',
              no_proses: noDis === undefined ? 1 : noDis,
              list_appr: findUser.username,
              keterangan: 'persetujuan',
              response: 'request approve',
              route: 'setdis'
            }
            const createNotif = await notif.create(data)
            if (createNotif) {
              let tableTd = ''
              for (let i = 0; i < result.length; i++) {
                const element = `
                  <tr>
                    <td>${result.indexOf(result[i]) + 1}</td>
                    <td>D${result[i].no_disposal}</td>
                    <td>${result[i].no_asset}</td>
                    <td>${result[i].nama_asset}</td>
                    <td>${result[i].cost_center}</td>
                    <td>${result[i].area}</td>
                  </tr>`
                tableTd = tableTd + element
              }
              const mailOptions = {
                from: 'noreply_asset@pinusmerahabadi.co.id',
                replyTo: 'noreply_asset@pinusmerahabadi.co.id',
                // to: `${findUser.email}`,
                to: `${emailAss}, ${emailAss2}`,
                subject: `Approve Persetujuan Disposal ${noDis === undefined ? 1 : noDis} `,
                html: `
                <head>
                  <style type="text/css">
                  body {
                      display: flexbox;
                      flex-direction: column;
                  }
                  .tittle {
                      font-size: 15px;
                  }
                  .mar {
                      margin-bottom: 20px;
                  }
                  .mar1 {
                      margin-bottom: 10px;
                  }
                  .foot {
                      margin-top: 20px;
                      margin-bottom: 10px;
                  }
                  .foot1 {
                      margin-bottom: 50px;
                  }
                  .position {
                      display: flexbox;
                      flex-direction: row;
                      justify-content: left;
                      margin-top: 10px;
                  }
                  table {
                      font-family: "Lucida Sans Unicode", "Lucida Grande", "Segoe Ui";
                      font-size: 12px;
                  }
                  .demo-table {
                      border-collapse: collapse;
                      font-size: 13px;
                  }
                  .demo-table th, 
                  .demo-table td {
                      border-bottom: 1px solid #e1edff;
                      border-left: 1px solid #e1edff;
                      padding: 7px 17px;
                  }
                  .demo-table th, 
                  .demo-table td:last-child {
                      border-right: 1px solid #e1edff;
                  }
                  .demo-table td:first-child {
                      border-top: 1px solid #e1edff;
                  }
                  .demo-table td:last-child{
                      border-bottom: 0;
                  }
                  caption {
                      caption-side: top;
                      margin-bottom: 10px;
                  }
                  
                  /* Table Header */
                  .demo-table thead th {
                      background-color: #508abb;
                      color: #FFFFFF;
                      border-color: #6ea1cc !important;
                      text-transform: uppercase;
                  }
                  
                  /* Table Body */
                  .demo-table tbody td {
                      color: #353535;
                  }
                  
                  .demo-table tbody tr:nth-child(odd) td {
                      background-color: #f4fbff;
                  }
                  .demo-table tbody tr:hover th,
                  .demo-table tbody tr:hover td {
                      background-color: #ffffa2;
                      border-color: #ffff0f;
                      transition: all .2s;
                  }
              </style>
                </head>
                <body>
                    <div class="tittle mar">
                        Dear Bapak/Ibu NFAM,
                    </div>
                    <div class="tittle mar1">
                        <div>Mohon untuk approve persetujuan disposal asset area.</div>
                    </div>
                    <div class="position">
                        <table class="demo-table">
                            <thead>
                                <tr>
                                    <th>No</th>
                                    <th>No Disposal</th>
                                    <th>Asset</th>
                                    <th>Asset description</th>
                                    <th>Cost Ctr</th>
                                    <th>Cost Ctr Name</th>
                                </tr>
                            </thead>
                            <tbody>
                              ${tableTd}
                            </tbody>
                        </table>
                    </div>
                    <a href="http://aset.pinusmerahabadi.co.id/">Klik link berikut untuk akses web asset</a>
                    <div class="tittle foot">
                        Terima kasih,
                    </div>
                    <div class="tittle foot1">
                        Regards,
                    </div>
                    <div class="tittle">
                        Team Asset
                    </div>                                      
                </body>
                `
              }
              const sendEmail = await wrapMail.wrapedSendMail(mailOptions)
              if (sendEmail) {
                return response(res, 'success submit disposal', { sendEmail })
              } else {
                return response(res, 'berhasil submit disposal, tidak berhasil kirim notif email 1')
              }
            }
          }
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
  getSetDisposal: async (req, res) => {
    try {
      const level = req.user.level
      let { limit, page, search, sort, status, tipe } = req.query
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
      if (!status) {
        status = 1
      } else {
        status = parseInt(status)
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
      if (level !== 5) {
        const result = await disposal.findAndCountAll({
          where: {
            [Op.or]: [
              { kode_plant: { [Op.like]: `%${searchValue}%` } },
              { no_io: { [Op.like]: `%${searchValue}%` } },
              { no_disposal: { [Op.like]: `%${searchValue}%` } },
              { nama_asset: { [Op.like]: `%${searchValue}%` } },
              { kategori: { [Op.like]: `%${searchValue}%` } },
              { keterangan: { [Op.like]: `%${searchValue}%` } }
            ],
            [Op.and]: [
              { no_persetujuan: status },
              { status_form: 3 }
            ]
          },
          include: [
            {
              model: asset,
              as: 'dataAsset'
            }
          ],
          order: [[sortValue, 'ASC']],
          limit: limit,
          offset: (page - 1) * limit
        })
        const pageInfo = pagination('/asset/get', req.query, page, limit, result.count)
        if (result) {
          const data = []
          if (tipe === 'persetujuan') {
            result.rows.map(x => {
              return (
                data.push(x.no_persetujuan)
              )
            })
            const set = new Set(data)
            const noDis = [...set]
            return response(res, 'success get disposal', { result, pageInfo, noDis })
          } else {
            result.rows.map(x => {
              return (
                data.push(x.no_disposal)
              )
            })
            const set = new Set(data)
            const noDis = [...set]
            return response(res, 'success get disposal', { result, pageInfo, noDis })
          }
        } else {
          return response(res, 'failed get disposal', {}, 400, false)
        }
      } else if (level === 5) {
        return response(res, 'failed get disposal', {}, 400, false)
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  submitEksDisposal: async (req, res) => {
    try {
      const no = req.params.no
      const level = req.user.level
      const result = await disposal.findOne({
        where: {
          no_asset: no
        }
      })
      if (result) {
        if (result.nilai_jual === '0') {
          const findDoc = await docUser.findAll({
            where: {
              no_pengadaan: result.no_asset,
              [Op.and]: [
                { jenis_form: 'disposal' },
                { tipe: 'dispose' }
              ]
            }
          })
          if (findDoc.length > 0) {
            if (level === 2) {
              const cek = []
              for (let i = 0; i < findDoc.length; i++) {
                if (findDoc[i].divisi === '3' || findDoc[i].status === 3) {
                  cek.push(1)
                }
              }
              if (cek.length === findDoc.length) {
                const data = {
                  status_form: 8,
                  tgl_eksekusi: moment()
                }
                const results = await result.update(data)
                if (results) {
                  const findAsset = await asset.findOne({
                    where: {
                      no_asset: no
                    }
                  })
                  if (findAsset) {
                    const send = {
                      status: '0'
                    }
                    const upAsset = await findAsset.update(send)
                    if (upAsset) {
                      const findUser = await email.findOne({
                        where: {
                          kode_plant: result.kode_plant
                        }
                      })
                      if (findUser) {
                        const cc = [findUser.email_am, findUser.email_aam, findUser.email_spv_asset, findUser.email_staff_asset1, findUser.email_staff_asset2, findUser.email_nom, findUser.email_bm, findUser.email_area_om, findUser.email_ga_spv, findUser.email_staff_ga]
                        const ccIt = [findUser.email_am, findUser.email_aam, findUser.email_spv_asset, findUser.email_staff_asset1, findUser.email_staff_asset2, findUser.email_nom, findUser.email_bm, findUser.email_area_om, findUser.email_it_spv, findUser.email_ism, findUser.email_staff_it, findUser.email_ga_spv, findUser.email_staff_ga]
                        const tableTd = `
                          <tr>
                            <td>1</td>
                            <td>D${result.no_disposal}</td>
                            <td>${result.no_asset}</td>
                            <td>${result.nama_asset}</td>
                            <td>${result.cost_center}</td>
                            <td>${result.area}</td>
                            <td>${result.doc_sap}<td>
                          </tr>`
                        const mailOptions = {
                          from: 'noreply_asset@pinusmerahabadi.co.id',
                          replyTo: 'noreply_asset@pinusmerahabadi.co.id',
                          to: `${emailAss}, ${emailAss2}`,
                          // to: `${findUser.email_area_aos}`,
                          // cc: result.kategori === 'IT' || result.kategori === 'it' ? `${ccIt}` : `${cc}`,
                          subject: `Hasil jurnal disposal asset ${result.area} ${result.no_asset} `,
                          html: `
                            <head>
                              <style type="text/css">
                              body {
                                  display: flexbox;
                                  flex-direction: column;
                              }
                              .tittle {
                                  font-size: 15px;
                              }
                              .mar {
                                  margin-bottom: 20px;
                              }
                              .mar1 {
                                  margin-bottom: 10px;
                              }
                              .foot {
                                  margin-top: 20px;
                                  margin-bottom: 10px;
                              }
                              .foot1 {
                                  margin-bottom: 50px;
                              }
                              .position {
                                  display: flexbox;
                                  flex-direction: row;
                                  justify-content: left;
                                  margin-top: 10px;
                              }
                              table {
                                  font-family: "Lucida Sans Unicode", "Lucida Grande", "Segoe Ui";
                                  font-size: 12px;
                              }
                              .demo-table {
                                  border-collapse: collapse;
                                  font-size: 13px;
                              }
                              .demo-table th, 
                              .demo-table td {
                                  border-bottom: 1px solid #e1edff;
                                  border-left: 1px solid #e1edff;
                                  padding: 7px 17px;
                              }
                              .demo-table th, 
                              .demo-table td:last-child {
                                  border-right: 1px solid #e1edff;
                              }
                              .demo-table td:first-child {
                                  border-top: 1px solid #e1edff;
                              }
                              .demo-table td:last-child{
                                  border-bottom: 0;
                              }
                              caption {
                                  caption-side: top;
                                  margin-bottom: 10px;
                              }
                              
                              /* Table Header */
                              .demo-table thead th {
                                  background-color: #508abb;
                                  color: #FFFFFF;
                                  border-color: #6ea1cc !important;
                                  text-transform: uppercase;
                              }
                              
                              /* Table Body */
                              .demo-table tbody td {
                                  color: #353535;
                              }
                              
                              .demo-table tbody tr:nth-child(odd) td {
                                  background-color: #f4fbff;
                              }
                              .demo-table tbody tr:hover th,
                              .demo-table tbody tr:hover td {
                                  background-color: #ffffa2;
                                  border-color: #ffff0f;
                                  transition: all .2s;
                              }
                          </style>
                            </head>
                            <body>
                                <div class="tittle mar">
                                    Dear Bapak/Ibu,
                                </div>
                                <div class="tittle mar1">
                                    <div>Asset yang dimusnahkan dibawah ini telah dihapuskan secara SAP.</div>
                                </div>
                                <div class="position">
                                    <table class="demo-table">
                                        <thead>
                                            <tr>
                                                <th>No</th>
                                                <th>No Disposal</th>
                                                <th>Asset</th>
                                                <th>Asset description</th>
                                                <th>Cost Ctr</th>
                                                <th>Cost Ctr Name</th>
                                                <th>No Doc SAP</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                          ${tableTd}
                                        </tbody>
                                    </table>
                                </div>
                                <a href="http://aset.pinusmerahabadi.co.id/">Klik link berikut untuk akses web asset</a>
                                <div class="tittle foot">
                                    Terima kasih,
                                </div>
                                <div class="tittle foot1">
                                    Regards,
                                </div>
                                <div class="tittle">
                                    Team Asset
                                </div>
                            </body>
                            `
                        }
                        const sendEmail = await wrapMail.wrapedSendMail(mailOptions)
                        if (sendEmail) {
                          return response(res, 'success submit eksekusi disposal', { sendEmail })
                        } else {
                          return response(res, 'berhasil submit eksekusi disposal, tidak berhasil kirim notif email 1')
                        }
                      }
                    } else {
                      return response(res, 'failed submit disposal', {}, 400, false)
                    }
                  } else {
                    return response(res, 'failed submit disposal', {}, 400, false)
                  }
                } else {
                  return response(res, 'failed submit disposal', {}, 400, false)
                }
              } else {
                return response(res, 'Approve dokumen terlebih dahulu sebelum submit', {}, 400, false)
              }
            } else {
              const cek = []
              for (let i = 0; i < findDoc.length; i++) {
                if (findDoc[i].path !== null) {
                  cek.push(1)
                }
              }
              if (cek.length === findDoc.length) {
                const prev = moment().subtract(1, 'month').format('L').split('/')
                const findApi = await axios.get(`http://10.3.212.38:8000/sap/bc/zast/?sap-client=300&pgmna=zfir0090&p_anln1=${result.no_asset}&p_bukrs=pp01&p_gjahr=${prev[2]}&p_monat=${prev[0]}`).then(response => { return (response) }).catch(err => { return (err.isAxiosError) })
                let data = {}
                if (findApi.status === 200) {
                  data = {
                    status_form: level === 5 ? 5 : 8,
                    nilai_buku_eks: findApi.data[0].nafap === undefined ? result.nilai_buku : findApi.data[0].nafap
                  }
                } else {
                  data = {
                    status_form: level === 5 ? 5 : 8,
                    nilai_buku_eks: result.nilai_buku
                  }
                }
                const results = await result.update(data)
                if (results) {
                  const findUser = await user.findOne({
                    where: {
                      user_level: 2
                    }
                  })
                  if (findUser) {
                    const data = {
                      kode_plant: result.kode_plant,
                      jenis: 'disposal',
                      no_proses: no,
                      list_appr: findUser.username,
                      keterangan: 'eksekusi',
                      response: 'request'
                    }
                    const createNotif = await notif.create(data)
                    if (createNotif) {
                      const tableTd = `
                      <tr>
                        <td>1</td>
                        <td>D${result.no_disposal}</td>
                        <td>${result.no_asset}</td>
                        <td>${result.nama_asset}</td>
                        <td>${result.cost_center}</td>
                        <td>${result.area}</td>
                      </tr>`
                      const mailOptions = {
                        from: 'noreply_asset@pinusmerahabadi.co.id',
                        replyTo: 'noreply_asset@pinusmerahabadi.co.id',
                        // to: `${findUser.email}`,
                        to: `${emailAss}, ${emailAss2}`,
                        subject: `Eksekusi Disposal No Asset ${result.no_asset} `,
                        html: `
                        <head>
                          <style type="text/css">
                          body {
                              display: flexbox;
                              flex-direction: column;
                          }
                          .tittle {
                              font-size: 15px;
                          }
                          .mar {
                              margin-bottom: 20px;
                          }
                          .mar1 {
                              margin-bottom: 10px;
                          }
                          .foot {
                              margin-top: 20px;
                              margin-bottom: 10px;
                          }
                          .foot1 {
                              margin-bottom: 50px;
                          }
                          .position {
                              display: flexbox;
                              flex-direction: row;
                              justify-content: left;
                              margin-top: 10px;
                          }
                          table {
                              font-family: "Lucida Sans Unicode", "Lucida Grande", "Segoe Ui";
                              font-size: 12px;
                          }
                          .demo-table {
                              border-collapse: collapse;
                              font-size: 13px;
                          }
                          .demo-table th, 
                          .demo-table td {
                              border-bottom: 1px solid #e1edff;
                              border-left: 1px solid #e1edff;
                              padding: 7px 17px;
                          }
                          .demo-table th, 
                          .demo-table td:last-child {
                              border-right: 1px solid #e1edff;
                          }
                          .demo-table td:first-child {
                              border-top: 1px solid #e1edff;
                          }
                          .demo-table td:last-child{
                              border-bottom: 0;
                          }
                          caption {
                              caption-side: top;
                              margin-bottom: 10px;
                          }
                          
                          /* Table Header */
                          .demo-table thead th {
                              background-color: #508abb;
                              color: #FFFFFF;
                              border-color: #6ea1cc !important;
                              text-transform: uppercase;
                          }
                          
                          /* Table Body */
                          .demo-table tbody td {
                              color: #353535;
                          }
                          
                          .demo-table tbody tr:nth-child(odd) td {
                              background-color: #f4fbff;
                          }
                          .demo-table tbody tr:hover th,
                          .demo-table tbody tr:hover td {
                              background-color: #ffffa2;
                              border-color: #ffff0f;
                              transition: all .2s;
                          }
                      </style>
                        </head>
                        <body>
                            <div class="tittle mar">
                                Dear Team Asset,
                            </div>
                            <div class="tittle mar1">
                                <div>Mohon untuk proses Eksekusi disposal asset area.</div>
                            </div>
                            <div class="position">
                                <table class="demo-table">
                                    <thead>
                                        <tr>
                                            <th>No</th>
                                            <th>No Disposal</th>
                                            <th>Asset</th>
                                            <th>Asset description</th>
                                            <th>Cost Ctr</th>
                                            <th>Cost Ctr Name</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                      ${tableTd}
                                    </tbody>
                                </table>
                            </div>
                            <a href="http://aset.pinusmerahabadi.co.id/">Klik link berikut untuk akses web asset</a>
                            <div class="tittle foot">
                                Terima kasih,
                            </div>
                            <div class="tittle foot1">
                                Regards,
                            </div>
                            <div class="tittle">
                                Team Asset
                            </div>
                        </body>
                        `
                      }
                      const sendEmail = await wrapMail.wrapedSendMail(mailOptions)
                      if (sendEmail) {
                        return response(res, 'success submit eksekusi disposal', { sendEmail })
                      } else {
                        return response(res, 'berhasil submit eksekusi disposal, tidak berhasil kirim notif email 1')
                      }
                    }
                  }
                } else {
                  return response(res, 'failed submit disposal', {}, 400, false)
                }
              } else {
                return response(res, 'Upload dokumen terlebih dahulu sebelum submit', {}, 400, false)
              }
            }
          } else {
            return response(res, 'Upload dokumen terlebih dahulu sebelum submit', {}, 400, false)
          }
        } else {
          if (result.npwp === 'ada') {
            const findTemp = await document.findAll({
              where: {
                [Op.and]: [
                  { tipe_dokumen: 'disposal' }
                ],
                [Op.or]: [
                  { tipe: 'sell' },
                  { tipe: 'npwp' }
                ]
              }
            })
            if (findTemp.length > 0) {
              const findDoc = await docUser.findAll({
                where: {
                  [Op.and]: [
                    { no_pengadaan: result.no_asset },
                    { jenis_form: 'disposal' }
                  ],
                  [Op.or]: [
                    { tipe: 'sell' },
                    { tipe: 'npwp' }
                  ]
                }
              })
              if (findDoc.length > 0) {
                if (findTemp.length === findDoc.length) {
                  if (level === 2) {
                    const cek = []
                    for (let i = 0; i < findDoc.length; i++) {
                      if (findDoc[i].divisi === '3' || findDoc[i].status === 3) {
                        cek.push(1)
                      }
                    }
                    if (cek.length === findDoc.length) {
                      const prev = moment().subtract(1, 'month').format('L').split('/')
                      const findApi = await axios.get(`http://10.3.212.38:8000/sap/bc/zast/?sap-client=300&pgmna=zfir0090&p_anln1=${result.no_asset}&p_bukrs=pp01&p_gjahr=${prev[2]}&p_monat=${prev[0]}`).then(response => { return (response) }).catch(err => { return (err.isAxiosError) })
                      let data = {}
                      if (findApi.status === 200) {
                        data = {
                          status_form: level === 5 ? 5 : 6,
                          nilai_buku_eks: findApi.data[0].nafap === undefined ? result.nilai_buku : findApi.data[0].nafap,
                          tgl_eksekusi: moment()
                        }
                      } else {
                        data = {
                          status_form: level === 5 ? 5 : 6,
                          nilai_buku_eks: result.nilai_buku,
                          tgl_eksekusi: moment()
                        }
                      }
                      const results = await result.update(data)
                      if (results) {
                        const findUser = await user.findOne({
                          where: {
                            user_level: 4
                          }
                        })
                        const findTax = await user.findOne({
                          where: {
                            user_level: 3
                          }
                        })
                        if (findUser && findTax) {
                          const data = {
                            kode_plant: result.kode_plant,
                            jenis: 'disposal',
                            no_proses: no,
                            list_appr: findUser.username,
                            keterangan: 'finance',
                            response: 'request'
                          }
                          const data1 = {
                            kode_plant: result.kode_plant,
                            jenis: 'disposal',
                            no_proses: no,
                            list_appr: findTax.username,
                            keterangan: 'tax',
                            response: 'request'
                          }
                          const createNotifFin = await notif.create(data)
                          const createNotifTax = await notif.create(data1)
                          if (createNotifFin && createNotifTax) {
                            const findEmail = await email.findOne({
                              where: {
                                kode_plant: result.kode_plant
                              }
                            })
                            if (findEmail) {
                              const ccTax = [findEmail.email_am, findEmail.email_aam, findEmail.email_spv_asset, findEmail.email_staff_asset1, findEmail.email_staff_asset2, findEmail.email_nom, findEmail.email_bm, findEmail.email_area_om, findEmail.email_area_aos, findEmail.email_spv_asset]
                              const ccFinIt = [findEmail.email_am, findEmail.email_aam, findEmail.email_spv_asset, findEmail.email_staff_asset1, findEmail.email_staff_asset2, findEmail.email_fm, findEmail.email_afm, findEmail.email_nom, findEmail.email_bm, findEmail.email_area_om, findEmail.email_area_aos, findEmail.email_it_spv, findEmail.email_ism, findEmail.email_staff_it, findEmail.email_ga_spv, findEmail.email_staff_ga]
                              const ccFin = [findEmail.email_am, findEmail.email_aam, findEmail.email_spv_asset, findEmail.email_staff_asset1, findEmail.email_staff_asset2, findEmail.email_fm, findEmail.email_afm, findEmail.email_nom, findEmail.email_bm, findEmail.email_area_om, findEmail.email_area_aos, findEmail.email_ga_spv, findEmail.email_staff_ga]
                              const tableTd = `
                                <tr>
                                  <td>1</td>
                                  <td>D${result.no_disposal}</td>
                                  <td>${result.no_asset}</td>
                                  <td>${result.nama_asset}</td>
                                  <td>${result.cost_center}</td>
                                  <td>${result.area}</td>
                                </tr>`
                              const mailOptions = {
                                from: 'noreply_asset@pinusmerahabadi.co.id',
                                replyTo: 'noreply_asset@pinusmerahabadi.co.id',
                                to: `${emailAss}, ${emailAss2}`,
                                // to: `${findUser.email}`,
                                // cc: result.kategori === 'IT' || result.kategori === 'it' ? `${ccFinIt}` : `${ccFin}`,
                                subject: `Konfirmasi uang masuk disposal asset ${result.no_asset} `,
                                html: `
                              <head>
                                <style type="text/css">
                                body {
                                    display: flexbox;
                                    flex-direction: column;
                                }
                                .tittle {
                                    font-size: 15px;
                                }
                                .mar {
                                    margin-bottom: 20px;
                                }
                                .mar1 {
                                    margin-bottom: 10px;
                                }
                                .foot {
                                    margin-top: 20px;
                                    margin-bottom: 10px;
                                }
                                .foot1 {
                                    margin-bottom: 50px;
                                }
                                .position {
                                    display: flexbox;
                                    flex-direction: row;
                                    justify-content: left;
                                    margin-top: 10px;
                                }
                                table {
                                    font-family: "Lucida Sans Unicode", "Lucida Grande", "Segoe Ui";
                                    font-size: 12px;
                                }
                                .demo-table {
                                    border-collapse: collapse;
                                    font-size: 13px;
                                }
                                .demo-table th, 
                                .demo-table td {
                                    border-bottom: 1px solid #e1edff;
                                    border-left: 1px solid #e1edff;
                                    padding: 7px 17px;
                                }
                                .demo-table th, 
                                .demo-table td:last-child {
                                    border-right: 1px solid #e1edff;
                                }
                                .demo-table td:first-child {
                                    border-top: 1px solid #e1edff;
                                }
                                .demo-table td:last-child{
                                    border-bottom: 0;
                                }
                                caption {
                                    caption-side: top;
                                    margin-bottom: 10px;
                                }
                                
                                /* Table Header */
                                .demo-table thead th {
                                    background-color: #508abb;
                                    color: #FFFFFF;
                                    border-color: #6ea1cc !important;
                                    text-transform: uppercase;
                                }
                                
                                /* Table Body */
                                .demo-table tbody td {
                                    color: #353535;
                                }
                                
                                .demo-table tbody tr:nth-child(odd) td {
                                    background-color: #f4fbff;
                                }
                                .demo-table tbody tr:hover th,
                                .demo-table tbody tr:hover td {
                                    background-color: #ffffa2;
                                    border-color: #ffff0f;
                                    transition: all .2s;
                                }
                            </style>
                              </head>
                              <body>
                                  <div class="tittle mar">
                                      Dear Team Finance,
                                  </div>
                                  <div class="tittle mar1">
                                      <div>Mohon bantuannya untuk cek uang masuk hasil penjualan aset dibawah ini:</div>
                                  </div>
                                  <div class="position mar1">
                                      <table class="demo-table">
                                          <thead>
                                              <tr>
                                                  <th>No</th>
                                                  <th>No Disposal</th>
                                                  <th>Asset</th>
                                                  <th>Asset description</th>
                                                  <th>Cost Ctr</th>
                                                  <th>Cost Ctr Name</th>
                                              </tr>
                                          </thead>
                                          <tbody>
                                            ${tableTd}
                                          </tbody>
                                      </table>
                                  </div>
                                  <div class="tittle">Jika uang masuk sudah sesuai, mohon segera:</div>
                                  <div class="tittle">1. Jurnal ke COA piutang lain-lain</div>
                                  <div class="tittle">2. Input nomor doc jurnal dan nominal uang masuk di web</div>
                                  <div class="tittle">3. Upload screencapture rekening koran dan jurnal yang terbentuk di SAP</div>
                                  <a href="http://aset.pinusmerahabadi.co.id/">Klik link berikut untuk akses web asset</a>
                                  <div class="tittle foot">
                                      Terima kasih,
                                  </div>
                                  <div class="tittle foot1">
                                      Regards,
                                  </div>
                                  <div class="tittle">
                                      Team Asset
                                  </div>
                              </body>
                              `
                              }
                              const mailOptionsTax = {
                                from: 'noreply_asset@pinusmerahabadi.co.id',
                                replyTo: 'noreply_asset@pinusmerahabadi.co.id',
                                // to: `${findTax.email}`,
                                // cc: `${ccTax}`,
                                to: `${emailAss}, ${emailAss2}`,
                                subject: `Permintaan FP disposal asset ${result.no_asset} `,
                                html: `
                              <head>
                                <style type="text/css">
                                body {
                                    display: flexbox;
                                    flex-direction: column;
                                }
                                .tittle {
                                    font-size: 15px;
                                }
                                .mar {
                                    margin-bottom: 20px;
                                }
                                .mar1 {
                                    margin-bottom: 10px;
                                }
                                .foot {
                                    margin-top: 20px;
                                    margin-bottom: 10px;
                                }
                                .foot1 {
                                    margin-bottom: 50px;
                                }
                                .position {
                                    display: flexbox;
                                    flex-direction: row;
                                    justify-content: left;
                                    margin-top: 10px;
                                }
                                table {
                                    font-family: "Lucida Sans Unicode", "Lucida Grande", "Segoe Ui";
                                    font-size: 12px;
                                }
                                .demo-table {
                                    border-collapse: collapse;
                                    font-size: 13px;
                                }
                                .demo-table th, 
                                .demo-table td {
                                    border-bottom: 1px solid #e1edff;
                                    border-left: 1px solid #e1edff;
                                    padding: 7px 17px;
                                }
                                .demo-table th, 
                                .demo-table td:last-child {
                                    border-right: 1px solid #e1edff;
                                }
                                .demo-table td:first-child {
                                    border-top: 1px solid #e1edff;
                                }
                                .demo-table td:last-child{
                                    border-bottom: 0;
                                }
                                caption {
                                    caption-side: top;
                                    margin-bottom: 10px;
                                }
                                
                                /* Table Header */
                                .demo-table thead th {
                                    background-color: #508abb;
                                    color: #FFFFFF;
                                    border-color: #6ea1cc !important;
                                    text-transform: uppercase;
                                }
                                
                                /* Table Body */
                                .demo-table tbody td {
                                    color: #353535;
                                }
                                
                                .demo-table tbody tr:nth-child(odd) td {
                                    background-color: #f4fbff;
                                }
                                .demo-table tbody tr:hover th,
                                .demo-table tbody tr:hover td {
                                    background-color: #ffffa2;
                                    border-color: #ffff0f;
                                    transition: all .2s;
                                }
                            </style>
                              </head>
                              <body>
                                  <div class="tittle mar">
                                      Dear Team Tax,
                                  </div>
                                  <div class="tittle mar1">
                                      <div>Mohon bantuannya untuk membuat dan upload faktur pajak atas penjualan asset yang sudah diajukan melalui web dibawah ini:</div>
                                  </div>
                                  <div class="position">
                                      <table class="demo-table">
                                          <thead>
                                              <tr>
                                                  <th>No</th>
                                                  <th>No Disposal</th>
                                                  <th>Asset</th>
                                                  <th>Asset description</th>
                                                  <th>Cost Ctr</th>
                                                  <th>Cost Ctr Name</th>
                                              </tr>
                                          </thead>
                                          <tbody>
                                            ${tableTd}
                                          </tbody>
                                      </table>
                                  </div>
                                  <a href="http://aset.pinusmerahabadi.co.id/">Klik link berikut untuk akses web asset</a>
                                  <div class="tittle foot">
                                      Terima kasih,
                                  </div>
                                  <div class="tittle foot1">
                                      Regards,
                                  </div>
                                  <div class="tittle">
                                      Team Asset
                                  </div>
                              </body>
                              `
                              }
                              const sendEmail = await wrapMail.wrapedSendMail(mailOptions)
                              if (sendEmail) {
                                const sendEmail1 = await wrapMail.wrapedSendMail(mailOptionsTax)
                                if (sendEmail1) {
                                  return response(res, 'success submit eksekusi disposal', { sendEmail })
                                } else {
                                  return response(res, 'berhasil submit eksekusi disposal, tidak berhasil kirim notif email 1')
                                }
                              } else {
                                const sendEmail1 = await wrapMail.wrapedSendMail(mailOptionsTax)
                                if (sendEmail1) {
                                  return response(res, 'success submit eksekusi disposal', { sendEmail })
                                } else {
                                  return response(res, 'berhasil submit eksekusi disposal, tidak berhasil kirim notif email 1')
                                }
                              }
                            }
                          }
                        }
                      } else {
                        return response(res, 'failed submit disposal', {}, 400, false)
                      }
                    } else {
                      return response(res, 'Approve dokumen terlebih dahulu sebelum submit', {}, 400, false)
                    }
                  } else {
                    const cek = []
                    for (let i = 0; i < findDoc.length; i++) {
                      if (findDoc[i].path !== null) {
                        cek.push(1)
                      }
                    }
                    if (cek.length === findDoc.length) {
                      const data = {
                        status_form: level === 5 ? 5 : 6
                      }
                      const results = await result.update(data)
                      if (results) {
                        const findUser = await user.findOne({
                          where: {
                            user_level: 2
                          }
                        })
                        if (findUser) {
                          const data = {
                            kode_plant: result.kode_plant,
                            jenis: 'disposal',
                            no_proses: no,
                            list_appr: findUser.username,
                            keterangan: 'eksekusi',
                            response: 'request'
                          }
                          const createNotif = await notif.create(data)
                          if (createNotif) {
                            const tableTd = `
                            <tr>
                              <td>1</td>
                              <td>D${result.no_disposal}</td>
                              <td>${result.no_asset}</td>
                              <td>${result.nama_asset}</td>
                              <td>${result.cost_center}</td>
                              <td>${result.area}</td>
                            </tr>`
                            const mailOptions = {
                              from: 'noreply_asset@pinusmerahabadi.co.id',
                              replyTo: 'noreply_asset@pinusmerahabadi.co.id',
                              // to: `${findUser.email}`,
                              to: `${emailAss}, ${emailAss2}`,
                              subject: `Eksekusi Disposal No Asset ${result.no_asset} `,
                              html: `
                              <head>
                                <style type="text/css">
                                body {
                                    display: flexbox;
                                    flex-direction: column;
                                }
                                .tittle {
                                    font-size: 15px;
                                }
                                .mar {
                                    margin-bottom: 20px;
                                }
                                .mar1 {
                                    margin-bottom: 10px;
                                }
                                .foot {
                                    margin-top: 20px;
                                    margin-bottom: 10px;
                                }
                                .foot1 {
                                    margin-bottom: 50px;
                                }
                                .position {
                                    display: flexbox;
                                    flex-direction: row;
                                    justify-content: left;
                                    margin-top: 10px;
                                }
                                table {
                                    font-family: "Lucida Sans Unicode", "Lucida Grande", "Segoe Ui";
                                    font-size: 12px;
                                }
                                .demo-table {
                                    border-collapse: collapse;
                                    font-size: 13px;
                                }
                                .demo-table th, 
                                .demo-table td {
                                    border-bottom: 1px solid #e1edff;
                                    border-left: 1px solid #e1edff;
                                    padding: 7px 17px;
                                }
                                .demo-table th, 
                                .demo-table td:last-child {
                                    border-right: 1px solid #e1edff;
                                }
                                .demo-table td:first-child {
                                    border-top: 1px solid #e1edff;
                                }
                                .demo-table td:last-child{
                                    border-bottom: 0;
                                }
                                caption {
                                    caption-side: top;
                                    margin-bottom: 10px;
                                }
                                
                                /* Table Header */
                                .demo-table thead th {
                                    background-color: #508abb;
                                    color: #FFFFFF;
                                    border-color: #6ea1cc !important;
                                    text-transform: uppercase;
                                }
                                
                                /* Table Body */
                                .demo-table tbody td {
                                    color: #353535;
                                }
                                
                                .demo-table tbody tr:nth-child(odd) td {
                                    background-color: #f4fbff;
                                }
                                .demo-table tbody tr:hover th,
                                .demo-table tbody tr:hover td {
                                    background-color: #ffffa2;
                                    border-color: #ffff0f;
                                    transition: all .2s;
                                }
                            </style>
                              </head>
                              <body>
                                  <div class="tittle mar">
                                      Dear Bapak/Ibu Asset,
                                  </div>
                                  <div class="tittle mar1">
                                      <div>Mohon untuk proses disposal asset area.</div>
                                  </div>
                                  <div class="position">
                                      <table class="demo-table">
                                          <thead>
                                              <tr>
                                                  <th>No</th>
                                                  <th>No Disposal</th>
                                                  <th>Asset</th>
                                                  <th>Asset description</th>
                                                  <th>Cost Ctr</th>
                                                  <th>Cost Ctr Name</th>
                                              </tr>
                                          </thead>
                                          <tbody>
                                            ${tableTd}
                                          </tbody>
                                      </table>
                                  </div>
                                  <a href="http://aset.pinusmerahabadi.co.id/">Klik link berikut untuk akses web asset</a>
                                  <div class="tittle foot">
                                      Terima kasih,
                                  </div>
                                  <div class="tittle foot1">
                                      Regards,
                                  </div>
                                  <div class="tittle">
                                      Team Asset
                                  </div>
                              </body>
                              `
                            }
                            const sendEmail = await wrapMail.wrapedSendMail(mailOptions)
                            if (sendEmail) {
                              return response(res, 'success submit disposal', { sendEmail })
                            } else {
                              return response(res, 'berhasil submit disposal, tidak berhasil kirim notif email 1')
                            }
                          }
                        }
                      } else {
                        return response(res, 'failed submit disposal', {}, 400, false)
                      }
                    } else {
                      return response(res, 'Upload dokumen terlebih dahulu sebelum submit', {}, 400, false)
                    }
                  }
                } else {
                  return response(res, 'Upload dokumen terlebih dahulu sebelum submit', {}, 400, false)
                }
              } else {
                return response(res, 'Upload dokumen terlebih dahulu sebelum submit', {}, 400, false)
              }
            } else {
              return response(res, 'failed submit disposal', {}, 400, false)
            }
          } else {
            const findDoc = await docUser.findAll({
              where: {
                no_pengadaan: result.no_asset,
                [Op.and]: [
                  { jenis_form: 'disposal' },
                  { tipe: 'sell' }
                ]
              }
            })
            if (findDoc.length > 0) {
              if (level === 2) {
                const cek = []
                for (let i = 0; i < findDoc.length; i++) {
                  if (findDoc[i].status === 3 || findDoc[i].divisi === '3') {
                    cek.push(1)
                  }
                }
                if (cek.length === findDoc.length) {
                  const prev = moment().subtract(1, 'month').format('L').split('/')
                  const findApi = await axios.get(`http://10.3.212.38:8000/sap/bc/zast/?sap-client=300&pgmna=zfir0090&p_anln1=${result.no_asset}&p_bukrs=pp01&p_gjahr=${prev[2]}&p_monat=${prev[0]}`).then(response => { return (response) }).catch(err => { return (err.isAxiosError) })
                  let data = {}
                  if (findApi.status === 200) {
                    data = {
                      status_form: level === 5 ? 5 : 6,
                      nilai_buku_eks: findApi.data[0].nafap === undefined ? result.nilai_buku : findApi.data[0].nafap,
                      tgl_eksekusi: moment()
                    }
                  } else {
                    data = {
                      status_form: level === 5 ? 5 : 6,
                      nilai_buku_eks: result.nilai_buku,
                      tgl_eksekusi: moment()
                    }
                  }
                  const results = await result.update(data)
                  if (results) {
                    const findUser = await user.findOne({
                      where: {
                        user_level: 4
                      }
                    })
                    const findTax = await user.findOne({
                      where: {
                        user_level: 3
                      }
                    })
                    if (findUser && findTax) {
                      const data = {
                        kode_plant: result.kode_plant,
                        jenis: 'disposal',
                        no_proses: no,
                        list_appr: findUser.username,
                        keterangan: 'finance',
                        response: 'request'
                      }
                      const data1 = {
                        kode_plant: result.kode_plant,
                        jenis: 'disposal',
                        no_proses: no,
                        list_appr: findTax.username,
                        keterangan: 'tax',
                        response: 'request'
                      }
                      const createNotifFin = await notif.create(data)
                      const createNotifTax = await notif.create(data1)
                      if (createNotifFin && createNotifTax) {
                        const findEmail = await email.findOne({
                          where: {
                            kode_plant: result.kode_plant
                          }
                        })
                        if (findEmail) {
                          const ccTax = [findEmail.email_am, findEmail.email_aam, findEmail.email_spv_asset, findEmail.email_staff_asset1, findEmail.email_staff_asset2, findEmail.email_nom, findEmail.email_bm, findEmail.email_area_om, findEmail.email_area_aos, findEmail.email_spv_asset]
                          const ccFinIt = [findEmail.email_am, findEmail.email_aam, findEmail.email_spv_asset, findEmail.email_staff_asset1, findEmail.email_staff_asset2, findEmail.email_fm, findEmail.email_afm, findEmail.email_nom, findEmail.email_bm, findEmail.email_area_om, findEmail.email_area_aos, findEmail.email_it_spv, findEmail.email_ism, findEmail.email_staff_it, findEmail.email_ga_spv, findEmail.email_staff_ga]
                          const ccFin = [findEmail.email_am, findEmail.email_aam, findEmail.email_spv_asset, findEmail.email_staff_asset1, findEmail.email_staff_asset2, findEmail.email_fm, findEmail.email_afm, findEmail.email_nom, findEmail.email_bm, findEmail.email_area_om, findEmail.email_area_aos, findEmail.email_ga_spv, findEmail.email_staff_ga]
                          const tableTd = `
                            <tr>
                              <td>1</td>
                              <td>D${result.no_disposal}</td>
                              <td>${result.no_asset}</td>
                              <td>${result.nama_asset}</td>
                              <td>${result.cost_center}</td>
                              <td>${result.area}</td>
                            </tr>`
                          const mailOptions = {
                            from: 'noreply_asset@pinusmerahabadi.co.id',
                            replyTo: 'noreply_asset@pinusmerahabadi.co.id',
                            // to: `${findUser.email}`,
                            to: `${emailAss}, ${emailAss2}`,
                            // cc: result.kategori === 'IT' || result.kategori === 'it' ? `${ccFinIt}` : `${ccFin}`,
                            subject: `Konfirmasi uang masuk disposal asset ${result.no_asset} `,
                            html: `
                          <head>
                            <style type="text/css">
                            body {
                                display: flexbox;
                                flex-direction: column;
                            }
                            .tittle {
                                font-size: 15px;
                            }
                            .mar {
                                margin-bottom: 20px;
                            }
                            .mar1 {
                                margin-bottom: 10px;
                            }
                            .foot {
                                margin-top: 20px;
                                margin-bottom: 10px;
                            }
                            .foot1 {
                                margin-bottom: 50px;
                            }
                            .position {
                                display: flexbox;
                                flex-direction: row;
                                justify-content: left;
                                margin-top: 10px;
                            }
                            table {
                                font-family: "Lucida Sans Unicode", "Lucida Grande", "Segoe Ui";
                                font-size: 12px;
                            }
                            .demo-table {
                                border-collapse: collapse;
                                font-size: 13px;
                            }
                            .demo-table th, 
                            .demo-table td {
                                border-bottom: 1px solid #e1edff;
                                border-left: 1px solid #e1edff;
                                padding: 7px 17px;
                            }
                            .demo-table th, 
                            .demo-table td:last-child {
                                border-right: 1px solid #e1edff;
                            }
                            .demo-table td:first-child {
                                border-top: 1px solid #e1edff;
                            }
                            .demo-table td:last-child{
                                border-bottom: 0;
                            }
                            caption {
                                caption-side: top;
                                margin-bottom: 10px;
                            }
                            
                            /* Table Header */
                            .demo-table thead th {
                                background-color: #508abb;
                                color: #FFFFFF;
                                border-color: #6ea1cc !important;
                                text-transform: uppercase;
                            }
                            
                            /* Table Body */
                            .demo-table tbody td {
                                color: #353535;
                            }
                            
                            .demo-table tbody tr:nth-child(odd) td {
                                background-color: #f4fbff;
                            }
                            .demo-table tbody tr:hover th,
                            .demo-table tbody tr:hover td {
                                background-color: #ffffa2;
                                border-color: #ffff0f;
                                transition: all .2s;
                            }
                        </style>
                          </head>
                          <body>
                              <div class="tittle mar">
                                  Dear Team Finance,
                              </div>
                              <div class="tittle mar1">
                                  <div>Mohon bantuannya untuk cek uang masuk hasil penjualan aset dibawah ini:</div>
                              </div>
                              <div class="position mar1">
                                  <table class="demo-table">
                                      <thead>
                                          <tr>
                                              <th>No</th>
                                              <th>No Disposal</th>
                                              <th>Asset</th>
                                              <th>Asset description</th>
                                              <th>Cost Ctr</th>
                                              <th>Cost Ctr Name</th>
                                          </tr>
                                      </thead>
                                      <tbody>
                                        ${tableTd}
                                      </tbody>
                                  </table>
                              </div>
                              <div class="tittle">Jika uang masuk sudah sesuai, mohon segera:</div>
                              <div class="tittle">1. Jurnal ke COA piutang lain-lain</div>
                              <div class="tittle">2. Input nomor doc jurnal dan nominal uang masuk di web</div>
                              <div class="tittle">3. Upload screencapture rekening koran dan jurnal yang terbentuk di SAP</div>
                              <a href="http://aset.pinusmerahabadi.co.id/">Klik link berikut untuk akses web asset</a>
                              <div class="tittle foot">
                                  Terima kasih,
                              </div>
                              <div class="tittle foot1">
                                  Regards,
                              </div>
                              <div class="tittle">
                                  Team Asset
                              </div>
                          </body>
                          `
                          }
                          const mailOptionsTax = {
                            from: 'noreply_asset@pinusmerahabadi.co.id',
                            replyTo: 'noreply_asset@pinusmerahabadi.co.id',
                            to: `${emailAss}, ${emailAss2}`,
                            // to: `${findTax.email}`,
                            // cc: `${ccTax}`,
                            subject: `Permintaan FP disposal asset ${result.no_asset} `,
                            html: `
                          <head>
                            <style type="text/css">
                            body {
                                display: flexbox;
                                flex-direction: column;
                            }
                            .tittle {
                                font-size: 15px;
                            }
                            .mar {
                                margin-bottom: 20px;
                            }
                            .mar1 {
                                margin-bottom: 10px;
                            }
                            .foot {
                                margin-top: 20px;
                                margin-bottom: 10px;
                            }
                            .foot1 {
                                margin-bottom: 50px;
                            }
                            .position {
                                display: flexbox;
                                flex-direction: row;
                                justify-content: left;
                                margin-top: 10px;
                            }
                            table {
                                font-family: "Lucida Sans Unicode", "Lucida Grande", "Segoe Ui";
                                font-size: 12px;
                            }
                            .demo-table {
                                border-collapse: collapse;
                                font-size: 13px;
                            }
                            .demo-table th, 
                            .demo-table td {
                                border-bottom: 1px solid #e1edff;
                                border-left: 1px solid #e1edff;
                                padding: 7px 17px;
                            }
                            .demo-table th, 
                            .demo-table td:last-child {
                                border-right: 1px solid #e1edff;
                            }
                            .demo-table td:first-child {
                                border-top: 1px solid #e1edff;
                            }
                            .demo-table td:last-child{
                                border-bottom: 0;
                            }
                            caption {
                                caption-side: top;
                                margin-bottom: 10px;
                            }
                            
                            /* Table Header */
                            .demo-table thead th {
                                background-color: #508abb;
                                color: #FFFFFF;
                                border-color: #6ea1cc !important;
                                text-transform: uppercase;
                            }
                            
                            /* Table Body */
                            .demo-table tbody td {
                                color: #353535;
                            }
                            
                            .demo-table tbody tr:nth-child(odd) td {
                                background-color: #f4fbff;
                            }
                            .demo-table tbody tr:hover th,
                            .demo-table tbody tr:hover td {
                                background-color: #ffffa2;
                                border-color: #ffff0f;
                                transition: all .2s;
                            }
                        </style>
                          </head>
                          <body>
                              <div class="tittle mar">
                                  Dear Team Tax,
                              </div>
                              <div class="tittle mar1">
                                  <div>Mohon bantuannya untuk membuat dan upload faktur pajak atas penjualan asset yang sudah diajukan melalui web dibawah ini:</div>
                              </div>
                              <div class="position">
                                  <table class="demo-table">
                                      <thead>
                                          <tr>
                                              <th>No</th>
                                              <th>No Disposal</th>
                                              <th>Asset</th>
                                              <th>Asset description</th>
                                              <th>Cost Ctr</th>
                                              <th>Cost Ctr Name</th>
                                          </tr>
                                      </thead>
                                      <tbody>
                                        ${tableTd}
                                      </tbody>
                                  </table>
                              </div>
                              <a href="http://aset.pinusmerahabadi.co.id/">Klik link berikut untuk akses web asset</a>
                              <div class="tittle foot">
                                  Terima kasih,
                              </div>
                              <div class="tittle foot1">
                                  Regards,
                              </div>
                              <div class="tittle">
                                  Team Asset
                              </div>
                          </body>
                          `
                          }
                          const sendEmail = await wrapMail.wrapedSendMail(mailOptions)
                          if (sendEmail) {
                            const sendEmail1 = await wrapMail.wrapedSendMail(mailOptionsTax)
                            if (sendEmail1) {
                              return response(res, 'success submit eksekusi disposal', { sendEmail })
                            } else {
                              return response(res, 'berhasil submit eksekusi disposal, tidak berhasil kirim notif email 1')
                            }
                          } else {
                            const sendEmail1 = await wrapMail.wrapedSendMail(mailOptionsTax)
                            if (sendEmail1) {
                              return response(res, 'success submit eksekusi disposal', { sendEmail })
                            } else {
                              return response(res, 'berhasil submit eksekusi disposal, tidak berhasil kirim notif email 1')
                            }
                          }
                        }
                      }
                    }
                  } else {
                    return response(res, 'failed submit disposal', {}, 400, false)
                  }
                } else {
                  return response(res, 'Approve dokumen terlebih dahulu sebelum submit', {}, 400, false)
                }
              } else {
                const cek = []
                for (let i = 0; i < findDoc.length; i++) {
                  if (findDoc[i].path !== null) {
                    cek.push(1)
                  }
                }
                if (cek.length === findDoc.length) {
                  const data = {
                    status_form: level === 5 ? 5 : 6
                  }
                  const results = await result.update(data)
                  if (results) {
                    const findUser = await user.findOne({
                      where: {
                        user_level: 2
                      }
                    })
                    if (findUser) {
                      const data = {
                        kode_plant: result.kode_plant,
                        jenis: 'disposal',
                        no_proses: no,
                        list_appr: findUser.username,
                        keterangan: 'eksekusi',
                        response: 'request'
                      }
                      const createNotif = await notif.create(data)
                      if (createNotif) {
                        const tableTd = `
                        <tr>
                          <td>1</td>
                          <td>D${result.no_disposal}</td>
                          <td>${result.no_asset}</td>
                          <td>${result.nama_asset}</td>
                          <td>${result.cost_center}</td>
                          <td>${result.area}</td>
                        </tr>`
                        const mailOptions = {
                          from: 'noreply_asset@pinusmerahabadi.co.id',
                          replyTo: 'noreply_asset@pinusmerahabadi.co.id',
                          // to: `${findUser.email}`,
                          to: `${emailAss}, ${emailAss2}`,
                          subject: `Eksekusi Disposal No Asset ${result.no_asset} `,
                          html: `
                          <head>
                            <style type="text/css">
                            body {
                                display: flexbox;
                                flex-direction: column;
                            }
                            .tittle {
                                font-size: 15px;
                            }
                            .mar {
                                margin-bottom: 20px;
                            }
                            .mar1 {
                                margin-bottom: 10px;
                            }
                            .foot {
                                margin-top: 20px;
                                margin-bottom: 10px;
                            }
                            .foot1 {
                                margin-bottom: 50px;
                            }
                            .position {
                                display: flexbox;
                                flex-direction: row;
                                justify-content: left;
                                margin-top: 10px;
                            }
                            table {
                                font-family: "Lucida Sans Unicode", "Lucida Grande", "Segoe Ui";
                                font-size: 12px;
                            }
                            .demo-table {
                                border-collapse: collapse;
                                font-size: 13px;
                            }
                            .demo-table th, 
                            .demo-table td {
                                border-bottom: 1px solid #e1edff;
                                border-left: 1px solid #e1edff;
                                padding: 7px 17px;
                            }
                            .demo-table th, 
                            .demo-table td:last-child {
                                border-right: 1px solid #e1edff;
                            }
                            .demo-table td:first-child {
                                border-top: 1px solid #e1edff;
                            }
                            .demo-table td:last-child{
                                border-bottom: 0;
                            }
                            caption {
                                caption-side: top;
                                margin-bottom: 10px;
                            }
                            
                            /* Table Header */
                            .demo-table thead th {
                                background-color: #508abb;
                                color: #FFFFFF;
                                border-color: #6ea1cc !important;
                                text-transform: uppercase;
                            }
                            
                            /* Table Body */
                            .demo-table tbody td {
                                color: #353535;
                            }
                            
                            .demo-table tbody tr:nth-child(odd) td {
                                background-color: #f4fbff;
                            }
                            .demo-table tbody tr:hover th,
                            .demo-table tbody tr:hover td {
                                background-color: #ffffa2;
                                border-color: #ffff0f;
                                transition: all .2s;
                            }
                        </style>
                          </head>
                          <body>
                              <div class="tittle mar">
                                  Dear Bapak/Ibu Asset,
                              </div>
                              <div class="tittle mar1">
                                  <div>Mohon untuk proses disposal asset area.</div>
                              </div>
                              <div class="position">
                                  <table class="demo-table">
                                      <thead>
                                          <tr>
                                              <th>No</th>
                                              <th>No Disposal</th>
                                              <th>Asset</th>
                                              <th>Asset description</th>
                                              <th>Cost Ctr</th>
                                              <th>Cost Ctr Name</th>
                                          </tr>
                                      </thead>
                                      <tbody>
                                        ${tableTd}
                                      </tbody>
                                  </table>
                              </div>
                              <a href="http://aset.pinusmerahabadi.co.id/">Klik link berikut untuk akses web asset</a>
                              <div class="tittle foot">
                                  Terima kasih,
                              </div>
                              <div class="tittle foot1">
                                  Regards,
                              </div>
                              <div class="tittle">
                                  Team Asset
                              </div>
                          </body>
                          `
                        }
                        const sendEmail = await wrapMail.wrapedSendMail(mailOptions)
                        if (sendEmail) {
                          return response(res, 'success submit eksekusi disposal', { sendEmail })
                        } else {
                          return response(res, 'berhasil submit eksekusi disposal, tidak berhasil kirim notif email 1')
                        }
                      }
                    }
                  } else {
                    return response(res, 'failed submit disposal', {}, 400, false)
                  }
                } else {
                  return response(res, 'Upload dokumen terlebih dahulu sebelum submit', {}, 400, false)
                }
              }
            } else {
              return response(res, 'Upload dokumen terlebih dahulu sebelum submit', {}, 400, false)
            }
          }
        }
      } else {
        return response(res, 'failed submit disposal', {}, 400, false)
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  submitTaxFin: async (req, res) => {
    try {
      const level = req.user.level
      const no = req.params.no
      const result = await disposal.findOne({
        where: {
          no_asset: no
        }
      })
      if (result) {
        if (result.no_io === '3' || result.no_io === '4') {
          if ((result.no_io === '3' && level === 3) || (result.no_io === '4' && level === 4)) {
            return response(res, 'success submit eksekusi disposal')
          } else {
            const data = {
              status_form: 7,
              no_io: null
            }
            const results = await result.update(data)
            if (results) {
              const findUser = await user.findOne({
                where: {
                  user_level: 2
                }
              })
              if (findUser) {
                const data = {
                  kode_plant: result.kode_plant,
                  jenis: 'disposal',
                  no_proses: no,
                  list_appr: findUser.username,
                  keterangan: 'tax and finance',
                  response: 'request'
                }
                const findNotif = await notif.findAll({
                  where: {
                    no_proses: no,
                    [Op.or]: [
                      { keterangan: 'tax' },
                      { keterangan: 'finance' }
                    ]
                  }
                })
                if (findNotif) {
                  const cekData = []
                  for (let i = 0; i < findNotif.length; i++) {
                    const findDel = await notif.findByPk(findNotif[i].id)
                    if (findDel) {
                      await findDel.destroy()
                      cekData.push(1)
                    }
                  }
                  if (cekData.length === findNotif.length) {
                    const createNotif = await notif.create(data)
                    if (createNotif) {
                      const findEmail = await email.findOne({
                        where: {
                          kode_plant: result.kode_plant
                        }
                      })
                      if (findEmail) {
                        const ccTax = [findEmail.email_am, findEmail.email_aam, findEmail.email_spv_asset, findEmail.email_spv_tax, findEmail.email_staff_tax, findEmail.email_nom, findEmail.email_bm, findEmail.email_area_om, findEmail.email_area_aos, findEmail.email_ga_spv, findEmail.email_staff_ga]
                        const ccTaxIt = [findEmail.email_am, findEmail.email_aam, findEmail.email_spv_asset, findEmail.spv_tax, findEmail.staff_tax, findEmail.email_nom, findEmail.email_bm, findEmail.email_area_om, findEmail.email_area_aos, findEmail.email_it_spv, findEmail.email_ism, findEmail.email_staff_it, findEmail.email_ga_spv, findEmail.email_staff_ga]
                        const ccFinIt = [findEmail.email_am, findEmail.email_aam, findEmail.email_spv_asset, findEmail.email_fm, findEmail.email_afm, findEmail.email_spv_finance, findEmail.email_staff_admbank, findEmail.email_nom, findEmail.email_bm, findEmail.email_area_om, findEmail.email_area_aos, findEmail.email_it_spv, findEmail.email_ism, findEmail.email_staff_it, findEmail.email_ga_spv, findEmail.email_staff_ga]
                        const ccFin = [findEmail.email_am, findEmail.email_aam, findEmail.email_spv_asset, findEmail.email_fm, findEmail.email_afm, findEmail.email_spv_finance, findEmail.email_staff_admbank, findEmail.email_nom, findEmail.email_bm, findEmail.email_area_om, findEmail.email_area_aos, findEmail.email_ga_spv, findEmail.email_staff_ga]
                        const tableTd = `
                        <tr>
                          <td>1</td>
                          <td>D${result.no_disposal}</td>
                          <td>${result.no_asset}</td>
                          <td>${result.nama_asset}</td>
                          <td>${result.cost_center}</td>
                          <td>${result.area}</td>
                          <td>${result.no_sap}</td>
                          <td>${result.nominal}</td>
                        </tr>`
                        const tableTax = `
                        <tr>
                          <td>1</td>
                          <td>D${result.no_disposal}</td>
                          <td>${result.no_asset}</td>
                          <td>${result.nama_asset}</td>
                          <td>${result.cost_center}</td>
                          <td>${result.area}</td>
                          <td>${result.no_fp}</td>
                        </tr>`
                        const mailOptions = {
                          from: 'noreply_asset@pinusmerahabadi.co.id',
                          replyTo: 'noreply_asset@pinusmerahabadi.co.id',
                          to: `${emailAss}, ${emailAss2}`,
                          // to: `${findEmail.email_staff_asset1}, ${findEmail.email_staff_asset2}`,
                          // cc: result.kategori === 'IT' || result.kategori === 'it' ? `${ccFinIt}` : `${ccFin}`,
                          subject: `Hasil jurnal uang masuk disposal asset ${result.no_asset} `,
                          html: `
                          <head>
                            <style type="text/css">
                            body {
                                display: flexbox;
                                flex-direction: column;
                            }
                            .tittle {
                                font-size: 15px;
                            }
                            .mar {
                                margin-bottom: 20px;
                            }
                            .mar1 {
                                margin-bottom: 10px;
                            }
                            .foot {
                                margin-top: 20px;
                                margin-bottom: 10px;
                            }
                            .foot1 {
                                margin-bottom: 50px;
                            }
                            .position {
                                display: flexbox;
                                flex-direction: row;
                                justify-content: left;
                                margin-top: 10px;
                            }
                            table {
                                font-family: "Lucida Sans Unicode", "Lucida Grande", "Segoe Ui";
                                font-size: 12px;
                            }
                            .demo-table {
                                border-collapse: collapse;
                                font-size: 13px;
                            }
                            .demo-table th, 
                            .demo-table td {
                                border-bottom: 1px solid #e1edff;
                                border-left: 1px solid #e1edff;
                                padding: 7px 17px;
                            }
                            .demo-table th, 
                            .demo-table td:last-child {
                                border-right: 1px solid #e1edff;
                            }
                            .demo-table td:first-child {
                                border-top: 1px solid #e1edff;
                            }
                            .demo-table td:last-child{
                                border-bottom: 0;
                            }
                            caption {
                                caption-side: top;
                                margin-bottom: 10px;
                            }
                            
                            /* Table Header */
                            .demo-table thead th {
                                background-color: #508abb;
                                color: #FFFFFF;
                                border-color: #6ea1cc !important;
                                text-transform: uppercase;
                            }
                            
                            /* Table Body */
                            .demo-table tbody td {
                                color: #353535;
                            }
                            
                            .demo-table tbody tr:nth-child(odd) td {
                                background-color: #f4fbff;
                            }
                            .demo-table tbody tr:hover th,
                            .demo-table tbody tr:hover td {
                                background-color: #ffffa2;
                                border-color: #ffff0f;
                                transition: all .2s;
                            }
                        </style>
                          </head>
                          <body>
                              <div class="tittle mar">
                                  Dear Team Asset,
                              </div>
                              <div class="tittle mar1">
                                  <div>Berikut no dokumen atas penjurnalan uang masuk disposal asset ke HO:</div>
                              </div>
                              <div class="position mar1">
                                  <table class="demo-table">
                                      <thead>
                                          <tr>
                                              <th>No</th>
                                              <th>No Pengajuan Disposal</th>
                                              <th>Asset</th>
                                              <th>Asset description</th>
                                              <th>Cost Ctr</th>
                                              <th>Cost Ctr Name</th>
                                              <th>No.Doc Finance</th>
                                              <th>Nominal Uang Masuk</th>
                                          </tr>
                                      </thead>
                                      <tbody>
                                        ${tableTd}
                                      </tbody>
                                  </table>
                              </div>
                              <a href="http://aset.pinusmerahabadi.co.id/">Klik link berikut untuk akses web asset</a>
                              <div class="tittle foot">
                                  Terima kasih,
                              </div>
                              <div class="tittle foot1">
                                  Regards,
                              </div>
                              <div class="tittle">
                                  Team Finance
                              </div>
                          </body>
                          `
                        }
                        const mailOptionsTax = {
                          from: 'noreply_asset@pinusmerahabadi.co.id',
                          replyTo: 'noreply_asset@pinusmerahabadi.co.id',
                          to: `${emailAss}, ${emailAss2}`,
                          // to: `${findEmail.email_staff_asset1}, ${findEmail.email_staff_asset2}`,
                          // cc: result.kategori === 'IT' || result.kategori === 'it' ? `${ccTaxIt}` : `${ccTax}`,
                          subject: `Done permintaan FP disposal asset ${result.no_asset} `,
                          html: `
                          <head>
                            <style type="text/css">
                            body {
                                display: flexbox;
                                flex-direction: column;
                            }
                            .tittle {
                                font-size: 15px;
                            }
                            .mar {
                                margin-bottom: 20px;
                            }
                            .mar1 {
                                margin-bottom: 10px;
                            }
                            .foot {
                                margin-top: 20px;
                                margin-bottom: 10px;
                            }
                            .foot1 {
                                margin-bottom: 50px;
                            }
                            .position {
                                display: flexbox;
                                flex-direction: row;
                                justify-content: left;
                                margin-top: 10px;
                            }
                            table {
                                font-family: "Lucida Sans Unicode", "Lucida Grande", "Segoe Ui";
                                font-size: 12px;
                            }
                            .demo-table {
                                border-collapse: collapse;
                                font-size: 13px;
                            }
                            .demo-table th, 
                            .demo-table td {
                                border-bottom: 1px solid #e1edff;
                                border-left: 1px solid #e1edff;
                                padding: 7px 17px;
                            }
                            .demo-table th, 
                            .demo-table td:last-child {
                                border-right: 1px solid #e1edff;
                            }
                            .demo-table td:first-child {
                                border-top: 1px solid #e1edff;
                            }
                            .demo-table td:last-child{
                                border-bottom: 0;
                            }
                            caption {
                                caption-side: top;
                                margin-bottom: 10px;
                            }
                            
                            /* Table Header */
                            .demo-table thead th {
                                background-color: #508abb;
                                color: #FFFFFF;
                                border-color: #6ea1cc !important;
                                text-transform: uppercase;
                            }
                            
                            /* Table Body */
                            .demo-table tbody td {
                                color: #353535;
                            }
                            
                            .demo-table tbody tr:nth-child(odd) td {
                                background-color: #f4fbff;
                            }
                            .demo-table tbody tr:hover th,
                            .demo-table tbody tr:hover td {
                                background-color: #ffffa2;
                                border-color: #ffff0f;
                                transition: all .2s;
                            }
                        </style>
                          </head>
                          <body>
                              <div class="tittle mar">
                                  Dear Team Asset,
                              </div>
                              <div class="tittle mar1">
                                  <div>Faktur pajak atas penjualan asset dibawah ini telah kami buatkan:</div>
                              </div>
                              <div class="position mar1">
                                  <table class="demo-table">
                                      <thead>
                                          <tr>
                                              <th>No</th>
                                              <th>No Pengajuan Disposal</th>
                                              <th>Asset</th>
                                              <th>Asset description</th>
                                              <th>Cost Ctr</th>
                                              <th>Cost Ctr Name</th>
                                              <th>No.Faktur Pajak</th>
                                          </tr>
                                      </thead>
                                      <tbody>
                                        ${tableTax}
                                      </tbody>
                                  </table>
                              </div>
                              <a href="http://aset.pinusmerahabadi.co.id/">Klik link berikut untuk akses web asset</a>
                              <div class="tittle foot">
                                  Terima kasih,
                              </div>
                              <div class="tittle foot1">
                                  Regards,
                              </div>
                              <div class="tittle">
                                  Team Tax
                              </div>
                          </body>
                          `
                        }
                        const sendEmail = await wrapMail.wrapedSendMail(mailOptions)
                        if (sendEmail) {
                          const sendEmail1 = await wrapMail.wrapedSendMail(mailOptionsTax)
                          if (sendEmail1) {
                            return response(res, 'success submit eksekusi disposal')
                          } else {
                            return response(res, 'berhasil submit eksekusi disposal, tidak berhasil kirim notif email 1')
                          }
                        } else {
                          const sendEmail1 = await wrapMail.wrapedSendMail(mailOptionsTax)
                          if (sendEmail1) {
                            return response(res, 'success submit eksekusi disposal')
                          } else {
                            return response(res, 'berhasil submit eksekusi disposal, tidak berhasil kirim notif email 1')
                          }
                        }
                      }
                    }
                  }
                }
              }
            } else {
              return response(res, 'failed submit disposal', {}, 400, false)
            }
          }
        } else {
          const data = {
            status_form: 6,
            no_io: level
          }
          const results = await result.update(data)
          if (results) {
            return response(res, 'success submit eksekusi disposal')
          } else {
            return response(res, 'failed submit disposal', {}, 400, false)
          }
        }
      } else {
        return response(res, 'failed submit disposal', {}, 400, false)
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  submitFinal: async (req, res) => {
    try {
      const no = req.params.no
      const result = await disposal.findOne({
        where: {
          no_asset: no
        }
      })
      if (result) {
        const findDoc = await docUser.findAll({
          where: {
            [Op.and]: [
              { jenis_form: 'disposal' },
              { no_pengadaan: no }
            ],
            [Op.or]: [
              { tipe: 'finance' },
              { tipe: 'tax' }
            ]
          }
        })
        if (findDoc.length > 0) {
          const cek = []
          for (let i = 0; i < findDoc.length; i++) {
            if (findDoc[i].divisi === '3' || findDoc[i].status === 3) {
              cek.push(1)
            }
          }
          if (cek.length === findDoc.length) {
            const data = {
              status_form: 8
            }
            const results = await result.update(data)
            if (results) {
              const findUser = await email.findOne({
                where: {
                  kode_plant: result.kode_plant
                }
              })
              if (findUser) {
                const findAsset = await asset.findOne({
                  where: {
                    no_asset: no
                  }
                })
                if (findAsset) {
                  const send = {
                    status: '0'
                  }
                  await findAsset.update(send)
                  const cc = [findUser.email_am, findUser.email_aam, findUser.email_spv_asset, findUser.email_staff_asset1, findUser.email_staff_asset2, findUser.email_nom, findUser.email_bm, findUser.email_area_om, findUser.email_ga_spv, findUser.email_staff_ga]
                  const ccIt = [findUser.email_am, findUser.email_aam, findUser.email_spv_asset, findUser.email_staff_asset1, findUser.email_staff_asset2, findUser.email_nom, findUser.email_bm, findUser.email_area_om, findUser.email_it_spv, findUser.email_ism, findUser.email_staff_it, findUser.email_ga_spv, findUser.email_staff_ga]
                  const tableTd = `
                  <tr>
                    <td>1</td>
                    <td>D${result.no_disposal}</td>
                    <td>${result.no_asset}</td>
                    <td>${result.nama_asset}</td>
                    <td>${result.cost_center}</td>
                    <td>${result.area}</td>
                  </tr>`
                  const tableTax = `
                  <tr>
                    <td>${result.no_asset}</td>
                    <td>${result.nama_asset}</td>
                    <td>${result.cost_center}</td>
                    <td>${result.area}</td>
                    <td>${result.doc_sap}</td>
                  </tr>`
                  const mailOptions = {
                    from: 'noreply_asset@pinusmerahabadi.co.id',
                    replyTo: 'noreply_asset@pinusmerahabadi.co.id',
                    to: `${emailAss}, ${emailAss2}`,
                    // to: `${findUser.email_area_aos}, ${findUser.email_spv_tax}, ${findUser.email_staff_tax}`,
                    // cc: result.kategori === 'IT' || result.kategori === 'it' ? `${ccIt}` : `${cc}`,
                    subject: `Hasil jurnal disposal asset ${result.area} ${result.no_asset} `,
                    html: `
                      <head>
                        <style type="text/css">
                        body {
                            display: flexbox;
                            flex-direction: column;
                        }
                        .tittle {
                            font-size: 15px;
                        }
                        .mar {
                            margin-bottom: 20px;
                        }
                        .mar1 {
                            margin-bottom: 10px;
                        }
                        .foot {
                            margin-top: 20px;
                            margin-bottom: 10px;
                        }
                        .foot1 {
                            margin-bottom: 50px;
                        }
                        .position {
                            display: flexbox;
                            flex-direction: row;
                            justify-content: left;
                            margin-top: 10px;
                        }
                        table {
                            font-family: "Lucida Sans Unicode", "Lucida Grande", "Segoe Ui";
                            font-size: 12px;
                        }
                        .demo-table {
                            border-collapse: collapse;
                            font-size: 13px;
                        }
                        .demo-table th, 
                        .demo-table td {
                            border-bottom: 1px solid #e1edff;
                            border-left: 1px solid #e1edff;
                            padding: 7px 17px;
                        }
                        .demo-table th, 
                        .demo-table td:last-child {
                            border-right: 1px solid #e1edff;
                        }
                        .demo-table td:first-child {
                            border-top: 1px solid #e1edff;
                        }
                        .demo-table td:last-child{
                            border-bottom: 0;
                        }
                        caption {
                            caption-side: top;
                            margin-bottom: 10px;
                        }
                        
                        /* Table Header */
                        .demo-table thead th {
                            background-color: #508abb;
                            color: #FFFFFF;
                            border-color: #6ea1cc !important;
                            text-transform: uppercase;
                        }
                        
                        /* Table Body */
                        .demo-table tbody td {
                            color: #353535;
                        }
                        
                        .demo-table tbody tr:nth-child(odd) td {
                            background-color: #f4fbff;
                        }
                        .demo-table tbody tr:hover th,
                        .demo-table tbody tr:hover td {
                            background-color: #ffffa2;
                            border-color: #ffff0f;
                            transition: all .2s;
                        }
                        .martit2 {
                            font-size: 15px;
                            margin-top: 20px;
                            margin-bottom: 20px;
                            font-weight: bold;
                        }
                        .martit {
                            font-size: 15px;
                            margin-bottom: 20px;
                            font-weight: bold;
                        }
                        .martit3 {
                            font-size: 15px;
                            margin-top: 10px;
                        }
                      </style>
                      </head>
                      <body>
                        <div class="martit">
                            Dear Bapak/Ibu AOS,
                        </div>
                        <div class="tittle mar1">
                            <div>Asset yang dijual dibawah ini telah dihapuskan secara SAP.</div>
                        </div>
                        <div class="position">
                            <table class="demo-table">
                                <thead>
                                    <tr>
                                        <th>No</th>
                                        <th>No Disposal</th>
                                        <th>Asset</th>
                                        <th>Asset description</th>
                                        <th>Cost Ctr</th>
                                        <th>Cost Ctr Name</th>
                                    </tr>
                                </thead>
                                <tbody>
                                  ${tableTd}
                                </tbody>
                            </table>
                        </div>
                        <div class="martit3">Mohon agar mengirimkan seluruh dokumen aslinya ke PMA HO Bandung Up tim accounting asset.</div>
                        <div class="tittle">Terlampir form disposal yang sudah selesai diproses.</div>
                        <div class="martit2">
                            Dear Bapak/Ibu Tim Tax,
                        </div>
                        <div class="tittle mar1">
                            <div>Asset yang dijual dibawah ini telah dihapuskan secara SAP.</div>
                        </div>
                        <div class="position">
                            <table class="demo-table">
                                <thead>
                                    <tr>
                                        <th>Asset</th>
                                        <th>Asset description</th>
                                        <th>Cost Ctr</th>
                                        <th>Cost Ctr Name</th>
                                        <th>No Doc SAP</th>
                                    </tr>
                                </thead>
                                <tbody>
                                  ${tableTax}
                                </tbody>
                            </table>
                        </div>
                        <a href="http://aset.pinusmerahabadi.co.id/">Klik link berikut untuk akses web asset</a>
                        <div class="tittle foot">
                            Terima kasih,
                        </div>
                        <div class="tittle foot1">
                            Regards,
                        </div>
                        <div class="tittle">
                            Team Asset
                        </div>
                    </body>
                      `
                  }
                  const sendEmail = await wrapMail.wrapedSendMail(mailOptions)
                  if (sendEmail) {
                    return response(res, 'success submit disposal', { sendEmail })
                  } else {
                    return response(res, 'berhasil submit disposal, tidak berhasil kirim notif email 1')
                  }
                } else {
                  return response(res, 'failed submit disposal', {}, 400, false)
                }
              }
            } else {
              return response(res, 'failed submit disposal', {}, 400, false)
            }
          } else {
            return response(res, 'approve dokumen terlebih dahulu', {}, 400, false)
          }
        } else {
          return response(res, 'Tidak ada dokumen finance dan tax', {}, 400, false)
        }
      } else {
        return response(res, 'failed submit disposal', {}, 400, false)
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  submitPurch: async (req, res) => {
    try {
      const no = req.params.no
      const result = await disposal.findOne({
        where: {
          no_asset: no
        }
      })
      if (result) {
        const findDoc = await docUser.findAll({
          where: {
            no_pengadaan: result.no_asset,
            [Op.and]: [
              { jenis_form: 'disposal' },
              { tipe: 'purch' }
            ]
          }
        })
        if (findDoc.length > 0) {
          const cek = []
          for (let i = 0; i < findDoc.length; i++) {
            if (findDoc[i].path !== null) {
              cek.push(1)
            }
          }
          if (cek.length === findDoc.length) {
            const data = {
              status_form: 2
            }
            const results = await result.update(data)
            if (results) {
              const findDepo = await depo.findOne({
                where: {
                  kode_plant: result.kode_plant
                }
              })
              if (findDepo) {
                const findEmail = await user.findOne({
                  where: {
                    [Op.or]: [
                      { username: findDepo.nama_bm }
                    ]
                  }
                })
                if (findEmail) {
                  const data = {
                    list_appr: findEmail.username
                  }
                  const findNotif = await notif.findOne({
                    where: {
                      [Op.and]: [
                        { no_proses: 'D' + result.no_disposal },
                        { kode_plant: result.kode_plant }
                      ]
                    }
                  })
                  if (findNotif) {
                    const createNotif = await findNotif.update(data)
                    if (createNotif) {
                      const findDis = await disposal.findAll({
                        where: {
                          no_disposal: result.no_disposal
                        }
                      })
                      if (findDis) {
                        let tableTd = ''
                        for (let i = 0; i < findDis.length; i++) {
                          const element = `
                          <tr>
                            <td>${findDis.indexOf(findDis[i]) + 1}</td>
                            <td>D${findDis[i].no_disposal}</td>
                            <td>${findDis[i].no_asset}</td>
                            <td>${findDis[i].nama_asset}</td>
                            <td>${findDis[i].cost_center}</td>
                            <td>${findDis[i].area}</td>
                          </tr>`
                          tableTd = tableTd + element
                        }
                        const mailOptions = {
                          from: 'noreply_asset@pinusmerahabadi.co.id',
                          replyTo: 'noreply_asset@pinusmerahabadi.co.id',
                          // to: `${findEmail.email}`,
                          to: `${emailAss}, ${emailAss2}`,
                          subject: `Approve Pengajuan Disposal D${result.no_disposal} `,
                          html: `
                            <head>
                              <style type="text/css">
                              body {
                                  display: flexbox;
                                  flex-direction: column;
                              }
                              .tittle {
                                  font-size: 15px;
                              }
                              .mar {
                                  margin-bottom: 20px;
                              }
                              .mar1 {
                                  margin-bottom: 10px;
                              }
                              .foot {
                                  margin-top: 20px;
                                  margin-bottom: 10px;
                              }
                              .foot1 {
                                  margin-bottom: 50px;
                              }
                              .position {
                                  display: flexbox;
                                  flex-direction: row;
                                  justify-content: left;
                                  margin-top: 10px;
                              }
                              table {
                                  font-family: "Lucida Sans Unicode", "Lucida Grande", "Segoe Ui";
                                  font-size: 12px;
                              }
                              .demo-table {
                                  border-collapse: collapse;
                                  font-size: 13px;
                              }
                              .demo-table th, 
                              .demo-table td {
                                  border-bottom: 1px solid #e1edff;
                                  border-left: 1px solid #e1edff;
                                  padding: 7px 17px;
                              }
                              .demo-table th, 
                              .demo-table td:last-child {
                                  border-right: 1px solid #e1edff;
                              }
                              .demo-table td:first-child {
                                  border-top: 1px solid #e1edff;
                              }
                              .demo-table td:last-child{
                                  border-bottom: 0;
                              }
                              caption {
                                  caption-side: top;
                                  margin-bottom: 10px;
                              }
                              
                              /* Table Header */
                              .demo-table thead th {
                                  background-color: #508abb;
                                  color: #FFFFFF;
                                  border-color: #6ea1cc !important;
                                  text-transform: uppercase;
                              }
                              
                              /* Table Body */
                              .demo-table tbody td {
                                  color: #353535;
                              }
                              
                              .demo-table tbody tr:nth-child(odd) td {
                                  background-color: #f4fbff;
                              }
                              .demo-table tbody tr:hover th,
                              .demo-table tbody tr:hover td {
                                  background-color: #ffffa2;
                                  border-color: #ffff0f;
                                  transition: all .2s;
                              }
                          </style>
                            </head>
                            <body>
                                <div class="tittle mar">
                                    Dear Bapak/Ibu BM,
                                </div>
                                <div class="tittle mar1">
                                    <div>Mohon untuk approve pengajuan disposal asset area.</div>
                                </div>
                                <div class="position">
                                    <table class="demo-table">
                                        <thead>
                                            <tr>
                                                <th>No</th>
                                                <th>No Disposal</th>
                                                <th>Asset</th>
                                                <th>Asset description</th>
                                                <th>Cost Ctr</th>
                                                <th>Cost Ctr Name</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                          ${tableTd}
                                        </tbody>
                                    </table>
                                </div>
                                <a href="http://aset.pinusmerahabadi.co.id/">Klik link berikut untuk akses web asset</a>
                                <div class="tittle foot">
                                    Terima kasih,
                                </div>
                                <div class="tittle foot1">
                                    Regards,
                                </div>
                                <div class="tittle">
                                    Team Asset
                                </div>
                            </body>
                          `
                        }
                        const sendEmail = await wrapMail.wrapedSendMail(mailOptions)
                        if (sendEmail) {
                          return response(res, 'success submit eksekusi disposal', { sendEmail })
                        } else {
                          return response(res, 'berhasil submit eksekusi disposal, tidak berhasil kirim notif email 1')
                        }
                      }
                    }
                  }
                }
              }
            } else {
              return response(res, 'failed submit disposal', {}, 400, false)
            }
          } else {
            return response(res, 'Upload dokumen terlebih dahulu sebelum submit', {}, 400, false)
          }
        } else {
          return response(res, 'Upload dokumen terlebih dahulu sebelum submit', {}, 400, false)
        }
      } else {
        return response(res, 'failed submit disposal', {}, 400, false)
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  updateStatus: async (req, res) => {
    try {
      const result = await disposal.findAll({
        where: {
          status_form: 8
        }
      })
      if (result.length > 0) {
        const cek = []
        const data = {
          status: '0'
        }
        for (let i = 0; i < result.length; i++) {
          const findDep = await asset.findOne({
            where: {
              no_asset: result[i].no_asset
            }
          })
          if (findDep) {
            await findDep.update(data)
            cek.push(1)
          }
        }
        if (cek.length > 0) {
          return response(res, 'berhasil update', {})
        } else {
          return response(res, 'semua sudah sesuai', {})
        }
      } else {
        return response(res, 'failed update status asset', {}, 404, false)
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  getDocumentPurch: async (req, res) => {
    try {
      const result = await disposal.findAll({
        where: {
          [Op.or]: [
            { status_reject: 2 },
            { status_reject: 3 }
          ],
          [Op.not]: [
            { isreject: 2 },
            { isreject: null },
            { isreject: 0 }
          ]
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
          },
          {
            model: docUser,
            as: 'docAsset'
          }
        ]
      })
      if (result) {
        return response(res, 'success', { result: { rows: result, count: result.length } })
      } else {
        return response(res, 'success', { result: { rows: result, count: result.length } })
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  submitEditDis: async (req, res) => {
    try {
      const no = req.params.no
      const { id } = req.query
      const level = req.user.level
      const resdis = await disposal.findByPk(id)
      if (resdis) {
        const resdok = await docUser.findAll({
          where: {
            no_pengadaan: resdis.no_asset,
            [Op.and]: [
              { jenis_form: 'disposal' },
              {
                [Op.or]: [
                  { tipe: 'pengajuan' },
                  { tipe: 'jual' },
                  { tipe: 'purch' }
                ]
              }
            ]
          }
        })
        if (resdok.length > 0) {
          const cekdok = []
          for (let i = 0; i < resdok.length; i++) {
            if (resdok[i].divisi === '0' || resdok[i].status === 0) {
              cekdok.push(1)
            }
          }
          if (cekdok.length > 0) {
            const data = {
              status_reject: level === 6 ? 1 : 2
            }
            const updis = await resdis.update(data)
            if (updis) {
              return response(res, 'succes submit edit disposal')
            } else {
              return response(res, 'failed submit edit disposal1', {}, 404, false)
            }
          } else {
            const data = {
              isreject: 2
            }
            const updis = await resdis.update(data)
            if (updis) {
              const findDis = await disposal.findAll({
                where: {
                  no_disposal: no
                }
              })
              if (findDis.length > 0) {
                const cek = []
                for (let i = 0; i < findDis.length; i++) {
                  if (findDis[i].isreject === 2 || findDis[i].isreject === null) {
                    cek.push(1)
                  }
                }
                if (cek.length === findDis.length) {
                  const valid = []
                  for (let i = 0; i < findDis.length; i++) {
                    const cekDis = await disposal.findByPk(findDis[i].id)
                    if (cekDis) {
                      const data = {
                        status_reject: 4
                      }
                      await cekDis.update(data)
                      valid.push(1)
                    }
                  }
                  if (valid.length > 0) {
                    return response(res, 'succes submit edit disposal')
                  } else {
                    return response(res, 'succes submit edit disposal')
                  }
                } else {
                  return response(res, 'succes submit edit disposal')
                }
              } else {
                return response(res, 'failed submit edit disposal2', {}, 404, false)
              }
            } else {
              return response(res, 'failed submit edit disposal3', {}, 404, false)
            }
          }
        } else {
          return response(res, 'failed submit edit disposal4', { resdok }, 404, false)
        }
      } else {
        return response(res, 'failed submit edit disposal5', {}, 404, false)
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  rejectEks: async (req, res) => {
    try {
      const { id } = req.query
      const { reason } = req.body
      const resdis = await disposal.findByPk(id)
      if (resdis) {
        const data = {
          isreject: 1,
          status_reject: 5,
          reason: reason
        }
        const updis = await resdis.update(data)
        if (updis) {
          const findEmail = await depo.findOne({
            where: {
              kode_plant: resdis.kode_plant
            }
          })
          if (findEmail) {
            const data = {
              kode_plant: resdis.kode_plant,
              jenis: 'disposal',
              no_proses: `D${resdis.no_disposal}`,
              list_appr: resdis.kode_plant,
              keterangan: 'reject eksekusi',
              response: 'reject',
              status: null,
              route: 'editeks'
            }
            const tableTd = `
            <tr>
              <td>1</td>
              <td>D${resdis.no_disposal}</td>
              <td>${resdis.no_asset}</td>
              <td>${resdis.nama_asset}</td>
              <td>${resdis.cost_center}</td>
              <td>${resdis.area}</td>
            </tr>`
            const ccIt = [findEmail.email_am, findEmail.email_aam, findEmail.email_spv_asset, findEmail.email_staff_asset1, findEmail.email_staff_asset2, findEmail.email_nom, findEmail.email_bm, findEmail.email_area_om, findEmail.email_it_spv, findEmail.email_ism, findEmail.email_staff_it, findEmail.email_ga_spv, findEmail.email_staff_ga]
            const cc = [findEmail.email_am, findEmail.email_aam, findEmail.email_spv_asset, findEmail.email_staff_asset1, findEmail.email_staff_asset2, findEmail.email_nom, findEmail.email_bm, findEmail.email_area_om, findEmail.email_ga_spv, findEmail.email_staff_ga]
            const findNotif = await notif.findOne({
              where: {
                kode_plant: resdis.kode_plant,
                jenis: 'disposal',
                no_proses: `D${resdis.no_disposal}`,
                list_appr: resdis.kode_plant,
                keterangan: 'reject eksekusi',
                response: 'reject'
              }
            })
            if (findNotif) {
              if (findNotif.status === null) {
                return response(res, 'success reject eksekusi')
              } else {
                await findNotif.update(data)
                const mailOptions = {
                  from: 'noreply_asset@pinusmerahabadi.co.id',
                  replyTo: 'noreply_asset@pinusmerahabadi.co.id',
                  // to: `${findEmail.email_area_aos}`,
                  to: `${emailAss}, ${emailAss2}`,
                  // cc: findDis.kategori === 'it' || findDis.kategori === 'IT' ? `${ccIt}` : `${cc}`,
                  subject: `REJECT KELENGKAPAN EKSEKUSI DISPOSAL ASSET ${resdis.area} `,
                  html: `
                  <head>
                    <style type="text/css">
                    body {
                        display: flexbox;
                        flex-direction: column;
                    }
                    .tittle {
                        font-size: 15px;
                    }
                    .mar {
                        margin-bottom: 20px;
                    }
                    .mar1 {
                        margin-bottom: 10px;
                    }
                    .foot {
                        margin-top: 20px;
                        margin-bottom: 10px;
                    }
                    .foot1 {
                        margin-bottom: 50px;
                    }
                    .position {
                        display: flexbox;
                        flex-direction: row;
                        justify-content: left;
                        margin-top: 10px;
                    }
                    table {
                        font-family: "Lucida Sans Unicode", "Lucida Grande", "Segoe Ui";
                        font-size: 12px;
                    }
                    .demo-table {
                        border-collapse: collapse;
                        font-size: 13px;
                    }
                    .demo-table th, 
                    .demo-table td {
                        border-bottom: 1px solid #e1edff;
                        border-left: 1px solid #e1edff;
                        padding: 7px 17px;
                    }
                    .demo-table th, 
                    .demo-table td:last-child {
                        border-right: 1px solid #e1edff;
                    }
                    .demo-table td:first-child {
                        border-top: 1px solid #e1edff;
                    }
                    .demo-table td:last-child{
                        border-bottom: 0;
                    }
                    caption {
                        caption-side: top;
                        margin-bottom: 10px;
                    }
                    
                    /* Table Header */
                    .demo-table thead th {
                        background-color: #508abb;
                        color: #FFFFFF;
                        border-color: #6ea1cc !important;
                        text-transform: uppercase;
                    }
                    
                    /* Table Body */
                    .demo-table tbody td {
                        color: #353535;
                    }
                    
                    .demo-table tbody tr:nth-child(odd) td {
                        background-color: #f4fbff;
                    }
                    .demo-table tbody tr:hover th,
                    .demo-table tbody tr:hover td {
                        background-color: #ffffa2;
                        border-color: #ffff0f;
                        transition: all .2s;
                    }
                </style>
                  </head>
                  <body>
                      <div class="tittle mar">
                          Dear Bapak/Ibu,
                      </div>
                      <div class="tittle mar1">
                          <div>Lampiran  eksekusi disposal asset telah direject dengan alasan sebagai berikut:</div>
                          <div>Alasan reject: ${reason}</div>
                          <div>Direject oleh:  Team Asset</div>
                      </div>
                      <div class="position mar1">
                          <table class="demo-table">
                              <thead>
                                  <tr>
                                      <th>No</th>
                                      <th>No Disposal</th>
                                      <th>Asset</th>
                                      <th>Asset description</th>
                                      <th>Cost Ctr</th>
                                      <th>Cost Ctr Name</th>
                                  </tr>
                              </thead>
                              <tbody>
                                ${tableTd}
                              </tbody>
                          </table>
                      </div>
                      <div class="tittle">Mohon agar melengkapi/memperbaiki kelengkapan eksekusi disposal untuk dapat diproses lebih lanjut.</div>
                      <a href="http://aset.pinusmerahabadi.co.id/">Klik link berikut untuk akses web asset</a>
                      <div class="tittle foot">
                          Terima kasih,
                      </div>
                      <div class="tittle foot1">
                          Regards,
                      </div>
                      <div class="tittle">
                          Team Asset
                      </div>
                  </body>
                  `
                }
                const sendEmail = await wrapMail.wrapedSendMail(mailOptions)
                if (sendEmail) {
                  return response(res, 'success reject eksekusi', { sendEmail })
                } else {
                  return response(res, 'berhasil reject eksekusi, tidak berhasil kirim notif email 1')
                }
              }
            } else {
              await notif.create(data)
              const mailOptions = {
                from: 'noreply_asset@pinusmerahabadi.co.id',
                replyTo: 'noreply_asset@pinusmerahabadi.co.id',
                // to: `${findEmail.email_area_aos}`,
                to: `${emailAss}, ${emailAss2}`,
                // cc: findDis.kategori === 'it' || findDis.kategori === 'IT' ? `${ccIt}` : `${cc}`,
                subject: `REJECT KELENGKAPAN EKSEKUSI DISPOSAL ASSET ${resdis.area} `,
                html: `
                <head>
                  <style type="text/css">
                  body {
                      display: flexbox;
                      flex-direction: column;
                  }
                  .tittle {
                      font-size: 15px;
                  }
                  .mar {
                      margin-bottom: 20px;
                  }
                  .mar1 {
                      margin-bottom: 10px;
                  }
                  .foot {
                      margin-top: 20px;
                      margin-bottom: 10px;
                  }
                  .foot1 {
                      margin-bottom: 50px;
                  }
                  .position {
                      display: flexbox;
                      flex-direction: row;
                      justify-content: left;
                      margin-top: 10px;
                  }
                  table {
                      font-family: "Lucida Sans Unicode", "Lucida Grande", "Segoe Ui";
                      font-size: 12px;
                  }
                  .demo-table {
                      border-collapse: collapse;
                      font-size: 13px;
                  }
                  .demo-table th, 
                  .demo-table td {
                      border-bottom: 1px solid #e1edff;
                      border-left: 1px solid #e1edff;
                      padding: 7px 17px;
                  }
                  .demo-table th, 
                  .demo-table td:last-child {
                      border-right: 1px solid #e1edff;
                  }
                  .demo-table td:first-child {
                      border-top: 1px solid #e1edff;
                  }
                  .demo-table td:last-child{
                      border-bottom: 0;
                  }
                  caption {
                      caption-side: top;
                      margin-bottom: 10px;
                  }
                  
                  /* Table Header */
                  .demo-table thead th {
                      background-color: #508abb;
                      color: #FFFFFF;
                      border-color: #6ea1cc !important;
                      text-transform: uppercase;
                  }
                  
                  /* Table Body */
                  .demo-table tbody td {
                      color: #353535;
                  }
                  
                  .demo-table tbody tr:nth-child(odd) td {
                      background-color: #f4fbff;
                  }
                  .demo-table tbody tr:hover th,
                  .demo-table tbody tr:hover td {
                      background-color: #ffffa2;
                      border-color: #ffff0f;
                      transition: all .2s;
                  }
              </style>
                </head>
                <body>
                    <div class="tittle mar">
                        Dear Bapak/Ibu,
                    </div>
                    <div class="tittle mar1">
                        <div>Lampiran  eksekusi disposal asset telah direject dengan alasan sebagai berikut:</div>
                        <div>Alasan reject: ${reason}</div>
                        <div>Direject oleh:  Team Asset</div>
                    </div>
                    <div class="position mar1">
                        <table class="demo-table">
                            <thead>
                                <tr>
                                    <th>No</th>
                                    <th>No Disposal</th>
                                    <th>Asset</th>
                                    <th>Asset description</th>
                                    <th>Cost Ctr</th>
                                    <th>Cost Ctr Name</th>
                                </tr>
                            </thead>
                            <tbody>
                              ${tableTd}
                            </tbody>
                        </table>
                    </div>
                    <div class="tittle">Mohon agar melengkapi/memperbaiki kelengkapan eksekusi disposal untuk dapat diproses lebih lanjut.</div>
                    <a href="http://aset.pinusmerahabadi.co.id/">Klik link berikut untuk akses web asset</a>
                    <div class="tittle foot">
                        Terima kasih,
                    </div>
                    <div class="tittle foot1">
                        Regards,
                    </div>
                    <div class="tittle">
                        Team Asset
                    </div>
                </body>
                `
              }
              const sendEmail = await wrapMail.wrapedSendMail(mailOptions)
              if (sendEmail) {
                return response(res, 'success reject eksekusi', { sendEmail })
              } else {
                return response(res, 'berhasil reject eksekusi, tidak berhasil kirim notif email 1')
              }
            }
          } else {
            return response(res, 'success reject eksekusi failed create notif and send email')
          }
        } else {
          return response(res, 'failed reject eksekusi', {}, 404, false)
        }
      } else {
        return response(res, 'failed reject eksekusi', {}, 404, false)
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  submitEditEks: async (req, res) => {
    try {
      const { id } = req.query
      const resdis = await disposal.findByPk(id)
      if (resdis) {
        const data = {
          isreject: 2,
          status_reject: 6
        }
        const updis = await resdis.update(data)
        if (updis) {
          const findUser = await user.findOne({
            where: {
              user_level: 2
            }
          })
          if (findUser) {
            const findEmail = await email.findOne({
              where: {
                kode_plant: resdis.kode_plant
              }
            })
            if (findEmail) {
              const data = {
                kode_plant: resdis.kode_plant,
                jenis: 'disposal',
                no_proses: `D${resdis.no_disposal}`,
                list_appr: findUser.username,
                keterangan: 'revisi eksekusi',
                response: 'revisi',
                route: 'eksdis'
              }
              const tableTd = `
              <tr>
                <td>1</td>
                <td>D${resdis.no_disposal}</td>
                <td>${resdis.no_asset}</td>
                <td>${resdis.nama_asset}</td>
                <td>${resdis.cost_center}</td>
                <td>${resdis.area}</td>
              </tr>`
              const ccIt = [findEmail.email_am, findEmail.email_aam, findEmail.email_spv_asset, findEmail.email_staff_asset1, findEmail.email_staff_asset2, findEmail.email_nom, findEmail.email_bm, findEmail.email_area_om, findEmail.email_it_spv, findEmail.email_ism, findEmail.email_staff_it, findEmail.email_ga_spv, findEmail.email_staff_ga]
              const cc = [findEmail.email_am, findEmail.email_aam, findEmail.email_spv_asset, findEmail.email_staff_asset1, findEmail.email_staff_asset2, findEmail.email_nom, findEmail.email_bm, findEmail.email_area_om, findEmail.email_ga_spv, findEmail.email_staff_ga]
              const findNotif = await notif.findOne({
                where: {
                  kode_plant: resdis.kode_plant,
                  jenis: 'disposal',
                  no_proses: `D${resdis.no_disposal}`,
                  list_appr: findUser.username,
                  keterangan: 'revisi eksekusi',
                  response: 'revisi'
                }
              })
              if (findNotif) {
                if (findNotif.status === null) {
                  return response(res, 'success submit reject eksekusi')
                } else {
                  await findNotif.update(data)
                  const mailOptions = {
                    from: 'noreply_asset@pinusmerahabadi.co.id',
                    replyTo: 'noreply_asset@pinusmerahabadi.co.id',
                    // to: `${findEmail.email_staff_asset1}, ${findEmail.email_staff_asset2}`,
                    to: `${emailAss}, ${emailAss2}`,
                    // cc: findDis.kategori === 'it' || findDis.kategori === 'IT' ? `${ccIt}` : `${cc}`,
                    subject: `REVISI KELENGKAPAN EKSEKUSI DISPOSAL ASSET ${resdis.area} `,
                    html: `
                  <head>
                    <style type="text/css">
                    body {
                        display: flexbox;
                        flex-direction: column;
                    }
                    .tittle {
                        font-size: 15px;
                    }
                    .mar {
                        margin-bottom: 20px;
                    }
                    .mar1 {
                        margin-bottom: 10px;
                    }
                    .foot {
                        margin-top: 20px;
                        margin-bottom: 10px;
                    }
                    .foot1 {
                        margin-bottom: 50px;
                    }
                    .position {
                        display: flexbox;
                        flex-direction: row;
                        justify-content: left;
                        margin-top: 10px;
                    }
                    table {
                        font-family: "Lucida Sans Unicode", "Lucida Grande", "Segoe Ui";
                        font-size: 12px;
                    }
                    .demo-table {
                        border-collapse: collapse;
                        font-size: 13px;
                    }
                    .demo-table th, 
                    .demo-table td {
                        border-bottom: 1px solid #e1edff;
                        border-left: 1px solid #e1edff;
                        padding: 7px 17px;
                    }
                    .demo-table th, 
                    .demo-table td:last-child {
                        border-right: 1px solid #e1edff;
                    }
                    .demo-table td:first-child {
                        border-top: 1px solid #e1edff;
                    }
                    .demo-table td:last-child{
                        border-bottom: 0;
                    }
                    caption {
                        caption-side: top;
                        margin-bottom: 10px;
                    }
                    
                    /* Table Header */
                    .demo-table thead th {
                        background-color: #508abb;
                        color: #FFFFFF;
                        border-color: #6ea1cc !important;
                        text-transform: uppercase;
                    }
                    
                    /* Table Body */
                    .demo-table tbody td {
                        color: #353535;
                    }
                    
                    .demo-table tbody tr:nth-child(odd) td {
                        background-color: #f4fbff;
                    }
                    .demo-table tbody tr:hover th,
                    .demo-table tbody tr:hover td {
                        background-color: #ffffa2;
                        border-color: #ffff0f;
                        transition: all .2s;
                    }
                </style>
                  </head>
                  <body>
                      <div class="tittle mar">
                          Dear Team Asset,
                      </div>
                      <div class="tittle mar1">
                          <div>Mohon untuk cek hasil revisi lampiran eksekusi disposal asset dibawah ini:</div>
                      </div>
                      <div class="position mar1">
                          <table class="demo-table">
                              <thead>
                                  <tr>
                                      <th>No</th>
                                      <th>No Disposal</th>
                                      <th>Asset</th>
                                      <th>Asset description</th>
                                      <th>Cost Ctr</th>
                                      <th>Cost Ctr Name</th>
                                  </tr>
                              </thead>
                              <tbody>
                                ${tableTd}
                              </tbody>
                          </table>
                      </div>
                      <a href="http://aset.pinusmerahabadi.co.id/">Klik link berikut untuk akses web asset</a>
                      <div class="tittle foot">
                          Terima kasih,
                      </div>
                      <div class="tittle foot1">
                          Regards,
                      </div>
                      <div class="tittle">
                          Area
                      </div>
                  </body>
                  `
                  }
                  const sendEmail = await wrapMail.wrapedSendMail(mailOptions)
                  if (sendEmail) {
                    return response(res, 'success submit disposal', { sendEmail })
                  } else {
                    return response(res, 'berhasil submit disposal, tidak berhasil kirim notif email 1')
                  }
                }
              } else {
                await notif.create(data)
                const mailOptions = {
                  from: 'noreply_asset@pinusmerahabadi.co.id',
                  replyTo: 'noreply_asset@pinusmerahabadi.co.id',
                  // to: `${findEmail.email_staff_asset1}, ${findEmail.email_staff_asset2}`,
                  to: `${emailAss}, ${emailAss2}`,
                  // cc: findDis.kategori === 'it' || findDis.kategori === 'IT' ? `${ccIt}` : `${cc}`,
                  subject: `REVISI KELENGKAPAN EKSEKUSI DISPOSAL ASSET ${resdis.area} `,
                  html: `
                <head>
                  <style type="text/css">
                  body {
                      display: flexbox;
                      flex-direction: column;
                  }
                  .tittle {
                      font-size: 15px;
                  }
                  .mar {
                      margin-bottom: 20px;
                  }
                  .mar1 {
                      margin-bottom: 10px;
                  }
                  .foot {
                      margin-top: 20px;
                      margin-bottom: 10px;
                  }
                  .foot1 {
                      margin-bottom: 50px;
                  }
                  .position {
                      display: flexbox;
                      flex-direction: row;
                      justify-content: left;
                      margin-top: 10px;
                  }
                  table {
                      font-family: "Lucida Sans Unicode", "Lucida Grande", "Segoe Ui";
                      font-size: 12px;
                  }
                  .demo-table {
                      border-collapse: collapse;
                      font-size: 13px;
                  }
                  .demo-table th, 
                  .demo-table td {
                      border-bottom: 1px solid #e1edff;
                      border-left: 1px solid #e1edff;
                      padding: 7px 17px;
                  }
                  .demo-table th, 
                  .demo-table td:last-child {
                      border-right: 1px solid #e1edff;
                  }
                  .demo-table td:first-child {
                      border-top: 1px solid #e1edff;
                  }
                  .demo-table td:last-child{
                      border-bottom: 0;
                  }
                  caption {
                      caption-side: top;
                      margin-bottom: 10px;
                  }
                  
                  /* Table Header */
                  .demo-table thead th {
                      background-color: #508abb;
                      color: #FFFFFF;
                      border-color: #6ea1cc !important;
                      text-transform: uppercase;
                  }
                  
                  /* Table Body */
                  .demo-table tbody td {
                      color: #353535;
                  }
                  
                  .demo-table tbody tr:nth-child(odd) td {
                      background-color: #f4fbff;
                  }
                  .demo-table tbody tr:hover th,
                  .demo-table tbody tr:hover td {
                      background-color: #ffffa2;
                      border-color: #ffff0f;
                      transition: all .2s;
                  }
              </style>
                </head>
                <body>
                    <div class="tittle mar">
                        Dear Team Asset,
                    </div>
                    <div class="tittle mar1">
                        <div>Mohon untuk cek hasil revisi lampiran eksekusi disposal asset dibawah ini:</div>
                    </div>
                    <div class="position mar1">
                        <table class="demo-table">
                            <thead>
                                <tr>
                                    <th>No</th>
                                    <th>No Disposal</th>
                                    <th>Asset</th>
                                    <th>Asset description</th>
                                    <th>Cost Ctr</th>
                                    <th>Cost Ctr Name</th>
                                </tr>
                            </thead>
                            <tbody>
                              ${tableTd}
                            </tbody>
                        </table>
                    </div>
                    <a href="http://aset.pinusmerahabadi.co.id/">Klik link berikut untuk akses web asset</a>
                    <div class="tittle foot">
                        Terima kasih,
                    </div>
                    <div class="tittle foot1">
                        Regards,
                    </div>
                    <div class="tittle">
                        Area
                    </div>
                </body>
                `
                }
                const sendEmail = await wrapMail.wrapedSendMail(mailOptions)
                if (sendEmail) {
                  return response(res, 'success submit disposal', { sendEmail })
                } else {
                  return response(res, 'berhasil submit disposal, tidak berhasil kirim notif email 1')
                }
              }
            } else {
              return response(res, 'success submit reject eksekusi failed send email and notif')
            }
          } else {
            return response(res, 'success submit reject eksekusi failed send email and notif')
          }
        } else {
          return response(res, 'failed submit reject eksekusi', {}, 404, false)
        }
      } else {
        return response(res, 'failed submit reject eksekusi', {}, 404, false)
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  }
}
