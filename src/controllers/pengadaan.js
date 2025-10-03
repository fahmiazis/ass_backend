const { email, approve, ttd, depo, pengadaan, document, docUser, role, user, assettemp, reservoir, asset } = require('../models')
const joi = require('joi')
const response = require('../helpers/response')
const { Op } = require('sequelize')
// const { pagination } = require('../helpers/pagination')
const moment = require('moment')
const readXlsxFile = require('read-excel-file/node')
const wrapMail = require('../helpers/wrapMail')
const uploadMaster = require('../helpers/uploadMaster')
const multer = require('multer')
const uploadHelper = require('../helpers/upload')
const fs = require('fs')
const axios = require('axios')

const emailAss = 'fahmi_aziz@pinusmerahabadi.co.id'
const emailAss2 = 'fahmi_aziz@pinusmerahabadi.co.id'

module.exports = {
  getPengadaan: async (req, res) => {
    try {
      const idUser = req.user.id
      const level = req.user.level
      const kode = req.user.kode
      const name = req.user.name
      const fullname = req.user.fullname
      const { status, time1, time2, search } = req.query
      let { limit, page } = req.query
      const searchValue = search || ''
      const statTrans = status === 'undefined' || status === null ? 'all' : status
      const timeVal1 = time1 === 'undefined' ? 'all' : time1
      const timeVal2 = time2 === 'undefined' ? 'all' : time2
      const timeV1 = moment(timeVal1)
      const timeV2 = timeVal1 !== 'all' && timeVal1 === timeVal2 ? moment(timeVal2).add(1, 'd') : moment(timeVal2).add(1, 'd')
      const listDepo = 'all'

      if (!limit || limit === undefined || limit === 'undefined' || limit === null) {
        limit = 100
      } else if (limit === 'all') {
        limit = 'all'
      } else {
        limit = parseInt(limit)
      }

      if (!page || page === undefined || page === null) {
        page = 1
      } else {
        page = parseInt(page)
      }
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
      if (level === 5 || level === 9) {
        const result = await pengadaan.findAndCountAll({
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
            // { area: { [Op.like]: `%${searchValue}%` } },
            // { kode_plant: { [Op.like]: `%${searchValue}%` } },
              { no_pengadaan: { [Op.like]: `%${searchValue}%` } },
              { nama: { [Op.like]: `%${searchValue}%` } },
              { tipe: { [Op.like]: `%${searchValue}%` } },
              { kategori: { [Op.like]: `%${searchValue}%` } },
              { no_io: { [Op.like]: `%${searchValue}%` } },
              { no_asset: { [Op.like]: `%${searchValue}%` } }
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
              model: ttd,
              as: 'appForm'
            }
          ],
          limit: limit,
          offset: (page - 1) * limit,
          group: ['pengadaan.no_pengadaan'],
          distinct: true
        })
        if (result.rows.length > 0) {
          return response(res, 'success get', { result: result.rows })
        } else {
          return response(res, 'success get', { result: [] })
        }
      } else if (findUser.role.type === 'area') {
        const findDepo = await depo.findAll({
          where: {
            [Op.or]: [
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
                dataDepo.push(data)
              }
            } else {
              const data = { kode_plant: findDepo[i].kode_plant }
              dataDepo.push(data)
            }
          }
          // const hasil = []
          // for (let i = 0; i < findDepo.length; i++) {
          const result = await pengadaan.findAndCountAll({
            where: {
            // kode_plant: findDepo[i].kode_plant,
              [Op.and]: [
                {
                  [Op.or]: dataDepo
                },
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
                { area: { [Op.like]: `%${searchValue}%` } },
                { kode_plant: { [Op.like]: `%${searchValue}%` } },
                { no_pengadaan: { [Op.like]: `%${searchValue}%` } },
                { nama: { [Op.like]: `%${searchValue}%` } },
                { tipe: { [Op.like]: `%${searchValue}%` } },
                { kategori: { [Op.like]: `%${searchValue}%` } },
                { no_io: { [Op.like]: `%${searchValue}%` } },
                { no_asset: { [Op.like]: `%${searchValue}%` } }
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
                model: ttd,
                as: 'appForm'
              }
            ],
            limit: limit,
            offset: (page - 1) * limit,
            group: ['pengadaan.no_pengadaan'],
            distinct: true
          })
          // if (result) {
          //   for (let j = 0; j < result.rows.length; j++) {
          //     hasil.push(result.rows[j])
          //   }
          // }
          // }
          if (result.rows.length > 0) {
            return response(res, 'success get', { result: result.rows, findDepo })
          } else {
            return response(res, 'success get', { result: result.rows })
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
            [Op.or]: [
              { area: { [Op.like]: `%${searchValue}%` } },
              { kode_plant: { [Op.like]: `%${searchValue}%` } },
              { no_pengadaan: { [Op.like]: `%${searchValue}%` } },
              { nama: { [Op.like]: `%${searchValue}%` } },
              { tipe: { [Op.like]: `%${searchValue}%` } },
              { kategori: { [Op.like]: `%${searchValue}%` } },
              { no_io: { [Op.like]: `%${searchValue}%` } },
              { no_asset: { [Op.like]: `%${searchValue}%` } }
            ],
            [Op.not]: { no_pengadaan: null }
          },
          include: [
            {
              model: depo,
              as: 'depo'
            },
            {
              model: ttd,
              as: 'appForm'
            }
          ],
          order: [
            ['id', 'ASC'],
            [{ model: ttd, as: 'appForm' }, 'id', 'DESC']
          ],
          limit: limit,
          offset: (page - 1) * limit,
          group: ['pengadaan.no_pengadaan'],
          distinct: true
        })
        if (result) {
          return response(res, 'success get', { result: result.rows })
        } else {
          return response(res, 'failed get data', { result: [] })
        }
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  tracking: async (req, res) => {
    try {
      const level = req.user.level
      const kode = req.user.kode
      const name = req.user.name
      const fullname = req.user.fullname
      if (level === 5 || level === 9) {
        const result = await pengadaan.findAll({
          where: {
            kode_plant: level === 5 ? kode : name,
            no_pengadaan: { [Op.not]: null }
          },
          include: [
            {
              model: depo,
              as: 'depo'
            }
          ],
          order: [
            ['id', 'ASC']
          ],
          group: [
            ['no_pengadaan']
          ]
        })
        if (result.length > 0) {
          const data = []
          for (let i = 0; i < result.length; i++) {
            const temp = result[i]
            const appForm = await ttd.findAll({
              where: {
                no_doc: result[i].no_pengadaan
              },
              order: [
                ['id', 'DESC']
              ]
            })
            if (appForm.length > 0) {
              temp.dataValues.appForm = appForm
              data.push(temp)
            } else {
              temp.dataValues.appForm = appForm
              data.push(temp)
            }
          }
          if (data.length > 0) {
            return response(res, 'success get', { result: data })
          } else {
            return response(res, 'success get', { result: data })
          }
        } else {
          return response(res, 'failed get data', {}, 404, false)
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
            const result = await pengadaan.findAll({
              where: {
                kode_plant: findDepo[i].kode_plant,
                no_pengadaan: { [Op.not]: null }
              },
              include: [
                {
                  model: depo,
                  as: 'depo'
                }
              ],
              order: [
                ['id', 'ASC']
              ],
              group: [
                ['no_pengadaan']
              ]
            })
            if (result) {
              for (let j = 0; j < result.length; j++) {
                hasil.push(result[j])
              }
            }
          }
          if (hasil.length > 0) {
            const data = []
            for (let i = 0; i < hasil.length; i++) {
              const temp = hasil[i]
              const appForm = await ttd.findAll({
                where: {
                  no_doc: hasil[i].no_pengadaan
                },
                order: [
                  ['id', 'DESC']
                ]
              })
              if (appForm.length > 0) {
                temp.dataValues.appForm = appForm
                data.push(temp)
              } else {
                temp.dataValues.appForm = appForm
                data.push(temp)
              }
            }
            if (data.length > 0) {
              return response(res, 'success get', { result: data })
            } else {
              return response(res, 'success get', { result: data })
            }
          } else {
            return response(res, 'success get', { result: hasil })
          }
        } else {
          return response(res, 'failed get data', {}, 404, false)
        }
      } else {
        const result = await pengadaan.findAll({
          where: {
            no_pengadaan: { [Op.not]: null }
          },
          include: [
            {
              model: depo,
              as: 'depo'
            }
          ],
          order: [
            ['id', 'ASC']
          ],
          group: [
            ['no_pengadaan']
          ]
        })
        if (result.length > 0) {
          const data = []
          for (let i = 0; i < result.length; i++) {
            const temp = result[i]
            const appForm = await ttd.findAll({
              where: {
                no_doc: result[i].no_pengadaan
              },
              order: [
                ['id', 'DESC']
              ]
            })
            if (appForm.length > 0) {
              temp.dataValues.appForm = appForm
              data.push(temp)
            } else {
              temp.dataValues.appForm = appForm
              data.push(temp)
            }
          }
          if (data.length > 0) {
            return response(res, 'success get', { result: data })
          } else {
            return response(res, 'success get', { result: data })
          }
        } else {
          return response(res, 'failed get data', {}, 404, false)
        }
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  getRevisi: async (req, res) => {
    try {
      const level = req.user.level
      const kode = req.user.kode
      // const name = req.user.name
      const fullname = req.user.fullname
      // const { status } = req.query
      if (level === 5) {
        const result = await pengadaan.findAll({
          where: {
            kode_plant: kode,
            status_reject: 1,
            menu_rev: 'Revisi Area',
            [Op.not]: [
              { status_form: '0' }
            ]
          },
          include: [
            {
              model: depo,
              as: 'depo'
            }
          ],
          order: [
            ['id', 'ASC']
          ],
          group: [
            ['no_pengadaan']
          ]
        })
        if (result.length > 0) {
          return response(res, 'success get', { result })
        } else {
          return response(res, 'failed get data', { result: [] })
        }
      } else if (level === 9) {
        const result = await pengadaan.findAll({
          where: {
            kode_plant: kode,
            status_reject: 1,
            menu_rev: 'Revisi Area',
            [Op.not]: [
              { status_form: '0' }
            ]
          },
          include: [
            {
              model: depo,
              as: 'depo'
            }
          ],
          order: [
            ['id', 'ASC']
          ],
          group: [
            ['no_pengadaan']
          ]
        })
        if (result.length > 0) {
          const data = []
          for (let i = 0; i < result.length; i++) {
            const temp = result[i]
            const appForm = await ttd.findAll({
              where: {
                no_doc: result[i].no_pengadaan
              },
              order: [
                ['id', 'DESC']
              ]
            })
            if (appForm.length > 0) {
              temp.dataValues.appForm = appForm
              data.push(temp)
            } else {
              temp.dataValues.appForm = appForm
              data.push(temp)
            }
          }
          if (data.length > 0) {
            return response(res, 'success get', { result: data })
          } else {
            return response(res, 'success get', { result: data })
          }
        } else {
          return response(res, 'failed get data', { result: [] })
        }
      } else if (level === 2) {
        const findDepo = await depo.findAll({
          where: {
            [Op.or]: [
              { nama_pic_1: fullname }
            ]
          }
        })
        if (findDepo.length > 0) {
          const hasil = []
          for (let i = 0; i < findDepo.length; i++) {
            const result = await pengadaan.findAll({
              where: {
                kode_plant: findDepo[i].kode_plant,
                status_reject: 1,
                menu_rev: 'Revisi Aset',
                [Op.not]: [
                  { status_form: '0' }
                ]
              },
              include: [
                {
                  model: depo,
                  as: 'depo'
                }
              ],
              order: [
                ['id', 'ASC']
              ],
              group: [
                ['no_pengadaan']
              ]
            })
            if (result) {
              for (let j = 0; j < result.length; j++) {
                hasil.push(result[j])
              }
            }
          }
          if (hasil.length > 0) {
            const data = []
            for (let i = 0; i < hasil.length; i++) {
              const temp = hasil[i]
              const appForm = await ttd.findAll({
                where: {
                  no_doc: hasil[i].no_pengadaan
                },
                order: [
                  ['id', 'DESC']
                ]
              })
              if (appForm.length > 0) {
                temp.dataValues.appForm = appForm
                data.push(temp)
              } else {
                temp.dataValues.appForm = appForm
                data.push(temp)
              }
            }
            if (data.length > 0) {
              return response(res, 'success get', { result: data })
            } else {
              return response(res, 'success get', { result: data })
            }
          } else {
            return response(res, 'success get', { result: hasil })
          }
        } else {
          return response(res, 'failed get data', { result: [] })
        }
      } else {
        const result = await pengadaan.findAll({
          where: {
            status_reject: 1,
            menu_rev: 'Revisi Budget',
            [Op.not]: [
              { status_form: '0' }
            ]
          },
          include: [
            {
              model: depo,
              as: 'depo'
            }
          ],
          order: [
            ['id', 'ASC']
          ],
          group: [
            ['no_pengadaan']
          ]
        })
        if (result.length > 0) {
          const data = []
          for (let i = 0; i < result.length; i++) {
            const temp = result[i]
            const appForm = await ttd.findAll({
              where: {
                no_doc: result[i].no_pengadaan
              },
              order: [
                ['id', 'DESC']
              ]
            })
            if (appForm.length > 0) {
              temp.dataValues.appForm = appForm
              data.push(temp)
            } else {
              temp.dataValues.appForm = appForm
              data.push(temp)
            }
          }
          if (data.length > 0) {
            return response(res, 'success get', { result: data })
          } else {
            return response(res, 'success get', { result: data })
          }
        } else {
          return response(res, 'failed get data', { result: [] })
        }
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  addCart: async (req, res) => {
    try {
      const kode = req.user.kode
      const schema = joi.object({
        nama: joi.string().required(),
        qty: joi.string().required(),
        price: joi.string().required(),
        kategori: joi.string().required(),
        tipe: joi.string().required(),
        jenis: joi.string().required(),
        no_ref: joi.string().allow(''),
        akta: joi.string().allow(''),
        start: joi.string().allow(''),
        end: joi.string().allow('')
      })
      const { value: results, error } = schema.validate(req.body)
      if (error) {
        return response(res, 'Error', { error: error.message }, 404, false)
      } else {
        const findIo = await pengadaan.findAll({
          where: {
            [Op.and]: [
              { kode_plant: kode },
              { nama: results.nama }
            ],
            status_form: null
          }
        })
        if (findIo.length > 0) {
          return response(res, 'Item ini telah ditambahkan', {}, 404, false)
        } else {
          const findDepo = await depo.findOne({
            where: {
              kode_plant: kode
            }
          })
          if (findDepo) {
            const data = {
              nama: results.nama,
              qty: results.qty,
              price: results.price.replace(/[^a-z0-9-]/g, ''),
              kategori: results.kategori,
              kode_plant: kode,
              area: `${findDepo.nama_area} ${findDepo.channel}`,
              tipe: results.tipe,
              no_ref: results.no_ref.replace(/_/g, '/'),
              jenis: results.jenis,
              akta: results.akta === '' ? null : results.akta,
              start: results.start === null || results.start === '' ? null : results.start,
              end: results.end === null || results.end === '' ? null : results.end
            }
            const sent = await pengadaan.create(data)
            if (sent) {
              return response(res, 'success add cart king', { result: sent, results })
            } else {
              return response(res, 'add cart failed2', {}, 404, false)
            }
          } else {
            return response(res, 'add cart failed', {}, 404, false)
          }
        }
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  updateCart: async (req, res) => {
    try {
      const kode = req.user.kode
      const id = req.params.id
      const schema = joi.object({
        nama: joi.string().required(),
        qty: joi.string().required(),
        price: joi.string().required(),
        kategori: joi.string().required(),
        tipe: joi.string().required(),
        jenis: joi.string().required(),
        no_ref: joi.string().allow(''),
        akta: joi.string().allow(''),
        start: joi.string().allow(''),
        end: joi.string().allow('')
      })
      const { value: results, error } = schema.validate(req.body)
      if (error) {
        return response(res, 'Error', { error: error.message }, 404, false)
      } else {
        const findIo = await pengadaan.findAll({
          where: {
            [Op.and]: [
              { kode_plant: kode },
              { nama: results.nama }
            ],
            status_form: null,
            [Op.not]: [
              { id: id }
            ]
          }
        })
        if (findIo.length > 0) {
          return response(res, 'Item ini telah ditambahkan', {}, 404, false)
        } else {
          const data = {
            nama: results.nama,
            qty: results.qty,
            price: results.price.replace(/[^a-z0-9-]/g, ''),
            kategori: results.kategori,
            kode_plant: kode,
            tipe: results.tipe,
            jenis: results.jenis,
            no_ref: results.no_ref.replace(/_/g, '/'),
            akta: results.akta === '' ? null : results.akta,
            start: results.start === null || results.start === '' ? null : results.start,
            end: results.end === null || results.end === '' ? null : results.end
          }
          const findId = await pengadaan.findByPk(id)
          if (findId) {
            const updateIo = await findId.update(data)
            if (updateIo) {
              return response(res, 'success update cart', { updateIo })
            } else {
              return response(res, 'update cart failed2', { updateIo }, 404, false)
            }
          } else {
            return response(res, 'update cart failed3', { findId }, 404, false)
          }
        }
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  getDataCart: async (req, res) => {
    try {
      const kode = req.user.kode
      const findIo = await pengadaan.findAll({
        where: {
          [Op.and]: [
            { kode_plant: kode },
            { status_form: null }
          ]
        },
        include: [
          {
            model: docUser,
            as: 'doc'
          }
        ]
      })
      if (findIo) {
        return response(res, 'success get', { result: findIo })
      } else {
        return response(res, 'failed get data', {}, 404, false)
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  deleteCart: async (req, res) => {
    try {
      const id = req.params.id
      const findIo = await pengadaan.findByPk(id)
      if (findIo) {
        const delcart = await findIo.destroy()
        if (delcart) {
          return response(res, 'success delete cart', { result: findIo })
        } else {
          return response(res, 'failed get data', {}, 404, false)
        }
      } else {
        return response(res, 'failed get data', {}, 404, false)
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  submitIo: async (req, res) => {
    try {
      // const timeV1 = moment().startOf('month')
      // const timeV2 = moment().endOf('month').add(1, 'd')
      const kode = req.user.kode
      const findNo = await reservoir.findAll({
        where: {
          transaksi: 'pengadaan',
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
      const noIo = Math.max(...cekNo) + 1
      const findIo = await pengadaan.findAll({
        where: {
          kode_plant: kode,
          [Op.or]: [
            { status_form: null }
          ]
        }
      })
      if (findIo.length > 0) {
        const temp = []
        const change = noIo.toString().split('')
        const notrans = change.length === 2 ? '00' + noIo : change.length === 1 ? '000' + noIo : change.length === 3 ? '0' + noIo : noIo
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
        const tempData = findIo.find(({no_pengadaan}) => no_pengadaan !== null) // eslint-disable-line
        const cekData = tempData === undefined ? 'ya' : 'no'
        const noTrans = `${notrans}/${kode}/${findIo[0].area}/${rome}/${year}-IO`
        const data = {
          no_pengadaan: noTrans
        }
        for (let i = 0; i < findIo.length; i++) {
          const findDraft = await pengadaan.findByPk(findIo[i].id)
          if (findDraft) {
            const upIo = await findDraft.update(data)
            if (upIo) {
              temp.push(1)
            }
          }
        }
        if (temp.length) {
          if (cekData === 'no') {
            const findReser = await reservoir.findOne({
              where: {
                no_transaksi: tempData.no_pengadaan
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
              transaksi: 'pengadaan',
              tipe: 'area',
              status: 'delayed'
            }
            if (findReser && !findNewReser) {
              await findReser.update(upDataReser)
              await reservoir.create(creDataReser)
              return response(res, 'success submit cart', { noIo: noTrans })
            } else {
              return response(res, 'success submit cart', { noIo: noTrans })
            }
          } else {
            const findNewReser = await reservoir.findOne({
              where: {
                no_transaksi: noTrans
              }
            })
            if (findNewReser) {
              return response(res, 'success submit cart', { noIo: noTrans })
            } else {
              const creDataReser = {
                no_transaksi: noTrans,
                kode_plant: kode,
                transaksi: 'pengadaan',
                tipe: 'area',
                status: 'delayed'
              }
              await reservoir.create(creDataReser)
              return response(res, 'success submit cart', { noIo: noTrans })
            }
          }
        } else {
          return response(res, 'failed submit cart', { noIo: noTrans })
        }
      } else {
        return response(res, 'failed submit cart', {}, 404, false)
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  submitIoFinal: async (req, res) => {
    try {
      const { no } = req.body
      const kode = req.user.kode
      const findIo = await pengadaan.findAll({
        where: {
          no_pengadaan: no,
          status_form: null
        }
      })
      if (findIo) {
        const temp = []
        for (let i = 0; i < findIo.length; i++) {
          const data = {
            // status_form: findIo[i].kategori === 'return' ? 2 : 1,
            status_form: 1,
            isAsset: findIo[i].kategori === 'return' ? 'true' : null,
            history: `submit pengajuan by ${kode} at ${moment().format('DD/MM/YYYY h:mm:ss a')}`,
            tglIo: moment()
          }
          const findData = await pengadaan.findByPk(findIo[i].id)
          if (findData) {
            await findData.update(data)
            temp.push(findData)
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
          return response(res, 'failed submit cart', {}, 404, false)
        }
      } else {
        return response(res, 'failed submit cart', {}, 404, false)
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  // submitCart: async (req, res) => {
  //   try {
  //     const kode = req.user.kode
  //     const findIo = await pengadaan.findAll({
  //       where: {
  //         [Op.and]: [
  //           { kode_plant: kode },
  //           { status_form: null }
  //         ]
  //       }
  //     })
  //     if (findIo) {
  //       const findNo = await pengadaan.findAll({
  //         where: {
  //           [Op.not]: { no_pengadaan: null }
  //         },
  //         order: [['id', 'DESC']],
  //         limit: 50
  //       })
  //       if (findNo) {
  //         const cekNo = []
  //         for (let i = 0; i < findNo.length; i++) {
  //           const no = findNo[i].no_pengadaan.split('P')
  //           cekNo.push(parseInt(no[1]))
  //         }
  //         const noIo = cekNo.length > 0 ? Math.max(...cekNo) + 1 : 1
  //         const findDepo = await depo.findOne({
  //           where: {
  //             kode_plant: kode
  //           }
  //         })
  //         if (findDepo) {
  //           const cek = []
  //           for (let i = 0; i < findIo.length; i++) {
  //             const findData = await pengadaan.findByPk(findIo[i].id)
  //             const data = {
  //               status_form: 1,
  //               no_pengadaan: noTrans,
  //               tglIo: moment()
  //             }
  //             if (findData) {
  //               await findData.update(data)
  //               cek.push(1)
  //             }
  //           }
  //           if (cek.length > 0) {
  //             const findEmail = await user.findOne({
  //               where: {
  //                 user_level: 2
  //               }
  //             })
  //             if (findEmail) {
  //               let tableTd = ''
  //               for (let i = 0; i < findIo.length; i++) {
  //                 const element = `
  //                 <tr>
  //                   <td>${findIo.indexOf(findIo[i]) + 1}</td>
  //                    <td>${noTrans}</td>
  //                   <td>${findIo[i].name}</td>
  //                   <td>${findIo[i].price}</td>
  //                   <td>${findIo[i].qty}</td>
  //                   <td>${findDepo === null || findDepo.kode_plant === undefined || findDepo.kode_plant === null ? '' : findDepo.kode_plant}</td>
  //                   <td>${findDepo === null || findDepo.cost_center === undefined || findDepo.cost_center === null ? '' : findDepo.cost_center}</td>
  //                   <td>${findDepo === null || findDepo.nama_area === undefined || findDepo.nama_area === null ? '' : findDepo.nama_area}</td>
  //                 </tr>`
  //                 tableTd = tableTd + element
  //               }
  //               const mailOptions = {
  //                 from: 'noreply_asset@pinusmerahabadi.co.id',
  //                 replyTo: 'noreply_asset@pinusmerahabadi.co.id',
  //                 to: `${findEmail.email}`,
  //                 to: `${emailAss}, ${emailAss2}`,
  //                 subject: `Pengajuan Pengadaan Asset ${noTrans} `,
  //                 html: `
  //                 <head>
  //                   <style type="text/css">
  //                   body {
  //                       display: flexbox;
  //                       flex-direction: column;
  //                   }
  //                   .tittle {
  //                       font-size: 15px;
  //                   }
  //                   .mar {
  //                       margin-bottom: 20px;
  //                   }
  //                   .mar1 {
  //                       margin-bottom: 10px;
  //                   }
  //                   .foot {
  //                       margin-top: 20px;
  //                       margin-bottom: 10px;
  //                   }
  //                   .foot1 {
  //                       margin-bottom: 50px;
  //                   }
  //                   .position {
  //                       display: flexbox;
  //                       flex-direction: row;
  //                       justify-content: left;
  //                       margin-top: 10px;
  //                   }
  //                   table {
  //                       font-family: "Lucida Sans Unicode", "Lucida Grande", "Segoe Ui";
  //                       font-size: 12px;
  //                   }
  //                   .demo-table {
  //                       border-collapse: collapse;
  //                       font-size: 13px;
  //                   }
  //                   .demo-table th,
  //                   .demo-table td {
  //                       border-bottom: 1px solid #e1edff;
  //                       border-left: 1px solid #e1edff;
  //                       padding: 7px 17px;
  //                   }
  //                   .demo-table th,
  //                   .demo-table td:last-child {
  //                       border-right: 1px solid #e1edff;
  //                   }
  //                   .demo-table td:first-child {
  //                       border-top: 1px solid #e1edff;
  //                   }
  //                   .demo-table td:last-child{
  //                       border-bottom: 0;
  //                   }
  //                   caption {
  //                       caption-side: top;
  //                       margin-bottom: 10px;
  //                   }

  //                   /* Table Header */
  //                   .demo-table thead th {
  //                       background-color: #508abb;
  //                       color: #FFFFFF;
  //                       border-color: #6ea1cc !important;
  //                       text-transform: uppercase;
  //                   }

  //                   /* Table Body */
  //                   .demo-table tbody td {
  //                       color: #353535;
  //                   }

  //                   .demo-table tbody tr:nth-child(odd) td {
  //                       background-color: #f4fbff;
  //                   }
  //                   .demo-table tbody tr:hover th,
  //                   .demo-table tbody tr:hover td {
  //                       background-color: #ffffa2;
  //                       border-color: #ffff0f;
  //                       transition: all .2s;
  //                   }
  //               </style>
  //                 </head>
  //                 <body>
  //                     <div class="tittle mar">
  //                         Dear Bapak/Ibu Divisi Asset,
  //                     </div>
  //                     <div class="tittle mar1">
  //                         <div>Mohon untuk identifikasi barang yang akan diajukan berikut ini.</div>
  //                     </div>
  //                     <div class="position">
  //                         <table class="demo-table">
  //                             <thead>
  //                                 <tr>
  //                                     <th>No</th>
  //                                     <th>No Pengadaan</th>
  //                                     <th>Description</th>
  //                                     <th>Price</th>
  //                                     <th>Qty</th>
  //                                     <th>Kode Plant</th>
  //                                     <th>Cost Ctr</th>
  //                                     <th>Cost Ctr Name</th>
  //                                 </tr>
  //                             </thead>
  //                             <tbody>
  //                                ${tableTd}
  //                             </tbody>
  //                         </table>
  //                     </div>
  //                     <a href="http://aset.pinusmerahabadi.co.id/">Klik link berikut untuk akses web asset</a>
  //                     <div class="tittle foot">
  //                         Terima kasih,
  //                     </div>
  //                     <div class="tittle foot1">
  //                         Regards,
  //                     </div>
  //                     <div class="tittle">
  //                         Admin
  //                     </div>
  //                 </body>
  //                 `
  //               }
  //               const sendEmail = await wrapMail.wrapedSendMail(mailOptions)
  //               if (sendEmail) {
  //                 return response(res, 'berhasil melakukan pengajuan io', { result: findIo })
  //               } else {
  //                 return response(res, 'berhasil melakukan pengajuan io')
  //               }
  //             } else {
  //               return response(res, 'berhasil melakukan pengajuan io')
  //             }
  //           } else {
  //             return response(res, 'failed submit', {}, 404, false)
  //           }
  //         } else {
  //           return response(res, 'failed submit', {}, 404, false)
  //         }
  //       } else {
  //         return response(res, 'failed submit', {}, 404, false)
  //       }
  //     } else {
  //       return response(res, 'failed submit', {}, 404, false)
  //     }
  //   } catch (error) {
  //     return response(res, error.message, {}, 500, false)
  //   }
  // },
  getApproveIo: async (req, res) => {
    try {
      const { no } = req.body
      // const level = req.user.level
      const result = await ttd.findAll({
        where: {
          [Op.or]: [
            { no_doc: no },
            { no_pengadaan: no }
          ]
        }
      })
      const findRole = await role.findAll()
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
        return response(res, 'success get template approve', { result: { pembuat, pemeriksa, penyetuju } })
      } else {
        const result = await pengadaan.findAll({
          where: {
            no_pengadaan: no
          }
        })
        if (result) {
          const kodePlant = result[0].kode_plant
          const getApp = await approve.findAll({
            where: {
              nama_approve: kodePlant.split('').length === 4 ? 'pengadaan io' : 'pengadaan io HO',
              [Op.and]: [
                {
                  [Op.or]: [
                    { jenis: result[0].jenis === undefined || result[0].jenis === null ? 'all' : result[0].jenis },
                    { jenis: 'all' }
                  ]
                },
                {
                  [Op.or]: [
                    { kategori: result[0].kategori === undefined || result[0].kategori === null ? 'all' : result[0].kategori },
                    { kategori: 'all' }
                  ]
                }
              ]
            }
          })
          if (getApp) {
            // const getArea = await user.findOne({
            //   where: {
            //     kode_plant: result[0].kode_plant
            //   }
            // })
            const hasil = []
            for (let i = 0; i < getApp.length; i++) {
              // const cekApp = getApp[i].jabatan.toLowerCase() === 'aos' && result[0].kategori === 'return' && (level === 5 || level === 9)
              const send = {
                jabatan: getApp[i].jabatan,
                jenis: getApp[i].jenis,
                sebagai: getApp[i].sebagai,
                kategori: getApp[i].kategori,
                no_doc: no,
                struktur: getApp[i].struktur,
                id_role: findRole.find(item => item.name === getApp[i].jabatan).nomor
                // nama: cekApp ? getArea.fullname : null,
                // status: cekApp ? 1 : null
              }
              const make = await ttd.create(send)
              if (make) {
                hasil.push(make)
              }
            }
            if (hasil.length === getApp.length) {
              return response(res, 'success get template approve', { result: hasil })
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
  getDocumentIo: async (req, res) => {
    try {
      const { no } = req.body
      const result = await docUser.findAll({
        where: {
          [Op.and]: [
            { no_pengadaan: no },
            { jenis_form: 'pengadaan' }
          ]
        }
      })
      if (result.length > 0) {
        return response(res, 'success get document', { result })
      } else {
        const result = await pengadaan.findAll({
          where: {
            no_pengadaan: no
          }
        })
        if (result.length > 0) {
          const getDoc = await document.findAll({
            where: {
              tipe_dokumen: 'pengadaan',
              [Op.or]: [
                { jenis_dokumen: result[0].jenis },
                { jenis_dokumen: 'all' }
              ],
              tipe: result[0].tipe === 'gudang' ? 'gudang' : 'pengajuan'
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
                jenis_form: 'pengadaan'
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
        } else {
          return response(res, 'failed get data', {}, 404, false)
        }
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  getDocumentCart: async (req, res) => {
    try {
      const id = req.params.id
      // const fullname = req.user.fullname
      const result = await docUser.findAll({
        where: {
          [Op.and]: [
            { no_pengadaan: id },
            { jenis_form: 'pengadaan' }
          ]
        }
      })
      if (result.length > 0) {
        const cekIo = await pengadaan.findByPk(id)
        if (cekIo.status_form === null) {
          const getDoc = await document.findAll({
            where: {
              tipe_dokumen: 'pengadaan',
              [Op.or]: [
                { jenis_dokumen: cekIo.jenis === 'it' ? 'it' : 'all' },
                { jenis_dokumen: 'all' }
              ],
              [Op.or]: [
                { tipe: cekIo.tipe === 'gudang' ? 'gudang' : 'pengajuan' },
                { tipe: cekIo.akta === 'ada' ? 'akta' : null }
              ]
            }
          })
          // const findReference = await pengadaan.findOne({
          //   where: {
          //     no_pengadaan: cekIo.no_ref
          //   }
          // })
          if (getDoc.length > 0) {
            const cekDoc = []
            for (let i = 0; i < getDoc.length; i++) {
              // const condForm = getDoc[i].nama_dokumen === 'FORM IO FULL APPROVAL' && cekIo.kategori === 'return' && findReference
              const send = {
                nama_dokumen: getDoc[i].nama_dokumen,
                jenis_dokumen: getDoc[i].jenis_dokumen,
                divisi: getDoc[i].divisi,
                no_pengadaan: id,
                jenis_form: 'pengadaan'
                // path: condForm ? cekIo.no_ref : null,
                // desc: condForm ? 'FORM IO FULL APPROVAL' : null,
                // status_dokumen: condForm ? `upload by ${fullname} at ${moment().format('DD/MM/YYYY h:mm:ss a')};` : null
              }
              const validDoc = result.find(item => item.nama_dokumen === getDoc[i].nama_dokumen)
              const condIt = send.nama_dokumen === 'Form Request Infrastruktur (FRI)' && cekIo.jenis === 'non-it'
              const condReturn = send.nama_dokumen === 'FORM IO FULL APPROVAL' && cekIo.kategori !== 'return'
              if (validDoc !== undefined) {
                if (condIt || condReturn) {
                  const findId = await docUser.findByPk(validDoc.id)
                  await findId.destroy()
                  cekDoc.push(findId)
                } else {
                  cekDoc.push(send)
                }
              } else {
                if (condIt || condReturn) {
                  cekDoc.push(send)
                } else {
                  const make = await docUser.create(send)
                  if (make) {
                    cekDoc.push(make)
                  }
                }
              }
            }
            if (cekDoc.length > 0) {
              const findDoc = await docUser.findAll({
                where: {
                  [Op.and]: [
                    { no_pengadaan: id },
                    { jenis_form: 'pengadaan' }
                  ]
                }
              })
              if (findDoc.length > 0) {
                return response(res, 'success get document 4', { result: findDoc })
              } else {
                return response(res, 'success get document 3', { result })
              }
            } else {
              return response(res, 'success get document 2', { result })
            }
          }
        } else {
          return response(res, 'success get document 1', { result })
        }
      } else {
        const result = await pengadaan.findByPk(id)
        if (result) {
          const getDoc = await document.findAll({
            where: {
              tipe_dokumen: 'pengadaan',
              [Op.or]: [
                { jenis_dokumen: result.jenis === 'it' ? 'it' : 'all' },
                { jenis_dokumen: 'all' }
              ],
              [Op.or]: [
                { tipe: result.tipe === 'gudang' ? 'gudang' : 'pengajuan' },
                { tipe: result.akta === 'ada' ? 'akta' : null }
              ]
            }
          })
          // const findReference = await pengadaan.findOne({
          //   where: {
          //     no_pengadaan: result.no_ref
          //   }
          // })
          if (getDoc) {
            const hasil = []
            for (let i = 0; i < getDoc.length; i++) {
              // const condForm = getDoc[i].nama_dokumen === 'FORM IO FULL APPROVAL' && result.kategori === 'return' && findReference
              const send = {
                nama_dokumen: getDoc[i].nama_dokumen,
                jenis_dokumen: getDoc[i].jenis_dokumen,
                divisi: getDoc[i].divisi,
                no_pengadaan: id,
                jenis_form: 'pengadaan'
                // path: condForm ? result.no_ref : null,
                // desc: condForm ? 'FORM IO FULL APPROVAL' : null,
                // status_dokumen: condForm ? `upload by ${fullname} at ${moment().format('DD/MM/YYYY h:mm:ss a')};` : null
              }
              const condIt = send.nama_dokumen === 'Form Request Infrastruktur (FRI)' && result.jenis === 'non-it'
              const condReturn = send.nama_dokumen === 'FORM IO FULL APPROVAL' && result.kategori !== 'return'
              if (condIt || condReturn) {
                hasil.push(send)
              } else {
                const make = await docUser.create(send)
                if (make) {
                  hasil.push(make)
                }
              }
            }
            if (hasil.length === getDoc.length) {
              const result = await docUser.findAll({
                where: {
                  [Op.and]: [
                    { no_pengadaan: id },
                    { jenis_form: 'pengadaan' }
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
        } else {
          return response(res, 'failed get data', {}, 404, false)
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
            console.log(err.code === 'LIMIT_UNEXPECTED_FILE' && req.files.length > 0)
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
  approveIo: async (req, res) => {
    try {
      const level = req.user.level
      // const name = req.user.name
      const fullname = req.user.fullname
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
          let hasil = 0
          let arr = null
          // let position = ''
          for (let i = 0; i < find.length; i++) {
            if (result[0].name === find[i].jabatan) {
              hasil = find[i].id
              arr = i
              // position = find[i].jabatan
            }
          }
          if (hasil !== 0) {
            if (arr !== find.length - 1 && (find[arr + 1].status !== null || find[arr + 1].status === 1 || find[arr + 1].status === 0)) {
              return response(res, 'Anda tidak memiliki akses lagi untuk mengapprove', {}, 404, false)
            } else {
              if (arr === 0 || find[arr - 1].status === 1) {
                const dataTemp = await pengadaan.findOne({
                  where: {
                    no_pengadaan: no
                  }
                })
                if (dataTemp) {
                  const findDepo = await depo.findOne({
                    where: {
                      kode_plant: dataTemp.kode_plant
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
                          const findDoc = await pengadaan.findOne({
                            where: {
                              no_pengadaan: no
                            }
                          })
                          if (findDoc) {
                            const findRole = await role.findAll({
                              where: {
                                name: find[arr + 1].jabatan
                              }
                            })
                            if (findRole.length > 0) {
                              const findIo = await pengadaan.findAll({
                                where: {
                                  no_pengadaan: no
                                }
                              })
                              if (findIo.length > 0) {
                                const cek = []
                                for (let i = 0; i < findIo.length; i++) {
                                  const upData = {
                                    status_reject: null,
                                    isreject: null,
                                    history: `${findIo[i].history}, approved by ${fullname} at ${moment().format('DD/MM/YYYY h:mm:ss a')}`
                                  }
                                  const findId = await pengadaan.findByPk(findIo[i].id)
                                  if (findId) {
                                    await findId.update(upData)
                                    cek.push(findId)
                                  }
                                }
                                if (cek.length > 0) {
                                  return response(res, 'success approve pengajuan io')
                                } else {
                                  return response(res, 'berhasil approve, tidak berhasil kirim notif email 2')
                                }
                              } else {
                                return response(res, 'failed approve pengadaan', {}, 404, false)
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
                            const findDoc = await pengadaan.findAll({
                              where: {
                                no_pengadaan: no
                              }
                            })
                            if (findDoc.length > 0) {
                              const valid = []
                              for (let i = 0; i < findDoc.length; i++) {
                                const data = {
                                  status_form: 3,
                                  date_fullapp: moment(),
                                  status_reject: null,
                                  isreject: null,
                                  history: `${findDoc[i].history}, approved by ${fullname} at ${moment().format('DD/MM/YYYY h:mm:ss a')}`
                                }
                                const findAsset = await pengadaan.findByPk(findDoc[i].id)
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
                                  return response(res, 'success approve pengajuan io')
                                } else {
                                  return response(res, 'success approve pengadaan')
                                }
                              } else {
                                return response(res, 'success approve pengadaan')
                              }
                            } else {
                              return response(res, 'success approve pengadaan')
                            }
                          } else {
                            const findDoc = await pengadaan.findOne({
                              where: {
                                no_pengadaan: no
                              }
                            })
                            if (findDoc) {
                              const findRole = await role.findAll({
                                where: {
                                  name: find[arr + 1].jabatan
                                }
                              })
                              if (findRole.length > 0) {
                                const findIo = await pengadaan.findAll({
                                  where: {
                                    no_pengadaan: no
                                  }
                                })
                                if (findIo.length > 0) {
                                  const cek = []
                                  for (let i = 0; i < findIo.length; i++) {
                                    const upData = {
                                      status_reject: null,
                                      isreject: null,
                                      history: `${findIo[i].history}, approved by ${fullname} at ${moment().format('DD/MM/YYYY h:mm:ss a')}`
                                    }
                                    const findId = await pengadaan.findByPk(findIo[i].id)
                                    if (findId) {
                                      await findId.update(upData)
                                      cek.push(findId)
                                    }
                                  }
                                  if (cek.length > 0) {
                                    return response(res, 'success approve pengajuan io')
                                  } else {
                                    return response(res, 'berhasil approve, tidak berhasil kirim notif email 2')
                                  }
                                } else {
                                  return response(res, 'failed approve pengadaan', {}, 404, false)
                                }
                              }
                            }
                          }
                        }
                      } else {
                        return response(res, 'failed approve pengadaan', {}, 404, false)
                      }
                    } else {
                      return response(res, 'failed approve pengadaan', {}, 404, false)
                    }
                  } else {
                    return response(res, 'failed approve pengadaan', {}, 404, false)
                  }
                } else {
                  return response(res, 'failed approve pengadaan', {}, 404, false)
                }
              } else {
                return response(res, `${find[arr - 1].jabatan} belum approve atau telah mereject`, {}, 404, false)
              }
            }
          } else {
            return response(res, 'failed approve pengadaan', {}, 404, false)
          }
        } else {
          return response(res, 'failed approve pengadaan', {}, 404, false)
        }
      } else {
        return response(res, 'failed approve pengadaan', {}, 404, false)
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  approveAll: async (req, res) => {
    try {
      const kode = Object.values(req.body)
      const level = req.user.level
      const name = req.user.name
      const result = await role.findAll({
        where: {
          nomor: level
        }
      })
      if (result.length > 0) {
        const cekData = []
        for (let u = 0; u < kode.length; u++) {
          const no = kode[u]
          const find = await ttd.findAll({
            where: {
              no_doc: no
            }
          })
          if (find.length > 0) {
            let hasil = 0
            let arr = null
            // let position = ''
            for (let i = 0; i < find.length; i++) {
              if (result[0].name === find[i].jabatan) {
                hasil = find[i].id
                arr = i
              // position = find[i].jabatan
              }
            }
            if (hasil !== 0) {
              if (arr !== find.length - 1 && (find[arr + 1].status !== null || find[arr + 1].status === 1 || find[arr + 1].status === 0)) {
                cekData.push(`Anda tidak memiliki akses lagi untuk mengapprove pengadaan ${kode[u]}`)
              } else {
                if (arr === 0 || find[arr - 1].status === 1) {
                  const dataTemp = await pengadaan.findOne({
                    where: {
                      no_pengadaan: no
                    }
                  })
                  if (dataTemp) {
                    const findDepo = await depo.findOne({
                      where: {
                        kode_plant: dataTemp.kode_plant
                      }
                    })
                    if (level !== 5 || (level === 5 && findDepo)) {
                      const data = {
                        nama: level === 5 ? findDepo.nama_aos : name,
                        status: 1,
                        path: null
                      }
                      const findTtd = await ttd.findByPk(hasil)
                      if (findTtd) {
                        const sent = await findTtd.update(data)
                        if (sent) {
                          if (arr < 2) {
                            const findDoc = await pengadaan.findOne({
                              where: {
                                no_pengadaan: no
                              }
                            })
                            if (findDoc) {
                              const findRole = await role.findAll({
                                where: {
                                  name: find[arr + 1].jabatan
                                }
                              })
                              if (findRole.length > 0) {
                                const findIo = await pengadaan.findAll({
                                  where: {
                                    no_pengadaan: no
                                  }
                                })
                                if (findIo.length > 0) {
                                  const findUser = await user.findOne({
                                    where: {
                                      user_level: findRole[0].nomor
                                    }
                                  })
                                  if (findUser) {
                                    const findEmail = await email.findOne({
                                      where: {
                                        kode_plant: findIo[0].kode_plant
                                      }
                                    })
                                    if (findEmail) {
                                      let tableTd = ''
                                      for (let i = 0; i < findIo.length; i++) {
                                        if (findIo[i].isAsset === 'true') {
                                          const element = `
                                        <tr>
                                          <td>${findIo.indexOf(findIo[i]) + 1}</td>
                                          <td>${findIo[i].no_pengadaan}</td>
                                          <td>${findIo[i].nama}</td>
                                          <td>${findIo[i].price}</td>
                                          <td>${findIo[i].qty}</td>
                                          <td>${findIo[i].kode_plant}</td>
                                          <td>${findDepo === null || findDepo.cost_center === undefined || findDepo.cost_center === null ? '' : findDepo.cost_center}</td>
                                          <td>${findDepo === null || findDepo.nama_area === undefined || findDepo.nama_area === null ? '' : findDepo.nama_area}</td>
                                        </tr>`
                                          tableTd = tableTd + element
                                        }
                                      }
                                      const mailOptions = {
                                        from: 'noreply_asset@pinusmerahabadi.co.id',
                                        replyTo: 'noreply_asset@pinusmerahabadi.co.id',
                                        // to: `${level === 5 ? findEmail.email_area_om : findEmail.email_nom}`,
                                        to: `${emailAss}, ${emailAss2}`,
                                        subject: `Approve Pengajuan Pengadaan Asset ${findIo[0].no_pengadaan} `,
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
                                              <div>Mohon untuk approve form internal order pengajuan asset berikut ini.</div>
                                          </div>
                                          <div class="position">
                                              <table class="demo-table">
                                                  <thead>
                                                      <tr>
                                                          <th>No</th>
                                                          <th>No Pengadaan</th>
                                                          <th>Description</th>
                                                          <th>Price</th>
                                                          <th>Qty</th>
                                                          <th>Kode Plant</th>
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
                                        cekData.push('success')
                                      } else {
                                        cekData.push('success')
                                      }
                                    } else {
                                      cekData.push('success')
                                    }
                                  } else {
                                    cekData.push('success approve failed send email')
                                  }
                                } else {
                                  cekData.push('failed approve')
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
                              const findDoc = await pengadaan.findAll({
                                where: {
                                  no_pengadaan: no
                                }
                              })
                              if (findDoc.length > 0) {
                                const data = {
                                  status_form: 3
                                }
                                const valid = []
                                for (let i = 0; i < findDoc.length; i++) {
                                  const findAsset = await pengadaan.findByPk(findDoc[i].id)
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
                                    let tableTd = ''
                                    for (let i = 0; i < findDoc.length; i++) {
                                      if (findDoc[i].isAsset === 'true') {
                                        const element = `
                                      <tr>
                                        <td>${findDoc.indexOf(findDoc[i]) + 1}</td>
                                        <td>${findDoc[i].no_pengadaan}</td>
                                        <td>${findDoc[i].nama}</td>
                                        <td>${findDoc[i].price}</td>
                                        <td>${findDoc[i].qty}</td>
                                        <td>${findDoc[i].kode_plant}</td>
                                        <td>${findDepo === null || findDepo.cost_center === undefined || findDepo.cost_center === null ? '' : findDepo.cost_center}</td>
                                        <td>${findDepo === null || findDepo.nama_area === undefined || findDepo.nama_area === null ? '' : findDepo.nama_area}</td>
                                      </tr>`
                                        tableTd = tableTd + element
                                      }
                                    }
                                    const mailOptions = {
                                      from: 'noreply_asset@pinusmerahabadi.co.id',
                                      replyTo: 'noreply_asset@pinusmerahabadi.co.id',
                                      // to: `${findUser.email}`,
                                      to: `${emailAss}, ${emailAss2}`,
                                      subject: `Pengajuan Pengadaan Asset ${findDoc[0].no_pengadaan} `,
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
                                              Dear Bapak/Ibu Divisi Asset,
                                          </div>
                                          <div class="tittle mar1">
                                              <div>Mohon untuk isi nomor io pengajuan asset berikut ini.</div>
                                          </div>
                                          <div class="position">
                                              <table class="demo-table">
                                                  <thead>
                                                      <tr>
                                                          <th>No</th>
                                                          <th>No Pengadaan</th>
                                                          <th>Description</th>
                                                          <th>Price</th>
                                                          <th>Qty</th>
                                                          <th>Kode Plant</th>
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
                                      cekData.push('success')
                                    } else {
                                      cekData.push('success')
                                    }
                                  } else {
                                    cekData.push('success')
                                  }
                                } else {
                                  cekData.push('success')
                                }
                              } else {
                                cekData.push('success')
                              }
                            } else {
                              const findDoc = await pengadaan.findOne({
                                where: {
                                  no_pengadaan: no
                                }
                              })
                              if (findDoc) {
                                const findRole = await role.findAll({
                                  where: {
                                    name: find[arr + 1].jabatan
                                  }
                                })
                                if (findRole.length > 0) {
                                  const findIo = await pengadaan.findAll({
                                    where: {
                                      no_pengadaan: no
                                    }
                                  })
                                  if (findIo.length > 0) {
                                    const findUser = await user.findOne({
                                      where: {
                                        user_level: findRole[0].nomor
                                      }
                                    })
                                    if (findUser) {
                                      let tableTd = ''
                                      for (let i = 0; i < findIo.length; i++) {
                                        if (findIo[i].isAsset === 'true') {
                                          const element = `
                                        <tr>
                                          <td>${findIo.indexOf(findIo[i]) + 1}</td>
                                          <td>${findIo[i].no_pengadaan}</td>
                                          <td>${findIo[i].nama}</td>
                                          <td>${findIo[i].price}</td>
                                          <td>${findIo[i].qty}</td>
                                          <td>${findIo[i].kode_plant}</td>
                                          <td>${findDepo === null || findDepo.cost_center === undefined || findDepo.cost_center === null ? '' : findDepo.cost_center}</td>
                                          <td>${findDepo === null || findDepo.nama_area === undefined || findDepo.nama_area === null ? '' : findDepo.nama_area}</td>
                                        </tr>`
                                          tableTd = tableTd + element
                                        }
                                      }
                                      const mailOptions = {
                                        from: 'noreply_asset@pinusmerahabadi.co.id',
                                        replyTo: 'noreply_asset@pinusmerahabadi.co.id',
                                        // to: `${findUser.email}`,
                                        to: `${emailAss}, ${emailAss2}`,
                                        subject: `Approve Pengajuan Pengadaan Asset ${findIo[0].no_pengadaan} `,
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
                                              <div>Mohon untuk approve form internal order pengajuan asset berikut ini.</div>
                                          </div>
                                          <div class="position">
                                              <table class="demo-table">
                                                  <thead>
                                                      <tr>
                                                          <th>No</th>
                                                          <th>No Pengadaan</th>
                                                          <th>Description</th>
                                                          <th>Price</th>
                                                          <th>Qty</th>
                                                          <th>Kode Plant</th>
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
                                        cekData.push('success')
                                      } else {
                                        cekData.push('success')
                                      }
                                    } else {
                                      cekData.push('success approve failed send email')
                                    }
                                  } else {
                                    cekData.push('failed approve')
                                  }
                                }
                              }
                            }
                          }
                        } else {
                          cekData.push('failed approve')
                        }
                      } else {
                        cekData.push('failed approve')
                      }
                    } else {
                      cekData.push('failed approve')
                    }
                  } else {
                    cekData.push('failed approve')
                  }
                } else {
                  cekData.push(`${find[arr - 1].jabatan} belum approve atau telah mereject pengadaan ${kode[u]}`)
                }
              }
            } else {
              cekData.push('failed approve')
            }
          } else {
            cekData.push('failed approve')
          }
        }
        if (cekData.length > 0) {
          return response(res, 'success approve pengadaan', { data: cekData })
        } else {
          return response(res, 'failed approve pengadaan', {}, 404, false)
        }
      } else {
        return response(res, 'failed approve pengadaan', {}, 404, false)
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  rejectIo: async (req, res) => {
    try {
      const level = req.user.level
      const name = req.user.fullname
      // const { no } = req.body
      const schema = joi.object({
        alasan: joi.string().required(),
        no: joi.string().required(),
        menu: joi.string().required(),
        list: joi.array(),
        type: joi.string(),
        type_reject: joi.string()
      })
      const { value: results, error } = schema.validate(req.body)
      if (error) {
        return response(res, 'Error', { error: error.message }, 404, false)
      } else {
        const no = results.no
        const listId = results.list
        const histRev = `reject perbaikan by ${name} at ${moment().format('DD/MM/YYYY h:mm:ss a')}; reason: ${results.alasan.replace(/\,/g, ' ')}` //eslint-disable-line
        const histBatal = `reject pembatalan by ${name} at ${moment().format('DD/MM/YYYY h:mm:ss a')}; reason: ${results.alasan.replace(/\,/g, ' ')}` //eslint-disable-line
        const result = await role.findAll({
          where: {
            nomor: level
          }
        })
        if (result.length > 0) {
          const findDis = await pengadaan.findAll({
            where: {
              no_pengadaan: no
            }
          })
          if (findDis.length > 0) {
            if (results.type === 'verif') {
              const temp = []
              for (let i = 0; i < findDis.length; i++) {
                const send = {
                  status_form: results.type_reject === 'pembatalan' ? '0' : findDis[i].status_form,
                  status_reject: 1,
                  isreject: listId.find(e => e === findDis[i].id) ? 1 : null,
                  reason: results.alasan,
                  menu_rev: results.type_reject === 'pembatalan' ? null : results.menu,
                  user_reject: level,
                  history: `${findDis[i].history}, ${results.type_reject === 'pembatalan' ? histBatal : histRev}`
                }
                const findData = await pengadaan.findByPk(findDis[i].id)
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
                let hasil = 0
                let arr = null
                // let position = ''
                for (let i = 0; i < find.length; i++) {
                  if (result[0].name === find[i].jabatan) {
                    hasil = find[i].id
                    arr = i
                  // position = find[i].jabatan
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
                            const findDoc = await pengadaan.findOne({
                              where: {
                                no_pengadaan: no
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
                                const findIo = await pengadaan.findByPk(findDis[i].id)
                                const data = {
                                  status_form: results.type_reject === 'pembatalan' ? '0' : findDis[i].status_form,
                                  status_reject: 1,
                                  isreject: listId.find(e => e === findDis[i].id) ? 1 : null,
                                  reason: results.alasan,
                                  menu_rev: results.type_reject === 'pembatalan' ? null : results.menu,
                                  user_reject: findRole.nomor,
                                  history: `${findDis[i].history}, ${results.type_reject === 'pembatalan' ? histBatal : histRev}`
                                }
                                if (findIo) {
                                  const updateIo = await findIo.update(data)
                                  if (updateIo) {
                                    cek.push(1)
                                  }
                                }
                              }
                              if (cek.length > 0) {
                                return response(res, 'success reject pengadaan', { results })
                              } else {
                                return response(res, 'success reject pengadaan', { results })
                              }
                            }
                          }
                        } else {
                          return response(res, 'failed reject pengadaan', {}, 404, false)
                        }
                      } else {
                        return response(res, 'failed reject pengadaan', {}, 404, false)
                      }
                    } else {
                      return response(res, `${find[arr - 1].jabatan} belum approve atau telah mereject`, {}, 404, false)
                    }
                  }
                } else {
                  return response(res, 'failed reject pengadaan', {}, 404, false)
                }
              } else {
                return response(res, 'failed reject pengadaan', {}, 404, false)
              }
            }
          }
        } else {
          return response(res, 'failed reject pengadaan', {}, 404, false)
        }
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  rejectAll: async (req, res) => {
    try {
      const level = req.user.level
      const name = req.user.name
      const { no } = req.body
      const schema = joi.object({
        alasan: joi.string().required(),
        status: joi.number().required()
      })
      const { value: results, error } = schema.validate(req.body)
      if (error) {
        return response(res, 'Error', { error: error.message }, 404, false)
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
            // let position = ''
            for (let i = 0; i < find.length; i++) {
              if (result[0].name === find[i].jabatan) {
                hasil = find[i].id
                arr = i
                // position = find[i].jabatan
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
                    path: results.alasan
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
                      if (results) {
                        const findDoc = await pengadaan.findOne({
                          where: {
                            no_pengadaan: no
                          }
                        })
                        if (findDoc) {
                          const findRole = await role.findAll({
                            where: {
                              name: find[arr + 1].jabatan
                            }
                          })
                          if (findRole.length > 0) {
                            const findDis = await pengadaan.findAll({
                              where: {
                                no_pengadaan: no
                              }
                            })
                            if (findDis.length > 0) {
                              const findUser = await user.findOne({
                                where: {
                                  user_level: findRole[0].nomor
                                }
                              })
                              if (findUser) {
                                return response(res, 'success reject pengadaan')
                              } else {
                                return response(res, 'berhasil reject, tidak berhasil kirim notif email 2')
                              }
                            } else {
                              return response(res, 'failed reject pengadaan', {}, 404, false)
                            }
                          }
                        }
                      }
                    } else {
                      return response(res, 'failed reject pengadaan', {}, 404, false)
                    }
                  } else {
                    return response(res, 'failed reject pengadaan', {}, 404, false)
                  }
                } else {
                  return response(res, `${find[arr - 1].jabatan} belum approve atau telah mereject`, {}, 404, false)
                }
              }
            } else {
              return response(res, 'failed reject pengadaan', {}, 404, false)
            }
          } else {
            return response(res, 'failed reject pengadaan', {}, 404, false)
          }
        } else {
          return response(res, 'failed reject pengadaan', {}, 404, false)
        }
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  postApi: async (req, res) => {
    try {
      const data = req.body
      if (data.type === 'request') {
        const findCode = await pengadaan.findAll({
          where: {
            ticket_code: data.ticket_code
          }
        })
        if (findCode.length > 0) {
          const findTtd = await ttd.findAll({
            where: {
              no_doc: findCode[0].no_pengadaan
            }
          })
          const temp = findCode[0].status_form
          const status = temp === '0' ? 'Transaksi dibatalkan karena item tidak termasuk kategori aset' : temp === '1' ? 'Proses identifikasi barang oleh asset' : temp === '2' ? 'Proses approval' : temp === '3' ? 'Proses isi nomor io oleh budget' : temp === '9' ? 'Proses isi nomor asset oleh asset' : temp === '8' ? 'Selesai' : 'Pengajuan sedang diproses'
          const info = {
            kode_area: findCode[0].kode_plant,
            area: findCode[0].area,
            no_pengadaan: findCode[0].no_pengadaan,
            tanggal_pengajuan: findCode[0].createdAt
          }
          if (findTtd.length > 0) {
            return response(res, status, { result: { detailInfo: info, data: findCode, auth: findTtd } })
          } else {
            return response(res, status, { result: { detailInfo: info, findCode } })
          }
        } else {
          const findNo = await pengadaan.findAll({
            where: {
              [Op.not]: { no_pengadaan: null }
            },
            order: [['id', 'DESC']],
            limit: 50
          })
          if (findNo) {
            const findDepo = await depo.findOne({
              where: {
                kode_sap_1: data.prinfo.salespoint_code
              }
            })
            // const timeV1 = moment().startOf('month')
            // const timeV2 = moment().endOf('month').add(1, 'd')
            const kodeDepo = findDepo === null || findDepo.kode_plant === undefined || findDepo.kode_plant === null ? data.prinfo.salespoint_code : findDepo.kode_plant

            const findNo = await reservoir.findAll({
              where: {
                transaksi: 'pengadaan',
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
            const noIo = Math.max(...cekNo) + 1
            const change = noIo.toString().split('')
            const notrans = change.length === 2 ? '00' + noIo : change.length === 1 ? '000' + noIo : change.length === 3 ? '0' + noIo : noIo
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
            const noTrans = `${notrans}/${kodeDepo}/${findDepo === null || findDepo.nama_area === undefined || findDepo.nama_area === null ? data.prinfo.salespoint_code : `${findDepo.nama_area} ${findDepo.channel}`}/${rome}/${year}-IO`
            const valid = []
            for (let i = 0; i < data.pr_items.length; i++) {
              const dataSend = {
                nama: data.pr_items[i].name,
                qty: data.pr_items[i].qty,
                price: data.pr_items[i].price.replace(/[^a-z0-9-]/g, ''),
                uom: data.pr_items[i].uom,
                isAsset: data.pr_items[i].isAsset,
                setup_date: data.pr_items[i].setup_date,
                kode_plant: kodeDepo,
                isBudget: `${data.prinfo.isBudget}`,
                ticket_code: data.ticket_code,
                no_pengadaan: noTrans,
                kategori: data.prinfo.isBudget === true ? 'budget' : 'non-budget',
                asset_token: data.pr_items[i].asset_number_token,
                bidding_harga: data.pr_items[i].notes_bidding_harga,
                ket_barang: data.pr_items[i].notes_keterangan_barang,
                status_form: 1,
                history: `create ajuan from pods at ${moment().format('DD/MM/YYYY h:mm:ss a')}`,
                tglIo: moment(),
                area: findDepo === null || findDepo.nama_area === undefined || findDepo.nama_area === null ? data.prinfo.salespoint_code : `${findDepo.nama_area} ${findDepo.channel}`,
                alasan: data.pr_items[i].notes
              }
              const sent = await pengadaan.create(dataSend)
              if (sent) {
                valid.push(sent)
              }
            }
            if (valid.length > 0) {
              const creDataReser = {
                no_transaksi: noTrans,
                kode_plant: kodeDepo,
                transaksi: 'pengadaan',
                tipe: 'area',
                status: 'used',
                createdAt: moment()
              }
              const createRes = await reservoir.create(creDataReser)
              const cek = []
              for (let i = 0; i < data.attachments.length; i++) {
                const send = {
                  nama_dokumen: data.attachments[i].name,
                  desc: data.attachments[i].name,
                  jenis_dokumen: 'all',
                  divisi: 'asset',
                  no_pengadaan: noTrans,
                  path: data.attachments[i].url,
                  jenis_form: 'pengadaan',
                  status: 1
                }
                const sent = await docUser.create(send)
                if (sent) {
                  cek.push(sent)
                }
              }
              if (cek.length > 0 && createRes) {
                const getApp = await approve.findAll({
                  where: {
                    nama_approve: kodeDepo.split('').length === 4 ? 'pengadaan io' : 'pengadaan io HO',
                    jenis: 'all',
                    [Op.or]: [
                      { kategori: data.prinfo.isBudget === true ? 'budget' : 'non-budget' },
                      { kategori: 'all' }
                    ]
                  }
                })
                if (getApp) {
                  const hasil = []
                  for (let i = 0; i < getApp.length; i++) {
                    const send = {
                      jabatan: getApp[i].jabatan,
                      jenis: getApp[i].jenis,
                      sebagai: getApp[i].sebagai,
                      kategori: null,
                      no_doc: noTrans
                    }
                    const make = await ttd.create(send)
                    if (make) {
                      hasil.push(make)
                    }
                  }
                  if (hasil.length > 0) {
                    const findEmail = await user.findOne({
                      where: {
                        user_level: 2
                      }
                    })
                    if (findEmail) {
                      let tableTd = ''
                      const io = data.pr_items
                      for (let i = 0; i < io.length; i++) {
                        const element = `
                        <tr>
                          <td>${io.indexOf(io[i]) + 1}</td>
                          <td>${noTrans}</td>
                          <td>${io[i].name}</td>
                          <td>${io[i].price}</td>
                          <td>${io[i].qty}</td>
                          <td>${findDepo === null || findDepo.kode_plant === undefined || findDepo.kode_plant === null ? data.prinfo.salespoint_code : findDepo.kode_plant}</td>
                          <td>${findDepo === null || findDepo.cost_center === undefined || findDepo.cost_center === null ? data.prinfo.salespoint_code : findDepo.cost_center}</td>
                          <td>${findDepo === null || findDepo.nama_area === undefined || findDepo.nama_area === null ? data.prinfo.salespoint_code : findDepo.nama_area}</td>
                        </tr>`
                        tableTd = tableTd + element
                      }
                      const mailOptions = {
                        from: 'noreply_asset@pinusmerahabadi.co.id',
                        replyTo: 'noreply_asset@pinusmerahabadi.co.id',
                        // to: `${findEmail.email}`,
                        to: `${emailAss}, ${emailAss2}`,
                        subject: `Pengajuan Pengadaan Asset ${noTrans} `,
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
                                Dear Bapak/Ibu Divisi Asset,
                            </div>
                            <div class="tittle mar1">
                                <div>Mohon untuk identifikasi barang yang akan diajukan berikut ini.</div>
                            </div>
                            <div class="position">
                                <table class="demo-table">
                                    <thead>
                                        <tr>
                                            <th>No</th>
                                            <th>No Pengadaan</th>
                                            <th>Description</th>
                                            <th>Price</th>
                                            <th>Qty</th>
                                            <th>Kode Plant</th>
                                            <th>Cost Ctr</th>
                                            <th>Cost Ctr Name</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                      ${tableTd}
                                    </tbody>
                                </table>
                            </div>
                            <a href="https://aset.pinusmerahabadi.co.id/">Klik link berikut untuk akses web asset</a>
                            <div class="tittle foot">
                                Terima kasih,
                            </div>
                            <div class="tittle foot1">
                                Regards,
                            </div>
                            <div class="tittle">
                                Admin
                            </div>
                        </body>
                        `
                      }
                      const sendEmail = await wrapMail.wrapedSendMail(mailOptions)
                      if (sendEmail) {
                        return response(res, 'Berhasil melakukan pengajuan io', { result: data })
                      } else {
                        return response(res, 'Berhasil melakukan pengajuan io')
                      }
                    } else {
                      return response(res, 'Berhasil melakukan pengajuan io')
                    }
                    // const getTtd = await ttd.findAll({
                    //   where: {
                    //     no_doc: noTrans
                    //   }
                    // })
                    // if (getTtd.length > 0) {
                    //   const cekttd = []
                    //   const authors = data.authors
                    //   for (let i = 0; i < getTtd.length; i++) {
                    //     if (getTtd[i].jabatan === 'area') {
                    //       const name = authors.find(({ position }) => position === 'Area Operational Supervisor')
                    //       if (name === undefined) {
                    //         cekttd.push(1)
                    //       } else {
                    //         const data = {
                    //           nama: name.name,
                    //           status: 1
                    //         }
                    //         const findTtd = await ttd.findByPk(getTtd[i].id)
                    //         if (findTtd) {
                    //           await findTtd.update(data)
                    //           cekttd.push(1)
                    //         }
                    //       }
                    //     } else if (getTtd[i].jabatan === 'NOM') {
                    //       const name = authors.find(({ position }) => position === 'National Operation Manager')
                    //       if (name === undefined) {
                    //         cekttd.push(1)
                    //       } else {
                    //         const data = {
                    //           nama: name.name,
                    //           status: 1
                    //         }
                    //         const findTtd = await ttd.findByPk(getTtd[i].id)
                    //         if (findTtd) {
                    //           await findTtd.update(data)
                    //           cekttd.push(1)
                    //         }
                    //       }
                    //     } else if (getTtd[i].jabatan === 'HEAD OF OPS') {
                    //       const name = authors.find(({ position }) => position === 'Deputy Head Operation')
                    //       if (name === undefined) {
                    //         cekttd.push(1)
                    //       } else {
                    //         const data = {
                    //           nama: name.name,
                    //           status: 1
                    //         }
                    //         const findTtd = await ttd.findByPk(getTtd[i].id)
                    //         if (findTtd) {
                    //           await findTtd.update(data)
                    //           cekttd.push(1)
                    //         }
                    //       }
                    //     } else if (getTtd[i].jabatan === 'NFAM') {
                    //       const name = authors.find(({ position }) => position === 'National Finance Accounting Manager')
                    //       if (name === undefined) {
                    //         cekttd.push(1)
                    //       } else {
                    //         const data = {
                    //           nama: name.name,
                    //           status: 1
                    //         }
                    //         const findTtd = await ttd.findByPk(getTtd[i].id)
                    //         if (findTtd) {
                    //           await findTtd.update(data)
                    //           cekttd.push(1)
                    //         }
                    //       }
                    //     }
                    //   }
                    //   if (cekttd.length > 0) {
                    //     return response(res, 'berhasil melakukan pengajuan io', { result: data })
                    //   } else {
                    //     return response(res, 'berhasil melakukan pengajuan io', { result: data })
                    //   }
                    // } else {
                    //   return response(res, 'berhasil melakukan pengajuan io', { result: data })
                    // }
                  } else {
                    return response(res, 'berhasil melakukan pengajuan io', { result: data })
                  }
                } else {
                  return response(res, 'berhasil melakukan pengajuan io', { result: data })
                }
              } else {
                return response(res, 'berhasil melakukan pengajuan io', { result: data })
              }
            } else {
              return response(res, 'berhasil melakukan pengajuan io', { result: data })
            }
          } else {
            return response(res, 'failed create data pengadaan')
          }
        }
      } else {
        const findCode = await pengadaan.findAll({
          where: {
            ticket_code: data.ticket_code
          }
        })
        if (findCode.length > 0) {
          const findTtd = await ttd.findAll({
            where: {
              no_doc: findCode[0].no_pengadaan
            }
          })
          const temp = findCode[0].status_form
          const status = temp === '0' ? 'Transaksi dibatalkan karena item tidak termasuk kategori aset' : temp === '1' ? 'Proses identifikasi barang oleh asset' : temp === '2' ? 'Proses approval' : temp === '3' ? 'Proses isi nomor io oleh budget' : temp === '9' ? 'Proses isi nomor asset oleh asset' : temp === '8' ? 'Selesai' : 'Pengajuan sedang diproses'
          const info = {
            kode_area: findCode[0].kode_plant,
            area: findCode[0].area,
            no_pengadaan: findCode[0].no_pengadaan,
            tanggal_pengajuan: findCode[0].createdAt
          }
          if (findTtd.length > 0) {
            return response(res, status, { result: { detailInfo: info, data: findCode, auth: findTtd } })
          } else {
            return response(res, status, { result: { detailInfo: info, findCode } })
          }
        } else {
          return response(res, 'Data tidak ditemukan', {}, 404, false)
        }
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  cekApi: async (req, res) => {
    try {
      const { ticket_code } = req.query // eslint-disable-line
      const findCode = await pengadaan.findOne({
        where: {
          ticket_code: ticket_code
        }
      })
      if (findCode) {
        return response(res, 'Pengajuan sedang diproses', { result: findCode })
      } else {
        return response(res, '')
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  getDetail: async (req, res) => {
    // try {
    const { no } = req.body
    const result = await pengadaan.findAll({
      where: {
        no_pengadaan: no
      },
      order: [
        ['id', 'DESC'],
        [{ model: ttd, as: 'appForm' }, 'id', 'DESC']
      ],
      include: [
        {
          model: depo,
          as: 'depo'
        },
        {
          as: 'appForm',
          model: ttd
        }
      ]
    })
    if (result.length > 0) {
      return response(res, 'success get detail', { result })
    } else {
      return response(res, 'failed get detail', {}, 404, false)
    }
    // } catch (error) {
    //   return response(res, error.message, {}, 500, false)
    // }
  },
  getTempAsset: async (req, res) => {
    try {
      const { no } = req.body
      const findTemp = await assettemp.findAll({
        where: {
          no_pengadaan: no
        }
      })
      if (findTemp.length > 0) {
        return response(res, 'success get detail1', { result: findTemp })
      } else {
        const result = await pengadaan.findAll({
          where: {
            no_pengadaan: no
          }
        })
        if (result.length > 0) {
          const cek = []
          for (let i = 0; i < result.length; i++) {
            if (result[i].isAsset === 'true') {
              for (let j = 0; j < parseInt(result[i].qty); j++) {
                const data = {
                  no_io: result[i].no_io,
                  no_asset: result[i].no_asset,
                  qty: 1,
                  kode_plant: result[i].kode_plant,
                  no_pengadaan: result[i].no_pengadaan,
                  nama: result[i].nama,
                  price: result[i].price.replace(/[^a-z0-9-]/g, ''),
                  idIo: result[i].id
                }
                const send = await assettemp.create(data)
                if (send) {
                  cek.push(send)
                }
              }
            }
          }
          if (cek.length > 0) {
            const findAsset = await assettemp.findAll({
              where: {
                no_pengadaan: no
              }
            })
            if (findAsset.length > 0) {
              return response(res, 'success get detail2', { result: findAsset, temp: result })
            } else {
              return response(res, 'failed get detail', {}, 404, false)
            }
          } else {
            return response(res, 'failed get detail', {}, 404, false)
          }
        } else {
          return response(res, 'failed get detail', {}, 404, false)
        }
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  tesEmail: async (req, res) => {
    try {
      const valid = []
      const data = ['fahmiismail0202@gmail.com', 'insfopma@gmail.com']
      for (let i = 0; i < data.length; i++) {
        const ccIt = ['fahmiazis797@gmail.com']
        const mailOptions = {
          from: 'noreply_asset@pinusmerahabadi.co.id',
          replyTo: 'noreply_asset@pinusmerahabadi.co.id',
          to: `${data[i]}`,
          cc: `${ccIt}`,
          subject: 'DISPOSAL ASSET TES EMAIL',
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
          valid.push('success kirim')
        } else {
          valid.push('berhasil kirim, tidak berhasil kirim notif email 1')
        }
      }
      if (valid.length === data.length) {
        return response(res, 'success send email')
      } else {
        return response(res, 'failed send email')
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  updateDataIo: async (req, res) => {
    try {
      const id = req.params.id
      const schema = joi.object({
        isAsset: joi.string().required(),
        jenis: joi.string().allow('')
      })
      const { value: results, error } = schema.validate(req.body)
      if (error) {
        return response(res, 'Error', { error: error.message }, 404, false)
      } else {
        const findData = await pengadaan.findByPk(id)
        if (findData) {
          const updateData = await findData.update(results)
          if (updateData) {
            return response(res, 'success update isAsset', { updateData })
          } else {
            return response(res, 'failed update isAsset', {}, 404, false)
          }
        } else {
          return response(res, 'failed update isAsset', {}, 404, false)
        }
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  submitIsAsset: async (req, res) => {
    try {
      const { no } = req.body
      const name = req.user.fullname
      const findIo = await pengadaan.findAll({
        where: {
          no_pengadaan: no
        }
      })
      if (findIo.length > 0) {
        const cek = []
        for (let i = 0; i < findIo.length; i++) {
          const findData = await pengadaan.findByPk(findIo[i].id)
          const data = {
            // status_form: findData.kategori === 'return' ? 4 : 2,
            status_form: 2,
            status_reject: null,
            isreject: null,
            date_ident_asset: moment(),
            history: `${findIo[i].history}, verifikasi aset by ${name} at ${moment().format('DD/MM/YYYY h:mm:ss a')}`
          }
          if (findData) {
            if (findData.isAsset === 'false') {
              await findData.destroy()
              cek.push(1)
            } else {
              await findData.update(data)
              cek.push(1)
            }
          }
        }
        if (cek.length > 0) {
          const findDepo = await depo.findOne({
            where: {
              kode_plant: findIo[0].kode_plant
            }
          })
          if (findDepo) {
            const findEmail = await email.findOne({
              where: {
                kode_plant: findIo[0].kode_plant
              }
            })
            if (findEmail) {
              return response(res, 'success submit pengajuan io')
            } else {
              return response(res, 'success submit pengajuan io')
            }
          } else {
            return response(res, 'success submit pengajuan io')
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
  updateNoIo: async (req, res) => {
    try {
      const schema = joi.object({
        no_io: joi.string().required(),
        no: joi.string().required()
      })
      const { value: results, error } = schema.validate(req.body)
      if (error) {
        return response(res, 'Error', { error: error.message }, 404, false)
      } else {
        const findIo = await pengadaan.findAll({
          where: {
            no_pengadaan: results.no
          }
        })
        if (findIo.length > 0) {
          const cek = []
          for (let i = 0; i < findIo.length; i++) {
            const findData = await pengadaan.findByPk(findIo[i].id)
            if (findData) {
              const data = {
                no_io: results.no_io
              }
              await findData.update(data)
              cek.push(1)
            }
          }
          if (cek.length > 0) {
            return response(res, 'success update')
          } else {
            return response(res, 'failed update', {}, 404, false)
          }
        } else {
          return response(res, 'failed update', {}, 404, false)
        }
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  updateNoAsset: async (req, res) => {
    try {
      const id = req.params.id
      const schema = joi.object({
        no_asset: joi.string().required()
      })
      const { value: results, error } = schema.validate(req.body)
      if (error) {
        return response(res, 'Error', { error: error.message }, 404, false)
      } else {
        const findIo = await pengadaan.findByPk(id)
        if (findIo) {
          const updateAsset = await findIo.update(results)
          if (updateAsset) {
            return response(res, 'success update')
          } else {
            return response(res, 'failed update', {}, 404, false)
          }
        } else {
          return response(res, 'failed update', {}, 404, false)
        }
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  updateTemp: async (req, res) => {
    try {
      const id = req.params.id
      const schema = joi.object({
        no_asset: joi.string().required()
      })
      const { value: results, error } = schema.validate(req.body)
      if (error) {
        return response(res, 'Error', { error: error.message }, 404, false)
      } else {
        const findIo = await assettemp.findByPk(id)
        if (findIo) {
          const updateAsset = await findIo.update(results)
          if (updateAsset) {
            const findTemp = await assettemp.findAll({
              where: {
                idIo: findIo.idIo
              }
            })
            if (findTemp.length > 0) {
              const cek = []
              let data = ''
              for (let i = 0; i < findTemp.length; i++) {
                if (findTemp[i].no_pengadaan !== null) {
                  data += i === findTemp.length - 1 ? findTemp[i].no_asset : `${findTemp[i].no_asset},`
                  cek.push(1)
                }
              }
              if (cek.length === findTemp.length) {
                const findAsset = await pengadaan.findByPk(findIo.idIo)
                if (findAsset) {
                  const send = {
                    no_asset: data
                  }
                  const updateTemp = await findAsset.update(send)
                  if (updateTemp) {
                    return response(res, 'success update 3', { findTemp, cek, data })
                  } else {
                    return response(res, 'success update 2', { findTemp, cek, data })
                  }
                } else {
                  return response(res, 'success update 1', { findTemp, cek, data })
                }
              } else {
                return response(res, 'success update', { findTemp, cek, data })
              }
            } else {
              return response(res, 'success update', { findTemp })
            }
          } else {
            return response(res, 'failed update', {}, 404, false)
          }
        } else {
          return response(res, 'failed update', {}, 404, false)
        }
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  updateReason: async (req, res) => {
    try {
      const schema = joi.object({
        alasan: joi.string().required(),
        no: joi.string().required()
      })
      const { value: results, error } = schema.validate(req.body)
      if (error) {
        return response(res, 'Error', { error: error.message }, 404, false)
      } else {
        const findIo = await pengadaan.findAll({
          where: {
            no_pengadaan: results.no
          }
        })
        if (findIo.length > 0) {
          const cek = []
          for (let i = 0; i < findIo.length; i++) {
            const findItem = await pengadaan.findByPk(findIo[i].id)
            if (findItem) {
              const data = {
                alasan: results.alasan
              }
              const updateAsset = await findItem.update(data)
              if (updateAsset) {
                cek.push(findItem)
              }
            }
          }
          if (cek.length > 0) {
            return response(res, 'success update', {})
          } else {
            return response(res, 'failed update', {}, 404, false)
          }
        } else {
          return response(res, 'failed update', {}, 404, false)
        }
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  submitBudget: async (req, res) => {
    try {
      const { no } = req.body
      const name = req.user.fullname
      const findIo = await pengadaan.findAll({
        where: {
          no_pengadaan: no
        }
      })
      if (findIo.length > 0) {
        const cek = []
        for (let i = 0; i < findIo.length; i++) {
          const findData = await pengadaan.findByPk(findIo[i].id)
          const data = {
            status_form: 9,
            date_budget: moment(),
            history: `${findIo[i].history}, verifikasi budget by ${name} at ${moment().format('DD/MM/YYYY h:mm:ss a')}`
          }
          if (findData) {
            await findData.update(data)
            cek.push(1)
          }
        }
        if (cek.length > 0) {
          const findDepo = await depo.findOne({
            where: {
              kode_plant: findIo[0].kode_plant
            }
          })
          if (findDepo) {
            const findEmail = await user.findOne({
              where: {
                user_level: 2
              }
            })
            if (findEmail) {
              return response(res, 'success submit pengajuan io')
            } else {
              return response(res, 'success submit pengajuan io')
            }
          } else {
            return response(res, 'success submit pengajuan io')
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
  submitEks: async (req, res) => {
    try {
      const { no } = req.body
      const name = req.user.fullname
      const findIo = await pengadaan.findAll({
        where: {
          no_pengadaan: no
        }
      })
      if (findIo.length > 0) {
        const cek = []
        for (let i = 0; i < findIo.length; i++) {
          const findData = await pengadaan.findByPk(findIo[i].id)
          const data = {
            status_form: 8,
            status_reject: null,
            date_eksekusi: moment(),
            isreject: null,
            history: `${findIo[i].history}, eksekusi pengadaan aset by ${name} at ${moment().format('DD/MM/YYYY h:mm:ss a')}`
          }
          if (findData) {
            await findData.update(data)
            cek.push(1)
            if (findData.kategori === 'return') {
              const findAsset = await asset.findOne({
                where: {
                  no_asset: findData.no_ref
                }
              })
              if (findAsset) {
                const send = {
                  status: '0'
                }
                await findAsset.update(send)
              }
            } else {
              const findTemp = await assettemp.findAll({
                where: {
                  no_pengadaan: no
                }
              })
              const findDepo = await depo.findOne({
                where: {
                  kode_plant: findIo[i].kode_plant
                }
              })
              for (let x = 0; x < findTemp.length; x++) {
                const findId = await asset.findOne({
                  where: {
                    no_asset: findTemp[x].no_asset
                  }
                })
                const data = {
                  no_asset: findTemp[x].no_asset,
                  tanggal: moment(),
                  nama_asset: findTemp[x].nama,
                  nilai_acquis: findTemp[x].price,
                  accum_dep: findTemp[x].price,
                  nilai_buku: findTemp[x].price,
                  kode_plant: findTemp[x].kode_plant,
                  cost_center: findDepo.cost_center,
                  area: findDepo.nama_area,
                  merk: '',
                  satuan: 'unit',
                  unit: 1,
                  lokasi: '',
                  kategori: findIo[i].jenis,
                  status: '100'
                }
                if (!findId) {
                  await asset.create(data)
                }
              }
            }
          }
        }
        if (cek.length > 0) {
          return response(res, 'success submit pengajuan io')
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
  submitRevisi: async (req, res) => {
    try {
      const { no } = req.body
      const name = req.user.fullname
      const findIo = await pengadaan.findAll({
        where: {
          no_pengadaan: no
        }
      })
      if (findIo.length > 0) {
        if (findIo[0].status_form === '2') {
          const findSign = await ttd.findAll({
            where: {
              no_doc: no
            }
          })
          if (findSign.length > 0) {
            const cekSign = []
            for (let i = 0; i < findSign.length; i++) {
              if (findSign[i].sebagai === 'pembuat' || findSign[i].jabatan === 'area' || findSign[i].jabatan === 'aos') {
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
              for (let i = 0; i < findIo.length; i++) {
                const findData = await pengadaan.findByPk(findIo[i].id)
                const data = {
                  status_reject: 0,
                  isreject: null,
                  history: `${findIo[i].history}, submit revisi by ${name} at ${moment().format('DD/MM/YYYY h:mm:ss a')}`
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
          for (let i = 0; i < findIo.length; i++) {
            const findData = await pengadaan.findByPk(findIo[i].id)
            const data = {
              status_reject: 0,
              isreject: null,
              history: `${findIo[i].history}, submit revisi by ${name} at ${moment().format('DD/MM/YYYY h:mm:ss a')}`
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
  appRevisi: async (req, res) => {
    try {
      const id = req.params.id
      const findIo = await pengadaan.findByPk(id)
      if (findIo) {
        const data = {
          isreject: 0
        }
        const updateIo = await findIo.update(data)
        if (updateIo) {
          return response(res, 'success submit pengajuan io')
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
  uploadMasterTemp: async (req, res) => {
    uploadMaster(req, res, async function (err) {
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
        const dokumen = `assets/masters/${req.files[0].filename}`
        const rows = await readXlsxFile(dokumen)
        const count = []
        const cek = ['NO', 'No Pengadaan', 'Description', 'Price/unit', 'Total Amount', 'No Asset', 'ID Asset']
        const valid = rows[0]
        for (let i = 0; i < cek.length; i++) {
          if (valid[i] === cek[i]) {
            count.push(1)
          }
        }
        if (count.length === cek.length) {
          const arr = []
          const cek = []
          rows.shift()
          for (let i = 0; i < rows.length; i++) {
            const data = rows[i]
            const findTemp = await assettemp.findByPk(data[6])
            if (findTemp && findTemp.nama === data[2] && findTemp.no_pengadaan === data[1]) {
              const noAsset = data[5]
              const dataNominal = (noAsset.toString().split('').filter((item) => isNaN(parseFloat(item))).length > 0)
                ? { mess: `Pastikan No Aset Diisi dengan Sesuai Pada Data Baris ${[i + 1]}` }
                : null
              if (dataNominal !== null) {
                cek.push(dataNominal)
              } else {
                const send = {
                  no_asset: noAsset
                }
                const updateAsset = await findTemp.update(send)
                if (updateAsset) {
                  arr.push(1)
                }
              }
            } else {
              cek.push({ mess: `No Pengadaan Tidak Sesuai Dengan ID Data Yang Dilampirkan Pada Baris ${[i + 1]}` })
            }
          }
          if (cek.length === 0) {
            fs.unlink(dokumen, function (err) {
              if (err) {
                return response(res, 'success upload asset balance', { rows, err })
              } else {
                return response(res, 'success upload asset balance', { rows })
              }
            })
          } else {
            fs.unlink(dokumen, function (err) {
              if (err) {
                return response(res, 'failed upload asset balance', { result: cek, err }, 400, false)
              } else {
                return response(res, 'failed upload asset balance', { result: cek }, 400, false)
              }
            })
          }
        } else {
          fs.unlink(dokumen, function (err) {
            if (err) {
              return response(res, 'Failed upload', { result: [{ mess: 'Gunakan Template Upload Yang Sudah Disediakan' }], err }, 400, false)
            } else {
              return response(res, 'Failed upload', { result: [{ mess: 'Gunakan Template Upload Yang Sudah Disediakan' }] }, 400, false)
            }
          })
        }
      } catch (error) {
        return response(res, error.message, {}, 500, false)
      }
    })
  },
  deleteTransaksi: async (req, res) => {
    try {
      const { no } = req.body
      const findIo = await pengadaan.findAll({
        where: {
          no_pengadaan: no
        }
      })
      if (findIo) {
        const findDoc = await docUser.findAll({
          where: {
            no_pengadaan: no
          }
        })
        if (findDoc) {
          const findTtd = await ttd.findAll({
            where: {
              [Op.or]: [
                { no_doc: no },
                { no_pengadaan: no }
              ]
            }
          })
          if (findTtd) {
            const cekIo = []
            for (let i = 0; i < findIo.length; i++) {
              const result = await pengadaan.findByPk(findIo[i].id)
              if (result) {
                await result.destroy()
                cekIo.push(1)
              }
            }
            if (cekIo) {
              const cekDoc = []
              for (let i = 0; i < findDoc.length; i++) {
                const result = await docUser.findByPk(findDoc[i].id)
                if (result) {
                  await result.destroy()
                  cekDoc.push(1)
                }
              }
              if (cekDoc) {
                const cekTtd = []
                for (let i = 0; i < findTtd.length; i++) {
                  const result = await ttd.findByPk(findTtd[i].id)
                  if (result) {
                    await result.destroy()
                    cekTtd.push(1)
                  }
                }
                if (cekTtd) {
                  return response(res, 'success delete transaksi', { data: findIo, dok: findDoc, appr: findTtd })
                } else {
                  return response(res, 'get data transaksi3', { data: findIo, dok: findDoc, appr: findTtd })
                }
              } else {
                return response(res, 'get data transaksi2', { data: findIo, dok: findDoc, appr: findTtd })
              }
            } else {
              return response(res, 'get data transaksi1', { data: findIo, dok: findDoc, appr: findTtd })
            }
          } else {
            return response(res, 'approval transaksi tidak ditemukan', {}, 400, false)
          }
        } else {
          return response(res, 'Dokumen transaksi tidak ditemukan', {}, 400, false)
        }
      } else {
        return response(res, 'Transaksi tidak ditemukan', {}, 400, false)
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  getReport: async (req, res) => {
    try {
      const level = req.user.level
      if (level === 2) {
        const result = await pengadaan.findAll({
          where: {
            status_form: 8
          },
          include: [
            {
              model: depo,
              as: 'depo'
            }
          ],
          group: ['no_pengadaan']
        })
        if (result.length > 0) {
          return response(res, 'success get', { result })
        } else {
          return response(res, 'failed get data', {}, 404, false)
        }
      } else {
        return response(res, 'success get', { result: [] })
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  submitNotAsset: async (req, res) => {
    try {
      const { no } = req.body
      const name = req.user.fullname
      const findIo = await pengadaan.findAll({
        where: {
          no_pengadaan: no
        }
      })
      if (findIo.length > 0) {
        const cek = []
        for (let i = 0; i < findIo.length; i++) {
          const findData = await pengadaan.findByPk(findIo[i].id)
          const data = {
            status_form: '0',
            date_ident_asset: moment(),
            history: `${findIo[i].history}, verifikasi aset by ${name} at ${moment().format('DD/MM/YYYY h:mm:ss a')}`
          }
          if (findData) {
            await findData.update(data)
            cek.push(1)
          }
        }
        if (cek.length > 0) {
          const findDepo = await depo.findOne({
            where: {
              kode_plant: findIo[0].kode_plant
            }
          })
          if (findDepo) {
            const findEmail = await email.findOne({
              where: {
                kode_plant: findIo[0].kode_plant
              }
            })
            if (findEmail) {
              return response(res, 'success submit pengajuan io')
            } else {
              return response(res, 'success submit pengajuan io')
            }
          } else {
            return response(res, 'success submit pengajuan io')
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
  podsSend: async (req, res) => {
    try {
      const { no } = req.body
      const result = await pengadaan.findAll({
        where: {
          no_pengadaan: no
        }
      })
      if (result.length > 0) {
        if (result[0].asset_token === null) {
          return response(res, 'bukan ajuan pods', { result })
        } else {
          const data = []
          for (let i = 0; i < result.length; i++) {
            const temp = {
              name: result[i].nama,
              qty: result[i].qty,
              price: result[i].price.replace(/[^a-z0-9-]/g, ''),
              isAsset: result[i].isAsset === 'true' ? 1 : 0,
              ticket_code: result[i].ticket_code,
              asset_number_token: result[i].asset_token,
              no_io: result[i].no_io,
              no_asset: result[i].no_asset,
              area: result[i].area,
              kode_plant: result[i].kode_plant
            }
            data.push(temp)
          }
          if (data.length > 0) {
            const findTtd = await ttd.findAll({
              where: {
                [Op.or]: [
                  { no_doc: no },
                  { no_pengadaan: no }
                ]
              }
            })
            if (findTtd.length > 0) {
              const authors = []
              for (let i = 0; i < findTtd.length; i++) {
                const temp = {
                  name: findTtd[i].nama,
                  as: findTtd[i].sebagai === 'pembuat' ? 'Dibuat Oleh' : findTtd[i].sebagai === 'pemeriksa' ? 'Diperiksa Oleh' : findTtd[i].sebagai === 'penyetuju' && 'Disetujui Oleh',
                  position: findTtd[i].jabatan,
                  approval_datetime: findTtd[i].updatedAt
                }
                authors.push(temp)
              }
              const send = await axios({
                method: 'post',
                url: 'https://devpods.pinusmerahabadi.co.id/api/updateassetnumber',
                data: { data, authors },
                headers: { Authorization: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.c_G5Y7CbEKR4UncCqxLmGHtkcZDtibjh2XP_M7fTbAE' }
              }).then(response => { console.log(response); return (response) }).catch(err => { console.log(err); return (err) })
              if (send.status === 200) {
                return response(res, send.message, { result: send.data })
              } else {
                return response(res, 'gagal kirim ke pods', { send }, 400, false)
              }
            } else {
              return response(res, 'failed send api', {}, 400, false)
            }
          } else {
            return response(res, 'failed send api', {}, 400, false)
          }
        }
      } else {
        return response(res, 'failed send api', {}, 400, false)
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  podsReceive: async (req, res) => {
    try {
      const data = req.body
      return response(res, 'success', { data })
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  tesApiPods: async (req, res) => {
    try {
      const send = await axios({
        method: 'post',
        url: 'https://devpods.pinusmerahabadi.co.id/api/testapi',
        headers: { Authorization: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.c_G5Y7CbEKR4UncCqxLmGHtkcZDtibjh2XP_M7fTbAE' }
      }).then(response => { return (response) }).catch(err => { return (err.isAxiosError) })
      if (send.status === 200) {
        return response(res, 'Success connect to pods', { result: send.data })
      } else {
        return response(res, 'Failed connect to pods', {}, 400, false)
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  removeSpar: async (req, res) => {
    try {
      const findAll = await pengadaan.findAll()
      if (findAll.length) {
        const cek = []
        for (let i = 0; i < findAll.length; i++) {
          const data = {
            price: findAll[i].price.replace(/[^a-z0-9-]/g, '')
          }
          const findId = await pengadaan.findByPk(findAll[i].id)
          if (findId) {
            await findId.update(data)
            cek.push(findId)
          }
        }
        if (cek.length > 0) {
          return response(res, 'succes remove sparator', {})
        } else {
          return response(res, 'Failed remove sparator', {}, 400, false)
        }
      } else {
        return response(res, 'Failed get pengadaan', {}, 400, false)
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  removeUnderline: async (req, res) => {
    try {
      const findIo = await pengadaan.findAll({
        where: {
          [Op.not]: {
            no_ref: null
          }
        }
      })
      if (findIo.length > 0) {
        const cek = []
        for (let i = 0; i < findIo.length; i++) {
          const noRef = findIo[i].no_ref
          const data = {
            no_ref: noRef === '' ? noRef : noRef.replace(/_/g, '/')
          }
          const findId = await pengadaan.findByPk(findIo[i].id)
          if (findId) {
            await findId.update(data)
            cek.push(findId)
          }
        }
        if (cek.length > 0) {
          return response(res, 'success remove underscore king', { findIo })
        } else {
          return response(res, 'data return not found', { findIo })
        }
      } else {
        return response(res, 'data return not found', { findIo })
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  }
}
