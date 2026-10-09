import { useCallback, useEffect, useState } from "react";

import type { DashboardData } from "@/interfaces/dashboard.interface";
import { GetDashboard } from "@/service/dashboard.service";

export function useDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      setData(await GetDashboard());
    } finally {
      setLoading(false);
    }
  }, []);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }, [load]);

  useEffect(() => {
    load();
  }, [load]);

  return { data, loading, refreshing, refresh };
}
