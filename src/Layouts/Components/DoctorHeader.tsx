import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Avatar,
  TextInput,
  ActionIcon,
  Menu,
  UnstyledButton,
  Text,
  Modal,
  Button,
  Group,
  Select,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import {
  IconSearch,
  IconBell,
  IconLogout,
  IconChevronDown,
  IconMenu2,
} from "@tabler/icons-react";
import { useDoctorAuthStore } from "../../GlobalStore/doctorStore";
import useSidebarStore from "../../GlobalStore/sidebarStore";
import apis from "../../APis/Api";

type DoctorHeaderProps = {
  isSmall: boolean;
  setIsSmall: React.Dispatch<React.SetStateAction<boolean>>;
};

const DoctorHeader: React.FC<DoctorHeaderProps> = ({ isSmall, setIsSmall }) => {
  const navigate = useNavigate();
  const doctor = useDoctorAuthStore((s) => s.doctor);
  const setDoctor = useDoctorAuthStore((s) => s.setDoctor);
  const logout = useDoctorAuthStore((s) => s.logout);
  const setSidebar = useSidebarStore((s) => s.setSidebar);

  const name = doctor?.name ?? "";
  const image = doctor?.image ?? undefined;
  const organizationId = doctor?.organization_id ?? "";
  const centerId = doctor?.center_id ?? "";

  const initials = name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  // Center dropdown state
  const [centersOptions, setCentersOptions] = useState<
    { label: string; value: string }[]
  >([]);
  const [isCentersLoading, setIsCentersLoading] = useState(false);
  const [selectedCenterId, setSelectedCenterId] = useState<string | null>(
    centerId
  );

  // Logout confirmation modal state
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Fetch centers on mount
  useEffect(() => {
    if (!organizationId || !centerId) return;

    const fetchCenters = async () => {
      setIsCentersLoading(true);
      try {
        const response = await apis.getOrganizationCenters(organizationId);
        const centers = response?.data?.center || [];
        const options = centers.map((c) => ({ label: c.name, value: c.uid }));
        setCentersOptions(options);
        console.log("Doctor centers fetched:", centers);
      } catch (error) {
        console.error("Failed to fetch organization centers:", error);
        notifications.show({
          title: "Error",
          message: "Failed to load centers",
          color: "red",
        });
      } finally {
        setIsCentersLoading(false);
      }
    };

    fetchCenters();
  }, [organizationId, centerId]);

  // Handle center change
  const handleCenterChange = async (value: string | null) => {
    if (!value || !organizationId) return;

    setSelectedCenterId(value);
    setIsCentersLoading(true);

    try {
      const response = await apis.SwitchOrganizationcenter({
        organization_id: organizationId,
        center_id: value,
      });

      const switchDetails = response.data.switchAccessDetails;

      // Update doctor store with new center details
      if (doctor) {
        const updatedDoctor = {
          ...doctor,
          center_id: switchDetails.center_id ?? value,
          center_name: switchDetails.center_name ?? "",
        };
        setDoctor(updatedDoctor);
      }

      notifications.show({
        title: "Switched center",
        message: `Switched to ${switchDetails.center_name || value}`,
        color: "green",
      });

      // Refetch sidebar menu after center switch
      try {
        const sidebarResp = await apis.GetDoctorSidebarMenu(
          organizationId,
          value,
          doctor?.user_id ?? ""
        );
        if (sidebarResp?.data) {
          setSidebar(sidebarResp.data);
          console.log("Doctor sidebar updated after center switch");
        }
      } catch (e) {
        console.error("Failed to fetch sidebar after center switch:", e);
      }
    } catch (err) {
      console.error("Failed to switch center:", err);
      notifications.show({
        title: "Error",
        message: "Failed to switch center",
        color: "red",
      });
      // Revert to previous center
      setSelectedCenterId(centerId);
    } finally {
      setIsCentersLoading(false);
    }
  };

  const handleLogout = () => {
    setIsLogoutModalOpen(true);
  };

  const handleConfirmLogout = async () => {
    setIsLoggingOut(true);
    try {
      // Clear doctor Zustand store
      logout();
      // Clear sidebar store
      setSidebar(null);

      // Call API with isLocalStorageClear: true
      await apis.Logout({ isLocalStorageClear: true });

      // Redirect to doctor login
      navigate("/doctor-login");
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setIsLoggingOut(false);
      setIsLogoutModalOpen(false);
    }
  };

  return (
    <header className="flex items-center justify-between px-6 py-3 bg-white shadow-sm">
      {/* Search Input */}
      <div className="flex-1 max-w-lg">
        <div className="flex items-center gap-3">
          <Button
            className="!p-0 !bg-transparent !text-black rounded-full flex justify-center items-center w-auto menuBar"
            leftSection={<IconMenu2 size={24} />}
            onClick={() => setIsSmall(!isSmall)}
          />
          <TextInput
            placeholder="Search patients, appointments, charts..."
            radius="md"
            size="sm"
            className="w-full"
            leftSection={
              <div className="pl-2">
                <IconSearch size={16} />
              </div>
            }
            leftSectionWidth={36}
          />
        </div>
      </div>

      {/* Notification and Profile */}
      <div className="ml-4 flex items-center gap-4">
        {/* Center Dropdown */}
        <div className="w-60">
          <Select
            classNames={{
              input:
                "border rounded-md px-3 py-2 text-sm bg-white focus:outline-none focus:ring-0 focus-visible:outline-none",
            }}
            value={selectedCenterId}
            placeholder="Select Center"
            data={centersOptions}
            searchable
            rightSection={
              isCentersLoading ? <div className="pr-2">...</div> : null
            }
            onChange={handleCenterChange}
          />
        </div>

        {/* Bell and profile */}
        <div className="flex items-center gap-4">
          <div className="relative">
            <ActionIcon variant="subtle" color="gray" size={35}>
              <IconBell size={18} />
            </ActionIcon>
            <span className="absolute top-1 -right-0 w-3 h-3 bg-red-500 rounded-full border-2 border-white" />
          </div>

          <Menu withinPortal>
            <Menu.Target>
              <UnstyledButton className="flex items-center gap-3">
                <Avatar src={image} alt={name} radius="xl" size={40}>
                  {!image && initials}
                </Avatar>
                <div className="hidden sm:flex items-center gap-1 text-left">
                  <Text size="sm" fw={600} className="text-gray-700">
                    Dr. {name}
                  </Text>
                  <IconChevronDown size={16} className="text-gray-500" />
                </div>
              </UnstyledButton>
            </Menu.Target>
            <Menu.Dropdown>
              <Menu.Item
                leftSection={<IconLogout size={14} />}
                onClick={handleLogout}
              >
                Logout
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
        </div>
      </div>

      {/* Logout Confirmation Modal */}
      <Modal
        opened={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        title="Confirm Logout"
        centered
      >
        <Text size="sm" mb="lg">
          Are you sure you want to logout? You will be redirected to the login
          page.
        </Text>
        <Group justify="flex-end">
          <Button variant="subtle" onClick={() => setIsLogoutModalOpen(false)}>
            Cancel
          </Button>
          <Button
            color="red"
            loading={isLoggingOut}
            onClick={handleConfirmLogout}
          >
            Logout
          </Button>
        </Group>
      </Modal>
    </header>
  );
};

export default DoctorHeader;
