const response = require('../helpers/response')
const { apk } = require('../models') // eslint-disable-line
const { Op } = require('sequelize')
const { pagination } = require('../helpers/pagination')
const multer = require('multer')
const uploadApk = require('../helpers/uploadApk')
// const { APP_BE, APP_KEY } = process.env

module.exports = {
  getApk: async (req, res) => {
    try {
      let { limit, page, search, filter } = req.query
      let searchValue = ''
      const sortNameVal = 'id'
      const sortTypeVal = 'DESC'
      if (typeof search === 'object') {
        searchValue = Object.values(search)[0]
      } else {
        searchValue = search || ''
      }
      if (!limit) {
        limit = 10
      } else if (limit === 'all') {
        const findLimit = await apk.findAll()
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
      const result = await apk.findAndCountAll({
        where: {
          [Op.or]: [
            { name: { [Op.like]: `%${searchValue}%` } },
            { versi: { [Op.like]: `%${searchValue}%` } },
            { compatible: { [Op.like]: `%${searchValue}%` } }
          ]
        },
        order: [[sortNameVal, sortTypeVal]],
        limit: limit,
        offset: (page - 1) * limit
      })
      const pageInfo = pagination('/apk/get', req.query, page, limit, result.count)
      if (result) {
        return response(res, 'list apk', { result, pageInfo })
      } else {
        return response(res, 'failed to get apk', {}, 404, false)
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  getDetailApk: async (req, res) => {
    try {
      const id = req.params.id
      const result = await apk.findOne({
        where: {
          id: id
        }
      })
      if (result) {
        return response(res, `detail of apk with id ${id}`, { result })
      } else {
        return response(res, 'fail to get apk', {}, 400, false)
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  addApk: async (req, res) => {
    try {
      const level = req.user.level
      if (level === 1) {
        uploadApk(req, res, async function (err) {
          if (err instanceof multer.MulterError) {
            if (err.code === 'LIMIT_UNEXPECTED_FILE' && req.files.length === 0) {
              console.log(err.code === 'LIMIT_UNEXPECTED_FILE' && req.files.length > 0)
              return response(res, 'fieldname doesnt match', {}, 500, false)
            }
            return response(res, err.message, {}, 500, false)
          } else if (err) {
            return response(res, err.message, {}, 401, false)
          } else {
            const { name, versi, date, note, compatible } = req.body
            const nameApk = `android/${req.file.filename}`
            console.log()
            const findApk = await apk.findOne({
              where: {
                versi: versi
              }
            })
            if (findApk) {
              return response(res, 'versi apk sudah terdaftar', {}, 400, false)
            } else {
              const data = {
                name: name,
                versi: versi,
                date_release: date,
                note_release: note,
                compatible: compatible,
                path: nameApk
              }
              const createApk = await apk.create(data)
              if (createApk) {
                return response(res, 'success add apk')
              } else {
                return response(res, 'failed to add apk', {}, 400, false)
              }
            }
          }
        })
      } else {
        return response(res, "You're not super administrator", {}, 400, false)
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  }
}
