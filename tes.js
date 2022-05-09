const cekNo = []
const findNo = []
for (let i = 0; i < findNo.length; i++) {
  const no = findNo[i].no_pengadaan.split('P')
  cekNo.push(parseInt(no[1]))
}
const noIo = cekNo.length > 0 ? Math.max(...cekNo) + 1 : 1

console.log(noIo)
