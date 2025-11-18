import React, { useState } from "react";
import {
  TextInput,
  Select,
  Radio,
  Checkbox,
  Button,
  Collapse,
} from "@mantine/core";
import { IconSearch, IconCircle } from "@tabler/icons-react";

interface PatientDetails {
  mobileNumber: string;
  title: string;
  firstName: string;
  lastName: string;
  sex: "male" | "female" | "other" | "";
  ageYears: string;
  ageMonths: string;
  ageDays: string;
  onlineReportRequested: boolean;
  email: string;
  address: string;
  aadhaar: string;
  patientHistory: string;
}

interface PatientDetailsSectionProps {
  data: PatientDetails;
  onChange: (data: Partial<PatientDetails>) => void;
}

const PatientDetailsSection: React.FC<PatientDetailsSectionProps> = ({
  data,
  onChange,
}) => {
  const [showEmail, setShowEmail] = useState(false);
  const [showAddress, setShowAddress] = useState(false);
  const [showAadhaar, setShowAadhaar] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  const titleOptions = [
    { value: "mr", label: "Mr." },
    { value: "mrs", label: "Mrs." },
    { value: "ms", label: "Ms." },
    { value: "dr", label: "Dr." },
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 ring-1 ring-gray-100">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">
          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-blue-600 text-white text-sm mr-2">
            1
          </span>
          Patient details
        </h3>
      </div>

      <div className="space-y-4">
        {/* Mobile Number */}
        <div>
          <label className="text-xs font-medium text-gray-700 mb-2 block">
            Mobile number
          </label>
          <div className="flex gap-2">
            <TextInput
              value={data.mobileNumber}
              onChange={(e) =>
                onChange({ mobileNumber: e.currentTarget.value })
              }
              placeholder="+91"
              className="flex-1"
            />
            
          </div>
        </div>

        {/* Title, First Name, Last Name */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-xs font-medium text-gray-700 mb-2 flex items-center gap-1">
              Title
              <span className="text-red-500">*</span>
            </label>
            <Select
              data={titleOptions}
              value={data.title}
              onChange={(value) => onChange({ title: value || "" })}
              placeholder="Select"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-gray-700 mb-2 flex items-center gap-1">
              First name
              <span className="text-red-500">*</span>
            </label>
            <TextInput
              value={data.firstName}
              onChange={(e) => onChange({ firstName: e.currentTarget.value })}
              placeholder="Enter first name"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-gray-700 mb-2 block">
              Last name
            </label>
            <TextInput
              value={data.lastName}
              onChange={(e) => onChange({ lastName: e.currentTarget.value })}
              placeholder="Enter last name"
            />
          </div>
        </div>

        {/* Sex */}
        <div>
          <label className="text-xs font-medium text-gray-700 mb-2 flex items-center gap-1">
            <span className="text-red-500">*</span> Sex
          </label>
          <Radio.Group
            value={data.sex}
            onChange={(value) =>
              onChange({ sex: value as "male" | "female" | "other" | "" })
            }
          >
            <div className="flex gap-4">
              <Radio value="male" label="Male" />
              <Radio value="female" label="Female" />
              <Radio value="other" label="Other" />
            </div>
          </Radio.Group>
        </div>

        {/* Age */}
        <div>
          <label className="text-xs font-medium text-gray-700 mb-2 flex items-center gap-1">
            Age
            <span className="text-red-500">*</span>
          </label>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <TextInput
                value={data.ageYears}
                onChange={(e) => onChange({ ageYears: e.currentTarget.value })}
                placeholder="Years"
                type="number"
                min="0"
              />
            </div>
            <div>
              <TextInput
                value={data.ageMonths}
                onChange={(e) => onChange({ ageMonths: e.currentTarget.value })}
                placeholder="Months"
                type="number"
                min="0"
                max="11"
              />
            </div>
            <div>
              <TextInput
                value={data.ageDays}
                onChange={(e) => onChange({ ageDays: e.currentTarget.value })}
                placeholder="Days"
                type="number"
                min="0"
                max="30"
              />
            </div>
          </div>
        </div>

        {/* Online Report Requested */}
        <div>
          <Checkbox
            label="Online report requested"
            checked={data.onlineReportRequested}
            onChange={(e) =>
              onChange({ onlineReportRequested: e.currentTarget.checked })
            }
          />
        </div>

        {/* Expandable Sections */}
        <div className="flex flex-wrap gap-2">
          <Button
            variant="subtle"
            size="xs"
            leftSection={<IconCircle size={12} />}
            onClick={() => setShowEmail(!showEmail)}
          >
            Email
          </Button>
          <Button
            variant="subtle"
            size="xs"
            leftSection={<IconCircle size={12} />}
            onClick={() => setShowAddress(!showAddress)}
          >
            Address
          </Button>
          <Button
            variant="subtle"
            size="xs"
            leftSection={<IconCircle size={12} />}
            onClick={() => setShowAadhaar(!showAadhaar)}
          >
            Aadhaar
          </Button>
          <Button
            variant="subtle"
            size="xs"
            leftSection={<IconCircle size={12} />}
            onClick={() => setShowHistory(!showHistory)}
          >
            Patient history
          </Button>
        </div>

        {/* Email Section */}
        <Collapse in={showEmail}>
          <div className="pt-2">
            <TextInput
              label="Email"
              value={data.email}
              onChange={(e) => onChange({ email: e.currentTarget.value })}
              placeholder="Enter email address"
              type="email"
            />
          </div>
        </Collapse>

        {/* Address Section */}
        <Collapse in={showAddress}>
          <div className="pt-2">
            <TextInput
              label="Address"
              value={data.address}
              onChange={(e) => onChange({ address: e.currentTarget.value })}
              placeholder="Enter full address"
            />
          </div>
        </Collapse>

        {/* Aadhaar Section */}
        <Collapse in={showAadhaar}>
          <div className="pt-2">
            <TextInput
              label="Aadhaar"
              value={data.aadhaar}
              onChange={(e) => onChange({ aadhaar: e.currentTarget.value })}
              placeholder="Enter Aadhaar number"
              maxLength={12}
            />
          </div>
        </Collapse>

        {/* Patient History Section */}
        <Collapse in={showHistory}>
          <div className="pt-2">
            <TextInput
              label="Patient history"
              value={data.patientHistory}
              onChange={(e) =>
                onChange({ patientHistory: e.currentTarget.value })
              }
              placeholder="Enter patient history"
            />
          </div>
        </Collapse>
      </div>
    </div>
  );
};

export default PatientDetailsSection;
