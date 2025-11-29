import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Paper,
  Button,
  Text,
  Anchor,
  Select,
  NumberInput,
  Checkbox,
} from "@mantine/core";
import { IconArrowLeft, IconMinus, IconPlus } from "@tabler/icons-react";
import { notifications } from "@mantine/notifications";
import apis from "../../APis/Api";
import useAuthStore from "../../GlobalStore/store";
import useDropdownStore from "../../GlobalStore/useDropdownStore";
import type {
  Department,
  TestCategory,
  TestItem,
  OtherPanelItem,
  PackageItem,
} from "../../APis/Types";

// ============================================================================
// Types
// ============================================================================

type ItemType = "test" | "panel" | "package" | "special_package";
type PurposeType = "string"; // Will be set dynamically from API
type PrincipalType = "string"; // Will be set dynamically from API
type PeriodUnit = "day" | "week" | "month" | "year";

// ============================================================================
// Constants
// ============================================================================

const PERIOD_UNITS: { value: PeriodUnit; label: string }[] = [
  { value: "day", label: "Day" },
  { value: "week", label: "Week" },
  { value: "month", label: "Month" },
  { value: "year", label: "Year" },
];

const PERIOD_VALUES = Array.from({ length: 12 }, (_, i) => ({
  value: String(i + 1),
  label: String(i + 1),
}));

const DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

// ============================================================================
// Main Component
// ============================================================================

const AddTestAvailibility = () => {
  const navigate = useNavigate();

  // Organization context
  const organizationDetails = useAuthStore(
    (state) => state.organizationDetails
  );
  const selectedCenter = useDropdownStore((state) => state.selectedCenter);
  const orgId = organizationDetails?.organization_id ?? "";
  const centerId =
    selectedCenter?.center_id ?? organizationDetails?.center_id ?? "";

  // Form state
  const [selectedDepartment, setSelectedDepartment] = useState<string | null>(
    null
  );
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedItemType, setSelectedItemType] = useState<ItemType | null>(
    null
  );
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [selectedPurpose, setSelectedPurpose] = useState<PurposeType | null>(
    null
  );
  const [selectedPrincipalType, setSelectedPrincipalType] =
    useState<PrincipalType | null>(null);
  const [selectedPrincipal, setSelectedPrincipal] = useState<string | null>(
    null
  );
  const [capacity, setCapacity] = useState<number>(20);
  const [periodValue, setPeriodValue] = useState<string>("1");
  const [periodUnit, setPeriodUnit] = useState<PeriodUnit>("day");
  const [slotDuration, setSlotDuration] = useState<number>(15);
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [startTime, setStartTime] = useState<string>("09:00");
  const [endTime, setEndTime] = useState<string>("17:00");
  const [is24x7, setIs24x7] = useState(false);

  // Data state
  const [departments, setDepartments] = useState<Department[]>([]);
  const [categories, setCategories] = useState<TestCategory[]>([]);
  const [items, setItems] = useState<{ value: string; label: string }[]>([]);
  const [itemTypes, setItemTypes] = useState<
    { value: string; label: string }[]
  >([]);
  const [purposeTypes, setPurposeTypes] = useState<
    { value: string; label: string }[]
  >([]);
  const [principalTypes, setPrincipalTypes] = useState<
    { value: string; label: string }[]
  >([]);
  const [principals, setPrincipals] = useState<
    { value: string; label: string; type: string }[]
  >([]);

  // Loading states
  const [isLoadingDepartments, setIsLoadingDepartments] = useState(false);
  const [isLoadingCategories, setIsLoadingCategories] = useState(false);
  const [isLoadingItems, setIsLoadingItems] = useState(false);
  const [isLoadingItemTypes, setIsLoadingItemTypes] = useState(false);
  const [isLoadingPurposes, setIsLoadingPurposes] = useState(false);
  const [isLoadingPrincipals, setIsLoadingPrincipals] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ============================================================================
  // Fetch Availability Types
  // ============================================================================

  useEffect(() => {
    const fetchItemTypes = async () => {
      setIsLoadingItemTypes(true);
      try {
        const response = await apis.getAvailabilityTypes();
        if (response?.success && response?.data?.avaliablity_type) {
          const options = response.data.avaliablity_type.map((item: any) => ({
            value: item.uid,
            label: item.name,
          }));
          setItemTypes(options);
        }
      } catch (error) {
        console.error("Failed to fetch availability types:", error);
        notifications.show({
          title: "Error",
          message: "Failed to load availability types",
          color: "red",
        });
      } finally {
        setIsLoadingItemTypes(false);
      }
    };

    fetchItemTypes();
  }, []);

  // ============================================================================
  // Fetch Availability Purposes
  // ============================================================================

  useEffect(() => {
    const fetchPurposes = async () => {
      setIsLoadingPurposes(true);
      try {
        const response = await apis.getAvailabilityPurposes();
        if (response?.success && response?.data?.avaliablity_purpose) {
          const options = response.data.avaliablity_purpose.map(
            (item: any) => ({
              value: item.uid,
              label: item.name,
            })
          );
          setPurposeTypes(options);
        }
      } catch (error) {
        console.error("Failed to fetch availability purposes:", error);
        notifications.show({
          title: "Error",
          message: "Failed to load availability purposes",
          color: "red",
        });
      } finally {
        setIsLoadingPurposes(false);
      }
    };

    fetchPurposes();
  }, []);

  // ============================================================================
  // Fetch Availability Principals
  // ============================================================================

  useEffect(() => {
    const fetchPrincipals = async () => {
      setIsLoadingPrincipals(true);
      try {
        const response = await apis.getAvailabilityPrincipals();
        console.log("Principals response:", response);
        if (response?.success && response?.data?.avaliablity_principal) {
          // Treat the response as principal types
          const typeOptions = response.data.avaliablity_principal.map(
            (item: any) => ({
              value: item.uid,
              label: item.name,
            })
          );
          setPrincipalTypes(typeOptions);
          // Principals are empty for now
          setPrincipals([]);
        }
      } catch (error) {
        console.error("Failed to fetch availability principals:", error);
        notifications.show({
          title: "Error",
          message: "Failed to load availability principals",
          color: "red",
        });
      } finally {
        setIsLoadingPrincipals(false);
      }
    };

    fetchPrincipals();
  }, []);

  // ============================================================================
  // Fetch Departments
  // ============================================================================

  useEffect(() => {
    const fetchDepartments = async () => {
      if (!orgId || !centerId) return;

      setIsLoadingDepartments(true);
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
      } finally {
        setIsLoadingDepartments(false);
      }
    };

    fetchDepartments();
  }, [orgId, centerId]);

  // ============================================================================
  // Fetch Categories based on Department
  // ============================================================================

  useEffect(() => {
    const fetchCategories = async () => {
      if (!orgId || !centerId || !selectedDepartment) {
        setCategories([]);
        setSelectedCategory(null);
        return;
      }

      const department = departments.find((d) => d.uid === selectedDepartment);
      if (!department) return;

      setIsLoadingCategories(true);
      try {
        // Use department slug as the page parameter
        const response = await apis.GetOtherTestCategories(
          department.slug || department.name.toLowerCase(),
          orgId,
          centerId,
          1,
          100
        );
        if (response?.success && response?.data?.categorys) {
          setCategories(response.data.categorys);
        }
      } catch (error) {
        console.error("Failed to fetch categories:", error);
        notifications.show({
          title: "Error",
          message: "Failed to load categories",
          color: "red",
        });
      } finally {
        setIsLoadingCategories(false);
      }
    };

    fetchCategories();
  }, [orgId, centerId, selectedDepartment, departments]);

  // ============================================================================
  // Fetch Items based on Item Type and Department
  // ============================================================================

  // Reset selectedItem when selectedItemType changes
  useEffect(() => {
    setSelectedItem(null);
  }, [selectedItemType]);

  useEffect(() => {
    const fetchItems = async () => {
      if (!orgId || !centerId || !selectedDepartment || !selectedItemType) {
        setItems([]);
        return;
      }

      const department = departments.find((d) => d.uid === selectedDepartment);
      if (!department) return;

      const page = department.slug || department.name.toLowerCase();

      setIsLoadingItems(true);
      try {
        let fetchedItems: { value: string; label: string }[] = [];

        if (selectedItemType === "test") {
          const response = await apis.GetOtherTestDatabase(
            page,
            1,
            100,
            orgId,
            centerId,
            ""
          );
          if (response?.success && response?.data?.tests) {
            fetchedItems = response.data.tests.map((t: TestItem) => ({
              value: t.uid,
              label: t.name,
            }));
          }
        } else if (selectedItemType === "panel") {
          const response = await apis.GetOtherTestPanels(
            page,
            orgId,
            centerId,
            1,
            100
          );
          if (response?.success && response?.data?.panels) {
            fetchedItems = response.data.panels.map((p: OtherPanelItem) => ({
              value: p.panel_id || p.uid,
              label: p.name,
            }));
          }
        } else if (
          selectedItemType === "package" ||
          selectedItemType === "special_package"
        ) {
          const response = await apis.GetOtherTestPackage(
            page,
            1,
            100,
            orgId,
            centerId
          );
          if (response?.success && response?.data?.packages) {
            fetchedItems = response.data.packages.map((p: PackageItem) => ({
              value: p.uid,
              label: p.name,
            }));
          }
        }

        setItems(fetchedItems);
      } catch (error) {
        console.error("Failed to fetch items:", error);
        notifications.show({
          title: "Error",
          message: "Failed to load items",
          color: "red",
        });
      } finally {
        setIsLoadingItems(false);
      }
    };

    fetchItems();
  }, [orgId, centerId, selectedDepartment, selectedItemType, departments]);

  // ============================================================================
  // Calculate Duration
  // ============================================================================

  const calculateDuration = useMemo(() => {
    if (is24x7) return "24 hours";

    try {
      const [startHour, startMin] = startTime.split(":").map(Number);
      const [endHour, endMin] = endTime.split(":").map(Number);

      const startTotalMinutes = startHour * 60 + startMin;
      const endTotalMinutes = endHour * 60 + endMin;

      let diffMinutes = endTotalMinutes - startTotalMinutes;
      if (diffMinutes < 0) diffMinutes += 24 * 60; // Handle next day

      const hours = Math.floor(diffMinutes / 60);
      const minutes = diffMinutes % 60;

      if (hours === 0) return `${minutes}m`;
      if (minutes === 0) return `${hours}h`;
      return `${hours}h ${minutes}m`;
    } catch {
      return "Invalid";
    }
  }, [startTime, endTime, is24x7]);

  // ============================================================================
  // Filter Principals based on Selected Principal Type
  // ============================================================================

  const filteredPrincipals = useMemo(() => {
    if (!selectedPrincipalType) return [];
    return principals.filter((p) => p.type === selectedPrincipalType);
  }, [selectedPrincipalType, principals]);

  // ============================================================================
  // Handlers
  // ============================================================================

  const toggleDayButton = (day: string) => {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const handleDepartmentChange = (value: string | null) => {
    setSelectedDepartment(value);
    setSelectedCategory(null);
    setSelectedItem(null);
  };

  const handleItemTypeChange = (value: string | null) => {
    setSelectedItemType(value as ItemType | null);
    setSelectedItem(null);
  };

  const handlePrincipalTypeChange = (value: string | null) => {
    setSelectedPrincipalType(value as PrincipalType | null);
    setSelectedPrincipal(null);
  };

  const handle24HoursChange = (checked: boolean) => {
    setIs24x7(checked);
    if (checked) {
      setStartTime("00:00");
      setEndTime("23:59");
    }
  };

  // ============================================================================
  // Form Validation
  // ============================================================================

  const validateForm = (): boolean => {
    if (!selectedDepartment) {
      notifications.show({
        title: "Validation Error",
        message: "Please select a department",
        color: "red",
      });
      return false;
    }

    if (!selectedItemType) {
      notifications.show({
        title: "Validation Error",
        message: "Please select an item type",
        color: "red",
      });
      return false;
    }

    if (!selectedPurpose) {
      notifications.show({
        title: "Validation Error",
        message: "Please select a purpose",
        color: "red",
      });
      return false;
    }

    if (!selectedPrincipalType) {
      notifications.show({
        title: "Validation Error",
        message: "Please select a principal type",
        color: "red",
      });
      return false;
    }

    if (selectedDays.length === 0) {
      notifications.show({
        title: "Validation Error",
        message: "Please select at least one day",
        color: "red",
      });
      return false;
    }

    if (!is24x7) {
      const [startHour, startMin] = startTime.split(":").map(Number);
      const [endHour, endMin] = endTime.split(":").map(Number);
      const startTotalMinutes = startHour * 60 + startMin;
      const endTotalMinutes = endHour * 60 + endMin;

      if (startTotalMinutes >= endTotalMinutes) {
        notifications.show({
          title: "Validation Error",
          message: "Start time must be before end time",
          color: "red",
        });
        return false;
      }
    }

    return true;
  };

  // ============================================================================
  // Submit Handler
  // ============================================================================

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const payload = {
        weekday: selectedDays,
        department_id: selectedDepartment || "",
        category_id: selectedCategory || "",
        type: selectedItemType || "",
        reference: selectedItem || "",
        purpose: selectedPurpose || "",
        principal_type: selectedPrincipalType || "",
        principal_id: selectedPrincipal || "",
        capacity: capacity,
        period: periodValue,
        period_unit: periodUnit,
        slot_duration: slotDuration,
        time_start: is24x7 ? "" : startTime,
        time_end: is24x7 ? "" : endTime,
        duration: calculateDuration,
        is_24hrs: is24x7,
      };

      console.log("Submitting payload:", JSON.stringify(payload, null, 2));
      
         const response  =await apis.AddTestAvailability(orgId, centerId, payload);
      if( response.success){

        notifications.show({
        title: "Success",
        message: "Test availability added successfully",
        color: "green",
      });

      setTimeout(() => {
        navigate("/test-availability");
      }, 1500);
      
      }

     
    }
     catch (error) {
      console.error("Error adding availability:", error);
      notifications.show({
        title: "Error",
        message: "Failed to add test availability",
        color: "red",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // ============================================================================
  // Dropdown Options
  // ============================================================================

  const departmentOptions = departments.map((d) => ({
    value: d.uid,
    label: d.name,
  }));

  const categoryOptions = categories.map((c) => ({
    value: c.uid,
    label: c.name,
  }));

  const getItemLabel = () => {
    switch (selectedItemType) {
      case "test":
        return "Select Test";
      case "panel":
        return "Select Panel";
      case "package":
        return "Select Package";
      case "special_package":
        return "Select Special Package";
      default:
        return "Select Item";
    }
  };

  // ============================================================================
  // Render
  // ============================================================================

  return (
    <div className="p-0">
      {/* Back Button */}
      <div className="mb-4">
        <Anchor
          component="button"
          onClick={() => navigate("/test-availability")}
          className="flex items-center gap-2 px-3 py-1 hover:no-underline rounded-md text-blue-600 text-sm transition-colors duration-150 hover:bg-blue-50 no-underline"
        >
          <IconArrowLeft size={16} />
          <Text size="sm" fw={600} className="font-medium">
            Back to Test Availability
          </Text>
        </Anchor>
      </div>

      {/* Header */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900">
          Add Test Availability
        </h2>
        <p className="text-sm text-gray-600">
          Configure availability schedule for tests, panels, and packages.
        </p>
      </div>

      {/* Form Card */}
      <Paper withBorder radius="md" className="p-6">
        <form onSubmit={handleSubmit}>
          <div className="col-span-2">
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Days
            </label>
            <div className="flex my-4  flex-wrap gap-2">
              {DAYS.map((day) => (
                <button
                  key={day}
                  type="button"
                  onClick={() => toggleDayButton(day)}
                  className={`px-2 py-2 flex-1 rounded text-sm transition-colors ${
                    selectedDays.includes(day)
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 hover:bg-gray-200"
                  }`}
                >
                  {day}
                </button>
              ))}
            </div>
          </div>
          {/* Section: Test Selection */}
          <div className="mb-6">
            <h3 className="font-medium text-gray-900 mb-4">Test Selection</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Department */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-2">
                  Department <span className="text-red-500">*</span>
                </label>
                <Select
                  placeholder={
                    isLoadingDepartments ? "Loading..." : "Select Department"
                  }
                  data={departmentOptions}
                  value={selectedDepartment}
                  onChange={handleDepartmentChange}
                  searchable
                  clearable
                  disabled={isLoadingDepartments}
                  classNames={{
                    input: "text-sm",
                  }}
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-2">
                  Category
                </label>
                <Select
                  placeholder={
                    isLoadingCategories ? "Loading..." : "Select Category"
                  }
                  data={categoryOptions}
                  value={selectedCategory}
                  onChange={setSelectedCategory}
                  searchable
                  clearable
                  disabled={isLoadingCategories || !selectedDepartment}
                  classNames={{
                    input: "text-sm",
                  }}
                />
              </div>

              {/* Item Type */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-2">
                  Type <span className="text-red-500">*</span>
                </label>
                <Select
                  placeholder={
                    isLoadingItemTypes ? "Loading..." : "Select Type"
                  }
                  data={itemTypes}
                  value={selectedItemType}
                  onChange={handleItemTypeChange}
                  disabled={!selectedDepartment || isLoadingItemTypes}
                  searchable
                  clearable
                  classNames={{
                    input: "text-sm",
                  }}
                />
              </div>

              {/* Item Selection */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-2">
                  {getItemLabel()}
                </label>
                <Select
                  placeholder={isLoadingItems ? "Loading..." : getItemLabel()}
                  data={items}
                  value={selectedItem}
                  onChange={setSelectedItem}
                  searchable
                  clearable
                  disabled={isLoadingItems || !selectedItemType}
                  classNames={{
                    input: "text-sm",
                  }}
                />
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="h-px bg-gray-200 mb-6"></div>

          {/* Section: Assignment */}
          <div className="mb-6">
            <h3 className="font-medium text-gray-900 mb-4">Assignment</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Purpose */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-2">
                  Purpose <span className="text-red-500">*</span>
                </label>
                <Select
                  placeholder={
                    isLoadingPurposes ? "Loading..." : "Select Purpose"
                  }
                  data={purposeTypes}
                  value={selectedPurpose}
                  onChange={(v) => setSelectedPurpose(v as PurposeType | null)}
                  disabled={isLoadingPurposes}
                  searchable
                  clearable
                  classNames={{
                    input: "text-sm",
                  }}
                />
              </div>

              {/* Principal Type */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-2">
                  Principal Type <span className="text-red-500">*</span>
                </label>
                <Select
                  placeholder={
                    isLoadingPrincipals ? "Loading..." : "Select Principal Type"
                  }
                  data={principalTypes}
                  value={selectedPrincipalType}
                  onChange={handlePrincipalTypeChange}
                  disabled={isLoadingPrincipals}
                  searchable
                  clearable
                  classNames={{
                    input: "text-sm",
                  }}
                />
              </div>

              {/* Principal */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-2">
                  {selectedPrincipalType
                    ? principalTypes.find(
                        (p) => p.value === selectedPrincipalType
                      )?.label
                    : "Principal"}
                </label>
                <Select
                  placeholder={
                    selectedPrincipalType
                      ? `Select ${
                          principalTypes.find(
                            (p) => p.value === selectedPrincipalType
                          )?.label
                        }`
                      : "Select Principal"
                  }
                  data={filteredPrincipals}
                  value={selectedPrincipal}
                  onChange={setSelectedPrincipal}
                  searchable
                  clearable
                  disabled={
                    !selectedPrincipalType || filteredPrincipals.length === 0
                  }
                  classNames={{
                    input: "text-sm",
                  }}
                />
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="h-px bg-gray-200 mb-6"></div>

          {/* Section: Capacity & Slots */}
          <div className="mb-6">
            <h3 className="font-medium text-gray-900 mb-4">Capacity & Slots</h3>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-4 items-end">
              {/* Capacity */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-2">
                  Capacity
                </label>
                <div className="flex items-center gap-1">
                  <Button
                    type="button"
                    variant="light"
                    size="sm"
                    className="px-4"
                    onClick={() => setCapacity(Math.max(1, capacity - 1))}
                  >
                    <IconMinus size={14} />
                  </Button>
                  <NumberInput
                    value={capacity}
                    onChange={(v) => setCapacity(typeof v === "number" ? v : 1)}
                    min={1}
                    max={1000}
                    hideControls
                    classNames={{
                      input: "text-sm text-center w-14",
                    }}
                  />
                  <Button
                    type="button"
                    variant="light"
                    size="sm"
                    className="px-4"
                    onClick={() => setCapacity(capacity + 1)}
                  >
                    <IconPlus size={14} />
                  </Button>
                </div>
              </div>

              {/* Period */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-2">
                  Period
                </label>
                <div className="flex gap-1">
                  <Select
                    data={PERIOD_VALUES}
                    value={periodValue}
                    onChange={(v) => setPeriodValue(v || "1")}
                    classNames={{
                      input: "text-sm",
                    }}
                    styles={{ input: { width: 60 } }}
                  />
                  <Select
                    data={PERIOD_UNITS}
                    value={periodUnit}
                    onChange={(v) => setPeriodUnit((v as PeriodUnit) || "day")}
                    classNames={{
                      input: "text-sm",
                    }}
                    styles={{ input: { width: 95 } }}
                  />
                </div>
              </div>

              {/* Slot Duration */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-2">
                  Slot Duration
                </label>
                <div className="flex items-center gap-1">
                  <NumberInput
                    value={slotDuration}
                    onChange={(v) =>
                      setSlotDuration(typeof v === "number" ? v : 15)
                    }
                    min={5}
                    max={480}
                    step={5}
                    classNames={{
                      input: "text-sm w-21",
                    }}
                  />
                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-2 rounded-md">
                    mins
                  </span>
                </div>
              </div>

              {/* 24 Hours Checkbox */}
              <div className="flex items-center h-9 min-h-9">
                <Checkbox
                  className=" ml-2"
                  label="24 Hrs Available"
                  checked={is24x7}
                  onChange={(e) => handle24HoursChange(e.currentTarget.checked)}
                  classNames={{
                    label: "text-sm  font-medium text-gray-700",
                  }}
                />
              </div>

              {/* Start Time */}
              <div style={{ visibility: is24x7 ? "hidden" : "visible" }}>
                <label className="block text-xs font-medium text-gray-600 mb-2">
                  Start Time
                </label>
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.currentTarget.value)}
                  className="w-full text-sm px-2 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              {/* End Time */}
              <div style={{ visibility: is24x7 ? "hidden" : "visible" }}>
                <label className="block text-xs font-medium text-gray-600 mb-2">
                  End Time
                </label>
                <input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.currentTarget.value)}
                  className="w-full text-sm px-2 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              {/* Duration Display */}
              <div style={{ visibility: is24x7 ? "hidden" : "visible" }}>
                <label className="block text-xs font-medium text-gray-600 mb-2">
                  Duration
                </label>
                <div className="flex items-center h-9 px-3 bg-blue-50 border border-blue-200 rounded-md">
                  <Text size="sm" className="font-medium text-blue-700">
                    {calculateDuration}
                  </Text>
                </div>
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="h-px bg-gray-200 mb-6"></div>

          {/* Submit Buttons */}
          <div className="flex justify-start gap-3">
            <Button
              variant="light"
              onClick={() => navigate("/test-availability")}
            >
              Cancel
            </Button>
            <Button type="submit" color="blue" loading={isSubmitting}>
              Add Availability
            </Button>
          </div>
        </form>
      </Paper>
    </div>
  );
};

export default AddTestAvailibility;
