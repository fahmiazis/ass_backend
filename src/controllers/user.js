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
const axios = require('axios')

const EDOT_CONFIG = {
  baseUrl: 'https://staging.nabatisnack.co.id',
  username: 'pma',
  password: 'king',
  appId: 'pma',
  codeCipher: "647445"
}

// Token static dari login manual via Postman
const STATIC_TOKEN = "MCzqiWeyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9MJQq.TIVJOcjeyJkYXRhIjp7ImFjY2Vzc190b2tlbiI6IjhTRC1oMXQ3S2FrT0F0eVVvNmhUQ3pmRFRPejd2d0xMIiwiZ3JvdXAiOiIiLCJuYW1lIjoiIiwic2VjdGlvbiI6IiIsInVzZXJfaWQiOiJwbWEiLCJ1c2VybmFtZSI6InBtYSJ9LCJleHAiOjE3NjM3MDUwNDgsImlhdCI6MTc2MzYxODY0OCwiaXNzIjoicG1hIiwianRpIjoieXZZc2I4WWo5RTBtOXpBRjI4TzA3RjE4dmZrNlcyNTkybVFJNW41UnA3SEJRS2hNR3Ftc25MQUVYYUExc05CWURYUFg1LWpqUFh3a2I2QU0xT0F3VUEiLCJuYmYiOjE3NjM2MTg2NDh9oCiS.GeEzamZzZZnAsxr0f1l8_RFzvcqgv5Xl3WiMZhUw5PKiRLS1I3Hrm3-7VKIeTFGJjaxAB0Xs8J2mWueZXYFLYbiZI-XB8eDIhj7LlviBgAWwHqFSV3iWNj3gcO8aPGCnQfS4aaCzoxN6_UJH6H2R0Ha8h2t7ecC9JLb1Wad22NXi6z6QZFxeSxakR6lOkR0Zy4R7CH3T1mvZb6KZ6ME-_4vlLTe1h9akRtR5FdhnD93v5tBae0-EB1VthcuXyX8Ur_JMps3Wh_7tD7gD55coU0rJOBuhxXvBGTO2Psm45Ws-loe6YjcMUa9eWOfjfOLD7SBQTn4arQ9457NQgRcLGadUJQyxRTa.241"

const decodeCustomToken = (token, codeCipher) => {
  try {
    console.log('masuk decode')
    console.log('Code cipher:', codeCipher)
    
    var parts = token.split('.')
    if (parts.length !== 4) {
      throw new Error('Invalid token format, expected 4 parts but got ' + parts.length)
    }

    // Code cipher format (6 digit):
    // Digit 1 = Header prefix
    // Digit 2 = Header suffix
    // Digit 3 = Payload prefix
    // Digit 4 = Payload suffix
    // Digit 5 = Signature prefix
    // Digit 6 = Signature suffix
    
    var headerPrefix = parseInt(codeCipher.substring(0, 1))
    var headerSuffix = parseInt(codeCipher.substring(1, 2))
    var payloadPrefix = parseInt(codeCipher.substring(2, 3))
    var payloadSuffix = parseInt(codeCipher.substring(3, 4))
    var signaturePrefix = parseInt(codeCipher.substring(4, 5))
    var signatureSuffix = parseInt(codeCipher.substring(5, 6))
    
    console.log('Header salt - prefix:', headerPrefix, 'suffix:', headerSuffix)
    console.log('Payload salt - prefix:', payloadPrefix, 'suffix:', payloadSuffix)
    console.log('Signature salt - prefix:', signaturePrefix, 'suffix:', signatureSuffix)

    // Remove salt dari setiap part
    var removeSalt = function(str, prefix, suffix) {
      if (suffix === 0) {
        return str.substring(prefix)
      }
      return str.substring(prefix, str.length - suffix)
    }

    var header = removeSalt(parts[0], headerPrefix, headerSuffix)
    var payload = removeSalt(parts[1], payloadPrefix, payloadSuffix)
    var signature = removeSalt(parts[2], signaturePrefix, signatureSuffix)
    var id = parts[3]

    console.log('Header (cleaned):', header)
    console.log('Payload (cleaned):', payload.substring(0, 50) + '...')

    // Reconstruct JWT token
    var reconstructedToken = header + '.' + payload + '.' + signature
    
    // Decode JWT
    var decoded = jwt.decode(reconstructedToken)
    console.log('Decoded token:', decoded)
    
    // Jika jwt.decode gagal, coba decode payload langsung
    if (!decoded) {
      console.log('jwt.decode failed, trying manual base64 decode...')
      try {
        var base64Payload = payload.replace(/-/g, '+').replace(/_/g, '/')
        while (base64Payload.length % 4) {
          base64Payload += '='
        }
        var jsonPayload = Buffer.from(base64Payload, 'base64').toString('utf8')
        console.log('Manual decoded payload:', jsonPayload)
        decoded = JSON.parse(jsonPayload)
      } catch (e) {
        console.log('Manual decode also failed:', e.message)
      }
    }
    
    return {
      decoded: decoded,
      reconstructedToken: reconstructedToken,
      id: id,
      saltInfo: {
        header: { prefix: headerPrefix, suffix: headerSuffix },
        payload: { prefix: payloadPrefix, suffix: payloadSuffix },
        signature: { prefix: signaturePrefix, suffix: signatureSuffix }
      },
      parts: {
        original: {
          header: parts[0],
          payload: parts[1],
          signature: parts[2]
        },
        cleaned: {
          header: header,
          payload: payload,
          signature: signature
        }
      }
    }
  } catch (error) {
    throw new Error('Failed to decode token: ' + error.message)
  }
}

// Fungsi untuk login dan dapat token (pakai static token)
const getEdotToken = async () => {
  try {
    console.log('masuk get edot token')
    
    // Decode token untuk extract access_token dan jti
    const result = decodeCustomToken(STATIC_TOKEN, EDOT_CONFIG.codeCipher)
    
    return {
      access_token: result.decoded.data.access_token,
      jti: result.decoded.jti,
      exp: result.decoded.exp,
      decoded: result.decoded, // Return full decoded untuk debugging
      reconstructedToken: result.reconstructedToken
    }
  } catch (error) {
    throw new Error(`Login failed: ${error.message}`)
  }
}

// Fungsi untuk refresh token
const refreshEdotToken = async (jti) => {
  try {
    const refreshResponse = await axios.post(
      `${EDOT_CONFIG.baseUrl}/gateway/auth/refresh`,
      { refresh_token: jti },
      {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      }
    )
    
    const refreshData = refreshResponse.data
    const result = decodeCustomToken(refreshData.token, EDOT_CONFIG.codeCipher)
    
    return {
      access_token: result.decoded.data.access_token,
      jti: result.decoded.jti,
      exp: result.decoded.exp,
      decoded: result.decoded
    }
  } catch (error) {
    if (error.response && error.response.status === 404) {
      return null // Need re-login
    }
    throw error
  }
}

// Fungsi helper untuk make API call dengan auto refresh
const makeEdotRequest = async (endpoint, method = 'GET') => {
  let tokenData = await getEdotToken()
  
  try {
    const apiResponse = await axios({
      method: method,
      url: `${EDOT_CONFIG.baseUrl}${endpoint}`,
      headers: {
        'Authorization': `Bearer ${tokenData.access_token}`,
        'Content-Type': 'application/json'
      }
    })
    
    return {
      data: apiResponse.data,
      tokenInfo: tokenData // Include token info untuk debugging
    }
  } catch (error) {
    // Jika error 440 (token expired), coba refresh
    if (error.response && error.response.status === 440) {
      console.log('Token expired, trying to refresh...')
      
      const refreshedToken = await refreshEdotToken(tokenData.jti)
      
      if (!refreshedToken) {
        throw new Error('Token expired and refresh failed. Please update STATIC_TOKEN with new token from Postman.')
      }
      
      tokenData = refreshedToken
      
      const retryResponse = await axios({
        method: method,
        url: `${EDOT_CONFIG.baseUrl}${endpoint}`,
        headers: {
          'Authorization': `Bearer ${tokenData.access_token}`,
          'Content-Type': 'application/json'
        }
      })
      
      return {
        data: retryResponse.data,
        tokenInfo: tokenData
      }
    }
    
    throw error
  }
}

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
      const { listId } = req.body
      console.log(req.body)
      if (level === 1) {
        if (listId !== undefined && listId.length > 0) {
          const cekData = []
          for (let i = 0; i < listId.length; i++) {
            const result = await user.findByPk(listId[i])
            if (result) {
              await result.destroy()
              cekData.push(result)
            }
          }
          if (cekData.length > 0) {
            return response(res, 'success delete user', { result: cekData })
          } else {
            return response(res, 'user not found', {}, 404, false)
          }
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
      let { limit, page, search, sortName, filter, sortType } = req.query
      let searchValue = ''
      const sortNameVal = sortName === undefined || sortName === 'undefined' || sortName === '' || sortName === null ? 'id' : sortName
      const sortTypeVal = sortType === undefined || sortType === 'undefined' || sortType === '' || sortType === null ? 'ASC' : sortType
      if (typeof search === 'object') {
        searchValue = Object.values(search)[0]
      } else {
        searchValue = search || ''
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
      if (filter === 'null' || filter === undefined || filter === 'All' || filter === 'all') {
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
          order: [[sortNameVal, sortTypeVal]],
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
            order: [[sortNameVal, sortTypeVal]],
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
              const cekArea = (a[4].split('-')[0] === '5' || a[4].split('-')[0] === 5)
              const cekHo = (a[4].split('-')[0] === '9' || a[4].split('-')[0] === 9)
              if (cekArea || cekHo) {
                plant.push(`Kode area ${a[2]} dan  User level ${a[4]}`)
                userData.push(`Terdapat duplikasi username ${a[0]} dan kode area ${a[2]}`)
                cek.push(`${a[0]}`)
              } else {
                userData.push(`Terdapat duplikasi username ${a[0]}`)
                cek.push(`${a[0]}`)
              }
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
              return response(res, 'Terdapat duplikasi data', { result }, 404, false)
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
                  if (parseInt(dataUpdate.user_level) === 5 || parseInt(dataUpdate.user_level) === 9) {
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
                    const findRole = await role.findOne({
                      where: {
                        nomor: dataUpdate.user_level
                      }
                    })
                    if (findRole && findRole.type === 'area') {
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
                    } else {
                      const findUser = await user.findOne({
                        where: {
                          username: dataUser[0]
                        }
                      })
                      const findUserRole = await user.findOne({
                        where: {
                          user_level: parseInt(dataUpdate.user_level)
                        }
                      })
                      if (findUser) {
                        const upUser = await findUser.update(dataUpdate)
                        if (upUser) {
                          arr.push(upUser)
                        }
                      } else if (findUserRole) {
                        const upUser = await findUserRole.update(dataUpdate)
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
        },
        order: [
          ['name', 'ASC']
        ]
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
  },
  getOnboarding: async (req, res) => {
    try {
      console.log('Fetching onboarding data...')
      
      const result = await makeEdotRequest('/gateway/miniapps/onboarding', 'GET')
      
      if (result) {
        return response(res, 'Success get onboarding data', { 
          result: result.data,
          tokenInfo: {
            access_token: result.tokenInfo.access_token,
            jti: result.tokenInfo.jti,
            exp: result.tokenInfo.exp,
            decoded: result.tokenInfo.decoded
          }
        })
      } else {
        return response(res, 'Failed to get onboarding data', {}, 404, false)
      }
    } catch (error) {
      console.error('Onboarding Error:', error.message)
      var errMsg = error.response && error.response.data ? error.response.data.message : error.message
      return response(res, errMsg || error.message, {}, 500, false)
    }
  },
  getOffboarding: async (req, res) => {
    try {
      console.log('Fetching offboarding data...')
      
      const result = await makeEdotRequest('/gateway/miniapps/offboarding', 'GET')
      
      if (result) {
        return response(res, 'Success get offboarding data', { 
          result: result.data,
          tokenInfo: {
            access_token: result.tokenInfo.access_token,
            jti: result.tokenInfo.jti,
            exp: result.tokenInfo.exp,
            decoded: result.tokenInfo.decoded
          }
        })
      } else {
        return response(res, 'Failed to get offboarding data', {}, 404, false)
      }
    } catch (error) {
      console.error('Offboarding Error:', error.message)
      var errMsg = error.response && error.response.data ? error.response.data.message : error.message
      return response(res, errMsg || error.message, {}, 500, false)
    }
  },
  // Endpoint khusus untuk test decode token aja
  testDecodeToken: async (req, res) => {
    try {
      console.log('Testing token decode...')
      
      const result = decodeCustomToken(STATIC_TOKEN, EDOT_CONFIG.codeCipher)
      
      return response(res, 'Token decoded successfully', {
        decoded: result.decoded,
        reconstructedToken: result.reconstructedToken,
        id: result.id,
        parts: result.parts,
        extracted: {
          access_token: result.decoded && result.decoded.data ? result.decoded.data.access_token : null,
          jti: result.decoded ? result.decoded.jti : null,
          exp: result.decoded ? result.decoded.exp : null,
          exp_readable: result.decoded && result.decoded.exp ? new Date(result.decoded.exp * 1000).toISOString() : null
        }
      })
    } catch (error) {
      console.error('Decode Error:', error.message)
      return response(res, error.message, {}, 500, false)
    }
  }
}
