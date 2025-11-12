import React, { useState } from "react";
import FeeTable from "./Components/FeeTable";
import type { FeeRow } from "./Components/FeeTable";
import { Drawer, TextInput, Select, Button, Grid } from "@mantine/core";

const sampleData: FeeRow[] = [
  {
    id: "1234",
    orgId: "ORG123",
    centerId: "CTR123",
    provider: "Dr. Rajan Saha",
    appointmentType: "#AP123",
    fee: "₹100",
    commissionType: "Flat",
    commission: "₹50",
  },
  {
    id: "1235",
    orgId: "ORG124",
    centerId: "CTR124",
    provider: "#PDR124",
    appointmentType: "#AP124",
    fee: "₹100",
    commissionType: "%",
    commission: "₹10",
  },
  {
    id: "1236",
    orgId: "ORG125",
    centerId: "CTR125",
    provider: "#PDR125",
    appointmentType: "#AP125",
    fee: "₹150",
    commissionType: "%",
    commission: "₹10",
  },
  {
    id: "1237",
    orgId: "ORG126",
    centerId: "CTR126",
    provider: "#PDR126",
    appointmentType: "#AP125",
    fee: "₹200",
    commissionType: "%",
    commission: "₹10",
  },
];

const FeeManagement: React.FC = () => {
  // make data stateful so we can add new fees from the drawer form
  const [data, setData] = useState<FeeRow[]>(sampleData);
  const [drawerOpened, setDrawerOpened] = useState(false);

  // form state
  const [formId, setFormId] = useState("");
  const [formOrgId, setFormOrgId] = useState("");
  const [formCenterId, setFormCenterId] = useState("");
  const [formProvider, setFormProvider] = useState("");
  const [formAppointmentId, setFormAppointmentId] = useState("");
  const [formFeeAmount, setFormFeeAmount] = useState<number | undefined>(
    undefined
  );
  const [formCommissionType, setFormCommissionType] = useState<string>("Flat");
  const [formCommission, setFormCommission] = useState<number | undefined>(
    undefined
  );

  const handleAdd = () => {
    setDrawerOpened(true);
  };

  const handlePageChange = (page: number) => {
    console.log("page change to", page);
  };

  const resetForm = () => {
    setFormId("");
    setFormOrgId("");
    setFormCenterId("");
    setFormProvider("");
    setFormAppointmentId("");
    setFormFeeAmount(undefined);
    setFormCommissionType("Flat");
    setFormCommission(undefined);
  };

  const handleSave = () => {
    // basic validation
    const newRow: FeeRow = {
      id: formId || String(Date.now()).slice(-6),
      orgId: formOrgId || "ORG-NEW",
      centerId: formCenterId || "CTR-NEW",
      provider: formProvider || "(unknown)",
      appointmentType: formAppointmentId || "#API-NEW",
      fee: formFeeAmount ? `₹${formFeeAmount}` : "₹0",
      commissionType: formCommissionType,
      commission: formCommission
        ? formCommissionType === "%"
          ? `${formCommission}%`
          : `₹${formCommission}`
        : "₹0",
    };

    setData((d) => [newRow, ...d]);
    resetForm();
    setDrawerOpened(false);
  };

  return (
    <div className="p-2">
      <FeeTable
        data={data}
        total={50}
        pageSize={10}
        currentPage={1}
        onAdd={handleAdd}
        onPageChange={handlePageChange}
      />

      <Drawer
      position="right"
        opened={drawerOpened}
        onClose={() => setDrawerOpened(false)}
        title="Fee Details"
        padding="md"
        size="lg"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSave();
          }}
        >
          <Grid gutter="md">
            

            <Grid.Col span={6}>
              <TextInput
                label="Organization"
                placeholder="e.g., Wellbeing"
                required
                value={formOrgId}
                onChange={(e) => setFormOrgId(e.currentTarget.value)}
              />
            </Grid.Col>

            <Grid.Col span={6}>
              <TextInput
                label="Center"
                placeholder="e.g., Downtown Clinic"
                required
                value={formCenterId}
                onChange={(e) => setFormCenterId(e.currentTarget.value)}
              />
            </Grid.Col>

            <Grid.Col span={6}>
              <Select
                label="Provider"
                data={data.map((d) => d.provider).filter(Boolean)}
                placeholder="Select provider"
                searchable
                required
                value={formProvider}
                onChange={(v) => setFormProvider(v || "")}
              />
            </Grid.Col>

            <Grid.Col span={6}>
              <TextInput
                label="Appointment Type"
                placeholder="e.g., #API127"
                required
                value={formAppointmentId}
                onChange={(e) => setFormAppointmentId(e.currentTarget.value)}
              />
            </Grid.Col>

            <Grid.Col span={6}>
              <TextInput
                label="Fee Amount"
                placeholder="100"
                required
                type="number"
                value={formFeeAmount === undefined ? "" : String(formFeeAmount)}
                onChange={(e) =>
                  setFormFeeAmount(
                    e.currentTarget.value
                      ? Number(e.currentTarget.value)
                      : undefined
                  )
                }
              />
            </Grid.Col>

            <Grid.Col span={6}>
              <Select
                label="Commission Type"
                data={["Flat", "%"]}
                value={formCommissionType}
                onChange={(v) => setFormCommissionType(v || "Flat")}
              />
            </Grid.Col>

            <Grid.Col span={6}>
              <TextInput
                label="Commission"
                placeholder="50"
                type="number"
                value={
                  formCommission === undefined ? "" : String(formCommission)
                }
                onChange={(e) =>
                  setFormCommission(
                    e.currentTarget.value
                      ? Number(e.currentTarget.value)
                      : undefined
                  )
                }
              />
            </Grid.Col>
          </Grid>

          <div className="flex justify-end gap-2 mt-6">
            <Button variant="default" onClick={() => setDrawerOpened(false)}>
              Cancel
            </Button>
            <Button type="submit">Save</Button>
          </div>
        </form>
      </Drawer>
    </div>
  );
};

export default FeeManagement;
