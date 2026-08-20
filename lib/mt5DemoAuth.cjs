const crypto = require('node:crypto');

const MT5_DEMO_AUTH_SCHEME = 'CyberDeck-HMAC';
const MT5_DEMO_AUTH_ALGORITHM = 'HMAC-SHA256';

function requireToken(token) {
  if (typeof token !== 'string' || token.length < 32) throw new Error('MT5_DEMO_AUTH_TOKEN_TOO_SHORT');
  return token;
}

function requestMessage(method, requestPath, timestamp, nonce) {
  return `${String(method).toUpperCase()}\n${requestPath}\n${timestamp}\n${nonce}`;
}

function createMT5DemoRequestAuth(token, {
  method = 'GET',
  requestPath = '/api/mt5/demo/stream',
  timestamp = Date.now(),
  nonce = crypto.randomBytes(16).toString('hex')
} = {}) {
  const secret = requireToken(token);
  const safeTimestamp = String(Math.trunc(Number(timestamp)));
  if (!/^\d{13}$/.test(safeTimestamp)) throw new Error('MT5_DEMO_AUTH_INVALID_TIMESTAMP');
  if (!/^[a-f0-9]{32}$/i.test(nonce)) throw new Error('MT5_DEMO_AUTH_INVALID_NONCE');
  const signature = crypto.createHmac('sha256', secret)
    .update(requestMessage(method, requestPath, safeTimestamp, nonce), 'utf8')
    .digest('hex');
  return Object.freeze({
    nonce,
    timestamp: safeTimestamp,
    signature,
    authorization: `${MT5_DEMO_AUTH_SCHEME} ${signature}`
  });
}

function createMT5DemoResponseSignature(token, nonce, body) {
  const secret = requireToken(token);
  if (!/^[a-f0-9]{32}$/i.test(nonce)) throw new Error('MT5_DEMO_AUTH_INVALID_NONCE');
  const bodyBuffer = Buffer.isBuffer(body) ? body : Buffer.from(body);
  return crypto.createHmac('sha256', secret)
    .update(nonce, 'utf8')
    .update('\n', 'utf8')
    .update(bodyBuffer)
    .digest('hex');
}

function verifyMT5DemoResponseSignature(token, nonce, body, suppliedSignature) {
  if (typeof suppliedSignature !== 'string' || !/^[a-f0-9]{64}$/i.test(suppliedSignature)) return false;
  const expected = createMT5DemoResponseSignature(token, nonce, body);
  return crypto.timingSafeEqual(Buffer.from(expected, 'hex'), Buffer.from(suppliedSignature, 'hex'));
}

module.exports = {
  MT5_DEMO_AUTH_ALGORITHM,
  MT5_DEMO_AUTH_SCHEME,
  createMT5DemoRequestAuth,
  createMT5DemoResponseSignature,
  verifyMT5DemoResponseSignature
};
