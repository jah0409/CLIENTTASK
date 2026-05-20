# RWA Task Completion

Implemented against the buyer's requested RWA project structure, not as a separate landing-page mock.

## Completed

- Fixed `MenuBar` styling with a stable horizontal desktop layout, consistent `gap-8` spacing, uniform text styling, active state support, and a mobile `<select>` fallback.
- Added `/api/eth-price` backend support with an Express route and controller.
- ETH price initializes from Kraken and falls back to `2064` if the upstream request fails.
- Price updates are cached for 6 seconds and then simulated with a ±0-2% random walk.
- API response returns `price`, `lastUpdated`, `up`, and `change24h` in the requested shape.
- Added frontend ETH polling every 10 seconds through `useEthPrice`.
- Updated the Market Trends UI to show `ETH {amount} / $5000` under each of the three main numbers.

## Files Added

- `server/controllers/ethPriceController.js`
- `server/routes/ethPriceRoutes.js`
- `src/hooks/useEthPrice.js`
- `src/components/MenuBar.jsx`
- `src/components/MarketTrends.jsx`

## Integration Note

Mount the route in the existing Express app with the codebase's current API pattern, for example:

```js
const ethPriceRoutes = require('./routes/ethPriceRoutes');
app.use('/api', ethPriceRoutes);
```

Then render the updated `MenuBar` and `MarketTrends` components where the existing landing/dashboard page already uses those sections.
