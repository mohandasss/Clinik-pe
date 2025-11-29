import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { notifications } from "@mantine/notifications";
import { Button, Select } from "@mantine/core";
import { DataTable, type DataTableColumn } from "mantine-datatable";
import { IconDots, IconPlus } from "@tabler/icons-react";
import { Popover } from "@mantine/core";
import apis from "../../APis/Api";
import useAuthStore from "../../GlobalStore/store";
import useDropdownStore from "../../GlobalStore/useDropdownStore";
import type { Department, AvailabilityItem } from "../../APis/Types";

// ============================================================================
// Types
// ============================================================================

type AvailabilityDisplayItem = AvailabilityItem & {
  departmentName?: string;
  categoryName?: string;
  itemName?: string;
  principalName?: string;
};

// ============================================================================
// Constants
// ============================================================================

const PAGE_SIZE = 5;

// ============================================================================
// Main Component
// ============================================================================

const TestAvailibility = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [selectedStatus, setSelectedStatus] = useState<string | undefined>(
    undefined
  );
  const [selectedDepartment, setSelectedDepartment] = useState<string | null>(
    "all"
  );
  const [departments, setDepartments] = useState<Department[]>([]);
  const [items, setItems] = useState<AvailabilityDisplayItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [popoverOpenId, setPopoverOpenId] = useState<string | null>(null);
  const [selected, setSelected] = useState<string[]>([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  const organizationDetails = useAuthStore(
    (state) => state.organizationDetails
  );
  const selectedCenter = useDropdownStore((state) => state.selectedCenter);

  const orgId = organizationDetails?.organization_id ?? "";
  const centerId =
    selectedCenter?.center_id ?? organizationDetails?.center_id ?? "";

  // Fetch departments
  useEffect(() => {
    const fetchDepartments = async () => {
      if (!orgId || !centerId) return;

      try {
        const response = await apis.GetAllDepartments(orgId, centerId);
        if (response?.success && response?.data?.departments) {
          setDepartments(response.data.departments);
        }
      } catch (error) {
        console.error("Failed to fetch departments:", error);
        notifications.show({
          title: "Error",
          message: "Failed to load departments",
          color: "red",
        });
      }
    };

    fetchDepartments();
  }, [orgId, centerId]);

  // Fetch test availability
  useEffect(() => {
    const fetchTestAvailability = async () => {
      if (!orgId || !centerId) return;

      setIsLoading(true);
      try {
        const response = await apis.GetTestAvailability(orgId, centerId);
        if (response?.success && response?.data?.tests) {
          // Map API response to display format
          const displayItems: AvailabilityDisplayItem[] =
            response.data.tests.map((item: AvailabilityItem) => ({
              ...item,
              departmentName: item.department_id || "-",
              categoryName: item.category_id || "-",
              itemName: item.reference || "-",
              principalName: item.principal_id || "-",
            }));
          setItems(displayItems);
          setTotalRecords(response.data.pagination?.totalRecords || 0);
          setPageSize(response.data.pagination?.pageSize || 10);
        }
      } catch (error) {
        console.error("Failed to fetch test availability:", error);
        notifications.show({
          title: "Error",
          message: "Failed to load test availability",
          color: "red",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchTestAvailability();
  }, [orgId, centerId]);

  // Filter items based on status and department
  const filteredItems = useMemo(() => {
    let filtered = items;

    if (selectedStatus && selectedStatus !== "All Status") {
      filtered = filtered.filter((item) => item.status === selectedStatus);
    }

    if (selectedDepartment && selectedDepartment !== "all") {
      filtered = filtered.filter(
        (item) => item.department_id === selectedDepartment
      );
    }

    return filtered;
  }, [items, selectedStatus, selectedDepartment]);

  const toggleRow = (id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    const ids = filteredItems.map((r) => r.id);
    const allSelected = ids.every((id) => selected.includes(id));
    if (allSelected) {
      setSelected((prev) => prev.filter((id) => !ids.includes(id)));
    } else {
      setSelected((prev) => Array.from(new Set([...prev, ...ids])));
    }
  };

  const handleAddAvailability = () => {
    navigate("/test-availability/add");
  };

  const columns: DataTableColumn<AvailabilityDisplayItem>[] = [
    {
      accessor: "select",
      width: 40,
      title: (
        <input
          type="checkbox"
          className="focus:outline-none focus:ring-0"
          checked={
            filteredItems.length > 0 &&
            filteredItems.every((r) => selected.includes(r.id))
          }
          onChange={toggleSelectAll}
        />
      ),
      render: (r) => (
        <input
          type="checkbox"
          className="focus:outline-none focus:ring-0"
          checked={selected.includes(r.id)}
          onChange={() => toggleRow(r.id)}
        />
      ),
    },
    {
      accessor: "departmentName",
      title: "Department",
      render: (r) => (
        <div className="text-gray-800 font-medium">{r.departmentName}</div>
      ),
    },
    {
      accessor: "type",
      title: "Type",
      render: (r) => (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          {r.type}
        </span>
      ),
    },
    {
      accessor: "reference",
      title: "Item Name",
      render: (r) => <div className="text-gray-800">{r.reference || "-"}</div>,
    },
    {
      accessor: "purpose",
      title: "Purpose",
      render: (r) => (
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            r.purpose === "Home Collection"
              ? "bg-purple-100 text-purple-800"
              : "bg-cyan-100 text-cyan-800"
          }`}
        >
          {r.purpose}
        </span>
      ),
    },
    {
      accessor: "principal_id",
      title: "Assigned To",
      render: (r) => (
        <div>
          <div className="text-gray-800 font-medium">
            {r.principal_id || "-"}
          </div>
          <div className="text-gray-500 text-xs">{r.principal_type || "-"}</div>
        </div>
      ),
    },
    {
      accessor: "capacity",
      title: "Capacity",
      render: (r) => (
        <div className="text-gray-600">
          {r.capacity} / {r.period || "-"}
        </div>
      ),
    },
    {
      accessor: "slot_duration",
      title: "Slot Duration",
      render: (r) => (
        <div className="text-gray-600">{r.slot_duration || "-"} mins</div>
      ),
    },
    {
      accessor: "time_start",
      title: "Time",
      render: (r) => (
        <div>
          {r.is_24hrs === "1" ? (
            <span className="inline-flex items-center px-2 py-1 rounded bg-green-100 text-green-700 text-xs font-medium">
              24/7 Available
            </span>
          ) : (
            <div className="text-gray-600 text-sm">
              {r.time_start} - {r.time_end}
            </div>
          )}
        </div>
      ),
    },
    {
      accessor: "weekday",
      title: "Days",
      render: (r) => (
        <div className="text-gray-600 text-sm capitalize">
          {r.weekday || "-"}
        </div>
      ),
    },
    {
      accessor: "status",
      title: "Status",
      render: (r) =>
        r.status === "Active" ? (
          <span className="inline-flex items-center px-3 py-1 rounded-full bg-green-100 text-green-600 text-xs font-medium">
            Active
          </span>
        ) : (
          <span className="inline-flex items-center px-3 py-1 rounded-full bg-gray-100 text-gray-600 text-xs font-medium">
            Inactive
          </span>
        ),
    },
    {
      accessor: "action",
      title: "Action",
      width: 80,
      render: (r) => (
        <Popover
          position="bottom"
          withArrow
          shadow="md"
          opened={popoverOpenId === r.id}
          onClose={() => setPopoverOpenId(null)}
        >
          <Popover.Target>
            <button
              className="p-1 text-gray-400 hover:text-gray-600 focus:outline-none"
              onClick={(e) => {
                e.stopPropagation();
                setPopoverOpenId(popoverOpenId === r.id ? null : r.id);
              }}
            >
              <IconDots className="rotate-90" size={18} />
            </button>
          </Popover.Target>
          <Popover.Dropdown>
            <div className="flex flex-col gap-2 min-w-max">
              <Button variant="subtle" size="xs">
                Edit
              </Button>
              <Button variant="subtle" size="xs" color="red">
                Delete
              </Button>
            </div>
          </Popover.Dropdown>
        </Popover>
      ),
    },
  ];

  const pageCount =
    Math.ceil(totalRecords / pageSize) ||
    Math.ceil(filteredItems.length / PAGE_SIZE);
  const paginatedItems = filteredItems.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE
  );

  return (
    <div className="space-y-6 p-0">
      <div className="bg-white rounded-lg shadow-sm p-4 ring-1 ring-gray-100">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-800">
              Test Availability
            </h2>
            <p className="text-sm text-gray-500">
              Manage test, panel, and package availability schedules
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Select
              placeholder="All Status"
              data={["All Status", "Active", "Inactive"]}
              classNames={{
                input:
                  "border rounded-md px-3 py-2 text-sm bg-white focus:outline-none focus:ring-0",
              }}
              value={selectedStatus ?? "All Status"}
              onChange={(v) => {
                setSelectedStatus(
                  v === "All Status" ? undefined : v ?? undefined
                );
                setPage(1);
              }}
            />
            <Select
              placeholder="All Departments"
              data={[
                { label: "All Departments", value: "all" },
                ...departments.map((d) => ({ label: d.name, value: d.uid })),
              ]}
              value={selectedDepartment ?? undefined}
              onChange={(v) => {
                setSelectedDepartment(v ?? null);
                setPage(1);
              }}
              searchable
              clearable
              classNames={{
                input:
                  "border rounded-md px-3 py-2 text-sm bg-white focus:outline-none focus:ring-0",
              }}
            />
            <Button
              onClick={handleAddAvailability}
              color="blue"
              size="sm"
              leftSection={<IconPlus size={16} />}
            >
              Add Availability
            </Button>
          </div>
        </div>

        <div className="-mx-4 h-px bg-gray-200 mb-3"></div>

        {/* DataTable */}
        <DataTable
          records={paginatedItems}
          columns={columns}
          highlightOnHover
          className="text-sm"
          striped={false}
          idAccessor="id"
          fetching={isLoading}
          minHeight={300}
          noRecordsText="No test availabilities found"
        />

        {/* Pagination */}
        <div className="flex items-center justify-between text-sm text-gray-500 mt-4">
          <div>
            Showing{" "}
            {filteredItems.length === 0 ? 0 : (page - 1) * PAGE_SIZE + 1} to{" "}
            {Math.min(page * PAGE_SIZE, filteredItems.length)} of{" "}
            {filteredItems.length} entries
          </div>

          <div className="inline-flex items-center gap-2">
            <button
              className="px-3 py-1 border rounded text-gray-600 disabled:opacity-50"
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
                    page === n
                      ? "bg-blue-600 text-white"
                      : "border text-gray-600"
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>

            <button
              className="px-3 py-1 border rounded text-gray-600 disabled:opacity-50"
              disabled={page >= pageCount}
              onClick={() => setPage(page + 1)}
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestAvailibility;
