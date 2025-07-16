// syncAsset: async (req, res) => {
//   try {
//     req.setTimeout(1000 * 60 * 60)
//     const { date1, type, noAset } = req.query
//     const timeSync1 = moment().format('L').split('/')
//     const time = date1 === undefined || date1 === 'undefined' || date1 === null || date1 === 'null' || date1 === '' ? timeSync1 : moment(date1).format('L').split('/')
//     if (type === 'no') {
//       const findApi = await axios.get(`${APP_SAP}/sap/bc/zast/?sap-client=300&pgmna=zfir0090&p_anln1=${noAset}&p_bukrs=pp01&p_gjahr=${time[2]}&p_monat=${time[0]}`, { timeout: (1000 * 60 * 10) }).then(response => { return (response) }).catch(err => { return (err.isAxiosError) })
//       console.log(findApi)
//       if (findApi.status === 200 && findApi.data.length > 0) {
//         const data = findApi.data[0]
//         const findDepo = await depo.findOne({
//           where: {
//             cost_center: data.kostl
//           }
//         })
//         const findAset = await asset.findOne({
//           where: {
//             no_asset: noAset
//           }
//         })
//         const send = {
//           no_asset: (data.anln1 + '0').slice(2, -1),
//           no_doc: 0,
//           tanggal: data.aktiv === undefined ? '' : data.aktiv,
//           nama_asset: data.txt50 === undefined ? '' : data.txt50,
//           nilai_acquis: data.kansw === undefined ? 0 : data.kansw.toString().split('.')[0],
//           accum_dep: data.knafa === undefined ? 0 : data.knafa.toString().split('.')[0],
//           nilai_buku: data.nafap === undefined ? 0 : data.nafap.toString().split('.')[0],
//           kode_plant: data.werks,
//           cost_center: data.kostl,
//           area: findDepo ? findDepo.place_asset : '',
//           unit: 1,
//           status: (data.deakt !== undefined && data.deakt !== null) ? '0' : (findAset && findAset.status === '100') ? null : findAset ? findAset.status : null
//         }
//         if (findAset) {
//           const updateAset = await findAset.update(send)
//           return response(res, 'success sync aset', { result: updateAset })
//         } else {
//           const createAset = await asset.create(send)
//           return response(res, 'success sync aset', { result: createAset })
//         }
//       } else {
//         return response(res, 'failed sync asset1', { findApi, time, type, noAset }, 404, false)
//       }
//     } else {
//       const findApi = await axios.get(`${APP_SAP}/sap/bc/zast/?sap-client=300&pgmna=zfir0090&p_bukrs=pp01&p_gjahr=${time[2]}&p_monat=${time[0]}`, { timeout: (1000 * 60 * 10) }).then(response => { return (response) }).catch(err => { return (err.isAxiosError) })
//       const findDepo = await depo.findAll()
//       if (findApi.status === 200 && findApi.data.length > 0 && findDepo.length > 0) {
//         const cekSync = []
//         const data = findApi.data
//         for (let i = 0; i < data.length; i++) {
//           const cekArea = findDepo.find(item => item.cost_center === data[i].kostl)
//           const send = {
//             no_asset: (data[i].anln1 + '0').slice(2, -1),
//             no_doc: 0,
//             tanggal: data[i].aktiv === undefined ? '' : data[i].aktiv,
//             nama_asset: data[i].txt50 === undefined ? '' : data[i].txt50,
//             nilai_acquis: data[i].kansw === undefined ? 0 : data[i].kansw.toString().split('.')[0],
//             accum_dep: data[i].knafa === undefined ? 0 : data[i].knafa.toString().split('.')[0],
//             nilai_buku: data[i].nafap === undefined ? 0 : data[i].nafap.toString().split('.')[0],
//             kode_plant: data[i].werks,
//             cost_center: data[i].kostl,
//             area: cekArea ? cekArea.place_asset : '',
//             unit: 1
//           }
//           if (data[i].deakt !== undefined && data[i].deakt !== null) {
//             send.status = '0'
//           }
//           // const findAset = await asset.findOne({
//           //   where: {
//           //     [Op.or]: [
//           //       { no_asset: data[i].anln1 },
//           //       { no_asset: (data[i].anln1 + '0').slice(2, -1) }
//           //     ]
//           //   }
//           // })
//           const updateAset = await asset.update(send, {
//             where: {
//               no_asset: send.no_asset
//               // [Op.or]: [
//               //   { no_asset: data[i].anln1 },
//               //   { no_asset: (data[i].anln1 + '0').slice(2, -1) }
//               // ]
//             }
//           })
//           if (updateAset) {
//             // const send = {
//             //   no_asset: findAset.no_asset,
//             //   ...send
//             // }
//             // const updateAset = await findAset.update(send)
//             cekSync.push(updateAset)
//           } else {
//             const createAset = await asset.create(send)
//             cekSync.push(createAset)
//           }
//         }
//         if (cekSync.length > 0) {
//           const findGr = await asset.findAll({
//             where: {
//               status: '100'
//             }
//           })
//           const cekGr = []
//           if (findGr.length > 0) {
//             for (let x = 0; x < findGr.length; x++) {
//               const findApi = await axios.get(`${APP_SAP}/sap/bc/zast/?sap-client=300&pgmna=zfir0090&p_anln1=${findGr[x].no_asset}&p_bukrs=pp01&p_gjahr=${time[2]}&p_monat=${time[0]}`, { timeout: (1000 * 60 * 10) }).then(response => { return (response) }).catch(err => { return (err.isAxiosError) })
//               if (findApi.status === 200 && findApi.data.length > 0) {
//                 const findId = await asset.findByPk(findGr[x].id)
//                 const data = {
//                   status: null
//                 }
//                 await findId.update(data)
//                 cekGr.push(findId)
//               }
//             }
//             return response(res, 'success sync asset', { dataGr: cekGr })
//           } else {
//             return response(res, 'success sync asset', { dataGr: cekGr })
//           }
//         } else {
//           return response(res, 'failed sync asset2', {}, 404, false)
//         }
//       } else {
//         return response(res, 'failed sync asset3', {}, 404, false)
//       }
//     }
//   } catch (error) {
//     return response(res, error.message, {}, 500, false)
//   }
// },
