import { createContext, useContext, useMemo, useState, type ReactNode } from "react";

import { SideMenu } from "@/components/side-menu/side-menu";

type SideMenuContextValue = {
  open: () => void;
  close: () => void;
};

const SideMenuContext = createContext<SideMenuContextValue | null>(null);

export function SideMenuProvider({ children }: { children: ReactNode }) {
  const [visible, setVisible] = useState(false);
  const value = useMemo(() => ({ open: () => setVisible(true), close: () => setVisible(false) }), []);

  return (
    <SideMenuContext.Provider value={value}>
      {children}
      <SideMenu visible={visible} onClose={value.close} />
    </SideMenuContext.Provider>
  );
}

export function useSideMenu() {
  const context = useContext(SideMenuContext);
  if (!context) throw new Error("useSideMenu deve ser usado dentro de SideMenuProvider");
  return context;
}
