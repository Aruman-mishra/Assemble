const { verify } = require('./_auth');

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ error: 'method not allowed' });
  const user = verify(req);
  if (!user) return res.status(401).json({ error: 'missing or invalid token' });

  const { sourceText, niche } = req.body || {};
  if (!sourceText || sourceText.trim().length < 20) {
    return res.status(400).json({ error: 'paste more detail (resume text, GitHub bio, LinkedIn summary etc.)' });
  }
  if (!process.env.GEMINI_API_KEY) {
    return res.status(500).json({ error: 'AI not configured yet — add GEMINI_API_KEY in Vercel → Settings → Environment Variables' });
  }

  try {
    const prompt = `You are writing concise website copy for a ${niche || 'general'} portfolio, based on the source material below. Be specific and factual to the source — do not invent achievements.

Source material:
"""
${sourceText.slice(0, 6000)}
"""

Return ONLY raw JSON (no markdown fences, no preamble) in this exact shape:
{"name":"","role":"","about":"(35-45 words)","blocks":[{"title":"","body":"(1-2 sentences)"},{"title":"","body":""},{"title":"","body":""}]}`;

    const model = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
    const r = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': process.env.GEMINI_API_KEY
        },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          generationConfig: { maxOutputTokens: 700, temperature: 0.7 }
        })
      }
    );
    const data = await r.json();
    if (data.error) return res.status(500).json({ error: data.error.message || 'AI request failed' });
    const text = data.candidates?.[0]?.content?.parts?.map(p => p.text || '').join('') || '{}';
    const clean = text.replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(clean);
    res.json(parsed);
  } catch (e) {
    res.status(500).json({ error: 'generation failed', detail: String(e.message || e) });
  }
};
