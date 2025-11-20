import { create } from "zustand";
import { persist } from "zustand/middleware";
// Sidebar items moved to `sidebarStore.ts`.

type User = {
    user_id: string;
    name: string;
    email: string;
    mobile: string;
    organization_id: string | null;
    center_id: string | null;
} | null;

export interface OrganizationDetails {
    organization_id: string;
    organization_name: string;
    center_name: string | null;

    user_id: string;
    name: string;
    email: string;
    mobile: string;
    user_role: string;
    user_type: string;
    central_account_id: string;
    time_zone: string;
    currency: string | null;
    country: string | null;
    access: string | null;
    center_id: string | null;
    image: string | null;
}


type AuthState = {
    user: User;
    setUser: (user: User) => void;
    logout: () => void;

    organizationDetails: OrganizationDetails | null;
    setOrganizationDetails: (details: OrganizationDetails | null) => void;
    // sidebar & setSidebar have been moved to `sidebarStore.ts` and persisted separately
};

const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            user: null,
            setUser: (user) => set({ user }),
            logout: () => {

                set({ user: null, organizationDetails: null });

                try {
                    // Clear all persisted storage
                    localStorage.removeItem("auth-storage");
                    localStorage.removeItem("clinik-sidebar");
                    localStorage.removeItem("selected-center");
                    // Clear any other localStorage items your app uses
                    localStorage.clear(); // Clear everything to be safe
                } catch {
                    console.log("Failed to access localStorage during logout.")
                }
            },

            organizationDetails: null,
            setOrganizationDetails: (details) => set({ organizationDetails: details }),
        }),
        {
            name: "auth-storage",
        }
    )
);

export default useAuthStore;
