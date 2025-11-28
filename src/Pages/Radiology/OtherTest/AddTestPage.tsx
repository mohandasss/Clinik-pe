import React, { useEffect, useState, useCallback } from "react";
import {
  Paper,
  TextInput,
  Button,
  Text,
  Select,
  Switch,
  Tabs,
} from "@mantine/core";
import { useNavigate, useLocation } from "react-router-dom";
import { notifications } from "@mantine/notifications";
import useAuthStore from "../../../GlobalStore/store";
import apis from "../../../APis/Api";
import { IconArrowLeft } from "@tabler/icons-react";
import { Anchor } from "@mantine/core";
import RichEditor from "../../../components/Global/RichEditor";
import DisplayTabs, {
  type DisplayTabsData,
} from "../../../components/Global/DisplayTabs";

interface LocationState {
  isEdit?: boolean;
  testData?: {
    id: string;
    name: string;
    description?: string;
    category?: string;
    price?: string;
    status?: string;
  };
}

const AddTestPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as LocationState | null;
  const isEdit = state?.isEdit ?? false;
  const testData = state?.testData;

  const organizationId = useAuthStore(
    (s) => s.organizationDetails?.organization_id ?? ""
  );
  const centerId = useAuthStore((s) => s.organizationDetails?.center_id ?? "");

  const [name, setName] = useState(testData?.name ?? "");
  const [description, setDescription] = useState(testData?.description ?? "");
  const [price, setPrice] = useState(testData?.price ?? "");
  const [status, setStatus] = useState(testData?.status === "active");
  const [data] = useState("");
  const [category, setCategory] = useState<string | null>(
    testData?.category ?? null
  );

  const [categories, setCategories] = useState<{ id: string; name: string }[]>(
    []
  );
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<string | null>("core");

  // Display tab data
  const [displayData, setDisplayData] = useState<DisplayTabsData | null>(null);

  // Memoized callback to prevent infinite loops
  const handleDisplayDataChange = useCallback((data: DisplayTabsData) => {
    setDisplayData(data);
  }, []);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const resp = await apis.GetOtherCategories(
          1,
          100,
          "radiology",
          organizationId,
          centerId
        );
        if (mounted && resp?.success && resp?.data?.categorys) {
          setCategories(
            resp.data.categorys.map((c: any) => ({ id: c.uid, name: c.name }))
          );
        }
      } catch (err) {
        console.warn("Failed to load categories", err);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [organizationId, centerId]);

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!name.trim()) {
      notifications.show({
        title: "Error",
        message: "Name is required",
        color: "red",
      });
      return;
    }
    if (!category) {
      notifications.show({
        title: "Error",
        message: "Category is required",
        color: "red",
      });
      return;
    }

    setLoading(true);
    try {
      // Build images array - send only image IDs
      const imagesPayload =
        displayData?.uploadedImages?.map((img) => img.target_id) || [];

      // Build payload with all fields including display data
      const payload = {
        name: name.trim(),
        description: description || "",
        price: price || "0",
        data: data || "",
        category_id: category,
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
        home_collection_possible: displayData?.homeCollectionPossible || false,
        home_collection_fee: displayData?.homeCollectionFee || "",
        machine_based: displayData?.machineBased || false,
      };

      console.log("Payload:", JSON.stringify(payload, null, 2));

      let response;
      if (isEdit && testData?.id) {
        // Update existing test
        response = await apis.UpdateOtherTestDatabase(
          "radiology",
          testData.id,
          payload,
          organizationId || "",
          centerId || ""
        );
        console.log("UpdateOtherTestDatabase response:", response);
      } else {
        // Add new test
        response = await apis.AddOtherTestDatabase(
          "radiology",
          payload,
          organizationId || "",
          centerId || ""
        );
        console.log("AddOtherTestDatabase response:", response);
      }

      if (response?.success) {
        notifications.show({
          title: "Success",
          message:
            response.message ||
            (isEdit ? "Test updated successfully" : "Test added successfully"),
          color: "green",
        });
        setTimeout(() => navigate(-1), 800);
      } else {
        notifications.show({
          title: "Error",
          message:
            response?.message ||
            (isEdit ? "Failed to update test" : "Failed to add test"),
          color: "red",
        });
      }
    } catch (err) {
      console.error(
        isEdit
          ? "UpdateOtherTestDatabase failed:"
          : "AddOtherTestDatabase failed:",
        err
      );
      notifications.show({
        title: "Error",
        message: isEdit ? "Failed to update test" : "Failed to add test",
        color: "red",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleNextTab = () => {
    setActiveTab("display");
  };

  return (
    <div className="p-0">
      <div className="mb-4">
        <Anchor
          component="button"
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 px-3 py-1 text-blue-600 text-sm hover:bg-blue-50 rounded-md"
        >
          <IconArrowLeft size={16} />
          <Text size="sm" fw={600}>
            Back to Radiology Tests
          </Text>
        </Anchor>
      </div>

      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900">
          {isEdit ? "Edit Radiology Test" : "Add Radiology Test"}
        </h2>
        <p className="text-sm text-gray-600">
          {isEdit
            ? "Update details for this radiology test"
            : "Enter details for a new radiology test"}
        </p>
      </div>

      <Paper withBorder radius="md" className="p-6">
        <Tabs value={activeTab} onChange={setActiveTab} className="mb-4">
          <Tabs.List grow>
            <Tabs.Tab value="core">Core</Tabs.Tab>
            <Tabs.Tab value="display">Display</Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="core" pt="md">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <TextInput
                  label="Name"
                  placeholder="Test name"
                  value={name}
                  onChange={(e) => setName(e.currentTarget.value)}
                  required
                />
              </div>
              <div>
                <TextInput
                  label="Price"
                  placeholder="Price"
                  value={price}
                  onChange={(e) => setPrice(e.currentTarget.value)}
                />
              </div>
            </div>

            <div className="mb-4">
              <Text size="xs" className="text-gray-600 mb-2">
                Description
              </Text>
              <RichEditor
                value={description}
                onChange={(content) => setDescription(content)}
              />
            </div>

            <div className="mb-4">
              <Select
                label="Category"
                placeholder="Select category"
                data={categories.map((c) => ({ value: c.id, label: c.name }))}
                value={category}
                onChange={(v) => setCategory(v)}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="flex items-center gap-2">
                <Switch
                  label="Active"
                  checked={status}
                  onChange={(e) => setStatus(e.currentTarget.checked)}
                />
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
            {isEdit ? "Update Test" : "Save Test"}
          </Button>
        )}
      </div>
    </div>
  );
};

export default AddTestPage;
