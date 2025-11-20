import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { SidebarMenuItem } from "../APis/Types";

type SidebarState = {
    sidebar: SidebarMenuItem[] | null;
    setSidebar: (items: SidebarMenuItem[] | null) => void;
};

const useSidebarStore = create<SidebarState>()(
    persist(
        (set) => ({
            sidebar: null,
            setSidebar: (items) => set({ sidebar: items }),
        }),
        {
            name: "clinik-sidebar",
        }
    )
);

export default useSidebarStore;
