import { isCancel } from "axios";
import { useCallback, useEffect, useRef, useState } from "react";

import type {
  Customer,
  CustomerListParams,
  CustomerStats,
  CustomerStatusFilter,
} from "@/interfaces/customer.interface";
import { getApiErrorMessage } from "@/service/api.service";
import { GetCustomerStats, ListCustomers } from "@/service/customer.service";

const PAGE_SIZE = 20;

/** A API manda o "zero" do Go (`0001-01-01...`) em vez de `null` para clientes ativos. */
export function isInactive(customer: Customer) {
  return (
    Boolean(customer.deleted_at) && !customer.deleted_at.startsWith("0001-")
  );
}

export type CustomerFilters = {
  search: string;
  status: CustomerStatusFilter;
  orderBy: CustomerListParams["orderBy"];
  startDate?: string;
};

export function useCustomers(filters: CustomerFilters) {
  const { search, status, orderBy, startDate } = filters;

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [stats, setStats] = useState<CustomerStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);
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
        const response = await ListCustomers(
          { search, status, orderBy, startDate, page: 1, perPage: PAGE_SIZE },
          controller.signal,
        );
        const list = response.data ?? [];
        setCustomers(list);
        setPage(1);
        setHasMore(list.length === PAGE_SIZE);
        setError(null);
      } catch (e) {
        if (isCancel(e)) return;
        setError(
          getApiErrorMessage(e, "Não foi possível carregar os clientes."),
        );
      } finally {
        if (controllerRef.current === controller) {
          setLoading(false);
          setRefreshing(false);
        }
      }
    },
    [search, status, orderBy, startDate],
  );

  const loadStats = useCallback(async () => {
    try {
      setStats(await GetCustomerStats());
    } catch {
      // Os cards somem, mas a lista continua utilizável.
    } finally {
      setStatsLoading(false);
    }
  }, []);

  useEffect(() => {
    load("initial");
    return () => controllerRef.current?.abort();
  }, [load]);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  const loadMore = useCallback(async () => {
    if (loading || loadingMore || refreshing || !hasMore) return;
    setLoadingMore(true);
    const generation = generationRef.current;
    try {
      const response = await ListCustomers({
        search,
        status,
        orderBy,
        startDate,
        page: page + 1,
        perPage: PAGE_SIZE,
      });
      if (generation !== generationRef.current) return;
      const next = response.data ?? [];
      setCustomers((current) => {
        const ids = new Set(current.map((c) => c.id));
        return [...current, ...next.filter((c) => !ids.has(c.id))];
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
    startDate,
  ]);

  const refresh = useCallback(() => {
    load("refresh");
    loadStats();
  }, [load, loadStats]);

  return {
    customers,
    stats,
    statsLoading,
    hasMore,
    loading,
    loadingMore,
    refreshing,
    error,
    refresh,
    loadMore,
  };
}
