const nodemailer = require('nodemailer')
// const { HOST, PORT, USER, PASS } = process.env

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

module.exports = transporter
