#!/usr/bin/env node
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { certifyMT5DemoTelemetrySession } from '../js/core/trading/mt5DemoCertification.js';

const inputArgument = process.argv[2];
if (!inputArgument) {
  console.error('Usage: node scripts/certify_mt5_demo_trace.mjs <trace.jsonl>');
  process.exit(64);
}
const inputPath = path.resolve(inputArgument);
const stats = fs.statSync(inputPath);
if (!stats.isFile() || stats.size < 1 || stats.size > 10 * 1024 * 1024) {
  console.error('Trace must be a non-empty file no larger than 10 MB.');
  process.exit(65);
}
const bytes = fs.readFileSync(inputPath);
const lines = bytes.toString('utf8').split(/\r?\n/).filter(Boolean);
if (lines.length > 600) {
  console.error('Trace contains more than 600 records.');
  process.exit(65);
}
let records;
try {
  records = lines.map(line => JSON.parse(line));
} catch (error) {
  console.error('Trace contains invalid JSONL.');
  process.exit(65);
}
const expectedMagicText = process.env.CYBERDECK_MT5_DEMO_MAGIC || '99001';
const expectedMagic = Number(expectedMagicText);
if (!Number.isSafeInteger(expectedMagic) || expectedMagic < 0) {
  console.error('CYBERDECK_MT5_DEMO_MAGIC must be a non-negative safe integer.');
  process.exit(78);
}
const certification = certifyMT5DemoTelemetrySession(records, { expectedMagic });
const output = {
  traceFile: path.basename(inputPath),
  traceSha256: crypto.createHash('sha256').update(bytes).digest('hex'),
  generatedAt: new Date().toISOString(),
  certification
};
console.log(JSON.stringify(output, null, 2));
process.exit(certification.certified ? 0 : 2);
