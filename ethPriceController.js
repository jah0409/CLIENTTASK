const https = require('https');

const KRAKEN_URL = 'https://api.kraken.com/0/public/Ticker?pair=ETHUSD';
const FALLBACK_PRICE = 2064;
const CACHE_TTL_MS = 6000;
const HISTORY_WINDOW_MS = 24 * 60 * 60 * 1000;
const MAX_CHANGE_PCT = 0.02;

const state = {
  price: null,
  lastUpdated: 0,
  up: true,
  initialized: false,
  initPromise: null,
  history: [],
};

function fetchKrakenPrice() {
  return new Promise((resolve, reject) => {
    const req = https.get(KRAKEN_URL, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          if (json.error && json.error.length) {
            return reject(new Error(json.error.join(', ')));
          }
          const result = json.result;
          const pairKey = Object.keys(result)[0];
          const lastTrade = result[pairKey].c[0];
          const price = parseFloat(lastTrade);
          if (!Number.isFinite(price) || price <= 0) {
            return reject(new Error('Invalid Kraken price'));
          }
          resolve(price);
        } catch (err) {
          reject(err);
        }
      });
    });
    req.on('error', reject);
    req.setTimeout(5000, () => {
      req.destroy(new Error('Kraken request timed out'));
    });
  });
}

async function initialize() {
  if (state.initialized) return;
  if (state.initPromise) return state.initPromise;

  state.initPromise = (async () => {
    let price;
    try {
      price = await fetchKrakenPrice();
    } catch (_err) {
      price = FALLBACK_PRICE;
    }
    const now = Date.now();
    state.price = price;
    state.lastUpdated = now;
    state.up = true;
    state.history = [{ timestamp: now, price }];
    state.initialized = true;
  })();

  return state.initPromise;
}

function pruneHistory(now) {
  const cutoff = now - HISTORY_WINDOW_MS;
  let i = 0;
  while (i < state.history.length - 1 && state.history[i + 1].timestamp <= cutoff) {
    i += 1;
  }
  if (i > 0) {
    state.history = state.history.slice(i);
  }
}

function getPriceAt(timestamp) {
  if (!state.history.length) return state.price;
  let candidate = state.history[0];
  for (const entry of state.history) {
    if (entry.timestamp <= timestamp) {
      candidate = entry;
    } else {
      break;
    }
  }
  return candidate.price;
}

function simulateNextPrice() {
  const now = Date.now();
  const changePct = (Math.random() * 2 - 1) * MAX_CHANGE_PCT;
  const newPrice = state.price * (1 + changePct);
  state.up = newPrice >= state.price;
  state.price = newPrice;
  state.lastUpdated = now;
  state.history.push({ timestamp: now, price: newPrice });
  pruneHistory(now);
}

function buildResponse() {
  const now = Date.now();
  pruneHistory(now);
  const past = getPriceAt(now - HISTORY_WINDOW_MS);
  const change24h = past ? ((state.price - past) / past) * 100 : 0;
  return {
    price: Number(state.price.toFixed(2)),
    lastUpdated: new Date(state.lastUpdated).toISOString(),
    up: state.up,
    change24h: Number(change24h.toFixed(2)),
  };
}

async function getEthPrice(req, res) {
  try {
    await initialize();
    const now = Date.now();
    if (now - state.lastUpdated >= CACHE_TTL_MS) {
      simulateNextPrice();
    }
    res.json(buildResponse());
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch ETH price' });
  }
}

module.exports = {
  getEthPrice,
  _internal: { state, initialize, simulateNextPrice, buildResponse },
};
