export const XM_MARKET_SNAPSHOT_SCHEMA = 'CYBERDECK_XM_MARKET_SNAPSHOT_V1';
export const XM_MARKET_PACKET_SOURCE = 'XM_MT5_DEMO_BARS';
export const XM_MARKET_VALIDATION_POLICY = 'AUTHENTICATED_XM_DEMO_CLOSED_BARS_V1';

export const XM_APPROVED_SYMBOLS = Object.freeze({
  'XAU/USD': 'GOLD',
  'EUR/USD': 'EURUSD',
  'GBP/USD': 'GBPUSD',
  USOIL: 'OILCash'
});

export const XM_APPROVED_TIMEFRAMES = Object.freeze({
  '1m': 60,
  '5m': 300,
  '15m': 900,
  '1h': 3600,
  '1D': 86400
});

function deepFreeze(value) {
  if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value;
  Object.freeze(value);
  Object.values(value).forEach(deepFreeze);
  return value;
}

function reject(reason) {
  return deepFreeze({ accepted: false, reason, snapshot: null, policy: XM_MARKET_VALIDATION_POLICY });
}

function finite(value, { min = -Number.MAX_VALUE, max = Number.MAX_VALUE } = {}) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= min && parsed <= max ? parsed : null;
}

function integer(value, { min = Number.MIN_SAFE_INTEGER, max = Number.MAX_SAFE_INTEGER } = {}) {
  const parsed = finite(value, { min, max });
  return Number.isSafeInteger(parsed) ? parsed : null;
}

function text(value, maxLength = 120) {
  if (typeof value !== 'string') return null;
  const clean = value.replace(/[\u0000-\u001f\u007f]/g, '').trim();
  return clean ? clean.slice(0, maxLength) : null;
}

function normalizeContract(raw) {
  const digits = integer(raw?.digits, { min: 0, max: 10 });
  const point = finite(raw?.point, { min: Number.EPSILON, max: 1e6 });
  const tickSize = finite(raw?.tickSize, { min: Number.EPSILON, max: 1e6 });
  const tickValueProfit = finite(raw?.tickValueProfit, { min: Number.EPSILON, max: 1e9 });
  const tickValueLoss = finite(raw?.tickValueLoss, { min: Number.EPSILON, max: 1e9 });
  const contractSize = finite(raw?.contractSize, { min: Number.EPSILON, max: 1e12 });
  const volumeMin = finite(raw?.volumeMin, { min: Number.EPSILON, max: 1e6 });
  const volumeMax = finite(raw?.volumeMax, { min: Number.EPSILON, max: 1e6 });
  const volumeStep = finite(raw?.volumeStep, { min: Number.EPSILON, max: 1e6 });
  const stopsLevel = integer(raw?.stopsLevel, { min: 0, max: 1e9 });
  const freezeLevel = integer(raw?.freezeLevel, { min: 0, max: 1e9 });
  const tradeMode = text(raw?.tradeMode, 40);
  const executionMode = integer(raw?.executionMode, { min: 0, max: 20 });
  const fillingMode = integer(raw?.fillingMode, { min: 0, max: 20 });
  const orderMode = integer(raw?.orderMode, { min: 0, max: 1000 });
  const currencyBase = text(raw?.currencyBase, 16);
  const currencyProfit = text(raw?.currencyProfit, 16);
  const currencyMargin = text(raw?.currencyMargin, 16);
  if ([digits, point, tickSize, tickValueProfit, tickValueLoss, contractSize, volumeMin, volumeMax,
    volumeStep, stopsLevel, freezeLevel, executionMode, fillingMode, orderMode].includes(null)
    || tradeMode !== 'FULL' || volumeMin > volumeMax || volumeStep > volumeMax
    || !currencyBase || !currencyProfit || !currencyMargin) return null;
  return deepFreeze({
    digits,
    point,
    tickSize,
    tickValueProfit,
    tickValueLoss,
    contractSize,
    volumeMin,
    volumeMax,
    volumeStep,
    stopsLevel,
    freezeLevel,
    tradeMode,
    executionMode,
    fillingMode,
    orderMode,
    currencyBase,
    currencyProfit,
    currencyMargin
  });
}

function normalizeBar(raw, timeframeSeconds, capturedAtMs) {
  const openTimeMs = integer(raw?.openTimeMs, { min: 1, max: Number.MAX_SAFE_INTEGER });
  const closeTimeMs = integer(raw?.closeTimeMs, { min: 1, max: Number.MAX_SAFE_INTEGER });
  const open = finite(raw?.open, { min: Number.EPSILON, max: 1e12 });
  const high = finite(raw?.high, { min: Number.EPSILON, max: 1e12 });
  const low = finite(raw?.low, { min: Number.EPSILON, max: 1e12 });
  const close = finite(raw?.close, { min: Number.EPSILON, max: 1e12 });
  const volume = finite(raw?.volume, { min: 0, max: 1e15 });
  const spreadPoints = integer(raw?.spreadPoints, { min: 0, max: 1e9 });
  if ([openTimeMs, closeTimeMs, open, high, low, close, volume, spreadPoints].includes(null)
    || closeTimeMs !== openTimeMs + timeframeSeconds * 1000 - 1
    || closeTimeMs > capturedAtMs || high < low || high < Math.max(open, close)
    || low > Math.min(open, close) || raw?.closed !== true) return null;
  return deepFreeze({
    time: Math.floor(openTimeMs / 1000),
    openTimeMs,
    closeTimeMs,
    open,
    high,
    low,
    close,
    volume,
    spreadPoints,
    barClosed: true
  });
}

export function hasXMMarketAdapter(assetId) {
  return Object.prototype.hasOwnProperty.call(XM_APPROVED_SYMBOLS, assetId);
}

export function validateXMMarketSnapshot(raw, {
  expectedAssetId,
  expectedTimeframe,
  transportAuthenticated = false,
  now = Date.now(),
  maxSnapshotAgeMs = 5000,
  futureToleranceMs = 1000
} = {}) {
  if (transportAuthenticated !== true) return reject('UNAUTHENTICATED_TRANSPORT');
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return reject('INVALID_SNAPSHOT');
  if (raw.schemaVersion !== XM_MARKET_SNAPSHOT_SCHEMA) return reject('UNSUPPORTED_SCHEMA');
  if (raw.source !== XM_MARKET_PACKET_SOURCE) return reject('UNVERIFIED_SOURCE');
  if (raw.mode !== 'DEMO_MARKET_DATA') return reject('DEMO_MARKET_DATA_REQUIRED');

  const assetId = text(raw.assetId, 40);
  const timeframe = text(raw.timeframe, 10);
  const brokerSymbol = text(raw.brokerSymbol, 40);
  const timeframeSeconds = XM_APPROVED_TIMEFRAMES[timeframe];
  if (!assetId || assetId !== expectedAssetId || timeframe !== expectedTimeframe
    || XM_APPROVED_SYMBOLS[assetId] !== brokerSymbol || !timeframeSeconds
    || integer(raw.timeframeSeconds, { min: 60, max: 86400 }) !== timeframeSeconds) {
    return reject('UNAPPROVED_MARKET_MAPPING');
  }

  const capturedAtMs = Date.parse(raw.capturedAt);
  const decisionTime = Number(now);
  if (!Number.isFinite(capturedAtMs) || !Number.isFinite(decisionTime)) return reject('INVALID_SNAPSHOT_TIME');
  if (capturedAtMs > decisionTime + futureToleranceMs) return reject('FUTURE_SNAPSHOT');
  if (decisionTime - capturedAtMs > maxSnapshotAgeMs) return reject('STALE_SNAPSHOT');

  if (raw.account?.tradeMode !== 'DEMO'
    || text(raw.account?.company, 120)?.toLowerCase() !== 'xm global limited'
    || !text(raw.account?.server, 120)?.toLowerCase().startsWith('xmglobal-')) {
    return reject('VERIFIED_XM_DEMO_ACCOUNT_REQUIRED');
  }
  const loginSuffix = String(raw.account?.loginSuffix ?? '').trim();
  if (!/^\d{1,4}$/.test(loginSuffix)) return reject('INVALID_ACCOUNT_REFERENCE');

  const contract = normalizeContract(raw.contract);
  if (!contract) return reject('INVALID_BROKER_CONTRACT');
  const quoteBid = finite(raw.quote?.bid, { min: Number.EPSILON, max: 1e12 });
  const quoteAsk = finite(raw.quote?.ask, { min: Number.EPSILON, max: 1e12 });
  const quoteTimeMs = integer(raw.quote?.timeMs, { min: 1, max: Number.MAX_SAFE_INTEGER });
  if (quoteBid === null || quoteAsk === null || quoteTimeMs === null || quoteAsk < quoteBid
    || (quoteAsk - quoteBid) / quoteBid > 0.1) return reject('INVALID_BROKER_QUOTE');

  if (!Array.isArray(raw.closedBars) || raw.closedBars.length < 1 || raw.closedBars.length > 5000) {
    return reject('INVALID_CLOSED_BAR_COUNT');
  }
  const closedBars = [];
  let previousOpenTime = 0;
  const seen = new Set();
  let sessionGapCount = 0;
  for (const rawBar of raw.closedBars) {
    const bar = normalizeBar(rawBar, timeframeSeconds, capturedAtMs);
    if (!bar || seen.has(bar.openTimeMs) || bar.openTimeMs <= previousOpenTime) return reject('INVALID_CLOSED_BARS');
    if (previousOpenTime > 0 && bar.openTimeMs - previousOpenTime !== timeframeSeconds * 1000) sessionGapCount += 1;
    seen.add(bar.openTimeMs);
    previousOpenTime = bar.openTimeMs;
    closedBars.push(bar);
  }

  return deepFreeze({
    accepted: true,
    reason: 'VERIFIED_XM_DEMO_CLOSED_BARS',
    policy: XM_MARKET_VALIDATION_POLICY,
    snapshot: {
      schemaVersion: XM_MARKET_SNAPSHOT_SCHEMA,
      source: XM_MARKET_PACKET_SOURCE,
      mode: 'DEMO_MARKET_DATA',
      capturedAt: new Date(capturedAtMs).toISOString(),
      capturedAtMs,
      assetId,
      timeframe,
      timeframeSeconds,
      brokerSymbol,
      account: {
        tradeMode: 'DEMO',
        server: text(raw.account.server, 120),
        company: text(raw.account.company, 120),
        loginSuffix
      },
      quote: { bid: quoteBid, ask: quoteAsk, timeMs: quoteTimeMs },
      contract,
      closedBars,
      sessionGapCount,
      formingBarExcluded: raw.formingBarExcluded === true,
      authority: {
        paperDecisionInfluence: raw.authority?.paperDecisionInfluence === true,
        demoExecutionInfluence: false,
        liveEligible: false
      }
    }
  });
}

export function calculateXMConservativeRiskSize({
  contract,
  entryPrice,
  stopPrice,
  equity,
  riskPercent = 0.5,
  maximumVolume = 0.5
} = {}) {
  const entry = finite(entryPrice, { min: Number.EPSILON, max: 1e12 });
  const stop = finite(stopPrice, { min: Number.EPSILON, max: 1e12 });
  const safeEquity = finite(equity, { min: Number.EPSILON, max: 1e12 });
  const requestedRisk = finite(riskPercent, { min: 0.1, max: 1 });
  const tickSize = finite(contract?.tickSize, { min: Number.EPSILON, max: 1e6 });
  const tickValueLoss = finite(contract?.tickValueLoss, { min: Number.EPSILON, max: 1e9 });
  const volumeMin = finite(contract?.volumeMin, { min: Number.EPSILON, max: 1e6 });
  const volumeMax = finite(contract?.volumeMax, { min: Number.EPSILON, max: 1e6 });
  const volumeStep = finite(contract?.volumeStep, { min: Number.EPSILON, max: 1e6 });
  const hardVolumeCap = finite(maximumVolume, { min: Number.EPSILON, max: 0.5 });
  if ([entry, stop, safeEquity, requestedRisk, tickSize, tickValueLoss, volumeMin, volumeMax,
    volumeStep, hardVolumeCap].includes(null) || entry === stop) {
    return deepFreeze({ success: false, reason: 'INVALID_RISK_INPUT', preflightRequired: true });
  }

  const riskBudget = safeEquity * (requestedRisk / 100);
  const lossPerLot = (Math.abs(entry - stop) / tickSize) * tickValueLoss;
  if (!Number.isFinite(lossPerLot) || lossPerLot <= 0) {
    return deepFreeze({ success: false, reason: 'INVALID_CONTRACT_LOSS_VALUE', preflightRequired: true });
  }
  const uncappedVolume = riskBudget / lossPerLot;
  const cappedVolume = Math.min(uncappedVolume, volumeMax, hardVolumeCap);
  const stepUnits = Math.floor((cappedVolume + Number.EPSILON) / volumeStep);
  const volume = Number((stepUnits * volumeStep).toFixed(8));
  if (volume < volumeMin) {
    return deepFreeze({
      success: false,
      reason: 'RISK_BUDGET_BELOW_MINIMUM_BROKER_VOLUME',
      riskBudget,
      minimumVolume: volumeMin,
      minimumVolumeEstimatedLoss: lossPerLot * volumeMin,
      preflightRequired: true
    });
  }
  return deepFreeze({
    success: true,
    reason: 'CONSERVATIVE_VOLUME_ESTIMATE_CREATED',
    volume,
    riskBudget,
    estimatedStopLoss: lossPerLot * volume,
    requestedRiskPercent: requestedRisk,
    hardVolumeCap,
    preflightRequired: true,
    executionEligible: false,
    liveEligible: false
  });
}
