import React from "react";
import { Modal, TextInput, Button } from "@mantine/core";

interface AddSpecialityModalProps {
  isOpen: boolean;
  newSpeciality: string;
  onClose: () => void;
  onChange: (value: string) => void;
  onAdd: () => void;
}

const AddSpecialityModal: React.FC<AddSpecialityModalProps> = ({
  isOpen,
  newSpeciality,
  onClose,
  onChange,
  onAdd,
}) => {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      onAdd();
    }
  };

  return (
    <Modal
      opened={isOpen}
      onClose={onClose}
      title="Add New Speciality"
      centered
    >
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-900 mb-2">
          Speciality Name
        </label>
        <TextInput
          placeholder="Enter speciality name"
          value={newSpeciality}
          onChange={(e) => onChange(e.currentTarget.value)}
          onKeyDown={handleKeyDown}
          classNames={{
            input:
              "text-sm px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500",
          }}
        />
      </div>
      <div className="flex gap-2 justify-end">
        <Button variant="default" onClick={onClose}>
          Cancel
        </Button>
        <Button
          variant="filled"
          color="blue"
          onClick={onAdd}
          disabled={!newSpeciality.trim()}
        >
          Add Speciality
        </Button>
      </div>
    </Modal>
  );
};

export default AddSpecialityModal;
