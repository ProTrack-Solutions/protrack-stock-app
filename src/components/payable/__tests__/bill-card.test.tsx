import { render, screen } from "@testing-library/react-native";

import { BillCard } from "@/components/payable/bill-card";
import type { BillPayable } from "@/interfaces/bills-payable.interface";

const bill = (overrides: Partial<BillPayable> = {}): BillPayable => ({
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

beforeAll(() => {
  jest.useFakeTimers({ now: new Date(2026, 9, 20, 12) });
});
afterAll(() => jest.useRealTimers());

describe("BillCard", () => {
  it("mostra fornecedor, descrição, categoria, valor e prazo", async () => {
    await render(<BillCard bill={bill()} />);
    expect(screen.getByText("Icone modas")).toBeTruthy();
    expect(screen.getByText("TEste")).toBeTruthy();
    expect(screen.getByText("Despesas principais")).toBeTruthy();
    expect(screen.getByText("Pendente")).toBeTruthy();
    expect(screen.getByText("R$ 2.000,00")).toBeTruthy();
    expect(screen.getByText("08/11/2026 · Vence em 19 dias")).toBeTruthy();
  });

  it("conta paga mostra só a data, sem prazo", async () => {
    await render(
      <BillCard bill={bill({ status: "paid", due_date: "2026-08-16" })} />,
    );
    expect(screen.getByText("Pago")).toBeTruthy();
    expect(screen.getByText("16/08/2026")).toBeTruthy();
  });

  it("conta agendada usa a data do agendamento", async () => {
    await render(
      <BillCard
        bill={bill({ status: "scheduled", scheduled_date: "2026-10-27" })}
      />,
    );
    expect(screen.getByText("Agendado")).toBeTruthy();
    expect(screen.getByText("27/10/2026 · Vence em 7 dias")).toBeTruthy();
  });

  it("conta vencida mostra os dias em atraso", async () => {
    await render(
      <BillCard bill={bill({ status: "overdue", due_date: "2026-10-17" })} />,
    );
    expect(screen.getByText("Vencido")).toBeTruthy();
    expect(screen.getByText("17/10/2026 · Venceu há 3 dias")).toBeTruthy();
  });
});
