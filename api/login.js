const bcrypt = require('bcryptjs');
const { getDb, ensureTables } = require('./_db');
const { sign } = require('./_auth');

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ error: 'method not allowed' });
  try {
    await ensureTables();
    const { email, password } = req.body || {};
    const db = getDb();
    const result = await db.execute({
      sql: 'SELECT * FROM users WHERE email=?',
      args: [(email || '').toLowerCase().trim()]
    });
    const user = result.rows[0];
    if (!user || !bcrypt.compareSync(password, user.password_hash)) {
      return res.status(401).json({ error: 'invalid email or password' });
    }
    const token = sign({ id: user.id, email: user.email });
    res.json({ token, slug: user.slug });
  } catch (e) {
    res.status(500).json({ error: String(e.message || e) });
  }
};
