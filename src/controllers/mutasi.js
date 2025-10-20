const response = require('../helpers/response')
const { mutasi, asset, depo, ttd, approve, role, user, docUser, document, path, email, reservoir, role_user, sequelize } = require('../models') // eslint-disable-line
const { Op } = require('sequelize')
const { pagination } = require('../helpers/pagination')
const joi = require('joi')
const wrapMail = require('../helpers/wrapMail')
const uploadHelper = require('../helpers/upload')
const multer = require('multer')
const moment = require('moment')
const axios = require('axios')
const { generateToken } = require('../helpers/signjwt')
const jwt = require('jsonwebtoken')
const { APP_KEY, APP_SAP, APP_CLIENT } = process.env

const emailAss = 'fahmi_aziz@pinusmerahabadi.co.id'
const emailAss2 = 'fahmi_aziz@pinusmerahabadi.co.id'

// Delete "parseInt(APP_CLIENT) === 110" untuk production

module.exports = {
  getDataCart: async (req, res) => {
    try {
      const kode = req.user.kode
      // const cost = req.user.name
      // const level = req.user.level
      const result = await mutasi.findAndCountAll({
        where: {
          kode_plant: kode,
          status_form: 1
        },
        include: [
          {
            model: path,
            as: 'pict'
          },
          {
            model: asset,
            as: 'dataAsset'
          }
        ]
      })
      if (result) {
        return response(res, 'success get mutasi', { result })
      } else {
        return response(res, 'success get mutasi', { result })
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  addMutasi: async (req, res) => {
    try {
      const no = req.params.no
      const plant = req.params.plant
      const kode = req.user.kode
      // const cost = req.user.name
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
              { kode_plant: kode },
              { status_form: 1 }
            ]
          }
        })
        if (findArea.length > 0) {
          const findPlant = await mutasi.findAll({
            where: {
              [Op.and]: [
                { kode_plant: kode },
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
                  { kode_plant: kode }
                ]
              }
            })
            const findDepo = await depo.findOne({
              where: {
                kode_plant: kode
              }
            })
            if (findAsset.length > 0) {
              return response(res, 'success add mutasi', { result: findAsset })
            } else if ((level === 5 && result.cost_center === findDepo.cost_center) || (level === 9 && result.cost_center === kode)) {
              if (findDepo) {
                const findRec = await depo.findOne({
                  where: {
                    kode_plant: plant
                  }
                })
                if (findRec) {
                  const send = {
                    kode_plant: kode,
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
                      return response(res, 'failed add mutasi1', {}, 400, false)
                    }
                  } else {
                    return response(res, 'failed add mutasi2', {}, 400, false)
                  }
                } else {
                  return response(res, 'failed add mutasi3', {}, 400, false)
                }
              } else {
                return response(res, 'failed add mutasi4', {}, 400, false)
              }
            } else {
              return response(res, 'failed add mutasi5', { findDepo, result }, 400, false)
            }
          } else {
            return response(res, 'Hanya bisa menambahkan item dengan area tujuan yang sama. Kosongkan atau submit cart terlebih dahulu !', { findArea }, 400, false)
          }
        } else {
          const findAsset = await mutasi.findAll({
            where: {
              [Op.and]: [
                { no_asset: result.no_asset },
                { kode_plant: kode }
              ]
            }
          })
          const findDepo = await depo.findOne({
            where: {
              kode_plant: kode
            }
          })
          if (findAsset.length > 0) {
            return response(res, 'success add mutasi', { result: findAsset })
          } else if ((level === 5 && result.cost_center === findDepo.cost_center) || (level === 9 && result.cost_center === kode)) {
            if (findDepo) {
              const findRec = await depo.findOne({
                where: {
                  kode_plant: plant
                }
              })
              if (findRec) {
                const send = {
                  kode_plant: kode,
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
                    return response(res, 'failed add mutasi1', {}, 400, false)
                  }
                } else {
                  return response(res, 'failed add mutasi2', {}, 400, false)
                }
              } else {
                return response(res, 'failed add mutasi3', {}, 400, false)
              }
            } else {
              return response(res, 'failed add mutasi4', {}, 400, false)
            }
          } else {
            return response(res, 'failed add mutasi5', { result, findDepo }, 400, false)
          }
        }
      } else {
        return response(res, 'failed add mutasi6', {}, 400, false)
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  updateMutasi: async (req, res) => {
    try {
      const { kodeRec, id } = req.body
      const findRec = await depo.findOne({
        where: {
          kode_plant: kodeRec
        }
      })
      if (findRec) {
        const findData = await mutasi.findByPk(id)
        if (findData) {
          const data = {
            kode_plant_rec: findRec.kode_plant,
            cost_center_rec: findRec.cost_center,
            area_rec: findRec.nama_area
          }
          const updateData = await findData.update(data)
          if (updateData) {
            return response(res, 'success update mutasi', { updateData })
          } else {
            return response(res, 'failed update mutasi1', {}, 400, false)
          }
        } else {
          return response(res, 'failed update mutasi2', {}, 400, false)
        }
      } else {
        return response(res, 'failed update mutasi3', {}, 400, false)
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  getMutasi: async (req, res) => {
    try {
      const level = req.user.level
      const kode = req.user.kode
      const idUser = req.user.id
      const fullname = req.user.fullname
      // const cost = req.user.name
      const { status, time1, time2 } = req.query
      let { limit, page, search, sort } = req.query
      const statTrans = status === 'undefined' || status === null ? 'all' : status
      const timeVal1 = time1 === 'undefined' ? 'all' : time1
      const timeVal2 = time2 === 'undefined' ? 'all' : time2
      const timeV1 = moment(timeVal1)
      const timeV2 = timeVal1 !== 'all' && timeVal1 === timeVal2 ? moment(timeVal2).add(1, 'd') : moment(timeVal2).add(1, 'd')
      const listDepo = 'all'
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
      } else if (limit === 'all') {
        limit = 'all'
      } else {
        limit = 100
      }
      if (!page) {
        page = 1
      } else {
        page = parseInt(page)
      }
      // const dumpLevel = []
      // const listApp = [12, 7, 5, 9, 28]
      const findUser = await user.findOne({
        where: {
          id: idUser
        },
        include: [
          {
            model: role,
            as: 'role'
          }
        ]
      })
      // for (let i = 0; i < findUser.detail_role.length + 1; i++) {
      //   if (i === findUser.detail_role.length) {
      //     const dataCek = parseInt(findUser.user_level)
      //     const select = listApp.find(x => x === dataCek)
      //     if (select !== undefined) {
      //       dumpLevel.push(dataCek)
      //     }
      //   } else {
      //     const data = findUser.detail_role[i]
      //     const dataCek = parseInt(data.id_role)
      //     const select = listApp.find(x => x === dataCek)
      //     if (select !== undefined) {
      //       dumpLevel.push(dataCek)
      //     }
      //   }
      // }

      if (level === 5 || level === 9) {
        const result = await mutasi.findAndCountAll({
          where: {
            [Op.and]: [
              {
                [Op.or]: [
                  { kode_plant: kode },
                  { kode_plant_rec: kode }
                ]
              },
              statTrans === 'all'
                ? { [Op.not]: { no_mutasi: null } }
                : statTrans === 'revisi'
                  ? { status_reject: 1 }
                  : { status_form: `${statTrans}` },
              timeVal1 === 'all'
                ? { [Op.not]: { id: null } }
                : {
                    tanggalMut: {
                      [Op.gte]: timeV1,
                      [Op.lt]: timeV2
                    }
                  },
              statTrans === 'revisi' && { [Op.not]: { status_form: 0 } },
              { [Op.not]: { status_form: 1 } },
              { [Op.not]: { no_mutasi: null } }
            ],
            [Op.or]: [
              { kode_plant_rec: { [Op.like]: `%${searchValue}%` } },
              { kode_plant: { [Op.like]: `%${searchValue}%` } },
              { area_rec: { [Op.like]: `%${searchValue}%` } },
              { area: { [Op.like]: `%${searchValue}%` } },
              { cost_center_rec: { [Op.like]: `%${searchValue}%` } },
              { cost_center: { [Op.like]: `%${searchValue}%` } },
              { no_asset: { [Op.like]: `%${searchValue}%` } },
              { no_mutasi: { [Op.like]: `%${searchValue}%` } },
              { nama_asset: { [Op.like]: `%${searchValue}%` } }
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
            }
            // ,
            // {
            //   model: asset,
            //   as: 'dataAsset'
            // }
          ],
          order: [
            [sortValue, 'ASC'],
            [{ model: ttd, as: 'appForm' }, 'id', 'DESC']
          ],
          limit: limit,
          offset: (page - 1) * limit,
          group: ['mutasi.no_mutasi'],
          distinct: true
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
      // } else if (level === 12 || level === 7 || level === 26 || level === 27) {
      // } else if (listApp.find(item => dumpLevel.find(x => x === item)) !== undefined) {
      } else if (findUser.role.type === 'area') {
        const findDepo = await depo.findAll({
          where: {
            [Op.or]: [
              // { nama_bm: dumpLevel.find(x => x === 12) || dumpLevel.find(x => x === 27) ? fullname : 'undefined' },
              // { nama_om: dumpLevel.find(x => x === 7) ? fullname : 'undefined' },
              // { nama_asman: dumpLevel.find(x => x === 26) ? fullname : 'undefined' },
              // { nama_nom: dumpLevel.find(x => x === 28) ? fullname : 'undefined' }
              { nama_bm: level === 12 || level === 27 ? fullname : 'undefined' },
              { nama_om: level === 7 || level === 27 ? fullname : 'undefined' },
              { nama_nom: level === 28 ? fullname : 'undefined' },
              { nama_asman: level === 26 ? fullname : 'undefined' },
              { nama_pic_1: level === 2 ? fullname : 'undefined' },
              { pic_budget: level === 8 ? fullname : 'undefined' },
              { pic_finance: level === 3 ? fullname : 'undefined' },
              { pic_tax: level === 4 ? fullname : 'undefined' },
              { pic_purchasing: level === 6 ? fullname : 'undefined' }
            ]
          }
        })
        if (findDepo.length > 0) {
          const dataDepo = []
          for (let i = 0; i < findDepo.length; i++) {
            if (listDepo !== 'all') {
              const depoArr = listDepo.split(',')
              if (depoArr.find(item => item === findDepo[i].kode_plant) !== undefined) {
                const data = { kode_plant: findDepo[i].kode_plant }
                const rec = { kode_plant_rec: findDepo[i].kode_plant }
                dataDepo.push(data)
                dataDepo.push(rec)
              }
            } else {
              const data = { kode_plant: findDepo[i].kode_plant }
              const rec = { kode_plant_rec: findDepo[i].kode_plant }
              dataDepo.push(data)
              dataDepo.push(rec)
            }
          }
          const result = await mutasi.findAndCountAll({
            where: {
              [Op.and]: [
                {
                  [Op.or]: dataDepo
                },
                statTrans === 'all' ? { [Op.not]: { no_mutasi: null } } : { status_form: `${statTrans}` },
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
                { kode_plant_rec: { [Op.like]: `%${searchValue}%` } },
                { kode_plant: { [Op.like]: `%${searchValue}%` } },
                { area_rec: { [Op.like]: `%${searchValue}%` } },
                { area: { [Op.like]: `%${searchValue}%` } },
                { cost_center_rec: { [Op.like]: `%${searchValue}%` } },
                { cost_center: { [Op.like]: `%${searchValue}%` } },
                { no_asset: { [Op.like]: `%${searchValue}%` } },
                { no_mutasi: { [Op.like]: `%${searchValue}%` } },
                { nama_asset: { [Op.like]: `%${searchValue}%` } }
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
              // ,
              // {
              //   model: asset,
              //   as: 'dataAsset'
              // }
            ],
            limit: limit,
            offset: (page - 1) * limit,
            group: ['mutasi.no_mutasi'],
            distinct: true
          })
          if (result) {
            const pageInfo = pagination('/mutasi/get', req.query, page, limit, result.count)
            return response(res, 'success get mutasi', { result, pageInfo, noMut: [] })
          } else {
            const noMut = []
            const pageInfo = pagination('/mutasi/get', req.query, page, limit, result.count)
            return response(res, 'success get mutasi', { result, pageInfo, noMut })
          }
        } else {
          return response(res, 'failed get mutasi', {}, 400, false)
        }
      } else {
        const result = await mutasi.findAndCountAll({
          where: {
            [Op.and]: [
              statTrans === 'all' ? { [Op.not]: { no_mutasi: null } } : { status_form: `${statTrans}` },
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
              { kode_plant_rec: { [Op.like]: `%${searchValue}%` } },
              { kode_plant: { [Op.like]: `%${searchValue}%` } },
              { area_rec: { [Op.like]: `%${searchValue}%` } },
              { area: { [Op.like]: `%${searchValue}%` } },
              { cost_center_rec: { [Op.like]: `%${searchValue}%` } },
              { cost_center: { [Op.like]: `%${searchValue}%` } },
              { no_asset: { [Op.like]: `%${searchValue}%` } },
              { no_mutasi: { [Op.like]: `%${searchValue}%` } },
              { nama_asset: { [Op.like]: `%${searchValue}%` } }
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
            // ,
            // {
            //   model: asset,
            //   as: 'dataAsset'
            // }
          ],
          order: [
            [sortValue, 'ASC'],
            [{ model: ttd, as: 'appForm' }, 'id', 'DESC']
          ],
          limit: limit,
          offset: (page - 1) * limit,
          group: ['mutasi.no_mutasi'],
          distinct: true
        })
        if (result) {
          const pageInfo = pagination('/mutasi/get', req.query, page, limit, result.count)
          return response(res, 'success get mutasi', { result, pageInfo, noMut: [] })
        } else {
          const noMut = []
          const pageInfo = pagination('/mutasi/get', req.query, page, limit, result.count)
          return response(res, 'success get mutasi', { result, pageInfo, noMut })
        }
      }
      // else if (level === 13 || level === 16) {
      //   const findRole = await role.findOne({
      //     where: {
      //       nomor: '27'
      //     }
      //   })
      //   const findDepo = await depo.findAll({
      //     where: {
      //       [Op.or]: [
      //         { nama_bm: fullname },
      //         { nama_om: fullname }
      //       ]
      //     }
      //   })
      //   if (findRole && findDepo.length > 0) {
      //     const hasil = []
      //     for (let i = 0; i < findDepo.length; i++) {
      //       const result = await mutasi.findAll({
      //         where: {
      //           kode_plant: findDepo[i].kode_plant,
      //           [Op.or]: [
      //             { kode_plant: { [Op.like]: `%${searchValue}%` } },
      //             { cost_center: { [Op.like]: `%${searchValue}%` } },
      //             { area: { [Op.like]: `%${searchValue}%` } },
      //             { no_asset: { [Op.like]: `%${searchValue}%` } },
      //             { no_mutasi: { [Op.like]: `%${searchValue}%` } }
      //           ],
      //           status_form: 2
      //         },
      //         order: [
      //           [sortValue, 'ASC'],
      //           [{ model: ttd, as: 'appForm' }, 'id', 'DESC']
      //         ],
      //         include: [
      //           {
      //             model: ttd,
      //             as: 'appForm'
      //           },
      //           {
      //             model: path,
      //             as: 'pict'
      //           },
      //           {
      //             model: docUser,
      //             as: 'docAsset'
      //           }
      //         ]
      //       })
      //       if (result.length > 0) {
      //         for (let j = 0; j < result.length; j++) {
      //           hasil.push(result[j])
      //         }
      //       }
      //     }
      //     if (hasil.length > 0) {
      //       const tempDis = []
      //       hasil.map(x => {
      //         return (
      //           tempDis.push(x.no_mutasi)
      //         )
      //       })
      //       const setDis = new Set(tempDis)
      //       const noSet = [...setDis]
      //       if (level === 13) {
      //         const result = await mutasi.findAndCountAll({
      //           where: {
      //             kategori: 'IT',
      //             [Op.or]: [
      //               { kode_plant: { [Op.like]: `%${searchValue}%` } },
      //               { cost_center: { [Op.like]: `%${searchValue}%` } },
      //               { area: { [Op.like]: `%${searchValue}%` } },
      //               { no_asset: { [Op.like]: `%${searchValue}%` } },
      //               { no_mutasi: { [Op.like]: `%${searchValue}%` } }
      //             ],
      //             status_form: 2
      //           },
      //           order: [
      //             [sortValue, 'ASC'],
      //             [{ model: ttd, as: 'appForm' }, 'id', 'DESC']
      //           ],
      //           limit: limit,
      //           offset: (page - 1) * limit,
      //           include: [
      //             {
      //               model: ttd,
      //               as: 'appForm'
      //             },
      //             {
      //               model: path,
      //               as: 'pict'
      //             },
      //             {
      //               model: docUser,
      //               as: 'docAsset'
      //             }
      //           ],
      //           group: 'no_mutasi'
      //         })
      //         if (result.rows.length > 0) {
      //           const data = []
      //           for (let i = 0; i < result.rows.length; i++) {
      //             if (result.rows[i].appForm.length > 0) {
      //               const app = result.rows[i].appForm
      //               // console.log(app.find(({ jabatan }) => jabatan === findRole.name))
      //               if (app.find(({ jabatan }) => jabatan === findRole.name) === undefined) {
      //                 data.push(result.rows[i].no_mutasi)
      //               } else if (app.find(({ jabatan }) => jabatan === findRole.name) !== undefined && app.find(({ jabatan }) => jabatan === findRole.name).status !== null) {
      //                 data.push(result.rows[i].no_mutasi)
      //               }
      //             }
      //           }
      //           const set = new Set(data)
      //           const noMut = [...set]
      //           const newData = []
      //           for (let i = 0; i < result.rows.length; i++) {
      //             for (let j = 0; j < noMut.length; j++) {
      //               if (result.rows[i].no_mutasi === noMut[j]) {
      //                 newData.push(result.rows[i])
      //               }
      //             }
      //           }
      //           const tempAll = hasil.concat(newData)
      //           const setMerge = new Set(tempAll)
      //           const mergeData = [...setMerge]
      //           const tempNo = noMut.concat(noSet)
      //           const setNo = new Set(tempNo)
      //           const mergeNo = [...setNo]
      //           if (newData.length) {
      //             const result = { rows: mergeData, count: mergeData.length }
      //             const pageInfo = pagination('/mutasi/get', req.query, page, limit, result.count)
      //             return response(res, 'success get mutasi', { result, pageInfo, noMut: mergeNo })
      //           } else {
      //             const result = { rows: [], count: 0 }
      //             const noMut = []
      //             const pageInfo = pagination('/mutasi/get', req.query, page, limit, result.count)
      //             return response(res, 'success get mutasi', { result, pageInfo, noMut })
      //           }
      //         } else {
      //           const result = { rows: [], count: 0 }
      //           const noMut = []
      //           const pageInfo = pagination('/mutasi/get', req.query, page, limit, result.count)
      //           return response(res, 'success get mutasi', { result, pageInfo, noMut })
      //         }
      //       } else {
      //         const result = await mutasi.findAndCountAll({
      //           where: {
      //             [Op.or]: [
      //               { kode_plant: { [Op.like]: `%${searchValue}%` } },
      //               { cost_center: { [Op.like]: `%${searchValue}%` } },
      //               { area: { [Op.like]: `%${searchValue}%` } },
      //               { no_asset: { [Op.like]: `%${searchValue}%` } },
      //               { no_mutasi: { [Op.like]: `%${searchValue}%` } }
      //             ],
      //             status_form: 2
      //           },
      //           order: [
      //             [sortValue, 'ASC'],
      //             [{ model: ttd, as: 'appForm' }, 'id', 'DESC']
      //           ],
      //           limit: limit,
      //           offset: (page - 1) * limit,
      //           include: [
      //             {
      //               model: ttd,
      //               as: 'appForm'
      //             },
      //             {
      //               model: path,
      //               as: 'pict'
      //             },
      //             {
      //               model: docUser,
      //               as: 'docAsset'
      //             }
      //           ],
      //           group: 'no_mutasi'
      //         })
      //         if (result.rows.length > 0) {
      //           const data = []
      //           for (let i = 0; i < result.rows.length; i++) {
      //             if (result.rows[i].appForm.length > 0) {
      //               const app = result.rows[i].appForm
      //               // console.log(app.find(({ jabatan }) => jabatan === findRole.name))
      //               if (app.find(({ jabatan }) => jabatan === findRole.name) === undefined) {
      //                 data.push(result.rows[i].no_mutasi)
      //               } else if (app.find(({ jabatan }) => jabatan === findRole.name) !== undefined && app.find(({ jabatan }) => jabatan === findRole.name).status !== null) {
      //                 data.push(result.rows[i].no_mutasi)
      //               }
      //             }
      //           }
      //           const set = new Set(data)
      //           const noMut = [...set]
      //           const newData = []
      //           for (let i = 0; i < result.rows.length; i++) {
      //             for (let j = 0; j < noMut.length; j++) {
      //               if (result.rows[i].no_mutasi === noMut[j]) {
      //                 newData.push(result.rows[i])
      //               }
      //             }
      //           }
      //           const tempAll = hasil.concat(newData)
      //           const setMerge = new Set(tempAll)
      //           const mergeData = [...setMerge]
      //           const tempNo = noMut.concat(noSet)
      //           const setNo = new Set(tempNo)
      //           const mergeNo = [...setNo]
      //           if (newData.length) {
      //             const result = { rows: mergeData, count: mergeData.length }
      //             const pageInfo = pagination('/mutasi/get', req.query, page, limit, result.count)
      //             return response(res, 'success get mutasi', { result, pageInfo, noMut: mergeNo })
      //           } else {
      //             const result = { rows: [], count: 0 }
      //             const noMut = []
      //             const pageInfo = pagination('/mutasi/get', req.query, page, limit, result.count)
      //             return response(res, 'success get mutasi', { result, pageInfo, noMut })
      //           }
      //         } else {
      //           const result = { rows: [], count: 0 }
      //           const noMut = []
      //           const pageInfo = pagination('/mutasi/get', req.query, page, limit, result.count)
      //           return response(res, 'success get mutasi', { result, pageInfo, noMut })
      //         }
      //       }
      //     } else {
      //       const tempDis = []
      //       const setDis = new Set(tempDis)
      //       const noSet = [...setDis]
      //       if (level === 13) {
      //         const result = await mutasi.findAndCountAll({
      //           where: {
      //             kategori: 'IT',
      //             [Op.or]: [
      //               { kode_plant: { [Op.like]: `%${searchValue}%` } },
      //               { cost_center: { [Op.like]: `%${searchValue}%` } },
      //               { area: { [Op.like]: `%${searchValue}%` } },
      //               { no_asset: { [Op.like]: `%${searchValue}%` } },
      //               { no_mutasi: { [Op.like]: `%${searchValue}%` } }
      //             ],
      //             status_form: 2
      //           },
      //           order: [
      //             [sortValue, 'ASC'],
      //             [{ model: ttd, as: 'appForm' }, 'id', 'DESC']
      //           ],
      //           limit: limit,
      //           offset: (page - 1) * limit,
      //           include: [
      //             {
      //               model: ttd,
      //               as: 'appForm'
      //             },
      //             {
      //               model: path,
      //               as: 'pict'
      //             },
      //             {
      //               model: docUser,
      //               as: 'docAsset'
      //             }
      //           ],
      //           group: 'no_mutasi'
      //         })
      //         if (result.rows.length > 0) {
      //           const data = []
      //           for (let i = 0; i < result.rows.length; i++) {
      //             if (result.rows[i].appForm.length > 0) {
      //               const app = result.rows[i].appForm
      //               // console.log(app.find(({ jabatan }) => jabatan === findRole.name))
      //               if (app.find(({ jabatan }) => jabatan === findRole.name) === undefined) {
      //                 data.push(result.rows[i].no_mutasi)
      //               } else if (app.find(({ jabatan }) => jabatan === findRole.name) !== undefined && app.find(({ jabatan }) => jabatan === findRole.name).status !== null) {
      //                 data.push(result.rows[i].no_mutasi)
      //               }
      //             }
      //           }
      //           const set = new Set(data)
      //           const noMut = [...set]
      //           const newData = []
      //           for (let i = 0; i < result.rows.length; i++) {
      //             for (let j = 0; j < noMut.length; j++) {
      //               if (result.rows[i].no_mutasi === noMut[j]) {
      //                 newData.push(result.rows[i])
      //               }
      //             }
      //           }
      //           const tempAll = hasil.concat(newData)
      //           const setMerge = new Set(tempAll)
      //           const mergeData = [...setMerge]
      //           const tempNo = noMut.concat(noSet)
      //           const setNo = new Set(tempNo)
      //           const mergeNo = [...setNo]
      //           if (newData.length) {
      //             const result = { rows: mergeData, count: mergeData.length }
      //             const pageInfo = pagination('/mutasi/get', req.query, page, limit, result.count)
      //             return response(res, 'success get mutasi', { result, pageInfo, noMut: mergeNo })
      //           } else {
      //             const result = { rows: [], count: 0 }
      //             const noMut = []
      //             const pageInfo = pagination('/mutasi/get', req.query, page, limit, result.count)
      //             return response(res, 'success get mutasi', { result, pageInfo, noMut })
      //           }
      //         } else {
      //           const result = { rows: [], count: 0 }
      //           const noMut = []
      //           const pageInfo = pagination('/mutasi/get', req.query, page, limit, result.count)
      //           return response(res, 'success get mutasi', { result, pageInfo, noMut })
      //         }
      //       } else {
      //         const result = await mutasi.findAndCountAll({
      //           where: {
      //             [Op.or]: [
      //               { kode_plant: { [Op.like]: `%${searchValue}%` } },
      //               { cost_center: { [Op.like]: `%${searchValue}%` } },
      //               { area: { [Op.like]: `%${searchValue}%` } },
      //               { no_asset: { [Op.like]: `%${searchValue}%` } },
      //               { no_mutasi: { [Op.like]: `%${searchValue}%` } }
      //             ],
      //             status_form: 2
      //           },
      //           order: [
      //             [sortValue, 'ASC'],
      //             [{ model: ttd, as: 'appForm' }, 'id', 'DESC']
      //           ],
      //           limit: limit,
      //           offset: (page - 1) * limit,
      //           include: [
      //             {
      //               model: ttd,
      //               as: 'appForm'
      //             },
      //             {
      //               model: path,
      //               as: 'pict'
      //             },
      //             {
      //               model: docUser,
      //               as: 'docAsset'
      //             }
      //           ],
      //           group: 'no_mutasi'
      //         })
      //         if (result.rows.length > 0) {
      //           const data = []
      //           for (let i = 0; i < result.rows.length; i++) {
      //             if (result.rows[i].appForm.length > 0) {
      //               const app = result.rows[i].appForm
      //               // console.log(app.find(({ jabatan }) => jabatan === findRole.name))
      //               if (app.find(({ jabatan }) => jabatan === findRole.name) === undefined) {
      //                 data.push(result.rows[i].no_mutasi)
      //               } else if (app.find(({ jabatan }) => jabatan === findRole.name) !== undefined && app.find(({ jabatan }) => jabatan === findRole.name).status !== null) {
      //                 data.push(result.rows[i].no_mutasi)
      //               }
      //             }
      //           }
      //           const set = new Set(data)
      //           const noMut = [...set]
      //           const newData = []
      //           for (let i = 0; i < result.rows.length; i++) {
      //             for (let j = 0; j < noMut.length; j++) {
      //               if (result.rows[i].no_mutasi === noMut[j]) {
      //                 newData.push(result.rows[i])
      //               }
      //             }
      //           }
      //           const tempAll = hasil.concat(newData)
      //           const setMerge = new Set(tempAll)
      //           const mergeData = [...setMerge]
      //           const tempNo = noMut.concat(noSet)
      //           const setNo = new Set(tempNo)
      //           const mergeNo = [...setNo]
      //           if (newData.length) {
      //             const result = { rows: mergeData, count: mergeData.length }
      //             const pageInfo = pagination('/mutasi/get', req.query, page, limit, result.count)
      //             return response(res, 'success get mutasi', { result, pageInfo, noMut: mergeNo })
      //           } else {
      //             const result = { rows: [], count: 0 }
      //             const noMut = []
      //             const pageInfo = pagination('/mutasi/get', req.query, page, limit, result.count)
      //             return response(res, 'success get mutasi', { result, pageInfo, noMut })
      //           }
      //         } else {
      //           const result = { rows: [], count: 0 }
      //           const noMut = []
      //           const pageInfo = pagination('/mutasi/get', req.query, page, limit, result.count)
      //           return response(res, 'success get mutasi', { result, pageInfo, noMut })
      //         }
      //       }
      //     }
      //   } else {
      //     return response(res, 'failed get mutasi', {}, 404, false)
      //   }
      // }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  getMutasiRec: async (req, res) => {
    try {
      const level = req.user.level
      const kode = req.user.kode
      // const cost = req.user.name
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
                { kode_plant_rec: kode },
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
                { kode_plant_rec: kode },
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
      const id = req.params.id
      const result = await mutasi.findByPk(id)
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
      // const timeV1 = moment().startOf('month')
      // const timeV2 = moment().endOf('month').add(1, 'd')
      const kode = req.user.kode
      // const cost = req.user.name
      // const level = req.user.level
      const schema = joi.object({
        alasan: joi.string().required()
      })
      const { value: results, error } = schema.validate(req.body)
      if (error) {
        return response(res, 'Error', { error: error.message }, 404, false)
      } else {
        const findNo = await reservoir.findAll({
          where: {
            transaksi: 'mutasi',
            tipe: 'area'
            // ,
            // createdAt: {
            //   [Op.gte]: timeV1,
            //   [Op.lt]: timeV2
            // }
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
        const findMut = await mutasi.findAll({
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
          const tempData = findMut.find(({no_mutasi}) => no_mutasi !== null) // eslint-disable-line
          const cekData = tempData === undefined ? 'ya' : 'no'
          const noTrans = `${notrans}/${kode}/${findMut[0].area}/${rome}/${year}-MTI`
          const data = {
            no_mutasi: noTrans,
            alasan: results.alasan
          }
          const noJwt = await generateToken({ no: noTrans })
          for (let i = 0; i < findMut.length; i++) {
            const find = await mutasi.findByPk(findMut[i].id)
            if (find) {
              await find.update(data)
              temp.push(1)
            }
          }
          if (temp.length === findMut.length) {
            if (cekData === 'no') {
              const findReser = await reservoir.findOne({
                where: {
                  no_transaksi: tempData.no_mutasi
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
                transaksi: 'mutasi',
                tipe: 'area',
                status: 'delayed'
              }
              if (findReser && !findNewReser) {
                await findReser.update(upDataReser)
                await reservoir.create(creDataReser)
                return response(res, 'success submit cart', { no_mutasi: noTrans, no_jwt: noJwt })
              } else {
                return response(res, 'success submit cart', { no_mutasi: noTrans, no_jwt: noJwt })
              }
            } else {
              const findNewReser = await reservoir.findOne({
                where: {
                  no_transaksi: noTrans
                }
              })
              if (findNewReser) {
                return response(res, 'success submit cart', { no_mutasi: noTrans, no_jwt: noJwt })
              } else {
                const creDataReser = {
                  no_transaksi: noTrans,
                  kode_plant: kode,
                  transaksi: 'mutasi',
                  tipe: 'area',
                  status: 'delayed'
                }
                await reservoir.create(creDataReser)
                return response(res, 'success submit cart', { no_mutasi: noTrans, no_jwt: noJwt })
              }
            }
          } else {
            return response(res, 'failed submit', {}, 404, false)
          }
        } else {
          return response(res, 'data mutasi is empty', {}, 404, false)
        }
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  submitMutasiFinal: async (req, res) => {
    try {
      const { no } = req.body
      // const kode = req.user.kode
      // const name = req.user.name
      const fullname = req.user.fullname
      const findMut = await mutasi.findAll({
        where: {
          [Op.and]: [
            // { kode_plant: kode },
            // { status_form: 1 }
            { no_mutasi: no }
          ]
        }
      })
      if (findMut) {
        const temp = []
        for (let i = 0; i < findMut.length; i++) {
          const data = {
            status_form: 2,
            history: `submit pengajuan by ${fullname} at ${moment().format('DD/MM/YYYY h:mm:ss a')}`,
            tanggalMut: moment()
          }
          const findData = await mutasi.findByPk(findMut[i].id)
          if (findData) {
            await findData.update(data)
            temp.push(findData)
          }
        }
        if (temp.length > 0) {
          // return response(res, 'successs submit cart')
          const prev = moment().format('L').split('/')
          const cek = []
          for (let i = 0; i < findMut.length; i++) {
            const find = await mutasi.findByPk(findMut[i].id)
            if (find) {
              const findApi = await axios.get(`${APP_SAP}/sap/bc/zast/?sap-client=${APP_CLIENT}&pgmna=zfir0090&p_anln1=${find.no_asset}&p_bukrs=pp01&p_gjahr=${prev[2]}&p_monat=${prev[0]}`, { timeout: 10000 }).then(response => { return (response) }).catch(err => { return (err.isAxiosError) })
              if (findApi.status === 200) {
                const findCost = await axios.get(`${APP_SAP}/sap/bc/zast/?sap-client=${APP_CLIENT}&pgmna=zfir0091&p_kokrs=pp00&p_aufnr=${findApi.data[0] === undefined ? null : findApi.data[0].eaufn === undefined ? null : findApi.data[0].eaufn === null ? null : findApi.data[0].eaufn === '' ? null : findApi.data[0].eaufn}`, { timeout: 10000 }).then(response => { return (response) }).catch(err => { return (err.isAxiosError) })
                if (findCost.status === 200) {
                  const data = {
                    isbudget: findApi.data[0] === undefined ? 'tidak' : findApi.data[0].eaufn === undefined ? 'tidak' : findApi.data[0].eaufn === null ? 'tidak' : findApi.data[0].eaufn === '' ? 'tidak' : 'ya',
                    no_io: findApi.data[0] === undefined ? null : findApi.data[0].eaufn === undefined ? null : findApi.data[0].eaufn === null ? null : findApi.data[0].eaufn === '' ? null : findApi.data[0].eaufn,
                    cost_centerawal: findCost.data[0] === undefined ? null : findCost.data[0].kostv === undefined ? null : findCost.data[0].kostv === null ? null : findCost.data[0].kostv === '' ? null : findCost.data[0].kostv
                  }
                  await find.update(data)
                  cek.push(1)
                } else {
                  const data = {
                    isbudget: findApi.data[0] === undefined ? 'tidak' : findApi.data[0].eaufn === undefined ? 'tidak' : findApi.data[0].eaufn === null ? 'tidak' : findApi.data[0].eaufn === '' ? 'tidak' : 'ya',
                    no_io: findApi.data[0] === undefined ? null : findApi.data[0].eaufn === undefined ? null : findApi.data[0].eaufn === null ? null : findApi.data[0].eaufn === '' ? null : findApi.data[0].eaufn
                  }
                  await find.update(data)
                  cek.push(1)
                }
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
            return response(res, 'success submit cart')
          }
        } else {
          return response(res, 'failed submit cart 1', {}, 404, false)
        }
      } else {
        return response(res, 'failed submit cart 2', {}, 404, false)
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  getDetailMutasi: async (req, res) => {
    try {
      const no = req.body.no
      // const tipe = req.params.tipe
      // const level = req.user.level
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
        return response(res, 'failed get mutasi', {}, 404, false)
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  getApproveMut: async (req, res) => {
    try {
      const no = req.body.no
      // const nama = req.body.nama
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
      const findAllRole = await role.findAll()
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
        return response(res, 'success get template approve', { result: { pembuat, pemeriksa, penyetuju, penerima } })
      } else {
        const findDis = await mutasi.findAll({
          where: {
            no_mutasi: no
          }
        })
        if (findDis) {
          const cekFrm = findDis[0].kode_plant.length > 4 ? 9 : 5
          const cekTo = findDis[0].kode_plant_rec.length > 4 ? 9 : 5
          const finName = cekFrm === 9 && cekTo === 9 ? 'Mutasi HO HO' : cekFrm === 9 && cekTo === 5 ? 'Mutasi HO area' : cekFrm === 5 && cekTo === 9 ? 'Mutasi area HO' : 'Mutasi area area'
          const cekIt = []
          const cekNonIt = []
          for (let i = 0; i < findDis.length; i++) {
            if (findDis[i].kategori === 'IT') {
              cekIt.push(1)
            } else if (findDis[i].kategori === 'NON IT') {
              cekNonIt.push(1)
            }
          }
          const getDepo = await depo.findOne({
            where: {
              kode_plant: findDis[0].kode_plant
            }
          })
          const getApp = await approve.findAll({
            where: {
              nama_approve: finName,
              [Op.or]: [
                { jenis: cekIt.length > 0 ? 'it' : cekNonIt.length > 0 ? 'non-it' : 'all' },
                { jenis: 'all' }
              ]
            }
          })
          if (getApp && getDepo) {
            const hasil = []
            for (let i = 0; i < getApp.length; i++) {
              const send = {
                jabatan: getApp[i].jabatan === 'AOS' && ((cekFrm === 9 && i === 0) || (cekTo === 9 && i === (getApp.length - 1))) ? 'HO' : getApp[i].jabatan,
                jenis: getApp[i].jenis,
                sebagai: getApp[i].sebagai,
                kategori: null,
                no_doc: no,
                struktur: getApp[i].struktur,
                id_role: findAllRole.find(item => item.name === getApp[i].jabatan).nomor
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
                      return response(res, 'success get template approve', { result: { pembuat, pemeriksa, penyetuju, penerima } })
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
  // approveMutasi: async (req, res) => {
  //   try {
  //     const level = req.user.level
  //     const name = req.user.name
  //     const fullname = req.user.fullname
  //     const no = req.body.no
  //     const findMut = await mutasi.findOne({
  //       where: {
  //         no_mutasi: no
  //       }
  //     })
  //     const result = await role.findAll({
  //       where: {
  //         nomor: level
  //       }
  //     })
  //     if (result.length > 0 && findMut) {
  //       const find = await ttd.findAll({
  //         where: {
  //           no_doc: no
  //         }
  //       })
  //       if (find.length > 0) {
  //         const author = level === 13 || level === 16 || level === 12 || level === 27
  //         const divisi = author && 'Manager'
  //         let hasil = 0
  //         let div = 0
  //         let arr = null
  //         let who = 0
  //         // let position = ''
  //         if (author) {
  //           const findPlant = await depo.findOne({
  //             where: {
  //               kode_plant: findMut.kode_plant
  //             }
  //           })
  //           if (findPlant && (findPlant.nama_bm === name)) {
  //             who = 1
  //           } else {
  //             const findPlantRec = await depo.findOne({
  //               where: {
  //                 kode_plant: findMut.kode_plant_rec
  //               }
  //             })
  //             if (findPlantRec && (findPlantRec.nama_bm === name)) {
  //               who = 2
  //             }
  //           }
  //         }
  //         for (let i = 0; i < find.length; i++) {
  //           if (result[0].name === find[i].jabatan) {
  //             hasil = find[i].id
  //             arr = i
  //             // position = find[i].jabatan
  //           } else if (who === 1 && author && divisi === find[i].jabatan && find[i].sebagai === 'pembuat') {
  //             div = find[i].id
  //             // num = i
  //             // post = find[i].jabatan
  //           } else if (who === 2 && author && divisi === find[i].jabatan && find[i].sebagai === 'penerima') {
  //             div = find[i].id
  //             // num = i
  //             // post = find[i].jabatan
  //           }
  //         }
  //         if (hasil !== 0 || (hasil === 0 && author)) {
  //           if (arr !== find.length - 1 && (find[arr + 1].status !== null || find[arr + 1].status === 1 || find[arr + 1].status === 0) && !author) {
  //             return response(res, 'Anda tidak memiliki akses lagi untuk mengapprove', {}, 404, false)
  //           } else {
  //             if (author) {
  //               const data = {
  //                 nama: fullname,
  //                 status: 1,
  //                 path: null
  //               }
  //               const findTtd = await ttd.findByPk(hasil === 0 ? div : hasil)
  //               if (findTtd && findMut) {
  //                 const findTd = await ttd.findByPk(div === 0 ? hasil : div)
  //                 const upTd = await findTd.update(data)
  //                 const sent = await findTtd.update(data)
  //                 if (sent && upTd) {
  //                   const findTrans = await mutasi.findAll({
  //                     where: {
  //                       no_mutasi: no
  //                     }
  //                   })
  //                   if (findTrans) {
  //                     const valid = []
  //                     for (let i = 0; i < findTrans.length; i++) {
  //                       const data = {
  //                         status_form: findTrans[i].status_form,
  //                         status_reject: null,
  //                         isreject: null,
  //                         history: `${findTrans[i].history}, approved by ${fullname} at ${moment().format('DD/MM/YYYY h:mm:ss a')}`
  //                       }
  //                       const findAsset = await mutasi.findByPk(findTrans[i].id)
  //                       if (findAsset) {
  //                         await findAsset.update(data)
  //                         valid.push(1)
  //                       }
  //                     }
  //                     if (valid.length === findTrans.length) {
  //                       return response(res, 'success approve mutasi')
  //                     } else {
  //                       return response(res, 'success approve mutasi')
  //                     }
  //                   } else {
  //                     return response(res, 'failed approve mutasi', {}, 404, false)
  //                   }
  //                 } else {
  //                   return response(res, 'failed approve mutasi', {}, 404, false)
  //                 }
  //               }
  //             } else {
  //               if (arr === 0 || find[arr - 1].status === 1) {
  //                 // const findDepo = await depo.findOne({
  //                 //   where: {
  //                 //     kode_plant: name
  //                 //   }
  //                 // })
  //                 const data = {
  //                   nama: fullname,
  //                   status: 1,
  //                   path: null
  //                 }
  //                 const findTtd = await ttd.findByPk(hasil)
  //                 if (findTtd) {
  //                   const sent = await findTtd.update(data)
  //                   if (sent) {
  //                     const results = await ttd.findAll({
  //                       where: {
  //                         [Op.and]: [
  //                           { no_doc: no },
  //                           { status: 1 }
  //                         ]
  //                       }
  //                     })
  //                     if (results.length) {
  //                       const findTrans = await mutasi.findAll({
  //                         where: {
  //                           no_mutasi: no
  //                         }
  //                       })
  //                       if (findTrans) {
  //                         const valid = []
  //                         for (let i = 0; i < findTrans.length; i++) {
  //                           const data = {
  //                             status_form: results.length === find.length && findTrans[i].isbudget === 'ya' ? 3 : results.length === find.length && findTrans[i].isbudget !== 'ya' ? 4 : findTrans[i].status_form,
  //                             status_reject: null,
  //                             isreject: null,
  //                             history: `${findTrans[i].history}, approved by ${fullname} at ${moment().format('DD/MM/YYYY h:mm:ss a')}`
  //                           }
  //                           const findData = await mutasi.findByPk(findTrans[i].id)
  //                           if (findData) {
  //                             await findData.update(data)
  //                             valid.push(1)
  //                           }
  //                         }
  //                         if (valid.length === findTrans.length) {
  //                           return response(res, 'success approve mutasi1')
  //                         } else {
  //                           return response(res, 'success approve mutasi2')
  //                         }
  //                       } else {
  //                         return response(res, 'failed approve mutasi', {}, 404, false)
  //                       }
  //                     } else {
  //                       return response(res, 'failed approve mutasi', {}, 404, false)
  //                     }
  //                   } else {
  //                     return response(res, 'failed approve mutasi', {}, 404, false)
  //                   }
  //                 } else {
  //                   return response(res, 'failed approve mutasi', {}, 404, false)
  //                 }
  //               } else {
  //                 return response(res, `${find[arr - 1].jabatan} belum approve`, {}, 404, false)
  //               }
  //             }
  //           }
  //         } else {
  //           return response(res, 'failed approve mutasi', {}, 404, false)
  //         }
  //       } else {
  //         return response(res, 'failed approve mutasi', {}, 404, false)
  //       }
  //     } else {
  //       return response(res, 'failed approve mutasi', {}, 404, false)
  //     }
  //   } catch (error) {
  //     return response(res, error.message, {}, 500, false)
  //   }
  // },
  approveMutasi: async (req, res) => {
    try {
      const level = req.user.level
      // const name = req.user.name
      const fullname = req.user.fullname
      const { no, indexApp } = req.body
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
          const convIndex = (find.length - 1) - parseInt(indexApp)
          const hasil = find[convIndex].id
          const arr = convIndex
          // let position = ''
          // for (let i = 0; i < find.length; i++) {
          //   if (result[0].name === find[i].jabatan) {
          //     hasil = find[i].id
          //     arr = i
          //     // position = find[i].jabatan
          //   }
          // }
          if (hasil !== 0) {
            if (arr !== find.length - 1 && (find[arr + 1].status !== null || find[arr + 1].status === 1 || find[arr + 1].status === 0)) {
              return response(res, 'Anda tidak memiliki akses lagi untuk mengapprove', {}, 404, false)
            } else {
              if (arr === 0 || find[arr - 1].status === 1) {
                const dataTemp = await mutasi.findOne({
                  where: {
                    no_mutasi: no
                  }
                })
                if (dataTemp) {
                  const findDepo = await depo.findOne({
                    where: {
                      kode_plant: dataTemp.kode_plant_rec
                    }
                  })
                  if (level !== 5 || (level === 5 && findDepo)) {
                    const data = {
                      nama: fullname,
                      status: 1,
                      path: null
                    }
                    const findTtd = await ttd.findByPk(hasil)
                    if (findTtd) {
                      const sent = await findTtd.update(data)
                      if (sent) {
                        if (arr < 2) {
                          const findDoc = await mutasi.findOne({
                            where: {
                              no_mutasi: no
                            }
                          })
                          if (findDoc) {
                            const findRole = await role.findAll({
                              where: {
                                name: find[arr + 1].jabatan
                              }
                            })
                            if (findRole.length > 0) {
                              const findMut = await mutasi.findAll({
                                where: {
                                  no_mutasi: no
                                }
                              })
                              if (findMut.length > 0) {
                                const cek = []
                                for (let i = 0; i < findMut.length; i++) {
                                  const upData = {
                                    status_reject: null,
                                    isreject: null,
                                    history: `${findMut[i].history}, approved by ${fullname} at ${moment().format('DD/MM/YYYY h:mm:ss a')}`
                                  }
                                  const findId = await mutasi.findByPk(findMut[i].id)
                                  if (findId) {
                                    await findId.update(upData)
                                    cek.push(findId)
                                  }
                                }
                                if (cek.length > 0) {
                                  return response(res, 'success approve pengajuan mutasi')
                                } else {
                                  return response(res, 'berhasil approve, tidak berhasil kirim notif email 2')
                                }
                              } else {
                                return response(res, 'failed approve mutasi', {}, 404, false)
                              }
                            }
                          }
                        } else {
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
                            if (findDoc.length > 0) {
                              const valid = []
                              for (let i = 0; i < findDoc.length; i++) {
                                const data = {
                                  status_form: findDoc.find(item => item.isbudget === 'ya') !== undefined ? 3 : findDoc[i].isbudget !== 'ya' && 4,
                                  // date_fullapp: moment(),
                                  status_reject: null,
                                  isreject: null,
                                  history: `${findDoc[i].history}, approved by ${fullname} at ${moment().format('DD/MM/YYYY h:mm:ss a')}`
                                }
                                const findAsset = await mutasi.findByPk(findDoc[i].id)
                                if (findAsset) {
                                  await findAsset.update(data)
                                  valid.push(1)
                                }
                              }
                              if (valid.length === findDoc.length) {
                                const findUser = await user.findOne({
                                  where: {
                                    user_level: 8
                                  }
                                })
                                if (findUser) {
                                  return response(res, 'success approve pengajuan mutasi')
                                } else {
                                  return response(res, 'success approve mutasi')
                                }
                              } else {
                                return response(res, 'success approve mutasi')
                              }
                            } else {
                              return response(res, 'success approve mutasi')
                            }
                          } else {
                            const findDoc = await mutasi.findOne({
                              where: {
                                no_mutasi: no
                              }
                            })
                            if (findDoc) {
                              const findRole = await role.findAll({
                                where: {
                                  name: find[arr + 1].jabatan
                                }
                              })
                              if (findRole.length > 0) {
                                const findMut = await mutasi.findAll({
                                  where: {
                                    no_mutasi: no
                                  }
                                })
                                if (findMut.length > 0) {
                                  const cek = []
                                  for (let i = 0; i < findMut.length; i++) {
                                    const upData = {
                                      status_reject: null,
                                      isreject: null,
                                      history: `${findMut[i].history}, approved by ${fullname} at ${moment().format('DD/MM/YYYY h:mm:ss a')}`
                                    }
                                    const findId = await mutasi.findByPk(findMut[i].id)
                                    if (findId) {
                                      await findId.update(upData)
                                      cek.push(findId)
                                    }
                                  }
                                  if (cek.length > 0) {
                                    return response(res, 'success approve pengajuan mutasi')
                                  } else {
                                    return response(res, 'berhasil approve, tidak berhasil kirim notif email 2')
                                  }
                                } else {
                                  return response(res, 'failed approve mutasi', {}, 404, false)
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
                    return response(res, 'failed approve mutasi', {}, 404, false)
                  }
                } else {
                  return response(res, 'failed approve mutasi', {}, 404, false)
                }
              } else {
                return response(res, `${find[arr - 1].jabatan} belum approve atau telah mereject`, {}, 404, false)
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
      // const name = req.user.name
      const fullname = req.user.fullname
      // const { no } = req.body
      const schema = joi.object({
        alasan: joi.string().required(),
        no: joi.string().required(),
        menu: joi.string().required(),
        list: joi.array(),
        type: joi.string(),
        type_reject: joi.string(),
        user_rev: joi.string(),
        indexApp: joi.string()
      })
      const { value: results, error } = schema.validate(req.body)
      if (error) {
        return response(res, 'Error', { error: error.message }, 404, false)
      } else {
        const no = results.no
        const listId = results.list
        const histRev = `reject perbaikan by ${fullname} at ${moment().format('DD/MM/YYYY h:mm:ss a')}; reason: ${results.alasan.replace(/\,/g, ' ')}` //eslint-disable-line
        const histBatal = `reject pembatalan by ${fullname} at ${moment().format('DD/MM/YYYY h:mm:ss a')}; reason: ${results.alasan.replace(/\,/g, ' ')}` //eslint-disable-line
        const result = await role.findAll({
          where: {
            nomor: level
          }
        })
        if (result.length > 0) {
          const findDis = await mutasi.findAll({
            where: {
              no_mutasi: no
            }
          })
          if (findDis.length > 0) {
            const userRev = results.user_rev === '' || results.user_rev === null || results.user_rev === 'null' || results.user_rev === 'undefined' || results.user_rev === undefined ? findDis[0].kode_plant : results.user_rev
            if (results.type === 'verif') {
              const temp = []
              for (let i = 0; i < findDis.length; i++) {
                const send = {
                  status_form: results.type_reject === 'pembatalan' ? 0 : findDis[i].status_form,
                  status_reject: 1,
                  isreject: listId.find(e => e === findDis[i].id) ? 1 : null,
                  reason: results.alasan,
                  menu_rev: results.type_reject === 'pembatalan' ? null : results.menu,
                  user_reject: level,
                  history: `${findDis[i].history}, ${results.type_reject === 'pembatalan' ? histBatal : histRev}`,
                  user_rev: userRev
                }
                const findData = await mutasi.findByPk(findDis[i].id)
                if (findData) {
                  await findData.update(send)
                  temp.push(findData)
                }
              }
              if (temp.length) {
                return response(res, 'success reject io', { results })
              } else {
                return response(res, 'success reject io', { results })
              }
            } else {
              const find = await ttd.findAll({
                where: {
                  no_doc: no
                }
              })
              if (find.length > 0) {
                const convIndex = (find.length - 1) - parseInt(results.indexApp)
                const hasil = find[convIndex].id
                const arr = convIndex
                // let position = ''
                // for (let i = 0; i < find.length; i++) {
                //   if (result[0].name === find[i].jabatan) {
                //     hasil = find[i].id
                //     arr = i
                //   // position = find[i].jabatan
                //   }
                // }
                if (hasil !== 0) {
                  if (arr !== find.length - 1 && (find[arr + 1].status !== null || find[arr + 1].status === 1 || find[arr + 1].status === 0)) {
                    return response(res, 'Anda tidak memiliki akses lagi untuk mereject', {}, 404, false)
                  } else {
                    if (arr === 0 || find[arr - 1].status === 1) {
                      const data = {
                        nama: fullname,
                        status: 0,
                        path: results.alasan
                      }
                      const findTtd = await ttd.findByPk(hasil)
                      if (findTtd) {
                        const sent = await findTtd.update(data)
                        if (sent) {
                          const findTtd = await ttd.findAll({
                            where: {
                              [Op.and]: [
                                { no_doc: no },
                                { status: 1 }
                              ]
                            }
                          })
                          if (findTtd) {
                            const findDoc = await mutasi.findOne({
                              where: {
                                no_mutasi: no
                              }
                            })
                            const findRole = await role.findOne({
                              where: {
                                name: find[1].jabatan
                              }
                            })
                            if (findDoc && findRole) {
                              const cek = []
                              for (let i = 0; i < findDis.length; i++) {
                                const findMut = await mutasi.findByPk(findDis[i].id)
                                const data = {
                                  status_form: results.type_reject === 'pembatalan' ? 0 : findDis[i].status_form,
                                  status_reject: 1,
                                  isreject: listId.find(e => e === findDis[i].id) ? 1 : null,
                                  reason: results.alasan,
                                  menu_rev: results.type_reject === 'pembatalan' ? null : results.menu,
                                  user_reject: findRole.nomor,
                                  history: `${findDis[i].history}, ${results.type_reject === 'pembatalan' ? histBatal : histRev}`,
                                  user_rev: userRev
                                }
                                if (findMut) {
                                  const updateMut = await findMut.update(data)
                                  if (updateMut) {
                                    cek.push(1)
                                  }
                                }
                              }
                              if (cek.length > 0) {
                                return response(res, 'success reject mutasi', { results })
                              } else {
                                return response(res, 'success reject mutasi', { results })
                              }
                            }
                          }
                        } else {
                          return response(res, 'failed reject mutasi', {}, 404, false)
                        }
                      } else {
                        return response(res, 'failed reject mutasi', {}, 404, false)
                      }
                    } else {
                      return response(res, `${find[arr - 1].jabatan} belum approve atau telah mereject`, {}, 404, false)
                    }
                  }
                } else {
                  return response(res, 'failed reject mutasi', {}, 404, false)
                }
              } else {
                return response(res, 'failed reject mutasi', {}, 404, false)
              }
            }
          }
        } else {
          return response(res, 'failed reject mutasi', {}, 404, false)
        }
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  uploadDocument: async (req, res) => {
    const id = req.params.id
    const fullname = req.user.fullname
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
          const send = {
            path: dokumen,
            status_dokumen: `${result.status_dokumen}, upload by ${fullname} at ${moment().format('DD/MM/YYYY h:mm:ss a')};`,
            desc: req.file.originalname
          }
          await result.update(send)
          return response(res, 'successfully upload dokumen', { send })
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
      const result = await docUser.findByPk(id)
      if (result) {
        const send = {
          status: 3,
          alasan: ''
        }
        const results = await result.update(send)
        return response(res, 'successfully approve dokumen', { result: results })
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
      const schema = joi.object({
        alasan: joi.string().required()
      })
      const { value: results, error } = schema.validate(req.body)
      if (error) {
        return response(res, 'Error', { error: error.message }, 404, false)
      } else {
        const result = await docUser.findByPk(id)
        if (result) {
          const send = {
            alasan: results.alasan,
            status: 0
          }
          const reject = await result.update(send)
          if (reject) {
            return response(res, 'successfully reject dokumen', { result: reject })
          } else {
            return response(res, 'failed reject dokumen', {}, 404, false)
          }
        } else {
          return response(res, 'failed reject dokumen', {}, 404, false)
        }
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  getDocument: async (req, res) => {
    try {
      const {
        // no,
        nomut
      } = req.body
      const results = await mutasi.findOne({
        where: {
          [Op.and]: [
            // { no_asset: no },
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
      const no = req.body.no
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
  submitEks: async (req, res) => {
    try {
      const no = req.body.no
      const fullname = req.user.fullname
      const findMut = await mutasi.findAll({
        where: {
          [Op.and]: [
            { no_mutasi: no }
          ]
        }
      })
      if (findMut.length > 0) {
        const findDepo = await depo.findOne({
          where: {
            kode_plant: findMut[0].kode_plant
          }
        })
        const findDepoRec = await depo.findOne({
          where: {
            kode_plant: findMut[0].kode_plant_rec
          }
        })
        const cek = []
        const failSap = []
        for (let i = 0; i < findMut.length; i++) {
          const send = {
            kode_plant: findMut[i].kode_plant_rec,
            cost_center: findMut[i].cost_center_rec,
            area: findMut[i].area_rec,
            status: null,
            keterangan: null
          }
          const body = {
            id: `${findMut[i].no_mutasi}-${findMut[i].no_asset}`,
            companycode: 'PP01',
            asset: findMut[i].no_asset,
            subnumber: '0',
            descript1: `${findMut[i].nama_asset} -> ${findMut[i].area_rec}`,
            descript2: '',
            main_descript: `${findMut[i].nama_asset} -> ${findMut[i].area_rec}`,
            costcenter: findDepoRec.cost_center,
            plant: findDepoRec.kode_plant,
            location: findDepoRec.kode_plant,
            profit_ctr: findDepoRec.profit_center
          }
          const prosesSap = await axios({
            method: 'get',
            url: `${APP_SAP}/sap/bc/zws_fi/zcl_ws_fi/?sap-client=${APP_CLIENT}&q=assetmutation`,
            headers: {
              'Content-Type': 'application/json',
              'Cookie': `sap-usercontext=sap-client=${APP_CLIENT}` // eslint-disable-line
            },
            data: body,
            timeout: 1000 * 60 * 5
          })

          if ((prosesSap && prosesSap.data !== undefined && prosesSap.data.details[0].type === 'S') || (parseInt(APP_CLIENT) === 110)) {
            if (findMut[i].isbudget === 'ya') {
              const findAsset = await asset.findOne({
                where: {
                  no_asset: findMut[i].no_asset
                }
              })
              if (findAsset) {
                const changeCost = await axios.post(`${APP_SAP}/sap/bc/zapclaim?sap-client=${APP_CLIENT}&q=mutation`,
                  {
                    internal_order: findAsset.no_io,
                    co_area: 'PP00',
                    cost_center: findDepo.cost_center,
                    profit_center: findDepo.profit_center
                  },
                  {
                    timeout: 1000 * 60 * 5,
                    headers: {
                      'Content-Type': 'application/json',
                      'Cookie': `sap-usercontext=sap-client=${APP_CLIENT}` // eslint-disable-line
                    }
                  }
                )
                if ((changeCost && changeCost.data !== undefined && changeCost.data.succes === 'S') || (parseInt(APP_CLIENT) === 110)) {
                  const findData = await mutasi.findByPk(findMut[i].id)
                  const findAsset = await asset.findOne({
                    where: {
                      no_asset: findMut[i].no_asset
                    }
                  })
                  if (findData && findAsset) {
                    const data = {
                      status_form: 8,
                      status_reject: null,
                      isreject: null,
                      tgl_mutasisap: moment(),
                      pic_aset: fullname,
                      history: `${findMut[i].history}, submit eksekusi mutasi by ${fullname} at ${moment().format('DD/MM/YYYY h:mm:ss a')}`,
                      message_sap: parseInt(APP_CLIENT) === 110 ? '' : prosesSap.data.details[0].message
                    }
                    await findData.update(data)
                    await findAsset.update(send)
                    cek.push(1)
                  }
                }
              }
            } else {
              const findData = await mutasi.findByPk(findMut[i].id)
              const findAsset = await asset.findOne({
                where: {
                  no_asset: findMut[i].no_asset
                }
              })
              if (findData && findAsset) {
                await findData.update(data)
                await findAsset.update(send)
                cek.push(1)
              }
            }
          } else {
            failSap.push(findMut[i])
          }
        }
        if (cek.length === findMut.length) {
          return response(res, 'success submit eksekusi')
        } else {
          return response(res, 'failed submit eksekusi mutasi', { result: failSap }, 404, false)
        }
      } else {
        return response(res, 'failed submit eksekusi mutasi', {}, 404, false)
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
  updateReason: async (req, res) => {
    try {
      const { alasan, no } = req.body
      const findData = await mutasi.findAll({
        where: {
          no_mutasi: no
        }
      })
      if (findData.length > 0) {
        const data = {
          alasan: alasan
        }
        const cekData = []
        for (let i = 0; i < findData.length; i++) {
          const findMut = await mutasi.findByPk(findData[i].id)
          if (findMut) {
            const updateData = await findMut.update(data)
            if (updateData) {
              cekData.push(updateData)
            }
          }
        }
        if (cekData.length > 0) {
          return response(res, 'success update mutasi', { updateData: cekData })
        } else {
          return response(res, 'failed update mutasi1', {}, 400, false)
        }
      } else {
        return response(res, 'failed update mutasi2', {}, 400, false)
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  appRevisi: async (req, res) => {
    try {
      const id = req.params.id
      const type = req.params.type
      const findMut = await mutasi.findByPk(id)
      if (findMut) {
        const data = {
          isreject: 0
        }
        if (type === 'reason') {
          const findData = await mutasi.findAll({
            where: {
              no_mutasi: findMut.no_mutasi
            }
          })
          if (findData.length > 0) {
            const cekData = []
            for (let i = 0; i < findData.length; i++) {
              const findUpdate = await mutasi.findByPk(findData[i].id)
              if (findUpdate) {
                await findUpdate.update(data)
                cekData.push(findUpdate)
              }
            }
            if (cekData.length > 0) {
              return response(res, 'success submit app revisi')
            } else {
              return response(res, 'failed submit', {}, 404, false)
            }
          } else {
            return response(res, 'failed submit', {}, 404, false)
          }
        } else {
          const updateMut = await findMut.update(data)
          if (updateMut) {
            return response(res, 'success submit app revisi')
          } else {
            return response(res, 'failed submit', {}, 404, false)
          }
        }
      } else {
        return response(res, 'failed submit', {}, 404, false)
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  submitRevisi: async (req, res) => {
    try {
      const { no } = req.body
      const fullname = req.user.fullname
      const findMut = await mutasi.findAll({
        where: {
          no_mutasi: no
        }
      })
      if (findMut.length > 0) {
        if (findMut[0].status_form === 2) {
          const findSign = await ttd.findAll({
            where: {
              no_doc: no
            }
          })
          if (findSign.length > 0) {
            const cekSign = []
            for (let i = 0; i < findSign.length; i++) {
              if (findSign[i].sebagai === 'pembuat' || findSign[i].sebagai === 'penerima' || findSign[i].jabatan === 'area' || findSign[i].jabatan === 'aos') {
                cekSign.push(findSign[i])
              } else {
                const data = {
                  status: null,
                  nama: null
                }
                const findId = await ttd.findByPk(findSign[i].id)
                if (findId) {
                  await findId.update(data)
                  cekSign.push(findId)
                }
              }
            }
            if (cekSign.length > 0) {
              const cek = []
              for (let i = 0; i < findMut.length; i++) {
                const findData = await mutasi.findByPk(findMut[i].id)
                const data = {
                  status_reject: 0,
                  isreject: null,
                  history: `${findMut[i].history}, submit revisi by ${fullname} at ${moment().format('DD/MM/YYYY h:mm:ss a')}`
                }
                if (findData) {
                  await findData.update(data)
                  cek.push(1)
                }
              }
              if (cek.length > 0) {
                return response(res, 'success submit revisi')
              } else {
                return response(res, 'failed submit', {}, 404, false)
              }
            } else {
              return response(res, 'failed submit', {}, 404, false)
            }
          } else {
            return response(res, 'failed submit', {}, 404, false)
          }
        } else {
          const cek = []
          for (let i = 0; i < findMut.length; i++) {
            const findData = await mutasi.findByPk(findMut[i].id)
            const data = {
              status_reject: 0,
              isreject: null,
              history: `${findMut[i].history}, submit revisi by ${fullname} at ${moment().format('DD/MM/YYYY h:mm:ss a')}`
            }
            if (findData) {
              await findData.update(data)
              cek.push(1)
            }
          }
          if (cek.length > 0) {
            return response(res, 'success submit revisi')
          } else {
            return response(res, 'failed submit', {}, 404, false)
          }
        }
      } else {
        return response(res, 'failed submit', {}, 404, false)
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  submitBudget: async (req, res) => {
    try {
      // const level = req.user.level
      const fullname = req.user.fullname
      const no = req.body.no
      const findMutasi = await mutasi.findAll({
        where: {
          no_mutasi: no
        }
      })
      if (findMutasi.length > 0) {
        const findDepo = await depo.findOne({
          where: {
            kode_plant: findMutasi[0].kode_plant_rec
          }
        })
        const cek = []
        for (let i = 0; i < findMutasi.length; i++) {
          const data = {
            status_form: 4,
            tgl_mutasisap: null,
            status_reject: null,
            isreject: null,
            pic_budget: fullname
          }
          // const send = {
          //   kode_plant: findMutasi[i].kode_plant_rec,
          //   status: null,
          //   area: findMutasi[i].area_rec,
          //   keterangan: null
          // }
          if (findMutasi[i].isbudget === 'ya') {
            const findAsset = await asset.findOne({
              where: {
                no_asset: findMutasi[i].no_asset
              }
            })
            if (findAsset && findDepo) {
              const changeCost = await axios.post(`${APP_SAP}/sap/bc/zapclaim?sap-client=${APP_CLIENT}&q=mutation`,
                {
                  internal_order: findAsset.no_io,
                  co_area: 'PP00',
                  cost_center: findDepo.cost_center,
                  profit_center: findDepo.profit_center
                },
                {
                  timeout: 1000 * 60 * 5,
                  headers: {
                    'Content-Type': 'application/json',
                    'Cookie': `sap-usercontext=sap-client=${APP_CLIENT}` // eslint-disable-line
                  }
                }
              )
              if ((changeCost && changeCost.data !== undefined && changeCost.data.succes === 'S') || (parseInt(APP_CLIENT) === 110)) {
                const findData = await mutasi.findByPk(findMutasi[i].id)
                if (findData) {
                  await findData.update(data)
                  cek.push(1)
                }
              }
            }
          } else {
            const findData = await mutasi.findByPk(findMutasi[i].id)
            if (findData) {
              await findData.update(data)
              cek.push(1)
            }
          }
        }
        if (cek.length > 0) {
          return response(res, 'success submit budget')
        } else {
          return response(res, 'failed submit budget 1', {}, 404, false)
        }
      } else {
        return response(res, 'failed submit budget 2', {}, 404, false)
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
      const schema = joi.object({
        tgl_mutasifisik: joi.date().required(),
        no: joi.string()
      })
      const { value: results, error } = schema.validate(req.body)
      if (error) {
        return response(res, 'Error', { error: error.message }, 404, false)
      } else {
        const { no } = results
        const findMut = await mutasi.findAll({
          where: {
            no_mutasi: no
          }
        })
        if (findMut.length > 0) {
          const cek = []
          for (let i = 0; i < findMut.length; i++) {
            const find = await mutasi.findByPk(findMut[i].id)
            const data = {
              tgl_mutasifisik: results.tgl_mutasifisik
            }
            if (find) {
              await find.update(data)
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
      const no = req.body.no
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
      const no = req.body.no
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
  },
  scanQrMutasi: async (req, res) => {
    try {
      const no = req.body.no
      const verifyToken = jwt.verify(no, `${APP_KEY}`)
      if (verifyToken) {
        const dataToken = verifyToken
        return response(res, 'qr berhasil diverifikasi', { result: dataToken })
      } else {
        return response(res, 'qr code tidak valid', {}, 400, false)
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  }
}
