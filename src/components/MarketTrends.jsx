import React from 'react';
import useEthPrice from '../hooks/useEthPrice';

const USD_BASE_VALUE = 5000;

const stats = [
  { label: 'Average Building Price', value: '$5,000' },
  { label: 'Monthly Volume', value: '$5,000' },
  { label: 'Verified Asset Value', value: '$5,000' },
];

function formatEthAmount(price) {
  if (!price || price <= 0) return 'ETH -- / $5000';
  return `ETH ${(USD_BASE_VALUE / price).toFixed(3)} / $5000`;
}

function formatChange(value) {
  if (value == null || Number.isNaN(value)) return '0.00%';
  return `${value > 0 ? '+' : ''}${value.toFixed(2)}%`;
}

export default function MarketTrends() {
  const { ethPrice, loading, error } = useEthPrice();
  const ethLabel = loading ? 'Updating ETH...' : formatEthAmount(ethPrice?.price);
  const isUp = ethPrice?.up ?? true;

  return (
    <section id="market-trends" className="bg-slate-50 py-10" aria-labelledby="market-trends-title">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 id="market-trends-title" className="text-2xl font-semibold text-slate-950">
              Market Trends
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              Live ETH conversion refreshes every 10 seconds from the backend service.
            </p>
          </div>
          <div className={`text-sm font-medium ${error ? 'text-slate-500' : isUp ? 'text-emerald-600' : 'text-rose-600'}`}>
            {error ? 'ETH feed unavailable' : `${isUp ? 'Up' : 'Down'} ${formatChange(ethPrice?.change24h || 0)} 24h`}
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {stats.map((stat) => (
            <article key={stat.label} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-sm font-medium text-slate-500">{stat.label}</p>
              <p className="mt-2 text-3xl font-semibold text-slate-950">{stat.value}</p>
              <p className="mt-2 font-mono text-sm text-slate-700" aria-live="polite">
                {ethLabel}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
