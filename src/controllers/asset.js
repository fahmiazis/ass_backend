const { asset, path, depo, user } = require('../models')
const joi = require('joi')
const { pagination } = require('../helpers/pagination')
const response = require('../helpers/response')
const { Op } = require('sequelize')
const readXlsxFile = require('read-excel-file/node')
const multer = require('multer')
const uploadMaster = require('../helpers/uploadMaster')
const fs = require('fs')
const excel = require('exceljs')
const vs = require('fs-extra')
const moment = require('moment')
const axios = require('axios')
const { APP_BE, APP_SAP } = process.env

module.exports = {
  addAsset: async (req, res) => {
    try {
      const level = req.user.level
      const schema = joi.object({
        no_doc: joi.string().required(),
        tanggal: joi.string().required(),
        no_asset: joi.string().required(),
        nama_asset: joi.string().required(),
        area: joi.string().required(),
        keterangan: joi.string().required(),
        kode_plant: joi.string().required()
      })
      const { value: results, error } = schema.validate(req.body)
      if (error) {
        return response(res, 'Error', { error: error.message }, 401, false)
      } else {
        if (level === 1) {
          const result = await asset.findAll({
            where: {
              no_asset: results.no_asset
            }
          })
          if (result.length > 0) {
            return response(res, 'kode plant already exist', {}, 400, false)
          } else {
            const result = await asset.create(results)
            if (result) {
              return response(res, 'successfully add asset', { result })
            } else {
              return response(res, 'failed to add asset', {}, 400, false)
            }
          }
        } else {
          return response(res, "you're not super administrator", {}, 400, false)
        }
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  getAsset: async (req, res) => {
    try {
      const level = req.user.level
      const kode = req.user.kode
      const cost = req.user.name
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
        sortValue = sort || 'tanggal'
      }
      if (!tipe) {
        tipe = 'all'
      }
      if (!limit) {
        limit = 12
      } else if (limit === 'all') {
        const findLimit = await asset.findAll()
        limit = findLimit.length
      } else {
        limit = parseInt(limit)
      }
      if (!page) {
        page = 1
      } else {
        page = parseInt(page)
      }
      if (level === 5) {
        const findDep = await depo.findOne({
          where: {
            kode_plant: kode
          }
        })
        if (findDep) {
          const result = await asset.findAndCountAll({
            where: {
              [Op.and]: [
                {
                  [Op.and]: [
                    { cost_center: findDep.cost_center }
                    // ,
                    // { status: null }
                  ]
                },
                {
                  [Op.or]: [
                    { no_asset: { [Op.like]: `%${searchValue}%` } },
                    { no_doc: { [Op.like]: `%${searchValue}%` } },
                    { tanggal: { [Op.like]: `%${searchValue}%` } },
                    { nama_asset: { [Op.like]: `%${searchValue}%` } },
                    { nilai_acquis: { [Op.like]: `%${searchValue}%` } },
                    { accum_dep: { [Op.like]: `%${searchValue}%` } },
                    { nilai_buku: { [Op.like]: `%${searchValue}%` } },
                    { kode_plant: { [Op.like]: `%${searchValue}%` } },
                    { cost_center: { [Op.like]: `%${searchValue}%` } },
                    { area: { [Op.like]: `%${searchValue}%` } },
                    { merk: { [Op.like]: `%${searchValue}%` } },
                    { satuan: { [Op.like]: `%${searchValue}%` } },
                    { unit: { [Op.like]: `%${searchValue}%` } },
                    { lokasi: { [Op.like]: `%${searchValue}%` } },
                    { kategori: { [Op.like]: `%${searchValue}%` } }
                  ]
                }
              ]
            },
            include: [
              {
                model: path,
                as: 'pict'
              }
            ],
            order: [
              [sortValue, 'DESC'],
              [{ model: path, as: 'pict' }, 'id', 'ASC']
            ],
            limit: limit,
            offset: (page - 1) * limit
          })
          const pageInfo = pagination('/asset/get', req.query, page, limit, result.count)
          if (result) {
            return response(res, 'list asset', { result, pageInfo })
          } else {
            return response(res, 'failed to get aset', {}, 404, false)
          }
        } else {
          return response(res, 'failed to get aset', {}, 404, false)
        }
      } else if (level === 9) {
        const result = await asset.findAndCountAll({
          where: {
            [Op.and]: [
              {
                [Op.and]: [
                  { cost_center: cost }
                  // ,
                  // { status: null }
                ]
              },
              {
                [Op.or]: [
                  { no_asset: { [Op.like]: `%${searchValue}%` } },
                  { no_doc: { [Op.like]: `%${searchValue}%` } },
                  { tanggal: { [Op.like]: `%${searchValue}%` } },
                  { nama_asset: { [Op.like]: `%${searchValue}%` } },
                  { nilai_acquis: { [Op.like]: `%${searchValue}%` } },
                  { accum_dep: { [Op.like]: `%${searchValue}%` } },
                  { nilai_buku: { [Op.like]: `%${searchValue}%` } },
                  { kode_plant: { [Op.like]: `%${searchValue}%` } },
                  { cost_center: { [Op.like]: `%${searchValue}%` } },
                  { area: { [Op.like]: `%${searchValue}%` } },
                  { merk: { [Op.like]: `%${searchValue}%` } },
                  { satuan: { [Op.like]: `%${searchValue}%` } },
                  { unit: { [Op.like]: `%${searchValue}%` } },
                  { lokasi: { [Op.like]: `%${searchValue}%` } },
                  { kategori: { [Op.like]: `%${searchValue}%` } }
                ]
              }
            ]
            // [Op.or]: [
            //   { no_asset: { [Op.like]: `%${searchValue}%` } },
            //   { nama_asset: { [Op.like]: `%${searchValue}%` } }
            // ]
          },
          include: [
            {
              model: path,
              as: 'pict'
            }
          ],
          order: [
            [sortValue, 'DESC'],
            [{ model: path, as: 'pict' }, 'id', 'ASC']
          ],
          limit: limit,
          offset: (page - 1) * limit
        })
        const pageInfo = pagination('/asset/get', req.query, page, limit, result.count)
        if (result) {
          return response(res, 'list asset', { result, pageInfo })
        } else {
          return response(res, 'failed to get user', {}, 404, false)
        }
      } else {
        const result = await asset.findAndCountAll({
          where: {
            // [Op.or]: [
            //   { no_asset: { [Op.like]: `%${searchValue}` } },
            //   { area: { [Op.like]: `%${searchValue}` } },
            //   { kode_plant: { [Op.like]: `%${searchValue}` } },
            //   { nama_asset: { [Op.like]: `%${searchValue}` } }
            // ],
            [Op.and]: [
              {
                [Op.or]: [
                  { no_asset: { [Op.like]: `%${searchValue}%` } },
                  { no_doc: { [Op.like]: `%${searchValue}%` } },
                  { tanggal: { [Op.like]: `%${searchValue}%` } },
                  { nama_asset: { [Op.like]: `%${searchValue}%` } },
                  { nilai_acquis: { [Op.like]: `%${searchValue}%` } },
                  { accum_dep: { [Op.like]: `%${searchValue}%` } },
                  { nilai_buku: { [Op.like]: `%${searchValue}%` } },
                  { kode_plant: { [Op.like]: `%${searchValue}%` } },
                  { cost_center: { [Op.like]: `%${searchValue}%` } },
                  { area: { [Op.like]: `%${searchValue}%` } },
                  { merk: { [Op.like]: `%${searchValue}%` } },
                  { satuan: { [Op.like]: `%${searchValue}%` } },
                  { unit: { [Op.like]: `%${searchValue}%` } },
                  { lokasi: { [Op.like]: `%${searchValue}%` } },
                  { kategori: { [Op.like]: `%${searchValue}%` } }
                ]
              }
              // ,
              // {
              //   [Op.or]: [
              //     { status: '1' },
              //     { status: '11' },
              //     { status: null }
              //   ]
              // }
            ]
          },
          include: [
            {
              model: path,
              as: 'pict'
            }
          ],
          order: [[sortValue, 'DESC']],
          limit: limit,
          offset: (page - 1) * limit
        })
        const pageInfo = pagination('/asset/get', req.query, page, limit, result.count)
        if (result) {
          return response(res, 'list asset admin', { result, pageInfo, searchValue })
        } else {
          return response(res, 'failed to get user', {}, 404, false)
        }
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  getAssetAll: async (req, res) => {
    try {
      const kode = req.user.kode
      const cost = req.user.name
      const level = req.user.level
      const id = req.user.id
      let { limit, page, search, sort, tipe, area } = req.query
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
      if (!tipe) {
        tipe = 'all'
      }
      if (!limit) {
        limit = 10
      } else if (limit === 'all') {
        limit = 100
      } else {
        limit = parseInt(limit)
      }
      if (!page) {
        page = 1
      } else {
        page = parseInt(page)
      }
      const findDep = await depo.findOne({
        where: {
          kode_plant: level === 5 ? kode : cost
        }
      })
      const detailUser = await user.findOne({
        where: {
          id: id
        }
      })
      if (findDep) {
        const listCenter = []
        if (limit === 'all') {
          if (level === 9) {
            const findUser = await user.findAll({
              where: {
                user_level: 9
              }
            })
            for (let i = 0; i < findUser.length; i++) {
              const data = { cost_center: findUser[i].username }
              listCenter.push(data)
            }
            if (listCenter) {
              const findLimit = await asset.findAll({
                where: {
                  [Op.and]: [
                    area === 'all' ? { [Op.or]: listCenter } : { cost_center: area },
                    detailUser.status_it === null ? { [Op.not]: { kategori: 'IT' } } : { kategori: 'IT' }
                  ]
                }
              })
              limit = findLimit.length
            }
          } else {
            const findLimit = await asset.findAll({
              where: {
                cost_center: findDep.cost_center
              }
            })
            limit = findLimit.length
          }
        }
        if (level === 9) {
          const findUser = await user.findAll({
            where: {
              user_level: 9
            }
          })
          const listData = []
          for (let i = 0; i < findUser.length; i++) {
            const data = { cost_center: findUser[i].username }
            listData.push(data)
          }
          const result = await asset.findAndCountAll({
            where: {
              [Op.and]: [
                area === 'all' ? { [Op.or]: listData } : { cost_center: area },
                detailUser.status_it === null ? { [Op.not]: { kategori: 'IT' } } : { kategori: 'IT' },
                {
                  [Op.or]: [
                    { status: '1' },
                    { status: '11' },
                    { status: null }
                  ]
                }
              ],
              [Op.or]: [
                { no_asset: { [Op.like]: `%${searchValue}` } },
                { nama_asset: { [Op.like]: `%${searchValue}` } }
              ]
              // [Op.not]: { status: '0' }
            },
            include: [
              {
                model: path,
                as: 'pict'
              }
            ],
            order: [
              [sortValue, 'ASC'],
              [{ model: path, as: 'pict' }, 'id', 'ASC']
            ],
            limit: limit,
            offset: (page - 1) * limit,
            distinct: true
          })
          const pageInfo = pagination('/asset/all', req.query, page, limit, result.count)
          if (result) {
            return response(res, 'list asset', { result, pageInfo, level: level === 9, listData, area })
          } else {
            return response(res, 'failed to get asset', {}, 404, false)
          }
        } else {
          const result = await asset.findAndCountAll({
            where: {
              [Op.and]: [
                { cost_center: findDep.cost_center },
                {
                  [Op.or]: [
                    { status: '1' },
                    { status: '11' },
                    { status: null }
                  ]
                }
              ],
              [Op.or]: [
                { no_asset: { [Op.like]: `%${searchValue}` } },
                { nama_asset: { [Op.like]: `%${searchValue}` } }
              ]
              // [Op.not]: { status: '0' }
            },
            include: [
              {
                model: path,
                as: 'pict'
              }
            ],
            order: [
              [sortValue, 'ASC'],
              [{ model: path, as: 'pict' }, 'id', 'ASC']
            ],
            limit: limit,
            offset: (page - 1) * limit,
            distinct: true
          })
          const pageInfo = pagination('/asset/all', req.query, page, limit, result.count)
          if (result) {
            return response(res, 'list asset', { result, pageInfo })
          } else {
            return response(res, 'failed to get asset', {}, 404, false)
          }
        }
      } else {
        return response(res, 'failed to get asset', {}, 404, false)
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  getDetailAsset: async (req, res) => {
    try {
      const id = req.params.id
      const findAsset = await asset.findOne({
        where: {
          id: id
        },
        include: [
          {
            model: path,
            as: 'pict'
          }
        ],
        order: [
          [{ model: path, as: 'pict' }, 'id', 'ASC']
        ]
      })
      if (findAsset) {
        return response(res, 'succes get detail asset', { result: findAsset })
      } else {
        return response(res, 'failed to get detail asset', {}, 404, false)
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  updateAsset: async (req, res) => {
    try {
      // const level = req.user.level
      const id = req.params.id
      const schema = joi.object({
        // area: joi.string(),
        // tanggal: joi.string(),
        // no_doc: joi.string(),
        // no_asset: joi.string(),
        // nama_asset: joi.string(),
        // kode_plant: joi.string(),
        keterangan: joi.string().allow(''),
        deskripsi: joi.string().allow(''),
        nilai_buku: joi.string().allow(''),
        merk: joi.string().allow(''),
        satuan: joi.string().allow(''),
        unit: joi.string().allow(''),
        kondisi: joi.string().allow(''),
        lokasi: joi.string().allow(''),
        grouping: joi.string().allow(''),
        status_fisik: joi.string().allow('')
      })
      const { value: results, error } = schema.validate(req.body)
      if (error) {
        return response(res, 'Error', { error: error.message }, 401, false)
      } else {
        if (results.no_asset) {
          const result = await asset.findAll({
            where:
                {
                  no_asset: results.no_asset,
                  [Op.not]: { id: id }
                }
          })
          if (result.length > 0) {
            return response(res, 'no asset already use', {}, 400, false)
          } else {
            const result = await asset.findByPk(id)
            if (result) {
              await result.update(results)
              return response(res, 'successfully update asset', { result })
            } else {
              return response(res, 'failed update asset', {}, 404, false)
            }
          }
        } else {
          const result = await asset.findByPk(id)
          if (result) {
            await result.update(results)
            return response(res, 'successfully update asset1', { result })
          } else {
            return response(res, 'failed update asset', {}, 404, false)
          }
        }
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  deleteAsset: async (req, res) => {
    try {
      const level = req.user.level
      const id = req.params.id
      if (level === 1) {
        const result = await asset.findByPk(id)
        if (result) {
          await result.destroy()
          return response(res, 'successfully delete asset', { result })
        } else {
          return response(res, 'failed to delete asset', {}, 404, false)
        }
      } else {
        return response(res, "you're not super administrator", {}, 400, false)
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  uploadMasterAsset: async (req, res) => {
    const level = req.user.level
    if (level === 1) {
      uploadMaster(req, res, async function (err) {
        // try {
        if (err instanceof multer.MulterError) {
          if (err.code === 'LIMIT_UNEXPECTED_FILE' && req.files.length === 0) {
            console.log(err.code === 'LIMIT_UNEXPECTED_FILE' && req.files.length > 0)
            return response(res, 'fieldname doesnt match', {}, 500, false)
          }
          return response(res, err.message, {}, 500, false)
        } else if (err) {
          return response(res, err.message, {}, 401, false)
        }
        const dokumen = `assets/masters/${req.files[0].filename}`
        const rows = await readXlsxFile(dokumen)
        const count = []
        const cek = ['Asset', 'SNo.', 'Cap.Date', 'Asset Description', 'Acquis.val.', 'Accum.dep.', 'Book val.', 'Plant', 'Cost Ctr', 'Cost Ctr Name', 'MERK', 'SATUAN', 'JUMLAH', 'LOKASI', 'KATEGORI']
        const valid = rows[0]
        for (let i = 0; i < cek.length; i++) {
          console.log(valid[i] === cek[i])
          if (valid[i] === cek[i]) {
            count.push(1)
          }
        }
        if (count.length === cek.length) {
          const plant = []
          const kode = []
          for (let i = 1; i < rows.length; i++) {
            const a = rows[i]
            if (a[0] !== null) {
              plant.push(`No Aset ${a[0]}`)
              kode.push(`${a[0]}`)
            }
          }
          const object = {}
          const result = []

          plant.forEach(item => {
            if (!object[item]) { object[item] = 0 }
            object[item] += 1
          })

          for (const prop in object) {
            if (object[prop] >= 2) {
              result.push(prop)
            }
          }
          if (result.length > 0) {
            return response(res, 'there is duplication in your file master', { result }, 404, false)
          } else {
            const arr = []
            rows.shift()
            for (let i = 0; i < rows.length; i++) {
              // const select = await sequelize.query(`SELECT no_asset from assets WHERE no_asset='${rows[i][0]}'`, {
              //   type: QueryTypes.SELECT
              // })
              const dataAsset = rows[i]
              const send = {
                no_asset: dataAsset[0],
                no_doc: dataAsset[1],
                tanggal: dataAsset[2],
                nama_asset: dataAsset[3],
                nilai_acquis: dataAsset[4],
                accum_dep: dataAsset[5],
                nilai_buku: dataAsset[6],
                kode_plant: dataAsset[7],
                cost_center: dataAsset[8],
                area: dataAsset[9],
                merk: dataAsset[10],
                satuan: dataAsset[11],
                unit: dataAsset[12],
                lokasi: dataAsset[13],
                kategori: dataAsset[14]
              }
              const cekAsset = await asset.findOne({
                where: {
                  no_asset: send.no_asset
                }
              })
              if (cekAsset) {
                const updateAsset = await cekAsset.update(send)
                if (updateAsset) {
                  arr.push(updateAsset)
                }
              } else {
                const createAsset = await asset.create(send)
                if (createAsset) {
                  arr.push(createAsset)
                }
              }
            }
            if (arr.length > 0) {
              return response(res, 'success upload asset balance', { rows })
            } else {
              return response(res, 'failed upload asset balance')
            }
            // if (arr.length > 0) {
            //   rows.shift()
            //   const result = await sequelize.query(`INSERT INTO assets (no_doc, tanggal, no_asset, nama_asset, area, kode_plant, keterangan, merk, satuan, unit) VALUES ${rows.map(a => '(?)').join(',')}`,
            //     {
            //       replacements: rows,
            //       type: QueryTypes.INSERT
            //     })
            //   if (result) {
            //     fs.unlink(dokumen, function (err) {
            //       if (err) throw err
            //       console.log('success')
            //     })
            //     return response(res, 'successfully upload file master')
            //   } else {
            //     fs.unlink(dokumen, function (err) {
            //       if (err) throw err
            //       console.log('success')
            //     })
            //     return response(res, 'failed to upload file', {}, 404, false)
            //   }
            // } else {
            //   rows.shift()
            //   const result = await sequelize.query(`INSERT INTO assets (no_doc, tanggal, no_asset, nama_asset, area, kode_plant, keterangan, merk, satuan, unit) VALUES ${rows.map(a => '(?)').join(',')}`,
            //     {
            //       replacements: rows,
            //       type: QueryTypes.INSERT
            //     })
            //   if (result) {
            //     fs.unlink(dokumen, function (err) {
            //       if (err) throw err
            //       console.log('success')
            //     })
            //     return response(res, 'successfully upload file master')
            //   } else {
            //     fs.unlink(dokumen, function (err) {
            //       if (err) throw err
            //       console.log('success')
            //     })
            //     return response(res, 'failed to upload file', {}, 404, false)
            //   }
            // }
          }
        } else {
          fs.unlink(dokumen, function (err) {
            if (err) throw err
            console.log('success')
          })
          return response(res, 'Failed to upload master file, please use the template provided', {}, 400, false)
        }
        // } catch (error) {
        //   return response(res, error.message, {}, 500, false)
        // }
      })
    } else {
      return response(res, "You're not super administrator", {}, 404, false)
    }
  },
  syncAsset: async (req, res) => {
    try {
      req.setTimeout(1000 * 60 * 60)
      const { date1, type, noAset } = req.query
      const timeSync1 = moment().format('L').split('/')
      const time = date1 === undefined || date1 === 'undefined' || date1 === null || date1 === 'null' || date1 === '' ? timeSync1 : moment(date1).format('L').split('/')
      if (type === 'no') {
        const findApi = await axios.get(`${APP_SAP}/sap/bc/zast/?sap-client=300&pgmna=zfir0090&p_anln1=${noAset}&p_bukrs=pp01&p_gjahr=${time[2]}&p_monat=${time[0]}`, { timeout: (1000 * 60 * 10) }).then(response => { return (response) }).catch(err => { return (err.isAxiosError) })
        console.log(findApi)
        if (findApi.status === 200 && findApi.data.length > 0) {
          const data = findApi.data[0]
          const findDepo = await depo.findOne({
            where: {
              cost_center: data.kostl
            }
          })
          const findAset = await asset.findOne({
            where: {
              no_asset: noAset
            }
          })
          const send = {
            no_asset: (data.anln1 + '0').slice(2, -1),
            no_doc: 0,
            tanggal: data.aktiv === undefined ? '' : data.aktiv,
            nama_asset: data.txt50 === undefined ? '' : data.txt50,
            nilai_acquis: data.kansw === undefined ? 0 : data.kansw.toString().split('.')[0],
            accum_dep: data.knafa === undefined ? 0 : data.knafa.toString().split('.')[0],
            nilai_buku: data.nafap === undefined ? 0 : data.nafap.toString().split('.')[0],
            kode_plant: data.werks,
            cost_center: data.kostl,
            area: findDepo ? findDepo.nama_area : '',
            unit: 1
          }
          if (findAset) {
            const updateAset = await findAset.update(send)
            return response(res, 'success sync aset', { result: updateAset })
          } else {
            const createAset = await asset.create(send)
            return response(res, 'success sync aset', { result: createAset })
          }
        } else {
          return response(res, 'failed sync asset', { findApi, time, type, noAset }, 404, false)
        }
      } else {
        const findApi = await axios.get(`${APP_SAP}/sap/bc/zast/?sap-client=300&pgmna=zfir0090&p_bukrs=pp01&p_gjahr=${time[2]}&p_monat=${time[0]}`, { timeout: (1000 * 60 * 10) }).then(response => { return (response) }).catch(err => { return (err.isAxiosError) })
        const findDepo = await depo.findAll()
        if (findApi.status === 200 && findApi.data.length > 0 && findDepo.length > 0) {
          const cekSync = []
          const data = findApi.data
          for (let i = 0; i < data.length; i++) {
            const cekArea = findDepo.find(item => item.cost_center === data[i].kostl)
            const send = {
              no_asset: (data[i].anln1 + '0').slice(2, -1),
              no_doc: 0,
              tanggal: data[i].aktiv === undefined ? '' : data[i].aktiv,
              nama_asset: data[i].txt50 === undefined ? '' : data[i].txt50,
              nilai_acquis: data[i].kansw === undefined ? 0 : data[i].kansw.toString().split('.')[0],
              accum_dep: data[i].knafa === undefined ? 0 : data[i].knafa.toString().split('.')[0],
              nilai_buku: data[i].nafap === undefined ? 0 : data[i].nafap.toString().split('.')[0],
              kode_plant: data[i].werks,
              cost_center: data[i].kostl,
              area: cekArea ? cekArea.nama_area : '',
              unit: 1
            }
            // const findAset = await asset.findOne({
            //   where: {
            //     [Op.or]: [
            //       { no_asset: data[i].anln1 },
            //       { no_asset: (data[i].anln1 + '0').slice(2, -1) }
            //     ]
            //   }
            // })
            const updateAset = await asset.update(send, {
              where: {
                no_asset: send.no_asset
                // [Op.or]: [
                //   { no_asset: data[i].anln1 },
                //   { no_asset: (data[i].anln1 + '0').slice(2, -1) }
                // ]
              }
            })
            if (updateAset) {
              // const send = {
              //   no_asset: findAset.no_asset,
              //   ...send
              // }
              // const updateAset = await findAset.update(send)
              cekSync.push(updateAset)
            } else {
              const createAset = await asset.create(send)
              cekSync.push(createAset)
            }
          }
          if (cekSync.length > 0) {
            return response(res, 'success sync asset')
          } else {
            return response(res, 'failed sync asset', {}, 404, false)
          }
        } else {
          return response(res, 'failed sync asset', {}, 404, false)
        }
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  exportSqlAsset: async (req, res) => {
    try {
      const result = await asset.findAll()
      if (result) {
        const workbook = new excel.Workbook()
        const worksheet = workbook.addWorksheet()
        const arr = []
        const header = ['No.Doc', 'Tanggal', 'No Aset', 'Nama Aset', 'Area', 'Keterangan']
        const key = ['no_doc', 'tanggal', 'no_asset', 'nama_asset', 'area', 'keterangan']
        for (let i = 0; i < header.length; i++) {
          let temp = { header: header[i], key: key[i] }
          arr.push(temp)
          temp = {}
        }
        worksheet.columns = arr
        const cek = worksheet.addRows(result)
        if (cek) {
          const name = new Date().getTime().toString().concat('-asset').concat('.xlsx')
          await workbook.xlsx.writeFile(name)
          vs.move(name, `assets/exports/${name}`, function (err) {
            if (err) {
              throw err
            }
            console.log('success')
          })
          return response(res, 'success', { link: `${APP_BE}/download/${name}` })
        } else {
          return response(res, 'failed create file', {}, 404, false)
        }
      } else {
        return response(res, 'failed', {}, 404, false)
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  }
}
