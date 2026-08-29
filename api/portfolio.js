const { getDb, ensureTables } = require('./_db');
const { verify } = require('./_auth');

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ error: 'method not allowed' });
  const user = verify(req);
  if (!user) return res.status(401).json({ error: 'missing or invalid token' });

  try {
    await ensureTables();
    const { name, role, about, niche, data_json } = req.body || {};
    const db = getDb();
    const existing = await db.execute({ sql: 'SELECT id FROM portfolios WHERE user_id=?', args: [user.id] });

    if (existing.rows.length) {
      await db.execute({
        sql: 'UPDATE portfolios SET name=?, role=?, about=?, niche=?, data_json=?, updated_at=CURRENT_TIMESTAMP WHERE user_id=?',
        args: [name, role, about, niche, JSON.stringify(data_json || {}), user.id]
      });
    } else {
      await db.execute({
        sql: 'INSERT INTO portfolios (user_id, name, role, about, niche, data_json) VALUES (?,?,?,?,?,?)',
        args: [user.id, name, role, about, niche, JSON.stringify(data_json || {})]
      });
    }
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: String(e.message || e) });
  }
};
