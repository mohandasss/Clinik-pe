import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
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
import { notifications } from "@mantine/notifications";
import type { TestCategory, Unit } from "../../APis/Types";

const AddTestPage: React.FC = () => {
  const navigate = useNavigate();

  const [categories, setCategories] = useState<TestCategory[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    name: "",
    shortName: "",
    category: "",
    unit: "",
    resultType: "Single parameter",
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

  // Load categories and units on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const [catResp, unitResp] = await Promise.all([
          apis.GetTestCategories(undefined, 1, 100),
          apis.GetTestUnits(""),
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
  }, []);

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
      // TODO: Wire to actual API endpoint when available
      // For now, just show success message
      // Build payload for console logging (map to expected API keys)
      const payload = {
        type:
          form.resultType === "Single parameter"
            ? "single"
            : form.resultType === "Multiple parameters"
            ? "multiple"
            : form.resultType === "Multiple nested parameters"
            ? "nested"
            : "document",
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
      } as const;

      // Log payload as requested
      console.log(JSON.stringify(payload, null, 2));

      const response = await apis.AddTestToLabDatabase(payload);
      console.log("API response:", response);
      if (response?.success) {
        notifications.show({
          title: "Success",
          message: response.message || "Test added successfully",
          color: "blue",
        });
      } else {
        notifications.show({
          title: "Error",
          message: response?.message || "Failed to add test",
          color: "red",
        });
      }

      setTimeout(() => {
        navigate("/test-database");
      }, 1500);
    } catch (error) {
      console.error("Failed to add test:", error);
      notifications.show({
        title: "Error",
        message: "Failed to add test",
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

  const resultTypeOptions = [
    { value: "Single parameter", label: "Single parameter" },
    { value: "Multiple parameters", label: "Multiple parameters" },
    {
      value: "Multiple nested parameters",
      label: "Multiple nested parameters",
    },
    { value: "Document", label: "Document" },
  ];

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
          Add New Test (Single Parameter)
        </h2>
        <p className="text-sm text-gray-600">
          Enter test information to create a new test record.
        </p>
      </div>

      <Paper withBorder radius="md" className="p-6">
        <form onSubmit={handleSubmit}>
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
                  onChange={(e) => handleChange("name", e.currentTarget.value)}
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

              <div>
                <Text size="xs" className="text-gray-600 mb-2">
                  Result type
                </Text>
                <Select
                  placeholder="Select result type"
                  data={resultTypeOptions}
                  value={form.resultType}
                  onChange={(v) =>
                    handleChange("resultType", v || "Single Lab")
                  }
                />
              </div>
              <div>
                <Text size="xs" className="text-gray-600 mb-2">
                  Input type
                </Text>
                <Select
                  placeholder="Select input type"
                  data={[
                    { value: "single-line", label: "Single Line" },
                    { value: "numeric", label: "Numeric" },
                    { value: "multi-line", label: "Multi Line" },
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

          {/* More details & Format options tabs */}
          <Tabs defaultValue="more" className="mb-4">
            <Tabs.List>
              <Tabs.Tab value="more">More details</Tabs.Tab>
              <Tabs.Tab value="format">Format options</Tabs.Tab>
            </Tabs.List>

            <Tabs.Panel value="more" pt="xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

            <Tabs.Panel value="format" pt="xs">
              <div>
                <div className="flex items-center gap-3">
                  <Checkbox label="Always bold" />
                  <Checkbox label="Print line after" />
                </div>
                <div className="mt-3 text-xs text-gray-500">
                  Won't print line for panels.
                </div>
              </div>
            </Tabs.Panel>
          </Tabs>

          {/* Interpretation Section */}
          <div className="mb-4">
            <div className="text-sm font-medium mb-3">Interpretation</div>
            <div className="flex items-start gap-4 mb-3">
              <div className="flex-1">
                <Textarea
                  placeholder="Enter test interpretation or reference range..."
                  value={form.interpretation}
                  onChange={(e) =>
                    handleChange("interpretation", e.currentTarget.value)
                  }
                  minRows={6}
                  classNames={{
                    input: "text-sm",
                  }}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <Text size="xs" className="text-gray-600 mb-2">
                  Notes
                </Text>
                <Textarea
                  placeholder="Enter notes..."
                  value={form.notes}
                  onChange={(e) => handleChange("notes", e.currentTarget.value)}
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

          {/* Submit Button */}
          <div className="mt-6">
            <Button
              type="submit"
              style={{ backgroundColor: "#0b5ed7" }}
              loading={loading}
            >
              Save Test
            </Button>
          </div>
        </form>
      </Paper>
    </div>
  );
};

export default AddTestPage;
