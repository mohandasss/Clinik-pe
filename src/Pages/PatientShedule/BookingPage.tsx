import React, { useState, useEffect } from "react";
import { Drawer } from "@mantine/core";
import AddPatientScheduling from "./Components/AddPatientScheduling";
import { ScheduleView } from "./Components/ScheduleView";
import { AppointmentForm } from "./Components/AppointmentForm";
import useAuthStore from "../../GlobalStore/store";
import useDropdownStore from "../../GlobalStore/useDropdownStore";
import { notifications } from "@mantine/notifications";
import type {
  Provider,
  Patient,
  Slot,
  FeeManagementData,
  ProviderFee,
  CreateAppointmentRequest,
} from "../../APis/Types";
import apis from "../../APis/Api";

// ============================================================================
// TYPES
// ============================================================================

interface Appointment {
  appointment_uid?: string;
  name?: string;
  type?: string;
  time: string;
  date?: string;
  provider?: string;
  doctor_name?: string;
  clinic?: string;
  patient_name?: string;
  symptoms?: string;
}

interface SymptomOption {
  value: string;
  label: string;
}

interface AppointmentSymptom {
  symptom_id?: string;
  symptom_name: string;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const APPOINTMENT_TYPES = [
  { value: "video-call", label: "Video call" },
  { value: "chat", label: "Chat" },
  { value: "inclinic", label: "Inclinic" },
] as const;

const DEFAULT_DURATION = "30";

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

const formatDate = (date: Date | null): string => {
  return date ? date.toISOString().split("T")[0] : "";
};

const formatTime = (time: string): string => {
  return `${time}:00`;
};

const extractTime = (datetime?: string): string => {
  return datetime?.split(" ")[1] || "";
};

const calculateDuration = (start?: string, end?: string): string => {
  if (!start || !end) return DEFAULT_DURATION;

  try {
    const startTime = extractTime(start);
    const endTime = extractTime(end);
    const [sh, sm] = startTime.split(":").map(Number);
    const [eh, em] = endTime.split(":").map(Number);
    const diffMinutes = eh * 60 + em - (sh * 60 + sm);
    return diffMinutes > 0 ? String(diffMinutes) : DEFAULT_DURATION;
  } catch {
    return DEFAULT_DURATION;
  }
};

// Generate default slots for a date if API returns none (20-minute increments)
const generateDefaultSlots = (
  date: Date | null,
  startHour = 6,
  endHour = 24,
  intervalMinutes = 20
): Slot[] => {
  const d = date ? new Date(date) : new Date();
  const dateStr = formatDate(d);
  const slots: Slot[] = [];
  for (let h = startHour; h < endHour; h++) {
    for (let m = 0; m < 60; m += intervalMinutes) {
      const hh = String(h).padStart(2, "0");
      const mm = String(m).padStart(2, "0");
      const start = `${dateStr} ${hh}:${mm}`;
      const endDate = new Date(
        d.getFullYear(),
        d.getMonth(),
        d.getDate(),
        h,
        m,
        0,
        0
      );
      endDate.setMinutes(endDate.getMinutes() + intervalMinutes);
      const eh = String(endDate.getHours()).padStart(2, "0");
      const em = String(endDate.getMinutes()).padStart(2, "0");
      const end = `${dateStr} ${eh}:${em}`;
      slots.push({ start, end } as Slot);
    }
  }
  return slots;
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const BookingPage: React.FC = () => {
  const { organizationDetails } = useAuthStore();
  const { selectedCenter } = useDropdownStore();

  // ============================================================================
  // STATE - Form Data
  // ============================================================================
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [scheduleSelectedDate, setScheduleSelectedDate] = useState<Date | null>(
    null
  );
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [patientName, setPatientName] = useState<string>("");
  const [selectedPatientId, setSelectedPatientId] = useState<string>("");
  const [appointmentType, setAppointmentType] = useState<string>("");
  const [provider, setProvider] = useState<string>("");
  const [scheduleProvider, setScheduleProvider] = useState<string>("");
  const [selectedSymptomIds, setSelectedSymptomIds] = useState<string[]>([]);
  const [others, setOthers] = useState<string>("");

  // Payment-related states
  const [actualFee, setActualFee] = useState<number>(0);
  const [discountType, setDiscountType] = useState<"percentage" | "flat" | "">(
    "percentage"
  );
  const [discountValue, setDiscountValue] = useState<string>("");
  const [payableAmount, setPayableAmount] = useState<number>(0);
  const [amountPaid, setAmountPaid] = useState<string>("");
  const [isPaymentReceived, setIsPaymentReceived] = useState<boolean>(false);
  const [paymentMode, setPaymentMode] = useState<
    "cash" | "online" | "card" | ""
  >("");
  const [paymentNote, setPaymentNote] = useState<string>("");
  const [selectedSpeciality, setSelectedSpeciality] = useState<string>("");

  // ============================================================================
  // STATE - Data
  // ============================================================================
  const [patients, setPatients] = useState<Patient[]>([]);
  const [providers, setProviders] = useState<Provider[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [availableSlots, setAvailableSlots] = useState<Slot[]>([]);
  const [scheduleSlots, setScheduleSlots] = useState<Slot[]>([]);
  const [symptomOptions, setSymptomOptions] = useState<SymptomOption[]>([]);

  // ============================================================================
  // STATE - Loading
  // ============================================================================
  const [loadingPatients, setLoadingPatients] = useState(false);
  const [loadingProviders, setLoadingProviders] = useState(false);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [loadingScheduleSlots, setLoadingScheduleSlots] = useState(false);
  const [loadingSymptoms, setLoadingSymptoms] = useState(false);
  const [loadingFee, setLoadingFee] = useState(false);

  // ============================================================================
  // STATE - UI
  // ============================================================================
  const [showSidebar, setShowSidebar] = useState(false);

  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================
  const orgId = organizationDetails?.organization_id;
  const centerId = selectedCenter?.center_id || organizationDetails?.center_id;
  const clinicName = organizationDetails?.center_name || "No Clinic Selected";
  const canFetchData = Boolean(orgId && centerId);

  const providerOptions = providers.map((p) => ({
    value: p.uid,
    label: p.name,
  }));

  const patientOptions = patients
    .filter((p) => p.uid && p.name)
    .map((p) => ({
      value: p.uid as string,
      label: p.name as string,
    }));

  // ============================================================================
  // EFFECTS - Data Fetching
  // ============================================================================

  // Fetch providers
  useEffect(() => {
    const fetchProviders = async () => {
      if (!canFetchData) return;

      setLoadingProviders(true);
      try {
        const response = await apis.GetAllProviders(
          "active",
          orgId!,
          centerId!
        );
        setProviders(response.data.providers);
      } catch (error) {
        console.error("Error fetching providers:", error);
        notifications.show({
          title: "Error",
          message: "Failed to load providers",
          color: "red",
        });
      } finally {
        setLoadingProviders(false);
      }
    };

    fetchProviders();
  }, [orgId, centerId, canFetchData]);

  // Set default providers (only on initial load)
  // const defaultProviderAppliedRef = useRef(false); // removed to avoid auto-select defaults
  // Note: no default provider should be selected on load. Providers list may be populated
  // but users should explicitly choose a provider; do not set defaults automatically.

  // Reset appointment type & speciality when provider changes
  useEffect(() => {
    // Reset the appointment type and speciality when user selects a different provider
    setAppointmentType("");
    setSelectedSpeciality("");
    // Optional: clear selected time and fee so state doesn't become stale
    setSelectedTime(null);
    setActualFee(0);
    setPayableAmount(0);
  }, [provider]);

  // Fetch patients
  useEffect(() => {
    const fetchPatients = async () => {
      if (!canFetchData) return;

      setLoadingPatients(true);
      try {
        const resp = await apis.GetPatients(
          orgId!,
          centerId!,
          undefined,
          1,
          100,
          ["uid", "name"]
        );
        setPatients(resp?.data?.patients ?? []);
      } catch (err) {
        console.error("Failed to fetch patients:", err);
        notifications.show({
          title: "Error",
          message: "Failed to load patients",
          color: "red",
        });
        setPatients([]);
      } finally {
        setLoadingPatients(false);
      }
    };

    fetchPatients();
  }, [orgId, centerId, canFetchData]);

  // Fetch symptoms
  useEffect(() => {
    const fetchSymptoms = async () => {
      if (!canFetchData) return;

      setLoadingSymptoms(true);
      try {
        const resp = await apis.GetSymptomsListNEW(orgId!, centerId!);
        const list = resp?.data ?? [];
        const options = list.map((s) => ({
          value: s.id as string,
          label: s.name as string,
        }));
        setSymptomOptions(options);
      } catch (err) {
        console.error("Failed to fetch symptoms:", err);
        notifications.show({
          title: "Error",
          message: "Failed to load symptoms",
          color: "red",
        });
        setSymptomOptions([]);
      } finally {
        setLoadingSymptoms(false);
      }
    };

    fetchSymptoms();
  }, [orgId, centerId, canFetchData]);

  // Fetch appointments ONLY AFTER slots are loaded
  useEffect(() => {
    const fetchAppointments = async () => {
      // Wait for slots to be loaded first
      if (
        !canFetchData ||
        !scheduleSelectedDate ||
        loadingScheduleSlots ||
        scheduleSlots.length === 0
      ) {
        return;
      }

      try {
        const dateStr = formatDate(scheduleSelectedDate);
        const resp = await apis.GetCenterAppointmentList(
          orgId!,
          centerId!,
          dateStr
        );

        const appointmentList = resp?.data?.appointments ?? [];
        const transformedAppointments: Appointment[] = appointmentList.map(
          (apt) => ({
            appointment_uid: apt.appointment_uid,
            name: apt.patient_name,
            patient_name: apt.patient_name,
            doctor_name: apt.doctor_name,
            type: apt.appointment_type || "medical",
            time: apt.time ? apt.time.substring(0, 5) : "00:00",
            date: apt.date,
            provider: apt.doctor_id,
            clinic: clinicName,
            symptoms: apt.symptoms,
          })
        );

        setAppointments(transformedAppointments);
      } catch (err) {
        console.error("Failed to fetch appointments:", err);
        notifications.show({
          title: "Error",
          message: "Failed to load appointments",
          color: "red",
        });
      }
    };

    fetchAppointments();
  }, [
    orgId,
    centerId,
    canFetchData,
    scheduleSelectedDate,
    clinicName,
    loadingScheduleSlots,
    scheduleSlots,
  ]);

  // Fetch available slots for appointment form
  useEffect(() => {
    const fetchSlots = async () => {
      if (!canFetchData || !provider || !selectedDate) return;

      setLoadingSlots(true);
      try {
        const dateStr = formatDate(selectedDate);
        const resp = await apis.GetSlots(orgId!, centerId!, provider, dateStr);
        setAvailableSlots(resp?.data?.slots ?? []);
      } catch (err) {
        console.error("Failed to fetch slots:", err);
        notifications.show({
          title: "Error",
          message: "Failed to load available slots",
          color: "red",
        });
        setAvailableSlots([]);
      } finally {
        setLoadingSlots(false);
      }
    };

    fetchSlots();
  }, [orgId, centerId, canFetchData, provider, selectedDate]);

  // Fetch schedule slots for left side - Always fetch slots when provider and date are selected
  useEffect(() => {
    const fetchScheduleSlots = async () => {
      if (!canFetchData || !scheduleProvider || !scheduleSelectedDate) {
        // Clear slots if provider or date not selected
        setScheduleSlots([]);
        setAppointments([]); // Also clear appointments when slots are cleared
        return;
      }

      setLoadingScheduleSlots(true);
      try {
        const dateStr = formatDate(scheduleSelectedDate);
        const resp = await apis.GetSlots(
          orgId!,
          centerId!,
          scheduleProvider,
          dateStr
        );

        // If API returns slots, use them; otherwise generate default slots
        const apiSlots = resp?.data?.slots ?? [];
        if (apiSlots.length > 0) {
          setScheduleSlots(apiSlots);
        } else {
          // Generate default slots from 6 AM to 11 PM with 20-minute intervals
          const defaultSlots = generateDefaultSlots(
            scheduleSelectedDate,
            6,
            23,
            20
          );
          setScheduleSlots(defaultSlots);
        }
      } catch (err) {
        console.error("Failed to fetch schedule slots:", err);
        // On error, still show default slots so schedule is visible
        const defaultSlots = generateDefaultSlots(
          scheduleSelectedDate,
          6,
          23,
          20
        );
        setScheduleSlots(defaultSlots);

        notifications.show({
          title: "Warning",
          message:
            "Using default time slots. Could not fetch provider's schedule.",
          color: "yellow",
        });
      } finally {
        setLoadingScheduleSlots(false);
      }
    };

    fetchScheduleSlots();
  }, [orgId, centerId, canFetchData, scheduleProvider, scheduleSelectedDate]);

  // Fetch provider fee when time slot is selected
  useEffect(() => {
    const fetchProviderFee = async () => {
      // Only fetch fee when a time slot is selected
      if (
        !canFetchData ||
        !provider ||
        !appointmentType ||
        !selectedSpeciality ||
        !selectedTime
      )
        return;

      setLoadingFee(true);
      try {
        const resp = await apis.GetProviderFees(
          selectedSpeciality,
          appointmentType,
          centerId!,
          provider
        );
        // Some API responses use `provider_fee_list` and others use `fees`.
        const dataShape = resp?.data as
          | FeeManagementData
          | { fees?: ProviderFee[] }
          | undefined;
        const feeList: ProviderFee[] =
          (dataShape as FeeManagementData)?.provider_fee_list ||
          (dataShape as { fees?: ProviderFee[] })?.fees ||
          [];
        const feeData = feeList?.[0];
        if (feeData?.fee) {
          const fee = parseFloat(feeData.fee);
          setActualFee(fee);
          setPayableAmount(fee);
        } else {
          setActualFee(0);
          setPayableAmount(0);
        }
      } catch (err) {
        console.error("Failed to fetch provider fee:", err);
        setActualFee(0);
        setPayableAmount(0);
      } finally {
        setLoadingFee(false);
      }
    };

    fetchProviderFee();
  }, [
    orgId,
    centerId,
    canFetchData,
    provider,
    appointmentType,
    selectedSpeciality,
    selectedTime,
  ]);

  // Calculate payable amount when discount changes
  useEffect(() => {
    if (!actualFee) {
      setPayableAmount(0);
      return;
    }

    const discount = parseFloat(discountValue) || 0;
    let calculatedAmount = actualFee;

    if (discount > 0) {
      if (discountType === "percentage") {
        calculatedAmount = actualFee - (actualFee * discount) / 100;
      } else {
        calculatedAmount = actualFee - discount;
      }
    }

    setPayableAmount(Math.max(0, calculatedAmount));
  }, [actualFee, discountValue, discountType]);

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handlePatientChange = (patientId: string | null) => {
    setSelectedPatientId(patientId || "");
    const foundPatient = patients.find((p) => p.uid === patientId);
    setPatientName(foundPatient?.name || "");
  };

  const buildAppointmentSymptoms = (): AppointmentSymptom[] => {
    const symptoms: AppointmentSymptom[] = selectedSymptomIds.map((id) => {
      const found = symptomOptions.find((s) => s.value === id);
      return found
        ? { symptom_id: id, symptom_name: found.label }
        : { symptom_name: id };
    });

    if (others.trim()) {
      symptoms.push({ symptom_name: others.trim() });
    }

    return symptoms;
  };

  const resetForm = () => {
    // Clear basic form fields
    setPatientName("");
    setSelectedPatientId("");
    setSelectedTime(null);
    setSelectedSymptomIds([]);
    setOthers("");

    // Clear payment related fields
    setDiscountValue("");
    setPaymentNote("");
    setActualFee(0);
    setPayableAmount(0);
    setAmountPaid("");
    setIsPaymentReceived(false);
    setDiscountType("percentage");
    setPaymentMode("");

    // Clear dropdowns & selections
    setAppointmentType("");
    setProvider("");
    setScheduleProvider("");
    setSelectedSpeciality("");

    // Clear slots
    setAvailableSlots([]);
    setScheduleSlots([]);

    // Reset date to today or null depending on desired behavior. Use null to 'empty' as requested
    setSelectedDate(null);
    setScheduleSelectedDate(null);
  };

  // Refetch patients list
  const refetchPatients = async () => {
    if (!canFetchData) return;

    setLoadingPatients(true);
    try {
      const resp = await apis.GetPatients(
        orgId!,
        centerId!,
        undefined,
        1,
        100,
        ["uid", "name"]
      );
      setPatients(resp?.data?.patients ?? []);
    } catch (err) {
      console.error("Failed to refetch patients:", err);
    } finally {
      setLoadingPatients(false);
    }
  };

  // Refetch appointments list for the schedule view
  const refetchAppointments = async () => {
    if (!canFetchData || !scheduleSelectedDate) return;
    try {
      const dateStr = formatDate(scheduleSelectedDate);
      const resp = await apis.GetCenterAppointmentList(
        orgId!,
        centerId!,
        dateStr
      );
      const appointmentList = resp?.data?.appointments ?? [];
      const transformedAppointments: Appointment[] = appointmentList.map(
        (apt) => ({
          appointment_uid: apt.appointment_uid,
          name: apt.patient_name,
          patient_name: apt.patient_name,
          doctor_name: apt.doctor_name,
          type: apt.appointment_type || "",
          time: apt.time ? apt.time.substring(0, 5) : "00:00",
          date: apt.date,
          provider: apt.doctor_id,
          clinic: clinicName,
          symptoms: apt.symptoms,
        })
      );
      setAppointments(transformedAppointments);
    } catch (err) {
      console.error("Failed to refetch appointments:", err);
    }
  };

  const handleAddAppointment = async () => {
    if (!patientName || !selectedTime || !selectedDate || !provider) {
      return;
    }

    const appointmentSymptoms = buildAppointmentSymptoms();
    const selectedSlot = availableSlots.find(
      (s) => extractTime(s.start) === selectedTime
    );
    const duration = selectedSlot
      ? calculateDuration(selectedSlot.start, selectedSlot.end)
      : DEFAULT_DURATION;

    interface AppointmentPayload {
      doctor_id: string;
      patient_id: string;
      appointment_date: string;
      appointment_time: string;
      duration: string;
      appointmentSymptoms: AppointmentSymptom[];
      actual_fee?: number;
      payable_amount?: number;
      discount_value?: string;
      discount_unit?: string;
      payment?: {
        amount: number;
        as: "advance" | "full";
        purpose: "appointment";
        source: "manual";
        mode: "cash" | "online" | "card";
        note?: string;
      } | null;
    }

    const payload: AppointmentPayload = {
      doctor_id: provider,
      patient_id: selectedPatientId,
      appointment_date: formatDate(selectedDate),
      appointment_time: formatTime(selectedTime),
      duration,
      appointmentSymptoms,
    };

    // Add payment if fee exists and payment is received
    if (actualFee > 0) {
      if (discountType) payload.discount_unit = discountType;
      if (discountValue) payload.discount_value = discountValue;
      payload.actual_fee = actualFee;
      payload.payable_amount = payableAmount;

      // Only add payment object if payment is marked as received
      if (isPaymentReceived) {
        // validation: amountPaid and paymentMode must be provided when marking payment as received
        const paidAmount = parseFloat(amountPaid) || 0;
        if (!amountPaid || paidAmount <= 0) {
          notifications.show({
            title: "Error",
            message:
              "Please enter a valid paid amount when marking payment as received.",
            color: "red",
          });
          return;
        }

        if (!paymentMode) {
          notifications.show({
            title: "Error",
            message:
              "Please select a payment mode when marking payment as received.",
            color: "red",
          });
          return;
        }

        const paymentObj: AppointmentPayload["payment"] = {
          amount: paidAmount,
          as: paidAmount >= payableAmount ? "full" : "advance",
          purpose: "appointment" as const,
          source: "manual" as const,
          mode: paymentMode as "cash" | "online" | "card",
        };
        if (paymentNote) paymentObj.note = paymentNote;

        payload.payment = paymentObj;
      } else {
        // If payment isn't marked received, explicitly send null per requested behavior
        payload.payment = null;
      }
    }

    try {
      const resp = await apis.CreateAppointment(
        orgId!,
        centerId!,
        payload as unknown as CreateAppointmentRequest
      );
      if (resp.success) {
        notifications.show({
          title: "Success",
          message: resp.message,
          color: "green",
        });

        // Refetch appointments to reflect the new appointment in the schedule
        await refetchAppointments();

        // Reset form after successful creation
        resetForm();
        return;
      }

      await refetchAppointments();

      const selectedSymptomNames = appointmentSymptoms
        .map((s) => s.symptom_name)
        .filter(Boolean)
        .join(", ");

      const newAppointment: Appointment = {
        appointment_uid: resp?.data?.appointment_id,
        name: patientName,
        patient_name: patientName,
        type: appointmentType,
        time: selectedTime,
        date: formatDate(selectedDate),
        provider,
        clinic: clinicName,
        symptoms: selectedSymptomNames,
      };

      setAppointments([...appointments, newAppointment]);
      resetForm();
    } catch (err) {
      console.error("Failed to create appointment:", err);
      notifications.show({
        title: "Error",
        message: "Failed to create appointment",
        color: "red",
      });
    }
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div>
      <div className="flex flex-col md:flex-row h-screen bg-gray-50">
        {/* Schedule List */}
        <ScheduleView
          selectedDate={scheduleSelectedDate}
          onDateChange={setScheduleSelectedDate}
          provider={scheduleProvider}
          onProviderChange={setScheduleProvider}
          providerOptions={providerOptions}
          loadingProviders={loadingProviders}
          slots={scheduleSlots}
          loadingSlots={loadingScheduleSlots}
          appointments={appointments}
        />

        {/* Add Appointment Form */}
        <AppointmentForm
          selectedPatientId={selectedPatientId}
          onPatientChange={handlePatientChange}
          patientOptions={patientOptions}
          loadingPatients={loadingPatients}
          provider={provider}
          onProviderChange={setProvider}
          providerOptions={providerOptions}
          loadingProviders={loadingProviders}
          clinicName={clinicName}
          appointmentType={appointmentType}
          onAppointmentTypeChange={setAppointmentType}
          appointmentTypes={APPOINTMENT_TYPES}
          selectedSymptomIds={selectedSymptomIds}
          onSymptomsChange={setSelectedSymptomIds}
          symptomOptions={symptomOptions}
          loadingSymptoms={loadingSymptoms}
          others={others}
          onOthersChange={setOthers}
          selectedDate={selectedDate}
          onDateChange={setSelectedDate}
          availableSlots={availableSlots}
          loadingSlots={loadingSlots}
          selectedTime={selectedTime}
          onTimeChange={setSelectedTime}
          onAddAppointment={handleAddAppointment}
          patientName={patientName}
          onShowAddPatient={() => setShowSidebar(true)}
          actualFee={actualFee}
          discountType={discountType}
          onDiscountTypeChange={setDiscountType}
          discountValue={discountValue}
          onDiscountValueChange={setDiscountValue}
          payableAmount={payableAmount}
          amountPaid={amountPaid}
          onAmountPaidChange={setAmountPaid}
          isPaymentReceived={isPaymentReceived}
          onPaymentReceivedChange={setIsPaymentReceived}
          paymentMode={paymentMode}
          onPaymentModeChange={setPaymentMode}
          paymentNote={paymentNote}
          onPaymentNoteChange={setPaymentNote}
          loadingFee={loadingFee}
          providers={providers}
          selectedSpeciality={selectedSpeciality}
          onSpecialityChange={setSelectedSpeciality}
        />
      </div>

      <Drawer
        opened={showSidebar}
        onClose={() => setShowSidebar(false)}
        position="right"
        size="xl"
        title={<span className="text-xl font-semibold">Add Patient</span>}
      >
        <AddPatientScheduling
          onClose={() => setShowSidebar(false)}
          onPatientAdded={refetchPatients}
        />
      </Drawer>
    </div>
  );
};

export default BookingPage;
