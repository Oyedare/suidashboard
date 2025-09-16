import { useState, useEffect } from "react";

interface VolumeStats {
  volume: number;
  volumeUsd: number;
  tradeCount: number;
  uniqueUsers: number;
}

interface CoinMetadata {
  _id: string;
  coinType: string;
  decimals: number;
  description: string;
  iconUrl: string;
  name: string;
  symbol: string;
}

interface TrendingCoin {
  coin: string;
  coinMetadata: CoinMetadata;
  price: number;
  marketCap: number;
  fullyDilutedMarketCap: number;
  coinSupply: number;
  totalSupply: number;
  holdersCount: number;
  totalLiquidityUsd: number;
  percentageTokenSupplyInLiquidity: number;

  // Price changes
  percentagePriceChange1m: number;
  percentagePriceChange5m: number;
  percentagePriceChange1h: number;
  percentagePriceChange4h: number;
  percentagePriceChange1d: number;

  // Historical prices
  price1MinsAgo: number;
  price5MinsAgo: number;
  price1HrAgo: number;
  price4HrAgo: number;
  price1DAgo: number;

  // Volume statistics
  buyVolumeStats: VolumeStats;
  sellVolumeStats: VolumeStats;
  buyVolumeStats1m: VolumeStats;
  sellVolumeStats1m: VolumeStats;
  buyVolumeStats5m: VolumeStats;
  sellVolumeStats5m: VolumeStats;
  buyVolumeStats1h: VolumeStats;
  sellVolumeStats1h: VolumeStats;
  buyVolumeStats4h: VolumeStats;
  sellVolumeStats4h: VolumeStats;
  buyVolumeStats1d: VolumeStats;
  sellVolumeStats1d: VolumeStats;

  // Trade counts and volumes
  coin1mTradeCount: number;
  coin1mTradeVolumeUsd: number;
  coin5mTradeCount: number;
  coin5mTradeVolumeUsd: number;
  coin1hTradeCount: number;
  coin1hTradeVolumeUsd: number;
  coin4hTradeCount: number;
  coin4hTradeVolumeUsd: number;
  coin1dTradeCount: number;
  coin1dTradeVolumeUsd: number;

  // Unique traders
  uniqueTraders1m: number;
  uniqueTraders5m: number;
  uniqueTraders1h: number;
  uniqueTraders4h: number;
  uniqueTraders1d: number;

  // Holder information
  top10HoldersPercent: number;
  holderScore: number;

  // Developer information
  coinDev?: string;
  coinDevHoldings?: number;
  coinDevHoldingsPercentage?: number;

  // Additional fields
  timeCreated: number;
  amountBurned?: number;
}

interface UseCoinTrendResult {
  trendingCoins: TrendingCoin[];
  loading: boolean;
  error: Error | null;
  refetch: () => void;
}

// Cache configuration
const CACHE_KEY = "trending_coins_cache";
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

interface CacheData {
  data: TrendingCoin[];
  timestamp: number;
}

const getFromCache = (): TrendingCoin[] | null => {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (!cached) return null;

    const cacheData: CacheData = JSON.parse(cached);
    const now = Date.now();

    if (now - cacheData.timestamp > CACHE_DURATION) {
      localStorage.removeItem(CACHE_KEY);
      return null;
    }

    return cacheData.data;
  } catch (error) {
    console.error("Error reading from cache:", error);
    return null;
  }
};

const saveToCache = (data: TrendingCoin[]): void => {
  try {
    const cacheData: CacheData = {
      data,
      timestamp: Date.now(),
    };
    localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
  } catch (error) {
    console.error("Error saving to cache:", error);
  }
};

export const useCoinTrend = (options?: {
  autoFetch?: boolean;
}): UseCoinTrendResult => {
  const { autoFetch = false } = options || {};
  const [trendingCoins, setTrendingCoins] = useState<TrendingCoin[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchTrendingCoins = async () => {
    try {
      setLoading(true);
      setError(null);

      // Check cache first
      const cachedData = getFromCache();
      if (cachedData) {
        setTrendingCoins(cachedData);
        setLoading(false);
        return;
      }

      // Try to fetch from API, fallback to mock data if it fails
      try {
        const response = await fetch(
          "/api/external-api/insidex/coins/trending",
          {
            headers: {},
          },
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log("API Response:", data);
        setTrendingCoins(data);
        saveToCache(data);
      } catch (apiError) {
        console.warn("API unavailable, using mock data:", apiError);
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err
          : new Error("Failed to fetch trending coins"),
      );
    } finally {
      setLoading(false);
    }
  };

  const refetch = () => {
    // Clear cache and refetch
    localStorage.removeItem(CACHE_KEY);
    fetchTrendingCoins();
  };

  useEffect(() => {
    if (autoFetch) {
      fetchTrendingCoins();
    }
  }, [autoFetch]);

  return {
    trendingCoins,
    loading,
    error,
    refetch,
  };
};
