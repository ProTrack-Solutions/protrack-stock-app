import type {
  Announcement,
  BillsPayableSummary,
  CashFlowPoint,
  DashboardData,
  PaymentMethodStat,
  SalesSummary,
  TopProduct,
} from "@/interfaces/dashboard.interface";
import { apiClient } from "./api.service";

const get = async <T>(url: string, config?: Parameters<typeof apiClient.get>[1]) =>
  (await apiClient.get<T>(url, config)).data;

const EMPTY_BILLS: BillsPayableSummary = {
  general_status: "",
  total_overdue: 0,
  total_quantity: 0,
  total_scheduled: 0,
  total_to_pay: 0,
};

/** Valor de uma promessa do `allSettled`, ou `fallback` se ela falhou (ex: 403 sem permissão). */
function valueOr<T>(result: PromiseSettledResult<T>, fallback: T): T {
  return result.status === "fulfilled" && result.value != null ? result.value : fallback;
}

/**
 * Busca todos os indicadores do dashboard em paralelo. Cada bloco falha de forma
 * independente — usuários sem perfil ADMIN não acessam alguns totais.
 */
export const GetDashboard = async (): Promise<DashboardData> => {
  const [
    salesSummary,
    totalPending,
    totalPayable,
    topProducts,
    paymentMethods,
    stockCost,
    inventoryTurnover,
    billsPayable,
    cashFlow,
    announcements,
  ] = await Promise.allSettled([
    get<SalesSummary>("/sales/total-amount"),
    get<{ total_pending: number }>("/sales/total-pending"),
    get<number>("/bills-payable/total-payable"),
    get<TopProduct[] | null>("/sales/top5-products"),
    get<PaymentMethodStat[] | null>("/payment-methods/stats"),
    get<{ cost_total: number }>("/product/cost-total"),
    get<{ inventory_turnover: number }>("/sales/stock-turnover"),
    get<{ bills_summary: BillsPayableSummary }>("/bills-payable/summary"),
    get<CashFlowPoint[] | null>("/cash-flow"),
    get<{ data: Announcement[] | null }>("/announcements", {
      headers: { Page: 1, PerPage: 20 },
    }),
  ]);

  return {
    salesSummary: valueOr(salesSummary, {
      current_month_st: 0,
      last_month_st: 0,
      growth_percentage: 0,
    }),
    totalReceivable: valueOr(totalPending, { total_pending: 0 }).total_pending ?? 0,
    totalPayable: Number(valueOr(totalPayable, 0)) || 0,
    topProducts: valueOr(topProducts, null) ?? [],
    paymentMethods: valueOr(paymentMethods, null) ?? [],
    stockCost: valueOr(stockCost, { cost_total: 0 }).cost_total ?? 0,
    inventoryTurnover: valueOr(inventoryTurnover, { inventory_turnover: 0 }).inventory_turnover ?? 0,
    billsPayable: valueOr(billsPayable, { bills_summary: EMPTY_BILLS }).bills_summary ?? EMPTY_BILLS,
    cashFlow: valueOr(cashFlow, null) ?? [],
    announcements: valueOr(announcements, { data: null }).data ?? [],
  };
};
