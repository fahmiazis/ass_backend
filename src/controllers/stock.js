const { stock, asset, clossing, ttd, approve, role, user, path, depo, status_stock, docUser, document, notif, email } = require('../models')
const response = require('../helpers/response')
const { Op } = require('sequelize')
const moment = require('moment')
const joi = require('joi')
const { pagination } = require('../helpers/pagination')
const multer = require('multer')
const uploadHelper = require('../helpers/upload')
const wrapMail = require('../helpers/wrapMail')
// const excel = require('exceljs')

module.exports = {
  submit: async (req, res) => {
    try {
      const kode = req.user.kode
      const cost = req.user.name
      const level = req.user.level
      const findArea = await depo.findOne({
        where: {
          kode_plant: level === 5 ? kode : cost
        }
      })
      const findClose = await clossing.findAll({
        where: {
          jenis: 'stock'
        }
      })
      if (findClose.length > 0 && findArea) {
        const time = moment().format('L').split('/')
        const start = findClose[0].start
        const end = findClose[0].end
        if (parseInt(time[1]) > end && parseInt(time[1]) < start) {
          return response(res, 'Belum saatnya atau waktu telah terlewat untuk stock opname', {}, 404, false)
        } else {
          let awal = ''
          let akhir = ''
          if (parseInt(time[1]) >= 1 && parseInt(time[1]) <= findClose[0].end) {
            const next = moment().subtract(1, 'month').format('L').split('/')
            akhir = `${time[2]}-${time[0]}-${findClose[0].end}`
            awal = `${next[2]}-${next[0]}-${findClose[0].start}`
          } else {
            const next = moment().add(1, 'month').format('L').split('/')
            awal = `${time[2]}-${time[0]}-${findClose[0].start}`
            akhir = `${next[2]}-${next[0]}-${findClose[0].end}`
          }
          const findStock = await stock.findOne({
            where: {
              [Op.and]: [
                { kode_plant: level === 5 ? kode : cost },
                {
                  tanggalStock: {
                    [Op.lte]: akhir,
                    [Op.gte]: awal
                  }
                }
              ]
            }
          })
          if (findStock) {
            if (findStock.no_stock !== null) {
              return response(res, 'Telah melakukan pengajuan untuk periode sekarang', {}, 400, false)
            } else {
              const result = await asset.findAll({
                where: {
                  cost_center: level === 5 ? findArea.cost_center : cost,
                  [Op.and]: [
                    { [Op.not]: { satuan: null } },
                    { [Op.not]: { unit: null } },
                    { [Op.not]: { lokasi: null } },
                    { [Op.not]: { grouping: null } },
                    { [Op.not]: { kondisi: null } },
                    { [Op.not]: { status_fisik: null } }
                  ]
                }
              })
              if (result.length > 0) {
                const findAsset = await asset.findAll({
                  where: {
                    cost_center: level === 5 ? findArea.cost_center : cost,
                    [Op.or]: [
                      { status: '1' },
                      { status: '11' },
                      { status: null }
                    ]
                  }
                })
                if (result.length === findAsset.length) {
                  const findPict = await asset.findAll({
                    where: {
                      cost_center: level === 5 ? findArea.cost_center : cost
                    },
                    include: [
                      {
                        model: path,
                        as: 'pict'
                      }
                    ]
                  })
                  if (findPict.length > 0) {
                    const cekImage = []
                    for (let i = 0; i < findPict.length; i++) {
                      const image = findPict[i].pict
                      if (image.length > 0) {
                        const timeIm = moment(image[image.length - 1].createdAt).format('L').split('/')
                        if (parseInt(timeIm[1]) > end && parseInt(timeIm[1]) < start) {
                          console.log(parseInt(timeIm[1]))
                        } else {
                          cekImage.push(1)
                        }
                      }
                    }
                    if (cekImage.length === findPict.length) {
                      const findNo = await stock.findAll({
                        where: {
                          [Op.not]: { no_stock: null }
                        },
                        group: ['no_stock']
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
                            kode_plant: level === 5 ? kode : cost,
                            area: findArea.nama_area,
                            deskripsi: result[i].nama_asset,
                            no_asset: result[i].no_asset,
                            merk: result[i].merk,
                            satuan: result[i].satuan,
                            unit: result[i].unit,
                            kondisi: result[i].kondisi,
                            lokasi: result[i].lokasi,
                            grouping: result[i].grouping,
                            keterangan: result[i].keterangan,
                            status_fisik: result[i].status_fisik,
                            tanggalStock: moment().format('L'),
                            status_form: 1
                          }
                          const send = await stock.create(data)
                          if (send) {
                            hasil.push('1')
                          }
                        }
                        if (hasil.length === result.length) {
                          const findNo = await stock.findAll({
                            where: {
                              [Op.and]: [
                                { kode_plant: level === 5 ? kode : cost },
                                {
                                  tanggalStock: {
                                    [Op.lte]: akhir,
                                    [Op.gte]: awal
                                  }
                                }
                              ]
                            }
                          })
                          if (findNo) {
                            const cek = []
                            for (let i = 0; i < findNo.length; i++) {
                              const data = {
                                no_stock: 'O' + noDis,
                                status_form: 1
                              }
                              const result = await stock.findByPk(findNo[i].id)
                              if (result) {
                                await result.update(data)
                                cek.push('1')
                              }
                            }
                            if (cek.length > 0) {
                              for (let i = 0; i < findAsset.length; i++) {
                                const data = {
                                  status_fisik: null,
                                  keterangan: null,
                                  kondisi: null,
                                  grouping: null
                                }
                                const result = await asset.findByPk(findAsset[i].id)
                                if (result) {
                                  await result.update(data)
                                }
                              }
                              const findDepo = await depo.findOne({
                                where: {
                                  kode_plant: level === 5 ? kode : cost
                                }
                              })
                              if (findDepo) {
                                const findRom = await user.findOne({
                                  where: {
                                    fullname: findDepo.nama_om
                                  }
                                })
                                if (findRom) {
                                  const data = {
                                    kode_plant: level === 5 ? kode : cost,
                                    jenis: 'stock opname',
                                    no_proses: `O${noDis}`,
                                    list_appr: findRom.username,
                                    keterangan: 'pengajuan',
                                    response: 'request'
                                  }
                                  const createNotif = await notif.create(data)
                                  if (createNotif) {
                                    const mailOptions = {
                                      from: 'noreply_asset@pinusmerahabadi.co.id',
                                      replyTo: 'noreply_asset@pinusmerahabadi.co.id',
                                      to: `${findRom.email}`,
                                      subject: `Approve Pengajuan Stock Opname O${noDis} (TESTING)`,
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
                                            Dear Bapak/Ibu ROM,
                                        </div>
                                        <div class="tittle mar1">
                                            <div>Mohon untuk approve pengajuan stock opname area ${findDepo.nama_area} dengan nomor opname O${noDis}.</div>
                                        </div>
                                        <div class="position">
                                        </div>
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
                                      return response(res, 'success submit stock opname')
                                    } else {
                                      return response(res, 'berhasil approve mutasi, tidak berhasil kirim notif email 1')
                                    }
                                  } else {
                                    return response(res, 'berhasil approve mutasi, tidak berhasil kirim notif email 1')
                                  }
                                } else {
                                  return response(res, 'berhasil approve mutasi, tidak berhasil kirim notif email 1')
                                }
                              } else {
                                return response(res, 'berhasil approve mutasi, tidak berhasil kirim notif email 1')
                              }
                            } else {
                              return response(res, 'failed submit stock opname', {}, 400, false)
                            }
                          } else {
                            return response(res, 'failed submit stock opname', {}, 400, false)
                          }
                        } else {
                          return response(res, 'failed submit stock opname', {}, 400, false)
                        }
                      } else {
                        const cekNo = [0]
                        const noDis = Math.max(...cekNo) + 1
                        const hasil = []
                        for (let i = 0; i < result.length; i++) {
                          const data = {
                            kode_plant: level === 5 ? kode : cost,
                            area: findArea.nama_area,
                            deskripsi: result[i].nama_asset,
                            no_asset: result[i].no_asset,
                            merk: result[i].merk,
                            satuan: result[i].satuan,
                            unit: result[i].unit,
                            kondisi: result[i].kondisi,
                            lokasi: result[i].lokasi,
                            grouping: result[i].grouping,
                            keterangan: result[i].keterangan,
                            status_fisik: result[i].status_fisik,
                            tanggalStock: moment().format('L'),
                            status_form: 1
                          }
                          const send = await stock.create(data)
                          if (send) {
                            hasil.push('1')
                          }
                        }
                        if (hasil.length === result.length) {
                          const findNo = await stock.findAll({
                            where: {
                              [Op.and]: [
                                { kode_plant: level === 5 ? kode : cost },
                                {
                                  tanggalStock: {
                                    [Op.lte]: akhir,
                                    [Op.gte]: awal
                                  }
                                }
                              ]
                            }
                          })
                          if (findNo) {
                            const cek = []
                            for (let i = 0; i < findNo.length; i++) {
                              const data = {
                                no_stock: 'O' + noDis,
                                status_form: 1
                              }
                              const result = await stock.findByPk(findNo[i].id)
                              if (result) {
                                await result.update(data)
                                cek.push('1')
                              }
                            }
                            if (cek.length > 0) {
                              for (let i = 0; i < findAsset.length; i++) {
                                const data = {
                                  status_fisik: null,
                                  keterangan: null,
                                  kondisi: null,
                                  grouping: null
                                }
                                const result = await asset.findByPk(findAsset[i].id)
                                if (result) {
                                  await result.update(data)
                                }
                              }
                              const findDepo = await depo.findOne({
                                where: {
                                  kode_plant: level === 5 ? kode : cost
                                }
                              })
                              if (findDepo) {
                                const findRom = await user.findOne({
                                  where: {
                                    fullname: findDepo.nama_om
                                  }
                                })
                                if (findRom) {
                                  const data = {
                                    kode_plant: level === 5 ? kode : cost,
                                    jenis: 'stock opname',
                                    no_proses: `O${noDis}`,
                                    list_appr: findRom.username,
                                    keterangan: 'pengajuan',
                                    response: 'request'
                                  }
                                  const createNotif = await notif.create(data)
                                  if (createNotif) {
                                    const mailOptions = {
                                      from: 'noreply_asset@pinusmerahabadi.co.id',
                                      replyTo: 'noreply_asset@pinusmerahabadi.co.id',
                                      to: `${findRom.email}`,
                                      subject: `Approve Pengajuan Stock Opname O${noDis} (TESTING)`,
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
                                            Dear Bapak/Ibu ROM,
                                        </div>
                                        <div class="tittle mar1">
                                            <div>Mohon untuk approve pengajuan stock opname area ${findDepo.nama_area} dengan nomor opname O${noDis}.</div>
                                        </div>
                                        <div class="position">
                                        </div>
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
                                      return response(res, 'success submit stock opname')
                                    } else {
                                      return response(res, 'berhasil approve mutasi, tidak berhasil kirim notif email 1')
                                    }
                                  } else {
                                    return response(res, 'berhasil approve mutasi, tidak berhasil kirim notif email 1')
                                  }
                                } else {
                                  return response(res, 'berhasil approve mutasi, tidak berhasil kirim notif email 1')
                                }
                              } else {
                                return response(res, 'berhasil approve mutasi, tidak berhasil kirim notif email 1')
                              }
                            } else {
                              return response(res, 'failed submit stock opname', {}, 400, false)
                            }
                          } else {
                            return response(res, 'failed submit stock opname', {}, 400, false)
                          }
                        } else {
                          return response(res, 'failed submit stock opname', {}, 400, false)
                        }
                      }
                    } else {
                      return response(res, 'upload gambar asset terbaru terlebih dahulu', { img: cekImage.length, asset: findPict.length }, 400, false)
                    }
                  } else {
                    return response(res, 'upload gambar asset terbaru terlebih dahulu', {}, 400, false)
                  }
                } else {
                  return response(res, 'Pastikan lokasi, status fisik, kondisi, dan status asset telah terisi', { result: result.length, findaset: findAsset.length }, 400, false)
                }
              } else {
                return response(res, 'Pastikan lokasi, status fisik, kondisi, dan status asset telah terisi', { result: result.length }, 400, false)
              }
            }
          } else {
            const result = await asset.findAll({
              where: {
                cost_center: level === 5 ? findArea.cost_center : cost,
                [Op.and]: [
                  { [Op.not]: { satuan: null } },
                  { [Op.not]: { unit: null } },
                  { [Op.not]: { lokasi: null } },
                  { [Op.not]: { grouping: null } },
                  { [Op.not]: { kondisi: null } },
                  { [Op.not]: { status_fisik: null } }
                ]
              }
            })
            if (result.length > 0) {
              const findAsset = await asset.findAll({
                where: {
                  cost_center: level === 5 ? findArea.cost_center : cost,
                  [Op.or]: [
                    { status: '1' },
                    { status: '11' },
                    { status: null }
                  ]
                }
              })
              if (result.length === findAsset.length) {
                const findPict = await asset.findAll({
                  where: {
                    cost_center: level === 5 ? findArea.cost_center : cost
                  },
                  include: [
                    {
                      model: path,
                      as: 'pict'
                    }
                  ]
                })
                if (findPict.length > 0) {
                  const cekImage = []
                  for (let i = 0; i < findPict.length; i++) {
                    const image = findPict[i].pict
                    if (image.length > 0) {
                      const timeIm = moment(image[image.length - 1].createdAt).format('L').split('/')
                      if (parseInt(timeIm[1]) > end && parseInt(timeIm[1]) < start) {
                        console.log(parseInt(timeIm[1]))
                      } else {
                        cekImage.push(1)
                      }
                    }
                  }
                  if (cekImage.length === findPict.length) {
                    const findNo = await stock.findAll({
                      where: {
                        [Op.not]: { no_stock: null }
                      },
                      group: ['no_stock']
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
                          kode_plant: level === 5 ? kode : cost,
                          area: findArea.nama_area,
                          deskripsi: result[i].nama_asset,
                          no_asset: result[i].no_asset,
                          merk: result[i].merk,
                          satuan: result[i].satuan,
                          unit: result[i].unit,
                          kondisi: result[i].kondisi,
                          lokasi: result[i].lokasi,
                          grouping: result[i].grouping,
                          keterangan: result[i].keterangan,
                          status_fisik: result[i].status_fisik,
                          tanggalStock: moment().format('L'),
                          status_form: 1
                        }
                        const send = await stock.create(data)
                        if (send) {
                          hasil.push('1')
                        }
                      }
                      if (hasil.length === result.length) {
                        const findNo = await stock.findAll({
                          where: {
                            [Op.and]: [
                              { kode_plant: level === 5 ? kode : cost },
                              {
                                tanggalStock: {
                                  [Op.lte]: akhir,
                                  [Op.gte]: awal
                                }
                              }
                            ]
                          }
                        })
                        if (findNo) {
                          const cek = []
                          for (let i = 0; i < findNo.length; i++) {
                            const data = {
                              no_stock: 'O' + noDis
                            }
                            const result = await stock.findByPk(findNo[i].id)
                            if (result) {
                              await result.update(data)
                              cek.push('1')
                            }
                          }
                          if (cek.length > 0) {
                            for (let i = 0; i < findAsset.length; i++) {
                              const data = {
                                status_fisik: null,
                                keterangan: null,
                                kondisi: null,
                                grouping: null
                              }
                              const result = await asset.findByPk(findAsset[i].id)
                              if (result) {
                                await result.update(data)
                              }
                            }
                            const findDepo = await depo.findOne({
                              where: {
                                kode_plant: level === 5 ? kode : cost
                              }
                            })
                            if (findDepo) {
                              const findRom = await user.findOne({
                                where: {
                                  fullname: findDepo.nama_om
                                }
                              })
                              if (findRom) {
                                const data = {
                                  kode_plant: level === 5 ? kode : cost,
                                  jenis: 'stock opname',
                                  no_proses: `O${noDis}`,
                                  list_appr: findRom.username,
                                  keterangan: 'pengajuan',
                                  response: 'request'
                                }
                                const createNotif = await notif.create(data)
                                if (createNotif) {
                                  const mailOptions = {
                                    from: 'noreply_asset@pinusmerahabadi.co.id',
                                    replyTo: 'noreply_asset@pinusmerahabadi.co.id',
                                    to: `${findRom.email}`,
                                    subject: `Approve Pengajuan Stock Opname O${noDis} (TESTING)`,
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
                                          Dear Bapak/Ibu ROM,
                                      </div>
                                      <div class="tittle mar1">
                                          <div>Mohon untuk approve pengajuan stock opname area ${findDepo.nama_area} dengan nomor opname O${noDis}.</div>
                                      </div>
                                      <div class="position">
                                      </div>
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
                                    return response(res, 'success submit stock opname')
                                  } else {
                                    return response(res, 'berhasil approve mutasi, tidak berhasil kirim notif email 1')
                                  }
                                } else {
                                  return response(res, 'berhasil approve mutasi, tidak berhasil kirim notif email 1')
                                }
                              } else {
                                return response(res, 'berhasil approve mutasi, tidak berhasil kirim notif email 1')
                              }
                            } else {
                              return response(res, 'berhasil approve mutasi, tidak berhasil kirim notif email 1')
                            }
                          } else {
                            return response(res, 'failed submit stock opname', {}, 400, false)
                          }
                        } else {
                          return response(res, 'failed submit stock opname', {}, 400, false)
                        }
                      } else {
                        return response(res, 'failed submit stock opname', {}, 400, false)
                      }
                    } else {
                      const cekNo = [0]
                      const noDis = Math.max(...cekNo) + 1
                      const hasil = []
                      for (let i = 0; i < result.length; i++) {
                        const data = {
                          kode_plant: level === 5 ? kode : cost,
                          area: findArea.nama_area,
                          deskripsi: result[i].nama_asset,
                          no_asset: result[i].no_asset,
                          merk: result[i].merk,
                          satuan: result[i].satuan,
                          unit: result[i].unit,
                          kondisi: result[i].kondisi,
                          lokasi: result[i].lokasi,
                          grouping: result[i].grouping,
                          keterangan: result[i].keterangan,
                          status_fisik: result[i].status_fisik,
                          tanggalStock: moment().format('L'),
                          status_form: 1
                        }
                        const send = await stock.create(data)
                        if (send) {
                          hasil.push('1')
                        }
                      }
                      if (hasil.length === result.length) {
                        const findNo = await stock.findAll({
                          where: {
                            [Op.and]: [
                              { kode_plant: level === 5 ? kode : cost },
                              {
                                tanggalStock: {
                                  [Op.lte]: akhir,
                                  [Op.gte]: awal
                                }
                              }
                            ]
                          }
                        })
                        if (findNo) {
                          const cek = []
                          for (let i = 0; i < findNo.length; i++) {
                            const data = {
                              no_stock: 'O' + noDis
                            }
                            const result = await stock.findByPk(findNo[i].id)
                            if (result) {
                              await result.update(data)
                              cek.push('1')
                            }
                          }
                          if (cek.length > 0) {
                            for (let i = 0; i < findAsset.length; i++) {
                              const data = {
                                status_fisik: null,
                                keterangan: null,
                                kondisi: null,
                                grouping: null
                              }
                              const result = await asset.findByPk(findAsset[i].id)
                              if (result) {
                                await result.update(data)
                              }
                            }
                            const findDepo = await depo.findOne({
                              where: {
                                kode_plant: level === 5 ? kode : cost
                              }
                            })
                            if (findDepo) {
                              const findRom = await user.findOne({
                                where: {
                                  fullname: findDepo.nama_om
                                }
                              })
                              if (findRom) {
                                const data = {
                                  kode_plant: level === 5 ? kode : cost,
                                  jenis: 'stock opname',
                                  no_proses: `O${noDis}`,
                                  list_appr: findRom.username,
                                  keterangan: 'pengajuan',
                                  response: 'request'
                                }
                                const createNotif = await notif.create(data)
                                if (createNotif) {
                                  const mailOptions = {
                                    from: 'noreply_asset@pinusmerahabadi.co.id',
                                    replyTo: 'noreply_asset@pinusmerahabadi.co.id',
                                    to: `${findRom.email}`,
                                    subject: `Approve Pengajuan Stock Opname O${noDis} (TESTING)`,
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
                                          Dear Bapak/Ibu ROM,
                                      </div>
                                      <div class="tittle mar1">
                                          <div>Mohon untuk approve pengajuan stock opname area ${findDepo.nama_area} dengan nomor opname O${noDis}.</div>
                                      </div>
                                      <div class="position">
                                      </div>
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
                                    return response(res, 'success submit stock opname')
                                  } else {
                                    return response(res, 'berhasil approve mutasi, tidak berhasil kirim notif email 1')
                                  }
                                } else {
                                  return response(res, 'berhasil approve mutasi, tidak berhasil kirim notif email 1')
                                }
                              } else {
                                return response(res, 'berhasil approve mutasi, tidak berhasil kirim notif email 1')
                              }
                            } else {
                              return response(res, 'berhasil approve mutasi, tidak berhasil kirim notif email 1')
                            }
                          } else {
                            return response(res, 'failed submit stock opname', {}, 400, false)
                          }
                        } else {
                          return response(res, 'failed submit stock opname', {}, 400, false)
                        }
                      } else {
                        return response(res, 'failed submit stock opname', {}, 400, false)
                      }
                    }
                  } else {
                    return response(res, 'upload gambar asset terbaru terlebih dahulu', { img: cekImage.length, asset: findPict.length }, 400, false)
                  }
                } else {
                  return response(res, 'upload gambar asset terbaru terlebih dahulu', {}, 400, false)
                }
              } else {
                return response(res, 'Pastikan lokasi, status fisik, kondisi, dan status asset telah terisi', { result: result.length, findaset: findAsset.length }, 400, false)
              }
            } else {
              return response(res, 'Pastikan lokasi, status fisik, kondisi, dan status asset telah terisi', { result: result.length }, 400, false)
            }
          }
        }
      } else {
        return response(res, 'Buat clossing untuk stock opname terlebih dahulu', {}, 400, false)
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  getDocument: async (req, res) => {
    try {
      const no = req.params.no
      const results = await asset.findOne({
        where: {
          no_asset: no
        }
      })
      if (results) {
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
          const result = await docUser.findAll({
            where: {
              [Op.and]: [
                { no_stock: no },
                {
                  periode: {
                    [Op.lte]: end,
                    [Op.gte]: start
                  }
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
                  { tipe_dokumen: 'stock' },
                  {
                    [Op.or]: [
                      { tipe: 'pengajuan' }
                    ]
                  }
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
                  no_stock: no,
                  tipe: 'pengajuan',
                  path: null,
                  periode: start
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
          return response(res, 'Failed get document 2', {}, 400, false)
        }
      } else {
        return response(res, 'Failed get document 1', {}, 400, false)
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  cekDokumen: async (req, res) => {
    try {
      const no = req.params.no
      const results = await asset.findOne({
        where: {
          no_asset: no
        }
      })
      if (results) {
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
          const result = await docUser.findAll({
            where: {
              [Op.and]: [
                { no_stock: no },
                {
                  periode: {
                    [Op.lte]: end,
                    [Op.gte]: start
                  }
                }
              ]
            }
          })
          if (result.length > 0) {
            return response(res, 'success get document', { result, end, start })
          } else {
            return response(res, 'Failed get document', { end, start, time }, 400, false)
          }
        } else {
          return response(res, 'Failed get document', {}, 400, false)
        }
      } else {
        return response(res, 'Failed get document', {}, 400, false)
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  getStock: async (req, res) => {
    try {
      const kode = req.user.kode
      const cost = req.user.name
      const level = req.user.level
      let { limit, page, search, sort, status } = req.query
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
            kode_plant: level === 5 ? kode : cost,
            [Op.and]: [
              { status_app: status === 'null' ? null : status },
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
          include: [
            {
              model: path,
              as: 'pict'
            },
            {
              model: ttd,
              as: 'appForm'
            }
          ],
          order: [
            [sortValue, 'ASC'],
            [{ model: ttd, as: 'appForm' }, 'id', 'DESC']
          ],
          limit: limit,
          offset: (page - 1) * limit
        })
        const pageInfo = pagination('/stock/get', req.query, page, limit, result.count)
        if (result) {
          return response(res, 'list asset', { result, pageInfo })
        } else {
          return response(res, 'failed to get stock', {}, 404, false)
        }
      } else {
        return response(res, 'Buat clossing untuk stock opname terlebih dahulu', {}, 400, false)
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  getStockAll: async (req, res) => {
    try {
      let { limit, page, search, sort, group } = req.query
      const fullname = req.user.fullname
      let searchValue = ''
      let sortValue = ''
      const level = req.user.level
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
      if (!group) {
        group = ''
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
        if (level === 12 || level === 7) {
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
              const result = await stock.findAll({
                where: {
                  [Op.and]: [
                    { kode_plant: findDepo[i].kode_plant },
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
                    { kondisi: { [Op.like]: `%${searchValue}%` } },
                    { grouping: { [Op.like]: `%${searchValue}%` } }
                  ]
                },
                include: [
                  {
                    model: ttd,
                    as: 'appForm'
                  }
                ],
                order: [
                  [sortValue, 'ASC'],
                  [{ model: ttd, as: 'appForm' }, 'id', 'DESC']
                ],
                limit: limit,
                offset: (page - 1) * limit,
                group: ['no_stock']
              })
              if (result.length > 0) {
                for (let j = 0; j < result.length; j++) {
                  hasil.push(result[j])
                }
              }
            }
            if (hasil.length > 0) {
              const result = { rows: hasil, count: hasil.length }
              const pageInfo = pagination('/stock/get', req.query, page, limit, result.count)
              return response(res, 'list stock', { result, pageInfo })
            } else {
              const result = { rows: hasil, count: 0 }
              const pageInfo = pagination('/stock/get', req.query, page, limit, result.count)
              return response(res, 'list stock', { result, pageInfo })
            }
          } else {
            return response(res, 'failed get data stock', {}, 404, false)
          }
        } else {
          const result = await stock.findAndCountAll({
            where: {
              [Op.and]: [
                {
                  [Op.or]: [
                    { status_form: level === 2 ? 9 : 1 },
                    { status_form: level === 2 ? 8 : 1 }
                  ]
                },
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
                { kondisi: { [Op.like]: `%${searchValue}%` } },
                { grouping: { [Op.like]: `%${searchValue}%` } }
              ]
            },
            include: [
              {
                model: ttd,
                as: 'appForm'
              }
            ],
            order: [
              [sortValue, 'ASC'],
              [{ model: ttd, as: 'appForm' }, 'id', 'DESC']
            ],
            limit: limit,
            offset: (page - 1) * limit,
            group: ['no_stock']
          })
          const pageInfo = pagination('/stock/get', req.query, page, limit, result.count.length)
          if (result) {
            return response(res, 'list stock', { result, pageInfo })
          } else {
            return response(res, 'failed get data stock', {}, 404, false)
          }
        }
      } else {
        return response(res, 'Buat clossing untuk stock opname terlebih dahulu', {}, 400, false)
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
  updateStock: async (req, res) => {
    try {
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
          const result = await stock.findByPk(id)
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
  getDetailItem: async (req, res) => {
    try {
      const id = req.params.id
      const result = await stock.findOne({
        where: {
          id: id
        },
        include: [
          {
            model: path,
            as: 'pict'
          },
          {
            model: path,
            as: 'img'
          }
        ]
      })
      if (result) {
        return response(res, 'success get detail stock', { result })
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
          const getDepo = await depo.findOne({
            where: {
              kode_plant: result[0].kode_plant
            }
          })
          const getApp = await approve.findAll({
            where: {
              nama_approve: nama
            }
          })
          if (getApp && getDepo) {
            const hasil = []
            for (let i = 0; i < getApp.length; i++) {
              const send = {
                jabatan: getApp[i].jabatan === '' || getApp[i].jabatan === null ? null : getApp[i].jabatan,
                jenis: getApp[i].jenis === '' || getApp[i].jenis === null ? null : getApp[i].jenis,
                sebagai: getApp[i].sebagai === '' || getApp[i].sebagai === null ? null : getApp[i].sebagai,
                kategori: null,
                no_doc: no
              }
              if (getDepo.kode_plant.split('').length > 4 && getDepo.nama_asman === null && getApp[i].jabatan === 'Asisten Manager') {
                hasil.push(1)
              } else {
                const make = await ttd.create(send)
                if (make) {
                  hasil.push(make)
                }
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
                      return response(res, 'success get template approve', { result: { pembuat, pemeriksa, penyetuju, getApp } })
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
      const findDiv = await role.findAll()
      const result = await role.findAll({
        where: {
          nomor: level
        }
      })
      if (result.length > 0 && findDiv.length > 0) {
        const find = await ttd.findAll({
          where: {
            no_doc: no
          }
        })
        if (find.length > 0) {
          let hasil = 0
          let arr = null
          console.log(findDiv.find(({ nomor }) => nomor === '27').name)
          for (let i = 0; i < find.length; i++) {
            if ((level === 16 || level === 13 ? findDiv.find(({ nomor }) => nomor === '27').name : result[0].name) === find[i].jabatan) {
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
                          const findUser = await email.findOne({
                            where: {
                              kode_plant: findDoc[0].kode_plant
                            }
                          })
                          if (findUser) {
                            const mailOptions = {
                              from: 'noreply_asset@pinusmerahabadi.co.id',
                              replyTo: 'noreply_asset@pinusmerahabadi.co.id',
                              to: `${findUser.email_staff_asset1}, ${findUser.email_staff_asset2}`,
                              subject: `Full Approve Pengajuan Stock Opname ${no} (TESTING)`,
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
                                    <div>Mohon lanjutkan proses pengajuan stock opname area ${findDoc[0].area} dengan nomor opname ${no}.</div>
                                </div>
                                <div class="position">
                                </div>
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
                              return response(res, 'success approve stock opname')
                            } else {
                              return response(res, 'berhasil approve mutasi, tidak berhasil kirim notif email 1')
                            }
                          } else {
                            return response(res, 'berhasil approve mutasi, tidak berhasil kirim notif email 1')
                          }
                        }
                      }
                    } else {
                      const findDoc = await stock.findOne({
                        where: {
                          no_stock: no
                        }
                      })
                      if (findDoc) {
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
                            const findDepo = await depo.findOne({
                              where: {
                                kode_plant: findDoc.kode_plant
                              }
                            })
                            if (findDepo) {
                              const findRom = await user.findOne({
                                where: {
                                  fullname: find[arr + 1].jabatan === 'BM' ? findDepo.nama_bm : find[arr + 1].jabatan === 'ROM' ? findDepo.nama_om : findDepo.nama_bm
                                }
                              })
                              if (findRom) {
                                const data = {
                                  kode_plant: findDoc.kode_plant,
                                  jenis: 'stock opname',
                                  no_proses: no,
                                  list_appr: findRom.username,
                                  keterangan: 'pengajuan',
                                  response: 'request'
                                }
                                const createNotif = await notif.create(data)
                                if (createNotif) {
                                  const mailOptions = {
                                    from: 'noreply_asset@pinusmerahabadi.co.id',
                                    replyTo: 'noreply_asset@pinusmerahabadi.co.id',
                                    to: `${find[arr + 1].jabatan === 'BM' || find[arr + 1].jabatan === 'ROM' ? findRom.email : findUser.email}`,
                                    subject: `Approve Pengajuan Stock Opname ${no} (TESTING)`,
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
                                          <div>Mohon untuk approve pengajuan stock opname area ${findDepo.nama_area} dengan nomor opname ${no}.</div>
                                      </div>
                                      <div class="position">
                                      </div>
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
                                    return response(res, 'success submit stock opname')
                                  } else {
                                    return response(res, 'berhasil approve mutasi, tidak berhasil kirim notif email 1')
                                  }
                                } else {
                                  return response(res, 'berhasil approve mutasi, tidak berhasil kirim notif email 1')
                                }
                              } else {
                                return response(res, 'berhasil approve mutasi, tidak berhasil kirim notif email 1')
                              }
                            } else {
                              return response(res, 'berhasil approve mutasi, tidak berhasil kirim notif email 1')
                            }
                          } else {
                            return response(res, 'berhasil approve dokumen, tidak berhasil kirim notif email 2')
                          }
                        } else {
                          return response(res, 'berhasil approve dokumen, tidak berhasil kirim notif email 2')
                        }
                      } else {
                        return response(res, 'berhasil approve dokumen, tidak berhasil kirim notif email 2')
                      }
                    }
                  } else {
                    return response(res, 'failed approve disposal 1', {}, 404, false)
                  }
                } else {
                  return response(res, 'failed approve disposal 2', {}, 404, false)
                }
              } else {
                return response(res, `${find[arr - 1].jabatan} belum approve`, {}, 404, false)
              }
            }
          } else {
            return response(res, 'failed approve disposal 3', {}, 404, false)
          }
        } else {
          return response(res, 'failed approve disposal 4', {}, 404, false)
        }
      } else {
        return response(res, 'failed approve disposal 5', {}, 404, false)
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
              return response(res, 'Anda tidak memiliki akses lagi untuk mereject', {}, 404, false)
            } else {
              if (arr === 0 || find[arr - 1].status === 1) {
                const data = {
                  nama: name,
                  status: 0,
                  path: alasan
                }
                const findTtd = await ttd.findByPk(hasil)
                if (findTtd) {
                  let tableTd = ''
                  const cek = []
                  for (let i = 1; i < list.length; i++) {
                    const send = {
                      status_app: 0
                    }
                    const findStock = await stock.findOne({
                      where: {
                        [Op.and]: [
                          { no_asset: list[i] },
                          { no_stock: no }
                        ]
                      }
                    })
                    if (findStock) {
                      const element = `
                        <tr>
                          <td>${i}</td>
                          <td>${findStock.no_stock}</td>
                          <td>${findStock.no_asset}</td>
                          <td>${findStock.nama_asset}</td>
                          <td>${findStock.cost_center}</td>
                          <td>${findStock.area}</td>
                        </tr>`
                      tableTd = tableTd + element
                      await findStock.update(send)
                      cek.push(1)
                    }
                  }
                  if (cek.length === (list.length - 1)) {
                    const findStock = await stock.findOne({
                      where: {
                        no_stock: no
                      }
                    })
                    let draftEmail = ''
                    const draf = []
                    for (let i = 0; i < find.length; i++) {
                      if (find[i].jabatan === 'area' && find[i].sebagai === 'pembuat') {
                        const findEmail = await email.findOne({
                          where: {
                            kode_plant: findStock.kode_plant
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
                      const sent = await findTtd.update(data)
                      if (sent) {
                        const mailOptions = {
                          from: 'noreply_asset@pinusmerahabadi.co.id',
                          replyTo: 'noreply_asset@pinusmerahabadi.co.id',
                          to: `${draftEmail}`,
                          subject: `Reject Stock Opname Asset ${no} (TESTING WEB ASET)`,
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
                                  <div>Pengajuan stock opname telah direject</div>
                                  <div>Alasan Reject: ${alasan}</div>
                                  <div>Direject oleh: ${name}</div>
                              </div>
                              <div class="position">
                                  <table class="demo-table">
                                      <thead>
                                          <tr>
                                              <th>No</th>
                                              <th>No Stock</th>
                                              <th>Asset</th>
                                              <th>Asset description</th>
                                              <th>Cost Ctr</th>
                                              <th>Depo / Cabang</th>
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
                                ${name}
                              </div>
                          </body>
                          `
                        }
                        const sendEmail = await wrapMail.wrapedSendMail(mailOptions)
                        if (sendEmail) {
                          return response(res, 'success reject stock opname', { sendEmail })
                        } else {
                          return response(res, 'berhasil reject stock opname, tidak berhasil kirim notif email 1')
                        }
                      } else {
                        return response(res, 'failed reject stock opname', {}, 404, false)
                      }
                    } else {
                      return response(res, 'success reject stock opname gagal kirim email')
                    }
                  } else {
                    return response(res, 'failed reject stock opname', {}, 404, false)
                  }
                } else {
                  return response(res, 'failed reject stock opname', {}, 404, false)
                }
              } else {
                return response(res, `${find[arr - 1].jabatan} belum approve`, {}, 404, false)
              }
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
  uploadImage: async (req, res) => {
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
        const findAsset = await stock.findByPk(no)
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
        status: joi.string(),
        isSap: joi.string().valid('true', 'false')
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
      let { fisik, kondisi, sap } = req.query
      if (!fisik) {
        fisik = ''
      }
      if (!kondisi) {
        kondisi = ''
      }

      if (kondisi === '') {
        const result = await status_stock.findAll({
          where: {
            isSap: sap,
            [Op.and]: [
              { fisik: fisik },
              {
                [Op.or]: [
                  { kondisi: null },
                  { kondisi: '' }
                ]
              }
            ]
          }
        })
        if (result) {
          return response(res, 'success get status stock', { result })
        } else {
          return response(res, 'failed get status stock', {}, 404, false)
        }
      } else {
        const result = await status_stock.findAll({
          where: {
            isSap: sap,
            [Op.and]: [
              { fisik: fisik },
              { kondisi: kondisi }
            ]
          }
        })
        if (result) {
          return response(res, 'success get status stock', { result })
        } else {
          return response(res, 'failed get status stock', {}, 404, false)
        }
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  getStatusAll: async (req, res) => {
    try {
      const result = await status_stock.findAll()
      if (result) {
        return response(res, 'success get status stock', { result })
      } else {
        return response(res, 'failed get status stock', {}, 404, false)
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  rekapStock: async (req, res) => {
    try {
      const findCond = await status_stock.findAll()
      if (findCond.length > 0) {
        const data = []
        for (let i = 0; i < findCond.length; i++) {
          const result = await stock.findAll({
            where: {
              grouping: findCond.status
            }
          })
          if (result.length > 0) {
            data.push(result)
          }
        }
        return response(res, 'success rekap', { data })
      } else {
        return response(res, 'failed get rekap stock', {}, 404, false)
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  getReportAll: async (req, res) => {
    // try {
    let { limit, page, search, sort, group, fisik, sap, kondisi, plant } = req.query
    let searchValue = ''
    let sortValue = ''
    if (typeof search === 'object') {
      searchValue = Object.values(search)[0]
    } else {
      searchValue = search || ''
    }
    console.log(searchValue)
    if (typeof sort === 'object') {
      sortValue = Object.values(sort)[0]
    } else {
      sortValue = sort || 'id'
    }
    if (!limit) {
      limit = 1000
    } else {
      limit = parseInt(1000)
    }
    if (!page) {
      page = 1
    } else {
      page = parseInt(page)
    }
    if (!group) {
      group = ''
    }
    if (!fisik) {
      fisik = ''
    }
    if (!sap) {
      sap = ''
    }
    if (!kondisi) {
      kondisi = ''
    }
    if (!plant) {
      plant = ''
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
      const result = await stock.findAll({
        where: {
          grouping: group === 'all' ? { [Op.not]: null } : { [Op.like]: `%${group}%` },
          status_fisik: fisik === 'all' ? { [Op.not]: null } : { [Op.like]: `%${fisik}%` },
          kode_plant: plant === 'all' ? { [Op.not]: null } : { [Op.like]: `%${plant}%` },
          kondisi: kondisi === 'all' ? { [Op.not]: 'king' } : { [Op.like]: `%${kondisi}%` },
          [Op.and]: [
            { status_form: 8 },
            {
              tanggalStock: {
                [Op.lte]: end,
                [Op.gte]: start
              }
            }
          ],
          [Op.or]: [
            { no_asset: sap === 'null' ? null : { [Op.not]: null } },
            { no_asset: sap === 'all' ? null : sap === 'null' ? null : { [Op.not]: null } }
          ]
        },
        include: [
          {
            model: asset,
            as: 'dataAsset'
          },
          {
            model: depo,
            as: 'depo'
          }
        ],
        order: [[sortValue, 'ASC']],
        limit: null,
        offset: (page - 1) * limit
      })
      const pageInfo = pagination('/stock/get', req.query, page, limit, result.length)
      if (result) {
        return response(res, 'list stock', { result: { rows: result, count: result.length }, pageInfo })
      } else {
        return response(res, 'failed get data stock', {}, 404, false)
      }
    } else {
      return response(res, 'Buat clossing untuk stock opname terlebih dahulu', {}, 400, false)
    }
    // } catch (error) {
    //   return response(res, error.message, {}, 500, false)
    // }
  },
  submitAsset: async (req, res) => {
    try {
      const no = req.params.no
      const findStock = await stock.findAll({
        where: {
          no_stock: no
        }
      })
      if (findStock.length > 0) {
        const cek = []
        for (let i = 0; i < findStock.length; i++) {
          const find = await stock.findByPk(findStock[i].id)
          const data = {
            status_form: 8
          }
          if (find) {
            await find.update(data)
            cek.push(1)
          }
        }
        if (findStock.length === cek.length) {
          // const valid = []
          // const prev = moment().subtract(1, 'month').format('L').split('/')
          // for (let i = 0; i < findStock.length; i++) {
          //   const findApi = await axios.get(`http://10.3.212.38:8000/sap/bc/zast/?sap-client=300&pgmna=zfir0090&p_anln1=${findStock[i].no_asset}&p_bukrs=pp01&p_gjahr=${prev[2]}&p_monat=${prev[0]}`).then(response => { return (response) }).catch(err => { return (err.isAxiosError) })
          // }
          const findEmail = await email.findOne({
            where: {
              kode_plant: findStock[0].kode_plant
            }
          })
          if (findEmail) {
            const mailOptions = {
              from: 'noreply_asset@pinusmerahabadi.co.id',
              replyTo: 'noreply_asset@pinusmerahabadi.co.id',
              to: `${findEmail.email_area_aos}`,
              subject: `Proses Stock Opname ${no} Telah Selesai (TESTING)`,
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
                    Dear Bapak/Ibu AOS,
                </div>
                <div class="tittle mar1">
                    <div>Pengajuan stock opname ${no} telah selesai diproses.</div>
                </div>
                <div class="position">
                </div>
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
              return response(res, 'success submit stock opname')
            } else {
              return response(res, 'berhasil submit mutasi, tidak berhasil kirim notif email 1')
            }
          } else {
            return response(res, 'berhasil submit tidak berhasil kirim notif email')
          }
        } else {
          return response(res, 'failed submit stock2', {}, 404, false)
        }
      } else {
        return response(res, 'failed submit stock1', {}, 404, false)
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  submitRevisi: async (req, res) => {
    try {
      const id = req.params.id
      const data = {
        status_app: 1
      }
      const findStock = await stock.findByPk(id)
      if (findStock) {
        const upStock = await findStock.update(data)
        if (upStock) {
          const find = await ttd.findOne({
            where: {
              [Op.and]: [
                { no_doc: findStock.no_stock },
                { status: 0 }
              ]
            }
          })
          if (find) {
            const findUser = await user.findOne({
              where: {
                username: find.nama
              }
            })
            if (findUser) {
              const tableTd = `
              <tr>
                <td>1</td>
                <td>${findStock.no_stock}</td>
                <td>${findStock.no_asset}</td>
                <td>${findStock.nama_asset}</td>
                <td>${findStock.cost_center}</td>
                <td>${findStock.area}</td>
              </tr>`
              const mailOptions = {
                from: 'noreply_asset@pinusmerahabadi.co.id',
                replyTo: 'noreply_asset@pinusmerahabadi.co.id',
                to: `${findUser.email}`,
                subject: `Revisi Stock Opname ${findStock.no_stock} (TESTING WEB ASET)`,
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
                        <div>Pengajuan stock opname telah direvisi oleh area</div>
                    </div>
                    <div class="position">
                        <table class="demo-table">
                            <thead>
                                <tr>
                                    <th>No</th>
                                    <th>No Stock</th>
                                    <th>Asset</th>
                                    <th>Asset description</th>
                                    <th>Cost Ctr</th>
                                    <th>Depo / Cabang</th>
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
                      AOS ${findStock.area}
                    </div>
                </body>
                `
              }
              const sendEmail = await wrapMail.wrapedSendMail(mailOptions)
              if (sendEmail) {
                return response(res, 'success submit stock')
              } else {
                return response(res, 'berhasil revisi stock gagal kirim notif email')
              }
            } else {
              return response(res, 'berhasil revisi stock gagal kirim notif email')
            }
          } else {
            return response(res, 'berhasil revisi stock gagal kirim notif email')
          }
        } else {
          return response(res, 'failed submit revisi stock', {}, 404, false)
        }
      } else {
        return response(res, 'failed submit revisi stock', {}, 404, false)
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  addStock: async (req, res) => {
    try {
      const cost = req.user.name
      const level = req.user.level
      const kode = req.user.kode
      const schema = joi.object({
        area: joi.string().allow(''),
        kode_plant: joi.string().allow(''),
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
            let awal = ''
            let akhir = ''
            if (parseInt(time[1]) >= 1 && parseInt(time[1]) <= findClose[0].end) {
              const next = moment().subtract(1, 'month').format('L').split('/')
              akhir = `${time[2]}-${time[0]}-${findClose[0].end}`
              awal = `${next[2]}-${next[0]}-${findClose[0].start}`
            } else {
              const next = moment().add(1, 'month').format('L').split('/')
              awal = `${time[2]}-${time[0]}-${findClose[0].start}`
              akhir = `${next[2]}-${next[0]}-${findClose[0].end}`
            }
            const findStock = await stock.findOne({
              where: {
                [Op.and]: [
                  { kode_plant: level === 5 ? kode : cost },
                  {
                    tanggalStock: {
                      [Op.lte]: akhir,
                      [Op.gte]: awal
                    }
                  }
                ]
              }
            })
            const data = {
              kode_plant: results.kode_plant,
              area: results.area,
              deskripsi: results.deskripsi,
              no_asset: results.no_asset,
              merk: results.merk,
              satuan: results.satuan,
              unit: results.unit,
              kondisi: results.kondisi,
              lokasi: results.lokasi,
              grouping: results.grouping,
              keterangan: results.keterangan,
              status_fisik: results.status_fisik,
              tanggalStock: moment().format('L'),
              status_form: 0,
              status_doc: 1
            }
            if (findStock) {
              if (findStock.no_stock !== null) {
                return response(res, 'Telah melakukan pengajuan untuk periode sekarang', {}, 400, false)
              } else {
                const send = await stock.create(data)
                if (send) {
                  return response(res, 'success add stock opname', { result: send })
                } else {
                  return response(res, 'failed add stock opname', {}, 400, false)
                }
              }
            } else {
              const send = await stock.create(data)
              if (send) {
                return response(res, 'success add stock opname', { result: send })
              } else {
                return response(res, 'failed add stock opname', {}, 400, false)
              }
            }
          }
        } else {
          return response(res, 'Buat clossing untuk stock opname terlebih dahulu', {}, 400, false)
        }
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  exportStock: async (req, res) => {
    try {
      const no = req.params.no
      const level = req.user.level
      const fullname = req.user.fullname
      const { date } = req.query
      if (no === 'all') {
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
          const findUser = await user.findOne({
            where: {
              user_level: level
            }
          })
          if (findUser) {
            if (level === 2) {
              const findStock = await stock.findAll({
                where: {
                  [Op.and]: [
                    {
                      [Op.or]: [
                        { status_form: level === 2 ? 9 : 1 },
                        { status_form: level === 2 ? 8 : 1 }
                      ]
                    },
                    {
                      tanggalStock: {
                        [Op.lte]: end,
                        [Op.gte]: start
                      }
                    }
                  ]
                },
                include: [
                  {
                    model: path,
                    as: 'pict'
                  },
                  {
                    model: path,
                    as: 'img'
                  }
                ]
              })
              if (findStock.length > 0) {
                return response(res, 'success get stock', { result: findStock })
              } else {
                return response(res, 'failed export stock', {}, 404, false)
              }
            } else if (level === 7 || level === 12) {
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
                  const result = await stock.findAll({
                    where: {
                      [Op.and]: [
                        { kode_plant: findDepo[i].kode_plant },
                        {
                          tanggalStock: {
                            [Op.lte]: end,
                            [Op.gte]: start
                          }
                        }
                      ]
                    },
                    include: [
                      {
                        model: path,
                        as: 'pict'
                      },
                      {
                        model: path,
                        as: 'img'
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
                  return response(res, 'list stock', { result: hasil })
                } else {
                  return response(res, 'list stock', { result: hasil })
                }
              } else {
                return response(res, 'failed get data stock', {}, 404, false)
              }
            } else {
              return response(res, 'failed to download', {}, 404, false)
            }
          } else {
            return response(res, 'failed export stock', {}, 404, false)
          }
        } else {
          return response(res, 'failed export stock', {}, 404, false)
        }
      } else {
        const findStock = await stock.findAll({
          where: {
            no_stock: no
          },
          include: [
            {
              model: path,
              as: 'pict'
            },
            {
              model: path,
              as: 'img'
            }
          ]
        })
        if (findStock.length > 0) {
          return response(res, 'success get stock', { result: findStock })
        } else {
          return response(res, 'failed export stock', {}, 404, false)
        }
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  }
}
