const { getDb, ensureTables } = require('../_db');

module.exports = async (req, res) => {
  try {
    await ensureTables();
    const { slug } = req.query;
    const db = getDb();
    const userRes = await db.execute({ sql: 'SELECT * FROM users WHERE slug=?', args: [slug] });
    const user = userRes.rows[0];
    if (!user) return res.status(404).json({ error: 'no portfolio at this link' });

    const pfRes = await db.execute({ sql: 'SELECT * FROM portfolios WHERE user_id=?', args: [user.id] });
    const portfolio = pfRes.rows[0];
    if (!portfolio) return res.status(404).json({ error: 'this user has not published yet' });

    res.json({ ...portfolio, data_json: JSON.parse(portfolio.data_json || '{}') });
  } catch (e) {
    res.status(500).json({ error: String(e.message || e) });
  }
};
