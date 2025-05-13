const joi = require('joi')
const response = require('../helpers/response')
const { user, role, depo, approve, ttd, role_user } = require('../models') // eslint-disable-line
const bcrypt = require('bcryptjs')
const { Op } = require('sequelize')
const jwt = require('jsonwebtoken')
const { pagination } = require('../helpers/pagination')
const readXlsxFile = require('read-excel-file/node')
const multer = require('multer')
const uploadMaster = require('../helpers/uploadMaster')
const fs = require('fs')
const excel = require('exceljs')
const vs = require('fs-extra')
const { APP_BE, APP_KEY } = process.env

module.exports = {
  addUser: async (req, res) => {
    try {
      const level = req.user.level
      const schema = joi.object({
        username: joi.string().required(),
        email: joi.string().email(),
        fullname: joi.string().required(),
        password: joi.string().required(),
        kode_plant: joi.string().allow(''),
        user_level: joi.number().required(),
        status: joi.string().required(),
        status_it: joi.string().allow(''),
        multi_role: joi.string().allow('')
      })
      const { value: results, error } = schema.validate(req.body)
      if (error) {
        return response(res, 'Error', { error: error.message }, 401, false)
      } else {
        const listRole = results.multi_role.split(',')
        if (level === 1) {
          if (results.user_level === 5 || results.user_level === 9) {
            const result = await user.findAll({ where: { username: results.username } })
            if (result.length > 0) {
              return response(res, 'username already use', {}, 404, false)
            } else {
              const result = await user.findAll({
                where: {
                  [Op.and]: [
                    { kode_plant: results.kode_plant },
                    { user_level: results.user_level }
                  ]
                }
              })
              if (result.length > 0) {
                return response(res, 'kode depo and user level already use', {}, 404, false)
              } else {
                results.password = await bcrypt.hash(results.password, await bcrypt.genSalt())
                const result = await user.create(results)
                if (result) {
                  return response(res, 'Add User succesfully', { result })
                } else {
                  return response(res, 'Fail to create user', {}, 400, false)
                }
              }
            }
          } else {
            const result = await user.findAll({ where: { username: results.username } })
            if (result.length > 0) {
              return response(res, 'username already use', {}, 404, false)
            } else {
              results.password = await bcrypt.hash(results.password, await bcrypt.genSalt())
              const result = await user.create(results)
              if (result) {
                if (listRole.length > 0) {
                  const cek = []
                  for (let i = 0; i < listRole.length; i++) {
                    const find = await role_user.findOne({
                      where: {
                        [Op.and]: [
                          { username: results.username },
                          { id_role: listRole[i] }
                        ]
                      }
                    })
                    if (find) {
                      cek.push(find)
                    } else {
                      const send = {
                        username: results.username,
                        id_role: listRole[i],
                        status: 1
                      }
                      const createRole = await role_user.create(send)
                      if (createRole) {
                        cek.push(createRole)
                      }
                    }
                  }
                  if (cek.length > 0) {
                    return response(res, 'Add User succesfully', { result })
                  } else {
                    return response(res, 'Add User succesfully', { result })
                  }
                } else {
                  return response(res, 'Add User succesfully', { result })
                }
              } else {
                return response(res, 'Fail to create user', {}, 400, false)
              }
            }
          }
        } else {
          return response(res, "You're not super administrator", {}, 404, false)
        }
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  createRole: async (req, res) => {
    try {
      const level = req.user.level
      const schema = joi.object({
        name: joi.string().required(),
        fullname: joi.string().required(),
        nomor: joi.string().required(),
        type: joi.string().required()
      })
      const { value: results, error } = schema.validate(req.body)
      if (error) {
        return response(res, 'Error', { error: error.message }, 401, false)
      } else {
        if (level === 1) {
          const result = await role.findAll({
            where: {
              [Op.or]: [
                { name: results.name },
                { nomor: results.nomor }
              ]
            }
          })
          if (result.length > 0) {
            return response(res, 'role or level already exist', {}, 404, false)
          } else {
            const result = await role.create(results)
            if (result) {
              return response(res, 'Add Role succesfully', { result })
            } else {
              return response(res, 'Fail to create role', {}, 400, false)
            }
          }
        } else {
          return response(res, "You're not super administrator", {}, 404, false)
        }
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  updateUser: async (req, res) => {
    try {
      const level = req.user.level
      const id = req.params.id
      const schema = joi.object({
        username: joi.string().required(),
        fullname: joi.string().required(),
        kode_plant: joi.string().allow(''),
        user_level: joi.number().required(),
        email: joi.string().email().required(),
        status: joi.string().required(),
        status_it: joi.string().allow(''),
        multi_role: joi.string().allow('')
      })
      const { value: results, error } = schema.validate(req.body)
      if (error) {
        return response(res, 'Error', { error: error.message }, 401, false)
      } else {
        const listRole = results.multi_role.split(',')
        if (level !== 0) {
          if (results.user_level === 5 || results.user_level === 9) {
            const result = await user.findAll({
              where: {
                [Op.and]: [
                  { kode_plant: results.kode_plant },
                  { user_level: results.user_level }
                ],
                [Op.not]: { id: id }
              }
            })
            if (result.length > 0) {
              return response(res, 'kode area already use', {}, 404, false)
            } else {
              const result = await user.findAll({
                where: {
                  username: results.username,
                  [Op.not]: { id: id }
                }
              })
              if (result.length > 0) {
                return response(res, 'username already use', { result }, 404, false)
              } else {
                const result = await user.findByPk(id)
                if (result) {
                  await result.update(results)
                  return response(res, 'update User succesfully', { result })
                } else {
                  return response(res, 'Fail to update user', {}, 400, false)
                }
              }
            }
          } else {
            const result = await user.findAll({
              where: {
                username: results.username,
                [Op.not]: { id: id }
              }
            })
            if (result.length > 0) {
              return response(res, 'username already exist', { result }, 404, false)
            } else {
              const findName = await user.findByPk(id)
              const result = await user.findByPk(id)
              if (result && findName) {
                const updateUser = await result.update(results)
                if (updateUser) {
                  if (listRole.length > 0) {
                    const findRole = await role_user.findAll({
                      where: {
                        username: result.username
                      }
                    })
                    const cek = []
                    for (let i = 0; i < listRole.length; i++) {
                      const find = await role_user.findOne({
                        where: {
                          [Op.and]: [
                            { username: findName.username },
                            { id_role: listRole[i] }
                          ]
                        }
                      })
                      const send = {
                        username: results.username,
                        id_role: listRole[i],
                        status: 1
                      }
                      if (find) {
                        const updateRole = await find.update(send)
                        if (updateRole) {
                          cek.push(updateRole)
                        }
                      } else {
                        const createRole = await role_user.create(send)
                        if (createRole) {
                          cek.push(createRole)
                        }
                      }
                    }
                    for (let i = 0; i < findRole.length; i++) {
                      const cekRole = listRole.find(item => item === findRole[i].id_role)
                      if (cekRole === undefined) {
                        const findId = await role_user.findByPk(findRole[i].id)
                        if (findId) {
                          await findId.destroy()
                        }
                      }
                    }
                    if (cek.length > 0) {
                      return response(res, 'Update User succesfully', { result })
                    } else {
                      return response(res, 'Update User succesfully', { result })
                    }
                  } else {
                    return response(res, 'Update User succesfully', { result })
                  }
                } else {
                  return response(res, 'Fail to update user', {}, 400, false)
                }
              } else {
                return response(res, 'Fail to update user', {}, 400, false)
              }
            }
          }
        } else {
          return response(res, "You're not super administrator", {}, 404, false)
        }
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  deleteUser: async (req, res) => {
    try {
      const level = req.user.level
      const id = req.params.id
      if (level === 1) {
        const result = await user.findByPk(id)
        if (result) {
          await result.destroy()
          return response(res, 'delete user success', { result })
        } else {
          return response(res, 'user not found', {}, 404, false)
        }
      } else {
        return response(res, "You're not super administrator", {}, 404, false)
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  getUser: async (req, res) => {
    try {
      let { limit, page, search, sort, filter } = req.query
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
        const findLimit = await user.findAll()
        limit = findLimit.length
      } else {
        limit = parseInt(limit)
      }
      if (!page) {
        page = 1
      } else {
        page = parseInt(page)
      }
      console.log(filter)
      if (filter === 'null' || filter === undefined) {
        const result = await user.findAndCountAll({
          where: {
            [Op.or]: [
              { username: { [Op.like]: `%${searchValue}%` } },
              { fullname: { [Op.like]: `%${searchValue}%` } },
              { email: { [Op.like]: `%${searchValue}%` } },
              { kode_plant: { [Op.like]: `%${searchValue}%` } }
            ],
            [Op.not]: { user_level: 1 }
          },
          include: [
            {
              model: role,
              as: 'role'
            }
          ],
          order: [[sortValue, 'ASC']],
          limit: limit,
          offset: (page - 1) * limit
        })
        const pageInfo = pagination('/user/get', req.query, page, limit, result.count)
        if (result) {
          return response(res, 'list user', { result, pageInfo })
        } else {
          return response(res, 'failed to get user', {}, 404, false)
        }
      } else {
        console.log('masuk id')
        const findRole = await role.findOne({
          where: {
            nomor: filter
          }
        })
        if (findRole) {
          const result = await user.findAndCountAll({
            where: {
              user_level: findRole.nomor,
              [Op.or]: [
                { username: { [Op.like]: `%${searchValue}%` } },
                { fullname: { [Op.like]: `%${searchValue}%` } },
                { email: { [Op.like]: `%${searchValue}%` } },
                { kode_plant: { [Op.like]: `%${searchValue}%` } }
              ],
              [Op.not]: { user_level: 1 }
            },
            order: [[sortValue, 'ASC']],
            limit: limit,
            offset: (page - 1) * limit
          })
          const pageInfo = pagination('/user/get', req.query, page, limit, result.count)
          if (result) {
            return response(res, 'list user', { result, pageInfo })
          } else {
            return response(res, 'failed to get user', {}, 404, false)
          }
        } else {
          return response(res, 'failed to get user1', {}, 404, false)
        }
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  getDetailUser: async (req, res) => {
    try {
      const id = req.params.id
      const result = await user.findOne({
        where: {
          id: id
        },
        include: [
          {
            model: role_user,
            as: 'detail_role'
          }
        ]
      })
      if (result) {
        return response(res, `Profile of user with id ${id}`, { result })
      } else {
        return response(res, 'fail to get user', {}, 400, false)
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  uploadMasterUser: async (req, res) => {
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
          const cek = ['User Name', 'Full Name', 'Kode Area', 'Email', 'User Level']
          const valid = rows[0]
          for (let i = 0; i < cek.length; i++) {
            if (valid[i] === cek[i]) {
              count.push(1)
            }
          }
          if (count.length === cek.length) {
            const plant = []
            const userData = []
            const cek = []
            for (let i = 1; i < rows.length; i++) {
              const a = rows[i]
              if (a[4].split('-')[0] === '5' || a[4].split('-')[0] === 5) {
                plant.push(`Kode depo ${a[3]} dan  User level ${a[4]}`)
              }
              userData.push(`User Name ${a[0]}`)
              cek.push(`${a[0]}`)
            }
            const object = {}
            const result = []
            const obj = {}

            userData.forEach(item => {
              if (!obj[item]) { obj[item] = 0 }
              obj[item] += 1
            })

            for (const prop in obj) {
              if (obj[prop] >= 2) {
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
              const create = []
              for (let i = 0; i < rows.length; i++) {
                const noun = []
                const process = rows[i]
                for (let j = 0; j < (process.length + 1); j++) {
                  if (j === process.length) {
                    let str = 'pma12345'
                    str = await bcrypt.hash(str, await bcrypt.genSalt())
                    noun.push(str)
                  } else {
                    noun.push(process[j])
                  }
                }
                create.push(noun)
              }
              if (create.length > 0) {
                const arr = []
                for (let i = 0; i < create.length; i++) {
                  const dataUser = create[i]
                  const dataCreate = {
                    username: dataUser[0],
                    fullname: dataUser[1],
                    kode_plant: dataUser[2],
                    email: dataUser[3],
                    user_level: dataUser[4].split('-')[0],
                    password: dataUser[5]
                  }
                  const dataUpdate = {
                    username: dataUser[0],
                    fullname: dataUser[1],
                    kode_plant: dataUser[2],
                    email: dataUser[3],
                    user_level: dataUser[4].split('-')[0],
                    password: dataUser[5]
                  }
                  if (parseInt(dataUser[4].split('-')[0]) === 5) {
                    const findUser = await user.findOne({
                      where: {
                        kode_plant: dataUser[2]
                      }
                    })
                    if (findUser) {
                      const upUser = await findUser.update(dataUpdate)
                      if (upUser) {
                        arr.push(upUser)
                      }
                    } else {
                      const createUser = await user.create(dataCreate)
                      if (createUser) {
                        arr.push(createUser)
                      }
                    }
                  } else {
                    const findUser = await user.findOne({
                      where: {
                        username: dataUser[0]
                      }
                    })
                    if (findUser) {
                      const upUser = await findUser.update(dataUpdate)
                      if (upUser) {
                        arr.push(upUser)
                      }
                    } else {
                      const createUser = await user.create(dataCreate)
                      if (createUser) {
                        arr.push(createUser)
                      }
                    }
                  }
                }
                if (arr.length) {
                  fs.unlink(dokumen, function (err) {
                    if (err) {
                      return response(res, 'successfully upload file master')
                    } else {
                      return response(res, 'successfully upload file master')
                    }
                  })
                } else {
                  fs.unlink(dokumen, function (err) {
                    if (err) {
                      return response(res, 'failed to upload file', {}, 404, false)
                    } else {
                      return response(res, 'failed to upload file', {}, 404, false)
                    }
                  })
                }
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
              if (err) {
                return response(res, 'Failed to upload master file, please use the template provided', {}, 400, false)
              } else {
                return response(res, 'Failed to upload master file, please use the template provided', {}, 400, false)
              }
            })
          }
        } catch (error) {
          return response(res, error.message, {}, 500, false)
        }
      })
    } else {
      return response(res, "You're not super administrator", {}, 404, false)
    }
  },
  exportSqlUser: async (req, res) => {
    try {
      const result = await user.findAll()
      if (result) {
        const workbook = new excel.Workbook()
        const worksheet = workbook.addWorksheet()
        const arr = []
        const header = ['User Name', 'Full Name', 'Kode Depo', 'User Level', 'Email']
        const key = ['username', 'password', 'kode_plant', 'user_level', 'email']
        for (let i = 0; i < header.length; i++) {
          let temp = { header: header[i], key: key[i] }
          arr.push(temp)
          temp = {}
        }
        worksheet.columns = arr
        const cek = worksheet.addRows(result)
        if (cek) {
          const name = new Date().getTime().toString().concat('-user').concat('.xlsx')
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
  createUserAuto: async (req, res) => {
    try {
      const level = req.user.level
      if (level === 1) {
        const findKey = await depo.findOne()
        if (findKey) {
          const dataKey = Object.keys(findKey.dataValues)
          const exc = ['createdAt', 'updatedAt']
          for (let i = dataKey.findIndex(x => x === 'nama_nom') - 1; i >= 0; i--) {
            exc.push(dataKey[i])
          }
          const result = await depo.findAll({
            attributes: { exclude: exc }
          })
          const users = await user.findAll()
          if (result) {
            const data = []
            const dataUser = []
            for (let i = 0; i < result.length; i++) {
              data.push(result[i])
            }
            users.map(x => {
              return (
                dataUser.push(x.username)
              )
            })
            const set = new Set(data)
            const newData = [...set]
            const filter = []
            for (let i = 0; i < newData.length; i++) {
              const pos = dataUser.indexOf(newData[i])
              if (pos === -1) {
                filter.push(newData[i])
              }
            }
            return response(res, 'success create user auto', { result })
          // if (filter.length !== 0) {
          //   const send = []
          //   for (let i = 0; i < filter.length; i++) {
          //     const create = [filter[i], await bcrypt.hash(filter[i], await bcrypt.genSalt()), 3]
          //     send.push(create)
          //   }
          //   const results = await sequelize.query(`INSERT INTO user (username, password, user_level) VALUES ${send.map(a => '(?)').join(',')}`,
          //     {
          //       replacements: send,
          //       type: QueryTypes.INSERT
          //     })
          //   if (results) {
          //     return response(res, 'success create user pic')
          //   } else {
          //     return response(res, 'failed create user pic', {}, 404, false)
          //   }
          // } else {
          //   return response(res, 'All Pic has user account')
          // }
          } else {
            return response(res, 'failed get pic', {}, 404, false)
          }
        } else {
          return response(res, 'failed get pic', {}, 404, false)
        }
      } else {
        return response(res, "You're not super administrator", {}, 404, false)
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  changePassword: async (req, res) => {
    try {
      const id = req.user.id
      const schema = joi.object({
        current: joi.string().required(),
        new: joi.string().required()
      })
      const { value: results, error } = schema.validate(req.body)
      if (error) {
        return response(res, 'Error', { error: error.message }, 401, false)
      } else {
        const send = await bcrypt.hash(results.new, await bcrypt.genSalt())
        const findUser = await user.findByPk(id)
        if (findUser) {
          bcrypt.compare(results.current, findUser.password, function (_err, result) {
            if (result) {
              const data = {
                password: send
              }
              const updatePass = findUser.update(data)
              if (updatePass) {
                return response(res, 'success change password')
              } else {
                return response(res, 'success change password2')
              }
            } else {
              return response(res, 'failed change password', {}, 400, false)
            }
          })
        } else {
          return response(res, 'failed change password', {}, 400, false)
        }
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  resetPassword: async (req, res) => {
    try {
      const id = req.params.id
      const schema = joi.object({
        new: joi.string().required()
      })
      const { value: results, error } = schema.validate(req.body)
      if (error) {
        return response(res, 'Error', { error: error.message }, 401, false)
      } else {
        const send = await bcrypt.hash(results.new, await bcrypt.genSalt())
        const findUser = await user.findByPk(id)
        if (findUser) {
          const data = {
            password: send
          }
          const updatePass = findUser.update(data)
          if (updatePass) {
            return response(res, 'success reset password')
          } else {
            return response(res, 'success reset password2')
          }
        } else {
          return response(res, 'failed reset password', {}, 400, false)
        }
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  //   createUserpv: async (req, res) => {
  //     try {
  //       const level = req.user.level
  //       if (level === 1) {
  //         const result = await pic.findAll()
  //         const user = await user.findAll()
  //         if (result) {
  //           const data = []
  //           const dataUser = []
  //           result.map(x => {
  //             return (
  //               data.push(x.spv)
  //             )
  //           })
  //           user.map(x => {
  //             return (
  //               dataUser.push(x.username)
  //             )
  //           })
  //           const set = new Set(data)
  //           const newData = [...set]
  //           const filter = []
  //           for (let i = 0; i < newData.length; i++) {
  //             const pos = dataUser.indexOf(newData[i])
  //             if (pos === -1) {
  //               filter.push(newData[i])
  //             }
  //           }
  //           console.log(filter)
  //           if (filter.length !== 0) {
  //             const send = []
  //             for (let i = 0; i < filter.length; i++) {
  //               const create = [filter[i], await bcrypt.hash(filter[i], await bcrypt.genSalt()), 2]
  //               send.push(create)
  //             }
  //             const results = await sequelize.query(`INSERT INTO user (username, password, user_level) VALUES ${send.map(a => '(?)').join(',')}`,
  //               {
  //                 replacements: send,
  //                 type: QueryTypes.INSERT
  //               })
  //             if (results) {
  //               return response(res, 'success create user pic', { send })
  //             } else {
  //               return response(res, 'failed create user pic', {}, 404, false)
  //             }
  //           } else {
  //             return response(res, 'All SPV has user account')
  //           }
  //         } else {
  //           return response(res, 'failed get pic', {}, 404, false)
  //         }
  //       } else {
  //         return response(res, "You're not super administrator", {}, 404, false)
  //       }
  //     } catch (error) {
  //       return response(res, error.message, {}, 500, false)
  //     }
  //   }
  getRole: async (req, res) => {
    try {
      const { search } = req.query
      let searchValue = ''
      if (typeof search === 'object') {
        searchValue = Object.values(search)[0]
      } else {
        searchValue = search || ''
      }
      const result = await role.findAll({
        where: {
          [Op.not]: { name: 'admin' },
          [Op.or]: [
            { name: { [Op.like]: `%${searchValue}%` } },
            { fullname: { [Op.like]: `%${searchValue}%` } }
          ]
        }
      })
      if (result) {
        return response(res, 'succes get role', { result })
      } else {
        return response(res, 'failed get role', {}, 404, false)
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  getDetailRole: async (req, res) => {
    try {
      const id = req.params.id
      const result = await role.findByPk(id)
      if (result) {
        return response(res, `Profile of role with id ${id}`, { result })
      } else {
        return response(res, 'fail to get role', {}, 400, false)
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  updateRole: async (req, res) => {
    try {
      const level = req.user.level
      const id = req.params.id
      const schema = joi.object({
        name: joi.string().required(),
        fullname: joi.string().required(),
        type: joi.string().required(),
        nomor: joi.string().required()
      })
      const { value: results, error } = schema.validate(req.body)
      if (error) {
        return response(res, 'Error', { error: error.message }, 401, false)
      } else {
        if (level === 1) {
          const result = await role.findAll({
            where: {
              name: results.name,
              [Op.not]: { id: id }
            }
          })
          if (result.length > 0) {
            return response(res, 'role or level already exist', {}, 404, false)
          } else {
            const findRole = await role.findByPk(id)
            const findRoleUp = await role.findByPk(id)
            if (findRole) {
              const result = await findRoleUp.update(results)
              if (result) {
                const findTtd = await ttd.findAll({
                  where: {
                    [Op.and]: [
                      { jabatan: findRole.name },
                      { nama: null }
                    ]
                  }
                })
                const findApp = await approve.findAll({
                  where: {
                    jabatan: findRole.name
                  }
                })
                if (findTtd.length > 0 || findApp.length > 0) {
                  const temp = []
                  const hasil = []
                  for (let i = 0; i < findTtd.length; i++) {
                    const findData = await ttd.findByPk(findTtd[i].id)
                    const upData = {
                      jabatan: results.name
                    }
                    if (findData) {
                      await findData.update(upData)
                      temp.push(1)
                    }
                  }
                  for (let i = 0; i < findApp.length; i++) {
                    const findData = await approve.findByPk(findApp[i].id)
                    const upData = {
                      jabatan: results.name
                    }
                    if (findData) {
                      await findData.update(upData)
                      hasil.push(1)
                    }
                  }
                  if (temp.length || hasil.length) {
                    return response(res, 'update Role succesfully good', { result, findTtd, findApp, findRole, temp, hasil })
                  } else {
                    return response(res, 'update Role succesfully wut', { result, findTtd, findApp, findRole })
                  }
                } else {
                  return response(res, 'update Role succesfully bad', { result, findTtd, findApp, findRole })
                }
              } else {
                return response(res, 'Fail to create role', {}, 400, false)
              }
            } else {
              return response(res, 'Fail to create role', {}, 400, false)
            }
          }
        } else {
          return response(res, "You're not super administrator", {}, 404, false)
        }
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  updatePassword: async (req, res) => {
    try {
      const level = req.user.level
      if (level === 1) {
        const findUser = await user.findAll()
        if (findUser.length > 0) {
          const password = 'pma12345'
          const hashPass = await bcrypt.hash(password, await bcrypt.genSalt())
          const data = {
            password: hashPass
          }
          const cek = []
          for (let i = 0; i < findUser.length; i++) {
            if (findUser[i].user_level === 1) {
              cek.push(findUser[i])
            } else {
              const findData = await user.findByPk(findUser[i].id)
              if (findData) {
                await findData.update(data)
                cek.push(findData)
              }
            }
          }
          if (cek.length) {
            return response(res, 'success to update password')
          } else {
            return response(res, 'Fail to update password', {}, 400, false)
          }
        } else {
          return response(res, 'Fail to update password', {}, 400, false)
        }
      } else {
        return response(res, "You're not super administrator", {}, 404, false)
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  choosePlant: async (req, res) => {
    try {
      const schema = joi.object({
        kode: joi.string().required()
      })
      const { value: results, error } = schema.validate(req.body)
      if (error) {
        return response(res, 'Error', { error: error.message }, 401, false)
      } else {
        const result = await user.findOne({
          where: {
            kode_plant: results.kode
          }
        })
        if (result) {
          return response(res, 'success to choose kode', { result })
        } else {
          return response(res, 'Failed to choose kode', {}, 400, false)
        }
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  getLogin: async (req, res) => {
    try {
      const id = req.params.id
      const findId = await user.findByPk(id)
      if (findId) {
        const result = await user.findAll({
          where: {
            [Op.or]: [
              // { username: results.username },
              { email: findId.email }
            ]
          },
          include: [
            { model: role, as: 'role' }
          ]
        })
        if (result) {
          return response(res, 'success to get login', { result })
        } else {
          return response(res, 'Failed to get login', {}, 400, false)
        }
      } else {
        return response(res, 'Failed to get login', {}, 400, false)
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  getToken: async (req, res) => {
    try {
      const id = req.params.id
      const findId = await user.findOne({
        where: {
          id: id
        },
        include: [
          { model: role, as: 'role' }
        ]
      })
      if (findId) {
        const { id, username, fullname, email, role } = findId
        jwt.sign({ id: id, level: findId.user_level, kode: findId.kode_plant, name: username, fullname: fullname, role: role.name }, `${APP_KEY}`, (_err, token) => {
          return response(res, 'login success', {
            result: {
              id,
              kode_plant: findId.kode_plant,
              user_level: findId.user_level,
              username,
              fullname,
              email,
              role: role.name,
              findId,
              Token: `${token}`
            }
          })
        })
      } else {
        return response(res, 'Failed to get login', {}, 400, false)
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  }
}
