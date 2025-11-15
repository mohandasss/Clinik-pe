import { Routes, Route } from "react-router-dom";

// 🟩 Public Pages
import OnboardingPage from "./Pages/Onboarding/OnboardingPage";
import OnboardingForm from "./components/RegisterForm/OnboardingForm";
import OnboardingOtpForm from "./components/OtpForm/OnboardingOtpForm";
import OrganizationForm from "./components/OrganizationForm/OrganizationForm";
import SuccessMessage from "./components/SuccessFullMessage/SuccessMessage";
import LoginForm from "./components/LoginForm/LoginForm";
import LoginOtpForm from "./components/LoginOtp/LoginOtpForm";

// 🟦 Layouts & Route Guards
import PrivateRoute from "./Layouts/PrivateRoute";
import PublicRoute from "./Layouts/PublicRoute";
import AppLayout from "./Layouts/AppLayout";

// 🟧 Organization & Center Pages
import OrganizationList from "./Pages/Organization/OrganizationList";
import AddOrganization from "./Pages/Organization/AddOrganization";
import ClinicList from "./Pages/Clinic/ClinicList";
import AddCenter from "./Pages/Clinic/AddCenter";

// 🟨 Provider Pages
import ProviderList from "./Pages/Provider/ProviderList";
import AddProvider from "./Pages/Provider/AddProvider";

// 🟪 Availability Pages
import ProviderAvailability from "./Pages/Availability/ProviderAvailability";
// import AddProviderAvailability from "./Pages/Availability/AddProviderAvailability";

// 🟥 Doctor Pages
import DoctorLoginPage from "./Pages/Doctor/DoctorLogin/DoctorLoginPage";
import DoctorDashboardPage from "./Pages/Doctor/DoctorDashboard/DoctorDashboard";
import AppointmentsPage from "./Pages/Doctor/Appointments/AppointmentsPage";
import EprescriptionPage from "./Pages/Doctor/Eprescription/EprescriptionPage";

// ⚪ Settings & Payment Pages
import PaymentSettings from "./Pages/PaymentSettings/PaymentSettings";
import FeeManagement from "./Pages/FeeMangement/FeeManagement";
import GeneralSettings from "./Pages/GeneralSettings/GeneralSettings";
// import PatientSchedule from "./Pages/PatientShedule/BookingPage";
import BookingPage from "./Pages/PatientShedule/BookingPage";

function AppContents() {
  return (
    <Routes>
      {/* ===================== 🟩 PUBLIC ROUTES ===================== */}
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

      {/* ===================== 🟦 PRIVATE ROUTES ===================== */}
      <Route
        element={
          <PrivateRoute>
            <AppLayout />
          </PrivateRoute>
        }
      >
        {/* 🟧 Organization & Centers */}
        <Route path="/organization" element={<OrganizationList />} />
        <Route path="/organization/add" element={<AddOrganization />} />
        <Route path="/centers" element={<ClinicList />} />
        <Route path="/centers/add" element={<AddCenter />} />

        {/* 🟨 Providers */}
        <Route path="/providers" element={<ProviderList />} />
        <Route path="/providers/add" element={<AddProvider />} />

        {/* 🟪 Availability */}
        <Route path="/availability" element={<ProviderAvailability />} />
        {/* <Route
          path="/availability/add/:providerUid"
          element={<AddProviderAvailability />}
        /> */}

        {/* 🟥 Doctor */}
        <Route path="/doctor-dashboard" element={<DoctorDashboardPage />} />
        <Route path="/doctor-appointments" element={<AppointmentsPage />} />
        <Route path="/e-prescription" element={<EprescriptionPage />} />

        {/* ⚪ Settings & Payments */}
        <Route path="/payments" element={<PaymentSettings />} />
        <Route path="/fee-management" element={<FeeManagement />} />
        <Route path="/general-settings" element={<GeneralSettings />} />
        <Route path="/booking" element={<BookingPage />} />
      </Route>

      

      {/* ===================== 🔵 DOCTOR PUBLIC LOGIN ===================== */}
      <Route path="/doctor-login" element={<DoctorLoginPage />} />
    </Routes>
  );
}

export default AppContents;
