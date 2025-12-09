const { sequelize } = require('../models')
const response = require('../helpers/response')

module.exports = {
  getDashboard: async (req, res) => {
    try {
      const { year } = req.query
      const result = await sequelize.query(`
            SELECT
              transaksi,
              COUNT(DISTINCT no_transaksi) AS totalData,
              COUNT(DISTINCT CASE WHEN status_form = 8 THEN no_transaksi END) AS finished,
              COUNT(DISTINCT CASE WHEN status_form = 0 THEN no_transaksi END) AS rejected,
              COUNT(DISTINCT CASE WHEN status_reject = 1 AND status_form != 0 THEN no_transaksi END) AS revisi
            FROM (
                SELECT m.no_mutasi AS no_transaksi, m.status_form, m.status_reject, 'mutasi' AS transaksi
                FROM mutasis m
                WHERE YEAR(m.createdAt) = :year
                
                UNION ALL
                
                SELECT d.no_disposal AS no_transaksi, d.status_form, d.status_reject, 'disposal' AS transaksi
                FROM disposals d
                WHERE YEAR(d.createdAt) = :year
                
                UNION ALL
                
                SELECT s.no_stock AS no_transaksi, s.status_form, s.status_reject, 'stock opname' AS transaksi
                FROM stocks s
                WHERE YEAR(s.createdAt) = :year
                
                UNION ALL
                
                SELECT p.no_pengadaan AS no_transaksi, p.status_form, p.status_reject, 'pengadaan' AS transaksi
                FROM pengadaans p
                WHERE YEAR(p.createdAt) = :year
            ) AS all_transactions
            GROUP BY transaksi
          `, {
        replacements: { year: year },
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
