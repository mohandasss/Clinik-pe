import React from "react";
import { Select, Button } from "@mantine/core";
import { IconPlus } from "@tabler/icons-react";
import type { ExperienceItem } from "../../../APis/Types";

interface SpecialityExperienceSectionProps {
  specialityGroups: Array<{ speciality: string; experience: string }>;
  specialityOptions: string[];
  experienceOptions: ExperienceItem[];
  onUpdate: (groups: Array<{ speciality: string; experience: string }>) => void;
  onAddSpeciality: () => void;
}

const SpecialityExperienceSection: React.FC<
  SpecialityExperienceSectionProps
> = ({
  specialityGroups,
  specialityOptions,
  experienceOptions,
  onUpdate,
  onAddSpeciality,
}) => {
  const handleSpecialityChange = (index: number, value: string) => {
    const updated = [...specialityGroups];
    updated[index].speciality = value;
    onUpdate(updated);
  };

  const handleExperienceChange = (index: number, value: string) => {
    const updated = [...specialityGroups];
    updated[index].experience = value;
    onUpdate(updated);
  };

  const handleRemove = (index: number) => {
    onUpdate(specialityGroups.filter((_, i) => i !== index));
  };

  const handleAdd = () => {
    onUpdate([...specialityGroups, { speciality: "", experience: "" }]);
  };

  return (
    <div>
      <h3 className="font-medium text-gray-900 mb-4">
        Speciality & Experience<span className="text-red-500">*</span>
      </h3>
      <div className="space-y-4">
        {specialityGroups.map((group, index) => (
          <div
            key={index}
            className="border border-gray-200 rounded-lg p-4 bg-gray-50"
          >
            <div className="space-y-3">
              {/* Speciality */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Speciality
                  <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <Select
                      placeholder="Select specialty"
                      data={specialityOptions}
                      value={group.speciality}
                      onChange={(val) =>
                        handleSpecialityChange(index, val || "")
                      }
                      classNames={{
                        input:
                          "text-sm px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500",
                      }}
                      searchable
                    />
                  </div>
                  <Button
                    variant="light"
                    color="blue"
                    onClick={onAddSpeciality}
                    title="Add new speciality"
                    className="px-3 py-2 rounded-md"
                  >
                    <IconPlus size={18} />
                  </Button>
                </div>
              </div>

              {/* Experience */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Experience
                  <span className="text-red-500">*</span>
                </label>
                <Select
                  placeholder="Select experience"
                  data={experienceOptions.map((e) => e.name)}
                  value={group.experience}
                  onChange={(val) => handleExperienceChange(index, val || "")}
                  classNames={{
                    input:
                      "text-sm px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500",
                  }}
                  searchable
                />
              </div>
            </div>

            {/* Remove Button */}
            {specialityGroups.length > 1 && (
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
          Add Another Speciality
        </Button>
      </div>
    </div>
  );
};

export default SpecialityExperienceSection;
