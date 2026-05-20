import React from 'react';

const NAV_ITEMS = [
  { label: 'Home', href: '#home' },
  { label: 'Markets', href: '#markets' },
  { label: 'Trade', href: '#trade' },
  { label: 'Portfolio', href: '#portfolio' },
  { label: 'About', href: '#about' },
];

export default function MenuBar({ items = NAV_ITEMS, activeHref }) {
  return (
    <nav
      aria-label="Primary"
      className="w-full border-b border-neutral-200 bg-white"
    >
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <a
          href="#home"
          className="text-base font-semibold tracking-tight text-neutral-900"
        >
          CLIENTTASK
        </a>

        <ul className="hidden flex-row items-center gap-8 md:flex">
          {items.map((item) => {
            const isActive = item.href === activeHref;
            return (
              <li key={item.href}>
                <a
                  href={item.href}
                  aria-current={isActive ? 'page' : undefined}
                  className={
                    'text-sm font-medium leading-6 tracking-tight transition-colors ' +
                    (isActive
                      ? 'text-neutral-900'
                      : 'text-neutral-600 hover:text-neutral-900')
                  }
                >
                  {item.label}
                </a>
              </li>
            );
          })}
        </ul>

        <div className="flex items-center gap-3 md:hidden">
          <select
            aria-label="Navigate"
            defaultValue={activeHref || items[0]?.href}
            onChange={(e) => {
              const href = e.target.value;
              if (href) window.location.hash = href.replace(/^#/, '');
            }}
            className="rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm font-medium text-neutral-700"
          >
            {items.map((item) => (
              <option key={item.href} value={item.href}>
                {item.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </nav>
  );
}
