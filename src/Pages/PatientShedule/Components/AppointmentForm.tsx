import React, { useState, useEffect } from "react";
import { Select, TextInput, Button, MultiSelect } from "@mantine/core";
import { DateInput } from "@mantine/dates";
import { IconPlus } from "@tabler/icons-react";
import type { Provider, Patient, Slot } from "../../../APis/Types";
import { TimeSlotSelector } from "./TimeSlotSelector";
import { PaymentSection } from "./PaymentSection";

interface SymptomOption {
  value: string;
  label: string;
}

interface AppointmentFormProps {
  selectedPatientId: string;
  onPatientChange: (id: string | null) => void;
  patientOptions: { value: string; label: string }[];
  loadingPatients: boolean;
  provider: string;
  onProviderChange: (provider: string) => void;
  providerOptions: { value: string; label: string }[];
  loadingProviders: boolean;
  clinicName: string;
  appointmentType: string;
  onAppointmentTypeChange: (type: string) => void;
  appointmentTypes: readonly { value: string; label: string }[];
  selectedSymptomIds: string[];
  onSymptomsChange: (ids: string[]) => void;
  symptomOptions: SymptomOption[];
  loadingSymptoms: boolean;
  others: string;
  onOthersChange: (value: string) => void;
  selectedDate: Date | null;
  onDateChange: (date: Date | null) => void;
  availableSlots: Slot[];
  loadingSlots: boolean;
  selectedTime: string | null;
  onTimeChange: (time: string) => void;
  onAddAppointment: () => void;
  patientName: string;
  onShowAddPatient: () => void;
  actualFee: number;
  discountType: "percentage" | "flat" | "";
  onDiscountTypeChange: (type: "percentage" | "flat" | "") => void;
  discountValue: string;
  onDiscountValueChange: (value: string) => void;
  payableAmount: number;
  amountPaid: string;
  onAmountPaidChange: (value: string) => void;
  isPaymentReceived: boolean;
  onPaymentReceivedChange: (value: boolean) => void;
  paymentMode: "cash" | "online" | "card" | "";
  onPaymentModeChange: (mode: "cash" | "online" | "card" | "") => void;
  paymentNote: string;
  onPaymentNoteChange: (note: string) => void;
  loadingFee: boolean;
  providers: Provider[];
  selectedSpeciality: string;
  onSpecialityChange: (speciality: string) => void;
}

export const AppointmentForm: React.FC<AppointmentFormProps> = ({
  selectedPatientId,
  onPatientChange,
  patientOptions,
  loadingPatients,
  provider,
  onProviderChange,
  providerOptions,
  loadingProviders,
  clinicName,
  appointmentType,
  onAppointmentTypeChange,
  appointmentTypes,
  selectedSymptomIds,
  onSymptomsChange,
  symptomOptions,
  loadingSymptoms,
  others,
  onOthersChange,
  selectedDate,
  onDateChange,
  availableSlots,
  loadingSlots,
  selectedTime,
  onTimeChange,
  onAddAppointment,
  patientName,
  onShowAddPatient,
  actualFee,
  discountType,
  onDiscountTypeChange,
  discountValue,
  onDiscountValueChange,
  payableAmount,
  amountPaid,
  onAmountPaidChange,
  isPaymentReceived,
  onPaymentReceivedChange,
  paymentMode,
  onPaymentModeChange,
  paymentNote,
  onPaymentNoteChange,
  loadingFee,
  providers,
  selectedSpeciality,
  onSpecialityChange,
}) => {
  const [specialityOptions, setSpecialityOptions] = useState<
    { value: string; label: string }[]
  >([]);

  useEffect(() => {
    const selectedProvider = providers.find((p) => p.uid === provider);
    if (selectedProvider?.specialities) {
      const options = selectedProvider.specialities.map((s) => ({
        value: s.uid,
        label: s.name,
      }));
      setSpecialityOptions(options);
    }
  }, [provider, providers, selectedSpeciality, onSpecialityChange]);

  return (
    <div className="md:w-3/7 w-full p-4 bg-white overflow-auto h-full border-l border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Add New Appointments</h2>
        <Button
          variant="outline"
          size="sm"
          leftSection={<IconPlus size={16} />}
          onClick={onShowAddPatient}
        >
          New Patient
        </Button>
      </div>

      <div className="flex flex-col gap-4">
        <div className="grid md:grid-cols-2 grid-cols-1 gap-4">
          <Select
            clearable
            searchable
            label="Patient"
            placeholder="Select Patient"
            value={selectedPatientId || null}
            data={patientOptions}
            onChange={onPatientChange}
            disabled={loadingPatients}
          />
          <Select
            clearable
            searchable
            label="Provider"
            placeholder="Select Provider"
            value={provider || null}
            data={providerOptions}
            onChange={(val) => onProviderChange(val || "")}
            disabled={loadingProviders}
          />
        </div>

        <div className="grid md:grid-cols-2 grid-cols-1 gap-4">
          <TextInput
            label="Clinic Name"
            placeholder="Clinic Name"
            value={clinicName}
            disabled
            readOnly
          />
          <Select
            clearable
            label="Appointment Type"
            value={appointmentType || null}
            data={[...appointmentTypes]}
            placeholder="Select Appointment Type"
            onChange={(val) => onAppointmentTypeChange(val || "")}
          />
        </div>

        <div className="grid md:grid-cols-2 grid-cols-1 gap-4">
          <Select
            clearable
            searchable
            label="Speciality"
            placeholder="Select Speciality"
            value={selectedSpeciality || null}
            data={specialityOptions}
            onChange={(val) => onSpecialityChange(val || "")}
            disabled={!provider || specialityOptions.length === 0}
          />
          <TextInput
            label="Others"
            placeholder="Enter others...."
            value={others}
            onChange={(e) => onOthersChange(e.target.value)}
          />
        </div>

        <div className="grid md:grid-cols-1 grid-cols-1 gap-4">
          <MultiSelect
            data={symptomOptions}
            searchable
            label="Symptoms"
            placeholder="Select symptoms"
            value={selectedSymptomIds}
            onChange={onSymptomsChange}
            clearable
            disabled={loadingSymptoms}
          />
        </div>

        <div className="grid grid-cols-1 gap-4">
          <DateInput
            placeholder="Select date"
            value={
              selectedDate ? selectedDate.toISOString().split("T")[0] : null
            }
            onChange={(value) => onDateChange(value ? new Date(value) : null)}
            label="Date"
            minDate={new Date()}
          />

          <TimeSlotSelector
            availableSlots={availableSlots}
            loadingSlots={loadingSlots}
            selectedTime={selectedTime}
            onTimeChange={onTimeChange}
          />
        </div>

        {/* Payment Section */}
        <PaymentSection
          actualFee={actualFee}
          discountType={discountType}
          onDiscountTypeChange={onDiscountTypeChange}
          discountValue={discountValue}
          onDiscountValueChange={onDiscountValueChange}
          payableAmount={payableAmount}
          amountPaid={amountPaid}
          onAmountPaidChange={onAmountPaidChange}
          isPaymentReceived={isPaymentReceived}
          onPaymentReceivedChange={onPaymentReceivedChange}
          paymentMode={paymentMode}
          onPaymentModeChange={onPaymentModeChange}
          paymentNote={paymentNote}
          onPaymentNoteChange={onPaymentNoteChange}
          loadingFee={loadingFee}
        />

        <div className="flex justify-end mt-4">
          <Button
            onClick={onAddAppointment}
            disabled={!patientName || !selectedTime}
          >
            Add Appointment
          </Button>
        </div>
      </div>
    </div>
  );
};
