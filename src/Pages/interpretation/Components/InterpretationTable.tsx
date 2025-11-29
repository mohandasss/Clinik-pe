import React, { useRef, useEffect, useState } from "react";
import { DataTable, type DataTableColumn } from "mantine-datatable";
import { Button, Popover } from "@mantine/core";
import { IconDots, IconPencil, IconTrash } from "@tabler/icons-react";

export interface InterpretationRow {
  id: string;
  uid: string;
  test_name: string;
  test_id: string;
  interpretation: string;
}

interface InterpretationTableProps {
  data: InterpretationRow[];
  page: number;
  pageSize: number;
  total: number;
  loading?: boolean;
  onPageChange: (page: number) => void;
  onEdit: (row: InterpretationRow) => void;
  onDelete: (id: string) => void;
  onAddClick?: () => void;
  hideAddButton?: boolean;
  hideDeleteButton?: boolean;
  title?: string;
}

const InterpretationTable: React.FC<InterpretationTableProps> = ({
  data,
  page,
  pageSize,
  total,
  loading = false,
  onPageChange,
  onEdit,
  onDelete,
  onAddClick,
  hideAddButton = false,
  hideDeleteButton = false,
  title,
}) => {
  const [selected, setSelected] = useState<string[]>([]);
  const headerCheckboxRef = useRef<HTMLInputElement | null>(null);
  const [popoverOpenId, setPopoverOpenId] = useState<string | null>(null);

  const toggleRow = (id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    const ids = data.map((r) => r.id);
    const allSelected = ids.every((id) => selected.includes(id));
    if (allSelected) {
      setSelected((prev) => prev.filter((id) => !ids.includes(id)));
    } else {
      setSelected((prev) => Array.from(new Set([...prev, ...ids])));
    }
  };

  useEffect(() => {
    const ids = data.map((r) => r.id);
    const someSelected = ids.some((id) => selected.includes(id));
    const allSelected =
      ids.length > 0 && ids.every((id) => selected.includes(id));
    if (headerCheckboxRef.current) {
      headerCheckboxRef.current.indeterminate = someSelected && !allSelected;
    }
  }, [data, selected]);

  const columns: DataTableColumn<InterpretationRow>[] = [
    {
      accessor: "select",
      width: 40,
      title: (
        <input
          ref={headerCheckboxRef}
          type="checkbox"
          className="focus:outline-none focus:ring-0 focus-visible:outline-none"
          checked={
            data.length > 0 && data.every((r) => selected.includes(r.id))
          }
          onChange={toggleSelectAll}
          aria-label="select all visible"
        />
      ),
      render: (r) => (
        <input
          type="checkbox"
          className="focus:outline-none focus:ring-0 focus-visible:outline-none"
          checked={selected.includes(r.id)}
          onChange={() => toggleRow(r.id)}
        />
      ),
    },
    {
      accessor: "sno",
      title: "S.NO.",
      width: 70,
      render: (_, index) => <div>{(page - 1) * pageSize + (index + 1)}.</div>,
    },
    {
      accessor: "test_name",
      title: "NAME",
      render: (r) => (
        <div className="text-gray-800 font-medium">{r.test_name}</div>
      ),
    },
    {
      accessor: "interpretation",
      title: "INTERPRETATION",
      render: (r) => (
        <div
          className="text-gray-600 max-w-xs truncate"
          dangerouslySetInnerHTML={{ __html: r.interpretation || "—" }}
        />
      ),
    },
    {
      accessor: "action",
      title: "ACTION",
      width: 100,
      render: (r) => (
        <div className="flex items-center gap-2">
          <button
            className="text-blue-600 hover:text-blue-700"
            onClick={() => onEdit(r)}
            aria-label="edit"
          >
            <IconPencil size={16} />
          </button>

          {!hideDeleteButton && (
            <Popover
              position="bottom"
              withArrow
              shadow="md"
              opened={popoverOpenId === r.id}
              onClose={() => setPopoverOpenId(null)}
            >
              <Popover.Target>
                <button
                  className="p-1 text-gray-400 hover:text-gray-600"
                  onClick={(e) => {
                    e.stopPropagation();
                    setPopoverOpenId(popoverOpenId === r.id ? null : r.id);
                  }}
                >
                  <IconDots className="rotate-90" />
                </button>
              </Popover.Target>
              <Popover.Dropdown>
                <Button
                  variant="subtle"
                  color="red"
                  size="xs"
                  leftSection={<IconTrash size={14} />}
                  onClick={() => {
                    onDelete(r.id);
                    setPopoverOpenId(null);
                  }}
                >
                  Delete
                </Button>
              </Popover.Dropdown>
            </Popover>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 ring-1 ring-gray-100">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-800">
          {title ?? "Interpretations"}
        </h2>
        {!hideAddButton && (
          <Button
            onClick={onAddClick}
            variant="filled"
            color="blue"
            className="inline-flex items-center gap-2 text-sm px-4 py-2 rounded-md"
            loading={loading}
          >
            + Add new
          </Button>
        )}
      </div>

      {/* Divider */}
      <div className="-mx-6 h-px bg-gray-200 mb-4"></div>

      {/* Table */}
      <DataTable
        records={data}
        columns={columns}
        highlightOnHover
        className="text-sm"
        striped={false}
        idAccessor="id"
      />

      {/* Pagination */}
      <div className="flex items-center justify-between text-sm text-gray-500 mt-4">
        <div>
          Showing {total === 0 ? 0 : (page - 1) * pageSize + 1} to{" "}
          {Math.min(page * pageSize, total)} of {total} entries
        </div>

        <div className="inline-flex items-center gap-2">
          <button
            className="px-3 py-1 border rounded text-gray-600 hover:bg-gray-50 disabled:opacity-50"
            disabled={page === 1}
            onClick={() => onPageChange(page - 1)}
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
                onClick={() => onPageChange(n)}
                className={`w-8 h-8 rounded text-sm ${
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
            className="px-3 py-1 border rounded text-gray-600 hover:bg-gray-50 disabled:opacity-50"
            disabled={page >= Math.ceil(Math.max(1, total) / pageSize)}
            onClick={() => onPageChange(page + 1)}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default InterpretationTable;
