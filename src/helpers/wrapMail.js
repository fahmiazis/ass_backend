const nodemailer = require('nodemailer')
// const { HOST, PORT, USER, PASS } = process.env
async function wrapedSendMail (mailOptions) {
  return new Promise((resolve, reject) => {
    const transporter = nodemailer.createTransport({
      connectionTimeout: 60000,
      socketTimeout: 120000,
      greetingTimeout: 30000,
      host: '192.168.35.203',
      secure: false,
      port: 587,
      auth: {
        user: 'sys_adm@pinusmerahabadi.co.id',
        pass: 'sys0911'
      },
      tls: {
        rejectUnauthorized: false
      }
    })
    let cek = []
    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log('error is ' + error)
        resolve(false)
      } else {
        console.log('Email sent: ' + info.response)
        cek.push(1)
        resolve(true)
      }
    })
    setTimeout(() => {
      transporter.close()
      if (cek.length > 0) {
        cek = []
        console.log('masuk settimeout true')
        resolve(true)
      } else {
        cek = []
        console.log('masuk settimeout false')
        resolve(false)
      }
    }, 10000)
  })
}

module.exports = { wrapedSendMail }
