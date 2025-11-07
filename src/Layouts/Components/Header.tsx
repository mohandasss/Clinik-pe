import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Avatar,
  Group,
  TextInput,
  ActionIcon,
  Menu,
  UnstyledButton,
  Text,
} from "@mantine/core";
import {
  IconSearch,
  IconBell,
  IconLogout,
  IconChevronDown,
} from "@tabler/icons-react";
import useAuthStore from "../../GlobalStore/store";

const Header: React.FC = () => {
  const navigate = useNavigate();
  const organizationDetails = useAuthStore((s) => s.organizationDetails);
  const logout = useAuthStore((s) => s.logout);

  const name = organizationDetails?.name ?? "";
  const image = organizationDetails?.image ?? undefined;

  const initials = name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header className="flex items-center justify-between px-6 py-3 bg-white shadow-sm">
      <div className="flex-1 max-w-lg">
        <TextInput
          placeholder="Search patients, appointments, charts..."
          radius="md"
          size="sm"
          leftSection={
            <div className="pl-2">
              <IconSearch size={16} />
            </div>
          }
          leftSectionWidth={36}
        />
      </div>

      <div className="ml-4">
        <div className="flex items-center gap-4">
          {/* bell with red dot */}
          <div className="relative">
            <ActionIcon variant="subtle" mt={4} color="gray" size={35}>
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
    </header>
  );
};

export default Header;
