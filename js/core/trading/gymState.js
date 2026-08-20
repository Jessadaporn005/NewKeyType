export const LEGACY_DEMO_SEED_ID = 'ANTIGRAVITY_SYNTHETIC_18_TRADES_V1';

export function createZeroPaperGymStats() {
  return {
    totalTrades: 0,
    wins: 0,
    losses: 0,
    winRate: 0,
    netPnlUSD: 0,
    samplesStudied: 0,
    adaptationLevel: 1
  };
}

export function isLegacyDemoSeed(state) {
  const stats = state?.stats;
  const journalIds = Array.isArray(state?.journal) ? new Set(state.journal.map(item => item?.id)) : new Set();
  const hasExactStats = stats?.totalTrades === 18
    && stats?.wins === 14
    && stats?.losses === 4
    && stats?.winRate === 77.8
    && stats?.netPnlUSD === 8420.5
    && stats?.samplesStudied === 3420;
  const hasLegacyJournal = journalIds.size === 0
    || ['AI_TR_01', 'AI_TR_02', 'AI_TR_03'].every(id => journalIds.has(id));
  return hasExactStats && hasLegacyJournal;
}

export function migrateLegacyDemoSeed(state) {
  if (!isLegacyDemoSeed(state)) return { state, migrated: false };
  return {
    migrated: true,
    state: {
      ...state,
      stats: createZeroPaperGymStats(),
      journal: [],
      weights: null,
      migratedFromDemoSeed: LEGACY_DEMO_SEED_ID,
      migratedAt: new Date().toISOString()
    }
  };
}

export function selectLatestPaperState(diskState, localState) {
  const validDisk = diskState && typeof diskState === 'object' && !Array.isArray(diskState) ? diskState : null;
  const validLocal = localState && typeof localState === 'object' && !Array.isArray(localState) ? localState : null;
  if (!validDisk) return validLocal;
  if (!validLocal) return validDisk;
  const diskSavedAt = Date.parse(validDisk.savedAt || '') || 0;
  const localSavedAt = Date.parse(validLocal.savedAt || '') || 0;
  return localSavedAt > diskSavedAt ? validLocal : validDisk;
}
