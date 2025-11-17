import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Button, TextInput } from "@mantine/core";
import { IconX } from "@tabler/icons-react";

interface AddUnitModalProps {
  opened: boolean;
  onClose: () => void;
  onSave: (name: string) => void;
  loading: boolean;
}

const AddUnitModal: React.FC<AddUnitModalProps> = ({
  opened,
  onClose,
  onSave,
  loading,
}) => {
  const [name, setName] = useState("");

  useEffect(() => {
    if (!opened) {
      setName("");
    }
  }, [opened]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onSave(name.trim());
    }
  };

  if (!opened) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800">Add New Unit</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Close modal"
          >
            <IconX size={20} />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit}>
          <div className="px-6 py-4">
            <TextInput
              label="Unit Name"
              placeholder="Enter unit name (e.g., mg/dL)"
              value={name}
              onChange={(e) => setName(e.currentTarget.value)}
              required
              autoFocus
            />
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50">
            <Button variant="subtle" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="filled"
              color="blue"
              loading={loading}
            >
              Save
            </Button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};

export default AddUnitModal;
