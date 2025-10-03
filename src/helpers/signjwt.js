const jwt = require('jsonwebtoken')
const { APP_KEY } = process.env

module.exports = {
  generateToken: (payload) => {
    return new Promise((resolve, reject) => {
      jwt.sign(payload, `${APP_KEY}`, (err, token) => {
        if (err) reject(err)
        else resolve(token)
      })
    })
  }
}
