const { status_stock } = require('../models')
const joi = require('joi')
const { Op } = require('sequelize')
const response = require('../helpers/response')
const fs = require('fs')
const { pagination } = require('../helpers/pagination')
const uploadMaster = require('../helpers/uploadMaster')
const readXlsxFile = require('read-excel-file/node')
const multer = require('multer')
const excel = require('exceljs')
const vs = require('fs-extra')
const { APP_URL } = process.env
const borderStyles = {
  top: { style: 'thin' },
  left: { style: 'thin' },
  bottom: { style: 'thin' },
  right: { style: 'thin' }
}

module.exports = {
  addStatusStock: async (req, res) => {
    try {
      const schema = joi.object({
        fisik: joi.string().valid('ada', 'tidak ada'),
        kondisi: joi.string().allow(''),
        status: joi.string(),
        isSap: joi.string().valid('true', 'false')
      })
      const { value: results, error } = schema.validate(req.body)
      if (error) {
        return response(res, 'Error', { error: error.message }, 404, false)
      } else {
        const result = await status_stock.findAll({
          where: {
            [Op.and]: [
              { fisik: results.fisik },
              { kondisi: results.kondisi },
              { status: results.status },
              { isSap: results.isSap }
            ]
          }
        })
        if (result.length > 0) {
          return response(res, 'success create status stock')
        } else {
          const result = await status_stock.create(results)
          if (result) {
            return response(res, 'success create status stock')
          } else {
            return response(res, 'failed create status stock', {}, 404, false)
          }
        }
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  updateStatusStock: async (req, res) => {
    try {
      const id = req.params.id
      const schema = joi.object({
        fisik: joi.string().valid('ada', 'tidak ada').required(),
        kondisi: joi.string().allow(''),
        status: joi.string().required(),
        isSap: joi.string().valid('true', 'false').required()
      })
      const { value: results, error } = schema.validate(req.body)
      if (error) {
        return response(res, 'Error', { error: error.message }, 404, false)
      } else {
        const findNameStatusStock = await status_stock.findOne({
          where: {
            [Op.and]: [
              { fisik: results.fisik },
              { kondisi: results.kondisi },
              { status: results.status },
              { isSap: results.isSap }
            ],
            [Op.not]: {
              id: id
            }
          }
        })
        if (findNameStatusStock) {
          return response(res, 'status_stock telah terdftar', {}, 404, false)
        } else {
          const findStatusStock = await status_stock.findByPk(id)
          if (findStatusStock) {
            const updateStatusStock = await findStatusStock.update(results)
            if (updateStatusStock) {
              return response(res, 'success update status_stock')
            } else {
              return response(res, 'false update status_stock 1', {}, 404, false)
            }
          } else {
            return response(res, 'false update status_stock 2', {}, 404, false)
          }
        }
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  uploadMasterStatusStock: async (req, res) => {
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
          const cek = [
            'KONDISI',
            'STATUS FISIK',
            'STATUS ASSET',
            'TYPE ASSET'
          ]
          const valid = rows[0]
          for (let i = 0; i < cek.length; i++) {
            console.log(valid[i] === cek[i])
            if (valid[i] === cek[i]) {
              count.push(1)
            }
          }
          console.log(count.length)
          if (count.length === cek.length) {
            const cost = []
            const kode = []
            for (let i = 1; i < rows.length; i++) {
              const a = rows[i]
              kode.push(`${a[0]}`)
              cost.push(`kondisi ${a[0]} status fisik ${a[1]} status asset ${a[2]} type asset ${a[3] === 'true' ? 'SAP' : 'Aset Tambahan'}`)
            }
            const result = []
            const dupCost = {}

            cost.forEach(item => {
              if (!dupCost[item]) { dupCost[item] = 0 }
              dupCost[item] += 1
            })

            for (const prop in dupCost) {
              if (dupCost[prop] >= 2) {
                result.push(prop)
              }
            }

            if (result.length > 0) {
              return response(res, 'there is duplication in your file master', { result }, 404, false)
            } else {
              const arr = []
              rows.shift()
              for (let i = 0; i < rows.length; i++) {
                const dataStatusStock = rows[i]
                const select = await status_stock.findOne({
                  where: {
                    [Op.and]: [
                      { kondisi: dataStatusStock[0] },
                      { fisik: dataStatusStock[1] },
                      { status: dataStatusStock[2] },
                      { isSap: dataStatusStock[3] }
                    ]
                  }
                })
                const data = {
                  kondisi: dataStatusStock[0],
                  fisik: dataStatusStock[1],
                  status: dataStatusStock[2],
                  isSap: dataStatusStock[3]
                }
                if (select) {
                  const upbank = await select.update(data)
                  if (upbank) {
                    arr.push(1)
                  }
                } else {
                  const createStatusStock = await status_stock.create(data)
                  if (createStatusStock) {
                    arr.push(1)
                  }
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
                  console.log('success')
                })
                return response(res, 'failed to upload file', {}, 404, false)
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
  getStatusStock: async (req, res) => {
    try {
      const findStatusStock = await status_stock.findAll()
      if (findStatusStock.length > 0) {
        return response(res, 'succes get status_stock', { result: findStatusStock, length: findStatusStock.length })
      } else {
        return response(res, 'failed get status_stock', {}, 404, false)
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  getAllStatusStock: async (req, res) => {
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
      } else if (limit === 'all') {
        const findLimit = await status_stock.findAll()
        limit = findLimit.length
      } else {
        limit = parseInt(limit)
      }
      if (!page) {
        page = 1
      } else {
        page = parseInt(page)
      }
      const findStatusStock = await status_stock.findAndCountAll({
        where: {
          [Op.or]: [
            { kode_dist: { [Op.like]: `%${searchValue}%` } },
            { profit_center: { [Op.like]: `%${searchValue}%` } },
            { area: { [Op.like]: `%${searchValue}%` } }
          ]
        },
        order: [[sortValue, 'ASC']],
        limit: limit,
        offset: (page - 1) * limit
      })
      const pageInfo = pagination('/status-stock/get', req.query, page, limit, findStatusStock.count)
      if (findStatusStock.rows.length > 0) {
        return response(res, 'succes get status_stock', { result: findStatusStock, pageInfo })
      } else {
        return response(res, 'failed get status_stock', { findStatusStock }, 404, false)
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  getDetailStatusStock: async (req, res) => {
    try {
      const id = req.params.id
      const findStatusStock = await status_stock.findByPk(id)
      if (findStatusStock) {
        return response(res, 'succes get detail status_stock', { result: findStatusStock })
      } else {
        return response(res, 'failed get status_stock', {}, 404, false)
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  deleteStatusStock: async (req, res) => {
    try {
      const id = req.params.id
      const findStatusStock = await status_stock.findByPk(id)
      if (findStatusStock) {
        const delStatusStock = await findStatusStock.destroy()
        if (delStatusStock) {
          return response(res, 'succes delete status_stock', { result: findStatusStock })
        } else {
          return response(res, 'failed destroy status_stock', {}, 404, false)
        }
      } else {
        return response(res, 'failed get status_stock', {}, 404, false)
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  exportSqlStatusStock: async (req, res) => {
    try {
      const result = await status_stock.findAll()
      if (result) {
        const workbook = new excel.Workbook()
        const worksheet = workbook.addWorksheet()
        const arr = []
        const header = [
          'KONDISI',
          'STATUS FISIK',
          'STATUS ASSET',
          'TYPE ASSET'
        ]
        const key = ['kondisi', 'fisik', 'status', 'isSap']
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
        if (cek.length > 0) {
          const name = new Date().getTime().toString().concat('-status_stock').concat('.xlsx')
          await workbook.xlsx.writeFile(name)
          vs.move(name, `assets/exports/${name}`, function (err) {
            if (err) {
              throw err
            }
            console.log('success')
          })
          return response(res, 'success', { link: `${APP_URL}/download/${name}` })
        } else {
          return response(res, 'failed create file', {}, 404, false)
        }
      } else {
        return response(res, 'failed', {}, 404, false)
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  deleteAll: async (req, res) => {
    try {
      const findStatusStock = await status_stock.findAll()
      if (findStatusStock) {
        const temp = []
        for (let i = 0; i < findStatusStock.length; i++) {
          const findDel = await status_stock.findByPk(findStatusStock[i].id)
          if (findDel) {
            await findDel.destroy()
            temp.push(1)
          }
        }
        if (temp.length > 0) {
          return response(res, 'success delete all', {}, 404, false)
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
