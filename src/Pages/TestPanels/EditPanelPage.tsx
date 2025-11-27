import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Paper,
  TextInput,
  Button,
  Text,
  Anchor,
  MultiSelect,
  Select,
  Checkbox,
  Textarea,
} from "@mantine/core";
import Notification from "../../components/Global/Notification";
import { IconArrowLeft } from "@tabler/icons-react";
import apis from "../../APis/Api";
import useAuthStore from "../../GlobalStore/store";
import RichEditor from "../../components/Global/RichEditor";
import type {
  TestPanelRow,
  CreatePanelPayload,
  UpdatePanelPayload,
  TestCategory,
  LabTestItem,
} from "../../APis/Types";

interface LocationState {
  row?: TestPanelRow;
}

const EditPanelPage: React.FC = () => {
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

  interface FormState {
    name: string;
    category: string; // display name
    categoryId: string; // uid for API
    price: string;
    tests: string[];
    interpretation: string;
    hideInterpretation: boolean;
    hideMethod: boolean;
  }

  const [form, setForm] = useState<FormState>({
    name: "",
    category: "",
    categoryId: "",
    price: "",
    tests: [] as string[],
    interpretation: "",
    hideInterpretation: false,
    hideMethod: false,
  });

  // Keep original tests uids when editing so we can compute remove_tests
  const [initialTestUids, setInitialTestUids] = useState<string[]>([]);

  // Options for tests dropdown — value is uid, label is name
  const [availableTests, setAvailableTests] = useState<
    { value: string; label: string }[]
  >([]);

  // Categories for dropdown — value is uid, label is name
  const [availableCategories, setAvailableCategories] = useState<
    { value: string; label: string }[]
  >([]);

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (row) {
      // Parse hide_individual from row's API response structure
      let hideInterp = row.hideInterpretation ?? false;
      let hideMethod = row.hideMethod ?? false;

      // If row came from API (has hide_individual object), parse it
      if (row.hide_individual && typeof row.hide_individual === "object") {
        const hideIndividualObj = row.hide_individual as Record<string, string>;
        // Check for keys containing 'interpretation' or 'method'
        for (const key in hideIndividualObj) {
          if (key.toLowerCase().includes("interpretation")) {
            hideInterp = hideIndividualObj[key] === "true";
          }
          if (key.toLowerCase().includes("method")) {
            hideMethod = hideIndividualObj[key] === "true";
          }
        }
      }

      setForm({
        name: row.name || "",
        category: row.category || "",
        categoryId: row.categoryId || "",
        price: row.ratelistEntries || "",
        tests: row.tests || [],
        interpretation: row.interpretation || "",
        hideInterpretation: hideInterp,
        hideMethod: hideMethod,
      });
      // initialTestUids will be set after we map tests to uids (in the other effect)
    } else {
      // reset if there is no row (i.e., adding new)
      setForm((s) => ({
        ...s,
        name: "",
        category: "",
        categoryId: "",
        price: "",
        tests: [],
        interpretation: "",
        hideInterpretation: false,
        hideMethod: false,
      }));
    }
  }, [row]);

  const organizationDetails = useAuthStore((s) => s.organizationDetails);

  // Load categories for dropdown
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const resp = await apis.GetTestCategories(
          organizationDetails?.organization_id ?? "",
          organizationDetails?.center_id ?? ""
        );
        if (mounted && resp?.data?.categorys) {
          const options = resp.data.categorys.map((cat: TestCategory) => ({
            value: cat.uid,
            label: cat.name,
          }));
          setAvailableCategories(options);
        }
      } catch (err) {
        console.warn("GetTestCategories failed:", err);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [organizationDetails?.organization_id, organizationDetails?.center_id]);

  // Load tests for MultiSelect dropdown
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const resp = await apis.GetAllTests(
          ["uid", "name"],
          organizationDetails?.organization_id ?? "",
          organizationDetails?.center_id ?? ""
        );
        // @ts-expect-error: allow data?.tests
        if (mounted && resp?.data?.tests) {
          // @ts-expect-error: allow data?.tests
          const options = resp.data.tests.map((t: any) => ({
            value: t.uid,
            label: t.name,
          }));
          setAvailableTests(options);
        }
      } catch (err) {
        console.warn("GetAllTests failed:", err);
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
      return match ? match.value : tName; // fallback to original value
    });
    setForm((s) => ({ ...s, tests: mappedUids }));
    // store original list of test uids so we can compute 'remove_tests' later
    setInitialTestUids(mappedUids);
    // if categoryId not available in row, try to match by label
    if (!form.categoryId && row.category) {
      const found = availableCategories.find((c) => c.label === row.category);
      if (found) setForm((s) => ({ ...s, categoryId: found.value }));
    }
  }, [row, availableTests, availableCategories, form.categoryId]);

  const handleChange = (k: string, v: string | string[] | boolean) =>
    setForm((s) => ({ ...s, [k]: v }));

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();

    const newErrors: Record<string, string> = {};
    if (!form.name.trim()) newErrors.name = "Panel name is required";
    if (!form.categoryId.trim()) newErrors.category = "Category is required";
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
      if (row) {
        // Edit mode: use UpdateTestPanels (new API signature) & compute remove_tests
        const payload: UpdatePanelPayload = {
          name: form.name.trim(),
          // @ts-expect-error: allow category_id
          category_id: form.categoryId,
          price: Number(form.price),
          interpretation: form.interpretation.trim(),
          hide_individual: {
            individual_test_interpretation: form.hideInterpretation
              ? "true"
              : "false",
            individual_test_method: form.hideMethod ? "true" : "false",
          },
          tests: form.tests.map((testId) => ({ test_id: testId })),
        };

        // compute remove_tests: tests that were in initialTestUids but not in current form.tests
        const removed = initialTestUids.filter(
          (id) => !form.tests.includes(id)
        );
        if (removed.length > 0)
          payload.remove_tests = removed.map((testId) => ({ test_id: testId }));

        const response = await apis.UpdateTestPanels(
          payload,
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
            navigate("/test-panels", { state: { refresh: true } });
          }, 1500);
        }
      } else {
        // Add mode: use AddTestPanels with new payload structure
        const payload: CreatePanelPayload = {
          name: form.name.trim(),
          // @ts-expect-error: allow category_id
          category_id: form.categoryId,
          price: Number(form.price),
          interpretation: form.interpretation.trim(),
          hide_individual: {
            "individual_test interpretation": form.hideInterpretation
              ? "true"
              : "",
            "individual_test method": form.hideMethod ? "true" : "",
          },
          tests: form.tests.map((testId) => ({ test_id: testId })),
        };
        const response = await apis.AddTestPanels(
          payload,
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
            navigate("/test-panels", { state: { refresh: true } });
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
            Back to Test Panels
          </Text>
        </Anchor>
      </div>

      <div className="mb-6">
        <h2 className="text-xl font-semibold">
          {row ? "Edit Test Panel" : "Add New Test Panel"}
        </h2>
        <p className="text-sm text-gray-600">
          {row
            ? "Update test panel information."
            : "Enter test panel information to create a new record."}
        </p>
      </div>

      <Paper withBorder radius="md" className="p-6">
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <div className="text-sm font-medium mb-3">Panel Details</div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Text size="xs" className="text-gray-600 mb-2">
                  Panel Name
                </Text>
                <TextInput
                  placeholder="e.g., Complete Blood Count (CBC)"
                  value={form.name}
                  onChange={(e) => handleChange("name", e.currentTarget.value)}
                  error={formErrors.name}
                  required
                />
              </div>

              <div>
                <Text size="xs" className="text-gray-600 mb-2">
                  Category
                </Text>
                <Select
                  placeholder="Select category"
                  data={availableCategories}
                  value={form.categoryId}
                  onChange={(v) => {
                    const selected = availableCategories.find(
                      (opt) => opt.value === v
                    );
                    handleChange("categoryId", v ?? "");
                    if (selected) handleChange("category", selected.label);
                  }}
                  error={formErrors.category}
                  searchable
                />
              </div>

              <div>
                <Text size="xs" className="text-gray-600 mb-2">
                  Price
                </Text>
                <TextInput
                  placeholder="e.g., 500"
                  type="number"
                  value={form.price}
                  onChange={(e) => handleChange("price", e.currentTarget.value)}
                  error={formErrors.price}
                  required
                />
              </div>

              <div className="md:col-span-1">
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
              <div className="mt-2 border p-3 rounded-md flex  gap-2">
                <Checkbox
                  label="Hide individual test interpretation, notes, comments from report."
                  checked={form.hideInterpretation}
                  onChange={(e) =>
                    handleChange("hideInterpretation", e.currentTarget.checked)
                  }
                />
                <Checkbox
                  label="Hide individual test method and instrument from report."
                  checked={form.hideMethod}
                  onChange={(e) =>
                    handleChange("hideMethod", e.currentTarget.checked)
                  }
                />
              </div>
            </div>
          </div>

          <div className="mb-4">
            <div className="text-sm font-medium mb-3">Interpretation</div>
            <RichEditor
              value={form.interpretation}
              onChange={(content) => handleChange("interpretation", content)}
            />
          </div>

          <div className="mt-4">
            <Button
              type="submit"
              style={{ backgroundColor: "#0b5ed7" }}
              loading={saving}
            >
              {row ? "Update Panel" : "Add Test"}
            </Button>
          </div>
        </form>
      </Paper>
    </div>
  );
};

export default EditPanelPage;
