import React, { useState } from "react";
import { Button, Select, TextInput, Textarea, Collapse } from "@mantine/core";
import AddNewModal from "./AddNewModal";
import PaymentDetailsSection from "./PaymentDetailsSection";
import type { PaymentDetails } from "./PaymentDetailsSection";
import { IconPlus } from "@tabler/icons-react";

interface InvestigationType {
  id: string;
  name: string;
  icon: string;
}

interface PerInvestigationData {
  investigations: string;
  paid: string;
  discount: string;
  sampleCollectedAt: string;
  total?: number;
}

interface CaseDetails {
  referredBy: string;
  collectionCentre: string;
  sampleCollectionAgent: string;
  selectedInvestigations: string[];
  perInvestigationData: Record<string, PerInvestigationData>;
  payment: PaymentDetails;
}

interface CaseDetailsSectionProps {
  data: CaseDetails;
  onChange: (data: Partial<CaseDetails>) => void;
}

const investigationTypes: InvestigationType[] = [
  { id: "lab", name: "LAB", icon: "🔬" },
  { id: "usg", name: "USG", icon: "📡" },
  { id: "digital-xray", name: "DIGITAL XRAY", icon: "📷" },
  { id: "xray", name: "XRAY", icon: "☢️" },
  { id: "outsource-lab", name: "OUTSOURCE LAB", icon: "🏢" },
  { id: "ecg", name: "ECG", icon: "❤️" },
  { id: "ct-scan", name: "CT SCAN", icon: "🖥️" },
  { id: "mri", name: "MRI", icon: "🧲" },
  { id: "eps", name: "EPS", icon: "⚡" },
  { id: "opg", name: "OPG", icon: "🦷" },
  { id: "cardiology", name: "CARDIOLOGY", icon: "💓" },
  { id: "eeg", name: "EEG", icon: "🧠" },
  { id: "mammography", name: "MAMMOGRAPHY", icon: "🩺" },
];

const CaseDetailsSection: React.FC<CaseDetailsSectionProps> = ({
  data,
  onChange,
}) => {
  const [referrerOptions, setReferrerOptions] = useState<
    { value: string; label: string }[]
  >([]);
  const [collectionAgentOptions, setCollectionAgentOptions] = useState<
    { value: string; label: string }[]
  >([]);
  const handleInvestigationClick = (typeId: string) => {
    const exists = data.selectedInvestigations.includes(typeId);
    if (exists) {
      // Remove selection
      const newSel = data.selectedInvestigations.filter((s) => s !== typeId);
      const newPer = { ...data.perInvestigationData };
      delete newPer[typeId];
      onChange({
        selectedInvestigations: newSel,
        perInvestigationData: newPer,
      });
    } else {
      // Add selection and ensure per-investigation entry
      const newSel = [...data.selectedInvestigations, typeId];
      const newPer = { ...data.perInvestigationData };
      if (!newPer[typeId]) {
        newPer[typeId] = {
          investigations: "",
          paid: "0",
          discount: "0",
          sampleCollectedAt: "",
          total: 0,
        };
      }
      onChange({
        selectedInvestigations: newSel,
        perInvestigationData: newPer,
      });
    }
  };

  const [addNewModalOpen, setAddNewModalOpen] = useState(false);
  const [addNewModalContext, setAddNewModalContext] = useState<
    "referredBy" | "collectionAgent" | "ratelist" | null
  >(null);

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 ring-1 ring-gray-100">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">
          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-blue-600 text-white text-sm mr-2">
            2
          </span>
          Case details
        </h3>
      </div>

      <div className="space-y-4">
        {/* Referred By and Collection Centre */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-medium text-gray-700 mb-2 flex items-center gap-1">
              <span className="text-red-500">*</span> Referred By
            </label>
            <div className="flex gap-2">
              <Select
                data={referrerOptions}
                value={data.referredBy}
                onChange={(value) => onChange({ referredBy: value || "" })}
                placeholder="Select referrer"
                searchable
                className="flex-1"
              />
              <Button
                variant="subtle"
                leftSection={<IconPlus size={16} />}
                className="shrink-0"
                onClick={() => {
                  setAddNewModalContext("referredBy");
                  setAddNewModalOpen(true);
                }}
              >
                Add New
              </Button>
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-gray-700 mb-2 flex items-center gap-1">
              <span className="text-red-500">*</span> Collection centre
            </label>
            <Select
              data={[{ value: "main", label: "Main" }]}
              value={data.collectionCentre}
              onChange={(value) => onChange({ collectionCentre: value || "" })}
              placeholder="Select centre"
            />
          </div>
        </div>

        {/* Sample Collection Agent */}
        <div>
          <label className="text-xs font-medium text-gray-700 mb-2 block">
            Sample collection agent
          </label>
          <div className="flex gap-2">
            <Select
              data={collectionAgentOptions}
              value={data.sampleCollectionAgent}
              onChange={(value) =>
                onChange({ sampleCollectionAgent: value || "" })
              }
              placeholder="Select agent"
              searchable
              className="flex-1"
            />
            <Button
              variant="subtle"
              leftSection={<IconPlus size={16} />}
              className="shrink-0"
              onClick={() => {
                setAddNewModalContext("collectionAgent");
                setAddNewModalOpen(true);
              }}
            >
              Add new
            </Button>
            <Button variant="subtle" className="shrink-0">
              Edit
            </Button>
          </div>
        </div>
        <AddNewModal
          open={addNewModalOpen}
          title={
            addNewModalContext === "referredBy"
              ? "Add new referrer entry"
              : addNewModalContext === "collectionAgent"
              ? "Add new collection agent"
              : "Add new entry to lab ratelist"
          }
          items={
            addNewModalContext === "referredBy"
              ? [
                  {
                    id: "referrer",
                    title: "Referrers",
                    description:
                      "Manage and add referring doctors or organizations that refer patients to the clinic.",
                    href: "/settings/referrers",
                  },
                ]
              : addNewModalContext === "collectionAgent"
              ? [
                  {
                    id: "collection-agent",
                    title: "Collection Agents",
                    description:
                      "Manage and add sample collection agents who handle home sample pickups or other duties.",
                    href: "/settings/collection-agents",
                  },
                ]
              : [
                  {
                    id: "packages",
                    title: "Packages",
                    description:
                      "Packages are a group of tests across the categories. Tests within packages cannot be ordered separately.",
                    href: "/ratelist/packages",
                  },
                  {
                    id: "panels",
                    title: "Panels",
                    description:
                      "Panels are groups of tests belonging to the same category. Panels within panels can be ordered separately and panels are printed in report with a separate title.",
                    href: "/ratelist/panels",
                  },
                  {
                    id: "tests",
                    title: "Tests",
                    description:
                      "Tests are individual lab tests which can be reported separately or can appear in a panel or a package.",
                    href: "/ratelist/test-database",
                  },
                ]
          }
          onClose={() => setAddNewModalOpen(false)}
          onAdd={(payload) => {
            // If AddNewModal added a referrer, add to local options and select it
            if (payload && typeof payload === "object") {
              const p = payload as {
                type?: string;
                data?: Record<string, unknown>;
              };
              if (p.type === "referrer" && p.data) {
                const dataObj = p.data;
                const id = `referrer-${Date.now()}`;
                const label = `${(dataObj.title as string) || ""} ${
                  (dataObj.firstName as string) || ""
                } ${(dataObj.lastName as string) || ""}`.trim();
                setReferrerOptions((opts) => [...opts, { value: id, label }]);
                onChange({ referredBy: id });
              } else if (p.type === "collection-agent" && p.data) {
                const dataObj = p.data;
                const id = `collection-agent-${Date.now()}`;
                const label = `${(dataObj.name as string) || ""}`.trim();
                setCollectionAgentOptions((opts) => [
                  ...opts,
                  { value: id, label },
                ]);
                onChange({ sampleCollectionAgent: id });
              }
            }
          }}
        />

        {/* Payment Details (always visible) */}

        {/* Investigation Types */}
        <div>
          <label className="text-xs font-medium text-gray-700 mb-3 block">
            Select Investigation Type
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-7 gap-3">
            {investigationTypes.map((type) => (
              <button
                key={type.id}
                onClick={() => handleInvestigationClick(type.id)}
                className={`flex flex-col items-center justify-center p-4 rounded-lg border-2 transition-all hover:shadow-md ${
                  data.selectedInvestigations.includes(type.id)
                    ? "border-blue-500 bg-blue-50 shadow-sm"
                    : "border-gray-200 hover:border-blue-300"
                }`}
              >
                <span className="text-2xl mb-2">{type.icon}</span>
                <span className="text-xs font-medium text-gray-700 text-center">
                  {type.name}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Investigation Forms - One per selected type */}
        {data.selectedInvestigations.map((typeId) => (
          <InvestigationForm
            key={typeId}
            investigationType={typeId}
            data={data.perInvestigationData[typeId]}
            onChange={(d) => {
              const newPer = {
                ...data.perInvestigationData,
                [typeId]: { ...data.perInvestigationData[typeId], ...d },
              };
              onChange({ perInvestigationData: newPer });
            }}
            onClose={() => {
              const newSel = data.selectedInvestigations.filter(
                (s) => s !== typeId
              );
              const newPer = { ...data.perInvestigationData };
              delete newPer[typeId];
              onChange({
                selectedInvestigations: newSel,
                perInvestigationData: newPer,
              });
            }}
            onOpenAddNewModal={() => {
              setAddNewModalContext("ratelist");
              setAddNewModalOpen(true);
            }}
          />
        ))}
        <div>
          <PaymentDetailsSection
            data={data.payment}
            onChange={(d) => onChange({ payment: { ...data.payment, ...d } })}
          />
        </div>
      </div>
    </div>
  );
};

// Investigation Form Component
interface InvestigationFormProps {
  investigationType: string;
  data: PerInvestigationData;
  onChange: (d: Partial<PerInvestigationData>) => void;
  onClose: () => void;
  onOpenAddNewModal?: () => void;
}

const InvestigationForm: React.FC<InvestigationFormProps> = ({
  investigationType,
  data,
  onChange,
  onClose,
  onOpenAddNewModal,
}) => {
  const formData = data;
  const isSampleCollected = Boolean(formData.sampleCollectedAt);
  const [showSampleInput, setShowSampleInput] = useState(
    Boolean(formData.sampleCollectedAt)
  );

  const formatDate = (iso?: string) => {
    if (!iso) return "";
    try {
      const d = new Date(iso);
      return `${d.toLocaleDateString()} ${d.toLocaleTimeString()}`;
    } catch {
      return iso;
    }
  };

  // removed isoToDateTimeLocal since we use a simple text input for sample collected at

  const getInvestigationTitle = () => {
    const type = investigationTypes.find((t) => t.id === investigationType);
    return type ? `${type.name} Investigations` : "Investigations";
  };

  return (
    <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-sm font-semibold text-gray-800">
          {getInvestigationTitle()}
        </h4>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          ✕
        </button>
      </div>

      <div className="space-y-4">
        {/* Lab Investigations */}
        <div>
          <label className="text-xs font-medium text-gray-700 mb-2 block">
            {getInvestigationTitle()}
          </label>
          <Textarea
            value={formData.investigations}
            onChange={(e) =>
              onChange({ investigations: e.currentTarget.value })
            }
            placeholder="Enter investigations..."
            minRows={3}
          />
          <div className="flex gap-2 mt-2">
            <Button
              size="xs"
              leftSection={<IconPlus size={14} />}
              onClick={() => onOpenAddNewModal && onOpenAddNewModal()}
            >
              Add New
            </Button>
            <Button size="xs" variant="subtle">
              Ratelist
            </Button>
          </div>
          <div className="text-xs text-gray-500 mt-2">
            Total: Rs. 0 , Due: Rs. 0
          </div>
        </div>

        {/* Paid and Discount */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-medium text-gray-700 mb-2 flex items-center gap-1">
              <span className="text-red-500">*</span> Paid
            </label>
            <TextInput
              value={formData.paid}
              onChange={(e) => onChange({ paid: e.currentTarget.value })}
              type="number"
              min="0"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-gray-700 mb-2 flex items-center gap-1">
              <span className="text-red-500">*</span> Discount
            </label>
            <TextInput
              value={formData.discount}
              onChange={(e) => onChange({ discount: e.currentTarget.value })}
              type="number"
              min="0"
            />
          </div>
        </div>

        {/* Sample Collected At */}
        <div>
          <div className="flex items-center gap-2">
            <Button
              variant="subtle"
              size="xs"
              onClick={() => setShowSampleInput((s) => !s)}
              aria-pressed={showSampleInput || isSampleCollected}
              title={
                isSampleCollected
                  ? `Collected: ${formatDate(formData.sampleCollectedAt)}`
                  : "Toggle sample collected input"
              }
            >
              Sample Collected At
            </Button>
            {(isSampleCollected || showSampleInput) && (
              <span className="text-xs text-gray-600"></span>
            )}
          </div>

          <Collapse in={showSampleInput}>
            <div className="pt-2">
              <div className="flex items-center gap-2">
                <TextInput
                  placeholder="Enter Sample Collected At"
                  type="text"
                  value={formData.sampleCollectedAt || ""}
                  onChange={(e) =>
                    onChange({ sampleCollectedAt: e.currentTarget.value })
                  }
                />
                {/* <Button
                  size="xs"
                  variant="subtle"
                  onClick={() =>
                    onChange({
                      sampleCollectedAt: formatDate(new Date().toISOString()),
                    })
                  }
                >
                  Set now
                </Button> */}
                <Button
                  size="xs"
                  variant="subtle"
                  onClick={() => onChange({ sampleCollectedAt: "" })}
                >
                  Clear
                </Button>
              </div>
            </div>
          </Collapse>
        </div>
      </div>
    </div>
  );
};

export default CaseDetailsSection;
