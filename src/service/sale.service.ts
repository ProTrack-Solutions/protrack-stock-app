import {
  CreateSaleRequest,
  CreateSaleResponse,
  Customer,
  PaginatedResponse,
  Product,
  SaleListParams,
  SaleListResponse,
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

export const ListSales = async (params: SaleListParams, signal?: AbortSignal) => {
  const response = await apiClient.get<SaleListResponse>("/sales/complete", {
    params: {
      page: params.page,
      perPage: params.perPage,
      search: params.search,
      sortBy: "sale_at",
      orderBy: params.orderBy,
      ...(params.saleStatus && { saleStatus: params.saleStatus }),
      ...(params.paymentMethod && { paymentMethod: params.paymentMethod }),
      ...(params.saleStartDate && { saleStartDate: params.saleStartDate }),
    },
    signal,
  });
  return response.data;
};
