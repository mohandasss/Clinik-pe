import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Button, TextInput, MultiSelect, Switch } from "@mantine/core";
import { IconX } from "@tabler/icons-react";
import type { Role } from "../../../APis/Types";
import AccessManagementGrid, { type CellData } from "./AccessManagementGrid";

interface RoleModalProps {
  opened: boolean;
  onClose: () => void;
  onSave: (
    payload: {
      name: string;
      permissions: string[];
      status: string;
      access?: CellData[];
    },
    uid?: string
  ) => void;
  loading?: boolean;
  roleToEdit?: Role | null;
}

const RoleModal: React.FC<RoleModalProps> = ({
  opened,
  onClose,
  onSave,
  loading = false,
  roleToEdit,
}) => {
  const [name, setName] = useState("");
  const [permissions, setPermissions] = useState<string[]>([]);
  const [active, setActive] = useState(true);
  const [accessGrid, setAccessGrid] = useState<CellData[]>([
    { read: "none", write: "none" },
    { read: "none", write: "none" },
    { read: "none", write: "none" },
    { read: "none", write: "none" },
    { read: "none", write: "none" },
    { read: "none", write: "none" },
    { read: "none", write: "none" },
    { read: "none", write: "none" },
  ]);

  useEffect(() => {
    if (!opened) {
      setName("");
      setPermissions([]);
      setActive(true);
      setAccessGrid([
        { read: "none", write: "none" },
        { read: "none", write: "none" },
        { read: "none", write: "none" },
        { read: "none", write: "none" },
        { read: "none", write: "none" },
        { read: "none", write: "none" },
        { read: "none", write: "none" },
        { read: "none", write: "none" },
      ]);
    }
  }, [opened]);

  useEffect(() => {
    if (roleToEdit) {
      setName(roleToEdit.name);
      setPermissions(roleToEdit.permissions || []);
      setActive(roleToEdit.status === "active");
      // If roleToEdit contains access structure, map to grid; otherwise keep defaults
      // Keep a defensive check: roleToEdit could have permissions only (strings), so we don't auto-map those
      if ((roleToEdit as any).access) {
        setAccessGrid((roleToEdit as any).access);
      }
    }
  }, [roleToEdit]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onSave(
      {
        name: name.trim(),
        permissions,
        status: active ? "active" : "inactive",
        access: accessGrid,
      },
      roleToEdit?.uid
    );
  };

  if (!opened) return null;

  // Minimal permissions options. These could be fetched from API later.
  const perms = [
    { value: "organization.read", label: "Organization - Read" },
    { value: "organization.write", label: "Organization - Write" },
    { value: "provider.read", label: "Provider - Read" },
    { value: "provider.write", label: "Provider - Write" },
    { value: "appointments.read", label: "Appointments - Read" },
    { value: "appointments.write", label: "Appointments - Write" },
  ];

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-xl w-full max-w-5xl mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800">
            {roleToEdit ? "Edit Role" : "Add New Role"}
          </h3>
          <button
            onClick={onClose}
            type="button"
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Close modal"
          >
            <IconX size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="px-6 py-4 max-h-[70vh] overflow-y-auto">
            <div className="flex gap-4 items-center justify-between ">
              <TextInput
                className="flex-1"
                label="Role name"
                placeholder="Enter role name"
                value={name}
                onChange={(e) => setName(e.currentTarget.value)}
                required
                autoFocus
              />

              <div className="mt-6">
                <Switch
                  label="Active"
                  checked={active}
                  onChange={(e) => setActive(e.currentTarget.checked)}
                />
              </div>
            </div>

            

            <div className="mt-6 pt-4 border-t border-gray-200">
              <h4 className="text-sm font-semibold text-gray-700 mb-4">
                Access Management
              </h4>
              <AccessManagementGrid
                compact={true}
                value={accessGrid}
                onChange={setAccessGrid}
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50">
            <Button
              variant="subtle"
              onClick={onClose}
              disabled={loading}
              type="button"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              loading={loading}
              variant="filled"
              color="blue"
            >
              {roleToEdit ? "Update" : "Save"}
            </Button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};

export default RoleModal;
