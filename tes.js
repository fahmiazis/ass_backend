const cekNo = 'https://pods.pinusmerahabadi.co.id/storage/attachments/ticketing/barangjasa/P01-LPG1-2609240303/item9011/files/Armada_Aset_Penawaran_resmi_dari_2_vendor_(dilengkapi_KTP_dan_NPWP)_Area_LAMPUNG.pdf'
const tes = 'assets/documents/1656572534470.pdf'

const url = cekNo.split('localhost:8000')
const res = tes.split('/')
const cek = cekNo.search('printPR')

console.log(url.length, res.length, cek)
