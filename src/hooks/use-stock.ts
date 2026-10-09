import { isCancel } from "axios";
import { useCallback, useEffect, useRef, useState } from "react";

import type { StockListParams, StockProduct } from "@/interfaces/product.interface";
import { getApiErrorMessage } from "@/service/api.service";
import { ListStockProducts } from "@/service/product.service";

const PAGE_SIZE = 20;
/** Mesmo critério do `CountLowStockProductsByCompany` da API. */
export const LOW_STOCK_LIMIT = 5;

export type StockStats = {
  productsCount: number;
  itemsInStock: number;
  totalValue: number;
  lowStockCount: number;
};

export type StockFilters = {
  search: string;
  orderBy: StockListParams["orderBy"];
  startDate?: string;
  /** A API não filtra por categoria: com ela (ou `lowStock`) a lista inteira é baixada e filtrada aqui. */
  categoryId: string | null;
  lowStock: boolean;
};

// Igual à contagem da API, que também inclui produtos a granel (quantidade 0).
const isLowStock = (p: StockProduct) => p.quantity < LOW_STOCK_LIMIT;

export function useStock(filters: StockFilters) {
  const { search, orderBy, startDate, categoryId, lowStock } = filters;
  const localFilter = categoryId !== null || lowStock;

  const [products, setProducts] = useState<StockProduct[]>([]);
  const [stats, setStats] = useState<StockStats | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
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

      const base = { search, orderBy, startDate };
      try {
        let response = await ListStockProducts({ ...base, page: 1, perPage: PAGE_SIZE }, controller.signal);
        if (localFilter && response.total_rows > PAGE_SIZE) {
          response = await ListStockProducts(
            { ...base, page: 1, perPage: response.total_rows },
            controller.signal,
          );
        }

        let list = response.data ?? [];
        if (categoryId) list = list.filter((p) => p.category_id === categoryId);
        if (lowStock) list = list.filter(isLowStock);

        setProducts(list);
        setPage(1);
        setTotalPages(localFilter ? 1 : response.total_pages || 1);
        setStats({
          productsCount: response.total_rows ?? 0,
          itemsInStock: response.itens_in_stock ?? 0,
          totalValue: response.total_value_in_stock ?? 0,
          lowStockCount: response.low_itens_in_stock ?? 0,
        });
        setError(null);
      } catch (e) {
        if (isCancel(e)) return;
        setError(getApiErrorMessage(e, "Não foi possível carregar os produtos."));
      } finally {
        if (controllerRef.current === controller) {
          setLoading(false);
          setRefreshing(false);
        }
      }
    },
    [search, orderBy, startDate, categoryId, lowStock, localFilter],
  );

  useEffect(() => {
    load("initial");
    return () => controllerRef.current?.abort();
  }, [load]);

  const loadMore = useCallback(async () => {
    if (loading || loadingMore || refreshing || page >= totalPages) return;
    setLoadingMore(true);
    const generation = generationRef.current;
    try {
      const response = await ListStockProducts({ search, orderBy, startDate, page: page + 1, perPage: PAGE_SIZE });
      if (generation !== generationRef.current) return;
      setProducts((current) => {
        const ids = new Set(current.map((p) => p.id));
        return [...current, ...(response.data ?? []).filter((p) => !ids.has(p.id))];
      });
      setPage(page + 1);
      setTotalPages(response.total_pages || 1);
    } catch {
      // Mantém o que já foi carregado; o usuário pode puxar para atualizar.
    } finally {
      setLoadingMore(false);
    }
  }, [loading, loadingMore, refreshing, page, totalPages, search, orderBy, startDate]);

  const refresh = useCallback(() => load("refresh"), [load]);

  return { products, stats, loading, loadingMore, refreshing, error, refresh, loadMore };
}
