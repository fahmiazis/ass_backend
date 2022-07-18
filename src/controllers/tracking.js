const { disposal, path, ttd, mutasi, asset, clossing, stock, depo, docUser, role } = require('../models')
const response = require('../helpers/response')
const moment = require('moment')
const { Op } = require('sequelize')

module.exports = {
  getTracking: async (req, res) => {
    const kode = req.user.kode
    const name = req.user.name
    const fullname = req.user.fullname
    const level = req.user.level
    if (level === 5 || level === 9) {
      const result = await disposal.findAndCountAll({
        where: {
          kode_plant: level === 5 ? kode : name,
          [Op.not]: { no_disposal: null }
        },
        order: [
          ['id', 'DESC'],
          [{ model: ttd, as: 'appForm' }, 'id', 'DESC'],
          [{ model: ttd, as: 'ttdSet' }, 'id', 'DESC']
        ],
        include: [
          {
            model: path,
            as: 'pict'
          },
          {
            model: ttd,
            as: 'ttdSet'
          },
          {
            model: ttd,
            as: 'appForm'
          }
        ]
      })
      if (result) {
        const data = []
        result.rows.map(x => {
          return (
            data.push(x.no_disposal)
          )
        })
        const set = new Set(data)
        const noDis = [...set]
        return response(res, 'success get tracking', { result, noDis })
      } else {
        return response(res, 'failed get tracking', {}, 404, false)
      }
    } else if (level === 12 || level === 7 || level === 26 || level === 27) {
      const findDepo = await depo.findAll({
        where: {
          [Op.or]: [
            { nama_bm: level === 12 || level === 27 ? fullname : 'undefined' },
            { nama_om: level === 7 ? fullname : 'undefined' },
            { nama_asman: level === 26 ? fullname : 'undefined' }
          ]
        }
      })
      if (findDepo.length > 0) {
        const hasil = []
        for (let i = 0; i < findDepo.length; i++) {
          const result = await disposal.findAll({
            where: {
              kode_plant: findDepo[i].kode_plant,
              // [Op.or]: [
              //   { no_disposal: { [Op.like]: `%${searchValue}%` } },
              //   { nama_asset: { [Op.like]: `%${searchValue}%` } },
              //   { kategori: { [Op.like]: `%${searchValue}%` } },
              //   { keterangan: { [Op.like]: `%${searchValue}%` } }
              // ],
              [Op.not]: { no_disposal: null }
            },
            order: [
              ['id', 'DESC'],
              [{ model: ttd, as: 'appForm' }, 'id', 'DESC']
            ],
            include: [
              {
                model: ttd,
                as: 'appForm'
              },
              {
                model: path,
                as: 'pict'
              },
              {
                model: ttd,
                as: 'ttdSet'
              },
              {
                model: docUser,
                as: 'docAsset'
              }
            ]
          })
          if (result.length > 0) {
            for (let j = 0; j < result.length; j++) {
              hasil.push(result[j])
            }
          }
        }
        if (hasil.length > 0) {
          const data = []
          hasil.map(x => {
            return (
              data.push(x.no_disposal)
            )
          })
          const set = new Set(data)
          const noDis = [...set]
          const result = { rows: hasil, count: hasil.length }
          return response(res, 'success get disposal', { result, noDis })
        } else {
          const result = { rows: hasil, count: 0 }
          const noDis = []
          return response(res, 'success get disposal', { result, noDis })
        }
      } else {
        return response(res, 'failed get disposal', {}, 400, false)
      }
    } else if (level === 13 || level === 16) {
      const findRole = await role.findOne({
        where: {
          nomor: '27'
        }
      })
      const findDepo = await depo.findAll({
        where: {
          [Op.or]: [
            { nama_bm: fullname },
            { nama_om: fullname }
          ]
        }
      })
      if (findDepo.length > 0 && findRole) {
        const hasil = []
        for (let i = 0; i < findDepo.length; i++) {
          const result = await disposal.findAll({
            where: {
              kode_plant: findDepo[i].kode_plant,
              // [Op.or]: [
              //   { no_disposal: { [Op.like]: `%${searchValue}%` } },
              //   { nama_asset: { [Op.like]: `%${searchValue}%` } },
              //   { kategori: { [Op.like]: `%${searchValue}%` } },
              //   { keterangan: { [Op.like]: `%${searchValue}%` } }
              // ],
              [Op.not]: { no_disposal: null }
            },
            order: [
              ['id', 'DESC'],
              [{ model: ttd, as: 'appForm' }, 'id', 'DESC']
            ],
            include: [
              {
                model: ttd,
                as: 'appForm'
              },
              {
                model: path,
                as: 'pict'
              },
              {
                model: docUser,
                as: 'docAsset'
              },
              {
                model: ttd,
                as: 'ttdSet'
              }
            ]
          })
          if (result.length > 0) {
            for (let j = 0; j < result.length; j++) {
              hasil.push(result[j])
            }
          }
        }
        if (hasil.length > 0) {
          const tempDis = []
          hasil.map(x => {
            return (
              tempDis.push(x.no_disposal)
            )
          })
          const setDis = new Set(tempDis)
          const noSet = [...setDis]
          if (level === 13) {
            const result = await disposal.findAndCountAll({
              where: {
                kategori: 'IT',
                // [Op.or]: [
                //   { kode_plant: { [Op.like]: `%${searchValue}%` } },
                //   { no_io: { [Op.like]: `%${searchValue}%` } },
                //   { no_disposal: { [Op.like]: `%${searchValue}%` } },
                //   { nama_asset: { [Op.like]: `%${searchValue}%` } },
                //   { kategori: { [Op.like]: `%${searchValue}%` } },
                //   { keterangan: { [Op.like]: `%${searchValue}%` } }
                // ],
                [Op.not]: { no_disposal: null }
              },
              order: [
                ['id', 'DESC'],
                [{ model: ttd, as: 'appForm' }, 'id', 'DESC']
              ],
              include: [
                {
                  model: ttd,
                  as: 'appForm'
                },
                {
                  model: ttd,
                  as: 'ttdSet'
                },
                {
                  model: path,
                  as: 'pict'
                },
                {
                  model: docUser,
                  as: 'docAsset'
                }
              ]
              // ,
              // group: 'no_disposal'
            })
            if (result.rows.length > 0) {
              const data = []
              for (let i = 0; i < result.rows.length; i++) {
                if (result.rows[i].appForm.length > 0) {
                  const app = result.rows[i].appForm
                  // console.log(app.find(({ jabatan }) => jabatan === findRole.name))
                  if (app.find(({ jabatan }) => jabatan === findRole.name) === undefined) {
                    data.push(result.rows[i].no_disposal)
                  } else if (app.find(({ jabatan }) => jabatan === findRole.name) !== undefined && app.find(({ jabatan }) => jabatan === findRole.name).status !== null) {
                    data.push(result.rows[i].no_disposal)
                  }
                }
              }
              const set = new Set(data)
              const noDis = [...set]
              const newData = []
              for (let i = 0; i < result.rows.length; i++) {
                for (let j = 0; j < noDis.length; j++) {
                  if (result.rows[i].no_disposal === noDis[j]) {
                    newData.push(result.rows[i])
                  }
                }
              }
              const tempAll = hasil.concat(newData)
              const setMerge = new Set(tempAll)
              const mergeData = [...setMerge]
              const tempNo = noDis.concat(noSet)
              const setNo = new Set(tempNo)
              const mergeNo = [...setNo]
              if (newData.length) {
                const result = { rows: mergeData, count: mergeData.length }
                return response(res, 'success get disposal', { result, noDis: mergeNo })
              } else {
                const result = { rows: [], count: 0 }
                const noDis = []
                return response(res, 'success get disposal', { result, noDis })
              }
            } else {
              const result = { rows: [], count: 0 }
              const noDis = []
              return response(res, 'success get disposal', { result, noDis })
            }
          } else {
            const result = await disposal.findAndCountAll({
              where: {
                // [Op.or]: [
                //   { kode_plant: { [Op.like]: `%${searchValue}%` } },
                //   { no_io: { [Op.like]: `%${searchValue}%` } },
                //   { no_disposal: { [Op.like]: `%${searchValue}%` } },
                //   { nama_asset: { [Op.like]: `%${searchValue}%` } },
                //   { kategori: { [Op.like]: `%${searchValue}%` } },
                //   { keterangan: { [Op.like]: `%${searchValue}%` } }
                // ],
                [Op.not]: { no_disposal: null }
              },
              order: [
                ['id', 'DESC'],
                [{ model: ttd, as: 'appForm' }, 'id', 'DESC']
              ],
              include: [
                {
                  model: ttd,
                  as: 'appForm'
                },
                {
                  model: ttd,
                  as: 'ttdSet'
                },
                {
                  model: path,
                  as: 'pict'
                },
                {
                  model: docUser,
                  as: 'docAsset'
                }
              ]
              // ,
              // group: 'no_disposal'
            })
            if (result.rows.length > 0) {
              const data = []
              for (let i = 0; i < result.rows.length; i++) {
                if (result.rows[i].appForm.length > 0) {
                  const app = result.rows[i].appForm
                  if (app.find(({ jabatan }) => jabatan === findRole.name) === undefined) {
                    data.push(result.rows[i].no_disposal)
                  } else if (app.find(({ jabatan }) => jabatan === findRole.name) !== undefined && app.find(({ jabatan }) => jabatan === findRole.name).status !== null) {
                    data.push(result.rows[i].no_disposal)
                  }
                }
              }
              const set = new Set(data)
              const noDis = [...set]
              const newData = []
              for (let i = 0; i < result.rows.length; i++) {
                for (let j = 0; j < noDis.length; j++) {
                  if (result.rows[i].no_disposal === noDis[j]) {
                    newData.push(result.rows[i])
                  }
                }
              }
              const tempAll = hasil.concat(newData)
              const setMerge = new Set(tempAll)
              const mergeData = [...setMerge]
              const tempNo = noDis.concat(noSet)
              const setNo = new Set(tempNo)
              const mergeNo = [...setNo]
              if (newData.length) {
                const result = { rows: mergeData, count: mergeData.length }
                return response(res, 'success get disposal', { result, noDis: mergeNo })
              } else {
                const result = { rows: [], count: 0 }
                const noDis = []
                return response(res, 'success get disposal', { result, noDis })
              }
            } else {
              const result = { rows: [], count: 0 }
              const noDis = []
              return response(res, 'success get disposal', { result, noDis })
            }
          }
        } else {
          const tempDis = []
          const setDis = new Set(tempDis)
          const noSet = [...setDis]
          if (level === 13) {
            const result = await disposal.findAndCountAll({
              where: {
                kategori: 'IT',
                // [Op.or]: [
                //   { kode_plant: { [Op.like]: `%${searchValue}%` } },
                //   { no_io: { [Op.like]: `%${searchValue}%` } },
                //   { no_disposal: { [Op.like]: `%${searchValue}%` } },
                //   { nama_asset: { [Op.like]: `%${searchValue}%` } },
                //   { kategori: { [Op.like]: `%${searchValue}%` } },
                //   { keterangan: { [Op.like]: `%${searchValue}%` } }
                // ],
                [Op.not]: { no_disposal: null }
              },
              order: [
                ['id', 'DESC'],
                [{ model: ttd, as: 'appForm' }, 'id', 'DESC']
              ],
              include: [
                {
                  model: ttd,
                  as: 'appForm'
                },
                {
                  model: path,
                  as: 'pict'
                },
                {
                  model: ttd,
                  as: 'ttdSet'
                },
                {
                  model: docUser,
                  as: 'docAsset'
                }
              ]
              // ,
              // group: 'no_disposal'
            })
            if (result.rows.length > 0) {
              const data = []
              for (let i = 0; i < result.rows.length; i++) {
                if (result.rows[i].appForm.length > 0) {
                  const app = result.rows[i].appForm
                  // console.log(app.find(({ jabatan }) => jabatan === findRole.name))
                  if (app.find(({ jabatan }) => jabatan === findRole.name) === undefined) {
                    data.push(result.rows[i].no_disposal)
                  } else if (app.find(({ jabatan }) => jabatan === findRole.name) !== undefined && app.find(({ jabatan }) => jabatan === findRole.name).status !== null) {
                    data.push(result.rows[i].no_disposal)
                  }
                }
              }
              const set = new Set(data)
              const noDis = [...set]
              const newData = []
              for (let i = 0; i < result.rows.length; i++) {
                for (let j = 0; j < noDis.length; j++) {
                  if (result.rows[i].no_disposal === noDis[j]) {
                    newData.push(result.rows[i])
                  }
                }
              }
              const tempAll = hasil.concat(newData)
              const setMerge = new Set(tempAll)
              const mergeData = [...setMerge]
              const tempNo = noDis.concat(noSet)
              const setNo = new Set(tempNo)
              const mergeNo = [...setNo]
              if (newData.length) {
                const result = { rows: mergeData, count: mergeData.length }
                return response(res, 'success get disposal', { result, noDis: mergeNo })
              } else {
                const result = { rows: [], count: 0 }
                const noDis = []
                return response(res, 'success get disposal', { result, noDis })
              }
            } else {
              const result = { rows: [], count: 0 }
              const noDis = []
              return response(res, 'success get disposal', { result, noDis })
            }
          } else {
            const result = await disposal.findAndCountAll({
              where: {
                // [Op.or]: [
                //   { kode_plant: { [Op.like]: `%${searchValue}%` } },
                //   { no_io: { [Op.like]: `%${searchValue}%` } },
                //   { no_disposal: { [Op.like]: `%${searchValue}%` } },
                //   { nama_asset: { [Op.like]: `%${searchValue}%` } },
                //   { kategori: { [Op.like]: `%${searchValue}%` } },
                //   { keterangan: { [Op.like]: `%${searchValue}%` } }
                // ],
                [Op.not]: { no_disposal: null }
              },
              order: [
                ['id', 'DESC'],
                [{ model: ttd, as: 'appForm' }, 'id', 'DESC']
              ],
              include: [
                {
                  model: ttd,
                  as: 'appForm'
                },
                {
                  model: ttd,
                  as: 'ttdSet'
                },
                {
                  model: path,
                  as: 'pict'
                },
                {
                  model: docUser,
                  as: 'docAsset'
                }
              ]
              // ,
              // group: 'no_disposal'
            })
            if (result.rows.length > 0) {
              const data = []
              for (let i = 0; i < result.rows.length; i++) {
                if (result.rows[i].appForm.length > 0) {
                  const app = result.rows[i].appForm
                  if (app.find(({ jabatan }) => jabatan === findRole.name) === undefined) {
                    data.push(result.rows[i].no_disposal)
                  } else if (app.find(({ jabatan }) => jabatan === findRole.name) !== undefined && app.find(({ jabatan }) => jabatan === findRole.name).status !== null) {
                    data.push(result.rows[i].no_disposal)
                  }
                }
              }
              const set = new Set(data)
              const noDis = [...set]
              const newData = []
              for (let i = 0; i < result.rows.length; i++) {
                for (let j = 0; j < noDis.length; j++) {
                  if (result.rows[i].no_disposal === noDis[j]) {
                    newData.push(result.rows[i])
                  }
                }
              }
              const tempAll = hasil.concat(newData)
              const setMerge = new Set(tempAll)
              const mergeData = [...setMerge]
              const tempNo = noDis.concat(noSet)
              const setNo = new Set(tempNo)
              const mergeNo = [...setNo]
              if (newData.length) {
                const result = { rows: mergeData, count: mergeData.length }
                return response(res, 'success get disposal', { result, noDis: mergeNo })
              } else {
                const result = { rows: [], count: 0 }
                const noDis = []
                return response(res, 'success get disposal', { result, noDis })
              }
            } else {
              const result = { rows: [], count: 0 }
              const noDis = []
              return response(res, 'success get disposal', { result, noDis })
            }
          }
        }
      } else {
        return response(res, 'failed get disposal', {}, 400, false)
      }
    } else {
      const result = await disposal.findAll({
        where: {
          // [Op.or]: [
          //   { kode_plant: { [Op.like]: `%${searchValue}%` } },
          //   { no_disposal: { [Op.like]: `%${searchValue}%` } },
          //   { nama_asset: { [Op.like]: `%${searchValue}%` } },
          //   { no_asset: { [Op.like]: `%${searchValue}%` } }
          // ],
          [Op.not]: { no_disposal: null }
        },
        order: [
          ['id', 'DESC'],
          [{ model: ttd, as: 'appForm' }, 'id', 'DESC'],
          [{ model: ttd, as: 'ttdSet' }, 'id', 'DESC']
        ],
        include: [
          {
            model: ttd,
            as: 'appForm'
          },
          {
            model: path,
            as: 'pict'
          },
          {
            model: ttd,
            as: 'ttdSet'
          },
          {
            model: asset,
            as: 'dataAsset'
          },
          {
            model: docUser,
            as: 'docAsset'
          }
        ]
      })
      if (result) {
        const data = []
        result.map(x => {
          return (
            data.push(x.no_disposal)
          )
        })
        const set = new Set(data)
        const noDis = [...set]
        return response(res, 'success get disposal', { result: { rows: result, count: result.length }, noDis })
      } else {
        return response(res, 'failed get disposal', {}, 400, false)
      }
    }
  },
  getTrackMutasi: async (req, res) => {
    try {
      const kode = req.user.kode
      const level = req.user.level
      const fullname = req.user.fullname
      const cost = req.user.name
      if (level === 5 || level === 9) {
        const result = await mutasi.findAndCountAll({
          where: {
            kode_plant: level === 5 ? kode : cost,
            [Op.not]: { no_mutasi: null }
          },
          include: [
            {
              model: ttd,
              as: 'appForm'
            },
            {
              model: path,
              as: 'pict'
            },
            {
              model: asset,
              as: 'dataAsset'
            }
          ],
          order: [
            ['id', 'DESC'],
            [{ model: ttd, as: 'appForm' }, 'id', 'DESC']
          ]
        })
        if (result) {
          const data = []
          result.rows.map(x => {
            return (
              data.push(x.no_mutasi)
            )
          })
          const set = new Set(data)
          const noMut = [...set]
          return response(res, 'success get tracking', { result, noMut })
        } else {
          return response(res, 'failed to get tracking', {}, 404, false)
        }
      } else if (level === 12 || level === 7) {
        const findDepo = await depo.findAll({
          where: {
            [Op.or]: [
              { nama_bm: level === 7 ? 'undefined' : fullname },
              { nama_om: level === 12 ? 'undefined' : fullname }
            ]
          }
        })
        if (findDepo.length > 0) {
          const hasil = []
          for (let i = 0; i < findDepo.length; i++) {
            const result = await mutasi.findAll({
              where: {
                kode_plant: findDepo[i].kode_plant,
                [Op.not]: { no_mutasi: null }
                // ,
                // [Op.or]: [
                //   { kode_plant: { [Op.like]: `%${searchValue}%` } },
                //   { cost_center: { [Op.like]: `%${searchValue}%` } },
                //   { area: { [Op.like]: `%${searchValue}%` } },
                //   { no_asset: { [Op.like]: `%${searchValue}%` } },
                //   { no_mutasi: { [Op.like]: `%${searchValue}%` } }
                // ]
              },
              order: [
                ['id', 'DESC'],
                [{ model: ttd, as: 'appForm' }, 'id', 'DESC']
              ],
              include: [
                {
                  model: ttd,
                  as: 'appForm'
                },
                {
                  model: path,
                  as: 'pict'
                },
                {
                  model: docUser,
                  as: 'docAsset'
                }
              ]
            })
            if (result.length > 0) {
              for (let j = 0; j < result.length; j++) {
                hasil.push(result[j])
              }
            }
          }
          if (hasil.length > 0) {
            const data = []
            hasil.map(x => {
              return (
                data.push(x.no_mutasi)
              )
            })
            const set = new Set(data)
            const noMut = [...set]
            const result = { rows: hasil, count: hasil.length }
            return response(res, 'success get mutasi', { result, noMut })
          } else {
            const result = { rows: hasil, count: 0 }
            const noMut = []
            return response(res, 'success get mutasi', { result, noMut })
          }
        } else {
          return response(res, 'failed get mutasi', {}, 400, false)
        }
      } else if (level === 13) {
        const result = await mutasi.findAndCountAll({
          where: {
            kategori: 'IT',
            // [Op.or]: [
            //   { kode_plant: { [Op.like]: `%${searchValue}%` } },
            //   { cost_center: { [Op.like]: `%${searchValue}%` } },
            //   { area: { [Op.like]: `%${searchValue}%` } },
            //   { no_asset: { [Op.like]: `%${searchValue}%` } },
            //   { no_mutasi: { [Op.like]: `%${searchValue}%` } }
            // ],
            [Op.not]: { no_mutasi: null }
          },
          order: [
            ['id', 'DESC'],
            [{ model: ttd, as: 'appForm' }, 'id', 'DESC']
          ],
          include: [
            {
              model: ttd,
              as: 'appForm'
            },
            {
              model: path,
              as: 'pict'
            },
            {
              model: docUser,
              as: 'docAsset'
            }
          ]
        })
        if (result.rows.length > 0) {
          const data = []
          for (let i = 0; i < result.rows.length; i++) {
            data.push(result.rows[i].no_mutasi)
          }
          const set = new Set(data)
          const noMut = [...set]
          const hasil = result.rows
          // for (let i = 0; i < result.rows.length; i++) {
          //   for (let j = 0; j < noMut.length; j++) {
          //     if (result.rows[i].no_mutasi === noMut[j]) {
          //       hasil.push(result.rows[i])
          //     }
          //   }
          // }
          if (hasil.length) {
            const result = { rows: hasil, count: hasil.length }
            return response(res, 'success get mutasi', { result, noMut })
          } else {
            const result = { rows: [], count: 0 }
            const noMut = []
            return response(res, 'success get mutasi', { result, noMut })
          }
        } else {
          const result = { rows: [], count: 0 }
          const noMut = []
          return response(res, 'success get mutasi', { result, noMut })
        }
      } else {
        const result = await mutasi.findAndCountAll({
          where: {
            // [Op.or]: [
            //   { kode_plant: { [Op.like]: `%${searchValue}%` } },
            //   { cost_center: { [Op.like]: `%${searchValue}%` } },
            //   { area: { [Op.like]: `%${searchValue}%` } },
            //   { no_asset: { [Op.like]: `%${searchValue}%` } },
            //   { no_mutasi: { [Op.like]: `%${searchValue}%` } }
            // ],
            [Op.not]: { no_mutasi: null }
          },
          include: [
            {
              model: ttd,
              as: 'appForm'
            },
            {
              model: path,
              as: 'pict'
            },
            {
              model: docUser,
              as: 'docAsset'
            }
          ],
          order: [
            ['id', 'DESC'],
            [{ model: ttd, as: 'appForm' }, 'id', 'DESC']
          ]
        })
        if (result) {
          const data = []
          result.rows.map(x => {
            return (
              data.push(x.no_mutasi)
            )
          })
          const set = new Set(data)
          const noMut = [...set]
          return response(res, 'list users', { result, noMut })
        } else {
          return response(res, 'failed to get user', {}, 404, false)
        }
      }
    } catch (error) {
      return response(res, 'failed get tracking', {}, 404, false)
    }
  },
  getTrackStock: async (req, res) => {
    try {
      const kode = req.user.kode
      const level = req.user.level
      const cost = req.user.name
      const fullname = req.user.fullname
      const findClose = await clossing.findAll({
        where: {
          jenis: 'stock'
        }
      })
      if (findClose.length > 0) {
        const time = moment().format('L').split('/')
        let start = ''
        let end = ''
        if (parseInt(time[1]) >= 1 && parseInt(time[1]) <= findClose[0].end) {
          const next = moment().subtract(1, 'month').format('L').split('/')
          end = `${time[2]}-${time[0]}-${findClose[0].end}`
          start = `${next[2]}-${next[0]}-${findClose[0].start}`
        } else {
          const next = moment().add(1, 'month').format('L').split('/')
          start = `${time[2]}-${time[0]}-${findClose[0].start}`
          end = `${next[2]}-${next[0]}-${findClose[0].end}`
        }
        if (level === 5 || level === 9) {
          const result = await stock.findAll({
            where: {
              [Op.and]: [
                { kode_plant: level === 5 ? kode : cost },
                {
                  tanggalStock: {
                    [Op.lte]: end,
                    [Op.gte]: start
                  }
                }
              ],
              [Op.not]: { no_stock: null }
            },
            include: [
              {
                model: path,
                as: 'pict'
              },
              {
                model: ttd,
                as: 'appForm'
              }
            ],
            order: [
              ['id', 'ASC'],
              [{ model: ttd, as: 'appForm' }, 'id', 'DESC']
            ]
          })
          if (result) {
            return response(res, 'list asset', { result: { rows: result, count: result.length } })
          } else {
            return response(res, 'failed to get stock', {}, 404, false)
          }
        } else if (level === 7 || level === 12) {
          const findDepo = await depo.findAll({
            where: {
              [Op.or]: [
                { nama_bm: level === 7 ? 'undefined' : fullname },
                { nama_om: level === 12 ? 'undefined' : fullname }
              ]
            }
          })
          if (findDepo.length > 0) {
            const hasil = []
            for (let i = 0; i < findDepo.length; i++) {
              const result = await stock.findAll({
                group: ['no_stock'],
                where: {
                  [Op.and]: [
                    { kode_plant: findDepo[i].kode_plant }
                    // ,
                    // {
                    //   tanggalStock: {
                    //     [Op.lte]: end,
                    //     [Op.gte]: start
                    //   }
                    // }
                  ],
                  [Op.not]: { no_stock: null }
                  // ,
                  // [Op.or]: [
                  //   { no_asset: { [Op.like]: `%${searchValue}%` } },
                  //   { deskripsi: { [Op.like]: `%${searchValue}%` } },
                  //   { keterangan: { [Op.like]: `%${searchValue}%` } },
                  //   { kondisi: { [Op.like]: `%${searchValue}%` } },
                  //   { grouping: { [Op.like]: `%${searchValue}%` } }
                  // ]
                },
                include: [
                  {
                    model: ttd,
                    as: 'appForm',
                    group: ['jabatan']
                  }
                ],
                order: [
                  ['id', 'ASC'],
                  [{ model: ttd, as: 'appForm' }, 'id', 'DESC']
                ]
              })
              if (result.length > 0) {
                for (let j = 0; j < result.length; j++) {
                  hasil.push(result[j])
                }
              }
            }
            if (hasil.length > 0) {
              const result = { rows: hasil, count: hasil.length }
              return response(res, 'list stock', { result })
            } else {
              const result = { rows: hasil, count: 0 }
              return response(res, 'list stock', { result })
            }
          } else {
            return response(res, 'failed get data stock', {}, 404, false)
          }
        } else {
          const result = await stock.findAndCountAll({
            where: {
              [Op.and]: [
                {
                  [Op.or]: [
                    { status_form: level === 2 ? 9 : 1 },
                    { status_form: level === 2 ? 8 : 1 }
                  ]
                }
                // ,
                // {
                //   tanggalStock: {
                //     [Op.lte]: end,
                //     [Op.gte]: start
                //   }
                // }
              ],
              [Op.not]: { no_stock: null }
              // ,
              // [Op.or]: [
              //   { no_asset: { [Op.like]: `%${searchValue}%` } },
              //   { deskripsi: { [Op.like]: `%${searchValue}%` } },
              //   { keterangan: { [Op.like]: `%${searchValue}%` } },
              //   { kondisi: { [Op.like]: `%${searchValue}%` } },
              //   { grouping: { [Op.like]: `%${searchValue}%` } }
              // ]
            },
            include: [
              {
                model: ttd,
                as: 'appForm'
              }
            ],
            order: [
              ['id', 'ASC'],
              [{ model: ttd, as: 'appForm' }, 'id', 'DESC']
            ],
            group: ['no_stock']
          })
          if (result) {
            return response(res, 'list stock', { result })
          } else {
            return response(res, 'failed get data stock', {}, 404, false)
          }
        }
      } else {
        return response(res, 'Buat clossing untuk stock opname terlebih dahulu', {}, 400, false)
      }
    } catch (error) {
      return response(res, 'failed get tracking', {}, 404, false)
    }
  }
}
