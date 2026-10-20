import {
  EMPTY_BILL_FORM,
  toCreateBillRequest,
  validateBillForm,
  type BillForm,
} from "@/components/payable/bill-form";

const VALID: BillForm = {
  vendorId: "vendor-1",
  categoryId: "category-1",
  description: "  Conta de energia  ",
  dueDate: "08/11/2026",
  schedule: false,
  amountText: "2000,5",
  paymentMethodId: "method-1",
  notes: " pagar no app do banco ",
};

describe("validateBillForm", () => {
  it("não acusa erro em um formulário completo", () => {
    expect(validateBillForm(VALID)).toEqual({});
  });

  it("exige todos os campos obrigatórios", () => {
    expect(Object.keys(validateBillForm(EMPTY_BILL_FORM)).sort()).toEqual([
      "amount",
      "categoryId",
      "description",
      "dueDate",
      "paymentMethodId",
      "vendorId",
    ]);
  });

  it("recusa descrição só com espaços", () => {
    expect(validateBillForm({ ...VALID, description: "   " }).description).toBe(
      "Informe a descrição.",
    );
  });

  it("recusa data inexistente", () => {
    expect(validateBillForm({ ...VALID, dueDate: "31/02/2026" }).dueDate).toBe(
      "Data inválida. Use dd/mm/aaaa.",
    );
  });

  it("recusa valor zero", () => {
    expect(validateBillForm({ ...VALID, amountText: "0,00" }).amount).toBeDefined();
  });

  it("exige forma de pagamento (a API não aceita UUID vazio)", () => {
    expect(
      validateBillForm({ ...VALID, paymentMethodId: "" }).paymentMethodId,
    ).toBeDefined();
  });
});

describe("toCreateBillRequest", () => {
  it("monta o payload do POST /bills-payable", () => {
    expect(toCreateBillRequest(VALID)).toEqual({
      vendor_id: "vendor-1",
      category_id: "category-1",
      payment_method_id: "method-1",
      amount: 2000.5,
      due_date: "2026-11-08",
      description: "Conta de energia",
      notes: "pagar no app do banco",
    });
  });

  it("arredonda o valor para centavos", () => {
    expect(toCreateBillRequest({ ...VALID, amountText: "10.129" }).amount).toBe(
      10.13,
    );
  });
});
