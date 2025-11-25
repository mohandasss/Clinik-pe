import React, { useState, useEffect } from "react";
import {
  Select,
  TextInput,
  Button,
  Drawer,
  ScrollArea,
  MultiSelect,
} from "@mantine/core";
import { DateInput } from "@mantine/dates";
import { IconPlus } from "@tabler/icons-react";
import AddPatientScheduling from "./Components/AddPatientScheduling";
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

// Payment mode options - used in PaymentSection component
// const PAYMENT_MODES = [
//   { value: "cash", label: "Cash" },
//   { value: "upi", label: "UPI" },
// ] as const;

// Discount type options - used in PaymentSection component
// const DISCOUNT_TYPES = [
//   { value: "percentage", label: "%" },
//   { value: "flat", label: "₹" },
// ] as const;

const DEFAULT_DURATION = "30";
const TIME_SLOTS = {
  MORNING: { start: 6, end: 12, label: "Morning", color: "blue" },
  AFTERNOON: { start: 12, end: 18, label: "Afternoon", color: "amber" },
  EVENING: { start: 18, end: 24, label: "Evening", color: "indigo" },
} as const;

type ColorKey = "blue" | "amber" | "indigo";
const COLOR_CLASS_MAP: Record<
  ColorKey,
  { bg50: string; text900: string; selected: string; default: string }
> = {
  blue: {
    bg50: "bg-blue-50",
    text900: "text-blue-900",
    selected: "bg-blue-600 text-white border border-blue-600",
    default: "bg-white text-gray-700 border border-blue-200 hover:bg-blue-100",
  },
  amber: {
    bg50: "bg-amber-50",
    text900: "text-amber-900",
    selected: "bg-amber-600 text-white border border-amber-600",
    default:
      "bg-white text-gray-700 border border-amber-200 hover:bg-amber-100",
  },
  indigo: {
    bg50: "bg-indigo-50",
    text900: "text-indigo-900",
    selected: "bg-indigo-600 text-white border border-indigo-600",
    default:
      "bg-white text-gray-700 border border-indigo-200 hover:bg-indigo-100",
  },
};

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

const getHourFromSlot = (slot: Slot): number => {
  return parseInt(extractTime(slot.start).split(":")[0] || "0");
};

const filterSlotsByTimeRange = (
  slots: Slot[],
  startHour: number,
  endHour: number
): Slot[] => {
  return slots.filter((slot) => {
    const hour = getHourFromSlot(slot);
    return hour >= startHour && hour < endHour;
  });
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

  // Fetch appointments
  useEffect(() => {
    const fetchAppointments = async () => {
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
  }, [orgId, centerId, canFetchData, scheduleSelectedDate, clinicName]);

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

  // Fetch schedule slots for left side
  useEffect(() => {
    const fetchScheduleSlots = async () => {
      if (!canFetchData || !scheduleProvider || !scheduleSelectedDate) return;

      setLoadingScheduleSlots(true);
      try {
        const dateStr = formatDate(scheduleSelectedDate);
        const resp = await apis.GetSlots(
          orgId!,
          centerId!,
          scheduleProvider,
          dateStr
        );
        setScheduleSlots(resp?.data?.slots ?? []);
      } catch (err) {
        console.error("Failed to fetch schedule slots:", err);
        notifications.show({
          title: "Error",
          message: "Failed to load schedule slots",
          color: "red",
        });
        setScheduleSlots([]);
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
        as: "advance" | "paid";
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
          as: paidAmount >= payableAmount ? "paid" : "advance",
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

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

interface ScheduleViewProps {
  selectedDate: Date | null;
  onDateChange: (date: Date | null) => void;
  provider: string;
  onProviderChange: (provider: string) => void;
  providerOptions: { value: string; label: string }[];
  loadingProviders: boolean;
  slots: Slot[];
  loadingSlots: boolean;
  appointments: Appointment[];
}

const ScheduleView: React.FC<ScheduleViewProps> = ({
  selectedDate,
  onDateChange,
  provider,
  onProviderChange,
  providerOptions,
  loadingProviders,
  slots,
  loadingSlots,
  appointments,
}) => {
  return (
    <div className="md:w-4/7 w-full overflow-auto h-full">
      <div className="p-4 bg-[#EAF2FF]">
        <h2 className="text-xl font-semibold mb-3">
          Schedule for {selectedDate?.toDateString()}
        </h2>
        <div className="grid grid-cols-2 gap-3">
          <Select
          clearable
            label="Provider"
            placeholder="Select Provider"
            value={provider}
            data={providerOptions}
            onChange={(val) => onProviderChange(val || "")}
            disabled={loadingProviders}
          />
          <div className="w-full">
            <DateInput
              placeholder="Select Date "
              value={
                selectedDate ? selectedDate.toISOString().split("T")[0] : null
              }
              onChange={(value) => onDateChange(value ? new Date(value) : null)}
              label="Date"
              minDate={new Date()}
            />
          </div>
        </div>
      </div>

      <ScrollArea className="h-[calc(100vh-180px)]">
        {loadingSlots ? (
          <LoadingState message="Loading schedule..." />
        ) : (
          // Always render a set of slots; use API slots if present, otherwise generate defaults
          (() => {
            const displaySlots =
              slots.length > 0
                ? slots
                : generateDefaultSlots(selectedDate || new Date());
            return displaySlots.map((slot, index) => {
              const slotStart = extractTime(slot.start);
              const scheduleDateStr = formatDate(selectedDate);
              const slotAppointments = appointments.filter(
                (apt) =>
                  apt.date === scheduleDateStr &&
                  apt.time === slotStart &&
                  apt.provider === provider
              );

              return (
                <ScheduleSlot
                  key={`${index}-${slotStart}`}
                  time={slotStart}
                  appointments={slotAppointments}
                />
              );
            });
          })()
        )}
      </ScrollArea>
    </div>
  );
};

interface ScheduleSlotProps {
  time: string;
  appointments: Appointment[];
}

const ScheduleSlot: React.FC<ScheduleSlotProps> = ({ time, appointments }) => {
  return (
    <div className="flex border-b border-gray-200">
      <div className="font-semibold text-black bg-white p-4 min-h-[73px] flex items-center whitespace-nowrap min-w-[120px]">
        {time}
      </div>

      {appointments.length > 0 ? (
        <div className="flex-1 bg-gray-50 p-2 flex gap-2 overflow-x-auto">
          {appointments.map((apt, i) => (
            <AppointmentCard key={i} appointment={apt} />
          ))}
        </div>
      ) : (
        <div className="flex-1 bg-gray-50"></div>
      )}
    </div>
  );
};

interface AppointmentCardProps {
  appointment: Appointment;
}

const AppointmentCard: React.FC<AppointmentCardProps> = ({ appointment }) => {
  // console.log("Rendering appointment:", appointment);
  return (
    <div className="px-3 py-2 bg-white rounded shadow min-w-[200px] border-l-4 border-indigo-500">
      <div className="font-semibold text-xs capitalize text-black truncate">
        👤 {appointment.patient_name}
      </div>
      <div className="text-xs text-gray-600 capitalize truncate">
        👨‍⚕️ {appointment.doctor_name}
      </div>
      <div className="text-xs text-gray-500 truncate">
        📋 {appointment.symptoms || "No symptoms"}
      </div>
      {/* <div className="text-xs text-gray-500 capitalize truncate">
        🏥 {appointment.clinic}
      </div> */}
    </div>
  );
};

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

const AppointmentForm: React.FC<AppointmentFormProps> = ({
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

interface TimeSlotSelectorProps {
  availableSlots: Slot[];
  loadingSlots: boolean;
  selectedTime: string | null;
  onTimeChange: (time: string) => void;
}

const TimeSlotSelector: React.FC<TimeSlotSelectorProps> = ({
  availableSlots,
  loadingSlots,
  selectedTime,
  onTimeChange,
}) => {
  if (loadingSlots) {
    return <LoadingState message="Loading slots..." />;
  }

  if (availableSlots.length === 0) {
    return <EmptyState message="No slots available for selected date" />;
  }

  return (
    <div>
      <label className="text-sm font-medium block mb-3">Time Slots</label>
      <div className="grid grid-cols-3 gap-4">
        {Object.values(TIME_SLOTS).map((period) => (
          <TimeSlotPeriod
            key={period.label}
            period={period}
            slots={filterSlotsByTimeRange(
              availableSlots,
              period.start,
              period.end
            )}
            selectedTime={selectedTime}
            onTimeChange={onTimeChange}
          />
        ))}
      </div>
    </div>
  );
};

interface TimeSlotPeriodProps {
  period: {
    label: string;
    color: ColorKey;
    start: number;
    end: number;
  };
  slots: Slot[];
  selectedTime: string | null;
  onTimeChange: (time: string) => void;
}

const TimeSlotPeriod: React.FC<TimeSlotPeriodProps> = ({
  period,
  slots,
  selectedTime,
  onTimeChange,
}) => {
  const { label, color } = period;

  const colorClasses = COLOR_CLASS_MAP[color] || COLOR_CLASS_MAP.blue;
  return (
    <div className={`border rounded-lg p-3 ${colorClasses.bg50}`}>
      <h3
        className={`font-semibold text-sm ${colorClasses.text900} mb-2 sticky top-0 ${colorClasses.bg50} pt-1 z-10`}
      >
        {label}
      </h3>
      <div className="flex flex-col gap-1 max-h-36 overflow-y-auto pr-1">
        {slots.map((slot, idx) => {
          const slotStart = extractTime(slot.start);
          const slotEnd = extractTime(slot.end);
          const isSelected = selectedTime === slotStart;

          return (
            <button
              key={`${label.toLowerCase()}-${idx}-${slotStart}`}
              type="button"
              onClick={() => onTimeChange(slotStart)}
              className={`px-3 py-1 rounded text-xs font-medium whitespace-nowrap transition-all ${
                isSelected ? colorClasses.selected : colorClasses.default
              }`}
              title={`${slotStart} - ${slotEnd}`}
            >
              {slotStart}
            </button>
          );
        })}
      </div>
    </div>
  );
};

// ============================================================================
// UTILITY COMPONENTS
// ============================================================================

interface PaymentSectionProps {
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
}

const PaymentSection: React.FC<PaymentSectionProps> = ({
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
}) => {
  if (loadingFee) {
    return (
      <div className="border rounded-lg p-4 bg-gray-50">
        <p className="text-sm text-gray-500">Loading fee...</p>
      </div>
    );
  }

  if (!actualFee || actualFee === 0) {
    return null;
  }

  return (
    <div className="border rounded-lg p-4 bg-gradient-to-br from-blue-50 to-indigo-50">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-base font-semibold text-gray-800">
          Payment Details
        </h3>
        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
          Optional
        </span>
      </div>

      {/* Fee Display */}
      <div className="mb-3 p-3 bg-white rounded-lg border border-blue-200">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-gray-600">
            Consultation Fee:
          </span>
          <span className="text-lg font-bold text-blue-600">
            ₹{actualFee.toFixed(2)}
          </span>
        </div>
      </div>

      {/* Discount Section */}
      <div className="mb-3">
        <label className="text-sm font-medium text-gray-700 block mb-2">
          Discount <span className="text-gray-400 font-normal">(Optional)</span>
        </label>
        <div className="flex gap-2">
          <div className="flex-1">
            <TextInput
              type="number"
              placeholder="Enter discount"
              value={discountValue}
              onChange={(e) => onDiscountValueChange(e.target.value)}
              min="0"
            />
          </div>
          <Select
            data={[
              { value: "percentage", label: "%" },
              { value: "flat", label: "₹" },
            ]}
            value={discountType}
            onChange={(val) =>
              onDiscountTypeChange((val as "percentage" | "flat" | "") || "")
            }
            className="w-24"
            placeholder="Select"
          />
        </div>
      </div>

      {/* Payable Amount */}
      <div className="mb-3 p-3 bg-white rounded-lg border-2 border-green-300">
        <div className="flex justify-between items-center">
          <span className="text-sm font-semibold text-gray-700">
            Payable Amount:
          </span>
          <span className="text-xl font-bold text-green-600">
            ₹{payableAmount.toFixed(2)}
          </span>
        </div>
      </div>

      {/* Collect Payment Now Section */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="mb-3">
          <label className="flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={isPaymentReceived}
              onChange={(e) => onPaymentReceivedChange(e.target.checked)}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="ml-2 text-sm font-medium text-gray-700">
              Collect Payment Now
            </span>
            <span className="ml-2 text-xs text-gray-400">
              (Optional - can collect later)
            </span>
          </label>
        </div>

        {/* Show payment fields only if payment is received */}
        {isPaymentReceived && (
          <div className="bg-white rounded-lg p-3 border border-gray-200 space-y-3">
            {/* Amount Paid */}
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-2">
                Amount Paid
              </label>
              <TextInput
                type="number"
                placeholder="Enter amount paid"
                value={amountPaid}
                onChange={(e) => onAmountPaidChange(e.target.value)}
                min="0"
                max={payableAmount.toString()}
              />
              {amountPaid && parseFloat(amountPaid) > payableAmount && (
                <p className="text-xs text-red-600 mt-1">
                  Amount paid cannot exceed payable amount
                </p>
              )}
              {amountPaid &&
                parseFloat(amountPaid) < payableAmount &&
                parseFloat(amountPaid) > 0 && (
                  <div className="flex items-center justify-between ">
                    <p className="text-xs  text-green-600 mt-1">
                   Advance: ₹
                    {parseFloat(amountPaid).toFixed(2)} paid
                    
                  </p>
                  <p className="text-xs flex items-center justify-center text-red-600 mt-1">
                     ₹
                    {(payableAmount - parseFloat(amountPaid)).toFixed(2)}{" "}
                    remaining
                     </p>


                  </div>
                  
                )}
              {amountPaid && parseFloat(amountPaid) === payableAmount && (
                <p className="text-xs text-green-600 mt-1">
                  Full payment received
                </p>
              )}
            </div>

            {/* Payment Mode */}
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-2">
                Payment Mode
              </label>
              <Select
                data={[
                  { value: "cash", label: "Cash" },
                  { value: "online", label: "Online" },
                  { value: "card", label: "Card" },
                ]}
                value={paymentMode}
                onChange={(val) =>
                  onPaymentModeChange(
                    (val as "cash" | "online" | "card" | "") || ""
                  )
                }
                placeholder="Select payment mode"
              />
            </div>

            {/* Payment Note */}
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-2">
                Payment Note{" "}
                <span className="text-gray-400 font-normal">(Optional)</span>
              </label>
              <TextInput
                placeholder="Add a note..."
                value={paymentNote}
                onChange={(e) => onPaymentNoteChange(e.target.value)}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

interface LoadingStateProps {
  message: string;
}

const LoadingState: React.FC<LoadingStateProps> = ({ message }) => {
  return (
    <div className="flex items-center justify-center py-6">
      <p className="text-sm text-gray-500">{message}</p>
    </div>
  );
};

interface EmptyStateProps {
  message: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({ message }) => {
  return (
    <div className="flex items-center justify-center h-full text-gray-500">
      {message}
    </div>
  );
};

export default BookingPage;
