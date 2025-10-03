const { email, sequelize, tempmail, pengadaan, disposal, stock, mutasi, role, depo, user } = require('../models')
const joi = require('joi')
const { pagination } = require('../helpers/pagination')
const response = require('../helpers/response')
const { Op, QueryTypes } = require('sequelize')
const readXlsxFile = require('read-excel-file/node')
const multer = require('multer')
const uploadMaster = require('../helpers/uploadMaster')
const fs = require('fs')
const excel = require('exceljs')
const vs = require('fs-extra')
const { APP_BE } = process.env
// const mailer = require('../helpers/mailer')

module.exports = {
  addEmail: async (req, res) => {
    try {
      const level = req.user.level
      const schema = joi.object({
        kode_plant: joi.string().required(),
        email_area_aos: joi.string().required().email(),
        email_area_om: joi.string().required().email(),
        email_staff_purch: joi.string().required().email(),
        email_spv_purch_1: joi.string().email().required(),
        email_spv_purch_2: joi.string().email().required(),
        email_manager_purch: joi.string().email().required(),
        email_spv_asset: joi.string().email().required(),
        email_am: joi.string().email().required(),
        email_aam: joi.string().email().required(),
        email_ga_spv: joi.string().email().required(),
        email_staff_ga: joi.string().email().allow(''),
        email_it_spv: joi.string().email().allow(''),
        email_ism: joi.string().email().allow('')
      })
      const { value: results, error } = schema.validate(req.body)
      if (error) {
        return response(res, 'Error', { error: error.message }, 401, false)
      } else {
        if (level === 1) {
          const result = await email.findAll({
            where: {
              kode_plant: results.kode_plant
            }
          })
          if (result.length > 0) {
            return response(res, 'kode plant already exist', {}, 400, false)
          } else {
            const result = await email.create(results)
            if (result) {
              return response(res, 'successfully add email', { result })
            } else {
              return response(res, 'failed to add email', {}, 400, false)
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
  getEmail: async (req, res) => {
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
      const result = await email.findAndCountAll({
        where: {
          [Op.or]: [
            { kode_plant: { [Op.like]: `%${searchValue}%` } },
            { email_staff_purch: { [Op.like]: `%${searchValue}%` } },
            { email_am: { [Op.like]: `%${searchValue}%` } },
            { email_area_aos: { [Op.like]: `%${searchValue}%` } },
            { email_area_om: { [Op.like]: `%${searchValue}%` } },
            { email_spv_purch_1: { [Op.like]: `%${searchValue}%` } },
            { email_spv_purch_2: { [Op.like]: `%${searchValue}%` } },
            { email_spv_asset: { [Op.like]: `%${searchValue}%` } },
            { email_aam: { [Op.like]: `%${searchValue}%` } },
            { email_manager_purch: { [Op.like]: `%${searchValue}%` } },
            { email_ga_spv: { [Op.like]: `%${searchValue}%` } },
            { email_staff_ga: { [Op.like]: `%${searchValue}%` } },
            { email_it_spv: { [Op.like]: `%${searchValue}%` } },
            { email_ism: { [Op.like]: `%${searchValue}%` } }
          ]
        },
        order: [[sortValue, 'ASC']],
        limit: limit,
        offset: (page - 1) * limit
      })
      const pageInfo = pagination('/email/get', req.query, page, limit, result.count)
      if (result) {
        return response(res, 'list users', { result, pageInfo })
      } else {
        return response(res, 'failed to get user', {}, 404, false)
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  getDetailEmail: async (req, res) => {
    try {
      const id = req.params.id
      const schema = joi.object({
        kode_plant: joi.string()
      })
      const { value: results, error } = schema.validate(req.body)
      if (error) {
        return response(res, 'Error', { error: error.message }, 401, false)
      } else {
        if (results.kode_plant) {
          const result = await email.findOne({ where: { kode_plant: results.kode_plant } })
          if (result) {
            return response(res, 'success get email', { result })
          } else {
            return response(res, 'email not found', {}, 404, false)
          }
        } else {
          const result = await email.findByPk(id)
          if (result) {
            return response(res, 'success get email', { result })
          } else {
            return response(res, 'email not found', {}, 404, false)
          }
        }
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  updateEmail: async (req, res) => {
    try {
      const level = req.user.level
      const id = req.params.id
      const schema = joi.object({
        kode_plant: joi.string(),
        email_spv_purch_1: joi.string().email(),
        email_spv_purch_2: joi.string().email(),
        email_area_aos: joi.string().email(),
        email_area_om: joi.string().email(),
        email_staff_purch: joi.string().email(),
        email_manager_purch: joi.string().email(),
        email_spv_asset: joi.string().email(),
        email_am: joi.string().email(),
        email_aam: joi.string().email(),
        email_ga_spv: joi.string().email(),
        email_staff_ga: joi.string().email().allow(''),
        email_it_spv: joi.string().email().allow(''),
        email_ism: joi.string().email().allow('')
      })
      const { value: results, error } = schema.validate(req.body)
      if (error) {
        return response(res, 'Error', { error: error.message }, 401, false)
      } else {
        if (level === 1) {
          if (results.kode_plant) {
            const result = await email.findAll({
              where:
              {
                kode_plant: results.kode_plant,
                [Op.not]: { id: id }
              }
            })
            if (result.length > 0) {
              return response(res, 'kode plant already use', {}, 400, false)
            } else {
              const result = await email.findByPk(id)
              if (result) {
                await result.update(results)
                return response(res, 'successfully update email', { result })
              } else {
                return response(res, 'failed update email', {}, 404, false)
              }
            }
          } else {
            const result = await email.findByPk(id)
            if (result) {
              await result.update(results)
              return response(res, 'successfully update email', { result })
            } else {
              return response(res, 'failed update email', {}, 404, false)
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
  deleteEmail: async (req, res) => {
    try {
      const level = req.user.level
      const id = req.params.id
      if (level === 1) {
        const result = await email.findByPk(id)
        console.log(result)
        if (result) {
          await result.destroy()
          return response(res, 'successfully delete email', { result })
        } else {
          return response(res, 'failed to delete email', {}, 404, false)
        }
      } else {
        return response(res, "you're not super administrator", {}, 400, false)
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  uploadMasterEmail: async (req, res) => {
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
          const cek = ['Kode Plant', 'Email Area AOS', 'Email Asman', 'Email Area OM', 'Email Staff Purch', 'Email Spv Purch 1', 'Email Spv Purch 2', 'Email Manager Purch', 'Email Spv ASET', 'Email AM', 'Email AAM', 'Email GA SPV', 'Email Staff GA', 'Email IT SPV', 'Email ISM', 'Email Staff Aset 1', 'Email Staff Aset 2', 'Email NOM', 'Email BM', 'Email SPV Tax', 'Email FM', 'Email AFM', 'Email Staff It', 'Email Staff Tax', 'Email SPV Finance', 'Email Staff admbank']
          const valid = rows[0]
          for (let i = 0; i < cek.length; i++) {
            if (valid[i] === cek[i]) {
              count.push(1)
            }
          }
          if (count.length === cek.length) {
            const plant = []
            const kode = []
            for (let i = 1; i < rows.length; i++) {
              const a = rows[i]
              plant.push(`Kode Plant ${a[0]}`)
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
                const select = await sequelize.query(`SELECT kode_plant from emails WHERE kode_plant='${kode[i]}'`, {
                  type: QueryTypes.SELECT
                })
                await sequelize.query(`DELETE from emails WHERE kode_plant='${kode[i]}'`, {
                  type: QueryTypes.DELETE
                })
                if (select.length > 0) {
                  arr.push(select[0])
                }
              }
              if (arr.length > 0) {
                rows.shift()
                const result = await sequelize.query(`INSERT INTO emails (kode_plant, email_area_aos, email_asman, email_area_om, email_staff_purch, email_spv_purch_1, email_spv_purch_2, email_manager_purch, email_spv_asset, email_am, email_aam, email_ga_spv, email_staff_ga, email_it_spv, email_ism, email_staff_asset1, email_staff_asset2, email_nom, email_bm, email_spv_tax, email_fm, email_afm, email_staff_it, email_staff_tax, email_spv_finance, email_staff_admbank) VALUES ${rows.map(a => '(?)').join(',')}`,
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
                const result = await sequelize.query(`INSERT INTO emails (kode_plant, email_area_aos, email_asman, email_area_om, email_staff_purch, email_spv_purch_1, email_spv_purch_2, email_manager_purch, email_spv_asset, email_am, email_aam, email_ga_spv, email_staff_ga, email_it_spv, email_ism, email_staff_asset1, email_staff_asset2, email_nom, email_bm, email_spv_tax, email_fm, email_afm, email_staff_it, email_staff_tax, email_spv_finance, email_staff_admbank) VALUES ${rows.map(a => '(?)').join(',')}`,
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
  exportSqlEmail: async (req, res) => {
    try {
      const result = await email.findAll()
      if (result) {
        const workbook = new excel.Workbook()
        const worksheet = workbook.addWorksheet()
        const arr = []
        const header = ['Kode Plant', 'Email Area AOS', 'Email Asman', 'Email Area OM', 'Email Staff Purch', 'Email Spv Purch 1', 'Email Spv Purch 2', 'Email Manager Purch', 'Email Spv ASET', 'Email AM', 'Email AAM', 'Email GA SPV', 'Email Staff GA', 'Email IT SPV', 'Email ISM', 'Email Staff Aset 1', 'Email Staff Aset 2', 'Email NOM', 'Email BM', 'Email SPV Tax', 'Email FM', 'Email AFM', 'Email Staff It', 'Email Staff Tax', 'Email SPV Finance', 'Email Staff admbank']
        const key = ['kode_plant', 'email_area_aos', 'email_asman', 'email_area_om', 'email_staff_purch', 'email_spv_purch_1', 'email_spv_purch_2', 'email_manager_purch', 'email_spv_asset', 'email_am', 'email_aam', 'email_ga_spv', 'email_staff_ga', 'email_it_spv', 'email_ism', 'email_staff_asset1', 'email_staff_asset2', 'email_nom', 'email_bm', 'email_spv_tax', 'email_fm', 'email_afm', 'email_staff_it', 'email_staff_tax', 'email_spv_finance', 'email_staff_admbank']
        for (let i = 0; i < header.length; i++) {
          let temp = { header: header[i], key: key[i] }
          arr.push(temp)
          temp = {}
        }
        worksheet.columns = arr
        const cek = worksheet.addRows(result)
        if (cek) {
          const name = new Date().getTime().toString().concat('-email').concat('.xlsx')
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
  },
  draftEmail: async (req, res) => {
    try {
      const name = req.user.name
      const level = req.user.level
      const { no, kode, tipe, menu, jenis } = req.body
      const transaksi = jenis === 'pengadaan' ? pengadaan : jenis === 'disposal' ? disposal : jenis === 'mutasi' ? mutasi : stock

      const findRole = await role.findOne({
        where: {
          nomor: level
        }
      })
      const findDepo = await depo.findOne({
        where: {
          kode_plant: kode
        }
      })
      const findTrans = await transaksi.findOne({
        where: {
          no_transaksi: no,
          [Op.and]: [
            tipe === 'revisi' ? { [Op.not]: { people_reject: null } } : { [Op.not]: { id: null } }
          ]
        }
      })
      const findAllTrans = await transaksi.findAll({
        where: {
          no_transaksi: no
        }
      })
      if (findRole && findDepo && findTrans && findAllTrans.length > 0) {
        const listName = Object.values(findDepo.dataValues)
        if (tipe === 'submit') {
          const findDraft = await tempmail.findOne({
            where: {
              [Op.and]: [
                { type: tipe },
                { menu: menu }
              ],
              [Op.or]: [
                { access: { [Op.like]: '%all' } },
                { access: { [Op.like]: `%${kode}` } }
              ]
            }
          })
          if (findDraft) {
            const temp = []
            const arrCc = findDraft.cc.split(',')
            for (let i = 0; i < arrCc.length; i++) {
              const findLevel = await role.findOne({
                where: {
                  name: arrCc[i]
                }
              })
              if (findLevel && findLevel.type === 'area') {
                const findDraftUser = await user.findAll({
                  where: {
                    level: findLevel.level
                  },
                  include: [
                    {
                      model: role,
                      as: 'role'
                    }
                  ]
                })
                if (findDraftUser) {
                  for (let i = 0; i < findDraftUser.length; i++) {
                    const findName = findDraftUser[i].fullname === null ? '' : findDraftUser[i].fullname
                    const findEmail = findDraftUser[i].email === null ? '' : findDraftUser[i].email
                    if (listName.find(e => e !== null && (e.toString().toLowerCase() === findName.toLowerCase() || e.toString().toLowerCase() === findEmail.toLowerCase())) !== undefined) {
                      temp.push(findDraftUser[i])
                    }
                  }
                }
              } else if (findLevel && findLevel.type !== 'area') {
                const findDraftUser = await user.findOne({
                  where: {
                    level: findLevel.level
                  },
                  include: [
                    {
                      model: role,
                      as: 'role'
                    }
                  ]
                })
                if (findDraftUser) {
                  temp.push(findDraftUser)
                }
              }
            }
            if (temp.length > 0) {
              let noLevel = null
              // const tempStat = findTrans.status_transaksi
              // const cekData = findAllTrans.find(({stat_skb}) => stat_skb === 'ya') === undefined ? 'ya' : 'no' // eslint-disable-line
              // const tipeStat = tempStat === 2 ? 2 : 5
              // const tipeStat = cekData === 'ya' ? 2 : 4
              const tipeStat = 2
              for (let i = 0; i < 1; i++) {
                const findLevel = await role.findOne({
                  where: {
                    level: tipeStat
                  }
                })
                if (findLevel) {
                  noLevel = findLevel
                }
              }
              if (noLevel.type === 'area') {
                const findUser = await user.findAll({
                  where: {
                    level: noLevel.level
                  },
                  include: [
                    {
                      model: role,
                      as: 'role'
                    }
                  ]
                })
                if (findUser.length > 0) {
                  let toMail = null
                  for (let i = 0; i < findUser.length; i++) {
                    const findName = findUser[i].fullname === null ? '' : findUser[i].fullname
                    const findEmail = findUser[i].email === null ? '' : findUser[i].email
                    if (listName.find(e => e !== null && (e.toString().toLowerCase() === findName.toLowerCase() || e.toString().toLowerCase() === findEmail.toLowerCase())) !== undefined) {
                      toMail = findUser[i]
                    }
                  }
                  if (toMail !== null) {
                    if (findDraft) {
                      return response(res, 'success get draft email', { from: name, to: toMail, cc: temp, result: findDraft })
                    } else {
                      return response(res, 'failed get email 2', { toMail }, 404, false)
                    }
                  } else {
                    return response(res, 'failed get email 1 king', { toMail, findUser, listName }, 404, false)
                  }
                } else {
                  return response(res, 'failed get email 0', { findUser }, 404, false)
                }
              } else {
                const findUser = await user.findOne({
                  where: {
                    level: noLevel.level
                  },
                  include: [
                    {
                      model: role,
                      as: 'role'
                    }
                  ]
                })
                if (findUser) {
                  return response(res, 'success get draft email', { from: name, to: findUser, cc: temp, result: findDraft })
                } else {
                  return response(res, 'failed get email5', { findUser }, 404, false)
                }
              }
            } else {
              return response(res, 'failed get email4', { temp }, 404, false)
            }
          } else {
            return response(res, 'failed get email3', { findDraft }, 404, false)
          }
        }
      } else {
        return response(res, 'failed get email 1', { findRole, findDepo, findTrans }, 404, false)
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  }
//   sendMail: async (req, res) => {
//     try {
//       const level = req.user.level
//       const schema = joi.object({
//         kode_plant: joi.string().required()
//       })
//       const { value: results, error } = schema.validate(req.body)
//       if (error) {
//         return response(res, 'Error', { error: error }, 401, false)
//       } else {
//         if (level === 1) {
//           const result = await email.findAll({ where: { kode_plant: results.kode_plant } })
//           if (result) {
//             console.log(result[0].email_staff_purch)
//             const mailOptions = {
//               from: `${result[0].email_staff_purch}`,
//               replyTo: `${result[0].email_staff_purch}`,
//               to: `${result[0].email_manager_purch}`,
//               cc: `${result[0].email_area}, ${result[0].email_am}, ${result[0].email_ga_spv === null ? '' : result[0].email_ga_spv}, ${result[0].email_staff_ga === null ? '' : result[0].email_staff_ga}, ${result[0].email_it_spv === null ? '' : result[0].email_it_spv}, ${result[0].email_ism === null ? '' : result[0].email_ism}`,
//               subject: 'coba lagi bre',
//               html: 'klik link dibawah untuk reset/ganti password anda \n https://google.com'
//             }
//             mailer.sendMail(mailOptions, (error, result) => {
//               if (error) {
//                 return response(res, 'failed to send email', { error: error }, 401, false)
//               } else if (result) {
//                 return response(res, 'success send email', { result: result })
//               }
//             })
//           } else {
//             return response(res, 'kode plant not found', {}, 401, false)
//           }
//         } else {
//           return response(res, "You're not super administrator", {}, 404, false)
//         }
//       }
//     } catch (error) {
//       return response(res, error.message, {}, 500, false)
//     }
//   },
}
