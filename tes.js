const moment = require('moment')
const spl = moment().format('L').split('/')
const no = 'O99'
const time = `${spl[2]}-${spl[0]}-${spl[1]}`
const next = moment().add(1, 'month').format('L').split('/')

// console.log(moment(time).format('L 00:00'))
// console.log(spl)

console.log(time)
