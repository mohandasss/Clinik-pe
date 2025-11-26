import React, { useState } from "react";
import { Button, Anchor, Text, Paper, Drawer } from "@mantine/core";
import { IconArrowLeft } from "@tabler/icons-react";
import { useNavigate } from "react-router-dom";
import { notifications } from "@mantine/notifications";
import AppointmentDetailsSection from "./Components/AppointmentDetailsSection";
import CaseDetailsSection from "./Components/CaseDetailsSection";
import SettingsModal from "./Components/SettingsModal";
import AddPatientScheduling from "../PatientShedule/Components/AddPatientScheduling";
import type { PaymentDetails as PaymentDetailsType } from "./Components/PaymentDetailsSection";
import type { LabInvestigationItem, InvoicePayload } from "../../APis/Types";
import apis from "../../APis/Api";
import useAuthStore from "../../GlobalStore/store";
import useDropdownStore from "../../GlobalStore/useDropdownStore";

interface AppointmentDetails {
  selectedPatientId: string;
  provider: string;
  clinicName: string;
  appointmentType: string;
  selectedSymptomIds: string[];
  others: string;
  selectedDate: string;
}

interface PerInvestigationData {
  selectedItems: LabInvestigationItem[];
  amount: string;
  sampleCollectedAt: string;
}

type PaymentDetails = PaymentDetailsType;

interface CaseDetails {
  referredBy: string;
  collectionCentre: string;
  sampleCollectionAgent: string;
  selectedInvestigations: string[];
  perInvestigationData: Record<string, PerInvestigationData>;
  payment: PaymentDetails;
}

const AddDiagnosticBillsPage: React.FC = () => {
  const navigate = useNavigate();
  const { organizationDetails } = useAuthStore();
  const selectedCenter = useDropdownStore((s) => s.selectedCenter);
  const orgId = organizationDetails?.organization_id;
  const centerId = selectedCenter?.center_id || organizationDetails?.center_id;

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [showAddPatientDrawer, setShowAddPatientDrawer] = useState(false);
  const [patientRefreshTrigger, setPatientRefreshTrigger] = useState(0);

  const [appointmentDetails, setAppointmentDetails] =
    useState<AppointmentDetails>({
      selectedPatientId: "",
      provider: "",
      clinicName: "",
      appointmentType: "medical",
      selectedSymptomIds: [],
      others: "",
      selectedDate: "",
    });

  const [caseDetails, setCaseDetails] = useState<CaseDetails>({
    referredBy: "",
    collectionCentre: "",
    sampleCollectionAgent: "",
    selectedInvestigations: [],
    perInvestigationData: {},
    payment: {
      total: 0,
      discount_unit: "flat",
      discount_value: 0,
      payable_amount: 0,
      amount_received: 0,
      mode: "cash",
      remarks: "",
    },
  });

  const handleAppointmentDetailsChange = (
    data: Partial<AppointmentDetails>
  ) => {
    setAppointmentDetails((prev) => ({ ...prev, ...data }));
  };

  const handleCaseDetailsChange = (data: Partial<CaseDetails>) => {
    setCaseDetails((prev) => {
      const merged = { ...prev, ...data } as CaseDetails;
      const per = merged.perInvestigationData || {};

      // Calculate total from all investigation amounts
      const total = Object.values(per).reduce((sum, item) => {
        return sum + Number(item.amount ?? 0);
      }, 0);

      // Calculate payable amount based on discount
      let payableAmount = total;
      if (merged.payment?.discount_unit === "percent") {
        payableAmount =
          total - (total * (merged.payment.discount_value ?? 0)) / 100;
      } else {
        payableAmount = total - (merged.payment.discount_value ?? 0);
      }

      // Update payment details
      merged.payment = {
        ...merged.payment,
        total: Number(total.toFixed(2)),
        payable_amount: Number(payableAmount.toFixed(2)),
      };

      return merged;
    });
  };

  const handleShowAddPatient = () => {
    setShowAddPatientDrawer(true);
  };

  const handlePatientAdded = () => {
    // Trigger refetch in AppointmentDetailsSection
    setPatientRefreshTrigger((prev) => prev + 1);
    setShowAddPatientDrawer(false);
  };

  const handleSubmit = async () => {
    // Validate form
    if (!appointmentDetails.selectedPatientId) {
      notifications.show({
        title: "Validation Error",
        message: "Please select a patient",
        color: "red",
      });
      return;
    }

    if (!caseDetails.referredBy) {
      notifications.show({
        title: "Validation Error",
        message: "Please select a provider",
        color: "red",
      });
      return;
    }

    // Build items array from perInvestigationData
    const items: InvoicePayload["items"] = [];
    Object.values(caseDetails.perInvestigationData).forEach((invData) => {
      invData.selectedItems?.forEach((item) => {
        items.push({
          type: item.investigation as "panel" | "test",
          sub_type: item.type,
          item_id: item.uid,
          amount: item.amount,
        });
      });
    });

    if (items.length === 0) {
      notifications.show({
        title: "Validation Error",
        message: "Please select at least one investigation",
        color: "red",
      });
      return;
    }

    // Determine payment "as" field: if amount_received equals payable_amount, send "full", else "advance"
    const paymentAs =
      caseDetails.payment.amount_received >= caseDetails.payment.payable_amount
        ? "full"
        : "advance";

    // Build payload matching the required API structure
    const payload: InvoicePayload = {
      patient_id: appointmentDetails.selectedPatientId,
      total_amount: caseDetails.payment.total,
      discount_unit: caseDetails.payment.discount_unit,
      discount_value: caseDetails.payment.discount_value,
      referred_by_doctor_id: caseDetails.referredBy || null,
      referrer_details: "",
      payable_amount: caseDetails.payment.payable_amount,
      items,
      payment: {
        amount: caseDetails.payment.amount_received,
        as: paymentAs,
        purpose: "test",
        source: "manual",
        mode: caseDetails.payment.mode,
        note: caseDetails.payment.remarks || "",
      },
    };

    try {
      if (!orgId || !centerId) {
        notifications.show({
          title: "Error",
          message: "Organization or center not found",
          color: "red",
        });
        return;
      }

      const response = await apis.Addbilling(orgId, centerId, payload);

      if (response.success) {
        notifications.show({
          title: "Success",
          message: response.message,
          color: "green",
        });
        // Navigate back to bills list
        navigate("/bookings");
      } else {
        notifications.show({
          title: "Error",
          message: response.message,
          color: "red",
        });
      }
    } catch (error) {
      console.error("Error creating bill:", error);
      notifications.show({
        title: "Error",
        message: "Failed to create bill. Please try again.",
        color: "red",
      });
    }
  };

  const handleSaveSettings = (data: Partial<PaymentDetails>) => {
    handleCaseDetailsChange({ payment: { ...caseDetails.payment, ...data } });
  };

  return (
    <div className="p-0">
      {/* Header with Back Button */}
      <div className="mb-4">
        <Anchor
          component="button"
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 px-3 py-1 hover:no-underline rounded-md text-blue-600 text-sm transition-colors duration-150 hover:bg-blue-50 no-underline"
        >
          <IconArrowLeft size={16} />
          <Text size="sm" fw={600} className="font-medium">
            Back to Bills
          </Text>
        </Anchor>
      </div>

      {/* Page Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-800">New bill</h2>
            <p className="text-sm text-gray-600">
              Create a new diagnostic bill by entering patient and case details.
            </p>
          </div>
        </div>
      </div>

      {/* Form Sections */}
      <div className="space-y-6">
        {/* Appointment Details Section */}
        <AppointmentDetailsSection
          data={appointmentDetails}
          onChange={handleAppointmentDetailsChange}
          onShowAddPatient={handleShowAddPatient}
          refreshTrigger={patientRefreshTrigger}
        />

        {/* Case Details Section */}
        <CaseDetailsSection
          data={caseDetails}
          onChange={handleCaseDetailsChange}
        />

        {/* Action Buttons */}
        <Paper withBorder radius="md" className="p-6">
          <div className="flex justify-between gap-3">
            <div className="flex gap-4">
              <Button
                onClick={handleSubmit}
                variant="filled"
                color="blue"
                size="md"
              >
                Save Bill
              </Button>
              <Button onClick={() => navigate(-1)} variant="default" size="md">
                Cancel
              </Button>
            </div>
            <div>
              <Button onClick={() => setIsSettingsOpen(true)}>Settings</Button>
            </div>
          </div>
        </Paper>

        {/* Settings Modal */}
        <SettingsModal
          opened={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
          payment={caseDetails.payment}
          onSave={handleSaveSettings}
        />
      </div>

      {/* Add Patient Drawer */}
      <Drawer
        opened={showAddPatientDrawer}
        onClose={() => setShowAddPatientDrawer(false)}
        position="right"
        size="xl"
        title={<span className="text-xl font-semibold">Add Patient</span>}
      >
        <AddPatientScheduling
          onClose={() => setShowAddPatientDrawer(false)}
          onPatientAdded={handlePatientAdded}
        />
      </Drawer>
    </div>
  );
};

export default AddDiagnosticBillsPage;
