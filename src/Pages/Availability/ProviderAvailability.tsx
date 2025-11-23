import { useState, useEffect, useCallback, useMemo } from "react";
import { notifications } from "@mantine/notifications";
import AvailabilityTable from "./Components/AvailabilityTable";
import AddAvailabilityModal from "./Components/AddAvailabilityModal";
import apis from "../../APis/Api";
import useAuthStore from "../../GlobalStore/store";
import useDropdownStore from "../../GlobalStore/useDropdownStore";
import type {
  DoctorAvailability,
  DoctorAvailabilityRES,
  Provider,
} from "../../APis/Types";

// ============================================================================
// Types
// ============================================================================

type AvailabilityItem = {
  id: string;
  day: string;
  start: string;
  end: string;
  duration: string;
  waitTime: string;
  type: string;
  status: "Active" | "Inactive";
  providerName?: string;
  providerImage?: string;
  providerUid?: string;
};

type OrganizationContext = {
  orgId: string;
  centerId: string;
};

type ApiAvailability = DoctorAvailability | DoctorAvailabilityRES;

// ============================================================================
// Constants
// ============================================================================

const PAGE_SIZE = 5;
const ALL_PROVIDERS_ID = "all";
const DEFAULT_FETCH_LIMIT = 100;

const TIME_RANGE_KEYS = {
  START: ["start", "start_time", "startTime"] as const,
  END: ["end", "end_time", "endTime"] as const,
  INTERVAL: ["time_slot_interval", "timeSlotInterval", "slotInterval"] as const,
};

// ============================================================================
// Utility Functions
// ============================================================================

const getOrganizationContext = (): OrganizationContext | null => {
  const { organizationDetails } = useAuthStore.getState();
  const { selectedCenter } = useDropdownStore.getState();

  const orgId = organizationDetails?.organization_id ?? "";
  const centerId = selectedCenter?.center_id ?? organizationDetails?.center_id ?? "";

  if (!orgId || !centerId) {
    console.warn("Missing organization or center context", { orgId, centerId });
    return null;
  }

  return { orgId, centerId };
};

const normalizeWeekDays = (weekDays: unknown): string => {
  if (Array.isArray(weekDays)) {
    return weekDays.join(", ");
  }
  if (typeof weekDays === "string") {
    return weekDays;
  }
  return "";
};

const extractValueFromObject = (
  obj: unknown,
  keys: readonly string[]
): string => {
  if (typeof obj !== "object" || obj === null) {
    return "";
  }

  const record = obj as Record<string, unknown>;
  
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "string") {
      return value;
    }
  }
  
  return "";
};

const extractStatus = (availability: unknown): "Active" | "Inactive" => {
  const statusVal = (availability as { status?: string })?.status;
  return statusVal?.toLowerCase() === "inactive" ? "Inactive" : "Active";
};

const extractWeekDays = (availability: unknown): string => {
  const weekDaysData = (availability as {
    week_days?: unknown;
    weekDays?: unknown;
  });
  
  return normalizeWeekDays(weekDaysData?.week_days ?? weekDaysData?.weekDays);
};

const extractTimeRange = (availability: unknown) => {
  const timeRanges = ((availability as { timeRanges?: unknown[] })?.timeRanges ??
    (availability as { time_ranges?: unknown[] })?.time_ranges ?? []);
  
  return timeRanges.length > 0 ? timeRanges[0] : null;
};

const extractDuration = (
  timeRange: unknown,
  availability: unknown
): string => {
  const durationFromRange = extractValueFromObject(timeRange, ["duration"]);
  
  if (durationFromRange) {
    return durationFromRange;
  }

  const availData = availability as {
    duration?: string;
    time_slot_interval?: string;
    defaultSlotInterval?: string;
  };
  
  return availData?.duration ?? availData?.time_slot_interval ?? availData?.defaultSlotInterval ?? "";
};

const extractWaitTime = (
  timeRange: unknown,
  availability: unknown
): string => {
  const waitTimeFromRange = extractValueFromObject(timeRange, ["wait_time", "waitTime"]);
  
  if (waitTimeFromRange) {
    return waitTimeFromRange;
  }

  const availData = availability as {
    wait_time?: string;
    waitTime?: string;
  };
  
  return availData?.wait_time ?? availData?.waitTime ?? "0";
};

const extractAppointmentType = (availability: unknown): string => {
  const typeData = (availability as {
    appointment_type?: string;
    appointmentType?: string;
  });
  
  const type = typeData?.appointment_type ?? typeData?.appointmentType ?? "";
  
  if (type === "both") {
    return "Both";
  }
  
  return type;
};

const extractProviderInfo = (availability: unknown) => {
  const providerData = availability as {
    doctor_name?: string;
    doctorName?: string;
    doctor_profile_image?: string;
    doctor_id?: string;
    doctorId?: string;
  };

  return {
    name: providerData?.doctor_name ?? providerData?.doctorName ?? "",
    image: providerData?.doctor_profile_image,
    uid: providerData?.doctor_id ?? providerData?.doctorId ?? undefined,
  };
};

const mapAvailabilityToItem = (
  availability: ApiAvailability,
  index: number
): AvailabilityItem => {
  const uid = (availability as { uid?: string })?.uid ?? `avail-${index}`;
  const status = extractStatus(availability);
  const day = extractWeekDays(availability);
  const timeRange = extractTimeRange(availability);
  
  const start = extractValueFromObject(timeRange, TIME_RANGE_KEYS.START) ||
    (availability as { start_time?: string })?.start_time || "";
  
  const end = extractValueFromObject(timeRange, TIME_RANGE_KEYS.END) ||
    (availability as { end_time?: string })?.end_time || "";
  
  const duration = extractDuration(timeRange, availability);
  const waitTime = extractWaitTime(timeRange, availability);
  const appointmentType = extractAppointmentType(availability);
  const provider = extractProviderInfo(availability);

  return {
    id: String(uid),
    day,
    start,
    end,
    duration: duration ? `${duration} mins` : "",
    waitTime: waitTime ? `${waitTime} mins` : "",
    type: appointmentType,
    status,
    providerName: provider.name,
    providerImage: provider.image,
    providerUid: provider.uid,
  };
};

const showErrorNotification = (message: string) => {
  notifications.show({
    title: "Error",
    message,
    color: "red",
  });
};

// ============================================================================
// Custom Hooks
// ============================================================================

const useProviders = () => {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const fetchProviders = async () => {
      const context = getOrganizationContext();
      
      if (!context) {
        return;
      }

      setIsLoading(true);

      try {
        const response = await apis.GetAllProviders(
          "",
          context.orgId,
          context.centerId,
          undefined,
          1,
          DEFAULT_FETCH_LIMIT
        );
        
        const payload = response as { data?: { providers?: Provider[] } };
        
        if (isMounted) {
          setProviders(payload?.data?.providers ?? []);
        }
      } catch (error) {
        console.error("Failed to fetch providers:", error);
        
        if (isMounted) {
          showErrorNotification("Failed to fetch providers");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchProviders();

    return () => {
      isMounted = false;
    };
  }, []);

  return { providers, isLoading };
};

const useAvailabilities = (providerUid: string | null) => {
  const [items, setItems] = useState<AvailabilityItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchAvailabilities = useCallback(async () => {
    const context = getOrganizationContext();
    
    if (!context) {
      return;
    }

    setIsLoading(true);

    try {
      const providerQuery = providerUid && providerUid !== ALL_PROVIDERS_ID 
        ? providerUid 
        : ALL_PROVIDERS_ID;

      const response = await apis.GetProviderAvailabilities(
        context.orgId,
        context.centerId,
        providerQuery
      );
      
      const payload = response as {
        data?: { availabilities?: ApiAvailability[] };
        availabilities?: ApiAvailability[];
      };
      
      const availabilities = payload?.data?.availabilities ?? payload?.availabilities ?? [];
      const mappedItems = availabilities.map(mapAvailabilityToItem);

      setItems(mappedItems);
    } catch (error) {
      console.error("Failed to fetch availabilities:", error);
      showErrorNotification("Failed to fetch availabilities");
    } finally {
      setIsLoading(false);
    }
  }, [providerUid]);

  useEffect(() => {
    fetchAvailabilities();
  }, [fetchAvailabilities]);

  return { 
    items, 
    isLoading, 
    refetch: fetchAvailabilities 
  };
};

// ============================================================================
// Main Component
// ============================================================================

const ProviderAvailability = () => {
  const [page, setPage] = useState(1);
  const [selectedStatus, setSelectedStatus] = useState<string | undefined>(undefined);
  const [selectedProviderId, setSelectedProviderId] = useState<string | null>(ALL_PROVIDERS_ID);
  const [addModalOpen, setAddModalOpen] = useState(false);

  const { providers, isLoading: providersLoading } = useProviders();
  const {
    items,
    isLoading: availabilitiesLoading,
    refetch,
  } = useAvailabilities(
    selectedProviderId !== ALL_PROVIDERS_ID ? selectedProviderId : null
  );

  const isLoading = providersLoading || availabilitiesLoading;

  const filteredItems = useMemo(() => {
    if (!selectedStatus || selectedStatus === "All Status") {
      return items;
    }
    
    return items.filter((item) => item.status === selectedStatus);
  }, [items, selectedStatus]);

  const handleAddAvailability = useCallback(() => {
    setAddModalOpen(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setAddModalOpen(false);
  }, []);

  const handleSaveAvailability = useCallback(async () => {
    await refetch();
    setAddModalOpen(false);
  }, [refetch]);

  const handleProviderChange = useCallback((providerId: string | null) => {
    setSelectedProviderId(providerId ?? ALL_PROVIDERS_ID);
    setPage(1); // Reset to first page when changing provider
  }, []);

  const handleStatusChange = useCallback((status: string | undefined) => {
    setSelectedStatus(status);
    setPage(1); // Reset to first page when changing status
  }, []);

  return (
    <div className="space-y-6 p-0">
      <AvailabilityTable
        providers={providers}
        selectedProvider={selectedProviderId}
        onProviderChange={handleProviderChange}
        items={filteredItems}
        selectedStatus={selectedStatus}
        onStatusChange={handleStatusChange}
        page={page}
        onPageChange={setPage}
        pageSize={PAGE_SIZE}
        total={filteredItems.length}
        onAdd={handleAddAvailability}
        isLoading={isLoading}
      />

      <AddAvailabilityModal
        opened={addModalOpen}
        onClose={handleCloseModal}
        providers={providers}
        defaultProvider={selectedProviderId === ALL_PROVIDERS_ID ? null : selectedProviderId}
        onSaved={handleSaveAvailability}
      />
    </div>
  );
};

export default ProviderAvailability;