const response = require('../helpers/response')
const { notif, disposal, ttd, docuser, role, depo, user } = require('../models')
// const { Op } = require('sequelize')

module.exports = {
  getNotif: async (req, res) => {
    const name = req.user.name
    let { limit } = req.query
    if (limit) {
      limit = limit === 'null' ? null : parseInt(limit)
    } else {
      limit = 20
    }
    const result = await notif.findAll({
      where: {
        list_appr: name
      },
      order: [['id', 'DESC']],
      limit: limit
    })
    if (result.length > 0) {
      return response(res, 'success get notif', { result })
    } else {
      return response(res, 'success get notif', { result: [] })
    }
  },
  deleteNotif: async (req, res) => {
    try {
      const id = req.params.id
      const findNotif = await notif.findByPk(id)
      if (findNotif) {
        const delNotif = await findNotif.destroy()
        if (delNotif) {
          return response(res, 'success del notif')
        } else {
          return response(res, 'failed del notif', {}, 404, false)
        }
      } else {
        return response(res, 'failed del notif', {}, 404, false)
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  updateNotif: async (req, res) => {
    try {
      const id = req.params.id
      const findNotif = await notif.findByPk(id)
      if (findNotif) {
        const data = {
          status: 1
        }
        const updateNotif = await findNotif.update(data)
        if (updateNotif) {
          return response(res, 'success update notif')
        } else {
          return response(res, 'failed update notif', {}, 404, false)
        }
      } else {
        return response(res, 'failed update notif', {}, 404, false)
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  deleteAllNotif: async (req, res) => {
    try {
      const name = req.user.name
      const result = await notif.findAll({
        where: {
          list_appr: name
        }
      })
      if (result.length > 0) {
        const cek = []
        for (let i = 0; i < result.length; i++) {
          const findNotif = await notif.findByPk(result[i].id)
          if (findNotif) {
            const delNotif = await findNotif.destroy()
            if (delNotif) {
              cek.push(1)
            }
          }
        }
        if (cek.length > 0) {
          return response(res, 'success del notif')
        } else {
          return response(res, 'data not found', {}, 404, false)
        }
      } else {
        return response(res, 'data not found', {}, 404, false)
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  updateAllNotif: async (req, res) => {
    try {
      const name = req.user.name
      const result = await notif.findAll({
        where: {
          list_appr: name
        }
      })
      if (result.length > 0) {
        const cek = []
        for (let i = 0; i < result.length; i++) {
          const findNotif = await notif.findByPk(result[i].id)
          if (findNotif) {
            const data = {
              status: 1
            }
            const updateNotif = await findNotif.update(data)
            if (updateNotif) {
              cek.push(1)
            }
          }
        }
        if (cek.length > 0) {
          return response(res, 'success update notif')
        } else {
          return response(res, 'data not found', {}, 404, false)
        }
      } else {
        return response(res, 'data not found', {}, 404, false)
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  createNotifDis: async (req, res) => {
    try {
      const { tipe, act, apptipe, status } = req.query
      const no = req.params.no
      const name = req.user.name
      const level = req.user.level
      const findRole = await role.findOne({
        where: {
          nomor: level
        }
      })
      if (status === 'persetujuan') {
        const findDis = await disposal.findAll({
          where: {
            status_app: no
          }
        })
        if (findDis.length > 0 && findRole) {
          if (tipe === 'approve') {
            const findApp = await ttd.findAll({
              where: {
                no_set: no
              }
            })
            if (findApp.length > 0) {
              let hasil = 0
              let arr = null
              for (let i = 0; i < findApp.length; i++) {
                if (findRole.name === findApp[i].jabatan) {
                  hasil = findApp[i].id
                  arr = i
                }
              }
              const findDiv = await role.findOne({
                where: {
                  name: findApp[arr + 1].jabatan
                }
              })
              if (findDiv) {
                const findUser = await user.findAll({
                  where: {
                    user_level: parseInt(findDiv.nomor)
                  }
                })
                if (findUser.length > 0) {
                  const findNotif = await notif.findOne({
                    where: {
                      kode_plant: findDis[0].kode_plant,
                      no_proses: `D${findDis[0].no_disposal}`,
                      list_appr: findUser[0].username,
                      jenis: 'disposal',
                      keterangan: 'approve pengajuan'
                    }
                  })
                  if (findNotif) {
                    return response(res, 'success create notif', { hasil })
                  } else {
                    const data = {
                      kode_plant: findDis[0].kode_plant,
                      jenis: 'disposal',
                      no_proses: `D${findDis[0].no_disposal}`,
                      list_appr: findUser[0].username,
                      keterangan: 'approve pengajuan',
                      response: 'request',
                      route: 'disposal'
                    }
                    const createNot = await notif.create(data)
                    if (createNot) {
                      return response(res, 'success create notif', { hasil })
                    } else {
                      return response(res, 'failed create notif', {}, 404, false)
                    }
                  }
                } else {
                  return response(res, 'data not found', {}, 404, false)
                }
              } else {
                return response(res, 'data not found', {}, 404, false)
              }
            } else {
              return response(res, 'data not found', {}, 404, false)
            }
          } else if (tipe === 'reject') {
            if (apptipe === 'batal') {
              const findNotif = await notif.findOne({
                where: {
                  kode_plant: findDis[0].kode_plant,
                  no_proses: `D${findDis[0].no_disposal}`,
                  list_appr: findDis[0].kode_plant,
                  jenis: 'disposal',
                  keterangan: 'pembatalan transaksi persetujuan',
                  response: 'info reject'
                }
              })
              if (findNotif) {
                return response(res, 'success create notif', {})
              } else {
                const data = {
                  kode_plant: findDis[0].kode_plant,
                  jenis: 'disposal',
                  no_proses: `D${findDis[0].no_disposal}`,
                  list_appr: findDis[0].kode_plant,
                  keterangan: 'pembatalan transaksi persetujuan',
                  response: 'info reject',
                  route: '#'
                }
                const createNot = await notif.create(data)
                if (createNot) {
                  return response(res, 'success create notif', {})
                } else {
                  return response(res, 'failed create notif', {}, 404, false)
                }
              }
            } else {
              const findNotif = await notif.findOne({
                where: {
                  kode_plant: findDis[0].kode_plant,
                  no_proses: `D${findDis[0].no_disposal}`,
                  list_appr: findDis[0].kode_plant,
                  jenis: 'disposal',
                  keterangan: 'revisi data',
                  response: 'reject'
                }
              })
              if (findNotif) {
                return response(res, 'success create notif', {})
              } else {
                const data = {
                  kode_plant: findDis[0].kode_plant,
                  jenis: 'disposal',
                  no_proses: `D${findDis[0].no_disposal}`,
                  list_appr: findDis[0].kode_plant,
                  keterangan: 'revisi data',
                  response: 'reject',
                  route: 'editdis'
                }
                const createNot = await notif.create(data)
                if (createNot) {
                  return response(res, 'success create notif', {})
                } else {
                  return response(res, 'failed create notif', {}, 404, false)
                }
              }
            }
          }
        } else {
          return response(res, 'data not found', {}, 404, false)
        }
      } else {
        const findDis = await disposal.findAll({
          where: {
            no_disposal: no
          }
        })
        if (findDis.length > 0 && findRole) {
          const findDepo = await depo.findOne({
            where: {
              kode_plant: findDis[0].kode_plant
            }
          })
          if (findDepo) {
            if (tipe === 'approve') {
              const findApp = await ttd.findAll({
                where: {
                  no_doc: no
                }
              })
              if (findApp.length > 0) {
                let hasil = 0
                let arr = null
                for (let i = 0; i < findApp.length; i++) {
                  if (findRole.name === findApp[i].jabatan) {
                    hasil = findApp[i].id
                    arr = i
                  }
                }
                if (level === 11) {
                  const findUser = await user.findAll({
                    where: {
                      user_level: 2
                    }
                  })
                  if (findUser.length > 0) {
                    const findNotif = await notif.findOne({
                      where: {
                        kode_plant: findDis[0].kode_plant,
                        no_proses: `D${findDis[0].no_disposal}`,
                        list_appr: findUser[0].username,
                        jenis: 'disposal',
                        keterangan: 'selesai proses pengajuan'
                      }
                    })
                    if (findNotif) {
                      return response(res, 'success create notif', { hasil })
                    } else {
                      const data = {
                        kode_plant: findDis[0].kode_plant,
                        jenis: 'disposal',
                        no_proses: `D${findDis[0].no_disposal}`,
                        list_appr: findUser[0].username,
                        keterangan: 'selesai proses pengajuan',
                        response: 'request submit persetujuan',
                        route: 'disposal'
                      }
                      const createNot = await notif.create(data)
                      if (createNot) {
                        return response(res, 'success create notif', { hasil })
                      } else {
                        return response(res, 'failed create notif', {}, 404, false)
                      }
                    }
                  } else {
                    return response(res, 'data not found', {}, 404, false)
                  }
                } else {
                  if (apptipe === 'area') {
                    const findDiv = await role.findOne({
                      where: {
                        name: findApp[arr + 1].jabatan
                      }
                    })
                    if (findDiv) {
                      const findUser = await user.findAll({
                        where: {
                          user_level: parseInt(findDiv.nomor)
                        }
                      })
                      if (findUser.length > 0) {
                        const cek = []
                        for (let i = 0; i < findUser.length; i++) {
                          if (findUser[i].username === findDepo.nama_bm) {
                            cek.push(findUser[i])
                          } else if (findUser[i].username === findDepo.nama_nom) {
                            cek.push(findUser[i])
                          } else if (findUser[i].username === findDepo.nama_om) {
                            cek.push(findUser[i])
                          } else if (findUser[i].username === findDepo.nama_asman) {
                            cek.push(findUser[i])
                          }
                        }
                        if (cek.length > 0) {
                          const findNotif = await notif.findOne({
                            where: {
                              kode_plant: findDis[0].kode_plant,
                              no_proses: `D${findDis[0].no_disposal}`,
                              list_appr: cek[0].username,
                              jenis: 'disposal',
                              keterangan: 'approve pengajuan'
                            }
                          })
                          if (findNotif) {
                            return response(res, 'success create notif', { hasil })
                          } else {
                            const data = {
                              kode_plant: findDis[0].kode_plant,
                              jenis: 'disposal',
                              no_proses: `D${findDis[0].no_disposal}`,
                              list_appr: cek[0].username,
                              keterangan: 'approve pengajuan',
                              response: 'request',
                              route: 'disposal'
                            }
                            const createNot = await notif.create(data)
                            if (createNot) {
                              return response(res, 'success create notif', { hasil })
                            } else {
                              return response(res, 'failed create notif', {}, 404, false)
                            }
                          }
                        } else {
                          return response(res, 'data not found', {}, 404, false)
                        }
                      } else {
                        return response(res, 'data not found', {}, 404, false)
                      }
                    } else {
                      return response(res, 'data not found', {}, 404, false)
                    }
                  } else {
                    const findDiv = await role.findOne({
                      where: {
                        name: findApp[arr + 1].jabatan
                      }
                    })
                    if (findDiv) {
                      const findUser = await user.findAll({
                        where: {
                          user_level: parseInt(findDiv.nomor)
                        }
                      })
                      if (findUser.length > 0) {
                        const findNotif = await notif.findOne({
                          where: {
                            kode_plant: findDis[0].kode_plant,
                            no_proses: `D${findDis[0].no_disposal}`,
                            list_appr: findUser[0].username,
                            jenis: 'disposal',
                            keterangan: 'approve pengajuan'
                          }
                        })
                        if (findNotif) {
                          return response(res, 'success create notif', { hasil })
                        } else {
                          const data = {
                            kode_plant: findDis[0].kode_plant,
                            jenis: 'disposal',
                            no_proses: `D${findDis[0].no_disposal}`,
                            list_appr: findUser[0].username,
                            keterangan: 'approve pengajuan',
                            response: 'request',
                            route: 'disposal'
                          }
                          const createNot = await notif.create(data)
                          if (createNot) {
                            return response(res, 'success create notif', { hasil })
                          } else {
                            return response(res, 'failed create notif', {}, 404, false)
                          }
                        }
                      } else {
                        return response(res, 'data not found', {}, 404, false)
                      }
                    } else {
                      return response(res, 'data not found', {}, 404, false)
                    }
                  }
                }
              } else {
                return response(res, 'data not found', {}, 404, false)
              }
            } else if (tipe === 'reject') {
              if (apptipe === 'batal') {
                const findNotif = await notif.findOne({
                  where: {
                    kode_plant: findDis[0].kode_plant,
                    no_proses: `D${findDis[0].no_disposal}`,
                    list_appr: findDepo.kode_plant,
                    jenis: 'disposal',
                    keterangan: 'pembatalan transaksi',
                    response: 'info reject'
                  }
                })
                if (findNotif) {
                  return response(res, 'success create notif', {})
                } else {
                  const data = {
                    kode_plant: findDis[0].kode_plant,
                    jenis: 'disposal',
                    no_proses: `D${findDis[0].no_disposal}`,
                    list_appr: findDepo.kode_plant,
                    keterangan: 'pembatalan transaksi',
                    response: 'info reject',
                    route: '#'
                  }
                  const createNot = await notif.create(data)
                  if (createNot) {
                    return response(res, 'success create notif', {})
                  } else {
                    return response(res, 'failed create notif', {}, 404, false)
                  }
                }
              } else {
                const findNotif = await notif.findOne({
                  where: {
                    kode_plant: findDis[0].kode_plant,
                    no_proses: `D${findDis[0].no_disposal}`,
                    list_appr: findDepo.kode_plant,
                    jenis: 'disposal',
                    keterangan: 'revisi data',
                    response: 'reject'
                  }
                })
                if (findNotif) {
                  return response(res, 'success create notif', {})
                } else {
                  const data = {
                    kode_plant: findDis[0].kode_plant,
                    jenis: 'disposal',
                    no_proses: `D${findDis[0].no_disposal}`,
                    list_appr: findDepo.kode_plant,
                    keterangan: 'revisi data',
                    response: 'reject',
                    route: 'editdis'
                  }
                  const createNot = await notif.create(data)
                  if (createNot) {
                    return response(res, 'success create notif', {})
                  } else {
                    return response(res, 'failed create notif', {}, 404, false)
                  }
                }
              }
            } else if (tipe === 'proses') {
              if (apptipe === 'submitpurch') {
                const findNotif = await notif.findOne({
                  where: {
                    kode_plant: findDis[0].kode_plant,
                    no_proses: `D${findDis[0].no_disposal}`,
                    list_appr: findDepo.nama_bm,
                    jenis: 'disposal',
                    keterangan: 'selesai proses purchasing',
                    response: 'request approve'
                  }
                })
                if (findNotif) {
                  return response(res, 'success create notif', {})
                } else {
                  const data = {
                    kode_plant: findDis[0].kode_plant,
                    jenis: 'disposal',
                    no_proses: `D${findDis[0].no_disposal}`,
                    list_appr: findDepo.kode_plant,
                    keterangan: 'selesai proses purchasing',
                    response: 'request approve',
                    route: 'disposal'
                  }
                  const createNot = await notif.create(data)
                  if (createNot) {
                    return response(res, 'success create notif', {})
                  } else {
                    return response(res, 'failed create notif', {}, 404, false)
                  }
                }
              }
            }
            // else if (tipe === 'rejdoc') {

            // }
          } else {
            return response(res, 'data not found', {}, 404, false)
          }
        } else {
          return response(res, 'data not found', {}, 404, false)
        }
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  }
  // ,
  // createNotifMut: async (req, res) => {
  //   try {
  //   } catch (error) {
  //     return response(res, error.message, {}, 500, false)
  //   }
  // },
  // createNotifIo: async (req, res) => {
  //   try {
  //   } catch (error) {
  //     return response(res, error.message, {}, 500, false)
  //   }
  // },
  // createNotifStock: async (req, res) => {
  //   try {
  //   } catch (error) {
  //     return response(res, error.message, {}, 500, false)
  //   }
  // }
}
