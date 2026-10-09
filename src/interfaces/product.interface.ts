// Formatos espelhados do protrack-api (internal/products e products_categories).

/** Unidades aceitas pela API (`unit_of_measure`). `UN` é usado fora da venda a granel. */
export type UnitOfMeasure = "UN" | "KG" | "G" | "L" | "ML";

/** GET /products-categories/list/company */
export interface ProductCategory {
  id: string;
  name: string;
  color: string;
  status: "ACTIVE" | "INACTIVE" | "DELETED";
}

/** POST /product */
export interface CreateProductRequest {
  name: string;
  description: string;
  category_id: string;
  barcode: string;
  quantity: number;
  size: string;
  cost_price: number;
  sale_price: number;
  /** A API gera um EAN-13 quando `true`. */
  not_barcode: boolean;
  sell_in_bulk: boolean;
  unit: UnitOfMeasure;
}

/**
 * PUT /product/:id — atualização parcial: a API ignora texto vazio e números 0
 * (mantém o valor atual) e não altera `sell_in_bulk`.
 */
export interface UpdateProductRequest {
  name: string;
  description: string;
  category_id: string;
  barcode: string;
  quantity: number;
  size: string;
  cost_price: number;
  sale_price: number;
  unit: UnitOfMeasure;
}

/** Item de GET /product/company. */
export interface StockProduct {
  id: string;
  category_id: string;
  category_name: string;
  name: string;
  description: string;
  barcode: string;
  quantity: number;
  size: string;
  cost_price: number;
  sale_price: number;
  sell_in_bulk: boolean;
  unit: UnitOfMeasure;
  created_at: string;
}

/** GET /product/company — lista paginada com os totais do estoque da empresa. */
export interface StockListResponse {
  data: StockProduct[] | null;
  page: number;
  per_page: number;
  total_rows: number;
  total_pages: number;
  total_value_in_stock: number;
  itens_in_stock: number;
  low_itens_in_stock: number;
}

export interface StockListParams {
  page: number;
  perPage: number;
  search: string;
  orderBy: "asc" | "desc";
  /** yyyy-MM-dd — produtos cadastrados a partir dessa data. */
  startDate?: string;
}
