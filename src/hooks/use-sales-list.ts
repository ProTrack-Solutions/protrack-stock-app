import { isCancel } from "axios";
import { useCallback, useEffect, useRef, useState } from "react";

import type { SaleListItem, SaleListParams } from "@/interfaces/sale.interface";
import { getApiErrorMessage } from "@/service/api.service";
import { ListSales } from "@/service/sale.service";

const PAGE_SIZE = 20;

export type SalesStats = {
  salesCount: number;
  totalInvoiced: number;
  totalPending: number;
  salesCanceled: number;
};

export type SalesFilters = Omit<SaleListParams, "page" | "perPage">;

export function useSalesList(filters: SalesFilters) {
  const { search, orderBy, saleStatus, paymentMethod, saleStartDate } = filters;

  const [sales, setSales] = useState<SaleListItem[]>([]);
  const [stats, setStats] = useState<SalesStats | null>(null);
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

  const params = useCallback(
    (nextPage: number): SaleListParams => ({
      search,
      orderBy,
      saleStatus,
      paymentMethod,
      saleStartDate,
      page: nextPage,
      perPage: PAGE_SIZE,
    }),
    [search, orderBy, saleStatus, paymentMethod, saleStartDate],
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
        const response = await ListSales(params(1), controller.signal);
        const list = response.data ?? [];
        setSales(list);
        setPage(1);
        setHasMore(list.length === PAGE_SIZE);
        setStats({
          salesCount: response.sales_count ?? 0,
          totalInvoiced: response.total_invoiced ?? 0,
          totalPending: response.total_pending ?? 0,
          salesCanceled: response.sales_canceled ?? 0,
        });
        setError(null);
      } catch (e) {
        if (isCancel(e)) return;
        setError(getApiErrorMessage(e, "Não foi possível carregar as vendas."));
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
      const response = await ListSales(params(page + 1));
      if (generation !== generationRef.current) return;
      const next = response.data ?? [];
      setSales((current) => {
        const ids = new Set(current.map((s) => s.sale.sale_id));
        return [...current, ...next.filter((s) => !ids.has(s.sale.sale_id))];
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
    sales,
    stats,
    hasMore,
    loading,
    loadingMore,
    refreshing,
    error,
    refresh,
    loadMore,
  };
}
