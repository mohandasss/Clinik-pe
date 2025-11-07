import React, { useEffect, useRef, useState } from "react";
import { DataTable, type DataTableColumn } from "mantine-datatable";
import { IconDots } from "@tabler/icons-react";
import { Button, Select } from "@mantine/core";

type Row = {
  id: number;
  logoColor?: string; // used to render small square logo
  centerName: string;
  type: string;
  location: string;
  contactPerson: string;
  providers: number;
  status: "Active" | "Inactive";
};

const rowsData: Row[] = [
  {
    id: 1,
    logoColor: "bg-blue-100",
    centerName: "Medilife Center",
    type: "Clinic",
    location: "New York, USA",
    contactPerson: "Dr. John Doe",
    providers: 10,
    status: "Active",
  },
  {
    id: 2,
    logoColor: "bg-purple-100",
    centerName: "Global Healthcare Center",
    type: "Diagnostic",
    location: "Mumbai, India",
    contactPerson: "Ms. Priya Singh",
    providers: 5,
    status: "Active",
  },
  {
    id: 3,
    logoColor: "bg-green-100",
    centerName: "EcoEnergy Clinic",
    type: "Diagnostic",
    location: "San Francisco, USA",
    contactPerson: "Mr. Alan Green",
    providers: 4,
    status: "Inactive",
  },
  {
    id: 4,
    logoColor: "bg-amber-100",
    centerName: "FinanceFirst Clinic",
    type: "Diagnostic",
    location: "Bengaluru, India",
    contactPerson: "Ms. Sita Rao",
    providers: 2,
    status: "Inactive",
  },
];

const ClinicTable: React.FC = () => {
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<number[]>([]);
  const headerCheckboxRef = useRef<HTMLInputElement | null>(null);
  const pageSize = 5;

  // pagination slice
  const paginated = rowsData.slice((page - 1) * pageSize, page * pageSize);

  const toggleRow = (id: number) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    const ids = paginated.map((r) => r.id);
    const allSelected = ids.every((id) => selected.includes(id));
    if (allSelected) {
      // remove these ids
      setSelected((prev) => prev.filter((id) => !ids.includes(id)));
    } else {
      // add visible ids
      setSelected((prev) => Array.from(new Set([...prev, ...ids])));
    }
  };

  useEffect(() => {
    const ids = paginated.map((r) => r.id);
    const someSelected = ids.some((id) => selected.includes(id));
    const allSelected =
      ids.length > 0 && ids.every((id) => selected.includes(id));
    if (headerCheckboxRef.current) {
      headerCheckboxRef.current.indeterminate = someSelected && !allSelected;
    }
  }, [paginated, selected]);

  const columns: DataTableColumn<Row>[] = [
    {
      accessor: "select",
      width: 40,
      title: (
        <input
          ref={headerCheckboxRef}
          type="checkbox"
          className="focus:outline-none focus:ring-0 focus-visible:outline-none"
          checked={
            paginated.length > 0 &&
            paginated.every((r) => selected.includes(r.id))
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
      accessor: "logo",
      title: "Logo",
      render: (r) => (
        <div
          className={`w-8 h-8 rounded-md flex items-center justify-center ${r.logoColor}`}
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <rect
              x="4"
              y="4"
              width="16"
              height="16"
              rx="2"
              fill="currentColor"
            />
          </svg>
        </div>
      ),
    },
    {
      accessor: "centerName",
      title: "Center Name",
      render: (r) => <div className="text-gray-800">{r.centerName}</div>,
    },
    {
      accessor: "type",
      title: "Type",
      render: (r) => {
        const map: Record<string, string> = {
          Clinic: "bg-green-100 text-green-700",
          Diagnostic: "bg-purple-100 text-purple-700",
          Satellite: "bg-amber-100 text-amber-700",
        };
        const cls = map[r.type] ?? "bg-gray-100 text-gray-700";
        return (
          <span
            className={`inline-flex items-center px-2 py-1.5 text-xs rounded-full ${cls}`}
          >
            {r.type}
          </span>
        );
      },
    },
    { accessor: "location", title: "Location" },
    { accessor: "contactPerson", title: "Contact Person" },
    { accessor: "providers", title: "Providers" },
    {
      accessor: "status",
      title: "Status",
      render: (r) =>
        r.status === "Active" ? (
          <span className="inline-flex items-center px-3 py-1 rounded-full bg-green-100 text-green-600 text-xs">
            Active
          </span>
        ) : (
          <span className="inline-flex items-center px-3 py-1 rounded-full bg-red-100 text-red-600 text-xs">
            Inactive
          </span>
        ),
    },
    {
      accessor: "action",
      title: "Action",
      width: 100,
      render: () => (
        <button className="p-1 text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-0 focus-visible:outline-none">
          <IconDots className="rotate-90" />
        </button>
      ),
    },
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 ring-1 ring-gray-100">
      {/* Filters & Actions */}
      <div className="flex  items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-800">Clinics</h2>

        <div className="flex items-center gap-3">
          <Select
            placeholder="All Type"
            data={["All Countries", "Clinic", "Diagnostic"]}
            classNames={{
              input:
                "border rounded-md px-3 py-2 text-sm bg-white focus:outline-none focus:ring-0 focus-visible:outline-none",
            }}
          />

          <Select
            placeholder="All Status"
            data={["All Status", "Active", "Inactive"]}
            classNames={{
              input:
                "border rounded-md px-3 py-2 text-sm bg-white focus:outline-none focus:ring-0 focus-visible:outline-none",
            }}
          />

          <Button
            variant="filled"
            color="blue"
            className="inline-flex items-center gap-2 text-sm px-3 py-2 rounded-md"
          >
            + Add Center
          </Button>
        </div>
      </div>
      <div className="-mx-4 h-px bg-gray-200 mb-3"></div>

      {/* Mantine DataTable */}
      <DataTable
        records={paginated}
        columns={columns}
        highlightOnHover
        className="text-sm"
        striped={false}
        idAccessor="id"
      />

      {/* Pagination */}
      <div className="flex items-center justify-between text-sm text-gray-500 mt-4">
        <div>Showing 1 to 10 of {rowsData.length} entries</div>

        <div className="inline-flex items-center gap-2">
          <button
            className="px-3 py-1 border rounded text-gray-600"
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
          >
            Previous
          </button>

          <div className="inline-flex items-center gap-1">
            {[1, 2, 3].map((n) => (
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
            disabled={page === 3}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default ClinicTable;
