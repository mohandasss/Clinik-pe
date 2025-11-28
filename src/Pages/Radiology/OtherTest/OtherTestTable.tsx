import React, { useMemo } from "react";
import { DataTable, type DataTableColumn } from "mantine-datatable";
import { Button, Popover } from "@mantine/core";
import { IconDots, IconPencil, IconEye } from "@tabler/icons-react";

export interface OtherTestRow {
  id: string;
  order: number;
  name: string;
  description?: string;
  category?: string;
  price?: string;
  status?: string;
  optional?: boolean | string;
}

interface OtherTestTableProps {
  records: OtherTestRow[];
  page: number;
  pageSize: number;
  setPage: (n: number) => void;
  setPageSize: (n: number) => void;
  total: number;
  onEdit: (row: OtherTestRow) => void;
  onView: (row: OtherTestRow) => void;
  onDelete: (row: OtherTestRow) => void;
}

const OtherTestTable: React.FC<OtherTestTableProps> = ({
  records,
  page,
  pageSize,
  setPage,
  setPageSize,
  total,
  onEdit,
  onView,
  onDelete,
}) => {
  console.log("Rendering OtherTestTable with records:", records);
  const columns: DataTableColumn<OtherTestRow>[] = useMemo(
    () => [
      {
        accessor: "sno",
        title: "ORDER",
        width: 80,
        render: (_r, i) => <div>{(page - 1) * pageSize + i + 1}.</div>,
      },
      {
        accessor: "name",
        title: "NAME",
        width: 200,
        render: (r) => (
          <div className="font-medium text-gray-900">{r.name}</div>
        ),
      },
      {
        accessor: "description",
        title: "DESCRIPTION",
        width: 160,
        render: (r) => (
          <div
            className="text-sm text-gray-600"
            dangerouslySetInnerHTML={{ __html: r.description || "" }}
          />
        ),
      },
      {
        accessor: "price",
        title: "PRICE",
        width: 100,
        render: (r) => <div className="text-sm text-gray-600">{r.price}</div>,
      },
      {
        accessor: "status",
        title: "STATUS",
        width: 120,
        render: (r) => <div className="text-sm text-gray-600">{r.status}</div>,
      },
      {
        accessor: "action",
        title: <div className="text-right">ACTION</div>,
        width: 130,
        render: (r) => (
          <div className="flex items-center justify-end gap-2">
            <button
              className="text-blue-600 text-sm"
              onClick={() => onEdit(r)}
              aria-label={`Edit ${r.name}`}
            >
              <IconPencil size={16} />
            </button>

            <button
              className="text-blue-600 text-sm hover:text-blue-700"
              onClick={() => onView(r)}
              aria-label={`View ${r.name}`}
            >
              <IconEye size={16} />
            </button>

            <Popover position="bottom" withArrow shadow="md">
              <Popover.Target>
                <button className="p-1 text-gray-400 hover:text-gray-600">
                  <IconDots className="rotate-90" />
                </button>
              </Popover.Target>
              <Popover.Dropdown>
                <div className="flex flex-col gap-2 min-w-max">
                  {/* Add more actions here */}
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
    [page, pageSize, onEdit, onView, onDelete]
  );

  return (
    <div>
      <DataTable
        columns={columns}
        records={records}
        idAccessor="id"
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
            className="px-3 py-1 border rounded text-gray-600"
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
                  page === n ? "bg-blue-600 text-white" : "border text-gray-600"
                }`}
              >
                {n}
              </button>
            ))}
          </div>

          <button
            className="px-3 py-1 border rounded text-gray-600"
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

export default OtherTestTable;
