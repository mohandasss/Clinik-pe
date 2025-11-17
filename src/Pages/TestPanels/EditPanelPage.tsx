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
import type { TestPanelRow, TestPanelPayload } from "../../APis/Types";

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
    category: string;
    tests: string[];
    interpretation: string;
    hideInterpretation: boolean;
    hideMethod: boolean;
  }

  const [form, setForm] = useState<FormState>({
    name: "",
    category: "",
    tests: [] as string[],
    interpretation: "",
    hideInterpretation: false,
    hideMethod: false,
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (row) {
      setForm({
        name: row.name || "",
        category: row.category || "",
        tests: row.tests || [],
        interpretation: row.interpretation || "",
        hideInterpretation: row.hideInterpretation || false,
        hideMethod: row.hideMethod || false,
      });
    } else {
      // reset if there is no row (i.e., adding new)
      setForm((s) => ({
        ...s,
        name: "",
        category: "",
        tests: [],
        interpretation: "",
        hideInterpretation: false,
        hideMethod: false,
      }));
    }
  }, [row]);

  const handleChange = (k: string, v: string | string[] | boolean) =>
    setForm((s) => ({ ...s, [k]: v }));

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();

    const newErrors: Record<string, string> = {};
    if (!form.name.trim()) newErrors.name = "Panel name is required";
    if (!form.category.trim()) newErrors.category = "Category is required";
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
      const payload: TestPanelPayload = {
        name: form.name.trim(),
        category: form.category.trim(),
        tests: form.tests,
        order: row?.order || 0,
        interpretation: form.interpretation.trim(),
        hideInterpretation: Boolean(form.hideInterpretation),
        hideMethod: Boolean(form.hideMethod),
      };

      if (row) {
        await apis.UpdateTestPanel(row.id, payload);
        setNotif({
          open: true,
          data: {
            success: true,
            message: "Test panel updated successfully",
          },
        });
      } else {
        await apis.AddTestPanel(payload);
        setNotif({
          open: true,
          data: {
            success: true,
            message: "Test panel added successfully",
          },
        });
      }

      setTimeout(() => {
        navigate("/test-panels", { state: { refresh: true } });
      }, 1500);
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
                  data={[
                    "Haematology",
                    "Biochemistry",
                    "Microbiology",
                    "Immunology",
                    "Endocrinology",
                  ]}
                  value={form.category}
                  onChange={(v) => handleChange("category", v ?? "")}
                  error={formErrors.category}
                />
              </div>

              <div className="md:col-span-1">
                <Text size="xs" className="text-gray-600 mb-2">
                  Tests
                </Text>
                <MultiSelect
                  placeholder="Select tests"
                  data={[
                    { value: "Hemoglobin", label: "Hemoglobin" },
                    {
                      value: "Total Leukocyte Count",
                      label: "Total Leukocyte Count",
                    },
                    {
                      value: "Differential Leucocyte Count",
                      label: "Differential Leucocyte Count",
                    },
                    { value: "Platelet Count", label: "Platelet Count" },
                    { value: "Total RBC Count", label: "Total RBC Count" },
                    { value: "Hematocrit Value", label: "Hematocrit Value" },
                    { value: "Bleeding Time", label: "Bleeding Time" },
                    { value: "Clotting Time", label: "Clotting Time" },
                    {
                      value: "Mean Corpuscular Volume",
                      label: "Mean Corpuscular Volume",
                    },
                    { value: "MCH", label: "MCH" },
                    { value: "MCHC", label: "MCHC" },
                    { value: "R.D.W. - SD", label: "R.D.W. - SD" },
                  ]}
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
            <Textarea
              resize="vertical"
              placeholder="Enter clinical notes and interpretation guidelines..."
              value={form.interpretation}
              onChange={(e) =>
                handleChange("interpretation", e.currentTarget.value)
              }
            />
          </div>

          <div className="mt-4">
            <Button
              type="submit"
              style={{ backgroundColor: "#0b5ed7" }}
              loading={saving}
            >
              {row ? "Update Test" : "Add Test"}
            </Button>
          </div>
        </form>
      </Paper>
    </div>
  );
};

export default EditPanelPage;
