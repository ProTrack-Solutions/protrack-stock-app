/** Ponto de GET /cash-flow/total-summary. `total_period` é o saldo acumulado até o ponto. */
export interface CashFlowPeriod {
  /** "dd/MM/yyyy" (início do período). */
  period: string;
  total_period_inflow: number;
  total_period_outflow: number;
  total_period: number;
}

export interface CashFlowCategory {
  name_category: string;
  total: number;
}

/** GET /cash-flow/total-summary?period=day&quantity=N */
export interface CashFlowTotalSummaryResponse {
  summary: CashFlowPeriod[] | null;
  total_categories_in_flow:
    { name_category: string; total_inflow: number }[] | null;
  total_categories_out_flow:
    { name_category: string; total_outflow: number }[] | null;
  total_inflow: number;
  total_outflow: number;
  total: number;
  /** Tendência de entrada por dia (regressão linear sobre as entradas diárias). */
  projection: number;
}

/** GET /cash-flow/summary-month. `mount`: "current month" | "last month" | "last year". */
export interface CashFlowMonth {
  mount: string;
  total_inflow: number;
  total_outflow: number;
}

export interface CashFlowData {
  periods: CashFlowPeriod[];
  totalInflow: number;
  totalOutflow: number;
  balance: number;
  projection: number;
  inflowCategories: CashFlowCategory[];
  outflowCategories: CashFlowCategory[];
  months: CashFlowMonth[];
}
