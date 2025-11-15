import React from "react";
import { Text } from "@mantine/core";

interface Props {
  value: Date | null;
  onChange: (v: Date | null) => void;
  label?: string;
  minDate?: Date;
}

const CustomDatePicker: React.FC<Props> = ({
  value,
  onChange,
  label,
  minDate,
}) => {
  return (
    <div>
      {label && (
        <div className="mb-1">
          <Text size="sm" fw={600}>
            {label}
          </Text>
        </div>
      )}
      <input
        type="date"
        aria-label={label || "Select date"}
        className="w-full bg-white rounded px-2 py-1 border border-gray-400 appearance-none outline-none focus:outline-none focus:ring-0 focus:border-[#f2f3f3]"
        value={value ? value.toISOString().slice(0, 10) : ""}
        min={minDate ? minDate.toISOString().slice(0, 10) : undefined}
        onChange={(e) =>
          onChange(e.target.value ? new Date(e.target.value) : null)
        }
      />
    </div>
  );
};

export default CustomDatePicker;
