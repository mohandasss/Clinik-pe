import React, { useState, useEffect } from "react";
import {
  Select,
  TextInput,
  Button,
  Drawer,
  ScrollArea,
  MultiSelect,
} from "@mantine/core";
import { IconPlus } from "@tabler/icons-react";
import AddPatientScheduling from "./Components/AddPatientScheduling";
import CustomDatePicker from "./Components/CustomDatePicker";
import useAuthStore from "../../GlobalStore/store";
import useDropdownStore from "../../GlobalStore/useDropdownStore";
import { notifications } from "@mantine/notifications";
import type { Provider, Patient, Slot } from "../../APis/Types";
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
const TIME_SLOTS = {
  MORNING: { start: 6, end: 12, label: "Morning", color: "blue" },
  AFTERNOON: { start: 12, end: 18, label: "Afternoon", color: "amber" },
  EVENING: { start: 18, end: 24, label: "Evening", color: "indigo" },
} as const;

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
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [scheduleSelectedDate, setScheduleSelectedDate] = useState<Date | null>(
    new Date()
  );
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [patientName, setPatientName] = useState<string>("");
  const [selectedPatientId, setSelectedPatientId] = useState<string>("");
  const [appointmentType, setAppointmentType] = useState<string>("medical");
  const [provider, setProvider] = useState<string>("");
  const [scheduleProvider, setScheduleProvider] = useState<string>("");
  const [selectedSymptomIds, setSelectedSymptomIds] = useState<string[]>([]);
  const [others, setOthers] = useState<string>("");

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

  // Set default providers
  useEffect(() => {
    if (providers.length === 0) return;
    if (!scheduleProvider) setScheduleProvider(providers[0].uid);
    if (!provider) setProvider(providers[0].uid);
  }, [providers, provider, scheduleProvider]);

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
      if (!canFetchData) return;

      try {
        const dateStr = formatDate(scheduleSelectedDate || new Date());
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
    setPatientName("");
    setSelectedPatientId("");
    setSelectedTime(null);
    setSelectedSymptomIds([]);
    setOthers("");
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

    const payload = {
      doctor_id: provider,
      patient_id: selectedPatientId,
      appointment_date: formatDate(selectedDate),
      appointment_time: formatTime(selectedTime),
      duration,
      appointmentSymptoms,
    };

    try {
      const resp = await apis.CreateAppointment(orgId!, centerId!, payload);

      notifications.show({
        title: "Success",
        message: "Appointment created successfully!",
        color: "green",
      });

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
        />
      </div>

      <Drawer
        opened={showSidebar}
        onClose={() => setShowSidebar(false)}
        position="right"
        size="xl"
        title={<span className="text-xl font-semibold">Add Patient</span>}
      >
        <AddPatientScheduling onClose={() => setShowSidebar(false)} />
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
            label="Provider"
            placeholder="Select Provider"
            value={provider}
            data={providerOptions}
            onChange={(val) => onProviderChange(val || "")}
            disabled={loadingProviders}
          />
          <div className="w-full">
            <CustomDatePicker
              value={selectedDate}
              onChange={onDateChange}
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
  console.log("Rendering appointment:", appointment);
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
}) => {
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
            searchable
            label="Patient"
            placeholder="Select Patient"
            value={selectedPatientId}
            data={patientOptions}
            onChange={onPatientChange}
            disabled={loadingPatients}
          />
          <Select
            searchable
            label="Provider"
            placeholder="Select Provider"
            value={provider}
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
            label="Appointment Type"
            value={appointmentType}
            data={[...appointmentTypes]}
            onChange={(val) => onAppointmentTypeChange(val || "medical")}
          />
        </div>

        <div className="grid md:grid-cols-2 grid-cols-1 gap-4">
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
          <TextInput
            label="Others"
            placeholder="Enter others...."
            value={others}
            onChange={(e) => onOthersChange(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 gap-4">
          <CustomDatePicker
            value={selectedDate}
            onChange={onDateChange}
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
    color: string;
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

  return (
    <div className={`border rounded-lg p-3 bg-${color}-50`}>
      <h3
        className={`font-semibold text-sm text-${color}-900 mb-2 sticky top-0 bg-${color}-50 pt-1 z-10`}
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
                isSelected
                  ? `bg-${color}-600 text-white border border-${color}-600`
                  : `bg-white text-gray-700 border border-${color}-200 hover:bg-${color}-100`
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
