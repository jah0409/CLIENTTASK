import { useEffect, useRef, useState } from 'react';

const POLL_INTERVAL_MS = 10000;

export default function useEthPrice() {
  const [ethPrice, setEthPrice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const abortRef = useRef(null);

  useEffect(() => {
    let mounted = true;

    async function loadPrice() {
      if (abortRef.current) abortRef.current.abort();
      abortRef.current = new AbortController();

      try {
        const response = await fetch('/api/eth-price', {
          signal: abortRef.current.signal,
        });

        if (!response.ok) {
          throw new Error(`ETH price request failed: ${response.status}`);
        }

        const data = await response.json();
        if (mounted) {
          setEthPrice(data);
          setError(null);
          setLoading(false);
        }
      } catch (err) {
        if (mounted && err.name !== 'AbortError') {
          setError(err);
          setLoading(false);
        }
      }
    }

    loadPrice();
    const interval = window.setInterval(loadPrice, POLL_INTERVAL_MS);

    return () => {
      mounted = false;
      window.clearInterval(interval);
      if (abortRef.current) abortRef.current.abort();
    };
  }, []);

  return { ethPrice, loading, error };
}
