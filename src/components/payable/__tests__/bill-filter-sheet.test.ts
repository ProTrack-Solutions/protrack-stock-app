import { duePeriodRange } from "@/components/payable/bill-filter-sheet";

const TODAY = new Date(2026, 9, 20, 12);

describe("duePeriodRange", () => {
  it("sem filtro de data em 'Qualquer data'", () => {
    expect(duePeriodRange("all", TODAY)).toEqual({});
  });

  it("'Vencem hoje' usa o mesmo dia no início e no fim", () => {
    expect(duePeriodRange("today", TODAY)).toEqual({
      startDueDate: "2026-10-20",
      endDueDate: "2026-10-20",
    });
  });

  it("próximos 7 e 30 dias", () => {
    expect(duePeriodRange("7", TODAY)).toEqual({
      startDueDate: "2026-10-20",
      endDueDate: "2026-10-27",
    });
    expect(duePeriodRange("30", TODAY).endDueDate).toBe("2026-11-19");
  });
});
