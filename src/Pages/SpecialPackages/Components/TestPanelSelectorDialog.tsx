import React, { useState, useEffect } from "react";
import {
  Modal,
  Select,
  Tabs,
  Text,
  Button,
  Loader,
  Badge,
  Card,
  SimpleGrid,
  Group,
  ActionIcon,
  ScrollArea,
} from "@mantine/core";
import { IconX, IconCheck, IconPlus } from "@tabler/icons-react";
import apis from "../../../APis/Api";
import useAuthStore from "../../../GlobalStore/store";

interface TestItem {
  uid: string;
  name: string;
  price?: string | number;
  department_id?: string;
  category_id?: string;
}

interface PanelItem {
  uid: string;
  name: string;
  price?: string | number;
  department_id?: string;
}

interface CategoryItem {
  uid: string;
  name: string;
}

interface DepartmentItem {
  uid: string;
  name: string;
  slug?: string;
}

export interface SelectedItem {
  uid: string;
  name: string;
  type: "test" | "panel";
  department: string;
  departmentName: string;
}

interface TestPanelSelectorDialogProps {
  opened: boolean;
  onClose: () => void;
  onSave: (selectedItems: SelectedItem[], type: "tests" | "panels") => void;
  initialSelectedTests?: SelectedItem[];
  initialSelectedPanels?: SelectedItem[];
  selectionType: "tests" | "panels";
}

const TestPanelSelectorDialog: React.FC<TestPanelSelectorDialogProps> = ({
  opened,
  onClose,
  onSave,
  initialSelectedTests = [],
  initialSelectedPanels = [],
  selectionType,
}) => {
  const organizationId = useAuthStore(
    (s) => s.organizationDetails?.organization_id ?? ""
  );
  const centerId = useAuthStore((s) => s.organizationDetails?.center_id ?? "");

  // Department and Category state
  const [departments, setDepartments] = useState<DepartmentItem[]>([]);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [selectedDepartment, setSelectedDepartment] = useState<string | null>(
    null
  );
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Tab state - initialize with selectionType as default
  const [activeTab, setActiveTab] = useState<string | null>(selectionType);

  // Data state
  const [tests, setTests] = useState<TestItem[]>([]);
  const [panels, setPanels] = useState<PanelItem[]>([]);
  const [labTests, setLabTests] = useState<TestItem[]>([]);
  const [labPanels, setLabPanels] = useState<PanelItem[]>([]);

  // Loading state
  const [loadingDepartments, setLoadingDepartments] = useState(false);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [loadingTests, setLoadingTests] = useState(false);
  const [loadingPanels, setLoadingPanels] = useState(false);

  // Selected items
  const [selectedTests, setSelectedTests] =
    useState<SelectedItem[]>(initialSelectedTests);
  const [selectedPanels, setSelectedPanels] = useState<SelectedItem[]>(
    initialSelectedPanels
  );

  // Reset state when dialog opens
  useEffect(() => {
    if (opened) {
      setActiveTab(selectionType);
      setSelectedTests(initialSelectedTests);
      setSelectedPanels(initialSelectedPanels);
    }
  }, [opened, selectionType, initialSelectedTests, initialSelectedPanels]);

  // Fetch departments on mount
  useEffect(() => {
    if (!opened || !organizationId || !centerId) return;

    const fetchDepartments = async () => {
      setLoadingDepartments(true);
      try {
        // Fetch other departments (radiology, etc.)
        const resp = await apis.GetAllDepartments(
          organizationId,
          centerId,
          1,
          100
        );
        if (resp?.data?.departments) {
          // Add "lab" as a virtual department
          const depts: DepartmentItem[] = [
            { uid: "lab", name: "Lab", slug: "lab" },
            ...resp.data.departments.map((d: any) => ({
              uid: d.uid || d.id,
              name: d.name,
              slug: d.slug,
            })),
          ];
          setDepartments(depts);
        }
      } catch (err) {
        console.error("Failed to fetch departments:", err);
        // Still add lab department even if other departments fail
        setDepartments([{ uid: "lab", name: "Lab", slug: "lab" }]);
      } finally {
        setLoadingDepartments(false);
      }
    };

    fetchDepartments();
  }, [opened, organizationId, centerId]);

  // Fetch categories when department changes
  useEffect(() => {
    if (!selectedDepartment || !organizationId || !centerId) {
      setCategories([]);
      return;
    }

    const fetchCategories = async () => {
      setLoadingCategories(true);
      try {
        if (selectedDepartment === "lab") {
          const resp = await apis.GetTestCategories(
            organizationId,
            centerId,
            "",
            1,
            100
          );
          if (resp?.data?.categorys) {
            setCategories(
              resp.data.categorys.map((c: any) => ({
                uid: c.uid || c.id,
                name: c.name,
              }))
            );
          }
        } else {
          const dept = departments.find((d) => d.uid === selectedDepartment);
          const deptSlug = dept?.slug || selectedDepartment;
          const resp = await apis.GetOtherTestCategories(
            deptSlug,
            organizationId,
            centerId,
            1,
            100,
            ""
          );
          if (resp?.data?.categorys) {
            setCategories(
              resp.data.categorys.map((c: any) => ({
                uid: c.uid || c.id,
                name: c.name,
              }))
            );
          }
        }
      } catch (err) {
        console.error("Failed to fetch categories:", err);
        setCategories([]);
      } finally {
        setLoadingCategories(false);
      }
    };

    fetchCategories();
  }, [selectedDepartment, organizationId, centerId, departments]);

  // Fetch tests and panels when department/category changes
  useEffect(() => {
    if (!selectedDepartment || !organizationId || !centerId) {
      setTests([]);
      setPanels([]);
      setLabTests([]);
      setLabPanels([]);
      return;
    }

    const fetchData = async () => {
      const dept = departments.find((d) => d.uid === selectedDepartment);
      const deptSlug = dept?.slug || selectedDepartment;

      // Fetch tests
      setLoadingTests(true);
      try {
        if (selectedDepartment === "lab") {
          const resp = await apis.GetAllTestsList(
            "",
            1,
            100,
            organizationId,
            centerId
          );
          if (resp?.data?.data) {
            let testsData = resp.data.data.map((t: any) => ({
              uid: t.uid || t.id,
              name: t.name,
              price: t.price,
              category_id: t.category_id,
            }));
            // Filter by category if selected
            if (selectedCategory) {
              testsData = testsData.filter(
                (t: TestItem) => t.category_id === selectedCategory
              );
            }
            setLabTests(testsData);
          }
        } else {
          const resp = await apis.GetOtherTestDatabase(
            deptSlug,
            1,
            100,
            organizationId,
            centerId,
            ""
          );
          if (resp?.data?.tests) {
            const filteredTests = selectedCategory
              ? resp.data.tests.filter(
                  (t: any) => t.category_id === selectedCategory
                )
              : resp.data.tests;
            setTests(
              filteredTests.map((t: any) => ({
                uid: t.uid || t.id,
                name: t.name,
                price: t.price,
                department_id: t.department_id,
                category_id: t.category_id,
              }))
            );
          }
        }
      } catch (err) {
        console.error("Failed to fetch tests:", err);
      } finally {
        setLoadingTests(false);
      }

      // Fetch panels
      setLoadingPanels(true);
      try {
        if (selectedDepartment === "lab") {
          const resp = await apis.GetTestPanels(
            1,
            100,
            organizationId,
            centerId,
            ""
          );
          if (resp?.data?.data) {
            setLabPanels(
              resp.data.data.map((p: any) => ({
                uid: p.uid || p.panel_id || p.id,
                name: p.name,
                price: p.price,
              }))
            );
          }
        } else {
          const resp = await apis.GetOtherTestPanels(
            deptSlug,
            organizationId,
            centerId,
            1,
            100,
            ""
          );
          if (resp?.data?.panels) {
            setPanels(
              resp.data.panels.map((p: any) => ({
                uid: p.uid || p.panel_id || p.id,
                name: p.name,
                price: p.price,
                department_id: p.department_id,
              }))
            );
          }
        }
      } catch (err) {
        console.error("Failed to fetch panels:", err);
      } finally {
        setLoadingPanels(false);
      }
    };

    fetchData();
  }, [
    selectedDepartment,
    selectedCategory,
    organizationId,
    centerId,
    departments,
  ]);

  // Get current tests/panels based on department
  const currentTests = selectedDepartment === "lab" ? labTests : tests;
  const currentPanels = selectedDepartment === "lab" ? labPanels : panels;

  // Check if item is selected
  const isTestSelected = (uid: string) =>
    selectedTests.some((t) => t.uid === uid);
  const isPanelSelected = (uid: string) =>
    selectedPanels.some((p) => p.uid === uid);

  // Toggle test selection
  const toggleTest = (test: TestItem) => {
    const dept = departments.find((d) => d.uid === selectedDepartment);
    if (isTestSelected(test.uid)) {
      setSelectedTests((prev) => prev.filter((t) => t.uid !== test.uid));
    } else {
      setSelectedTests((prev) => [
        ...prev,
        {
          uid: test.uid,
          name: test.name,
          type: "test",
          department: selectedDepartment || "",
          departmentName: dept?.name || "",
        },
      ]);
    }
  };

  // Toggle panel selection
  const togglePanel = (panel: PanelItem) => {
    const dept = departments.find((d) => d.uid === selectedDepartment);
    if (isPanelSelected(panel.uid)) {
      setSelectedPanels((prev) => prev.filter((p) => p.uid !== panel.uid));
    } else {
      setSelectedPanels((prev) => [
        ...prev,
        {
          uid: panel.uid,
          name: panel.name,
          type: "panel",
          department: selectedDepartment || "",
          departmentName: dept?.name || "",
        },
      ]);
    }
  };

  // Remove from added section
  const removeTest = (uid: string) => {
    setSelectedTests((prev) => prev.filter((t) => t.uid !== uid));
  };

  const removePanel = (uid: string) => {
    setSelectedPanels((prev) => prev.filter((p) => p.uid !== uid));
  };

  // Handle save
  const handleSave = () => {
    onSave(selectedTests, "tests");
    onSave(selectedPanels, "panels");
    onClose();
  };

  const currentSelected =
    activeTab === "tests" ? selectedTests : selectedPanels;

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={
        <Text fw={600} size="lg">
          Select {selectionType === "tests" ? "Tests" : "Panels"}
        </Text>
      }
      size="xl"
      centered
      styles={{
        body: { padding: 0 },
      }}
    >
      <div className="p-4">
        {/* Department and Category Dropdowns */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <Select
            label="Department"
            placeholder="Select department"
            data={departments.map((d) => ({ value: d.uid, label: d.name }))}
            value={selectedDepartment}
            onChange={(val) => {
              setSelectedDepartment(val);
              setSelectedCategory(null);
            }}
            searchable
            clearable
            disabled={loadingDepartments}
            rightSection={loadingDepartments ? <Loader size="xs" /> : undefined}
          />
          <Select
            label="Category"
            placeholder="Select category (optional)"
            data={categories.map((c) => ({ value: c.uid, label: c.name }))}
            value={selectedCategory}
            onChange={setSelectedCategory}
            searchable
            clearable
            disabled={!selectedDepartment || loadingCategories}
            rightSection={loadingCategories ? <Loader size="xs" /> : undefined}
          />
        </div>

        {/* Tabs for Tests and Panels */}
        <Tabs value={activeTab} onChange={setActiveTab}>
          <Tabs.List grow>
            <Tabs.Tab value="tests">
              Tests {selectedTests.length > 0 && `(${selectedTests.length})`}
            </Tabs.Tab>
            <Tabs.Tab value="panels">
              Panels {selectedPanels.length > 0 && `(${selectedPanels.length})`}
            </Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="tests" pt="md">
            {!selectedDepartment ? (
              <div className="text-center py-8 text-gray-500">
                Please select a department to view tests
              </div>
            ) : loadingTests ? (
              <div className="flex justify-center py-8">
                <Loader />
              </div>
            ) : currentTests.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No tests found
              </div>
            ) : (
              <ScrollArea h={250}>
                <SimpleGrid cols={3} spacing="sm">
                  {currentTests.map((test) => (
                    <Card
                      key={test.uid}
                      shadow="xs"
                      padding="sm"
                      radius="md"
                      withBorder
                      className={`cursor-pointer transition-all ${
                        isTestSelected(test.uid)
                          ? "border-blue-500 bg-blue-50"
                          : "hover:border-gray-400"
                      }`}
                      onClick={() => toggleTest(test)}
                    >
                      <Group justify="space-between" wrap="nowrap">
                        <div className="flex-1 min-w-0">
                          <Text size="sm" fw={500} truncate>
                            {test.name}
                          </Text>
                          {test.price && (
                            <Text size="xs" c="dimmed">
                              ₹{test.price}
                            </Text>
                          )}
                        </div>
                        {isTestSelected(test.uid) ? (
                          <IconCheck size={18} className="text-blue-600" />
                        ) : (
                          <IconPlus size={18} className="text-gray-400" />
                        )}
                      </Group>
                    </Card>
                  ))}
                </SimpleGrid>
              </ScrollArea>
            )}
          </Tabs.Panel>

          <Tabs.Panel value="panels" pt="md">
            {!selectedDepartment ? (
              <div className="text-center py-8 text-gray-500">
                Please select a department to view panels
              </div>
            ) : loadingPanels ? (
              <div className="flex justify-center py-8">
                <Loader />
              </div>
            ) : currentPanels.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No panels found
              </div>
            ) : (
              <ScrollArea h={250}>
                <SimpleGrid cols={3} spacing="sm">
                  {currentPanels.map((panel) => (
                    <Card
                      key={panel.uid}
                      shadow="xs"
                      padding="sm"
                      radius="md"
                      withBorder
                      className={`cursor-pointer transition-all ${
                        isPanelSelected(panel.uid)
                          ? "border-blue-500 bg-blue-50"
                          : "hover:border-gray-400"
                      }`}
                      onClick={() => togglePanel(panel)}
                    >
                      <Group justify="space-between" wrap="nowrap">
                        <div className="flex-1 min-w-0">
                          <Text size="sm" fw={500} truncate>
                            {panel.name}
                          </Text>
                          {panel.price && (
                            <Text size="xs" c="dimmed">
                              ₹{panel.price}
                            </Text>
                          )}
                        </div>
                        {isPanelSelected(panel.uid) ? (
                          <IconCheck size={18} className="text-blue-600" />
                        ) : (
                          <IconPlus size={18} className="text-gray-400" />
                        )}
                      </Group>
                    </Card>
                  ))}
                </SimpleGrid>
              </ScrollArea>
            )}
          </Tabs.Panel>
        </Tabs>

        {/* Added Section */}
        <div className="mt-4 border-t pt-4">
          <Text fw={600} size="sm" mb="sm">
            Added {selectionType === "tests" ? "Tests" : "Panels"} (
            {currentSelected.length})
          </Text>
          {currentSelected.length === 0 ? (
            <div className="text-center py-4 text-gray-400 text-sm">
              No {selectionType} added yet
            </div>
          ) : (
            <ScrollArea h={120}>
              <div className="flex flex-wrap gap-2">
                {currentSelected.map((item) => (
                  <Badge
                    key={item.uid}
                    variant="light"
                    color="blue"
                    size="lg"
                    rightSection={
                      <ActionIcon
                        size="xs"
                        color="blue"
                        radius="xl"
                        variant="transparent"
                        onClick={() =>
                          selectionType === "tests"
                            ? removeTest(item.uid)
                            : removePanel(item.uid)
                        }
                      >
                        <IconX size={12} />
                      </ActionIcon>
                    }
                  >
                    {item.name}
                    <Text span size="xs" c="dimmed" ml={4}>
                      ({item.departmentName})
                    </Text>
                  </Badge>
                ))}
              </div>
            </ScrollArea>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 mt-4 pt-4 border-t">
          <Button variant="default" onClick={onClose}>
            Cancel
          </Button>
          <Button color="blue" onClick={handleSave}>
            Save Selection
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default TestPanelSelectorDialog;
