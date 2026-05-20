const https = require('https');

const KRAKEN_URL = 'https://api.kraken.com/0/public/Ticker?pair=ETHUSD';
const FALLBACK_PRICE = 2064;
const CACHE_TTL_MS = 6000;
const HISTORY_WINDOW_MS = 24 * 60 * 60 * 1000;
const MAX_RANDOM_WALK = 0.02;

const state = {
  initialized: false,
  initializing: null,
  price: FALLBACK_PRICE,
  previousPrice: FALLBACK_PRICE,
  lastUpdated: 0,
  history: [],
};

function fetchInitialEthPrice() {
  return new Promise((resolve, reject) => {
    const req = https.get(KRAKEN_URL, (res) => {
      let body = '';
      res.on('data', (chunk) => {
        body += chunk;
      });
      res.on('end', () => {
        try {
          const payload = JSON.parse(body);
          const pair = payload.result && Object.keys(payload.result)[0];
          const value = pair ? Number(payload.result[pair].c[0]) : NaN;
          if (!Number.isFinite(value) || value <= 0) {
            reject(new Error('Invalid ETH price response'));
            return;
          }
          resolve(value);
        } catch (error) {
          reject(error);
        }
      });
    });

    req.on('error', reject);
    req.setTimeout(5000, () => req.destroy(new Error('ETH price request timed out')));
  });
}

async function initializePrice() {
  if (state.initialized) return;
  if (state.initializing) return state.initializing;

  state.initializing = (async () => {
    try {
      state.price = await fetchInitialEthPrice();
      state.previousPrice = state.price;
    } catch (_) {
      state.price = FALLBACK_PRICE;
      state.previousPrice = FALLBACK_PRICE;
    }

    state.lastUpdated = Date.now();
    state.history = [{ price: state.price, timestamp: state.lastUpdated }];
    state.initialized = true;
  })();

  return state.initializing;
}

function pruneHistory(now) {
  const cutoff = now - HISTORY_WINDOW_MS;
  state.history = state.history.filter((entry, index) => {
    return entry.timestamp >= cutoff || index === state.history.length - 1;
  });
}

function simulatePriceMove() {
  const now = Date.now();
  const delta = (Math.random() * 2 - 1) * MAX_RANDOM_WALK;
  state.previousPrice = state.price;
  state.price = state.price * (1 + delta);
  state.lastUpdated = now;
  state.history.push({ price: state.price, timestamp: now });
  pruneHistory(now);
}

function getChange24h(now) {
  pruneHistory(now);
  const baseline = state.history[0]?.price || state.price;
  return ((state.price - baseline) / baseline) * 100;
}

async function getEthPrice(req, res) {
  await initializePrice();

  const now = Date.now();
  if (now - state.lastUpdated >= CACHE_TTL_MS) {
    simulatePriceMove();
  }

  res.json({
    price: Number(state.price.toFixed(2)),
    lastUpdated: new Date(state.lastUpdated).toISOString(),
    up: state.price >= state.previousPrice,
    change24h: Number(getChange24h(now).toFixed(2)),
  });
}

module.exports = {
  getEthPrice,
  _internal: { state, initializePrice, simulatePriceMove, getChange24h },
};
