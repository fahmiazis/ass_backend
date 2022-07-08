const { email, approve, ttd, depo, pengadaan, document, docUser, role, user, assettemp } = require('../models')
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

const emailAss = 'pmaho_asset1@pinusmerahabadi.co.id'
const emailAss2 = 'neng_rina@pinusmerahabadi.co.id'

module.exports = {
  home: async (req, res) => {
    try {
      const level = req.user.level
      const kode = req.user.kode
      const name = req.user.name
      const fullname = req.user.fullname
      const { status } = req.query
      if (level === 5 || level === 9) {
        const result = await pengadaan.findAll({
          where: {
            kode_plant: level === 5 ? kode : name,
            status_form: { [Op.like]: `%${status}%` },
            status_app: null
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
              { nama_bm: level === 12 ? fullname : null },
              { nama_om: level === 7 ? fullname : null },
              { nama_nom: level === 28 ? fullname : null }
            ]
          }
        })
        if (findDepo.length > 0) {
          const hasil = []
          for (let i = 0; i < findDepo.length; i++) {
            const result = await pengadaan.findAll({
              where: {
                status_form: { [Op.like]: `%${status}%` },
                status_app: null,
                kode_plant: findDepo[i].kode_plant
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
            status_form: { [Op.like]: `%${status}%` },
            status_app: null
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
              { nama_bm: level === 12 ? fullname : null },
              { nama_om: level === 7 ? fullname : null },
              { nama_nom: level === 28 ? fullname : null }
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
      const name = req.user.name
      const fullname = req.user.fullname
      const { status } = req.query
      if (level === 5) {
        const result = await pengadaan.findAll({
          where: {
            kode_plant: kode,
            status_form: { [Op.like]: `%${status}%` },
            status_app: { [Op.not]: null }
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
      } else if (level === 9) {
        const result = await pengadaan.findAll({
          where: {
            kode_plant: name,
            status_form: { [Op.like]: `%${status}%` },
            status_app: { [Op.not]: null }
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
              { nama_bm: level === 7 ? null : fullname },
              { nama_om: level === 12 ? null : fullname },
              { nama_nom: level === 12 ? null : fullname }
            ]
          }
        })
        if (findDepo.length > 0) {
          const hasil = []
          for (let i = 0; i < findDepo.length; i++) {
            const result = await pengadaan.findAll({
              where: {
                status_form: { [Op.like]: `%${status}%` },
                status_app: { [Op.not]: null },
                kode_plant: findDepo[i].kode_plant
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
            status_form: { [Op.like]: `%${status}%` },
            status_app: { [Op.not]: null }
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
  addCart: async (req, res) => {
    try {
      const kode = req.user.kode
      const schema = joi.object({
        nama: joi.string().required(),
        qty: joi.string().required(),
        price: joi.string().required(),
        kategori: joi.string().required(),
        tipe: joi.string().required(),
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
              price: results.price,
              kategori: results.kategori,
              kode_plant: kode,
              area: findDepo.nama_area,
              tipe: results.tipe,
              akta: results.akta === '' ? null : results.akta,
              start: results.start === null || results.start === '' ? null : results.start,
              end: results.end === null || results.end === '' ? null : results.end
            }
            const sent = await pengadaan.create(data)
            if (sent) {
              return response(res, 'success add cart', { result: sent })
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
      const id = req.params.id
      const schema = joi.object({
        nama: joi.string(),
        qty: joi.string(),
        price: joi.string(),
        kategori: joi.string()
      })
      const { value: results, error } = schema.validate(req.body)
      if (error) {
        return response(res, 'Error', { error: error.message }, 404, false)
      } else {
        const findIo = await pengadaan.findByPk(id)
        if (findIo.length > 0) {
          const sent = await findIo.update(results)
          if (sent) {
            return response(res, 'success add cart', { result: sent })
          } else {
            return response(res, 'add cart failed2', {}, 404, false)
          }
        } else {
          return response(res, 'add cart failed2', {}, 404, false)
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
  submitCart: async (req, res) => {
    try {
      const kode = req.user.kode
      const findIo = await pengadaan.findAll({
        where: {
          [Op.and]: [
            { kode_plant: kode },
            { status_form: null }
          ]
        }
      })
      if (findIo) {
        const findNo = await pengadaan.findAll({
          where: {
            [Op.not]: { no_pengadaan: null }
          },
          order: [['id', 'DESC']],
          limit: 50
        })
        if (findNo) {
          const cekNo = []
          for (let i = 0; i < findNo.length; i++) {
            const no = findNo[i].no_pengadaan.split('P')
            cekNo.push(parseInt(no[1]))
          }
          const noIo = cekNo.length > 0 ? Math.max(...cekNo) + 1 : 1
          const findDepo = await depo.findOne({
            where: {
              kode_plant: kode
            }
          })
          if (findDepo) {
            const cek = []
            for (let i = 0; i < findIo.length; i++) {
              const findData = await pengadaan.findByPk(findIo[i].id)
              const data = {
                status_form: 1,
                no_pengadaan: noIo === undefined ? 'P' + 1 : 'P' + noIo,
                tglIo: moment()
              }
              if (findData) {
                await findData.update(data)
                cek.push(1)
              }
            }
            if (cek.length > 0) {
              const findEmail = await user.findOne({
                where: {
                  user_level: 2
                }
              })
              if (findEmail) {
                let tableTd = ''
                for (let i = 0; i < findIo.length; i++) {
                  const element = `
                  <tr>
                    <td>${findIo.indexOf(findIo[i]) + 1}</td>
                    <td>${noIo === undefined ? 'P' + 1 : 'P' + noIo}</td>
                    <td>${findIo[i].name}</td>
                    <td>${findIo[i].price}</td>
                    <td>${findIo[i].qty}</td>
                    <td>${findDepo === null || findDepo.kode_plant === undefined || findDepo.kode_plant === null ? '' : findDepo.kode_plant}</td>
                    <td>${findDepo === null || findDepo.cost_center === undefined || findDepo.cost_center === null ? '' : findDepo.cost_center}</td>
                    <td>${findDepo === null || findDepo.nama_area === undefined || findDepo.nama_area === null ? '' : findDepo.nama_area}</td>
                  </tr>`
                  tableTd = tableTd + element
                }
                const mailOptions = {
                  from: 'noreply_asset@pinusmerahabadi.co.id',
                  replyTo: 'noreply_asset@pinusmerahabadi.co.id',
                  // to: `${findEmail.email}`,
                  to: `${emailAss}, ${emailAss2}`,
                  subject: `Pengajuan Pengadaan Asset ${noIo === undefined ? 'P' + 1 : 'P' + noIo} `,
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
                      <a href="http://aset.pinusmerahabadi.co.id/">Klik link berikut untuk akses web asset</a>
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
                  return response(res, 'berhasil melakukan pengajuan io', { result: findIo })
                } else {
                  return response(res, 'berhasil melakukan pengajuan io')
                }
              } else {
                return response(res, 'berhasil melakukan pengajuan io')
              }
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
        return response(res, 'failed submit', {}, 404, false)
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  getApproveIo: async (req, res) => {
    try {
      const no = req.params.no
      const result = await ttd.findAll({
        where: {
          [Op.or]: [
            { no_doc: no },
            { no_pengadaan: no }
          ]
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
        return response(res, 'success get template approve', { result: { pembuat, pemeriksa, penyetuju } })
      } else {
        const result = await pengadaan.findAll({
          where: {
            no_pengadaan: no
          }
        })
        if (result) {
          const getApp = await approve.findAll({
            where: {
              nama_approve: 'pengadaan io',
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
            const hasil = []
            for (let i = 0; i < getApp.length; i++) {
              const send = {
                jabatan: getApp[i].jabatan,
                jenis: getApp[i].jenis,
                sebagai: getApp[i].sebagai,
                kategori: getApp[i].kategori,
                no_doc: no
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
      const no = req.params.no
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
      const no = req.params.no
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
        const result = await pengadaan.findByPk(no)
        if (result) {
          const getDoc = await document.findAll({
            where: {
              tipe_dokumen: 'pengadaan',
              [Op.or]: [
                { jenis_dokumen: result.jenis },
                { jenis_dokumen: 'all' }
              ],
              [Op.or]: [
                { tipe: result.tipe === 'gudang' ? 'gudang' : 'pengajuan' },
                { tipe: result.akta === 'ada' ? 'akta' : null }
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
                jenis_form: 'pengadaan'
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
            path: dokumen
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
      const name = req.user.name
      const no = req.params.no
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
                                      return response(res, 'success approve pengajuan io', { result: sendEmail })
                                    } else {
                                      return response(res, 'success approve pengajuan io')
                                    }
                                  } else {
                                    return response(res, 'success approve pengajuan io')
                                  }
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
                                    return response(res, 'success approve pengajuan io', { result: sendEmail })
                                  } else {
                                    return response(res, 'success approve pengajuan io')
                                  }
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
                                      return response(res, 'success approve pengajuan io', { result: sendEmail })
                                    } else {
                                      return response(res, 'success approve pengajuan io')
                                    }
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
      const name = req.user.name
      const no = req.params.no
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
                              const cek = []
                              for (let i = 0; i < findDis.length; i++) {
                                const findIo = await pengadaan.findByPk(findDis[i].id)
                                const data = {
                                  status_app: results.status
                                }
                                if (findIo) {
                                  const updateIo = await findIo.update(data)
                                  if (updateIo) {
                                    cek.push(1)
                                  }
                                }
                              }
                              if (cek.length > 0) {
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
                                return response(res, 'success reject pengadaan')
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
  rejectAll: async (req, res) => {
    try {
      const level = req.user.level
      const name = req.user.name
      const no = req.params.no
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
          if (findTtd.length > 0) {
            return response(res, 'Pengajuan sedang diproses', { result: { data: findCode, auth: findTtd } })
          } else {
            return response(res, 'Pengajuan sedang diproses', { result: findCode })
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
            const cekNo = []
            for (let i = 0; i < findNo.length; i++) {
              const no = findNo[i].no_pengadaan.split('P')
              cekNo.push(parseInt(no[1]))
            }
            const noIo = cekNo.length > 0 ? Math.max(...cekNo) + 1 : 1
            const findDepo = await depo.findOne({
              where: {
                kode_sap_1: data.prinfo.salespoint_code
              }
            })
            const valid = []
            for (let i = 0; i < data.pr_items.length; i++) {
              const dataSend = {
                nama: data.pr_items[i].name,
                qty: data.pr_items[i].qty,
                price: data.pr_items[i].price,
                uom: data.pr_items[i].uom,
                isAsset: data.pr_items[i].isAsset,
                setup_date: data.pr_items[i].setup_date,
                kode_plant: findDepo === null || findDepo.kode_plant === undefined || findDepo.kode_plant === null ? data.prinfo.salespoint_code : findDepo.kode_plant,
                isBudget: `${data.prinfo.isBudget}`,
                ticket_code: data.ticket_code,
                no_pengadaan: noIo === undefined ? 'P' + 1 : 'P' + noIo,
                kategori: data.prinfo.isBudget === true ? 'budget' : 'non-budget',
                asset_token: data.pr_items[i].asset_number_token,
                bidding_harga: data.pr_items[i].notes_bidding_harga,
                ket_barang: data.pr_items[i].notes_keterangan_barang,
                status_form: 1,
                tglIo: moment(),
                area: findDepo === null || findDepo.nama_area === undefined || findDepo.nama_area === null ? data.prinfo.salespoint_code : findDepo.nama_area,
                alasan: data.pr_items[i].notes
              }
              const sent = await pengadaan.create(dataSend)
              if (sent) {
                valid.push(sent)
              }
            }
            if (valid.length > 0) {
              const cek = []
              for (let i = 0; i < data.attachments.length; i++) {
                const send = {
                  nama_dokumen: data.attachments[i].name,
                  jenis_dokumen: 'all',
                  divisi: 'asset',
                  no_pengadaan: noIo === undefined ? 'P' + 1 : 'P' + noIo,
                  path: data.attachments[i].url,
                  jenis_form: 'pengadaan',
                  status: 1
                }
                const sent = await docUser.create(send)
                if (sent) {
                  cek.push(sent)
                }
              }
              if (cek.length > 0) {
                const getApp = await approve.findAll({
                  where: {
                    nama_approve: 'pengadaan io',
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
                      no_doc: noIo === undefined ? 'P' + 1 : 'P' + noIo
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
                          <td>${noIo === undefined ? 'P' + 1 : 'P' + noIo}</td>
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
                        subject: `Pengajuan Pengadaan Asset ${noIo === undefined ? 'P' + 1 : 'P' + noIo} `,
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
                            <a href="http://aset.pinusmerahabadi.co.id/">Klik link berikut untuk akses web asset</a>
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
                        return response(res, 'berhasil melakukan pengajuan io', { result: data })
                      } else {
                        return response(res, 'berhasil melakukan pengajuan io')
                      }
                    } else {
                      return response(res, 'berhasil melakukan pengajuan io')
                    }
                    // const getTtd = await ttd.findAll({
                    //   where: {
                    //     no_doc: noIo === undefined ? 'P' + 1 : 'P' + noIo
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
              return response(res, 'failed create data pengadaan')
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
          if (findTtd.length > 0) {
            return response(res, 'Pengajuan sedang diproses', { result: { data: findCode, auth: findTtd } })
          } else {
            return response(res, 'Pengajuan sedang diproses', { result: findCode })
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
      const { ticket_code } = req.query
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
    try {
      const no = req.params.no
      const result = await pengadaan.findAll({
        where: {
          no_pengadaan: no
        },
        include: [
          {
            model: depo,
            as: 'depo'
          }
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
          return response(res, 'success get detail', { result: data })
        } else {
          return response(res, 'success get detail', { result: data })
        }
      } else {
        return response(res, 'failed get detail', {}, 404, false)
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  getTempAsset: async (req, res) => {
    try {
      const no = req.params.no
      const findTemp = await assettemp.findAll({
        where: {
          no_pengadaan: no
        }
      })
      if (findTemp.length > 0) {
        return response(res, 'success get detail', { result: findTemp })
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
                  price: result[i].price,
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
              return response(res, 'success get detail', { result: findAsset })
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
      const no = req.params.no
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
            status_form: 2
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
                // to: `${findEmail.email_area_aos}`,
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
                        Dear Bapak/Ibu Divisi Budget,
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
                return response(res, 'success submit pengajuan io', { result: sendEmail })
              } else {
                return response(res, 'success submit pengajuan io')
              }
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
      const no = req.params.no
      const schema = joi.object({
        no_io: joi.string().required()
      })
      const { value: results, error } = schema.validate(req.body)
      if (error) {
        return response(res, 'Error', { error: error.message }, 404, false)
      } else {
        const findIo = await pengadaan.findAll({
          where: {
            no_pengadaan: no
          }
        })
        if (findIo.length > 0) {
          const cek = []
          for (let i = 0; i < findIo.length; i++) {
            const findData = await pengadaan.findByPk(findIo[i].id)
            if (findData) {
              await findData.update(results)
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
  updateAlasan: async (req, res) => {
    try {
      const no = req.params.no
      const schema = joi.object({
        alasan: joi.string().required()
      })
      const { value: results, error } = schema.validate(req.body)
      if (error) {
        return response(res, 'Error', { error: error.message }, 404, false)
      } else {
        const findIo = await pengadaan.findAll({
          where: {
            no_pengadaan: no
          }
        })
        if (findIo.length > 0) {
          const cek = []
          for (let i = 0; i < findIo.length; i++) {
            const findItem = await pengadaan.findByPk(findIo[i].id)
            if (findItem) {
              const updateAsset = await findItem.update(results)
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
      const no = req.params.no
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
            status_form: 9
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
                // to: `${findEmail.email}`,
                to: `${emailAss}, ${emailAss2}`,
                subject: `Eksekusi Pengajuan Pengadaan Asset ${findIo[0].no_pengadaan} `,
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
                        <div>Mohon untuk isi nomor asset pengajuan asset berikut ini.</div>
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
                return response(res, 'success submit pengajuan io', { result: sendEmail })
              } else {
                return response(res, 'success submit pengajuan io')
              }
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
      const no = req.params.no
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
            status_form: 8
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
                // to: `${findEmail.email_area_aos}`,
                to: `${emailAss}, ${emailAss2}`,
                subject: `Proses Pengajuan Pengadaan Asset ${findIo[0].no_pengadaan} Telah Selesai`,
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
                        <div>Proses pengadaan asset berikut ini telah selesai.</div>
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
                return response(res, 'success submit pengajuan io', { result: sendEmail })
              } else {
                return response(res, 'success submit pengajuan io')
              }
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
  uploadMasterTemp: async (req, res) => {
    uploadMaster(req, res, async function (err) {
      try {
        const no = req.params.no
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
        const cek = ['No', 'No Pengadaan', 'Description', 'Price/unit', 'Total Amount', 'No Asset', 'ID Asset']
        const valid = rows[0]
        for (let i = 0; i < cek.length; i++) {
          if (valid[i] === cek[i]) {
            count.push(1)
          }
        }
        if (count.length === cek.length) {
          const arr = []
          rows.shift()
          for (let i = 0; i < rows.length; i++) {
            if (no === rows[i][1]) {
              const findTemp = await assettemp.findByPk(rows[i][6])
              if (findTemp && findTemp.nama === rows[i][2]) {
                const send = {
                  no_asset: rows[i][5]
                }
                const updateAsset = await findTemp.update(send)
                if (updateAsset) {
                  arr.push(1)
                }
              }
            }
          }
          if (arr.length > 0) {
            const findData = await pengadaan.findAll({
              where: {
                no_pengadaan: no
              }
            })
            if (findData.length > 0) {
              const cek = []
              for (let i = 0; i < findData.length; i++) {
                const findAsset = await assettemp.findAll({
                  where: {
                    idIo: findData[i].id
                  }
                })
                if (findAsset.length > 0) {
                  const valid = []
                  let text = ''
                  for (let j = 0; j < findAsset.length; j++) {
                    if (findAsset[j].no_asset !== null) {
                      valid.push(1)
                      text += j === findAsset.length - 1 ? findAsset[j].no_asset : `${findAsset[j].no_asset},`
                    }
                  }
                  if (valid.length > 0) {
                    const findRes = await pengadaan.findByPk(findData[i].id)
                    if (findRes) {
                      const data = {
                        no_asset: text
                      }
                      const update = await findRes.update(data)
                      if (update) {
                        cek.push(1)
                      }
                    }
                  }
                }
              }
              if (cek.length > 0) {
                fs.unlink(dokumen, function (err) {
                  if (err) throw err
                  console.log('success')
                })
                return response(res, 'success upload asset balance', { rows })
              } else {
                fs.unlink(dokumen, function (err) {
                  if (err) throw err
                  console.log('success')
                })
                return response(res, 'failed upload asset balance')
              }
            } else {
              fs.unlink(dokumen, function (err) {
                if (err) throw err
                console.log('success')
              })
              return response(res, 'failed upload asset balance')
            }
          } else {
            fs.unlink(dokumen, function (err) {
              if (err) throw err
              console.log('success')
            })
            return response(res, 'failed upload asset balance')
          }
        } else {
          fs.unlink(dokumen, function (err) {
            if (err) throw err
            console.log('success')
          })
          return response(res, 'Failed to upload master file, please use the template provided', {}, 400, false)
        }
      } catch (error) {
        return response(res, error.message, {}, 500, false)
      }
    })
  },
  deleteTransaksi: async (req, res) => {
    try {
      const no = req.params.no
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
  podsSend: async (req, res) => {
    try {
      const no = req.params.no
      const result = await pengadaan.findAll({
        where: {
          no_pengadaan: no
        }
      })
      if (result.length > 0) {
        const data = []
        for (let i = 0; i < result.length; i++) {
          const temp = {
            name: result[i].nama,
            qty: result[i].qty,
            price: result[i].price,
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
              url: 'https://192.168.35.164/api/updateassetnumber',
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
  }
}
