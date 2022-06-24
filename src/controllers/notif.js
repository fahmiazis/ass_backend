const response = require('../helpers/response')
const { notif } = require('../models')
const { Op } = require('sequelize')

module.exports = {
  getNotif: async (req, res) => {
    const name = req.user.name
    let { limit } = req.query
    if (limit) {
      limit = limit === 'null' ? null : parseInt(limit)
    } else {
      limit = 20
    }
    const result = await notif.findAll({
      where: {
        list_appr: name
      },
      order: [['id', 'DESC']],
      limit: limit
    })
    if (result.length > 0) {
      return response(res, 'success get notif', { result })
    } else {
      return response(res, 'success get notif', { result: [] })
    }
  },
  deleteNotif: async (req, res) => {
    try {
      const id = req.params.id
      const findNotif = await notif.findByPk(id)
      if (findNotif) {
        const delNotif = await findNotif.destroy()
        if (delNotif) {
          return response(res, 'success del notif')
        } else {
          return response(res, 'failed del notif', {}, 404, false)
        }
      } else {
        return response(res, 'failed del notif', {}, 404, false)
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  updateNotif: async (req, res) => {
    try {
      const id = req.params.id
      const findNotif = await notif.findByPk(id)
      if (findNotif) {
        const data = {
          status: 1
        }
        const updateNotif = await findNotif.update(data)
        if (updateNotif) {
          return response(res, 'success update notif')
        } else {
          return response(res, 'failed update notif', {}, 404, false)
        }
      } else {
        return response(res, 'failed update notif', {}, 404, false)
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  deleteAllNotif: async (req, res) => {
    try {
      const name = req.user.name
      const result = await notif.findAll({
        where: {
          list_appr: name
        }
      })
      if (result.length > 0) {
        const cek = []
        for (let i = 0; i < result.length; i++) {
          const findNotif = await notif.findByPk(result[i].id)
          if (findNotif) {
            const delNotif = await findNotif.destroy()
            if (delNotif) {
              cek.push(1)
            }
          }
        }
        if (cek.length > 0) {
          return response(res, 'success del notif')
        } else {
          return response(res, 'data not found', {}, 404, false)
        }
      } else {
        return response(res, 'data not found', {}, 404, false)
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  updateAllNotif: async (req, res) => {
    try {
      const name = req.user.name
      const result = await notif.findAll({
        where: {
          list_appr: name
        }
      })
      if (result.length > 0) {
        const cek = []
        for (let i = 0; i < result.length; i++) {
          const findNotif = await notif.findByPk(result[i].id)
          if (findNotif) {
            const data = {
              status: 1
            }
            const updateNotif = await findNotif.update(data)
            if (updateNotif) {
              cek.push(1)
            }
          }
        }
        if (cek.length > 0) {
          return response(res, 'success update notif')
        } else {
          return response(res, 'data not found', {}, 404, false)
        }
      } else {
        return response(res, 'data not found', {}, 404, false)
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  }
}
