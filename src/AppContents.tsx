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

function AppContents() {
  return (
    <Routes>
      <Route path="/" element={<OnboardingPage />}>
        <Route index element={<OnboardingForm />} />
        <Route path="otp" element={<OnboardingOtpForm />} />
        <Route path="organization" element={<OrganizationForm />} />
        <Route path="success" element={<SuccessMessage />} />
        <Route path="login" element={<LoginForm />} />
        <Route path="login-otp" element={<LoginOtpForm />} />
      </Route>

      <Route
        path="/"
        element={
          <PrivateRoute>
            <AppLayout />
          </PrivateRoute>
        }
      >
        <Route path="/organization-list" element={<OrganizationList />} />
      </Route>

      <Route path="/home" element={<Home />} />
    </Routes>
  );
}

export default AppContents;
