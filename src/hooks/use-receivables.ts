import { isCancel } from "axios";
import { useCallback, useEffect, useRef, useState } from "react";

import type {
  Receivable,
  ReceivableListParams,
} from "@/interfaces/receivable.interface";
import { getApiErrorMessage } from "@/service/api.service";
import { ListReceivables } from "@/service/receivable.service";

const PAGE_SIZE = 20;

export type ReceivableSummary = {
  totalOpen: number;
  totalOverdue: number;
  accountsCount: number;
};

export type ReceivableFilters = Omit<ReceivableListParams, "page" | "perPage">;

export function useReceivables(filters: ReceivableFilters) {
  const { search, status, orderBy } = filters;

  const [receivables, setReceivables] = useState<Receivable[]>([]);
  const [summary, setSummary] = useState<ReceivableSummary | null>(null);
  const [page, setPage] = useState(1);
  // `total_pages` da API ignora os filtros: há mais páginas enquanto vierem páginas cheias.
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const controllerRef = useRef<AbortController | null>(null);
  // Incrementado a cada recarga, para descartar páginas extras de filtros antigos.
  const generationRef = useRef(0);

  const load = useCallback(
    async (mode: "initial" | "refresh") => {
      controllerRef.current?.abort();
      const controller = new AbortController();
      controllerRef.current = controller;
      generationRef.current += 1;
      if (mode === "initial") setLoading(true);
      else setRefreshing(true);

      try {
        const response = await ListReceivables(
          { search, status, orderBy, page: 1, perPage: PAGE_SIZE },
          controller.signal,
        );
        const list = response.data ?? [];
        setReceivables(list);
        setPage(1);
        setHasMore(list.length === PAGE_SIZE);
        setSummary({
          totalOpen: response.amount ?? 0,
          totalOverdue: response.amount_overdue ?? 0,
          accountsCount: response.total_rows ?? 0,
        });
        setError(null);
      } catch (e) {
        if (isCancel(e)) return;
        setError(
          getApiErrorMessage(
            e,
            "Não foi possível carregar as contas a receber.",
          ),
        );
      } finally {
        if (controllerRef.current === controller) {
          setLoading(false);
          setRefreshing(false);
        }
      }
    },
    [search, status, orderBy],
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
      const response = await ListReceivables({
        search,
        status,
        orderBy,
        page: page + 1,
        perPage: PAGE_SIZE,
      });
      if (generation !== generationRef.current) return;
      const next = response.data ?? [];
      setReceivables((current) => {
        const ids = new Set(current.map((r) => r.id));
        return [...current, ...next.filter((r) => !ids.has(r.id))];
      });
      setPage(page + 1);
      setHasMore(next.length === PAGE_SIZE);
    } catch {
      // Mantém o que já foi carregado; o usuário pode puxar para atualizar.
    } finally {
      setLoadingMore(false);
    }
  }, [
    loading,
    loadingMore,
    refreshing,
    hasMore,
    page,
    search,
    status,
    orderBy,
  ]);

  const refresh = useCallback(() => load("refresh"), [load]);

  return {
    receivables,
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
