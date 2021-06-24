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

const userRoute = require('./routes/user')
const authRoute = require('./routes/auth')
const depoRoute = require('./routes/depo')
const showRoute = require('./routes/show')
const emailRoute = require('./routes/email')
const dokumenRoute = require('./routes/dokumen')
const assetRoute = require('./routes/asset')
const pengRoute = require('./routes/pengadaan')
const approveRoute = require('./routes/approves')
const disposalRoute = require('./routes/disposal')

const authMiddleware = require('./middlewares/auth')

app.use('/uploads', express.static('assets/documents'))
app.use('/masters', express.static('assets/masters'))
app.use('/download', express.static('assets/exports'))

app.use('/auth', authRoute)
app.use('/user', authMiddleware, userRoute)
app.use('/depo', authMiddleware, depoRoute)
app.use('/email', authMiddleware, emailRoute)
app.use('/dokumen', authMiddleware, dokumenRoute)
app.use('/asset', authMiddleware, assetRoute)
app.use('/peng', authMiddleware, pengRoute)
app.use('/show', showRoute)
app.use('/approve', authMiddleware, approveRoute)
app.use('/disposal', authMiddleware, disposalRoute)

app.get('*', (req, res) => {
  response(res, 'Error route not found', {}, 404, false)
})

server.listen(APP_PORT, () => {
  console.log(`App is running on port ${APP_URL}`)
})
