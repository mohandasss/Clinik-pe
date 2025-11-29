import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Paper,
  TextInput,
  Button,
  Text,
  Anchor,
  MultiSelect,
  Select,
  Tabs,
} from "@mantine/core";
import { IconArrowLeft } from "@tabler/icons-react";
import { notifications } from "@mantine/notifications";
import apis from "../../APis/Api";
import useAuthStore from "../../GlobalStore/store";
import DisplayTabs, {
  type DisplayTabsData,
} from "../../components/Global/DisplayTabs";
import type { TestPackageRow, LabTestItem, PanelItem } from "../../APis/Types";

interface LocationState {
  row?: TestPackageRow;
}

// Helper function to parse tags to extract organs
const extractOrgansFromTags = (
  tags: Record<string, any> | string | undefined
): string[] => {
  if (!tags) return [];
  if (typeof tags === "string") {
    // Parse string like "organ=heart;kidney,top_rated"
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

const EditPackagePage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as LocationState | undefined;
  const row = state?.row;

  const [activeTab, setActiveTab] = useState<string | null>("core");
  const [displayData, setDisplayData] = useState<DisplayTabsData | null>(null);
  const [loading, setLoading] = useState(false);

  // Memoized callback to prevent infinite loops
  const handleDisplayDataChange = useCallback((data: DisplayTabsData) => {
    setDisplayData(data);
  }, []);

  const [form, setForm] = useState({
    name: "",
    price: "",
    gender: "both" as "male" | "female" | "both",
    tests: [] as string[],
    panels: [] as string[],
  });

  // Track original state for calculating removals
  const [originalTests, setOriginalTests] = useState<string[]>([]);
  const [originalPanels, setOriginalPanels] = useState<string[]>([]);

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Dynamic Options
  const [availableTests, setAvailableTests] = useState<
    { value: string; label: string }[]
  >([]);
  const [availablePanels, setAvailablePanels] = useState<
    { value: string; label: string }[]
  >([]);

  const organizationId = useAuthStore(
    (s) => s.organizationDetails?.organization_id ?? ""
  );
  const centerId = useAuthStore((s) => s.organizationDetails?.center_id ?? "");

  // Load tests and panels for dropdowns
  useEffect(() => {
    const loadData = async () => {
      try {
        // Fetch Tests
        const testsResp = await apis.GetAllTests(
          ["uid", "name"],
          organizationId,
          centerId
        );

        const testsRaw =
          (testsResp?.data as any)?.data ||
          (testsResp?.data as any)?.tests ||
          [];

        if (Array.isArray(testsRaw)) {
          setAvailableTests(
            testsRaw.map((t: LabTestItem) => ({
              value: t.uid,
              label: t.name,
            }))
          );
        }

        // Fetch Panels
        const panelsResp = await apis.GetTestPanels(
          1,
          100,
          organizationId,
          centerId,
          ""
        );

        const panelsRaw =
          (panelsResp?.data as any)?.data ||
          (panelsResp?.data as any)?.panels ||
          [];

        if (Array.isArray(panelsRaw)) {
          setAvailablePanels(
            panelsRaw.map((p: PanelItem) => ({
              value: p.panel_id,
              label: (p as any).panel_name || p.name || p.panel_id,
            }))
          );
        }
      } catch (err) {
        console.error("Error loading tests/panels:", err);
        notifications.show({
          title: "Error",
          message: "Failed to load tests and panels",
          color: "red",
        });
      }
    };

    if (organizationId && centerId) {
      loadData();
    }
  }, [organizationId, centerId]);

  // Pre-fill form when editing
  useEffect(() => {
    if (!row) {
      setForm({
        name: "",
        price: "",
        gender: "both",
        tests: [],
        panels: [],
      });
      setOriginalTests([]);
      setOriginalPanels([]);
      setDisplayData(null);
      return;
    }

    // Normalize gender value
    const g = row.bill_only_for_gender
      ? (row.bill_only_for_gender.toLowerCase() as "male" | "female" | "both")
      : (row.gender?.toLowerCase() as "male" | "female" | "both") || "both";

    // Extract test/panel IDs
    const testIds = Array.isArray(row.tests)
      ? row.tests.map((t) => (typeof t === "string" ? t : t.test_id))
      : [];

    const panelIds = Array.isArray(row.panels)
      ? row.panels.map((p) => (typeof p === "string" ? p : p.panel_id))
      : [];

    setForm({
      name: row.name || "",
      price: String(row.price || row.fee || ""),
      gender: g,
      tests: testIds,
      panels: panelIds,
    });

    // Initialize displayData for display tab prefill
    const tagFlags = extractTagsFromTags(row.tags);
    setDisplayData({
      organs: extractOrgansFromTags(row.tags),
      categories: [],
      displayCategoryId: row.display_category_id || "",
      topRated: tagFlags.topRated,
      topSelling: tagFlags.topSelling,
      displayName: row.displayName || "",
      shortAbout: row.shortAbout || "",
      longAbout: row.longAbout || "",
      sampleType: row.sampleType || "",
      gender: row.bill_only_for_gender || row.gender?.toLowerCase() || "any",
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
      homeCollectionPossible:
        row.homeCollectionPossible === "1" ||
        row.homeCollectionPossible === true,
      homeCollectionFee: row.homeCollectionFee || "",
      machineBased: row.machineBased === "1" || row.machineBased === true,
    });

    // Store original state for calculating removals
    setOriginalTests(testIds);
    setOriginalPanels(panelIds);
  }, [row]);

  const handleChange = (
    key: string,
    value: string | string[] | "male" | "female" | "both"
  ) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (formErrors[key]) {
      setFormErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[key];
        return newErrors;
      });
    }
  };

  const handleNextTab = () => {
    setActiveTab("display");
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();

    const newErrors: Record<string, string> = {};
    if (!form.name.trim()) newErrors.name = "Package name is required";
    if (!form.price.trim()) newErrors.price = "Price is required";
    if (form.tests.length === 0 && form.panels.length === 0) {
      newErrors.tests = "At least one test or panel is required";
    }

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

      // Calculate which tests and panels were removed
      const removeTests = originalTests.filter((t) => !form.tests.includes(t));
      const removePanels = originalPanels.filter(
        (p) => !form.panels.includes(p)
      );

      if (row) {
        // Update existing package
        const updatePayload: Record<string, unknown> = {
          name: form.name.trim(),
          price: Number(form.price),
          bill_only_for_gender: form.gender,
          tests: form.tests.map((t) => ({ test_id: t })),
          panels: form.panels.map((p) => ({ panel_id: p })),
          remove_tests: removeTests,
          remove_panels: removePanels,
          // Display tab fields
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
          home_collection_possible:
            displayData?.homeCollectionPossible || false,
          home_collection_fee: displayData?.homeCollectionFee || "",
          machine_based: displayData?.machineBased || false,
        };

        const response = await apis.UpdateTestPackage(
          organizationId,
          centerId,
          row.uid || row.id || "",
          updatePayload as any
        );

        if (response?.success) {
          notifications.show({
            title: "Success",
            message: response.message || "Package updated successfully",
            color: "green",
          });
          setTimeout(() => navigate("/test-packages"), 1500);
        } else {
          notifications.show({
            title: "Error",
            message: response?.message || "Failed to update package",
            color: "red",
          });
        }
      } else {
        // Create new package
        const createPayload = {
          name: form.name.trim(),
          price: Number(form.price),
          bill_only_for_gender: form.gender,
          tests: form.tests.map((t) => ({ test_id: t })),
          panels: form.panels.map((p) => ({ panel_id: p })),
          // Display tab fields
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
          home_collection_possible:
            displayData?.homeCollectionPossible || false,
          home_collection_fee: displayData?.homeCollectionFee || "",
          machine_based: displayData?.machineBased || false,
        };

        console.log(JSON.stringify(createPayload, null, 2));

        const response = await apis.AddTestPackage(
          organizationId,
          centerId,
          createPayload
        );

        if (response?.success) {
          notifications.show({
            title: "Success",
            message: response.message || "Package created successfully",
            color: "green",
          });
          setTimeout(() => navigate("/test-packages"), 1500);
        } else {
          notifications.show({
            title: "Error",
            message: response?.message || "Failed to create package",
            color: "red",
          });
        }
      }
    } catch (error) {
      console.error("Failed to save package:", error);
      notifications.show({
        title: "Error",
        message: "Failed to save package",
        color: "red",
      });
    } finally {
      setLoading(false);
    }
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
            Back to Test Packages
          </Text>
        </Anchor>
      </div>

      <div className="mb-6">
        <h2 className="text-xl font-semibold">
          {row ? "Edit Test Package" : "Add New Test Package"}
        </h2>
        <p className="text-sm text-gray-600">
          {row
            ? "Update test package information."
            : "Enter test package information to create a new record."}
        </p>
      </div>

      <Paper withBorder radius="md" className="p-6">
        <Tabs value={activeTab} onChange={setActiveTab} className="mb-4">
          <Tabs.List grow>
            <Tabs.Tab value="core">Core</Tabs.Tab>
            <Tabs.Tab value="display">Display</Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="core" pt="md">
            <form onSubmit={handleSubmit}>
              <div className="mb-6">
                <div className="text-sm font-medium mb-3">Package Details</div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Text size="xs" className="text-gray-600 mb-2">
                      Package Name
                    </Text>
                    <TextInput
                      placeholder="e.g., Complete Health Checkup"
                      value={form.name}
                      onChange={(e) =>
                        handleChange("name", e.currentTarget.value)
                      }
                      error={formErrors.name}
                      required
                    />
                  </div>

                  <div>
                    <Text size="xs" className="text-gray-600 mb-2">
                      Price
                    </Text>
                    <TextInput
                      placeholder="e.g., 1500"
                      type="number"
                      value={form.price}
                      onChange={(e) =>
                        handleChange("price", e.currentTarget.value)
                      }
                      error={formErrors.price}
                      required
                    />
                  </div>

                  <div>
                    <Text size="xs" className="text-gray-600 mb-2">
                      Bill Only For Gender
                    </Text>
                    <Select
                      placeholder="Select gender"
                      data={[
                        { value: "both", label: "Both" },
                        { value: "male", label: "Male" },
                        { value: "female", label: "Female" },
                      ]}
                      value={form.gender}
                      onChange={(v) =>
                        handleChange(
                          "gender",
                          (v as "male" | "female" | "both") || "both"
                        )
                      }
                    />
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <div className="text-sm font-medium mb-3">
                  Tests & Panels Selection
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Text size="xs" className="text-gray-600 mb-2">
                      Tests
                    </Text>
                    <MultiSelect
                      placeholder="Select tests"
                      data={availableTests}
                      value={form.tests}
                      onChange={(val) => handleChange("tests", val)}
                      searchable
                      clearable
                      error={formErrors.tests}
                    />
                  </div>

                  <div>
                    <Text size="xs" className="text-gray-600 mb-2">
                      Panels
                    </Text>
                    <MultiSelect
                      placeholder="Select panels"
                      data={availablePanels}
                      value={form.panels}
                      onChange={(val) => handleChange("panels", val)}
                      searchable
                      clearable
                    />
                  </div>
                </div>
              </div>
            </form>
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
            {row ? "Update Package" : "Save Package"}
          </Button>
        )}
      </div>
    </div>
  );
};

export default EditPackagePage;
