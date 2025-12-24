const jwt = require('jsonwebtoken');

function signSession(payload) {
  const secret = process.env.SESSION_SECRET;
  if (!secret) throw new Error('SESSION_SECRET env required');
  return jwt.sign(payload, secret, { expiresIn: '7d' });
}

function verifySession(token) {
  const secret = process.env.SESSION_SECRET;
  if (!secret) throw new Error('SESSION_SECRET env required');
  try {
    return jwt.verify(token, secret);
  } catch {
    return null;
  }
}

function getUserFromRequest(req) {
  const cookie = req.headers.cookie || '';
  const match = cookie.split(';').map(s => s.trim()).find(s => s.startsWith('session='));
  if (!match) return null;
  const token = decodeURIComponent(match.split('=')[1] || '');
  return verifySession(token);
}

function setSessionCookie(res, payload) {
  const token = encodeURIComponent(signSession(payload));
  const secure = process.env.SESSION_COOKIE_SECURE === 'true';
  const parts = [
    `session=${token}`,
    'Path=/',
    'HttpOnly',
    `Max-Age=${7 * 24 * 60 * 60}`
  ];
  if (secure) {
    parts.push('Secure');
    parts.push('SameSite=None');
  } else {
    parts.push('SameSite=Lax');
  }
  res.setHeader('Set-Cookie', parts.join('; '));
}

function clearSessionCookie(res) {
  const parts = [
    'session=',
    'Path=/',
    'HttpOnly',
    'Max-Age=0'
  ];
  const secure = process.env.SESSION_COOKIE_SECURE === 'true';
  if (secure) {
    parts.push('Secure');
    parts.push('SameSite=None');
  } else {
    parts.push('SameSite=Lax');
  }
  res.setHeader('Set-Cookie', parts.join('; '));
}

module.exports = { getUserFromRequest, setSessionCookie, clearSessionCookie };
