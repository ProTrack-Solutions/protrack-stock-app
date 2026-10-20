import type {
  BillCategory,
  BillsPayableListParams,
  BillsPayableListResponse,
  CreateBillPayableRequest,
  Vendor,
} from "@/interfaces/bills-payable.interface";

import { apiClient } from "./api.service";

export const ListBillsPayable = async (
  params: BillsPayableListParams,
  signal?: AbortSignal,
) => {
  const response = await apiClient.get<BillsPayableListResponse>(
    "/bills-payable/list",
    {
      params: {
        page: params.page,
        perPage: params.perPage,
        search: params.search,
        orderBy: params.orderBy,
        // Obrigatório na API (validação `oneof` sem `omitempty`).
        orderField: params.orderField ?? "due_date",
        ...(params.status && { status: params.status }),
        ...(params.startDueDate && { startDueDate: params.startDueDate }),
        ...(params.endDueDate && { endDueDate: params.endDueDate }),
      },
      signal,
    },
  );
  return response.data;
};

export const CreateBillPayable = async (payload: CreateBillPayableRequest) => {
  await apiClient.post("/bills-payable", payload);
};

/** Muda o status para `scheduled`. */
export const ScheduleBillPayable = async (id: string, scheduledDate: string) => {
  await apiClient.put(`/bills-payable/schedule/${id}`, {
    scheduled_date: scheduledDate,
  });
};

/**
 * O POST não devolve o id: procura a conta recém-criada entre as últimas
 * pendentes para conseguir agendá-la. `null` se não encontrar.
 */
export const FindCreatedBill = async (payload: CreateBillPayableRequest) => {
  const response = await ListBillsPayable({
    page: 1,
    perPage: 10,
    search: "",
    status: "pending",
    orderBy: "desc",
    orderField: "created_at",
  });
  return (
    (response.data ?? []).find(
      (b) =>
        b.vendor_id === payload.vendor_id &&
        b.category_id === payload.category_id &&
        b.description === payload.description &&
        b.due_date.slice(0, 10) === payload.due_date &&
        Math.abs(b.amount - payload.amount) < 0.005,
    ) ?? null
  );
};

export const ListActiveVendors = async () => {
  const response = await apiClient.get<Vendor[] | null>(
    "/vendors/list/is-active",
  );
  return response.data ?? [];
};

export const ListBillCategories = async () => {
  const response = await apiClient.get<BillCategory[] | null>(
    "/bill-categories",
  );
  return (response.data ?? []).filter((c) => c.is_active !== false);
};
