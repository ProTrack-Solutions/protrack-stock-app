import { isCancel } from "axios";
import { useCallback, useEffect, useRef, useState } from "react";

import type {
  BillPayable,
  BillsPayableListParams,
} from "@/interfaces/bills-payable.interface";
import { getApiErrorMessage } from "@/service/api.service";
import { ListBillsPayable } from "@/service/bills-payable.service";

const PAGE_SIZE = 20;

export type BillsPayableSummary = {
  totalPayable: number;
  totalOverdue: number;
  totalScheduled: number;
  accountsCount: number;
};

export type BillsPayableFilters = Omit<
  BillsPayableListParams,
  "page" | "perPage"
>;

export function useBillsPayable(filters: BillsPayableFilters) {
  const { search, status, orderBy, startDueDate, endDueDate } = filters;

  const [bills, setBills] = useState<BillPayable[]>([]);
  const [summary, setSummary] = useState<BillsPayableSummary | null>(null);
  const [page, setPage] = useState(1);
  // `total_rows`/`total_pages` da API ignoram os filtros: há mais páginas enquanto vierem páginas cheias.
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const controllerRef = useRef<AbortController | null>(null);
  // Incrementado a cada recarga, para descartar páginas extras de filtros antigos.
  const generationRef = useRef(0);

  const params = useCallback(
    (nextPage: number): BillsPayableListParams => ({
      search,
      status,
      orderBy,
      startDueDate,
      endDueDate,
      page: nextPage,
      perPage: PAGE_SIZE,
    }),
    [search, status, orderBy, startDueDate, endDueDate],
  );

  const load = useCallback(
    async (mode: "initial" | "refresh") => {
      controllerRef.current?.abort();
      const controller = new AbortController();
      controllerRef.current = controller;
      generationRef.current += 1;
      if (mode === "initial") setLoading(true);
      else setRefreshing(true);

      try {
        const response = await ListBillsPayable(params(1), controller.signal);
        const list = response.data ?? [];
        setBills(list);
        setPage(1);
        setHasMore(list.length === PAGE_SIZE);
        setSummary({
          totalPayable: response.total_payable ?? 0,
          totalOverdue: response.total_overdue ?? 0,
          totalScheduled: response.total_scheduled ?? 0,
          accountsCount: response.total_rows ?? 0,
        });
        setError(null);
      } catch (e) {
        if (isCancel(e)) return;
        setError(
          getApiErrorMessage(e, "Não foi possível carregar as contas a pagar."),
        );
      } finally {
        if (controllerRef.current === controller) {
          setLoading(false);
          setRefreshing(false);
        }
      }
    },
    [params],
  );

  useEffect(() => {
    load("initial");
    return () => controllerRef.current?.abort();
  }, [load]);

  const loadMore = useCallback(async () => {
    if (loading || loadingMore || refreshing || !hasMore) return;
    setLoadingMore(true);
    const generation = generationRef.current;
    try {
      const response = await ListBillsPayable(params(page + 1));
      if (generation !== generationRef.current) return;
      const next = response.data ?? [];
      setBills((current) => {
        const ids = new Set(current.map((b) => b.id));
        return [...current, ...next.filter((b) => !ids.has(b.id))];
      });
      setPage(page + 1);
      setHasMore(next.length === PAGE_SIZE);
    } catch {
      // Mantém o que já foi carregado; o usuário pode puxar para atualizar.
    } finally {
      setLoadingMore(false);
    }
  }, [loading, loadingMore, refreshing, hasMore, page, params]);

  const refresh = useCallback(() => load("refresh"), [load]);

  return {
    bills,
    summary,
    hasMore,
    loading,
    loadingMore,
    refreshing,
    error,
    refresh,
    loadMore,
  };
}
