import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { createRequire } from 'node:module';
import { migrateProfile, PROFILE_SCHEMA_VERSION } from './js/profileStore.js';
import { createMLShadowModel } from './js/core/trading/mlShadowModel.js';

const require = createRequire(import.meta.url);
const { AtomicJsonStore, STORE_FORMAT, STORE_SCHEMA_VERSION } = require('./lib/atomicJsonStore.cjs');

let passed = 0;
let failed = 0;

function assert(condition, name) {
  if (condition) {
    passed++;
    console.log(`[PASS] ${name}`);
  } else {
    failed++;
    console.error(`[FAIL] ${name}`);
  }
}

const tempRoot = await fs.mkdtemp(path.join(os.tmpdir(), 'cyberdeck-db-test-'));
const dbPath = path.join(tempRoot, 'cyber_db.json');

try {
  const store = new AtomicJsonStore(dbPath, { maxBytes: 1024 * 1024 });
  await fs.writeFile(dbPath, JSON.stringify({ anan: { level: 7 } }), 'utf8');

  const legacy = await store.read();
  assert(legacy.legacy === true && legacy.data.anan.level === 7, 'Legacy database loads without losing profile data');

  const firstWrite = await store.write({ anan: { level: 8 } });
  const firstDocument = JSON.parse(await fs.readFile(dbPath, 'utf8'));
  assert(firstWrite.success && firstDocument.format === STORE_FORMAT, 'Database writes use a versioned envelope');
  assert(firstDocument.schemaVersion === STORE_SCHEMA_VERSION && firstDocument.revision === 1, 'Database envelope records schema and revision');

  await store.write({ anan: { level: 9 } });
  await fs.writeFile(dbPath, '{corrupt-json', 'utf8');
  const recovered = await store.read();
  assert(recovered.recoveredFromBackup === true && recovered.source === 'BACKUP', 'Corrupt primary database recovers from known-good backup');
  assert(recovered.data.anan.level === 8, 'Recovery returns the last fully committed profile revision');

  await Promise.all([
    store.write({ sequence: 1 }),
    store.write({ sequence: 2 }),
    store.write({ sequence: 3 })
  ]);
  const queuedResult = await store.read();
  assert(queuedResult.data.sequence === 3, 'Concurrent saves are serialized in invocation order');

  let invalidRejected = false;
  try {
    await store.write([]);
  } catch (error) {
    invalidRejected = true;
  }
  assert(invalidRejected, 'Invalid database root payload is rejected');

  const migrated = migrateProfile({
    username: 'Anan',
    level: '4',
    avgAccuracy: 12,
    wpmSessions: [{ accuracy: 90 }, { accuracy: 100 }],
    aiTradingGymState: {
      stats: { totalTrades: 99 },
      paperBalanceUSD: 12345
    },
    tradingData: {
      live: {
        status: 'UNVERIFIED',
        accountSnapshot: { balance: 999999 }
      }
    }
  });

  assert(migrated.profileSchemaVersion === PROFILE_SCHEMA_VERSION && migrated.level === 4, 'Profile schema migration normalizes version and numeric fields');
  assert(migrated.avgAccuracy === 95, 'Profile migration recalculates average accuracy from session history');
  assert(migrated.tradingData.paper.domain === 'PAPER_SIMULATION' && migrated.tradingData.paper.stats.totalTrades === 99, 'Legacy AI gym data migrates only into the Paper domain');
  assert(migrated.tradingData.live.domain === 'LIVE_BROKER' && migrated.tradingData.live.accountSnapshot === null, 'Unverified broker snapshots cannot enter the Live domain');
  assert(!Object.hasOwn(migrated, 'aiTradingGymState'), 'Legacy mixed trading field is removed after migration');

  const auditMigrated = migrateProfile({
    tradingData: {
      paper: {
        paperAccountModel: 'BALANCE_MARGIN_SEPARATE_V1',
        executionAudit: [
          { eventId: 'audit-persist-1', at: '2026-08-20T00:00:00.000Z', eventType: 'OPEN_REJECTED', reason: 'MAX_OPEN_POSITIONS' },
          { eventId: 'audit-invalid', at: 'not-a-date', eventType: 'OPEN_ACCEPTED' }
        ],
        mlShadow: { model: createMLShadowModel({ source: 'TEST', assetId: 'BTC/USDT', timeframe: '5m' }), report: null }
      }
    }
  });
  assert(auditMigrated.tradingData.paper.executionAudit.length === 1, 'Profile migration preserves only valid Paper execution audit events');
  assert(auditMigrated.tradingData.paper.mlShadow.model?.certification.decisionEligible === false, 'Profile migration preserves ML Shadow state without decision authority');

  const isolatedA = migrateProfile({}, 'A');
  const isolatedB = migrateProfile({}, 'B');
  isolatedA.inventory.push('mutation-test');
  assert(!isolatedB.inventory.includes('mutation-test'), 'New profiles do not share nested default references');
} finally {
  await fs.rm(tempRoot, { recursive: true, force: true });
}

console.log(`PERSISTENCE: ${passed} passed, ${failed} failed`);
if (failed > 0) process.exitCode = 1;
