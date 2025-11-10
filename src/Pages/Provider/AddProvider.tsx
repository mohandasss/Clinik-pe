import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Paper, Button, Text, Anchor } from "@mantine/core";
import { IconArrowLeft } from "@tabler/icons-react";
import Notification from "../../components/GlobalNotification/Notification";
import ImageUpload from "../../components/ImageUpload/ImageUpload";
import ProviderBasicInfo from "./Components/ProviderBasicInfo";
import ProviderContactInfo from "./Components/ProviderContactInfo";
import SpecialityExperienceSection from "./Components/SpecialityExperienceSection";
import DegreesUniversitySection from "./Components/DegreesUniversitySection";
import AddSpecialityModal from "./Components/AddSpecialityModal";
import apis from "../../APis/Api";
import type {
  ExperienceItem,
  QualificationItem,
  SpecialityItem,
} from "../../APis/Types";

const AddProvider = () => {
  const navigate = useNavigate();

  // Lookup options from APIs
  const [experienceOptions, setExperienceOptions] = useState<ExperienceItem[]>(
    []
  );
  const [qualificationOptions, setQualificationOptions] = useState<
    QualificationItem[]
  >([]);
  const [specialityOptions, setSpecialityOptions] = useState<string[]>([]);

  // Fetch lookup data on mount
  useEffect(() => {
    const fetchLookups = async () => {
      try {
        const [expResp, qualResp, specResp] = await Promise.all([
          apis.GetExperience(),
          apis.GetQualification(),
          apis.GetSpecialities(),
        ]);

        console.log("Experience API Response:", expResp.data);
        console.log("Qualification API Response:", qualResp.data);
        console.log("Speciality API Response:", specResp.data);

        setExperienceOptions(expResp.data);
        setQualificationOptions(qualResp.data);
        setSpecialityOptions(specResp.data.map((s: SpecialityItem) => s.name));
      } catch (error) {
        console.error("Error fetching lookups:", error);
      }
    };

    fetchLookups();
  }, []);

  // Form state
  const [providerPhoto, setProviderPhoto] = useState<File | null>(null);
  const [form, setForm] = useState({
    fullName: "",
    licenseNumber: "",
    medicalCenter: "",
    emailAddress: "",
    phoneNumber: "",
    status: "Active",
  });

  const [errors, setErrors] = useState({
    fullName: "",
    phoneNumber: "",
    emailAddress: "",
    medicalCenter: "",
  });

  // Groups state
  const [specialityGroups, setSpecialityGroups] = useState<
    Array<{ speciality: string; experience: string }>
  >([{ speciality: "", experience: "" }]);

  const [degreeGroups, setDegreeGroups] = useState<
    Array<{ degrees: string; universityInstitute: string }>
  >([{ degrees: "", universityInstitute: "" }]);

  // Modal state
  const [newSpeciality, setNewSpeciality] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Notification state
  const [notif, setNotif] = useState<{
    open: boolean;
    data: { success: boolean; message: string };
  }>({
    open: false,
    data: { success: true, message: "" },
  });

  // Handlers
  const handleChange = (key: string, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (errors[key as keyof typeof errors]) {
      setErrors((prev) => ({ ...prev, [key]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {
      fullName: "",
      phoneNumber: "",
      emailAddress: "",
      medicalCenter: "",
    };

    let isValid = true;

    // Full Name validation
    if (!form.fullName.trim()) {
      newErrors.fullName = "Full name is required";
      isValid = false;
    }

    // Medical Center validation
    if (!form.medicalCenter.trim()) {
      newErrors.medicalCenter = "Medical center is required";
      isValid = false;
    }

    // Phone Number validation
    if (!form.phoneNumber.trim()) {
      newErrors.phoneNumber = "Phone number is required";
      isValid = false;
    } else if (!/^\d{10}$/.test(form.phoneNumber)) {
      newErrors.phoneNumber = "Phone number must be 10 digits";
      isValid = false;
    }

    // Email validation
    if (!form.emailAddress.trim()) {
      newErrors.emailAddress = "Email address is required";
      isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.emailAddress)) {
      newErrors.emailAddress = "Invalid email format";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleAddSpeciality = () => {
    const trimmedSpeciality = newSpeciality.trim();
    if (trimmedSpeciality && !specialityOptions.includes(trimmedSpeciality)) {
      setSpecialityOptions([...specialityOptions, trimmedSpeciality]);
      setNewSpeciality("");
      setIsModalOpen(false);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setNewSpeciality("");
  };

  const buildPayload = () => {
    return {
      full_name: form.fullName.trim(),
      license_number: form.licenseNumber.trim(),
      medical_center: form.medicalCenter.trim(),
      email_address: form.emailAddress.trim(),
      phone_number: `+91${form.phoneNumber.trim()}`,
      status: form.status,
      specialities: specialityGroups.map((group) => ({
        speciality: group.speciality.trim(),
        experience: group.experience.trim(),
      })),
      degrees: degreeGroups.map((group) => ({
        degree: group.degrees.trim(),
        university: group.universityInstitute.trim(),
      })),
      profile_image: providerPhoto ? providerPhoto.name : "",
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      console.log("Validation failed");
      return;
    }

    try {
      const payload = buildPayload();
      // TODO: Replace with actual API call
      // const response = await apis.AddProvider(payload);
      console.log("Provider payload:", payload);

      setNotif({
        open: true,
        data: { success: true, message: "Provider added successfully" },
      });

      setTimeout(() => {
        setNotif((s) => ({ ...s, open: false }));
        navigate("/providers");
      }, 1500);
    } catch (err) {
      setNotif({
        open: true,
        data: {
          success: false,
          message: err instanceof Error ? err.message : "Error adding provider",
        },
      });
    }
  };

  return (
    <div className="p-0">
      <Notification
        open={notif.open}
        data={notif.data}
        onClose={() => setNotif((s) => ({ ...s, open: false }))}
      />

      {/* Back Button */}
      <div className="mb-4">
        <Anchor
          component="button"
          onClick={() => navigate("/providers")}
          className="flex items-center gap-2 px-3 py-1 hover:no-underline rounded-md text-blue-600 text-sm transition-colors duration-150 hover:bg-blue-50 no-underline"
        >
          <IconArrowLeft size={16} />
          <Text size="sm" fw={600} className="font-medium">
            Back to Providers
          </Text>
        </Anchor>
      </div>

      {/* Header */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900">
          Add New Provider
        </h2>
        <p className="text-sm text-gray-600">
          Enter provider information to create a new record.
        </p>
      </div>

      {/* Form Card */}
      <Paper withBorder radius="md" className="p-6">
        <form onSubmit={handleSubmit}>
          {/* Image Upload */}
          <ImageUpload
            photo={providerPhoto}
            onPhotoChange={setProviderPhoto}
            title="Provider Photo"
            description="Upload a professional photo"
            subtitle="JPG, PNG up to 5MB"
          />

          {/* Divider */}
          <div className="h-px bg-gray-200 mb-6"></div>

          {/* Basic Info */}
          <ProviderBasicInfo
            fullName={form.fullName}
            licenseNumber={form.licenseNumber}
            errors={{ fullName: errors.fullName }}
            onChange={handleChange}
          />

          {/* Contact Info */}
          <ProviderContactInfo
            medicalCenter={form.medicalCenter}
            emailAddress={form.emailAddress}
            phoneNumber={form.phoneNumber}
            status={form.status}
            errors={{
              medicalCenter: errors.medicalCenter,
              emailAddress: errors.emailAddress,
              phoneNumber: errors.phoneNumber,
            }}
            onChange={handleChange}
          />

          {/* Speciality & Experience | Degrees & University */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <SpecialityExperienceSection
              specialityGroups={specialityGroups}
              specialityOptions={specialityOptions}
              experienceOptions={experienceOptions}
              onUpdate={setSpecialityGroups}
              onAddSpeciality={() => setIsModalOpen(true)}
            />

            <DegreesUniversitySection
              degreeGroups={degreeGroups}
              qualificationOptions={qualificationOptions}
              onUpdate={setDegreeGroups}
            />
          </div>

          {/* Submit Button */}
          <div className="flex justify-start">
            <Button
              type="submit"
              variant="filled"
              color="blue"
              className="px-6 py-2 rounded-md"
            >
              Add Provider
            </Button>
          </div>
        </form>
      </Paper>

      {/* Add Speciality Modal */}
      <AddSpecialityModal
        isOpen={isModalOpen}
        newSpeciality={newSpeciality}
        onClose={handleCloseModal}
        onChange={setNewSpeciality}
        onAdd={handleAddSpeciality}
      />
    </div>
  );
};

export default AddProvider;
