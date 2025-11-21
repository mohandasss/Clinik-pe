import React, { useMemo } from "react";
import { DataTable, type DataTableColumn } from "mantine-datatable";
import { Button, Popover } from "@mantine/core";
import { IconDots, IconEdit } from "@tabler/icons-react";
import type { Role } from "../../../APis/Types";

interface RolesTableProps {
  records: Role[];
  page: number;
  pageSize: number;
  setPage: (n: number) => void;
  setPageSize: (n: number) => void;
  total: number;
  onDelete: (role: Role) => void;
  onEdit: (role: Role) => void;
}

const RolesTable: React.FC<RolesTableProps> = ({
  records,
  page,
  pageSize,
  setPage,
  setPageSize,
  total,
  onDelete,
  onEdit,
}) => {
  const columns: DataTableColumn<Role>[] = useMemo(
    () => [
      {
        accessor: "uid",
        title: "UID",
        width: 140,
        render: (r) => <div className="text-sm text-gray-600">{r.uid}</div>,
      },
      {
        accessor: "name",
        title: "NAME",
        render: (r) => (
          <div className="font-medium text-gray-900">{r.name}</div>
        ),
      },
      {
        accessor: "permissions",
        title: "PERMISSIONS",
        render: (r) => (
          <div className="text-sm text-gray-600">
            {r.permissions?.join(", ") || "—"}
          </div>
        ),
      },
      {
        accessor: "status",
        title: "STATUS",
        width: 120,
        render: (r) => (
          <div>
            <span
              className={`inline-flex px-2 py-1 text-xs font-medium rounded ${
                r.status === "active"
                  ? "bg-green-100 text-green-700"
                  : "bg-gray-100 text-gray-700"
              }`}
            >
              {r.status}
            </span>
          </div>
        ),
      },
      {
        accessor: "action",
        title: <div className="text-right">ACTION</div>,
        width: 100,
        render: (r) => (
          <div className="flex items-center justify-end gap-2">
            <Popover position="bottom" withArrow shadow="md">
              <Popover.Target>
                <button className="p-1 text-gray-400 hover:text-gray-600">
                  <IconDots className="rotate-90" />
                </button>
              </Popover.Target>
              <Popover.Dropdown>
                <div className="flex flex-col gap-2 min-w-max">
                  <Button variant="subtle" size="xs" onClick={() => onEdit(r)}>
                    Edit
                  </Button>
                  <Button
                    variant="subtle"
                    color="red"
                    size="xs"
                    onClick={() => onDelete(r)}
                  >
                    Remove
                  </Button>
                </div>
              </Popover.Dropdown>
            </Popover>
          </div>
        ),
      },
    ],
    [onDelete, onEdit]
  );

  return (
    <div>
      <DataTable
        columns={columns}
        records={records}
        idAccessor="uid"
        highlightOnHover
        className="text-sm"
      />

      <div className="flex items-center justify-between text-sm text-gray-500 mt-4">
        <div>
          Showing {(page - 1) * pageSize + 1} to{" "}
          {Math.min(page * pageSize, total)} of {total} entries
        </div>
        <div className="inline-flex items-center gap-2">
          <button
            className="px-3 py-1 border rounded text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
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
                className={`w-8 h-8 rounded ${
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
            className="px-3 py-1 border rounded text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
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

export default RolesTable;
