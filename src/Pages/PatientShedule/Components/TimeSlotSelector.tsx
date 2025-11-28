import React from "react";
import type { Slot } from "../../../APis/Types";
import { LoadingState, EmptyState } from "./SharedUIComponents";

interface TimeSlotSelectorProps {
  availableSlots: Slot[];
  loadingSlots: boolean;
  selectedTime: string | null;
  onTimeChange: (time: string) => void;
}

type ColorKey = "blue" | "amber" | "indigo";

const TIME_SLOTS = {
  MORNING: { start: 6, end: 12, label: "Morning", color: "blue" as ColorKey },
  AFTERNOON: {
    start: 12,
    end: 18,
    label: "Afternoon",
    color: "amber" as ColorKey,
  },
  EVENING: {
    start: 18,
    end: 24,
    label: "Evening",
    color: "indigo" as ColorKey,
  },
};

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

const extractTime = (datetime?: string): string => {
  return datetime?.split(" ")[1] || "";
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

export const TimeSlotSelector: React.FC<TimeSlotSelectorProps> = ({
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
