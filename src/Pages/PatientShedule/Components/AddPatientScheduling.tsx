import React, { useState } from "react";
import { Select, TextInput, Button, NumberInput } from "@mantine/core";
import { DateInput } from "@mantine/dates";
import apis from "../../../APis/Api";
import useAuthStore from "../../../GlobalStore/store";
import useDropdownStore from "../../../GlobalStore/useDropdownStore";
import { notifications } from "@mantine/notifications";
import type { CreatePatientPayload } from "../../../APis/Types";

interface Props {
  onClose: () => void;
  onPatientAdded?: () => void | Promise<void>;
}

const AddPatientScheduling: React.FC<Props> = ({ onClose, onPatientAdded }) => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [dob, setDob] = useState<Date | null>(null);
  const [gender, setGender] = useState<string | null>(null);
  const [age, setAge] = useState<number | null>(null);
  const [dobMode, setDobMode] = useState<"dob" | "age">("dob");
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

  const calculateAgeFromDOB = (d: Date) => {
    const now = new Date();
    let ageCalc = now.getFullYear() - d.getFullYear();
    const m = now.getMonth() - d.getMonth();
    if (m < 0 || (m === 0 && now.getDate() < d.getDate())) {
      ageCalc--;
    }
    return ageCalc;
  };

  const calculateDOBFromAge = (a: number) => {
    const now = new Date();
    return new Date(now.getFullYear() - a, now.getMonth(), now.getDate());
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

    // Ensure the chosen DOB/Age mode has a value
    if (dobMode === "dob" && !dob) {
      notifications.show({
        title: "Validation Error",
        message: "Please select DOB or switch to Age mode",
        color: "red",
      });
      return;
    }

    if (dobMode === "age" && (age === null || age === undefined)) {
      notifications.show({
        title: "Validation Error",
        message: "Please enter Age or switch to DOB mode",
        color: "red",
      });
      return;
    }

    // Build base payload (we will add either dob or age depending on mode)
    const payload: Record<string, unknown> = {
      name: firstName || "",
      last_name: lastName || "",
      email: email || "",
      mobile: phone || "",
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

    // Add either DOB (and age_on_date) OR age to the payload — not both
    if (dobMode === "dob" && dob) {
      payload.dob = dob.toISOString().slice(0, 10);
      // payload.age_on_date = dob.toISOString().slice(0, 10);
    } else if (dobMode === "age" && age !== null && age !== undefined) {
      payload.age = age;
    }
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
        // Call the onPatientAdded callback to refetch patients
        if (onPatientAdded) {
          await onPatientAdded();
        }
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
          <div className="col-span-2 flex items-center my-6 gap-3 w-full">
            {/* Modern Pills Toggle */}
            <div className="flex  bg-gray-100 rounded-full p-1 shadow-sm">
              <button
                onClick={() => setDobMode("dob")}
                className={`px-3 py-1 text-sm rounded-full transition ${
                  dobMode === "dob"
                    ? "bg-blue-600 text-white shadow"
                    : "text-gray-600 hover:bg-gray-200"
                }`}
              >
                DOB
              </button>

              <button
                onClick={() => setDobMode("age")}
                className={`px-3 py-1 text-sm rounded-full transition ${
                  dobMode === "age"
                    ? "bg-blue-600 text-white shadow"
                    : "text-gray-600 hover:bg-gray-200"
                }`}
              >
                Age
              </button>
            </div>

            {/* DOB Input */}
            <DateInput
              placeholder={dobMode === "dob" ? "DOB" : "Auto"}
              value={dob ? dob.toISOString().split("T")[0] : null}
              onChange={(value) => {
                const next = value ? new Date(value) : null;
                setDob(next);
                if (next) setAge(calculateAgeFromDOB(next));
                else setAge(null);
              }}
              classNames={{
                input: "h-9 text-sm",
              }}
              minDate={new Date(1990, 0, 1)}
              style={{ width: 260 }}
              disabled={dobMode === "age"}
            />

            {/* Age Input */}
            <NumberInput
              placeholder={dobMode === "age" ? "Age" : "Auto"}
              value={age ?? undefined}
              onChange={(val: any) => {
                const next =
                  val === "" || val === undefined ? null : Number(val);
                setAge(next);
                if (next !== null && next !== undefined)
                  setDob(calculateDOBFromAge(next));
                else setDob(null);
              }}
              classNames={{
                input: "h-9 text-sm",
              }}
              style={{ width: 120 }}
              min={0}
              disabled={dobMode === "dob"}
            />
            <Select
              placeholder="Select Gender"
              data={genders}
              value={gender}
              onChange={(val) => setGender(val)}
            />
          </div>
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
