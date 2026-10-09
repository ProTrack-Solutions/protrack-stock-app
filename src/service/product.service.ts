import type { CreateProductRequest, ProductCategory } from "@/interfaces/product.interface";
import { apiClient } from "./api.service";

export const ListProductCategories = async () => {
  const response = await apiClient.get<ProductCategory[] | null>("/products-categories/list/company");
  return response.data ?? [];
};

export const CreateProduct = async (params: CreateProductRequest) => {
  const response = await apiClient.post("/product", params);
  return response.data;
};
