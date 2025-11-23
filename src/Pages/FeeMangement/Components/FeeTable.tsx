import React, { useEffect, useRef, useState } from "react";
import { DataTable, type DataTableColumn } from "mantine-datatable";
import { IconDots } from "@tabler/icons-react";
import { Button, Select, Menu, ActionIcon } from "@mantine/core";

export type FeeRow = {
  id: string;
  orgId: string;
  centerId: string;
  provider: string;
  appointmentType: string;
  fee: string;
  commissionType: string; // e.g. 'Flat' or '%'
  commission: string;
};

export type FeeTableProps = {
  title?: string;
  data?: FeeRow[];
  pageSize?: number;
  total?: number; // total entries for pagination display
  currentPage?: number;
  onAdd?: () => void;
  onPageChange?: (page: number) => void;
  className?: string;
};

const FeeTable: React.FC<FeeTableProps> = ({
  title = "Provider Fee Management",
  data = [],
  pageSize = 10,
  total = 0,
  currentPage = 1,
  onAdd,
  onPageChange,
  className = "",
}) => {
  const [selected, setSelected] = useState<string[]>([]);
  const headerCheckboxRef = useRef<HTMLInputElement | null>(null);
  const toggleRow = (id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  };

  // when visible rows change, manage header checkbox indeterminate state
  useEffect(() => {
    const visibleIds = data.map((d) => d.id);
    const someSelected = visibleIds.some((id) => selected.includes(id));
    const allSelected =
      visibleIds.length > 0 && visibleIds.every((id) => selected.includes(id));
    if (headerCheckboxRef.current) {
      headerCheckboxRef.current.indeterminate = someSelected && !allSelected;
      headerCheckboxRef.current.checked = allSelected;
    }
  }, [data, selected]);

  const columns: DataTableColumn<FeeRow>[] = [
    {
      accessor: "select",
      width: 40,
      title: (
        <input
          ref={headerCheckboxRef}
          type="checkbox"
          className="focus:outline-none focus:ring-0 focus-visible:outline-none"
          onChange={() => {
            const ids = data.map((d) => d.id);
            const allSelectedNow = ids.every((id) => selected.includes(id));
            if (allSelectedNow)
              setSelected((prev) => prev.filter((id) => !ids.includes(id)));
            else setSelected((prev) => Array.from(new Set([...prev, ...ids])));
          }}
          aria-label="select all visible"
        />
      ),
      render: (r) => (
        <input
          type="checkbox"
          checked={selected.includes(r.id)}
          onChange={() => toggleRow(r.id)}
          className="focus:outline-none focus:ring-0 focus-visible:outline-none"
        />
      ),
    },
    {
      accessor: "id",
      title: "ID",
      render: (r) => <div className="text-sm text-gray-700">#{r.id}</div>,
    },
    {
      accessor: "orgId",
      title: "ORG ID",
      render: (r) => <div className="text-sm text-gray-500">#{r.orgId}</div>,
    },
    {
      accessor: "centerId",
      title: "Center ID",
      render: (r) => <div className="text-sm text-gray-500">#{r.centerId}</div>,
    },
    {
      accessor: "provider",
      title: "Provider",
      render: (r) => <div className="text-sm text-gray-700">{r.provider}</div>,
    },
    {
      accessor: "appointmentType",
      title: "Appointment Type",
      render: (r) => (
        <div className="text-sm text-gray-500">{r.appointmentType}</div>
      ),
    },
    {
      accessor: "fee",
      title: "Fee",
      render: (r) => <div className="text-sm text-gray-700">{r.fee}</div>,
    },
    {
      accessor: "commissionType",
      title: "Commission Type",
      render: (r) => (
        <div className="text-sm text-gray-500">{r.commissionType}</div>
      ),
    },
    {
      accessor: "commission",
      title: "Commission",
      render: (r) => (
        <div className="text-sm text-gray-700">{r.commission}</div>
      ),
    },
    {
      accessor: "action",
      title: "Action",
      width: 80,
      render: () => (
        <Menu withinPortal>
          <Menu.Target>
            <ActionIcon>
              <IconDots />
            </ActionIcon>
          </Menu.Target>
          <Menu.Dropdown>
            {/* <Menu.Item>Edit</Menu.Item>
            <Menu.Item>Delete</Menu.Item> */}
          </Menu.Dropdown>
        </Menu>
      ),
    },
  ];

  const pageCount = Math.max(1, Math.ceil((total || data.length) / pageSize));

  return (
    <div className={`bg-white rounded-lg shadow-sm p-6 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
        <div className="flex items-center gap-3">
          {/* <Select
            placeholder="All Providers"
            data={[...new Set(data.map((d) => d.provider))]}
            classNames={{
              input: "border rounded-md px-3 py-2 text-sm bg-white",
            }}
          /> */}
          <Button onClick={onAdd} size="sm">
            + Add Fee
          </Button>
        </div>
      </div>

      <DataTable
        columns={columns}
        records={data}
        idAccessor="id"
        className="text-sm"
        highlightOnHover
      />

      <div className="flex items-center justify-between mt-4">
        <div className="text-xs text-gray-500">
          Showing {(currentPage - 1) * pageSize + 1} to{" "}
          {Math.min(currentPage * pageSize, total || data.length)} of{" "}
          {total || data.length} entries
        </div>

        <div className="inline-flex items-center gap-2">
          <button
            className="px-3 py-1 border rounded text-gray-600"
            disabled={currentPage === 1}
            onClick={() => onPageChange && onPageChange(currentPage - 1)}
          >
            Previous
          </button>

          <div className="inline-flex items-center gap-1">
            {Array.from({ length: pageCount }, (_, i) => i + 1).map((n) => (
              <button
                key={n}
                onClick={() => onPageChange && onPageChange(n)}
                className={`w-8 h-8 rounded ${
                  currentPage === n
                    ? "bg-blue-600 text-white"
                    : "border text-gray-600"
                }`}
              >
                {n}
              </button>
            ))}
          </div>

          <button
            className="px-3 py-1 border rounded text-gray-600"
            disabled={currentPage >= pageCount}
            onClick={() => onPageChange && onPageChange(currentPage + 1)}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default FeeTable;
