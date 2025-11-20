// Layouts/PublicRoute.tsx
import { Navigate } from "react-router-dom";
import useAuthStore from "../GlobalStore/store";

type Props = {
  children: React.ReactNode;
};

export default function PublicRoute({ children }: Props) {
  const user = useAuthStore((state) => state.user);
  const organizationDetails = useAuthStore(
    (state) => state.organizationDetails
  );

  // if user is already authenticated, redirect to default protected page
  if (user || organizationDetails) {
    return <Navigate to="/organizations" replace />; // or default dashboard
  }

  // otherwise show wrapped component
  return <>{children}</>;
}
