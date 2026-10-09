import type {
  CepAddress,
  CreateCustomerRequest,
  CustomerListParams,
  CustomerListResponse,
  CustomerStats,
  Customer,
  UpdateCustomerRequest,
} from "@/interfaces/customer.interface";

import { apiClient } from "./api.service";

export async function CreateCustomer(
  payload: CreateCustomerRequest,
): Promise<string> {
  const response = await apiClient.post<{ customer_id: string }>(
    "/customers",
    payload,
  );
  return response.data.customer_id;
}

export async function GetCustomer(id: string): Promise<Customer> {
  const response = await apiClient.get<{ customer: Customer }>(
    `/customers/${id}`,
  );
  return response.data.customer;
}

export async function UpdateCustomer(
  id: string,
  payload: UpdateCustomerRequest,
): Promise<void> {
  await apiClient.put(`/customers/${id}`, payload);
}

/** Desativa o cliente (a API faz soft delete; não existe rota para reativar). */
export async function DeactivateCustomer(id: string): Promise<void> {
  await apiClient.delete(`/customers/${id}`);
}

type SalesCompleteResponse = {
  data: { sale: { customer_id: string } }[] | null;
};

const SALES_COUNT_LIMIT = 200;

/**
 * Quantidade de vendas do cliente. A API não tem esse filtro: busca as vendas pelo
 * nome (`/sales/complete?search=`) e conta as que são do cliente. `capped` indica
 * que o limite buscado foi atingido (mostrar como "200+").
 */
export async function CountCustomerSales(
  customer: Pick<Customer, "id" | "full_name">,
  signal?: AbortSignal,
): Promise<{ count: number; capped: boolean }> {
  const response = await apiClient.get<SalesCompleteResponse>(
    "/sales/complete",
    {
      params: {
        search: customer.full_name,
        page: 1,
        perPage: SALES_COUNT_LIMIT,
        orderBy: "desc",
      },
      signal,
    },
  );
  const rows = response.data.data ?? [];
  return {
    count: rows.filter((row) => row.sale.customer_id === customer.id).length,
    capped: rows.length === SALES_COUNT_LIMIT,
  };
}

export async function ListCustomers(
  params: CustomerListParams,
  signal?: AbortSignal,
): Promise<CustomerListResponse> {
  const response = await apiClient.get<CustomerListResponse>(
    "/customers/list",
    {
      params: {
        page: params.page,
        perPage: params.perPage,
        search: params.search,
        status: params.status,
        orderBy: params.orderBy,
        ...(params.startDate && { startDate: params.startDate }),
      },
      signal,
    },
  );
  return response.data;
}

// Limite alto para contar os itens da lista, já que `total_rows` não respeita filtros.
const COUNT_PAGE_SIZE = 1000;

/** Quantos clientes a lista retorna com esses filtros. */
async function countList(
  params: Pick<CustomerListParams, "status" | "startDate">,
  signal?: AbortSignal,
) {
  const response = await ListCustomers(
    {
      ...params,
      page: 1,
      perPage: COUNT_PAGE_SIZE,
      search: "",
      orderBy: "desc",
    },
    signal,
  );
  return response.data?.length ?? 0;
}

function firstDayOfMonth() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;
}

/**
 * Total, ativos e novos no mês. A API não tem um endpoint com esses números:
 * ativos vêm de `/customers/count`; inativos e novos no mês, da contagem da lista.
 */
export async function GetCustomerStats(
  signal?: AbortSignal,
): Promise<CustomerStats> {
  const [activeResponse, inactive, newThisMonth] = await Promise.all([
    apiClient.get<{ count: number }>("/customers/count", { signal }),
    countList({ status: "inactive" }, signal),
    countList({ status: "active", startDate: firstDayOfMonth() }, signal),
  ]);
  const active = activeResponse.data.count ?? 0;
  return { total: active + inactive, active, newThisMonth };
}

type ViaCepResponse = {
  logradouro?: string;
  bairro?: string;
  localidade?: string;
  uf?: string;
  erro?: boolean | string;
};

const CEP_TIMEOUT_MS = 10_000;

/** Busca o endereço no ViaCEP. Retorna `null` quando o CEP não existe. */
export async function LookupCep(cep: string): Promise<CepAddress | null> {
  const digits = cep.replace(/\D/g, "");
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), CEP_TIMEOUT_MS);

  let data: ViaCepResponse;
  try {
    const response = await fetch(`https://viacep.com.br/ws/${digits}/json/`, {
      signal: controller.signal,
    });
    if (!response.ok) throw new Error(`ViaCEP ${response.status}`);
    data = (await response.json()) as ViaCepResponse;
  } finally {
    clearTimeout(timeout);
  }
  if (data.erro) return null;

  return {
    street: data.logradouro ?? "",
    neighborhood: data.bairro ?? "",
    city: data.localidade ?? "",
    state: data.uf ?? "",
  };
}
