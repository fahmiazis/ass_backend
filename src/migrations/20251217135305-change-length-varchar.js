'use strict'

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // =====================
    // TABLE: disposals
    // =====================
    await queryInterface.changeColumn('disposals', 'kode_plant', {
      type: Sequelize.STRING(100),
      allowNull: true
    })

    await queryInterface.changeColumn('disposals', 'area', {
      type: Sequelize.STRING(100),
      allowNull: true
    })

    await queryInterface.changeColumn('disposals', 'no_io', {
      type: Sequelize.STRING(100),
      allowNull: true
    })

    await queryInterface.changeColumn('disposals', 'no_disposal', {
      type: Sequelize.STRING(100),
      allowNull: true
    })

    await queryInterface.changeColumn('disposals', 'no_doc', {
      type: Sequelize.STRING(100),
      allowNull: true
    })

    await queryInterface.changeColumn('disposals', 'no_asset', {
      type: Sequelize.STRING(100),
      allowNull: true
    })

    await queryInterface.changeColumn('disposals', 'nama_asset', {
      type: Sequelize.STRING(100),
      allowNull: true
    })

    await queryInterface.changeColumn('disposals', 'merk', {
      type: Sequelize.STRING(100),
      allowNull: true
    })

    await queryInterface.changeColumn('disposals', 'cost_center', {
      type: Sequelize.STRING(100),
      allowNull: true
    })

    await queryInterface.changeColumn('disposals', 'nilai_buku', {
      type: Sequelize.STRING(100),
      allowNull: true
    })

    await queryInterface.changeColumn('disposals', 'nilai_jual', {
      type: Sequelize.STRING(100),
      allowNull: true
    })

    await queryInterface.changeColumn('disposals', 'no_persetujuan', {
      type: Sequelize.STRING(100),
      allowNull: true
    })

    await queryInterface.changeColumn('disposals', 'nominal', {
      type: Sequelize.STRING(100),
      allowNull: true
    })

    await queryInterface.changeColumn('disposals', 'no_sap', {
      type: Sequelize.STRING(100),
      allowNull: true
    })

    await queryInterface.changeColumn('disposals', 'no_fp', {
      type: Sequelize.STRING(100),
      allowNull: true
    })

    await queryInterface.changeColumn('disposals', 'doc_sap', {
      type: Sequelize.STRING(100),
      allowNull: true
    })

    await queryInterface.changeColumn('disposals', 'doc_clearing', {
      type: Sequelize.STRING(100),
      allowNull: true
    })

    await queryInterface.changeColumn('disposals', 'nilai_buku_eks', {
      type: Sequelize.STRING(100),
      allowNull: true
    })

    await queryInterface.changeColumn('disposals', 'menu_rev', {
      type: Sequelize.STRING(100),
      allowNull: true
    })

    await queryInterface.changeColumn('disposals', 'user_rev', {
      type: Sequelize.STRING(100),
      allowNull: true
    })

    await queryInterface.changeColumn('disposals', 'pic_aset', {
      type: Sequelize.STRING(100),
      allowNull: true
    })

    await queryInterface.changeColumn('disposals', 'pic_budget', {
      type: Sequelize.STRING(100),
      allowNull: true
    })

    await queryInterface.changeColumn('disposals', 'pic_tax', {
      type: Sequelize.STRING(100),
      allowNull: true
    })

    await queryInterface.changeColumn('disposals', 'pic_purch', {
      type: Sequelize.STRING(100),
      allowNull: true
    })

    await queryInterface.changeColumn('disposals', 'pic_finance', {
      type: Sequelize.STRING(100),
      allowNull: true
    })

    await queryInterface.changeColumn('disposals', 'ceo', {
      type: Sequelize.STRING(100),
      allowNull: true
    })

    await queryInterface.changeColumn('disposals', 'gl_debit', {
      type: Sequelize.STRING(100),
      allowNull: true
    })

    await queryInterface.changeColumn('disposals', 'gl_credit', {
      type: Sequelize.STRING(100),
      allowNull: true
    })

    // =====================
    // TABLE: mutasis
    // =====================
    await queryInterface.changeColumn('mutasis', 'kode_plant', {
      type: Sequelize.STRING(100),
      allowNull: true
    })

    await queryInterface.changeColumn('mutasis', 'area', {
      type: Sequelize.STRING(100),
      allowNull: true
    })

    await queryInterface.changeColumn('mutasis', 'no_mutasi', {
      type: Sequelize.STRING(100),
      allowNull: true
    })

    await queryInterface.changeColumn('mutasis', 'no_doc', {
      type: Sequelize.STRING(100),
      allowNull: true
    })

    await queryInterface.changeColumn('mutasis', 'no_asset', {
      type: Sequelize.STRING(100),
      allowNull: true
    })

    await queryInterface.changeColumn('mutasis', 'nama_asset', {
      type: Sequelize.STRING(100),
      allowNull: true
    })

    await queryInterface.changeColumn('mutasis', 'merk', {
      type: Sequelize.STRING(100),
      allowNull: true
    })

    await queryInterface.changeColumn('mutasis', 'cost_center', {
      type: Sequelize.STRING(100),
      allowNull: true
    })

    await queryInterface.changeColumn('mutasis', 'cost_center_rec', {
      type: Sequelize.STRING(100),
      allowNull: true
    })

    await queryInterface.changeColumn('mutasis', 'area_rec', {
      type: Sequelize.STRING(100),
      allowNull: true
    })

    await queryInterface.changeColumn('mutasis', 'kode_plant_rec', {
      type: Sequelize.STRING(100),
      allowNull: true
    })

    await queryInterface.changeColumn('mutasis', 'doc_sap', {
      type: Sequelize.STRING(100),
      allowNull: true
    })

    await queryInterface.changeColumn('mutasis', 'no_io', {
      type: Sequelize.STRING(100),
      allowNull: true
    })

    await queryInterface.changeColumn('mutasis', 'cost_centerawal', {
      type: Sequelize.STRING(100),
      allowNull: true
    })

    await queryInterface.changeColumn('mutasis', 'menu_rev', {
      type: Sequelize.STRING(100),
      allowNull: true
    })

    await queryInterface.changeColumn('mutasis', 'user_rev', {
      type: Sequelize.STRING(100),
      allowNull: true
    })

    await queryInterface.changeColumn('mutasis', 'pic_aset', {
      type: Sequelize.STRING(100),
      allowNull: true
    })

    await queryInterface.changeColumn('mutasis', 'pic_budget', {
      type: Sequelize.STRING(100),
      allowNull: true
    })

    await queryInterface.changeColumn('mutasis', 'message_sap', {
      type: Sequelize.TEXT,
      allowNull: true
    })

    // =====================
    // TABLE: stocks
    // =====================
    await queryInterface.changeColumn('stocks', 'kode_plant', {
      type: Sequelize.STRING(100),
      allowNull: true
    })

    await queryInterface.changeColumn('stocks', 'area', {
      type: Sequelize.STRING(100),
      allowNull: true
    })

    await queryInterface.changeColumn('stocks', 'no_asset', {
      type: Sequelize.STRING(100),
      allowNull: true
    })

    await queryInterface.changeColumn('stocks', 'deskripsi', {
      type: Sequelize.STRING(100),
      allowNull: true
    })

    await queryInterface.changeColumn('stocks', 'merk', {
      type: Sequelize.STRING(100),
      allowNull: true
    })

    await queryInterface.changeColumn('stocks', 'satuan', {
      type: Sequelize.STRING(100),
      allowNull: true
    })

    await queryInterface.changeColumn('stocks', 'unit', {
      type: Sequelize.STRING(100),
      allowNull: true
    })

    await queryInterface.changeColumn('stocks', 'kondisi', {
      type: Sequelize.STRING(100),
      allowNull: true
    })

    await queryInterface.changeColumn('stocks', 'grouping', {
      type: Sequelize.STRING(100),
      allowNull: true
    })

    await queryInterface.changeColumn('stocks', 'no_stock', {
      type: Sequelize.STRING(100),
      allowNull: true
    })

    await queryInterface.changeColumn('stocks', 'status_fisik', {
      type: Sequelize.STRING(100),
      allowNull: true
    })

    await queryInterface.changeColumn('stocks', 'menu_rev', {
      type: Sequelize.STRING(100),
      allowNull: true
    })

    await queryInterface.changeColumn('stocks', 'image', {
      type: Sequelize.STRING(100),
      allowNull: true
    })

    await queryInterface.changeColumn('stocks', 'user_rev', {
      type: Sequelize.STRING(100),
      allowNull: true
    })

    await queryInterface.changeColumn('stocks', 'pic_aset', {
      type: Sequelize.STRING(100),
      allowNull: true
    })

    await queryInterface.changeColumn('stocks', 'nilai_buku', {
      type: Sequelize.STRING(100),
      allowNull: true
    })

    await queryInterface.changeColumn('stocks', 'nilai_acquis', {
      type: Sequelize.STRING(100),
      allowNull: true
    })

    await queryInterface.changeColumn('stocks', 'accum_dep', {
      type: Sequelize.STRING(100),
      allowNull: true
    })

    // =====================
    // TABLE: pengadaans
    // =====================
    await queryInterface.changeColumn('pengadaans', 'no_io', {
      type: Sequelize.STRING(100),
      allowNull: true
    })

    await queryInterface.changeColumn('pengadaans', 'no_doc', {
      type: Sequelize.STRING(100),
      allowNull: true
    })

    await queryInterface.changeColumn('pengadaans', 'no_asset', {
      type: Sequelize.STRING(100),
      allowNull: true
    })

    await queryInterface.changeColumn('pengadaans', 'qty', {
      type: Sequelize.STRING(100),
      allowNull: true
    })

    await queryInterface.changeColumn('pengadaans', 'nama', {
      type: Sequelize.STRING(100),
      allowNull: true
    })

    await queryInterface.changeColumn('pengadaans', 'price', {
      type: Sequelize.STRING(100),
      allowNull: true
    })

    await queryInterface.changeColumn('pengadaans', 'total', {
      type: Sequelize.STRING(100),
      allowNull: true
    })

    await queryInterface.changeColumn('pengadaans', 'kode_plant', {
      type: Sequelize.STRING(100),
      allowNull: true
    })

    await queryInterface.changeColumn('pengadaans', 'no_pengadaan', {
      type: Sequelize.STRING(100),
      allowNull: true
    })

    await queryInterface.changeColumn('pengadaans', 'ticket_code', {
      type: Sequelize.STRING(100),
      allowNull: true
    })

    await queryInterface.changeColumn('pengadaans', 'isBudget', {
      type: Sequelize.STRING(100),
      allowNull: true
    })

    await queryInterface.changeColumn('pengadaans', 'isAsset', {
      type: Sequelize.STRING(100),
      allowNull: true
    })

    await queryInterface.changeColumn('pengadaans', 'uom', {
      type: Sequelize.STRING(100),
      allowNull: true
    })

    await queryInterface.changeColumn('pengadaans', 'setup_date', {
      type: Sequelize.STRING(100),
      allowNull: true
    })

    await queryInterface.changeColumn('pengadaans', 'asset_token', {
      type: Sequelize.STRING(100),
      allowNull: true
    })

    await queryInterface.changeColumn('pengadaans', 'bidding_harga', {
      type: Sequelize.STRING(100),
      allowNull: true
    })

    await queryInterface.changeColumn('pengadaans', 'ket_barang', {
      type: Sequelize.STRING(100),
      allowNull: true
    })

    await queryInterface.changeColumn('pengadaans', 'area', {
      type: Sequelize.STRING(100),
      allowNull: true
    })

    await queryInterface.changeColumn('pengadaans', 'status_form', {
      type: Sequelize.STRING(100),
      allowNull: true
    })

    await queryInterface.changeColumn('pengadaans', 'tipe', {
      type: Sequelize.STRING(100),
      allowNull: true
    })

    await queryInterface.changeColumn('pengadaans', 'akta', {
      type: Sequelize.STRING(100),
      allowNull: true
    })

    await queryInterface.changeColumn('pengadaans', 'menu_rev', {
      type: Sequelize.STRING(100),
      allowNull: true
    })

    await queryInterface.changeColumn('pengadaans', 'no_ref', {
      type: Sequelize.STRING(100),
      allowNull: true
    })

    await queryInterface.changeColumn('pengadaans', 'user_rev', {
      type: Sequelize.STRING(100),
      allowNull: true
    })

    await queryInterface.changeColumn('pengadaans', 'pic_aset', {
      type: Sequelize.STRING(100),
      allowNull: true
    })

    await queryInterface.changeColumn('pengadaans', 'pic_budget', {
      type: Sequelize.STRING(100),
      allowNull: true
    })
  },

  down: async (queryInterface, Sequelize) => {
    // =====================
    // ROLLBACK: disposals
    // =====================
    const disposalFields = [
      'kode_plant', 'area', 'no_io', 'no_disposal', 'no_doc', 'no_asset',
      'nama_asset', 'merk', 'cost_center', 'nilai_buku', 'nilai_jual',
      'no_persetujuan', 'nominal', 'no_sap', 'no_fp',
      'doc_sap', 'doc_clearing', 'nilai_buku_eks', 'menu_rev', 'user_rev',
      'pic_aset', 'pic_budget', 'pic_tax', 'pic_purch', 'pic_finance',
      'ceo', 'gl_debit', 'gl_credit'
    ]

    for (const field of disposalFields) {
      await queryInterface.changeColumn('disposals', field, {
        type: Sequelize.STRING(255),
        allowNull: true
      })
    }

    // =====================
    // ROLLBACK: mutasis
    // =====================
    const mutasiFields = [
      'kode_plant', 'area', 'no_mutasi', 'no_doc', 'no_asset', 'nama_asset',
      'merk', 'cost_center', 'cost_center_rec', 'area_rec', 'kode_plant_rec',
      'doc_sap', 'no_io', 'cost_centerawal', 'menu_rev',
      'user_rev', 'pic_aset', 'pic_budget'
    ]

    for (const field of mutasiFields) {
      await queryInterface.changeColumn('mutasis', field, {
        type: Sequelize.STRING(255),
        allowNull: true
      })
    }

    // Rollback message_sap ke VARCHAR(255)
    await queryInterface.changeColumn('mutasis', 'message_sap', {
      type: Sequelize.STRING(255),
      allowNull: true
    })

    // =====================
    // ROLLBACK: stocks
    // =====================
    const stockFields = [
      'kode_plant', 'area', 'no_asset', 'deskripsi', 'merk', 'satuan',
      'unit', 'kondisi', 'grouping', 'no_stock',
      'status_fisik', 'menu_rev', 'image', 'user_rev', 'pic_aset',
      'nilai_buku', 'nilai_acquis', 'accum_dep'
    ]

    for (const field of stockFields) {
      await queryInterface.changeColumn('stocks', field, {
        type: Sequelize.STRING(255),
        allowNull: true
      })
    }

    // =====================
    // ROLLBACK: pengadaans
    // =====================
    const pengadaanFields = [
      'no_io', 'no_doc', 'no_asset', 'qty', 'nama', 'price', 'total',
      'kode_plant', 'no_pengadaan', 'ticket_code', 'isBudget',
      'isAsset', 'uom', 'setup_date', 'asset_token', 'bidding_harga',
      'ket_barang', 'area', 'status_form', 'tipe', 'akta',
      'menu_rev', 'no_ref', 'user_rev', 'pic_aset', 'pic_budget'
    ]

    for (const field of pengadaanFields) {
      await queryInterface.changeColumn('pengadaans', field, {
        type: Sequelize.STRING(255),
        allowNull: true
      })
    }
  }
}
