import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button, TextInput, Loader } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import apis from "../../../APis/Api";
import useAuthStore from "../../../GlobalStore/store";
import type { RadiologyTestPanel } from "../../../APis/Types";
import { IconPencil, IconEye, IconTrash } from "@tabler/icons-react";

// Sortable Row Component
const SortableRow: React.FC<{
  row: RadiologyTestPanel;
  index: number;
  onEdit: (row: RadiologyTestPanel) => void;
  onView: (panelId: string) => void;
  onDelete: (row: RadiologyTestPanel) => void;
}> = ({ row, index, onEdit, onView, onDelete }) => {
  return (
    <tr className="hover:bg-gray-50">
      <td className="border-b border-gray-200 px-4 py-3">
        <span className="text-sm text-gray-600">{index}.</span>
      </td>
      <td className="border-b border-gray-200 px-4 py-3">
        <div className="font-medium text-gray-900">{row.name}</div>
      </td>
      <td className="border-b border-gray-200 px-4 py-3">
        <div className="text-sm text-gray-600">{row.description}</div>
      </td>
      <td className="border-b border-gray-200 px-4 py-3">
        <div className="text-sm text-gray-600">{row.price}</div>
      </td>
      <td className="border-b border-gray-200 px-4 py-3">
        <span
          className={`text-xs px-2 py-1 rounded-full ${
            row.status === "active"
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-700"
          }`}
        >
          {row.status}
        </span>
      </td>
      <td className="border-b border-gray-200 px-4 py-3">
        <div className="text-sm text-gray-600">
          {row.tests.slice(0, 3).join(", ")}
          {row.tests.length > 3 && ` ... (${row.tests.length} tests)`}
        </div>
      </td>
      <td className="border-b border-gray-200 px-4 py-3">
        <div className="flex items-center gap-2">
          <button
            className="text-blue-600 text-sm hover:text-blue-800 transition-colors"
            onClick={() => onEdit(row)}
          >
            <IconPencil size={16} />
          </button>
          <button
            className="text-green-600 text-sm hover:text-green-800 transition-colors"
            onClick={() => onView(row.id)}
          >
            <IconEye size={16} />
          </button>
          <button
            className="text-red-600 text-sm hover:text-red-800 transition-colors"
            onClick={() => onDelete(row)}
          >
            <IconTrash size={16} />
          </button>
        </div>
      </td>
    </tr>
  );
};

import DeleteConfirm from "../../TestPackages/Components/DeleteConfirm";

const OtherTestPanelList: React.FC = () => {
  const { department } = useParams();
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [pageSize] = useState(5);
  const [query, setQuery] = useState("");
  const [panels, setPanels] = useState<RadiologyTestPanel[]>([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [deletingRow, setDeletingRow] = useState<RadiologyTestPanel | null>(
    null
  );
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [loadingPanels, setLoadingPanels] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const rows = panels;
  const total = totalRecords;

  const organizationDetails = useAuthStore((s) => s.organizationDetails);

  // Function to fetch panels
  const fetchPanels = async () => {
    setLoadingPanels(true);
    try {
      const resp = await apis.GetOtherTestPanels(
        department,
        organizationDetails?.organization_id ?? "",
        organizationDetails?.center_id ?? "",
        page,
        pageSize,
        query
      );

      if (resp?.success && resp?.data?.panels) {
        const mapped: RadiologyTestPanel[] = resp.data.panels.map((p) => ({
          id: p.panel_id,
          uid: p.panel_id,
          order: 0,
          name: p.name,
          description: p.description,
          price: p.price,
          status: p.status,
          data: p,
          tests: p.tests?.list?.map((t) => t.test_name) || [],
        }));

        setPanels(mapped);

        const totalRec = resp.data.pagination?.totalRecords ?? 0;
        setTotalRecords(totalRec);

        const pagesCount = Math.max(1, Math.ceil(totalRec / pageSize));
        if (page > pagesCount) setPage(pagesCount);
      } else {
        setPanels([]);
        setTotalRecords(0);
      }
    } catch (err) {
      console.error("GetOtherTestPanels error:", err);
      setPanels([]);
      setTotalRecords(0);
      notifications.show({
        title: "Error",
        message: "Failed to load test panels",
        color: "red",
      });
    } finally {
      setLoadingPanels(false);
    }
  };

  // Load panels from API
  useEffect(() => {
    let mounted = true;
    const timer = setTimeout(() => {
      if (mounted) {
        fetchPanels();
      }
    }, 300);

    return () => {
      mounted = false;
      clearTimeout(timer);
    };
  }, [
    organizationDetails?.organization_id,
    organizationDetails?.center_id,
    query,
    page,
    pageSize,
  ]);

  const handleDeleteConfirm = async (panel_id: string) => {
    setDeleting(true);
    try {
      await apis.DeleteOtherTestPanel(
        department,
        organizationDetails?.organization_id ?? "",
        organizationDetails?.center_id ?? "",
        panel_id
      );
      // Refetch the panels after successful deletion
      await fetchPanels();
      setDeletingRow(null);
      setDeleteModalOpen(false);
      notifications.show({
        title: "Deleted",
        message: "Panel removed",
        color: "red",
      });
    } catch (err) {
      console.error(err);
      // Still refetch on error to ensure consistency
      await fetchPanels();
      setDeletingRow(null);
      setDeleteModalOpen(false);
      notifications.show({
        title: "Deleted (local)",
        message: "Panel removed locally",
        color: "yellow",
      });
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 ring-1 ring-gray-100">
      <div className="flex items-center justify-between mb-4">
        <div className="flex gap-4 items-center flex-1">
          <h2 className="text-lg font-semibold text-gray-800">
            Radiology Test Panels
          </h2>
          <div className="w-64">
            <TextInput
              placeholder="Search in page"
              value={query}
              onChange={(e) => setQuery(e.currentTarget.value)}
              rightSection={loadingPanels ? <Loader size="xs" /> : null}
              rightSectionWidth={30}
            />
          </div>
        </div>
        <Button
          onClick={() => {
            navigate("/radiology/test-panels/edit", {
              state: { row: null },
            });
          }}
          variant="filled"
          color="blue"
          disabled={loadingPanels}
        >
          + Add new
        </Button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50">
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider border-b border-gray-200">
                S. No.
              </th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider border-b border-gray-200">
                Name
              </th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider border-b border-gray-200">
                Description
              </th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider border-b border-gray-200">
                Price
              </th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider border-b border-gray-200">
                Status
              </th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider border-b border-gray-200">
                Tests
              </th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider border-b border-gray-200">
                Action
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <SortableRow
                key={row.id}
                row={row}
                index={index + 1}
                onEdit={(r) =>
                  navigate("/radiology/test-panels/edit", {
                    state: { row: r },
                  })
                }
                onView={(panelId) =>
                  navigate(`/radiology/test-panels/${panelId}`)
                }
                onDelete={(row) => {
                  setDeletingRow(row);
                  setDeleteModalOpen(true);
                }}
              />
            ))}
          </tbody>
        </table>
      </div>

      <DeleteConfirm
        opened={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={() => deletingRow && handleDeleteConfirm(deletingRow.id)}
        itemName={deletingRow?.name}
        loading={deleting}
      />

      <div className="flex items-center justify-between text-sm text-gray-500 mt-4">
        <div>
          {total === 0 ? (
            "No entries"
          ) : (
            <>
              Showing {(page - 1) * pageSize + 1} to{" "}
              {Math.min(page * pageSize, total)} of {total} entries
            </>
          )}
        </div>
        <div className="inline-flex items-center gap-2">
          <button
            className="px-3 py-1 border rounded text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
          >
            Previous
          </button>
          <div className="inline-flex items-center gap-1">
            {Array.from(
              { length: Math.max(1, Math.ceil(total / pageSize)) },
              (_, i) => i + 1
            ).map((n) => (
              <button
                key={n}
                onClick={() => setPage(n)}
                className={`w-8 h-8 rounded transition-colors ${
                  page === n
                    ? "bg-blue-600 text-white"
                    : "border text-gray-600 hover:bg-gray-50"
                }`}
              >
                {n}
              </button>
            ))}
          </div>

          <button
            className="px-3 py-1 border rounded text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
            disabled={page >= Math.ceil(Math.max(1, total) / pageSize)}
            onClick={() => setPage(page + 1)}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default OtherTestPanelList;
