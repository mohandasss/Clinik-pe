import { Button, Image, NavLink, Modal, Text, Group } from "@mantine/core";
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDoctorAuthStore } from "../../GlobalStore/doctorStore";
import useSidebarStore from "../../GlobalStore/sidebarStore";
import apis from "../../APis/Api";
import type { SidebarMenuItem } from "../../APis/Types";

type DoctorSideBarProps = {
  isSmall: boolean;
  setIsSmall: React.Dispatch<React.SetStateAction<boolean>>;
};

// Recursive component to render sidebar menu items and their children
const MenuItemRenderer: React.FC<{
  item: SidebarMenuItem;
  isSmall: boolean;
}> = ({ item, isSmall }) => {
  const hasChildren = item.children && item.children.length > 0;

  if (hasChildren) {
    return (
      <NavLink
        key={item.id}
        leftSection={
          item.icon ? (
            <Image
              src={item.icon}
              height="26px"
              width="26px"
              className="h-[26px] w-[26px] sidebar-icon"
              alt={item.title}
              // force icon color to white using CSS filter for raster images
              style={{ filter: "brightness(0) invert(1)" }}
            />
          ) : undefined
        }
        href="#"
        label={item.title}
      >
        {item.children.map((child) => (
          <MenuItemRenderer key={child.id} item={child} isSmall={isSmall} />
        ))}
      </NavLink>
    );
  }

  return (
    <NavLink
      key={item.id}
      leftSection={
        item.icon ? (
          <Image
            src={item.icon}
            height="26px"
            width="26px"
            className="h-[26px] w-[26px] sidebar-icon"
            alt={item.title}
            // force icon color to white so it matches sidebar theme
            style={{ filter: "brightness(0) invert(1)" }}
          />
        ) : undefined
      }
      component={Link}
      to={item.path}
      label={item.title}
    />
  );
};

const DoctorSideBar: React.FC<DoctorSideBarProps> = ({
  isSmall,
  setIsSmall,
}) => {
  const navigate = useNavigate();
  const doctor = useDoctorAuthStore((s) => s.doctor);
  const logout = useDoctorAuthStore((s) => s.logout);
  const sidebar = useSidebarStore((s) => s.sidebar);
  const setSidebar = useSidebarStore((s) => s.setSidebar);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Fetch doctor sidebar menu on component mount
  useEffect(() => {
    const fetchDoctorMenu = async () => {
      if (!doctor?.organization_id || !doctor?.user_id) {
        console.error("Missing doctor organization_id or user_id");
        return;
      }

      try {
        const response = await apis.GetDoctorSidebarMenu(
          doctor.organization_id,
          doctor.center_id || "all",
          doctor.user_id
        );
        console.log("Doctor sidebar menu fetched:", response);

        if (response.success && response.data) {
          setSidebar(response.data);
        }   
      } catch (error) {
        console.error("Error fetching doctor sidebar menu:", error);
      }
    };

    fetchDoctorMenu();
  }, [doctor, setSidebar]);

  return (
    <aside
      aria-hidden
      className={`h-screen bg-gradient-to-b from-[#05203a] to-[#08123a] flex flex-col transition-all duration-300
        ${isSmall ? "w-[88px] smallSidebar" : "w-64"}
      `}
    >
      <div className="sidebarHeader p-4">
        <Link to="/doctor-dashboard">
          <Image
            src="/images/logo.webp"
            alt="Logo"
            width="220"
            height="54"
            className="logoBig"
          />
          <Image
            src="/images/logo-fav.webp"
            alt="Logo"
            width="75"
            height="75"
            className="logoSmall"
          />
        </Link>
      </div>
      <nav
        className="overflow-auto p-4 sidebarNav flex flex-col gap-2"
        onClick={() => {
          if (isSmall) {
            setIsSmall(false);
          }
        }}
      >
        {/* Render sidebar items from store, or show placeholder if not yet loaded */}
        {sidebar && sidebar.length > 0 ? (
          sidebar.map((item) => (
            <MenuItemRenderer key={item.id} item={item} isSmall={isSmall} />
          ))
        ) : (
          <div className="text-center text-gray-400 py-4">
            <p className="text-sm">Loading menu...</p>
          </div>
        )}
      </nav>
      <div className="sidebarFooter mt-auto p-4">
        <Button
          className="!bg-transparent !text-white !border-0"
          leftSection={
            <svg
              width="26"
              height="26"
              viewBox="0 0 61 60"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M60.9917 26.3581C60.9917 26.3581 60.9905 26.3485 60.9893 26.3438C60.9821 26.2735 60.9714 26.2032 60.9571 26.1341C60.9571 26.1293 60.9547 26.1245 60.9535 26.1186C60.8665 25.7027 60.6628 25.306 60.3399 24.9831L52.2307 16.8739C51.7886 16.4318 51.2096 16.2102 50.6293 16.2102C50.0491 16.2102 49.4712 16.4306 49.0292 16.8727C48.1451 17.7567 48.1451 19.1901 49.0292 20.0742L53.278 24.323H37.6612C36.4114 24.323 35.3974 25.337 35.3974 26.5868C35.3974 27.8367 36.4114 28.8506 37.6612 28.8506H53.2685L49.022 33.0971C48.1379 33.9812 48.1379 35.4145 49.022 36.2986C49.4641 36.7406 50.0431 36.9622 50.6222 36.9622C51.2012 36.9622 51.7803 36.7418 52.2223 36.2986L60.2863 28.2346C60.5746 27.963 60.7915 27.6186 60.9071 27.2278C60.9071 27.2278 60.9071 27.2266 60.9071 27.2255C60.9273 27.1575 60.944 27.0884 60.9583 27.0181C60.9607 27.0086 60.9607 26.9979 60.9631 26.9884C60.9738 26.9276 60.9833 26.8668 60.9893 26.8049C60.994 26.7584 60.994 26.7131 60.9964 26.6667C60.9964 26.6404 61 26.6154 61 26.588C61 26.588 61 26.5868 61 26.5856C61 26.5844 61 26.5844 61 26.5832C61 26.5082 60.9964 26.4331 60.9881 26.3581H60.9917Z"
                fill="currentColor"
              />
              <path
                d="M32.7353 5.51668C35.4495 6.12315 38.2209 8.63717 39.3302 11.5003C39.6781 12.3975 40.5336 12.9468 41.4415 12.9468C41.7132 12.9468 41.9908 12.8967 42.2589 12.7931C43.4241 12.3415 44.0032 11.0297 43.5516 9.8644C41.8811 5.55362 37.9219 2.02802 33.7004 1.0939L33.6718 1.08795C30.1844 0.363524 26.5742 0.00727096 22.6363 0.00012207C18.6961 0.00727096 15.0859 0.362333 11.5925 1.08795L11.5627 1.0939C9.34416 1.58479 7.22094 2.787 5.46231 4.41575C5.00717 4.75056 4.59849 5.18307 4.2327 5.69302C4.17313 5.76332 4.11594 5.836 4.06232 5.90987C2.60276 7.67803 1.54234 9.76432 1.12174 11.928C0.573662 14.6828 -0.0470997 21.8221 0.00294249 26.5869C-0.0244616 29.1438 0.142346 32.3846 0.3866 35.2644C0.517663 37.1112 0.666598 38.7173 0.810767 39.7515C1.51493 44.9619 4.71883 50.7406 8.26468 53.1962L8.28493 53.2105C10.7751 54.8881 13.3487 56.2405 16.1606 57.3461C18.9654 58.4352 21.5402 59.0952 24.0304 59.3645L24.0506 59.3669C24.2079 59.3812 24.3664 59.3883 24.5224 59.3883C27.6823 59.3883 30.4858 56.5598 31.3627 52.5111C31.3627 52.5111 31.3627 52.5111 31.3627 52.5099C32.1384 52.386 32.9069 52.2466 33.6695 52.0881L33.6981 52.0822C37.9195 51.1481 41.8788 47.6225 43.5492 43.3117C44.0008 42.1464 43.4217 40.8346 42.2565 40.383C41.9872 40.2782 41.7108 40.2293 41.4391 40.2293C40.5312 40.2293 39.6757 40.7786 39.3278 41.6758C38.2185 44.5377 35.4471 47.0517 32.733 47.6594C32.4589 47.7166 32.1837 47.769 31.9096 47.8214C32.1455 44.7569 32.3243 40.8382 32.3016 37.8154C32.3374 33.1972 31.8953 26.0852 31.5033 23.2555C30.7992 18.0451 27.5953 12.2664 24.0494 9.81078L24.0292 9.79649C21.5414 8.12007 18.9666 6.76774 16.1535 5.66085C15.659 5.46902 15.1717 5.2903 14.6903 5.12469C14.6903 5.12469 14.688 5.12469 14.6868 5.12469C17.2091 4.72554 19.7839 4.53371 22.634 4.52894C26.2477 4.5349 29.5541 4.85899 32.733 5.51907L32.7353 5.51668ZM21.4842 13.5389C22.6185 14.3289 23.8576 15.8421 24.8847 17.6948C25.9939 19.6953 26.7517 21.8853 27.0186 23.8607C27.0186 23.8655 27.0198 23.8703 27.021 23.875C27.3892 26.5344 27.8097 33.4724 27.7764 37.7784V37.8487C27.7966 40.4867 27.6513 44.1755 27.3975 47.4747C27.3951 47.5093 27.3927 47.5426 27.3903 47.5772C27.3355 48.5768 27.1663 50.5344 26.9447 51.5246C26.9424 51.5341 26.9412 51.5424 26.9388 51.552C26.4705 53.7109 25.235 54.8607 24.5224 54.8607C24.5058 54.8607 24.4891 54.8607 24.4724 54.8595C22.3968 54.6308 20.2164 54.0648 17.8085 53.1307C15.3171 52.1501 13.033 50.9515 10.8264 49.4657C9.69327 48.6745 8.45651 47.1626 7.43064 45.3134C6.32137 43.3129 5.56359 41.1229 5.2967 39.1475C5.2967 39.1427 5.29551 39.1379 5.29431 39.1332C5.16921 38.2336 5.02623 36.7073 4.90232 34.9463C4.90112 34.9248 4.89874 34.9046 4.89755 34.8831C4.64019 31.8556 4.50674 28.8495 4.52938 26.6357C4.52938 26.6035 4.52938 26.5726 4.52938 26.5404C4.48053 21.8293 5.11202 15.0712 5.56121 12.8145C5.5624 12.8074 5.56359 12.8002 5.56478 12.7943C5.83882 11.3883 6.58945 9.91206 7.67966 8.63956C7.72851 8.58356 7.77498 8.52518 7.82145 8.46679C7.92272 8.45488 8.07166 8.44415 8.27779 8.44415C10.0114 8.44415 12.4301 9.13879 13.2201 9.40687C13.649 9.55462 14.0815 9.71308 14.5069 9.8787C16.9982 10.8593 19.2799 12.0567 21.483 13.5401L21.4842 13.5389Z"
                fill="currentColor"
              />
            </svg>
          }
          onClick={() => setIsLogoutModalOpen(true)}
        >
          Logout
        </Button>
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
          <Group gap="right">
            <Button
              variant="subtle"
              onClick={() => setIsLogoutModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              color="red"
              loading={isLoggingOut}
              onClick={async () => {
                setIsLoggingOut(true);
                try {
                  // Clear doctor Zustand store
                  logout();
                  // Clear sidebar store
                  setSidebar(null);

                  await apis.Logout({ isLocalStorageClear: true });

                  navigate("/doctor-login");
                } catch (error) {
                  console.error("Logout error:", error);
                } finally {
                  setIsLoggingOut(false);
                  setIsLogoutModalOpen(false);
                }
              }}
            >
              Logout
            </Button>
          </Group>
        </Modal>
      </div>
    </aside>
  );
};

export default DoctorSideBar;
