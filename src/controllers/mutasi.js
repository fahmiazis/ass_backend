const response = require('../helpers/response')
const { mutasi, asset, depo, ttd, approve, role, user, docUser, document, path } = require('../models')
const { Op } = require('sequelize')
const { pagination } = require('../helpers/pagination')
const joi = require('joi')
const wrapMail = require('../helpers/wrapMail')
const moment = require('moment')

module.exports = {
  addMutasi: async (req, res) => {
    try {
      const no = req.params.no
      const plant = req.params.plant
      const kode = req.user.kode
      const result = await asset.findOne({
        where: {
          no_asset: no
        }
      })
      if (result) {
        const findArea = await mutasi.findAll({
          where: {
            [Op.and]: [
              { kode_plant: kode },
              { status_form: 1 }
            ]
          }
        })
        if (findArea.length > 0) {
          const findPlant = await mutasi.findAll({
            where: {
              [Op.and]: [
                { kode_plant: kode },
                { kode_plant_rec: plant }
              ],
              status_form: 1
            }
          })
          if (findPlant.length > 0) {
            const findAsset = await mutasi.findAll({
              where: {
                [Op.and]: [
                  { no_asset: result.no_asset },
                  { kode_plant: kode }
                ]
              }
            })
            if (findAsset.length > 0) {
              return response(res, 'success add mutasi', { result: findAsset })
            } else if (findAsset.length === 0 && result.kode_plant === kode) {
              const findDepo = await depo.findOne({
                where: {
                  kode_plant: kode
                }
              })
              if (findDepo) {
                const findRec = await depo.findOne({
                  where: {
                    kode_plant: plant
                  }
                })
                if (findRec) {
                  const send = {
                    kode_plant: result.kode_plant,
                    area: findDepo.nama_area,
                    no_doc: result.no_doc,
                    no_asset: result.no_asset,
                    nama_asset: result.nama_asset,
                    cost_center: findDepo.cost_center,
                    status_depo: findDepo.status_area,
                    kode_plant_rec: plant,
                    cost_center_rec: findRec.cost_center,
                    area_rec: findRec.nama_area,
                    status_form: 1,
                    kategori: result.kategori,
                    merk: result.merk
                  }
                  const make = await mutasi.create(send)
                  if (make) {
                    const data = {
                      status: 11,
                      keterangan: 'proses mutasi'
                    }
                    const update = await result.update(data)
                    if (update) {
                      return response(res, 'success add mutasi', { result: make })
                    } else {
                      return response(res, 'failed add mutasi', {}, 400, false)
                    }
                  } else {
                    return response(res, 'failed add mutasi', {}, 400, false)
                  }
                } else {
                  return response(res, 'failed add mutasi', {}, 400, false)
                }
              } else {
                return response(res, 'failed add mutasi', {}, 400, false)
              }
            } else {
              return response(res, 'failed add mutasi', {}, 400, false)
            }
          } else {
            return response(res, 'Hanya bisa menambahkan item dengan area tujuan yang sama. Kosongkan atau submit cart terlebih dahulu !', {}, 400, false)
          }
        } else {
          const findAsset = await mutasi.findAll({
            where: {
              [Op.and]: [
                { no_asset: result.no_asset },
                { kode_plant: kode }
              ]
            }
          })
          if (findAsset.length > 0) {
            return response(res, 'success add mutasi', { result: findAsset })
          } else if (findAsset.length === 0 && result.kode_plant === kode) {
            const findDepo = await depo.findOne({
              where: {
                kode_plant: kode
              }
            })
            if (findDepo) {
              const findRec = await depo.findOne({
                where: {
                  kode_plant: plant
                }
              })
              if (findRec) {
                const send = {
                  kode_plant: result.kode_plant,
                  area: findDepo.nama_area,
                  no_doc: result.no_doc,
                  no_asset: result.no_asset,
                  nama_asset: result.nama_asset,
                  cost_center: findDepo.cost_center,
                  status_depo: findDepo.status_area,
                  kode_plant_rec: plant,
                  cost_center_rec: findRec.cost_center,
                  area_rec: findRec.nama_area,
                  status_form: 1,
                  kategori: result.kategori,
                  merk: result.merk
                }
                const make = await mutasi.create(send)
                if (make) {
                  const data = {
                    status: 11,
                    keterangan: 'proses mutasi'
                  }
                  const update = await result.update(data)
                  if (update) {
                    return response(res, 'success add mutasi', { result: make })
                  } else {
                    return response(res, 'failed add mutasi', {}, 400, false)
                  }
                } else {
                  return response(res, 'failed add mutasi', {}, 400, false)
                }
              } else {
                return response(res, 'failed add mutasi', {}, 400, false)
              }
            } else {
              return response(res, 'failed add mutasi', {}, 400, false)
            }
          } else {
            return response(res, 'failed add mutasi', {}, 400, false)
          }
        }
      } else {
        return response(res, 'failed add mutasi', {}, 400, false)
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  getMutasi: async (req, res) => {
    try {
      const level = req.user.level
      const kode = req.user.kode
      const fullname = req.user.fullname
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
        limit = 1000
      } else {
        limit = 1000
      }
      if (!page) {
        page = 1
      } else {
        page = parseInt(page)
      }
      if (level === 5) {
        const result = await mutasi.findAndCountAll({
          where: {
            [Op.and]: [
              { kode_plant: kode },
              { status_form: 1 }
            ],
            [Op.or]: [
              { kode_plant_rec: { [Op.like]: `%${searchValue}%` } }
            ]
          },
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
              model: asset,
              as: 'dataAsset'
            }
          ],
          order: [
            [sortValue, 'ASC'],
            [{ model: ttd, as: 'appForm' }, 'id', 'DESC']
          ],
          limit: limit,
          offset: (page - 1) * limit
        })
        const pageInfo = pagination('/mutasi/get', req.query, page, limit, result.count)
        if (result) {
          const data = []
          result.rows.map(x => {
            return (
              data.push(x.no_mutasi)
            )
          })
          const set = new Set(data)
          const noMut = [...set]
          return response(res, 'success get mutasi', { result, pageInfo, noMut })
        } else {
          return response(res, 'failed to get mutasi', {}, 404, false)
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
            const result = await mutasi.findAll({
              where: {
                kode_plant: findDepo[i].kode_plant,
                status_form: 2,
                [Op.or]: [
                  { kode_plant: { [Op.like]: `%${searchValue}%` } },
                  { cost_center: { [Op.like]: `%${searchValue}%` } },
                  { area: { [Op.like]: `%${searchValue}%` } },
                  { no_asset: { [Op.like]: `%${searchValue}%` } },
                  { no_mutasi: { [Op.like]: `%${searchValue}%` } }
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
                data.push(x.no_mutasi)
              )
            })
            const set = new Set(data)
            const noMut = [...set]
            const result = { rows: hasil, count: hasil.length }
            const pageInfo = pagination('/mutasi/get', req.query, page, limit, result.count)
            return response(res, 'success get mutasi', { result, pageInfo, noMut })
          } else {
            const result = { rows: hasil, count: 0 }
            const noMut = []
            const pageInfo = pagination('/mutasi/get', req.query, page, limit, result.count)
            return response(res, 'success get mutasi', { result, pageInfo, noMut })
          }
        } else {
          return response(res, 'failed get mutasi', {}, 400, false)
        }
      } else if (level === 13) {
        const result = await mutasi.findAndCountAll({
          where: {
            [Op.or]: [
              { kode_plant: { [Op.like]: `%${searchValue}%` } },
              { cost_center: { [Op.like]: `%${searchValue}%` } },
              { area: { [Op.like]: `%${searchValue}%` } },
              { no_asset: { [Op.like]: `%${searchValue}%` } },
              { no_mutasi: { [Op.like]: `%${searchValue}%` } }
            ],
            status_form: 2
          },
          order: [
            [sortValue, 'ASC'],
            [{ model: ttd, as: 'appForm' }, 'id', 'DESC']
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
            }
          ]
        })
        if (result.rows.length > 0) {
          const data = []
          for (let i = 0; i < result.rows.length; i++) {
            if (result.rows[i].kategori === 'IT') {
              data.push(result.rows[i].no_mutasi)
            }
          }
          const set = new Set(data)
          const noMut = [...set]
          const hasil = []
          for (let i = 0; i < result.rows.length; i++) {
            for (let j = 0; j < noMut.length; j++) {
              if (result.rows[i].no_mutasi === noMut[j]) {
                hasil.push(result.rows[i])
              }
            }
          }
          if (hasil.length) {
            const result = { rows: hasil, count: hasil.length }
            const pageInfo = pagination('/mutasi/get', req.query, page, limit, result.count)
            return response(res, 'success get mutasi', { result, pageInfo, noMut })
          } else {
            const result = { rows: [], count: 0 }
            const noMut = []
            const pageInfo = pagination('/mutasi/get', req.query, page, limit, result.count)
            return response(res, 'success get mutasi', { result, pageInfo, noMut })
          }
        } else {
          const result = { rows: [], count: 0 }
          const noMut = []
          const pageInfo = pagination('/mutasi/get', req.query, page, limit, result.count)
          return response(res, 'success get mutasi', { result, pageInfo, noMut })
        }
      } else {
        const result = await mutasi.findAndCountAll({
          where: {
            [Op.or]: [
              { kode_plant: { [Op.like]: `%${searchValue}%` } },
              { cost_center: { [Op.like]: `%${searchValue}%` } },
              { area: { [Op.like]: `%${searchValue}%` } },
              { no_asset: { [Op.like]: `%${searchValue}%` } },
              { no_mutasi: { [Op.like]: `%${searchValue}%` } }
            ],
            status_form: 2
          },
          include: [
            {
              model: ttd,
              as: 'appForm'
            },
            {
              model: path,
              as: 'pict'
            }
          ],
          order: [
            [sortValue, 'ASC'],
            [{ model: ttd, as: 'appForm' }, 'id', 'DESC']
          ],
          limit: limit,
          offset: (page - 1) * limit
        })
        const pageInfo = pagination('/mutasi/get', req.query, page, limit, result.count)
        if (result) {
          const data = []
          result.rows.map(x => {
            return (
              data.push(x.no_mutasi)
            )
          })
          const set = new Set(data)
          const noMut = [...set]
          return response(res, 'list users', { result, pageInfo, noMut })
        } else {
          return response(res, 'failed to get user', {}, 404, false)
        }
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  getMutasiRec: async (req, res) => {
    try {
      const level = req.user.level
      const kode = req.user.kode
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
      if (level === 5) {
        const result = await mutasi.findAndCountAll({
          where: {
            [Op.and]: [
              { kode_plant_rec: kode },
              { status_form: 2 }
            ],
            [Op.or]: [
              { kode_plant: { [Op.like]: `%${searchValue}%` } }
            ]
          },
          include: [
            {
              model: ttd,
              as: 'appForm'
            },
            {
              model: path,
              as: 'pict'
            }
          ],
          order: [
            [sortValue, 'ASC'],
            [{ model: ttd, as: 'appForm' }, 'id', 'DESC']
          ],
          limit: limit,
          offset: (page - 1) * limit
        })
        const pageInfo = pagination('/mutasi/rec', req.query, page, limit, result.count)
        if (result) {
          const data = []
          result.rows.map(x => {
            return (
              data.push(x.no_mutasi)
            )
          })
          const set = new Set(data)
          const noMut = [...set]
          return response(res, 'success get mutasi', { result, pageInfo, noMut })
        } else {
          return response(res, 'failed to get mutasi', {}, 404, false)
        }
      } else {
        return response(res, 'failed to get mutasi', {}, 404, false)
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  deleteItem: async (req, res) => {
    try {
      const no = req.params.no
      const result = await mutasi.findOne({
        where: {
          no_asset: no
        }
      })
      if (result) {
        await result.destroy()
        const findAsset = await asset.findOne({
          where: {
            no_asset: no
          }
        })
        if (findAsset) {
          const send = {
            status: null,
            keterangan: null
          }
          await findAsset.update(send)
          return response(res, 'successfully delete item mutasi')
        } else {
          return response(res, 'failed delete item mutasi', {}, 404, false)
        }
      } else {
        return response(res, 'failed delete item mutasi', {}, 404, false)
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  submitMutasi: async (req, res) => {
    try {
      const kode = req.user.kode
      const schema = joi.object({
        alasan: joi.string().required()
      })
      const { value: results, error } = schema.validate(req.body)
      if (error) {
        return response(res, 'Error', { error: error.message }, 404, false)
      } else {
        const result = await mutasi.findAll({
          where: {
            [Op.and]: [
              { kode_plant: kode },
              { status_form: 1 }
            ]
          }
        })
        if (result.length > 0) {
          const findNo = await mutasi.findAll({
            where: {
              [Op.not]: { no_mutasi: null }
            }
          })
          if (findNo.length > 0) {
            const cekNo = []
            for (let i = 0; i < findNo.length; i++) {
              const no = findNo[i].no_mutasi.split('M')
              cekNo.push(parseInt(no[1]))
            }
            const noMut = Math.max(...cekNo) + 1
            const temp = []
            for (let i = 0; i < result.length; i++) {
              const find = await mutasi.findOne({
                where: {
                  no_asset: result[i].no_asset
                }
              })
              if (find) {
                const send = {
                  status_form: 2,
                  no_mutasi: noMut === undefined ? 'M' + 1 : 'M' + noMut,
                  alasan: results.alasan,
                  tanggalMut: moment()
                }
                await find.update(send)
                temp.push(1)
              }
            }
            if (temp.length === result.length) {
              return response(res, 'success submit', { nomor_mutasi: 'M' + noMut })
            } else {
              return response(res, 'failed submit', {}, 404, false)
            }
          } else {
            const cekNo = [0]
            const noMut = Math.max(...cekNo) + 1
            const temp = []
            for (let i = 0; i < result.length; i++) {
              const find = await mutasi.findOne({
                where: {
                  no_asset: result[i].no_asset
                }
              })
              if (find) {
                const send = {
                  status_form: 2,
                  no_mutasi: noMut === undefined ? 'M1' : 'M' + noMut,
                  tanggalMut: moment()
                }
                await find.update(send)
                temp.push(1)
              }
            }
            if (temp.length === result.length) {
              return response(res, 'success submit', { nomor_mutasi: 'M1' })
            } else {
              return response(res, 'failed submit', {}, 404, false)
            }
          }
        } else {
          return response(res, 'data mutasi is empty', {}, 404, false)
        }
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  getDetailMutasi: async (req, res) => {
    try {
      const no = req.params.no
      const result = await mutasi.findAll({
        where: {
          no_mutasi: no
        }
      })
      if (result.length > 0) {
        return response(res, 'success get mutasi', { result })
      } else {
        return response(res, 'failed get mutaso', {}, 404, false)
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  getApproveMut: async (req, res) => {
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
        const penerima = []
        for (let i = 0; i < result.length; i++) {
          if (result[i].sebagai === 'pembuat') {
            pembuat.push(result[i])
          } else if (result[i].sebagai === 'pemeriksa') {
            pemeriksa.push(result[i])
          } else if (result[i].sebagai === 'penyetuju') {
            penyetuju.push(result[i])
          } else if (result[i].sebagai === 'penerima') {
            penerima.push(result[i])
          }
        }
        return response(res, 'success get template approve', { result: { pembuat, penerima, pemeriksa, penyetuju } })
      } else {
        const findDis = await mutasi.findAll({
          where: {
            no_mutasi: no
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
          if (getApp && getDepo) {
            const hasil = []
            for (let i = 0; i < getApp.length; i++) {
              const send = {
                jabatan: getApp[i].jabatan,
                jenis: getApp[i].jenis,
                sebagai: getApp[i].sebagai,
                kategori: null,
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
                      const penerima = []
                      for (let i = 0; i < findRes.length; i++) {
                        if (findRes[i].sebagai === 'pembuat') {
                          pembuat.push(findRes[i])
                        } else if (findRes[i].sebagai === 'pemeriksa') {
                          pemeriksa.push(findRes[i])
                        } else if (findRes[i].sebagai === 'penyetuju') {
                          penyetuju.push(findRes[i])
                        } else if (result[i].sebagai === 'penerima') {
                          penerima.push(result[i])
                        }
                      }
                      return response(res, 'success get template approve', { result: { pembuat, penerima, pemeriksa, penyetuju } })
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
  approveMutasi: async (req, res) => {
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
                          { no_doc: no },
                          { status: 1 }
                        ]
                      }
                    })
                    if (results.length === find.length) {
                      const findDoc = await mutasi.findAll({
                        where: {
                          no_mutasi: no
                        }
                      })
                      if (findDoc) {
                        const data = {
                          status_form: 9
                        }
                        const valid = []
                        for (let i = 0; i < findDoc.length; i++) {
                          const findAsset = await mutasi.findByPk(findDoc[i].id)
                          if (findAsset) {
                            await findAsset.update(data)
                            valid.push(1)
                          }
                        }
                        if (valid.length === findDoc.length) {
                          return response(res, 'success approve form mutasi')
                        }
                      }
                    } else {
                      const findDoc = await mutasi.findAll({
                        where: {
                          no_mutasi: no
                        }
                      })
                      if (findDoc.length > 0) {
                        const findRole = await role.findAll({
                          where: {
                            name: find[arr + 1].jabatan
                          }
                        })
                        if (findRole.length > 0) {
                          const findUser = await user.findOne({
                            where: {
                              user_level: findRole[0].nomor
                            }
                          })
                          if (findUser) {
                            let tableTd = ''
                            for (let i = 0; i < findDoc.length; i++) {
                              const element = `
                                <tr>
                                  <td>${findDoc.indexOf(findDoc[i]) + 1}</td>
                                  <td>D${findDoc[i].no_mutasi}</td>
                                  <td>${findDoc[i].no_asset}</td>
                                  <td>${findDoc[i].nama_asset}</td>
                                  <td>${findDoc[i].area}</td>
                                  <td>${findDoc[i].cost_center}</td>
                                  <td>${findDoc[i].area_rec}</td>
                                  <td>${findDoc[i].cost_center_rec}</td>
                                </tr>`
                              tableTd = tableTd + element
                            }
                            const mailOptions = {
                              from: 'noreply_asset@pinusmerahabadi.co.id',
                              replyTo: 'noreply_asset@pinusmerahabadi.co.id',
                              to: `${findUser.email}`,
                              subject: `Approve Pengajuan Mutasi ${no} (TESTING)`,
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
                                      Dear Bapak/Ibu Asset,
                                  </div>
                                  <div class="tittle mar1">
                                      <div>Mohon lanjutkan proses pengajuan mutasi area sbb.</div>
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
                                            ${tableTd}
                                          </tbody>
                                      </table>
                                  </div>
                                  <a href="http://accounting.pinusmerahabadi.co.id:3000/mutasi">Klik link berikut untuk akses web asset</a>
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
                            const sendEmail = await wrapMail.wrapedSendMail(mailOptions)
                            if (sendEmail) {
                              return response(res, 'success approve disposal', { sendEmail })
                            } else {
                              return response(res, 'berhasil approve disposal, tidak berhasil kirim notif email 1')
                            }
                          } else {
                            return response(res, 'berhasil approve dokumen, tidak berhasil kirim notif email 2')
                          }
                        }
                      }
                    }
                  } else {
                    return response(res, 'failed approve mutasi', {}, 404, false)
                  }
                } else {
                  return response(res, 'failed approve mutasi', {}, 404, false)
                }
              } else {
                return response(res, `${find[arr - 1].jabatan} belum approve`, {}, 404, false)
              }
            }
          } else {
            return response(res, 'failed approve mutasi', {}, 404, false)
          }
        } else {
          return response(res, 'failed approve mutasi', {}, 404, false)
        }
      } else {
        return response(res, 'failed approve mutasi', {}, 404, false)
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  rejectMutasi: async (req, res) => {
    try {
      const level = req.user.level
      const name = req.user.name
      const no = req.params.no
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
            for (let i = 0; i < find.length; i++) {
              if (result[0].name === find[i].jabatan) {
                hasil = find[i].id
              }
            }
            if (hasil !== 0) {
              const data = {
                nama: name,
                status: 0,
                path: results.alasan
              }
              const findTtd = await ttd.findByPk(hasil)
              if (findTtd) {
                const sent = await findTtd.update(data)
                if (sent) {
                  return response(res, 'success approve mutasi')
                } else {
                  return response(res, 'failed approve mutasi', {}, 404, false)
                }
              } else {
                return response(res, 'failed approve mutasi', {}, 404, false)
              }
            } else {
              return response(res, 'failed approve mutasi', {}, 404, false)
            }
          } else {
            return response(res, 'failed approve mutasi', {}, 404, false)
          }
        } else {
          return response(res, 'failed approve mutasi', {}, 404, false)
        }
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  getDocumentMut: async (req, res) => {
    try {
      const no = req.params.no
      const nomut = req.params.nomut
      const results = await mutasi.findOne({
        where: {
          [Op.and]: [
            { no_asset: no },
            { no_mutasi: nomut }
          ]
        }
      })
      if (results) {
        const result = await docUser.findAll({
          where: {
            no_pengadaan: nomut,
            [Op.and]: [
              { jenis_form: 'mutasi' },
              {
                [Op.or]: [
                  { tipe: 'rec' }
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
                { tipe_dokumen: 'mutasi' },
                {
                  [Op.or]: [
                    { tipe: 'rec' }
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
                no_pengadaan: nomut,
                jenis_form: 'mutasi',
                tipe: 'rec',
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
  }
}
