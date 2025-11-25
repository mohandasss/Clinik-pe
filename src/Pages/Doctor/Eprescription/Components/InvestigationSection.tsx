import { Button, Divider, Textarea, TextInput } from "@mantine/core";
import { IconPlus, IconX } from "@tabler/icons-react";
import type { LabItem } from "../../../../APis/Types";

interface InvestigationSectionProps {
  selectedInvestigations: string[];
  investigationsList: LabItem[];
  onAddClick: () => void;
  onRemoveInvestigation: (uid: string) => void;
  showAdditionalInfoInput: boolean;
  additionalInfoText: string;
  notes: string;
  onToggleAdditionalInfo: () => void;
  onAdditionalInfoChange: (value: string) => void;
  onNotesChange: (value: string) => void;
}

export default function InvestigationSection({
  selectedInvestigations,
  investigationsList,
  onAddClick,
  onRemoveInvestigation,
  showAdditionalInfoInput,
  additionalInfoText,
  notes,
  onToggleAdditionalInfo,
  onAdditionalInfoChange,
  onNotesChange,
}: InvestigationSectionProps) {
  return (
    <div className="bg-white p-4 rounded-lg border border-[#EDEBEB] flex flex-col">
      <div className="flex items-center justify-between">
        <div className="text-black font-sm font-medium">
          Investigation / Lab
        </div>
        <div>
          <Button
            size="md"
            leftSection={<IconPlus size={14} />}
            className="!bg-[#E2EBFF] !text-[#2563EB] !p-3 !font-normal"
            onClick={onAddClick}
          >
            Add
          </Button>
        </div>
      </div>
      {selectedInvestigations.length > 0 ? (
        <div className="flex flex-wrap gap-2 my-3">
          {investigationsList
            .filter((inv) => selectedInvestigations.includes(inv.uid))
            .map((inv) => (
              <div
                key={inv.uid}
                className="px-3 py-2 rounded-lg border border-[#EEEEEE] bg-[#F9F9F9] flex items-center gap-2"
              >
                <span className="text-sm font-medium text-black">
                  {inv.name}
                </span>
                <button
                  onClick={() => onRemoveInvestigation(inv.uid)}
                  className="ml-1"
                >
                  <IconX
                    size={14}
                    className="text-gray-500 hover:text-gray-700"
                  />
                </button>
              </div>
            ))}
        </div>
      ) : (
        <div className="rounded-lg p-4 bg-[#F9F9F9] border border-[#EEEEEE] my-3">
          No investigations added
        </div>
      )}
      <Divider my="md" />
      <div className="flex items-center justify-between">
        <div className="text-black font-sm font-medium">Additional Info</div>
        <div>
          <Button
            size="md"
            leftSection={<IconPlus size={14} />}
            className="!bg-[#E2EBFF] !text-[#2563EB] !p-3 !font-normal"
            onClick={onToggleAdditionalInfo}
          >
            {showAdditionalInfoInput ? "Close" : "Add"}
          </Button>
        </div>
      </div>
      <Divider my="md" />
      {showAdditionalInfoInput && (
        <div className="mb-3">
          <TextInput
            value={additionalInfoText}
            onChange={(e) => onAdditionalInfoChange(e.currentTarget.value)}
            placeholder="Additional info"
            className="w-full"
          />
        </div>
      )}
      <div>
        <div className="text-black text-sm font-medium mb-1">
          Advice / Notes
        </div>
        <Textarea
          minRows={4}
          autosize
          className="w-full"
          placeholder="e.g., Drink plenty of fluids, Take complete rest..."
          value={notes}
          onChange={(e) => onNotesChange(e.currentTarget.value)}
        />
      </div>
    </div>
  );
}
