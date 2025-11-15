import React, { useState } from "react";
import { Select, TextInput, Button, NumberInput } from "@mantine/core";
import CustomDatePicker from "./CustomDatePicker";
import apis from "../../../APis/Api";
import useAuthStore from "../../../GlobalStore/store";
import useDropdownStore from "../../../GlobalStore/useDropdownStore";
import { notifications } from "@mantine/notifications";
import type { CreatePatientPayload } from "../../../APis/Types";

interface Props {
  onClose: () => void;
}

const AddPatientScheduling: React.FC<Props> = ({ onClose }) => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [dob, setDob] = useState<Date | null>(null);
  const [gender, setGender] = useState<string | null>(null);
  const [age, setAge] = useState<number | null>(null);
  // description removed (not part of patient payload)
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState<string>("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  // switches kept commented in original; will add when needed

  const genders = [
    { value: "male", label: "Male" },
    { value: "female", label: "Female" },
    { value: "other", label: "Other" },
  ];

  const handlePhoneChange = (value: string) => {
    const numericValue = value.replace(/\D/g, "");
    if (numericValue.length <= 10) {
      setPhone(numericValue);
    }
  };

  const { organizationDetails } = useAuthStore();
  const selectedCenter = useDropdownStore((s) => s.selectedCenter);
  const [loading, setLoading] = useState(false);

  const validateForm = () => {
    if (!firstName.trim()) {
      notifications.show({
        title: "Validation Error",
        message: "First name is required",
        color: "red",
      });
      return false;
    }
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      notifications.show({
        title: "Validation Error",
        message: "Email format is invalid",
        color: "red",
      });
      return false;
    }
    if (phone && !/^\d+$/.test(phone)) {
      notifications.show({
        title: "Validation Error",
        message: "Phone number must contain only digits",
        color: "red",
      });
      return false;
    }
    if (age !== null && age !== undefined && age < 0) {
      notifications.show({
        title: "Validation Error",
        message: "Age must be a non-negative number",
        color: "red",
      });
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    // Build a complete payload with empty strings for fields not present
    const payload: Record<string, unknown> = {
      name: firstName || "",
      last_name: lastName || "",
      dob: dob ? dob.toISOString().slice(0, 10) : "",
      email: email || "",
      mobile: phone || "",
      age: age !== null && age !== undefined ? age : 0,
      age_on_date: dob ? dob.toISOString().slice(0, 10) : "",
      address: {
        address: address || "",
        lat: "",
        lng: "",
        postalCode: "",
        line_1: "",
        line_2: "",
        country: "",
        state_or_province: state || "",
        district: "",
        city: city || "",
        village: "",
        town: "",
        land_mark: "",
        instruction: "",
      },
      gender: gender || "",
    };
    // remove stray invalid call; below we perform the API call with IDs from store
    // Grab org and center IDs from store
    const orgId = organizationDetails?.organization_id;
    const centerId =
      selectedCenter?.center_id || organizationDetails?.center_id;
    if (!orgId || !centerId) {
      notifications.show({
        title: "Error",
        message:
          "Missing organization or center information. Please ensure you've selected a clinic.",
        color: "red",
      });
      return;
    }
    setLoading(true);
    try {
      const response = await apis.AddPatient(
        orgId,
        centerId,
        payload as unknown as CreatePatientPayload
      );
      if (response?.success) {
        notifications.show({
          title: "Patient Added",
          message: response.message,
          color: "teal",
        });
        onClose();
      } else {
        notifications.show({
          title: "Failed",
          message: response?.message,
          color: "red",
        });
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : JSON.stringify(err);
      notifications.show({
        title: "Error",
        message: message || "Failed to add patient",
        color: "red",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-4 pt-4">
      <div>
        <h3 className="text-sm font-semibold mb-3">Basic Info</h3>
        <div className="grid md:grid-cols-2 grid-cols-1 gap-3">
          <TextInput
            label="First Name"
            placeholder="Enter first name"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
          />
          <TextInput
            label="Last Name"
            placeholder="Enter last name"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
          />
          <div>
            <CustomDatePicker
              value={dob}
              onChange={(date) => setDob(date)}
              label="DOB"
              minDate={new Date(1900, 0, 1)}
            />
          </div>
          <Select
            label="Gender"
            placeholder="Select Gender"
            data={genders}
            value={gender}
            onChange={(val) => setGender(val)}
          />
        </div>
      </div>

      {/* Removed Referred By - not part of payload */}

      <div>
        <h3 className="text-sm font-semibold mb-3">Contact Information</h3>
        <div className="grid md:grid-cols-2 grid-cols-1 gap-3">
          <div className="col-span-2">
            <TextInput
              label="Address"
              placeholder="Enter address.."
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
          </div>
          <TextInput
            label="City"
            placeholder="Enter city name"
            value={city}
            onChange={(e) => setCity(e.target.value)}
          />
          <TextInput
            label="State"
            placeholder="Enter state/province"
            value={state}
            onChange={(e) => setState(e.target.value)}
          />
          <TextInput
            label="Phone Number"
            placeholder="Enter phone number"
            value={phone}
            onChange={(e) => handlePhoneChange(e.target.value)}
            maxLength={10}
          />
          <TextInput
            label="Email"
            placeholder="Enter email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <NumberInput
            label="Age"
            placeholder="Enter age"
            value={age ?? undefined}
            onChange={(val: string | number) =>
              setAge(val === "" || val === undefined ? null : Number(val))
            }
          />
        </div>
      </div>

      <div className="flex gap-4 mt-2">
        <Button variant="outline" onClick={onClose} size="sm">
          Cancel
        </Button>
        <Button onClick={handleSave} size="sm" loading={loading}>
          Add Patient
        </Button>
      </div>
    </div>
  );
};

export default AddPatientScheduling;
