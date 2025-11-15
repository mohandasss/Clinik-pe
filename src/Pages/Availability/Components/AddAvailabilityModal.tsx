import React, { useState, useEffect } from "react";
import { Modal, Button, Select, Paper } from "@mantine/core";
import { IconClock } from "@tabler/icons-react";
import { notifications } from "@mantine/notifications";
import apis from "../../../APis/Api";
import useDropdownStore from "../../../GlobalStore/useDropdownStore";
import useAuthStore from "../../../GlobalStore/store";
import type { Provider, DoctorAvailabilityInput } from "../../../APis/Types";

type Props = {
  opened: boolean;
  onClose: () => void;
  providers: Provider[];
  defaultProvider?: string | null;
  onSaved?: () => void;
};

// We use Mantine notifications instead of a local notification state

const DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];
const INTERVALS = ["10", "15", "20", "30", "45", "60"];
const TYPES = ["in-clinic", "online", "both"];

const AddAvailabilityModal: React.FC<Props> = ({
  opened,
  onClose,
  providers = [],
  defaultProvider = null,
  onSaved,
}) => {
  const [selectedProvider, setSelectedProvider] = useState<string | null>(
    defaultProvider ?? null
  );
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("17:00");
  const [interval, setInterval] = useState("15");
  const [type, setType] = useState("in-clinic");
  // Using Mantine notifications instead of custom Notification component

  // When modal is opened, we should present a fresh form. Also apply defaultProvider when provided.
  useEffect(() => {
    if (opened) {
      setSelectedDays([]);
      setStartTime("09:00");
      setEndTime("17:00");
      setInterval("15");
      setType("in-clinic");
      setSelectedProvider(defaultProvider ?? null);
    }
  }, [opened, defaultProvider]);

  const showNotification = (success: boolean, message: string) => {
    notifications.show({
      title: success ? "Success" : "Error",
      message,
      color: success ? "green" : "red",
    });
  };

  const toggleDay = (day: string) => {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const validateForm = (): boolean => {
    if (!selectedProvider || selectedProvider === "all") {
      showNotification(false, "Please select a provider");
      return false;
    }
    if (selectedDays.length === 0) {
      showNotification(false, "Please select at least one day");
      return false;
    }
    if (!startTime || !endTime) {
      showNotification(false, "Please enter start and end times");
      return false;
    }
    if (startTime >= endTime) {
      showNotification(false, "Start time must be before end time");
      return false;
    }
    return true;
  };

  const formatTime = (time: string): string => {
    const [hhStr, mm] = time.split(":");
    let hh = parseInt(hhStr, 10);
    const ampm = hh >= 12 ? "PM" : "AM";
    if (hh === 0) hh = 12;
    if (hh > 12) hh -= 12;
    return `${String(hh).padStart(2, "0")}:${mm} ${ampm}`;
  };

  const compressDays = (days: string[]): string[] => {
    if (days.length === 0) return [""];

    const indices = days
      .map((d) => DAYS.indexOf(d))
      .filter((i) => i >= 0)
      .sort((a, b) => a - b);

    if (indices.length === 0) return [days.join(", ")];

    const isContiguous = indices.every(
      (idx, i) => i === 0 || idx === indices[i - 1] + 1
    );

    if (isContiguous && indices.length > 1) {
      return [`${DAYS[indices[0]]} - ${DAYS[indices[indices.length - 1]]}`];
    }

    // join with a space before comma to match API expectation "Wednesday , Friday"
    return [days.join(" , ")];
  };

  const buildPayload = (): DoctorAvailabilityInput => {
    const availabilityItem = {
      week_days: compressDays(selectedDays),
      time_ranges: [
        {
          start: formatTime(startTime),
          end: formatTime(endTime),
          wait_time: "0",
          time_slot_interval: interval,
        },
      ],
      appointment_type: type.toLowerCase().replace(/\s+/g, "-"),
      speciality_id: "",
    };

    return {
      availabilities: [availabilityItem],
      // not sending center_id here as it is present in the URL path
    };
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!validateForm()) return;

    const { organizationDetails } = useAuthStore.getState();
    const { selectedCenter } = useDropdownStore.getState();
    const orgId = organizationDetails?.organization_id;
    const centerId = selectedCenter?.center_id;

    if (!orgId || !centerId) {
      showNotification(false, "Missing organization or center information");
      return;
    }

    try {
      const payload = buildPayload();
      const response = await apis.AddDoctorAvailability(
        orgId,
        centerId,
        selectedProvider!,
        payload
      );

      showNotification(response.success, response.message);

      if (response.success) {
        onSaved?.();
        onClose();
      }
    } catch (err) {
      console.error("Error adding availability:", err);
      showNotification(false, "Error adding availability");
    }
  };

  const providerOptions = [
    ...providers.map((p) => ({ label: p.name, value: p.uid })),
  ];

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title="Add Availability"
      centered
      size="xl"
    >
      {/* Mantine notifications are shown programmatically via notifications.show() */}

      <Paper withBorder radius="md" className="p-4">
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Provider
            </label>
            <Select
              placeholder="Select Provider"
              data={providerOptions}
              value={selectedProvider ?? undefined}
              onChange={(v) => setSelectedProvider(v ?? null)}
              searchable
              clearable
            />
          </div>

          <div className="mb-4">
            <div className="col-span-2">
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Days
              </label>
              <div className="flex my-4  flex-wrap gap-2">
                {DAYS.map((day) => (
                  <button
                    key={day}
                    type="button"
                    onClick={() => toggleDay(day)}
                    className={`px-2 py-2 flex-1 rounded text-sm transition-colors ${
                      selectedDays.includes(day)
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100 hover:bg-gray-200"
                    }`}
                  >
                    {day}
                  </button>
                ))}
              </div>
            </div>
            <h3 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
              <IconClock size={18} /> Slot Details
            </h3>
            <div className="space-y-3 p-3 border rounded bg-gray-50">
              <div className="grid md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Start Time
                  </label>
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full px-2 py-1 border rounded"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    End Time
                  </label>
                  <input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full px-2 py-1 border rounded"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Interval (minutes)
                  </label>
                  <Select
                    data={INTERVALS}
                    value={interval}
                    onChange={(v) => setInterval(v || "15")}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Type
                  </label>
                  <Select
                    data={TYPES}
                    value={type}
                    onChange={(v) => setType(v || "in-clinic")}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <Button variant="light" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" color="blue">
              Save Availability
            </Button>
          </div>
        </form>
      </Paper>
    </Modal>
  );
};

export default AddAvailabilityModal;
