import { Button } from "@mantine/core";
import { IconArrowDown, IconArrowUp, IconPlus } from "@tabler/icons-react";
import type { VitalItem } from "../../../../APis/Types";

interface VitalsSectionProps {
  vitalsValues: Record<string, string>;
  vitalsList: VitalItem[];
  onAddClick: () => void;
  getVitalStatus: (
    vital: VitalItem,
    value: string
  ) => "normal" | "high" | "low" | null;
}

export default function VitalsSection({
  vitalsValues,
  vitalsList,
  onAddClick,
  getVitalStatus,
}: VitalsSectionProps) {
  return (
    <div className="bg-white p-4 rounded-lg border border-[#EDEBEB] flex flex-col gap-3">
      <div className="flex justify-between items-center">
        <div className="font-medium text-lg text-black">Vitals</div>
        <Button
          size="md"
          leftSection={<IconPlus size={14} />}
          className="!bg-[#E2EBFF] !text-[#2563EB] !p-3 !font-normal"
          onClick={onAddClick}
        >
          Add Vital
        </Button>
      </div>
      {Object.keys(vitalsValues).filter((k) => vitalsValues[k]).length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {vitalsList
            .filter((v) => vitalsValues[v.key])
            .map((v) => {
              const status = getVitalStatus(v, vitalsValues[v.key]);
              return (
                <div
                  key={v.key}
                  className={`px-3 py-2 rounded-lg border flex items-center gap-2 ${
                    status === "high"
                      ? "bg-red-50 border-red-200"
                      : status === "low"
                      ? "bg-blue-50 border-blue-200"
                      : "bg-[#F9F9F9] border-[#EEEEEE]"
                  }`}
                >
                  <span className="text-sm font-medium text-black">
                    {v.name}:
                  </span>
                  <span className="text-sm text-gray-700">
                    {vitalsValues[v.key]} {v.unit}
                  </span>
                  {status === "high" && (
                    <IconArrowUp size={16} className="text-red-500" />
                  )}
                  {status === "low" && (
                    <IconArrowDown size={16} className="text-blue-500" />
                  )}
                </div>
              );
            })}
        </div>
      ) : (
        <div className="rounded-lg p-4 bg-[#F9F9F9] border border-[#EEEEEE]">
          No vitals added
        </div>
      )}
    </div>
  );
}
