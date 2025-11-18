import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button, TextInput, Loader } from "@mantine/core";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
} from "@dnd-kit/core";
import type { DragStartEvent, DragEndEvent } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { notifications } from "@mantine/notifications";
import apis from "../../APis/Api";
import useAuthStore from "../../GlobalStore/store";
import type { TestPanelRow, TestItem } from "../../APis/Types";
import { IconPencil, IconEye } from "@tabler/icons-react";
// Inline SVG for chevrons up/down (replaces IconGripVertical)
const ChevronsUpDown: React.FC<
  React.SVGProps<SVGSVGElement> & { size?: number }
> = ({ size = 16, className, ...props }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={`${size}px`}
    height={`${size}px`}
    viewBox="0 0 24 24"
    fill="none"
    className={className}
    {...props}
  >
    <path
      d="M12.7071 3.29289C12.3166 2.90237 11.6834 2.90237 11.2929 3.29289L6.29289 8.29289C5.90237 8.68342 5.90237 9.31658 6.29289 9.70711C6.68342 10.0976 7.31658 10.0976 7.70711 9.70711L12 5.41421L16.2929 9.70711C16.6834 10.0976 17.3166 10.0976 17.7071 9.70711C18.0976 9.31658 18.0976 8.68342 17.7071 8.29289L12.7071 3.29289Z"
      fill="currentColor"
    />
    <path
      d="M7.70711 14.2929C7.31658 13.9024 6.68342 13.9024 6.29289 14.2929C5.90237 14.6834 5.90237 15.3166 6.29289 15.7071L11.2929 20.7071C11.6834 21.0976 12.3166 21.0976 12.7071 20.7071L17.7071 15.7071C18.0976 15.3166 18.0976 14.6834 17.7071 14.2929C17.3166 13.9024 16.6834 13.9024 16.2929 14.2929L12 18.5858L7.70711 14.2929Z"
      fill="currentColor"
    />
  </svg>
);
import DeleteConfirm from "../TestPackages/Components/DeleteConfirm";

// Sortable Row Component
const SortableRow: React.FC<{
  row: TestPanelRow;
  onEdit: (row: TestPanelRow) => void;
  onView: (panelId: string) => void;
}> = ({ row, onEdit, onView }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: row.id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <tr ref={setNodeRef} style={style} className="hover:bg-gray-50">
      <td className="border-b border-gray-200 px-4 py-3">
        <div className="flex items-center gap-2">
          <div
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing"
          >
            <ChevronsUpDown size={16} className="text-gray-400" />
          </div>
          <span className="text-sm text-gray-600">{row.order}.</span>
        </div>
      </td>
      <td className="border-b border-gray-200 px-4 py-3">
        <div className="font-medium text-gray-900">{row.name}</div>
      </td>
      <td className="border-b border-gray-200 px-4 py-3">
        <div className="text-sm text-gray-600">{row.category}</div>
      </td>
      <td className="border-b border-gray-200 px-4 py-3">
        <div className="text-sm text-gray-600">
          {row.tests.slice(0, 3).join(", ")}
          {row.tests.length > 3 && ` ... (${row.tests.length} tests)`}
        </div>
      </td>
      <td className="border-b border-gray-200 px-4 py-3">
        <div className="text-sm text-gray-600 max-w-xs truncate">
          {row.ratelistEntries || "—"}
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
        </div>
      </td>
    </tr>
  );
};

const TestPanels: React.FC = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [pageSize] = useState(5);
  const [query, setQuery] = useState("");
  const [panels, setPanels] = useState<TestPanelRow[]>([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [deletingRow, setDeletingRow] = useState<TestPanelRow | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [loadingPanels, setLoadingPanels] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  // Server-side pagination is used. 'panels' will contain the page returned by server.
  const rows = panels;
  const total = totalRecords;

  const organizationDetails = useAuthStore((s) => s.organizationDetails);

  // Load panels from API (debounced on query)
  useEffect(() => {
    let mounted = true;
    const timer = setTimeout(() => {
      (async () => {
        setLoadingPanels(true);
        try {
          const resp = await apis.GetTestPanels(
            page,
            pageSize,
            organizationDetails?.organization_id ?? "",
            organizationDetails?.center_id ?? "",
            query
          );
          if (mounted && resp?.data?.panels) {
            const mapped: TestPanelRow[] = resp.data.panels.map((p) => ({
              id: p.panel_id,
              uid: p.panel_id,
              order: Number(p.order_no) || 0,
              name: p.name,
              category: p.category_name || "",
              categoryId: p.category_id || "",
              tests: (p.tests?.list || []).map((t: TestItem) => t.test_name),
              ratelistEntries: p.price,
              price: p.price,
              hide_individual: p.hide_individual,
              hideInterpretation: Boolean(
                p.hide_individual &&
                  Object.keys(p.hide_individual).some(
                    (k) =>
                      k.toLowerCase().includes("interpretation") &&
                      p.hide_individual[k] === "true"
                  )
              ),
              hideMethod: Boolean(
                p.hide_individual &&
                  Object.keys(p.hide_individual).some(
                    (k) =>
                      k.toLowerCase().includes("method") &&
                      p.hide_individual[k] === "true"
                  )
              ),
            }));
            setPanels(
              [...mapped].sort((a, b) => Number(a.order) - Number(b.order))
            );
            const totalRec =
              resp.data.pagination?.totalRecords ?? mapped.length;
            setTotalRecords(totalRec);
            const pagesCount = Math.max(1, Math.ceil(totalRec / pageSize));
            if (page > pagesCount) setPage(pagesCount);
          }
        } catch (err) {
          console.warn("GetTestPanels failed:", err);
          notifications.show({
            title: "Error",
            message: "Failed to load test panels",
            color: "red",
          });
        } finally {
          setLoadingPanels(false);
        }
      })();
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
      await apis.DeleteTestPanel(
        organizationDetails?.organization_id ?? "",
        organizationDetails?.center_id ?? "",
        panel_id
      );
      setPanels((prev) => prev.filter((p) => p.id !== panel_id));
      setDeletingRow(null);
      setDeleteModalOpen(false);
      notifications.show({
        title: "Deleted",
        message: "Panel removed",
        color: "red",
      });
    } catch (err) {
      console.error(err);
      setPanels((prev) => prev.filter((p) => p.id !== panel_id));
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

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(String(event.active.id));
  };

  const reorderPanels = async (draggedUid: string, afterUid: string) => {
    try {
      const response = await apis.ReorderTestPanels(
        organizationDetails?.organization_id ?? "",
        organizationDetails?.center_id ?? "",
        {
          uid: draggedUid,
          after_uid: afterUid,
        }
      );

      const notificationType = response.success ? "blue" : "red";
      notifications.show({
        title: response.success,
        message: response.message,
        color: notificationType,
      });

      if (response.success) {
        // Reload panels to sync with server
        // You can also just reload the page data if needed
      }
    } catch (error) {
      console.error("Failed to reorder panels:", error);
      notifications.show({
        title: "Error",
        message: "Failed to sync order",
        color: "red",
      });
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over || active.id === over.id) return;

    // Use the full panels array to compute indices
    const oldIndex = panels.findIndex((p) => p.id === active.id);
    const newIndex = panels.findIndex((p) => p.id === over.id);

    if (oldIndex === -1 || newIndex === -1) return;

    const draggedPanel = panels[oldIndex];
    const reordered = arrayMove(panels, oldIndex, newIndex);

    // Determine after_uid. If placed at top, after_uid is empty
    const afterUid = newIndex === 0 ? "" : reordered[newIndex - 1].uid;

    setPanels(reordered);
    await reorderPanels(draggedPanel.uid, afterUid);
  };

  const activeRow = activeId ? panels.find((p) => p.id === activeId) : null;

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 ring-1 ring-gray-100">
      <div className="flex items-center justify-between mb-4">
        <div className="flex gap-4 items-center flex-1">
          <h2 className="text-lg font-semibold text-gray-800">Test panels</h2>
          <div className="w-64">
            <TextInput
              placeholder="Search in page"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              rightSection={loadingPanels ? <Loader size="xs" /> : null}
              rightSectionWidth={30}
            />
          </div>
        </div>
        <Button
          onClick={() => {
            navigate("/test-panels/edit", { state: { row: null } });
          }}
          variant="filled"
          color="blue"
          disabled={loadingPanels}
        >
          + Add new
        </Button>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50">
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider border-b border-gray-200">
                  Order
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider border-b border-gray-200">
                  Name
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider border-b border-gray-200">
                  Category
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider border-b border-gray-200">
                  Tests
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider border-b border-gray-200">
                  Ratelist Entries
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider border-b border-gray-200">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              <SortableContext
                items={rows.map((r) => r.id)}
                strategy={verticalListSortingStrategy}
              >
                {rows.map((row) => (
                  <SortableRow
                    key={row.id}
                    row={row}
                    onEdit={(r) =>
                      navigate("/test-panels/edit", { state: { row: r } })
                    }
                    onView={(panelId) => navigate(`/test-panels/${panelId}`)}
                  />
                ))}
              </SortableContext>
            </tbody>
          </table>
        </div>

        <DragOverlay>
          {activeRow ? (
            <div className="bg-white shadow-lg rounded border-2 border-blue-400 opacity-90">
              <table className="w-full text-sm">
                <tbody>
                  <tr>
                    <td className="px-4 py-3 w-20">
                      <div className="flex items-center gap-2">
                        <ChevronsUpDown size={16} className="text-gray-400" />
                        <span className="text-sm text-gray-600">
                          {activeRow.order}.
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-900">
                        {activeRow.name}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm text-gray-600">
                        {activeRow.category}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm text-gray-600">
                        {activeRow.tests.slice(0, 3).join(", ")}
                        {activeRow.tests.length > 3 &&
                          ` ... (${activeRow.tests.length} tests)`}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm text-gray-600 max-w-xs truncate">
                        {activeRow.ratelistEntries || "—"}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <IconPencil size={16} className="text-blue-600" />
                        <IconEye size={16} className="text-green-600" />
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

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

export default TestPanels;
