import { isAxiosError } from "axios";

import {
  CreateSaleRequest,
  CreateSaleResponse,
  Customer,
  PaginatedResponse,
  Product,
} from "@/interfaces/sale.interface";
import { apiClient } from "./api.service";

const PAGE_SIZE = 20;

export const SearchCustomers = async (search: string, signal?: AbortSignal) => {
  const response = await apiClient.get<PaginatedResponse<Customer>>("/customers/list", {
    params: { search, page: 1, perPage: PAGE_SIZE, orderBy: "asc", status: "active" },
    signal,
  });
  return response.data.data ?? [];
};

export const SearchProducts = async (search: string, signal?: AbortSignal) => {
  const response = await apiClient.get<PaginatedResponse<Product>>("/product/company", {
    params: { search, page: 1, perPage: PAGE_SIZE, orderBy: "asc" },
    signal,
  });
  return response.data.data ?? [];
};

export const CreateSale = async (params: CreateSaleRequest) => {
  const response = await apiClient.post<CreateSaleResponse>("/sales", params);
  return response.data;
};

const SALE_ERRORS: Record<string, string> = {
  "insufficient quantity": "Estoque insuficiente para um dos produtos.",
  "discount amount cannot exceed subtotal": "O desconto não pode ser maior que o subtotal.",
  "customer_id is required for installment sales": "Selecione um cliente para vendas no crediário.",
  "the sale must have at least one item": "Adicione pelo menos um produto à venda.",
};

/** Converte o erro da API (`{ error: string }`) em uma mensagem para o usuário. */
export function getApiErrorMessage(error: unknown, fallback: string): string {
  if (!isAxiosError(error)) return fallback;
  if (!error.response) return "Não foi possível conectar ao servidor. Verifique sua internet.";

  const { status, data } = error.response;
  const apiMessage = typeof data?.error === "string" ? data.error : "";

  if (SALE_ERRORS[apiMessage]) return SALE_ERRORS[apiMessage];
  if (status === 403) return "Seu usuário não tem acesso a este módulo.";
  return fallback;
}
