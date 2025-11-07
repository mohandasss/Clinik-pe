import { create } from "zustand";
import { persist } from "zustand/middleware";

type User = {
    user_id: string;
    name: string;
    email: string;
    mobile: string;
    organization_id: string | null;
    center_id: string | null;
} | null;

export type OrganizationDetails = {
    organization_id: string | null;
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
} | null;

type AuthState = {
    user: User;
    setUser: (user: User) => void;
    logout: () => void;

    organizationDetails: OrganizationDetails;
    setOrganizationDetails: (details: OrganizationDetails) => void;
};

const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            user: null,
            setUser: (user) => set({ user }),
            logout: () => set({ user: null }),

            organizationDetails: null,
            setOrganizationDetails: (details) => set({ organizationDetails: details }),
        }),
        {
            name: "auth-storage", // key in localStorage
        }
    )
);

export default useAuthStore;
