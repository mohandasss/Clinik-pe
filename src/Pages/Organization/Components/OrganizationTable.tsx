import React, { useEffect, useRef, useState, useMemo } from "react";
import { DataTable, type DataTableColumn } from "mantine-datatable";
import { IconDots } from "@tabler/icons-react";
import { Button, Select, Popover } from "@mantine/core";
import { useNavigate } from "react-router-dom";
import type { Organization } from "../../../APis/Types";
import useAuthStore from "../../../GlobalStore/store";
import useSidebarStore from "../../../GlobalStore/sidebarStore";
import apis from "../../../APis/Api";
import { notifications } from "@mantine/notifications";

const OrganizationTable: React.FC<{
  orgData?: Organization[];
  total?: number;
  page?: number;
  pageSize?: number;
  onPageChange?: (page: number) => void;
  onCountryChange?: (country: string | null) => void;
  onStatusChange?: (status: string | null) => void;
  selectedCountry?: string | null;
  selectedStatus?: string | null;
}> = ({
  orgData = [],
  total,
  page: parentPage,
  pageSize: parentPageSize,
  onPageChange,
  onCountryChange,
  onStatusChange,
  selectedCountry,
  selectedStatus,
}) => {
  const navigate = useNavigate();
  const setOrganizationDetails = useAuthStore((s) => s.setOrganizationDetails);
  console.log("OrganizationTable rendered", orgData);

  const [localPage, setLocalPage] = useState(1);
  const [selected, setSelected] = useState<string[]>([]);
  const [switchingOrgId, setSwitchingOrgId] = useState<string | null>(null);
  const [popoverOpenId, setPopoverOpenId] = useState<string | null>(null);
  const headerCheckboxRef = useRef<HTMLInputElement | null>(null);
  const pageSize = parentPageSize ?? 5; // server page size
  console.log("orgData:", orgData);
  const currentPage = parentPage ?? localPage;
  const records = useMemo(() => orgData ?? [], [orgData]);
  const totalRecords = total ?? records.length;
  const pageCount = Math.max(1, Math.ceil((totalRecords ?? 0) / pageSize));

  const toggleRow = (id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    const ids = records.map((r) => r.id);
    const allSelected =
      ids.length > 0 && ids.every((id) => selected.includes(id));
    if (allSelected) {
      // remove these ids
      setSelected((prev) => prev.filter((id) => !ids.includes(id)));
    } else {
      // add visible ids
      setSelected((prev) => Array.from(new Set([...prev, ...ids])));
    }
  };

  const handleAdd = () => {
    navigate("/organization/add");
  };

  const handleMarkAsCurrent = async (org: Organization) => {
    setSwitchingOrgId(org.id);
    try {
      const response = await apis.SwitchOrganizationcenter({
        organization_id: org.uid, // Send the organization uid as organization_id
      });

      console.log("Switch Organization Response:", response);

      // Update only organization-related fields in the auth store (do NOT modify auth tokens)
      const switchDetails = response.data.switchAccessDetails;
      // Read current details and merge organization-specific fields to avoid overwriting user identity
      const currentDetails = useAuthStore.getState().organizationDetails;
      // Ensure we have all required fields when updating the persisted store.
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

      const updatedDetails: import("../../../GlobalStore/store").OrganizationDetails =
        {
          ...baseDetails,
          organization_id: switchDetails.organization_id,
          organization_name: switchDetails.organization_name,
          central_account_id: switchDetails.central_account_id,
          time_zone: switchDetails.time_zone,
          currency: switchDetails.currency,
          country: switchDetails.country,
          access: switchDetails.access,
          center_id: switchDetails.center_id,
          image: switchDetails.image,
        };

      setOrganizationDetails(updatedDetails);

      // Refetch sidebar menu after organization switch
      try {
        const sidebarResp = await apis.GetSidebarData();
        if (sidebarResp?.data) {
          useSidebarStore.getState().setSidebar(sidebarResp.data);
          console.log(
            "Sidebar updated after organization switch:",
            sidebarResp.data
          );
        }
      } catch (e) {
        console.error("Failed to fetch sidebar after organization switch:", e);
      }

      notifications.show({
        title: "Success",
        message: `Switched to ${org.name}`,
        color: "green",
        autoClose: 3000,
      });

      setPopoverOpenId(null);
    } catch (error) {
      console.error("Error switching organization:", error);
      notifications.show({
        title: "Error",
        message: "Failed to switch organization",
        color: "red",
        autoClose: 3000,
      });
    } finally {
      setSwitchingOrgId(null);
    }
  };
  useEffect(() => {
    const ids = records.map((r) => r.id);
    const someSelected = ids.some((id) => selected.includes(id));
    const allSelected =
      ids.length > 0 && ids.every((id) => selected.includes(id));
    if (headerCheckboxRef.current) {
      headerCheckboxRef.current.indeterminate = someSelected && !allSelected;
    }
  }, [records, selected]);

  // No data fetching here — parent component must provide paginated data and control page changes.

  const columns: DataTableColumn<Organization>[] = [
    {
      accessor: "select",
      width: 40,
      title: (
        <input
          ref={headerCheckboxRef}
          type="checkbox"
          className="focus:outline-none focus:ring-0 focus-visible:outline-none"
          checked={
            records.length > 0 && records.every((r) => selected.includes(r.id))
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
      title: "Organization Name",
      render: (r) => (
        <div className="flex items-center gap-3">
          <div
            className={`w-8 h-8 rounded-md flex items-center justify-center bg-gray-100 text-gray-700`}
          >
            {r.name ? r.name.charAt(0).toUpperCase() : "O"}
          </div>
          <div className="text-gray-800">{r.name}</div>
        </div>
      ),
    },
    { accessor: "country", title: "Country" },
    { accessor: "time_zone", title: "Timezone", render: (r) => r.time_zone },
    {
      accessor: "center_count",
      title: "Centers",
      render: (r) => {
        // center_count may not be declared on Organization type, so guard access safely
        const maybe: unknown = r;
        return (maybe as { center_count?: number }).center_count ?? 0;
      },
    },
    {
      accessor: "status",
      title: "Status",
      render: (r) =>
        (r.status ?? "").toLowerCase() === "active" ? (
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
      render: (org) => (
        <Popover
          position="bottom"
          withArrow
          shadow="md"
          opened={popoverOpenId === org.id}
          onClose={() => setPopoverOpenId(null)}
        >
          <Popover.Target>
            <button
              className="p-1 text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-0 focus-visible:outline-none"
              onClick={(e) => {
                // toggle popover for this row
                e.stopPropagation();
                setPopoverOpenId(popoverOpenId === org.id ? null : org.id);
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
                onClick={() => handleMarkAsCurrent(org)}
                loading={switchingOrgId === org.id}
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
        <h2 className="text-lg font-semibold text-gray-800">Organizations</h2>

        <div className="flex items-center gap-3">
          <Select
            placeholder="All Countries"
            data={["All Countries", "India", "United States"]}
            value={
              selectedCountry === null || selectedCountry === "All Countries"
                ? null
                : selectedCountry
            }
            onChange={(val) => {
              onCountryChange?.(val === "All Countries" ? null : val);
            }}
            clearable
            classNames={{
              input:
                "border rounded-md px-3 py-2 text-sm bg-white focus:outline-none focus:ring-0 focus-visible:outline-none",
            }}
          />

          <Select
            placeholder="All Status"
            data={["All Status", "Active", "Inactive"]}
            value={
              selectedStatus === null || selectedStatus === "All Status"
                ? null
                : selectedStatus
            }
            onChange={(val) => {
              onStatusChange?.(val === "All Status" ? null : val);
            }}
            clearable
            classNames={{
              input:
                "border rounded-md px-3 py-2 text-sm bg-white focus:outline-none focus:ring-0 focus-visible:outline-none",
            }}
          />

          <Button
            onClick={handleAdd}
            variant="filled"
            color="blue"
            className="inline-flex items-center gap-2 text-sm px-3 py-2 rounded-md"
          >
            + Add Organization
          </Button>
        </div>
      </div>
      <div className="-mx-4 h-px bg-gray-200 mb-3"></div>

      {/* Mantine DataTable */}
      <DataTable
        records={records}
        columns={columns}
        highlightOnHover
        className="text-sm"
        striped={false}
        idAccessor="id"
      />

      {/* Pagination */}
      <div className="flex items-center justify-between text-sm text-gray-500 mt-4">
        <div>
          Showing {records.length > 0 ? (currentPage - 1) * pageSize + 1 : 0} to{" "}
          {(currentPage - 1) * pageSize + records.length} of {totalRecords}{" "}
          entries
        </div>

        <div className="inline-flex items-center gap-2">
          <button
            className="px-3 py-1 border rounded text-gray-600"
            disabled={currentPage === 1}
            onClick={() => {
              const prev = Math.max(1, currentPage - 1);
              if (onPageChange) onPageChange(prev);
              else setLocalPage(prev);
            }}
          >
            Previous
          </button>

          <div className="inline-flex items-center gap-1">
            {Array.from({ length: pageCount }, (_, i) => i + 1).map((n) => (
              <button
                key={n}
                onClick={() => {
                  if (onPageChange) onPageChange(n);
                  else setLocalPage(n);
                }}
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
            disabled={currentPage === pageCount}
            onClick={() => {
              const next = Math.min(currentPage + 1, pageCount);
              if (onPageChange) onPageChange(next);
              else setLocalPage(next);
            }}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrganizationTable;
