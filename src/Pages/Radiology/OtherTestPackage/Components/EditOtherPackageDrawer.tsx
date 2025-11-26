import React, { useState, useEffect } from "react";
import { Drawer, TextInput, Select, Button, MultiSelect } from "@mantine/core";
import { notifications } from "@mantine/notifications";

import apis from "../../../../APis/Api";
import useAuthStore from "../../../../GlobalStore/store";

import type { OtherTestPackageRow } from "../../../../APis/Types";

interface Props {
  opened: boolean;
  onClose: () => void;
  row?: OtherTestPackageRow | null;
  onSave: (
    row: OtherTestPackageRow,
    removeTests?: string[],
    removePanels?: string[]
  ) => void;
  loading?: boolean;
}

const EditOtherPackageDrawer: React.FC<Props> = ({
  opened,
  onClose,
  row,
  onSave,
  loading,
}) => {
  const { organizationDetails } = useAuthStore();

  // Form State
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [status, setStatus] = useState<
    "male" | "female" | "both" | "active" | "inactive"
  >("active");
  const [data, setData] = useState("");
  const [tests, setTests] = useState<string[]>([]);
  const [panels, setPanels] = useState<string[]>([]);

  // Track original state for calculating removals
  const [originalTests, setOriginalTests] = useState<string[]>([]);
  const [originalPanels, setOriginalPanels] = useState<string[]>([]);

  // Dynamic Options
  const [availableTests, setAvailableTests] = useState<
    { value: string; label: string }[]
  >([]);
  const [availablePanels, setAvailablePanels] = useState<
    { value: string; label: string }[]
  >([]);

  const [loadingData, setLoadingData] = useState(false);

  // -----------------------------
  // Load OtherTests + OtherPanels
  // -----------------------------
  useEffect(() => {
    if (
      !opened ||
      !organizationDetails?.organization_id ||
      !organizationDetails?.center_id
    )
      return;

    const loadData = async () => {
      try {
        setLoadingData(true);

        // ----- Fetch Radiology Tests (OtherTests) -----
        const testsResp = await apis.GetOtherTestDatabase(
          "radiology",
          1,
          100,
          organizationDetails.organization_id as string,
          organizationDetails.center_id as string,
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

        // ----- Fetch Radiology Panels (OtherPanels) -----
        const panelsResp = await apis.GetOtherTestPanels(
          "radiology",
          organizationDetails.organization_id as string,
          organizationDetails.center_id as string,
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
  }, [opened, organizationDetails]);

  // -----------------------------
  // Pre-fill on Edit
  // -----------------------------
  useEffect(() => {
    if (!opened) {
      setName("");
      setDescription("");
      setPrice("");
      setStatus("active");
      setData("");
      setTests([]);
      setPanels([]);
      setOriginalTests([]);
      setOriginalPanels([]);
      return;
    }

    if (!row) {
      setName("");
      setDescription("");
      setPrice("");
      setStatus("active");
      setData("");
      setTests([]);
      setPanels([]);
      setOriginalTests([]);
      setOriginalPanels([]);
      return;
    }

    setName(row.name || "");
    setDescription(row.description || "");
    setPrice(String(row.price || ""));
    setStatus(row.status || "active");
    setData(row.data || "");

    // Extract test/panel IDs
    const testIds = Array.isArray(row.tests)
      ? row.tests
          .map((t: any) =>
            typeof t === "string" ? t : t.test_id || t.uid || ""
          )
          .filter(Boolean)
      : [];

    const panelIds = Array.isArray(row.panels)
      ? row.panels
          .map((p: any) =>
            typeof p === "string" ? p : p.panel_id || p.uid || ""
          )
          .filter(Boolean)
      : [];

    setTests(testIds);
    setPanels(panelIds);

    // Store original state for calculating removals
    setOriginalTests(testIds);
    setOriginalPanels(panelIds);
  }, [row, opened]);

  // -----------------------------
  // Save Handler
  // -----------------------------
  const handleSave = () => {
    if (!name.trim()) {
      notifications.show({
        title: "Validation Error",
        message: "Package name is required",
        color: "red",
      });
      return;
    }

    if (!price.trim() || isNaN(Number(price))) {
      notifications.show({
        title: "Validation Error",
        message: "Valid price is required",
        color: "red",
      });
      return;
    }

    // Calculate which tests and panels were removed
    const removeTests = originalTests.filter((t) => !tests.includes(t));
    const removePanels = originalPanels.filter((p) => !panels.includes(p));

    const updated: OtherTestPackageRow = {
      uid: row?.uid || row?.id || String(Date.now()),
      id: row?.id,
      name: name.trim(),
      description: description.trim(),
      price: Number(price) || 0,
      status: status,
      data: data.trim(),

      tests: tests.length
        ? tests.map((t) => ({
            test_id: t,
          }))
        : [],

      panels: panels.length
        ? panels.map((p) => ({
            panel_id: p,
          }))
        : [],
    };

    onSave(updated, removeTests, removePanels);
    onClose();
  };

  // -----------------------------
  // UI
  // -----------------------------
  return (
    <Drawer
      opened={opened}
      onClose={onClose}
      position="right"
      size="md"
      title={row ? "Edit radiology test package" : "Add radiology test package"}
    >
      <div className="flex flex-col gap-4">
        <TextInput
          label="Name"
          placeholder="Enter package name"
          value={name}
          onChange={(e) => setName(e.currentTarget.value)}
          required
        />

        <TextInput
          label="Description"
          placeholder="Enter package description"
          value={description}
          onChange={(e) => setDescription(e.currentTarget.value)}
        />

        <TextInput
          label="Price"
          placeholder="Enter price"
          type="number"
          value={price}
          onChange={(e) => setPrice(e.currentTarget.value)}
          required
        />

        <Select
          label="Status"
          value={status}
          onChange={(v) =>
            setStatus(
              (v as "male" | "female" | "both" | "active" | "inactive") ||
                "active"
            )
          }
          data={[
            { value: "active", label: "Active" },
            { value: "inactive", label: "Inactive" },
          ]}
        />

        <TextInput
          label="Data"
          placeholder="Enter additional data (optional)"
          value={data}
          onChange={(e) => setData(e.currentTarget.value)}
        />

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

        <div className="flex items-center gap-3 mt-4">
          <Button
            onClick={handleSave}
            variant="filled"
            color="blue"
            loading={loading}
          >
            Save
          </Button>
          <Button variant="default" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </div>
    </Drawer>
  );
};

export default EditOtherPackageDrawer;
