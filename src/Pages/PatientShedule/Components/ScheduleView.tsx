import React from "react";
import { Select, ScrollArea } from "@mantine/core";
import { DateInput } from "@mantine/dates";
import type { Slot } from "../../../APis/Types";
import { LoadingState, EmptyState } from "./SharedUIComponents";

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

const extractTime = (datetime?: string): string => {
  return datetime?.split(" ")[1] || "";
};

const formatDate = (date: Date | null): string => {
  return date ? date.toISOString().split("T")[0] : "";
};

export const ScheduleView: React.FC<ScheduleViewProps> = ({
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
        ) : !provider || !selectedDate ? (
          <EmptyState message="Please select a provider and date to view schedule" />
        ) : slots.length === 0 ? (
          <EmptyState message="No schedule available for this provider on the selected date" />
        ) : (
          slots.map((slot, index) => {
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
          })
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
    </div>
  );
};
