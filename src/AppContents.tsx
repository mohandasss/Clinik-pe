import { Routes, Route } from "react-router-dom";
import Home from "./Pages/Home";
import OnboardingPage from "./Pages/Onboarding/OnboardingPage";
import OnboardingForm from "./components/RegisterForm/OnboardingForm";
import OnboardingOtpForm from "./components/OtpForm/OnboardingOtpForm";
import OrganizationForm from "./components/OrganizationForm/OrganizationForm";
import SuccessMessage from "./components/SuccessFullMessage/SuccessMessage";
import LoginForm from "./components/LoginForm/LoginForm";
import LoginOtpForm from "./components/LoginOtp/LoginOtpForm";
import PrivateRoute from "./Layouts/PrivateRoute";
import AppLayout from "./Layouts/AppLayout";
import OrganizationList from "./Pages/Organization/OrganizationList";
import ClinicList from "./Pages/Clinic/ClinicList";
import ProviderList from "./Pages/Provider/ProviderList";
import AddOrganization from "./Pages/Organization/AddOrganization";
import PublicRoute from "./Layouts/PublicRoute";

function AppContents() {
  return (
    <Routes>
      {/* Public routes */}
      <Route
        path="/"
        element={
          <PublicRoute>
            <OnboardingPage />
          </PublicRoute>
        }
      >
        <Route index element={<OnboardingForm />} />
        <Route path="otp" element={<OnboardingOtpForm />} />
        <Route path="organization-onboard" element={<OrganizationForm />} />
        <Route path="success" element={<SuccessMessage />} />
        <Route path="login" element={<LoginForm />} />
        <Route path="login-otp" element={<LoginOtpForm />} />
      </Route>

      {/* Private routes */}
      <Route
        element={
          <PrivateRoute>
            <AppLayout />
          </PrivateRoute>
        }
      >
        <Route path="/organization" element={<OrganizationList />} />
        <Route path="/organization/add" element={<AddOrganization />} />
        <Route path="/clinic" element={<ClinicList />} />
        <Route path="/providers" element={<ProviderList />} />
      </Route>

     
    </Routes>
  );
}

export default AppContents;
