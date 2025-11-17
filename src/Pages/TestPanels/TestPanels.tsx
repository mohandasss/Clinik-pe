import React, { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { DataTable, type DataTableColumn } from "mantine-datatable";
import { Button, Popover, TextInput, Select } from "@mantine/core";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { notifications } from "@mantine/notifications";
import apis from "../../APis/Api";
import type { TestPanelRow } from "../../APis/Types";
import { IconDots, IconPencil, IconGripVertical } from "@tabler/icons-react";
import DeleteConfirm from "../TestPackages/Components/DeleteConfirm";

const MOCK_PANELS: TestPanelRow[] = [
  {
    id: "1",
    order: 1,
    name: "CBC (with absolute counts)",
    category: "Haematology",
    tests: [
      "Hemoglobin",
      "Total Leukocyte Count",
      "Differential Leucocyte Count",
      "Platelet Count",
    ],
    ratelistEntries:
      "Antenatal Package, Cardiac package, CBC (with absolute counts)",
  },
  {
    id: "2",
    order: 2,
    name: "Complete Blood Count (CBC)",
    category: "Haematology",
    tests: [
      "Hemoglobin",
      "Total Leukocyte Count",
      "Differential Leucocyte Count",
      "Platelet Count",
    ],
    ratelistEntries: "CBC with GBP, Complete Blood Count (CBC)",
  },
  {
    id: "3",
    order: 3,
    name: "CBC with ESR",
    category: "Haematology",
    tests: [
      "Hemoglobin",
      "Total Leukocyte Count",
      "Differential Leucocyte Count",
      "Platelet Count",
    ],
    ratelistEntries: "Anemia package, Arthritis Package, CBC with ESR",
  },
  {
    id: "4",
    order: 4,
    name: "BT & CT",
    category: "Haematology",
    tests: ["Bleeding Time", "Clotting Time"],
    ratelistEntries: "BT & CT",
  },
  {
    id: "5",
    order: 5,
    name: "Coagulation Profile",
    category: "Haematology",
    tests: ["Bleeding Time", "Clotting Time"],
    ratelistEntries: "Coagulation Profile",
  },
];

// Sortable Row Component
const SortableRow: React.FC<{
  row: TestPanelRow;
  onEdit: (row: TestPanelRow) => void;
  onDelete: (row: TestPanelRow) => void;
}> = ({ row, onEdit, onDelete }) => {
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
            <IconGripVertical size={16} className="text-gray-400" />
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
          <Popover position="bottom" withArrow shadow="md">
            <Popover.Target>
              <button className="p-1 text-gray-400 hover:text-gray-600 transition-colors">
                <IconDots className="rotate-90" />
              </button>
            </Popover.Target>
            <Popover.Dropdown>
              <div className="flex flex-col gap-2 min-w-max">
                <Button
                  variant="subtle"
                  color="red"
                  size="xs"
                  onClick={() => onDelete(row)}
                >
                  Remove
                </Button>
              </div>
            </Popover.Dropdown>
          </Popover>
        </div>
      </td>
    </tr>
  );
};

const TestPanels: React.FC = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [query, setQuery] = useState("");
  const [panels, setPanels] = useState<TestPanelRow[]>(MOCK_PANELS);
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

  const filtered = useMemo(() => {
    let data = panels;
    if (query) {
      const q = query.toLowerCase();
      data = data.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.tests.some((t) => t.toLowerCase().includes(q))
      );
    }
    return data.sort((a, b) => a.order - b.order);
  }, [query, panels]);

  const total = filtered.length;
  const rows = filtered.slice((page - 1) * pageSize, page * pageSize);

  // Load panels from API
  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoadingPanels(true);
      try {
        const resp = await apis.GetTestPanels();
        if (mounted && resp?.data?.panels) {
          setPanels(resp.data.panels.sort((a, b) => a.order - b.order));
        }
      } catch (err) {
        console.warn("GetTestPanels failed, using local mocks", err);
      } finally {
        setLoadingPanels(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const handleDeleteConfirm = async (id: string) => {
    setDeleting(true);
    try {
      await apis.DeleteTestPanel(id);
      setPanels((prev) => prev.filter((p) => p.id !== id));
      setDeletingRow(null);
      setDeleteModalOpen(false);
      notifications.show({
        title: "Deleted",
        message: "Panel removed",
        color: "red",
      });
    } catch (err) {
      console.error(err);
      setPanels((prev) => prev.filter((p) => p.id !== id));
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

  const handleDragStart = (event: any) => {
    setActiveId(event.active.id);
  };

  const handleDragEnd = async (event: any) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over || active.id === over.id) return;

    const oldIndex = panels.findIndex((p) => p.id === active.id);
    const newIndex = panels.findIndex((p) => p.id === over.id);

    if (oldIndex === -1 || newIndex === -1) return;

    const reordered = arrayMove(panels, oldIndex, newIndex).map((p, i) => ({
      ...p,
      order: i + 1,
    }));

    setPanels(reordered);

    try {
      await apis.ReorderTestPanels({
        panels: reordered.map((p) => ({ id: p.id, order: p.order })),
      });
      notifications.show({
        title: "Reordered",
        message: "Panel order updated",
        color: "blue",
      });
    } catch (err) {
      console.error(err);
      notifications.show({
        title: "Error",
        message: "Failed to sync order",
        color: "red",
      });
    }
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
                    onDelete={(r) => {
                      setDeletingRow(r);
                      setDeleteModalOpen(true);
                    }}
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
                        <IconGripVertical size={16} className="text-gray-400" />
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
                        <IconDots className="rotate-90 text-gray-400" />
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
          Showing {(page - 1) * pageSize + 1} to{" "}
          {Math.min(page * pageSize, total)} of {total} entries
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
