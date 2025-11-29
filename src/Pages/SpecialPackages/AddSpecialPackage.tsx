import React, { useEffect, useState, useCallback } from "react";
import {
  Paper,
  TextInput,
  Button,
  Text,
  Select,
  Tabs,
  Badge,
  ActionIcon,
} from "@mantine/core";
import { useNavigate, useLocation } from "react-router-dom";
import { notifications } from "@mantine/notifications";
import useAuthStore from "../../GlobalStore/store";
import apis from "../../APis/Api";
import { IconArrowLeft, IconX } from "@tabler/icons-react";
import { Anchor } from "@mantine/core";
import RichEditor from "../../components/Global/RichEditor";
import DisplayTabs, {
  type DisplayTabsData,
} from "../../components/Global/DisplayTabs";
import TestPanelSelectorDialog, {
  type SelectedItem,
} from "./Components/TestPanelSelectorDialog";
import type { OtherTestPackageRow } from "../../APis/Types";

interface LocationState {
  isEdit?: boolean;
  packageData?: OtherTestPackageRow;
}

const AddSpecialPackage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as LocationState | null;
  const isEdit = state?.isEdit ?? false;
  const packageData = state?.packageData;

  const organizationId = useAuthStore(
    (s) => s.organizationDetails?.organization_id ?? ""
  );
  const centerId = useAuthStore((s) => s.organizationDetails?.center_id ?? "");

  const [name, setName] = useState(packageData?.name ?? "");
  const [description, setDescription] = useState(
    packageData?.description ?? ""
  );
  const [price, setPrice] = useState(String(packageData?.price ?? ""));
  const [status, setStatus] = useState<"active" | "inactive">(
    (packageData?.status as "active" | "inactive") ?? "active"
  );
  const [data, setData] = useState(packageData?.data ?? "");

  // Tests and Panels selection with full info
  const [selectedTests, setSelectedTests] = useState<SelectedItem[]>([]);
  const [selectedPanels, setSelectedPanels] = useState<SelectedItem[]>([]);

  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState<"tests" | "panels">("tests");

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

    if (typeof tagsData === "string") {
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
      parsedOrgans = Array.isArray(tagsData.organ) ? tagsData.organ : [];
      parsedTopRated =
        tagsData.top_rated === true || tagsData.top_rated === "1";
      parsedTopSelling =
        tagsData.top_selling === true || tagsData.top_selling === "1";
    }

    return { parsedOrgans, parsedTopRated, parsedTopSelling };
  };

  // Initialize display data from packageData when editing
  useEffect(() => {
    if (isEdit && packageData) {
      const pd = packageData as any;
      const { parsedOrgans, parsedTopRated, parsedTopSelling } = parseTags(
        pd.tags
      );

      // Parse FAQ
      let parsedFaqs: { question: string; answer: string }[] = [];
      if (pd.faq) {
        if (typeof pd.faq === "string") {
          try {
            parsedFaqs = JSON.parse(pd.faq);
          } catch {
            parsedFaqs = [];
          }
        } else if (Array.isArray(pd.faq)) {
          parsedFaqs = pd.faq;
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
      if (pd.images && Array.isArray(pd.images)) {
        pd.images.forEach((img: any) => {
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
        displayName: pd.display_name || "",
        shortAbout: pd.short_about || "",
        longAbout: pd.long_about || "",
        sampleType: pd.sample_type || "",
        gender: pd.gender || "any",
        ageRange: pd.age_range || "",
        preparation: pd.preparation || "",
        mrp: pd.mrp || "",
        faqs: parsedFaqs,
        homeCollectionPossible: pd.home_collection_possible || false,
        homeCollectionFee: pd.home_collection_fee || "",
        machineBased: pd.machine_based || false,
        uploadedImages: parsedImages,
        displayCategoryId: pd.display_category_id || "",
      });

      // Parse existing tests and panels for edit mode
      if (Array.isArray(packageData.tests)) {
        const testItems: SelectedItem[] = packageData.tests.map((t: any) => ({
          uid: typeof t === "string" ? t : t.test_id || t.uid || "",
          name: typeof t === "string" ? "" : t.name || t.test_name || "",
          type: "test" as const,
          department: typeof t === "string" ? "" : t.department || "",
          departmentName: typeof t === "string" ? "" : t.department_name || "",
        }));
        setSelectedTests(testItems.filter((t) => t.uid));
      }

      if (Array.isArray(packageData.panels)) {
        const panelItems: SelectedItem[] = packageData.panels.map((p: any) => ({
          uid: typeof p === "string" ? p : p.panel_id || p.uid || "",
          name: typeof p === "string" ? "" : p.name || p.panel_name || "",
          type: "panel" as const,
          department: typeof p === "string" ? "" : p.department || "",
          departmentName: typeof p === "string" ? "" : p.department_name || "",
        }));
        setSelectedPanels(panelItems.filter((p) => p.uid));
      }
    }
  }, [isEdit, packageData]);

  // Open dialog for tests or panels
  const openTestDialog = () => {
    setDialogType("tests");
    setDialogOpen(true);
  };

  const openPanelDialog = () => {
    setDialogType("panels");
    setDialogOpen(true);
  };

  // Handle dialog save
  const handleDialogSave = (
    items: SelectedItem[],
    type: "tests" | "panels"
  ) => {
    if (type === "tests") {
      setSelectedTests(items);
    } else {
      setSelectedPanels(items);
    }
  };

  // Remove test
  const removeTest = (uid: string) => {
    setSelectedTests((prev) => prev.filter((t) => t.uid !== uid));
  };

  // Remove panel
  const removePanel = (uid: string) => {
    setSelectedPanels((prev) => prev.filter((p) => p.uid !== uid));
  };

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

    if (!price.trim() || isNaN(Number(price))) {
      notifications.show({
        title: "Error",
        message: "Valid price is required",
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
      const payload: any = {
        name: name.trim(),
        description: description || "",
        price: Number(price) || 0,
        data: data || "",
        status: status,
        tests: selectedTests.map((t) => ({
          test_id: t.uid,
          department: t.department,
        })),
        panels: selectedPanels.map((p) => ({
          panel_id: p.uid,
          department: p.department,
        })),
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

      console.log("Special Package Payload:", JSON.stringify(payload, null, 2));

      let response;
      if (isEdit && packageData?.uid) {
        // Calculate removed tests and panels
        const originalTestIds = Array.isArray(packageData.tests)
          ? packageData.tests.map((t: any) =>
              typeof t === "string" ? t : t.test_id || t.uid || ""
            )
          : [];
        const originalPanelIds = Array.isArray(packageData.panels)
          ? packageData.panels.map((p: any) =>
              typeof p === "string" ? p : p.panel_id || p.uid || ""
            )
          : [];

        const currentTestIds = selectedTests.map((t) => t.uid);
        const currentPanelIds = selectedPanels.map((p) => p.uid);

        payload.remove_tests = originalTestIds
          .filter((id: string) => !currentTestIds.includes(id))
          .map((test_id: string) => ({ test_id }));
        payload.remove_panels = originalPanelIds
          .filter((id: string) => !currentPanelIds.includes(id))
          .map((panel_id: string) => ({ panel_id }));

        // Update existing package - using "special" as department
        response = await apis.UpdateOtherTestPackage(
          "special",
          organizationId,
          centerId,
          packageData.uid,
          payload
        );
        console.log("UpdateSpecialPackage response:", response);
      } else {
        // Add new package - using "special" as department
        response = await apis.AddOtherTestPackage(
          "special",
          payload,
          organizationId,
          centerId
        );
        console.log("AddSpecialPackage response:", response);
      }

      if (response?.success) {
        notifications.show({
          title: "Success",
          message:
            response.message ||
            (isEdit
              ? "Special package updated successfully"
              : "Special package added successfully"),
          color: "green",
        });
        setTimeout(() => navigate(-1), 800);
      } else {
        notifications.show({
          title: "Error",
          message:
            response?.message ||
            (isEdit
              ? "Failed to update special package"
              : "Failed to add special package"),
          color: "red",
        });
      }
    } catch (err) {
      console.error(
        isEdit ? "UpdateSpecialPackage failed:" : "AddSpecialPackage failed:",
        err
      );
      notifications.show({
        title: "Error",
        message: isEdit
          ? "Failed to update special package"
          : "Failed to add special package",
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
            Back to Special Packages
          </Text>
        </Anchor>
      </div>

      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900">
          {isEdit ? "Edit Special Package" : "Add Special Package"}
        </h2>
        <p className="text-sm text-gray-600">
          {isEdit
            ? "Update details for this special package"
            : "Enter details for a new special package"}
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
                  placeholder="Package name"
                  value={name}
                  onChange={(e) => setName(e.currentTarget.value)}
                  required
                />
              </div>
              <div>
                <TextInput
                  label="Price"
                  placeholder="Price"
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.currentTarget.value)}
                  required
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <Select
                  label="Status"
                  placeholder="Select status"
                  data={[
                    { value: "active", label: "Active" },
                    { value: "inactive", label: "Inactive" },
                  ]}
                  value={status}
                  onChange={(v) =>
                    setStatus((v as "active" | "inactive") ?? "active")
                  }
                />
              </div>
              <div>
                <TextInput
                  label="Additional Data"
                  placeholder="Enter additional data (optional)"
                  value={data}
                  onChange={(e) => setData(e.currentTarget.value)}
                />
              </div>
            </div>

            {/* Tests Selection */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <Text size="sm" fw={500}>
                  Tests
                </Text>
              </div>
              <div
                className="border rounded-md p-3 min-h-[80px] bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={openTestDialog}
              >
                {selectedTests.length === 0 ? (
                  <Text size="sm" c="dimmed" className="text-center py-4">
                    Click here to select tests from different departments.
                  </Text>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {selectedTests.map((test) => (
                      <Badge
                        key={test.uid}
                        variant="light"
                        color="blue"
                        size="lg"
                        rightSection={
                          <ActionIcon
                            size="xs"
                            color="blue"
                            radius="xl"
                            variant="transparent"
                            onClick={(e) => {
                              e.stopPropagation();
                              removeTest(test.uid);
                            }}
                          >
                            <IconX size={12} />
                          </ActionIcon>
                        }
                      >
                        {test.name || test.uid}
                        {test.departmentName && (
                          <Text span size="xs" c="dimmed" ml={4}>
                            ({test.departmentName})
                          </Text>
                        )}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Panels Selection */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <Text size="sm" fw={500}>
                  Panels
                </Text>
              </div>
              <div
                className="border rounded-md p-3 min-h-[80px] bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={openPanelDialog}
              >
                {selectedPanels.length === 0 ? (
                  <Text size="sm" c="dimmed" className="text-center py-4">
                    Click here to select panels from different departments.
                  </Text>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {selectedPanels.map((panel) => (
                      <Badge
                        key={panel.uid}
                        variant="light"
                        color="green"
                        size="lg"
                        rightSection={
                          <ActionIcon
                            size="xs"
                            color="green"
                            radius="xl"
                            variant="transparent"
                            onClick={(e) => {
                              e.stopPropagation();
                              removePanel(panel.uid);
                            }}
                          >
                            <IconX size={12} />
                          </ActionIcon>
                        }
                      >
                        {panel.name || panel.uid}
                        {panel.departmentName && (
                          <Text span size="xs" c="dimmed" ml={4}>
                            ({panel.departmentName})
                          </Text>
                        )}
                      </Badge>
                    ))}
                  </div>
                )}
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
            {isEdit ? "Update Package" : "Save Package"}
          </Button>
        )}
      </div>

      {/* Test/Panel Selector Dialog */}
      <TestPanelSelectorDialog
        opened={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSave={handleDialogSave}
        initialSelectedTests={selectedTests}
        initialSelectedPanels={selectedPanels}
        selectionType={dialogType}
      />
    </div>
  );
};

export default AddSpecialPackage;
