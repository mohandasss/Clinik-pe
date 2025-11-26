import React, { useState, useEffect } from "react";
import { DataTable, type DataTableColumn } from "mantine-datatable";
import { Button, Popover, TextInput } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { IconDots, IconPencil } from "@tabler/icons-react";
import { useNavigate } from "react-router-dom";

import apis from "../../../APis/Api";
import useAuthStore from "../../../GlobalStore/store";
import type { OtherTestPackageRow } from "../../../APis/Types";

import EditOtherPackageDrawer from "./Components/EditOtherPackageDrawer";
import DeleteConfirm from "../../TestPackages/Components/DeleteConfirm";

const OtherTestPackage: React.FC = () => {
  const { organizationDetails } = useAuthStore();
  const navigate = useNavigate();

  const [page, setPage] = useState(1);
  const [pageSize] = useState(5);
  const [query, setQuery] = useState("");

  const [packages, setPackages] = useState<OtherTestPackageRow[]>([]);
  const [loading] = useState(false);

  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [editingRow, setEditingRow] = useState<OtherTestPackageRow | null>(
    null
  );
  const [editingOpen, setEditingOpen] = useState(false);

  const [deletingRow, setDeletingRow] = useState<OtherTestPackageRow | null>(
    null
  );
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  // ---------------------------------------
  // Local state management (no API calls)
  // ---------------------------------------
  const rows = packages.filter((pkg) =>
    pkg.name.toLowerCase().includes(query.toLowerCase())
  );
  const total = rows.length;

  // ---------------------------------------
  // Save (create/update)
  // ---------------------------------------
  const handleSavePackage = async (
    row: OtherTestPackageRow,
    removeTests?: string[],
    removePanels?: string[]
  ) => {
    setSaving(true);

    try {
      const orgId = organizationDetails?.organization_id;
      const centerId = organizationDetails?.center_id;

      if (!orgId || !centerId) {
        throw new Error("Organization or center not found");
      }

      // Format payload to match exact API structure
      const payload: any = {
        name: row.name,
        price: Number(row.price) || 0,
        status: row.status,
        tests: Array.isArray(row.tests)
          ? row.tests.map((t: any) => ({
              test_id: typeof t === "string" ? t : t.uid || t.test_id,
            }))
          : [],
        panels: Array.isArray(row.panels)
          ? row.panels.map((p: any) => ({
              panel_id: typeof p === "string" ? p : p.uid || p.panel_id,
            }))
          : [],
      };

      // Add optional fields
      payload.description = row.description?.trim() || "";
      payload.data = row.data?.trim() || "";

      const id = row.uid || row.id;
      const isUpdate = packages.some((p) => p.uid === id);

      if (isUpdate) {
        // Add remove arrays for update
        payload.remove_tests = removeTests
          ? removeTests.map((test_id) => ({ test_id }))
          : [];
        payload.remove_panels = removePanels
          ? removePanels.map((panel_id) => ({ panel_id }))
          : [];

        // Update existing package
        await apis.UpdateOtherTestPackage(
          "radiology",
          orgId,
          centerId,
          id!,
          payload
        );

        notifications.show({
          title: "Updated",
          message: "Package updated successfully.",
          color: "green",
        });
      } else {
        // Create new package (no remove arrays needed)
        await apis.AddOtherTestPackage("radiology", payload, orgId, centerId);

        notifications.show({
          title: "Saved",
          message: "Package added successfully.",
          color: "green",
        });
      }

      // Refresh list after creation/update
      await fetchPackages();
    } catch (err: any) {
      notifications.show({
        title: "Error",
        message: err?.message || "Failed to save package.",
        color: "red",
      });
    } finally {
      setSaving(false);
    }
  };

  // ---------------------------------------
  // Delete
  // ---------------------------------------
  const handleDeleteConfirm = async (id: string) => {
    setDeleting(true);

    try {
      const orgId = organizationDetails?.organization_id;
      const centerId = organizationDetails?.center_id;

      if (!orgId || !centerId) {
        throw new Error("Organization or center not found");
      }

      await apis.DeleteOtherTestPackage("radiology", orgId, centerId, id);

      notifications.show({
        title: "Deleted",
        message: "Package removed successfully.",
        color: "green",
      });

      // Refresh list after deletion
      await fetchPackages();
    } catch (err: any) {
      notifications.show({
        title: "Error",
        message: err?.message || "Failed to delete package.",
        color: "red",
      });
    } finally {
      setDeletingRow(null);
      setDeleteModalOpen(false);
      setDeleting(false);
    }
  };

  // ---------------------------------------
  // Initial load - Fetch from API
  // ---------------------------------------
  const fetchPackages = React.useCallback(async () => {
    try {
      const orgId = organizationDetails?.organization_id;
      const centerId = organizationDetails?.center_id;

      if (!orgId || !centerId) return;

      const response = await apis.GetOtherTestPackage(
        "radiology",
        page,
        pageSize,
        orgId,
        centerId
      );

      if (response?.data?.packages && Array.isArray(response.data.packages)) {
        // Map API response to OtherTestPackageRow format
        const mappedPackages: OtherTestPackageRow[] =
          response.data.packages.map((pkg: any) => ({
            uid: pkg.uid,
            name: pkg.name,
            description: pkg.description || "",
            price: Number(pkg.price) || 0,
            status: pkg.status || "active",
            data: pkg.data || "",
            tests: pkg.tests || [],
            panels: pkg.panels || [],
          }));
        setPackages(mappedPackages);
      }
    } catch (err: any) {
      notifications.show({
        title: "Error",
        message: err?.message || "Failed to load packages",
        color: "red",
      });
    }
  }, [organizationDetails, page, pageSize]);

  useEffect(() => {
    fetchPackages();
  }, [fetchPackages]);

  // Adjust page if out of range
  useEffect(() => {
    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    if (page > totalPages) setPage(totalPages);
  }, [total, page, pageSize]);

  // ---------------------------------------
  // Table Columns
  // ---------------------------------------
  const columns: DataTableColumn<OtherTestPackageRow>[] = [
    {
      accessor: "sno",
      title: "S.NO.",
      width: 80,
      render: (_row, index) => (
        <div>{(page - 1) * pageSize + (index + 1)}.</div>
      ),
    },
    {
      accessor: "name",
      title: "Name",
      render: (r) => <div className="font-medium text-gray-900">{r.name}</div>,
    },
    {
      accessor: "description",
      title: "Description",
      render: (r) => (
        <div className="text-sm text-gray-600 max-w-xs truncate">
          {r.description || "—"}
        </div>
      ),
    },
    {
      accessor: "price",
      title: "Price",
      width: 90,
      render: (r) => <div>{r.price}</div>,
    },
    {
      accessor: "status",
      title: "Status",
      width: 100,
      render: (r) => <div className="text-sm capitalize">{r.status}</div>,
    },
    {
      accessor: "tests",
      title: "Tests",
      render: (r) => (
        <div className="text-sm text-gray-600 max-w-xs truncate">
          {Array.isArray(r.tests) && r.tests.length > 0
            ? r.tests.map((t: any) => t.test_name || t.name).join(", ")
            : "—"}
        </div>
      ),
    },
    {
      accessor: "panels",
      title: "Panels",
      render: (r) => (
        <div className="text-sm text-gray-600 max-w-xs truncate">
          {Array.isArray(r.panels) && r.panels.length > 0
            ? r.panels.map((p: any) => p.panel_name || p.name).join(", ")
            : "—"}
        </div>
      ),
    },
    {
      accessor: "action",
      title: "ACTION",
      width: 100,
      render: (r) => (
        <div
          className="flex items-center gap-2"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            className="text-blue-600"
            onClick={(e) => {
              e.stopPropagation();
              setEditingRow(r);
              setEditingOpen(true);
            }}
          >
            <IconPencil size={16} />
          </button>

          <Popover position="bottom" withArrow shadow="md">
            <Popover.Target>
              <button
                className="p-1 text-gray-400 hover:text-gray-600"
                onClick={(e) => e.stopPropagation()}
              >
                <IconDots className="rotate-90" />
              </button>
            </Popover.Target>

            <Popover.Dropdown>
              <Button
                variant="subtle"
                color="red"
                size="xs"
                onClick={(e) => {
                  e.stopPropagation();
                  setDeletingRow(r);
                  setDeleteModalOpen(true);
                }}
              >
                Remove
              </Button>
            </Popover.Dropdown>
          </Popover>
        </div>
      ),
    },
  ];

  // Paginate rows
  const paginatedRows = rows.slice((page - 1) * pageSize, page * pageSize);

  // ---------------------------------------
  // Render
  // ---------------------------------------
  return (
    <div className="bg-white rounded-lg shadow-sm p-6 ring-1 ring-gray-100">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-800">
          Radiology Test Packages
        </h2>

        <div className="flex items-center gap-3">
          <TextInput
            placeholder="Search in page"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setPage(1);
            }}
            className="w-64"
          />

          <Button
            variant="filled"
            color="blue"
            onClick={() => {
              setEditingRow(null);
              setEditingOpen(true);
            }}
            disabled={loading}
          >
            + Add New
          </Button>
        </div>
      </div>

      {/* Table */}
      <DataTable
        records={paginatedRows}
        columns={columns}
        highlightOnHover
        className="text-sm"
        idAccessor="uid"
        onRowClick={(row) => {
          if (row.uid) {
            navigate(`/radiology/test-packages/${row.uid}`);
          }
        }}
        style={{ cursor: "pointer" }}
      />

      {/* Edit Drawer */}
      <EditOtherPackageDrawer
        opened={editingOpen}
        onClose={() => {
          setEditingOpen(false);
          setEditingRow(null);
        }}
        row={editingRow}
        onSave={handleSavePackage}
        loading={saving}
      />

      {/* Delete Modal */}
      <DeleteConfirm
        opened={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={() =>
          deletingRow && handleDeleteConfirm(deletingRow.uid || "")
        }
        itemName={deletingRow?.name}
        loading={deleting}
      />

      {/* Pagination */}
      <div className="flex items-center justify-between text-sm text-gray-500 mt-4">
        <div>
          Showing {total === 0 ? 0 : (page - 1) * pageSize + 1} to{" "}
          {Math.min(page * pageSize, total)} of {total} entries
        </div>

        <div className="flex items-center gap-3">
          <button
            className="px-3 py-1 border rounded text-gray-600"
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
          >
            Previous
          </button>

          <div className="flex gap-1">
            {Array.from(
              { length: Math.ceil(total / pageSize) || 1 },
              (_, i) => i + 1
            ).map((n) => (
              <button
                key={n}
                onClick={() => setPage(n)}
                className={`w-8 h-8 rounded ${
                  page === n ? "bg-blue-600 text-white" : "border text-gray-600"
                }`}
              >
                {n}
              </button>
            ))}
          </div>

          <button
            className="px-3 py-1 border rounded text-gray-600"
            disabled={page >= Math.ceil(total / pageSize)}
            onClick={() => setPage(page + 1)}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default OtherTestPackage;
