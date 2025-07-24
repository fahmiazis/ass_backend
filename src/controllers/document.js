const { pagination } = require('../helpers/pagination')
const { document, sequelize, depo, docUser, namedocs } = require('../models')
const { Op, QueryTypes } = require('sequelize')
const response = require('../helpers/response')
const joi = require('joi')
const multer = require('multer')
const readXlsxFile = require('read-excel-file/node')
const uploadMaster = require('../helpers/uploadMaster')
const fs = require('fs')
const excel = require('exceljs')
const vs = require('fs-extra')
const moment = require('moment')
const { APP_URL } = process.env

module.exports = {
  addDocument: async (req, res) => {
    try {
      const level = req.user.level
      const schema = joi.object({
        nama_dokumen: joi.string().required(),
        jenis_dokumen: joi.string().required(),
        divisi: joi.string().required(),
        tipe_dokumen: joi.string().required(),
        tipe: joi.string().required()
      })
      const { value: results, error } = schema.validate(req.body)
      if (error) {
        return response(res, 'Error', { error: error.message }, 401, false)
      } else {
        if (level === 1) {
          const result = await document.findAll({
            where: {
              [Op.and]: [
                { nama_dokumen: results.nama_dokumen },
                { tipe_dokumen: results.tipe_dokumen }
              ]
            }
          })
          if (result.length > 0) {
            return response(res, 'dokumen already exist', {}, 404, false)
          } else {
            const result = await document.create(results)
            if (result) {
              return response(res, 'succesfully add dokumen', { result })
            } else {
              return response(res, 'failed to add dokumen', {}, 404, false)
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
  updateDocument: async (req, res) => {
    try {
      const level = req.user.level
      const id = req.params.id
      const schema = joi.object({
        nama_dokumen: joi.string(),
        jenis_dokumen: joi.string().required().valid('it', 'non_it', 'all'),
        divisi: joi.string().disallow('-Pilih Divisi-'),
        tipe_dokumen: joi.string(),
        tipe: joi.string()
      })
      const { value: results, error } = schema.validate(req.body)
      if (error) {
        return response(res, 'Error', { error: error.message }, 401, false)
      } else {
        if (level === 1 || level === 2) {
          if (results.nama_dokumen) {
            const result = await document.findAll({
              where: {
                [Op.and]: [
                  { nama_dokumen: results.nama_dokumen },
                  { tipe_dokumen: results.tipe_dokumen }
                ],
                [Op.not]: { id: id }
              }
            })
            if (result.length > 0) {
              return response(res, 'dokumen already exist', {}, 404, false)
            } else {
              const result = await document.findByPk(id)
              if (result) {
                await result.update(results)
                return response(res, 'succesfully update dokumen', { result })
              } else {
                return response(res, 'failed to update dokumen', {}, 404, false)
              }
            }
          } else {
            const result = await document.findByPk(id)
            if (result) {
              await result.update(results)
              return response(res, 'succesfully update dokumen', { result })
            } else {
              return response(res, 'failed to update dokumen', {}, 404, false)
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
  deleteDocuments: async (req, res) => {
    try {
      const level = req.user.level
      const id = req.params.id
      if (level === 1) {
        const result = await document.findByPk(id)
        if (result) {
          await result.destroy()
          return response(res, 'succesfully delete dokumen', { result })
        } else {
          return response(res, 'failed to delete dokumen', {}, 404, false)
        }
      } else {
        return response(res, "you're not super administrator", {}, 404, false)
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  getDocumentsArea: async (req, res) => {
    try {
      let { limit, page, search, sort, typeSort } = req.query
      let searchValue = ''
      let sortValue = ''
      let typeSortValue = ''
      if (typeof search === 'object') {
        searchValue = Object.values(search)[0]
      } else {
        searchValue = search || ''
      }
      if (typeof sort === 'object') {
        sortValue = Object.values(sort)[0]
      } else {
        sortValue = sort || 'createdAt'
      }
      if (typeof typeSort === 'object') {
        typeSortValue = Object.values(typeSort)[0]
      } else {
        typeSortValue = typeSort || 'ASC'
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
      const { name } = req.user
      const result = await depo.findAndCountAll({
        where: {
          nama_pic_1: { [Op.like]: `%${name}%` }
        },
        include: [{
          model: document,
          as: 'dokumen',
          where: {
            [Op.or]: [
              { nama_dokumen: { [Op.like]: `%${searchValue}%` } },
              { jenis_dokumen: { [Op.like]: `%${searchValue}%` } },
              { divisi: { [Op.like]: `%${searchValue}%` } }
            ]
          }
        }],
        order: [[sortValue, typeSortValue]],
        limit: limit,
        offset: (page - 1) * limit
      })
      const pageInfo = pagination('/dokumen/area/get', req.query, page, limit, result.count)
      if (result) {
        return response(res, 'list dokumen', { result, pageInfo })
      } else {
        return response(res, 'failed to get user', {}, 404, false)
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  getDocuments: async (req, res) => {
    try {
      let { limit, page, search, sort, typeSort } = req.query
      let searchValue = ''
      let sortValue = ''
      let typeSortValue = ''
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
      if (typeof typeSort === 'object') {
        typeSortValue = Object.values(typeSort)[0]
      } else {
        typeSortValue = typeSort || 'ASC'
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
      const result = await document.findAndCountAll({
        where: {
          [Op.or]: [
            { nama_dokumen: { [Op.like]: `%${searchValue}%` } },
            { jenis_dokumen: { [Op.like]: `%${searchValue}%` } },
            { divisi: { [Op.like]: `%${searchValue}%` } }
          ]
        },
        order: [[sortValue, typeSortValue]],
        limit: limit,
        offset: (page - 1) * limit
      })
      const pageInfo = pagination('/dokumen/get', req.query, page, limit, result.count)
      if (result) {
        return response(res, 'list dokumen', { result, pageInfo })
      } else {
        return response(res, 'failed to get user', {}, 404, false)
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  // uploadDocument: async (req, res) => {
  //   const id = req.params.id
  //   uploadHelper(req, res, async function (err) {
  //     try {
  //       if (err instanceof multer.MulterError) {
  //         if (err.code === 'LIMIT_UNEXPECTED_FILE' && req.files.length === 0) {
  //           console.log(err.code === 'LIMIT_UNEXPECTED_FILE' && req.files.length > 0)
  //           return response(res, 'fieldname doesnt match', {}, 500, false)
  //         }
  //         return response(res, err.message, {}, 500, false)
  //       } else if (err) {
  //         return response(res, err.message, {}, 401, false)
  //       }
  //       let dokumen = ''
  //       for (let x = 0; x < req.files.length; x++) {
  //         const path = `/uploads/${req.files[x].filename}`
  //         dokumen += path + ', '
  //         if (x === req.files.length - 1) {
  //           dokumen = dokumen.slice(0, dokumen.length - 2)
  //         }
  //       }
  //       const result = await document.findByPk(id)
  //       if (result) {
  //         await result.update({ status_dokumen: 1 })
  //         const send = { dokumenId: result.id, path: dokumen }
  //         const upload = await Path.create(send)
  //         return response(res, 'successfully upload dokumen', { upload })
  //       } else {
  //         return response(res, 'failed to upload dokumen', {}, 404, false)
  //       }
  //     } catch (error) {
  //       return response(res, error.message, {}, 500, false)
  //     }
  //   })
  // },
  uploadMasterDokumen: async (req, res) => {
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
          const cek = ['Nama Dokumen', 'Jenis Dokumen', 'Divisi']
          const valid = rows[0]
          for (let i = 0; i < cek.length; i++) {
            console.log(valid[i] + '===' + cek[i])
            if (valid[i] === cek[i]) {
              count.push(1)
            }
          }
          if (count.length === cek.length) {
            const plant = []
            const kode = []
            for (let i = 1; i < rows.length; i++) {
              const a = rows[i]
              plant.push(`Nama Dokumen ${a[0]}`)
              kode.push(`${a[0]}`)
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
              for (let i = 0; i < rows.length - 1; i++) {
                const select = await sequelize.query(`SELECT nama_dokumen from documents WHERE nama_dokumen='${kode[i]}'`, {
                  type: QueryTypes.SELECT
                })
                await sequelize.query(`DELETE from documents WHERE nama_dokumen='${kode[i]}'`, {
                  type: QueryTypes.DELETE
                })
                if (select.length > 0) {
                  arr.push(select[0])
                }
              }
              if (arr.length > 0) {
                rows.shift()
                const result = await sequelize.query(`INSERT INTO documents (nama_dokumen, jenis_dokumen, divisi) VALUES ${rows.map(a => '(?)').join(',')}`,
                  {
                    replacements: rows,
                    type: QueryTypes.INSERT
                  })
                if (result) {
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
              } else {
                rows.shift()
                const result = await sequelize.query(`INSERT INTO documents (nama_dokumen, jenis_dokumen, divisi) VALUES ${rows.map(a => '(?)').join(',')}`,
                  {
                    replacements: rows,
                    type: QueryTypes.INSERT
                  })
                if (result) {
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
  exportSqlDocument: async (req, res) => {
    try {
      const result = await document.findAll()
      if (result) {
        const workbook = new excel.Workbook()
        const worksheet = workbook.addWorksheet()
        const arr = []
        const header = ['Nama Dokumen', 'Jenis Dokumen', 'Divisi']
        const key = ['nama_dokumen', 'jenis_dokumen', 'divisi']
        for (let i = 0; i < header.length; i++) {
          let temp = { header: header[i], key: key[i] }
          arr.push(temp)
          temp = {}
        }
        worksheet.columns = arr
        const cek = worksheet.addRows(result)
        if (cek) {
          const name = new Date().getTime().toString().concat('-dokumen').concat('.xlsx')
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
  approveDoc: async (req, res) => {
    try {
      const level = req.user.level
      const name = req.user.name
      const id = req.params.id
      const schema = joi.object({
        list: joi.array()
      })
      const { value: results, error } = schema.validate(req.body)
      if (error) {
        return response(res, 'Error', { error: error.message }, 404, false)
      } else {
        const list = results.list
        if (list.length > 0) {
          const cek = []
          for (let i = 0; i < list.length; i++) {
            const result = await docUser.findByPk(list[i])
            if (result) {
              const data = {
                status_dokumen: `${result.status_dokumen}, level ${level}; status approve; by ${name} at ${moment().format('DD/MM/YYYY h:mm:ss a')};`,
                status: 3
              }
              const updateData = await result.update(data)
              if (updateData) {
                cek.push(updateData)
              }
            }
          }
          if (cek.length > 0) {
            return response(res, 'success approve dokumen', { result: cek })
          } else {
            return response(res, 'failed to approve dokumen', {}, 404, false)
          }
        } else {
          const result = await docUser.findByPk(id)
          if (result) {
            const data = {
              status_dokumen: `${result.status_dokumen}, level ${level}; status approve; by ${name} at ${moment().format('DD/MM/YYYY h:mm:ss a')};`,
              status: 3
            }
            const updateData = await result.update(data)
            if (updateData) {
              return response(res, 'success approve dokumen', { result: updateData })
            } else {
              return response(res, 'failed to approve dokumen', {}, 404, false)
            }
          } else {
            return response(res, 'failed to approve dokumen', {}, 404, false)
          }
        }
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  rejectDoc: async (req, res) => {
    try {
      const level = req.user.level
      const name = req.user.name
      const id = req.params.id
      const schema = joi.object({
        list: joi.array()
      })
      const { value: results, error } = schema.validate(req.body)
      if (error) {
        return response(res, 'Error', { error: error.message }, 404, false)
      } else {
        const list = results.list
        if (list.length > 0) {
          const cek = []
          for (let i = 0; i < list.length; i++) {
            const result = await docUser.findByPk(list[i])
            if (result) {
              const data = {
                status_dokumen: `${result.status_dokumen}, level ${level}; status reject; by ${name} at ${moment().format('DD/MM/YYYY h:mm:ss a')};`,
                status: 0
              }
              const updateData = await result.update(data)
              if (updateData) {
                cek.push(updateData)
              }
            }
          }
          if (cek.length > 0) {
            return response(res, 'success reject dokumen', { result: cek })
          } else {
            return response(res, 'failed to reject dokumen', {}, 404, false)
          }
        } else {
          const result = await docUser.findByPk(id)
          if (result) {
            const data = {
              status_dokumen: `${result.status_dokumen}, level ${level}; status reject; by ${name} at ${moment().format('DD/MM/YYYY h:mm:ss a')};`,
              status: 0
            }
            const updateData = await result.update(data)
            if (updateData) {
              return response(res, 'success reject dokumen', { updateData })
            } else {
              return response(res, 'failed to reject dokumen', {}, 404, false)
            }
          } else {
            return response(res, 'failed to get dokumen', {}, 404, false)
          }
        }
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  getDocuser: async (req, res) => {
    try {
      const { no, jenis } = req.body
      const finJenis = jenis === undefined || jenis === 'undefined' || jenis === null || jenis === '' ? 'all' : jenis
      console.log(no)
      console.log(jenis)
      const result = await docUser.findAll({
        where: {
          [Op.and]: [
            { no_pengadaan: no },
            jenis === 'all' ? { [Op.not]: { id: null } } : { jenis_form: finJenis }
          ]
        }
      })
      if (result.length > 0) {
        return response(res, 'success get document', { result, no, jenis })
      } else {
        return response(res, 'success get document', { result, no, jenis })
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  getDetailDocument: async (req, res) => {
    try {
      const { nama, kode } = req.query
      const result = await document.findAll({
        where: {
          type: nama,
          kode_plant: kode
        }
      })
      if (result) {
        return response(res, 'success get detail document', { result })
      } else {
        return response(res, 'failed get detail document', {}, 404, false)
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  getDetailId: async (req, res) => {
    try {
      const id = req.params.id
      const result = await document.findByPk(id)
      if (result) {
        return response(res, 'success get detail name document', { result })
      } else {
        return response(res, 'failed get detail name document', {}, 404, false)
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  createNameDocument: async (req, res) => {
    try {
      const level = req.user.level
      const schema = joi.object({
        name: joi.string().required(),
        type: joi.string().required(),
        kode_plant: joi.string().required(),
        menu: joi.string().required(),
        status: joi.string().required()
      })
      const { value: results, error } = schema.validate(req.body)
      if (error) {
        return response(res, 'Error', { error: error.message }, 401, false)
      } else {
        if (level === 1) {
          const findPlant = await namedocs.findAll({
            where: {
              [Op.and]: [
                { kode_plant: results.kode_plant },
                { name: results.name }
              ]
            }
          })
          if (findPlant.length > 0) {
            return response(res, 'Telah terdaftar', {}, 404, false)
          } else {
            const result = await namedocs.create(results)
            if (result) {
              return response(res, 'succesfully create name dokumen', { result })
            } else {
              return response(res, 'failed to create name dokumen', {}, 404, false)
            }
          }
        }
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  updateNameDocument: async (req, res) => {
    try {
      const level = req.user.level
      const id = req.params.id
      const schema = joi.object({
        name: joi.string().required(),
        type: joi.string().required(),
        kode_plant: joi.string().required(),
        menu: joi.string().required(),
        status: joi.string().required()
      })
      const { value: results, error } = schema.validate(req.body)
      if (error) {
        return response(res, 'Error', { error: error.message }, 401, false)
      } else {
        if (level === 1) {
          const findName = await namedocs.findByPk(id)
          if (findName) {
            const findPlant = await namedocs.findAll({
              where: {
                [Op.and]: [
                  { kode_plant: results.kode_plant },
                  { name: results.name }
                ],
                [Op.not]: { id: id }
              }
            })
            if (findPlant.length > 0) {
              return response(res, 'Telah terdaftar', {}, 404, false)
            } else {
              const findApp = await document.findAll({
                where: {
                  [Op.and]: [
                    { kode_plant: results.kode_plant },
                    { type: results.name }
                  ]
                }
              })
              if (findApp.length > 0) {
                const temp = []
                const data = {
                  type: results.name,
                  kode_plant: results.kode_plant
                }
                for (let i = 0; i < findApp.length; i++) {
                  const findData = await document.findByPk(findApp[i].id)
                  if (findData) {
                    await findData.update(data)
                    temp.push(findData)
                  }
                }
                if (temp.length > 0) {
                  const result = await findName.update(results)
                  if (result) {
                    return response(res, 'succesfully update name dokumen', { result })
                  } else {
                    return response(res, 'failed to update name dokumen 1', {}, 404, false)
                  }
                } else {
                  const result = await findName.update(results)
                  if (result) {
                    return response(res, 'succesfully update name dokumen2', { result })
                  } else {
                    return response(res, 'failed to update name dokumen 3', {}, 404, false)
                  }
                }
              } else {
                const result = await findName.update(results)
                if (result) {
                  return response(res, 'succesfully update name dokumen', { result })
                } else {
                  return response(res, 'failed to update name dokumen 4', {}, 404, false)
                }
              }
            }
          } else {
            return response(res, 'failed to update name dokumen 5', {}, 404, false)
          }
        }
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  deleteNameDocument: async (req, res) => {
    try {
      const id = req.params.id
      const level = req.user.level
      if (level === 1) {
        const result = await namedocs.findByPk(id)
        if (result) {
          const findApp = await document.findAll({
            where: {
              type: result.name,
              kode_plant: result.kode_plant
            }
          })
          if (findApp.length > 0) {
            const temp = []
            for (let i = 0; i < findApp.length; i++) {
              const findId = await document.findByPk(findApp[i].id)
              if (findId) {
                await findId.destroy()
                temp.push(findId)
              }
            }
            if (temp.length > 0) {
              await result.destroy()
              return response(res, 'success delete name docs')
            } else {
              await result.destroy()
              return response(res, 'success delete name docs')
            }
          } else {
            await result.destroy()
            return response(res, 'success delete name dokumen')
          }
        } else {
          return response(res, 'failed to delete name dokumen', {}, 404, false)
        }
      } else {
        return response(res, "you're not super admin", {}, 400, false)
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  getTempDocument: async (req, res) => {
    try {
      const { id } = req.query
      const findTemp = await namedocs.findByPk(id)
      if (findTemp) {
        return response(res, 'success get template', { result: findTemp })
      } else {
        return response(res, 'data tidak ditemukan', {}, 404, false)
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  getNameDocument: async (req, res) => {
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
        limit = 100
      } else if (limit === 'all') {
        const findLimit = await namedocs.findAll()
        limit = findLimit.length
      } else {
        limit = parseInt(limit)
      }
      if (!page) {
        page = 1
      } else {
        page = parseInt(page)
      }
      const result = await namedocs.findAndCountAll({
        where: {
          [Op.or]: [
            { name: { [Op.like]: `%${searchValue}%` } },
            { type: { [Op.like]: `%${searchValue}%` } },
            { kode_plant: { [Op.like]: `%${searchValue}%` } }
          ]
        },
        order: [[sortValue, 'ASC']],
        limit: limit,
        offset: (page - 1) * limit
      })
      const pageInfo = pagination('/document/name', req.query, page, limit, result.count)
      if (result) {
        return response(res, 'list document', { result, pageInfo })
      } else {
        return response(res, 'failed to get user', {}, 404, false)
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  }
}
