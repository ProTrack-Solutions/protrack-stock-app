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
