const { disposal, asset, depo, path, ttd, approve, role, document, docUser, email, user, notif, reservoir, info_approval } = require('../models')
const joi = require('joi')
const response = require('../helpers/response')
const { Op } = require('sequelize')
const { pagination } = require('../helpers/pagination')
const multer = require('multer')
const uploadHelper = require('../helpers/upload')
const moment = require('moment')
const wrapMail = require('../helpers/wrapMail')
const axios = require('axios')

const { APP_SAP, APP_CLIENT } = process.env
const SAP_PROD_URL = 'http://prdhana.nabatigroup.com:8000'
const SAP_PROD_CLIENT = 300
const emailAss = 'fahmi_aziz@pinusmerahabadi.co.id'
const emailAss2 = 'fahmi_aziz@pinusmerahabadi.co.id'

// Delete "parseInt(APP_CLIENT) === 110" untuk production

module.exports = {
  addDisposal: async (req, res) => {
    try {
      const no = req.params.no
      const kode = req.user.kode
      // const name = req.user.name
      const level = req.user.level
      const findDepo = await depo.findOne({
        where: {
          kode_plant: kode
        }
      })
      const result = await asset.findOne({
        where: {
          no_asset: no
        }
      })
      if (result && findDepo) {
        const cekKategori = result.kategori ? (!!((result.kategori.toLowerCase() === 'it' || result.kategori.toLowerCase() === 'non it'))) : false
        if (!cekKategori) {
          return response(res, 'gagal, pastikan asset memliki kategori', {}, 400, false)
        } else {
          const findAsset = await disposal.findAll({
            where: {
              no_asset: result.no_asset,
              [Op.not]: { status_form: 0 }
            }
          })
          if (findAsset.length > 0) {
            return response(res, 'success add disposal', { result: findAsset })
          } else if (result.cost_center === findDepo.cost_center) {
            const findDepo = await depo.findAll({
              where: {
                kode_plant: level === 9 ? result.cost_center : kode
              }
            })
            if (findDepo.length > 0) {
              const send = {
                kode_plant: findDepo[0].kode_plant,
                area: findDepo[0].nama_area,
                no_doc: result.no_doc,
                no_asset: result.no_asset,
                nama_asset: result.nama_asset,
                cost_center: findDepo[0].cost_center,
                status_depo: findDepo[0].status_area,
                nilai_jual: 0,
                nilai_buku: result.nilai_buku,
                nilai_acquis: result.nilai_acquis,
                accum_dep: result.accum_dep,
                cap_date: result.tanggal,
                status_form: 1,
                kategori: result.kategori,
                merk: result.merk
              }
              const make = await disposal.create(send)
              if (make) {
                const data = {
                  status: '1',
                  keterangan: 'proses disposal'
                }
                const updateData = await result.update(data)
                if (updateData) {
                  return response(res, 'success add disposal', { result: make })
                } else {
                  return response(res, 'failed add disposal 09', {}, 400, false)
                }
              } else {
                return response(res, 'failed add disposal 0', {}, 400, false)
              }
            } else {
              return response(res, 'failed add disposal 1', {}, 400, false)
            }
          } else {
            return response(res, 'failed add disposal 2', { result }, 400, false)
          }
        }
      } else {
        return response(res, 'failed add disposal 3', {}, 400, false)
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  addSell: async (req, res) => {
    try {
      // const name = req.user.name
      const level = req.user.level
      const { no } = req.body
      const kode = req.user.kode
      const findDepo = await depo.findOne({
        where: {
          kode_plant: kode
        }
      })
      const result = await asset.findOne({
        where: {
          no_asset: no
        }
      })
      if (result && findDepo) {
        const cekKategori = result.kategori ? (!!((result.kategori.toLowerCase() === 'it' || result.kategori.toLowerCase() === 'non it'))) : false
        if (!cekKategori) {
          return response(res, 'gagal, pastikan asset memliki kategori', {}, 400, false)
        } else {
          const findAsset = await disposal.findAll({
            where: {
              no_asset: result.no_asset,
              [Op.not]: { status_form: 0 }
            }
          })
          if (findAsset.length > 0) {
            return response(res, 'success add sell', { result: findAsset })
          } else if (result.cost_center === findDepo.cost_center) {
            const findDepo = await depo.findAll({
              where: {
                kode_plant: level === 9 ? result.cost_center : kode
              }
            })
            if (findDepo.length > 0) {
              const send = {
                kode_plant: findDepo[0].kode_plant,
                area: findDepo[0].nama_area,
                no_doc: result.no_doc,
                no_asset: result.no_asset,
                nama_asset: result.nama_asset,
                cost_center: findDepo[0].cost_center,
                status_depo: findDepo[0].status_area,
                nilai_buku: result.nilai_buku,
                nilai_acquis: result.nilai_acquis,
                accum_dep: result.accum_dep,
                cap_date: result.tanggal,
                status_form: 1,
                kategori: result.kategori,
                merk: result.merk
              // npwp: tipeNpwp
              }
              const make = await disposal.create(send)
              if (make) {
                const data = {
                  status: '1',
                  keterangan: 'proses disposal'
                }
                const updateData = await result.update(data)
                if (updateData) {
                  return response(res, 'success add sell', { result: make })
                } else {
                  return response(res, 'failed add sell1', {}, 400, false)
                }
              } else {
                return response(res, 'failed add sell2', {}, 400, false)
              }
            } else {
              return response(res, 'failed add sell3', {}, 400, false)
            }
          } else {
            return response(res, 'failed add sell4', {}, 400, false)
          }
        }
      } else {
        return response(res, 'failed add sell5', {}, 400, false)
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  getCartDisposal: async (req, res) => {
    try {
      const kode = req.user.kode
      // const name = req.user.name
      // const level = req.user.level
      const result = await disposal.findAndCountAll({
        where: {
          [Op.and]: [
            { kode_plant: kode },
            { status_form: 1 }
          ]
        },
        order: [
          ['id', 'ASC']
        ],
        include: [
          {
            model: path,
            as: 'pict'
          }
        ]
      })
      if (result) {
        return response(res, 'success get disposal', { result })
      } else {
        return response(res, 'failed get disposal', {}, 404, false)
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  deleteDisposal: async (req, res) => {
    try {
      const noAsset = req.params.asset
      const result = await disposal.findOne({
        where: {
          [Op.and]: [
            { no_asset: noAsset },
            { status_form: 1 }
          ]
        }
      })
      if (result) {
        const findAsset = await asset.findOne({
          where: {
            no_asset: noAsset
          }
        })
        if (findAsset) {
          const data = {
            status: null,
            keterangan: ''
          }
          const sent = await findAsset.update(data)
          if (sent) {
            const del = await result.destroy()
            if (del) {
              const findDoc = await docUser.findAll({
                where: {
                  [Op.and]: [
                    { no_pengadaan: result.id },
                    { no_asset: result.no_asset },
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
                const cekdok = []
                for (let i = 0; i < findDoc.length; i++) {
                  const findOne = await docUser.findByPk(findDoc[i].id)
                  if (findOne) {
                    await findOne.destroy()
                    cekdok.push(1)
                  }
                }
                if (cekdok.length === findDoc.length) {
                  return response(res, 'success delete disposal')
                } else {
                  return response(res, 'failed delete disposal', {}, 400, false)
                }
              } else {
                return response(res, 'success delete disposal')
              }
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
      const idUser = req.user.id
      const fullname = req.user.fullname
      let { limit, page, search, sort, status, tipe, form } = req.query
      const { time1, time2 } = req.query
      const timeVal1 = time1 === 'undefined' ? 'all' : time1
      const timeVal2 = time2 === 'undefined' ? 'all' : time2
      const timeV1 = moment(timeVal1)
      const timeV2 = timeVal1 !== 'all' && timeVal1 === timeVal2 ? moment(timeVal2).add(1, 'd') : moment(timeVal2).add(1, 'd')
      const statTrans = status === undefined || status === 'undefined' || status === null || status === '' ? 'all' : status
      const statForm = form === undefined || form === 'undefined' || form === null || form === '' ? 'all' : form
      const listDepo = 'all'
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
      const includeAset = []
      if (parseInt(statTrans) === 9) {
        includeAset.push({
          model: asset, as: 'dataAsset'
        })
      }
      const findUser = await user.findOne({
        where: {
          id: idUser
        },
        include: [
          {
            model: role,
            as: 'role'
          }
        ]
      })
      if (level === 5 || level === 9) {
        const result = await disposal.findAll({
          where: {
            [Op.and]: [
              { kode_plant: kode },
              // {
              //   [Op.or]: [
              //     { status_form: status },
              //     { status_form: status === 2 ? 9 : status },
              //     { status_form: status === 2 ? 26 : status },
              //     { status_form: status === 2 ? 3 : status }
              //   ]
              // }
              statTrans === 'all' ? { [Op.not]: { id: null } } : { status_form: statTrans },
              statForm === 'editdis' ? { status_reject: 1 } : { [Op.not]: { id: null } },
              timeVal1 === 'all'
                ? { [Op.not]: { id: null } }
                : {
                  tanggalDis: {
                    [Op.gte]: timeV1,
                    [Op.lt]: timeV2
                  }
                },
              statForm === 'editdis' ? { [Op.not]: { status_form: 0 } } : { [Op.not]: { status_form: 1 } }
            ]
          },
          order: [
            [sortValue, 'DESC'],
            [{ model: ttd, as: 'appForm' }, 'id', 'DESC'],
            [{ model: ttd, as: 'ttdSet' }, 'id', 'DESC']
          ],
          include: [
            {
              model: ttd,
              as: 'ttdSet'
            },
            {
              model: ttd,
              as: 'appForm'
            },
            ...includeAset
            // ,
            // {
            //   model: docUser,
            //   as: 'docAsset'
            // },
            // {
            //   model: path,
            //   as: 'pict'
            // },
          ],
          limit: limit,
          offset: (page - 1) * limit,
          group: ['disposal.no_disposal'],
          distinct: true
        })
        if (result) {
          return response(res, 'success get disposal', { result: { rows: result, count: result.length }, form: form })
        } else {
          return response(res, 'success get disposal', { result: { rows: result, count: result.length }, form: form })
        }
      } else if (findUser.role.type === 'area') {
      // } else if (level === 12 || level === 7 || level === 26 || level === 27) {
        const findDepo = await depo.findAll({
          where: {
            [Op.or]: [
              { nama_bm: level === 12 ? fullname : 'undefined' },
              { nama_om: level === 7 ? fullname : 'undefined' },
              { nama_nom: level === 28 ? fullname : 'undefined' },
              { nama_pic_1: level === 2 ? fullname : 'undefined' },
              { pic_budget: level === 8 ? fullname : 'undefined' },
              { pic_finance: level === 4 ? fullname : 'undefined' },
              { pic_tax: level === 3 ? fullname : 'undefined' },
              { pic_purchasing: level === 6 ? fullname : 'undefined' },
              { nama_pic_2: level === 32 ? fullname : 'undefined' },
              { manager_ho: level === 27 ? fullname : 'undefined' },
              { asman_ho: level === 26 ? fullname : 'undefined' }
            ]
          }
        })
        if (findDepo.length > 0) {
          const dataDepo = []
          for (let i = 0; i < findDepo.length; i++) {
            if (listDepo !== 'all') {
              const depoArr = listDepo.split(',')
              if (depoArr.find(item => item === findDepo[i].kode_plant) !== undefined) {
                const data = { kode_plant: findDepo[i].kode_plant }
                dataDepo.push(data)
              }
            } else {
              const data = { kode_plant: findDepo[i].kode_plant }
              dataDepo.push(data)
            }
          }
          const findDis = await disposal.findAll({
            where: {
              [Op.and]: [
                {
                  [Op.or]: dataDepo
                },
                statTrans === 'all' ? { [Op.not]: { id: null } } : { status_form: statTrans },
                timeVal1 === 'all'
                  ? { [Op.not]: { id: null } }
                  : parseInt(statTrans) === 3
                    ? { date_persetujuan: { [Op.gte]: timeV1, [Op.lt]: timeV2 } }
                    : { tanggalDis: { [Op.gte]: timeV1, [Op.lt]: timeV2 } },
                { [Op.not]: { status_form: 1 } },
                tipe === 'persetujuan' ? { [Op.not]: { no_persetujuan: null } } : { [Op.not]: { status_form: 1 } }
              ],
              [Op.or]: [
                { no_disposal: { [Op.like]: `%${searchValue}%` } },
                { nama_asset: { [Op.like]: `%${searchValue}%` } },
                { kategori: { [Op.like]: `%${searchValue}%` } },
                { keterangan: { [Op.like]: `%${searchValue}%` } }
              ]
            },
            order: [
              [sortValue, 'DESC'],
              [{ model: ttd, as: 'appForm' }, 'id', 'DESC'],
              [{ model: ttd, as: 'ttdSet' }, 'id', 'DESC']
            ],
            include: [
              {
                model: ttd,
                as: 'appForm'
              },
              {
                model: ttd,
                as: 'ttdSet'
              },
              ...includeAset
              // {
              //   model: path,
              //   as: 'pict'
              // },
              // ,
              // {
              //   model: docUser,
              //   as: 'docAsset'
              // }
            ],
            limit: limit,
            offset: (page - 1) * limit,
            group: [`${tipe === 'persetujuan' ? 'disposal.no_persetujuan' : 'disposal.no_disposal'}`],
            distinct: true
          })

          if (findDis.length > 0) {
            const data = []
            for (let i = 0; i < findDis.length; i++) {
              data.push(findDis[i].no_disposal)
            }
            const set = new Set(data)
            const noDis = [...set]
            const result = { rows: findDis, count: findDis.length }
            const pageInfo = pagination('/disposal/get', req.query, page, limit, result.count)
            return response(res, 'success get disposal', { result, pageInfo, noDis, findDepo })
          } else {
            const result = { rows: findDis, count: 0 }
            const noDis = []
            const pageInfo = pagination('/disposal/get', req.query, page, limit, result.count)
            return response(res, 'success get disposal', { result, pageInfo, noDis, findDepo })
          }
        } else {
          return response(res, 'failed get disposal, depo not found', { level }, 400, false)
        }
      } else {
        const result = await disposal.findAll({
          where: {
            [Op.and]: [
              statTrans === 'all' ? { [Op.not]: { id: null } } : { status_form: statTrans },
              timeVal1 === 'all'
                ? { [Op.not]: { id: null } }
                : parseInt(statTrans) === 3
                  ? { date_persetujuan: { [Op.gte]: timeV1, [Op.lt]: timeV2 } }
                  : { tanggalDis: { [Op.gte]: timeV1, [Op.lt]: timeV2 } },
              { [Op.not]: { status_form: 1 } },
              tipe === 'persetujuan' ? { [Op.not]: { no_persetujuan: null } } : { [Op.not]: { status_form: 1 } }
            ],
            [Op.or]: [
              { kode_plant: { [Op.like]: `%${searchValue}%` } },
              { no_disposal: { [Op.like]: `%${searchValue}%` } },
              { nama_asset: { [Op.like]: `%${searchValue}%` } },
              { no_asset: { [Op.like]: `%${searchValue}%` } }
            ]
          },
          order: [
            [sortValue, 'DESC'],
            [{ model: ttd, as: 'appForm' }, 'id', 'DESC'],
            [{ model: ttd, as: 'ttdSet' }, 'id', 'DESC']
          ],
          include: [
            {
              model: ttd,
              as: 'appForm'
            },
            {
              model: ttd,
              as: 'ttdSet'
            },
            ...includeAset
            // {
            //   model: path,
            //   as: 'pict'
            // },
            // { model: asset, as: 'dataAsset' }
            // ,
            // {
            //   model: docUser,
            //   as: 'docAsset'
            // }
          ],
          limit: limit,
          offset: (page - 1) * limit,
          group: [`${tipe === 'persetujuan' ? 'disposal.no_persetujuan' : 'disposal.no_disposal'}`],
          distinct: true
        })
        const pageInfo = pagination('/disposal/get', req.query, page, limit, result.length)
        if (result) {
          const data = []
          if (tipe === 'persetujuan') {
            for (let i = 0; i < result.length; i++) {
              data.push(result[i].no_persetujuan)
            }
            const set = new Set(data)
            const noDis = [...set]
            return response(res, 'success get disposal', { result: { rows: result, count: result.length }, pageInfo, noDis })
          } else {
            for (let i = 0; i < result.length; i++) {
              data.push(result[i].no_disposal)
            }
            const set = new Set(data)
            const noDis = [...set]
            return response(res, 'success get disposal', { result: { rows: result, count: result.length }, pageInfo, noDis })
          }
        } else {
          return response(res, 'failed get disposal', {}, 400, false)
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
            // console.log(err.code === 'LIMIT_UNEXPECTED_FILE' && req.files.length > 0)
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
      // const timeV1 = moment().startOf('month')
      // const timeV2 = moment().endOf('month').add(1, 'd')
      const kode = req.user.kode
      const findNo = await reservoir.findAll({
        where: {
          transaksi: 'disposal',
          tipe: 'area'
          // ,
          // createdAt: {
          //   [Op.gte]: timeV1,
          //   [Op.lt]: timeV2
          // }
        },
        order: [['id', 'DESC']],
        limit: 50
      })
      const cekNo = []
      if (findNo.length > 0) {
        for (let i = 0; i < findNo.length; i++) {
          const no = findNo[i].no_transaksi.split('/')
          cekNo.push(parseInt(no[0]))
        }
      } else {
        cekNo.push(0)
      }
      const noMut = Math.max(...cekNo) + 1
      const findMut = await disposal.findAll({
        where: {
          [Op.and]: [
            { kode_plant: kode },
            { status_form: 1 }
          ]
        }
      })
      if (findMut.length > 0) {
        const temp = []
        const change = noMut.toString().split('')
        const notrans = change.length === 2 ? '00' + noMut : change.length === 1 ? '000' + noMut : change.length === 3 ? '0' + noMut : noMut
        const month = parseInt(moment().format('MM'))
        const year = moment().format('YYYY')
        let rome = ''
        if (month === 1) {
          rome = 'I'
        } else if (month === 2) {
          rome = 'II'
        } else if (month === 3) {
          rome = 'III'
        } else if (month === 4) {
          rome = 'IV'
        } else if (month === 5) {
          rome = 'V'
        } else if (month === 6) {
          rome = 'VI'
        } else if (month === 7) {
          rome = 'VII'
        } else if (month === 8) {
          rome = 'VIII'
        } else if (month === 9) {
          rome = 'IX'
        } else if (month === 10) {
          rome = 'X'
        } else if (month === 11) {
          rome = 'XI'
        } else if (month === 12) {
          rome = 'XII'
        }
          const tempData = findMut.find(({no_disposal}) => no_disposal !== null) // eslint-disable-line
        const cekData = tempData === undefined ? 'ya' : 'no'
        const noTrans = `${notrans}/${kode}/${findMut[0].area}/${rome}/${year}-DPSL`
        const data = {
          no_disposal: noTrans
        }
        for (let i = 0; i < findMut.length; i++) {
          const find = await disposal.findByPk(findMut[i].id)
          if (find) {
            await find.update(data)
            temp.push(1)
          }
        }
        if (temp.length === findMut.length) {
          if (cekData === 'no') {
            const findReser = await reservoir.findOne({
              where: {
                no_transaksi: tempData.no_disposal
              }
            })
            const findNewReser = await reservoir.findOne({
              where: {
                no_transaksi: noTrans
              }
            })
            const upDataReser = {
              status: 'expired'
            }
            const creDataReser = {
              no_transaksi: noTrans,
              kode_plant: kode,
              transaksi: 'disposal',
              tipe: 'area',
              status: 'delayed'
            }
            if (findReser && !findNewReser) {
              await findReser.update(upDataReser)
              await reservoir.create(creDataReser)
              return response(res, 'success submit cart', { no_disposal: noTrans })
            } else {
              return response(res, 'success submit cart', { no_disposal: noTrans })
            }
          } else {
            const findNewReser = await reservoir.findOne({
              where: {
                no_transaksi: noTrans
              }
            })
            if (findNewReser) {
              return response(res, 'success submit cart', { no_disposal: noTrans })
            } else {
              const creDataReser = {
                no_transaksi: noTrans,
                kode_plant: kode,
                transaksi: 'disposal',
                tipe: 'area',
                status: 'delayed'
              }
              await reservoir.create(creDataReser)
              return response(res, 'success submit cart', { no_disposal: noTrans })
            }
          }
        } else {
          return response(res, 'failed submit', {}, 404, false)
        }
      } else {
        return response(res, 'data disposal is empty', {}, 404, false)
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  submitDisposalFinal: async (req, res) => {
    try {
      const fullname = req.user.fullname
      const kode = req.user.kode
      const idUser = req.user.id
      const { no } = req.body
      const result = await disposal.findAll({
        where: {
          [Op.and]: [
            { kode_plant: kode },
            { status_form: 1 }
          ]
        }
      })
      if (result.length > 0) {
        const noTrans = no

        const temp = []
        const cekIt = []
        for (let i = 0; i < result.length; i++) {
          const find = await disposal.findByPk(result[i].id)
          if (find) {
            const cekJual = result.find((item) => item.nilai_jual === '0' || item.nilai_jual === 0)
            const prev = moment().subtract(1, 'month').format('L').split('/')
            const findApi = await axios.get(`${SAP_PROD_URL}/sap/bc/zast/?sap-client=${SAP_PROD_CLIENT}&pgmna=zfir0090&p_anln1=${find.no_asset}&p_bukrs=pp01&p_gjahr=${prev[2]}&p_monat=${prev[0]}`, { timeout: 10000 }).then(response => { return (response) }).catch(err => { return (err.isAxiosError) })
            const dataHistory = `submit pengajuan disposal by ${fullname} at ${moment().format('DD/MM/YYYY h:mm:ss a')}`
            if (findApi.status === 200) {
              const send = {
                status_form: cekJual ? 2 : 26,
                no_disposal: noTrans,
                nilai_buku: findApi.data.length > 0 && findApi.data[0].nafap !== undefined ? findApi.data[0].nafap : find.nilai_buku,
                tanggalDis: moment(),
                history: dataHistory,
                id_applicant: idUser
              }
              await find.update(send)
              temp.push(cekJual ? 'musnah' : 'jual')
              if (find.kategori === 'IT') {
                cekIt.push(1)
              }
            } else {
              const send = {
                status_form: cekJual ? 2 : 26,
                no_disposal: noTrans,
                nilai_buku: find.nilai_buku,
                tanggalDis: moment(),
                history: dataHistory,
                id_applicant: idUser
              }
              await find.update(send)
              temp.push(cekJual ? 'musnah' : 'jual')
              if (find.kategori === 'IT') {
                cekIt.push(1)
              }
            }
          }
        }
        if (temp.length > 0) {
          const findNewReser = await reservoir.findOne({
            where: {
              no_transaksi: no
            }
          })
          if (findNewReser) {
            const upDataReser = {
              status: 'used',
              createdAt: moment()
            }
            await findNewReser.update(upDataReser)
            const listName = ['disposal pengajuan HO', 'disposal pengajuan']
            let pembuat = '1. Dibuat :; '
            let pemeriksa = ']2. Diperiksa :; '
            let penyetuju = ']3. Disetujui :; '
            for (let i = 0; i < listName.length; i++) {
              for (let y = 0; y < 2; y++) {
                const getApproval = await approve.findAll({
                  where: {
                    nama_approve: listName[i],
                    [Op.or]: [
                      { jenis: y === 1 ? 'it' : 'all' },
                      { jenis: 'all' }
                    ]
                  }
                })
                const dataPembuat = getApproval.filter(item => item.sebagai === 'pembuat')
                const dataPemeriksa = getApproval.filter(item => item.sebagai === 'pemeriksa')
                const dataPenyetuju = getApproval.filter(item => item.sebagai === 'penyetuju')
                for (let x = 0; x < dataPembuat.length; x++) {
                  pembuat += `${dataPembuat[x].jabatan}${x === (dataPembuat.length - 1) ? ';' : ', '}`
                }
                for (let x = 0; x < dataPemeriksa.length; x++) {
                  pemeriksa += `${dataPemeriksa[x].jabatan}${x === (dataPemeriksa.length - 1) ? ';' : ', '}`
                }
                for (let x = 0; x < dataPenyetuju.length; x++) {
                  penyetuju += `${dataPenyetuju[x].jabatan}${x === (dataPenyetuju.length - 1) ? ';' : ', '}`
                }
              }
            }

            const findInfoApp = await info_approval.findOne({
              where: {
                no_transaksi: no
              }
            })
            const sendInfo = {
              no_transaksi: no,
              info: `${pembuat}${pemeriksa}${penyetuju}`
            }
            if (findInfoApp) {
              await findInfoApp.update(sendInfo)
              return response(res, 'success submit cart')
            } else {
              await info_approval.create(sendInfo)
              return response(res, 'success submit cart')
            }
          } else {
            return response(res, 'success submit cart')
          }
        } else {
          return response(res, 'failed submit 9', {}, 404, false)
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
      const { nomor } = req.body
      let { tipe } = req.query
      if (!tipe) {
        tipe = 'pengajuan'
      }
      if (tipe === 'persetujuan') {
        const result = await disposal.findAll({
          where: {
            no_persetujuan: nomor
          },
          order: [
            [{ model: ttd, as: 'appForm' }, 'id', 'DESC'],
            [{ model: ttd, as: 'ttdSet' }, 'id', 'DESC']
          ],
          include: [
            {
              model: asset,
              as: 'dataAsset'
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
              model: ttd,
              as: 'appForm'
            },
            {
              model: docUser,
              as: 'docAsset'
            }
          ]
        })
        if (result.length > 0) {
          return response(res, 'succesfully get detail persetujuan disposal', { result })
        } else {
          return response(res, 'failed get detail disposal', {}, 404, false)
        }
      } else {
        const result = await disposal.findAll({
          where: {
            no_disposal: nomor
          },
          order: [
            [{ model: ttd, as: 'appForm' }, 'id', 'DESC'],
            [{ model: ttd, as: 'ttdSet' }, 'id', 'DESC']
          ],
          include: [
            {
              model: asset,
              as: 'dataAsset'
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
              model: ttd,
              as: 'appForm'
            },
            {
              model: docUser,
              as: 'docAsset'
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
  appRevisi: async (req, res) => {
    try {
      const id = req.params.id
      const type = req.params.type
      const findMut = await disposal.findByPk(id)
      if (findMut) {
        const data = {
          isreject: 0
        }
        if (type === 'reason') {
          const findData = await disposal.findAll({
            where: {
              no_disposal: findMut.no_disposal
            }
          })
          if (findData.length > 0) {
            const cekData = []
            for (let i = 0; i < findData.length; i++) {
              const findUpdate = await disposal.findByPk(findData[i].id)
              if (findUpdate) {
                await findUpdate.update(data)
                cekData.push(findUpdate)
              }
            }
            if (cekData.length > 0) {
              return response(res, 'success submit app revisi')
            } else {
              return response(res, 'failed submit', {}, 404, false)
            }
          } else {
            return response(res, 'failed submit', {}, 404, false)
          }
        } else {
          const updateMut = await findMut.update(data)
          if (updateMut) {
            return response(res, 'success submit app revisi')
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
  submitRevisi: async (req, res) => {
    try {
      const { no, tipe } = req.body
      const fullname = req.user.fullname
      const kode = req.user.kode
      if (tipe === 'persetujuan') {
        const findMut = await disposal.findAll({
          where: {
            no_persetujuan: no
          }
        })
        if (findMut.length > 0) {
          const findSign = await ttd.findAll({
            where: {
              no_doc: no
            }
          })
          if (findSign.length > 0) {
            const cekSign = []
            for (let i = 0; i < findSign.length; i++) {
              const data = {
                status: null,
                nama: null
              }
              const findId = await ttd.findByPk(findSign[i].id)
              if (findId) {
                await findId.update(data)
                cekSign.push(findId)
              }
            }
            const validRej = []
            for (let i = 0; i < findMut.length; i++) {
              if (findMut[0].isreject !== null && findMut[0].kode_plant !== kode) {
                validRej.push(findMut[0])
              }
            }
            if (cekSign.length > 0) {
              const cek = []
              for (let i = 0; i < findMut.length; i++) {
                const findData = await disposal.findByPk(findMut[i].id)
                if (findData) {
                  const data = {
                    status_reject: validRej.length === 0 ? 0 : findData.status_reject,
                    isreject: findData.kode_plant === kode ? null : findData.isreject,
                    history: `${findMut[i].history}, submit revisi by ${fullname} at ${moment().format('DD/MM/YYYY h:mm:ss a')}`
                  }
                  await findData.update(data)
                  cek.push(1)
                }
              }
              if (cek.length > 0) {
                return response(res, 'success submit revisi')
              } else {
                return response(res, 'failed submit', {}, 404, false)
              }
            } else {
              return response(res, 'failed submit', {}, 404, false)
            }
          } else {
            return response(res, 'failed submit', {}, 404, false)
          }
        } else {
          return response(res, 'failed submit', {}, 404, false)
        }
      } else {
        const findMut = await disposal.findAll({
          where: {
            no_disposal: no
          }
        })
        if (findMut.length > 0) {
          if (findMut[0].status_form === 2) {
            const findSign = await ttd.findAll({
              where: {
                no_doc: no
              }
            })
            if (findSign.length > 0) {
              const cekSign = []
              for (let i = 0; i < findSign.length; i++) {
                if (findSign[i].sebagai === 'pembuat' || findSign[i].sebagai === 'penerima' || findSign[i].jabatan === 'area' || findSign[i].jabatan === 'aos') {
                  cekSign.push(findSign[i])
                } else {
                  const data = {
                    status: null,
                    nama: null
                  }
                  const findId = await ttd.findByPk(findSign[i].id)
                  if (findId) {
                    await findId.update(data)
                    cekSign.push(findId)
                  }
                }
              }
              if (cekSign.length > 0) {
                const cek = []
                for (let i = 0; i < findMut.length; i++) {
                  const findData = await disposal.findByPk(findMut[i].id)
                  const data = {
                    status_reject: 0,
                    isreject: null,
                    history: `${findMut[i].history}, submit revisi by ${fullname} at ${moment().format('DD/MM/YYYY h:mm:ss a')}`
                  }
                  if (findData) {
                    await findData.update(data)
                    cek.push(1)
                  }
                }
                if (cek.length > 0) {
                  return response(res, 'success submit revisi')
                } else {
                  return response(res, 'failed submit', {}, 404, false)
                }
              } else {
                return response(res, 'failed submit', {}, 404, false)
              }
            } else {
              return response(res, 'failed submit', {}, 404, false)
            }
          } else {
            const cek = []
            for (let i = 0; i < findMut.length; i++) {
              const findData = await disposal.findByPk(findMut[i].id)
              const data = {
                status_reject: 0,
                isreject: null,
                history: `${findMut[i].history}, submit revisi by ${fullname} at ${moment().format('DD/MM/YYYY h:mm:ss a')}`
              }
              if (findData) {
                await findData.update(data)
                cek.push(1)
              }
            }
            if (cek.length > 0) {
              return response(res, 'success submit revisi')
            } else {
              return response(res, 'failed submit', {}, 404, false)
            }
          }
        } else {
          return response(res, 'failed submit', {}, 404, false)
        }
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  getApproveDisposal: async (req, res) => {
    try {
      const { no } = req.body
      const result = await ttd.findAll({
        where: {
          no_doc: no
        }
      })
      const findRole = await role.findAll()
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
        return response(res, 'success get template approve', { result: { pembuat, pemeriksa, penyetuju, result } })
      } else {
        const findDis = await disposal.findAll({
          where: {
            no_disposal: no
          }
        })
        if (findDis.length > 0) {
          const nama = findDis[0].kode_plant.length > 4 ? 'disposal pengajuan HO' : 'disposal pengajuan'
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
                jabatan: getApp[i].jabatan === '' || getApp[i].jabatan === null ? null : getApp[i].jabatan,
                jenis: getApp[i].jenis === '' || getApp[i].jenis === null ? null : getApp[i].jenis,
                sebagai: getApp[i].sebagai === '' || getApp[i].sebagai === null ? null : getApp[i].sebagai,
                kategori: null,
                no_doc: no,
                struktur: getApp[i].struktur,
                id_role: findRole.find(item => item.name === getApp[i].jabatan).nomor
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
                const findUser = await user.findOne({
                  where: {
                    kode_plant: getDepo.kode_plant
                  }
                })
                if (findArea && findUser) {
                  const data = {
                    nama: findUser.fullname,
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
                      return response(res, 'success get template approve', { result: { pembuat, pemeriksa, penyetuju, getApp } })
                    }
                  }
                }
              }
            } else {
              return response(res, 'failed get data', { getApp }, 404, false)
            }
          } else {
            return response(res, 'failed get data', { getApp }, 404, false)
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
      // const name = req.user.name
      const fullname = req.user.fullname
      const { no, indexApp } = req.body
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
          const convIndex = (find.length - 1) - parseInt(indexApp)
          const hasil = find[convIndex].id
          const arr = convIndex
          // let hasil = 0
          // let arr = null
          // for (let i = 0; i < find.length; i++) {
          //   if (result[0].name === find[i].jabatan) {
          //     hasil = find[i].id
          //     arr = i
          //   }
          // }
          if (hasil !== 0) {
            if (arr !== find.length - 1 && (find[arr + 1].status !== null || find[arr + 1].status === 1 || find[arr + 1].status === 0)) {
              return response(res, 'Anda tidak memiliki akses lagi untuk mengapprove', {}, 404, false)
            } else {
              if (arr === 0 || find[arr - 1].status === 1) {
                const data = {
                  nama: fullname,
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
                    if ((results.length === find.length)) {
                      const findTransDis = await disposal.findAll({
                        where: {
                          no_disposal: no
                        }
                      })
                      if (findTransDis.length > 0) {
                        const valid = []
                        for (let i = 0; i < findTransDis.length; i++) {
                          const data = {
                            date_fulldis: moment(),
                            status_form: 9,
                            status_reject: null,
                            isreject: null,
                            history: `${findTransDis[i].history}, approved by ${fullname} at ${moment().format('DD/MM/YYYY h:mm:ss a')}`
                          }
                          const findId = await disposal.findByPk(findTransDis[i].id)
                          if (findId) {
                            await findId.update(data)
                            valid.push(1)
                          }
                        }
                        if (valid.length > 0) {
                          return response(res, 'success approve disposal')
                        } else {
                          return response(res, 'failed approve disposal 6a', {}, 404, false)
                        }
                      }
                    } else {
                      const findTransDis = await disposal.findAll({
                        where: {
                          no_disposal: no
                        }
                      })
                      if (findTransDis) {
                        const cek = []
                        for (let i = 0; i < findTransDis.length; i++) {
                          const upData = {
                            status_reject: null,
                            isreject: null,
                            history: `${findTransDis[i].history}, approved by ${fullname} at ${moment().format('DD/MM/YYYY h:mm:ss a')}`
                          }
                          const findId = await disposal.findByPk(findTransDis[i].id)
                          if (findId) {
                            await findId.update(upData)
                            cek.push(1)
                          }
                        }
                        if (cek.length > 0) {
                          return response(res, 'success approve disposal')
                        } else {
                          return response(res, 'failed approve disposal 7a', {}, 404, false)
                        }
                      } else {
                        return response(res, 'failed approve disposal 7b', {}, 404, false)
                      }
                    }
                  } else {
                    return response(res, 'failed approve disposal 8a', {}, 404, false)
                  }
                } else {
                  return response(res, 'failed approve disposal 9a', {}, 404, false)
                }
              } else {
                return response(res, `${find[arr - 1].jabatan} belum approve atau telah mereject`, {}, 404, false)
              }
            }
          } else {
            return response(res, 'failed approve disposal 10a', {}, 404, false)
          }
        } else {
          return response(res, 'failed approve disposal 11a', {}, 404, false)
        }
      } else {
        return response(res, 'failed approve disposal 12a', {}, 404, false)
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  rejectDisposal: async (req, res) => {
    try {
      const level = req.user.level
      // const name = req.user.name
      const fullname = req.user.fullname
      // const { no } = req.body
      const schema = joi.object({
        alasan: joi.string().required(),
        no: joi.string().required(),
        menu: joi.string().required(),
        list: joi.array(),
        type: joi.string(),
        type_reject: joi.string(),
        user_rev: joi.string(),
        indexApp: joi.string(),
        form: joi.string()
      })
      const { value: results, error } = schema.validate(req.body)
      if (error) {
        return response(res, 'Error', { error: error.message }, 404, false)
      } else {
        const no = results.no
        const listId = results.list
        const histRev = `reject perbaikan by ${fullname} at ${moment().format('DD/MM/YYYY h:mm:ss a')}; reason: ${results.alasan.replace(/\,/g, ' ')}` //eslint-disable-line
        const histBatal = `reject pembatalan by ${fullname} at ${moment().format('DD/MM/YYYY h:mm:ss a')}; reason: ${results.alasan.replace(/\,/g, ' ')}` //eslint-disable-line
        const result = await role.findAll({
          where: {
            nomor: level
          }
        })
        if (result.length > 0) {
          const findDis = await disposal.findAll({
            where: {
              [Op.and]: [
                results.form === 'persetujuan' ? { no_persetujuan: no } : { no_disposal: no }
              ]
            }
          })
          if (findDis.length > 0) {
            const userRev = results.user_rev === '' || results.user_rev === null || results.user_rev === 'null' || results.user_rev === 'undefined' || results.user_rev === undefined ? findDis[0].kode_plant : results.user_rev
            if (results.type === 'verif') {
              const temp = []
              for (let i = 0; i < findDis.length; i++) {
                const send = {
                  status_form: results.type_reject === 'pembatalan' ? 0 : findDis[i].status_form,
                  status_reject: 1,
                  isreject: listId.find(e => e === findDis[i].id) ? 1 : null,
                  reason: results.alasan,
                  menu_rev: results.type_reject === 'pembatalan' ? null : results.menu,
                  user_reject: level,
                  history: `${findDis[i].history}, ${results.type_reject === 'pembatalan' ? histBatal : histRev}`,
                  user_rev: userRev
                }
                const findData = await disposal.findByPk(findDis[i].id)
                if (findData) {
                  await findData.update(send)
                  temp.push(findData)
                }
              }
              if (temp.length) {
                return response(res, 'success reject io', { results })
              } else {
                return response(res, 'success reject io', { results })
              }
            } else {
              const find = await ttd.findAll({
                where: {
                  no_doc: no
                }
              })
              if (find.length > 0) {
                const convIndex = (find.length - 1) - parseInt(results.indexApp)
                const hasil = find[convIndex].id
                const arr = convIndex
                // let position = ''
                // for (let i = 0; i < find.length; i++) {
                //   if (result[0].name === find[i].jabatan) {
                //     hasil = find[i].id
                //     arr = i
                //   // position = find[i].jabatan
                //   }
                // }
                if (hasil !== 0) {
                  if (arr !== find.length - 1 && (find[arr + 1].status !== null || find[arr + 1].status === 1 || find[arr + 1].status === 0)) {
                    return response(res, 'Anda tidak memiliki akses lagi untuk mereject', {}, 404, false)
                  } else {
                    if (arr === 0 || find[arr - 1].status === 1) {
                      const data = {
                        nama: fullname,
                        status: 0,
                        path: results.alasan
                      }
                      const findTtd = await ttd.findByPk(hasil)
                      if (findTtd) {
                        const sent = await findTtd.update(data)
                        if (sent) {
                          const findTtd = await ttd.findAll({
                            where: {
                              [Op.and]: [
                                { no_doc: no },
                                { status: 1 }
                              ]
                            }
                          })
                          if (findTtd) {
                            const findRole = await role.findOne({
                              where: {
                                name: find[results.form === 'persetujuan' ? 0 : 1].jabatan
                              }
                            })
                            if (findRole) {
                              const cek = []
                              for (let i = 0; i < findDis.length; i++) {
                                const findMut = await disposal.findByPk(findDis[i].id)
                                const data = {
                                  status_form: results.type_reject === 'pembatalan' ? 0 : findDis[i].status_form,
                                  status_reject: 1,
                                  isreject: listId.find(e => e === findDis[i].id) ? 1 : null,
                                  reason: results.alasan,
                                  menu_rev: results.type_reject === 'pembatalan' ? null : results.menu,
                                  user_reject: findRole.nomor,
                                  history: `${findDis[i].history}, ${results.type_reject === 'pembatalan' ? histBatal : histRev}`,
                                  user_rev: userRev
                                }
                                if (findMut) {
                                  const updateMut = await findMut.update(data)
                                  if (updateMut) {
                                    cek.push(1)
                                  }
                                }
                              }
                              if (cek.length > 0) {
                                return response(res, 'success reject disposal', { results })
                              } else {
                                return response(res, 'success reject disposal', { results })
                              }
                            } else {
                              return response(res, 'success reject disposal', { results })
                            }
                          }
                        } else {
                          return response(res, 'failed reject disposal', {}, 404, false)
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
            }
          }
        } else {
          return response(res, 'failed reject disposal', {}, 404, false)
        }
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  updateDisposal: async (req, res) => {
    try {
      const id = req.params.id
      // const tipe = req.params.tipe
      const schema = joi.object({
        merk: joi.string().allow(''),
        keterangan: joi.string().allow(''),
        nilai_jual: joi.string().allow(''),
        nominal: joi.string().allow(''),
        no_fp: joi.string().allow(''),
        no_sap: joi.string().allow(''),
        doc_sap: joi.string().allow(''),
        npwp: joi.string().allow(''),
        doc_clearing: joi.string().allow(''),
        date_ba: joi.string().allow(''),
        date_faktur: joi.string().allow('')
      })
      const { value: results, error } = schema.validate(req.body)
      if (error) {
        return response(res, 'Error', { error: error.message }, 404, false)
      } else {
        const result = await disposal.findByPk(id)
        if (result) {
          const update = await result.update(results)
          if (update) {
            return response(res, 'success update disposal')
          } else {
            return response(res, 'failed update disposal', {}, 400, false)
          }
          // if (tipe === 'sell' || tipe === 'disposal') {
          //   const findDoc = await docUser.findAll({
          //     where: {
          //       [Op.and]: [
          //         { no_pengadaan: result.id },
          //         { no_asset: result.no_asset },
          //         { jenis_form: 'disposal' },
          //         {
          //           [Op.or]: [
          //             { tipe: 'pengajuan' },
          //             { tipe: 'jual' },
          //             { tipe: 'purch' },
          //             { tipe: 'npwp' }
          //           ]
          //         }
          //       ]
          //     }
          //   })
          //   if (findDoc.length > 0) {
          //     const cek = []
          //     for (let i = 0; i < findDoc.length; i++) {
          //       if (findDoc[i].path !== null) {
          //         cek.push(1)
          //       }
          //     }
          //     // if (cek.length === findDoc.length) {
          //     if (cek.length > 0) {
          //       const update = await result.update(results)
          //       if (update) {
          //         return response(res, 'success update disposal')
          //       } else {
          //         return response(res, 'failed update disposal', {}, 400, false)
          //       }
          //     } else {
          //       return response(res, 'Lengkapi dokumen terlebih dahulu1', {}, 400, false)
          //     }
          //   } else {
          //     return response(res, 'Lengkapi dokumen terlebih dahulu2', {}, 400, false)
          //   }
          // } else if (tipe === 'taxDis') {
          //   const findDoc = await docUser.findAll({
          //     where: {
          //       [Op.and]: [
          //         { no_pengadaan: result.id },
          //         { no_asset: result.no_asset },
          //         { jenis_form: 'disposal' },
          //         { tipe: 'tax' }
          //       ]
          //     }
          //   })
          //   if (findDoc.length > 0) {
          //     const cek = []
          //     for (let i = 0; i < findDoc.length; i++) {
          //       if (findDoc[i].path !== null) {
          //         cek.push(1)
          //       }
          //     }
          //     if (cek.length === findDoc.length) {
          //       const update = await result.update(results)
          //       if (update) {
          //         return response(res, 'success update disposal')
          //       } else {
          //         return response(res, 'failed update disposal', {}, 400, false)
          //       }
          //     } else {
          //       return response(res, 'Lengkapi dokumen terlebih dahulu3', {}, 400, false)
          //     }
          //   } else {
          //     return response(res, 'Lengkapi dokumen terlebih dahulu4', {}, 400, false)
          //   }
          // } else if (tipe === 'financeDis') {
          //   const findDoc = await docUser.findAll({
          //     where: {
          //       [Op.and]: [
          //         { no_pengadaan: result.id },
          //         { no_asset: result.no_asset },
          //         { jenis_form: 'disposal' },
          //         { tipe: 'finance' }
          //       ]
          //     }
          //   })
          //   if (findDoc.length > 0) {
          //     const cek = []
          //     for (let i = 0; i < findDoc.length; i++) {
          //       if (findDoc[i].path !== null) {
          //         cek.push(1)
          //       }
          //     }
          //     if (cek.length === findDoc.length) {
          //       const update = await result.update(results)
          //       if (update) {
          //         return response(res, 'success update disposal')
          //       } else {
          //         return response(res, 'failed update disposal', {}, 400, false)
          //       }
          //     } else {
          //       return response(res, 'Lengkapi dokumen terlebih dahulu5', {}, 400, false)
          //     }
          //   } else {
          //     return response(res, 'Lengkapi dokumen terlebih dahulu6', {}, 400, false)
          //   }
          // } else {
          //   const update = await result.update(results)
          //   if (update) {
          //     return response(res, 'success update disposal')
          //   } else {
          //     return response(res, 'failed update disposal', {}, 400, false)
          //   }
          // }
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
      const { noId, noAsset } = req.body
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
          [Op.and]: [
            { no_asset: noAsset },
            { id: noId }
          ]
        }
      })
      if (tipeDoValue === 'disposal' && tipeValue === 'pengajuan') {
        if (results.nilai_jual !== '0') {
          const result = await docUser.findAll({
            where: {
              [Op.and]: [
                { no_asset: noAsset },
                { no_pengadaan: results.id },
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
            return response(res, 'success get document 1', { result })
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
                if (getDoc[i].jenis_dokumen === 'it') {
                  if (results.kategori === 'IT') {
                    const send = {
                      nama_dokumen: getDoc[i].nama_dokumen,
                      jenis_dokumen: getDoc[i].jenis_dokumen,
                      divisi: getDoc[i].divisi,
                      no_pengadaan: results.id,
                      no_asset: noAsset,
                      jenis_form: tipeDoValue,
                      tipe: tipeValue,
                      path: null
                    }
                    const make = await docUser.create(send)
                    if (make) {
                      hasil.push(make)
                    }
                  }
                } else if (getDoc[i].jenis_dokumen !== 'it') {
                  const send = {
                    nama_dokumen: getDoc[i].nama_dokumen,
                    jenis_dokumen: getDoc[i].jenis_dokumen,
                    divisi: getDoc[i].divisi,
                    no_pengadaan: results.id,
                    no_asset: noAsset,
                    jenis_form: tipeDoValue,
                    tipe: tipeValue,
                    path: null
                  }
                  const make = await docUser.create(send)
                  if (make) {
                    hasil.push(make)
                  }
                }
              }
              if (hasil.length === getDoc.length) {
                return response(res, 'success get document 1.5', { result: hasil })
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
              [Op.and]: [
                { no_asset: noAsset },
                { no_pengadaan: results.id },
                { jenis_form: tipeDoValue },
                { tipe: tipeValue }
              ]
            }
          })
          if (result.length > 0) {
            return response(res, 'success get document 2', { result })
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
                if (getDoc[i].jenis_dokumen === 'it') {
                  if (results.kategori === 'IT') {
                    const send = {
                      nama_dokumen: getDoc[i].nama_dokumen,
                      jenis_dokumen: getDoc[i].jenis_dokumen,
                      divisi: getDoc[i].divisi,
                      no_pengadaan: results.id,
                      no_asset: noAsset,
                      jenis_form: tipeDoValue,
                      tipe: tipeValue,
                      path: null
                    }
                    const make = await docUser.create(send)
                    if (make) {
                      hasil.push(make)
                    }
                  }
                } else if (getDoc[i].jenis_dokumen !== 'it') {
                  const send = {
                    nama_dokumen: getDoc[i].nama_dokumen,
                    jenis_dokumen: getDoc[i].jenis_dokumen,
                    divisi: getDoc[i].divisi,
                    no_pengadaan: results.id,
                    no_asset: noAsset,
                    jenis_form: tipeDoValue,
                    tipe: tipeValue,
                    path: null
                  }
                  const make = await docUser.create(send)
                  if (make) {
                    hasil.push(make)
                  }
                }
              }
              if (hasil.length === getDoc.length) {
                return response(res, 'success get document 3', { result: hasil })
              } else {
                return response(res, 'failed get data', {}, 404, false)
              }
            } else {
              return response(res, 'failed get data', {}, 404, false)
            }
          }
        }
      } else if (tipeDoValue === 'edit' && tipeValue === 'pengajuan') {
        const result = await docUser.findAll({
          where: {
            [Op.and]: [
              { no_asset: noAsset },
              { no_pengadaan: results.id },
              { jenis_form: 'disposal' },
              {
                [Op.or]: [
                  { tipe: tipeValue },
                  { tipe: 'jual' }
                ]
              }
            ]
          }
        })
        if (result.length > 0) {
          return response(res, 'success get document 4', { result })
        } else {
          return response(res, 'success get document 5', { result })
        }
      } else if (npwp === 'ada') {
        const findAsset = await disposal.findOne({
          where: {
            [Op.and]: [
              { no_asset: noAsset },
              { id: noId }
            ]
          }
        })
        if (findAsset.npwp === 'ada') {
          const findDoc = await docUser.findAll({
            where: {
              [Op.and]: [
                { no_asset: noAsset },
                { no_pengadaan: results.id },
                { tipe: 'npwp' }
              ]
            }
          })
          if (findDoc.length > 0) {
            const result = await docUser.findAll({
              where: {
                [Op.and]: [
                  { no_asset: noAsset },
                  { no_pengadaan: results.id },
                  { jenis_form: tipeDoValue }
                ],
                [Op.or]: [
                  { tipe: tipeValue },
                  { tipe: 'npwp' }
                ]
              }
            })
            if (result.length > 0) {
              return response(res, 'success get document 6', { result })
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
                no_pengadaan: results.id,
                no_asset: noAsset,
                jenis_form: tipeDoValue,
                tipe: 'npwp',
                path: null
              }
              const make = await docUser.create(send)
              if (make) {
                const result = await docUser.findAll({
                  where: {
                    [Op.and]: [
                      { no_asset: noAsset },
                      { no_pengadaan: results.id },
                      { jenis_form: tipeDoValue }
                    ],
                    [Op.or]: [
                      { tipe: tipeValue },
                      { tipe: 'npwp' }
                    ]
                  }
                })
                if (result.length > 1) {
                  return response(res, 'success get document 7', { result })
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
                        no_pengadaan: results.id,
                        no_asset: noAsset,
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
                            { no_asset: noAsset },
                            { no_pengadaan: results.id },
                            { jenis_form: tipeDoValue }
                          ],
                          [Op.or]: [
                            { tipe: tipeValue },
                            { tipe: 'npwp' }
                          ]
                        }
                      })
                      if (result.length > 0) {
                        return response(res, 'success get document 8', { result })
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
                { no_asset: noAsset },
                { no_pengadaan: results.id },
                { tipe: 'npwp' }
              ]
            }
          })
          if (findDoc) {
            const delDoc = await findDoc.destroy()
            if (delDoc) {
              const result = await docUser.findAll({
                where: {
                  [Op.and]: [
                    { no_asset: noAsset },
                    { no_pengadaan: results.id },
                    { jenis_form: tipeDoValue },
                    { tipe: tipeValue }
                  ]
                }
              })
              if (result.length > 0) {
                return response(res, 'success get document 9', { result })
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
                      no_pengadaan: results.id,
                      no_asset: noAsset,
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
                    return response(res, 'success get document 10', { result: hasil })
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
                [Op.and]: [
                  { no_asset: noAsset },
                  { no_pengadaan: results.id },
                  { jenis_form: tipeDoValue },
                  { tipe: tipeValue }
                ]
              }
            })
            if (result.length > 0) {
              return response(res, 'success get document 11', { result })
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
                    no_pengadaan: results.id,
                    no_asset: noAsset,
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
                  return response(res, 'success get document 12', { result: hasil })
                } else {
                  return response(res, 'failed get data', {}, 404, false)
                }
              } else {
                return response(res, 'failed get data', {}, 404, false)
              }
            }
          }
        }
      } else if (tipeValue === 'persetujuan') {
        const result = await docUser.findAll({
          where: {
            [Op.and]: [
              { no_asset: noAsset },
              { no_pengadaan: results.no_persetujuan },
              { jenis_form: tipeDoValue },
              { tipe: tipeValue }
            ]
          }
        })
        if (result.length > 0) {
          return response(res, 'success get document 13', { result })
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
                no_pengadaan: results.no_persetujuan,
                no_asset: noAsset,
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
              return response(res, 'success get document 14', { result: hasil })
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
            [Op.and]: [
              { no_asset: noAsset },
              { no_pengadaan: results.id },
              { jenis_form: tipeDoValue },
              { tipe: tipeValue }
            ]
          }
        })
        if (result.length > 0) {
          return response(res, 'success get document 13', { result })
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
                no_pengadaan: results.id,
                no_asset: noAsset,
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
              return response(res, 'success get document 14', { result: hasil })
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
    const { tipe, ket } = req.query
    uploadHelper(req, res, async function (err) {
      try {
        if (err instanceof multer.MulterError) {
          if (err.code === 'LIMIT_UNEXPECTED_FILE' && req.files.length === 0) {
            // console.log(err.code === 'LIMIT_UNEXPECTED_FILE' && req.files.length > 0)
            return response(res, 'fieldname doesnt match', {}, 500, false)
          }
          return response(res, err.message, {}, 500, false)
        } else if (err) {
          return response(res, err.message, {}, 401, false)
        }
        const dokumen = `assets/documents/${req.file.filename}`
        const result = await docUser.findByPk(id)
        if (result) {
          if (tipe === 'edit' && ket === 'peng') {
            const send = {
              status: result.status === 0 ? 1 : result.status,
              path: dokumen,
              divisi: result.divisi === '0' ? 'asset' : result.divisi,
              desc: req.file.originalname
            }
            await result.update(send)
            const findDis = await disposal.findOne({
              where: {
                no_asset: result.no_pengadaan
              }
            })
            if (findDis) {
              return response(res, 'success edit disposal')
            } else {
              return response(res, 'success edit disposal')
            }
          } else if (tipe === 'edit' && ket === 'eks') {
            const send = {
              status: result.status === 0 ? 1 : result.status,
              path: dokumen,
              divisi: 'asset',
              desc: req.file.originalname
            }
            await result.update(send)
            return response(res, 'successfully upload dokumen', { send })
          } else {
            const send = {
              status: tipe === 'disposal' ? 4 : 1,
              path: dokumen,
              divisi: 'asset',
              desc: req.file.originalname
            }
            await result.update(send)
            return response(res, 'successfully upload dokumen', { send })
          }
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
      const schema = joi.object({
        alasan: joi.string()
      })
      const { value: results, error } = schema.validate(req.body)
      if (error) {
        return response(res, 'Error', { error: error.message }, 404, false)
      } else {
        const result = await docUser.findByPk(id)
        if (result) {
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
        const findUser = await user.findOne({
          where: {
            user_level: tipe === 'tax' ? 3 : 4
          }
        })
        const findEmail = await email.findOne({
          where: {
            kode_plant: result.kode_plant
          }
        })
        if (findUser || findEmail) {
          const data = {
            kode_plant: result.kode_plant,
            jenis: 'disposal',
            no_proses: no,
            list_appr: findUser.username,
            keterangan: tipe,
            response: 'revisi'
          }
          const createNotif = await notif.create(data)
          if (createNotif) {
            // const ccTax = [findEmail.email_am, findEmail.email_aam, findEmail.email_spv_asset, findEmail.email_staff_asset1, findEmail.email_staff_asset2, findEmail.email_nom, findEmail.email_bm, findEmail.email_area_om, findEmail.email_area_aos, findEmail.email_spv_tax]
            // const ccFinIt = [findEmail.email_am, findEmail.email_aam, findEmail.email_spv_asset, findEmail.email_fm, findEmail.email_afm, findEmail.email_spv_finance, findEmail.email_staff_asset1, findEmail.email_staff_asset2, findEmail.email_nom, findEmail.email_bm, findEmail.email_area_om, findEmail.email_area_aos, findEmail.email_it_spv, findEmail.email_ism, findEmail.email_staff_it, findEmail.email_ga_spv, findEmail.email_staff_ga]
            // const ccFin = [findEmail.email_am, findEmail.email_aam, findEmail.email_spv_asset, findEmail.email_fm, findEmail.email_afm, findEmail.email_spv_finance, findEmail.email_staff_asset1, findEmail.email_staff_asset2, findEmail.email_nom, findEmail.email_bm, findEmail.email_area_om, findEmail.email_area_aos, findEmail.email_ga_spv, findEmail.email_staff_ga]
            const tableTd = `
              <tr>
                <td>1</td>
                <td>D${result.no_disposal}</td>
                <td>${result.no_asset}</td>
                <td>${result.nama_asset}</td>
                <td>${result.cost_center}</td>
                <td>${result.area}</td>
              </tr>`
            const mailOptions = {
              from: 'noreply_asset@pinusmerahabadi.co.id',
              replyTo: 'noreply_asset@pinusmerahabadi.co.id',
              // to: `${findUser.email}`,
              to: `${emailAss}, ${emailAss2}`,
              // cc: tipe === 'tax' ? `${ccTax}` : tipe === 'finance' && (result.kategori === 'IT' || result.kategori === 'it') ? `${ccFinIt}` : `${ccFin}`,
              subject: `REJECT ${tipe === 'finance' ? 'JURNAL UANG MASUK' : 'FAKTUR PAJAK'} DISPOSAL ASSET ${result.area} `,
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
                      Dear Bapak/Ibu,
                  </div>
                  <div class="tittle mar1">
                      <div>Lampiran ${tipe === 'tax' ? 'faktur pajak' : 'jurnal uang masuk'} telah direject dengan alasan sebagai berikut:</div>
                      <div>Alasan reject: Dokumen tidak sesuai</div>
                  </div>
                  <div class="position mar1">
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
                  <div class="tittle">Mohon agar melengkapi/memperbaiki kelengkapan eksekusi disposalnya untuk dapat diproses lebih lanjut.</div>
                  <a href="http://aset.pinusmerahabadi.co.id/">Klik link berikut untuk akses web asset</a>
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
              if (result.no_io === 'finance' || result.no_io === 'tax' || result.no_io === 'taxfin') {
                const data = {
                  no_io: 'taxfin'
                }
                const sent = await result.update(data)
                if (sent) {
                  return response(res, 'success reject tax and finance failed sendemail')
                } else {
                  return response(res, 'failed reject tax and finance', {}, 404, false)
                }
              } else {
                const data = {
                  no_io: tipe
                }
                const sent = await result.update(data)
                if (sent) {
                  return response(res, 'success reject tax and finance failed sendemail')
                } else {
                  return response(res, 'failed reject tax and finance', {}, 404, false)
                }
              }
            }
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
        const findEmail = await email.findOne({
          where: {
            kode_plant: result.kode_plant
          }
        })
        if (findEmail) {
          // const ccTax = [findEmail.email_am, findEmail.email_aam, findEmail.email_spv_asset, findEmail.email_fm, findEmail.email_afm, findEmail.email_spv_tax, findEmail.email_staff_tax, findEmail.email_nom, findEmail.email_bm, findEmail.email_area_om, findEmail.email_area_aos, findEmail.email_ga_spv, findEmail.email_staff_ga]
          // const ccTaxIt = [findEmail.email_am, findEmail.email_aam, findEmail.email_spv_asset, findEmail.email_fm, findEmail.email_afm, findEmail.email_spv_tax, findEmail.email_staff_tax, findEmail.email_nom, findEmail.email_bm, findEmail.email_area_om, findEmail.email_area_aos, findEmail.email_it_spv, findEmail.email_ism, findEmail.email_staff_it, findEmail.email_ga_spv, findEmail.email_staff_ga]
          // const ccFinIt = [findEmail.email_am, findEmail.email_aam, findEmail.email_spv_asset, findEmail.email_fm, findEmail.email_afm, findEmail.email_spv_finance, findEmail.email_staff_admbank, findEmail.email_nom, findEmail.email_bm, findEmail.email_area_om, findEmail.email_area_aos, findEmail.email_it_spv, findEmail.email_ism, findEmail.email_staff_it, findEmail.email_ga_spv, findEmail.email_staff_ga]
          // const ccFin = [findEmail.email_am, findEmail.email_aam, findEmail.email_spv_asset, findEmail.email_fm, findEmail.email_afm, findEmail.email_spv_finance, findEmail.email_staff_admbank, findEmail.email_nom, findEmail.email_bm, findEmail.email_area_om, findEmail.email_area_aos, findEmail.email_ga_spv, findEmail.email_staff_ga]
          if (result.no_io === 'taxfin' && level === 3) {
            const findDoc = await docUser.findAll({
              where: {
                [Op.and]: [
                  { no_pengadaan: result.id },
                  { no_asset: result.no_asset },
                  { jenis_form: 'disposal' },
                  { tipe: 'tax' }
                ]
              }
            })
            if (findDoc.length > 0) {
              const cek = []
              for (let i = 0; i < findDoc.length; i++) {
                if (findDoc[i].divisi !== '0') {
                  cek.push(1)
                }
              }
              if (cek.length === findDoc.length) {
                const data = {
                  status_form: 7,
                  no_io: 'finance'
                }
                const sent = await result.update(data)
                if (sent) {
                  const findUser = await user.findOne({
                    where: {
                      user_level: 2
                    }
                  })
                  if (findUser) {
                    const findNotif = await notif.findOne({
                      where: {
                        response: 'revisi',
                        [Op.and]: [
                          { no_proses: no },
                          { keterangan: 'tax' }
                        ]
                      }
                    })
                    if (findNotif) {
                      const data = {
                        list_appr: findUser.username,
                        keterangan: level === 3 ? 'tax' : 'finance',
                        response: 'request'
                      }
                      const createNotif = await findNotif.update(data)
                      if (createNotif) {
                        const tableTd = `
                        <tr>
                          <td>1</td>
                          <td>D${result.no_disposal}</td>
                          <td>${result.no_asset}</td>
                          <td>${result.nama_asset}</td>
                          <td>${result.cost_center}</td>
                          <td>${result.area}</td>
                        </tr>`
                        const mailOptions = {
                          from: 'noreply_asset@pinusmerahabadi.co.id',
                          replyTo: 'noreply_asset@pinusmerahabadi.co.id',
                          // to: `${findEmail.email_staff_asset1}, ${findEmail.email_staff_asset2}`,
                          to: `${emailAss}, ${emailAss2}`,
                          // cc: result.kategori === 'IT' || result.kategori === 'it' ? `${ccTaxIt}` : `${ccTax}`,
                          subject: `REVISI FAKTUR PAJAK DISPOSAL ASSET ${result.area} `,
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
                                Dear Bapak/Ibu,
                            </div>
                            <div class="tittle mar1">
                                <div>Mohon untuk cek hasil revisi lampiran faktur pajak dibawah ini:</div>
                            </div>
                            <div class="position mar1">
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
                            <a href="http://aset.pinusmerahabadi.co.id/">Klik link berikut untuk akses web asset</a>
                            <div class="tittle foot">
                                Terima kasih,
                            </div>
                            <div class="tittle foot1">
                                Regards,
                            </div>
                            <div class="tittle">
                                Team Tax 
                            </div>
                        </body>
                        `
                        }
                        const sendEmail = await wrapMail.wrapedSendMail(mailOptions)
                        if (sendEmail) {
                          return response(res, 'success submit taxfin disposal', { sendEmail, findDoc, cek })
                        } else {
                          return response(res, 'berhasil submit taxfin disposal, tidak berhasil kirim notif email 1', { sendEmail, findDoc, cek })
                        }
                      }
                    }
                  }
                } else {
                  return response(res, 'failed submit tax and finance', {}, 404, false)
                }
              } else {
                return response(res, 'revisi dokumen terlebih dahulu', {}, 404, false)
              }
            } else {
              return response(res, 'revisi dokumen terlebih dahulu', {}, 404, false)
            }
          } else if (result.no_io === 'taxfin' && level === 4) {
            const findDoc = await docUser.findAll({
              where: {
                [Op.and]: [
                  { no_pengadaan: result.id },
                  { no_asset: result.no_asset },
                  { jenis_form: 'disposal' },
                  { tipe: 'finance' }
                ]
              }
            })
            if (findDoc.length > 0) {
              const cek = []
              for (let i = 0; i < findDoc.length; i++) {
                if (findDoc[i].divisi !== '0') {
                  cek.push(1)
                }
              }
              if (cek.length === findDoc.length) {
                const data = {
                  status_form: 7,
                  no_io: 'tax'
                }
                const sent = await result.update(data)
                if (sent) {
                  const findUser = await user.findOne({
                    where: {
                      user_level: 2
                    }
                  })
                  if (findUser) {
                    const findNotif = await notif.findOne({
                      where: {
                        response: 'revisi',
                        [Op.and]: [
                          { no_proses: no },
                          { keterangan: 'finance' }
                        ]
                      }
                    })
                    if (findNotif) {
                      const data = {
                        list_appr: findUser.username,
                        keterangan: level === 3 ? 'tax' : 'finance',
                        response: 'request'
                      }
                      const createNotif = await findNotif.update(data)
                      if (createNotif) {
                        const tableTd = `
                        <tr>
                          <td>1</td>
                          <td>D${result.no_disposal}</td>
                          <td>${result.no_asset}</td>
                          <td>${result.nama_asset}</td>
                          <td>${result.cost_center}</td>
                          <td>${result.area}</td>
                        </tr>`
                        const mailOptions = {
                          from: 'noreply_asset@pinusmerahabadi.co.id',
                          replyTo: 'noreply_asset@pinusmerahabadi.co.id',
                          // to: `${findEmail.email_staff_asset1}, ${findEmail.email_staff_asset2}`,
                          to: `${emailAss}, ${emailAss2}`,
                          // cc: result.kategori === 'IT' || result.kategori === 'it' ? `${ccFinIt}` : `${ccFin}`,
                          subject: `REVISI JURNAL UANG MASUK DISPOSAL ASSET ${result.area} `,
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
                                Dear Bapak/Ibu,
                            </div>
                            <div class="tittle mar1">
                                <div>Mohon untuk cek hasil revisi lampiran jurnal uang masuk dibawah ini:</div>
                            </div>
                            <div class="position mar1">
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
                            <a href="http://aset.pinusmerahabadi.co.id/">Klik link berikut untuk akses web asset</a>
                            <div class="tittle foot">
                                Terima kasih,
                            </div>
                            <div class="tittle foot1">
                                Regards,
                            </div>
                            <div class="tittle">
                              Team Finance 
                            </div>
                        </body>
                        `
                        }
                        const sendEmail = await wrapMail.wrapedSendMail(mailOptions)
                        if (sendEmail) {
                          return response(res, 'success submit tax and finance disposal', { sendEmail, findDoc, cek })
                        } else {
                          return response(res, 'berhasil submit tax and finance disposal, tidak berhasil kirim notif email 1', { sendEmail, findDoc, cek })
                        }
                      }
                    }
                  }
                } else {
                  return response(res, 'failed submit tax and finance', {}, 404, false)
                }
              } else {
                return response(res, 'revisi dokumen terlebih dahulu', {}, 404, false)
              }
            } else {
              return response(res, 'revisi dokumen terlebih dahulu', {}, 404, false)
            }
          } else {
            const findDoc = await docUser.findAll({
              where: {
                [Op.and]: [
                  { no_pengadaan: result.id },
                  { no_asset: result.no_asset },
                  { jenis_form: 'disposal' },
                  { tipe: level === 3 ? 'tax' : 'finance' }
                ]
              }
            })
            if (findDoc.length > 0) {
              const cek = []
              for (let i = 0; i < findDoc.length; i++) {
                if (findDoc[i].divisi !== '0') {
                  cek.push(1)
                }
              }
              if (cek.length === findDoc.length) {
                const data = {
                  status_form: 7,
                  no_io: null
                }
                const sent = await result.update(data)
                if (sent) {
                  const findUser = await user.findOne({
                    where: {
                      user_level: 2
                    }
                  })
                  if (findUser) {
                    const findNotif = await notif.findOne({
                      where: {
                        response: 'revisi',
                        [Op.and]: [
                          { no_proses: no },
                          { keterangan: level === 3 ? 'tax' : 'finance' }
                        ]
                      }
                    })
                    if (findNotif) {
                      const data = {
                        list_appr: findUser.username,
                        keterangan: level === 3 ? 'tax' : 'finance',
                        response: 'request'
                      }
                      const createNotif = await findNotif.update(data)
                      if (createNotif) {
                        const tableTd = `
                        <tr>
                          <td>1</td>
                          <td>D${result.no_disposal}</td>
                          <td>${result.no_asset}</td>
                          <td>${result.nama_asset}</td>
                          <td>${result.cost_center}</td>
                          <td>${result.area}</td>
                        </tr>`
                        const mailOptions = {
                          from: 'noreply_asset@pinusmerahabadi.co.id',
                          replyTo: 'noreply_asset@pinusmerahabadi.co.id',
                          to: `${emailAss}, ${emailAss2}`,
                          // to: `${findEmail.email_staff_asset1}, ${findEmail.email_staff_asset2}`,
                          // cc: (level === 3 && result.kategori === 'IT') || (level === 3 && result.kategori === 'it') ? `${ccTaxIt}` : (level === 4 && result.kategori === 'IT') || (level === 4 && result.kategori === 'it') ? `${ccFinIt}` : (level === 3 && result.kategori !== 'IT') || (level === 3 && result.kategori !== 'it') ? `${ccTax}` : (level === 4 && result.kategori !== 'IT') || (level === 4 && result.kategori !== 'it') ? `${ccFin}` : '',
                          subject: `REVISI ${level === 3 ? 'FAKTUR PAJAK' : 'JURNAL UANG MASUK'} DISPOSAL ASSET ${result.area} `,
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
                                Dear Bapak/Ibu,
                            </div>
                            <div class="tittle mar1">
                                <div>Mohon untuk cek hasil revisi ${level === 3 ? 'lampiran faktur pajak' : 'lampiran jurnal uang masuk'} dibawah ini:</div>
                            </div>
                            <div class="position mar1">
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
                            <a href="http://aset.pinusmerahabadi.co.id/">Klik link berikut untuk akses web asset</a>
                            <div class="tittle foot">
                                Terima kasih,
                            </div>
                            <div class="tittle foot1">
                                Regards,
                            </div>
                            <div class="tittle">
                                ${level === 3 ? 'Team Tax' : 'Team Finance'}
                            </div>
                        </body>
                        `
                        }
                        const sendEmail = await wrapMail.wrapedSendMail(mailOptions)
                        if (sendEmail) {
                          return response(res, 'success submit tax and finance disposal', { sendEmail, findDoc, cek })
                        } else {
                          return response(res, 'berhasil submit tax and finance disposal, tidak berhasil kirim notif email 1', { sendEmail, findDoc, cek })
                        }
                      }
                    }
                  }
                } else {
                  return response(res, 'failed submit tax and finance', {}, 404, false)
                }
              } else {
                return response(res, 'revisi dokumen terlebih dahulu', {}, 404, false)
              }
            } else {
              return response(res, 'failed submit tax and finance', {}, 404, false)
            }
          }
        } else {
          return response(res, 'failed submit tax and finance', {}, 404, false)
        }
      } else {
        return response(res, 'failed submit tax and finance', {}, 404, false)
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  getApproveSetDisposal: async (req, res) => {
    try {
      const { no } = req.body
      // const { nama } = req.query
      const nama = 'disposal persetujuan'
      if (no === 'prepare') {
        const result = await approve.findAll({
          where: {
            nama_approve: nama
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
        const result = await ttd.findAll({
          where: {
            no_doc: no
          }
        })
        const findRole = await role.findAll()
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
              no_persetujuan: no
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
                  jabatan: getApp[i].jabatan === '' || getApp[i].jabatan === null ? null : getApp[i].jabatan,
                  jenis: getApp[i].jenis === '' || getApp[i].jenis === null ? null : getApp[i].jenis,
                  sebagai: getApp[i].sebagai === '' || getApp[i].sebagai === null ? null : getApp[i].sebagai,
                  kategori: null,
                  no_doc: no,
                  struktur: getApp[i].struktur,
                  way_app: getApp[i].way_app,
                  id_role: findRole.find(item => item.name === getApp[i].jabatan).nomor
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
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  approveSetDisposal: async (req, res) => {
    try {
      const level = req.user.level
      const fullname = req.user.fullname
      const { type } = req.query
      if (type === 'upload') {
        uploadHelper(req, res, async function (err) {
          const { no, userApp } = req.body
          const dataUser = userApp.split(',')
          if (err instanceof multer.MulterError) {
            if (err.code === 'LIMIT_UNEXPECTED_FILE' && req.files.length === 0) {
              console.log(err.code === 'LIMIT_UNEXPECTED_FILE' && req.files.length > 0)
              return response(res, 'fieldname doesnt match', {}, 500, false)
            }
            return response(res, err.message, {}, 500, false)
          } else if (err) {
            return response(res, err.message, {}, 401, false)
          } else {
            const dokumen = `assets/documents/${req.file.filename}`
            const findTtd = await ttd.findAll({
              where: {
                no_doc: no
              }
            })
            if (findTtd.length > 0) {
              const cek = []
              for (let i = 0; i < dataUser.length; i++) {
                const findApp = await ttd.findByPk(dataUser[i])
                if (findApp) {
                  const findUser = await user.findOne({
                    where: {
                      user_level: findApp.id_role
                    }
                  })
                  if (findUser) {
                    const data = {
                      nama: findUser.fullname,
                      status: 1,
                      path: dokumen
                    }
                    await findApp.update(data)
                    cek.push(1)
                  }
                }
              }
              if (cek.length > 0) {
                const findFull = await ttd.findAll({
                  where: {
                    [Op.and]: [
                      { no_doc: no },
                      { status: 1 }
                    ]
                  }
                })
                const findDoc = await disposal.findAll({
                  where: {
                    no_persetujuan: no
                  }
                })
                if (findDoc.length > 0 && findFull) {
                  const valid = []
                  for (let i = 0; i < findDoc.length; i++) {
                    for (let j = 0; j < dataUser.length; j++) {
                      const findApp = await ttd.findByPk(dataUser[j])
                      if (findApp) {
                        const findUser = await user.findOne({
                          where: {
                            user_level: findApp.id_role
                          }
                        })
                        if (findUser) {
                          const findAsset = await disposal.findByPk(findDoc[i].id)
                          if (findAsset) {
                            const data = {
                              date_fullset: findFull.length === findTtd.length ? moment() : null,
                              status_form: findFull.length === findTtd.length ? 15 : findAsset.status_form,
                              status_reject: null,
                              isreject: null,
                              history: `${findAsset.history}, approved by ${findUser.fullname} at ${moment().format('DD/MM/YYYY h:mm:ss a')}`
                            }
                            await findAsset.update(data)
                            valid.push(findAsset.kode_plant)
                          }
                        }
                      }
                    }
                  }
                  if (valid.length > 0) {
                    const dataDoc = {
                      nama_dokumen: 'Dokumen Approval Persetujuan',
                      jenis_dokumen: 'all',
                      divisi: 'approval',
                      no_pengadaan: findDoc[0].no_persetujuan,
                      no_asset: findDoc[0].no_asset,
                      jenis_form: 'disposal',
                      tipe: 'persetujuan',
                      path: dokumen,
                      desc: req.file.originalname
                    }
                    await docUser.create(dataDoc)
                    return response(res, 'success approve disposal upload')
                  } else {
                    return response(res, 'failed approve disposal0', {}, 404, false)
                  }
                } else {
                  return response(res, 'failed approve disposal1', {}, 404, false)
                }
              } else {
                return response(res, 'failed approve disposal12', { findTtd, userApp, no }, 404, false)
              }
            } else {
              return response(res, `${findTtd[1].jabatan} belum approve atau telah mereject`, {}, 404, false)
            }
          }
        })
      } else {
        const { no, indexApp } = req.body
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
            const findTransDis = await disposal.findAll({
              where: {
                no_persetujuan: no
              }
            })
            const convIndex = (find.length - 1) - parseInt(indexApp)
            const hasil = find[convIndex].id
            const arr = convIndex
            // let hasil = 0
            // let arr = null
            // for (let i = 0; i < find.length; i++) {
            //   if (result[0].name === find[i].jabatan) {
            //     hasil = find[i].id
            //     arr = i
            //   }
            // }
            if (hasil !== 0 && findTransDis.length > 0) {
              if (arr !== find.length - 1 && (find[arr + 1].status !== null || find[arr + 1].status === 1 || find[arr + 1].status === 0)) {
                return response(res, 'Anda tidak memiliki akses lagi untuk mengapprove', {}, 404, false)
              } else {
                if (arr === 0 || find[arr - 1].status === 1) {
                  const data = {
                    nama: fullname,
                    status: 1,
                    path: null
                  }
                  const findTtd = await ttd.findByPk(hasil)
                  if (findTtd) {
                    const sent = await findTtd.update(data)
                    const findFull = await ttd.findAll({
                      where: {
                        [Op.and]: [
                          { no_doc: no },
                          { status: 1 }
                        ]
                      }
                    })
                    if (sent && findFull) {
                      const cek = []
                      for (let i = 0; i < findTransDis.length; i++) {
                        const send = {
                          date_fullset: findFull.length === find.length ? moment() : null,
                          status_form: findFull.length === find.length ? 15 : findTransDis[i].status_form,
                          status_reject: null,
                          isreject: null,
                          history: `${findTransDis[i].history}, approved by ${fullname} at ${moment().format('DD/MM/YYYY h:mm:ss a')}`
                        }
                        const findId = await disposal.findByPk(findTransDis[i].id)
                        if (findId) {
                          await findId.update(send)
                          cek.push(findId)
                        }
                      }
                      if (cek.length > 0) {
                        return response(res, 'success approve disposal web')
                      } else {
                        return response(res, 'failed approve disposal1', {}, 404, false)
                      }
                    } else {
                      return response(res, 'failed approve disposal2', {}, 404, false)
                    }
                  } else {
                    return response(res, 'failed approve disposal3', {}, 404, false)
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
      const { tipe, status } = req.query
      const list = Object.values(req.body)
      const alasan = list[0]
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
                  status: 0,
                  path: alasan
                }
                const findTtd = await ttd.findByPk(hasil)
                if (findTtd) {
                  const sent = await findTtd.update(data)
                  if (tipe === 'batal') {
                    const findDis = await disposal.findAll({
                      where: {
                        no_persetujuan: no
                      }
                    })
                    if (findDis.length > 0) {
                      const cek = []
                      for (let i = 0; i < findDis.length; i++) {
                        const send = {
                          status: null
                        }
                        const data = {
                          status_form: 0,
                          status_reject: 0,
                          isreject: 0
                        }
                        const find = await disposal.findByPk(findDis[i].id)
                        const updateAsset = await asset.findOne({
                          where: {
                            no_asset: findDis[i].no_asset
                          }
                        })
                        if (find && updateAsset) {
                          await updateAsset.update(send)
                          await find.update(data)
                          cek.push(1)
                        }
                      }
                      if (cek.length === findDis.length) {
                        // let draftEmail = ''
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
                            // draftEmail += result.email + ', '
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
                            // draftEmail += findEmail.email_area_aos + ', '
                          }
                        }
                        if (draf.length > 0) {
                          const valid = []
                          for (let i = 0; i < find.length; i++) {
                            // const serFind = await ttd.findByPk(find[i].id)
                            // if (serFind) {
                            //   await serFind.destroy()
                            valid.push(1)
                            // }
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
                                // const ttdOne = await ttd.findByPk(findApp[i].id)
                                // if (ttdOne) {
                                //   await ttdOne.destroy()
                                cekTtd.push(1)
                                // }
                              }
                              if (cekTtd.length > 0) {
                                const cekDok = []
                                for (let i = 0; i < findDis.length; i++) {
                                  const docFind = await docUser.findAll({
                                    where: {
                                      [Op.and]: [
                                        { no_pengadaan: findDis[i].id },
                                        { no_asset: findDis[i].no_asset },
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
                                  let tableTd = ''
                                  for (let i = 0; i < findDis.length; i++) {
                                    const element = `
                                        <tr>
                                          <td>${findDis.indexOf(findDis[i]) + 1}</td>
                                          <td>D${findDis[i].no_disposal}</td>
                                          <td>${findDis[i].no_asset}</td>
                                          <td>${findDis[i].nama_asset}</td>
                                          <td>${findDis[i].cost_center}</td>
                                          <td>${findDis[i].area}</td>
                                        </tr>`
                                    tableTd = tableTd + element
                                  }
                                  const mailOptions = {
                                    from: 'noreply_asset@pinusmerahabadi.co.id',
                                    replyTo: 'noreply_asset@pinusmerahabadi.co.id',
                                    // to: `${draftEmail}`,
                                    to: `${emailAss}, ${emailAss2}`,
                                    subject: 'Reject Pembatalan Form Persetujuan Disposal Asset ',
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
                                            <div>Alasan reject: ${alasan}</div>
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
                                                  ${tableTd}
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
                                  const sendEmail = await wrapMail.wrapedSendMail(mailOptions)
                                  if (sendEmail) {
                                    return response(res, 'success reject disposal', { sendEmail })
                                  } else {
                                    return response(res, 'berhasil reject disposal, tidak berhasil kirim notif email 1')
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
                          return response(res, 'failed reject persetujuan disposal', {}, 404, false)
                        }
                      } else {
                        return response(res, 'failed reject disposal', {}, 404, false)
                      }
                    } else {
                      return response(res, 'failed reject disposal', {}, 404, false)
                    }
                  } else {
                    if (sent) {
                      // let draftEmail = ''
                      const draf = []
                      const listPlant = []
                      const findDis = await disposal.findAll({
                        where: {
                          no_persetujuan: no
                        }
                      })
                      if (findDis.length > 0) {
                        const cekdok = []
                        const dokpurch = []
                        const dokarea = []
                        for (let i = 1; i < list.length; i++) {
                          const cekDis = await disposal.findByPk(parseInt(list[i]))
                          if (cekDis) {
                            const docFind = await docUser.findAll({
                              where: {
                                [Op.and]: [
                                  { no_pengadaan: cekDis.id },
                                  { no_asset: cekDis.no_asset },
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
                                if (docFind[j].tipe === 'purch' && (docFind[j].status === 0 || docFind[j].divisi === '0')) {
                                  dokpurch.push(1)
                                } else if (docFind[j].status === 0 || docFind[j].divisi === '0') {
                                  dokarea.push(1)
                                } else {
                                  cekdok.push(1)
                                }
                              }
                            }
                          } else {
                            cekdok.push(1)
                          }
                        }
                        if (cekdok.length > 0) {
                          const cekDis = []
                          for (let i = 0; i < findDis.length; i++) {
                            const stat = dokarea.length > 0 && dokpurch.length > 0 ? 3 : dokarea.length === 0 && dokpurch.length > 0 ? 2 : dokarea.length > 0 && dokpurch.length === 0 ? 1 : 4
                            const cekStat = stat === 3 ? stat : status.indexOf('2') !== -1 && stat === 4 ? 2 : status.indexOf('2') !== -1 && stat === 2 ? stat : status.indexOf('2') !== -1 && stat === 1 ? 3 : status.indexOf('2') === -1 && stat === 4 ? 1 : stat
                            const data = {
                              status_reject: cekStat,
                              reason: alasan,
                              isreject: null
                            }
                            const send = {
                              status_reject: cekStat,
                              reason: alasan,
                              isreject: 1
                            }
                            const resDis = await disposal.findByPk(findDis[i].id)
                            if (list.find(element => parseInt(element) === resDis.id) !== undefined) {
                              await resDis.update(send)
                              cekDis.push(1)
                            } else {
                              await resDis.update(data)
                              cekDis.push(1)
                            }
                          }
                          if (cekDis.length > 0) {
                            for (let i = 0; i < arr; i++) {
                              const result = await user.findOne({
                                where: {
                                  username: find[i].nama
                                }
                              })
                              if (result) {
                                draf.push(result)
                                // draftEmail += result.email + ', '
                              }
                            }
                            findDis.map(x => {
                              return (
                                listPlant.push({ kode_plant: x.kode_plant, no_disposal: x.no_disposal })
                              )
                            })
                            const set = new Set(listPlant)
                            const noPlant = [...set]
                            for (let i = 0; i < noPlant.length; i++) {
                              const findEmail = await email.findOne({
                                where: {
                                  kode_plant: noPlant[i].kode_plant
                                }
                              })
                              if (findEmail) {
                                draf.push(findEmail)
                                // draftEmail += findEmail.email_area_aos + ', '
                                const data = {
                                  list_appr: noPlant[i].kode_plant,
                                  response: 'reject'
                                }
                                const findNotif = await notif.findOne({
                                  where: {
                                    [Op.and]: [
                                      { no_proses: 'D' + noPlant[i].no_disposal },
                                      { kode_plant: noPlant[i].kode_plant }
                                    ]
                                  }
                                })
                                if (findNotif) {
                                  await findNotif.update(data)
                                }
                              }
                            }
                            let tableTd = ''
                            for (let i = 0; i < findDis.length; i++) {
                              const element = `
                                  <tr>
                                    <td>${findDis.indexOf(findDis[i]) + 1}</td>
                                    <td>D${findDis[i].no_disposal}</td>
                                    <td>${findDis[i].no_asset}</td>
                                    <td>${findDis[i].nama_asset}</td>
                                    <td>${findDis[i].cost_center}</td>
                                    <td>${findDis[i].area}</td>
                                  </tr>`
                              tableTd = tableTd + element
                            }
                            const mailOptions = {
                              from: 'noreply_asset@pinusmerahabadi.co.id',
                              replyTo: 'noreply_asset@pinusmerahabadi.co.id',
                              // to: `${draftEmail}`,
                              to: `${emailAss}, ${emailAss2}`,
                              subject: 'Reject Perbaikan Disposal Asset ',
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
                                      <div>Persetujuan disposal asset telah direject, mohon untuk segera diperbaiki</div>
                                      <div>Alasan reject: ${alasan}</div>
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
                                            ${tableTd}
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
                            const sendEmail = await wrapMail.wrapedSendMail(mailOptions)
                            if (sendEmail) {
                              return response(res, 'success reject disposal', { sendEmail })
                            } else {
                              return response(res, 'berhasil reject disposal, tidak berhasil kirim notif email 1')
                            }
                          } else {
                            return response(res, 'berhasil reject disposal, tidak berhasil kirim notif email 1')
                          }
                        } else {
                          return response(res, 'berhasil reject disposal, tidak berhasil kirim notif email 1')
                        }
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
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  genNoSetDisposal: async (req, res) => {
    try {
      // const timeV1 = moment().startOf('month')
      // const timeV2 = moment().endOf('month').add(1, 'd')
      const name = req.user.fullname
      const findNo = await reservoir.findAll({
        where: {
          tipe: 'ho'
          // ,
          // createdAt: {
          //   [Op.gte]: timeV1,
          //   [Op.lt]: timeV2
          // }
        },
        order: [['id', 'DESC']],
        limit: 50
      })
      const cekNo = []
      if (findNo.length > 0) {
        for (let i = 0; i < findNo.length; i++) {
          const no = findNo[i].no_transaksi.split('/')
          cekNo.push(parseInt(no[0]))
        }
      } else {
        cekNo.push(0)
      }
      const noPemb = Math.max(...cekNo) + 1
      const change = noPemb.toString().split('')
      const notrans = change.length === 2 ? '00' + noPemb : change.length === 1 ? '000' + noPemb : change.length === 3 ? '0' + noPemb : noPemb
      const month = parseInt(moment().format('MM'))
      const year = moment().format('YYYY')
      let rome = ''
      if (month === 1) {
        rome = 'I'
      } else if (month === 2) {
        rome = 'II'
      } else if (month === 3) {
        rome = 'III'
      } else if (month === 4) {
        rome = 'IV'
      } else if (month === 5) {
        rome = 'V'
      } else if (month === 6) {
        rome = 'VI'
      } else if (month === 7) {
        rome = 'VII'
      } else if (month === 8) {
        rome = 'VIII'
      } else if (month === 9) {
        rome = 'IX'
      } else if (month === 10) {
        rome = 'X'
      } else if (month === 11) {
        rome = 'XI'
      } else if (month === 12) {
        rome = 'XII'
      }
      const tipe = 'PDA'
      const noNow = `${notrans}/${rome}/${year}-${tipe}`
      if (noNow) {
        const data = {
          no_transaksi: noNow,
          transaksi: 'disposal',
          tipe: 'ho',
          status: 'delayed',
          kode_plant: name,
          createdAt: moment()
        }
        const createReser = await reservoir.create(data)
        if (createReser) {
          const findPemb = await reservoir.findAll({
            where: {
              status: 'delayed',
              transaksi: 'disposal',
              tipe: 'ho',
              kode_plant: name,
              [Op.not]: [
                { no_transaksi: noNow }
              ]
            }
          })
          if (findPemb.length > 0) {
            const cekUpdate = []
            for (let i = 0; i < findPemb.length; i++) {
              const data = {
                status: 'expired'
              }
              const findReser = await reservoir.findByPk(findPemb[i].id)
              if (findReser) {
                const findTtd = await ttd.findAll({
                  where: {
                    no_doc: findReser.no_transaksi
                  }
                })
                if (findTtd.length > 0) {
                  for (let j = 0; j < findTtd.length; j++) {
                    const findId = await ttd.findByPk(findTtd[j].id)
                    await findId.destroy()
                  }
                  const upReser = await findReser.update(data)
                  cekUpdate.push(upReser)
                } else {
                  const upReser = await findReser.update(data)
                  cekUpdate.push(upReser)
                }
              }
            }
            if (cekUpdate.length > 0) {
              return response(res, 'success create no persetujuan', { no_setdis: noNow, findNo, findPemb })
            } else {
              return response(res, 'failed create no persetujuan', {}, 400, false)
            }
          } else {
            return response(res, 'success create no persetujuan', { no_setdis: noNow, findNo, findPemb })
          }
        } else {
          return response(res, 'failed create no persetujuan1', {}, 400, false)
        }
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  submitSetDisposal: async (req, res) => {
    try {
      const { no, list } = req.body
      const fullname = req.user.fullname
      const temp = []
      for (let i = 0; i < list.length; i++) {
        const findDis = await disposal.findAll({
          where: {
            no_disposal: list[i]
          }
        })
        const findUser = await user.findOne({
          where: {
            user_level: 22
          }
        })
        if (findDis.length > 0 && findUser) {
          for (let j = 0; j < findDis.length; j++) {
            const find = await disposal.findByPk(findDis[j].id)
            if (find) {
              const send = {
                status_form: 3,
                no_persetujuan: no,
                date_persetujuan: moment(),
                ceo: findUser.fullname,
                history: `${find.history}, submit disposal persetujuan by ${fullname} at ${moment().format('DD/MM/YYYY h:mm:ss a')}`
              }
              await find.update(send)
              temp.push(1)
            }
          }
        }
      }
      if (temp.length > 0) {
        const findNewReser = await reservoir.findOne({
          where: {
            no_transaksi: no
          }
        })
        if (findNewReser) {
          const upDataReser = {
            status: 'used',
            createdAt: moment()
          }
          await findNewReser.update(upDataReser)
          return response(res, 'success submit disposal', { no: no, list: list })
        } else {
          return response(res, 'success submit disposal', { no: no, list: list })
        }
      } else {
        return response(res, 'failed submit2', {}, 404, false)
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
              { no_persetujuan: status },
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
                data.push(x.no_persetujuan)
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
      const { no } = req.body
      const level = req.user.level
      const fullname = req.user.fullname
      const result = await disposal.findAll({
        where: {
          no_disposal: no
        }
      })
      const historyEks = `submit eksekusi disposal by ${fullname} at ${moment().format('DD/MM/YYYY h:mm:ss a')}}` //eslint-disable-line
      if (result.length > 0) {
        if (result[0].nilai_jual === '0') {
          if (level === 2) {
            const cekData = []
            for (let i = 0; i < result.length; i++) {
              const body = {
                id: `${result[i].no_disposal}-${result[i].no_asset}`,
                companycode: 'PP01',
                asset: result[i].no_asset,
                subnumber: '0',
                doc_date: result[i].date_ba === null ? moment().format('YYYYMMDD') : moment(result[i].date_ba).format('YYYYMMDD'),
                pstng_date: result[i].date_ba === null ? moment().format('YYYYMMDD') : moment(result[i].date_ba).format('YYYYMMDD'),
                value_date: result[i].date_ba === null ? moment().format('YYYYMMDD') : moment(result[i].date_ba).format('YYYYMMDD'),
                text: `${result[i].no_asset}_${result[i].nama_asset}_Dimusnahkan`
              }
              const prosesSap = await axios({
                method: 'get',
                url: `${APP_SAP}/sap/bc/zws_fi/zcl_ws_fi/?sap-client=${APP_CLIENT}&q=assetretirement`,
                headers: {
                  'Content-Type': 'application/json',
                  'Cookie': `sap-usercontext=sap-client=${APP_CLIENT}` // eslint-disable-line
                },
                data: body,
                timeout: 1000 * 60 * 5
              })

              if ((prosesSap && prosesSap.data !== undefined && prosesSap.data.success) || parseInt(APP_CLIENT) === 110) {
                const findId = await disposal.findByPk(result[i].id)
                const prev = moment().subtract(1, 'month').format('L').split('/')
                const findApi = await axios.get(`${SAP_PROD_URL}/sap/bc/zast/?sap-client=${SAP_PROD_CLIENT}&pgmna=zfir0090&p_anln1=${findId.no_asset}&p_bukrs=pp01&p_gjahr=${prev[2]}&p_monat=${prev[0]}`, { timeout: 10000 }).then(response => { return (response) }).catch(err => { return (err.isAxiosError) })
                const data = {
                  status_form: 8,
                  pic_aset: fullname,
                  nilai_buku_eks: findApi.status === 200 ? (findApi.data[0].nafap === undefined ? findId.nilai_buku : findApi.data[0].nafap) : findId.nilai_buku,
                  accum_dep: findApi.status === 200 ? (findApi.data[0].knafa === undefined ? findId.accum_dep : findApi.data[0].knafa) : findId.accum_dep,
                  tgl_eksekusi: moment(),
                  history: `${findId.history}, ${historyEks}`,
                  message_sap: parseInt(APP_CLIENT) === 110 ? '' : prosesSap.data.message
                }
                const results = await findId.update(data)
                if (results) {
                  const findAsset = await asset.findOne({
                    where: {
                      no_asset: findId.no_asset
                    }
                  })
                  if (findAsset) {
                    const send = {
                      status: '0'
                    }
                    const upAsset = await findAsset.update(send)
                    if (upAsset) {
                      cekData.push(results)
                    }
                  }
                }
              }
            }
            if (cekData.length > 0) {
              return response(res, 'success submit eksekusi disposal')
            } else {
              return response(res, 'failed submit disposal', {}, 400, false)
            }
            // } else {
            //   return response(res, 'Approve dokumen terlebih dahulu sebelum submit', {}, 400, false)
            // }
          } else {
            // const cek = []
            // for (let i = 0; i < findDoc.length; i++) {
            //   if (findDoc[i].path !== null) {
            //     cek.push(1)
            //   }
            // }
            // if (findDoc.length > 0) {
            const cekData = []
            for (let i = 0; i < result.length; i++) {
              const findId = await disposal.findByPk(result[i].id)
              const prev = moment().subtract(1, 'month').format('L').split('/')
              const findApi = await axios.get(`${SAP_PROD_URL}/sap/bc/zast/?sap-client=${SAP_PROD_CLIENT}&pgmna=zfir0090&p_anln1=${findId.no_asset}&p_bukrs=pp01&p_gjahr=${prev[2]}&p_monat=${prev[0]}`, { timeout: 10000 }).then(response => { return (response) }).catch(err => { return (err.isAxiosError) })
              let data = {}
              if (findApi.status === 200) {
                data = {
                  status_form: 4,
                  nilai_buku_eks: findApi.data[0].nafap === undefined ? findId.nilai_buku : findApi.data[0].nafap,
                  accum_dep: findApi.data[0].knafa === undefined ? findId.accum_dep : findApi.data[0].knafa
                }
              } else {
                data = {
                  status_form: 4,
                  nilai_buku_eks: findId.nilai_buku,
                  history: `${findId.history}, ${historyEks}`
                }
              }
              const results = await findId.update(data)
              if (results) {
                cekData.push(findId)
              }
            }
            if (cekData.length > 0) {
              return response(res, 'success submit disposal', {})
            } else {
              return response(res, 'failed submit disposal', {}, 400, false)
            }
            // } else {
            //   return response(res, 'Upload dokumen terlebih dahulu sebelum submit', {}, 400, false)
            // }
          }
          // } else {
          //   return response(res, 'Upload dokumen terlebih dahulu sebelum submit', {}, 400, false)
          // }
        } else {
          if (result.npwp === 'ada') {
            // const findTemp = await document.findAll({
            //   where: {
            //     [Op.and]: [
            //       { tipe_dokumen: 'disposal' }
            //     ],
            //     [Op.or]: [
            //       { tipe: 'sell' },
            //       { tipe: 'npwp' }
            //     ]
            //   }
            // })
            // if (findTemp.length > 0) {
            // const findDoc = await docUser.findAll({
            //   where: {
            //     [Op.and]: [
            //       { no_pengadaan: result.id },
            //       { no_asset: result.no_asset },
            //       { jenis_form: 'disposal' }
            //     ],
            //     [Op.or]: [
            //       { tipe: 'sell' },
            //       { tipe: 'npwp' }
            //     ]
            //   }
            // })
            // if (findDoc.length > 0) {
            // if (findTemp.length === findDoc.length) {
            if (level === 2) {
              // const cek = []
              // for (let i = 0; i < findDoc.length; i++) {
              //   if (findDoc[i].divisi === '3' || findDoc[i].status === 3) {
              //     cek.push(1)
              //   }
              // }
              // if (cek.length === findDoc.length) {
              const cekData = []
              for (let i = 0; i < result.length; i++) {
                const findId = await disposal.findByPk(result[i].id)
                const prev = moment().subtract(1, 'month').format('L').split('/')
                const findApi = await axios.get(`${SAP_PROD_URL}/sap/bc/zast/?sap-client=${SAP_PROD_CLIENT}&pgmna=zfir0090&p_anln1=${findId.no_asset}&p_bukrs=pp01&p_gjahr=${prev[2]}&p_monat=${prev[0]}`, { timeout: 10000 }).then(response => { return (response) }).catch(err => { return (err.isAxiosError) })
                let data = {}
                if (findApi.status === 200) {
                  data = {
                    // status_form: level === 5 ? 5 : 6,
                    status_form: 5,
                    pic_aset: fullname,
                    nilai_buku_eks: findApi.data[0].nafap === undefined ? findId.nilai_buku : findApi.data[0].nafap,
                    accum_dep: findApi.data[0].knafa === undefined ? findId.accum_dep : findApi.data[0].knafa,
                    tgl_eksekusi: moment(),
                    history: `${findId.history}, ${historyEks}`
                  }
                } else {
                  data = {
                    // status_form: level === 5 ? 5 : 6,
                    status_form: 5,
                    pic_aset: fullname,
                    nilai_buku_eks: findId.nilai_buku,
                    tgl_eksekusi: moment(),
                    history: `${findId.history}, ${historyEks}`
                  }
                }
                const results = await findId.update(data)
                if (results) {
                  cekData.push(findId)
                }
              }
              if (cekData.length > 0) {
                return response(res, 'success submit disposal')
              } else {
                return response(res, 'failed submit disposal', {}, 400, false)
              }
              // } else {
              //   return response(res, 'Approve dokumen terlebih dahulu sebelum submit', {}, 400, false)
              // }
            } else {
              // const cek = []
              // for (let i = 0; i < findDoc.length; i++) {
              //   if (findDoc[i].path !== null) {
              //     cek.push(1)
              //   }
              // }
              // if (cek.length === findDoc.length) {
              const cekData = []
              for (let i = 0; i < result.length; i++) {
                const findId = await disposal.findByPk(result[i].id)
                const data = {
                  status_form: 4,
                  history: `${findId.history}, ${historyEks}`
                }
                const results = await findId.update(data)
                if (results) {
                  cekData.push(findId)
                }
              }
              if (cekData.length > 0) {
                return response(res, 'success submit disposal')
              } else {
                return response(res, 'failed submit disposal', {}, 400, false)
              }
              // } else {
              //   return response(res, 'Upload dokumen terlebih dahulu sebelum submit', {}, 400, false)
              // }
            }
            // } else {
            //   return response(res, 'Upload dokumen terlebih dahulu sebelum submit', {}, 400, false)
            // }
            // } else {
            //   return response(res, 'Upload dokumen terlebih dahulu sebelum submit', {}, 400, false)
            // }
            // } else {
            //   return response(res, 'failed submit disposal', {}, 400, false)
            // }
          } else {
            // const findDoc = await docUser.findAll({
            //   where: {
            //     [Op.and]: [
            //       { no_pengadaan: result.id },
            //       { no_asset: result.no_asset },
            //       { jenis_form: 'disposal' },
            //       { tipe: 'sell' }
            //     ]
            //   }
            // })
            // if (findDoc.length > 0) {
            if (level === 2) {
              // const cek = []
              // for (let i = 0; i < findDoc.length; i++) {
              //   if (findDoc[i].status === 3 || findDoc[i].divisi === '3') {
              //     cek.push(1)
              //   }
              // }
              // if (cek.length === findDoc.length) {
              const cekData = []
              for (let i = 0; i < result.length; i++) {
                const findId = await disposal.findByPk(result[i].id)
                const prev = moment().subtract(1, 'month').format('L').split('/')
                const findApi = await axios.get(`${SAP_PROD_URL}/sap/bc/zast/?sap-client=${SAP_PROD_CLIENT}&pgmna=zfir0090&p_anln1=${findId.no_asset}&p_bukrs=pp01&p_gjahr=${prev[2]}&p_monat=${prev[0]}`, { timeout: 10000 }).then(response => { return (response) }).catch(err => { return (err.isAxiosError) })
                let data = {}
                if (findApi.status === 200) {
                  data = {
                    // status_form: level === 5 ? 5 : 6,
                    status_form: 5,
                    pic_aset: fullname,
                    nilai_buku_eks: findApi.data[0].nafap === undefined ? findId.nilai_buku : findApi.data[0].nafap,
                    accum_dep: findApi.data[0].knafa === undefined ? findId.accum_dep : findApi.data[0].knafa,
                    tgl_eksekusi: moment(),
                    history: `${findId.history}, ${historyEks}`
                  }
                } else {
                  data = {
                    // status_form: level === 5 ? 5 : 6,
                    status_form: 5,
                    pic_aset: fullname,
                    nilai_buku_eks: findId.nilai_buku,
                    tgl_eksekusi: moment(),
                    history: `${findId.history}, ${historyEks}`
                  }
                }
                const results = await findId.update(data)
                if (results) {
                  cekData.push(findId)
                }
              }
              if (cekData.length > 0) {
                return response(res, 'success submit disposal')
              } else {
                return response(res, 'failed submit disposal', {}, 400, false)
              }
              // } else {
              //   return response(res, 'Approve dokumen terlebih dahulu sebelum submit', {}, 400, false)
              // }
            } else {
              // const cek = []
              // for (let i = 0; i < findDoc.length; i++) {
              //   if (findDoc[i].path !== null) {
              //     cek.push(1)
              //   }
              // }
              // if (cek.length === findDoc.length) {
              const cekData = []
              for (let i = 0; i < result.length; i++) {
                const findId = await disposal.findByPk(result[i].id)
                const data = {
                  status_form: 4,
                  history: `${findId.history}, ${historyEks}`
                }
                const results = await findId.update(data)
                if (results) {
                  cekData.push(findId)
                }
              }
              if (cekData.length > 0) {
                return response(res, 'success submit disposal')
              } else {
                return response(res, 'failed submit disposal', {}, 400, false)
              }
              // } else {
              //   return response(res, 'Upload dokumen terlebih dahulu sebelum submit', {}, 400, false)
              // }
            }
            // } else {
            //   return response(res, 'Upload dokumen terlebih dahulu sebelum submit', {}, 400, false)
            // }
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
      const fullname = req.user.fullname
      const { no } = req.body
      const result = await disposal.findAll({
        where: {
          no_disposal: no
        }
      })
      if (result.length > 0) {
        const cek = []
        for (let i = 0; i < result.length; i++) {
          const findId = await disposal.findByPk(result[i].id)
          if (findId) {
            const data = {
              status_form: level === 3 ? 6 : 7,
              date_tax: level === 3 ? moment() : findId.date_tax,
              date_finance: level === 4 ? moment() : findId.date_finance,
              pic_finance: level === 4 ? fullname : findId.pic_finance,
              pic_tax: level === 3 ? fullname : findId.pic_tax,
              history: `${findId.history}, submit proses ${level === 3 ? 'tax' : 'finance'} disposal by ${fullname} at ${moment().format('DD/MM/YYYY h:mm:ss a')}`
            }
            const results = await findId.update(data)
            if (results) {
              cek.push(results)
            }
          }
        }
        if (cek.length > 0) {
          return response(res, 'success submit taxfin disposal')
        } else {
          return response(res, 'failed submit disposal', {}, 400, false)
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
      const { no, gl_debit, gl_credit } = req.body
      const fullname = req.user.fullname
      const finalDebit = (gl_debit === undefined || gl_debit === '') ? '11020909' : gl_debit
      const finalCredit = (gl_credit === undefined || gl_credit === '') ? '71050001' : gl_credit
      const result = await disposal.findAll({
        where: {
          no_disposal: no
        }
      })
      if (result.length > 0) {
        const getDepo = await depo.findOne({
          where: {
            kode_plant: result[0].kode_plant
          }
        })
        const cek = []
        for (let i = 0; i < result.length; i++) {
          const body = {
            id: `${result[i].no_disposal}-${result[i].no_asset}`,
            header: {
              bukrs: 'PP01',
              doc_date: moment(result[i].date_faktur).format('DDMMYYYY'),
              pstng_date: moment(result[i].date_faktur).format('DDMMYYYY'),
              monat: moment().format('MM'),
              currency: 'IDR',
              ref_doc_no: result[i].pic_aset,
              header_txt: 'PENJUALAN ASSET'
            },
            debit: {
              gl_account: finalDebit,
              amount: `${result[i].nilai_jual}`,
              valut: moment(result[i].date_faktur).format('DDMMYYYY'),
              text: `${result[i].no_asset}_${result[i].nama_asset}_${result[i].area}_DIJUAL`,
              profit_ctr: getDepo.profit_center
            },
            credit: {
              gl_account: finalCredit,
              amount: `${result[i].nilai_jual}`,
              tax_code: 'A4',
              text: `${result[i].no_asset}_${result[i].nama_asset}_${result[i].area}_DIJUAL`,
              costcenter: getDepo.cost_center,
              profit_ctr: getDepo.profit_center,
              asset_no: result[i].no_asset,
              sub_number: '0000',
              assettrans_type: '210',
              asset_valdate: moment(result[i].date_faktur).format('DDMMYYYY')
            },
            tax: {
              valut: moment(result[i].date_faktur).format('DDMMYYYY'),
              text: `${result[i].no_fp}_${result[i].no_asset}`,
              profit_ctr: getDepo.profit_center
            }
          }

          const prosesSap = await axios({
            method: 'get',
            url: `${APP_SAP}/sap/bc/zws_fi/zcl_ws_fi/?sap-client=${APP_CLIENT}&q=assetselling`,
            headers: {
              'Content-Type': 'application/json',
              'Cookie': `sap-usercontext=sap-client=${APP_CLIENT}` // eslint-disable-line
            },
            data: body,
            timeout: 1000 * 60 * 5
          })
          if ((prosesSap && prosesSap.data !== undefined && prosesSap.data.details.length > 0) || parseInt(APP_CLIENT) === 110) {
            if ((prosesSap.data.details[0].type === 'S') || parseInt(APP_CLIENT) === 110) {
              const findId = await disposal.findByPk(result[i].id)
              if (findId) {
                const data = {
                  date_finish: moment(),
                  status_form: 8,
                  gl_debit: finalDebit,
                  gl_credit: finalCredit,
                  history: `${findId.history}, submit verifikasi final disposal by ${fullname} at ${moment().format('DD/MM/YYYY h:mm:ss a')}`,
                  message_sap: parseInt(APP_CLIENT) === 110 ? '' : prosesSap.data.details[0].message
                }
                const results = await findId.update(data)
                if (results) {
                  const findAsset = await asset.findOne({
                    where: {
                      no_asset: findId.no_asset
                    }
                  })
                  if (findAsset) {
                    const send = {
                      status: '0'
                    }
                    const upAsset = await findAsset.update(send)
                    if (upAsset) {
                      cek.push(results)
                    }
                  }
                }
              }
            }
          }
        }
        if (cek.length > 0) {
          return response(res, 'success submit disposal')
        } else {
          return response(res, 'failed submit disposal', { no }, 400, false)
        }
        // const findDoc = await docUser.findAll({
        //   where: {
        //     [Op.and]: [
        //       { jenis_form: 'disposal' },
        //       { no_pengadaan: result.id },
        //       { no_asset: result.no_asset }
        //     ],
        //     [Op.or]: [
        //       { tipe: 'finance' },
        //       { tipe: 'tax' }
        //     ]
        //   }
        // })
        // if (findDoc.length > 0) {
        // const cek = []
        // for (let i = 0; i < findDoc.length; i++) {
        //   if (findDoc[i].divisi === '3' || findDoc[i].status === 3) {
        //     cek.push(1)
        //   }
        // }
        // if (cek.length === findDoc.length) {
        // const data = {
        //   date_finish: moment(),
        //   status_form: 8
        // }
        // const results = await result.update(data)
        // if (results) {
        //   return response(res, 'success submit disposal')
        // } else {
        //   return response(res, 'failed submit disposal', {}, 400, false)
        // }
        // } else {
        //   return response(res, 'approve dokumen terlebih dahulu', {}, 400, false)
        // }
        // } else {
        //   return response(res, 'Tidak ada dokumen finance dan tax', {}, 400, false)
        // }
      } else {
        return response(res, 'failed submit disposal', {}, 400, false)
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  submitPurch: async (req, res) => {
    try {
      const { no } = req.body
      const fullname = req.user.fullname
      const result = await disposal.findAll({
        where: {
          no_disposal: no
        }
      })
      if (result.length > 0) {
        const cekRes = []
        for (let i = 0; i < result.length; i++) {
          const findId = await disposal.findByPk(result[i].id)
          if (findId) {
            const data = {
              status_reject: null,
              isreject: null,
              status_form: 2,
              pic_purch: fullname,
              date_purch: moment(),
              history: `${findId.history}, submit verifikasi purchasing disposal by ${fullname} at ${moment().format('DD/MM/YYYY h:mm:ss a')}`
            }
            const updateDis = await findId.update(data)
            if (updateDis) {
              cekRes.push(updateDis)
            }
          }
        }
        if (cekRes.length > 0) {
          return response(res, 'success submit verifikasi purchasing disposal')
        } else {
          return response(res, 'failed submit disposal', {}, 400, false)
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
  },
  getDocumentPurch: async (req, res) => {
    try {
      const result = await disposal.findAll({
        where: {
          [Op.or]: [
            { status_reject: 2 },
            { status_reject: 3 }
          ],
          [Op.not]: [
            { isreject: 2 },
            { isreject: null },
            { isreject: 0 }
          ]
        },
        order: [
          ['id', 'DESC'],
          [{ model: ttd, as: 'appForm' }, 'id', 'DESC'],
          [{ model: ttd, as: 'ttdSet' }, 'id', 'DESC']
        ],
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
          },
          {
            model: docUser,
            as: 'docAsset'
          }
        ]
      })
      if (result) {
        return response(res, 'success', { result: { rows: result, count: result.length } })
      } else {
        return response(res, 'success', { result: { rows: result, count: result.length } })
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  submitEditDis: async (req, res) => {
    try {
      const no = req.params.no
      const { id } = req.query
      const level = req.user.level
      const resdis = await disposal.findByPk(id)
      if (resdis) {
        const resdok = await docUser.findAll({
          where: {
            [Op.and]: [
              { no_pengadaan: resdis.id },
              { no_asset: resdis.no_asset },
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
        if (resdok.length > 0) {
          const cekdok = []
          for (let i = 0; i < resdok.length; i++) {
            if (resdok[i].divisi === '0' || resdok[i].status === 0) {
              cekdok.push(1)
            }
          }
          if (cekdok.length > 0) {
            const data = {
              status_reject: level === 6 ? 1 : 2
            }
            const updis = await resdis.update(data)
            if (updis) {
              return response(res, 'succes submit edit disposal')
            } else {
              return response(res, 'failed submit edit disposal1', {}, 404, false)
            }
          } else {
            const data = {
              isreject: 2
            }
            const updis = await resdis.update(data)
            if (updis) {
              const findDis = await disposal.findAll({
                where: {
                  no_disposal: no
                }
              })
              if (findDis.length > 0) {
                const cek = []
                for (let i = 0; i < findDis.length; i++) {
                  if (findDis[i].isreject === 2 || findDis[i].isreject === null) {
                    cek.push(1)
                  }
                }
                if (cek.length === findDis.length) {
                  const valid = []
                  for (let i = 0; i < findDis.length; i++) {
                    const cekDis = await disposal.findByPk(findDis[i].id)
                    if (cekDis) {
                      const data = {
                        status_reject: 4
                      }
                      await cekDis.update(data)
                      valid.push(1)
                    }
                  }
                  if (valid.length > 0) {
                    return response(res, 'succes submit edit disposal')
                  } else {
                    return response(res, 'succes submit edit disposal')
                  }
                } else {
                  return response(res, 'succes submit edit disposal')
                }
              } else {
                return response(res, 'failed submit edit disposal2', {}, 404, false)
              }
            } else {
              return response(res, 'failed submit edit disposal3', {}, 404, false)
            }
          }
        } else {
          return response(res, 'failed submit edit disposal4', { resdok }, 404, false)
        }
      } else {
        return response(res, 'failed submit edit disposal5', {}, 404, false)
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  rejectEks: async (req, res) => {
    try {
      const { id } = req.query
      const { reason } = req.body
      const resdis = await disposal.findByPk(id)
      if (resdis) {
        const data = {
          isreject: 1,
          status_reject: 5,
          reason: reason
        }
        const updis = await resdis.update(data)
        if (updis) {
          const findEmail = await depo.findOne({
            where: {
              kode_plant: resdis.kode_plant
            }
          })
          if (findEmail) {
            const data = {
              kode_plant: resdis.kode_plant,
              jenis: 'disposal',
              no_proses: `D${resdis.no_disposal}`,
              list_appr: resdis.kode_plant,
              keterangan: 'reject eksekusi',
              response: 'reject',
              status: null,
              route: 'editeks'
            }
            const tableTd = `
            <tr>
              <td>1</td>
              <td>D${resdis.no_disposal}</td>
              <td>${resdis.no_asset}</td>
              <td>${resdis.nama_asset}</td>
              <td>${resdis.cost_center}</td>
              <td>${resdis.area}</td>
            </tr>`
            // const ccIt = [findEmail.email_am, findEmail.email_aam, findEmail.email_spv_asset, findEmail.email_staff_asset1, findEmail.email_staff_asset2, findEmail.email_nom, findEmail.email_bm, findEmail.email_area_om, findEmail.email_it_spv, findEmail.email_ism, findEmail.email_staff_it, findEmail.email_ga_spv, findEmail.email_staff_ga]
            // const cc = [findEmail.email_am, findEmail.email_aam, findEmail.email_spv_asset, findEmail.email_staff_asset1, findEmail.email_staff_asset2, findEmail.email_nom, findEmail.email_bm, findEmail.email_area_om, findEmail.email_ga_spv, findEmail.email_staff_ga]
            const findNotif = await notif.findOne({
              where: {
                kode_plant: resdis.kode_plant,
                jenis: 'disposal',
                no_proses: `D${resdis.no_disposal}`,
                list_appr: resdis.kode_plant,
                keterangan: 'reject eksekusi',
                response: 'reject'
              }
            })
            if (findNotif) {
              if (findNotif.status === null) {
                return response(res, 'success reject eksekusi')
              } else {
                await findNotif.update(data)
                const mailOptions = {
                  from: 'noreply_asset@pinusmerahabadi.co.id',
                  replyTo: 'noreply_asset@pinusmerahabadi.co.id',
                  // to: `${findEmail.email_area_aos}`,
                  to: `${emailAss}, ${emailAss2}`,
                  // cc: findDis.kategori === 'it' || findDis.kategori === 'IT' ? `${ccIt}` : `${cc}`,
                  subject: `REJECT KELENGKAPAN EKSEKUSI DISPOSAL ASSET ${resdis.area} `,
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
                          Dear Bapak/Ibu,
                      </div>
                      <div class="tittle mar1">
                          <div>Lampiran  eksekusi disposal asset telah direject dengan alasan sebagai berikut:</div>
                          <div>Alasan reject: ${reason}</div>
                          <div>Direject oleh:  Team Asset</div>
                      </div>
                      <div class="position mar1">
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
                      <div class="tittle">Mohon agar melengkapi/memperbaiki kelengkapan eksekusi disposal untuk dapat diproses lebih lanjut.</div>
                      <a href="http://aset.pinusmerahabadi.co.id/">Klik link berikut untuk akses web asset</a>
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
                  return response(res, 'success reject eksekusi', { sendEmail })
                } else {
                  return response(res, 'berhasil reject eksekusi, tidak berhasil kirim notif email 1')
                }
              }
            } else {
              await notif.create(data)
              const mailOptions = {
                from: 'noreply_asset@pinusmerahabadi.co.id',
                replyTo: 'noreply_asset@pinusmerahabadi.co.id',
                // to: `${findEmail.email_area_aos}`,
                to: `${emailAss}, ${emailAss2}`,
                // cc: findDis.kategori === 'it' || findDis.kategori === 'IT' ? `${ccIt}` : `${cc}`,
                subject: `REJECT KELENGKAPAN EKSEKUSI DISPOSAL ASSET ${resdis.area} `,
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
                        Dear Bapak/Ibu,
                    </div>
                    <div class="tittle mar1">
                        <div>Lampiran  eksekusi disposal asset telah direject dengan alasan sebagai berikut:</div>
                        <div>Alasan reject: ${reason}</div>
                        <div>Direject oleh:  Team Asset</div>
                    </div>
                    <div class="position mar1">
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
                    <div class="tittle">Mohon agar melengkapi/memperbaiki kelengkapan eksekusi disposal untuk dapat diproses lebih lanjut.</div>
                    <a href="http://aset.pinusmerahabadi.co.id/">Klik link berikut untuk akses web asset</a>
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
                return response(res, 'success reject eksekusi', { sendEmail })
              } else {
                return response(res, 'berhasil reject eksekusi, tidak berhasil kirim notif email 1')
              }
            }
          } else {
            return response(res, 'success reject eksekusi failed create notif and send email')
          }
        } else {
          return response(res, 'failed reject eksekusi', {}, 404, false)
        }
      } else {
        return response(res, 'failed reject eksekusi', {}, 404, false)
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  submitEditEks: async (req, res) => {
    try {
      const { id } = req.query
      const resdis = await disposal.findByPk(id)
      if (resdis) {
        const data = {
          isreject: 2,
          status_reject: 6
        }
        const updis = await resdis.update(data)
        if (updis) {
          const findUser = await user.findOne({
            where: {
              user_level: 2
            }
          })
          if (findUser) {
            const findEmail = await email.findOne({
              where: {
                kode_plant: resdis.kode_plant
              }
            })
            if (findEmail) {
              const data = {
                kode_plant: resdis.kode_plant,
                jenis: 'disposal',
                no_proses: `D${resdis.no_disposal}`,
                list_appr: findUser.username,
                keterangan: 'revisi eksekusi',
                response: 'revisi',
                route: 'eksdis'
              }
              const tableTd = `
              <tr>
                <td>1</td>
                <td>D${resdis.no_disposal}</td>
                <td>${resdis.no_asset}</td>
                <td>${resdis.nama_asset}</td>
                <td>${resdis.cost_center}</td>
                <td>${resdis.area}</td>
              </tr>`
              // const ccIt = [findEmail.email_am, findEmail.email_aam, findEmail.email_spv_asset, findEmail.email_staff_asset1, findEmail.email_staff_asset2, findEmail.email_nom, findEmail.email_bm, findEmail.email_area_om, findEmail.email_it_spv, findEmail.email_ism, findEmail.email_staff_it, findEmail.email_ga_spv, findEmail.email_staff_ga]
              // const cc = [findEmail.email_am, findEmail.email_aam, findEmail.email_spv_asset, findEmail.email_staff_asset1, findEmail.email_staff_asset2, findEmail.email_nom, findEmail.email_bm, findEmail.email_area_om, findEmail.email_ga_spv, findEmail.email_staff_ga]
              const findNotif = await notif.findOne({
                where: {
                  kode_plant: resdis.kode_plant,
                  jenis: 'disposal',
                  no_proses: `D${resdis.no_disposal}`,
                  list_appr: findUser.username,
                  keterangan: 'revisi eksekusi',
                  response: 'revisi'
                }
              })
              if (findNotif) {
                if (findNotif.status === null) {
                  return response(res, 'success submit reject eksekusi')
                } else {
                  await findNotif.update(data)
                  const mailOptions = {
                    from: 'noreply_asset@pinusmerahabadi.co.id',
                    replyTo: 'noreply_asset@pinusmerahabadi.co.id',
                    // to: `${findEmail.email_staff_asset1}, ${findEmail.email_staff_asset2}`,
                    to: `${emailAss}, ${emailAss2}`,
                    // cc: findDis.kategori === 'it' || findDis.kategori === 'IT' ? `${ccIt}` : `${cc}`,
                    subject: `REVISI KELENGKAPAN EKSEKUSI DISPOSAL ASSET ${resdis.area} `,
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
                          Dear Team Asset,
                      </div>
                      <div class="tittle mar1">
                          <div>Mohon untuk cek hasil revisi lampiran eksekusi disposal asset dibawah ini:</div>
                      </div>
                      <div class="position mar1">
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
                      <a href="http://aset.pinusmerahabadi.co.id/">Klik link berikut untuk akses web asset</a>
                      <div class="tittle foot">
                          Terima kasih,
                      </div>
                      <div class="tittle foot1">
                          Regards,
                      </div>
                      <div class="tittle">
                          Area
                      </div>
                  </body>
                  `
                  }
                  const sendEmail = await wrapMail.wrapedSendMail(mailOptions)
                  if (sendEmail) {
                    return response(res, 'success submit disposal', { sendEmail })
                  } else {
                    return response(res, 'berhasil submit disposal, tidak berhasil kirim notif email 1')
                  }
                }
              } else {
                await notif.create(data)
                const mailOptions = {
                  from: 'noreply_asset@pinusmerahabadi.co.id',
                  replyTo: 'noreply_asset@pinusmerahabadi.co.id',
                  // to: `${findEmail.email_staff_asset1}, ${findEmail.email_staff_asset2}`,
                  to: `${emailAss}, ${emailAss2}`,
                  // cc: findDis.kategori === 'it' || findDis.kategori === 'IT' ? `${ccIt}` : `${cc}`,
                  subject: `REVISI KELENGKAPAN EKSEKUSI DISPOSAL ASSET ${resdis.area} `,
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
                        Dear Team Asset,
                    </div>
                    <div class="tittle mar1">
                        <div>Mohon untuk cek hasil revisi lampiran eksekusi disposal asset dibawah ini:</div>
                    </div>
                    <div class="position mar1">
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
                    <a href="http://aset.pinusmerahabadi.co.id/">Klik link berikut untuk akses web asset</a>
                    <div class="tittle foot">
                        Terima kasih,
                    </div>
                    <div class="tittle foot1">
                        Regards,
                    </div>
                    <div class="tittle">
                        Area
                    </div>
                </body>
                `
                }
                const sendEmail = await wrapMail.wrapedSendMail(mailOptions)
                if (sendEmail) {
                  return response(res, 'success submit disposal', { sendEmail })
                } else {
                  return response(res, 'berhasil submit disposal, tidak berhasil kirim notif email 1')
                }
              }
            } else {
              return response(res, 'success submit reject eksekusi failed send email and notif')
            }
          } else {
            return response(res, 'success submit reject eksekusi failed send email and notif')
          }
        } else {
          return response(res, 'failed submit reject eksekusi', {}, 404, false)
        }
      } else {
        return response(res, 'failed submit reject eksekusi', {}, 404, false)
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  }
}
