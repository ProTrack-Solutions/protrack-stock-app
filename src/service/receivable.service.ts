import type {
  CompanyPaymentMethod,
  CreatePaymentRequest,
  ReceivableListParams,
  ReceivableListResponse,
} from "@/interfaces/receivable.interface";

import { apiClient } from "./api.service";

export const ListReceivables = async (
  params: ReceivableListParams,
  signal?: AbortSignal,
) => {
  const response = await apiClient.get<ReceivableListResponse>(
    "/accounts-receivable/complete/list",
    {
      params: {
        page: params.page,
        perPage: params.perPage,
        search: params.search,
        orderBy: params.orderBy,
        // Obrigatório na API (validação `oneof` sem `omitempty`).
        orderField: "due_date",
        ...(params.status && { status: params.status }),
      },
      signal,
    },
  );
  return response.data;
};

export const ListActivePaymentMethods = async () => {
  const response = await apiClient.get<CompanyPaymentMethod[] | null>(
    "/payment-methods/is-active",
  );
  return response.data ?? [];
};

export const CreatePayment = async (payload: CreatePaymentRequest) => {
  await apiClient.post("/payments", payload);
};
