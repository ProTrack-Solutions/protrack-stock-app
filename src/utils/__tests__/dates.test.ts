import {
  brToIsoDate,
  daysUntil,
  dueDistanceLabel,
  formatIsoDate,
  isoDateFromToday,
  toIsoDate,
} from "@/utils/dates";

// 20/10/2026, meio-dia local (evita borda de fuso).
const TODAY = new Date(2026, 9, 20, 12);

describe("toIsoDate / isoDateFromToday", () => {
  it("formata no fuso local com zero à esquerda", () => {
    expect(toIsoDate(new Date(2026, 0, 5))).toBe("2026-01-05");
  });

  it("soma dias atravessando o mês e o ano", () => {
    expect(isoDateFromToday(0, TODAY)).toBe("2026-10-20");
    expect(isoDateFromToday(15, TODAY)).toBe("2026-11-04");
    expect(isoDateFromToday(30, TODAY)).toBe("2026-11-19");
    expect(isoDateFromToday(80, TODAY)).toBe("2027-01-08");
  });
});

describe("formatIsoDate", () => {
  it("converte yyyy-MM-dd para dd/mm/aaaa", () => {
    expect(formatIsoDate("2026-11-08")).toBe("08/11/2026");
  });

  it("ignora a parte de hora", () => {
    expect(formatIsoDate("2026-08-16T00:00:00Z")).toBe("16/08/2026");
  });

  it("devolve o valor original se não for data", () => {
    expect(formatIsoDate("")).toBe("");
  });
});

describe("brToIsoDate", () => {
  it("aceita datas futuras", () => {
    expect(brToIsoDate("08/11/2030")).toBe("2030-11-08");
  });

  it.each(["31/02/2026", "00/01/2026", "1/1/2026", "12/13/2026", "01/01/1999"])(
    "recusa %s",
    (value) => {
      expect(brToIsoDate(value)).toBeNull();
    },
  );
});

describe("daysUntil / dueDistanceLabel", () => {
  it("conta dias corridos", () => {
    expect(daysUntil("2026-11-08", TODAY)).toBe(19);
    expect(daysUntil("2026-10-20", TODAY)).toBe(0);
    expect(daysUntil("2026-10-17", TODAY)).toBe(-3);
  });

  it.each([
    ["2026-11-08", "Vence em 19 dias"],
    ["2026-10-21", "Vence amanhã"],
    ["2026-10-20", "Vence hoje"],
    ["2026-10-19", "Venceu ontem"],
    ["2026-10-10", "Venceu há 10 dias"],
  ])("%s -> %s", (date, label) => {
    expect(dueDistanceLabel(date, TODAY)).toBe(label);
  });
});
