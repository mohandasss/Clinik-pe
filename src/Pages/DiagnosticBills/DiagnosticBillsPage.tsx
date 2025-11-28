import React, { useState } from "react";
import { Button, TextInput, Select } from "@mantine/core";
import { IconPlus, IconSearch, IconX } from "@tabler/icons-react";
import { useNavigate } from "react-router-dom";
import BillsTable from "./Components/BillsTable";

interface BillFilters {
  duration: string;
  dateRange: [Date | null, Date | null];
  regNo: string;
  patientFirstName: string;
  referredBy: string;
  collectionCentre: string;
  sampleCollectionAgent: string;
  hasDue: boolean;
  cancelled: boolean;
}

const DiagnosticBillsPage: React.FC = () => {
  const navigate = useNavigate();

  const [filters, setFilters] = useState<BillFilters>({
    duration: "past-7-days",
    dateRange: [new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), new Date()],
    regNo: "",
    patientFirstName: "",
    referredBy: "",
    collectionCentre: "",
    sampleCollectionAgent: "",
    hasDue: false,
    cancelled: false,
  });

  const [page, setPage] = useState(1);
  const pageSize = 5;

  const durationOptions = [
    { value: "past-7-days", label: "Past 7 days" },
    { value: "past-30-days", label: "Past 30 days" },
    { value: "past-90-days", label: "Past 90 days" },
    { value: "custom", label: "Custom" },
  ];

  const handleFilterChange = <K extends keyof BillFilters>(
    key: K,
    value: BillFilters[K]
  ) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleSearch = () => {
    // Trigger search with current filters
    setPage(1);
    console.log("Searching with filters:", filters);
  };

  const handleClear = () => {
    setFilters({
      duration: "past-7-days",
      dateRange: [new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), new Date()],
      regNo: "",
      patientFirstName: "",
      referredBy: "",
      collectionCentre: "",
      sampleCollectionAgent: "",
      hasDue: false,
      cancelled: false,
    });
    setPage(1);
  };

  const handleAddNewCase = () => {
    navigate("/bills/add");
  };

  const [referredByOptions] = useState([
    { value: "ref-1", label: "Dr. John Doe" },
    { value: "ref-2", label: "Dr. M. Smith" },
  ]);

  return (
    <div className="space-y-6 p-0">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-800">All bills</h1>
        <Button
          leftSection={<IconPlus size={16} />}
          onClick={handleAddNewCase}
          variant="filled"
          color="blue"
        >
          Add new case
        </Button>
      </div>
      {/* Filters Section */}
      <div className="bg-white rounded-lg shadow-sm p-6 ring-1 ring-gray-100">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          {/* Duration */}
          <div className="w-full">
            <label className="text-xs font-medium text-gray-600 mb-2 flex items-center gap-1">
              Duration
              <span
                className="text-gray-400 cursor-help"
                title="Filter by date range"
              >
                ⓘ
              </span>
            </label>
            <Select
              data={durationOptions}
              value={filters.duration}
              onChange={(value) =>
                handleFilterChange("duration", value || "past-7-days")
              }
              placeholder="Select duration"
            />
          </div>

          {/* Patient first name */}
          <div className="w-full">
            <label className="text-xs font-medium text-gray-600 mb-2 block">
              Patient first name
            </label>
            <TextInput
              value={filters.patientFirstName}
              onChange={(e) =>
                handleFilterChange("patientFirstName", e.target.value)
              }
              placeholder="Enter patient name"
            />
          </div>

          {/* Referred by + Action Buttons */}
          <div className="w-full flex flex-col gap-2">
            <label className="text-xs font-medium text-gray-600 block">
              Referred by
            </label>
            <div className="flex gap-2">
              <Select
                data={referredByOptions}
                value={filters.referredBy}
                onChange={(value) =>
                  handleFilterChange("referredBy", value || "")
                }
                placeholder="Select referrer"
                searchable
                className="flex-1"
              />
              <div className="flex gap-2">
                <Button
                  leftSection={<IconSearch size={16} />}
                  onClick={handleSearch}
                  variant="filled"
                  color="blue"
                  size="sm"
                >
                  Search
                </Button>
                <Button
                  leftSection={<IconX size={16} />}
                  onClick={handleClear}
                  variant="default"
                  size="sm"
                >
                  Clear
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Bills Table */}
      <BillsTable
        page={page}
        pageSize={pageSize}
        onPageChange={setPage}
        onAddNew={handleAddNewCase}
      />
    </div>
  );
};

export default DiagnosticBillsPage;
