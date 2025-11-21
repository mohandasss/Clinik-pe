import React, { useEffect, useRef, useState } from "react";
import { DataTable, type DataTableColumn } from "mantine-datatable";
import { IconDots } from "@tabler/icons-react";
import { Button, Select, Popover } from "@mantine/core";
import { useNavigate } from "react-router-dom";
import type { Center } from "../../../APis/Types";
import useAuthStore from "../../../GlobalStore/store";
import useSidebarStore from "../../../GlobalStore/sidebarStore";
import apis from "../../../APis/Api";
import { notifications } from "@mantine/notifications";

type Row = {
  id: number;
  logoColor?: string;
  centerName: string;
  type: string;
  location: string;
  contactPerson: string;
  providers: number;
  status: "Active" | "Inactive";
};

interface ClinicTableProps {
  centerData: Center[];
  total: number;
  page: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onTypeChange: (type: string | undefined) => void;
  onStatusChange: (status: string | undefined) => void;
  selectedType?: string | undefined;
  selectedStatus?: string | undefined;
  // optional organization id from parent (used when switching center)
  organizationId?: string | undefined;
}

const ClinicTable: React.FC<ClinicTableProps> = ({
  centerData,
  total,
  page,
  pageSize,
  onPageChange,
  onTypeChange,
  onStatusChange,
  selectedType,
  selectedStatus,
  organizationId,
}) => {
  const navigate = useNavigate();
  const [selected, setSelected] = useState<number[]>([]);
  const headerCheckboxRef = useRef<HTMLInputElement | null>(null);
  const [popoverOpenId, setPopoverOpenId] = useState<string | null>(null);
  const [switchingCenterId, setSwitchingCenterId] = useState<string | null>(
    null
  );
  const setOrganizationDetails = useAuthStore((s) => s.setOrganizationDetails);

  const handleMarkCenterAsCurrent = async (center: Center) => {
    setSwitchingCenterId(center.id);
    try {
      const response = await apis.SwitchOrganizationcenter({
        organization_id: organizationId,
        center_id: center.uid,
      });

      const switchDetails = response.data.switchAccessDetails;

      // Merge only center-related fields into store
      const currentDetails = useAuthStore.getState().organizationDetails;
      // @ts-expect-error: allow baseDetails
      const baseDetails: import("../../../GlobalStore/store").OrganizationDetails =
        currentDetails ?? {
          organization_id: switchDetails.organization_id || "",
          organization_name: switchDetails.organization_name || "",
          center_name: switchDetails.center_name ?? null,
          user_id: "",
          name: "",
          email: "",
          mobile: "",
          user_role: "",
          user_type: "",
          central_account_id: switchDetails.central_account_id || "",
          time_zone: switchDetails.time_zone || "",
          currency: switchDetails.currency ?? null,
          country: switchDetails.country ?? null,
          access: switchDetails.access ?? null,
          center_id: switchDetails.center_id ?? null,
          image: switchDetails.image ?? null,
        };
      // @ts-expect-error: allow updatedDetails

      const updatedDetails: import("../../../GlobalStore/store").OrganizationDetails =
        {
          ...baseDetails,
          center_id: switchDetails.center_id,
        };

      setOrganizationDetails(updatedDetails);

      // Refetch sidebar menu after center switch
      try {
        const sidebarResp = await apis.GetSidebarData();
        if (sidebarResp?.data) {
          useSidebarStore.getState().setSidebar(sidebarResp.data);
          console.log("Sidebar updated after center switch:", sidebarResp.data);
        }
      } catch (e) {
        console.error("Failed to fetch sidebar after center switch:", e);
      }

      notifications.show({
        title: "Success",
        message: `Switched to center ${center.name}`,
        color: "green",
        autoClose: 3000,
      });

      setPopoverOpenId(null);
    } catch (error) {
      console.error("Error switching center:", error);
      notifications.show({
        title: "Error",
        message: "Failed to switch center",
        color: "red",
        autoClose: 3000,
      });
    } finally {
      setSwitchingCenterId(null);
    }
  };

  // Note: API calls are now managed by parent (ClinicList), this component is presentational

  // Map API center objects to Row shape
  const paginated: Row[] = (centerData || []).map((c: Center, idx: number) => ({
    id: Number(c.id) || idx + 1,
    logoColor:
      c.type === "Clinic"
        ? "bg-green-100"
        : c.type === "Diagnostic"
        ? "bg-purple-100"
        : "bg-gray-100",
    centerName: c.name || "",
    type:
      c.type ||
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ((c.is_clinic as any) === "1" ? "Clinic" : "Diagnostic"),
    location: c.address?.address || "",
    contactPerson: c.primary_contact || "",
    providers: 0,
    status:
      c.status === "Active" || c.status === "active" ? "Active" : "Inactive",
    // keep original center for actions
    __center: c,
  }));

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
    const ids = paginated.map((r: Row) => Number(r.id));
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
      render: (r) => (
        <Popover
          position="bottom"
          withArrow
          shadow="md"
          opened={popoverOpenId === String(r.id)}
          onClose={() => setPopoverOpenId(null)}
        >
          <Popover.Target>
            <button
              className="p-1 text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-0 focus-visible:outline-none"
              onClick={(e) => {
                e.stopPropagation();
                setPopoverOpenId(
                  popoverOpenId === String(r.id) ? null : String(r.id)
                );
              }}
            >
              <IconDots className="rotate-90" />
            </button>
          </Popover.Target>
          <Popover.Dropdown>
            <div className="flex flex-col gap-2 min-w-max">
              <Button
                variant="subtle"
                size="xs"
                onClick={() =>
                  handleMarkCenterAsCurrent(
                    (r as unknown as { __center?: Center }).__center as Center
                  )
                }
                loading={switchingCenterId === String(r.id)}
              >
                Mark as Current
              </Button>
            </div>
          </Popover.Dropdown>
        </Popover>
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
            value={selectedType ?? "All Countries"}
            onChange={(v) => {
              const val: string | undefined = v ?? undefined;
              onTypeChange(val === "All Countries" ? undefined : val);
            }}
          />

          <Select
            placeholder="All Status"
            data={["All Status", "Active", "Inactive"]}
            classNames={{
              input:
                "border rounded-md px-3 py-2 text-sm bg-white focus:outline-none focus:ring-0 focus-visible:outline-none",
            }}
            value={selectedStatus ?? "All Status"}
            onChange={(v) => {
              const val: string | undefined = v ?? undefined;
              onStatusChange(val === "All Status" ? undefined : val);
            }}
          />

          <Button
            onClick={() => navigate("/centers/add")}
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
        <div>
          Showing {(page - 1) * pageSize + 1} to{" "}
          {Math.min(page * pageSize, total)} of {total} entries
        </div>

        <div className="inline-flex items-center gap-2">
          <button
            className="px-3 py-1 border rounded text-gray-600"
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
            onClick={() => onPageChange(page + 1)}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default ClinicTable;
