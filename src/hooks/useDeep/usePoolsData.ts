import { useEffect, useState } from "react";
import axios from "axios";

export function usePoolsData() {
  const [dbdata, setDbdata] = useState<any[]>([]);
  const [suidata, setSuidata] = useState<any[]>([]);
  const [waldata, setWaldata] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    setLoading(true);
    axios
      .get("https://deepbook-indexer.mainnet.mystenlabs.com/get_pools")
      .then((res) => setDbdata(res.data))
      .catch((err) => setError(err))
      .finally(() => setLoading(false));

    axios
      .get(
        ".netlify/functions/bluefin/external-api/insidex/pools/top-liquidity?limit=10&platforms=cetus%2Cturbos",
        {},
      )
      .then((res) => setSuidata(res.data))
      .catch((err) => setError(err))
      .finally(() => setLoading(false));

    axios
      .get(
        ".netlify/functions/bluefin/external-api/insidex/coins/0x356a26eb9e012a68958082340d4c4116e7f55615cf27affcff209cf0ae544f59::wal::WAL/pools",
        {},
      )
      .then((res) => setWaldata(res.data))
      .catch((err) => setError(err))
      .finally(() => setLoading(false));

    // axios
    //   .get("https://walrus5-gucco4za.b4a.run/api/walrus/overview-cached")
    //   .then((res) => console.log(res.data))
    //   .catch((err) => setError(err))
    //   .finally(() => setLoading(false));

    // console.log(suidata)
  }, []);

  return { dbdata, suidata, waldata, loading, error };
}
