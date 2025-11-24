import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Doctor = {
    doctor_id: string;
    organization_id: string | null;
    organization_name: string | null;
    user_id: string;
    center_name: string | null;
    center_id: string | null;
    central_account_id: string | null;
    user_type: string;
    name: string;
    email: string | null;
    mobile: string | null;
    time_zone: string;
    currency: string | null;
    country: string | null;
    access: string | null;
    image: string | null;
} | null;

type DoctorAuthState = {
    doctor: Doctor;
    setDoctor: (doctor: Doctor) => void;
    logout: () => void;
};

export const useDoctorAuthStore = create<DoctorAuthState>()(
    persist(
        (set) => ({
            doctor: null,

            setDoctor: (doctor) => set({ doctor }),

            logout: () => {
                set({ doctor: null });

                try {
                    localStorage.removeItem("doctor-auth");
                } catch {
                    console.log("Could not clear doctor auth storage.");
                }
            },
        }),
        {
            name: "doctor-auth", // stored in localStorage
        }
    )
);
