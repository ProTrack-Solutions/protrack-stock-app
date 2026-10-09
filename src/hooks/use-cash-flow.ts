import { isCancel } from "axios";
import { useCallback, useEffect, useRef, useState } from "react";

import type { CashFlowData } from "@/interfaces/cash-flow.interface";
import { getApiErrorMessage } from "@/service/api.service";
import { GetCashFlow } from "@/service/cash-flow.service";

export function useCashFlow(days: number) {
  const [data, setData] = useState<CashFlowData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const controllerRef = useRef<AbortController | null>(null);

  const load = useCallback(
    async (mode: "initial" | "refresh") => {
      controllerRef.current?.abort();
      const controller = new AbortController();
      controllerRef.current = controller;
      if (mode === "initial") setLoading(true);
      else setRefreshing(true);
      try {
        setData(await GetCashFlow(days, controller.signal));
        setError(null);
      } catch (e) {
        if (isCancel(e)) return;
        setError(
          getApiErrorMessage(e, "Não foi possível carregar o fluxo de caixa."),
        );
      } finally {
        if (controllerRef.current === controller) {
          setLoading(false);
          setRefreshing(false);
        }
      }
    },
    [days],
  );

  useEffect(() => {
    load("initial");
    return () => controllerRef.current?.abort();
  }, [load]);

  const refresh = useCallback(() => load("refresh"), [load]);

  return { data, loading, refreshing, error, refresh };
}
