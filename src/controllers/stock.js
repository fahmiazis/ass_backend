const { stock, asset, clossing, ttd, approve, role, user, path, status_stock } = require('../models')
const response = require('../helpers/response')
const { Op } = require('sequelize')
const moment = require('moment')
const joi = require('joi')
const { pagination } = require('../helpers/pagination')
const mailer = require('../helpers/mailer')
const multer = require('multer')
const uploadHelper = require('../helpers/upload')

module.exports = {
  submit: async (req, res) => {
    try {
      const kode = req.user.kode
      const findClose = await clossing.findAll({
        where: {
          jenis: 'stock'
        }
      })
      if (findClose.length > 0) {
        const time = moment().format('L').split('/')
        const start = findClose[0].start
        const end = findClose[0].end
        if (parseInt(time[1]) > end && parseInt(time[1]) < start) {
          return response(res, 'Belum saatnya atau waktu telah terlewat untuk stock opname', {}, 404, false)
        } else {
          const result = await asset.findAll({
            where: {
              kode_plant: kode,
              [Op.and]: [
                { [Op.not]: { merk: null } },
                { [Op.not]: { satuan: null } },
                { [Op.not]: { unit: null } },
                { [Op.not]: { lokasi: null } },
                { [Op.not]: { grouping: null } },
                { [Op.not]: { status_fisik: null } }
              ]
            }
          })
          if (result.length > 0) {
            const findAsset = await asset.findAll({
              where: {
                kode_plant: kode
              }
            })
            if (result.length === findAsset.length) {
              const findNo = await stock.findAll({
                where: {
                  [Op.not]: { no_stock: null }
                }
              })
              if (findNo.length > 0) {
                const cekNo = []
                for (let i = 0; i < findNo.length; i++) {
                  const no = findNo[i].no_stock.split('O')
                  cekNo.push(parseInt(no[1]))
                }
                const noDis = Math.max(...cekNo) + 1
                const hasil = []
                for (let i = 0; i < result.length; i++) {
                  const data = {
                    kode_plant: kode,
                    area: result[i].area,
                    deskripsi: result[i].nama_asset,
                    no_asset: result[i].no_asset,
                    merk: result[i].merk,
                    satuan: result[i].satuan,
                    unit: result[i].unit,
                    kondisi: result[i].kondisi,
                    lokasi: result[i].lokasi,
                    grouping: result[i].grouping,
                    keterangan: result[i].keterangan,
                    tanggalStock: moment().format('L'),
                    status_form: 1,
                    no_stock: 'O' + noDis
                  }
                  const send = await stock.create(data)
                  if (send) {
                    hasil.push('1')
                  }
                }
                if (hasil.length === result.length) {
                  return response(res, 'success submit stock opname')
                } else {
                  return response(res, 'failed submit stock opname', {}, 400, false)
                }
              } else {
                const cekNo = [0]
                const noDis = Math.max(...cekNo) + 1
                const hasil = []
                for (let i = 0; i < result.length; i++) {
                  const data = {
                    kode_plant: kode,
                    area: result[i].area,
                    deskripsi: result[i].nama_asset,
                    no_asset: result[i].no_asset,
                    merk: result[i].merk,
                    satuan: result[i].satuan,
                    unit: result[i].unit,
                    kondisi: result[i].kondisi,
                    lokasi: result[i].lokasi,
                    grouping: result[i].grouping,
                    keterangan: result[i].keterangan,
                    tanggalStock: moment().format('L'),
                    status_form: 1,
                    no_stock: 'O' + noDis
                  }
                  const send = await stock.create(data)
                  if (send) {
                    hasil.push('1')
                  }
                }
                if (hasil.length === result.length) {
                  return response(res, 'success submit stock opname')
                } else {
                  return response(res, 'failed submit stock opname', {}, 400, false)
                }
              }
            } else {
              return response(res, 'Lengkapi data asset terlebih dahulu', {}, 400, false)
            }
          } else {
            return response(res, 'Lengkapi data asset terlebih dahulu', {}, 400, false)
          }
        }
      } else {
        return response(res, 'tolong buat clossing untuk stock opname terlebih dahulu', {}, 400, false)
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  getStock: async (req, res) => {
    try {
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
        limit = 12
      } else {
        limit = parseInt(limit)
      }
      if (!page) {
        page = 1
      } else {
        page = parseInt(page)
      }
      const result = await stock.findAndCountAll({
        where: {
          [Op.and]: [
            { kode_plant: kode },
            { status_form: 1 }
          ],
          [Op.or]: [
            { no_asset: { [Op.like]: `%${searchValue}%` } },
            { deskripsi: { [Op.like]: `%${searchValue}%` } },
            { keterangan: { [Op.like]: `%${searchValue}%` } },
            { merk: { [Op.like]: `%${searchValue}%` } },
            { satuan: { [Op.like]: `%${searchValue}%` } },
            { unit: { [Op.like]: `%${searchValue}%` } },
            { kondisi: { [Op.like]: `%${searchValue}%` } },
            { lokasi: { [Op.like]: `%${searchValue}%` } },
            { grouping: { [Op.like]: `%${searchValue}%` } }
          ]
        },
        order: [[sortValue, 'ASC']],
        limit: limit,
        offset: (page - 1) * limit
      })
      const pageInfo = pagination('/stock/get', req.query, page, limit, result.count)
      if (result.rows.length > 0) {
        return response(res, 'list asset', { result, pageInfo })
      } else {
        const result = await asset.findAndCountAll({
          where: {
            kode_plant: kode,
            [Op.or]: [
              { no_doc: { [Op.like]: `%${searchValue}%` } },
              { tanggal: { [Op.like]: `%${searchValue}%` } },
              { no_asset: { [Op.like]: `%${searchValue}%` } },
              { nama_asset: { [Op.like]: `%${searchValue}%` } },
              { keterangan: { [Op.like]: `%${searchValue}%` } }
            ]
          },
          order: [[sortValue, 'ASC']],
          limit: limit,
          offset: (page - 1) * limit
        })
        const pageInfo = pagination('/stock/get', req.query, page, limit, result.count)
        if (result) {
          return response(res, 'list asset', { result, pageInfo })
        } else {
          return response(res, 'failed to get user', {}, 404, false)
        }
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  getStockAll: async (req, res) => {
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
        limit = 12
      } else {
        limit = parseInt(limit)
      }
      if (!page) {
        page = 1
      } else {
        page = parseInt(page)
      }
      const findClose = await clossing.findAll({
        where: {
          jenis: 'stock'
        }
      })
      if (findClose.length > 0) {
        const time = moment().format('L').split('/')
        let start = ''
        let end = ''
        if (parseInt(time[1]) >= 1 && parseInt(time[1]) <= findClose[0].end) {
          const next = moment().subtract(1, 'month').format('L').split('/')
          end = `${time[2]}-${time[0]}-${findClose[0].end}`
          start = `${next[2]}-${next[0]}-${findClose[0].start}`
        } else {
          const next = moment().add(1, 'month').format('L').split('/')
          start = `${time[2]}-${time[0]}-${findClose[0].start}`
          end = `${next[2]}-${next[0]}-${findClose[0].end}`
        }
        const result = await stock.findAndCountAll({
          where: {
            [Op.and]: [
              { status_form: 1 },
              {
                tanggalStock: {
                  [Op.lte]: end,
                  [Op.gte]: start
                }
              }
            ],
            [Op.or]: [
              { no_asset: { [Op.like]: `%${searchValue}%` } },
              { deskripsi: { [Op.like]: `%${searchValue}%` } },
              { keterangan: { [Op.like]: `%${searchValue}%` } },
              { merk: { [Op.like]: `%${searchValue}%` } },
              { satuan: { [Op.like]: `%${searchValue}%` } },
              { unit: { [Op.like]: `%${searchValue}%` } },
              { kondisi: { [Op.like]: `%${searchValue}%` } },
              { lokasi: { [Op.like]: `%${searchValue}%` } },
              { grouping: { [Op.like]: `%${searchValue}%` } }
            ]
          },
          order: [[sortValue, 'ASC']],
          limit: limit,
          offset: (page - 1) * limit,
          group: 'no_stock'
        })
        const pageInfo = pagination('/stock/get', req.query, page, limit, result.count.length)
        if (result) {
          return response(res, 'list stock', { result, pageInfo })
        } else {
          return response(res, 'failed get data stock', {}, 404, false)
        }
      } else {
        return response(res, 'tolong buat clossing untuk stock opname terlebih dahulu', {}, 400, false)
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  getDetailStock: async (req, res) => {
    try {
      const id = req.params.id
      const findId = await stock.findByPk(id)
      if (findId) {
        const result = await stock.findAll({
          where: {
            [Op.and]: [
              { kode_plant: findId.kode_plant },
              { no_stock: findId.no_stock }
            ]
          },
          include: [
            {
              model: path,
              as: 'pict'
            }
          ]
        })
        if (result.length > 0) {
          return response(res, 'success get detail stock', { result })
        } else {
          return response(res, 'failed get detail', {}, 400, false)
        }
      } else {
        return response(res, 'failed get detail', {}, 400, false)
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  getApproveStock: async (req, res) => {
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
        const result = await stock.findAll({
          where: {
            no_stock: no
          }
        })
        if (result) {
          const getApp = await approve.findAll({
            where: {
              nama_approve: nama
            }
          })
          if (getApp) {
            const pembuat = []
            const pemeriksa = []
            const penyetuju = []
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
                if (make.sebagai === 'pembuat') {
                  pembuat.push(make)
                } else if (make.sebagai === 'pemeriksa') {
                  pemeriksa.push(make)
                } else if (make.sebagai === 'penyetuju') {
                  penyetuju.push(make)
                }
                hasil.push(make)
              }
            }
            if (hasil.length === getApp.length) {
              return response(res, 'success get template approve', { result: { pembuat, pemeriksa, penyetuju } })
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
  deleteStock: async (req, res) => {
    try {
      const id = req.params.id
      const result = await stock.findByPk(id)
      if (result) {
        const findStock = await stock.findAll({
          where: {
            no_stock: result.no_stock
          }
        })
        if (findStock.length > 0) {
          const cek = []
          for (let i = 0; i < findStock.length; i++) {
            const result = await stock.findByPk(findStock[i].id)
            if (result) {
              await result.destroy()
              cek.push(1)
            }
          }
          if (cek.length === findStock.length) {
            return response(res, 'success delete stock')
          } else {
            return response(res, 'failed delete stock 1', {}, 404, false)
          }
        } else {
          return response(res, 'failed delete stock 2', {}, 404, false)
        }
      } else {
        return response(res, 'failed delete stock 3', {}, 404, false)
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  approveStock: async (req, res) => {
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
          let arr = 0
          for (let i = 0; i < find.length; i++) {
            if (result[0].name === find[i].jabatan) {
              hasil = find[i].id
              arr = i
            }
          }
          if (hasil !== 0) {
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
                  const findDoc = await stock.findAll({
                    where: {
                      no_stock: no
                    }
                  })
                  if (findDoc) {
                    const data = {
                      status_form: 9
                    }
                    const valid = []
                    for (let i = 0; i < findDoc.length; i++) {
                      const findAsset = await stock.findByPk(findDoc[i].id)
                      if (findAsset) {
                        await findAsset.update(data)
                        valid.push(1)
                      }
                    }
                    if (valid.length === findDoc.length) {
                      return response(res, 'success approve stock opname')
                    }
                  }
                } else {
                  const findDoc = await stock.findOne({
                    where: {
                      no_stock: no
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
                                    <div style="margin-bottom: 5px;">Mohon untuk approve pengajuan disposal asset area.</div>
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
                            return response(res, 'success approve disposal')
                          }
                        })
                      } else {
                        return response(res, 'berhasil approve dokumen, tidak berhasil kirim notif email 2')
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
            return response(res, 'failed approve disposal', {}, 404, false)
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
  rejectStock: async (req, res) => {
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
                  return response(res, 'success reject stock opname')
                } else {
                  return response(res, 'failed reject stock opname', {}, 404, false)
                }
              } else {
                return response(res, 'failed reject stock opname', {}, 404, false)
              }
            } else {
              return response(res, 'failed reject stock opname', {}, 404, false)
            }
          } else {
            return response(res, 'failed reject stock opname', {}, 404, false)
          }
        } else {
          return response(res, 'failed reject stock opname', {}, 404, false)
        }
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  uploadPicture: async (req, res) => {
    const no = req.params.no
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
        const findAsset = await asset.findOne({
          where: {
            no_asset: no
          }
        })
        if (findAsset) {
          const send = {
            path: dokumen,
            no_asset: no,
            no_doc: 'opname'
          }
          const result = await path.create(send)
          if (result) {
            return response(res, 'successfully upload', { send })
          } else {
            return response(res, 'failed upload', {}, 404, false)
          }
        } else {
          return response(res, 'failed upload', {}, 404, false)
        }
      } catch (error) {
        return response(res, error.message, {}, 500, false)
      }
    })
  },
  addStatus: async (req, res) => {
    try {
      const schema = joi.object({
        fisik: joi.string().valid('ada', 'tidak ada'),
        kondisi: joi.string().allow(''),
        status: joi.string()
      })
      const { value: results, error } = schema.validate(req.body)
      if (error) {
        return response(res, 'Error', { error: error.message }, 404, false)
      } else {
        const result = await status_stock.findAll({
          where: {
            fisik: results.fisik,
            [Op.and]: [
              { kondisi: results.kondisi },
              { status: results.status }
            ]
          }
        })
        if (result.length > 0) {
          return response(res, 'success create status stock')
        } else {
          const result = await status_stock.create(results)
          if (result) {
            return response(res, 'success create status stock')
          } else {
            return response(res, 'failed create status stock', {}, 404, false)
          }
        }
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  getStatus: async (req, res) => {
    try {
      let { fisik, kondisi } = req.query
      if (!fisik) {
        fisik = ''
      }
      if (!kondisi) {
        kondisi = ''
      }
      const result = await status_stock.findAll({
        where: {
          [Op.and]: [
            { fisik: { [Op.like]: `%${fisik}%` } },
            { kondisi: { [Op.like]: `%${kondisi}%` } }
          ]
        }
      })
      if (result) {
        return response(res, 'success get status stock', { result })
      } else {
        return response(res, 'failed get status stock', {}, 404, false)
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  }
}
