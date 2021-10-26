const { disposal, asset, depo, path, ttd, approve, role, document, docUser, email, user } = require('../models')
const joi = require('joi')
const response = require('../helpers/response')
const { Op } = require('sequelize')
const { pagination } = require('../helpers/pagination')
const multer = require('multer')
const mailer = require('../helpers/mailer')
const uploadHelper = require('../helpers/upload')
const moment = require('moment')

module.exports = {
  addDisposal: async (req, res) => {
    try {
      const no = req.params.no
      const kode = req.user.kode
      const result = await asset.findOne({
        where: {
          no_asset: no
        }
      })
      if (result) {
        const findAsset = await disposal.findAll({
          where: {
            no_asset: result.no_asset
          }
        })
        if (findAsset.length > 0) {
          return response(res, 'success add disposal', { result: findAsset })
        } else if (result.kode_plant === kode) {
          const findDepo = await depo.findAll({
            where: {
              kode_plant: kode
            }
          })
          if (findDepo.length > 0) {
            const send = {
              kode_plant: result.kode_plant,
              area: findDepo[0].nama_area,
              no_doc: result.no_doc,
              no_asset: result.no_asset,
              nama_asset: result.nama_asset,
              cost_center: findDepo[0].cost_center,
              status_depo: findDepo[0].status_area,
              nilai_jual: 0,
              nilai_buku: result.nilai_buku,
              status_form: 1,
              kategori: result.kategori,
              merk: result.merk
            }
            const make = await disposal.create(send)
            if (make) {
              const data = {
                status: 1
              }
              const update = await result.update(data)
              if (update) {
                return response(res, 'success add disposal', { result: make })
              } else {
                return response(res, 'failed add disposal', {}, 400, false)
              }
            } else {
              return response(res, 'failed add disposal', {}, 400, false)
            }
          } else {
            return response(res, 'failed add disposal', {}, 400, false)
          }
        } else {
          return response(res, 'failed add disposal', {}, 400, false)
        }
      } else {
        return response(res, 'failed add disposal', {}, 400, false)
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  addSell: async (req, res) => {
    try {
      const no = req.params.no
      const kode = req.user.kode
      const result = await asset.findOne({
        where: {
          no_asset: no
        }
      })
      if (result) {
        const findAsset = await disposal.findAll({
          where: {
            no_asset: result.no_asset
          }
        })
        if (findAsset.length > 0) {
          return response(res, 'success add sell', { result: findAsset })
        } else if (result.kode_plant === kode) {
          const findDepo = await depo.findAll({
            where: {
              kode_plant: kode
            }
          })
          if (findDepo.length > 0) {
            const send = {
              kode_plant: result.kode_plant,
              area: findDepo[0].nama_area,
              no_doc: result.no_doc,
              no_asset: result.no_asset,
              nama_asset: result.nama_asset,
              cost_center: findDepo[0].cost_center,
              status_depo: findDepo[0].status_area,
              nilai_buku: result.nilai_buku,
              status_form: 1,
              kategori: result.kategori,
              merk: result.merk
            }
            const make = await disposal.create(send)
            if (make) {
              const data = {
                status: 1
              }
              const update = await result.update(data)
              if (update) {
                return response(res, 'success add sell', { result: make })
              } else {
                return response(res, 'failed add sell', {}, 400, false)
              }
            } else {
              return response(res, 'failed add sell', {}, 400, false)
            }
          } else {
            return response(res, 'failed add sell', {}, 400, false)
          }
        } else {
          return response(res, 'failed add sell', {}, 400, false)
        }
      } else {
        return response(res, 'failed add sell', {}, 400, false)
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  deleteDisposal: async (req, res) => {
    try {
      const noAsset = req.params.asset
      const kode = req.user.kode
      const result = await disposal.findOne({
        where: {
          [Op.and]: [
            { no_asset: noAsset },
            { status_form: 1 }
          ]
        }
      })
      if (result) {
        if (result.kode_plant === kode) {
          const findAsset = await asset.findOne({
            where: {
              no_asset: noAsset
            }
          })
          if (findAsset) {
            const data = {
              status: null
            }
            const sent = await findAsset.update(data)
            if (sent) {
              const del = await result.destroy()
              if (del) {
                return response(res, 'success delete disposal')
              } else {
                return response(res, 'failed delete disposal', {}, 400, false)
              }
            } else {
              return response(res, 'failed delete disposal', {}, 400, false)
            }
          } else {
            return response(res, 'failed delete disposal', {}, 400, false)
          }
        } else {
          return response(res, "failed delete disposal, you havn't access", {}, 400, false)
        }
      } else {
        return response(res, 'failed delete disposal', {}, 400, false)
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  getDisposal: async (req, res) => {
    try {
      const level = req.user.level
      const kode = req.user.kode
      const fullname = req.user.fullname
      let { limit, page, search, sort, status, tipe, form } = req.query
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
        sortValue = sort || 'no_disposal'
      }
      if (!status) {
        status = 1
      } else {
        status = parseInt(status)
      }
      if (limit) {
        limit = 100
      } else {
        limit = 100
      }
      if (!page) {
        page = 1
      } else {
        page = parseInt(page)
      }
      if (level !== 5 && level !== 12 && level !== 7 && level !== 13) {
        const result = await disposal.findAndCountAll({
          where: {
            [Op.or]: [
              { kode_plant: { [Op.like]: `%${searchValue}%` } },
              { no_io: { [Op.like]: `%${searchValue}%` } },
              { no_disposal: { [Op.like]: `%${searchValue}%` } },
              { nama_asset: { [Op.like]: `%${searchValue}%` } },
              { kategori: { [Op.like]: `%${searchValue}%` } },
              { keterangan: { [Op.like]: `%${searchValue}%` } }
            ],
            [Op.or]: [
              { status_form: status },
              { status_form: status === 2 ? 9 : status },
              { status_form: status === 2 ? 26 : status }
            ]
          },
          order: [
            [sortValue, 'ASC'],
            [{ model: ttd, as: 'appForm' }, 'id', 'DESC'],
            [{ model: ttd, as: 'ttdSet' }, 'id', 'DESC']
          ],
          limit: limit,
          offset: (page - 1) * limit,
          include: [
            {
              model: ttd,
              as: 'appForm'
            },
            {
              model: path,
              as: 'pict'
            },
            {
              model: ttd,
              as: 'ttdSet'
            },
            {
              model: asset,
              as: 'dataAsset'
            }
          ]
        })
        const pageInfo = pagination('/disposal/get', req.query, page, limit, result.count)
        if (result) {
          const data = []
          if (tipe === 'persetujuan') {
            result.rows.map(x => {
              return (
                data.push(x.status_app)
              )
            })
            const set = new Set(data)
            const noDis = [...set]
            return response(res, 'success get disposal', { result, pageInfo, noDis })
          } else {
            result.rows.map(x => {
              return (
                data.push(x.no_disposal)
              )
            })
            const set = new Set(data)
            const noDis = [...set]
            return response(res, 'success get disposal', { result, pageInfo, noDis })
          }
        } else {
          return response(res, 'failed get disposal', {}, 400, false)
        }
      } else if (level === 5) {
        const result = await disposal.findAndCountAll({
          where: {
            kode_plant: kode,
            [Op.or]: [
              { status_form: status },
              { status_form: status === 2 ? 9 : status },
              { status_form: status === 2 ? 26 : status }
            ]
          },
          include: [
            {
              model: path,
              as: 'pict'
            },
            {
              model: ttd,
              as: 'ttdSet'
            },
            {
              model: ttd,
              as: 'appForm'
            }
          ]
        })
        if (result) {
          if (form === 'editdis' && result.rows.length > 0) {
            const cekRow = []
            for (let i = 0; i < result.rows.length; i++) {
              if (result.rows[i].status_app !== null) {
                cekRow.push(1)
              }
            }
            if (cekRow.length === 0) {
              const valid = []
              for (let i = 0; i < result.rows.length; i++) {
                const findTtd = await ttd.findAll({
                  where: {
                    no_doc: result.rows[i].no_disposal
                  }
                })
                if (findTtd.length > 0) {
                  for (let j = 0; j < findTtd.length; j++) {
                    if (findTtd[j].status === 0) {
                      valid.push(result.rows[i])
                    }
                  }
                }
              }
              if (valid.length > 0) {
                const hasil = []
                for (let i = 0; i < result.rows.length; i++) {
                  const findDoc = await docUser.findAll({
                    where: {
                      no_pengadaan: result.rows[i].no_asset,
                      [Op.and]: [
                        { jenis_form: 'disposal' },
                        {
                          [Op.or]: [
                            { tipe: 'pengajuan' },
                            { tipe: 'jual' },
                            { tipe: 'purch' }
                          ]
                        }
                      ]
                    }
                  })
                  if (findDoc.length > 0) {
                    const cek = []
                    for (let j = 0; j < findDoc.length; j++) {
                      if (findDoc[j].divisi === '0' || findDoc[j].status === 0) {
                        cek.push(1)
                      }
                    }
                    if (cek.length > 0) {
                      hasil.push(result.rows[i])
                    }
                  }
                }
                if (hasil.length > 0) {
                  const newData = valid.concat(hasil)
                  const filteredArr = newData.reduce((acc, current) => {
                    const x = acc.find(item => item.id === current.id)
                    if (!x) {
                      return acc.concat([current])
                    } else {
                      return acc
                    }
                  }, [])
                  return response(res, 'success get disposal', { result: { rows: filteredArr, count: filteredArr.length } })
                } else {
                  return response(res, 'success get disposal', { result: { rows: valid, count: valid.length } })
                }
              } else {
                const hasil = []
                for (let i = 0; i < result.rows.length; i++) {
                  const findDoc = await docUser.findAll({
                    where: {
                      no_pengadaan: result.rows[i].no_asset,
                      [Op.and]: [
                        { jenis_form: 'disposal' },
                        {
                          [Op.or]: [
                            { tipe: 'pengajuan' },
                            { tipe: 'jual' },
                            { tipe: 'purch' }
                          ]
                        }
                      ]
                    }
                  })
                  if (findDoc.length > 0) {
                    const cek = []
                    for (let j = 0; j < findDoc.length; j++) {
                      if (findDoc[j].divisi === '0' || findDoc[j].status === 0) {
                        cek.push(1)
                      }
                    }
                    if (cek.length > 0) {
                      hasil.push(result.rows[i])
                    }
                  }
                }
                if (hasil.length > 0) {
                  return response(res, 'success get disposal', { result: { rows: hasil, count: hasil.length } })
                } else {
                  return response(res, 'success get disposal', { result: { rows: hasil, count: hasil.length } })
                }
              }
            } else {
              const valid = []
              for (let i = 0; i < result.rows.length; i++) {
                const findTtd = await ttd.findAll({
                  where: {
                    no_set: result.rows[i].status_app
                  }
                })
                if (findTtd.length > 0) {
                  for (let j = 0; j < findTtd.length; j++) {
                    if (findTtd[j].status === 0) {
                      valid.push(result.rows[i])
                    }
                  }
                }
              }
              if (valid.length > 0) {
                const hasil = []
                for (let i = 0; i < result.rows.length; i++) {
                  const findDoc = await docUser.findAll({
                    where: {
                      no_pengadaan: result.rows[i].no_asset,
                      [Op.and]: [
                        { jenis_form: 'disposal' },
                        {
                          [Op.or]: [
                            { tipe: 'pengajuan' },
                            { tipe: 'jual' },
                            { tipe: 'purch' }
                          ]
                        }
                      ]
                    }
                  })
                  if (findDoc.length > 0) {
                    const cek = []
                    for (let j = 0; j < findDoc.length; j++) {
                      if (findDoc[j].divisi === '0' || findDoc[j].status === 0) {
                        cek.push(1)
                      }
                    }
                    if (cek.length > 0) {
                      hasil.push(result.rows[i])
                    }
                  }
                }
                if (hasil.length > 0) {
                  const newData = valid.concat(hasil)
                  const filteredArr = newData.reduce((acc, current) => {
                    const x = acc.find(item => item.id === current.id)
                    if (!x) {
                      return acc.concat([current])
                    } else {
                      return acc
                    }
                  }, [])
                  return response(res, 'success get disposal', { result: { rows: filteredArr, count: filteredArr.length } })
                } else {
                  return response(res, 'success get disposal', { result: { rows: valid, count: valid.length } })
                }
              } else {
                const hasil = []
                for (let i = 0; i < result.rows.length; i++) {
                  const findDoc = await docUser.findAll({
                    where: {
                      no_pengadaan: result.rows[i].no_asset,
                      [Op.and]: [
                        { jenis_form: 'disposal' },
                        {
                          [Op.or]: [
                            { tipe: 'pengajuan' },
                            { tipe: 'jual' },
                            { tipe: 'purch' }
                          ]
                        }
                      ]
                    }
                  })
                  if (findDoc.length > 0) {
                    const cek = []
                    for (let j = 0; j < findDoc.length; j++) {
                      if (findDoc[j].divisi === '0' || findDoc[j].status === 0) {
                        cek.push(1)
                      }
                    }
                    if (cek.length > 0) {
                      hasil.push(result.rows[i])
                    }
                  }
                }
                if (hasil.length > 0) {
                  return response(res, 'success get disposal', { result: { rows: hasil, count: hasil.length } })
                } else {
                  return response(res, 'success get disposal', { result: { rows: hasil, count: hasil.length } })
                }
              }
            }
          } else if (form === 'editeks' && result.rows.length > 0) {
            const hasil = []
            for (let i = 0; i < result.rows.length; i++) {
              const findDoc = await docUser.findAll({
                where: {
                  [Op.and]: [
                    { no_pengadaan: result.rows[i].no_asset },
                    { jenis_form: 'disposal' }
                  ],
                  [Op.or]: [
                    { tipe: result.rows[i].nilai_jual === '0' ? 'dispose' : 'sell' },
                    { tipe: 'npwp' }
                  ]
                }
              })
              if (findDoc.length > 0) {
                const cek = []
                for (let j = 0; j < findDoc.length; j++) {
                  if (findDoc[j].divisi === '0' || findDoc[j].status === 0) {
                    cek.push(1)
                  }
                }
                if (cek.length > 0) {
                  hasil.push(result.rows[i])
                }
              }
            }
            if (hasil.length > 0) {
              return response(res, 'success get disposal', { result: { rows: hasil, count: hasil.length } })
            } else {
              return response(res, 'success get disposal', { result: { rows: hasil, count: hasil.length } })
            }
          } else {
            return response(res, 'success get disposal', { result, form: form })
          }
        } else {
          return response(res, 'failed get disposal', {}, 400, false)
        }
      } else if (level === 12 || level === 7) {
        const findDepo = await depo.findAll({
          where: {
            [Op.or]: [
              { nama_bm: level === 7 ? null : fullname },
              { nama_om: level === 12 ? null : fullname }
            ]
          }
        })
        if (findDepo.length > 0) {
          const hasil = []
          for (let i = 0; i < findDepo.length; i++) {
            const result = await disposal.findAll({
              where: {
                kode_plant: findDepo[i].kode_plant,
                [Op.or]: [
                  { no_disposal: { [Op.like]: `%${searchValue}%` } },
                  { nama_asset: { [Op.like]: `%${searchValue}%` } },
                  { kategori: { [Op.like]: `%${searchValue}%` } },
                  { keterangan: { [Op.like]: `%${searchValue}%` } }
                ],
                [Op.or]: [
                  { status_form: status },
                  { status_form: status === 2 ? 9 : status },
                  { status_form: status === 2 ? 26 : status }
                ]
              },
              order: [
                [sortValue, 'ASC'],
                [{ model: ttd, as: 'appForm' }, 'id', 'DESC']
              ],
              include: [
                {
                  model: ttd,
                  as: 'appForm'
                },
                {
                  model: path,
                  as: 'pict'
                }
              ]
            })
            if (result.length > 0) {
              for (let j = 0; j < result.length; j++) {
                hasil.push(result[j])
              }
            }
          }
          if (hasil.length > 0) {
            const data = []
            hasil.map(x => {
              return (
                data.push(x.no_disposal)
              )
            })
            const set = new Set(data)
            const noDis = [...set]
            const result = { rows: hasil, count: hasil.length }
            const pageInfo = pagination('/disposal/get', req.query, page, limit, result.count)
            return response(res, 'success get disposal', { result, pageInfo, noDis })
          } else {
            const result = { rows: hasil, count: 0 }
            const noDis = []
            const pageInfo = pagination('/disposal/get', req.query, page, limit, result.count)
            return response(res, 'success get disposal', { result, pageInfo, noDis })
          }
        } else {
          return response(res, 'failed get disposal', {}, 400, false)
        }
      } else if (level === 13) {
        const result = await disposal.findAndCountAll({
          where: {
            [Op.or]: [
              { kode_plant: { [Op.like]: `%${searchValue}%` } },
              { no_io: { [Op.like]: `%${searchValue}%` } },
              { no_disposal: { [Op.like]: `%${searchValue}%` } },
              { nama_asset: { [Op.like]: `%${searchValue}%` } },
              { kategori: { [Op.like]: `%${searchValue}%` } },
              { keterangan: { [Op.like]: `%${searchValue}%` } }
            ],
            [Op.or]: [
              { status_form: status },
              { status_form: status === 2 ? 9 : status },
              { status_form: status === 2 ? 26 : status }
            ]
          },
          order: [[{ model: ttd, as: 'appForm' }, 'id', 'DESC'], [sortValue, 'ASC']],
          limit: limit,
          offset: (page - 1) * limit,
          include: [
            {
              model: ttd,
              as: 'appForm'
            },
            {
              model: path,
              as: 'pict'
            }
          ]
        })
        if (result.rows.length > 0) {
          const data = []
          for (let i = 0; i < result.rows.length; i++) {
            if (result.rows[i].kategori === 'IT') {
              data.push(result.rows[i].no_disposal)
            }
          }
          const set = new Set(data)
          const noDis = [...set]
          const hasil = []
          for (let i = 0; i < result.rows.length; i++) {
            for (let j = 0; j < noDis.length; j++) {
              if (result.rows[i].no_disposal === noDis[j]) {
                hasil.push(result.rows[i])
              }
            }
          }
          if (hasil.length) {
            const result = { rows: hasil, count: hasil.length }
            const pageInfo = pagination('/disposal/get', req.query, page, limit, result.count)
            return response(res, 'success get disposal', { result, pageInfo, noDis })
          } else {
            const result = { rows: [], count: 0 }
            const noDis = []
            const pageInfo = pagination('/disposal/get', req.query, page, limit, result.count)
            return response(res, 'success get disposal', { result, pageInfo, noDis })
          }
        } else {
          const result = { rows: [], count: 0 }
          const noDis = []
          const pageInfo = pagination('/disposal/get', req.query, page, limit, result.count)
          return response(res, 'success get disposal', { result, pageInfo, noDis })
        }
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  uploadImage: async (req, res) => {
    const asset = req.params.asset
    uploadHelper(req, res, async function (err) {
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
        const dokumen = `uploads/${req.file.filename}`
        const send = {
          path: dokumen,
          no_asset: asset
        }
        const result = await path.create(send)
        if (result) {
          return response(res, 'successfully upload', { send })
        } else {
          return response(res, 'failed upload', {}, 404, false)
        }
      } catch (error) {
        return response(res, error.message, {}, 500, false)
      }
    })
  },
  submitDisposal: async (req, res) => {
    try {
      const kode = req.user.kode
      const result = await disposal.findAll({
        where: {
          [Op.and]: [
            { kode_plant: kode },
            { status_form: 1 }
          ]
        }
      })
      if (result.length > 0) {
        const findNo = await disposal.findAll({
          where: {
            [Op.not]: { no_disposal: null }
          }
        })
        if (findNo.length > 0) {
          const cekNo = []
          for (let i = 0; i < findNo.length; i++) {
            cekNo.push(parseInt(findNo[i].no_disposal === null ? 0 : findNo[i].no_disposal))
          }
          const noDis = Math.max(...cekNo) + 1
          const temp = []
          for (let i = 0; i < result.length; i++) {
            const find = await disposal.findOne({
              where: {
                no_asset: result[i].no_asset
              }
            })
            if (find) {
              if (find.nilai_jual !== '0') {
                const send = {
                  status_form: 26,
                  no_disposal: noDis === undefined ? 1 : noDis,
                  tanggalDis: moment()
                }
                await find.update(send)
                temp.push(1)
              } else {
                const send = {
                  status_form: 2,
                  no_disposal: noDis === undefined ? 1 : noDis,
                  tanggalDis: moment()
                }
                await find.update(send)
                temp.push(1)
              }
            }
          }
          if (temp.length === result.length) {
            return response(res, 'success submit', { cekNo })
          } else {
            return response(res, 'failed submit', {}, 404, false)
          }
        } else {
          const cekNo = [0]
          const noDis = Math.max(...cekNo) + 1
          const temp = []
          for (let i = 0; i < result.length; i++) {
            const find = await disposal.findOne({
              where: {
                no_asset: result[i].no_asset
              }
            })
            if (find) {
              if (find.nilai_jual !== '0') {
                const send = {
                  status_form: 26,
                  no_disposal: noDis === undefined ? 1 : noDis,
                  tanggalDis: moment()
                }
                await find.update(send)
                temp.push(1)
              } else {
                const send = {
                  status_form: 2,
                  no_disposal: noDis === undefined ? 1 : noDis,
                  tanggalDis: moment()
                }
                await find.update(send)
                temp.push(1)
              }
            }
          }
          if (temp.length === result.length) {
            return response(res, 'success submit', { cekNo })
          } else {
            return response(res, 'failed submit', {}, 404, false)
          }
        }
      } else {
        return response(res, 'failed submit', {}, 404, false)
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  getDetailDisposal: async (req, res) => {
    try {
      const nomor = req.params.nomor
      let { tipe } = req.query
      if (!tipe) {
        tipe = 'pengajuan'
      }
      if (tipe === 'persetujuan') {
        const result = await disposal.findAll({
          where: {
            status_app: nomor
          },
          include: [{
            model: asset,
            as: 'dataAsset'
          }]
        })
        if (result.length > 0) {
          return response(res, 'succesfully get detail disposal', { result })
        } else {
          return response(res, 'failed get detail disposal', {}, 404, false)
        }
      } else {
        const result = await disposal.findAll({
          where: {
            no_disposal: nomor
          },
          include: [
            {
              model: asset,
              as: 'dataAsset'
            }
          ]
        })
        if (result.length > 0) {
          return response(res, 'succesfully get detail disposal', { result })
        } else {
          return response(res, 'failed get detail disposal', {}, 404, false)
        }
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  getApproveDisposal: async (req, res) => {
    try {
      const no = req.params.no
      const nama = req.params.nama
      const result = await ttd.findAll({
        where: {
          no_doc: no
        }
      })
      if (result.length > 0) {
        const penyetuju = []
        const pembuat = []
        const pemeriksa = []
        for (let i = 0; i < result.length; i++) {
          if (result[i].sebagai === 'pembuat') {
            pembuat.push(result[i])
          } else if (result[i].sebagai === 'pemeriksa') {
            pemeriksa.push(result[i])
          } else if (result[i].sebagai === 'penyetuju') {
            penyetuju.push(result[i])
          }
        }
        return response(res, 'success get template approve', { result: { pembuat, pemeriksa, penyetuju } })
      } else {
        const findDis = await disposal.findAll({
          where: {
            no_disposal: no
          }
        })
        if (findDis) {
          const cekIt = []
          for (let i = 0; i < findDis.length; i++) {
            if (findDis[i].kategori === 'IT') {
              cekIt.push(1)
            }
          }
          const getDepo = await depo.findOne({
            where: {
              kode_plant: findDis[0].kode_plant
            }
          })
          const getApp = await approve.findAll({
            where: {
              nama_approve: nama,
              [Op.or]: [
                { jenis: cekIt.length > 0 ? 'it' : 'all' },
                { jenis: 'all' }
              ]
            }
          })
          if (getApp.length > 0 && getDepo) {
            const hasil = []
            for (let i = 0; i < getApp.length; i++) {
              const send = {
                jabatan: getApp[i].jabatan,
                jenis: getApp[i].jenis,
                sebagai: getApp[i].sebagai,
                kategori: getApp[i].kategori,
                no_doc: no
              }
              const make = await ttd.create(send)
              if (make) {
                hasil.push(make)
              }
            }
            if (hasil.length === getApp.length) {
              const result = await ttd.findAll({
                where: {
                  no_doc: no
                }
              })
              if (result.length > 0) {
                const findArea = await ttd.findByPk(result[0].id)
                if (findArea) {
                  const data = {
                    nama: getDepo.nama_aos,
                    status: 1
                  }
                  const updateArea = await findArea.update(data)
                  if (updateArea) {
                    const findRes = await ttd.findAll({
                      where: {
                        no_doc: no
                      }
                    })
                    if (findRes.length > 0) {
                      const penyetuju = []
                      const pembuat = []
                      const pemeriksa = []
                      for (let i = 0; i < findRes.length; i++) {
                        if (findRes[i].sebagai === 'pembuat') {
                          pembuat.push(findRes[i])
                        } else if (findRes[i].sebagai === 'pemeriksa') {
                          pemeriksa.push(findRes[i])
                        } else if (findRes[i].sebagai === 'penyetuju') {
                          penyetuju.push(findRes[i])
                        }
                      }
                      return response(res, 'success get template approve', { result: { pembuat, pemeriksa, penyetuju } })
                    }
                  }
                }
              }
            } else {
              return response(res, 'failed get data', {}, 404, false)
            }
          } else {
            return response(res, 'failed get data', {}, 404, false)
          }
        } else {
          return response(res, 'failed get data', {}, 404, false)
        }
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  approveDisposal: async (req, res) => {
    try {
      const level = req.user.level
      const name = req.user.name
      const no = req.params.no
      const result = await role.findAll({
        where: {
          nomor: level
        }
      })
      if (result.length > 0) {
        const find = await ttd.findAll({
          where: {
            no_doc: no
          }
        })
        if (find.length > 0) {
          let hasil = 0
          let arr = null
          let position = ''
          for (let i = 0; i < find.length; i++) {
            if (result[0].name === find[i].jabatan) {
              hasil = find[i].id
              arr = i
              position = find[i].jabatan
            }
          }
          if (position === 'BM' || position === 'asset') {
            if (hasil !== 0) {
              if (arr !== find.length - 1 && (find[arr + 1].status !== null || find[arr + 1].status === 1 || find[arr + 1].status === 0)) {
                return response(res, 'Anda tidak memiliki akses lagi untuk mengapprove', {}, 404, false)
              } else {
                if (arr === 0 || find[arr - 1].status === 1) {
                  const findDisposal = await disposal.findAll({
                    where: {
                      no_disposal: no
                    }
                  })
                  if (findDisposal.length > 0) {
                    const dataLength = []
                    const cekfile = []
                    for (let i = 0; i < findDisposal.length; i++) {
                      const findFile = await docUser.findAll({
                        where: {
                          no_pengadaan: findDisposal[i].no_asset,
                          [Op.and]: [
                            { jenis_form: 'disposal' },
                            {
                              [Op.or]: [
                                { tipe: 'pengajuan' },
                                { tipe: findDisposal.nilai_jual === '0' ? 'pengajuan' : 'jual' },
                                { tipe: findDisposal.nilai_jual === '0' ? 'pengajuan' : 'purch' }
                              ]
                            }
                          ]
                        }
                      })
                      if (findFile.length > 0) {
                        if (position === 'BM') {
                          for (let j = 0; j < findFile.length; j++) {
                            dataLength.push(1)
                            if (findFile[j].status === 3) {
                              cekfile.push(1)
                            }
                          }
                        } else {
                          for (let j = 0; j < findFile.length; j++) {
                            dataLength.push(1)
                            if (findFile[j].divisi === '3') {
                              cekfile.push(1)
                            }
                          }
                        }
                      }
                    }
                    if (cekfile.length === dataLength.length) {
                      const data = {
                        nama: name,
                        status: 1,
                        path: null
                      }
                      const findTtd = await ttd.findByPk(hasil)
                      if (findTtd) {
                        const sent = await findTtd.update(data)
                        if (sent) {
                          const results = await ttd.findAll({
                            where: {
                              [Op.and]: [
                                { no_doc: no },
                                { status: 1 }
                              ]
                            }
                          })
                          if (results.length === find.length) {
                            const findDoc = await disposal.findAll({
                              where: {
                                no_disposal: no
                              }
                            })
                            if (findDoc) {
                              const data = {
                                status_form: 9
                              }
                              const valid = []
                              for (let i = 0; i < findDoc.length; i++) {
                                const findAsset = await disposal.findByPk(findDoc[i].id)
                                if (findAsset) {
                                  await findAsset.update(data)
                                  valid.push(1)
                                }
                              }
                              if (valid.length === findDoc.length) {
                                return response(res, 'success approve form disposal')
                              }
                            }
                          } else {
                            const findDoc = await disposal.findOne({
                              where: {
                                no_disposal: no
                              }
                            })
                            if (findDoc) {
                              const findRole = await role.findAll({
                                where: {
                                  name: find[arr + 1].jabatan
                                }
                              })
                              if (findRole.length > 0) {
                                const findDis = await disposal.findAll({
                                  where: {
                                    no_disposal: no
                                  }
                                })
                                if (findDis.length > 0) {
                                  const findUser = await user.findOne({
                                    where: {
                                      user_level: findRole[0].nomor
                                    }
                                  })
                                  if (findUser) {
                                    const mailOptions = {
                                      from: 'noreply_asset@pinusmerahabadi.co.id',
                                      replyTo: 'noreply_asset@pinusmerahabadi.co.id',
                                      to: `${findUser.email}`,
                                      subject: `Approve Pengajuan Disposal D${no} (TESTING)`,
                                      html: `
                                      <head>
                                        <style type="text/css">
                                        body {
                                            display: flexbox;
                                            flex-direction: column;
                                        }
                                        .tittle {
                                            font-size: 15px;
                                        }
                                        .mar {
                                            margin-bottom: 20px;
                                        }
                                        .mar1 {
                                            margin-bottom: 10px;
                                        }
                                        .foot {
                                            margin-top: 20px;
                                            margin-bottom: 10px;
                                        }
                                        .foot1 {
                                            margin-bottom: 50px;
                                        }
                                        .position {
                                            display: flexbox;
                                            flex-direction: row;
                                            justify-content: left;
                                            margin-top: 10px;
                                        }
                                        table {
                                            font-family: "Lucida Sans Unicode", "Lucida Grande", "Segoe Ui";
                                            font-size: 12px;
                                        }
                                        .demo-table {
                                            border-collapse: collapse;
                                            font-size: 13px;
                                        }
                                        .demo-table th, 
                                        .demo-table td {
                                            border-bottom: 1px solid #e1edff;
                                            border-left: 1px solid #e1edff;
                                            padding: 7px 17px;
                                        }
                                        .demo-table th, 
                                        .demo-table td:last-child {
                                            border-right: 1px solid #e1edff;
                                        }
                                        .demo-table td:first-child {
                                            border-top: 1px solid #e1edff;
                                        }
                                        .demo-table td:last-child{
                                            border-bottom: 0;
                                        }
                                        caption {
                                            caption-side: top;
                                            margin-bottom: 10px;
                                        }
                                        
                                        /* Table Header */
                                        .demo-table thead th {
                                            background-color: #508abb;
                                            color: #FFFFFF;
                                            border-color: #6ea1cc !important;
                                            text-transform: uppercase;
                                        }
                                        
                                        /* Table Body */
                                        .demo-table tbody td {
                                            color: #353535;
                                        }
                                        
                                        .demo-table tbody tr:nth-child(odd) td {
                                            background-color: #f4fbff;
                                        }
                                        .demo-table tbody tr:hover th,
                                        .demo-table tbody tr:hover td {
                                            background-color: #ffffa2;
                                            border-color: #ffff0f;
                                            transition: all .2s;
                                        }
                                    </style>
                                      </head>
                                      <body>
                                          <div class="tittle mar">
                                              Dear Bapak/Ibu ${find[arr + 1].jabatan},
                                          </div>
                                          <div class="tittle mar1">
                                              <div>Mohon untuk approve pengajuan disposal asset area.</div>
                                          </div>
                                          <div class="position">
                                              <table class="demo-table">
                                                  <thead>
                                                      <tr>
                                                          <th>No</th>
                                                          <th>No Disposal</th>
                                                          <th>Asset</th>
                                                          <th>Asset description</th>
                                                          <th>Cost Ctr</th>
                                                          <th>Cost Ctr Name</th>
                                                      </tr>
                                                  </thead>
                                                  <tbody>
                                                    ${findDis.length > 0 && findDis.map(item => {
                                                      return (
                                                        `<tr>
                                                          <td>${findDis.indexOf(item) + 1}</td>
                                                          <td>D${item.no_disposal}</td>
                                                          <td>${item.no_asset}</td>
                                                          <td>${item.nama_asset}</td>
                                                          <td>${item.cost_center}</td>
                                                          <td>${item.area}</td>
                                                        </tr>`
                                                      )
                                                    })}
                                                  </tbody>
                                              </table>
                                          </div>
                                          <a href="http://trial.pinusmerahabadi.co.id:8000">Klik link berikut untuk approve</a>
                                          <div class="tittle foot">
                                              Terima kasih,
                                          </div>
                                          <div class="tittle foot1">
                                              Regards,
                                          </div>
                                          <div class="tittle">
                                              Team Asset
                                          </div>
                                      </body>
                                      `
                                    }
                                    mailer.sendMail(mailOptions, (error, result) => {
                                      if (error) {
                                        return response(res, 'berhasil approve dokumen, tidak berhasil kirim notif email 1', { error: error, send: findUser.email })
                                      } else if (result) {
                                        return response(res, 'success approve disposal')
                                      }
                                    })
                                  } else {
                                    return response(res, 'berhasil approve dokumen, tidak berhasil kirim notif email 2')
                                  }
                                } else {
                                  return response(res, 'failed approve disposal', {}, 404, false)
                                }
                              }
                            }
                          }
                        } else {
                          return response(res, 'failed approve disposal', {}, 404, false)
                        }
                      } else {
                        return response(res, 'failed approve disposal', {}, 404, false)
                      }
                    } else {
                      return response(res, 'approve dokumen lampiran pengajuan terlebih dahulu', {}, 404, false)
                    }
                  } else {
                    return response(res, 'failed approve disposal', {}, 404, false)
                  }
                } else {
                  return response(res, `${find[arr - 1].jabatan} belum approve atau telah mereject`, {}, 404, false)
                }
              }
            } else {
              return response(res, 'failed approve disposal', {}, 404, false)
            }
          } else {
            if (hasil !== 0) {
              if (arr !== find.length - 1 && (find[arr + 1].status !== null || find[arr + 1].status === 1 || find[arr + 1].status === 0)) {
                return response(res, 'Anda tidak memiliki akses lagi untuk mereject', {}, 404, false)
              } else {
                if (arr === 0 || find[arr - 1].status === 1) {
                  const data = {
                    nama: name,
                    status: 1,
                    path: null
                  }
                  const findTtd = await ttd.findByPk(hasil)
                  if (findTtd) {
                    const sent = await findTtd.update(data)
                    if (sent) {
                      const results = await ttd.findAll({
                        where: {
                          [Op.and]: [
                            { no_doc: no },
                            { status: 1 }
                          ]
                        }
                      })
                      if (results.length === find.length) {
                        const findDoc = await disposal.findAll({
                          where: {
                            no_disposal: no
                          }
                        })
                        if (findDoc) {
                          const data = {
                            status_form: 9
                          }
                          const valid = []
                          for (let i = 0; i < findDoc.length; i++) {
                            const findAsset = await disposal.findByPk(findDoc[i].id)
                            if (findAsset) {
                              await findAsset.update(data)
                              valid.push(1)
                            }
                          }
                          if (valid.length === findDoc.length) {
                            return response(res, 'success approve form disposal')
                          }
                        }
                      } else {
                        const findDoc = await disposal.findOne({
                          where: {
                            no_disposal: no
                          }
                        })
                        if (findDoc) {
                          const findRole = await role.findAll({
                            where: {
                              name: find[arr + 1].jabatan
                            }
                          })
                          if (findRole.length > 0) {
                            const findDis = await disposal.findAll({
                              where: {
                                no_disposal: no
                              }
                            })
                            if (findDis.length > 0) {
                              const findUser = await user.findOne({
                                where: {
                                  user_level: findRole[0].nomor
                                }
                              })
                              if (findUser) {
                                const mailOptions = {
                                  from: 'noreply_asset@pinusmerahabadi.co.id',
                                  replyTo: 'noreply_asset@pinusmerahabadi.co.id',
                                  to: `${findUser.email}`,
                                  subject: `Approve Pengajuan Disposal D${no} (TESTING)`,
                                  html: `
                                      <head>
                                        <style type="text/css">
                                        body {
                                            display: flexbox;
                                            flex-direction: column;
                                        }
                                        .tittle {
                                            font-size: 15px;
                                        }
                                        .mar {
                                            margin-bottom: 20px;
                                        }
                                        .mar1 {
                                            margin-bottom: 10px;
                                        }
                                        .foot {
                                            margin-top: 20px;
                                            margin-bottom: 10px;
                                        }
                                        .foot1 {
                                            margin-bottom: 50px;
                                        }
                                        .position {
                                            display: flexbox;
                                            flex-direction: row;
                                            justify-content: left;
                                            margin-top: 10px;
                                        }
                                        table {
                                            font-family: "Lucida Sans Unicode", "Lucida Grande", "Segoe Ui";
                                            font-size: 12px;
                                        }
                                        .demo-table {
                                            border-collapse: collapse;
                                            font-size: 13px;
                                        }
                                        .demo-table th, 
                                        .demo-table td {
                                            border-bottom: 1px solid #e1edff;
                                            border-left: 1px solid #e1edff;
                                            padding: 7px 17px;
                                        }
                                        .demo-table th, 
                                        .demo-table td:last-child {
                                            border-right: 1px solid #e1edff;
                                        }
                                        .demo-table td:first-child {
                                            border-top: 1px solid #e1edff;
                                        }
                                        .demo-table td:last-child{
                                            border-bottom: 0;
                                        }
                                        caption {
                                            caption-side: top;
                                            margin-bottom: 10px;
                                        }
                                        
                                        /* Table Header */
                                        .demo-table thead th {
                                            background-color: #508abb;
                                            color: #FFFFFF;
                                            border-color: #6ea1cc !important;
                                            text-transform: uppercase;
                                        }
                                        
                                        /* Table Body */
                                        .demo-table tbody td {
                                            color: #353535;
                                        }
                                        
                                        .demo-table tbody tr:nth-child(odd) td {
                                            background-color: #f4fbff;
                                        }
                                        .demo-table tbody tr:hover th,
                                        .demo-table tbody tr:hover td {
                                            background-color: #ffffa2;
                                            border-color: #ffff0f;
                                            transition: all .2s;
                                        }
                                    </style>
                                      </head>
                                      <body>
                                          <div class="tittle mar">
                                              Dear Bapak/Ibu ${find[arr + 1].jabatan},
                                          </div>
                                          <div class="tittle mar1">
                                              <div>Mohon untuk approve pengajuan disposal asset area.</div>
                                          </div>
                                          <div class="position">
                                              <table class="demo-table">
                                                  <thead>
                                                      <tr>
                                                          <th>No</th>
                                                          <th>No Disposal</th>
                                                          <th>Asset</th>
                                                          <th>Asset description</th>
                                                          <th>Cost Ctr</th>
                                                          <th>Cost Ctr Name</th>
                                                      </tr>
                                                  </thead>
                                                  <tbody>
                                                    ${findDis.length > 0 && findDis.map(item => {
                                                      return (
                                                        `<tr>
                                                          <td>${findDis.indexOf(item) + 1}</td>
                                                          <td>D${item.no_disposal}</td>
                                                          <td>${item.no_asset}</td>
                                                          <td>${item.nama_asset}</td>
                                                          <td>${item.cost_center}</td>
                                                          <td>${item.area}</td>
                                                        </tr>`
                                                      )
                                                    })}
                                                  </tbody>
                                              </table>
                                          </div>
                                          <a href="http://trial.pinusmerahabadi.co.id:8000">Klik link berikut untuk approve</a>
                                          <div class="tittle foot">
                                              Terima kasih,
                                          </div>
                                          <div class="tittle foot1">
                                              Regards,
                                          </div>
                                          <div class="tittle">
                                              Team Asset
                                          </div>                                      
                                      </body>
                                      `
                                }
                                mailer.sendMail(mailOptions, (error, result) => {
                                  if (error) {
                                    return response(res, 'berhasil approve dokumen, tidak berhasil kirim notif email 1', { error: error, send: findUser.email })
                                  } else if (result) {
                                    return response(res, 'success approve disposal')
                                  }
                                })
                              } else {
                                return response(res, 'berhasil approve dokumen, tidak berhasil kirim notif email 2')
                              }
                            } else {
                              return response(res, 'failed approve disposal', {}, 404, false)
                            }
                          }
                        }
                      }
                    } else {
                      return response(res, 'failed approve disposal', {}, 404, false)
                    }
                  } else {
                    return response(res, 'failed approve disposal', {}, 404, false)
                  }
                } else {
                  return response(res, `${find[arr - 1].jabatan} belum approve atau telah mereject`, {}, 404, false)
                }
              }
            } else {
              return response(res, 'failed approve disposal', {}, 404, false)
            }
          }
        } else {
          return response(res, 'failed approve disposal', {}, 404, false)
        }
      } else {
        return response(res, 'failed approve disposal', {}, 404, false)
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  rejectDisposal: async (req, res) => {
    try {
      const level = req.user.level
      const name = req.user.name
      const no = req.params.no
      const { tipe } = req.query
      const schema = joi.object({
        alasan: joi.string().required()
      })
      const { value: results, error } = schema.validate(req.body)
      if (error) {
        return response(res, 'Error', { error: error.message }, 404, false)
      } else {
        const result = await role.findAll({
          where: {
            nomor: level
          }
        })
        if (result.length > 0) {
          const find = await ttd.findAll({
            where: {
              no_doc: no
            }
          })
          if (find.length > 0) {
            let hasil = 0
            let arr = null
            for (let i = 0; i < find.length; i++) {
              if (result[0].name === find[i].jabatan) {
                hasil = find[i].id
                arr = i
              }
            }
            if (hasil !== 0) {
              if (arr !== find.length - 1 && (find[arr + 1].status !== null || find[arr + 1].status === 1 || find[arr + 1].status === 0)) {
                return response(res, 'Anda tidak memiliki akses lagi untuk mereject', {}, 404, false)
              } else {
                if (arr === 0 || find[arr - 1].status === 1) {
                  const data = {
                    nama: name,
                    status: 0,
                    path: results.alasan
                  }
                  const findTtd = await ttd.findByPk(hasil)
                  if (findTtd) {
                    if (tipe === 'batal') {
                      const findDis = await disposal.findAll({
                        where: {
                          no_disposal: no
                        }
                      })
                      if (findDis.length > 0) {
                        const cek = []
                        for (let i = 0; i < findDis.length; i++) {
                          const send = {
                            status: null
                          }
                          const find = await disposal.findOne({
                            where: {
                              no_asset: findDis[i].no_asset
                            }
                          })
                          const updateAsset = await asset.findOne({
                            where: {
                              no_asset: findDis[i].no_asset
                            }
                          })
                          if (find && updateAsset) {
                            await updateAsset.update(send)
                            await find.destroy()
                            cek.push(1)
                          }
                        }
                        if (cek.length === findDis.length) {
                          let draftEmail = ''
                          const draf = []
                          for (let i = 0; i < arr; i++) {
                            if (i === 0) {
                              const findEmail = await email.findOne({
                                where: {
                                  kode_plant: findDis[0].kode_plant
                                }
                              })
                              if (findEmail) {
                                draf.push(findEmail)
                                draftEmail += findEmail.email_area_aos + ', '
                              }
                            } else {
                              const result = await user.findOne({
                                where: {
                                  username: find[i].nama
                                }
                              })
                              if (result) {
                                draf.push(result)
                                draftEmail += result.email + ', '
                              }
                            }
                          }
                          if (draf.length > 0) {
                            const valid = []
                            for (let i = 0; i < find.length; i++) {
                              const serFind = await ttd.findByPk(find[i].id)
                              if (serFind) {
                                await serFind.destroy()
                                valid.push(1)
                              }
                            }
                            if (valid.length > 0) {
                              const cekDok = []
                              for (let i = 0; i < findDis.length; i++) {
                                const docFind = await docUser.findAll({
                                  where: {
                                    no_pengadaan: findDis[i].no_asset,
                                    [Op.and]: [
                                      { jenis_form: 'disposal' },
                                      {
                                        [Op.or]: [
                                          { tipe: 'pengajuan' },
                                          { tipe: 'jual' },
                                          { tipe: 'purch' }
                                        ]
                                      }
                                    ]
                                  }
                                })
                                if (docFind.length > 0) {
                                  for (let i = 0; i < docFind.length; i++) {
                                    const docOne = await docUser.findByPk(docFind[i].id)
                                    if (docOne) {
                                      await docOne.destroy()
                                      cekDok.push(1)
                                    }
                                  }
                                }
                              }
                              if (cekDok.length > 0) {
                                const mailOptions = {
                                  from: 'noreply_asset@pinusmerahabadi.co.id',
                                  replyTo: 'noreply_asset@pinusmerahabadi.co.id',
                                  to: `${draftEmail}`,
                                  subject: 'Reject Pembatalan Disposal Asset (TESTING)',
                                  html: `
                                          <head>
                                            <style type="text/css">
                                            body {
                                                display: flexbox;
                                                flex-direction: column;
                                            }
                                            .tittle {
                                                font-size: 15px;
                                            }
                                            .mar {
                                                margin-bottom: 20px;
                                            }
                                            .mar1 {
                                                margin-bottom: 10px;
                                            }
                                            .foot {
                                                margin-top: 20px;
                                                margin-bottom: 10px;
                                            }
                                            .foot1 {
                                                margin-bottom: 50px;
                                            }
                                            .position {
                                                display: flexbox;
                                                flex-direction: row;
                                                justify-content: left;
                                                margin-top: 10px;
                                            }
                                            table {
                                                font-family: "Lucida Sans Unicode", "Lucida Grande", "Segoe Ui";
                                                font-size: 12px;
                                            }
                                            .demo-table {
                                                border-collapse: collapse;
                                                font-size: 13px;
                                            }
                                            .demo-table th, 
                                            .demo-table td {
                                                border-bottom: 1px solid #e1edff;
                                                border-left: 1px solid #e1edff;
                                                padding: 7px 17px;
                                            }
                                            .demo-table th, 
                                            .demo-table td:last-child {
                                                border-right: 1px solid #e1edff;
                                            }
                                            .demo-table td:first-child {
                                                border-top: 1px solid #e1edff;
                                            }
                                            .demo-table td:last-child{
                                                border-bottom: 0;
                                            }
                                            caption {
                                                caption-side: top;
                                                margin-bottom: 10px;
                                            }
                                            
                                            /* Table Header */
                                            .demo-table thead th {
                                                background-color: #508abb;
                                                color: #FFFFFF;
                                                border-color: #6ea1cc !important;
                                                text-transform: uppercase;
                                            }
                                            
                                            /* Table Body */
                                            .demo-table tbody td {
                                                color: #353535;
                                            }
                                            
                                            .demo-table tbody tr:nth-child(odd) td {
                                                background-color: #f4fbff;
                                            }
                                            .demo-table tbody tr:hover th,
                                            .demo-table tbody tr:hover td {
                                                background-color: #ffffa2;
                                                border-color: #ffff0f;
                                                transition: all .2s;
                                            }
                                        </style>
                                          </head>
                                          <body>
                                              <div class="tittle mar">
                                                  Dear ${find[0].nama},
                                              </div>
                                              <div class="tittle mar1">
                                                  <div>Pengajuan disposal asset telah direject dan dibatalkan</div>
                                                  <div>Alasan Reject: ${results.alasan}</div>
                                                  <div>Direject oleh: ${name}</div>
                                              </div>
                                              <div class="position">
                                                  <table class="demo-table">
                                                      <thead>
                                                          <tr>
                                                              <th>No</th>
                                                              <th>No Disposal</th>
                                                              <th>Asset</th>
                                                              <th>Asset description</th>
                                                              <th>Cost Ctr</th>
                                                              <th>Cost Ctr Name</th>
                                                          </tr>
                                                      </thead>
                                                      <tbody>
                                                        ${findDis.length > 0 && findDis.map(item => {
                                                          return (
                                                            `<tr>
                                                              <td>${findDis.indexOf(item) + 1}</td>
                                                              <td>D${item.no_disposal}</td>
                                                              <td>${item.no_asset}</td>
                                                              <td>${item.nama_asset}</td>
                                                              <td>${item.cost_center}</td>
                                                              <td>${item.area}</td>
                                                            </tr>`
                                                          )
                                                        })}
                                                      </tbody>
                                                  </table>
                                              </div>
                                              <div class="tittle foot">
                                                  Terima kasih,
                                              </div>
                                              <div class="tittle foot1">
                                                  Regards,
                                              </div>
                                              <div class="tittle">
                                                  Team Asset
                                              </div>                                      
                                          </body>
                                          `
                                }
                                mailer.sendMail(mailOptions, (error, result) => {
                                  if (error) {
                                    return response(res, 'berhasil reject dokumen, tidak berhasil kirim notif email 1', { error: error, send: draf })
                                  } else if (result) {
                                    return response(res, 'success reject disposal')
                                  }
                                })
                              } else {
                                return response(res, 'failed reject disposal', {}, 404, false)
                              }
                            }
                          }
                        } else {
                          return response(res, 'failed reject disposal', {}, 404, false)
                        }
                      } else {
                        return response(res, 'failed reject disposal', {}, 404, false)
                      }
                    } else {
                      const sent = await findTtd.update(data)
                      if (sent) {
                        const findDis = await disposal.findAll({
                          where: {
                            no_disposal: no
                          }
                        })
                        let draftEmail = ''
                        const draf = []
                        if (findDis.length > 0) {
                          for (let i = 0; i < arr; i++) {
                            if (i === 0) {
                              const findEmail = await email.findOne({
                                where: {
                                  kode_plant: findDis[0].kode_plant
                                }
                              })
                              if (findEmail) {
                                draf.push(findEmail)
                                draftEmail += findEmail.email_area_aos + ', '
                              }
                            } else {
                              const result = await user.findOne({
                                where: {
                                  username: find[i].nama
                                }
                              })
                              if (result) {
                                draf.push(result)
                                draftEmail += result.email + ', '
                              }
                            }
                          }
                        }
                        const mailOptions = {
                          from: 'noreply_asset@pinusmerahabadi.co.id',
                          replyTo: 'noreply_asset@pinusmerahabadi.co.id',
                          to: `${draftEmail}`,
                          subject: 'Reject Perbaikan Disposal Asset (TESTING)',
                          html: `
                          <head>
                          <style type="text/css">
                            body {
                                display: flexbox;
                                flex-direction: column;
                            }
                            .tittle {
                                font-size: 15px;
                            }
                            .mar {
                                margin-bottom: 20px;
                            }
                            .mar1 {
                                margin-bottom: 10px;
                            }
                            .foot {
                                margin-top: 20px;
                                margin-bottom: 10px;
                            }
                            .foot1 {
                                margin-bottom: 50px;
                            }
                            .position {
                                display: flexbox;
                                flex-direction: row;
                                justify-content: left;
                                margin-top: 10px;
                            }
                            table {
                                font-family: "Lucida Sans Unicode", "Lucida Grande", "Segoe Ui";
                                font-size: 12px;
                            }
                            .demo-table {
                                border-collapse: collapse;
                                font-size: 13px;
                            }
                            .demo-table th, 
                            .demo-table td {
                                border-bottom: 1px solid #e1edff;
                                border-left: 1px solid #e1edff;
                                padding: 7px 17px;
                            }
                            .demo-table th, 
                            .demo-table td:last-child {
                                border-right: 1px solid #e1edff;
                            }
                            .demo-table td:first-child {
                                border-top: 1px solid #e1edff;
                            }
                            .demo-table td:last-child{
                                border-bottom: 0;
                            }
                            caption {
                                caption-side: top;
                                margin-bottom: 10px;
                            }
                            
                            /* Table Header */
                            .demo-table thead th {
                                background-color: #508abb;
                                color: #FFFFFF;
                                border-color: #6ea1cc !important;
                                text-transform: uppercase;
                            }
                            
                            /* Table Body */
                            .demo-table tbody td {
                                color: #353535;
                            }
                            
                            .demo-table tbody tr:nth-child(odd) td {
                                background-color: #f4fbff;
                            }
                            .demo-table tbody tr:hover th,
                            .demo-table tbody tr:hover td {
                                background-color: #ffffa2;
                                border-color: #ffff0f;
                                transition: all .2s;
                            }
                        </style>
                          </head>
                          <body>
                          <div class="tittle mar">
                              Dear ${find[0].nama},
                          </div>
                          <div class="tittle mar1">
                              <div>Pengajuan disposal asset telah direject, mohon untuk segera diperbaiki</div>
                              <div>Alasan reject: ${results.alasan}</div>
                              <div>Direject oleh: ${name}</div>
                          </div>
                          <div class="position">
                              <table class="demo-table">
                                  <thead>
                                      <tr>
                                          <th>No</th>
                                          <th>No Disposal</th>
                                          <th>Asset</th>
                                          <th>Asset description</th>
                                          <th>Cost Ctr</th>
                                          <th>Cost Ctr Name</th>
                                      </tr>
                                  </thead>
                                  <tbody>
                                    ${findDis.length > 0 && findDis.map(item => {
                                      return (
                                        `<tr>
                                          <td>${findDis.indexOf(item) + 1}</td>
                                          <td>D${item.no_disposal}</td>
                                          <td>${item.no_asset}</td>
                                          <td>${item.nama_asset}</td>
                                          <td>${item.cost_center}</td>
                                          <td>${item.area}</td>
                                        </tr>`
                                      )
                                    })}
                                  </tbody>
                              </table>
                          </div>
                          <div class="tittle foot">
                              Terima kasih,
                          </div>
                          <div class="tittle foot1">
                              Regards,
                          </div>
                          <div class="tittle">
                              Team Asset
                          </div>
                      </body>
                          `
                        }
                        mailer.sendMail(mailOptions, (error, result) => {
                          if (error) {
                            return response(res, 'berhasil reject dokumen, tidak berhasil kirim notif email 1', { error: error, send: draftEmail, draf })
                          } else if (result) {
                            return response(res, 'success reject disposal')
                          }
                        })
                      } else {
                        return response(res, 'failed reject disposal', {}, 404, false)
                      }
                    }
                  } else {
                    return response(res, 'failed reject disposal', {}, 404, false)
                  }
                } else {
                  return response(res, `${find[arr - 1].jabatan} belum approve atau telah mereject`, {}, 404, false)
                }
              }
            } else {
              return response(res, 'failed approve disposal', {}, 404, false)
            }
          } else {
            return response(res, 'failed approve disposal', {}, 404, false)
          }
        } else {
          return response(res, 'failed approve disposal', {}, 404, false)
        }
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  updateDisposal: async (req, res) => {
    try {
      const id = req.params.id
      const tipe = req.params.tipe
      const schema = joi.object({
        merk: joi.string().allow(''),
        keterangan: joi.string().allow(''),
        nilai_jual: joi.string().allow(''),
        nominal: joi.string().allow(''),
        no_fp: joi.string().allow(''),
        no_sap: joi.string().allow(''),
        doc_sap: joi.string().allow(''),
        npwp: joi.string().allow('')
      })
      const { value: results, error } = schema.validate(req.body)
      if (error) {
        return response(res, 'Error', { error: error.message }, 404, false)
      } else {
        const result = await disposal.findByPk(id)
        if (result) {
          if (tipe === 'sell' || tipe === 'disposal') {
            const findDoc = await docUser.findAll({
              where: {
                no_pengadaan: result.no_asset,
                [Op.and]: [
                  { jenis_form: 'disposal' },
                  {
                    [Op.or]: [
                      { tipe: 'pengajuan' },
                      { tipe: 'jual' },
                      { tipe: 'purch' },
                      { tipe: 'npwp' }
                    ]
                  }
                ]
              }
            })
            if (findDoc.length > 0) {
              const cek = []
              for (let i = 0; i < findDoc.length; i++) {
                if (findDoc[i].path !== null) {
                  cek.push(1)
                }
              }
              if (cek.length === findDoc.length) {
                const update = await result.update(results)
                if (update) {
                  return response(res, 'success update disposal')
                } else {
                  return response(res, 'failed update disposal', {}, 400, false)
                }
              } else {
                return response(res, 'Lengkapi Dokumen terlebih dahulu', {}, 400, false)
              }
            } else {
              return response(res, 'Lengkapi Dokumen terlebih dahulu', {}, 400, false)
            }
          } else if (tipe === 'taxDis') {
            const findDoc = await docUser.findAll({
              where: {
                no_pengadaan: result.no_asset,
                [Op.and]: [
                  { jenis_form: 'disposal' },
                  { tipe: 'tax' }
                ]
              }
            })
            if (findDoc.length > 0) {
              const cek = []
              for (let i = 0; i < findDoc.length; i++) {
                if (findDoc[i].path !== null) {
                  cek.push(1)
                }
              }
              if (cek.length === findDoc.length) {
                const update = await result.update(results)
                if (update) {
                  return response(res, 'success update disposal')
                } else {
                  return response(res, 'failed update disposal', {}, 400, false)
                }
              } else {
                return response(res, 'Lengkapi Dokumen terlebih dahulu', {}, 400, false)
              }
            } else {
              return response(res, 'Lengkapi Dokumen terlebih dahulu', {}, 400, false)
            }
          } else if (tipe === 'financeDis') {
            const findDoc = await docUser.findAll({
              where: {
                no_pengadaan: result.no_asset,
                [Op.and]: [
                  { jenis_form: 'disposal' },
                  { tipe: 'finance' }
                ]
              }
            })
            if (findDoc.length > 0) {
              const cek = []
              for (let i = 0; i < findDoc.length; i++) {
                if (findDoc[i].path !== null) {
                  cek.push(1)
                }
              }
              if (cek.length === findDoc.length) {
                const update = await result.update(results)
                if (update) {
                  return response(res, 'success update disposal')
                } else {
                  return response(res, 'failed update disposal', {}, 400, false)
                }
              } else {
                return response(res, 'Lengkapi Dokumen terlebih dahulu', {}, 400, false)
              }
            } else {
              return response(res, 'Lengkapi Dokumen terlebih dahulu', {}, 400, false)
            }
          } else {
            const update = await result.update(results)
            if (update) {
              return response(res, 'success update disposal')
            } else {
              return response(res, 'failed update disposal', {}, 400, false)
            }
          }
        } else {
          return response(res, 'failed update disposal', {}, 400, false)
        }
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  getDocumentDis: async (req, res) => {
    try {
      const no = req.params.no
      let { tipeDokumen, tipe, npwp } = req.query
      let tipeDoValue = ''
      let tipeValue = ''
      if (typeof tipeDokumen === 'object') {
        tipeDoValue = Object.values(tipeDokumen)[0]
      } else {
        tipeDoValue = tipeDokumen || 'disposal'
      }
      if (typeof tipe === 'object') {
        tipeValue = Object.values(tipe)[0]
      } else {
        tipeValue = tipe || 'pengajuan'
      }
      if (!npwp) {
        npwp = ''
      }
      const results = await disposal.findOne({
        where: {
          no_asset: no
        }
      })
      if (tipeDoValue === 'disposal' && tipeValue === 'pengajuan') {
        if (results.nilai_jual !== '0') {
          const result = await docUser.findAll({
            where: {
              no_pengadaan: no,
              [Op.and]: [
                { jenis_form: tipeDoValue },
                {
                  [Op.or]: [
                    { tipe: tipeValue },
                    { tipe: 'jual' },
                    { tipe: 'purch' }
                  ]
                }
              ]
            }
          })
          if (result.length > 0) {
            return response(res, 'success get document', { result })
          } else {
            const getDoc = await document.findAll({
              where: {
                [Op.and]: [
                  { tipe_dokumen: tipeDoValue },
                  {
                    [Op.or]: [
                      { tipe: tipeValue },
                      { tipe: 'jual' }
                    ]
                  }
                ],
                [Op.or]: [
                  { jenis_dokumen: results.kategori },
                  { jenis_dokumen: 'all' }
                ]
              }
            })
            if (getDoc) {
              const hasil = []
              for (let i = 0; i < getDoc.length; i++) {
                const send = {
                  nama_dokumen: getDoc[i].nama_dokumen,
                  jenis_dokumen: getDoc[i].jenis_dokumen,
                  divisi: getDoc[i].divisi,
                  no_pengadaan: no,
                  jenis_form: tipeDoValue,
                  tipe: tipeValue,
                  path: null
                }
                const make = await docUser.create(send)
                if (make) {
                  hasil.push(make)
                }
              }
              if (hasil.length === getDoc.length) {
                return response(res, 'success get document', { result: hasil })
              } else {
                return response(res, 'failed get data', {}, 404, false)
              }
            } else {
              return response(res, 'failed get data', {}, 404, false)
            }
          }
        } else {
          const result = await docUser.findAll({
            where: {
              no_pengadaan: no,
              [Op.and]: [
                { jenis_form: tipeDoValue },
                { tipe: tipeValue }
              ]
            }
          })
          if (result.length > 0) {
            return response(res, 'success get document', { result })
          } else {
            const getDoc = await document.findAll({
              where: {
                [Op.and]: [
                  { tipe_dokumen: tipeDoValue },
                  { tipe: tipeValue }
                ],
                [Op.or]: [
                  { jenis_dokumen: results.kategori },
                  { jenis_dokumen: 'all' }
                ]
              }
            })
            if (getDoc) {
              const hasil = []
              for (let i = 0; i < getDoc.length; i++) {
                const send = {
                  nama_dokumen: getDoc[i].nama_dokumen,
                  jenis_dokumen: getDoc[i].jenis_dokumen,
                  divisi: getDoc[i].divisi,
                  no_pengadaan: no,
                  jenis_form: tipeDoValue,
                  tipe: tipeValue,
                  path: null
                }
                const make = await docUser.create(send)
                if (make) {
                  hasil.push(make)
                }
              }
              if (hasil.length === getDoc.length) {
                return response(res, 'success get document', { result: hasil })
              } else {
                return response(res, 'failed get data', {}, 404, false)
              }
            } else {
              return response(res, 'failed get data', {}, 404, false)
            }
          }
        }
      } else if (npwp === 'ada') {
        const findAsset = await disposal.findOne({
          where: {
            no_asset: no
          }
        })
        if (findAsset.npwp === 'ada') {
          const findDoc = await docUser.findAll({
            where: {
              [Op.and]: [
                { no_pengadaan: no },
                { tipe: 'npwp' }
              ]
            }
          })
          if (findDoc.length > 0) {
            const result = await docUser.findAll({
              where: {
                [Op.and]: [
                  { no_pengadaan: no },
                  { jenis_form: tipeDoValue }
                ],
                [Op.or]: [
                  { tipe: tipeValue },
                  { tipe: 'npwp' }
                ]
              }
            })
            if (result.length > 0) {
              return response(res, 'success get document', { result })
            } else {
              return response(res, 'failed get data', {}, 404, false)
            }
          } else {
            const findNpwp = await document.findOne({
              where: {
                [Op.and]: [
                  { tipe_dokumen: tipeDoValue },
                  { tipe: 'npwp' }
                ],
                [Op.or]: [
                  { jenis_dokumen: results.kategori },
                  { jenis_dokumen: 'all' }
                ]
              }
            })
            if (findNpwp) {
              const send = {
                nama_dokumen: findNpwp.nama_dokumen,
                jenis_dokumen: findNpwp.jenis_dokumen,
                divisi: findNpwp.divisi,
                no_pengadaan: no,
                jenis_form: tipeDoValue,
                tipe: 'npwp',
                path: null
              }
              const make = await docUser.create(send)
              if (make) {
                const result = await docUser.findAll({
                  where: {
                    [Op.and]: [
                      { no_pengadaan: no },
                      { jenis_form: tipeDoValue }
                    ],
                    [Op.or]: [
                      { tipe: tipeValue },
                      { tipe: 'npwp' }
                    ]
                  }
                })
                if (result.length > 1) {
                  return response(res, 'success get document', { result })
                } else {
                  const getDoc = await document.findAll({
                    where: {
                      [Op.and]: [
                        { tipe_dokumen: tipeDoValue },
                        { tipe: tipeValue }
                      ],
                      [Op.or]: [
                        { jenis_dokumen: results.kategori },
                        { jenis_dokumen: 'all' }
                      ]
                    }
                  })
                  if (getDoc) {
                    const hasil = []
                    for (let i = 0; i < getDoc.length; i++) {
                      const send = {
                        nama_dokumen: getDoc[i].nama_dokumen,
                        jenis_dokumen: getDoc[i].jenis_dokumen,
                        divisi: getDoc[i].divisi,
                        no_pengadaan: no,
                        jenis_form: tipeDoValue,
                        tipe: tipeValue,
                        path: null
                      }
                      const make = await docUser.create(send)
                      if (make) {
                        hasil.push(make)
                      }
                    }
                    if (hasil.length === getDoc.length) {
                      const result = await docUser.findAll({
                        where: {
                          [Op.and]: [
                            { no_pengadaan: no },
                            { jenis_form: tipeDoValue }
                          ],
                          [Op.or]: [
                            { tipe: tipeValue },
                            { tipe: 'npwp' }
                          ]
                        }
                      })
                      if (result.length > 0) {
                        return response(res, 'success get document', { result })
                      } else {
                        return response(res, 'failed get data', {}, 404, false)
                      }
                    } else {
                      return response(res, 'failed get data', {}, 404, false)
                    }
                  } else {
                    return response(res, 'failed get data', {}, 404, false)
                  }
                }
              } else {
                return response(res, 'failed get data', {}, 404, false)
              }
            } else {
              return response(res, 'failed get data npwp', {}, 404, false)
            }
          }
        } else {
          const findDoc = await docUser.findOne({
            where: {
              [Op.and]: [
                { no_pengadaan: no },
                { tipe: 'npwp' }
              ]
            }
          })
          if (findDoc) {
            const delDoc = await findDoc.destroy()
            if (delDoc) {
              const result = await docUser.findAll({
                where: {
                  no_pengadaan: no,
                  [Op.and]: [
                    { jenis_form: tipeDoValue },
                    { tipe: tipeValue }
                  ]
                }
              })
              if (result.length > 0) {
                return response(res, 'success get document', { result })
              } else {
                const getDoc = await document.findAll({
                  where: {
                    [Op.and]: [
                      { tipe_dokumen: tipeDoValue },
                      { tipe: tipeValue }
                    ],
                    [Op.or]: [
                      { jenis_dokumen: results.kategori },
                      { jenis_dokumen: 'all' }
                    ]
                  }
                })
                if (getDoc) {
                  const hasil = []
                  for (let i = 0; i < getDoc.length; i++) {
                    const send = {
                      nama_dokumen: getDoc[i].nama_dokumen,
                      jenis_dokumen: getDoc[i].jenis_dokumen,
                      divisi: getDoc[i].divisi,
                      no_pengadaan: no,
                      jenis_form: tipeDoValue,
                      tipe: tipeValue,
                      path: null
                    }
                    const make = await docUser.create(send)
                    if (make) {
                      hasil.push(make)
                    }
                  }
                  if (hasil.length === getDoc.length) {
                    return response(res, 'success get document', { result: hasil })
                  } else {
                    return response(res, 'failed get data', {}, 404, false)
                  }
                } else {
                  return response(res, 'failed get data', {}, 404, false)
                }
              }
            } else {
              return response(res, 'failed get data', {}, 404, false)
            }
          } else {
            const result = await docUser.findAll({
              where: {
                no_pengadaan: no,
                [Op.and]: [
                  { jenis_form: tipeDoValue },
                  { tipe: tipeValue }
                ]
              }
            })
            if (result.length > 0) {
              return response(res, 'success get document', { result })
            } else {
              const getDoc = await document.findAll({
                where: {
                  [Op.and]: [
                    { tipe_dokumen: tipeDoValue },
                    { tipe: tipeValue }
                  ],
                  [Op.or]: [
                    { jenis_dokumen: results.kategori },
                    { jenis_dokumen: 'all' }
                  ]
                }
              })
              if (getDoc) {
                const hasil = []
                for (let i = 0; i < getDoc.length; i++) {
                  const send = {
                    nama_dokumen: getDoc[i].nama_dokumen,
                    jenis_dokumen: getDoc[i].jenis_dokumen,
                    divisi: getDoc[i].divisi,
                    no_pengadaan: no,
                    jenis_form: tipeDoValue,
                    tipe: tipeValue,
                    path: null
                  }
                  const make = await docUser.create(send)
                  if (make) {
                    hasil.push(make)
                  }
                }
                if (hasil.length === getDoc.length) {
                  return response(res, 'success get document', { result: hasil })
                } else {
                  return response(res, 'failed get data', {}, 404, false)
                }
              } else {
                return response(res, 'failed get data', {}, 404, false)
              }
            }
          }
        }
      } else {
        const result = await docUser.findAll({
          where: {
            no_pengadaan: no,
            [Op.and]: [
              { jenis_form: tipeDoValue },
              { tipe: tipeValue }
            ]
          }
        })
        if (result.length > 0) {
          return response(res, 'success get document', { result })
        } else {
          const getDoc = await document.findAll({
            where: {
              [Op.and]: [
                { tipe_dokumen: tipeDoValue },
                { tipe: tipeValue }
              ],
              [Op.or]: [
                { jenis_dokumen: results.kategori },
                { jenis_dokumen: 'all' }
              ]
            }
          })
          if (getDoc) {
            const hasil = []
            for (let i = 0; i < getDoc.length; i++) {
              const send = {
                nama_dokumen: getDoc[i].nama_dokumen,
                jenis_dokumen: getDoc[i].jenis_dokumen,
                divisi: getDoc[i].divisi,
                no_pengadaan: no,
                jenis_form: tipeDoValue,
                tipe: tipeValue,
                path: null
              }
              const make = await docUser.create(send)
              if (make) {
                hasil.push(make)
              }
            }
            if (hasil.length === getDoc.length) {
              return response(res, 'success get document', { result: hasil })
            } else {
              return response(res, 'failed get data', {}, 404, false)
            }
          } else {
            return response(res, 'failed get data', {}, 404, false)
          }
        }
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  uploadDocument: async (req, res) => {
    const id = req.params.id
    uploadHelper(req, res, async function (err) {
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
        const dokumen = `assets/documents/${req.file.filename}`
        const result = await docUser.findByPk(id)
        if (result) {
          const send = {
            status: 1,
            path: dokumen,
            divisi: 'asset'
          }
          await result.update(send)
          return response(res, 'successfully upload dokumen', { send })
        } else {
          return response(res, 'failed upload dokumen', {}, 404, false)
        }
      } catch (error) {
        return response(res, error.message, {}, 500, false)
      }
    })
  },
  approveDokumen: async (req, res) => {
    try {
      const id = req.params.id
      const level = req.user.level
      const result = await docUser.findByPk(id)
      if (result) {
        if (level === 2) {
          const send = {
            divisi: '3',
            alasan: ''
          }
          const results = await result.update(send)
          return response(res, 'successfully approve dokumen', { result: results })
        } else {
          const send = {
            status: 3,
            alasan: ''
          }
          const results = await result.update(send)
          return response(res, 'successfully approve dokumen', { result: results })
        }
      } else {
        return response(res, 'failed approve dokumen', {}, 404, false)
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  rejectDokumen: async (req, res) => {
    try {
      const id = req.params.id
      const level = req.user.level
      const schema = joi.object({
        alasan: joi.string().required()
      })
      const { value: results, error } = schema.validate(req.body)
      if (error) {
        return response(res, 'Error', { error: error.message }, 404, false)
      } else {
        const result = await docUser.findByPk(id)
        if (result) {
          if (level === 2) {
            const send = {
              alasan: results.alasan,
              divisi: '0'
            }
            const reject = await result.update(send)
            if (reject) {
              return response(res, 'successfully reject dokumen', { result: reject })
            } else {
              return response(res, 'failed reject dokumen', {}, 404, false)
            }
          } else {
            const send = {
              alasan: results.alasan,
              status: 0
            }
            const reject = await result.update(send)
            if (reject) {
              return response(res, 'successfully reject dokumen', { result: reject })
            } else {
              return response(res, 'failed reject dokumen', {}, 404, false)
            }
          }
        } else {
          return response(res, 'failed reject dokumen', {}, 404, false)
        }
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  rejectTaxFin: async (req, res) => {
    const no = req.params.no
    const { tipe } = req.query
    try {
      const result = await disposal.findOne({
        where: {
          no_asset: no
        }
      })
      if (result) {
        if (result.no_io === 'finance' || result.no_io === 'tax' || result.no_io === 'taxfin') {
          const data = {
            no_io: 'taxfin'
          }
          const sent = await result.update(data)
          if (sent) {
            return response(res, 'success reject tax and finance')
          } else {
            return response(res, 'failed reject tax and finance', {}, 404, false)
          }
        } else {
          const data = {
            no_io: tipe
          }
          const sent = await result.update(data)
          if (sent) {
            return response(res, 'success reject tax and finance')
          } else {
            return response(res, 'failed reject tax and finance', {}, 404, false)
          }
        }
      } else {
        return response(res, 'failed reject tax and finance', {}, 404, false)
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  submitEditTaxFin: async (req, res) => {
    const no = req.params.no
    const level = req.user.level
    try {
      const result = await disposal.findOne({
        where: {
          no_asset: no
        }
      })
      if (result) {
        if (result.no_io === 'taxfin' && level === 3) {
          const data = {
            status_form: 7,
            no_io: 'finance'
          }
          const sent = await result.update(data)
          if (sent) {
            return response(res, 'success reject tax and finance')
          } else {
            return response(res, 'failed reject tax and finance', {}, 404, false)
          }
        } else if (result.no_io === 'taxfin' && level === 4) {
          const data = {
            status_form: 7,
            no_io: 'tax'
          }
          const sent = await result.update(data)
          if (sent) {
            return response(res, 'success reject tax and finance')
          } else {
            return response(res, 'failed reject tax and finance', {}, 404, false)
          }
        } else {
          const data = {
            status_form: 7,
            no_io: null
          }
          const sent = await result.update(data)
          if (sent) {
            return response(res, 'success reject tax and finance')
          } else {
            return response(res, 'failed reject tax and finance', {}, 404, false)
          }
        }
      } else {
        return response(res, 'failed reject tax and finance', {}, 404, false)
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  getApproveSetDisposal: async (req, res) => {
    try {
      const no = req.params.no
      const nama = req.params.nama
      const result = await ttd.findAll({
        where: {
          no_set: no
        }
      })
      if (result.length > 0) {
        const penyetuju = []
        const pembuat = []
        for (let i = 0; i < result.length; i++) {
          if (result[i].sebagai === 'pembuat') {
            pembuat.push(result[i])
          } else if (result[i].sebagai === 'penyetuju') {
            penyetuju.push(result[i])
          }
        }
        return response(res, 'success get template approve', { result: { pembuat, penyetuju } })
      } else {
        const result = await disposal.findAll({
          where: {
            status_app: no
          }
        })
        if (result) {
          const getApp = await approve.findAll({
            where: {
              nama_approve: nama
            }
          })
          if (getApp) {
            const hasil = []
            for (let i = 0; i < getApp.length; i++) {
              const send = {
                jabatan: getApp[i].jabatan,
                jenis: getApp[i].jenis,
                sebagai: getApp[i].sebagai,
                kategori: getApp[i].kategori,
                no_set: no
              }
              const make = await ttd.create(send)
              if (make) {
                hasil.push(make)
              }
            }
            if (hasil.length === getApp.length) {
              const result = await ttd.findAll({
                where: {
                  no_set: no
                }
              })
              if (result.length > 0) {
                const penyetuju = []
                const pembuat = []
                for (let i = 0; i < result.length; i++) {
                  if (result[i].sebagai === 'pembuat') {
                    pembuat.push(result[i])
                  } else if (result[i].sebagai === 'penyetuju') {
                    penyetuju.push(result[i])
                  }
                }
                return response(res, 'success get template approve', { result: { pembuat, penyetuju } })
              } else {
                return response(res, 'failed get data approve', {}, 404, false)
              }
            } else {
              return response(res, 'failed get data approve', {}, 404, false)
            }
          } else {
            return response(res, 'failed get data approve', {}, 404, false)
          }
        } else {
          return response(res, 'failed get data approve', {}, 404, false)
        }
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  approveSetDisposal: async (req, res) => {
    try {
      const level = req.user.level
      const name = req.user.name
      const no = req.params.no
      if (level === 22 || level === 23 || level === 25) {
        const findTtd = await ttd.findAll({
          where: {
            no_set: no
          }
        })
        if (findTtd[1].status === 1) {
          const result = await role.findAll({
            where: {
              [Op.or]: [
                { nomor: 22 },
                { nomor: 23 },
                { nomor: 25 }
              ]
            }
          })
          if (result.length > 0) {
            const cek = []
            for (let i = 0; i < result.length; i++) {
              const findUser = await user.findOne({
                where: {
                  user_level: result[i].nomor
                }
              })
              if (findUser) {
                const data = {
                  nama: findUser.username,
                  status: 1,
                  path: null
                }
                const find = await ttd.findOne({
                  where: {
                    [Op.and]: [
                      { no_set: no },
                      { jabatan: result[i].name }
                    ]
                  }
                })
                if (find) {
                  await find.update(data)
                  cek.push(1)
                }
              }
            }
            if (cek.length === result.length) {
              const findDoc = await disposal.findAll({
                where: {
                  status_app: no
                }
              })
              if (findDoc) {
                const data = {
                  status_form: 4
                }
                const valid = []
                for (let i = 0; i < findDoc.length; i++) {
                  const findAsset = await disposal.findByPk(findDoc[i].id)
                  if (findAsset) {
                    await findAsset.update(data)
                    valid.push(1)
                  }
                }
                if (valid.length === findDoc.length) {
                  return response(res, 'success approve form disposal')
                }
              }
            } else {
              return response(res, 'failed approve disposal', {}, 404, false)
            }
          } else {
            return response(res, 'failed approve disposal', {}, 404, false)
          }
        } else {
          return response(res, `${findTtd[1].jabatan} belum approve atau telah mereject`, {}, 404, false)
        }
      } else {
        const result = await role.findAll({
          where: {
            nomor: level
          }
        })
        if (result.length > 0) {
          const find = await ttd.findAll({
            where: {
              no_set: no
            }
          })
          if (find.length > 0) {
            let hasil = 0
            let arr = null
            for (let i = 0; i < find.length; i++) {
              if (result[0].name === find[i].jabatan) {
                hasil = find[i].id
                arr = i
              }
            }
            if (hasil !== 0) {
              if (arr !== find.length - 1 && (find[arr + 1].status !== null || find[arr + 1].status === 1 || find[arr + 1].status === 0)) {
                return response(res, 'Anda tidak memiliki akses lagi untuk mengapprove', {}, 404, false)
              } else {
                if (arr === 0 || find[arr - 1].status === 1) {
                  const data = {
                    nama: name,
                    status: 1,
                    path: null
                  }
                  const findTtd = await ttd.findByPk(hasil)
                  if (findTtd) {
                    const sent = await findTtd.update(data)
                    if (sent) {
                      const results = await ttd.findAll({
                        where: {
                          [Op.and]: [
                            { no_set: no },
                            { status: 1 }
                          ]
                        }
                      })
                      if (results.length === find.length) {
                        const findDoc = await disposal.findAll({
                          where: {
                            status_app: no
                          }
                        })
                        if (findDoc) {
                          const data = {
                            status_form: 4
                          }
                          const valid = []
                          for (let i = 0; i < findDoc.length; i++) {
                            const findAsset = await disposal.findByPk(findDoc[i].id)
                            if (findAsset) {
                              await findAsset.update(data)
                              valid.push(1)
                            }
                          }
                          if (valid.length === findDoc.length) {
                            return response(res, 'success approve form disposal')
                          }
                        }
                      } else {
                        const findDoc = await disposal.findAll({
                          where: {
                            status_app: no
                          }
                        })
                        if (findDoc.length > 0) {
                          const findRole = await role.findAll({
                            where: {
                              name: find[arr + 1].jabatan
                            }
                          })
                          if (findRole.length > 0) {
                            const findDis = await disposal.findAll({
                              where: {
                                status_app: no
                              }
                            })
                            if (findDis.length > 0) {
                              const findUser = await user.findOne({
                                where: {
                                  user_level: findRole[0].nomor
                                }
                              })
                              if (findUser) {
                                const mailOptions = {
                                  from: 'noreply_asset@pinusmerahabadi.co.id',
                                  replyTo: 'noreply_asset@pinusmerahabadi.co.id',
                                  to: `${findUser.email}`,
                                  subject: `Approve Persetujuan Disposal D${no} (TESTING)`,
                                  html: `
                                      <head>
                                        <style type="text/css">
                                        body {
                                            display: flexbox;
                                            flex-direction: column;
                                        }
                                        .tittle {
                                            font-size: 15px;
                                        }
                                        .mar {
                                            margin-bottom: 20px;
                                        }
                                        .mar1 {
                                            margin-bottom: 10px;
                                        }
                                        .foot {
                                            margin-top: 20px;
                                            margin-bottom: 10px;
                                        }
                                        .foot1 {
                                            margin-bottom: 50px;
                                        }
                                        .position {
                                            display: flexbox;
                                            flex-direction: row;
                                            justify-content: left;
                                            margin-top: 10px;
                                        }
                                        table {
                                            font-family: "Lucida Sans Unicode", "Lucida Grande", "Segoe Ui";
                                            font-size: 12px;
                                        }
                                        .demo-table {
                                            border-collapse: collapse;
                                            font-size: 13px;
                                        }
                                        .demo-table th, 
                                        .demo-table td {
                                            border-bottom: 1px solid #e1edff;
                                            border-left: 1px solid #e1edff;
                                            padding: 7px 17px;
                                        }
                                        .demo-table th, 
                                        .demo-table td:last-child {
                                            border-right: 1px solid #e1edff;
                                        }
                                        .demo-table td:first-child {
                                            border-top: 1px solid #e1edff;
                                        }
                                        .demo-table td:last-child{
                                            border-bottom: 0;
                                        }
                                        caption {
                                            caption-side: top;
                                            margin-bottom: 10px;
                                        }
                                        
                                        /* Table Header */
                                        .demo-table thead th {
                                            background-color: #508abb;
                                            color: #FFFFFF;
                                            border-color: #6ea1cc !important;
                                            text-transform: uppercase;
                                        }
                                        
                                        /* Table Body */
                                        .demo-table tbody td {
                                            color: #353535;
                                        }
                                        
                                        .demo-table tbody tr:nth-child(odd) td {
                                            background-color: #f4fbff;
                                        }
                                        .demo-table tbody tr:hover th,
                                        .demo-table tbody tr:hover td {
                                            background-color: #ffffa2;
                                            border-color: #ffff0f;
                                            transition: all .2s;
                                        }
                                    </style>
                                      </head>
                                      <body>
                                          <div class="tittle mar">
                                              Dear Bapak/Ibu ${find[arr + 1].jabatan},
                                          </div>
                                          <div class="tittle mar1">
                                              <div>Mohon untuk approve persetujuan disposal asset area.</div>
                                          </div>
                                          <div class="position">
                                              <table class="demo-table">
                                                  <thead>
                                                      <tr>
                                                          <th>No</th>
                                                          <th>No Disposal</th>
                                                          <th>Asset</th>
                                                          <th>Asset description</th>
                                                          <th>Cost Ctr</th>
                                                          <th>Cost Ctr Name</th>
                                                      </tr>
                                                  </thead>
                                                  <tbody>
                                                    ${findDis.length > 0 && findDis.map(item => {
                                                      return (
                                                        `<tr>
                                                          <td>${findDis.indexOf(item) + 1}</td>
                                                          <td>D${item.no_disposal}</td>
                                                          <td>${item.no_asset}</td>
                                                          <td>${item.nama_asset}</td>
                                                          <td>${item.cost_center}</td>
                                                          <td>${item.area}</td>
                                                        </tr>`
                                                      )
                                                    })}
                                                  </tbody>
                                              </table>
                                          </div>
                                          <a href="http://trial.pinusmerahabadi.co.id:8000">Klik link berikut untuk approve</a>
                                          <div class="tittle foot">
                                              Terima kasih,
                                          </div>
                                          <div class="tittle foot1">
                                              Regards,
                                          </div>
                                          <div class="tittle">
                                              Team Asset
                                          </div>                                      
                                      </body>
                                      `
                                }
                                //   const mailOptions = {
                                //     from: `${result.email_ho_pic}`,
                                //     replyTo: `${result.email_ho_pic}`,
                                //     to: `${result.email_aos}`,
                                //     cc: `${result.email_sa_kasir}, ${result.email_ho_pic}`,
                                //     subject: 'Rejected Dokumen',
                                //     html: `<body>
                                //     <div style="margin-top: 20px; margin-bottom: 20px;">Dear Bapak/Ibu AOS</div>
                                //     <div style="margin-bottom: 10px;">Report has been verified by Team Accounting with the following list:</div>
                                //     <table style="border-collapse: collapse; margin-bottom: 20px;">
                                //           <tr style="height: 75px;">
                                //             <th style="border: 1px solid black; background-color: lightgray; width: 20px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;">No</th>
                                //             <th style="border: 1px solid black; background-color: lightgray; width: 100px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;">Nomor Aset</th>
                                //             <th style="border: 1px solid black; background-color: lightgray; width: 100px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;">Nama Barang</th>
                                //             <th style="border: 1px solid black; background-color: lightgray; width: 100px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;">Merk / Type</th>
                                //             <th style="border: 1px solid black; background-color: lightgray; width: 100px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;">Kategori</th>
                                //             <th style="border: 1px solid black; background-color: lightgray; width: 100px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;">Cabang / depo</th>
                                //             <th style="border: 1px solid black; background-color: lightgray; width: 100px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;">Cost Center</th>
                                //             <th style="border: 1px solid black; background-color: lightgray; width: 100px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;">Nilai Buku</th>
                                //             <th style="border: 1px solid black; background-color: lightgray; width: 100px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;">Nilai Jual</th>
                                //             <th style="border: 1px solid black; background-color: lightgray; width: 100px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;">Keterangan</th>
                                //           </tr>
                                //           <tr style="height: 50px;">
                                //             <th scope="row" style='border: 1px solid black;'>1</th>
                                //             <td style='border: 1px solid black;'>find.nama_depo}</td>
                                //             <td style='border: 1px solid black;'>dok.dokumen}</td>
                                //             <td style='border: 1px solid black;'>act.jenis_dokumen}</td>
                                //             <td style='border: 1px solid black;'>moment(act.createdAt).subtract(1, 'day').format('DD-MM-YYYY')}</td>
                                //             <td style='border: 1px solid black;'>moment(dok.createdAt).format('DD-MM-YYYY')}</td>
                                //             <td style='border: 1px solid black;'>moment(dok.updatedAt).format('DD-MM-YYYY')}</td>
                                //             <td style='border: 1px solid black;'>Rejected</td>
                                //             <td style='border: 1px solid black;'>dok.alasan}</td>
                                //           </tr>
                                //     </table>
                                //     <a href="http://trial.pinusmerahabadi.co.id:3000/">With the following link</a>
                                //     <div style="margin-top: 20px;">Thank you.</div>
                                // </body>
                                //     `
                                //   }
                                mailer.sendMail(mailOptions, (error, result) => {
                                  if (error) {
                                    return response(res, 'berhasil approve dokumen, tidak berhasil kirim notif email 1', { error: error, send: findUser.email })
                                  } else if (result) {
                                    return response(res, 'success approve disposal')
                                  }
                                })
                              } else {
                                return response(res, 'berhasil approve disposal, tidak berhasil kirim notif email 2')
                              }
                            } else {
                              return response(res, 'failed approve disposal', {}, 404, false)
                            }
                          }
                        }
                      }
                    } else {
                      return response(res, 'failed approve disposal', {}, 404, false)
                    }
                  } else {
                    return response(res, 'failed approve disposal', {}, 404, false)
                  }
                } else {
                  return response(res, `${find[arr - 1].jabatan} belum approve atau telah mereject`, {}, 404, false)
                }
              }
            } else {
              return response(res, 'failed approve disposal', {}, 404, false)
            }
          } else {
            return response(res, 'failed approve disposal', {}, 404, false)
          }
        } else {
          return response(res, 'failed approve disposal', {}, 404, false)
        }
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  rejectSetDisposal: async (req, res) => {
    try {
      const level = req.user.level
      const name = req.user.name
      const no = req.params.no
      const { tipe } = req.query
      const schema = joi.object({
        alasan: joi.string().required()
      })
      const { value: results, error } = schema.validate(req.body)
      if (error) {
        return response(res, 'Error', { error: error.message }, 404, false)
      } else {
        const result = await role.findAll({
          where: {
            nomor: level
          }
        })
        if (result.length > 0) {
          const find = await ttd.findAll({
            where: {
              no_set: no
            }
          })
          if (find.length > 0) {
            let hasil = 0
            let arr = null
            for (let i = 0; i < find.length; i++) {
              if (result[0].name === find[i].jabatan) {
                hasil = find[i].id
                arr = i
              }
            }
            if (hasil !== 0) {
              if (arr !== find.length - 1 && (find[arr + 1].status !== null || find[arr + 1].status === 1 || find[arr + 1].status === 0)) {
                return response(res, 'Anda tidak memiliki akses lagi untuk mengapprove', {}, 404, false)
              } else {
                if (arr === 0 || find[arr - 1].status === 1) {
                  const data = {
                    nama: name,
                    status: 0,
                    path: results.alasan
                  }
                  const findTtd = await ttd.findByPk(hasil)
                  if (findTtd) {
                    if (tipe === 'batal') {
                      const findDis = await disposal.findAll({
                        where: {
                          status_app: no
                        }
                      })
                      if (findDis.length > 0) {
                        const cek = []
                        for (let i = 0; i < findDis.length; i++) {
                          const send = {
                            status: null
                          }
                          const find = await disposal.findOne({
                            where: {
                              no_asset: findDis[i].no_asset
                            }
                          })
                          const updateAsset = await asset.findOne({
                            where: {
                              no_asset: findDis[i].no_asset
                            }
                          })
                          if (find && updateAsset) {
                            await updateAsset.update(send)
                            await find.destroy()
                            cek.push(1)
                          }
                        }
                        if (cek.length === findDis.length) {
                          let draftEmail = ''
                          const draf = []
                          const listPlant = []
                          for (let i = 0; i < arr; i++) {
                            const result = await user.findOne({
                              where: {
                                username: find[i].nama
                              }
                            })
                            if (result) {
                              draf.push(result)
                              draftEmail += result.email + ', '
                            }
                          }
                          findDis.map(x => {
                            return (
                              listPlant.push(x.kode_plant)
                            )
                          })
                          const set = new Set(listPlant)
                          const noPlant = [...set]
                          for (let i = 0; i < noPlant.length; i++) {
                            const findEmail = await email.findOne({
                              where: {
                                kode_plant: noPlant[i]
                              }
                            })
                            if (findEmail) {
                              draf.push(findEmail)
                              draftEmail += findEmail.email_area_aos + ', '
                            }
                          }
                          if (draf.length > 0) {
                            const valid = []
                            for (let i = 0; i < find.length; i++) {
                              const serFind = await ttd.findByPk(find[i].id)
                              if (serFind) {
                                await serFind.destroy()
                                valid.push(1)
                              }
                            }
                            if (valid.length > 0) {
                              const findApp = await ttd.findAll({
                                where: {
                                  no_doc: findDis[0].no_disposal
                                }
                              })
                              if (findApp.length > 0) {
                                const cekTtd = []
                                for (let i = 0; i < findApp.length; i++) {
                                  const ttdOne = await ttd.findByPk(findApp[i].id)
                                  if (ttdOne) {
                                    await ttdOne.destroy()
                                    cekTtd.push(1)
                                  }
                                }
                                if (cekTtd.length > 0) {
                                  const cekDok = []
                                  for (let i = 0; i < findDis.length; i++) {
                                    const docFind = await docUser.findAll({
                                      where: {
                                        no_pengadaan: findDis[i].no_asset,
                                        [Op.and]: [
                                          { jenis_form: 'disposal' },
                                          {
                                            [Op.or]: [
                                              { tipe: 'pengajuan' },
                                              { tipe: 'jual' },
                                              { tipe: 'purch' }
                                            ]
                                          }
                                        ]
                                      }
                                    })
                                    if (docFind.length > 0) {
                                      for (let j = 0; j < docFind.length; j++) {
                                        const docOne = await docUser.findByPk(docFind[j].id)
                                        if (docOne) {
                                          await docOne.destroy()
                                          cekDok.push(1)
                                        }
                                      }
                                    }
                                  }
                                  if (cekDok.length > 0) {
                                    const mailOptions = {
                                      from: 'noreply_asset@pinusmerahabadi.co.id',
                                      replyTo: 'noreply_asset@pinusmerahabadi.co.id',
                                      to: `${draftEmail}`,
                                      subject: 'Reject Perbaikan Disposal Asset (TESTING)',
                                      html: `
                                        <head>
                                        <style type="text/css">
                                          body {
                                              display: flexbox;
                                              flex-direction: column;
                                          }
                                          .tittle {
                                              font-size: 15px;
                                          }
                                          .mar {
                                              margin-bottom: 20px;
                                          }
                                          .mar1 {
                                              margin-bottom: 10px;
                                          }
                                          .foot {
                                              margin-top: 20px;
                                              margin-bottom: 10px;
                                          }
                                          .foot1 {
                                              margin-bottom: 50px;
                                          }
                                          .position {
                                              display: flexbox;
                                              flex-direction: row;
                                              justify-content: left;
                                              margin-top: 10px;
                                          }
                                          table {
                                              font-family: "Lucida Sans Unicode", "Lucida Grande", "Segoe Ui";
                                              font-size: 12px;
                                          }
                                          .demo-table {
                                              border-collapse: collapse;
                                              font-size: 13px;
                                          }
                                          .demo-table th, 
                                          .demo-table td {
                                              border-bottom: 1px solid #e1edff;
                                              border-left: 1px solid #e1edff;
                                              padding: 7px 17px;
                                          }
                                          .demo-table th, 
                                          .demo-table td:last-child {
                                              border-right: 1px solid #e1edff;
                                          }
                                          .demo-table td:first-child {
                                              border-top: 1px solid #e1edff;
                                          }
                                          .demo-table td:last-child{
                                              border-bottom: 0;
                                          }
                                          caption {
                                              caption-side: top;
                                              margin-bottom: 10px;
                                          }
                                          
                                          /* Table Header */
                                          .demo-table thead th {
                                              background-color: #508abb;
                                              color: #FFFFFF;
                                              border-color: #6ea1cc !important;
                                              text-transform: uppercase;
                                          }
                                          
                                          /* Table Body */
                                          .demo-table tbody td {
                                              color: #353535;
                                          }
                                          
                                          .demo-table tbody tr:nth-child(odd) td {
                                              background-color: #f4fbff;
                                          }
                                          .demo-table tbody tr:hover th,
                                          .demo-table tbody tr:hover td {
                                              background-color: #ffffa2;
                                              border-color: #ffff0f;
                                              transition: all .2s;
                                          }
                                      </style>
                                        </head>
                                        <body>
                                        <div class="tittle mar">
                                            Dear All,
                                        </div>
                                        <div class="tittle mar1">
                                            <div>Pengajuan disposal asset telah direject, mohon untuk segera diperbaiki</div>
                                            <div>Alasan reject: ${results.alasan}</div>
                                            <div>Direject oleh: ${name}</div>
                                        </div>
                                        <div class="position">
                                            <table class="demo-table">
                                                <thead>
                                                    <tr>
                                                        <th>No</th>
                                                        <th>No Disposal</th>
                                                        <th>Asset</th>
                                                        <th>Asset description</th>
                                                        <th>Cost Ctr</th>
                                                        <th>Cost Ctr Name</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                  ${findDis.length > 0 && findDis.map(item => {
                                                    return (
                                                      `<tr>
                                                        <td>${findDis.indexOf(item) + 1}</td>
                                                        <td>D${item.no_disposal}</td>
                                                        <td>${item.no_asset}</td>
                                                        <td>${item.nama_asset}</td>
                                                        <td>${item.cost_center}</td>
                                                        <td>${item.area}</td>
                                                      </tr>`
                                                    )
                                                  })}
                                                </tbody>
                                            </table>
                                        </div>
                                        <div class="tittle foot">
                                            Terima kasih,
                                        </div>
                                        <div class="tittle foot1">
                                            Regards,
                                        </div>
                                        <div class="tittle">
                                            Team Asset
                                        </div>
                                    </body>
                                    `
                                    }
                                    mailer.sendMail(mailOptions, (error, result) => {
                                      if (error) {
                                        return response(res, 'berhasil reject dokumen, tidak berhasil kirim notif email 1', { error: error, send: draf })
                                      } else if (result) {
                                        return response(res, 'success reject disposal')
                                      }
                                    })
                                  } else {
                                    return response(res, 'failed reject persetujuan disposal', {}, 404, false)
                                  }
                                } else {
                                  return response(res, 'failed reject persetujuan disposal', {}, 404, false)
                                }
                              } else {
                                return response(res, 'failed reject persetujuan disposal', {}, 404, false)
                              }
                            } else {
                              return response(res, 'failed reject persetujuan disposal', {}, 404, false)
                            }
                          } else {
                            return response(res, 'failed reject persetujuan disposal', {}, 404, false)
                          }
                        } else {
                          return response(res, 'failed reject disposal', {}, 404, false)
                        }
                      } else {
                        return response(res, 'failed reject disposal', {}, 404, false)
                      }
                    } else {
                      const sent = await findTtd.update(data)
                      if (sent) {
                        let draftEmail = ''
                        const draf = []
                        const listPlant = []
                        const findDis = await disposal.findAll({
                          where: {
                            status_app: no
                          }
                        })
                        if (findDis.length > 0) {
                          for (let i = 0; i < arr; i++) {
                            const result = await user.findOne({
                              where: {
                                username: find[i].nama
                              }
                            })
                            if (result) {
                              draf.push(result)
                              draftEmail += result.email + ', '
                            }
                          }
                          findDis.map(x => {
                            return (
                              listPlant.push(x.kode_plant)
                            )
                          })
                          const set = new Set(listPlant)
                          const noPlant = [...set]
                          for (let i = 0; i < noPlant.length; i++) {
                            const findEmail = await email.findOne({
                              where: {
                                kode_plant: noPlant[i]
                              }
                            })
                            if (findEmail) {
                              draf.push(findEmail)
                              draftEmail += findEmail.email_area_aos + ', '
                            }
                          }
                          const mailOptions = {
                            from: 'noreply_asset@pinusmerahabadi.co.id',
                            replyTo: 'noreply_asset@pinusmerahabadi.co.id',
                            to: `${draftEmail}`,
                            subject: 'Reject Perbaikan Disposal Asset (TESTING)',
                            html: `
                              <head>
                              <style type="text/css">
                                body {
                                    display: flexbox;
                                    flex-direction: column;
                                }
                                .tittle {
                                    font-size: 15px;
                                }
                                .mar {
                                    margin-bottom: 20px;
                                }
                                .mar1 {
                                    margin-bottom: 10px;
                                }
                                .foot {
                                    margin-top: 20px;
                                    margin-bottom: 10px;
                                }
                                .foot1 {
                                    margin-bottom: 50px;
                                }
                                .position {
                                    display: flexbox;
                                    flex-direction: row;
                                    justify-content: left;
                                    margin-top: 10px;
                                }
                                table {
                                    font-family: "Lucida Sans Unicode", "Lucida Grande", "Segoe Ui";
                                    font-size: 12px;
                                }
                                .demo-table {
                                    border-collapse: collapse;
                                    font-size: 13px;
                                }
                                .demo-table th, 
                                .demo-table td {
                                    border-bottom: 1px solid #e1edff;
                                    border-left: 1px solid #e1edff;
                                    padding: 7px 17px;
                                }
                                .demo-table th, 
                                .demo-table td:last-child {
                                    border-right: 1px solid #e1edff;
                                }
                                .demo-table td:first-child {
                                    border-top: 1px solid #e1edff;
                                }
                                .demo-table td:last-child{
                                    border-bottom: 0;
                                }
                                caption {
                                    caption-side: top;
                                    margin-bottom: 10px;
                                }
                                
                                /* Table Header */
                                .demo-table thead th {
                                    background-color: #508abb;
                                    color: #FFFFFF;
                                    border-color: #6ea1cc !important;
                                    text-transform: uppercase;
                                }
                                
                                /* Table Body */
                                .demo-table tbody td {
                                    color: #353535;
                                }
                                
                                .demo-table tbody tr:nth-child(odd) td {
                                    background-color: #f4fbff;
                                }
                                .demo-table tbody tr:hover th,
                                .demo-table tbody tr:hover td {
                                    background-color: #ffffa2;
                                    border-color: #ffff0f;
                                    transition: all .2s;
                                }
                            </style>
                              </head>
                              <body>
                              <div class="tittle mar">
                                  Dear All,
                              </div>
                              <div class="tittle mar1">
                                  <div>Pengajuan disposal asset telah direject, mohon untuk segera diperbaiki</div>
                                  <div>Alasan reject: ${results.alasan}</div>
                                  <div>Direject oleh: ${name}</div>
                              </div>
                              <div class="position">
                                  <table class="demo-table">
                                      <thead>
                                          <tr>
                                              <th>No</th>
                                              <th>No Disposal</th>
                                              <th>Asset</th>
                                              <th>Asset description</th>
                                              <th>Cost Ctr</th>
                                              <th>Cost Ctr Name</th>
                                          </tr>
                                      </thead>
                                      <tbody>
                                        ${findDis.length > 0 && findDis.map(item => {
                                          return (
                                            `<tr>
                                              <td>${findDis.indexOf(item) + 1}</td>
                                              <td>D${item.no_disposal}</td>
                                              <td>${item.no_asset}</td>
                                              <td>${item.nama_asset}</td>
                                              <td>${item.cost_center}</td>
                                              <td>${item.area}</td>
                                            </tr>`
                                          )
                                        })}
                                      </tbody>
                                  </table>
                              </div>
                              <div class="tittle foot">
                                  Terima kasih,
                              </div>
                              <div class="tittle foot1">
                                  Regards,
                              </div>
                              <div class="tittle">
                                  Team Asset
                              </div>
                          </body>
                              `
                          }
                          mailer.sendMail(mailOptions, (error, result) => {
                            if (error) {
                              return response(res, 'berhasil reject dokumen, tidak berhasil kirim notif email 1', { error: error, send: draftEmail, draf })
                            } else if (result) {
                              return response(res, 'success reject disposal')
                            }
                          })
                        } else {
                          return response(res, 'failed reject disposal', {}, 404, false)
                        }
                      } else {
                        return response(res, 'failed reject disposal', {}, 404, false)
                      }
                    }
                  } else {
                    return response(res, 'failed reject disposal', {}, 404, false)
                  }
                } else {
                  return response(res, `${find[arr - 1].jabatan} belum approve atau telah mereject`, {}, 404, false)
                }
              }
            } else {
              return response(res, 'failed reject disposal', {}, 404, false)
            }
          } else {
            return response(res, 'failed reject disposal', {}, 404, false)
          }
        } else {
          return response(res, 'failed reject disposal', {}, 404, false)
        }
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  submitSetDisposal: async (req, res) => {
    try {
      const result = await disposal.findAll({
        where: {
          status_form: 9
        }
      })
      const findNo = await disposal.findAll()
      if (result) {
        const cekNo = []
        for (let i = 0; i < findNo.length; i++) {
          cekNo.push(parseInt(findNo[i].status_app === null ? 0 : findNo[i].status_app))
        }
        const noDis = Math.max(...cekNo) + 1
        const send = {
          status_form: 3,
          status_app: noDis === undefined ? 1 : noDis
        }
        const temp = []
        for (let i = 0; i < result.length; i++) {
          const find = await disposal.findOne({
            where: {
              no_asset: result[i].no_asset
            }
          })
          if (find) {
            await find.update(send)
            temp.push(1)
          }
        }
        if (temp.length === result.length) {
          return response(res, 'success submit', { cekNo })
        } else {
          return response(res, 'failed submit', {}, 404, false)
        }
      } else {
        return response(res, 'failed submit', {}, 404, false)
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  getSetDisposal: async (req, res) => {
    try {
      const level = req.user.level
      let { limit, page, search, sort, status, tipe } = req.query
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
        sortValue = sort || 'no_disposal'
      }
      if (!status) {
        status = 1
      } else {
        status = parseInt(status)
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
      if (level !== 5) {
        const result = await disposal.findAndCountAll({
          where: {
            [Op.or]: [
              { kode_plant: { [Op.like]: `%${searchValue}%` } },
              { no_io: { [Op.like]: `%${searchValue}%` } },
              { no_disposal: { [Op.like]: `%${searchValue}%` } },
              { nama_asset: { [Op.like]: `%${searchValue}%` } },
              { kategori: { [Op.like]: `%${searchValue}%` } },
              { keterangan: { [Op.like]: `%${searchValue}%` } }
            ],
            [Op.and]: [
              { status_app: status },
              { status_form: 3 }
            ]
          },
          include: [
            {
              model: asset,
              as: 'dataAsset'
            }
          ],
          order: [[sortValue, 'ASC']],
          limit: limit,
          offset: (page - 1) * limit
        })
        const pageInfo = pagination('/asset/get', req.query, page, limit, result.count)
        if (result) {
          const data = []
          if (tipe === 'persetujuan') {
            result.rows.map(x => {
              return (
                data.push(x.status_app)
              )
            })
            const set = new Set(data)
            const noDis = [...set]
            return response(res, 'success get disposal', { result, pageInfo, noDis })
          } else {
            result.rows.map(x => {
              return (
                data.push(x.no_disposal)
              )
            })
            const set = new Set(data)
            const noDis = [...set]
            return response(res, 'success get disposal', { result, pageInfo, noDis })
          }
        } else {
          return response(res, 'failed get disposal', {}, 400, false)
        }
      } else if (level === 5) {
        return response(res, 'failed get disposal', {}, 400, false)
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  submitEksDisposal: async (req, res) => {
    try {
      const no = req.params.no
      const level = req.user.level
      const result = await disposal.findOne({
        where: {
          no_asset: no
        }
      })
      if (result) {
        if (result.nilai_jual === '0') {
          const findDoc = await docUser.findAll({
            where: {
              no_pengadaan: result.no_asset,
              [Op.and]: [
                { jenis_form: 'disposal' },
                { tipe: 'dispose' }
              ]
            }
          })
          if (findDoc.length > 0) {
            if (level === 2) {
              const cek = []
              for (let i = 0; i < findDoc.length; i++) {
                if (findDoc[i].divisi === '3' || findDoc[i].status === 3) {
                  cek.push(1)
                }
              }
              if (cek.length === findDoc.length) {
                const data = {
                  status_form: level === 5 ? 5 : 8
                }
                const results = await result.update(data)
                if (results) {
                  const findAsset = await asset.findOne({
                    where: {
                      no_asset: no
                    }
                  })
                  if (findAsset) {
                    const send = {
                      status: '0'
                    }
                    const upAsset = await findAsset.update(send)
                    if (upAsset) {
                      return response(res, 'success submit eksekusi disposal')
                    } else {
                      return response(res, 'failed submit disposal', {}, 400, false)
                    }
                  } else {
                    return response(res, 'failed submit disposal', {}, 400, false)
                  }
                } else {
                  return response(res, 'failed submit disposal', {}, 400, false)
                }
              } else {
                return response(res, 'Approve dokumen terlebih dahulu sebelum submit', {}, 400, false)
              }
            } else {
              const cek = []
              for (let i = 0; i < findDoc.length; i++) {
                if (findDoc[i].path !== null) {
                  cek.push(1)
                }
              }
              if (cek.length === findDoc.length) {
                const data = {
                  status_form: level === 5 ? 5 : 8
                }
                const results = await result.update(data)
                if (results) {
                  return response(res, 'success submit eksekusi disposal')
                } else {
                  return response(res, 'failed submit disposal', {}, 400, false)
                }
              } else {
                return response(res, 'Upload dokumen terlebih dahulu sebelum submit', {}, 400, false)
              }
            }
          } else {
            return response(res, 'Upload dokumen terlebih dahulu sebelum submit', {}, 400, false)
          }
        } else {
          if (result.npwp === 'ada') {
            const findTemp = await document.findAll({
              where: {
                [Op.and]: [
                  { tipe_dokumen: 'disposal' }
                ],
                [Op.or]: [
                  { tipe: 'sell' },
                  { tipe: 'npwp' }
                ]
              }
            })
            if (findTemp.length > 0) {
              const findDoc = await docUser.findAll({
                where: {
                  [Op.and]: [
                    { no_pengadaan: result.no_asset },
                    { jenis_form: 'disposal' }
                  ],
                  [Op.or]: [
                    { tipe: 'sell' },
                    { tipe: 'npwp' }
                  ]
                }
              })
              if (findDoc.length > 0) {
                if (findTemp.length === findDoc.length) {
                  if (level === 2) {
                    const cek = []
                    for (let i = 0; i < findDoc.length; i++) {
                      if (findDoc[i].divisi === '3' || findDoc[i].status === 3) {
                        cek.push(1)
                      }
                    }
                    if (cek.length === findDoc.length) {
                      const data = {
                        status_form: level === 5 ? 5 : 6
                      }
                      const results = await result.update(data)
                      if (results) {
                        return response(res, 'success submit eksekusi disposal')
                      } else {
                        return response(res, 'failed submit disposal', {}, 400, false)
                      }
                    } else {
                      return response(res, 'Approve dokumen terlebih dahulu sebelum submit', {}, 400, false)
                    }
                  } else {
                    const cek = []
                    for (let i = 0; i < findDoc.length; i++) {
                      if (findDoc[i].path !== null) {
                        cek.push(1)
                      }
                    }
                    if (cek.length === findDoc.length) {
                      const data = {
                        status_form: level === 5 ? 5 : 6
                      }
                      const results = await result.update(data)
                      if (results) {
                        return response(res, 'success submit eksekusi disposal')
                      } else {
                        return response(res, 'failed submit disposal', {}, 400, false)
                      }
                    } else {
                      return response(res, 'Upload dokumen terlebih dahulu sebelum submit', {}, 400, false)
                    }
                  }
                } else {
                  return response(res, 'Upload dokumen terlebih dahulu sebelum submit', {}, 400, false)
                }
              } else {
                return response(res, 'Upload dokumen terlebih dahulu sebelum submit', {}, 400, false)
              }
            } else {
              return response(res, 'failed submit disposal', {}, 400, false)
            }
          } else {
            const findDoc = await docUser.findAll({
              where: {
                no_pengadaan: result.no_asset,
                [Op.and]: [
                  { jenis_form: 'disposal' },
                  { tipe: 'sell' }
                ]
              }
            })
            if (findDoc.length > 0) {
              if (level === 2) {
                const cek = []
                for (let i = 0; i < findDoc.length; i++) {
                  if (findDoc[i].status === 3 || findDoc[i].divisi === '3') {
                    cek.push(1)
                  }
                }
                if (cek.length === findDoc.length) {
                  const data = {
                    status_form: level === 5 ? 5 : 6
                  }
                  const results = await result.update(data)
                  if (results) {
                    return response(res, 'success submit eksekusi disposal')
                  } else {
                    return response(res, 'failed submit disposal', {}, 400, false)
                  }
                } else {
                  return response(res, 'Approve dokumen terlebih dahulu sebelum submit', {}, 400, false)
                }
              } else {
                const cek = []
                for (let i = 0; i < findDoc.length; i++) {
                  if (findDoc[i].path !== null) {
                    cek.push(1)
                  }
                }
                if (cek.length === findDoc.length) {
                  const data = {
                    status_form: level === 5 ? 5 : 6
                  }
                  const results = await result.update(data)
                  if (results) {
                    return response(res, 'success submit eksekusi disposal')
                  } else {
                    return response(res, 'failed submit disposal', {}, 400, false)
                  }
                } else {
                  return response(res, 'Upload dokumen terlebih dahulu sebelum submit', {}, 400, false)
                }
              }
            } else {
              return response(res, 'Upload dokumen terlebih dahulu sebelum submit', {}, 400, false)
            }
          }
        }
      } else {
        return response(res, 'failed submit disposal', {}, 400, false)
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  submitTaxFin: async (req, res) => {
    try {
      const level = req.user.level
      const no = req.params.no
      const result = await disposal.findOne({
        where: {
          no_asset: no
        }
      })
      if (result) {
        if (result.no_io === '3' || result.no_io === '4') {
          const data = {
            status_form: 7,
            no_io: null
          }
          const results = await result.update(data)
          if (results) {
            return response(res, 'success submit eksekusi disposal')
          } else {
            return response(res, 'failed submit disposal', {}, 400, false)
          }
        } else {
          const data = {
            status_form: 6,
            no_io: level
          }
          const results = await result.update(data)
          if (results) {
            return response(res, 'success submit eksekusi disposal')
          } else {
            return response(res, 'failed submit disposal', {}, 400, false)
          }
        }
      } else {
        return response(res, 'failed submit disposal', {}, 400, false)
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  submitFinal: async (req, res) => {
    try {
      const no = req.params.no
      const result = await disposal.findOne({
        where: {
          no_asset: no
        }
      })
      if (result) {
        const findDoc = await docUser.findAll({
          where: {
            [Op.and]: [
              { jenis_form: 'disposal' },
              { no_pengadaan: no }
            ],
            [Op.or]: [
              { tipe: 'finance' },
              { tipe: 'tax' }
            ]
          }
        })
        if (findDoc.length > 0) {
          const cek = []
          for (let i = 0; i < findDoc.length; i++) {
            if (findDoc[i].divisi === '3' || findDoc[i].status === 3) {
              cek.push(1)
            }
          }
          if (cek.length === findDoc.length) {
            const data = {
              status_form: 8
            }
            const results = await result.update(data)
            if (results) {
              return response(res, 'success submit final disposal')
            } else {
              return response(res, 'failed submit disposal', {}, 400, false)
            }
          } else {
            return response(res, 'approve dokumen terlebih dahulu', {}, 400, false)
          }
        } else {
          return response(res, 'Tidak ada dokumen finance dan tax', {}, 400, false)
        }
      } else {
        return response(res, 'failed submit disposal', {}, 400, false)
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  submitPurch: async (req, res) => {
    try {
      const no = req.params.no
      const result = await disposal.findOne({
        where: {
          no_asset: no
        }
      })
      if (result) {
        const findDoc = await docUser.findAll({
          where: {
            no_pengadaan: result.no_asset,
            [Op.and]: [
              { jenis_form: 'disposal' },
              { tipe: 'purch' }
            ]
          }
        })
        if (findDoc.length > 0) {
          const cek = []
          for (let i = 0; i < findDoc.length; i++) {
            if (findDoc[i].path !== null) {
              cek.push(1)
            }
          }
          if (cek.length === findDoc.length) {
            const data = {
              status_form: 2
            }
            const results = await result.update(data)
            if (results) {
              return response(res, 'success submit eksekusi disposal')
            } else {
              return response(res, 'failed submit disposal', {}, 400, false)
            }
          } else {
            return response(res, 'Upload dokumen terlebih dahulu sebelum submit', {}, 400, false)
          }
        } else {
          return response(res, 'Upload dokumen terlebih dahulu sebelum submit', {}, 400, false)
        }
      } else {
        return response(res, 'failed submit disposal', {}, 400, false)
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  updateStatus: async (req, res) => {
    try {
      const result = await disposal.findAll({
        where: {
          status_form: 8
        }
      })
      if (result.length > 0) {
        const cek = []
        const data = {
          status: '0'
        }
        for (let i = 0; i < result.length; i++) {
          const findDep = await asset.findOne({
            where: {
              no_asset: result[i].no_asset
            }
          })
          if (findDep) {
            await findDep.update(data)
            cek.push(1)
          }
        }
        if (cek.length > 0) {
          return response(res, 'berhasil update', {})
        } else {
          return response(res, 'semua sudah sesuai', {})
        }
      } else {
        return response(res, 'failed update status asset', {}, 404, false)
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  }
}
