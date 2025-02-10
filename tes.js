const moment = require('moment')

const item = {
  tgl_faktur: '2023-03-30T17:00:00.000Z'
}
const king = moment().format('YYYY') - moment(item.tgl_faktur).format('YYYY') > 1
const num = moment().format('YYYY') - moment(item.tgl_faktur).format('YYYY') === 1 && moment().format('M') <= 3 && Math.abs((parseInt(moment().format('M')) + 12) - moment(item.tgl_faktur).format('M'))

console.log(num)
console.log(king)
