import { Button, Checkbox, Loader, Modal } from "@mantine/core";
import type { LabItem } from "../../../../APis/Types";

interface InvestigationModalProps {
  opened: boolean;
  onClose: () => void;
  investigationsLoading: boolean;
  investigationsList: LabItem[];
  selectedInvestigations: string[];
  onToggleSelect: (uid: string) => void;
  onConfirm: () => void;
}

export default function InvestigationModal({
  opened,
  onClose,
  investigationsLoading,
  investigationsList,
  selectedInvestigations,
  onToggleSelect,
  onConfirm,
}: InvestigationModalProps) {
  return (
    <Modal
      opened={opened}
      onClose={onClose}
      centered
      size="lg"
      overlayProps={{ blur: 2 }}
      title="Add Investigation / Lab"
    >
      <div className="relative overflow-y-auto" style={{ maxHeight: "70vh" }}>
        {investigationsLoading && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-white/60">
            <Loader size="lg" />
          </div>
        )}
        <div className="flex flex-col gap-3">
          {investigationsList.length === 0 && !investigationsLoading ? (
            <div className="text-gray-500 text-center py-4">
              No investigations available
            </div>
          ) : (
            investigationsList.map((investigation) => (
              <div
                key={investigation.uid}
                className="p-3 rounded-lg border border-[#EDEBEB] hover:bg-[#F9F9F9] cursor-pointer"
                onClick={() => onToggleSelect(investigation.uid)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <label className="text-sm font-medium text-black">
                      {investigation.name}
                    </label>
                  </div>
                  <Checkbox
                    checked={selectedInvestigations.includes(investigation.uid)}
                    onChange={() => onToggleSelect(investigation.uid)}
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
              </div>
            ))
          )}
        </div>
        <div className="flex justify-end gap-2 mt-4">
          <Button variant="default" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={onConfirm}>Confirm Investigations</Button>
        </div>
      </div>
    </Modal>
  );
}
