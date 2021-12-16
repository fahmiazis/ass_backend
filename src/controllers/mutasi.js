const response = require('../helpers/response')
const { mutasi, asset, depo, ttd, approve, role, user, docUser, document, path } = require('../models')
const { Op } = require('sequelize')
const { pagination } = require('../helpers/pagination')
const joi = require('joi')
const mailer = require('../helpers/mailer')
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
                      const findDoc = await mutasi.findOne({
                        where: {
                          no_mutasi: no
                        }
                      })
                      const data = {
                        nama: findDoc.kode_plant,
                        status: 1,
                        path: null
                      }
                      if (findDoc) {
                        const findAos = await ttd.findByPk(find[0].id)
                        const findRole = await role.findAll({
                          where: {
                            name: find[arr + 1].jabatan
                          }
                        })
                        if (findRole.length > 0) {
                          await findAos.update(data)
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
                              subject: 'Approve',
                              html: `<body>
                                        <div style="margin-top: 20px; margin-bottom: 35px;">Dear Bapak/Ibu</div>
                                        <div style="margin-bottom: 5px;">Mohon untuk approve pengajuan mutasi asset area.</div>
                                        <div style="margin-bottom: 20px;"></div>
                                        <div style="margin-bottom: 30px;">Best Regard,</div>
                                        <div>Team Asset</div>
                                    </body>`
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
                                return response(res, 'success approve mutasi')
                              }
                            })
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
            no_pengadaan: no,
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
                no_pengadaan: no,
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
