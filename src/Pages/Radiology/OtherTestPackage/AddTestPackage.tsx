import React, { useEffect, useState, useCallback } from "react";
import {
  Paper,
  TextInput,
  Button,
  Text,
  Select,
  MultiSelect,
  Tabs,
} from "@mantine/core";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import { notifications } from "@mantine/notifications";
import useAuthStore from "../../../GlobalStore/store";
import apis from "../../../APis/Api";
import { IconArrowLeft } from "@tabler/icons-react";
import { Anchor } from "@mantine/core";
import RichEditor from "../../../components/Global/RichEditor";
import DisplayTabs, {
  type DisplayTabsData,
} from "../../../components/Global/DisplayTabs";
import type { OtherTestPackageRow } from "../../../APis/Types";

interface LocationState {
  isEdit?: boolean;
  packageData?: OtherTestPackageRow;
}

const AddTestPackage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { department } = useParams();
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
  const [status, setStatus] = useState<
    "male" | "female" | "both" | "active" | "inactive"
  >(packageData?.status ?? "active");
  const [data, setData] = useState(packageData?.data ?? "");

  // Tests and Panels selection
  const [tests, setTests] = useState<string[]>([]);
  const [panels, setPanels] = useState<string[]>([]);

  // Original values for tracking removals in edit mode
  const [originalTests, setOriginalTests] = useState<string[]>([]);
  const [originalPanels, setOriginalPanels] = useState<string[]>([]);

  // Available options
  const [availableTests, setAvailableTests] = useState<
    { value: string; label: string }[]
  >([]);
  const [availablePanels, setAvailablePanels] = useState<
    { value: string; label: string }[]
  >([]);

  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(false);
  const [activeTab, setActiveTab] = useState<string | null>("core");

  // Display tab data
  const [displayData, setDisplayData] = useState<DisplayTabsData | null>(null);

  // Memoized callback to prevent infinite loops
  const handleDisplayDataChange = useCallback((data: DisplayTabsData) => {
    setDisplayData(data);
  }, []);

  // Load available tests and panels
  useEffect(() => {
    if (!organizationId || !centerId) return;

    const loadData = async () => {
      try {
        setLoadingData(true);

        // Fetch Radiology Tests
        const testsResp = await apis.GetOtherTestDatabase(
          "radiology",
          1,
          100,
          organizationId,
          centerId,
          ""
        );
        if (testsResp?.data?.tests && Array.isArray(testsResp.data.tests)) {
          setAvailableTests(
            testsResp.data.tests.map((t: any) => ({
              value: t.uid,
              label: t.name,
            }))
          );
        }

        // Fetch Radiology Panels
        const panelsResp = await apis.GetOtherTestPanels(
          "radiology",
          organizationId,
          centerId,
          1,
          100,
          ""
        );
        if (panelsResp?.data?.panels && Array.isArray(panelsResp.data.panels)) {
          setAvailablePanels(
            panelsResp.data.panels.map((p: any) => ({
              value: p.uid || p.panel_id || p.id,
              label: p.name,
            }))
          );
        }
      } catch (err: any) {
        notifications.show({
          title: "Error",
          message: "Failed to load tests and panels",
          color: "red",
        });
      } finally {
        setLoadingData(false);
      }
    };

    loadData();
  }, [organizationId, centerId]);

  // Pre-fill data on edit
  useEffect(() => {
    if (!packageData) return;

    // Extract test/panel IDs
    const testIds = Array.isArray(packageData.tests)
      ? packageData.tests
          .map((t: any) =>
            typeof t === "string" ? t : t.test_id || t.uid || ""
          )
          .filter(Boolean)
      : [];

    const panelIds = Array.isArray(packageData.panels)
      ? packageData.panels
          .map((p: any) =>
            typeof p === "string" ? p : p.panel_id || p.uid || ""
          )
          .filter(Boolean)
      : [];

    setTests(testIds);
    setPanels(panelIds);
    setOriginalTests(testIds);
    setOriginalPanels(panelIds);
  }, [packageData]);

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

      // Calculate removed tests and panels for edit mode
      const removeTests = originalTests.filter((t) => !tests.includes(t));
      const removePanels = originalPanels.filter((p) => !panels.includes(p));

      // Build payload with all fields including display data
      const payload: any = {
        name: name.trim(),
        description: description || "",
        price: Number(price) || 0,
        data: data || "",
        status: status,
        tests: tests.map((t) => ({ test_id: t })),
        panels: panels.map((p) => ({ panel_id: p })),
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
      if (isEdit && packageData?.uid) {
        // Add remove arrays for update
        payload.remove_tests = removeTests.map((test_id) => ({ test_id }));
        payload.remove_panels = removePanels.map((panel_id) => ({ panel_id }));

        // Update existing package
        response = await apis.UpdateOtherTestPackage(
          department || "radiology",
          organizationId,
          centerId,
          packageData.uid,
          payload
        );
        console.log("UpdateOtherTestPackage response:", response);
      } else {
        // Add new package
        response = await apis.AddOtherTestPackage(
          department || "radiology",
          payload,
          organizationId,
          centerId
        );
        console.log("AddOtherTestPackage response:", response);
      }

      if (response?.success) {
        notifications.show({
          title: "Success",
          message:
            response.message ||
            (isEdit
              ? "Package updated successfully"
              : "Package added successfully"),
          color: "green",
        });
        setTimeout(() => navigate(-1), 800);
      } else {
        notifications.show({
          title: "Error",
          message:
            response?.message ||
            (isEdit ? "Failed to update package" : "Failed to add package"),
          color: "red",
        });
      }
    } catch (err) {
      console.error(
        isEdit
          ? "UpdateOtherTestPackage failed:"
          : "AddOtherTestPackage failed:",
        err
      );
      notifications.show({
        title: "Error",
        message: isEdit ? "Failed to update package" : "Failed to add package",
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
            Back to Radiology Test Packages
          </Text>
        </Anchor>
      </div>

      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900">
          {isEdit
            ? "Edit Radiology Test Package"
            : "Add Radiology Test Package"}
        </h2>
        <p className="text-sm text-gray-600">
          {isEdit
            ? "Update details for this radiology test package"
            : "Enter details for a new radiology test package"}
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
                    setStatus(
                      (v as
                        | "male"
                        | "female"
                        | "both"
                        | "active"
                        | "inactive") ?? "active"
                    )
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <MultiSelect
                  label="Tests"
                  placeholder="Select radiology tests"
                  data={availableTests}
                  value={tests}
                  onChange={setTests}
                  searchable
                  clearable
                  disabled={loadingData}
                />
              </div>
              <div>
                <MultiSelect
                  label="Panels"
                  placeholder="Select radiology panels"
                  data={availablePanels}
                  value={panels}
                  onChange={setPanels}
                  searchable
                  clearable
                  disabled={loadingData}
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
            {isEdit ? "Update Package" : "Save Package"}
          </Button>
        )}
      </div>
    </div>
  );
};

export default AddTestPackage;
