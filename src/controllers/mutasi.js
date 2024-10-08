const response = require('../helpers/response')
const { mutasi, asset, depo, notif, ttd, approve, role, user, docUser, document, path, email } = require('../models')
const { Op } = require('sequelize')
const { pagination } = require('../helpers/pagination')
const joi = require('joi')
const wrapMail = require('../helpers/wrapMail')
const moment = require('moment')
const axios = require('axios')

const emailAss = 'fahmi_aziz@pinusmerahabadi.co.id'
const emailAss2 = 'fahmi_aziz@pinusmerahabadi.co.id'

module.exports = {
  addMutasi: async (req, res) => {
    try {
      const no = req.params.no
      const plant = req.params.plant
      const kode = req.user.kode
      const cost = req.user.name
      const level = req.user.level
      const result = await asset.findOne({
        where: {
          no_asset: no
        }
      })
      if (result) {
        const findArea = await mutasi.findAll({
          where: {
            [Op.and]: [
              { kode_plant: level === '5' ? kode : cost },
              { status_form: 1 }
            ]
          }
        })
        if (findArea.length > 0) {
          const findPlant = await mutasi.findAll({
            where: {
              [Op.and]: [
                { kode_plant: level === '5' ? kode : cost },
                { kode_plant_rec: plant }
              ],
              status_form: 1
            }
          })
          if (findPlant.length > 0) {
            const findAsset = await mutasi.findAll({
              where: {
                [Op.and]: [
                  { no_asset: result.no_asset },
                  { kode_plant: level === '5' ? kode : cost }
                ]
              }
            })
            if (findAsset.length > 0) {
              return response(res, 'success add mutasi', { result: findAsset })
            } else if ((level === 5 && result.kode_plant === kode) || (level === 9 && result.cost_center === cost)) {
              const findDepo = await depo.findOne({
                where: {
                  kode_plant: level === '5' ? kode : cost
                }
              })
              if (findDepo) {
                const findRec = await depo.findOne({
                  where: {
                    kode_plant: plant
                  }
                })
                if (findRec) {
                  const send = {
                    kode_plant: level === '5' ? kode : cost,
                    area: findDepo.nama_area,
                    no_doc: result.no_doc,
                    no_asset: result.no_asset,
                    nama_asset: result.nama_asset,
                    cost_center: findDepo.cost_center,
                    status_depo: findDepo.status_area,
                    kode_plant_rec: plant,
                    cost_center_rec: findRec.cost_center,
                    area_rec: findRec.nama_area,
                    status_form: 1,
                    kategori: result.kategori,
                    merk: result.merk
                  }
                  const make = await mutasi.create(send)
                  if (make) {
                    const data = {
                      status: 11,
                      keterangan: 'proses mutasi'
                    }
                    const update = await result.update(data)
                    if (update) {
                      return response(res, 'success add mutasi', { result: make })
                    } else {
                      return response(res, 'failed add mutasi', {}, 400, false)
                    }
                  } else {
                    return response(res, 'failed add mutasi', {}, 400, false)
                  }
                } else {
                  return response(res, 'failed add mutasi', {}, 400, false)
                }
              } else {
                return response(res, 'failed add mutasi', {}, 400, false)
              }
            } else {
              return response(res, 'failed add mutasi', {}, 400, false)
            }
          } else {
            return response(res, 'Hanya bisa menambahkan item dengan area tujuan yang sama. Kosongkan atau submit cart terlebih dahulu !', {}, 400, false)
          }
        } else {
          const findAsset = await mutasi.findAll({
            where: {
              [Op.and]: [
                { no_asset: result.no_asset },
                { kode_plant: level === '5' ? kode : cost }
              ]
            }
          })
          if (findAsset.length > 0) {
            return response(res, 'success add mutasi', { result: findAsset })
          } else if ((level === 5 && result.kode_plant === kode) || (level === 9 && result.cost_center === cost)) {
            const findDepo = await depo.findOne({
              where: {
                kode_plant: level === '5' ? kode : cost
              }
            })
            if (findDepo) {
              const findRec = await depo.findOne({
                where: {
                  kode_plant: plant
                }
              })
              if (findRec) {
                const send = {
                  kode_plant: level === '5' ? kode : cost,
                  area: findDepo.nama_area,
                  no_doc: result.no_doc,
                  no_asset: result.no_asset,
                  nama_asset: result.nama_asset,
                  cost_center: findDepo.cost_center,
                  status_depo: findDepo.status_area,
                  kode_plant_rec: plant,
                  cost_center_rec: findRec.cost_center,
                  area_rec: findRec.nama_area,
                  status_form: 1,
                  kategori: result.kategori,
                  merk: result.merk
                }
                const make = await mutasi.create(send)
                if (make) {
                  const data = {
                    status: 11,
                    keterangan: 'proses mutasi'
                  }
                  const update = await result.update(data)
                  if (update) {
                    return response(res, 'success add mutasi', { result: make })
                  } else {
                    return response(res, 'failed add mutasi', {}, 400, false)
                  }
                } else {
                  return response(res, 'failed add mutasi', {}, 400, false)
                }
              } else {
                return response(res, 'failed add mutasi', {}, 400, false)
              }
            } else {
              return response(res, 'failed add mutasi', {}, 400, false)
            }
          } else {
            return response(res, 'failed add mutasi', {}, 400, false)
          }
        }
      } else {
        return response(res, 'failed add mutasi', {}, 400, false)
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  getMutasi: async (req, res) => {
    try {
      const level = req.user.level
      const kode = req.user.kode
      const fullname = req.user.fullname
      const cost = req.user.name
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
      if (!limit) {
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
        const result = await mutasi.findAndCountAll({
          where: {
            [Op.and]: [
              { kode_plant: level === '5' ? kode : cost },
              { status_form: status }
            ],
            [Op.or]: [
              { kode_plant_rec: { [Op.like]: `%${searchValue}%` } }
            ]
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
            [sortValue, 'ASC'],
            [{ model: ttd, as: 'appForm' }, 'id', 'DESC']
          ],
          limit: limit,
          offset: (page - 1) * limit
        })
        const pageInfo = pagination('/mutasi/get', req.query, page, limit, result.count)
        if (result) {
          const data = []
          result.rows.map(x => {
            return (
              data.push(x.no_mutasi)
            )
          })
          const set = new Set(data)
          const noMut = [...set]
          return response(res, 'success get mutasi', { result, pageInfo, noMut })
        } else {
          return response(res, 'failed to get mutasi', {}, 404, false)
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
            const result = await mutasi.findAll({
              where: {
                kode_plant: findDepo[i].kode_plant,
                status_form: 2,
                [Op.or]: [
                  { kode_plant: { [Op.like]: `%${searchValue}%` } },
                  { cost_center: { [Op.like]: `%${searchValue}%` } },
                  { area: { [Op.like]: `%${searchValue}%` } },
                  { no_asset: { [Op.like]: `%${searchValue}%` } },
                  { no_mutasi: { [Op.like]: `%${searchValue}%` } }
                ]
              },
              order: [
                [sortValue, 'ASC'],
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
                data.push(x.no_mutasi)
              )
            })
            const set = new Set(data)
            const noMut = [...set]
            const result = { rows: hasil, count: hasil.length }
            const pageInfo = pagination('/mutasi/get', req.query, page, limit, result.count)
            return response(res, 'success get mutasi', { result, pageInfo, noMut })
          } else {
            const result = { rows: hasil, count: 0 }
            const noMut = []
            const pageInfo = pagination('/mutasi/get', req.query, page, limit, result.count)
            return response(res, 'success get mutasi', { result, pageInfo, noMut })
          }
        } else {
          return response(res, 'failed get mutasi', {}, 400, false)
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
        if (findRole && findDepo.length > 0) {
          const hasil = []
          for (let i = 0; i < findDepo.length; i++) {
            const result = await mutasi.findAll({
              where: {
                kode_plant: findDepo[i].kode_plant,
                [Op.or]: [
                  { kode_plant: { [Op.like]: `%${searchValue}%` } },
                  { cost_center: { [Op.like]: `%${searchValue}%` } },
                  { area: { [Op.like]: `%${searchValue}%` } },
                  { no_asset: { [Op.like]: `%${searchValue}%` } },
                  { no_mutasi: { [Op.like]: `%${searchValue}%` } }
                ],
                status_form: 2
              },
              order: [
                [sortValue, 'ASC'],
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
                tempDis.push(x.no_mutasi)
              )
            })
            const setDis = new Set(tempDis)
            const noSet = [...setDis]
            if (level === 13) {
              const result = await mutasi.findAndCountAll({
                where: {
                  kategori: 'IT',
                  [Op.or]: [
                    { kode_plant: { [Op.like]: `%${searchValue}%` } },
                    { cost_center: { [Op.like]: `%${searchValue}%` } },
                    { area: { [Op.like]: `%${searchValue}%` } },
                    { no_asset: { [Op.like]: `%${searchValue}%` } },
                    { no_mutasi: { [Op.like]: `%${searchValue}%` } }
                  ],
                  status_form: 2
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
                    model: path,
                    as: 'pict'
                  },
                  {
                    model: docUser,
                    as: 'docAsset'
                  }
                ],
                group: 'no_mutasi'
              })
              if (result.rows.length > 0) {
                const data = []
                for (let i = 0; i < result.rows.length; i++) {
                  if (result.rows[i].appForm.length > 0) {
                    const app = result.rows[i].appForm
                    // console.log(app.find(({ jabatan }) => jabatan === findRole.name))
                    if (app.find(({ jabatan }) => jabatan === findRole.name) === undefined) {
                      data.push(result.rows[i].no_mutasi)
                    } else if (app.find(({ jabatan }) => jabatan === findRole.name) !== undefined && app.find(({ jabatan }) => jabatan === findRole.name).status !== null) {
                      data.push(result.rows[i].no_mutasi)
                    }
                  }
                }
                const set = new Set(data)
                const noMut = [...set]
                const newData = []
                for (let i = 0; i < result.rows.length; i++) {
                  for (let j = 0; j < noMut.length; j++) {
                    if (result.rows[i].no_mutasi === noMut[j]) {
                      newData.push(result.rows[i])
                    }
                  }
                }
                const tempAll = hasil.concat(newData)
                const setMerge = new Set(tempAll)
                const mergeData = [...setMerge]
                const tempNo = noMut.concat(noSet)
                const setNo = new Set(tempNo)
                const mergeNo = [...setNo]
                if (newData.length) {
                  const result = { rows: mergeData, count: mergeData.length }
                  const pageInfo = pagination('/mutasi/get', req.query, page, limit, result.count)
                  return response(res, 'success get mutasi', { result, pageInfo, noMut: mergeNo })
                } else {
                  const result = { rows: [], count: 0 }
                  const noMut = []
                  const pageInfo = pagination('/mutasi/get', req.query, page, limit, result.count)
                  return response(res, 'success get mutasi', { result, pageInfo, noMut })
                }
              } else {
                const result = { rows: [], count: 0 }
                const noMut = []
                const pageInfo = pagination('/mutasi/get', req.query, page, limit, result.count)
                return response(res, 'success get mutasi', { result, pageInfo, noMut })
              }
            } else {
              const result = await mutasi.findAndCountAll({
                where: {
                  [Op.or]: [
                    { kode_plant: { [Op.like]: `%${searchValue}%` } },
                    { cost_center: { [Op.like]: `%${searchValue}%` } },
                    { area: { [Op.like]: `%${searchValue}%` } },
                    { no_asset: { [Op.like]: `%${searchValue}%` } },
                    { no_mutasi: { [Op.like]: `%${searchValue}%` } }
                  ],
                  status_form: 2
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
                    model: path,
                    as: 'pict'
                  },
                  {
                    model: docUser,
                    as: 'docAsset'
                  }
                ],
                group: 'no_mutasi'
              })
              if (result.rows.length > 0) {
                const data = []
                for (let i = 0; i < result.rows.length; i++) {
                  if (result.rows[i].appForm.length > 0) {
                    const app = result.rows[i].appForm
                    // console.log(app.find(({ jabatan }) => jabatan === findRole.name))
                    if (app.find(({ jabatan }) => jabatan === findRole.name) === undefined) {
                      data.push(result.rows[i].no_mutasi)
                    } else if (app.find(({ jabatan }) => jabatan === findRole.name) !== undefined && app.find(({ jabatan }) => jabatan === findRole.name).status !== null) {
                      data.push(result.rows[i].no_mutasi)
                    }
                  }
                }
                const set = new Set(data)
                const noMut = [...set]
                const newData = []
                for (let i = 0; i < result.rows.length; i++) {
                  for (let j = 0; j < noMut.length; j++) {
                    if (result.rows[i].no_mutasi === noMut[j]) {
                      newData.push(result.rows[i])
                    }
                  }
                }
                const tempAll = hasil.concat(newData)
                const setMerge = new Set(tempAll)
                const mergeData = [...setMerge]
                const tempNo = noMut.concat(noSet)
                const setNo = new Set(tempNo)
                const mergeNo = [...setNo]
                if (newData.length) {
                  const result = { rows: mergeData, count: mergeData.length }
                  const pageInfo = pagination('/mutasi/get', req.query, page, limit, result.count)
                  return response(res, 'success get mutasi', { result, pageInfo, noMut: mergeNo })
                } else {
                  const result = { rows: [], count: 0 }
                  const noMut = []
                  const pageInfo = pagination('/mutasi/get', req.query, page, limit, result.count)
                  return response(res, 'success get mutasi', { result, pageInfo, noMut })
                }
              } else {
                const result = { rows: [], count: 0 }
                const noMut = []
                const pageInfo = pagination('/mutasi/get', req.query, page, limit, result.count)
                return response(res, 'success get mutasi', { result, pageInfo, noMut })
              }
            }
          } else {
            const tempDis = []
            const setDis = new Set(tempDis)
            const noSet = [...setDis]
            if (level === 13) {
              const result = await mutasi.findAndCountAll({
                where: {
                  kategori: 'IT',
                  [Op.or]: [
                    { kode_plant: { [Op.like]: `%${searchValue}%` } },
                    { cost_center: { [Op.like]: `%${searchValue}%` } },
                    { area: { [Op.like]: `%${searchValue}%` } },
                    { no_asset: { [Op.like]: `%${searchValue}%` } },
                    { no_mutasi: { [Op.like]: `%${searchValue}%` } }
                  ],
                  status_form: 2
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
                    model: path,
                    as: 'pict'
                  },
                  {
                    model: docUser,
                    as: 'docAsset'
                  }
                ],
                group: 'no_mutasi'
              })
              if (result.rows.length > 0) {
                const data = []
                for (let i = 0; i < result.rows.length; i++) {
                  if (result.rows[i].appForm.length > 0) {
                    const app = result.rows[i].appForm
                    // console.log(app.find(({ jabatan }) => jabatan === findRole.name))
                    if (app.find(({ jabatan }) => jabatan === findRole.name) === undefined) {
                      data.push(result.rows[i].no_mutasi)
                    } else if (app.find(({ jabatan }) => jabatan === findRole.name) !== undefined && app.find(({ jabatan }) => jabatan === findRole.name).status !== null) {
                      data.push(result.rows[i].no_mutasi)
                    }
                  }
                }
                const set = new Set(data)
                const noMut = [...set]
                const newData = []
                for (let i = 0; i < result.rows.length; i++) {
                  for (let j = 0; j < noMut.length; j++) {
                    if (result.rows[i].no_mutasi === noMut[j]) {
                      newData.push(result.rows[i])
                    }
                  }
                }
                const tempAll = hasil.concat(newData)
                const setMerge = new Set(tempAll)
                const mergeData = [...setMerge]
                const tempNo = noMut.concat(noSet)
                const setNo = new Set(tempNo)
                const mergeNo = [...setNo]
                if (newData.length) {
                  const result = { rows: mergeData, count: mergeData.length }
                  const pageInfo = pagination('/mutasi/get', req.query, page, limit, result.count)
                  return response(res, 'success get mutasi', { result, pageInfo, noMut: mergeNo })
                } else {
                  const result = { rows: [], count: 0 }
                  const noMut = []
                  const pageInfo = pagination('/mutasi/get', req.query, page, limit, result.count)
                  return response(res, 'success get mutasi', { result, pageInfo, noMut })
                }
              } else {
                const result = { rows: [], count: 0 }
                const noMut = []
                const pageInfo = pagination('/mutasi/get', req.query, page, limit, result.count)
                return response(res, 'success get mutasi', { result, pageInfo, noMut })
              }
            } else {
              const result = await mutasi.findAndCountAll({
                where: {
                  [Op.or]: [
                    { kode_plant: { [Op.like]: `%${searchValue}%` } },
                    { cost_center: { [Op.like]: `%${searchValue}%` } },
                    { area: { [Op.like]: `%${searchValue}%` } },
                    { no_asset: { [Op.like]: `%${searchValue}%` } },
                    { no_mutasi: { [Op.like]: `%${searchValue}%` } }
                  ],
                  status_form: 2
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
                    model: path,
                    as: 'pict'
                  },
                  {
                    model: docUser,
                    as: 'docAsset'
                  }
                ],
                group: 'no_mutasi'
              })
              if (result.rows.length > 0) {
                const data = []
                for (let i = 0; i < result.rows.length; i++) {
                  if (result.rows[i].appForm.length > 0) {
                    const app = result.rows[i].appForm
                    // console.log(app.find(({ jabatan }) => jabatan === findRole.name))
                    if (app.find(({ jabatan }) => jabatan === findRole.name) === undefined) {
                      data.push(result.rows[i].no_mutasi)
                    } else if (app.find(({ jabatan }) => jabatan === findRole.name) !== undefined && app.find(({ jabatan }) => jabatan === findRole.name).status !== null) {
                      data.push(result.rows[i].no_mutasi)
                    }
                  }
                }
                const set = new Set(data)
                const noMut = [...set]
                const newData = []
                for (let i = 0; i < result.rows.length; i++) {
                  for (let j = 0; j < noMut.length; j++) {
                    if (result.rows[i].no_mutasi === noMut[j]) {
                      newData.push(result.rows[i])
                    }
                  }
                }
                const tempAll = hasil.concat(newData)
                const setMerge = new Set(tempAll)
                const mergeData = [...setMerge]
                const tempNo = noMut.concat(noSet)
                const setNo = new Set(tempNo)
                const mergeNo = [...setNo]
                if (newData.length) {
                  const result = { rows: mergeData, count: mergeData.length }
                  const pageInfo = pagination('/mutasi/get', req.query, page, limit, result.count)
                  return response(res, 'success get mutasi', { result, pageInfo, noMut: mergeNo })
                } else {
                  const result = { rows: [], count: 0 }
                  const noMut = []
                  const pageInfo = pagination('/mutasi/get', req.query, page, limit, result.count)
                  return response(res, 'success get mutasi', { result, pageInfo, noMut })
                }
              } else {
                const result = { rows: [], count: 0 }
                const noMut = []
                const pageInfo = pagination('/mutasi/get', req.query, page, limit, result.count)
                return response(res, 'success get mutasi', { result, pageInfo, noMut })
              }
            }
          }
        } else {
          return response(res, 'failed get mutasi', {}, 404, false)
        }
      } else {
        const result = await mutasi.findAndCountAll({
          where: {
            [Op.or]: [
              { kode_plant: { [Op.like]: `%${searchValue}%` } },
              { cost_center: { [Op.like]: `%${searchValue}%` } },
              { area: { [Op.like]: `%${searchValue}%` } },
              { no_asset: { [Op.like]: `%${searchValue}%` } },
              { no_mutasi: { [Op.like]: `%${searchValue}%` } }
            ],
            status_form: status === undefined ? 2 : status
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
              model: docUser,
              as: 'docAsset'
            }
          ],
          order: [
            [sortValue, 'ASC'],
            [{ model: ttd, as: 'appForm' }, 'id', 'DESC']
          ],
          limit: limit,
          offset: (page - 1) * limit
        })
        const pageInfo = pagination('/mutasi/get', req.query, page, limit, result.count)
        if (result) {
          const data = []
          result.rows.map(x => {
            return (
              data.push(x.no_mutasi)
            )
          })
          const set = new Set(data)
          const noMut = [...set]
          return response(res, 'list users', { result, pageInfo, noMut })
        } else {
          return response(res, 'failed to get user', {}, 404, false)
        }
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  getMutasiRec: async (req, res) => {
    try {
      const level = req.user.level
      const kode = req.user.kode
      const cost = req.user.name
      const fullname = req.user.fullname
      let { limit, page, search, sort, tipe } = req.query
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
      if (level === 5 || level === 9) {
        if (tipe === 'editdoc') {
          const result = await mutasi.findAndCountAll({
            where: {
              [Op.and]: [
                { kode_plant_rec: level === '5' ? kode : cost },
                { status_form: 9 }
              ],
              [Op.or]: [
                { kode_plant: { [Op.like]: `%${searchValue}%` } }
              ]
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
                model: docUser,
                as: 'docAsset'
              }
            ],
            order: [
              [sortValue, 'ASC'],
              [{ model: ttd, as: 'appForm' }, 'id', 'DESC']
            ],
            limit: limit,
            offset: (page - 1) * limit
          })
          const pageInfo = pagination('/mutasi/rec', req.query, page, limit, result.count)
          if (result) {
            const data = []
            result.rows.map(x => {
              return (
                data.push(x.no_mutasi)
              )
            })
            const set = new Set(data)
            const noMut = [...set]
            return response(res, 'success get mutasi', { result, pageInfo, noMut })
          } else {
            return response(res, 'failed to get mutasi', {}, 404, false)
          }
        } else {
          const result = await mutasi.findAndCountAll({
            where: {
              [Op.and]: [
                { kode_plant_rec: level === '5' ? kode : cost },
                { status_form: 2 }
              ],
              [Op.or]: [
                { kode_plant: { [Op.like]: `%${searchValue}%` } }
              ]
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
                model: docUser,
                as: 'docAsset'
              }
            ],
            order: [
              [sortValue, 'ASC'],
              [{ model: ttd, as: 'appForm' }, 'id', 'DESC']
            ],
            limit: limit,
            offset: (page - 1) * limit
          })
          const pageInfo = pagination('/mutasi/rec', req.query, page, limit, result.count)
          if (result) {
            const data = []
            result.rows.map(x => {
              return (
                data.push(x.no_mutasi)
              )
            })
            const set = new Set(data)
            const noMut = [...set]
            return response(res, 'success get mutasi', { result, pageInfo, noMut })
          } else {
            return response(res, 'failed to get mutasi', {}, 404, false)
          }
        }
      } else if (level === 27 || level === 13 || level === 16 || level === 12) {
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
        if (findRole && findDepo.length > 0) {
          const hasil = []
          for (let i = 0; i < findDepo.length; i++) {
            const result = await mutasi.findAll({
              where: {
                kode_plant_rec: findDepo[i].kode_plant,
                status_form: 2
                // [Op.or]: [
                //   { kode_plant: { [Op.like]: `%${searchValue}%` } },
                //   { cost_center: { [Op.like]: `%${searchValue}%` } },
                //   { area: { [Op.like]: `%${searchValue}%` } },
                //   { no_asset: { [Op.like]: `%${searchValue}%` } },
                //   { no_mutasi: { [Op.like]: `%${searchValue}%` } }
                // ]
              },
              order: [
                [sortValue, 'ASC'],
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
                data.push(x.no_mutasi)
              )
            })
            const set = new Set(data)
            const noMut = [...set]
            const result = { rows: hasil, count: hasil.length }
            const pageInfo = pagination('/mutasi/get', req.query, page, limit, result.count)
            return response(res, 'success get mutasi', { result, pageInfo, noMut })
          } else {
            const result = { rows: hasil, count: 0 }
            const noMut = []
            const pageInfo = pagination('/mutasi/get', req.query, page, limit, result.count)
            return response(res, 'success get mutasi', { result, pageInfo, noMut })
          }
        } else {
          return response(res, 'failed get mutasi', {}, 400, false)
        }
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  deleteItem: async (req, res) => {
    try {
      const no = req.params.no
      const result = await mutasi.findByPk(no)
      if (result) {
        await result.destroy()
        const findAsset = await asset.findOne({
          where: {
            no_asset: result.no_asset
          }
        })
        if (findAsset) {
          const send = {
            status: null,
            keterangan: null
          }
          await findAsset.update(send)
          return response(res, 'successfully delete item mutasi')
        } else {
          return response(res, 'failed delete item mutasi 1', {}, 404, false)
        }
      } else {
        return response(res, 'failed delete item mutasi 2', {}, 404, false)
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  submitMutasi: async (req, res) => {
    try {
      const kode = req.user.kode
      const cost = req.user.name
      const level = req.user.level
      const schema = joi.object({
        alasan: joi.string().required()
      })
      const { value: results, error } = schema.validate(req.body)
      if (error) {
        return response(res, 'Error', { error: error.message }, 404, false)
      } else {
        const result = await mutasi.findAll({
          where: {
            [Op.and]: [
              { kode_plant: level === '5' ? kode : cost },
              { status_form: 1 }
            ]
          }
        })
        if (result.length > 0) {
          const findNo = await mutasi.findAll({
            where: {
              [Op.not]: { no_mutasi: null }
            },
            order: [['id', 'DESC']],
            limit: 50
          })
          if (findNo.length > 0) {
            const cekNo = []
            for (let i = 0; i < findNo.length; i++) {
              const no = findNo[i].no_mutasi.split('M')
              cekNo.push(parseInt(no[1]))
            }
            const noMut = Math.max(...cekNo) + 1
            const temp = []
            for (let i = 0; i < result.length; i++) {
              const find = await mutasi.findByPk(result[i].id)
              if (find) {
                const send = {
                  status_form: 2,
                  no_mutasi: noMut === undefined ? 'M' + 1 : 'M' + noMut,
                  alasan: results.alasan,
                  tanggalMut: moment()
                }
                await find.update(send)
                temp.push(1)
              }
            }
            if (temp.length === result.length) {
              const findDepo = await depo.findOne({
                where: {
                  kode_plant: level === '5' ? kode : cost
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
                    kode_plant: level === '5' ? kode : cost,
                    jenis: 'mutasi',
                    no_proses: `M${noMut === undefined ? 1 : noMut}`,
                    list_appr: findEmail.username,
                    keterangan: 'pengajuan',
                    response: 'request'
                  }
                  const createNotif = await notif.create(data)
                  if (createNotif) {
                    let tableTd = ''
                    for (let i = 0; i < result.length; i++) {
                      const element = `
                    <tr>
                      <td>${result.indexOf(result[i]) + 1}</td>
                      <td>M${noMut === undefined ? 1 : noMut}</td>
                      <td>${result[i].no_asset}</td>
                      <td>${result[i].nama_asset}</td>
                      <td>${result[i].area}</td>
                      <td>${result[i].cost_center}</td>
                      <td>${result[i].area_rec}</td>
                      <td>${result[i].cost_center_rec}</td>
                    </tr>`
                      tableTd = tableTd + element
                    }
                    const mailOptions = {
                      from: 'noreply_asset@pinusmerahabadi.co.id',
                      replyTo: 'noreply_asset@pinusmerahabadi.co.id',
                      // to: `${findEmail.email}`,
                      to: `${emailAss}, ${emailAss2}`,
                      subject: `Approve Pengajuan Mutasi M${noMut === undefined ? 1 : noMut} (TESTING)`,
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
                            <div>Mohon untuk approve pengajuan mutasi asset area.</div>
                        </div>
                        <div class="position">
                            <table class="demo-table">
                                <thead>
                                    <tr>
                                        <th>No</th>
                                        <th>No Mutasi</th>
                                        <th>Asset</th>
                                        <th>Asset description</th>
                                        <th>Cabang / Depo</th>
                                        <th>Cost Ctr</th>
                                        <th>Cabang / Depo Penerima</th>
                                        <th>Cost Ctr Penerima</th>
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
                      return response(res, 'success approve mutasi', { sendEmail })
                    } else {
                      return response(res, 'berhasil approve mutasi, tidak berhasil kirim notif email 1')
                    }
                  }
                }
              }
            } else {
              return response(res, 'failed submit', {}, 404, false)
            }
          } else {
            const cekNo = [0]
            const noMut = Math.max(...cekNo) + 1
            const temp = []
            for (let i = 0; i < result.length; i++) {
              const find = await mutasi.findByPk(result[i].id)
              if (find) {
                const send = {
                  status_form: 2,
                  no_mutasi: noMut === undefined ? 'M1' : 'M' + noMut,
                  alasan: results.alasan,
                  tanggalMut: moment()
                }
                await find.update(send)
                temp.push(1)
              }
            }
            if (temp.length === result.length) {
              const findDepo = await depo.findOne({
                where: {
                  kode_plant: level === '5' ? kode : cost
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
                    kode_plant: level === '5' ? kode : cost,
                    jenis: 'mutasi',
                    no_proses: `M${noMut === undefined ? 1 : noMut}`,
                    list_appr: findEmail.username,
                    keterangan: 'pengajuan',
                    response: 'request'
                  }
                  const createNotif = await notif.create(data)
                  if (createNotif) {
                    let tableTd = ''
                    for (let i = 0; i < result.length; i++) {
                      const element = `
                    <tr>
                      <td>${result.indexOf(result[i]) + 1}</td>
                      <td>M${noMut === undefined ? 1 : noMut}</td>
                      <td>${result[i].no_asset}</td>
                      <td>${result[i].nama_asset}</td>
                      <td>${result[i].area}</td>
                      <td>${result[i].cost_center}</td>
                      <td>${result[i].area_rec}</td>
                      <td>${result[i].cost_center_rec}</td>
                    </tr>`
                      tableTd = tableTd + element
                    }
                    const mailOptions = {
                      from: 'noreply_asset@pinusmerahabadi.co.id',
                      replyTo: 'noreply_asset@pinusmerahabadi.co.id',
                      // to: `${findEmail.email}`,
                      to: `${emailAss}, ${emailAss2}`,
                      subject: `Approve Pengajuan Mutasi M${noMut === undefined ? 1 : noMut} (TESTING)`,
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
                            <div>Mohon untuk approve pengajuan mutasi asset area.</div>
                        </div>
                        <div class="position">
                            <table class="demo-table">
                                <thead>
                                    <tr>
                                        <th>No</th>
                                        <th>No Mutasi</th>
                                        <th>Asset</th>
                                        <th>Asset description</th>
                                        <th>Cabang / Depo</th>
                                        <th>Cost Ctr</th>
                                        <th>Cabang / Depo Penerima</th>
                                        <th>Cost Ctr Penerima</th>
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
                      return response(res, 'success approve mutasi', { sendEmail })
                    } else {
                      return response(res, 'berhasil approve mutasi, tidak berhasil kirim notif email 1')
                    }
                  }
                }
              }
            } else {
              return response(res, 'failed submit', {}, 404, false)
            }
          }
        } else {
          return response(res, 'data mutasi is empty', {}, 404, false)
        }
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  getDetailMutasi: async (req, res) => {
    try {
      const no = req.params.no
      const tipe = req.params.tipe
      const level = req.user.level
      if (tipe === 'budget') {
        if (level === 2) {
          const result = await mutasi.findAll({
            where: {
              [Op.and]: [
                { no_mutasi: no },
                { status_form: 4 }
              ]
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
                model: docUser,
                as: 'docAsset'
              }
            ],
            order: [
              ['id', 'ASC'],
              [{ model: ttd, as: 'appForm' }, 'id', 'DESC']
            ]
          })
          if (result.length > 0) {
            return response(res, 'success get mutasi', { result })
          } else {
            return response(res, 'failed get mutaso', {}, 404, false)
          }
        } else {
          const result = await mutasi.findAll({
            where: {
              [Op.and]: [
                { no_mutasi: no },
                { status_form: 3 }
              ]
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
                model: docUser,
                as: 'docAsset'
              }
            ],
            order: [
              ['id', 'ASC'],
              [{ model: ttd, as: 'appForm' }, 'id', 'DESC']
            ]
          })
          if (result.length > 0) {
            return response(res, 'success get mutasi', { result })
          } else {
            return response(res, 'failed get mutaso', {}, 404, false)
          }
        }
      } else if (tipe === 'eks') {
        const result = await mutasi.findAll({
          where: {
            no_mutasi: no
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
              model: docUser,
              as: 'docAsset'
            }
          ],
          order: [
            ['id', 'ASC'],
            [{ model: ttd, as: 'appForm' }, 'id', 'DESC']
          ]
        })
        if (result.length > 0) {
          const prev = moment().format('L').split('/')
          const cek = []
          for (let i = 0; i < result.length; i++) {
            const find = await mutasi.findByPk(result[i].id)
            if (find) {
              const findApi = await axios.get(`http://10.3.212.38:8000/sap/bc/zast/?sap-client=300&pgmna=zfir0090&p_anln1=${find.no_asset}&p_bukrs=pp01&p_gjahr=${prev[2]}&p_monat=${prev[0]}`).then(response => { return (response) }).catch(err => { return (err.isAxiosError) })
              if (findApi.status === 200) {
                const findCost = await axios.get(`http://10.3.212.38:8000/sap/bc/zast/?sap-client=300&pgmna=zfir0091&p_kokrs=pp00&p_aufnr=${findApi.data[0] === undefined ? null : findApi.data[0].eaufn === undefined ? null : findApi.data[0].eaufn === null ? null : findApi.data[0].eaufn === '' ? null : findApi.data[0].eaufn}`).then(response => { return (response) }).catch(err => { return (err.isAxiosError) })
                if (findCost.status === 200) {
                  const data = {
                    isbudget: findApi.data[0] === undefined ? 'tidak' : findApi.data[0].eaufn === undefined ? 'tidak' : findApi.data[0].eaufn === null ? 'tidak' : findApi.data[0].eaufn === '' ? 'tidak' : 'ya',
                    no_io: findApi.data[0] === undefined ? null : findApi.data[0].eaufn === undefined ? null : findApi.data[0].eaufn === null ? null : findApi.data[0].eaufn === '' ? null : findApi.data[0].eaufn,
                    cost_centerawal: findCost.data[0] === undefined ? null : findCost.data[0].kostv === undefined ? null : findCost.data[0].kostv === null ? null : findCost.data[0].kostv === '' ? null : findCost.data[0].kostv
                  }
                  await find.update(data)
                } else {
                  const data = {
                    isbudget: findApi.data[0] === undefined ? 'tidak' : findApi.data[0].eaufn === undefined ? 'tidak' : findApi.data[0].eaufn === null ? 'tidak' : findApi.data[0].eaufn === '' ? 'tidak' : 'ya',
                    no_io: findApi.data[0] === undefined ? null : findApi.data[0].eaufn === undefined ? null : findApi.data[0].eaufn === null ? null : findApi.data[0].eaufn === '' ? null : findApi.data[0].eaufn
                  }
                  await find.update(data)
                }
                cek.push(1)
              } else {
                const data = {
                  isbudget: 'tidak',
                  no_io: null
                }
                await find.update(data)
                cek.push(1)
              }
            }
          }
          if (cek.length > 0) {
            const result = await mutasi.findAll({
              where: {
                no_mutasi: no
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
                  model: docUser,
                  as: 'docAsset'
                }
              ],
              order: [
                ['id', 'ASC'],
                [{ model: ttd, as: 'appForm' }, 'id', 'DESC']
              ]
            })
            if (result) {
              return response(res, 'success get mutasi', { result })
            } else {
              return response(res, 'success get mutasi', { result })
            }
          } else {
            return response(res, 'success get mutasi', { result })
          }
        } else {
          return response(res, 'failed get mutaso', {}, 404, false)
        }
      } else {
        const result = await mutasi.findAll({
          where: {
            no_mutasi: no
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
              model: docUser,
              as: 'docAsset'
            }
          ],
          order: [
            ['id', 'ASC'],
            [{ model: ttd, as: 'appForm' }, 'id', 'DESC']
          ]
        })
        if (result.length > 0) {
          return response(res, 'success get mutasi', { result })
        } else {
          return response(res, 'failed get mutaso', {}, 404, false)
        }
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  getApproveMut: async (req, res) => {
    try {
      const no = req.params.no
      const nama = req.params.nama
      const result = await ttd.findAll({
        where: {
          no_doc: no
        }
      })
      const findRole = await role.findOne({
        where: {
          nomor: '27'
        }
      })
      if (result.length > 0 && findRole) {
        const penyetuju = []
        const pembuat = []
        const pemeriksa = []
        const penerima = []
        for (let i = 0; i < result.length; i++) {
          if ((result[i].sebagai === 'pembuat' || result[i].sebagai === 'penerima') && result[i].jabatan === findRole.name) {
            pemeriksa.push(result[i])
          } else if (result[i].sebagai === 'pembuat') {
            pembuat.push(result[i])
          } else if (result[i].sebagai === 'pemeriksa') {
            pemeriksa.push(result[i])
          } else if (result[i].sebagai === 'penyetuju') {
            penyetuju.push(result[i])
          } else if (result[i].sebagai === 'penerima') {
            penerima.push(result[i])
          }
        }
        return response(res, 'success get template approve', { result: { pembuat, penerima, pemeriksa, penyetuju } })
      } else {
        const findDis = await mutasi.findAll({
          where: {
            no_mutasi: no
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
          if (getApp && getDepo) {
            const hasil = []
            for (let i = 0; i < getApp.length; i++) {
              const send = {
                jabatan: getApp[i].jabatan,
                jenis: getApp[i].jenis,
                sebagai: getApp[i].sebagai,
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
                if (findArea) {
                  const data = {
                    nama: getDepo.nama_aos,
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
                      const penerima = []
                      for (let i = 0; i < findRes.length; i++) {
                        if ((findRes[i].sebagai === 'pembuat' || findRes[i].sebagai === 'penerima') && findRes[i].jabatan === findRole.name) {
                          pemeriksa.push(findRes[i])
                        } else if (findRes[i].sebagai === 'pembuat') {
                          pembuat.push(findRes[i])
                        } else if (findRes[i].sebagai === 'pemeriksa') {
                          pemeriksa.push(findRes[i])
                        } else if (findRes[i].sebagai === 'penyetuju') {
                          penyetuju.push(findRes[i])
                        } else if (findRes[i].sebagai === 'penerima') {
                          penerima.push(findRes[i])
                        }
                      }
                      return response(res, 'success get template approve', { result: { pembuat, penerima, pemeriksa, penyetuju } })
                    }
                  }
                }
              }
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
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  approveMutasi: async (req, res) => {
    try {
      const level = req.user.level
      const name = req.user.name
      const no = req.params.no
      const findMut = await mutasi.findOne({
        where: {
          no_mutasi: no
        }
      })
      const result = await role.findAll({
        where: {
          nomor: level
        }
      })
      if (result.length > 0 && findMut) {
        const find = await ttd.findAll({
          where: {
            no_doc: no
          }
        })
        if (find.length > 0) {
          const author = level === 13 || level === 16 || level === 12 || level === 27
          const divisi = author && 'Manager'
          let hasil = 0
          let div = 0
          let arr = null
          let who = 0
          // let position = ''
          if (author) {
            const findPlant = await depo.findOne({
              where: {
                kode_plant: findMut.kode_plant
              }
            })
            if (findPlant && (findPlant.nama_bm === name)) {
              who = 1
            } else {
              const findPlantRec = await depo.findOne({
                where: {
                  kode_plant: findMut.kode_plant_rec
                }
              })
              if (findPlantRec && (findPlantRec.nama_bm === name)) {
                who = 2
              }
            }
          }
          for (let i = 0; i < find.length; i++) {
            if (result[0].name === find[i].jabatan) {
              hasil = find[i].id
              arr = i
              // position = find[i].jabatan
            } else if (who === 1 && author && divisi === find[i].jabatan && find[i].sebagai === 'pembuat') {
              div = find[i].id
              // num = i
              // post = find[i].jabatan
            } else if (who === 2 && author && divisi === find[i].jabatan && find[i].sebagai === 'penerima') {
              div = find[i].id
              // num = i
              // post = find[i].jabatan
            }
          }
          if (hasil !== 0 || (hasil === 0 && author)) {
            if (arr !== find.length - 1 && (find[arr + 1].status !== null || find[arr + 1].status === 1 || find[arr + 1].status === 0) && !author) {
              return response(res, 'Anda tidak memiliki akses lagi untuk mengapprove', {}, 404, false)
            } else {
              if (author) {
                const data = {
                  nama: name,
                  status: 1,
                  path: null
                }
                const findTtd = await ttd.findByPk(hasil === 0 ? div : hasil)
                if (findTtd && findMut) {
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
                    if (result.length > 0) {
                      const findDoc = await mutasi.findAll({
                        where: {
                          no_mutasi: no
                        }
                      })
                      if (findDoc.length > 0) {
                        const findRole = await role.findAll({
                          where: {
                            name: find[arr + 1].jabatan
                          }
                        })
                        if (findRole.length > 0) {
                          if (results.length === (find.length - 1)) {
                            const findUser = await user.findOne({
                              where: {
                                username: findDoc[0].kode_plant_rec
                              }
                            })
                            if (findUser) {
                              let tableTd = ''
                              for (let i = 0; i < findDoc.length; i++) {
                                const element = `
                                <tr>
                                  <td>${findDoc.indexOf(findDoc[i]) + 1}</td>
                                  <td>${findDoc[i].no_mutasi}</td>
                                  <td>${findDoc[i].no_asset}</td>
                                  <td>${findDoc[i].nama_asset}</td>
                                  <td>${findDoc[i].area}</td>
                                  <td>${findDoc[i].cost_center}</td>
                                  <td>${findDoc[i].area_rec}</td>
                                  <td>${findDoc[i].cost_center_rec}</td>
                                </tr>`
                                tableTd = tableTd + element
                              }
                              const mailOptions = {
                                from: 'noreply_asset@pinusmerahabadi.co.id',
                                replyTo: 'noreply_asset@pinusmerahabadi.co.id',
                                // to: `${findUser.email}`,
                                to: `${emailAss}, ${emailAss2}`,
                                subject: `Approve Pengajuan Mutasi ${no} (TESTING)`,
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
                                      <div>Mohon lanjutkan proses pengajuan mutasi area sbb.</div>
                                  </div>
                                  <div class="position">
                                      <table class="demo-table">
                                          <thead>
                                              <tr>
                                                  <th>No</th>
                                                  <th>No Mutasi</th>
                                                  <th>Asset</th>
                                                  <th>Asset description</th>
                                                  <th>Cabang / Depo</th>
                                                  <th>Cost Ctr</th>
                                                  <th>Cabang / Depo Penerima</th>
                                                  <th>Cost Ctr Penerima</th>
                                              </tr>
                                          </thead>
                                          <tbody>
                                            ${tableTd}
                                          </tbody>
                                      </table>
                                  </div>
                                  <a href="http://aset.pinusmerahabadi.co.id/mutasi">Klik link berikut untuk akses web asset</a>
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
                                return response(res, 'success approve mutasi', { sendEmail })
                              } else {
                                return response(res, 'berhasil approve mutasi, tidak berhasil kirim notif email 1')
                              }
                            } else {
                              return response(res, 'berhasil approve dokumen, tidak berhasil kirim notif email 2')
                            }
                          } else {
                            const findUser = await user.findOne({
                              where: {
                                user_level: findRole[0].nomor
                              }
                            })
                            if (findUser) {
                              let tableTd = ''
                              for (let i = 0; i < findDoc.length; i++) {
                                const element = `
                                <tr>
                                  <td>${findDoc.indexOf(findDoc[i]) + 1}</td>
                                  <td>${findDoc[i].no_mutasi}</td>
                                  <td>${findDoc[i].no_asset}</td>
                                  <td>${findDoc[i].nama_asset}</td>
                                  <td>${findDoc[i].area}</td>
                                  <td>${findDoc[i].cost_center}</td>
                                  <td>${findDoc[i].area_rec}</td>
                                  <td>${findDoc[i].cost_center_rec}</td>
                                </tr>`
                                tableTd = tableTd + element
                              }
                              const mailOptions = {
                                from: 'noreply_asset@pinusmerahabadi.co.id',
                                replyTo: 'noreply_asset@pinusmerahabadi.co.id',
                                // to: `${findUser.email}`,
                                to: `${emailAss}, ${emailAss2}`,
                                subject: `Approve Pengajuan Mutasi ${no} (TESTING)`,
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
                                      <div>Mohon lanjutkan proses pengajuan mutasi area sbb.</div>
                                  </div>
                                  <div class="position">
                                      <table class="demo-table">
                                          <thead>
                                              <tr>
                                                  <th>No</th>
                                                  <th>No Mutasi</th>
                                                  <th>Asset</th>
                                                  <th>Asset description</th>
                                                  <th>Cabang / Depo</th>
                                                  <th>Cost Ctr</th>
                                                  <th>Cabang / Depo Penerima</th>
                                                  <th>Cost Ctr Penerima</th>
                                              </tr>
                                          </thead>
                                          <tbody>
                                            ${tableTd}
                                          </tbody>
                                      </table>
                                  </div>
                                  <a href="http://aset.pinusmerahabadi.co.id/mutasi">Klik link berikut untuk akses web asset</a>
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
                                return response(res, 'success approve mutasi', { sendEmail })
                              } else {
                                return response(res, 'berhasil approve mutasi, tidak berhasil kirim notif email 1')
                              }
                            } else {
                              return response(res, 'berhasil approve dokumen, tidak berhasil kirim notif email 2')
                            }
                          }
                        }
                      }
                    } else {
                      return response(res, 'berhasil approve dokumen, tidak berhasil kirim notif email 3')
                    }
                  } else {
                    return response(res, 'failed approve mutasi', {}, 404, false)
                  }
                }
              } else {
                if (arr === 0 || find[arr - 1].status === 1) {
                  const findDepo = await depo.findOne({
                    where: {
                      kode_plant: name
                    }
                  })
                  const data = {
                    nama: level === 5 || level === 9 ? findDepo.nama_aos : name,
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
                      if (results.length === find.length) {
                        const findDoc = await mutasi.findAll({
                          where: {
                            no_mutasi: no
                          }
                        })
                        if (findDoc) {
                          const data = {
                            status_form: 9
                          }
                          const valid = []
                          for (let i = 0; i < findDoc.length; i++) {
                            const findAsset = await mutasi.findByPk(findDoc[i].id)
                            if (findAsset) {
                              await findAsset.update(data)
                              valid.push(1)
                            }
                          }
                          if (valid.length === findDoc.length) {
                            const findUser = await email.findOne({
                              where: {
                                kode_plant: findDoc[0].kode_plant
                              }
                            })
                            if (findUser) {
                              let tableTd = ''
                              for (let i = 0; i < findDoc.length; i++) {
                                const element = `
                                <tr>
                                  <td>${findDoc.indexOf(findDoc[i]) + 1}</td>
                                  <td>${findDoc[i].no_mutasi}</td>
                                  <td>${findDoc[i].no_asset}</td>
                                  <td>${findDoc[i].nama_asset}</td>
                                  <td>${findDoc[i].area}</td>
                                  <td>${findDoc[i].cost_center}</td>
                                  <td>${findDoc[i].area_rec}</td>
                                  <td>${findDoc[i].cost_center_rec}</td>
                                </tr>`
                                tableTd = tableTd + element
                              }
                              const mailOptions = {
                                from: 'noreply_asset@pinusmerahabadi.co.id',
                                replyTo: 'noreply_asset@pinusmerahabadi.co.id',
                                // to: `${findUser.email_staff_asset1}, ${findUser.email_staff_asset2}`,
                                to: `${emailAss}, ${emailAss2}`,
                                subject: `Full Approve Pengajuan Mutasi ${no} (TESTING)`,
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
                                      <div>Mohon lanjutkan proses pengajuan mutasi area sbb.</div>
                                  </div>
                                  <div class="position">
                                      <table class="demo-table">
                                          <thead>
                                              <tr>
                                                  <th>No</th>
                                                  <th>No Mutasi</th>
                                                  <th>Asset</th>
                                                  <th>Asset description</th>
                                                  <th>Cabang / Depo</th>
                                                  <th>Cost Ctr</th>
                                                  <th>Cabang / Depo Penerima</th>
                                                  <th>Cost Ctr Penerima</th>
                                              </tr>
                                          </thead>
                                          <tbody>
                                            ${tableTd}
                                          </tbody>
                                      </table>
                                  </div>
                                  <a href="http://aset.pinusmerahabadi.co.id/mutasi">Klik link berikut untuk akses web asset</a>
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
                                return response(res, 'success approve mutasi', { sendEmail })
                              } else {
                                return response(res, 'berhasil approve mutasi, tidak berhasil kirim notif email 1')
                              }
                            } else {
                              return response(res, 'berhasil approve dokumen, tidak berhasil kirim notif email 2')
                            }
                          }
                        }
                      } else {
                        const findDoc = await mutasi.findAll({
                          where: {
                            no_mutasi: no
                          }
                        })
                        if (findDoc.length > 0) {
                          const findRole = await role.findAll({
                            where: {
                              name: find[arr + 1].jabatan
                            }
                          })
                          if (findRole.length > 0) {
                            if (results.length === (find.length - 1)) {
                              const findUser = await user.findOne({
                                where: {
                                  username: findDoc[0].kode_plant_rec
                                }
                              })
                              if (findUser) {
                                let tableTd = ''
                                for (let i = 0; i < findDoc.length; i++) {
                                  const element = `
                                  <tr>
                                    <td>${findDoc.indexOf(findDoc[i]) + 1}</td>
                                    <td>${findDoc[i].no_mutasi}</td>
                                    <td>${findDoc[i].no_asset}</td>
                                    <td>${findDoc[i].nama_asset}</td>
                                    <td>${findDoc[i].area}</td>
                                    <td>${findDoc[i].cost_center}</td>
                                    <td>${findDoc[i].area_rec}</td>
                                    <td>${findDoc[i].cost_center_rec}</td>
                                  </tr>`
                                  tableTd = tableTd + element
                                }
                                const mailOptions = {
                                  from: 'noreply_asset@pinusmerahabadi.co.id',
                                  replyTo: 'noreply_asset@pinusmerahabadi.co.id',
                                  // to: `${findUser.email}`,
                                  to: `${emailAss}, ${emailAss2}`,
                                  subject: `Approve Pengajuan Mutasi ${no} (TESTING)`,
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
                                        <div>Mohon lanjutkan proses pengajuan mutasi area sbb.</div>
                                    </div>
                                    <div class="position">
                                        <table class="demo-table">
                                            <thead>
                                                <tr>
                                                    <th>No</th>
                                                    <th>No Mutasi</th>
                                                    <th>Asset</th>
                                                    <th>Asset description</th>
                                                    <th>Cabang / Depo</th>
                                                    <th>Cost Ctr</th>
                                                    <th>Cabang / Depo Penerima</th>
                                                    <th>Cost Ctr Penerima</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                              ${tableTd}
                                            </tbody>
                                        </table>
                                    </div>
                                    <a href="http://aset.pinusmerahabadi.co.id/mutasi">Klik link berikut untuk akses web asset</a>
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
                                  return response(res, 'success approve mutasi', { sendEmail })
                                } else {
                                  return response(res, 'berhasil approve mutasi, tidak berhasil kirim notif email 1')
                                }
                              } else {
                                return response(res, 'berhasil approve dokumen, tidak berhasil kirim notif email 2')
                              }
                            } else {
                              const findUser = await user.findOne({
                                where: {
                                  user_level: findRole[0].nomor
                                }
                              })
                              if (findUser) {
                                let tableTd = ''
                                for (let i = 0; i < findDoc.length; i++) {
                                  const element = `
                                  <tr>
                                    <td>${findDoc.indexOf(findDoc[i]) + 1}</td>
                                    <td>${findDoc[i].no_mutasi}</td>
                                    <td>${findDoc[i].no_asset}</td>
                                    <td>${findDoc[i].nama_asset}</td>
                                    <td>${findDoc[i].area}</td>
                                    <td>${findDoc[i].cost_center}</td>
                                    <td>${findDoc[i].area_rec}</td>
                                    <td>${findDoc[i].cost_center_rec}</td>
                                  </tr>`
                                  tableTd = tableTd + element
                                }
                                const mailOptions = {
                                  from: 'noreply_asset@pinusmerahabadi.co.id',
                                  replyTo: 'noreply_asset@pinusmerahabadi.co.id',
                                  // to: `${findUser.email}`,
                                  to: `${emailAss}, ${emailAss2}`,
                                  subject: `Approve Pengajuan Mutasi ${no} (TESTING)`,
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
                                        <div>Mohon lanjutkan proses pengajuan mutasi area sbb.</div>
                                    </div>
                                    <div class="position">
                                        <table class="demo-table">
                                            <thead>
                                                <tr>
                                                    <th>No</th>
                                                    <th>No Mutasi</th>
                                                    <th>Asset</th>
                                                    <th>Asset description</th>
                                                    <th>Cabang / Depo</th>
                                                    <th>Cost Ctr</th>
                                                    <th>Cabang / Depo Penerima</th>
                                                    <th>Cost Ctr Penerima</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                              ${tableTd}
                                            </tbody>
                                        </table>
                                    </div>
                                    <a href="http://aset.pinusmerahabadi.co.id/mutasi">Klik link berikut untuk akses web asset</a>
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
                                  return response(res, 'success approve mutasi', { sendEmail })
                                } else {
                                  return response(res, 'berhasil approve mutasi, tidak berhasil kirim notif email 1')
                                }
                              } else {
                                return response(res, 'berhasil approve dokumen, tidak berhasil kirim notif email 2')
                              }
                            }
                          }
                        }
                      }
                    } else {
                      return response(res, 'failed approve mutasi', {}, 404, false)
                    }
                  } else {
                    return response(res, 'failed approve mutasi', {}, 404, false)
                  }
                } else {
                  return response(res, `${find[arr - 1].jabatan} belum approve`, {}, 404, false)
                }
              }
            }
          } else {
            return response(res, 'failed approve mutasi', {}, 404, false)
          }
        } else {
          return response(res, 'failed approve mutasi', {}, 404, false)
        }
      } else {
        return response(res, 'failed approve mutasi', {}, 404, false)
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  rejectMutasi: async (req, res) => {
    try {
      const level = req.user.level
      const name = req.user.name
      const no = req.params.no
      const list = Object.values(req.body)
      const alasan = list[0]
      const findMut = await mutasi.findAll({
        where: {
          no_mutasi: no
        }
      })
      if (findMut) {
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
                    if (sent) {
                      let tableTd = ''
                      const cek = []
                      for (let i = 0; i < findMut.length; i++) {
                        const send = {
                          status: null
                        }
                        const find = await mutasi.findOne({
                          where: {
                            [Op.and]: [
                              { no_asset: findMut[i].no_asset },
                              { no_mutasi: findMut[i].no_mutasi }
                            ]
                          }
                        })
                        const updateAsset = await asset.findOne({
                          where: {
                            no_asset: findMut[i].no_asset
                          }
                        })
                        if (find && updateAsset) {
                          const element = `
                              <tr>
                                <td>${i}</td>
                                <td>${find.no_mutasi}</td>
                                <td>${find.no_asset}</td>
                                <td>${find.nama_asset}</td>
                                <td>${find.cost_center}</td>
                                <td>${find.area}</td>
                                <td>${find.cost_center_rec}</td>
                                <td>${find.area_rec}</td>
                              </tr>`
                          tableTd = tableTd + element
                          await updateAsset.update(send)
                          await find.destroy()
                          cek.push(1)
                        }
                      }
                      if (cek.length === findMut.length) {
                        let draftEmail = ''
                        const draf = []
                        for (let i = 0; i < arr; i++) {
                          if (i === 0) {
                            const findEmail = await email.findOne({
                              where: {
                                kode_plant: findMut[0].kode_plant
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
                              draftEmail += result.email + ', ' // eslint-disable-line
                            }
                          }
                        }
                        if (draf.length > 0) {
                          const valid = []
                          for (let i = 0; i < find.length; i++) {
                            const serFind = await ttd.findByPk(find[i].id)
                            if (serFind) {
                              await serFind.destroy()
                              valid.push(1)
                            }
                          }
                          if (valid.length > 0) {
                            const findDoc = await docUser.findAll({
                              where: {
                                no_pengadaan: no
                              }
                            })
                            if (findDoc.length > 0) {
                              const cekDoc = []
                              for (let i = 0; i < findDoc.length; i++) {
                                const docOne = await docUser.findByPk(findDoc[i].id)
                                if (docOne) {
                                  await docOne.destroy()
                                  cekDoc.push(1)
                                }
                              }
                              if (cekDoc) {
                                const mailOptions = {
                                  from: 'noreply_asset@pinusmerahabadi.co.id',
                                  replyTo: 'noreply_asset@pinusmerahabadi.co.id',
                                  // to: `${draftEmail}`,
                                  to: `${emailAss}, ${emailAss2}`,
                                  subject: 'Reject Mutasi Asset (TESTING WEB ASET)',
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
                                            <div>Pengajuan mutasi asset telah direject</div>
                                            <div>Alasan Reject: ${alasan}</div>
                                            <div>Direject oleh: ${name}</div>
                                        </div>
                                        <div class="position">
                                            <table class="demo-table">
                                                <thead>
                                                    <tr>
                                                        <th>No</th>
                                                        <th>No Mutasi</th>
                                                        <th>Asset</th>
                                                        <th>Asset description</th>
                                                        <th>Cost Ctr</th>
                                                        <th>Depo / Cabang</th>
                                                        <th>Cost Ctr  Penerima</th>
                                                        <th>Depo / Cabang Penerima</th>
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
                                          ${name}
                                        </div>
                                    </body>
                                    `
                                }
                                const sendEmail = await wrapMail.wrapedSendMail(mailOptions)
                                if (sendEmail) {
                                  return response(res, 'success reject mutasi', { sendEmail })
                                } else {
                                  return response(res, 'berhasil reject mutasi, tidak berhasil kirim notif email 1')
                                }
                              }
                            } else {
                              const mailOptions = {
                                from: 'noreply_asset@pinusmerahabadi.co.id',
                                replyTo: 'noreply_asset@pinusmerahabadi.co.id',
                                // to: `${draftEmail}`,
                                to: `${emailAss}, ${emailAss2}`,
                                subject: 'Reject Mutasi Asset (TESTING WEB ASET)',
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
                                          <div>Pengajuan mutasi asset telah direject</div>
                                          <div>Alasan Reject: ${alasan}</div>
                                          <div>Direject oleh: ${name}</div>
                                      </div>
                                      <div class="position">
                                          <table class="demo-table">
                                              <thead>
                                                  <tr>
                                                      <th>No</th>
                                                      <th>No Mutasi</th>
                                                      <th>Asset</th>
                                                      <th>Asset description</th>
                                                      <th>Cost Ctr</th>
                                                      <th>Depo / Cabang</th>
                                                      <th>Cost Ctr  Penerima</th>
                                                      <th>Depo / Cabang Penerima</th>
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
                                        ${name}
                                      </div>
                                  </body>
                                  `
                              }
                              const sendEmail = await wrapMail.wrapedSendMail(mailOptions)
                              if (sendEmail) {
                                return response(res, 'success reject mutasi', { sendEmail })
                              } else {
                                return response(res, 'berhasil reject mutasi, tidak berhasil kirim notif email 1')
                              }
                            }
                          } else {
                            return response(res, 'failed reject mutasi7', {}, 404, false)
                          }
                        }
                      } else {
                        return response(res, 'failed reject mutasi6', {}, 404, false)
                      }
                    } else {
                      return response(res, 'failed reject mutasi5', {}, 404, false)
                    }
                  } else {
                    return response(res, 'failed reject mutasi4', {}, 404, false)
                  }
                } else {
                  return response(res, `${find[arr - 1].jabatan} belum approve`, {}, 404, false)
                }
              }
            } else {
              return response(res, 'failed reject mutasi3', {}, 404, false)
            }
          } else {
            return response(res, 'failed reject mutasi2', {}, 404, false)
          }
        } else {
          return response(res, 'failed reject mutasi35', {}, 404, false)
        }
      } else {
        return response(res, 'failed reject mutasi1', {}, 404, false)
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  getDocumentMut: async (req, res) => {
    try {
      const no = req.params.no
      const nomut = req.params.nomut
      const results = await mutasi.findOne({
        where: {
          [Op.and]: [
            { no_asset: no },
            { no_mutasi: nomut }
          ]
        }
      })
      if (results) {
        const result = await docUser.findAll({
          where: {
            no_pengadaan: nomut
          }
        })
        if (result.length > 0) {
          return response(res, 'success get document', { result })
        } else {
          const getDoc = await document.findAll({
            where: {
              [Op.and]: [
                { tipe_dokumen: 'mutasi' },
                {
                  [Op.or]: [
                    { tipe: 'rec' }
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
                no_pengadaan: nomut,
                tipe: 'rec',
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
  rejectEksekusi: async (req, res) => {
    try {
      const level = req.user.level
      const name = req.user.name
      const no = req.params.no
      const list = Object.values(req.body)
      const alasan = list[0]
      const findMut = await mutasi.findAll({
        where: {
          no_mutasi: no
        }
      })
      if (findMut) {
        const result = await role.findAll({
          where: {
            nomor: level
          }
        })
        if (result.length > 0) {
          const findTtd = await ttd.findAll({
            where: {
              no_doc: no
            }
          })
          if (findTtd.length > 0) {
            let tableTd = ''
            const cek = []
            for (let i = 1; i < list.length; i++) {
              const send = {
                status: null
              }
              const find = await mutasi.findOne({
                where: {
                  [Op.and]: [
                    { no_asset: list[i] },
                    { no_mutasi: findMut[0].no_mutasi }
                  ]
                }
              })
              const updateAsset = await asset.findOne({
                where: {
                  no_asset: list[i]
                }
              })
              if (find && updateAsset) {
                const element = `
                  <tr>
                    <td>${i}</td>
                    <td>${find.no_mutasi}</td>
                    <td>${find.no_asset}</td>
                    <td>${find.nama_asset}</td>
                    <td>${find.cost_center}</td>
                    <td>${find.area}</td>
                    <td>${find.cost_center_rec}</td>
                    <td>${find.area_rec}</td>
                  </tr>`
                tableTd = tableTd + element
                await updateAsset.update(send)
                await find.destroy()
                cek.push(1)
              }
            }
            if (cek.length === (list.length - 1)) {
              let draftEmail = ''
              const draf = []
              for (let i = 0; i < findTtd.length; i++) {
                if (findTtd[i].jabatan === 'area' && findTtd[i].sebagai === 'pembuat') {
                  const findEmail = await email.findOne({
                    where: {
                      kode_plant: findMut[0].kode_plant
                    }
                  })
                  if (findEmail) {
                    draf.push(findEmail)
                    draftEmail += findEmail.email_area_aos + ', '
                  }
                } else if (findTtd[i].jabatan === 'area' && findTtd[i].sebagai === 'penerima') {
                  const findEmail = await email.findOne({
                    where: {
                      kode_plant: findMut[0].kode_plant_rec
                    }
                  })
                  if (findEmail) {
                    draf.push(findEmail)
                    draftEmail += findEmail.email_area_aos + ', '
                  }
                } else {
                  const result = await user.findOne({
                    where: {
                      username: findTtd[i].nama
                    }
                  })
                  if (result) {
                    draf.push(result)
                    draftEmail += result.email + ', ' // eslint-disable-line
                  }
                }
              }
              if (draf.length > 0) {
                const valid = []
                for (let i = 0; i < findTtd.length; i++) {
                  const serFind = await ttd.findByPk(findTtd[i].id)
                  if (serFind) {
                    if (findMut.length === (list.length - 1)) {
                      await serFind.destroy()
                      valid.push(1)
                    } else {
                      valid.push(1)
                    }
                  }
                }
                if (valid.length > 0) {
                  const mailOptions = {
                    from: 'noreply_asset@pinusmerahabadi.co.id',
                    replyTo: 'noreply_asset@pinusmerahabadi.co.id',
                    // to: `${draftEmail}`,
                    to: `${emailAss}, ${emailAss2}`,
                    subject: 'Reject Mutasi Asset (TESTING WEB ASET)',
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
                            <div>Pengajuan mutasi asset telah direject</div>
                            <div>Alasan Reject: ${alasan}</div>
                            <div>Direject oleh: Team Asset</div>
                        </div>
                        <div class="position">
                            <table class="demo-table">
                                <thead>
                                    <tr>
                                        <th>No</th>
                                        <th>No Mutasi</th>
                                        <th>Asset</th>
                                        <th>Asset description</th>
                                        <th>Cost Ctr</th>
                                        <th>Depo / Cabang</th>
                                        <th>Cost Ctr  Penerima</th>
                                        <th>Depo / Cabang Penerima</th>
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
                          ${name}
                        </div>
                    </body>
                    `
                  }
                  const sendEmail = await wrapMail.wrapedSendMail(mailOptions)
                  if (sendEmail) {
                    return response(res, 'success reject mutasi', { sendEmail })
                  } else {
                    return response(res, 'berhasil reject mutasi, tidak berhasil kirim notif email 1')
                  }
                } else {
                  return response(res, 'failed reject mutasi7', {}, 404, false)
                }
              } else {
                return response(res, 'failed reject mutasi8', {}, 404, false)
              }
            } else {
              return response(res, 'failed reject mutasi6', {}, 404, false)
            }
          } else {
            return response(res, 'failed reject mutasi2', {}, 404, false)
          }
        } else {
          return response(res, 'failed reject mutasi35', {}, 404, false)
        }
      } else {
        return response(res, 'failed reject mutasi1', {}, 404, false)
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  rejectDokumen: async (req, res) => {
    try {
      const id = req.params.id
      const level = req.user.level
      const { tipe } = req.query
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
              divisi: '0',
              status: 4
            }
            const reject = await result.update(send)
            if (reject) {
              if (tipe === 'edit') {
                const findDis = await mutasi.findAll({
                  where: {
                    no_mutasi: result.no_pengadaan
                  }
                })
                if (findDis) {
                  const findEmail = await email.findOne({
                    where: {
                      kode_plant: findDis[0].kode_plant
                    }
                  })
                  if (findEmail) {
                    const data = {
                      kode_plant: findDis[0].kode_plant,
                      jenis: 'mutasi',
                      no_proses: findDis[0].no_mutasi,
                      list_appr: findDis[0].kode_plant,
                      keterangan: result.nama_dokumen,
                      response: 'revisi'
                    }
                    const createNotif = await notif.create(data)
                    if (createNotif) {
                      // const ccIt = [findEmail.email_am, findEmail.email_aam, findEmail.email_spv_asset, findEmail.email_staff_asset1, findEmail.email_staff_asset2, findEmail.email_nom, findEmail.email_bm, findEmail.email_area_om, findEmail.email_it_spv, findEmail.email_ism, findEmail.email_staff_it, findEmail.email_ga_spv, findEmail.email_staff_ga]
                      // const cc = [findEmail.email_am, findEmail.email_aam, findEmail.email_spv_asset, findEmail.email_staff_asset1, findEmail.email_staff_asset2, findEmail.email_nom, findEmail.email_bm, findEmail.email_area_om, findEmail.email_ga_spv, findEmail.email_staff_ga]
                      let tableTd = ''
                      for (let i = 0; i < findDis.length; i++) {
                        const element = `
                        <tr>
                          <td>${findDis.indexOf(findDis[i]) + 1}</td>
                          <td>${findDis[i].no_mutasi}</td>
                          <td>${findDis[i].no_asset}</td>
                          <td>${findDis[i].nama_asset}</td>
                          <td>${findDis[i].area}</td>
                          <td>${findDis[i].cost_center}</td>
                          <td>${findDis[i].area_rec}</td>
                          <td>${findDis[i].cost_center_rec}</td>
                        </tr>`
                        tableTd = tableTd + element
                      }
                      const mailOptions = {
                        from: 'noreply_asset@pinusmerahabadi.co.id',
                        replyTo: 'noreply_asset@pinusmerahabadi.co.id',
                        // to: `${findEmail.email_area_aos}`,
                        to: `${emailAss}, ${emailAss2}`,
                        // cc: findDis.kategori === 'it' || findDis.kategori === 'IT' ? `${ccIt}` : `${cc}`,
                        subject: `REJECT KELENGKAPAN MUTASI ASSET ${findDis[0].area} (TESTING)`,
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
                                <div>Lampiran pengajuan mutasi asset telah direject dengan alasan sebagai berikut:</div>
                                <div>Alasan reject: ${results.alasan}</div>
                                <div>Direject oleh: 'Team Asset'</div>
                            </div>
                            <div class="position mar1">
                                <table class="demo-table">
                                    <thead>
                                        <tr>
                                          <th>No</th>
                                          <th>No Mutasi</th>
                                          <th>Asset</th>
                                          <th>Asset description</th>
                                          <th>Cabang / Depo</th>
                                          <th>Cost Ctr</th>
                                          <th>Cabang / Depo Penerima</th>
                                          <th>Cost Ctr Penerima</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                      ${tableTd}
                                    </tbody>
                                </table>
                            </div>
                            <div class="tittle">Mohon agar melengkapi/memperbaiki kelengkapan mutasi asset untuk dapat diproses lebih lanjut.</div>
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
                        return response(res, 'success submit eksekusi mutasi', { sendEmail })
                      } else {
                        return response(res, 'berhasil submit eksekusi mutasi, tidak berhasil kirim notif email 1')
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
  submitEks: async (req, res) => {
    try {
      const no = req.params.no
      const findBud = await mutasi.findAll({
        where: {
          [Op.and]: [
            { no_mutasi: no },
            { isbudget: 'ya' }
          ]
        }
      })
      if (findBud.length > 0) {
        let tableTd = ''
        const cek = []
        for (let i = 0; i < findBud.length; i++) {
          const data = {
            status_form: 3
          }
          const findData = await mutasi.findByPk(findBud[i].id)
          if (findData) {
            await findData.update(data)
            const element = `
              <tr>
                <td>${findBud.indexOf(findBud[i]) + 1}</td>
                <td>${findBud[i].no_mutasi}</td>
                <td>${findBud[i].no_asset}</td>
                <td>${findBud[i].nama_asset}</td>
                <td>${findBud[i].area}</td>
                <td>${findBud[i].cost_center}</td>
                <td>${findBud[i].area_rec}</td>
                <td>${findBud[i].cost_center_rec}</td>
                <td>${findBud[i].no_io}</td>
              </tr>`
            tableTd = tableTd + element
            cek.push(1)
          }
        }
        if (cek.length === findBud.length) {
          const findUser = await user.findOne({
            where: {
              user_level: 8
            }
          })
          if (findUser) {
            const mailOptions = {
              from: 'noreply_asset@pinusmerahabadi.co.id',
              replyTo: 'noreply_asset@pinusmerahabadi.co.id',
              // to: `${findUser.email}`,
              to: `${emailAss}, ${emailAss2}`,
              // cc: findDis.kategori === 'it' || findDis.kategori === 'IT' ? `${ccIt}` : `${cc}`,
              subject: `PERMINTAAN RUBAH COST CENTER MUTASI ASSET ${findBud[0].area} (TESTING)`,
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
                      <div>Mohon untuk mengubah cost center asset mutasi sebagai berikut:</div>
                  </div>
                  <div class="position mar1">
                      <table class="demo-table">
                          <thead>
                              <tr>
                                <th>No</th>
                                <th>No Mutasi</th>
                                <th>Asset</th>
                                <th>Asset description</th>
                                <th>Cabang / Depo</th>
                                <th>Cost Ctr</th>
                                <th>Cabang / Depo Penerima</th>
                                <th>Cost Ctr Penerima</th>
                                <th>No io</th>
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
              const findMut = await mutasi.findAll({
                where: {
                  [Op.and]: [
                    { no_mutasi: no },
                    { isbudget: 'tidak' }
                  ]
                }
              })
              if (findMut.length > 0) {
                let tableTd = ''
                const cek = []
                for (let i = 0; i < findMut.length; i++) {
                  const data = {
                    status_form: 7
                  }
                  // const send = {
                  //   kode_plant: findMut[i].kode_plant_rec,
                  //   status: null,
                  //   area: findMut[i].area_rec
                  // }
                  const findData = await mutasi.findByPk(findMut[i].id)
                  // const findAsset = await asset.findOne({
                  //   where: {
                  //     no_asset: findMut[i].no_asset
                  //   }
                  // })
                  if (findData) {
                    await findData.update(data)
                    // await findAsset.update(send)
                    const element = `
                    <tr>
                      <td>${findMut.indexOf(findMut[i]) + 1}</td>
                      <td>${findMut[i].no_mutasi}</td>
                      <td>${findMut[i].no_asset}</td>
                      <td>${findMut[i].nama_asset}</td>
                      <td>${findMut[i].area}</td>
                      <td>${findMut[i].cost_center}</td>
                      <td>${findMut[i].area_rec}</td>
                      <td>${findMut[i].cost_center_rec}</td>
                    </tr>`
                    tableTd = tableTd + element
                    cek.push(1)
                  }
                }
                if (cek.length === findMut.length) {
                  const findUser = await email.findOne({
                    where: {
                      kode_plant: findMut[0].kode_plant
                    }
                  })
                  if (findUser) {
                    return response(res, 'success submit eksekusi mutasi')
                  } else {
                    return response(res, 'success submit eksekusi fail send email')
                  }
                } else {
                  return response(res, 'failed submit eksekusi mutasi', {}, 404, false)
                }
              } else {
                return response(res, 'failed submit eksekusi mutasi', {}, 404, false)
              }
            } else {
              const findMut = await mutasi.findAll({
                where: {
                  [Op.and]: [
                    { no_mutasi: no },
                    { isbudget: 'tidak' }
                  ]
                }
              })
              if (findMut.length > 0) {
                let tableTd = ''
                const cek = []
                for (let i = 0; i < findMut.length; i++) {
                  const data = {
                    status_form: 7
                  }
                  // const send = {
                  //   kode_plant: findMut[i].kode_plant_rec,
                  //   status: null,
                  //   area: findMut[i].area_rec
                  // }
                  const findData = await mutasi.findByPk(findMut[i].id)
                  // const findAsset = await asset.findOne({
                  //   where: {
                  //     no_asset: findMut[i].no_asset
                  //   }
                  // })
                  if (findData) {
                    await findData.update(data)
                    // await findAsset.update(send)
                    const element = `
                    <tr>
                      <td>${findMut.indexOf(findMut[i]) + 1}</td>
                      <td>${findMut[i].no_mutasi}</td>
                      <td>${findMut[i].no_asset}</td>
                      <td>${findMut[i].nama_asset}</td>
                      <td>${findMut[i].area}</td>
                      <td>${findMut[i].cost_center}</td>
                      <td>${findMut[i].area_rec}</td>
                      <td>${findMut[i].cost_center_rec}</td>
                    </tr>`
                    tableTd = tableTd + element
                    cek.push(1)
                  }
                }
                if (cek.length === findMut.length) {
                  const findUser = await email.findOne({
                    where: {
                      kode_plant: findMut[0].kode_plant
                    }
                  })
                  if (findUser) {
                    return response(res, 'success submit eksekusi mutasi')
                  } else {
                    return response(res, 'success submit eksekusi fail send email')
                  }
                } else {
                  return response(res, 'failed submit eksekusi mutasi', {}, 404, false)
                }
              } else {
                return response(res, 'failed submit eksekusi mutasi', {}, 404, false)
              }
            }
          } else {
            return response(res, 'success submit eksekusi fail send email')
          }
        } else {
          return response(res, 'failed submit eksekusi mutasi', {}, 404, false)
        }
      } else {
        const findMut = await mutasi.findAll({
          where: {
            [Op.and]: [
              { no_mutasi: no },
              { isbudget: 'tidak' }
            ]
          }
        })
        if (findMut.length > 0) {
          let tableTd = ''
          const cek = []
          for (let i = 0; i < findMut.length; i++) {
            const data = {
              status_form: 8,
              tgl_mutasisap: moment()
            }
            const send = {
              kode_plant: findMut[i].kode_plant_rec,
              status: null,
              area: findMut[i].area_rec,
              keterangan: null
            }
            const findData = await mutasi.findByPk(findMut[i].id)
            const findAsset = await asset.findOne({
              where: {
                no_asset: findMut[i].no_asset
              }
            })
            if (findData && findAsset) {
              await findData.update(data)
              await findAsset.update(send)
              const element = `
              <tr>
                <td>${findMut.indexOf(findMut[i]) + 1}</td>
                <td>${findMut[i].no_mutasi}</td>
                <td>${findMut[i].no_asset}</td>
                <td>${findMut[i].nama_asset}</td>
                <td>${findMut[i].area}</td>
                <td>${findMut[i].cost_center}</td>
                <td>${findMut[i].area_rec}</td>
                <td>${findMut[i].cost_center_rec}</td>
              </tr>`
              tableTd = tableTd + element
              cek.push(1)
            }
          }
          if (cek.length === findMut.length) {
            const findUser = await email.findOne({
              where: {
                kode_plant: findMut[0].kode_plant
              }
            })
            if (findUser) {
              const mailOptions = {
                from: 'noreply_asset@pinusmerahabadi.co.id',
                replyTo: 'noreply_asset@pinusmerahabadi.co.id',
                // to: `${findUser.email_area_aos}`,
                to: `${emailAss}, ${emailAss2}`,
                // cc: findDis.kategori === 'it' || findDis.kategori === 'IT' ? `${ccIt}` : `${cc}`,
                subject: `SELESAI MUTASI ASSET ${findMut[0].area} (TESTING)`,
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
                        <div>asset berikut telah berhasil dimutasikan:</div>
                    </div>
                    <div class="position mar1">
                        <table class="demo-table">
                            <thead>
                                <tr>
                                  <th>No</th>
                                  <th>No Mutasi</th>
                                  <th>Asset</th>
                                  <th>Asset description</th>
                                  <th>Cabang / Depo</th>
                                  <th>Cost Ctr</th>
                                  <th>Cabang / Depo Penerima</th>
                                  <th>Cost Ctr Penerima</th>
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
                return response(res, 'success submit eksekusi mutasi', { sendEmail })
              } else {
                return response(res, 'berhasil submit eksekusi mutasi, tidak berhasil kirim notif email 1')
              }
            } else {
              return response(res, 'success submit eksekusi fail send email')
            }
          } else {
            return response(res, 'failed submit eksekusi mutasi', {}, 404, false)
          }
        } else {
          return response(res, 'failed submit eksekusi mutasi', {}, 404, false)
        }
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  updateBudget: async (req, res) => {
    try {
      const status = req.params.stat
      const id = req.params.id
      const findMutasi = await mutasi.findByPk(id)
      if (findMutasi) {
        if (status === 'ya' && findMutasi.doc_sap !== null) {
          const data = {
            isbudget: status,
            doc_sap: null
          }
          const update = await findMutasi.update(data)
          if (update) {
            return response(res, 'success update status asset', { data })
          } else {
            return response(res, 'failed update status asset', {}, 404, false)
          }
        } else {
          const data = {
            isbudget: status
          }
          const update = await findMutasi.update(data)
          if (update) {
            return response(res, 'success update status asset', { data })
          } else {
            return response(res, 'failed update status asset', {}, 404, false)
          }
        }
      } else {
        return response(res, 'failed update status asset', {}, 404, false)
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  submitBudget: async (req, res) => {
    try {
      const level = req.user.level
      const no = req.params.no
      const findBud = await mutasi.findAll({
        where: {
          no_mutasi: no,
          [Op.or]: [
            { status_form: level === 2 ? 4 : 3 },
            { status_form: level === 2 ? 7 : 3 },
            { status_form: level === 2 ? 8 : 3 }
          ]
        }
      })
      if (findBud.length > 0) {
        let tableTd = ''
        const cek = []
        for (let i = 0; i < findBud.length; i++) {
          const data = {
            status_form: level === 2 ? 8 : 4,
            tgl_mutasisap: level === 2 ? moment() : null
          }
          const send = {
            kode_plant: findBud[i].kode_plant_rec,
            status: null,
            area: findBud[i].area_rec,
            keterangan: null
          }
          const findData = await mutasi.findByPk(findBud[i].id)
          const findAsset = await asset.findOne({
            where: {
              no_asset: findBud[i].no_asset
            }
          })
          if (findData && findAsset) {
            await findData.update(data)
            await findAsset.update(send)
            const element = `
              <tr>
                <td>${findBud.indexOf(findBud[i]) + 1}</td>
                <td>${findBud[i].no_mutasi}</td>
                <td>${findBud[i].no_asset}</td>
                <td>${findBud[i].nama_asset}</td>
                <td>${findBud[i].area}</td>
                <td>${findBud[i].cost_center}</td>
                <td>${findBud[i].area_rec}</td>
                <td>${findBud[i].cost_center_rec}</td>
                <td>${findBud[i].no_io}</td>
                <td>${findBud[i].cost_centerawal}</td>
              </tr>`
            tableTd = tableTd + element
            cek.push(1)
          }
        }
        if (cek.length === findBud.length) {
          const findUser = await user.findOne({
            where: {
              user_level: level === 2 ? 8 : 2
            }
          })
          const findEmail = await email.findOne({
            where: {
              kode_plant: findBud[0].kode_plant
            }
          })
          if (findUser && findEmail) {
            const mailOptions = {
              from: 'noreply_asset@pinusmerahabadi.co.id',
              replyTo: 'noreply_asset@pinusmerahabadi.co.id',
              // to: `${findUser.email}`,
              to: `${emailAss}, ${emailAss2}`,
              // cc: findDis.kategori === 'it' || findDis.kategori === 'IT' ? `${ccIt}` : `${cc}`,
              subject: `${level === 2 ? `PERMINTAAN PENGEMBALIAN COST CENTER MUTASI ASSET ${findBud[0].area}` : `COST CENTER MUTASI ASSET TELAH DIUBAH ${findBud[0].area}`} (TESTING)`,
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
                      <div>${level === 2 ? 'Mohon untuk mengembalikan cost center seperti semula terkait asset mutasi sebagai berikut:' : 'Cost center telah diubah terkait asset mutasi sebagai berikut:'}</div>
                  </div>
                  <div class="position mar1">
                      <table class="demo-table">
                          <thead>
                              <tr>
                                <th>No</th>
                                <th>No Mutasi</th>
                                <th>Asset</th>
                                <th>Asset description</th>
                                <th>Cabang / Depo</th>
                                <th>Cost Ctr</th>
                                <th>Cabang / Depo Penerima</th>
                                <th>Cost Ctr Penerima</th>
                                <th>No io</th>
                                <th>Cost Center Io</th>
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
            const mailOptionsArea = {
              from: 'noreply_asset@pinusmerahabadi.co.id',
              replyTo: 'noreply_asset@pinusmerahabadi.co.id',
              // to: `${findEmail.email_area_aos}`,
              to: `${emailAss}, ${emailAss2}`,
              // cc: findDis.kategori === 'it' || findDis.kategori === 'IT' ? `${ccIt}` : `${cc}`,
              subject: `SELESAI MUTASI ASSET ${findBud[0].area} (TESTING)`,
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
                      <div>asset berikut telah berhasil dimutasikan:</div>
                  </div>
                  <div class="position mar1">
                      <table class="demo-table">
                          <thead>
                              <tr>
                                <th>No</th>
                                <th>No Mutasi</th>
                                <th>Asset</th>
                                <th>Asset description</th>
                                <th>Cabang / Depo</th>
                                <th>Cost Ctr</th>
                                <th>Cabang / Depo Penerima</th>
                                <th>Cost Ctr Penerima</th>
                                <th>No io</th>
                                <th>Cost Center Io</th>
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
              if (level === 2) {
                const sendEmail = await wrapMail.wrapedSendMail(mailOptionsArea)
                if (sendEmail) {
                  return response(res, 'success submit budget mutasi', { sendEmail })
                } else {
                  return response(res, 'berhasil submit budget mutasi, tidak berhasil kirim notif email 1')
                }
              } else {
                return response(res, 'success submit budget mutasi', { sendEmail })
              }
            } else {
              if (level === 2) {
                const sendEmail = await wrapMail.wrapedSendMail(mailOptionsArea)
                if (sendEmail) {
                  return response(res, 'success submit budget mutasi', { sendEmail })
                } else {
                  return response(res, 'berhasil submit budget mutasi, tidak berhasil kirim notif email 1')
                }
              } else {
                return response(res, 'berhasil submit budget mutasi, tidak berhasil kirim notif email 1')
              }
            }
          } else {
            return response(res, 'failed submit budget', {}, 404, false)
          }
        } else {
          return response(res, 'failed submit budget', {}, 404, false)
        }
      } else {
        return response(res, 'failed submit budget', {}, 404, false)
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  updateEksekusi: async (req, res) => {
    try {
      const id = req.params.id
      const schema = joi.object({
        no_io: joi.string().allow(''),
        doc_sap: joi.string().allow(''),
        cost_centerawal: joi.string().allow('')
      })
      const { value: results, error } = schema.validate(req.body)
      if (error) {
        return response(res, 'Error', { error: error.message }, 404, false)
      } else {
        const findMut = await mutasi.findByPk(id)
        if (findMut) {
          const updateMut = await findMut.update(results)
          if (updateMut) {
            return response(res, 'success update status eksekusi')
          } else {
            return response(res, 'failed update status eksekusi', {}, 404, false)
          }
        } else {
          return response(res, 'failed update status eksekusi', {}, 404, false)
        }
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  updateDate: async (req, res) => {
    try {
      const no = req.params.no
      const schema = joi.object({
        tgl_mutasifisik: joi.date().required()
      })
      const { value: results, error } = schema.validate(req.body)
      if (error) {
        return response(res, 'Error', { error: error.message }, 404, false)
      } else {
        const findMut = await mutasi.findAll({
          where: {
            no_mutasi: no
          }
        })
        if (findMut.length > 0) {
          const cek = []
          for (let i = 0; i < findMut.length; i++) {
            const find = await mutasi.findByPk(findMut[i].id)
            if (find) {
              await find.update(results)
              cek.push(1)
            }
          }
          if (cek.length === findMut.length) {
            return response(res, 'success update tgl mutasi fisik')
          } else {
            return response(res, 'failed update status eksekusi', {}, 404, false)
          }
        } else {
          return response(res, 'failed update status eksekusi', {}, 404, false)
        }
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  submitEditMutasi: async (req, res) => {
    try {
      const no = req.params.no
      const findDoc = await docUser.findAll({
        where: {
          no_pengadaan: no
        }
      })
      if (findDoc.length > 0) {
        const cek = []
        for (let i = 0; i < findDoc.length; i++) {
          const data = {
            status: 1
          }
          const result = await docUser.findByPk(findDoc[i].id)
          if (result) {
            await result.update(data)
            cek.push(result)
          }
        }
        if (cek.length === findDoc.length) {
          const findMut = await mutasi.findAll({
            where: {
              no_mutasi: no
            }
          })
          if (findMut.length > 0) {
            const findEmail = await email.findOne({
              where: {
                kode_plant: findMut[0].kode_plant_rec
              }
            })
            if (findEmail) {
              let tableTd = ''
              for (let i = 0; i < findMut.length; i++) {
                const element = `
                  <tr>
                    <td>${findMut.indexOf(findMut[i]) + 1}</td>
                    <td>${findMut[i].no_mutasi}</td>
                    <td>${findMut[i].no_asset}</td>
                    <td>${findMut[i].nama_asset}</td>
                    <td>${findMut[i].area}</td>
                    <td>${findMut[i].cost_center}</td>
                    <td>${findMut[i].area_rec}</td>
                    <td>${findMut[i].cost_center_rec}</td>
                  </tr>`
                tableTd = tableTd + element
              }
              const mailOptions = {
                from: 'noreply_asset@pinusmerahabadi.co.id',
                replyTo: 'noreply_asset@pinusmerahabadi.co.id',
                // to: `${findEmail.email_staff_asset1}, ${findEmail.email_staff_asset2}`,
                to: `${emailAss}, ${emailAss2}`,
                // cc: findDis.kategori === 'it' || findDis.kategori === 'IT' ? `${ccIt}` : `${cc}`,
                subject: `SELESAI REVISI DOKUMEN BA SERAH TERIMA MUTASI ${findMut[0].no_mutasi} (TESTING)`,
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
                        <div>Dokumen BA serah terima terkait asset dibawah telah direvisi</div>
                    </div>
                    <div class="position mar1">
                        <table class="demo-table">
                            <thead>
                                <tr>
                                  <th>No</th>
                                  <th>No Mutasi</th>
                                  <th>Asset</th>
                                  <th>Asset description</th>
                                  <th>Cabang / Depo</th>
                                  <th>Cost Ctr</th>
                                  <th>Cabang / Depo Penerima</th>
                                  <th>Cost Ctr Penerima</th>
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
                return response(res, 'success submit edit mutasi2')
              } else {
                return response(res, 'success submit edit mutasi fail send email')
              }
            } else {
              return response(res, 'success submit edit mutasi2')
            }
          } else {
            return response(res, 'success submit edit mutasi1')
          }
        } else {
          return response(res, 'failed submit edit mutasi', {}, 404, false)
        }
      } else {
        return response(res, 'failed submit edit mutasi', {}, 404, false)
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  deleteApprove: async (req, res) => {
    try {
      const no = req.params.no
      const findTtd = await ttd.findAll({
        where: {
          no_doc: no
        }
      })
      if (findTtd.length) {
        const valid = []
        for (let i = 0; i < findTtd.length; i++) {
          const find = await ttd.findByPk(findTtd[i].id)
          if (find) {
            await find.destroy()
            valid.push(1)
          }
        }
        if (valid.length === findTtd.length) {
          return response(res, 'succesfully delete approval')
        } else {
          return response(res, 'gagal menghapus', {}, 404, false)
        }
      } else {
        return response(res, 'approval tidak ditemukan', {}, 404, false)
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  }
}
