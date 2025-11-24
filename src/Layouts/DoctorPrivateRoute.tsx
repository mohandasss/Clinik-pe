import { Navigate } from "react-router-dom";
import { useDoctorAuthStore } from "../GlobalStore/doctorStore";
import type { ReactNode } from "react";

type DoctorPrivateRouteProps = {
  children: ReactNode;
};

export default function DoctorPrivateRoute({
  children,
}: DoctorPrivateRouteProps) {
  const doctor = useDoctorAuthStore((state) => state.doctor);

  if (!doctor) {
    return <Navigate to="/doctor-login" replace />;
  }

  return <>{children}</>;
}
