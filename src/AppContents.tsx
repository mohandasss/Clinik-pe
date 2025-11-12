import { Routes, Route } from "react-router-dom";
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
import AddCenter from "./Pages/Clinic/AddCenter";
import PublicRoute from "./Layouts/PublicRoute";
import DoctorLoginPage from "./Pages/Doctor/DoctorLogin/DoctorLoginPage";
import DoctorDashboardPage from "./Pages/Doctor/DoctorDashboard/DoctorDashboard";
import AppointmentsPage from "./Pages/Doctor/Appointments/AppointmentsPage";
import AddProvider from "./Pages/Provider/AddProvider";
import ProviderAvailability from "./Pages/Availability/ProviderAvailability";
import AddProviderAvailability from "./Pages/Availability/AddProviderAvailability";
import EprescriptionPage from "./Pages/Doctor/Eprescription/EprescriptionPage";
import PaymentSettings from "./Pages/PaymentSettings/PaymentSettings";
import FeeManagement from "./Pages/FeeMangement/FeeManagement";
import GeneralSettings from "./Pages/GeneralSettings/GeneralSettings";

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
        <Route
          path="/availability/:providerUid"
          element={<ProviderAvailability />}
        />
        <Route
          path="/availability/add/:providerUid"
          element={<AddProviderAvailability />}
        />

        <Route path="/organization" element={<OrganizationList />} />
        <Route path="/organization/add" element={<AddOrganization />} />
        <Route path="/centers" element={<ClinicList />} />
        <Route path="/general-settings" element={<GeneralSettings />} />
        <Route path="/centers/add" element={<AddCenter />} />
        <Route path="/providers" element={<ProviderList />} />
        <Route path="/payments" element={<PaymentSettings />} />
        <Route path="/doctor-dashboard" element={<DoctorDashboardPage />} />
        <Route path="/doctor-appointments" element={<AppointmentsPage />} />
        <Route path="/fee-management" element={<FeeManagement />} />
        <Route path="/e-prescription" element={<EprescriptionPage />} />

        <Route path="/providers/add" element={<AddProvider />} />
      </Route>

      <Route path="/doctor-login" element={<DoctorLoginPage />} />
    </Routes>
  );
}

export default AppContents;
