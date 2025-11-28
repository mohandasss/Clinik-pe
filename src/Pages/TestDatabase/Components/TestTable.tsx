import React, { useMemo } from "react";
import { DataTable, type DataTableColumn } from "mantine-datatable";
import { Button, Popover, Badge } from "@mantine/core";
import { IconDots, IconPencil, IconEye } from "@tabler/icons-react";

export interface TestRow {
  id: string;
  name: string;
  shortName?: string;
  displayName?: string;
  category?: string;
  price?: string;
  mrp?: string;
  type?: string;
  sampleType?: string;
  gender?: string;
  optional?: boolean;
  homeCollection?: boolean;
}

interface TestTableProps {
  records: TestRow[];
  page: number;
  pageSize: number;
  setPage: (n: number) => void;
  setPageSize: (n: number) => void;
  total: number;
  onEdit: (row: TestRow) => void;
  onView: (row: TestRow) => void;
}

const TestTable: React.FC<TestTableProps> = ({
  records,
  page,
  pageSize,
  setPage,
  setPageSize,
  total,
  onEdit,
  onView,
}) => {
  const columns: DataTableColumn<TestRow>[] = useMemo(
    () => [
      {
        accessor: "sno",
        title: "#",
        width: 50,
        render: (_r, i) => (
          <div className="text-gray-500">{(page - 1) * pageSize + i + 1}</div>
        ),
      },
      {
        accessor: "name",
        title: "TEST NAME",
        render: (r) => (
          <div>
            <div className="font-medium text-gray-900">{r.name}</div>
            {r.displayName && r.displayName !== r.name && (
              <div className="text-xs text-gray-500">{r.displayName}</div>
            )}
          </div>
        ),
      },
      {
        accessor: "shortName",
        title: "SHORT NAME",
        width: 120,
        render: (r) => (
          <div className="text-sm text-gray-600">{r.shortName || "-"}</div>
        ),
      },
      {
        accessor: "type",
        title: "TYPE",
        width: 100,
        render: (r) => (
          <Badge
            size="sm"
            variant="light"
            color={
              r.type === "single"
                ? "blue"
                : r.type === "multiple"
                ? "green"
                : r.type === "nested"
                ? "orange"
                : "gray"
            }
          >
            {r.type || "-"}
          </Badge>
        ),
      },
      {
        accessor: "category",
        title: "CATEGORY",
        width: 140,
        render: (r) => (
          <div className="text-sm text-gray-600">{r.category || "-"}</div>
        ),
      },
      {
        accessor: "sampleType",
        title: "SAMPLE",
        width: 100,
        render: (r) => (
          <div className="text-sm text-gray-600 capitalize">
            {r.sampleType || "-"}
          </div>
        ),
      },
      {
        accessor: "gender",
        title: "GENDER",
        width: 80,
        render: (r) => (
          <div className="text-sm text-gray-600 capitalize">
            {r.gender === "both" ? "All" : r.gender || "-"}
          </div>
        ),
      },
      {
        accessor: "price",
        title: "PRICE",
        width: 90,
        render: (r) => (
          <div className="text-sm">
            {r.price ? (
              <span className="font-medium text-gray-900">₹{r.price}</span>
            ) : (
              "-"
            )}
          </div>
        ),
      },
      {
        accessor: "homeCollection",
        title: "HOME",
        width: 70,
        render: (r) => (
          <Badge
            size="sm"
            variant="light"
            color={r.homeCollection ? "green" : "gray"}
          >
            {r.homeCollection ? "Yes" : "No"}
          </Badge>
        ),
      },
      {
        accessor: "action",
        title: <div className="text-right">ACTION</div>,
        width: 100,
        render: (r) => (
          <div className="flex items-center justify-end gap-2">
            <button
              className="text-blue-600 text-sm hover:text-blue-800"
              onClick={() => onEdit(r)}
              aria-label={`Edit ${r.name}`}
            >
              <IconPencil size={16} />
            </button>

            <button
              className="text-gray-600 text-sm hover:text-gray-800"
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
                  <Button variant="subtle" color="red" size="xs">
                    Remove
                  </Button>
                </div>
              </Popover.Dropdown>
            </Popover>
          </div>
        ),
      },
    ],
    [page, pageSize, onEdit, onView]
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

export default TestTable;
