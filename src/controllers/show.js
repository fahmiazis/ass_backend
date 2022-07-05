const { docUser, pengadaan } = require('../models')
const response = require('../helpers/response')
const axios = require('axios')
const https = require('https')
const fs = require('fs')

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
        if (no === null) {
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
            if (arr.length >= 2) {
              const url = 'https://devpods.pinusmerahabadi.co.id' + arr[1]
              const ext = result.path.split('.')[result.path.split('.').length - 1]
              const name = new Date().getTime().toString().concat('.').concat(ext)
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
              const name = new Date().getTime().toString().concat('.').concat(ext)
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
      const findAset = await axios.get('http://10.3.212.38:8000/sap/bc/zast/?sap-client=300&pgmna=zfir0090&p_anln1=4200000002&p_bukrs=pp01&p_gjahr=2021&p_monat=06')
      console.log(findAset.status)
      if (findAset.status === 200) {
        return response(res, 'success get api', { data: findAset.data })
      } else {
        return response(res, 'failed get api', {}, 404, false)
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  }
}
