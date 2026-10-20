import type { BillPayable } from "@/interfaces/bills-payable.interface";
import { apiClient } from "@/service/api.service";
import {
  CreateBillPayable,
  FindCreatedBill,
  ListActiveVendors,
  ListBillCategories,
  ListBillsPayable,
  ScheduleBillPayable,
} from "@/service/bills-payable.service";

jest.mock("@/service/api.service", () => ({
  apiClient: { get: jest.fn(), post: jest.fn(), put: jest.fn() },
}));

const get = apiClient.get as jest.Mock;
const post = apiClient.post as jest.Mock;
const put = apiClient.put as jest.Mock;

const PAYLOAD = {
  vendor_id: "v1",
  category_id: "c1",
  payment_method_id: "m1",
  amount: 2000,
  due_date: "2026-11-08",
  description: "TEste",
  notes: "",
};

const bill = (overrides: Partial<BillPayable>): BillPayable => ({
  id: "b1",
  vendor_id: "v1",
  vendor_name: "Icone modas",
  category_id: "c1",
  category_name: "Despesas principais",
  payment_method_id: "m1",
  payment_method_name: "Pix",
  amount: 2000,
  amount_paid: 0,
  due_date: "2026-11-08",
  scheduled_date: "",
  payment_date: "",
  status: "pending",
  description: "TEste",
  notes: "",
  created_at: "2026-10-20T20:00:00Z",
  ...overrides,
});

beforeEach(() => jest.resetAllMocks());

describe("ListBillsPayable", () => {
  it("chama /bills-payable/list com orderField padrão e sem filtros vazios", async () => {
    get.mockResolvedValue({ data: { data: [] } });
    await ListBillsPayable({ page: 2, perPage: 20, search: "", orderBy: "asc" });
    expect(get).toHaveBeenCalledWith("/bills-payable/list", {
      params: {
        page: 2,
        perPage: 20,
        search: "",
        orderBy: "asc",
        orderField: "due_date",
      },
      signal: undefined,
    });
  });

  it("envia status e intervalo de vencimento quando informados", async () => {
    get.mockResolvedValue({ data: { data: [] } });
    await ListBillsPayable({
      page: 1,
      perPage: 20,
      search: "icone",
      orderBy: "desc",
      status: "overdue",
      startDueDate: "2026-10-20",
      endDueDate: "2026-10-27",
    });
    expect(get.mock.calls[0][1].params).toMatchObject({
      search: "icone",
      status: "overdue",
      startDueDate: "2026-10-20",
      endDueDate: "2026-10-27",
    });
  });
});

describe("criação e agendamento", () => {
  it("POST /bills-payable com o payload", async () => {
    post.mockResolvedValue({});
    await CreateBillPayable(PAYLOAD);
    expect(post).toHaveBeenCalledWith("/bills-payable", PAYLOAD);
  });

  it("PUT /bills-payable/schedule/:id com a data", async () => {
    put.mockResolvedValue({});
    await ScheduleBillPayable("b1", "2026-11-08");
    expect(put).toHaveBeenCalledWith("/bills-payable/schedule/b1", {
      scheduled_date: "2026-11-08",
    });
  });

  it("FindCreatedBill acha a conta recém-criada entre as últimas pendentes", async () => {
    get.mockResolvedValue({
      data: {
        data: [
          bill({ id: "other", description: "Outra" }),
          bill({ id: "created" }),
        ],
      },
    });
    const found = await FindCreatedBill(PAYLOAD);
    expect(found?.id).toBe("created");
    expect(get.mock.calls[0][1].params).toMatchObject({
      status: "pending",
      orderBy: "desc",
      orderField: "created_at",
    });
  });

  it("FindCreatedBill devolve null quando nada bate", async () => {
    get.mockResolvedValue({ data: { data: [bill({ amount: 1999 })] } });
    expect(await FindCreatedBill(PAYLOAD)).toBeNull();
  });
});

describe("cadastros auxiliares", () => {
  it("fornecedores ativos: trata null como lista vazia", async () => {
    get.mockResolvedValue({ data: null });
    expect(await ListActiveVendors()).toEqual([]);
    expect(get).toHaveBeenCalledWith("/vendors/list/is-active");
  });

  it("categorias: remove as inativas", async () => {
    get.mockResolvedValue({
      data: [
        { id: "1", name: "Ativa", is_active: true },
        { id: "2", name: "Inativa", is_active: false },
      ],
    });
    expect((await ListBillCategories()).map((c) => c.id)).toEqual(["1"]);
    expect(get).toHaveBeenCalledWith("/bill-categories");
  });
});
