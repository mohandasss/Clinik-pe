import {
  Button,
  Checkbox,
  Loader,
  Modal,
  ScrollArea,
  Select,
  Stack,
  TextInput,
} from "@mantine/core";
import { IconSearch } from "@tabler/icons-react";
import type { Medicine } from "../../../../APis/Types";

interface MedicineModalProps {
  opened: boolean;
  onClose: () => void;
  searchQuery: string;
  onSearchChange: (value: string) => void;
  searchResults: Medicine[];
  searchLoading: boolean;
  selectedFromSearch: string[];
  expandedSearchItem: string | null;
  searchItemDetails: Record<
    string,
    {
      duration: string;
      dosage: string;
      instruction: string;
      saltQuantity: string;
    }
  >;
  onToggleSelect: (name: string) => void;
  onUpdateDetail: (medicineName: string, key: string, value: string) => void;
  onClear: () => void;
  onConfirm: () => void;
}

export default function MedicineModal({
  opened,
  onClose,
  searchQuery,
  onSearchChange,
  searchResults,
  searchLoading,
  selectedFromSearch,
  expandedSearchItem,
  searchItemDetails,
  onToggleSelect,
  onUpdateDetail,
  onClear,
  onConfirm,
}: MedicineModalProps) {
  return (
    <Modal
      opened={opened}
      onClose={onClose}
      centered
      size="lg"
      overlayProps={{ blur: 2 }}
      closeOnEscape
      closeOnClickOutside
      title="Add Medicine"
    >
      <div className="relative">
        {searchLoading && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-white/60">
            <Loader size="lg" />
          </div>
        )}
        <div className="mb-3 flex items-center gap-2">
          <TextInput
            placeholder="Search for medicines"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.currentTarget.value)}
            leftSection={<IconSearch size={16} />}
            className="flex-1"
          />
          <Button variant="default" onClick={onClear}>
            Clear
          </Button>
        </div>

        <ScrollArea style={{ height: 400 }}>
          <Stack>
            {searchResults.length === 0 && !searchLoading ? (
              <div className="text-gray-500">No medicines found</div>
            ) : (
              searchResults.map((m) => (
                <div
                  key={m.name}
                  className="border border-[#EDEBEB] rounded-lg overflow-hidden"
                >
                  <div className="flex items-center justify-between p-3 bg-[#F9F9F9]">
                    <div>
                      <div className="font-medium">{m.name}</div>
                      <small className="text-gray-500">
                        {m.saltQuantity ?? ""} — {m.type ?? ""}
                      </small>
                    </div>
                    <Checkbox
                      checked={selectedFromSearch.includes(m.name)}
                      onChange={() => onToggleSelect(m.name)}
                    />
                  </div>

                  {expandedSearchItem === m.name &&
                    selectedFromSearch.includes(m.name) && (
                      <div className="p-3 bg-white border-t border-[#EDEBEB] flex gap-3">
                        <div>
                          <label className="text-sm font-medium text-black">
                            Salt Quantity
                          </label>
                          <TextInput
                            placeholder={m.saltQuantity || "e.g., 500mg"}
                            value={
                              searchItemDetails[m.name]?.saltQuantity || ""
                            }
                            onChange={(e) =>
                              onUpdateDetail(
                                m.name,
                                "saltQuantity",
                                e.currentTarget.value
                              )
                            }
                            className="mt-1"
                            size="sm"
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium text-black">
                            Duration
                          </label>
                          <TextInput
                            placeholder="e.g., 3 days"
                            value={searchItemDetails[m.name]?.duration || ""}
                            onChange={(e) =>
                              onUpdateDetail(
                                m.name,
                                "duration",
                                e.currentTarget.value
                              )
                            }
                            className="mt-1"
                            size="sm"
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium text-black">
                            Dosage
                          </label>
                          <TextInput
                            placeholder="e.g., OD, 1-0-1"
                            value={searchItemDetails[m.name]?.dosage || ""}
                            onChange={(e) =>
                              onUpdateDetail(
                                m.name,
                                "dosage",
                                e.currentTarget.value
                              )
                            }
                            className="mt-1"
                            size="sm"
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
                            value={
                              searchItemDetails[m.name]?.instruction || null
                            }
                            onChange={(val) =>
                              onUpdateDetail(m.name, "instruction", val || "")
                            }
                            className="mt-1"
                            size="sm"
                          />
                        </div>
                      </div>
                    )}
                </div>
              ))
            )}
          </Stack>
        </ScrollArea>
        <div className="flex justify-end gap-2 mt-3">
          <Button variant="default" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={onConfirm}
            disabled={selectedFromSearch.length === 0}
          >
            Add Selected
          </Button>
        </div>
      </div>
    </Modal>
  );
}
