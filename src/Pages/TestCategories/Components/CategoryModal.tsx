import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Button, TextInput } from "@mantine/core";

interface Props {
  opened: boolean;
  onClose: () => void;
  onSave: (name: string) => Promise<void> | void;
  initialName?: string;
  saving?: boolean;
  title?: string;
}

const CategoryModal: React.FC<Props> = ({
  opened,
  onClose,
  onSave,
  initialName = "",
  saving,
  title = "Category",
}) => {
  const [name, setName] = useState(initialName);

  useEffect(() => {
    setName(initialName);
  }, [initialName, opened]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (opened) document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [opened, onClose]);

  // autoFocus handled by Mantine TextInput 

  if (!opened) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black opacity-30" onClick={onClose} />
      <div className="relative z-10 bg-white rounded shadow-lg w-full max-w-md p-6">
        <h3 className="text-lg font-semibold mb-3">{title}</h3>
        <div className="space-y-3">
          <TextInput
            label="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoFocus
          />
        </div>
        <div className="flex justify-end gap-3 mt-5">
          <Button variant="default" onClick={onClose}>
            Cancel
          </Button>
          <Button
            color="blue"
            onClick={() => onSave(name)}
            loading={saving}
            disabled={!name.trim()}
          >
            Save
          </Button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default CategoryModal;
