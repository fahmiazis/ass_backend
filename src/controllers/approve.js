const { approve, nameApprove, ttd, role } = require('../models')
const joi = require('joi')
const response = require('../helpers/response')
const { Op } = require('sequelize')
const { pagination } = require('../helpers/pagination')

module.exports = {
  createApprove: async (req, res) => {
    try {
      const level = req.user.level
      const schema = joi.object({
        jabatan: joi.string().required(),
        jenis: joi.string().required(),
        sebagai: joi.string().required(),
        kategori: joi.string().allow(''),
        nama_approve: joi.string().required(),
        tipe: joi.string().required(),
        kode_plant: joi.string().required(),
        struktur: joi.string(),
        way_app: joi.string()
      })
      const { value: results, error } = schema.validate(req.body)
      if (error) {
        return response(res, 'Error', { error: error.message }, 401, false)
      } else {
        if (level === 1) {
          const result = await approve.findAll({
            where: {
              [Op.and]: [
                { jabatan: results.jabatan },
                { nama_approve: results.nama_approve }
              ],
              sebagai: results.sebagai
            }
          })
          if (result.length > 0) {
            const result = await approve.create(results)
            if (result) {
              return response(res, 'succesfully create approve', { result })
            } else {
              return response(res, 'failed to create', {}, 404, false)
            }
          } else {
            const result = await approve.create(results)
            if (result) {
              return response(res, 'succesfully create approve', { result })
            } else {
              return response(res, 'failed to create', {}, 404, false)
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
  createNameApprove: async (req, res) => {
    try {
      const level = req.user.level
      const schema = joi.object({
        name: joi.string().required(),
        tipe: joi.string().required(),
        kode_plant: joi.string().required()
      })
      const { value: results, error } = schema.validate(req.body)
      if (error) {
        return response(res, 'Error', { error: error.message }, 401, false)
      } else {
        if (level === 1) {
          const findPlant = await nameApprove.findAll({
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
            const result = await nameApprove.create(results)
            if (result) {
              return response(res, 'succesfully create approve', { result })
            } else {
              return response(res, 'failed to create approve', {}, 404, false)
            }
          }
        }
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  updateNameApprove: async (req, res) => {
    try {
      const level = req.user.level
      const id = req.params.id
      const schema = joi.object({
        name: joi.string().required(),
        tipe: joi.string().required(),
        kode_plant: joi.string().required()
      })
      const { value: results, error } = schema.validate(req.body)
      if (error) {
        return response(res, 'Error', { error: error.message }, 401, false)
      } else {
        if (level === 1) {
          const findName = await nameApprove.findByPk(id)
          if (findName) {
            const findPlant = await nameApprove.findAll({
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
              const findApp = await approve.findAll({
                where: {
                  [Op.and]: [
                    { kode_plant: findName.kode_plant },
                    { nama_approve: findName.name }
                  ]
                }
              })
              if (findApp.length > 0) {
                const temp = []
                const data = {
                  nama_approve: results.name,
                  tipe: results.tipe,
                  kode_plant: results.kode_plant
                }
                for (let i = 0; i < findApp.length; i++) {
                  const findData = await approve.findByPk(findApp[i].id)
                  if (findData) {
                    await findData.update(data)
                    temp.push(findData)
                  }
                }
                if (temp.length > 0) {
                  const result = await findName.update(results)
                  if (result) {
                    return response(res, 'succesfully update approve', { result })
                  } else {
                    return response(res, 'failed to update approve', {}, 404, false)
                  }
                } else {
                  const result = await findName.update(results)
                  if (result) {
                    return response(res, 'succesfully update approve', { result })
                  } else {
                    return response(res, 'failed to update approve', {}, 404, false)
                  }
                }
              } else {
                const result = await findName.update(results)
                if (result) {
                  return response(res, 'succesfully update approve', { result })
                } else {
                  return response(res, 'failed to update approve', {}, 404, false)
                }
              }
            }
          } else {
            return response(res, 'failed to update approve', {}, 404, false)
          }
        }
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  updateApprove: async (req, res) => {
    try {
      const id = req.params.id
      const level = req.user.level
      const schema = joi.object({
        jabatan: joi.string().required(),
        jenis: joi.string().allow(''),
        sebagai: joi.string().allow(''),
        kategori: joi.string().allow(''),
        nama_approve: joi.string().required(),
        tipe: joi.string().required(),
        kode_plant: joi.string().required(),
        struktur: joi.string(),
        way_app: joi.string()
      })
      const { value: results, error } = schema.validate(req.body)
      if (error) {
        return response(res, 'Error', { error: error.message }, 401, false)
      } else {
        if (level === 1) {
          const result = await approve.findByPk(id)
          if (result) {
            await result.update(results)
            return response(res, 'successfully update master approve')
          } else {
            return response(res, 'failed to create', {}, 404, false)
          }
        } else {
          return response(res, "you're not super admin", {}, 400, false)
        }
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  getApprove: async (req, res) => {
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
      } else {
        limit = parseInt(limit)
      }
      if (!page) {
        page = 1
      } else {
        page = parseInt(page)
      }
      const result = await approve.findAndCountAll({
        where: {
          [Op.or]: [
            { jabatan: { [Op.like]: `%${searchValue}%` } },
            { jenis: { [Op.like]: `%${searchValue}%` } },
            { sebagai: { [Op.like]: `%${searchValue}%` } },
            { kategori: { [Op.like]: `%${searchValue}%` } }
          ]
        },
        order: [[sortValue, 'ASC']],
        limit: limit,
        offset: (page - 1) * limit
      })
      const pageInfo = pagination('/email/get', req.query, page, limit, result.count)
      if (result) {
        return response(res, 'list approve', { result, pageInfo })
      } else {
        return response(res, 'failed to get user', {}, 404, false)
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  getDetailApprove: async (req, res) => {
    try {
      const { nama, kode } = req.query
      const result = await approve.findAll({
        where: {
          nama_approve: nama,
          kode_plant: kode
        }
      })
      if (result) {
        return response(res, 'success get detail approve', { result })
      } else {
        return response(res, 'failed get detail approve', {}, 404, false)
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  getDetailId: async (req, res) => {
    try {
      const id = req.params.id
      const result = await nameApprove.findByPk(id)
      if (result) {
        return response(res, 'success get detail name approve', { result })
      } else {
        return response(res, 'failed get detail name approve', {}, 404, false)
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  getNameApprove: async (req, res) => {
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
      } else {
        limit = parseInt(limit)
      }
      if (!page) {
        page = 1
      } else {
        page = parseInt(page)
      }
      const result = await nameApprove.findAndCountAll({
        where: {
          [Op.or]: [
            { name: { [Op.like]: `%${searchValue}%` } },
            { tipe: { [Op.like]: `%${searchValue}%` } },
            { kode_plant: { [Op.like]: `%${searchValue}%` } }
          ]
        },
        group: 'kode_plant',
        order: [[sortValue, 'ASC']],
        limit: limit,
        offset: (page - 1) * limit
      })
      const pageInfo = pagination('/approve/name', req.query, page, limit, result.count)
      if (result) {
        return response(res, 'list approve', { result, pageInfo })
      } else {
        return response(res, 'failed to get data approve', {}, 404, false)
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  getAppPlant: async (req, res) => {
    try {
      const { kode } = req.query
      const findApp = await nameApprove.findAll({
        where: {
          kode_plant: kode
        },
        order: [['name', 'ASC']]
      })
      if (findApp.length > 0) {
        return response(res, 'list approve', { result: findApp })
      } else {
        return response(res, 'failed to get data approve', {}, 404, false)
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  deleteApprove: async (req, res) => {
    try {
      const id = req.params.id
      const level = req.user.level
      if (level === 1) {
        const result = await approve.findByPk(id)
        if (result) {
          await result.destroy()
          return response(res, 'success delete approve')
        } else {
          return response(res, 'failed to delete approve', {}, 404, false)
        }
      } else {
        return response(res, "you're not super admin", {}, 400, false)
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  deleteNameApprove: async (req, res) => {
    try {
      const id = req.params.id
      const level = req.user.level
      if (level === 1) {
        const result = await nameApprove.findByPk(id)
        if (result) {
          const findApp = await approve.findAll({
            where: {
              nama_approve: result.name,
              kode_plant: result.kode_plant
            }
          })
          if (findApp.length > 0) {
            const temp = []
            for (let i = 0; i < findApp.length; i++) {
              const findId = await approve.findByPk(findApp[i].id)
              if (findId) {
                await findId.destroy()
                temp.push(findId)
              }
            }
            if (temp.length > 0) {
              await result.destroy()
              return response(res, 'success delete name approve')
            } else {
              await result.destroy()
              return response(res, 'success delete name approve')
            }
          } else {
            await result.destroy()
            return response(res, 'success delete approve')
          }
        } else {
          return response(res, 'failed to delete approve', {}, 404, false)
        }
      } else {
        return response(res, "you're not super admin", {}, 400, false)
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  deleteTtd: async (req, res) => {
    try {
      const no = req.params.no
      const findTtd = await ttd.findAll({
        where: {
          no_doc: no
        }
      })
      if (findTtd.length > 0) {
        const cek = []
        for (let i = 0; i < findTtd.length; i++) {
          const result = await ttd.findByPk(findTtd[i].id)
          if (result) {
            await result.destroy()
            cek.push(1)
          }
        }
        if (cek.length === findTtd.length) {
          return response(res, 'success delete ttd')
        } else {
          return response(res, 'failed to delete1', {}, 404, false)
        }
      } else {
        return response(res, 'failed to delete2', {}, 404, false)
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  updateRom: async (req, res) => {
    try {
      const findTtd = await ttd.findAll({
        where: {
          jabatan: 'ROM'
        }
      })
      if (findTtd.length > 0) {
        const cek = []
        for (let i = 0; i < findTtd.length; i++) {
          const result = await ttd.findByPk(findTtd[i].id)
          if (result) {
            const data = {
              jabatan: 'OM'
            }
            await result.update(data)
            cek.push(1)
          }
        }
        if (cek.length === findTtd.length) {
          return response(res, 'success update rom')
        } else {
          return response(res, 'failed to update rom', {}, 404, false)
        }
      } else {
        return response(res, 'failed to update rom', {}, 404, false)
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  changeName: async (req, res) => {
    try {
      const schema = joi.object({
        nama: joi.string().required()
      })
      const { value: results, error } = schema.validate(req.body)
      if (error) {
        return response(res, 'Error', { error: error.message }, 404, false)
      } else {
        const id = req.params.id
        const findRole = await role.findOne({
          where: {
            nomor: id
          }
        })
        const data = {
          jabatan: results.nama
        }
        const dataRole = {
          name: results.nama
        }
        if (findRole) {
          const findApprove = await approve.findAll({
            where: {
              jabatan: findRole.name
            }
          })
          if (findApprove.length > 0) {
            const valid = []
            for (let i = 0; i < findApprove.length; i++) {
              const result = await approve.findByPk(findApprove[i].id)
              if (result) {
                await result.update(data)
                valid.push(result)
              }
            }
            if (valid.length === findApprove.length) {
              const findTtd = await ttd.findAll({
                where: {
                  jabatan: findRole.name
                }
              })
              if (findTtd.length > 0) {
                const cek = []
                for (let i = 0; i < findTtd.length; i++) {
                  const result = await ttd.findByPk(findTtd[i].id)
                  if (result) {
                    await result.update(data)
                    cek.push(result)
                  }
                }
                if (cek.length === findTtd.length) {
                  await findRole.update(dataRole)
                  return response(res, 'success update role')
                } else {
                  return response(res, 'failed to update role', {}, 404, false)
                }
              } else {
                return response(res, 'success update role')
              }
            } else {
              return response(res, 'failed to update role', { findRole }, 404, false)
            }
          } else {
            const findTtd = await ttd.findAll({
              where: {
                jabatan: findRole.name
              }
            })
            if (findTtd.length > 0) {
              const cek = []
              for (let i = 0; i < findTtd.length; i++) {
                const result = await ttd.findByPk(findTtd[i].id)
                if (result) {
                  await result.update(data)
                  cek.push(result)
                }
              }
              if (cek.length === findTtd.length) {
                await findRole.update(dataRole)
                return response(res, 'success update role')
              } else {
                return response(res, 'failed to update role', {}, 404, false)
              }
            } else {
              await findRole.update(dataRole)
              return response(res, 'success update role')
            }
          }
        } else {
          return response(res, 'failed to update role', { findRole }, 404, false)
        }
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  updateTipeAll: async (req, res) => {
    try {
      const getName = await nameApprove.findAll()
      if (getName.length > 0) {
        const data = {
          tipe: 'all',
          kode_plant: 'all'
        }
        const cek = []
        for (let i = 0; i < getName.length; i++) {
          const findId = await nameApprove.findByPk(getName[i].id)
          if (findId) {
            await findId.update(data)
            cek.push(findId)
          }
        }
        if (cek.length > 0) {
          const getApp = await approve.findAll()
          if (getApp.length > 0) {
            const cekApp = []
            for (let i = 0; i < getApp.length; i++) {
              const findId = await approve.findByPk(getApp[i].id)
              if (findId) {
                await findId.update(data)
                const findName = await nameApprove.findOne({
                  where: {
                    name: findId.nama_approve
                  }
                })
                if (findName) {
                  cekApp.push(findId)
                } else {
                  const send = {
                    name: findId.nama_approve,
                    tipe: 'all',
                    kode_plant: 'all'
                  }
                  await nameApprove.create(send)
                  cekApp.push(findId)
                }
              }
            }
            if (cekApp) {
              return response(res, 'success to update approval')
            } else {
              return response(res, 'success to update approval')
            }
          } else {
            return response(res, 'failed to update approval', { getApp }, 404, false)
          }
        }
      } else {
        return response(res, 'failed to update name approval', { getName }, 404, false)
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  updateTtd: async (req, res) => {
    try {
      const findAllTtd = await ttd.findAll()
      const findRole = await role.findAll()
      if (findAllTtd.length > 0) {
        const cekTtd = []
        const dataCek = []
        for (let i = 0; i < findAllTtd.length; i++) {
          const data = findAllTtd[i]
          const cek = findRole.find((item) => item.name === data.jabatan)
          dataCek.push(cek)
          if (cek !== undefined) {
            const findId = await ttd.findByPk(data.id)
            const send = {
              id_role: cek.nomor
            }
            await findId.update(send)
            cekTtd.push(findId)
          }
        }
        if (cekTtd.length > 0) {
          return response(res, 'success to update ttd', { result: cekTtd })
        } else {
          return response(res, 'failed to update ttd1', { dataCek }, 404, false)
        }
      } else {
        return response(res, 'failed to update ttd2', { }, 404, false)
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  }
}
