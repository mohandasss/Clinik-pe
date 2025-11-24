import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Button,
  Divider,
  List,
  Textarea,
  TextInput,
  Modal,
  Checkbox,
  ScrollArea,
  Stack,
  Loader,
  Select,
} from "@mantine/core";
import { IconPlus, IconPrinter, IconSearch, IconX } from "@tabler/icons-react";
import { Avatar } from "@mantine/core";
import apis from "../../../APis/Api";
import type { Medicine, DoctorAppointment } from "../../../APis/Types";
import { useDoctorAuthStore } from "../../../GlobalStore/doctorStore";

type MedicineWithDetails = Medicine & {
  duration?: string;
  dosage?: string;
  instruction?: string;
};

export default function EprescriptionPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const appointment = (location.state as { appointment?: DoctorAppointment })
    ?.appointment;
  const doctor = useDoctorAuthStore((s) => s.doctor);

  // Form fields
  const [symptoms, setSymptoms] = useState(appointment?.symptoms || "");
  const [condition, setCondition] = useState("");
  const [notes, setNotes] = useState("");

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

  // Medicine detail form state
  const [expandedMedicine, setExpandedMedicine] = useState<number | null>(null);

  // Investigation modal state
  const [isInvestigationModalOpen, setIsInvestigationModalOpen] =
    useState(false);
  const [labTestIds, setLabTestIds] = useState<string[]>([]);

  // Additional Info state
  const [showAdditionalInfoInput, setShowAdditionalInfoInput] = useState(false);
  const [additionalInfoText, setAdditionalInfoText] = useState("");
  const timerRef = useRef<number | null>(null);

  // Loading and PDF state
  const [isGenerating, setIsGenerating] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);

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
      [medicineName]: {
        ...prev[medicineName],
        [key]: value,
      },
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
    // reset modal state
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

  const toggleExpandMedicine = (index: number) => {
    setExpandedMedicine(expandedMedicine === index ? null : index);
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
    const payload = {
      doctor_id: doctor?.doctor_id || "",
      patient_id: appointment?.patient_id || "",
      info: additionalInfoText,
      notes: notes,
      symptoms: symptoms,
      condition: condition,
      lab_test_id: ["XRAY005", "XRAY008", "XRAY007"],
      medicine: medicines.map((m) => ({
        medicineName: m.name,
        saltQuantity: m.saltQuantity || "",
        medicinetype: m.type || "",
        duration: m.duration || "",
        dosage: m.dosage || "",
        instruction: m.instruction || "",
      })),
      vitals: {
        weight: "70 kg",
        height: "175 cm",
        temperature: "98.6 °F",
        systolic: "115 mmHg",
        diastolic: "75 mmHg",
        pulse_rate: "82 bpm",
        heart_rate: "80 bpm",
        spo2: "97 %",
      },
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
        setLabTestIds([]);
        setAdditionalInfoText("");
        setShowAdditionalInfoInput(false);
        // navigate("/doctor-appointments",);
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

  // now render
  return (
    <>
      <div className="grid md:grid-cols-3 grid-cols-1 gap-4 mb-6 h-[calc(100vh_-_190px)] overflow-auto">
        <div className="col-span-2 flex flex-col gap-4">
          {/* <div className="bg-white p-4 rounded-lg border border-[#EDEBEB]">
                        <div className="text-black text-sm font-medium mb-1">Search Patient</div>
                        <div className="flex gap-2">
                            <Autocomplete
                                size="md"
                                placeholder="Search by name, mobile, patient ID"
                                leftSection={<IconSearch size={16} />}
                                className="w-full"
                                data={['React', 'Angular', 'Vue', 'Svelte']}
                            />
                            <div>
                                <Button size="md" className="!bg-[#E2EBFF] !text-[#2563EB] !p-3">
                                    <IconPlus size={20} />
                                </Button>
                            </div>
                        </div>
                    </div> */}
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
          <div className="bg-white p-4 rounded-lg border border-[#EDEBEB] flex flex-col gap-3">
            <div className="mb-1 flex justify-between items-center">
              <div className="font-medium text-lg text-black">Medicines</div>
              <Button
                size="md"
                leftSection={<IconPlus size={14} />}
                className="!bg-[#E2EBFF] !text-[#2563EB] !p-3 !font-normal"
                onClick={() => setIsMedicineModalOpen(true)}
              >
                Add Medicine
              </Button>
            </div>
            <div className="flex flex-col gap-3">
              {medicines.length === 0 ? (
                <div className="rounded-lg p-4 bg-[#F9F9F9] border border-[#EEEEEE]">
                  No medicines added
                </div>
              ) : (
                medicines.map((med, index) => (
                  <div
                    key={index}
                    className="rounded-lg border border-[#EEEEEE] bg-[#F9F9F9]"
                  >
                    <div
                      className="p-4 flex items-center justify-between cursor-pointer hover:bg-[#F0F0F0]"
                      onClick={() => toggleExpandMedicine(index)}
                    >
                      <div className="flex-1">
                        <div className="text-black font-sm font-medium">
                          {med.name}
                        </div>
                        <small className="block text-[#787777]">
                          {med.saltQuantity ?? med.type ?? ""}
                        </small>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            removeMedicine(index);
                          }}
                          aria-label={`Remove ${med.name}`}
                        >
                          <IconX size={18} />
                        </button>
                      </div>
                    </div>

                    {/* Expanded Form */}
                    {expandedMedicine === index && (
                      <div className="border-t border-[#EDEBEB] p-4 bg-white rounded-b-lg flex flex-col gap-3">
                        <div>
                          <label className="text-sm font-medium text-black">
                            Salt Quantity
                          </label>
                          <TextInput
                            placeholder="e.g., 500mg"
                            value={med.saltQuantity || ""}
                            onChange={(e) =>
                              updateMedicineForm(
                                index,
                                "saltQuantity",
                                e.currentTarget.value
                              )
                            }
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium text-black">
                            Duration
                          </label>
                          <TextInput
                            placeholder="e.g., 3 days"
                            value={med.duration || ""}
                            onChange={(e) =>
                              updateMedicineForm(
                                index,
                                "duration",
                                e.currentTarget.value
                              )
                            }
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium text-black">
                            Dosage
                          </label>
                          <TextInput
                            placeholder="e.g., OD (Once Daily), 1-0-1"
                            value={med.dosage || ""}
                            onChange={(e) =>
                              updateMedicineForm(
                                index,
                                "dosage",
                                e.currentTarget.value
                              )
                            }
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium text-black">
                            Instruction
                          </label>
                          <Select
                            placeholder="Select instruction"
                            data={[
                              "After food",
                              "Before food",
                              "Before bedtime",
                              "As needed",
                            ]}
                            value={med.instruction || null}
                            onChange={(val) =>
                              updateMedicineForm(
                                index,
                                "instruction",
                                val || ""
                              )
                            }
                            className="mt-1"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg border border-[#EDEBEB] flex flex-col">
            <div className="flex items-center justify-between">
              <div className="text-black font-sm font-medium">
                Investigation / Lab
              </div>
              <div>
                <Button
                  size="md"
                  leftSection={<IconPlus size={14} />}
                  className="!bg-[#E2EBFF] !text-[#2563EB] !p-3 !font-normal"
                  onClick={() => setIsInvestigationModalOpen(true)}
                >
                  Add
                </Button>
              </div>
            </div>
            <Divider my="md" />
            <div className="flex items-center justify-between">
              <div className="text-black font-sm font-medium">
                Additional Info
              </div>
              <div>
                <Button
                  size="md"
                  leftSection={<IconPlus size={14} />}
                  className="!bg-[#E2EBFF] !text-[#2563EB] !p-3 !font-normal"
                  onClick={() => setShowAdditionalInfoInput((s) => !s)}
                >
                  {showAdditionalInfoInput ? "Close" : "Add"}
                </Button>
              </div>
            </div>
            <Divider my="md" />
            {showAdditionalInfoInput && (
              <div className="mb-3">
                <TextInput
                  value={additionalInfoText}
                  onChange={(e) => setAdditionalInfoText(e.currentTarget.value)}
                  placeholder="Additional info"
                  className="w-full"
                />
              </div>
            )}
            <div>
              <div className="text-black text-sm font-medium mb-1">
                Advice / Notes
              </div>
              <Textarea
                minRows={4}
                autosize
                className="w-full"
                placeholder="e.g., Drink plenty of fluids, Take complete rest..."
                value={notes}
                onChange={(e) => setNotes(e.currentTarget.value)}
              />
            </div>
          </div>
        </div>
        <div className="bg-white px-3 py-4 rounded-lg border border-[#EDEBEB]">
          <div className="flex items-center justify-between">
            <div className="font-medium text-lg text-black">Live Preview</div>
            <div>
              <IconPrinter className="cursor-pointer" size={18} />
            </div>
          </div>
          <Divider my="md" />
          <div className="flex items-center gap-4">
            <Avatar src={appointment?.patient_image} size={60} alt="patient" />
            <div>
              <div className="text-black font-sm font-medium">
                {appointment?.patient_name || "Patient Name"}
              </div>
              <small className="block text-[#787777]">
                PID: {appointment?.patient_id || "N/A"}
              </small>
            </div>
          </div>
          <Divider my="md" />
          <div>
            <div className="text-black font-sm font-medium">Symptoms</div>
            <small className="block text-[#787777]">
              {symptoms || "No symptoms entered"}
            </small>
          </div>
          <Divider my="md" />
          <div>
            <div className="text-black font-sm font-medium">Diagnosis</div>
            <small className="block text-[#787777]">
              {condition || "No diagnosis entered"}
            </small>
          </div>
          <Divider my="md" />
          {additionalInfoText && (
            <div className="mb-2">
              <div className="text-sm text-[#74777E]">Additional Info</div>
              <div className="text-[#74777E]">{additionalInfoText}</div>
            </div>
          )}
          <div>
            <div className="text-black font-sm font-medium">Medicines</div>
            <List className="list-disc">
              {medicines.length === 0 ? (
                <List.Item>
                  <small className="block text-[#787777] ">
                    No medicines added
                  </small>
                </List.Item>
              ) : (
                medicines.map((m) => (
                  <List.Item key={m.name}>
                    <small className="block text-[#787777] ">
                      {m.name} {m.saltQuantity ? ` - ${m.saltQuantity}` : ""}
                      {m.dosage && ` | ${m.dosage}`}
                      {m.duration && ` | ${m.duration}`}
                    </small>
                  </List.Item>
                ))
              )}
            </List>
          </div>
          <Divider my="md" />
          <div>
            <div className="text-black font-sm font-medium">Advice</div>
            <small className="block text-[#787777]">
              {notes || "No advice added"}
            </small>
          </div>
        </div>
      </div>
      <Modal
        opened={isMedicineModalOpen}
        onClose={() => {
          setIsMedicineModalOpen(false);
          setSearchQuery("");
          setSearchResults([]);
          setSelectedFromSearch([]);
        }}
        centered
        size="lg"
        overlayProps={{ blur: 2 }}
        closeOnEscape
        closeOnClickOutside
        title="Add Medicine"
      >
        <div className="relative">
          {searchLoading && (
            <div className="absolute inset-0 z-50 flex items-center justify-center bg-white/60">
              <Loader size="lg" />
            </div>
          )}
          <div className="mb-3 flex items-center gap-2">
            <TextInput
              placeholder="Search for medicines"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.currentTarget.value)}
              leftSection={<IconSearch size={16} />}
              className="flex-1"
            />
            <Button
              variant="default"
              onClick={() => {
                setSearchQuery("");
                setSearchResults([]);
                setSelectedFromSearch([]);
              }}
            >
              Clear
            </Button>
          </div>
          {/* Loader overlay shown above when searchLoading is true */}

          <ScrollArea style={{ height: 400 }}>
            <Stack>
              {searchResults.length === 0 && !searchLoading ? (
                <div className="text-gray-500">No medicines found</div>
              ) : (
                searchResults.map((m) => (
                  <div
                    key={m.name}
                    className="border border-[#EDEBEB] rounded-lg overflow-hidden"
                  >
                    <div className="flex items-center justify-between p-3 bg-[#F9F9F9]">
                      <div>
                        <div className="font-medium">{m.name}</div>
                        <small className="text-gray-500">
                          {m.saltQuantity ?? ""} — {m.type ?? ""}
                        </small>
                      </div>
                      <Checkbox
                        checked={selectedFromSearch.includes(m.name)}
                        onChange={() => toggleSelectFromSearch(m.name)}
                      />
                    </div>

                    {/* Expanded Details */}
                    {expandedSearchItem === m.name &&
                      selectedFromSearch.includes(m.name) && (
                        <div className="p-3 bg-white border-t border-[#EDEBEB] flex  gap-3">
                          <div>
                            <label className="text-sm font-medium text-black">
                              Salt Quantity
                            </label>
                            <TextInput
                              placeholder={m.saltQuantity || "e.g., 500mg"}
                              value={
                                searchItemDetails[m.name]?.saltQuantity || ""
                              }
                              onChange={(e) =>
                                updateSearchItemDetail(
                                  m.name,
                                  "saltQuantity",
                                  e.currentTarget.value
                                )
                              }
                              className="mt-1"
                              size="sm"
                            />
                          </div>
                          <div>
                            <label className="text-sm font-medium text-black">
                              Duration
                            </label>
                            <TextInput
                              placeholder="e.g., 3 days"
                              value={searchItemDetails[m.name]?.duration || ""}
                              onChange={(e) =>
                                updateSearchItemDetail(
                                  m.name,
                                  "duration",
                                  e.currentTarget.value
                                )
                              }
                              className="mt-1"
                              size="sm"
                            />
                          </div>
                          <div>
                            <label className="text-sm font-medium text-black">
                              Dosage
                            </label>
                            <TextInput
                              placeholder="e.g., OD, 1-0-1"
                              value={searchItemDetails[m.name]?.dosage || ""}
                              onChange={(e) =>
                                updateSearchItemDetail(
                                  m.name,
                                  "dosage",
                                  e.currentTarget.value
                                )
                              }
                              className="mt-1"
                              size="sm"
                            />
                          </div>
                          <div>
                            <label className="text-sm font-medium text-black">
                              Instruction
                            </label>
                            <Select
                              placeholder="Select instruction"
                              data={[
                                "After food",
                                "Before food",
                                "Before bedtime",
                                "As needed",
                              ]}
                              value={
                                searchItemDetails[m.name]?.instruction || null
                              }
                              onChange={(val) =>
                                updateSearchItemDetail(
                                  m.name,
                                  "instruction",
                                  val || ""
                                )
                              }
                              className="mt-1"
                              size="sm"
                            />
                          </div>
                        </div>
                      )}
                  </div>
                ))
              )}
            </Stack>
          </ScrollArea>
          <div className="flex justify-end gap-2 mt-3">
            <Button
              variant="default"
              onClick={() => {
                setIsMedicineModalOpen(false);
                setSearchQuery("");
                setSearchResults([]);
                setSelectedFromSearch([]);
                setExpandedSearchItem(null);
                setSearchItemDetails({});
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={confirmAddMedicines}
              disabled={selectedFromSearch.length === 0}
            >
              Add Selected
            </Button>
          </div>
        </div>
      </Modal>

      {/* Investigation modal (minimal placeholder) */}
      <Modal
        opened={isInvestigationModalOpen}
        onClose={() => setIsInvestigationModalOpen(false)}
        centered
        size="lg"
        overlayProps={{ blur: 2 }}
        title="Add Investigation / Lab"
      >
        <div className="mb-3">
          <TextInput placeholder="Search investigations (coming soon)" />
        </div>
        <div className="text-gray-600">
          Investigation modal content will be added later.
        </div>
        <div className="flex justify-end gap-2 mt-3">
          <Button
            variant="default"
            onClick={() => setIsInvestigationModalOpen(false)}
          >
            Close
          </Button>
        </div>
      </Modal>

      <div className="flex justify-end items-center gap-3 bg-white p-3 rounded-lg border border-[#EDEBEB]">
        <div className="flex items-center gap-1">
          <i>
            <svg
              width="13"
              height="14"
              viewBox="0 0 13 14"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <g clipPath="url(#clip0_278_9157)">
                <path
                  d="M0 2.1875C0 1.46289 0.587891 0.875 1.3125 0.875H3.9375C4.66211 0.875 5.25 1.46289 5.25 2.1875V4.8125C5.25 5.53711 4.66211 6.125 3.9375 6.125H1.3125C0.587891 6.125 0 5.53711 0 4.8125V2.1875ZM1.75 2.625V4.375H3.5V2.625H1.75ZM0 9.1875C0 8.46289 0.587891 7.875 1.3125 7.875H3.9375C4.66211 7.875 5.25 8.46289 5.25 9.1875V11.8125C5.25 12.5371 4.66211 13.125 3.9375 13.125H1.3125C0.587891 13.125 0 12.5371 0 11.8125V9.1875ZM1.75 9.625V11.375H3.5V9.625H1.75ZM8.3125 0.875H10.9375C11.6621 0.875 12.25 1.46289 12.25 2.1875V4.8125C12.25 5.53711 11.6621 6.125 10.9375 6.125H8.3125C7.58789 6.125 7 5.53711 7 4.8125V2.1875C7 1.46289 7.58789 0.875 8.3125 0.875ZM10.5 2.625H8.75V4.375H10.5V2.625ZM7 8.3125C7 8.07188 7.19688 7.875 7.4375 7.875H9.1875C9.42813 7.875 9.625 8.07188 9.625 8.3125C9.625 8.55312 9.82187 8.75 10.0625 8.75H10.9375C11.1781 8.75 11.375 8.55312 11.375 8.3125C11.375 8.07188 11.5719 7.875 11.8125 7.875C12.0531 7.875 12.25 8.07188 12.25 8.3125V10.9375C12.25 11.1781 12.0531 11.375 11.8125 11.375H10.0625C9.82187 11.375 9.625 11.1781 9.625 10.9375C9.625 10.6969 9.42813 10.5 9.1875 10.5C8.94687 10.5 8.75 10.6969 8.75 10.9375V12.6875C8.75 12.9281 8.55313 13.125 8.3125 13.125H7.4375C7.19688 13.125 7 12.9281 7 12.6875V8.3125ZM10.0625 13.125C9.94647 13.125 9.83519 13.0789 9.75314 12.9969C9.67109 12.9148 9.625 12.8035 9.625 12.6875C9.625 12.5715 9.67109 12.4602 9.75314 12.3781C9.83519 12.2961 9.94647 12.25 10.0625 12.25C10.1785 12.25 10.2898 12.2961 10.3719 12.3781C10.4539 12.4602 10.5 12.5715 10.5 12.6875C10.5 12.8035 10.4539 12.9148 10.3719 12.9969C10.2898 13.0789 10.1785 13.125 10.0625 13.125ZM11.8125 13.125C11.6965 13.125 11.5852 13.0789 11.5031 12.9969C11.4211 12.9148 11.375 12.8035 11.375 12.6875C11.375 12.5715 11.4211 12.4602 11.5031 12.3781C11.5852 12.2961 11.6965 12.25 11.8125 12.25C11.9285 12.25 12.0398 12.2961 12.1219 12.3781C12.2039 12.4602 12.25 12.5715 12.25 12.6875C12.25 12.8035 12.2039 12.9148 12.1219 12.9969C12.0398 13.0789 11.9285 13.125 11.8125 13.125Z"
                  fill="#4B5563"
                />
              </g>
              <defs>
                <clipPath id="clip0_278_9157">
                  <path d="M0 0H12.25V14H0V0Z" fill="white" />
                </clipPath>
              </defs>
            </svg>
          </i>
          <i>
            <svg
              width="18"
              height="14"
              viewBox="0 0 18 14"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <g clipPath="url(#clip0_278_9160)">
                <path
                  d="M5.25 3.5C5.25 3.01602 5.64102 2.625 6.125 2.625C6.60898 2.625 7 3.01602 7 3.5V3.71328C7 4.4707 6.93437 5.22539 6.80586 5.96914L4.49805 6.66094C3.38789 6.99453 2.62773 8.01719 2.62773 9.17656V11.1426C2.62773 12.2363 3.51641 13.125 4.61016 13.125C5.32109 13.125 5.97734 12.7449 6.33008 12.127L6.71016 11.4625C7.44297 10.1773 7.98164 8.79102 8.30703 7.34727L10.8883 6.57344L10.5465 7.59883C10.4563 7.8668 10.5027 8.15938 10.6668 8.38633C10.8309 8.61328 11.0961 8.75 11.3777 8.75H14.875C15.359 8.75 15.75 8.35898 15.75 7.875C15.75 7.39102 15.359 7 14.875 7H12.5891L13.0813 5.52617C13.1852 5.21719 13.1059 4.87539 12.8789 4.64023C12.652 4.40508 12.3129 4.31758 11.9984 4.41055L8.65156 5.4168C8.71719 4.85078 8.75 4.28477 8.75 3.71328V3.5C8.75 2.05078 7.57422 0.875 6.125 0.875C4.67578 0.875 3.5 2.05078 3.5 3.5V4.375C3.5 4.85898 3.89102 5.25 4.375 5.25C4.85898 5.25 5.25 4.85898 5.25 4.375V3.5ZM4.99844 8.33984L6.33828 7.93789C6.05391 8.86211 5.66836 9.75352 5.18711 10.5957L4.80703 11.2602C4.76602 11.3312 4.68945 11.3777 4.60469 11.3777C4.47617 11.3777 4.37227 11.2738 4.37227 11.1453V9.17656C4.37227 8.79102 4.62656 8.44922 4.9957 8.33711L4.99844 8.33984ZM0.65625 10.0625C0.292578 10.0625 0 10.3551 0 10.7188C0 11.0824 0.292578 11.375 0.65625 11.375H1.7582C1.75273 11.2984 1.75 11.2219 1.75 11.1426V10.0625H0.65625ZM16.8438 11.375C17.2074 11.375 17.5 11.0824 17.5 10.7188C17.5 10.3551 17.2074 10.0625 16.8438 10.0625H8.36445C8.18125 10.5082 7.97617 10.9457 7.75469 11.375H16.8438Z"
                  fill="#4B5563"
                />
              </g>
              <defs>
                <clipPath id="clip0_278_9160">
                  <path d="M0 0H17.5V14H0V0Z" fill="white" />
                </clipPath>
              </defs>
            </svg>
          </i>
          <span>Dr. Ananya Patel</span>
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

      {/* Loading Overlay */}
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

      {/* PDF Success Modal */}
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
