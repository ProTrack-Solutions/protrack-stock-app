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
