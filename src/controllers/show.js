const { docUser, pengadaan } = require('../models')
const response = require('../helpers/response')
const axios = require('axios')
const https = require('https')
// const path = require('path')
const fs = require('fs')
const { APP_SAP, APP_CLIENT } = process.env

module.exports = {
  showDokumen: async (req, res) => {
    try {
      const id = req.params.id
      let { no } = req.query
      if (!no) {
        no = null
      }
      const result = await docUser.findByPk(id)
      if (result) {
        if (no === null || no === 'undefined' || no === undefined) {
          const url = result.path
          fs.readFile(url, function (err, data) {
            if (err) {
              console.log(err)
            }
            res.contentType('application/pdf')
            res.send(data)
          })
        } else {
          const findIo = await pengadaan.findOne({
            where: {
              no_pengadaan: no
            }
          })
          if (findIo && findIo.asset_token !== null) {
            const arr = result.path.split('localhost:8000')
            const spl = result.path.split('/')
            const cekPr = result.path.search('printPR')
            if (arr.length >= 2) {
              const url = 'https://devpods.pinusmerahabadi.co.id' + arr[1]
              const ext = result.path.split('.')[result.path.split('.').length - 1]
              const name = new Date().getTime().toString().concat('.').concat(cekPr !== -1 ? 'pdf' : ext)
              const newurl = `assets/documents/${name}`
              const file = fs.createWriteStream(`${newurl}`)
              const down = https.get(url, response => {
                response.pipe(file)
              })
              if (down) {
                const data = {
                  path: newurl
                }
                const upRes = await result.update(data)
                if (upRes) {
                  const find = await docUser.findByPk(id)
                  if (find) {
                    fs.readFile(find.path, function (err, data) {
                      if (err) {
                        console.log(err)
                      }
                      res.contentType('application/pdf')
                      res.send(data)
                    })
                  } else {
                    res.send()
                  }
                } else {
                  res.send()
                }
              } else {
                res.send()
              }
            } else if (spl.length === 3) {
              const url = result.path
              fs.readFile(url, function (err, data) {
                if (err) {
                  console.log(err)
                }
                res.contentType('application/pdf')
                res.send(data)
              })
            } else {
              const ext = result.path.split('.')[result.path.split('.').length - 1]
              const name = new Date().getTime().toString().concat('.').concat(cekPr !== -1 ? 'pdf' : ext)
              const newurl = `assets/documents/${name}`
              const file = fs.createWriteStream(`${newurl}`)
              const down = https.get(result.path, response => {
                response.pipe(file)
              })
              if (down) {
                const data = {
                  path: newurl
                }
                const upRes = await result.update(data)
                console.log('update')
                if (upRes) {
                  const find = await docUser.findByPk(id)
                  console.log('get')
                  if (find) {
                    console.log('send')
                    fs.readFile(find.path, function (err, data) {
                      if (err) {
                        console.log(err)
                      }
                      res.contentType('application/pdf')
                      res.send(data)
                    })
                  } else {
                    res.send()
                  }
                } else {
                  res.send()
                }
              } else {
                res.send()
              }
            }
          } else {
            const url = result.path
            fs.readFile(url, function (err, data) {
              if (err) {
                console.log(err)
              }
              res.contentType('application/pdf')
              res.send(data)
            })
          }
        }
      } else {
        return response(res, "can't show document", {}, 404, false)
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  showApi: async (req, res) => {
    try {
      const findAset = await axios.get(`${APP_SAP}/sap/bc/zast/?sap-client=${APP_CLIENT}&pgmna=zfir0090&p_anln1=4200000002&p_bukrs=pp01&p_gjahr=2021&p_monat=06`)
      console.log(findAset.status)
      if (findAset.status === 200) {
        return response(res, 'success get api', { data: findAset.data })
      } else {
        return response(res, 'failed get api', {}, 404, false)
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  tesDok: async (req, res) => {
    const id = req.params.id
    // const fileUrl = 'https://pods.pinusmerahabadi.co.id/storage/attachments/ticketing/barangjasa/P01-LPG1-2609240303/item9011/files/Armada_Aset_Penawaran_resmi_dari_2_vendor_(dilengkapi_KTP_dan_NPWP)_Area_LAMPUNG.pdf' // URL file PDF eksternal
    // const tempFilePath = path.join(__dirname, 'temp.pdf') // Path untuk file sementara

    try {
      // Unduh file dari URL eksternal
      const result = await docUser.findByPk(id)
      const fileUrl = result.path
      // const response = await axios.get(fileUrl, { responseType: 'stream' })

      // // Simpan file sementara
      // const writer = fs.createWriteStream(tempFilePath)
      // response.data.pipe(writer)

      // // Tunggu hingga file selesai diunduh
      // writer.on('finish', () => {
      //   // Baca file menggunakan fs.readFile
      //   fs.readFile(tempFilePath, (err, data) => {
      //     if (err) {
      //       console.error(err)
      //       return res.status(500).send('Failed to read the file')
      //     }

      //     // Kirim file ke frontend untuk didownload
      //     res.setHeader('Content-Type', 'application/pdf')
      //     res.setHeader('Content-Disposition', 'attachment; filename="downloaded.pdf"')
      //     res.send(data)

      //     // Hapus file sementara
      //     fs.unlink(tempFilePath, (unlinkErr) => {
      //       if (unlinkErr) console.error('Failed to delete temp file:', unlinkErr)
      //     })
      //   })
      // })

      // writer.on('error', (error) => {
      //   console.error(error)
      //   res.status(500).send('Failed to save the file')
      // })

      const response = await axios.get(fileUrl, {
        responseType: 'arraybuffer'
      })

      res.setHeader('Content-Type', response.headers['content-type'])
      res.setHeader('Content-Disposition', `attachment; filename="${result.nama_dokumen}"`)
      res.send(response.data)
    } catch (error) {
      console.error(error)
      res.status(500).send('Failed to fetch the file')
    }
  }
}
