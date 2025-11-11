import React from "react";
import { TextInput, Select, Button } from "@mantine/core";
import { IconPlus } from "@tabler/icons-react";
import type { QualificationItem } from "../../../APis/Types";

interface DegreesUniversitySectionProps {
  degreeGroups: Array<{
    degrees: string;
    degreesId: string | null;
    universityInstitute: string;
    instituteId: string | null;
  }>;
  qualificationOptions: QualificationItem[];
  onUpdate: (
    groups: Array<{
      degrees: string;
      degreesId: string | null;
      universityInstitute: string;
      instituteId: string | null;
    }>
  ) => void;
}

const DegreesUniversitySection: React.FC<DegreesUniversitySectionProps> = ({
  degreeGroups,
  qualificationOptions,
  onUpdate,
}) => {
  const handleDegreeChange = (index: number, value: string) => {
    const updated = [...degreeGroups];
    updated[index].degrees = value;
    onUpdate(updated);
  };

  const handleUniversityChange = (index: number, value: string) => {
    const updated = [...degreeGroups];
    updated[index].universityInstitute = value;
    onUpdate(updated);
  };

  const handleRemove = (index: number) => {
    onUpdate(degreeGroups.filter((_, i) => i !== index));
  };

  const handleAdd = () => {
    onUpdate([
      ...degreeGroups,
      {
        degrees: "",
        degreesId: null,
        universityInstitute: "",
        instituteId: null,
      },
    ]);
  };

  return (
    <div>
      <h3 className="font-medium text-gray-900 mb-4">
        Degrees & University<span className="text-red-500">*</span>
      </h3>
      <div className="space-y-4">
        {degreeGroups.map((group, index) => (
          <div
            key={index}
            className="border border-gray-200 rounded-lg p-4 bg-gray-50"
          >
            <div className="space-y-3">
              {/* Degrees */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Degrees<span className="text-red-500">*</span>
                </label>
                <Select
                  placeholder="Select degree"
                  data={qualificationOptions.map((q) => q.name)}
                  value={group.degrees}
                  onChange={(val) => handleDegreeChange(index, val || "")}
                  classNames={{
                    input:
                      "text-sm px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500",
                  }}
                  searchable
                />
              </div>

              {/* University/Institute */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  University/Institute
                  <span className="text-red-500">*</span>
                </label>
                <TextInput
                  placeholder="Enter university"
                  value={group.universityInstitute}
                  onChange={(e) =>
                    handleUniversityChange(index, e.currentTarget.value)
                  }
                  classNames={{
                    input:
                      "text-sm px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500",
                  }}
                />
              </div>
            </div>

            {/* Remove Button */}
            {degreeGroups.length > 1 && (
              <Button
                variant="subtle"
                color="red"
                size="xs"
                onClick={() => handleRemove(index)}
                className="mt-3"
              >
                Remove
              </Button>
            )}
          </div>
        ))}

        {/* Add Another Button */}
        <Button
          variant="light"
          color="blue"
          onClick={handleAdd}
          className="mt-2 w-full"
        >
          <IconPlus size={18} className="mr-2" />
          Add Another Degree
        </Button>
      </div>
    </div>
  );
};

export default DegreesUniversitySection;
