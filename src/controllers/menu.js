const { menu, listmenu } = require('../models')
const joi = require('joi')
const response = require('../helpers/response')
const { Op } = require('sequelize')
const { pagination } = require('../helpers/pagination')

module.exports = {
  createMenu: async (req, res) => {
    try {
      const level = req.user.level
      const schema = joi.object({
        name: joi.string().required(),
        type: joi.string().required(),
        jenis: joi.string().allow(''),
        routes: joi.string().allow(''),
        timeline: joi.number().required(),
        access: joi.string().allow(''),
        access_depo: joi.string().allow(''),
        kode_menu: joi.string().required()
      })
      const { value: results, error } = schema.validate(req.body)
      if (error) {
        return response(res, 'Error', { error: error.message }, 401, false)
      } else {
        if (level === 1) {
          const result = await listmenu.findAll({
            where: {
              [Op.and]: [
                { name: results.name },
                { kode_menu: results.kode_menu }
              ],
              jenis: results.jenis
            }
          })
          if (result.length > 0) {
            const result = await listmenu.create(results)
            if (result) {
              return response(res, 'succesfully create menu', { result })
            } else {
              return response(res, 'failed to create', {}, 404, false)
            }
          } else {
            const result = await listmenu.create(results)
            if (result) {
              return response(res, 'succesfully create menu', { result })
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
  createNameMenu: async (req, res) => {
    try {
      const level = req.user.level
      const schema = joi.object({
        name: joi.string().required(),
        type: joi.string().required(),
        timeline: joi.number().allow(null)
      })
      const { value: results, error } = schema.validate(req.body)
      if (error) {
        return response(res, 'Error', { error: error.message }, 401, false)
      } else {
        if (level === 1) {
          const result = await menu.findAll({
            where: {
              name: { [Op.like]: `%${results.name}` }
            }
          })
          if (result.length > 0) {
            return response(res, 'Telah terdaftar', {}, 404, false)
          } else {
            const result = await menu.create(results)
            if (result) {
              return response(res, 'succesfully create menu', { result })
            } else {
              return response(res, 'failed to create menu', {}, 404, false)
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
  updateMenu: async (req, res) => {
    try {
      const id = req.params.id
      const level = req.user.level
      const schema = joi.object({
        name: joi.string().required(),
        type: joi.string().required(),
        jenis: joi.string().allow(''),
        routes: joi.string().allow(''),
        timeline: joi.number().required(),
        access: joi.string().allow(''),
        access_depo: joi.string().allow(''),
        kode_menu: joi.string().required()
      })
      const { value: results, error } = schema.validate(req.body)
      if (error) {
        return response(res, 'Error', { error: error.message }, 401, false)
      } else {
        if (level === 1) {
          const result = await listmenu.findByPk(id)
          if (result) {
            await result.update(results)
            return response(res, 'successfully update master menu')
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
  getMenu: async (req, res) => {
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
        const findLimit = await listmenu.findAll()
        limit = findLimit.length
      } else {
        limit = parseInt(limit)
      }
      if (!page) {
        page = 1
      } else {
        page = parseInt(page)
      }
      const result = await listmenu.findAndCountAll({
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
        return response(res, 'list menu', { result, pageInfo })
      } else {
        return response(res, 'failed to get user', {}, 404, false)
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  getAllMenu: async (req, res) => {
    try {
      const type = req.params.type
      const { name } = req.query
      if (name === 'undefined') {
        const result = await listmenu.findAll({
          where: {
            [Op.and]: [
              type === 'all' ? { [Op.not]: { type: 'master' } } : { type: { [Op.like]: `%${type}%` } }
            ]
          }
        })
        if (result) {
          const findName = await menu.findAll({
            where: {
              type: 'transaksi'
            }
          })
          if (findName.length > 0) {
            return response(res, 'success get all list menu proses', { result: result, name: findName })
          } else {
            return response(res, 'success get all list menu proses', { result: result, name: [] })
          }
        } else {
          return response(res, 'failed get all list menu', {}, 404, false)
        }
      } else {
        const result = await listmenu.findAll({
          where: {
            [Op.and]: [
              { type: type },
              { kode_menu: name === 'undefined' ? 'Klaim' : name }
            ]
          }
        })
        if (result) {
          const findName = await menu.findAll({
            where: {
              type: 'transaksi'
            }
          })
          if (findName.length > 0) {
            return response(res, 'success get all list menu name', { result: result, name: findName })
          } else {
            return response(res, 'success get all list menu name', { result: result, name: [] })
          }
        } else {
          return response(res, 'failed get all list menu', {}, 404, false)
        }
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  getDetailMenu: async (req, res) => {
    try {
      const nama = req.params.nama
      const result = await listmenu.findAll({
        where: {
          kode_menu: nama
        }
      })
      if (result) {
        return response(res, 'success get list menu', { result })
      } else {
        return response(res, 'failed get list menu', {}, 404, false)
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  getNameMenu: async (req, res) => {
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
        const findLimit = await menu.findAll()
        limit = findLimit.length
      } else {
        limit = parseInt(limit)
      }
      if (!page) {
        page = 1
      } else {
        page = parseInt(page)
      }
      const result = await menu.findAndCountAll({
        where: {
          [Op.or]: [
            { name: { [Op.like]: `%${searchValue}%` } }
          ]
        },
        order: [[sortValue, 'ASC']],
        limit: limit,
        offset: (page - 1) * limit
      })
      const pageInfo = pagination('/menu/name', req.query, page, limit, result.count)
      if (result) {
        return response(res, 'list menu', { result, pageInfo })
      } else {
        return response(res, 'failed to get user', {}, 404, false)
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  deleteMenu: async (req, res) => {
    try {
      const id = req.params.id
      const level = req.user.level
      if (level === 1) {
        const result = await listmenu.findByPk(id)
        if (result) {
          await result.destroy()
          return response(res, 'success delete menu')
        } else {
          return response(res, 'failed to delete menu', {}, 404, false)
        }
      } else {
        return response(res, "you're not super admin", {}, 400, false)
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  }
}
