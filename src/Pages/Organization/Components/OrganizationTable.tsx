import React, { useState } from "react";
import { DataTable, type DataTableColumn } from "mantine-datatable";
import { IconDots } from "@tabler/icons-react";

type Row = {
  id: number;
  name: string;
  country: string;
  timezone: string;
  centers: number;
  status: "Active" | "Inactive";
  color?: string;
};

const rowsData: Row[] = [
  {
    id: 1,
    name: "Medilife",
    country: "United States",
    timezone: "GMT+05:30",
    centers: 10,
    status: "Active",
    color: "bg-blue-100",
  },
  {
    id: 2,
    name: "Global Healthcare Ltd",
    country: "India",
    timezone: "GMT-08:00",
    centers: 5,
    status: "Active",
    color: "bg-purple-100",
  },
  {
    id: 3,
    name: "EcoEnergy Systems",
    country: "United States",
    timezone: "GMT+05:30",
    centers: 4,
    status: "Inactive",
    color: "bg-green-100",
  },
  {
    id: 4,
    name: "FinanceFirst Group",
    country: "India",
    timezone: "GMT+05:30",
    centers: 2,
    status: "Inactive",
    color: "bg-amber-100",
  },
];

const OrganizationTable: React.FC = () => {
  const [page, setPage] = useState(1);
  const pageSize = 5;

  // pagination slice
  const paginated = rowsData.slice((page - 1) * pageSize, page * pageSize);

  const columns: DataTableColumn<Row>[] = [
    {
      accessor: "select",
      width: 40,
      title: "",
      render: () => <input type="checkbox" />,
    },
    {
      accessor: "name",
      title: "Organization Name",
      render: (r) => (
        <div className="flex items-center gap-3">
          <div
            className={`w-8 h-8 rounded-md flex items-center justify-center ${r.color}`}
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
          <div className="text-gray-800">{r.name}</div>
        </div>
      ),
    },
    { accessor: "country", title: "Country" },
    { accessor: "timezone", title: "Timezone" },
    { accessor: "centers", title: "Centers" },
    {
      accessor: "status",
      title: "Status",
      render: (r) =>
        r.status === "Active" ? (
          <span className="inline-flex items-center px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-xs">
            Active
          </span>
        ) : (
          <span className="inline-flex items-center px-3 py-1 rounded-full bg-gray-100 text-gray-600 text-xs">
            Inactive
          </span>
        ),
    },
    {
      accessor: "action",
      title: "Action",
      width: 100,
      render: () => (
        <button className="p-1 text-gray-400 hover:text-gray-600">
          <IconDots />
        </button>
      ),
    },
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 ring-1 ring-gray-100">
      {/* Filters & Actions */}
      <div className="flex  items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-800">Organizations</h2>

        <div className="flex items-center gap-3">
          <select className="border rounded-md p px-3 py-2 text-sm bg-white focus:outline-none focus:ring-0 focus-visible:outline-none">
            <option>All Countries</option>
            <option>India</option>
            <option>United States</option>
          </select>

          <select className="border rounded-md px-3 py-2 text-sm bg-white focus:outline-none focus:ring-0 focus-visible:outline-none">
            <option>All Status</option>
            <option>Active</option>
            <option>Inactive</option>
          </select>

          <button className="inline-flex items-center gap-2 bg-blue-600 text-white text-sm px-3 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-0 focus-visible:outline-none">
            + Add Organization
          </button>
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

export default OrganizationTable;
