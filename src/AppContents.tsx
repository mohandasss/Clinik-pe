import { Routes, Route } from "react-router-dom";

// ===================== 🟩 Public Pages =====================
import OnboardingPage from "./Pages/Onboarding/OnboardingPage";
import OnboardingForm from "./components/RegisterForm/OnboardingForm";
import OnboardingOtpForm from "./components/OtpForm/OnboardingOtpForm";
import OrganizationForm from "./components/OrganizationForm/OrganizationForm";
import SuccessMessage from "./components/SuccessFullMessage/SuccessMessage";
import LoginForm from "./components/LoginForm/LoginForm";
import LoginOtpForm from "./components/LoginOtp/LoginOtpForm";

// ===================== 🟦 Layouts & Route Guards =====================
import PrivateRoute from "./Layouts/PrivateRoute";
import PublicRoute from "./Layouts/PublicRoute";
import DoctorPrivateRoute from "./Layouts/DoctorPrivateRoute";
import AppLayout from "./Layouts/AppLayout";
import DoctorAppLayout from "./Layouts/DoctorAppLayout";

// ===================== 🟧 Organization & Center Pages =====================
import OrganizationList from "./Pages/Organization/OrganizationList";
import AddOrganization from "./Pages/Organization/AddOrganization";
import ClinicList from "./Pages/Clinic/ClinicList";
import AddCenter from "./Pages/Clinic/AddCenter";

// ===================== 🟨 Provider Pages =====================
import ProviderList from "./Pages/Provider/ProviderList";
import AddProvider from "./Pages/Provider/AddProvider";

// ===================== 🟪 Availability Pages =====================
import ProviderAvailability from "./Pages/Availability/ProviderAvailability";
// import AddProviderAvailability from "./Pages/Availability/AddProviderAvailability";

// ===================== 🟥 Doctor Pages =====================
import DoctorLoginPage from "./Pages/Doctor/DoctorLogin/DoctorLoginPage";
import DoctorDashboardPage from "./Pages/Doctor/DoctorDashboard/DoctorDashboard";
import AppointmentsPage from "./Pages/Doctor/Appointments/AppointmentsPage";
import EprescriptionPage from "./Pages/Doctor/Eprescription/EprescriptionPageRefactored";

// ===================== ⚪ Settings, Billing & Others =====================
import PaymentSettings from "./Pages/PaymentSettings/PaymentSettings";
import FeeManagement from "./Pages/FeeMangement/FeeManagement";
import GeneralSettings from "./Pages/GeneralSettings/GeneralSettings";
import BookingPage from "./Pages/PatientShedule/BookingPage";

import TestPackage from "./Pages/TestPackages/TestPackage";
import TestPanels from "./Pages/TestPanels/TestPanels";
import EditPanelPage from "./Pages/TestPanels/EditPanelPage";
import TestPanelsDetails from "./Pages/TestPanels/TestPanelsDetails";

import TestCategories from "./Pages/TestCategories/TestCategories";
import TestDatabase from "./Pages/TestDatabase/TestDatabase";
import AddTestPage from "./Pages/TestDatabase/AddTestPage";
import AddMultipleTestPage from "./Pages/TestDatabase/AddMultipleTestPage";
import AddMultipleNestedTestPage from "./Pages/TestDatabase/AddMultipleNestedTestPage";
import AddDocumentTestPage from "./Pages/TestDatabase/AddDocumentTestPage";

import Units from "./Pages/Units/Units";

import DiagnosticBillsPage from "./Pages/DiagnosticBills/DiagnosticBillsPage";
import AddDiagnosticBillsPage from "./Pages/DiagnosticBills/AddDiagnosticBillsPage";

import InterpretationPage from "./Pages/interpretation/InterpretationPage";
import QrCodePage from "./Pages/QrCode/QrCodePage";

import AccessManagement from "./Pages/AccessManagement/AccessManagement";
import Roles from "./Pages/Roles/Roles";

// ===================== 🟫 Radiology Pages =====================
import TestDatabaseOther from "./Pages/Radiology/OtherTest/TestDatabaseOther";
import AddRadiologyTestPage from "./Pages/Radiology/OtherTest/AddTestPage";
import OtherTestPanelList from "./Pages/Radiology/OtherTestPanel/OtherTestPanelList";
import EditOtherTestPanel from "./Pages/Radiology/OtherTestPanel/EditOtherTestPanel";
import OtherTestCategory from "./Pages/Radiology/OtherTestCategory/OtherTestCategory";
import TestDepartment from "./Pages/Radiology/TestDepartment/TestDepartment";
import OtherTestDatabaseDetails from "./Pages/Radiology/OtherTest/OtherTestDatabaseDetails";
import OtherTestPanelDetails from "./Pages/Radiology/OtherTestPanel/OtherTestPanelDetails";
import Dashboard from "./Pages/Dashboard/Dashboard";
import OtherTestPackage from "./Pages/Radiology/OtherTestPackage";
import OtherTestPackageDetailPage from "./Pages/Radiology/OtherTestPackage/OtherTestPackageDetailPage";

function AppContents() {
  const CLinic = "clinic";
  const diagnostic = "diagnostic";

  return (
    <Routes>
      {/* =========================================================
                       🟩 PUBLIC ROUTES
      ========================================================== */}
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

      {/* =========================================================
                       🟦 PRIVATE ROUTES (App Layout)
      ========================================================== */}
      <Route
        element={
          <PrivateRoute>
            <AppLayout />
          </PrivateRoute>
        }
      >
        {/* ---------------- 🟧 Organization & Centers ---------------- */}
        <Route path="/organizations" element={<OrganizationList />} />
        <Route path="/organization/add" element={<AddOrganization />} />
        <Route path="/centers" element={<ClinicList />} />
        <Route path="/centers/add" element={<AddCenter />} />

        {/* ---------------- 🟨 Providers ---------------- */}
        <Route path={`${CLinic}/providers`} element={<ProviderList />} />
        <Route path="/providers/add" element={<AddProvider />} />

        {/* ---------------- 🟪 Availability ---------------- */}
        <Route
          path={`${CLinic}/availabilities`}
          element={<ProviderAvailability />}
        />
        {/* <Route path="/availability/add/:providerUid" element={<AddProviderAvailability />} /> */}

        {/* ---------------- 🟥 Doctor (Inside Admin Layout) ---------------- */}

        {/* ---------------- ⚪ Settings, Billing, Tests ---------------- */}
        <Route
          path={`${CLinic}/settings/payment`}
          element={<PaymentSettings />}
        />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path={`${CLinic}/fee-management`} element={<FeeManagement />} />
        <Route
          path={`${CLinic}/general-settings`}
          element={<GeneralSettings />}
        />

        <Route path="/appointments" element={<BookingPage />} />

        {/* Test Panels */}
        <Route path="/test-packages" element={<TestPackage />} />
        <Route path="/test-panels" element={<TestPanels />} />
        <Route path="/test-panels/:id" element={<TestPanelsDetails />} />
        <Route path="/test-panels/edit" element={<EditPanelPage />} />

        {/* Test Categories & Database */}
        <Route path="/test-categories" element={<TestCategories />} />
        <Route path="/test-database" element={<TestDatabase />} />
        <Route path="/test-database/add" element={<AddTestPage />} />
        <Route
          path="/test-database/add-multiple"
          element={<AddMultipleTestPage />}
        />
        <Route
          path="/test-database/add-nested"
          element={<AddMultipleNestedTestPage />}
        />
        <Route
          path="/test-database/add-document"
          element={<AddDocumentTestPage />}
        />

        <Route path="/units" element={<Units />} />

        {/* Billing */}
        <Route path="/bookings" element={<DiagnosticBillsPage />} />
        <Route path="/bills/add" element={<AddDiagnosticBillsPage />} />

        <Route path="/interpretation" element={<InterpretationPage />} />
        <Route path="/qr-code" element={<QrCodePage />} />

        {/* Roles & Access */}
        <Route path="/access-management" element={<AccessManagement />} />
        <Route path="/roles" element={<Roles />} />

        {/* ---------------- 🟫 Radiology ---------------- */}
        <Route path="/test-department" element={<TestDepartment />} />
        <Route
          path="/:department/test-database"
          element={<TestDatabaseOther />}
        />
        <Route
          path="/radiology/test-database/details/:id"
          element={<OtherTestDatabaseDetails />}
        />
        <Route
          path="/radiology/test-database/add"
          element={<AddRadiologyTestPage />}
        />
        <Route
          path="/:department/test-panels"
          element={<OtherTestPanelList />}
        />
        <Route
          path="/radiology/test-panels/edit"
          element={<EditOtherTestPanel />}
        />
        <Route
          path="/:department/test-packages"
          element={<OtherTestPackage />}
        />
        <Route
          path="/radiology/test-packages/:id"
          element={<OtherTestPackageDetailPage />}
        />
        <Route
          path="/radiology/test-panels/:id"
          element={<OtherTestPanelDetails />}
        />
        <Route
          path="/:department/test-categories"
          element={<OtherTestCategory />}
        />
      </Route>

      {/* =========================================================
                       🔵 DOCTOR ROUTES (Protected)
      ========================================================== */}
      <Route element={<DoctorAppLayout />}>
        <Route path="/doctor-dashboard" element={<DoctorDashboardPage />} />
        <Route path="/doctor-appointments" element={<AppointmentsPage />} />
        <Route path="/e-prescription" element={<EprescriptionPage />} />
      </Route>

      {/* Doctor Login - Public */}
      <Route path="/doctor-login" element={<DoctorLoginPage />} />
    </Routes>
  );
}

export default AppContents;
