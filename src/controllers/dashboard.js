const { sequelize } = require('../models')
const response = require('../helpers/response')

module.exports = {
  getDashboard: async (req, res) => {
    try {
      const result = await sequelize.query(`
            SELECT
              r.transaksi,
              COUNT(r.id) AS totalData,
              COUNT(CASE WHEN rel.status_form = 8 THEN r.id END) AS finished,
              COUNT(CASE WHEN rel.status_form = 0 THEN r.id END) AS rejected,
              COUNT(CASE WHEN rel.status_reject = 1 AND rel.status_form != 0 THEN r.id END) AS revisi
            FROM reservoirs r
            LEFT JOIN (
                SELECT no_mutasi AS no_transaksi, status_form, status_reject FROM mutasis
                UNION ALL
                SELECT no_disposal AS no_transaksi, status_form, status_reject FROM disposals
                UNION ALL
                SELECT no_stock AS no_transaksi, status_form, status_reject FROM stocks
                UNION ALL
                SELECT no_pengadaan AS no_transaksi, status_form, status_reject FROM pengadaans
            ) rel ON rel.no_transaksi = r.no_transaksi
            WHERE r.status = 'used'
              AND YEAR(r.createdAt) = :year
            GROUP BY r.transaksi
          `, {
        replacements: { year: 2025 },
        type: sequelize.QueryTypes.SELECT
      })
      if (result) {
        return response(res, 'get dashboard success', { result })
      } else {
        return response(res, 'get dashboard failed', {}, 400, false)
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  }
}
