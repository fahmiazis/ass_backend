const joi = require('joi')
const { depo } = require('../models')
const { pagination } = require('../helpers/pagination')
const response = require('../helpers/response')
const { Op } = require('sequelize')
const readXlsxFile = require('read-excel-file/node')
const multer = require('multer')
const uploadMaster = require('../helpers/uploadMaster')
const fs = require('fs')
const excel = require('exceljs')
const vs = require('fs-extra')
const { APP_BE } = process.env
const borderStyles = {
  top: { style: 'thin' },
  left: { style: 'thin' },
  bottom: { style: 'thin' },
  right: { style: 'thin' }
}

module.exports = {
  createDepo: async (req, res) => {
    try {
      const level = req.user.level
      const schema = joi.object({
        kode_plant: joi.string().required(),
        nama_area: joi.string().required(),
        place_asset: joi.string().required(),
        channel: joi.string().required(),
        distribution: joi.string().required(),
        status_area: joi.string().required(),
        profit_center: joi.string().required(),
        cost_center: joi.string().required(),
        kode_sap_1: joi.string().required(),
        kode_sap_2: joi.string().required(),
        nama_nom: joi.string().required(),
        nama_om: joi.string().required(),
        nama_bm: joi.string().required(),
        nama_aos: joi.string().allow(''),
        nama_pic_1: joi.string().allow(''),
        nama_pic_2: joi.string().allow(''),
        nama_pic_3: joi.string().allow(''),
        nama_pic_4: joi.string().allow(''),
        nama_asman: joi.string().allow(''),
        pic_budget: joi.string().allow(''),
        pic_finance: joi.string().allow(''),
        pic_tax: joi.string().allow(''),
        pic_purchasing: joi.string().allow('')
      })
      const { value: results, error } = schema.validate(req.body)
      if (error) {
        return response(res, 'Error', { error: error.message }, 401, false)
      } else {
        if (level === 1) {
          const result = await depo.findAll({ where: { kode_plant: results.kode_plant } })
          if (result.length > 0) {
            return response(res, 'kode depo already use', {}, 404, false)
          } else {
            const result = await depo.findAll({ where: { kode_sap_1: results.kode_sap_1 } })
            if (result.length > 0) {
              return response(res, 'kode sap 1 already use', {}, 404, false)
            } else {
              const result = await depo.findAll({ where: { kode_sap_2: results.kode_sap_2 } })
              if (result.length > 0) {
                return response(res, 'kode sap 2 already use', {}, 404, false)
              } else {
                const result = await depo.findAll({ where: { kode_plant: results.kode_plant } })
                if (result.length > 0) {
                  return response(res, 'kode plant already use', {}, 404, false)
                } else {
                  const result = await depo.findAll({ where: { profit_center: results.profit_center } })
                  if (result.length > 0) {
                    return response(res, 'profit center already use', {}, 404, false)
                  } else {
                    const result = await depo.findAll({ where: { cost_center: results.cost_center } })
                    if (result.length > 0) {
                      return response(res, 'cost center already use', {}, 404, false)
                    } else {
                      const result = await depo.create(results)
                      if (result) {
                        return response(res, 'succesfully add depo', { result })
                      } else {
                        return response(res, 'failed to add depo', {}, 404, false)
                      }
                    }
                  }
                }
              }
            }
          }
        } else {
          return response(res, "you're not super administrator", {}, 404, false)
        }
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  updateDepo: async (req, res) => {
    try {
      const level = req.user.level
      const id = req.params.id
      const schema = joi.object({
        kode_plant: joi.string().required(),
        nama_area: joi.string(),
        place_asset: joi.string().required(),
        channel: joi.string(),
        distribution: joi.string(),
        status_area: joi.string(),
        kode_sap_1: joi.string().required(),
        kode_sap_2: joi.string().allow(''),
        profit_center: joi.string().required(),
        cost_center: joi.string().required(),
        nama_nom: joi.string().required(),
        nama_om: joi.string().required(),
        nama_bm: joi.string().required(),
        nama_aos: joi.string().allow(''),
        nama_pic_1: joi.string().allow(''),
        nama_pic_2: joi.string().allow(''),
        nama_pic_3: joi.string().allow(''),
        nama_pic_4: joi.string().allow(''),
        nama_asman: joi.string().allow(''),
        pic_budget: joi.string().allow(''),
        pic_finance: joi.string().allow(''),
        pic_tax: joi.string().allow(''),
        pic_purchasing: joi.string().allow('')
      })
      const { value: results, error } = schema.validate(req.body)
      if (error) {
        return response(res, 'Error', { error: error.message }, 401, false)
      } else {
        if (level === 1) {
          const result = await depo.findAll({ where: { kode_plant: results.kode_plant, [Op.not]: { id: id } } })
          if (result.length > 0) {
            return response(res, 'kode depo already use', {}, 404, false)
          } else {
            const result = await depo.findAll({ where: { kode_sap_1: results.kode_sap_1, [Op.not]: { id: id } } })
            if (result.length > 0) {
              return response(res, 'kode sap 1 already use', {}, 404, false)
            } else {
              const result = await depo.findAll({ where: { kode_plant: results.kode_plant, [Op.not]: { id: id } } })
              if (result.length > 0) {
                return response(res, 'kode plant already use', {}, 404, false)
              } else {
                const result = await depo.findAll({ where: { profit_center: results.profit_center, [Op.not]: { id: id } } })
                if (result.length > 0) {
                  return response(res, 'profit center already use', {}, 404, false)
                } else {
                  const result = await depo.findAll({ where: { cost_center: results.cost_center, [Op.not]: { id: id } } })
                  if (result.length > 0) {
                    return response(res, 'cost center already use', {}, 404, false)
                  } else {
                    const result = await depo.findByPk(id)
                    if (result) {
                      await result.update(results)
                      return response(res, 'succesfully update depo', { result })
                    } else {
                      return response(res, 'failed to update depo', {}, 404, false)
                    }
                  }
                }
              }
            }
          }
        } else {
          return response(res, "you're not super administrator", {}, 404, false)
        }
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  deleteDepo: async (req, res) => {
    try {
      const level = req.user.level
      const id = req.params.id
      if (level === 1) {
        const result = await depo.findByPk(id)
        if (result) {
          await result.destroy()
          return response(res, 'succesfully delete depo', { result })
        } else {
          return response(res, 'failed to delete depo', {}, 404, false)
        }
      } else {
        return response(res, "you're not super administrator", {}, 404, false)
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  getDepo: async (req, res) => {
    try {
      const level = req.user.level
      const fullname = req.user.name
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
      } else if (limit === 'all') {
        const findLimit = await depo.findAll()
        limit = findLimit.length
      } else {
        limit = parseInt(limit)
      }
      if (!page) {
        page = 1
      } else {
        page = parseInt(page)
      }
      if (level === 12) {
        const result = await depo.findAll({
          where: {
            nama_bm: fullname
          }
        })
        const pageInfo = pagination('/depo/get', req.query, page, limit, result.length)
        if (result) {
          return response(res, 'list users', { result: { count: result.length, rows: result }, pageInfo })
        } else {
          return response(res, 'failed to get user', {}, 404, false)
        }
      } else if (level === 7) {
        const result = await depo.findAll({
          where: {
            nama_om: fullname
          }
        })
        const pageInfo = pagination('/depo/get', req.query, page, limit, result.length)
        if (result) {
          return response(res, 'list users', { result: { count: result.length, rows: result }, pageInfo })
        } else {
          return response(res, 'failed to get user', {}, 404, false)
        }
      } else {
        const result = await depo.findAndCountAll({
          where: {
            [Op.or]: [
              { kode_plant: { [Op.like]: `%${searchValue}%` } },
              { nama_area: { [Op.like]: `%${searchValue}%` } },
              { place_asset: { [Op.like]: `%${searchValue}%` } },
              { channel: { [Op.like]: `%${searchValue}%` } },
              { distribution: { [Op.like]: `%${searchValue}%` } },
              { status_area: { [Op.like]: `%${searchValue}%` } },
              { cost_center: { [Op.like]: `%${searchValue}%` } },
              { profit_center: { [Op.like]: `%${searchValue}%` } },
              { kode_sap_1: { [Op.like]: `%${searchValue}%` } },
              { kode_sap_2: { [Op.like]: `%${searchValue}%` } },
              { kode_plant: { [Op.like]: `%${searchValue}%` } },
              { nama_nom: { [Op.like]: `%${searchValue}%` } },
              { nama_om: { [Op.like]: `%${searchValue}%` } },
              { nama_bm: { [Op.like]: `%${searchValue}%` } },
              { nama_aos: { [Op.like]: `%${searchValue}%` } },
              { nama_pic_1: { [Op.like]: `%${searchValue}%` } },
              { nama_pic_2: { [Op.like]: `%${searchValue}%` } },
              { nama_pic_3: { [Op.like]: `%${searchValue}%` } },
              { nama_pic_4: { [Op.like]: `%${searchValue}%` } },
              { nama_asman: { [Op.like]: `%${searchValue}%` } },
              { pic_budget: { [Op.like]: `%${searchValue}%` } },
              { pic_finance: { [Op.like]: `%${searchValue}%` } },
              { pic_tax: { [Op.like]: `%${searchValue}%` } },
              { pic_purchasing: { [Op.like]: `%${searchValue}%` } }
            ]
          },
          order: [[sortValue, 'ASC']],
          limit: limit,
          offset: (page - 1) * limit
        })
        const pageInfo = pagination('/depo/get', req.query, page, limit, result.count)
        if (result) {
          return response(res, 'list users', { result, pageInfo })
        } else {
          return response(res, 'failed to get user', {}, 404, false)
        }
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  getDetailDepo: async (req, res) => {
    try {
      const id = req.params.id
      const level = req.user.level
      const kode = req.user.kode
      const cost = req.user.name
      if (level === 5 || level === 9) {
        const result = await depo.findOne({ where: { kode_plant: level === 5 ? kode : cost } })
        if (result) {
          return response(res, 'succes get detail depo', { result })
        } else {
          return response(res, 'failed get detail depo', {}, 404, false)
        }
      } else {
        const result = await depo.findByPk(id)
        if (result) {
          return response(res, 'succes get detail depo', { result })
        } else {
          return response(res, 'failed get detail depo', {}, 404, false)
        }
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  uploadMasterDepo: async (req, res) => {
    const level = req.user.level
    if (level === 1) {
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
          const cek = ['Kode Area', 'Home Town', 'Place Aset', 'Channel', 'Distribution', 'Status Depo', 'Profit Center', 'Cost Center', 'Kode SAP 1', 'Kode SAP 2', 'Nama NOM', 'Nama OM', 'Nama BM', 'Nama AOS', 'Nama PIC 1', 'Nama PIC 2', 'Nama PIC 3', 'Nama PIC 4', 'Nama Assistant Manager', 'PIC Budget', 'PIC Finance', 'PIC Tax', 'PIC Purchasing']
          const valid = rows[0]
          for (let i = 0; i < cek.length; i++) {
            console.log(valid[i] === cek[i])
            if (valid[i] === cek[i]) {
              count.push(1)
            }
          }
          console.log(count.length)
          if (count.length === cek.length) {
            const plant = []
            const cost = []
            const sap1 = []
            const sap2 = []
            const kode = []
            for (let i = 1; i < rows.length; i++) {
              const a = rows[i]
              plant.push(`Terdapat duplikasi Kode Plant ${a[0]}`)
              kode.push(`${a[0]}`)
              cost.push(`Terdapat duplikasi Cost Center ${a[7]}`)
              if (a[8] !== null && a[8] !== '' && a[8] !== 'null') {
                sap1.push(`Terdapat duplikasi Kode SAP 1 ${a[8]}`)
              }
              if (a[9] !== null && a[9] !== '' && a[9] !== 'null') {
                sap2.push(`Terdapat duplikasi Kode SAP 2 ${a[9]}`)
              }
            }
            const object = {}
            const result = []
            const dupCost = {}
            const dupSap1 = {}
            const dupSap2 = {}

            cost.forEach(item => {
              if (!dupCost[item]) { dupCost[item] = 0 }
              dupCost[item] += 1
            })

            for (const prop in dupCost) {
              if (dupCost[prop] >= 2) {
                result.push(prop)
              }
            }

            sap1.forEach(item => {
              if (!dupSap1[item]) { dupSap1[item] = 0 }
              dupSap1[item] += 1
            })

            for (const prop in dupSap1) {
              if (dupSap1[prop] >= 2) {
                result.push(prop)
              }
            }

            sap2.forEach(item => {
              if (!dupSap2[item]) { dupSap2[item] = 0 }
              dupSap2[item] += 1
            })

            for (const prop in dupSap2) {
              if (dupSap2[prop] >= 2) {
                result.push(prop)
              }
            }

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
              rows.shift()
              const arr = []
              for (let i = 0; i < rows.length; i++) {
                const dataDepo = rows[i]
                const data = {
                  kode_plant: dataDepo[0],
                  nama_area: dataDepo[1],
                  place_asset: dataDepo[2],
                  channel: dataDepo[3],
                  distribution: dataDepo[4],
                  status_area: dataDepo[5],
                  profit_center: dataDepo[6],
                  cost_center: dataDepo[7],
                  kode_sap_1: dataDepo[8],
                  kode_sap_2: dataDepo[9],
                  nama_nom: dataDepo[10],
                  nama_om: dataDepo[11],
                  nama_bm: dataDepo[12],
                  nama_aos: dataDepo[13],
                  nama_pic_1: dataDepo[14],
                  nama_pic_2: dataDepo[15],
                  nama_pic_3: dataDepo[16],
                  nama_pic_4: dataDepo[17],
                  nama_asman: dataDepo[18],
                  pic_budget: dataDepo[19],
                  pic_finance: dataDepo[20],
                  pic_tax: dataDepo[21],
                  pic_purchasing: dataDepo[22]
                }
                const select = await depo.findOne({
                  where: {
                    kode_plant: data.kode_plant
                  }
                })
                if (select) {
                  await select.update(data)
                  arr.push(select)
                } else {
                  await depo.create(data)
                  arr.push(data)
                }
              }
              if (arr.length > 0) {
                fs.unlink(dokumen, function (err) {
                  if (err) throw err
                  console.log('success')
                })
                return response(res, 'successfully upload file master')
              } else {
                fs.unlink(dokumen, function (err) {
                  if (err) throw err
                  return response(res, 'successfully upload file master')
                })
              }
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
    } else {
      return response(res, "You're not super administrator", {}, 404, false)
    }
  },
  exportSqlDepo: async (req, res) => {
    try {
      const result = await depo.findAll()
      if (result) {
        const workbook = new excel.Workbook()
        const worksheet = workbook.addWorksheet()
        const arr = []
        const header = ['Kode Area', 'Home Town', 'Place Aset', 'Channel', 'Distribution', 'Status Depo', 'Profit Center', 'Cost Center', 'Kode SAP 1', 'Kode SAP 2', 'Nama NOM', 'Nama OM', 'Nama BM', 'Nama AOS', 'Nama PIC 1', 'Nama PIC 2', 'Nama PIC 3', 'Nama PIC 4', 'Nama Assistant Manager', 'PIC Budget', 'PIC Finance', 'PIC Tax', 'PIC Purchasing']
        const key = [
          'kode_plant',
          'nama_area',
          'place_asset',
          'channel',
          'distribution',
          'status_area',
          'profit_center',
          'cost_center',
          'kode_sap_1',
          'kode_sap_2',
          'nama_nom',
          'nama_om',
          'nama_bm',
          'nama_aos',
          'nama_pic_1',
          'nama_pic_2',
          'nama_pic_3',
          'nama_pic_4',
          'nama_asman',
          'pic_budget',
          'pic_finance',
          'pic_tax',
          'pic_purchasing'
        ]
        for (let i = 0; i < header.length; i++) {
          let temp = { header: header[i], key: key[i] }
          arr.push(temp)
          temp = {}
        }
        worksheet.columns = arr
        worksheet.addRows(result)
        worksheet.eachRow({ includeEmpty: true }, function (row, rowNumber) {
          row.eachCell({ includeEmpty: true }, function (cell, colNumber) {
            cell.border = borderStyles
          })
        })

        worksheet.columns.forEach(column => {
          const lengths = column.values.map(v => v.toString().length)
          const maxLength = Math.max(...lengths.filter(v => typeof v === 'number'))
          column.width = maxLength + 5
        })
        const cek = [1]
        if (cek) {
          const name = new Date().getTime().toString().concat('-depo').concat('.xlsx')
          await workbook.xlsx.writeFile(name)
          vs.move(name, `assets/exports/${name}`, function (err) {
            if (err) {
              throw err
            } else {
              return response(res, 'success', { link: `${APP_BE}/download/${name}` })
            }
          })
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
