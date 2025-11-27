import React, { useEffect, useState } from "react";
import {
  Button,
  TextInput,
  Textarea,
  Select,
  Checkbox,
  Tabs,
  ActionIcon,
  Card,
  Paper,
  Anchor,
  Text,
} from "@mantine/core";
import { IconArrowLeft, IconTrash, IconPlus } from "@tabler/icons-react";
import { useNavigate } from "react-router-dom";
import apis from "../../APis/Api";
import useAuthStore from "../../GlobalStore/store";
import { notifications } from "@mantine/notifications";
import RichEditor from "../../components/Global/RichEditor";
import DisplayTabs from "../../components/Global/DisplayTabs";

interface ChildParameter {
  id: string; // temp id for UI
  order: string;
  name: string;
  unit_id: string;
  input_type: string;
  default_result: string;
}

interface AddMultipleTestPageState {
  name: string;
  shortName: string;
  category: string;
  price: string;
  method: string;
  instrument: string;
  interpretation: string;
  notes: string;
  comments: string;
  formatOptions: {
    alwaysBold: boolean;
    printLineAfter: boolean;
  };

  children: ChildParameter[];
}

const AddMultipleTestPage: React.FC = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState<AddMultipleTestPageState>({
    name: "",
    shortName: "",
    category: "",
    price: "",
    method: "",
    instrument: "",
    interpretation: "",
    notes: "",
    comments: "",
    formatOptions: { alwaysBold: false, printLineAfter: false },
    children: [
      {
        id: `child_${Date.now()}`,
        order: "1",
        name: "",
        unit_id: "",
        input_type: "numeric",
        default_result: "",
      },
    ],
  });

  const [categories, setCategories] = useState<{ id: string; name: string }[]>(
    []
  );
  const [units, setUnits] = useState<{ id: string; name: string }[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Fetch categories and units on mount
  const organizationId = useAuthStore(
    (s) => s.organizationDetails?.organization_id ?? ""
  );
  const centerId = useAuthStore((s) => s.organizationDetails?.center_id ?? "");

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch categories
        const catResp = await apis.GetTestCategories(
          organizationId,
          centerId,
          undefined,
          1,
          100
        );
        if (catResp?.success && catResp?.data?.categorys) {
          const catList = catResp.data.categorys.map((c) => ({
            id: c.uid,
            name: c.name,
          }));
          setCategories(catList);
        } else {
          setCategories([]);
        }

        // Fetch units
        const unitResp = await apis.GetTestUnits(
          1,
          100,
          organizationId,
          centerId,
          ""
        );
        if (unitResp?.success && unitResp?.data?.units) {
          const unitList = unitResp.data.units.map((u) => ({
            id: u.uid,
            name: u.name,
          }));
          setUnits(unitList);
        }
      } catch (err) {
        console.warn("Failed to fetch categories/units", err);
        notifications.show({
          title: "Error",
          message: "Failed to load categories/units",
          color: "red",
        });
        setCategories([]);
      }
    };

    fetchData();
  }, [organizationId, centerId]);

  const handleParentChange = (
    key: string,
    value: string | number | boolean
  ) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[key];
        return newErrors;
      });
    }
  };

  const handleFormatOptionChange = (key: string, value: boolean) => {
    setForm((prev) => ({
      ...prev,
      formatOptions: { ...prev.formatOptions, [key]: value },
    }));
  };

  const handleAddParameter = () => {
    const newChild: ChildParameter = {
      id: `child_${Date.now()}`,
      order: String(form.children.length + 1),
      name: "",
      unit_id: "",
      input_type: "numeric",
      default_result: "",
    };
    setForm((prev) => ({
      ...prev,
      children: [...prev.children, newChild],
    }));
  };

  const handleDeleteChild = (childId: string) => {
    // Prevent deletion if only one parameter exists
    if (form.children.length <= 1) {
      notifications.show({
        title: "Cannot Delete",
        message: "At least one parameter is required",
        color: "yellow",
      });
      return;
    }
    setForm((prev) => ({
      ...prev,
      children: prev.children.filter((c) => c.id !== childId),
    }));
  };

  const handleChildChange = (
    childId: string,
    field: keyof ChildParameter,
    value: string
  ) => {
    setForm((prev) => ({
      ...prev,
      children: prev.children.map((child) =>
        child.id === childId ? { ...child, [field]: value } : child
      ),
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!form.name.trim()) newErrors.name = "Name is required";
    if (!form.shortName.trim()) newErrors.shortName = "Short name is required";
    if (!form.category) newErrors.category = "Category is required";
    if (form.children.length === 0)
      newErrors.children = "At least one child parameter is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      notifications.show({
        title: "Validation Error",
        message: "Please fill in all required fields",
        color: "red",
      });
      return;
    }

    // Build payload
    const payload = {
      type: "multiple",
      name: form.name,
      short_name: form.shortName,
      category_id: form.category,
      price: form.price || "",
      method: form.method || "",
      instrument: form.instrument || "",
      interpretation: form.interpretation || "",
      notes: form.notes || "",
      comments: form.comments || "",
      children: form.children.map((child) => ({
        order: child.order,
        name: child.name,
        unit_id: child.unit_id,
        input_type: child.input_type,
        default_result: child.default_result,
        optional: false,
      })),
      format_options: {
        always_bold: form.formatOptions.alwaysBold,
        print_line_after: form.formatOptions.printLineAfter,
      },
    };

    console.log(JSON.stringify(payload, null, 2));

    try {
      const response = await apis.AddTestToLabDatabase(
        organizationId,
        centerId,
        payload
      );
      if (response?.success) {
        notifications.show({
          title: "Success",
          message: response.message || "Test created successfully",
          color: "green",
        });
        setTimeout(() => navigate("/test-database"), 1500);
      } else {
        notifications.show({
          title: "Error",
          message: response?.message || "Failed to create test",
          color: "red",
        });
      }
    } catch (err) {
      console.error("Error creating test:", err);
      notifications.show({
        title: "Error",
        message: "Failed to create test",
        color: "red",
      });
    }
  };

  const inputTypeOptions = [
    { value: "numeric", label: "Numeric" },
    { value: "text", label: "Text" },
    { value: "date", label: "Date" },
    { value: "choice", label: "Choice" },
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
          Add New Test (Multi Parameter)
        </h2>
        <p className="text-sm text-gray-600">
          Enter test information to create a new multi-parameter test.
        </p>
      </div>
      <Paper withBorder radius="md" className="p-6">
        <Tabs defaultValue="core" className="mb-4">
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
              {/* Test Details Section */}
              <div className="mb-8 pb-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Test details
                </h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Name and Short Name */}
                  <TextInput
                    label="Name"
                    placeholder="e.g., Serum Phosphorus"
                    value={form.name}
                    onChange={(e) =>
                      handleParentChange("name", e.currentTarget.value)
                    }
                    error={errors.name}
                    required
                  />
                  <TextInput
                    label="Short name"
                    placeholder="e.g., sp"
                    value={form.shortName}
                    onChange={(e) =>
                      handleParentChange("shortName", e.currentTarget.value)
                    }
                    error={errors.shortName}
                    required
                  />

                  {/* Category and Price */}
                  <Select
                    label="Category"
                    placeholder="Select category"
                    data={categories.map((c) => ({
                      value: c.id,
                      label: c.name,
                    }))}
                    value={form.category}
                    onChange={(val) =>
                      handleParentChange("category", val || "")
                    }
                    error={errors.category}
                    required
                  />
                  <TextInput
                    label="Price"
                    placeholder="e.g., 500"
                    value={form.price}
                    onChange={(e) =>
                      handleParentChange("price", e.currentTarget.value)
                    }
                  />

                  {/* Method and Instrument are moved to More details tab */}
                </div>
              </div>

              {/* Child Parameters Section - Card Based UI */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">
                    Parameters
                    {errors.children && (
                      <span className="text-red-500 text-sm ml-2">
                        {errors.children}
                      </span>
                    )}
                  </h2>
                  <Button
                    onClick={handleAddParameter}
                    leftSection={<IconPlus size={16} />}
                    size="sm"
                  >
                    Add Parameter
                  </Button>
                </div>

                <div className="space-y-4">
                  {form.children.map((child, index) => (
                    <Card key={child.id} withBorder shadow="sm" padding="lg">
                      <div className="flex items-start justify-between mb-4">
                        <h3 className="text-md font-semibold text-gray-700">
                          Parameter {index + 1}
                        </h3>
                        <ActionIcon
                          variant="subtle"
                          color="red"
                          onClick={() => handleDeleteChild(child.id)}
                          disabled={form.children.length <= 1}
                        >
                          <IconTrash size={18} />
                        </ActionIcon>
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <TextInput
                          label="Order"
                          placeholder="e.g., 1"
                          value={child.order}
                          onChange={(e) =>
                            handleChildChange(
                              child.id,
                              "order",
                              e.currentTarget.value
                            )
                          }
                          required
                        />
                        <TextInput
                          label="Name"
                          placeholder="e.g., Parameter Name"
                          value={child.name}
                          onChange={(e) =>
                            handleChildChange(
                              child.id,
                              "name",
                              e.currentTarget.value
                            )
                          }
                          required
                        />
                        <Select
                          label="Unit"
                          placeholder="Select unit"
                          data={units.map((u) => ({
                            value: u.id,
                            label: u.name,
                          }))}
                          value={child.unit_id}
                          onChange={(val) =>
                            handleChildChange(child.id, "unit_id", val || "")
                          }
                          required
                        />
                        <Select
                          label="Input Type"
                          data={inputTypeOptions}
                          value={child.input_type}
                          onChange={(val) =>
                            handleChildChange(
                              child.id,
                              "input_type",
                              val || "numeric"
                            )
                          }
                        />
                        <TextInput
                          label="Default Result"
                          placeholder="e.g., Normal"
                          value={child.default_result}
                          onChange={(e) =>
                            handleChildChange(
                              child.id,
                              "default_result",
                              e.currentTarget.value
                            )
                          }
                        />
                        {/* Optional flag removed */}
                      </div>
                    </Card>
                  ))}
                </div>
              </div>

              {/* More Details Section */}
              <div className="mb-8">
                <Tabs defaultValue="more">
                  <Tabs.List>
                    <Tabs.Tab value="more">More details</Tabs.Tab>
                    <Tabs.Tab value="format">Format options</Tabs.Tab>
                  </Tabs.List>

                  <Tabs.Panel value="more" pt="xs">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                      <TextInput
                        label="Method"
                        placeholder="e.g., test method"
                        value={form.method}
                        onChange={(e) =>
                          handleParentChange("method", e.currentTarget.value)
                        }
                      />
                      <TextInput
                        label="Instrument"
                        placeholder="e.g., test instrument"
                        value={form.instrument}
                        onChange={(e) =>
                          handleParentChange(
                            "instrument",
                            e.currentTarget.value
                          )
                        }
                      />
                    </div>
                    <div className="mb-6">
                      <div className="text-sm font-medium mb-2">
                        Interpretation
                      </div>
                      <RichEditor
                        value={form.interpretation}
                        onChange={(content) =>
                          handleParentChange("interpretation", content)
                        }
                      />
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                      <Textarea
                        label="Notes"
                        placeholder="Enter notes"
                        minRows={4}
                        value={form.notes}
                        onChange={(e) =>
                          handleParentChange("notes", e.currentTarget.value)
                        }
                      />
                    </div>

                    <Textarea
                      label="Comments"
                      placeholder="Enter comments"
                      minRows={3}
                      value={form.comments}
                      onChange={(e) =>
                        handleParentChange("comments", e.currentTarget.value)
                      }
                      className="mb-8"
                    />
                  </Tabs.Panel>

                  <Tabs.Panel value="format" pt="xs">
                    <div className="space-y-3 mb-6">
                      <Checkbox
                        label="Always bold"
                        checked={form.formatOptions.alwaysBold}
                        onChange={(e) =>
                          handleFormatOptionChange(
                            "alwaysBold",
                            e.currentTarget.checked
                          )
                        }
                      />
                      <div>
                        <Checkbox
                          label="Print line after"
                          checked={form.formatOptions.printLineAfter}
                          onChange={(e) =>
                            handleFormatOptionChange(
                              "printLineAfter",
                              e.currentTarget.checked
                            )
                          }
                        />
                        <p className="text-sm text-gray-500 mt-2">
                          Won't print line for panels.
                        </p>
                      </div>
                    </div>
                  </Tabs.Panel>
                </Tabs>
              </div>

              {/* Submit Button */}
              <div className="flex gap-3 justify-end mt-4">
                <Button
                  variant="outline"
                  onClick={() => navigate("/test-database")}
                >
                  Cancel
                </Button>
                <Button type="submit">Save Test</Button>
              </div>
            </form>
          </Tabs.Panel>

          <Tabs.Panel value="display" pt="md">
            <DisplayTabs />
          </Tabs.Panel>
        </Tabs>
      </Paper>
    </div>
  );
};

export default AddMultipleTestPage;
