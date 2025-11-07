import React, { useEffect, useRef, useState } from "react";
import { DataTable, type DataTableColumn } from "mantine-datatable";
import { IconDots } from "@tabler/icons-react";
import successImg from "../../../assets/success.png";
import { Button, Select } from "@mantine/core";

type Row = {
  id: number;
  avatar?: string; // optional avatar url
  name: string;
  specialty: string;
  centersLinked: number;
  fee: number;
  availability?: string;
  status: "Verified" | "Active" | "Inactive";
};

const rowsData: Row[] = [
  {
    id: 1,
    name: "Dr. Ananya Patel",
    specialty: "Dermatology",
    centersLinked: 5,
    fee: 800,
    availability: "Schedule",
    status: "Verified",
  },
  {
    id: 2,
    name: "Dr. Kapil",
    specialty: "Cardiology",
    centersLinked: 3,
    fee: 500,
    availability: "Schedule",
    status: "Active",
  },
  {
    id: 3,
    name: "Dr. Ajij",
    specialty: "Orthopedic",
    centersLinked: 1,
    fee: 700,
    availability: "Schedule",
    status: "Verified",
  },
  {
    id: 4,
    name: "Dr. Bikram Roy",
    specialty: "Pediatrics",
    centersLinked: 4,
    fee: 600,
    availability: "Schedule",
    status: "Inactive",
  },
];

const ProviderTable: React.FC = () => {
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
      accessor: "name",
      title: "Name",
      render: (r) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-sm text-gray-700">
            {r.name
              .split(" ")
              .slice(0, 2)
              .map((n) => n[0])
              .join("")}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <div className="text-gray-800">{r.name}</div>
              {r.status === "Verified" ? (
                <img src={successImg} alt="verified" className="w-5 h-5" />
              ) : null}
            </div>
          </div>
        </div>
      ),
    },
    {
      accessor: "specialty",
      title: "Specialty",
      render: (r) => {
        const palette: Record<string, string> = {
          Verified: "bg-blue-700 text-white",
          Active: "bg-green-100 text-green-700",
          Inactive: "bg-gray-100 text-gray-700",
        };
        const cls = palette[r.status] ?? "bg-gray-100 text-gray-700";
        return (
          <span
            className={`inline-flex items-center px-3 py-1 rounded-full text-xs ${cls}`}
          >
            {r.specialty}
          </span>
        );
      },
    },
    {
      accessor: "centersLinked",
      title: "Centers Linked",
      render: (r) => (
        <div className="text-gray-600">{r.centersLinked} Centers</div>
      ),
    },
    {
      accessor: "fee",
      title: "Fee",
      render: (r) => <div className="text-gray-600">₹{r.fee}</div>,
    },
    {
      accessor: "availability",
      title: "Availability",
      render: (r) => (
        <button className="bg-blue-600 text-white px-3 py-1 rounded-md text-sm focus:outline-none focus:ring-0">
          {r.availability}
        </button>
      ),
    },
    {
      accessor: "status",
      title: "Status",
      render: (r) => {
        if (r.status === "Verified") {
          return (
            <span className="inline-flex items-center px-3 py-1 rounded-full bg-blue-700 text-white text-xs">
              Verified
            </span>
          );
        }
        if (r.status === "Active") {
          return (
            <span className="inline-flex items-center px-3 py-1 rounded-full bg-green-100 text-green-600 text-xs">
              Active
            </span>
          );
        }
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full bg-gray-100 text-gray-600 text-xs">
            Inactive
          </span>
        );
      },
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
            data={["All Types", "Dermatology", "Orthopedic", "Pediatrics"]}
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
            + Add Provider
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

export default ProviderTable;
