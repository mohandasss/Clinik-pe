import React, { useEffect, useState } from "react";
import ProviderTable from "./Components/ProviderTable";
import { IconCheck, IconX } from "@tabler/icons-react";
import StatCard from "../Organization/Components/StatCard";
import useAuthStore from "../../GlobalStore/store";
import useDropdownStore from "../../GlobalStore/useDropdownStore";
import apis from "../../APis/Api";
import type { Provider } from "../../APis/Types";
import { notifications } from "@mantine/notifications";

const Provider = () => {
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [providers, setProviders] = useState<Provider[]>([]);
  const [totalProviders, setTotalProviders] = useState<number>(0);
  const [pageCount, setPageCount] = useState<number>(1);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
  });
  const statOverAll = "need_stats_overall";
  const organizationDetails = useAuthStore((s) => s.organizationDetails);
  const orgId = organizationDetails?.organization_id ?? "";
  const selectedCenter = useDropdownStore((s) => s.selectedCenter);
  // Prefer currently selected center from dropdown store, fallback to org details
  const centerId =
    selectedCenter?.center_id ?? organizationDetails?.center_id ?? "";
  const pageSize = 5;

  useEffect(() => {
    let mounted = true;
    const fetchProviders = async () => {
      if (!orgId || !centerId) return;
      setLoading(true);
      try {
        const resp = await apis.GetAllProviders(
          statOverAll,
          orgId,
          centerId,
          undefined,
          page,
          pageSize
        );
        console.log("API response for providers:", resp);
        if (!mounted) return;
        const provs = resp.data?.providers ?? [];
        setProviders(provs);
        console.log("Fetched providers:", provs);
        setTotalProviders(
          resp.data?.pagination?.totalRecords ?? provs.length ?? 0
        );
        setPageCount(resp.data?.pagination?.pageCount ?? 1);
        // Set stats from API response
        if (resp.data?.stats) {
          console.log("Provider stats:", resp.data.stats);
          setStats({
            total: parseInt(resp.data.stats.total) || 0,
            active: parseInt(resp.data.stats.active) || 0,
            inactive: resp.data.stats.inactive || 0,
          });
        }
      } catch (err) {
        console.error("Error fetching providers:", err);
        notifications.show({
          title: "Error",
          message: "Failed to load providers",
          color: "red",
        });
        setProviders([]);
        setTotalProviders(0);
        setPageCount(1);
        setStats({ total: 0, active: 0, inactive: 0 });
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchProviders();
    return () => {
      mounted = false;
    };
  }, [orgId, centerId, page, selectedCenter]);
  return (
    <div className="  space-y-6 p-0">
      <div className="flex gap-4">
        <StatCard
          title="Total Providers"
          value={stats.total.toString()}
          delta=""
        />

        <StatCard
          title="Active Providers"
          value={stats.active.toString()}
          delta=""
          icon={<IconCheck className="text-green-600" />}
        />

        <StatCard
          title="Inactive Providers"
          value={stats.inactive.toString()}
          delta=""
          icon={<IconX className="text-red-500" />}
        />
      </div>
      <ProviderTable
        providers={providers}
        loading={loading}
        totalProviders={totalProviders}
        page={page}
        setPage={setPage}
        pageSize={pageSize}
        pageCount={pageCount}
      />
    </div>
  );
};

export default Provider;
