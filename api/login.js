const { setSessionCookie } = require('../lib/session');

module.exports = async (req, res) => {
  try {
    const chunks = [];
    req.on('data', d => chunks.push(d));
    await new Promise(r => req.on('end', r));
    const body = JSON.parse(Buffer.concat(chunks).toString() || '{}');
    const u = (body.username || '').toLowerCase();
    const p = body.password || '';
    const envAdminU = process.env.ADMIN_USER || 'admin';
    const envAdminP = process.env.ADMIN_PASSWORD || 'admin123';
    const envUserU = process.env.SECRETARY_USER || 'user';
    const envUserP = process.env.SECRETARY_PASSWORD || 'user123';
    let role = null;
    let fullName = null;
    if (u === envAdminU.toLowerCase() && p === envAdminP) {
      role = 'chairman';
      fullName = 'رئيس الاجتماع';
    } else if (u === envUserU.toLowerCase() && p === envUserP) {
      role = 'secretary';
      fullName = 'مقرر الاجتماع';
    }
    if (!role) {
      res.statusCode = 401;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ success: false }));
      return;
    }
    setSessionCookie(res, { username: u, role, fullName });
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ success: true }));
  } catch {
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ success: false }));
  }
};
