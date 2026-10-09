import { isCancel } from "axios";
import { useEffect, useState } from "react";

import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { getApiErrorMessage } from "@/service/sale.service";

/**
 * Busca na API conforme o usuário digita (com debounce) enquanto `enabled`
 * for verdadeiro, cancelando a requisição anterior a cada nova busca.
 */
export function useRemoteSearch<T>(
  query: string,
  enabled: boolean,
  fetcher: (search: string, signal: AbortSignal) => Promise<T[]>,
) {
  const search = useDebouncedValue(query.trim());
  const [results, setResults] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled) return;

    const controller = new AbortController();
    setLoading(true);
    setError(null);

    fetcher(search, controller.signal)
      .then(setResults)
      .catch((err) => {
        if (isCancel(err)) return;
        setResults([]);
        setError(getApiErrorMessage(err, "Não foi possível carregar a lista."));
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [search, enabled, fetcher]);

  return { results, loading, error };
}
