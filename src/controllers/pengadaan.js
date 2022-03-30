const { approve, ttd, depo, pengadaan, document, docUser } = require('../models')
const joi = require('joi')
const response = require('../helpers/response')
const { Op } = require('sequelize')
// const { pagination } = require('../helpers/pagination')
// const moment = require('moment')
const wrapMail = require('../helpers/wrapMail')
const multer = require('multer')
const uploadHelper = require('../helpers/upload')

module.exports = {
  home: async (req, res) => {
    try {
      const level = req.user.level
      const kode = req.user.kode
      const name = req.user.name
      const fullname = req.user.fullname
      if (level === 5) {
        const result = await pengadaan.findAll({
          where: {
            kode_plant: kode
          },
          include: [
            {
              model: depo,
              as: 'depo'
            }
          ],
          group: ['no_pengadaan']
        })
        if (result.length > 0) {
          return response(res, 'success get', { result })
        } else {
          return response(res, 'failed get data', {}, 404, false)
        }
      } else if (level === 9) {
        const result = await pengadaan.findAll({
          where: {
            kode_plant: name
          },
          include: [
            {
              model: depo,
              as: 'depo'
            }
          ],
          group: ['no_pengadaan']
        })
        if (result.length > 0) {
          return response(res, 'success get', { result })
        } else {
          return response(res, 'failed get data', {}, 404, false)
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
            const result = await pengadaan.findAll({
              where: {
                kode_plant: findDepo[i].kode_plant
              },
              include: [
                {
                  model: depo,
                  as: 'depo'
                }
              ],
              group: ['no_pengadaan']
            })
            if (result) {
              for (let j = 0; j < result.length; j++) {
                hasil.push(result[j])
              }
            }
          }
          if (hasil.length > 0) {
            return response(res, 'success get', { result: hasil })
          } else {
            return response(res, 'success get', { result: hasil })
          }
        } else {
          return response(res, 'failed get data', {}, 404, false)
        }
      } else {
        const result = await pengadaan.findAll({
          include: [
            {
              model: depo,
              as: 'depo'
            }
          ],
          group: ['no_pengadaan']
        })
        if (result.length > 0) {
          return response(res, 'success get', { result })
        } else {
          return response(res, 'failed get data', {}, 404, false)
        }
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
              tipe_dokumen: 'pengadaan',
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
      const data = req.body
      const findCode = await pengadaan.findOne({
        where: {
          ticket_code: data.ticket_code
        }
      })
      if (findCode) {
        return response(res, 'Pengajuan sedang diproses', { result: findCode })
      } else {
        const findDepo = await depo.findOne({
          where: {
            kode_sap_1: data.prinfo.salespoint_code
          }
        })
        const valid = []
        for (let i = 0; i < data.pr_items.length; i++) {
          const dataSend = {
            nama: data.pr_items[i].name,
            qty: data.pr_items[i].qty,
            price: data.pr_items[i].price,
            uom: data.pr_items[i].uom,
            isAsset: data.pr_items[i].isAsset,
            setup_date: data.pr_items[i].setup_date,
            kode_plant: findDepo === null || findDepo.kode_plant === undefined || findDepo.kode_plant === null ? data.prinfo.salespoint_code : findDepo.kode_plant,
            isBudget: `${data.prinfo.isBudget}`,
            ticket_code: data.ticket_code,
            no_pengadaan: data.ticket_code,
            kategori: data.prinfo.isBudget === true ? 'budget' : 'non-budget',
            asset_token: data.pr_items[i].asset_number_token,
            bidding_harga: data.pr_items[i].notes_bidding_harga,
            ket_barang: data.pr_items[i].notes_keterangan_barang,
            status_form: 1,
            area: findDepo === null || findDepo.nama_area === undefined || findDepo.nama_area === null ? data.prinfo.salespoint_code : findDepo.nama_area,
            alasan: data.pr_items[i].notes
          }
          const sent = await pengadaan.create(dataSend)
          if (sent) {
            valid.push(sent)
          }
        }
        if (valid.length > 0) {
          const cek = []
          for (let i = 0; i < data.attachments.length; i++) {
            const send = {
              nama_dokumen: data.attachments[i].name,
              jenis_dokumen: 'all',
              divisi: 'asset',
              no_pengadaan: data.ticket_code,
              path: data.attachments[i].url,
              jenis_form: 'pengadaan',
              status: 1
            }
            const sent = await docUser.create(send)
            if (sent) {
              cek.push(sent)
            }
          }
          if (cek.length > 0) {
            return response(res, 'berhasil melakukan pengajuan io', { result: data })
          } else {
            return response(res, 'berhasil melakukan pengajuan io', { result: data })
          }
        } else {
          return response(res, 'failed create data pengadaan')
        }
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  cekApi: async (req, res) => {
    try {
      const { ticket_code } = req.query
      const findCode = await pengadaan.findOne({
        where: {
          ticket_code: ticket_code
        }
      })
      if (findCode) {
        return response(res, 'Pengajuan sedang diproses', { result: findCode })
      } else {
        return response(res, '')
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  getDetail: async (req, res) => {
    try {
      const no = req.params.no
      const result = await pengadaan.findAll({
        where: {
          no_pengadaan: no
        }
      })
      if (result.length > 0) {
        return response(res, 'success get detail', { result })
      } else {
        return response(res, 'failed get detail', {}, 404, false)
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  tesEmail: async (req, res) => {
    try {
      const valid = []
      const data = ['fahmiismail0202@gmail.com', 'insfopma@gmail.com']
      for (let i = 0; i < data.length; i++) {
        const ccIt = ['fahmiazis797@gmail.com']
        const mailOptions = {
          from: 'noreply_asset@pinusmerahabadi.co.id',
          replyTo: 'noreply_asset@pinusmerahabadi.co.id',
          to: `${data[i]}`,
          cc: `${ccIt}`,
          subject: 'DISPOSAL ASSET TES EMAIL',
          html: `
            <head>
            <style type="text/css">
            body {
                display: flexbox;
                flex-direction: column;
            }
            .tittle {
              font-size: 15px;
              font-family: 'Gill Sans', 'Gill Sans MT', Calibri, 'Trebuchet MS', sans-serif;
            }
            .textItalic {
              font-style: italic;
              font-weight: bold;
              font-size: 15px;
              font-family: 'Gill Sans', 'Gill Sans MT', Calibri, 'Trebuchet MS', sans-serif;
              margin-top: 10px;
            }
            .tittleBold {
              font-weight: bold;
              font-size: 15px;
              font-family: 'Gill Sans', 'Gill Sans MT', Calibri, 'Trebuchet MS', sans-serif;
              margin-top: 10px;
            }
            .mar {
                margin-bottom: 20px;
            }
            .mar1 {
                margin-bottom: 10px;
            }
            .mar2 {
              margin-top: 10px;
            }
            .foot {
                font-size: 15px;
                font-family: 'Gill Sans', 'Gill Sans MT', Calibri, 'Trebuchet MS', sans-serif;
                margin-top: 20px;
                margin-bottom: 10px;
            }
            .foot1 {
                font-size: 15px;
                font-family: 'Gill Sans', 'Gill Sans MT', Calibri, 'Trebuchet MS', sans-serif;
                margin-bottom: 50px;
            }
            .position {
                display: flexbox;
                flex-direction: row;
                justify-content: left;
                margin-top: 10px;
                margin-bottom: 10px;
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
            .demo-table tbody tr:hover th
            .demo-table tbody tr:hover td {
                background-color: #ffffa2;
                border-color: #ffff0f;
                transition: all .2s;
            }
            .textUnder {
                text-decoration: underline;
                font-weight: bold;
            }
        </style>
          </head>
          <body>
              <div class="tittle mar">
                  Dear Bapak/Ibu AOS,
              </div>
              <div class="tittle mar1">
                  <div class="tittle">Berikut list aset disposal yang sudah full approved, mohon segera dieksekusi.</div>
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
                      </tbody>
                  </table>
              </div>
              <div class="tittle">Lengkapi dokumen eksekusi sbb:</div>
              <div></div>
              <div class="tittleBold">A. Penjualan Aset:</div>
              <div class="tittle">1. Kwitansi </div>
              <div class="tittle">2. Bukti Transfer</div>
              <div class="tittle">3. BAST penjualan aset (link download : https://pinusmerahabadi.co.id/portal)</div>
              <div class="tittle">4. Dokumentasi serah terima uang dan aset</div>
              <div class="tittle">5. Scan/copyan NPWP pembeli aset (Jika Ada)</div>
              <div class="tittle">6. Document eksekusi discan dan diupload ke web aset</div>
              <div class="tittle">7. Uang hasil penjualan aset maksimal di transfer ke rek HO H+1 (wajib cantumkan di berita transaksi/keterangan penjualan aset+nama area). Transfer ke No.rek : 130.007.611.2112</div>
              <div class="tittle">8. Ketika aset sudah dijual mohon segera diinformasikan ke tim aset, karena ada kaitannya dengan faktur pajak yang harus HO terbitkan ditanggal yang sama saat transaksi.</div>
              <div class="tittle">9. Document asli point 1-5 dikirim ke HO Bandung UP Rifaldi / Neng Rina / Ervyanty (Accounting Asset) PT. Pinus Merah Abadi (HO Bandung). Jl. Soekarno Hatta No. 112, Bandung, Jawa Barat - 40235.</div>
              <div></div>
              <div class="tittleBold">B. Pemusnahan Aset:</div>
              <div class="tittle">1. BA pemusnahan aset dan lampiran foto pemusnahan (link download : https://pinusmerahabadi.co.id/portal)</div>
              <div class="tittle">2. Document eksekusi discan dan diupload ke web aset</div>
              <div></div>
              <div class="textItalic">NOTE:</div>
              <div class="tittle">A. Aset yang sudah  diperbolehkan untuk dieksekusi maka segera eksekusi (maksimal 1 minggu dari tanggal email)</div>
              <div class="tittle">B. Jika aset sudah dijual/dimusnahkan area harap melengkapi semua dokumen yang di request aset (tanpa kekurangan apapun) jika belum mengerti dapat bertanya ke PIC aset</div>
              <div class="mar2"></div>
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
          valid.push('success kirim')
        } else {
          valid.push('berhasil kirim, tidak berhasil kirim notif email 1')
        }
      }
      if (valid.length === data.length) {
        return response(res, 'success send email')
      } else {
        return response(res, 'failed send email')
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  }
}
