import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Paper, Button, Text, Anchor } from "@mantine/core";
import { IconArrowLeft } from "@tabler/icons-react";
import Notification from "../../components/Global/Notification";
import ImageUpload from "../../components/ImageUpload/ImageUpload";
import ProviderBasicInfo from "./Components/ProviderBasicInfo";
import ProviderContactInfo from "./Components/ProviderContactInfo";
import SpecialityExperienceSection from "./Components/SpecialityExperienceSection";
import DegreesUniversitySection from "./Components/DegreesUniversitySection";
import AddSpecialityModal from "./Components/AddSpecialityModal";
import apis from "../../APis/Api";
import useAuthStore from "../../GlobalStore/store";
import useDropdownStore from "../../GlobalStore/useDropdownStore";
import type {
  ExperienceItem,
  QualificationItem,
  SpecialityItem,
} from "../../APis/Types";

const AddProvider = () => {
  const navigate = useNavigate();

  // Get auth store data
  const organizationDetails = useAuthStore(
    (state) => state.organizationDetails
  );

  // Get selected center from dropdown store
  const selectedCenter = useDropdownStore((state) => state.selectedCenter);

  // Lookup options from APIs
  const [experienceOptions, setExperienceOptions] = useState<ExperienceItem[]>(
    []
  );
  const [qualificationOptions, setQualificationOptions] = useState<
    QualificationItem[]
  >([]);
  const [specialityOptions, setSpecialityOptions] = useState<
    Array<{ uid: string; name: string }>
  >([]);

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
        // keep uid + name so we can send correct ids in payload
        setSpecialityOptions(specResp.data as SpecialityItem[]);
      } catch (error) {
        console.error("Error fetching lookups:", error);
      }
    };

    fetchLookups();
  }, []);

  // Form state
  const [providerPhoto, setProviderPhoto] = useState<File | null>(null);
  const [uploadPath, setUploadPath] = useState<string>("");
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

  // Groups state with tracking for IDs
  const [specialityGroups, setSpecialityGroups] = useState<
    Array<{
      speciality: string;
      specialityId: string | null;
      experience: string;
      experienceId: string | null;
    }>
  >([
    { speciality: "", specialityId: null, experience: "", experienceId: null },
  ]);

  const [degreeGroups, setDegreeGroups] = useState<
    Array<{
      degrees: string;
      degreesId: string | null;
      universityInstitute: string;
      instituteId: string | null;
    }>
  >([
    {
      degrees: "",
      degreesId: null,
      universityInstitute: "",
      instituteId: null,
    },
  ]);

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
    // if (!form.medicalCenter.trim()) {
    //   newErrors.medicalCenter = "Medical center is required";
    //   isValid = false;
    // }

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
    if (
      trimmedSpeciality &&
      !specialityOptions.some((s) => s.name === trimmedSpeciality)
    ) {
      // Add as a temporary item with empty uid; backend can resolve or create if needed
      setSpecialityOptions([
        ...specialityOptions,
        { uid: "", name: trimmedSpeciality },
      ]);
      setNewSpeciality("");
      setIsModalOpen(false);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setNewSpeciality("");
  };

  const buildPayload = () => {
    // Build doctorSpecialty array
    const doctorSpecialty = specialityGroups
      .filter((group) => group.speciality.trim())
      .map((group) => ({
        name: group.speciality.trim(),
        speciality_id: group.specialityId ?? "",
      }));

    // Build doctorQualification array
    const doctorQualification = degreeGroups
      .filter((group) => group.degrees.trim())
      .map((group) => ({
        name: group.degrees.trim(),
        qualification_id: group.degreesId ?? "",
        institute_id: group.instituteId ?? "",
        institute_name: group.universityInstitute.trim(),
      }));

    // Build doctorExperiences array - grouped by speciality
    const doctorExperiences = specialityGroups
      .filter((group) => group.experience.trim() && group.speciality.trim())
      .map((group) => ({
        speciality_id: group.specialityId ?? "",
        years_of_experience: group.experience.trim(),
      }));

    // Build doctorLicenses array - if license number is provided
    const doctorLicenses = specialityGroups
      .filter((group) => group.speciality.trim() && form.licenseNumber.trim())
      .map((group) => ({
        speciality_id: group.specialityId ?? "",
        license_number: form.licenseNumber.trim(),
      }));

    const payload = {
      name: form.fullName.trim(),
      contact_email: form.emailAddress.trim(),
      contact_mobile: form.phoneNumber.trim(),
      image_path: uploadPath,
      time_zone: organizationDetails?.time_zone || "Asia/Kolkata",
      center_id: selectedCenter?.center_id || "",
      doctorSpecialty,
      doctorQualification,
      doctorExperiences,
      doctorLicenses,
    };

    return payload;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      console.log("Validation failed");
      return;
    }

    try {
      const payload = buildPayload();
      console.log("Provider payload:", payload);

      const orgId = organizationDetails?.organization_id;
      if (!orgId) {
        setNotif({
          open: true,
          data: {
            success: false,
            message: "Organization ID not found. Please login again.",
          },
        });
        return;
      }
      // @ts-expect-error: allow payload
      const response = await apis.AddProvider(
        orgId,
        organizationDetails?.center_id ,
        payload
      );
      console.log("Add Provider API Response:", response);

      if (response && response.success) {
        setNotif({
          open: true,
          data: {
            success: true,
            message: response.message || "Provider added successfully",
          },
        });
        setTimeout(() => {
          setNotif((s) => ({ ...s, open: false }));
          navigate(-1);
        }, 1500);
      } else {
        setNotif({
          open: true,
          data: {
            success: false,
            message: response?.message || "Failed to add provider",
          },
        });
      }
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
            onUploadPathChange={setUploadPath}
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
