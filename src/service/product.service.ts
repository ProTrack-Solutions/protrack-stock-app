import type {
  CreateProductRequest,
  ProductCategory,
  StockListParams,
  StockListResponse,
  UpdateProductRequest,
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

export const UpdateProduct = async (id: string, params: UpdateProductRequest) => {
  await apiClient.put(`/product/${id}`, params);
};

/** Exclui o produto (a API faz soft delete; não existe rota para desfazer). */
export const DeleteProduct = async (id: string) => {
  await apiClient.delete(`/product/${id}`);
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
