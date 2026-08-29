const bcrypt = require('bcryptjs');
const { getDb, ensureTables } = require('./_db');
const { sign } = require('./_auth');

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ error: 'method not allowed' });
  try {
    await ensureTables();
    const { email, password, slug } = req.body || {};
    if (!email || !password || !slug) return res.status(400).json({ error: 'missing fields' });
    if (password.length < 6) return res.status(400).json({ error: 'password too short (min 6 chars)' });

    const hash = bcrypt.hashSync(password, 10);
    const db = getDb();
    const result = await db.execute({
      sql: 'INSERT INTO users (email, password_hash, slug) VALUES (?,?,?)',
      args: [email.toLowerCase().trim(), hash, slug.toLowerCase().trim()]
    });
    const token = sign({ id: Number(result.lastInsertRowid), email });
    res.json({ token, slug });
  } catch (e) {
    if (String(e.message || e).includes('UNIQUE')) {
      return res.status(400).json({ error: 'email or portfolio link already taken' });
    }
    res.status(500).json({ error: String(e.message || e) });
  }
};
