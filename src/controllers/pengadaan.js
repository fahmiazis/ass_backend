const { approve, ttd, depo, pengadaan, asset, document, docUser } = require('../models')
const joi = require('joi')
const response = require('../helpers/response')
const { Op } = require('sequelize')
// const { pagination } = require('../helpers/pagination')
// const moment = require('moment')
const multer = require('multer')
const uploadHelper = require('../helpers/upload')

const data = [
  {
    no_asset: '4300002670',
    qty: 1,
    nama: 'Printer Epson L3110 PMA Banyuwangi',
    price: 2200000,
    kode_plant: 'P238',
    kategori: 'budget',
    jenis: 'it',
    createdAt: '2021/05/22',
    no_pengadaan: 'PR3434'
  },
  {
    no_asset: '4300002670',
    qty: 1,
    nama: 'Printer Epson L3110 PMA Banyuwangi',
    price: 2200000,
    kode_plant: 'P311',
    kategori: 'budget',
    jenis: 'it',
    createdAt: '2021/05/23',
    no_pengadaan: 'PR3433'
  }
]

module.exports = {
  home: async (req, res) => {
    try {
      // const level = req.user.level
      const hasil = []
      for (let i = 0; i < data.length; i++) {
        // const now = new Date(moment(data[i].createdAt).format('YYYY-MM-DD'))
        // const tomo = new Date(moment(data[i].createdAt).add(1, 'days').format('YYYY-MM-DD'))
        const result = await pengadaan.findAll({
          where: {
            no_pengadaan: data[i].no_pengadaan
          }
        })
        if (result.length > 0) {
          const dataDepo = await depo.findAll({
            where: {
              kode_plant: data[i].kode_plant
            }
          })
          if (dataDepo) {
            const tampung = [result[0], dataDepo[0]]
            hasil.push(tampung)
          }
        } else {
          const results = await depo.findAll({
            where: {
              kode_plant: data[i].kode_plant
            }
          })
          const getPeng = await pengadaan.findAll()
          if (results) {
            const getAsset = await asset.findAll()
            if (getAsset && getPeng.length === 0) {
              const cekNo = []
              for (let i = 0; i < getAsset.length; i++) {
                cekNo.push(parseInt(getAsset[i].no_doc))
              }
              const send = {
                no_io: '',
                no_doc: Math.max(...cekNo) + 1,
                qty: data[i].qty,
                nama: data[i].nama,
                kode_plant: data[i].kode_plant,
                kategori: data[i].kategori,
                jenis: data[i].jenis,
                price: data[i].price,
                no_pengadaan: data[i].no_pengadaan
              }
              const make = await pengadaan.create(send)
              if (make) {
                const tampung = [make, results[0]]
                hasil.push(tampung)
              }
            } else {
              const cekNo = []
              for (let i = 0; i < getPeng.length; i++) {
                cekNo.push(parseInt(getPeng[i].no_doc))
              }
              const send = {
                no_io: '',
                no_doc: Math.max(...cekNo) + 1,
                qty: data[i].qty,
                nama: data[i].nama,
                kode_plant: data[i].kode_plant,
                kategori: data[i].kategori,
                jenis: data[i].jenis,
                price: data[i].price,
                no_pengadaan: data[i].no_pengadaan
              }
              const make = await pengadaan.create(send)
              if (make) {
                const tampung = [make, results[0]]
                hasil.push(tampung)
              }
            }
          }
        }
      }
      if (hasil.length > 0) {
        return response(res, 'success get', { result: hasil })
      } else {
        return response(res, 'failed get data', {}, 404, false)
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  getApproveIo: async (req, res) => {
    try {
      const no = req.params.no
      const result = await ttd.findAll({
        where: {
          no_pengadaan: no
        }
      })
      if (result.length > 0) {
        return response(res, 'success get template approve', { result })
      } else {
        const result = await pengadaan.findAll({
          where: {
            no_pengadaan: no
          }
        })
        if (result) {
          const getApp = await approve.findAll({
            where: {
              [Op.and]: [
                {
                  [Op.or]: [
                    { jenis: result[0].jenis },
                    { jenis: 'all' }
                  ]
                },
                {
                  [Op.or]: [
                    { kategori: result[0].kategori },
                    { kategori: 'all' }
                  ]
                }
              ]
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
                no_pengadaan: no
              }
              const make = await ttd.create(send)
              if (make) {
                hasil.push(make)
              }
            }
            if (hasil.length === getApp.length) {
              return response(res, 'success get template approve', { result: hasil })
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
  getDocumentIo: async (req, res) => {
    try {
      const no = req.params.no
      const result = await docUser.findAll({
        where: {
          [Op.and]: [
            { no_pengadaan: no }
          ]
        }
      })
      if (result.length > 0) {
        return response(res, 'success get document', { result })
      } else {
        const result = await pengadaan.findAll({
          where: {
            no_pengadaan: no
          }
        })
        if (result.length > 0) {
          const getDoc = await document.findAll({
            where: {
              [Op.or]: [
                { jenis_dokumen: result[0].jenis },
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
                jenis_form: 'pengadaan'
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
        } else {
          return response(res, 'failed get data', {}, 404, false)
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
            path: dokumen
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
      const result = await docUser.findByPk(id)
      if (result) {
        const send = {
          status: 3,
          alasan: ''
        }
        const results = await result.update(send)
        return response(res, 'successfully approve dokumen', { result: results })
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
        alasan: joi.string().required()
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
  approveIo: async (req, res) => {
    try {
      const id = req.params.id
      const result = await ttd.findByPk(id)
      if (result) {
        const results = await pengadaan.findAll({
          where: {
            no_pengadaan: result[0].no_pengadaan
          }
        })
        if (results) {
          const findDepo = await depo.findAll({
            where: {
              kode_plant: results[0].kode_plant
            }
          })
          if (findDepo) {
            const send = {
              status: 3
            }
            const approve = await result.update(send)
            if (approve) {
              return response(res, 'successfully approve form io', { result: approve })
            } else {
              return response(res, 'failed approve form io', {}, 404, false)
            }
          } else {
            return response(res, 'failed approve form io', {}, 404, false)
          }
        } else {
          return response(res, 'failed approve form io', {}, 404, false)
        }
      } else {
        return response(res, 'failed approve form io', {}, 404, false)
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  postApi: async (req, res) => {
    try {
      return response(res, 'succcess request api', { result: req.body })
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  }
}
