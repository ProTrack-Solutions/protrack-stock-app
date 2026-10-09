import type {
  CreateProductRequest,
  ProductCategory,
  StockListParams,
  StockListResponse,
} from "@/interfaces/product.interface";
import { apiClient } from "./api.service";

export const ListProductCategories = async () => {
  const response = await apiClient.get<ProductCategory[] | null>("/products-categories/list/company");
  return response.data ?? [];
};

export const CreateProduct = async (params: CreateProductRequest) => {
  const response = await apiClient.post("/product", params);
  return response.data;
};

export const ListStockProducts = async (params: StockListParams, signal?: AbortSignal) => {
  const response = await apiClient.get<StockListResponse>("/product/company", {
    params: {
      page: params.page,
      perPage: params.perPage,
      search: params.search,
      orderBy: params.orderBy,
      ...(params.startDate && { startDate: params.startDate }),
    },
    signal,
  });
  return response.data;
};
