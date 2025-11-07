
import { create } from "zustand";
import { persist } from "zustand/middleware";

export type UserContext = {
    id: string;
    name: string;
};

type ContextStore = {
    users: UserContext[];
    selectedUser: UserContext | null;

    setUsers: (users: UserContext[]) => void;
    setSelectedUser: (user: UserContext) => void;
    clearContext: () => void;
};

const useContextStore = create<ContextStore>()(
    persist(
        (set) => ({
            users: [],
            selectedUser: null,

            setUsers: (users) => set({ users }),
            setSelectedUser: (user) => set({ selectedUser: user }),
            clearContext: () => set({ selectedUser: null }),
        }),
        { name: "center" } // persisted in localStorage
    )
);

export default useContextStore;
