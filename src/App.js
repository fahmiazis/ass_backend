const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const response = require('./helpers/response')
const morgan = require('morgan')

const app = express()
const server = require('http').createServer(app)

const { APP_PORT, APP_URL } = process.env

app.use(bodyParser.urlencoded({ extended: false }))
app.use(morgan('dev'))
app.use(cors())

app.use('/uploads', express.static('assets/documents'))
app.use('/masters', express.static('assets/masters'))
app.use('/download', express.static('assets/exports'))

// app.get('*', (req, res) => {
//   response(res, 'Error route not found', {}, 404, false)
// })

app.get('/', (req, res) => {
  response(res, 'Backend is running')
})

server.listen(APP_PORT, () => {
  console.log(`App is running on port ${APP_URL}`)
})
