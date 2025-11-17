import React, { useState, useEffect } from "react";
import { Drawer, TextInput, Select, Button, MultiSelect } from "@mantine/core";
import type { TestPackageRow } from "../../../APis/Types";

interface Props {
  opened: boolean;
  onClose: () => void;
  row?: TestPackageRow | null;
  onSave: (row: TestPackageRow) => void;
  loading?: boolean;
}

const EditPackageDrawer: React.FC<Props> = ({
  opened,
  onClose,
  row,
  onSave,
  loading,
}) => {
  const [name, setName] = useState("");
  const [fee, setFee] = useState("");
  const [gender, setGender] = useState<"Male" | "Female" | "Both">("Both");
  const [included, setIncluded] = useState("");
  const [tests, setTests] = useState<string[]>([]);
  const [panels, setPanels] = useState<string[]>([]);

  useEffect(() => {
    if (opened) {
      if (row) {
        setName(row.name || "");
        setFee(row.fee || "");
        setGender(row.gender || "Both");
        setIncluded(row.included || "");
        // Pre-fill tests/panels if provided, or try to split included
        setTests(
          row.tests ||
            (row.included ? row.included.split(",").map((s) => s.trim()) : [])
        );
        setPanels(row.panels || []);
      } else {
        setName("");
        setFee("");
        setGender("Both");
        setIncluded("");
        setTests([]);
        setPanels([]);
      }
    } else {
      // always clear values when drawer is closed
      setName("");
      setFee("");
      setGender("Both");
      setIncluded("");
    }
  }, [row, opened]);

  const handleSave = () => {
    if (!name.trim()) return;
    const updated: TestPackageRow = {
      id: row?.id || String(Date.now()),
      name: name.trim(),
      fee: fee.trim(),
      gender,
      included: [...tests, ...panels].join(", ") || included.trim(),
      // store arrays as well
      tests: tests.length ? tests : undefined,
      panels: panels.length ? panels : undefined,
    };
    onSave(updated);
    onClose();
  };

  return (
    <Drawer
      opened={opened}
      onClose={onClose}
      position="right"
      size="md"
      title={row ? "Edit test package" : "Add test package"}
    >
      <div className="flex flex-col gap-4">
        <TextInput
          label="Name"
          value={name}
          onChange={(e) => setName(e.currentTarget.value)}
        />
        <TextInput
          label="Fee"
          value={fee}
          onChange={(e) => setFee(e.currentTarget.value)}
        />
        <Select
          label="Bill only for gender"
          value={gender}
          onChange={(v) =>
            setGender((v as "Male" | "Female" | "Both") || "Both")
          }
          data={[
            { value: "Both", label: "Both" },
            { value: "Male", label: "Male" },
            { value: "Female", label: "Female" },
          ]}
        />
        <MultiSelect
          label="Tests"
          placeholder="Select tests"
          data={[
            { value: "Acid - Fast Bacilli", label: "Acid - Fast Bacilli" },
            { value: "A/G Ratio", label: "A/G Ratio" },
            { value: "C-Reactive Protein", label: "C-Reactive Protein" },
            {
              value: "Peripheral Blood Smear",
              label: "Peripheral Blood Smear",
            },
            {
              value: "Complete Blood Count (CBC)",
              label: "Complete Blood Count (CBC)",
            },
            {
              value: "Thyroid-Stimulating Hormone",
              label: "Thyroid-Stimulating Hormone",
            },
          ]}
          value={tests}
          onChange={setTests}
          searchable
          clearable
        />
        <MultiSelect
          label="Panels"
          placeholder="Select panels"
          data={[
            { value: "Arthritis Profile", label: "Arthritis Profile" },
            { value: "BT & CT", label: "BT & CT" },
            { value: "Antenatal Panel", label: "Antenatal Panel" },
            {
              value: "Complete Metabolic Panel",
              label: "Complete Metabolic Panel",
            },
          ]}
          value={panels}
          onChange={setPanels}
          searchable
          clearable
        />
        <div className="flex items-center gap-3">
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

export default EditPackageDrawer;
