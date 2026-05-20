import React, { useEffect, useRef, useState } from 'react';

const POLL_INTERVAL_MS = 10_000;
const USD_ANCHOR = 5000;

function formatEthAmount(price) {
  if (!price || price <= 0) return '—';
  return (USD_ANCHOR / price).toFixed(3);
}

function formatChange(change24h) {
  if (change24h == null || Number.isNaN(change24h)) return '0.00%';
  const sign = change24h > 0 ? '+' : '';
  return `${sign}${change24h.toFixed(2)}%`;
}

export default function MarketTrends() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const abortRef = useRef(null);

  useEffect(() => {
    let cancelled = false;

    const fetchPrice = async () => {
      if (abortRef.current) abortRef.current.abort();
      const controller = new AbortController();
      abortRef.current = controller;
      try {
        const res = await fetch('/api/eth-price', { signal: controller.signal });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        if (!cancelled) {
          setData(json);
          setError(null);
        }
      } catch (err) {
        if (!cancelled && err.name !== 'AbortError') {
          setError(err.message || 'Failed to load price');
        }
      }
    };

    fetchPrice();
    const id = setInterval(fetchPrice, POLL_INTERVAL_MS);

    return () => {
      cancelled = true;
      clearInterval(id);
      if (abortRef.current) abortRef.current.abort();
    };
  }, []);

  const price = data?.price;
  const ethAmount = formatEthAmount(price);
  const up = data?.up ?? true;
  const change24h = data?.change24h ?? 0;

  return (
    <section
      aria-label="Market trends"
      className="w-full border-b border-neutral-200 bg-white"
    >
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-8 px-4 py-4 sm:px-6 lg:px-8">
        <h2 className="text-sm font-semibold tracking-tight text-neutral-900">
          Market Trends
        </h2>

        <div className="flex items-center gap-8">
          <div className="flex items-baseline gap-2">
            <span className="text-sm font-semibold tracking-tight text-neutral-900">
              ETH
            </span>
            <span
              className="font-mono text-sm tabular-nums text-neutral-900"
              aria-live="polite"
            >
              {ethAmount}
            </span>
            <span className="text-sm text-neutral-500">/</span>
            <span className="font-mono text-sm tabular-nums text-neutral-700">
              ${USD_ANCHOR.toLocaleString()}
            </span>
          </div>

          <div
            className={
              'flex items-center gap-1 text-sm font-medium tabular-nums ' +
              (error
                ? 'text-neutral-400'
                : up
                  ? 'text-emerald-600'
                  : 'text-rose-600')
            }
            aria-label={`24 hour change ${formatChange(change24h)}`}
          >
            <span aria-hidden="true">{up ? '▲' : '▼'}</span>
            <span>{formatChange(change24h)}</span>
          </div>
        </div>
      </div>
    </section>
  );
}
