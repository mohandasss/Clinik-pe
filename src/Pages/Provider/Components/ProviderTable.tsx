import React, { useEffect, useRef, useState } from "react";
import { DataTable, type DataTableColumn } from "mantine-datatable";
import { IconDots } from "@tabler/icons-react";
import { Button, Select, Loader } from "@mantine/core";
import { useNavigate } from "react-router-dom";
import type { Provider } from "../../../APis/Types";

type Row = {
  id: number;
  providerUid?: string;
  image?: string;
  avatar?: string; // optional avatar url
  name: string;
  specialty: string;
  qualifications: string;
  centersLinked: number;
  fee: number;
  availability?: string;
  status: "Verified" | "Active" | "Inactive";
};

// providers will be loaded from the API

type ProviderTableProps = {
  providers: Provider[];
  loading: boolean;
  totalProviders: number;
  page: number;
  setPage: (page: number) => void;
  pageSize: number;
  pageCount: number;
};

const ProviderTable: React.FC<ProviderTableProps> = ({
  providers,
  loading,
  totalProviders,
  page,
  setPage,
  pageSize,
  pageCount,
}) => {
  const navigate = useNavigate();
  const [selected, setSelected] = useState<number[]>([]);
  const headerCheckboxRef = useRef<HTMLInputElement | null>(null);
  console.log("Providers in Table:", providers);
  // map API providers to table Row shape
  const rows: Row[] = providers.map((p, idx) => ({
    image: p.profile_pic,
    id: idx + 1,
    providerUid: p.uid,
    avatar: (p.profile_pic as string) || undefined,
    name: p.name || p.uid,
    specialty: p.specialities
      ? p.specialities.map((s) => s.name).join(", ")
      : "",
    qualifications: p.qualifications
      ? p.qualifications.map((q) => q.name).join(", ")
      : "",
    centersLinked: 0,
    fee: 0,
    availability: "",
    status:
      p.status === "active" || p.status === "Active" ? "Active" : "Inactive",
  }));

  // pagination slice (client-side slice of server data for the table)
  const paginated = rows.slice((page - 1) * pageSize, page * pageSize);

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

  const HandleAdd = () => {
    navigate("/providers/add");
  };

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
          <img
            src={
              r.image ||
              "https://media.healthecareers.com/wp-content/uploads/2022/02/11204020/placeholderdoctor.jpg"
            }
            alt={r.name}
            className="w-8 h-8 rounded-full object-cover"
          />
          <div className="text-gray-800 font-medium">{r.name}</div>
        </div>
      ),
    },
    {
      accessor: "specialty",
      title: "Specialty",
      render: (r) => <div className="text-gray-600">{r.specialty}</div>,
    },
    {
      accessor: "qualifications",
      title: "Qualifications",
      render: (r) => <div className="text-gray-600">{r.qualifications}</div>,
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
    // {
    //   accessor: "availability",
    //   title: "Availability",
    //   render: (r) => (
    //     <button className="bg-blue-600 text-white px-3 py-1 rounded-md text-sm focus:outline-none focus:ring-0">
    //       {r.availability}
    //     </button>
    //   ),
    // },
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
            onClick={HandleAdd}
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
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader />
        </div>
      ) : (
        <DataTable
          records={paginated}
          columns={columns}
          highlightOnHover
          className="text-sm"
          striped={false}
          idAccessor="id"
        />
      )}

      {/* Pagination */}
      <div className="flex items-center justify-between text-sm text-gray-500 mt-4">
        <div>
          Showing {(page - 1) * pageSize + 1} to{" "}
          {Math.min(page * pageSize, totalProviders)} of {totalProviders}{" "}
          entries
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
            {Array.from({ length: pageCount }, (_, i) => i + 1).map((n) => (
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
            disabled={page === pageCount}
            onClick={() => setPage(page + 1)}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProviderTable;
