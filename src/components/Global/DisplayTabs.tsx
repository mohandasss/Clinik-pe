import React, { useState } from "react";
import {
  Paper,
  Chip,
  Checkbox,
  Text,
  TextInput,
  Textarea,
  Select,
  NumberInput,
  RangeSlider,
  FileInput,
  Button,
  Group,
  Stack,
  ActionIcon,
  Card,
  Grid,
  MultiSelect,
  Loader,
} from "@mantine/core";
import { IconUpload, IconX, IconPlus } from "@tabler/icons-react";
import { notifications } from "@mantine/notifications";
import RichEditor from "./RichEditor";
import apis from "../../APis/Api";
import useAuthStore from "../../GlobalStore/store";

interface FAQ {
  question: string;
  answer: string;
}

export interface UploadedImage {
  type: "icon" | "image";
  target_type: string;
  target_id: string;
}

export interface DisplayTabsData {
  organs: string[];
  categories: string[];
  topRated: boolean;
  topSelling: boolean;
  displayName: string;
  shortAbout: string;
  longAbout: string;
  sampleType: string;
  gender: string;
  ageRange: string;
  icon: File | null;
  images: File[];
  uploadedImages: UploadedImage[];
  preparation: string;
  mrp: string;
  faqs: FAQ[];
  homeCollectionPossible: boolean;
  homeCollectionFee: string;
  machineBased: boolean;
}

interface DisplayTabsProps {
  onOrgansChange?: (selected: string[]) => void;
  onCategoriesChange?: (selected: string[]) => void;
  onTopRatingChange?: (checked: boolean) => void;
  onTopSellingChange?: (checked: boolean) => void;
  onDataChange?: (data: DisplayTabsData) => void;
}

const DisplayTabs: React.FC<DisplayTabsProps> = ({
  onOrgansChange,
  onCategoriesChange,
  onTopRatingChange,
  onTopSellingChange,
  onDataChange,
}) => {
  const [selectedOrgans, setSelectedOrgans] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [topRating, setTopRating] = useState(false);
  const [topSelling, setTopSelling] = useState(false);

  // Display fields
  const [displayName, setDisplayName] = useState("");
  const [shortAbout, setShortAbout] = useState("");
  const [longAbout, setLongAbout] = useState("");
  const [sampleType, setSampleType] = useState("");
  const [genderRestriction, setGenderRestriction] = useState("both");
  const [ageRange, setAgeRange] = useState<[number, number]>([0, 100]);
  const [icon, setIcon] = useState<File | null>(null);
  const [images, setImages] = useState<File[]>([]);
  const [preparation, setPreparation] = useState("");
  const [mrp, setMrp] = useState<number | undefined>(undefined);
  const [faqs, setFaqs] = useState<FAQ[]>([{ question: "", answer: "" }]);
  const [homeCollectionPossible, setHomeCollectionPossible] = useState(false);
  const [homeCollectionFee, setHomeCollectionFee] = useState<
    number | undefined
  >(undefined);
  const [machineBased, setMachineBased] = useState(false);

  // Uploaded image IDs from API
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);
  const [uploadingIcon, setUploadingIcon] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);

  const organizationId = useAuthStore(
    (s) => s.organizationDetails?.organization_id ?? ""
  );
  const centerId = useAuthStore((s) => s.organizationDetails?.center_id ?? "");

  const organs = [
    "Heart",
    "Liver",
    "Kidney",
    "Lung",
    "Brain",
    "Stomach",
    "Intestine",
    "Pancreas",
    "Spleen",
    "Bladder",
  ];

  const categories = [
    "Blood Test",
    "Urine Test",
    "Imaging",
    "Biopsy",
    "Hormone Test",
    "Genetic Test",
    "Allergy Test",
    "Culture Test",
  ];

  const handleOrganToggle = (organ: string) => {
    const newSelection = selectedOrgans.includes(organ)
      ? selectedOrgans.filter((o) => o !== organ)
      : [...selectedOrgans, organ];
    setSelectedOrgans(newSelection);
    onOrgansChange?.(newSelection);
  };

  const handleCategoriesChange = (values: string[]) => {
    setSelectedCategories(values);
    onCategoriesChange?.(values);
  };

  const handleTopRatingChange = (checked: boolean) => {
    setTopRating(checked);
    onTopRatingChange?.(checked);
  };

  const handleTopSellingChange = (checked: boolean) => {
    setTopSelling(checked);
    onTopSellingChange?.(checked);
  };

  const addFAQ = () => {
    setFaqs([...faqs, { question: "", answer: "" }]);
  };

  const removeFAQ = (index: number) => {
    setFaqs(faqs.filter((_, i) => i !== index));
  };

  const updateFAQ = (
    index: number,
    field: "question" | "answer",
    value: string
  ) => {
    const newFaqs = [...faqs];
    newFaqs[index][field] = value;
    setFaqs(newFaqs);
  };

  // Upload icon to API
  const handleIconUpload = async (file: File | null) => {
    setIcon(file);
    if (!file) {
      // Remove icon from uploaded images
      setUploadedImages((prev) => prev.filter((img) => img.type !== "icon"));
      return;
    }

    setUploadingIcon(true);
    try {
      const response = await apis.UploadTestImage(
        organizationId,
        centerId,
        file,
        "icon"
      );
      if (response?.success && response?.data?.image_id) {
        // Remove any existing icon and add new one
        setUploadedImages((prev) => [
          ...prev.filter((img) => img.type !== "icon"),
          {
            type: "icon",
            target_type: "test",
            target_id: response.data.image_id,
          },
        ]);
        notifications.show({
          title: "Success",
          message: "Icon uploaded successfully",
          color: "green",
        });
      } else {
        notifications.show({
          title: "Error",
          message: response?.message || "Failed to upload icon",
          color: "red",
        });
        setIcon(null);
      }
    } catch (error) {
      console.error("Icon upload error:", error);
      notifications.show({
        title: "Error",
        message: "Failed to upload icon",
        color: "red",
      });
      setIcon(null);
    } finally {
      setUploadingIcon(false);
    }
  };

  // Upload multiple images to API one by one
  const handleImageUpload = async (files: File[]) => {
    if (!files || files.length === 0) return;

    setUploadingImages(true);
    const newImages = [...images];
    const newUploadedImages = [...uploadedImages];

    for (const file of files) {
      try {
        const response = await apis.UploadTestImage(
          organizationId,
          centerId,
          file,
          "image"
        );
        if (response?.success && response?.data?.image_id) {
          newImages.push(file);
          newUploadedImages.push({
            type: "image",
            target_type: "test",
            target_id: response.data.image_id,
          });
        } else {
          notifications.show({
            title: "Error",
            message: `Failed to upload ${file.name}`,
            color: "red",
          });
        }
      } catch (error) {
        console.error("Image upload error:", error);
        notifications.show({
          title: "Error",
          message: `Failed to upload ${file.name}`,
          color: "red",
        });
      }
    }

    setImages(newImages);
    setUploadedImages(newUploadedImages);
    setUploadingImages(false);

    if (newImages.length > images.length) {
      notifications.show({
        title: "Success",
        message: `${
          newImages.length - images.length
        } image(s) uploaded successfully`,
        color: "green",
      });
    }
  };

  const removeImage = (index: number) => {
    // Find the corresponding uploaded image (skip icon, count only images)
    const imageUploadedIndices = uploadedImages
      .map((img, idx) => (img.type === "image" ? idx : -1))
      .filter((idx) => idx !== -1);

    if (imageUploadedIndices[index] !== undefined) {
      setUploadedImages((prev) =>
        prev.filter((_, idx) => idx !== imageUploadedIndices[index])
      );
    }
    setImages(images.filter((_, i) => i !== index));
  };

  // Collect all data and pass to parent
  const getDisplayData = React.useCallback(
    (): DisplayTabsData => ({
      organs: selectedOrgans.map((o) => o.toLowerCase()),
      categories: selectedCategories,
      topRated: topRating,
      topSelling: topSelling,
      displayName,
      shortAbout,
      longAbout,
      sampleType,
      gender: genderRestriction,
      ageRange: `${ageRange[0]}-${ageRange[1]}`,
      icon,
      images,
      uploadedImages,
      preparation,
      mrp: mrp ? String(mrp) : "",
      faqs,
      homeCollectionPossible,
      homeCollectionFee: homeCollectionFee ? String(homeCollectionFee) : "",
      machineBased,
    }),
    [
      selectedOrgans,
      selectedCategories,
      topRating,
      topSelling,
      displayName,
      shortAbout,
      longAbout,
      sampleType,
      genderRestriction,
      ageRange,
      icon,
      images,
      uploadedImages,
      preparation,
      mrp,
      faqs,
      homeCollectionPossible,
      homeCollectionFee,
      machineBased,
    ]
  );

  // Call onDataChange whenever any field changes
  React.useEffect(() => {
    onDataChange?.(getDisplayData());
  }, [getDisplayData, onDataChange]);

  return (
    <div className="space-y-4">
      {/* Organs Section */}
      <Paper withBorder radius="md" className="p-4">
        <Grid gutter="md">
          <Grid.Col span={{ base: 12, md: 6 }}>
            <TextInput
              label="Display Name"
              placeholder="Enter display name"
              value={displayName}
              onChange={(e) => setDisplayName(e.currentTarget.value)}
              size="sm"
            />
          </Grid.Col>
          <Grid.Col span={{ base: 12, md: 6 }}>
            <NumberInput
              label="MRP (Maximum Retail Price)"
              placeholder="Enter MRP"
              value={mrp}
              onChange={(value) => setMrp(value as number)}
              min={0}
              size="sm"
              leftSection={<Text size="sm">₹</Text>}
            />
          </Grid.Col>
          <Grid.Col span={12}>
            <TextInput
              label="Short About"
              placeholder="Brief description"
              value={shortAbout}
              onChange={(e) => setShortAbout(e.currentTarget.value)}
              size="sm"
            />
          </Grid.Col>
          <Grid.Col span={12}>
            <Text size="sm" fw={500} mb="xs">
              Long About
            </Text>
            <RichEditor value={longAbout} onChange={setLongAbout} />
          </Grid.Col>
        </Grid>
      </Paper>
      <Paper withBorder radius="md" className="p-4">
        <Text size="sm" fw={600} className="mb-3">
          Organs
        </Text>
        <div className="flex flex-wrap gap-2 mb-4">
          {organs.map((organ) => (
            <Chip
              key={organ}
              checked={selectedOrgans.includes(organ)}
              onChange={() => handleOrganToggle(organ)}
              size="sm"
            >
              {organ}
            </Chip>
          ))}
        </div>
      </Paper>

      {/* Top Rating & Top Selling Section */}
      <Paper withBorder radius="md" className="p-4">
        <Text size="sm" fw={600} className="mb-3">
          Marketing Options
        </Text>
        <div className="flex items-center gap-4">
          <Checkbox
            label="Top rating"
            checked={topRating}
            onChange={(e) => handleTopRatingChange(e.currentTarget.checked)}
            size="sm"
          />
          <Checkbox
            label="Top selling"
            checked={topSelling}
            onChange={(e) => handleTopSellingChange(e.currentTarget.checked)}
            size="sm"
          />
        </div>
      </Paper>

      {/* Categories Section */}
      <Paper withBorder radius="md" className="p-4">
        <Text size="sm" fw={600} className="mb-3">
          Categories
        </Text>
        <MultiSelect
          data={categories}
          value={selectedCategories}
          onChange={handleCategoriesChange}
          placeholder="Search and select categories"
          searchable
          size="sm"
          clearable
          styles={{
            input: {
              minHeight: "80px",
            },
          }}
        />
      </Paper>

      {/* Sample & Collection Details */}
      <Paper withBorder radius="md" className="p-4">
        <Grid gutter="md">
          <Grid.Col span={{ base: 12, md: 6 }}>
            <Select
              placeholder="Select sample type"
              value={sampleType}
              onChange={(value) => setSampleType(value || "")}
              data={[
                { value: "blood", label: "Blood" },
                { value: "urine", label: "Urine" },
                { value: "saliva", label: "Saliva" },
                { value: "stool", label: "Stool" },
                { value: "tissue", label: "Tissue" },
                { value: "swab", label: "Swab" },
              ]}
              size="sm"
            />
          </Grid.Col>
          <Grid.Col span={{ base: 12, md: 6 }}>
            <div className="flex gap-4 mt-2">
              <Checkbox
                label="Machine Based Test"
                checked={machineBased}
                onChange={(e) => setMachineBased(e.currentTarget.checked)}
                size="sm"
              />
              <Checkbox
                label="Home Collection Possible"
                checked={homeCollectionPossible}
                onChange={(e) =>
                  setHomeCollectionPossible(e.currentTarget.checked)
                }
                size="sm"
              />
            </div>
          </Grid.Col>
          {homeCollectionPossible && (
            <Grid.Col span={{ base: 12, md: 6 }}>
              <NumberInput
                label="Home Collection Fee"
                placeholder="Enter fee"
                value={homeCollectionFee}
                onChange={(value) => setHomeCollectionFee(value as number)}
                min={0}
                size="sm"
                leftSection={<Text size="sm">₹</Text>}
              />
            </Grid.Col>
          )}
        </Grid>
      </Paper>

      {/* Gender & Age Restrictions */}
      <Paper withBorder radius="md" className=" px-4 pt-4 pb-8">
        <Text size="sm" fw={600} className="mb-4">
          Gender & Age Restrictions
        </Text>
        <Grid gutter="md">
          <Grid.Col span={{ base: 12, md: 6 }}>
            <Select
              label="Gender Restriction"
              placeholder="Select gender"
              value={genderRestriction}
              onChange={(value) => setGenderRestriction(value || "both")}
              data={[
                { value: "both", label: "Both" },
                { value: "male", label: "Male Only" },
                { value: "female", label: "Female Only" },
              ]}
              size="sm"
            />
          </Grid.Col>
          <Grid.Col span={6}>
            <Text size="sm" fw={500} mb="md">
              Age Range: {ageRange[0]} - {ageRange[1]} years
            </Text>
            <RangeSlider
              min={0}
              max={100}
              step={1}
              value={ageRange}
              onChange={setAgeRange}
              marks={[
                { value: 0, label: "0" },
                { value: 25, label: "25" },
                { value: 50, label: "50" },
                { value: 75, label: "75" },
                { value: 100, label: "100" },
              ]}
              className="px-2"
            />
          </Grid.Col>
        </Grid>
      </Paper>

      {/* Icon & Images */}
      <Paper withBorder radius="md" className="p-4">
        <Text size="sm" fw={600} className="mb-4">
          Icon & Images
        </Text>
        <Grid gutter="md">
          <Grid.Col span={{ base: 12, md: 6 }}>
            <FileInput
              label="Icon"
              placeholder={uploadingIcon ? "Uploading..." : "Upload icon"}
              accept="image/*"
              value={icon}
              onChange={handleIconUpload}
              leftSection={
                uploadingIcon ? <Loader size={16} /> : <IconUpload size={16} />
              }
              size="sm"
              disabled={uploadingIcon}
            />
            {icon && (
              <div className="mt-2">
                <div className="relative group w-16 h-16 rounded border border-gray-200 overflow-hidden bg-white cursor-pointer">
                  <img
                    src={URL.createObjectURL(icon)}
                    alt="Icon preview"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <ActionIcon
                      size="xs"
                      color="red"
                      variant="filled"
                      onClick={() => handleIconUpload(null)}
                    >
                      <IconX size={12} />
                    </ActionIcon>
                  </div>
                </div>
              </div>
            )}
          </Grid.Col>
          <Grid.Col span={6}>
            <Text size="sm" fw={500} mb="xs">
              Images (Multiple)
            </Text>
            <FileInput
              placeholder={
                uploadingImages ? "Uploading..." : "Upload multiple images"
              }
              accept="image/*"
              multiple
              value={[]}
              onChange={handleImageUpload}
              leftSection={
                uploadingImages ? (
                  <Loader size={16} />
                ) : (
                  <IconUpload size={16} />
                )
              }
              size="sm"
              disabled={uploadingImages}
            />
            {images.length > 0 && (
              <div className="mt-3">
                <div className="flex justify-between items-center mb-2">
                  <Text size="xs" c="dimmed">
                    {images.length} image(s) uploaded
                  </Text>
                  <ActionIcon
                    size="xs"
                    color="red"
                    variant="subtle"
                    onClick={() => {
                      setImages([]);
                      setUploadedImages((prev) =>
                        prev.filter((img) => img.type !== "image")
                      );
                    }}
                  >
                    <IconX size={12} />
                  </ActionIcon>
                </div>
                <div className="flex gap-2 flex-wrap">
                  {images.slice(0, 3).map((img, index) => (
                    <div
                      key={`preview-${index}`}
                      className="relative group rounded overflow-hidden border border-gray-200 bg-white flex-shrink-0"
                    >
                      <img
                        src={URL.createObjectURL(img)}
                        alt={`Preview ${index + 1}`}
                        className="w-16 h-16 object-cover"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                        <ActionIcon
                          size="xs"
                          color="red"
                          variant="filled"
                          onClick={() => removeImage(index)}
                        >
                          <IconX size={12} />
                        </ActionIcon>
                      </div>
                    </div>
                  ))}
                  {images.length > 3 && (
                    <div className="w-16 h-16 rounded border-2 border-gray-300 bg-gray-100 flex items-center justify-center flex-shrink-0">
                      <Text size="sm" fw={600} c="gray">
                        +{images.length - 3}
                      </Text>
                    </div>
                  )}
                </div>
              </div>
            )}
          </Grid.Col>
        </Grid>
      </Paper>

      {/* Preparation Instructions */}
      <Paper withBorder radius="md" className="p-4">
        <Text size="sm" fw={600} className="mb-4">
          Preparation Instructions
        </Text>
        <Textarea
          placeholder="Enter preparation instructions for the test (e.g., fasting required, etc.)"
          value={preparation}
          onChange={(e) => setPreparation(e.currentTarget.value)}
          minRows={4}
          size="sm"
        />
      </Paper>

      {/* FAQ Section */}
      <Paper withBorder radius="md" className="p-4">
        <Group justify="space-between" className="mb-4">
          <Text size="sm" fw={600}>
            Frequently Asked Questions
          </Text>
          <Button
            size="xs"
            variant="light"
            leftSection={<IconPlus size={14} />}
            onClick={addFAQ}
          >
            Add FAQ
          </Button>
        </Group>
        <Stack gap="md">
          {faqs.map((faq, index) => (
            <Card key={index} withBorder className="p-4 bg-gray-50" shadow="sm">
              <Stack gap="md">
                <Group justify="space-between" align="flex-start">
                  <Text size="xs" fw={600} c="blue">
                    FAQ #{index + 1}
                  </Text>
                  {faqs.length > 1 && (
                    <ActionIcon
                      size="sm"
                      color="red"
                      variant="subtle"
                      onClick={() => removeFAQ(index)}
                    >
                      <IconX size={16} />
                    </ActionIcon>
                  )}
                </Group>
                <TextInput
                  placeholder="Enter question"
                  value={faq.question}
                  onChange={(e) =>
                    updateFAQ(index, "question", e.currentTarget.value)
                  }
                  size="sm"
                  styles={{
                    input: {
                      fontWeight: 500,
                    },
                  }}
                />
                <Textarea
                  placeholder="Enter answer"
                  value={faq.answer}
                  onChange={(e) =>
                    updateFAQ(index, "answer", e.currentTarget.value)
                  }
                  minRows={3}
                  size="sm"
                />
              </Stack>
            </Card>
          ))}
        </Stack>
      </Paper>
    </div>
  );
};

export default DisplayTabs;
