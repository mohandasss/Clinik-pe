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
  const [initialDisplayData, setInitialDisplayData] =
    useState<Partial<DisplayTabsData> | null>(null);

  // Memoized callback to prevent infinite loops
  const handleDisplayDataChange = useCallback((data: DisplayTabsData) => {
    setDisplayData(data);
  }, []);

  // Helper function to parse tags in various formats
  const parseTags = (tagsData: any) => {
    let parsedOrgans: string[] = [];
    let parsedTopRated = false;
    let parsedTopSelling = false;

    if (!tagsData) return { parsedOrgans, parsedTopRated, parsedTopSelling };

    // Handle JSON string format
    if (typeof tagsData === "string") {
      // Try JSON parsing first
      try {
        const tagsObj = JSON.parse(tagsData);
        parsedOrgans = Array.isArray(tagsObj.organ) ? tagsObj.organ : [];
        parsedTopRated =
          tagsObj.top_rated === true || tagsObj.top_rated === "1";
        parsedTopSelling =
          tagsObj.top_selling === true || tagsObj.top_selling === "1";
        return { parsedOrgans, parsedTopRated, parsedTopSelling };
      } catch {
        // Not JSON, try custom format
      }

      // Handle custom string format like "organ=heart,top_rated"
      const parts = tagsData.split(",");
      for (const part of parts) {
        const trimmed = part.trim();
        if (trimmed.startsWith("organ=")) {
          const organ = trimmed.substring(6).trim();
          if (organ) parsedOrgans.push(organ);
        } else if (trimmed === "top_rated") {
          parsedTopRated = true;
        } else if (trimmed === "top_selling") {
          parsedTopSelling = true;
        }
      }
    } else if (typeof tagsData === "object") {
      // Handle object format
      parsedOrgans = Array.isArray(tagsData.organ) ? tagsData.organ : [];
      parsedTopRated =
        tagsData.top_rated === true || tagsData.top_rated === "1";
      parsedTopSelling =
        tagsData.top_selling === true || tagsData.top_selling === "1";
    }

    return { parsedOrgans, parsedTopRated, parsedTopSelling };
  };

  // Initialize display data from testData when editing
  useEffect(() => {
    if (isEdit && testData) {
      const td = testData as any;
      const { parsedOrgans, parsedTopRated, parsedTopSelling } = parseTags(
        td.tags
      );

      // Parse FAQ
      let parsedFaqs: { question: string; answer: string }[] = [];
      if (td.faq) {
        if (typeof td.faq === "string") {
          try {
            parsedFaqs = JSON.parse(td.faq);
          } catch {
            parsedFaqs = [];
          }
        } else if (Array.isArray(td.faq)) {
          parsedFaqs = td.faq;
        }
      }
      if (parsedFaqs.length === 0) {
        parsedFaqs = [{ question: "", answer: "" }];
      }

      // Parse images
      const parsedImages: {
        type: "icon" | "image";
        target_type: string;
        target_id: string;
      }[] = [];
      if (td.images && Array.isArray(td.images)) {
        td.images.forEach((img: any) => {
          if (typeof img === "object" && img.target_id) {
            parsedImages.push({
              type: img.type || "image",
              target_type: img.target_type || "",
              target_id: img.target_id,
            });
          } else if (typeof img === "string") {
            parsedImages.push({
              type: "image",
              target_type: "",
              target_id: img,
            });
          }
        });
      }

      setInitialDisplayData({
        organs: parsedOrgans,
        topRated: parsedTopRated,
        topSelling: parsedTopSelling,
        displayName: td.display_name || "",
        shortAbout: td.short_about || "",
        longAbout: td.long_about || "",
        sampleType: td.sample_type || "",
        gender: td.gender || "any",
        ageRange: td.age_range || "",
        preparation: td.preparation || "",
        mrp: td.mrp || "",
        faqs: parsedFaqs,
        homeCollectionPossible: td.home_collection_possible || false,
        homeCollectionFee: td.home_collection_fee || "",
        machineBased: td.machine_based || false,
        uploadedImages: parsedImages,
        displayCategoryId: td.display_category_id || "",
      });
    }
  }, [isEdit, testData]);

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
        display_category_id: displayData?.displayCategoryId || "",
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
            <DisplayTabs
              onDataChange={handleDisplayDataChange}
              initialData={initialDisplayData || undefined}
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
            {isEdit ? "Update Test" : "Save Test"}
          </Button>
        )}
      </div>
    </div>
  );
};

export default AddTestPage;
