// hooks/useStatsData.ts
import { useEffect, useState } from "react";
import axios from "axios";

export function useStatsData() {
  const [suiStats, setSuistats] = useState<any[]>([]);
  const [suipools, setSuipools] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);

        // 1. Get stats
        const statsRes = await axios.get(
          ".netlify/functions/bluefin/external-api/insidex/coins/0x2::sui::SUI/market-data",
          {},
        );
        setSuistats(statsRes.data);

        // 2. Get gist doc
        const gistRes = await axios.get(
          "https://gist.githubusercontent.com/Nnadivictory25/459afe34d2d6356af3e4d68a8c671820/raw/docs.md",
        );

        const doc = gistRes.data as string;
        const endpoints = doc
          .split("\n")
          .map((line) => line.trim())
          .filter((line) => line.startsWith("/api/"));

        // Continue even if no endpoints are found
        if (endpoints.length > 0) {
          // 3. Fetch the first pool endpoint (or all if needed)
          const poolRes = await axios.get(endpoints[0]);
          setSuipools(poolRes.data);
        }
      } catch (err: any) {
        console.error("Fetch error:", err);
        setError(err);

        // fallback mock pools
        setSuipools([
          {
            id: 1,
            name: "SUI/USDC",
            tokenA: "SUI",
            tokenB: "USDC",
            volume24h: "$2,450,000",
            tvl: "$12,300,000",
            apr: "15.2%",
            platform: "Cetus",
          },
          {
            id: 2,
            name: "DEEP/SUI",
            tokenA: "DEEP",
            tokenB: "SUI",
            volume24h: "$1,850,000",
            tvl: "$8,900,000",
            apr: "22.8%",
            platform: "DeepBook",
          },
        ]);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  return { suiStats, suipools, loading, error };
}
