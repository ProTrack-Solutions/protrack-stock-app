import type {
  CashFlowData,
  CashFlowMonth,
  CashFlowTotalSummaryResponse,
} from "@/interfaces/cash-flow.interface";

import { apiClient } from "./api.service";

/** Mesmas rotas da tela de fluxo de caixa do protrack-web (visão diária). */
export async function GetCashFlow(
  days: number,
  signal?: AbortSignal,
): Promise<CashFlowData> {
  const [summary, months] = await Promise.all([
    apiClient.get<CashFlowTotalSummaryResponse>("/cash-flow/total-summary", {
      params: { period: "day", quantity: days },
      signal,
    }),
    apiClient.get<CashFlowMonth[] | null>("/cash-flow/summary-month", {
      signal,
    }),
  ]);
  const s = summary.data;

  return {
    periods: s.summary ?? [],
    totalInflow: s.total_inflow ?? 0,
    totalOutflow: s.total_outflow ?? 0,
    balance: s.total ?? 0,
    projection: s.projection ?? 0,
    inflowCategories: (s.total_categories_in_flow ?? []).map((c) => ({
      name_category: c.name_category,
      total: c.total_inflow,
    })),
    outflowCategories: (s.total_categories_out_flow ?? []).map((c) => ({
      name_category: c.name_category,
      total: c.total_outflow,
    })),
    months: months.data ?? [],
  };
}
