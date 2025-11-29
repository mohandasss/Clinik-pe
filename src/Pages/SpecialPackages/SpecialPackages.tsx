import React, { useState, useEffect, useCallback } from "react";
import { DataTable, type DataTableColumn } from "mantine-datatable";
import { Button, Popover, TextInput } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { IconDots, IconPencil } from "@tabler/icons-react";
import { useNavigate } from "react-router-dom";

import apis from "../../APis/Api";
import useAuthStore from "../../GlobalStore/store";
import type { OtherTestPackageRow } from "../../APis/Types";
import DeleteConfirm from "../TestPackages/Components/DeleteConfirm";

const SpecialPackages: React.FC = () => {
  const { organizationDetails } = useAuthStore();
  const navigate = useNavigate();

  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [query, setQuery] = useState("");

  const [packages, setPackages] = useState<OtherTestPackageRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [deletingRow, setDeletingRow] = useState<OtherTestPackageRow | null>(
    null
  );
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  // Filter packages by search query
  const rows = packages.filter((pkg) =>
    pkg.name.toLowerCase().includes(query.toLowerCase())
  );
  const total = rows.length;

  // Fetch packages from API
  const fetchPackages = useCallback(async () => {
    try {
      const orgId = organizationDetails?.organization_id;
      const centerId = organizationDetails?.center_id;

      if (!orgId || !centerId) return;

      setLoading(true);
      // Using "special" as the department for special packages
      const response = await apis.GetOtherTestPackage(
        "special",
        1,
        100,
        orgId,
        centerId
      );

      if (response?.data?.packages && Array.isArray(response.data.packages)) {
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
            // Display fields
            tags: pkg.tags,
            display_name: pkg.display_name,
            display_category_id: pkg.display_category_id,
            short_about: pkg.short_about,
            long_about: pkg.long_about,
            sample_type: pkg.sample_type,
            gender: pkg.gender,
            age_range: pkg.age_range,
            images: pkg.images,
            preparation: pkg.preparation,
            mrp: pkg.mrp,
            faq: pkg.faq,
            home_collection_possible: pkg.home_collection_possible,
            home_collection_fee: pkg.home_collection_fee,
            machine_based: pkg.machine_based,
          }));
        setPackages(mappedPackages);
      }
    } catch (err: any) {
      notifications.show({
        title: "Error",
        message: err?.message || "Failed to load special packages",
        color: "red",
      });
    } finally {
      setLoading(false);
    }
  }, [organizationDetails]);

  useEffect(() => {
    fetchPackages();
  }, [fetchPackages]);

  // Adjust page if out of range
  useEffect(() => {
    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    if (page > totalPages) setPage(totalPages);
  }, [total, page, pageSize]);

  // Handle delete
  const handleDeleteConfirm = async (id: string) => {
    setDeleting(true);

    try {
      const orgId = organizationDetails?.organization_id;
      const centerId = organizationDetails?.center_id;

      if (!orgId || !centerId) {
        throw new Error("Organization or center not found");
      }

      await apis.DeleteOtherTestPackage("special", orgId, centerId, id);

      notifications.show({
        title: "Deleted",
        message: "Special package removed successfully.",
        color: "green",
      });

      // Refresh list after deletion
      await fetchPackages();
    } catch (err: any) {
      notifications.show({
        title: "Error",
        message: err?.message || "Failed to delete special package.",
        color: "red",
      });
    } finally {
      setDeletingRow(null);
      setDeleteModalOpen(false);
      setDeleting(false);
    }
  };

  // Table columns
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
        <div
          className="text-sm text-gray-600 max-w-xs truncate"
          dangerouslySetInnerHTML={{ __html: r.description || "—" }}
        />
      ),
    },
    {
      accessor: "price",
      title: "Price",
      width: 90,
      render: (r) => <div>₹{r.price}</div>,
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
              navigate("/special-packages/edit", {
                state: { isEdit: true, packageData: r },
              });
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

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 ring-1 ring-gray-100">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-800">
          Special Packages
        </h2>

        <div className="flex items-center gap-3">
          <TextInput
            placeholder="Search packages..."
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
              navigate("/special-packages/add");
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
        fetching={loading}
        onRowClick={({ record }) => {
          if (record.uid) {
            navigate(`/special-packages/${record.uid}`);
          }
        }}
        style={{ cursor: "pointer" }}
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
            className="px-3 py-1 border rounded text-gray-600 disabled:opacity-50"
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
            className="px-3 py-1 border rounded text-gray-600 disabled:opacity-50"
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

export default SpecialPackages;
