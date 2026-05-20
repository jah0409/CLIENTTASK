import React from 'react';

const defaultItems = [
  { label: 'Home', href: '#home' },
  { label: 'Properties', href: '#properties' },
  { label: 'Market Trends', href: '#market-trends' },
  { label: 'Agents', href: '#agents' },
  { label: 'Contact', href: '#contact' },
];

export default function MenuBar({ items = defaultItems, activeHref = '#home' }) {
  return (
    <nav className="w-full border-b border-slate-200 bg-white" aria-label="Primary navigation">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <a href="#home" className="text-base font-semibold text-slate-950">
          Billion Towers
        </a>

        <ul className="hidden items-center gap-8 md:flex">
          {items.map((item) => {
            const active = item.href === activeHref;
            return (
              <li key={item.href} className="shrink-0">
                <a
                  href={item.href}
                  aria-current={active ? 'page' : undefined}
                  className={`text-sm font-medium transition-colors ${
                    active ? 'text-slate-950' : 'text-slate-600 hover:text-slate-950'
                  }`}
                >
                  {item.label}
                </a>
              </li>
            );
          })}
        </ul>

        <select
          className="block rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 md:hidden"
          value={activeHref}
          aria-label="Primary navigation"
          onChange={(event) => {
            window.location.hash = event.target.value.replace('#', '');
          }}
        >
          {items.map((item) => (
            <option key={item.href} value={item.href}>
              {item.label}
            </option>
          ))}
        </select>
      </div>
    </nav>
  );
}
