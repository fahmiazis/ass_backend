const { asset, sequelize, path } = require('../models')
const joi = require('joi')
const { pagination } = require('../helpers/pagination')
const response = require('../helpers/response')
const { Op, QueryTypes } = require('sequelize')
const readXlsxFile = require('read-excel-file/node')
const multer = require('multer')
const uploadMaster = require('../helpers/uploadMaster')
const fs = require('fs')
const excel = require('exceljs')
const vs = require('fs-extra')
const { APP_URL } = process.env

module.exports = {
  addAsset: async (req, res) => {
    try {
      const level = req.user.level
      const schema = joi.object({
        no_doc: joi.string().required(),
        tanggal: joi.string().required(),
        no_asset: joi.string().required(),
        nama_asset: joi.string().required(),
        area: joi.string().required(),
        keterangan: joi.string().required(),
        kode_plant: joi.string().required()
      })
      const { value: results, error } = schema.validate(req.body)
      if (error) {
        return response(res, 'Error', { error: error.message }, 401, false)
      } else {
        if (level === 1) {
          const result = await asset.findAll({
            where: {
              no_asset: results.no_asset
            }
          })
          if (result.length > 0) {
            return response(res, 'kode plant already exist', {}, 400, false)
          } else {
            const result = await asset.create(results)
            if (result) {
              return response(res, 'successfully add asset', { result })
            } else {
              return response(res, 'failed to add asset', {}, 400, false)
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
  getAsset: async (req, res) => {
    try {
      const level = req.user.level
      const kode = req.user.kode
      let { limit, page, search, sort, tipe } = req.query
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
      if (!tipe) {
        tipe = 'all'
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
      if (level === 1) {
        const result = await asset.findAndCountAll({
          where: {
            [Op.or]: [
              { no_doc: { [Op.like]: `%${searchValue}%` } },
              { tanggal: { [Op.like]: `%${searchValue}%` } },
              { no_asset: { [Op.like]: `%${searchValue}%` } },
              { area: { [Op.like]: `%${searchValue}%` } },
              { kode_plant: { [Op.like]: `%${searchValue}%` } },
              { nama_asset: { [Op.like]: `%${searchValue}%` } },
              { keterangan: { [Op.like]: `%${searchValue}%` } },
              { status_fisik: { [Op.like]: `%${searchValue}%` } },
              { grouping: { [Op.like]: `%${searchValue}%` } },
              { kondisi: { [Op.like]: `%${searchValue}%` } },
              { lokasi: { [Op.like]: `%${searchValue}%` } }
            ]
          },
          order: [[sortValue, 'ASC']],
          limit: limit,
          offset: (page - 1) * limit
        })
        const pageInfo = pagination('/asset/get', req.query, page, limit, result.count)
        if (result) {
          return response(res, 'list asset', { result, pageInfo })
        } else {
          return response(res, 'failed to get user', {}, 404, false)
        }
      } else if (level === 5) {
        const result = await asset.findAndCountAll({
          where: {
            kode_plant: kode,
            [Op.or]: [
              { status: null },
              { status: tipe === 'mutasi' ? '11' : tipe === 'disposal' ? '1' : tipe === 'asset' ? '1' : null },
              { status: tipe === 'mutasi' ? '11' : tipe === 'disposal' ? '1' : tipe === 'asset' ? '11' : null }
            ]
          },
          include: [
            {
              model: path,
              as: 'pict'
            }
          ],
          order: [[sortValue, 'ASC']],
          limit: limit,
          offset: (page - 1) * limit
        })
        const pageInfo = pagination('/asset/get', req.query, page, limit, result.count)
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
  updateAsset: async (req, res) => {
    try {
      // const level = req.user.level
      const id = req.params.id
      const schema = joi.object({
        // area: joi.string(),
        // tanggal: joi.string(),
        // no_doc: joi.string(),
        // no_asset: joi.string(),
        // nama_asset: joi.string(),
        // kode_plant: joi.string(),
        keterangan: joi.string().allow(''),
        deskripsi: joi.string().allow(''),
        nilai_buku: joi.string().allow(''),
        merk: joi.string().allow(''),
        satuan: joi.string().allow(''),
        unit: joi.string().allow(''),
        kondisi: joi.string().allow(''),
        lokasi: joi.string().allow(''),
        grouping: joi.string().allow(''),
        status_fisik: joi.string().allow('')
      })
      const { value: results, error } = schema.validate(req.body)
      if (error) {
        return response(res, 'Error', { error: error.message }, 401, false)
      } else {
        if (results.no_asset) {
          const result = await asset.findAll({
            where:
                {
                  no_asset: results.no_asset,
                  [Op.not]: { id: id }
                }
          })
          if (result.length > 0) {
            return response(res, 'no asset already use', {}, 400, false)
          } else {
            const result = await asset.findByPk(id)
            if (result) {
              await result.update(results)
              return response(res, 'successfully update asset', { result })
            } else {
              return response(res, 'failed update asset', {}, 404, false)
            }
          }
        } else {
          const result = await asset.findByPk(id)
          if (result) {
            await result.update(results)
            return response(res, 'successfully update asset', { result })
          } else {
            return response(res, 'failed update asset', {}, 404, false)
          }
        }
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  deleteAsset: async (req, res) => {
    try {
      const level = req.user.level
      const id = req.params.id
      if (level === 1) {
        const result = await asset.findByPk(id)
        if (result) {
          await result.destroy()
          return response(res, 'successfully delete asset', { result })
        } else {
          return response(res, 'failed to delete asset', {}, 404, false)
        }
      } else {
        return response(res, "you're not super administrator", {}, 400, false)
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  uploadMasterAsset: async (req, res) => {
    const level = req.user.level
    if (level === 1) {
      uploadMaster(req, res, async function (err) {
        // try {
        if (err instanceof multer.MulterError) {
          if (err.code === 'LIMIT_UNEXPECTED_FILE' && req.files.length === 0) {
            console.log(err.code === 'LIMIT_UNEXPECTED_FILE' && req.files.length > 0)
            return response(res, 'fieldname doesnt match', {}, 500, false)
          }
          return response(res, err.message, {}, 500, false)
        } else if (err) {
          return response(res, err.message, {}, 401, false)
        }
        const dokumen = `assets/masters/${req.files[0].filename}`
        const rows = await readXlsxFile(dokumen)
        const count = []
        const cek = ['Asset', 'SNo.', 'Cap.Date', 'Asset Description', 'Acquis.val.', 'Accum.dep.', 'Book val.', 'Plant', 'Cost Ctr', 'Cost Ctr Name', 'Merk', 'SATUAN', 'JUMLAH', 'LOKASI', 'KATEGORI']
        const valid = rows[0]
        for (let i = 0; i < cek.length; i++) {
          console.log(valid[i] === cek[i])
          if (valid[i] === cek[i]) {
            count.push(1)
          }
        }
        if (count.length === cek.length) {
          const plant = []
          const kode = []
          for (let i = 1; i < rows.length; i++) {
            const a = rows[i]
            if (a[0] !== null) {
              plant.push(`No Aset ${a[0]}`)
              kode.push(`${a[0]}`)
            }
          }
          const object = {}
          const result = []

          plant.forEach(item => {
            if (!object[item]) { object[item] = 0 }
            object[item] += 1
          })

          for (const prop in object) {
            if (object[prop] >= 2) {
              result.push(prop)
            }
          }
          if (result.length > 0) {
            return response(res, 'there is duplication in your file master', { result }, 404, false)
          } else {
            const arr = []
            rows.shift()
            for (let i = 0; i < rows.length; i++) {
              const select = await sequelize.query(`SELECT no_asset from assets WHERE no_asset='${rows[i][0]}'`, {
                type: QueryTypes.SELECT
              })
              const send = {
                no_doc: rows[i][1],
                tanggal: rows[i][2],
                no_asset: rows[i][0],
                nama_asset: rows[i][3],
                area: rows[i][9],
                kode_plant: rows[i][7],
                nilai_buku: rows[i][6],
                nilai_acquis: rows[i][4],
                accum_dep: rows[i][5],
                merk: rows[i][10],
                satuan: rows[i][11],
                unit: rows[i][12],
                lokasi: rows[i][13],
                kategori: rows[i][14]
              }
              if (select.length > 0) {
                const updateAsset = await asset.update(send, {
                  where: {
                    no_asset: rows[i][0]
                  }
                })
                // const updateAsset = await sequelize.query(`UPDATE assets SET no_doc='${rows[i][1]}', tanggal='${rows[i][2]}', no_asset='${rows[i][0]}', nama_asset='${rows[i][3]}', area='${rows[i][9]}', kode_plant='${rows[i][7]}', nilai_buku='${rows[i][6]}', nilai_acquis='${rows[i][4]}', accum_dep='${rows[i][5]}', merk='${rows[i][10]}', satuan='${rows[i][11]}', unit='${rows[i][12]}', lokasi='${rows[i][13]}', kategori='${rows[i][14]}' WHERE no_asset='${rows[i][0]}'`, {
                //   type: QueryTypes.UPDATE
                // })
                if (updateAsset) {
                  arr.push(select[0])
                }
              } else {
                const createAsset = await asset.create(send)
                if (createAsset) {
                  arr.push(select[0])
                }
              }
            }
            if (arr.length > 0) {
              return response(res, 'success upload asset balance', { rows })
            } else {
              return response(res, 'failed upload asset balance')
            }
            // if (arr.length > 0) {
            //   rows.shift()
            //   const result = await sequelize.query(`INSERT INTO assets (no_doc, tanggal, no_asset, nama_asset, area, kode_plant, keterangan, merk, satuan, unit) VALUES ${rows.map(a => '(?)').join(',')}`,
            //     {
            //       replacements: rows,
            //       type: QueryTypes.INSERT
            //     })
            //   if (result) {
            //     fs.unlink(dokumen, function (err) {
            //       if (err) throw err
            //       console.log('success')
            //     })
            //     return response(res, 'successfully upload file master')
            //   } else {
            //     fs.unlink(dokumen, function (err) {
            //       if (err) throw err
            //       console.log('success')
            //     })
            //     return response(res, 'failed to upload file', {}, 404, false)
            //   }
            // } else {
            //   rows.shift()
            //   const result = await sequelize.query(`INSERT INTO assets (no_doc, tanggal, no_asset, nama_asset, area, kode_plant, keterangan, merk, satuan, unit) VALUES ${rows.map(a => '(?)').join(',')}`,
            //     {
            //       replacements: rows,
            //       type: QueryTypes.INSERT
            //     })
            //   if (result) {
            //     fs.unlink(dokumen, function (err) {
            //       if (err) throw err
            //       console.log('success')
            //     })
            //     return response(res, 'successfully upload file master')
            //   } else {
            //     fs.unlink(dokumen, function (err) {
            //       if (err) throw err
            //       console.log('success')
            //     })
            //     return response(res, 'failed to upload file', {}, 404, false)
            //   }
            // }
          }
        } else {
          fs.unlink(dokumen, function (err) {
            if (err) throw err
            console.log('success')
          })
          return response(res, 'Failed to upload master file, please use the template provided', {}, 400, false)
        }
        // } catch (error) {
        //   return response(res, error.message, {}, 500, false)
        // }
      })
    } else {
      return response(res, "You're not super administrator", {}, 404, false)
    }
  },
  exportSqlAsset: async (req, res) => {
    try {
      const result = await asset.findAll()
      if (result) {
        const workbook = new excel.Workbook()
        const worksheet = workbook.addWorksheet()
        const arr = []
        const header = ['No.Doc', 'Tanggal', 'No Aset', 'Nama Aset', 'Area', 'Keterangan']
        const key = ['no_doc', 'tanggal', 'no_asset', 'nama_asset', 'area', 'keterangan']
        for (let i = 0; i < header.length; i++) {
          let temp = { header: header[i], key: key[i] }
          arr.push(temp)
          temp = {}
        }
        worksheet.columns = arr
        const cek = worksheet.addRows(result)
        if (cek) {
          const name = new Date().getTime().toString().concat('-asset').concat('.xlsx')
          await workbook.xlsx.writeFile(name)
          vs.move(name, `assets/exports/${name}`, function (err) {
            if (err) {
              throw err
            }
            console.log('success')
          })
          return response(res, 'success', { link: `${APP_URL}/download/${name}` })
        } else {
          return response(res, 'failed create file', {}, 404, false)
        }
      } else {
        return response(res, 'failed', {}, 404, false)
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  }
}
