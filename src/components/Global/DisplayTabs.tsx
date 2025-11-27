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
} from "@mantine/core";
import { IconUpload, IconX, IconPlus } from "@tabler/icons-react";

interface FAQ {
  question: string;
  answer: string;
}

interface DisplayTabsProps {
  onOrgansChange?: (selected: string[]) => void;
  onCategoriesChange?: (selected: string[]) => void;
  onTopRatingChange?: (checked: boolean) => void;
  onTopSellingChange?: (checked: boolean) => void;
  onDataChange?: (data: any) => void;
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

  const handleCategoryToggle = (category: string) => {
    const newSelection = selectedCategories.includes(category)
      ? selectedCategories.filter((c) => c !== category)
      : [...selectedCategories, category];
    setSelectedCategories(newSelection);
    onCategoriesChange?.(newSelection);
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

  const handleImageUpload = (files: File[]) => {
    setImages([...images, ...files]);
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4">
      {/* Organs Section */}
      <Paper withBorder radius="md" className="p-4">
        <Text size="sm" fw={600} className="mb-4">
          Display Information
        </Text>
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
            <Textarea
              label="Long About"
              placeholder="Detailed description"
              value={longAbout}
              onChange={(e) => setLongAbout(e.currentTarget.value)}
              minRows={4}
              size="sm"
            />
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

        <div className="flex items-center gap-4 pt-3 border-t">
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
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <Chip
              key={category}
              checked={selectedCategories.includes(category)}
              onChange={() => handleCategoryToggle(category)}
              size="sm"
            >
              {category}
            </Chip>
          ))}
        </div>
      </Paper>

      {/* Display Information */}

      {/* Sample & Collection Details */}
      <Paper withBorder radius="md" className="p-4">
        <Text size="sm" fw={600} className="mb-4">
          Sample & Collection Details
        </Text>
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
              placeholder="Upload icon"
              accept="image/*"
              value={icon}
              onChange={setIcon}
              leftSection={<IconUpload size={16} />}
              size="sm"
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
                      onClick={() => setIcon(null)}
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
              placeholder="Upload multiple images"
              accept="image/*"
              multiple
              onChange={handleImageUpload}
              leftSection={<IconUpload size={16} />}
              size="sm"
              clearable={images.length > 0}
              onClear={() => setImages([])}
            />
            {images.length > 0 && (
              <div className="mt-3 flex gap-2 flex-wrap">
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
