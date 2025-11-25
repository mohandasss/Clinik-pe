import { useState } from "react";
import { Button, Select, TextInput } from "@mantine/core";
import { IconPlus, IconX } from "@tabler/icons-react";
import type { Medicine } from "../../../../APis/Types";

type MedicineWithDetails = Medicine & {
  duration?: string;
  dosage?: string;
  instruction?: string;
};

interface MedicineSectionProps {
  medicines: MedicineWithDetails[];
  onAddClick: () => void;
  onRemoveMedicine: (index: number) => void;
  onUpdateMedicine: (index: number, key: string, value: string) => void;
}

export default function MedicineSection({
  medicines,
  onAddClick,
  onRemoveMedicine,
  onUpdateMedicine,
}: MedicineSectionProps) {
  const [expandedMedicine, setExpandedMedicine] = useState<number | null>(null);

  const toggleExpandMedicine = (index: number) => {
    setExpandedMedicine(expandedMedicine === index ? null : index);
  };

  return (
    <div className="bg-white p-4 rounded-lg border border-[#EDEBEB] flex flex-col gap-3">
      <div className="mb-1 flex justify-between items-center">
        <div className="font-medium text-lg text-black">Medicines</div>
        <Button
          size="md"
          leftSection={<IconPlus size={14} />}
          className="!bg-[#E2EBFF] !text-[#2563EB] !p-3 !font-normal"
          onClick={onAddClick}
        >
          Add Medicine
        </Button>
      </div>
      <div className="flex flex-col gap-3">
        {medicines.length === 0 ? (
          <div className="rounded-lg p-4 bg-[#F9F9F9] border border-[#EEEEEE]">
            No medicines added
          </div>
        ) : (
          medicines.map((med, index) => (
            <div
              key={index}
              className="rounded-lg border border-[#EEEEEE] bg-[#F9F9F9]"
            >
              <div
                className="p-4 flex items-center justify-between cursor-pointer hover:bg-[#F0F0F0]"
                onClick={() => toggleExpandMedicine(index)}
              >
                <div className="flex-1">
                  <div className="text-black font-sm font-medium">
                    {med.name}
                  </div>
                  <small className="block text-[#787777]">
                    {med.saltQuantity ?? med.type ?? ""}
                  </small>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemoveMedicine(index);
                    }}
                    aria-label={`Remove ${med.name}`}
                  >
                    <IconX size={18} />
                  </button>
                </div>
              </div>

              {/* Expanded Form */}
              {expandedMedicine === index && (
                <div className="border-t border-[#EDEBEB] p-4 bg-white rounded-b-lg flex flex-col gap-3">
                  <div>
                    <label className="text-sm font-medium text-black">
                      Salt Quantity
                    </label>
                    <TextInput
                      placeholder="e.g., 500mg"
                      value={med.saltQuantity || ""}
                      onChange={(e) =>
                        onUpdateMedicine(
                          index,
                          "saltQuantity",
                          e.currentTarget.value
                        )
                      }
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-black">
                      Duration
                    </label>
                    <TextInput
                      placeholder="e.g., 3 days"
                      value={med.duration || ""}
                      onChange={(e) =>
                        onUpdateMedicine(
                          index,
                          "duration",
                          e.currentTarget.value
                        )
                      }
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-black">
                      Dosage
                    </label>
                    <TextInput
                      placeholder="e.g., OD (Once Daily), 1-0-1"
                      value={med.dosage || ""}
                      onChange={(e) =>
                        onUpdateMedicine(index, "dosage", e.currentTarget.value)
                      }
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-black">
                      Instruction
                    </label>
                    <Select
                      placeholder="Select instruction"
                      data={[
                        "After food",
                        "Before food",
                        "Before bedtime",
                        "As needed",
                      ]}
                      value={med.instruction || null}
                      onChange={(val) =>
                        onUpdateMedicine(index, "instruction", val || "")
                      }
                      className="mt-1"
                    />
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
