import React, { useEffect, useState, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Paper,
  TextInput,
  Button,
  Text,
  Anchor,
  Select,
  Textarea,
  Checkbox,
  NumberInput,
  Tabs,
} from "@mantine/core";
import { IconArrowLeft } from "@tabler/icons-react";
import apis from "../../APis/Api";
import useAuthStore from "../../GlobalStore/store";
import { notifications } from "@mantine/notifications";
import type { TestCategory, Unit } from "../../APis/Types";
import DisplayTabs, {
  type DisplayTabsData,
} from "../../components/Global/DisplayTabs";
import RichEditor from "../../components/Global/RichEditor";
import type { TestRow } from "./Components/TestTable";

interface LocationState {
  row?: TestRow;
}

// Helper function to parse tags to extract organs
const extractOrgansFromTags = (
  tags: Record<string, any> | string | undefined
): string[] => {
  if (!tags) return [];
  if (typeof tags === "string") {
    const parts = tags.split(",");
    for (const part of parts) {
      if (part.trim().startsWith("organ=")) {
        const organs = part.trim().replace("organ=", "").split(";");
        return organs.map((o) => o.trim()).filter(Boolean);
      }
    }
  } else if (typeof tags === "object" && tags.organ) {
    return tags.organ;
  }
  return [];
};

// Helper function to extract tags
const extractTagsFromTags = (
  tags: Record<string, any> | string | undefined
) => {
  if (!tags) {
    return {
      topRated: false,
      topSelling: false,
    };
  }
  if (typeof tags === "string") {
    const parts = tags.split(",");
    return {
      topRated: parts.some((p) => p.trim() === "top_rated"),
      topSelling: parts.some((p) => p.trim() === "top_selling"),
    };
  }
  return {
    topRated: tags.top_rated || false,
    topSelling: tags.top_selling || false,
  };
};

const AddTestPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as LocationState | undefined;
  const row = state?.row;

  const [categories, setCategories] = useState<TestCategory[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<string | null>("core");

  const [form, setForm] = useState({
    name: "",
    shortName: "",
    category: "",
    unit: "",
    inputType: "numeric",
    defaultResult: "",
    optional: false,
    price: "",
    method: "",
    instrument: "",
    interpretation: "",
    notes: "",
    comments: "",
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Display tab data
  const [displayData, setDisplayData] = useState<DisplayTabsData | null>(null);

  // Memoized callback to prevent infinite loops
  const handleDisplayDataChange = useCallback((data: DisplayTabsData) => {
    setDisplayData(data);
  }, []);

  // Load categories and units on mount
  const organizationId = useAuthStore(
    (s) => s.organizationDetails?.organization_id ?? ""
  );
  const centerId = useAuthStore((s) => s.organizationDetails?.center_id ?? "");

  // Pre-fill form when editing
  useEffect(() => {
    if (!row) {
      setForm({
        name: "",
        shortName: "",
        category: "",
        unit: "",
        inputType: "numeric",
        defaultResult: "",
        optional: false,
        price: "",
        method: "",
        instrument: "",
        interpretation: "",
        notes: "",
        comments: "",
      });
      setDisplayData(null);
      return;
    }

    // Pre-fill form with row data
    setForm({
      name: row.name || "",
      shortName: row.shortName || "",
      category: row.categoryId || "",
      unit: row.unitId || "",
      inputType: row.inputType || "numeric",
      defaultResult: row.defaultResult || "",
      optional: row.optional || false,
      price: row.price || "",
      method: row.method || "",
      instrument: row.instrument || "",
      interpretation: row.interpretation || "",
      notes: row.notes || "",
      comments: row.comments || "",
    });

    // Initialize displayData for display tab prefill
    const tagFlags = extractTagsFromTags(row.tags);
    setDisplayData({
      organs: extractOrgansFromTags(row.tags),
      categories: [],
      displayCategoryId: row.displayCategoryId || "",
      topRated: tagFlags.topRated,
      topSelling: tagFlags.topSelling,
      displayName: row.displayName || "",
      shortAbout: row.shortAbout || "",
      longAbout: row.longAbout || "",
      sampleType: row.sampleType || "",
      gender: row.gender || "any",
      ageRange: row.ageRange || "",
      icon: null,
      images: [],
      uploadedImages: (row.images || []).map((img) => ({
        type: img.type as "icon" | "image",
        target_type: img.target_type,
        target_id: img.target_id,
      })),
      preparation: row.preparation || "",
      mrp: row.mrp || "",
      faqs: row.faq
        ? (() => {
            try {
              const parsed = JSON.parse(row.faq);
              return Array.isArray(parsed)
                ? parsed
                : [{ question: "", answer: "" }];
            } catch (e) {
              return [{ question: "", answer: "" }];
            }
          })()
        : [{ question: "", answer: "" }],
      homeCollectionPossible: row.homeCollection || false,
      homeCollectionFee: row.homeCollectionFee || "",
      machineBased: row.machineBased === "1" || row.machineBased === true,
    });
  }, [row]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [catResp, unitResp] = await Promise.all([
          apis.GetTestCategories(organizationId, centerId, undefined, 1, 100),
          apis.GetTestUnits(1, 100, organizationId, centerId, ""),
        ]);

        if (catResp?.success && catResp?.data?.categorys) {
          setCategories(catResp.data.categorys);
        }

        if (unitResp?.success && unitResp?.data?.units) {
          setUnits(unitResp.data.units);
        }
      } catch (err) {
        console.error("Failed to load categories/units:", err);
      }
    };

    loadData();
  }, [organizationId, centerId]);

  const handleChange = (k: string, v: string | number | boolean) =>
    setForm((s) => ({ ...s, [k]: v }));

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();

    const newErrors: Record<string, string> = {};
    if (!form.name.trim()) newErrors.name = "Test name is required";
    if (!form.shortName.trim()) newErrors.shortName = "Short name is required";
    if (!form.category.trim()) newErrors.category = "Category is required";
    if (!form.unit.trim()) newErrors.unit = "Unit is required";

    if (Object.keys(newErrors).length > 0) {
      setFormErrors(newErrors);
      notifications.show({
        title: "Error",
        message: "Please fix the errors in the form.",
        color: "red",
      });
      return;
    }

    setLoading(true);
    try {
      // Build images array - send only image IDs in simple format: ["id1", "id2", "id3"]
      const imagesPayload =
        displayData?.uploadedImages?.map((img) => img.target_id) || [];

      // Build payload with all fields - for single type, don't send children
      const payload = {
        type: "single",
        name: form.name,
        short_name: form.shortName,
        category_id: form.category,
        unit_id: form.unit,
        input_type: form.inputType,
        default_result: form.defaultResult,
        optional: Boolean(form.optional),
        price: form.price ? String(form.price) : "",
        method: form.method,
        instrument: form.instrument,
        interpretation: form.interpretation,
        notes: form.notes,
        comments: form.comments,
        tags: {
          organ: displayData?.organs || [],
          top_rated: displayData?.topRated || false,
          top_selling: displayData?.topSelling || false,
        },
        display_category_id: displayData?.displayCategoryId || "",
        display_name: displayData?.displayName || "",
        short_about: displayData?.shortAbout || "",
        long_about: displayData?.longAbout || "",
        sample_type: displayData?.sampleType || "",
        gender: displayData?.gender || "any",
        age_range: displayData?.ageRange || "",
        images: imagesPayload,
        preparation: displayData?.preparation || "",
        mrp: displayData?.mrp || "",
        faq: displayData?.faqs
          ? JSON.stringify(displayData.faqs.filter((f) => f.question.trim()))
          : "",
        home_collection_possible: displayData?.homeCollectionPossible || false,
        home_collection_fee: displayData?.homeCollectionFee || "",
        machine_based: displayData?.machineBased || false,
        // For single type, don't send children key
      };

      // Log payload as requested
      console.log(JSON.stringify(payload, null, 2));

      let response;
      if (row) {
        // Update existing test
        response = await apis.UpdateTestInLabDatabase(
          organizationId,
          centerId,
          row.id,
          payload
        );
      } else {
        // Create new test
        response = await apis.AddTestToLabDatabase(
          organizationId,
          centerId,
          payload
        );
      }
      console.log("API response:", response);
      if (response?.success) {
        notifications.show({
          title: "Success",
          message:
            response.message ||
            (row ? "Test updated successfully" : "Test created successfully"),
          color: "blue",
        });
        setTimeout(() => {
          navigate("/test-database");
        }, 1500);
      } else {
        notifications.show({
          title: "Error",
          message: response?.message,
          color: "red",
        });
      }
    } catch (error) {
      console.error("Failed to save test:", error);
      notifications.show({
        title: "Error",
        message: row ? "Failed to update test" : "Failed to add test",
        color: "red",
      });
    } finally {
      setLoading(false);
    }
  };

  const categoryOptions = categories.map((c) => ({
    value: c.uid,
    label: c.name,
  }));

  const unitOptions = units.map((u) => ({
    value: u.uid,
    label: u.name,
  }));

  // Result type options removed: field no longer shown in the form

  const handleNextTab = () => {
    setActiveTab("display");
  };

  return (
    <div className="p-0">
      <div className="mb-4">
        <Anchor
          component="button"
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 px-3 py-1 hover:no-underline rounded-md text-blue-600 text-sm transition-colors duration-150 hover:bg-blue-50 no-underline"
        >
          <IconArrowLeft size={16} />
          <Text size="sm" fw={600} className="font-medium">
            Back to Test Database
          </Text>
        </Anchor>
      </div>

      <div className="mb-6">
        <h2 className="text-xl font-semibold">
          {row
            ? "Edit Test (Single Parameter)"
            : "Add New Test (Single Parameter)"}
        </h2>
        <p className="text-sm text-gray-600">
          {row
            ? "Update test information."
            : "Enter test information to create a new test record."}
        </p>
      </div>

      <Paper withBorder radius="md" className="p-6">
        <Tabs value={activeTab} onChange={setActiveTab} className="mb-4">
          <Tabs.List grow>
            <Tabs.Tab value="core">Core</Tabs.Tab>
            <Tabs.Tab value="display">Display</Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="core" pt="md">
            {/* Test Details Section */}
            <div className="mb-4">
              <div className="text-sm font-medium mb-3">Test details</div>
              <p className="text-xs text-gray-500 mb-4">
                Detailed entry will be created for this test automatically.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Text size="xs" className="text-gray-600 mb-2">
                    Name
                  </Text>
                  <TextInput
                    placeholder="e.g., Serum Phosphorus"
                    value={form.name}
                    onChange={(e) =>
                      handleChange("name", e.currentTarget.value)
                    }
                    error={formErrors.name}
                  />
                </div>

                <div>
                  <Text size="xs" className="text-gray-600 mb-2">
                    Short name
                  </Text>
                  <TextInput
                    placeholder="e.g., Phos"
                    value={form.shortName}
                    onChange={(e) =>
                      handleChange("shortName", e.currentTarget.value)
                    }
                    error={formErrors.shortName}
                  />
                </div>

                <div>
                  <Text size="xs" className="text-gray-600 mb-2">
                    Category
                  </Text>
                  <Select
                    placeholder="Select category"
                    data={categoryOptions}
                    value={form.category}
                    onChange={(v) => handleChange("category", v || "")}
                    error={formErrors.category}
                    searchable
                  />
                </div>

                <div>
                  <Text size="xs" className="text-gray-600 mb-2">
                    Unit
                  </Text>
                  <div className="flex items-center gap-2">
                    <Select
                      placeholder="Select unit"
                      data={unitOptions}
                      value={form.unit}
                      onChange={(v) => handleChange("unit", v || "")}
                      error={formErrors.unit}
                      searchable
                      className="flex-1"
                    />
                    <Anchor
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        navigate("/units");
                      }}
                      className="text-blue-600 text-xs whitespace-nowrap hover:underline"
                    >
                      Add new
                    </Anchor>
                  </div>
                </div>

                {/* Result type removed — default 'single' used */}
                <div>
                  <Text size="xs" className="text-gray-600 mb-2">
                    Input type
                  </Text>
                  <Select
                    placeholder="Select input type"
                    data={[
                      { value: "single-line", label: "Single Line" },
                      { value: "numeric", label: "Numeric" },
                      { value: "paragraph", label: "Paragraph" },
                    ]}
                    value={form.inputType}
                    onChange={(v) => handleChange("inputType", v || "numeric")}
                  />
                </div>

                <div>
                  <Text size="xs" className="text-gray-600 mb-2">
                    Default result
                  </Text>
                  <TextInput
                    placeholder="e.g., Normal"
                    value={form.defaultResult}
                    onChange={(e) =>
                      handleChange("defaultResult", e.currentTarget.value)
                    }
                  />
                </div>
                <div>
                  <Text size="xs" className="text-gray-600 mb-2">
                    &nbsp;
                  </Text>
                  <div className="flex items-center gap-3">
                    <Checkbox
                      label="Optional"
                      checked={Boolean(form.optional)}
                      onChange={(e) =>
                        handleChange("optional", e.currentTarget.checked)
                      }
                      size="xs"
                    />
                    <NumberInput
                      placeholder="Price"
                      value={form.price ? Number(form.price) : undefined}
                      onChange={(v) => handleChange("price", String(v || ""))}
                      className="w-full"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* More details Section */}
            <Tabs defaultValue="method">
              <Tabs.List>
                <Tabs.Tab value="method">More Details</Tabs.Tab>
                <Tabs.Tab value="format">Format Options</Tabs.Tab>
              </Tabs.List>

              {/* --- Method & Instrument Tab --- */}
              <Tabs.Panel value="method" pt="xs">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div>
                    <Text size="xs" className="text-gray-600 mb-2">
                      Method
                    </Text>
                    <TextInput
                      placeholder="Method"
                      value={form.method}
                      onChange={(e) =>
                        handleChange("method", e.currentTarget.value)
                      }
                    />
                  </div>

                  <div>
                    <Text size="xs" className="text-gray-600 mb-2">
                      Instrument
                    </Text>
                    <TextInput
                      placeholder="Instrument"
                      value={form.instrument}
                      onChange={(e) =>
                        handleChange("instrument", e.currentTarget.value)
                      }
                    />
                  </div>
                </div>
              </Tabs.Panel>

              {/* --- Format Options Tab --- */}
              <Tabs.Panel value="format" pt="xs" mb={8}>
                <div className="mt-4">
                  <div className="flex items-center gap-3">
                    <Checkbox label="Always bold" />
                    <Checkbox label="Print line after" />
                  </div>

                  <div className="mt-3 text-xs text-gray-500">
                    Won’t print line for panels.
                  </div>
                </div>
              </Tabs.Panel>
            </Tabs>

            {/* Interpretation Section - Always Visible */}
            <div className=" mt-4 mb-4">
              <div className="text-sm font-medium mb-3">Interpretation</div>
              <div className="flex items-start gap-4 mb-3">
                <div className="flex-1">
                  <RichEditor
                    value={form.interpretation}
                    onChange={(content) =>
                      handleChange("interpretation", content)
                    }
                  />
                </div>
              </div>
            </div>

            {/* Notes and Comments - Always Visible */}
            <div className="mb-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <Text size="xs" className="text-gray-600 mb-2">
                    Notes
                  </Text>
                  <Textarea
                    placeholder="Enter notes..."
                    value={form.notes}
                    onChange={(e) =>
                      handleChange("notes", e.currentTarget.value)
                    }
                    minRows={3}
                    classNames={{ input: "text-sm" }}
                  />
                </div>
                <div>
                  <Text size="xs" className="text-gray-600 mb-2">
                    Comments
                  </Text>
                  <Textarea
                    placeholder="Enter comments..."
                    value={form.comments}
                    onChange={(e) =>
                      handleChange("comments", e.currentTarget.value)
                    }
                    minRows={3}
                    classNames={{ input: "text-sm" }}
                  />
                </div>
              </div>
            </div>
          </Tabs.Panel>

          <Tabs.Panel value="display" pt="md">
            <DisplayTabs
              onDataChange={handleDisplayDataChange}
              initialData={displayData || undefined}
            />
          </Tabs.Panel>
        </Tabs>
      </Paper>

      {/* Sticky Footer Section */}
      <div className="sticky -bottom-4 bg-white z-10 mt-6 px-4 pt-4 pb-4 rounded-xl border border-gray-200 shadow-sm flex justify-end gap-4">
        <Button variant="light" onClick={() => navigate(-1)}>
          Cancel
        </Button>

        {activeTab === "core" ? (
          <Button
            style={{ backgroundColor: "#0b5ed7" }}
            onClick={handleNextTab}
          >
            Next
          </Button>
        ) : (
          <Button
            type="submit"
            style={{ backgroundColor: "#0b5ed7" }}
            loading={loading}
            onClick={handleSubmit}
          >
            {row ? "Update Test" : "Save Test"}
          </Button>
        )}
      </div>
    </div>
  );
};

export default AddTestPage;
