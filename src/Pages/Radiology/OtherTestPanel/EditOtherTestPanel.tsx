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
import Notification from "../../../components/Global/Notification";
import { IconArrowLeft } from "@tabler/icons-react";
import apis from "../../../APis/Api";
import useAuthStore from "../../../GlobalStore/store";
import RichEditor from "../../../components/Global/RichEditor";
import DisplayTabs, {
  type DisplayTabsData,
} from "../../../components/Global/DisplayTabs";
import type { OtherTestPanelRow } from "../../../APis/Types";

interface LocationState {
  row?: OtherTestPanelRow;
}

interface FormState {
  name: string;
  description: string;
  price: string;
  status: string;
  data: string;
  tests: string[];
}

const EditOtherTestPanel: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as LocationState | undefined;
  const row = state?.row;

  const [notif, setNotif] = useState<{
    open: boolean;
    data: { success: boolean; message: string };
  }>({
    open: false,
    data: { success: true, message: "" },
  });

  const [form, setForm] = useState<FormState>({
    name: "",
    description: "",
    price: "",
    status: "active",
    data: "",
    tests: [] as string[],
  });

  const [initialTestUids, setInitialTestUids] = useState<string[]>([]);

  const [availableTests, setAvailableTests] = useState<
    { value: string; label: string }[]
  >([]);

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<string | null>("core");

  // Display tab data
  const [displayData, setDisplayData] = useState<DisplayTabsData | null>(null);

  // Memoized callback to prevent infinite loops
  const handleDisplayDataChange = useCallback((data: DisplayTabsData) => {
    setDisplayData(data);
  }, []);

  useEffect(() => {
    if (row) {
      setForm({
        name: row.name || "",
        description: row.description || "",
        price: String(row.price) || "",
        status: row.status || "active",
        data:
          typeof row.data === "string"
            ? row.data
            : row.data
            ? JSON.stringify(row.data)
            : "",
        tests: row.tests || [],
      });
    } else {
      setForm({
        name: "",
        description: "",
        price: "",
        status: "active",
        data: "",
        tests: [],
      });
    }
  }, [row]);

  const organizationDetails = useAuthStore((s) => s.organizationDetails);

  // Load tests for MultiSelect dropdown (use GetOtherTestDatabase API only for dropdown values)
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const resp = await apis.GetOtherTestDatabase(
          "radiology",
          1,
          1000,
          organizationDetails?.organization_id ?? "",
          organizationDetails?.center_id ?? "",
          ""
        );
        // The GetOtherTestDatabase API returns tests in the expected shape.
        const testsArray = resp?.data?.tests ?? [];
        if (mounted && Array.isArray(testsArray)) {
          const options = testsArray.map((t: any) => ({
            value: t.uid,
            label: t.name,
          }));
          setAvailableTests(options);
        }
      } catch (err) {
        console.warn("GetOtherTestDatabase failed:", err);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [organizationDetails?.organization_id, organizationDetails?.center_id]);

  // When editing, map existing test names to available uid values when possible
  useEffect(() => {
    if (!row) return;
    if (!availableTests || availableTests.length === 0) return;

    const mappedUids = row.tests.map((tName) => {
      const match = availableTests.find((opt) => opt.label === tName);
      return match ? match.value : tName;
    });
    setForm((s) => ({ ...s, tests: mappedUids }));
    setInitialTestUids(mappedUids);
  }, [row, availableTests]);

  const handleChange = (k: string, v: string | string[] | boolean) =>
    setForm((s) => ({ ...s, [k]: v }));

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();

    const newErrors: Record<string, string> = {};
    if (!form.name.trim()) newErrors.name = "Panel name is required";
    if (!form.price.trim()) newErrors.price = "Price is required";
    if (form.tests.length === 0)
      newErrors.tests = "At least one test is required";

    if (Object.keys(newErrors).length > 0) {
      setFormErrors(newErrors);
      setNotif({
        open: true,
        data: { success: false, message: "Please fix the errors in the form." },
      });
      return;
    }

    setSaving(true);
    try {
      // Build images array - send only image IDs
      const imagesPayload =
        displayData?.uploadedImages?.map((img) => img.target_id) || [];

      if (row) {
        // Edit mode - calculate removed tests
        const removedTests = initialTestUids.filter(
          (testId) => !form.tests.includes(testId)
        );

        const payload = {
          name: form.name.trim(),
          description: form.description.trim(),
          price: Number(form.price),
          data: typeof form.data === "string" ? form.data.trim() : "",
          status: form.status,
          tests: form.tests.map((testId) => ({ test_id: testId })),
          remove_tests: removedTests.map((test_id) => ({ test_id })),
          // Display tab fields
          tags: {
            organ: displayData?.organs || [],
            top_rated: displayData?.topRated || false,
            top_selling: displayData?.topSelling || false,
          },
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

        const response = await apis.UpdateOtherTestPanels(
          payload,
          "radiology",
          organizationDetails?.organization_id ?? "",
          organizationDetails?.center_id ?? "",
          row.id
        );

        if (response.success) {
          setNotif({
            open: true,
            data: {
              success: response.success,
              message: response.message,
            },
          });

          setTimeout(() => {
            navigate("/radiology/test-panels", { state: { refresh: true } });
          }, 1500);
        }
      } else {
        // Add mode
        const payload = {
          name: form.name.trim(),
          description: form.description.trim(),
          price: Number(form.price),
          data: typeof form.data === "string" ? form.data.trim() : "",
          status: form.status,
          tests: form.tests.map((testId) => ({ test_id: testId })),
          // Display tab fields
          tags: {
            organ: displayData?.organs || [],
            top_rated: displayData?.topRated || false,
            top_selling: displayData?.topSelling || false,
          },
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
        const response = await apis.AddOtherTestPanels(
          payload,
          "radiology",
          organizationDetails?.organization_id ?? "",
          organizationDetails?.center_id ?? ""
        );

        if (response.success) {
          setNotif({
            open: true,
            data: {
              success: response.success,
              message: response.message,
            },
          });
          setTimeout(() => {
            navigate("/radiology/test-panels", { state: { refresh: true } });
          }, 1500);
        }
      }
    } catch (err) {
      console.error(err);
      setNotif({
        open: true,
        data: {
          success: false,
          message: "Failed to save test panel",
        },
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-0">
      <Notification
        open={notif.open}
        data={notif.data}
        onClose={() => setNotif((s) => ({ ...s, open: false }))}
      />

      <div className="mb-4">
        <Anchor
          component="button"
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 px-3 py-1 hover:no-underline rounded-md text-blue-600 text-sm transition-colors duration-150 hover:bg-blue-50 no-underline"
        >
          <IconArrowLeft size={16} />
          <Text size="sm" fw={600} className="font-medium">
            Back to Radiology Test Panels
          </Text>
        </Anchor>
      </div>

      <div className="mb-6">
        <h2 className="text-xl font-semibold">
          {row ? "Edit Radiology Test Panel" : "Add New Radiology Test Panel"}
        </h2>
        <p className="text-sm text-gray-600">
          {row
            ? "Update radiology test panel information."
            : "Enter radiology test panel information to create a new record."}
        </p>
      </div>

      <Paper withBorder radius="md" className="p-6">
        <Tabs value={activeTab} onChange={setActiveTab} className="mb-4">
          <Tabs.List grow>
            <Tabs.Tab value="core">Core</Tabs.Tab>
            <Tabs.Tab value="display">Display</Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="core" pt="md">
            <div className="mb-4">
              <div className="text-sm font-medium mb-3">Panel Details</div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Text size="xs" className="text-gray-600 mb-2">
                    Panel Name *
                  </Text>
                  <TextInput
                    placeholder="e.g., Chest X-Ray"
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
                    Price *
                  </Text>
                  <TextInput
                    placeholder="e.g., 500"
                    type="number"
                    value={form.price}
                    onChange={(e) =>
                      handleChange("price", e.currentTarget.value)
                    }
                    error={formErrors.price}
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <Text size="xs" className="text-gray-600 mb-2">
                    Description
                  </Text>
                  <RichEditor
                    value={form.description}
                    onChange={(content) => handleChange("description", content)}
                  />
                </div>

                <div className="">
                  <Text size="xs" className="text-gray-600 mb-2">
                    Tests *
                  </Text>
                  <MultiSelect
                    placeholder="Select tests"
                    data={availableTests}
                    value={form.tests}
                    onChange={(val) => handleChange("tests", val)}
                    searchable
                    clearable
                    error={formErrors.tests}
                    required
                  />
                </div>
                <div>
                  <Text size="xs" className="text-gray-600 mb-2">
                    Status
                  </Text>
                  <Select
                    placeholder="Select status"
                    data={[
                      { value: "active", label: "Active" },
                      { value: "inactive", label: "Inactive" },
                    ]}
                    value={form.status}
                    onChange={(v) => handleChange("status", v ?? "active")}
                  />
                </div>
              </div>
            </div>
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
            loading={saving}
            onClick={handleSubmit}
          >
            {row ? "Update Panel" : "Save Panel"}
          </Button>
        )}
      </div>
    </div>
  );
};

export default EditOtherTestPanel;
