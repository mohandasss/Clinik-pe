import React, { useEffect, useState, useMemo, useCallback } from "react";
import { Button, TextInput } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import type { Role } from "../../APis/Types";
import type { CellData } from "./Components/AccessManagementGrid";
import RolesTable from "./Components/RolesTable";
import RoleModal from "./Components/RoleModal";
import DeleteConfirm from "../TestPackages/Components/DeleteConfirm";
import apis from "../../APis/Api";

const Roles: React.FC = () => {
  // Use mock data for now, real organization/center ids are not required

  const [roles, setRoles] = useState<Role[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [roleToEdit, setRoleToEdit] = useState<Role | null>(null);
  const [roleToDelete, setRoleToDelete] = useState<Role | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const loadRoles = useCallback(async () => {
    // Using mock data for now
    setLoading(true);
    try {
      const mockRoles: Role[] = [
        {
          uid: "role_admin",
          name: "Administrator",
          permissions: [
            "organization.read",
            "organization.write",
            "provider.read",
            "provider.write",
          ],
          status: "active",
        },
        {
          uid: "role_reception",
          name: "Reception",
          permissions: ["appointments.read", "appointments.write"],
          status: "active",
        },
        {
          uid: "role_doctor",
          name: "Doctor",
          permissions: ["appointments.read", "provider.read"],
          status: "inactive",
        },
      ];
      // Simulate network delay
      await new Promise((res) => setTimeout(res, 250));
      setRoles(mockRoles);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRoles();
  }, [loadRoles]);

  const filtered = useMemo(() => {
    if (!query) return roles;
    const q = query.toLowerCase();
    return roles.filter(
      (r) =>
        r.name.toLowerCase().includes(q) ||
        (r.permissions || []).join(", ").toLowerCase().includes(q)
    );
  }, [roles, query]);

  const total = filtered.length;
  const rows = filtered.slice((page - 1) * pageSize, page * pageSize);

  const handleSaveRole = async (payload: {
    name: string;
    permissions?: string[] | string;
    status?: string;
    access?: CellData[];
  }) => {
    // Operate locally with mock data for now
    setSaving(true);
    try {
      // Call the API to add/update role
      // Ensure all permissions are normalized to lower-case strings
      const normalizePermissionsString = (p?: string[] | string) => {
        if (!p) return "";
        if (typeof p === "string") {
          return p
            .split(";")
            .map((s) => s.trim().toLowerCase())
            .filter(Boolean)
            .join(";");
        }
        return (p || [])
          .map((s) => s.trim().toLowerCase())
          .filter(Boolean)
          .join(";");
      };

      const apiPayload = {
        name: payload.name,
        permissions: normalizePermissionsString(payload.permissions),
        status: payload.status,
      };
      console.log("API Payload:", apiPayload);
      const response = await apis.AddRole(apiPayload);

      if (response.success) {
        notifications.show({
          title: "Success",
          message: response.message || "Role created successfully",
          color: "green",
        });

        // Update local state with the new role
        const newRole: Role = {
          uid: `role_${Date.now()}`, // In real app, this would come from API response
          name: payload.name,
          permissions: (typeof payload.permissions === "string"
            ? payload.permissions.split(";")
            : payload.permissions || []
          ).map((s) => s.trim().toLowerCase()),
          status: payload.status || "active",
          access: payload.access || [],
        };
        setRoles((prev) => [newRole, ...prev]);

        setIsAddModalOpen(false);
        setRoleToEdit(null);
      } else {
        notifications.show({
          title: "Error",
          message: response.message || "Failed to create role",
          color: "red",
        });
      }
    } catch (error) {
      console.error("Failed to save role:", error);
      notifications.show({
        title: "Error",
        message: "Failed to save role",
        color: "red",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteRole = async () => {
    if (!roleToDelete) return;
    setDeleting(true);
    try {
      setRoles((prev) => prev.filter((r) => r.uid !== roleToDelete.uid));
      notifications.show({
        title: "Success",
        message: "Role deleted (local)",
        color: "blue",
      });
      setIsDeleteModalOpen(false);
      setRoleToDelete(null);
    } catch (error) {
      console.error("Failed to delete role locally:", error);
      notifications.show({
        title: "Error",
        message: "Failed to delete role",
        color: "red",
      });
    } finally {
      setDeleting(false);
    }
  };

  const handleEditClick = (role: Role) => {
    setRoleToEdit(role);
    setIsAddModalOpen(true);
  };

  const handleDeleteClick = (role: Role) => {
    setRoleToDelete(role);
    setIsDeleteModalOpen(true);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 ring-1 ring-gray-100">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex gap-4 items-center flex-1">
          <h2 className="text-lg font-semibold text-gray-800">Roles</h2>
          <div className="w-64">
            <TextInput
              placeholder="Search roles"
              value={query}
              onChange={(e) => {
                setQuery(e.currentTarget.value);
                setPage(1);
              }}
              aria-label="Search roles"
            />
          </div>
        </div>
        <Button
          onClick={() => {
            setRoleToEdit(null);
            setIsAddModalOpen(true);
          }}
          variant="filled"
          color="blue"
          disabled={loading}
        >
          + Add new
        </Button>
      </div>

      {/* Table */}
      <RolesTable
        records={rows}
        page={page}
        pageSize={pageSize}
        setPage={setPage}
        setPageSize={setPageSize}
        total={total}
        onEdit={handleEditClick}
        onDelete={handleDeleteClick}
      />

      {/* Add/Edit Modal */}
      <RoleModal
        opened={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setRoleToEdit(null);
        }}
        onSave={handleSaveRole}
        loading={saving}
        roleToEdit={roleToEdit}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirm
        opened={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setRoleToDelete(null);
        }}
        onConfirm={handleDeleteRole}
        itemName={roleToDelete?.name}
        loading={deleting}
      />
    </div>
  );
};

export default Roles;
