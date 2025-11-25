import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button, Loader, Modal, TextInput } from "@mantine/core";
import { IconPrinter } from "@tabler/icons-react";
import apis from "../../../APis/Api";
import type { LabItem, Medicine, VitalItem } from "../../../APis/Types";
import { useDoctorAuthStore } from "../../../GlobalStore/doctorStore";
import MedicineSection from "./Components/MedicineSection";
import VitalsSection from "./Components/VitalsSection";
import InvestigationSection from "./Components/InvestigationSection";
import LivePreview from "./Components/LivePreview";
import MedicineModal from "./Components/MedicineModal";
import VitalsModal from "./Components/VitalsModal";
import InvestigationModal from "./Components/InvestigationModal";

type MedicineWithDetails = Medicine & {
  duration?: string;
  dosage?: string;
  instruction?: string;
};

export default function EprescriptionPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const appointment = (location.state as { appointment?: any })?.appointment;
  const doctor = useDoctorAuthStore((s) => s.doctor);

  // Form fields
  const [symptoms, setSymptoms] = useState(appointment?.symptoms || "");
  const [condition, setCondition] = useState("");
  const [notes, setNotes] = useState("");

  // Medicine state
  const [isMedicineModalOpen, setIsMedicineModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Medicine[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [selectedFromSearch, setSelectedFromSearch] = useState<string[]>([]);
  const [expandedSearchItem, setExpandedSearchItem] = useState<string | null>(
    null
  );
  const [searchItemDetails, setSearchItemDetails] = useState<
    Record<
      string,
      {
        duration: string;
        dosage: string;
        instruction: string;
        saltQuantity: string;
      }
    >
  >({});
  const [medicines, setMedicines] = useState<MedicineWithDetails[]>([]);

  // Investigation state
  const [isInvestigationModalOpen, setIsInvestigationModalOpen] =
    useState(false);
  const [investigationsList, setInvestigationsList] = useState<LabItem[]>([]);
  const [selectedInvestigations, setSelectedInvestigations] = useState<
    string[]
  >([]);
  const [investigationsLoading, setInvestigationsLoading] = useState(false);

  // Additional Info state
  const [showAdditionalInfoInput, setShowAdditionalInfoInput] = useState(false);
  const [additionalInfoText, setAdditionalInfoText] = useState("");
  const timerRef = useRef<number | null>(null);

  // Loading and PDF state
  const [isGenerating, setIsGenerating] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);

  // Vitals state
  const [isVitalsModalOpen, setIsVitalsModalOpen] = useState(false);
  const [vitalsList, setVitalsList] = useState<VitalItem[]>([]);
  const [vitalsLoading, setVitalsLoading] = useState(false);
  const [vitalsValues, setVitalsValues] = useState<Record<string, string>>({});

  // Vitals functions
  const fetchVitals = async () => {
    setVitalsLoading(true);
    try {
      const resp = await apis.GetVitals();
      if (resp?.success && resp.data?.vital) {
        setVitalsList(resp.data.vital);
      }
    } catch (err) {
      console.error("GetVitals failed:", err);
    } finally {
      setVitalsLoading(false);
    }
  };

  const handleOpenVitalsModal = () => {
    setIsVitalsModalOpen(true);
    if (vitalsList.length === 0) fetchVitals();
  };

  const updateVitalValue = (key: string, value: string) => {
    setVitalsValues((prev) => ({ ...prev, [key]: value }));
  };

  const getVitalStatus = (
    vital: VitalItem,
    value: string
  ): "normal" | "high" | "low" | null => {
    if (!value || value.trim() === "") return null;
    const numValue = parseFloat(value);
    if (isNaN(numValue)) return null;
    const lower = parseFloat(vital.lower_limit);
    const higher = parseFloat(vital.higher_limit);
    if (numValue > higher) return "high";
    if (numValue < lower) return "low";
    return "normal";
  };

  const confirmVitals = () => setIsVitalsModalOpen(false);

  // Investigation functions
  const fetchInvestigations = async () => {
    setInvestigationsLoading(true);
    try {
      const resp = await apis.GetInvestigationsList();
      if (resp?.success && Array.isArray(resp.data)) {
        setInvestigationsList(resp.data);
      }
    } catch (err) {
      console.error("GetInvestigationsList failed:", err);
    } finally {
      setInvestigationsLoading(false);
    }
  };

  const handleOpenInvestigationModal = () => {
    setIsInvestigationModalOpen(true);
    if (investigationsList.length === 0) fetchInvestigations();
  };

  const toggleSelectInvestigation = (uid: string) => {
    setSelectedInvestigations((prev) =>
      prev.includes(uid) ? prev.filter((id) => id !== uid) : [...prev, uid]
    );
  };

  const confirmInvestigations = () => setIsInvestigationModalOpen(false);

  // Medicine search effect
  useEffect(() => {
    if (timerRef.current) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    if (!searchQuery || searchQuery.trim().length === 0) {
      setSearchResults([]);
      setSearchLoading(false);
      return;
    }

    setSearchLoading(true);
    timerRef.current = window.setTimeout(async () => {
      try {
        const resp = await apis.GetMedicineList(searchQuery.trim());
        if (resp?.success && Array.isArray(resp.data)) {
          setSearchResults(resp.data);
        } else {
          setSearchResults([]);
        }
      } catch (err) {
        console.error("GetMedicineList failed:", err);
        setSearchResults([]);
      } finally {
        setSearchLoading(false);
      }
    }, 1500);

    return () => {
      if (timerRef.current) {
        window.clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [searchQuery]);

  const toggleSelectFromSearch = (name: string) => {
    setSelectedFromSearch((prev) => {
      if (prev.includes(name)) {
        setExpandedSearchItem(null);
        return prev.filter((n) => n !== name);
      }
      setExpandedSearchItem(name);
      return [...prev, name];
    });
  };

  const updateSearchItemDetail = (
    medicineName: string,
    key: string,
    value: string
  ) => {
    setSearchItemDetails((prev) => ({
      ...prev,
      [medicineName]: { ...prev[medicineName], [key]: value },
    }));
  };

  const confirmAddMedicines = () => {
    const toAdd = searchResults.filter((m) =>
      selectedFromSearch.includes(m.name)
    );
    setMedicines((prev) => [
      ...prev,
      ...toAdd.map((m) => ({
        ...m,
        saltQuantity:
          searchItemDetails[m.name]?.saltQuantity || m.saltQuantity || "",
        duration: searchItemDetails[m.name]?.duration || "",
        dosage: searchItemDetails[m.name]?.dosage || "",
        instruction: searchItemDetails[m.name]?.instruction || "",
      })),
    ]);
    setIsMedicineModalOpen(false);
    setSearchQuery("");
    setSearchResults([]);
    setSelectedFromSearch([]);
    setExpandedSearchItem(null);
    setSearchItemDetails({});
  };

  const removeMedicine = (index: number) => {
    setMedicines((prev) => prev.filter((_, i) => i !== index));
  };

  const updateMedicineForm = (index: number, key: string, value: string) => {
    setMedicines((prev) =>
      prev.map((m, i) =>
        i === index
          ? {
              ...m,
              duration: key === "duration" ? value : m.duration,
              dosage: key === "dosage" ? value : m.dosage,
              instruction: key === "instruction" ? value : m.instruction,
              saltQuantity: key === "saltQuantity" ? value : m.saltQuantity,
            }
          : m
      )
    );
  };

  const handleGeneratePrescription = async () => {
    const vitalsPayload: Record<string, string> = {};
    vitalsList.forEach((v) => {
      const value = vitalsValues[v.key];
      if (value && value.trim()) {
        vitalsPayload[v.key] = `${value} ${v.unit}`;
      }
    });

    const payload = {
      doctor_id: doctor?.doctor_id || "",
      patient_id: appointment?.patient_id || "",
      info: additionalInfoText,
      notes: notes,
      symptoms: symptoms,
      condition: condition,
      lab_test_id: selectedInvestigations,
      medicine: medicines.map((m) => ({
        medicineName: m.name,
        saltQuantity: m.saltQuantity || "",
        medicinetype: m.type || "",
        duration: m.duration || "",
        dosage: m.dosage || "",
        instruction: m.instruction || "",
      })),
      vitals: vitalsPayload,
      appointment_id: appointment?.uid || "",
      clinic_id: doctor?.center_id || "",
    };

    try {
      setIsGenerating(true);
      const response = await apis.CreatePrescription(payload);
      if (response.success) {
        setPdfUrl(response.data?.pdf_url || "");
        setIsPdfModalOpen(true);
        setSymptoms(appointment?.symptoms || "");
        setCondition("");
        setNotes("");
        setMedicines([]);
        setSelectedInvestigations([]);
        setAdditionalInfoText("");
        setShowAdditionalInfoInput(false);
        setVitalsValues({});
        console.log("Prescription created successfully:", response);
      } else {
        console.error("Failed to create prescription:", response.message);
      }
    } catch (error) {
      console.error("Error creating prescription:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePrintPdf = () => {
    if (pdfUrl) {
      const printWindow = window.open(pdfUrl, "_blank");
      if (printWindow) {
        printWindow.addEventListener("load", () => {
          printWindow.print();
        });
      }
    }
  };

  return (
    <>
      <div className="grid md:grid-cols-3 grid-cols-1 gap-4 mb-6 h-[calc(100vh_-_190px)] overflow-auto">
        <div className="col-span-2 flex flex-col gap-4">
          <div className="bg-white p-4 rounded-lg border border-[#EDEBEB] flex flex-col gap-3">
            <div>
              <div className="text-black text-sm font-medium mb-1">
                Chief Complaints / Symptoms
              </div>
              <TextInput
                size="md"
                placeholder="e.g., Fever, Headache for 3 days"
                className="w-full"
                value={symptoms}
                onChange={(e) => setSymptoms(e.currentTarget.value)}
              />
            </div>
            <div>
              <div className="text-black text-sm font-medium mb-1">
                Diagnosis / Condition
              </div>
              <TextInput
                size="md"
                placeholder="e.g., Viral Fever"
                className="w-full"
                value={condition}
                onChange={(e) => setCondition(e.currentTarget.value)}
              />
            </div>
          </div>

          <MedicineSection
            medicines={medicines}
            onAddClick={() => setIsMedicineModalOpen(true)}
            onRemoveMedicine={removeMedicine}
            onUpdateMedicine={updateMedicineForm}
          />

          <VitalsSection
            vitalsValues={vitalsValues}
            vitalsList={vitalsList}
            onAddClick={handleOpenVitalsModal}
            getVitalStatus={getVitalStatus}
          />

          <InvestigationSection
            selectedInvestigations={selectedInvestigations}
            investigationsList={investigationsList}
            onAddClick={handleOpenInvestigationModal}
            onRemoveInvestigation={toggleSelectInvestigation}
            showAdditionalInfoInput={showAdditionalInfoInput}
            additionalInfoText={additionalInfoText}
            notes={notes}
            onToggleAdditionalInfo={() => setShowAdditionalInfoInput((s) => !s)}
            onAdditionalInfoChange={setAdditionalInfoText}
            onNotesChange={setNotes}
          />
        </div>

        <LivePreview
          appointment={appointment}
          symptoms={symptoms}
          condition={condition}
          additionalInfoText={additionalInfoText}
          medicines={medicines}
          vitalsValues={vitalsValues}
          vitalsList={vitalsList}
          selectedInvestigations={selectedInvestigations}
          investigationsList={investigationsList}
          notes={notes}
          getVitalStatus={getVitalStatus}
        />
      </div>

      <MedicineModal
        opened={isMedicineModalOpen}
        onClose={() => {
          setIsMedicineModalOpen(false);
          setSearchQuery("");
          setSearchResults([]);
          setSelectedFromSearch([]);
        }}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchResults={searchResults}
        searchLoading={searchLoading}
        selectedFromSearch={selectedFromSearch}
        expandedSearchItem={expandedSearchItem}
        searchItemDetails={searchItemDetails}
        onToggleSelect={toggleSelectFromSearch}
        onUpdateDetail={updateSearchItemDetail}
        onClear={() => {
          setSearchQuery("");
          setSearchResults([]);
          setSelectedFromSearch([]);
        }}
        onConfirm={confirmAddMedicines}
      />

      <InvestigationModal
        opened={isInvestigationModalOpen}
        onClose={() => setIsInvestigationModalOpen(false)}
        investigationsLoading={investigationsLoading}
        investigationsList={investigationsList}
        selectedInvestigations={selectedInvestigations}
        onToggleSelect={toggleSelectInvestigation}
        onConfirm={confirmInvestigations}
      />

      <VitalsModal
        opened={isVitalsModalOpen}
        onClose={() => setIsVitalsModalOpen(false)}
        vitalsLoading={vitalsLoading}
        vitalsList={vitalsList}
        vitalsValues={vitalsValues}
        onUpdateValue={updateVitalValue}
        getVitalStatus={getVitalStatus}
        onConfirm={confirmVitals}
      />

      <div className="flex justify-end items-center gap-3 bg-white p-3 rounded-lg border border-[#EDEBEB]">
        <div className="flex items-center gap-1">
          <span>{doctor?.name}</span>
        </div>
        <div>
          <Button variant="default" className="font-normal" size="md">
            Save Draft
          </Button>
        </div>
        <div>
          <Button
            className="!bg-[#0D52AF] !text-white font-normal"
            size="md"
            onClick={handleGeneratePrescription}
            disabled={isGenerating}
          >
            {isGenerating ? "Generating..." : "Generate Prescription"}
          </Button>
        </div>
      </div>

      {isGenerating && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="flex flex-col items-center gap-4">
            <Loader size={60} color="white" />
            <p className="text-white text-lg font-medium">
              Generating Prescription...
            </p>
          </div>
        </div>
      )}

      <Modal
        opened={isPdfModalOpen}
        onClose={() => {
          setIsPdfModalOpen(false);
          navigate("/doctor-appointments", { replace: true });
        }}
        centered
        size="md"
        overlayProps={{ blur: 2 }}
        title="Prescription Generated Successfully"
      >
        <div className="flex flex-col gap-4">
          <div className="text-gray-700">
            Your prescription has been generated successfully. You can now view
            and print it.
          </div>
          <div className="flex gap-3">
            <Button
              variant="default"
              onClick={() => {
                setIsPdfModalOpen(false);
                navigate("/doctor-appointments", { replace: true });
              }}
              fullWidth
            >
              Close
            </Button>
            <Button
              className="!bg-[#0D52AF] !text-white"
              onClick={handlePrintPdf}
              fullWidth
              leftSection={<IconPrinter size={16} />}
            >
              Print PDF
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
