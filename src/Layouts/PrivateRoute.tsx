import { Navigate } from "react-router-dom";
import useAuthStore from "../GlobalStore/store";

type Props = {
  children: React.ReactNode;
};

export default function PrivateRoute({ children }: Props) {
  const user = useAuthStore((state) => state.user);
  const organizationDetails = useAuthStore(
    (state) => state.organizationDetails
  );

  // if neither a user nor organization details exist, redirect to login
  if (!user && !organizationDetails) {
    return <Navigate to="/login" replace />;
  }

  // otherwise show wrapped component
  return <>{children}</>;
}
