const response = require('../helpers/response')
const { notif } = require('../models')
const { Op } = require('sequelize')

module.exports = {
  getNotif: async (req, res) => {
    const name = req.user.name
    const result = await notif.findAll({
      where: {
        list_appr: name
      },
      order: [['id', 'DESC']],
      limit: 20
    })
    if (result.length > 0) {
      return response(res, 'success get notif', { result })
    } else {
      return response(res, 'success get notif', { result: [] })
    }
  }
}
