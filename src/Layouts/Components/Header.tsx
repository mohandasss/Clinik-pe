import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Avatar,
  TextInput,
  ActionIcon,
  Menu,
  UnstyledButton,
  Text,
  Select,
  Modal,
  Button,
  Group,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import {
  IconSearch,
  IconBell,
  IconLogout,
  IconChevronDown,
  IconMenu2,
} from "@tabler/icons-react";
import useAuthStore from "../../GlobalStore/store";
import useSidebarStore from "../../GlobalStore/sidebarStore";
import useDropdownStore from "../../GlobalStore/useDropdownStore";
import apis from "../../APis/Api";
// import useOrgStore from "../../GlobalStore/orgStore";
type HeaderProps = {
  isSmall: boolean;
  setIsSmall: React.Dispatch<React.SetStateAction<boolean>>;
};
const Header: React.FC<HeaderProps> = ({ isSmall, setIsSmall }) => {
  const navigate = useNavigate();
  const organizationDetails = useAuthStore((s) => s.organizationDetails);
  const setOrganizationDetails = useAuthStore((s) => s.setOrganizationDetails);
  const logout = useAuthStore((s) => s.logout);
  const setSelectedCenter = useDropdownStore((s) => s.setSelectedCenter);
  const centersRefreshCounter = useDropdownStore(
    (s) => s.centersRefreshCounter
  );
  const setSidebar = useSidebarStore((s) => s.setSidebar);

  const name = organizationDetails?.name ?? "";
  const image = organizationDetails?.image ?? undefined;

  const initials = name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const { pathname } = useLocation();

  // show dropdown everywhere except organization pages
  const shouldShowDropdown = !pathname.startsWith("/organization");

  const [orgValue, setOrgValue] = useState<string | null>(null);
  const [centersOptions, setCentersOptions] = useState<
    { label: string; value: string }[]
  >([]);
  const [isCentersLoading, setIsCentersLoading] = useState(false);

  const SELECTED_CENTER_KEY = "selected-center";

  // get dropdown options
  useEffect(() => {
    if (!shouldShowDropdown) return;

    const orgId = organizationDetails?.organization_id;
    if (!orgId) return;

    const fetchCenters = async () => {
      setIsCentersLoading(true);
      try {
        const response = await apis.getOrganizationCenters(orgId);
        const centers = response?.data?.center || [];

        const options = centers.map((c) => ({ label: c.name, value: c.uid }));
        setCentersOptions(options);

        // No default selection - user must choose explicitly
        // (Removed: set default value from store or first center)

        console.log(
          "Organization centers (api.getOrganizationCenters):",
          response
        );
      } catch (error) {
        console.error("Failed to fetch organization centers:", error);
      } finally {
        setIsCentersLoading(false);
      }
    };

    fetchCenters();
  }, [
    shouldShowDropdown,
    organizationDetails?.organization_id,
    centersRefreshCounter,
  ]);

  // when centers load, restore previously selected center from localStorage or dropdown store
  useEffect(() => {
    if (centersOptions.length === 0) return;

    // try Zustand store first
    const currentSelected = useDropdownStore.getState().selectedCenter;
    if (currentSelected && currentSelected.center_id) {
      setOrgValue(currentSelected.center_id);
      return;
    }

    // then try persisted localStorage
    try {
      const raw = localStorage.getItem(SELECTED_CENTER_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as {
          center_id: string;
          center_name: string;
        };
        if (parsed && parsed.center_id) {
          // ensure the center exists in options
          const exists = centersOptions.some(
            (c) => c.value === parsed.center_id
          );
          if (exists) {
            setOrgValue(parsed.center_id);
            setSelectedCenter({
              center_id: parsed.center_id,
              center_name: parsed.center_name,
            });
            // Also update organizationDetails with center info so other components (which read auth store)
            // can access the selected center name. Only do this if organizationDetails is already present
            // (we avoid constructing a partial OrganizationDetails object when it's null).
            if (organizationDetails) {
              try {
                setOrganizationDetails({
                  ...organizationDetails,
                  center_id: parsed.center_id,
                  center_name: parsed.center_name,
                });
              } catch (e) {
                // If for any reason updating fails, log and continue; this is non-critical
                console.warn(
                  "Failed to update organizationDetails with center_name",
                  e
                );
              }
            }
          }
        }
      }
    } catch {
      // ignore
    }
    // If nothing selected from store/localStorage, set default to first option
    const selectedNow = useDropdownStore.getState().selectedCenter;
    if (!selectedNow || !selectedNow.center_id) {
      const first = centersOptions[0];
      if (first) {
        try {
          setOrgValue(first.value);
          setSelectedCenter({
            center_id: first.value,
            center_name: first.label,
          });

          // Update auth store center info if available
          if (organizationDetails) {
            try {
              setOrganizationDetails({
                ...organizationDetails,
                center_id: first.value,
                center_name: first.label,
              });
            } catch (e) {
              console.warn(
                "Failed to update organizationDetails with default center",
                e
              );
            }
          }

          // Persist first selection so reload keeps it
          try {
            localStorage.setItem(
              SELECTED_CENTER_KEY,
              JSON.stringify({
                center_id: first.value,
                center_name: first.label,
              })
            );
          } catch (e) {
            console.warn("Failed to persist default center in localStorage", e);
          }
        } catch {
          // ignore
        }
      }
    }
  }, [
    centersOptions,
    setSelectedCenter,
    organizationDetails,
    setOrganizationDetails,
  ]);

  // handle center switch: obtain fresh payload and update auth-storage
  const handleCenterChange = async (value: string | null) => {
    setOrgValue(value);
    if (!value) return;

    const orgId = organizationDetails?.organization_id;
    if (!orgId) {
      notifications.show({
        title: "Error",
        message: "No organization selected",
        color: "red",
      });
      return;
    }

    setIsCentersLoading(true);
    try {
      const response = await apis.SwitchOrganizationcenter({
        organization_id: orgId,
        center_id: value,
      });
      const switchDetails = response.data.switchAccessDetails;

      // Merge into existing organizationDetails while preserving user identity fields
      const current = organizationDetails;
      const updatedDetails = {
        organization_id: switchDetails.organization_id,
        organization_name: switchDetails.organization_name,
        user_id: switchDetails.user_id || current?.user_id || "",
        name: switchDetails.name || current?.name || "",
        email: switchDetails.email || current?.email || "",
        mobile: switchDetails.mobile || current?.mobile || "",
        user_role: current?.user_role || "",
        user_type: switchDetails.user_type || current?.user_type || "",
        central_account_id: switchDetails.central_account_id,
        time_zone: switchDetails.time_zone || current?.time_zone || "",
        currency: switchDetails.currency ?? current?.currency ?? null,
        country: switchDetails.country ?? current?.country ?? null,
        access: switchDetails.access ?? current?.access ?? null,
        center_id: switchDetails.center_id ?? current?.center_id ?? null,
        image: switchDetails.image ?? current?.image ?? null,
        center_name: switchDetails.center_name ?? current?.center_name ?? "",
      };

      setOrganizationDetails(updatedDetails);

      // update selected center in dropdown store
      setSelectedCenter({
        center_id: switchDetails.center_id ?? value,
        center_name: switchDetails.center_name ?? "",
      });

      // persist selected center so reload keeps the selection
      try {
        localStorage.setItem(
          SELECTED_CENTER_KEY,
          JSON.stringify({
            center_id: switchDetails.center_id ?? value,
            center_name: switchDetails.center_name ?? "",
          })
        );
      } catch (e) {
        console.warn("Could not persist selected center", e);
      }

      notifications.show({
        title: "Switched center",
        message: `Switched to ${switchDetails.center_name || value}`,
        color: "green",
      });

      // Refetch sidebar menu after center switch to ensure menu is updated
      try {
        const sidebarResp = await apis.GetSidebarData();
        if (sidebarResp?.data) {
          setSidebar(sidebarResp.data);
          console.log("Sidebar updated after center switch:", sidebarResp.data);
        }
      } catch (e) {
        console.error("Failed to fetch sidebar after center switch:", e);
        notifications.show({
          title: "Warning",
          message: "Failed to refresh sidebar menu",
          color: "yellow",
        });
      }

      // Optionally refresh page data that depends on center. Easiest is a reload so all components read new auth-storage.
      // If you prefer not to reload, replace this with targeted refetches.
      // window.location.reload();
    } catch (err) {
      console.error("Failed to switch center:", err);
      notifications.show({
        title: "Error",
        message: "Failed to switch center",
        color: "red",
      });
    } finally {
      setIsCentersLoading(false);
    }
  };

  // Logout confirmation modal state
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = () => {
    setIsLogoutModalOpen(true);
  };

  const handleConfirmLogout = async () => {
    setIsLoggingOut(true);
    try {
      // Clear Zustand stores first
      logout();
      setSidebar(null); // Clear sidebar store

      // Call API with isLocalStorageClear: true
      await apis.Logout({ isLocalStorageClear: true });

      // Redirect to login
      navigate("/login");
    } catch (error) {
      console.error("Logout error:", error);
      setIsCentersLoading(true);
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

      {/* ✅ Dropdown when needed */}

      {/* Notification and Profile */}
      <div className="ml-4 flex items-center gap-4">
        {/* Dropdown */}
        {shouldShowDropdown && (
          <div className="w-60">
            <Select
              classNames={{
                input:
                  "border rounded-md px-3 py-2 text-sm bg-white focus:outline-none focus:ring-0 focus-visible:outline-none",
              }}
              value={orgValue}
              placeholder="Select Center"
              data={centersOptions}
              searchable
              rightSection={
                isCentersLoading ? <div className="pr-2">...</div> : null
              }
              onChange={handleCenterChange}
            />
          </div>
        )}

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
                    {name}
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

export default Header;
