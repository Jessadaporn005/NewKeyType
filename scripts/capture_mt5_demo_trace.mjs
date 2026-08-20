#!/usr/bin/env node
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { createMT5DemoRequestAuth, verifyMT5DemoResponseSignature } = require('../lib/mt5DemoAuth.cjs');

const token = process.env.CYBERDECK_MT5_DEMO_TOKEN || '';
const endpoint = 'http://127.0.0.1:5055/api/mt5/demo/stream';
const requestedPackets = Number.parseInt(process.argv.find(arg => arg.startsWith('--packets='))?.split('=')[1] || '31', 10);
const targetPackets = Math.max(31, Math.min(600, requestedPackets || 31));

if (token.length < 32) {
  console.error('CYBERDECK_MT5_DEMO_TOKEN must contain at least 32 characters.');
  process.exit(78);
}

let captured = 0;
let consecutiveErrors = 0;
let lastSequence = 0;
const captureStartedAt = Date.now();
const captureDeadline = captureStartedAt + Math.min(600_000, Math.max(60_000, targetPackets * 4_000));
let lastProgressAt = captureStartedAt;
while (captured < targetPackets) {
  if (Date.now() > captureDeadline) {
    console.error(`Capture deadline exceeded after ${captured}/${targetPackets} packets.`);
    process.exit(2);
  }
  const startedAt = Date.now();
  try {
    const requestAuth = createMT5DemoRequestAuth(token);
    const response = await fetch(endpoint, {
      method: 'GET',
      cache: 'no-store',
      signal: AbortSignal.timeout(1500),
      headers: {
        Authorization: requestAuth.authorization,
        'X-CyberDeck-Timestamp': requestAuth.timestamp,
        'X-CyberDeck-Nonce': requestAuth.nonce,
        Accept: 'application/json'
      }
    });
    const body = Buffer.from(await response.arrayBuffer());
    if (!response.ok) throw new Error(`MT5_DEMO_HTTP_${response.status}`);
    if (!String(response.headers.get('content-type') || '').toLowerCase().startsWith('application/json')) {
      throw new Error('MT5_DEMO_INVALID_CONTENT_TYPE');
    }
    if (!verifyMT5DemoResponseSignature(token, requestAuth.nonce, body, response.headers.get('x-cyberdeck-response-hmac'))) {
      throw new Error('MT5_DEMO_RESPONSE_AUTHENTICATION_FAILED');
    }
    const packet = JSON.parse(body.toString('utf8'));
    if (packet?.connected !== true || packet?.mode !== 'DEMO') {
      throw new Error(`MT5_DEMO_NOT_CONNECTED:${packet?.reason || packet?.status || 'UNKNOWN'}`);
    }
    const sequence = Number(packet?.sequence);
    if (Number.isInteger(sequence) && sequence > lastSequence) {
      process.stdout.write(`${JSON.stringify({ observedAt: Date.now(), transportAuthenticated: true, packet })}\n`);
      lastSequence = sequence;
      captured += 1;
      consecutiveErrors = 0;
      lastProgressAt = Date.now();
    }
  } catch (error) {
    consecutiveErrors += 1;
    console.error(`Capture error: ${error?.message || 'UNKNOWN_ERROR'}`);
    if (consecutiveErrors >= 5) process.exit(2);
  }
  if (Date.now() - lastProgressAt > 10_000) {
    console.error(`Capture stalled at sequence ${lastSequence}; no fresh packet arrived for 10 seconds.`);
    process.exit(2);
  }
  const remainingDelay = Math.max(50, 500 - (Date.now() - startedAt));
  await new Promise(resolve => setTimeout(resolve, remainingDelay));
}

console.error(`Captured ${captured} authenticated MT5 Demo packets. Trace contains account metadata; keep it local.`);
