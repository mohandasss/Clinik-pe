import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Paper,
  TextInput,
  Button,
  Text,
  Anchor,
  Select,
  Checkbox,
  NumberInput,
  Tabs,
} from "@mantine/core";
import { IconArrowLeft } from "@tabler/icons-react";
import apis from "../../APis/Api";
import useAuthStore from "../../GlobalStore/store";
import type { CreateTestPayload } from "../../APis/Types";
import { notifications } from "@mantine/notifications";
import RichEditor from "../../components/Global/RichEditor";
import DisplayTabs, {
  type DisplayTabsData,
} from "../../components/Global/DisplayTabs";

const AddDocumentTestPage: React.FC = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<{ id: string; name: string }[]>(
    []
  );
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<string | null>("core");
  const [displayData, setDisplayData] = useState<DisplayTabsData | null>(null);

  // Memoized callback to prevent infinite loops
  const handleDisplayDataChange = useCallback((data: DisplayTabsData) => {
    setDisplayData(data);
  }, []);

  type DocumentForm = {
    name: string;
    shortName: string;
    category: string;
    price?: string;
    displayTestNameInReport: boolean;
    defaultResult?: string;
    method?: string;
    instrument?: string;
    interpretation?: string;
    notes?: string;
    comments?: string;
    optional?: boolean;
  };

  const [form, setForm] = useState<DocumentForm>({
    name: "",
    shortName: "",
    category: "",
    price: "",
    displayTestNameInReport: true,
    defaultResult: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const organizationId = useAuthStore(
    (s) => s.organizationDetails?.organization_id ?? ""
  );
  const centerId = useAuthStore((s) => s.organizationDetails?.center_id ?? "");

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const resp = await apis.GetTestCategories(
          organizationId,
          centerId,
          undefined,
          1,
          100
        );
        if (resp?.success && resp?.data?.categorys) {
          const catList = resp.data.categorys.map((c) => ({
            id: c.uid,
            name: c.name,
          }));
          setCategories(catList);
        } else {
          setCategories([]);
        }
      } catch (err) {
        console.warn("GetTestCategories failed:", err);
        notifications.show({
          title: "Error",
          message: "Failed to load categories",
          color: "red",
        });
        setCategories([]);
      }
    };

    loadCategories();
  }, [organizationId, centerId]);

  const handleChange = (k: string, v: string | boolean) => {
    setForm((s) => ({ ...s, [k]: v }));
    if (errors[k]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[k];
        return newErrors;
      });
    }
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const newErrors: Record<string, string> = {};
    if (!form.name.trim()) newErrors.name = "Name is required";
    if (!form.shortName.trim()) newErrors.shortName = "Short name is required";
    if (!form.category.trim()) newErrors.category = "Category is required";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      notifications.show({
        title: "Error",
        message: "Please fix the errors",
        color: "red",
      });
      return;
    }

    setLoading(true);
    try {
      // Build the request payload using the helper so only UI-provided fields are included
      const payload = buildPayload();

      // Log payload to console for debugging
      console.log(JSON.stringify(payload, null, 2));

      const response = await apis.AddTestToLabDatabase(
        organizationId,
        centerId,
        payload
      );
      if (response?.success) {
        notifications.show({
          title: "Success",
          message: response.message,
          color: "green",
        });
        setTimeout(() => navigate("/test-database"), 1400);
      } else {
        notifications.show({
          title: "Error",
          message: response?.message,
          color: "red",
        });
      }
    } catch (err) {
      console.error("Failed to add document test", err);
      notifications.show({
        title: "Error",
        message: "Failed to add document test",
        color: "red",
      });
    } finally {
      setLoading(false);
    }
  };

  // Helper: build the payload object for a document test using the fields in UI
  const buildPayload = (): CreateTestPayload => {
    // Build images array - send only image IDs in simple format: ["id1", "id2", "id3"]
    const imagesPayload =
      displayData?.uploadedImages?.map((img) => img.target_id) || [];

    const p: Partial<CreateTestPayload> = {
      type: "document",
      name: form.name,
      short_name: form.shortName,
      category_id: form.category,
    };

    // Ensure required keys are present (use empty strings where UI doesn't have values)
    p.price = form.price ? String(form.price) : "";
    // The UI stores a boolean toggle. Map it to `display_test` as requested.
    const pRecord = p as Record<string, unknown>;
    // pRecord["display_test"] = Boolean(form.displayTestNameInReport);
    pRecord["unit_id"] = "";
    pRecord["method"] = form.method || "";
    pRecord["instrument"] = form.instrument || "";
    pRecord["interpretation"] = form.defaultResult || "";
    pRecord["notes"] = form.notes || "";
    pRecord["comments"] = form.comments || "";

    // Add display tab fields
    pRecord["tags"] = {
      organ: displayData?.organs || [],
      top_rated: displayData?.topRated || false,
      top_selling: displayData?.topSelling || false,
    };
    pRecord["display_name"] = displayData?.displayName || "";
    pRecord["short_about"] = displayData?.shortAbout || "";
    pRecord["long_about"] = displayData?.longAbout || "";
    pRecord["sample_type"] = displayData?.sampleType || "";
    pRecord["gender"] = displayData?.gender || "any";
    pRecord["age_range"] = displayData?.ageRange || "";
    pRecord["images"] = imagesPayload;
    pRecord["preparation"] = displayData?.preparation || "";
    pRecord["mrp"] = displayData?.mrp || "";
    pRecord["faq"] = displayData?.faqs
      ? JSON.stringify(displayData.faqs.filter((f) => f.question.trim()))
      : "";
    pRecord["home_collection_possible"] =
      displayData?.homeCollectionPossible || false;
    pRecord["home_collection_fee"] = displayData?.homeCollectionFee || "";
    pRecord["machine_based"] = displayData?.machineBased || false;

    // Optional fields (add only if present and non-empty)
    const optionalFields: (keyof DocumentForm)[] = [
      "method",
      "instrument",
      "interpretation",
      "notes",
      "comments",
    ];
    for (const key of optionalFields) {
      const value = form[key];
      if (
        value !== undefined &&
        value !== null &&
        String(value).trim() !== ""
      ) {
        pRecord[key] = value;
      }
    }

    // Add any boolean `optional` flag if it's available on the form
    if (form.optional !== undefined) {
      p.optional = Boolean(form.optional);
    }

    return p as CreateTestPayload;
  };

  const categoryOptions = categories.map((c) => ({
    value: c.id,
    label: c.name,
  }));

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
        <h2 className="text-xl font-semibold">New test (document)</h2>
        <p className="text-sm text-gray-600">Test details</p>
        <p className="text-xs text-gray-500 mt-1">
          This test will be added to the ratelist automatically.
        </p>
      </div>

      <Paper withBorder radius="md" className="p-6">
        <Tabs value={activeTab} onChange={setActiveTab} className="mb-4">
          <Tabs.List grow>
            <Tabs.Tab value="core">Core</Tabs.Tab>
            <Tabs.Tab value="display">Display</Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="core" pt="md">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSubmit();
              }}
            >
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
                <div>
                  <Text size="xs" className="text-gray-600 mb-2">
                    Name
                  </Text>
                  <TextInput
                    placeholder=""
                    value={form.name}
                    onChange={(e) =>
                      handleChange("name", e.currentTarget.value)
                    }
                    error={errors.name}
                    required
                  />
                </div>
                <div>
                  <Text size="xs" className="text-gray-600 mb-2">
                    Short name
                  </Text>
                  <TextInput
                    placeholder=""
                    value={form.shortName}
                    onChange={(e) =>
                      handleChange("shortName", e.currentTarget.value)
                    }
                    error={errors.shortName}
                    required
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
                    error={errors.category}
                    searchable
                  />
                </div>

                <div>
                  <Text size="xs" className="text-gray-600 mb-2">
                    Price
                  </Text>
                  <NumberInput
                    placeholder=""
                    value={form.price ? Number(form.price) : undefined}
                    onChange={(v) => handleChange("price", String(v || ""))}
                    className="w-full"
                  />
                </div>
              </div>

              <div className="mb-6">
                <Checkbox
                  label="Display test name in report"
                  checked={form.displayTestNameInReport}
                  onChange={(e) =>
                    handleChange(
                      "displayTestNameInReport",
                      e.currentTarget.checked
                    )
                  }
                />
              </div>

              <div className="mb-6">
                <div className="text-sm font-medium mb-2">Default result</div>
                <RichEditor
                  value={form.defaultResult || ""}
                  onChange={(content) => handleChange("defaultResult", content)}
                />
                <div className="text-xs text-gray-500 mt-2">
                  Changes to default result will only reflect in new reports,
                  not modified reports.
                </div>
              </div>
            </form>
          </Tabs.Panel>

          <Tabs.Panel value="display" pt="md">
            <DisplayTabs onDataChange={handleDisplayDataChange} />
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
            onClick={() => setActiveTab("display")}
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
            Save Test
          </Button>
        )}
      </div>
    </div>
  );
};

export default AddDocumentTestPage;
