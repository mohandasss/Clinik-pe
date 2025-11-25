import { Avatar, Divider, List } from "@mantine/core";
import { IconArrowDown, IconArrowUp, IconPrinter } from "@tabler/icons-react";
import type {
  DoctorAppointment,
  LabItem,
  Medicine,
  VitalItem,
} from "../../../../APis/Types";

type MedicineWithDetails = Medicine & {
  duration?: string;
  dosage?: string;
  instruction?: string;
};

interface LivePreviewProps {
  appointment?: DoctorAppointment;
  symptoms: string;
  condition: string;
  additionalInfoText: string;
  medicines: MedicineWithDetails[];
  vitalsValues: Record<string, string>;
  vitalsList: VitalItem[];
  selectedInvestigations: string[];
  investigationsList: LabItem[];
  notes: string;
  getVitalStatus: (
    vital: VitalItem,
    value: string
  ) => "normal" | "high" | "low" | null;
}

export default function LivePreview({
  appointment,
  symptoms,
  condition,
  additionalInfoText,
  medicines,
  vitalsValues,
  vitalsList,
  selectedInvestigations,
  investigationsList,
  notes,
  getVitalStatus,
}: LivePreviewProps) {
  return (
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
        <div className="text-black font-sm font-medium">Vitals</div>
        {Object.keys(vitalsValues).filter((k) => vitalsValues[k]).length > 0 ? (
          <div className="flex flex-col gap-1 mt-1">
            {vitalsList
              .filter((v) => vitalsValues[v.key])
              .map((v) => {
                const status = getVitalStatus(v, vitalsValues[v.key]);
                return (
                  <small
                    key={v.key}
                    className="flex items-center gap-1 text-[#787777]"
                  >
                    {v.name}: {vitalsValues[v.key]} {v.unit}
                    {status === "high" && (
                      <IconArrowUp size={12} className="text-red-500" />
                    )}
                    {status === "low" && (
                      <IconArrowDown size={12} className="text-blue-500" />
                    )}
                  </small>
                );
              })}
          </div>
        ) : (
          <small className="block text-[#787777]">No vitals added</small>
        )}
      </div>
      <Divider my="md" />
      <div>
        <div className="text-black font-sm font-medium">Investigations</div>
        {selectedInvestigations.length > 0 ? (
          <div className="flex flex-col gap-1 mt-1">
            {investigationsList
              .filter((inv) => selectedInvestigations.includes(inv.uid))
              .map((inv) => (
                <small key={inv.uid} className="text-[#787777]">
                  • {inv.name}
                </small>
              ))}
          </div>
        ) : (
          <small className="block text-[#787777]">
            No investigations added
          </small>
        )}
      </div>
      <Divider my="md" />
      <div>
        <div className="text-black font-sm font-medium">Advice</div>
        <small className="block text-[#787777]">
          {notes || "No advice added"}
        </small>
      </div>
    </div>
  );
}
