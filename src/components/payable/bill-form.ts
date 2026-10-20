import { parseNumber } from "@/components/sale/number-field";
import type { CreateBillPayableRequest } from "@/interfaces/bills-payable.interface";
import { brToIsoDate } from "@/utils/dates";

export type BillForm = {
  vendorId: string;
  categoryId: string;
  description: string;
  /** "dd/mm/aaaa" */
  dueDate: string;
  /** Agenda o pagamento para a data de vencimento logo após cadastrar. */
  schedule: boolean;
  amountText: string;
  paymentMethodId: string;
  notes: string;
};

export type BillFormErrors = Partial<
  Record<
    "vendorId" | "categoryId" | "description" | "dueDate" | "amount" | "paymentMethodId",
    string
  >
>;

export const EMPTY_BILL_FORM: BillForm = {
  vendorId: "",
  categoryId: "",
  description: "",
  dueDate: "",
  schedule: false,
  amountText: "",
  paymentMethodId: "",
  notes: "",
};

const round2 = (value: number) => Math.round(value * 100) / 100;

export function billAmount(form: BillForm) {
  return round2(parseNumber(form.amountText));
}

export function validateBillForm(form: BillForm): BillFormErrors {
  const errors: BillFormErrors = {};
  if (!form.vendorId) errors.vendorId = "Selecione o fornecedor.";
  if (!form.categoryId) errors.categoryId = "Selecione a categoria.";
  if (!form.description.trim()) errors.description = "Informe a descrição.";
  if (!form.dueDate) errors.dueDate = "Informe a data de vencimento.";
  else if (!brToIsoDate(form.dueDate))
    errors.dueDate = "Data inválida. Use dd/mm/aaaa.";
  if (billAmount(form) <= 0) errors.amount = "Informe um valor maior que zero.";
  // A API decodifica `payment_method_id` como UUID: vazio é recusado.
  if (!form.paymentMethodId)
    errors.paymentMethodId = "Selecione a forma de pagamento.";
  return errors;
}

/** Só chame depois de `validateBillForm` sem erros. */
export function toCreateBillRequest(form: BillForm): CreateBillPayableRequest {
  return {
    vendor_id: form.vendorId,
    category_id: form.categoryId,
    payment_method_id: form.paymentMethodId,
    amount: billAmount(form),
    due_date: brToIsoDate(form.dueDate) ?? "",
    description: form.description.trim(),
    notes: form.notes.trim(),
  };
}
