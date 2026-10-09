// Formatos espelhados do protrack-api usados no dashboard inicial.

import type { PaymentMethod } from "./sale.interface";

/** GET /sales/total-amount */
export interface SalesSummary {
  current_month_st: number;
  last_month_st: number;
  growth_percentage: number;
}

/** GET /sales/top5-products */
export interface TopProduct {
  product_name: string;
  product_real_profit: number;
  total_sale: number;
}

/** GET /payment-methods/stats */
export interface PaymentMethodStat {
  payment_method: PaymentMethod;
  percentage_method: number;
}

/** GET /cash-flow */
export interface CashFlowPoint {
  date: string;
  total_inflow: number;
  total_outflow: number;
}

/** GET /bills-payable/summary (vem dentro de `bills_summary`). */
export interface BillsPayableSummary {
  general_status: string;
  total_overdue: number;
  total_quantity: number;
  total_scheduled: number;
  total_to_pay: number;
}

/** GET /announcements */
export interface Announcement {
  title: string;
  content: string;
  type: string;
  starts_at: string;
  expires_at: string;
}

export interface DashboardData {
  salesSummary: SalesSummary;
  totalReceivable: number;
  totalPayable: number;
  topProducts: TopProduct[];
  paymentMethods: PaymentMethodStat[];
  stockCost: number;
  inventoryTurnover: number;
  billsPayable: BillsPayableSummary;
  cashFlow: CashFlowPoint[];
  announcements: Announcement[];
}
