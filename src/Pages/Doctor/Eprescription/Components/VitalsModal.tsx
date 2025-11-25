import { Button, Loader, Modal, TextInput } from "@mantine/core";
import { IconArrowDown, IconArrowUp } from "@tabler/icons-react";
import type { VitalItem } from "../../../../APis/Types";

interface VitalsModalProps {
  opened: boolean;
  onClose: () => void;
  vitalsLoading: boolean;
  vitalsList: VitalItem[];
  vitalsValues: Record<string, string>;
  onUpdateValue: (key: string, value: string) => void;
  getVitalStatus: (
    vital: VitalItem,
    value: string
  ) => "normal" | "high" | "low" | null;
  onConfirm: () => void;
}

export default function VitalsModal({
  opened,
  onClose,
  vitalsLoading,
  vitalsList,
  vitalsValues,
  onUpdateValue,
  getVitalStatus,
  onConfirm,
}: VitalsModalProps) {
  return (
    <Modal
      opened={opened}
      onClose={onClose}
      centered
      size="lg"
      overlayProps={{ blur: 2 }}
      title="Add Vitals"
    >
      <div className="relative overflow-y-auto" style={{ maxHeight: "70vh" }}>
        {vitalsLoading && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-white/60">
            <Loader size="lg" />
          </div>
        )}
        <div className="flex flex-col gap-3">
          {vitalsList.map((vital) => {
            const value = vitalsValues[vital.key] || "";
            const status = getVitalStatus(vital, value);
            return (
              <div
                key={vital.uid}
                className={`p-3 rounded-lg border ${
                  status === "high"
                    ? "bg-red-50 border-red-200"
                    : status === "low"
                    ? "bg-blue-50 border-blue-200"
                    : "bg-[#F9F9F9] border-[#EEEEEE]"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="flex-1">
                    <label className="text-sm font-medium text-black">
                      {vital.name}
                    </label>
                    <div className="text-xs text-gray-500">
                      Normal: {vital.lower_limit} - {vital.higher_limit}{" "}
                      {vital.unit}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <TextInput
                      placeholder="—"
                      value={value}
                      onChange={(e) =>
                        onUpdateValue(vital.key, e.currentTarget.value)
                      }
                      className="w-24"
                      size="sm"
                      styles={{
                        input: {
                          textAlign: "center",
                        },
                      }}
                    />
                    <span className="text-sm text-gray-600 min-w-[40px]">
                      {vital.unit}
                    </span>
                    <div className="w-5">
                      {status === "high" && (
                        <IconArrowUp size={18} className="text-red-500" />
                      )}
                      {status === "low" && (
                        <IconArrowDown size={18} className="text-blue-500" />
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        <div className="flex justify-end gap-2 mt-4">
          <Button variant="default" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={onConfirm}>Confirm Vitals</Button>
        </div>
      </div>
    </Modal>
  );
}
