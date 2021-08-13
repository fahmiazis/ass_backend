const moment = require('moment')
const spl = moment().format('L').split('/')
const no = 'O99'
const time = `${spl[2]}-${spl[0]}-${spl[1]}`
const next = moment().add(1, 'month').format('L').split('/')

const data = [
  [
    'No.Doc',
    'Tanggal',
    'No Aset',
    'Nama Aset',
    'Area',
    'Kode Plant',
    'Keterangan',
    'Merk',
    'Satuan',
    'Jumlah',
    'Lokasi'
  ],
  [
    0,
    '2016-03-10T12:00:00.000Z',
    4300003327,
    'Meja Meeting 180MDM 1890',
    'MEDAN TIMUR',
    'P112',
    null,
    'EXPO',
    'UNIT',
    1,
    'R Meeting Sedang'
  ],
  [
    0,
    '2016-03-10T12:00:00.000Z',
    4300003328,
    'Meja Meeting 180MDM 1890',
    'MEDAN TIMUR',
    'P112',
    null,
    'EXPO',
    'UNIT',
    1,
    'R Sales'
  ]
]

for (let i = 0; i < data.length; i++) {
  const send = {
    noDoc: data[i][0],
    tanggal: data[i][1],
    nama: data[i][2]
  }
  console.log(send)
}

// console.log(moment(time).format('L 00:00'))
// console.log(spl)

console.log(time)
