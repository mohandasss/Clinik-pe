import React, { useEffect } from "react";
import StatCard from "./Components/StatCard";
import { IconCheck, IconX } from "@tabler/icons-react";
import OrganizationTable from "./Components/OrganizationTable";
import apis from "../../APis/Api";
import type { OrganizationListResponse } from "../../APis/Types";

const OrganizationList: React.FC = () => {
  const [organizations, setOrganizations] =
    React.useState<OrganizationListResponse | null>(null);
  useEffect(() => {
    const fetchOrganizations = async () => {
      try {
        const response = await apis.GetOrganizationsList();
        console.log(response);
        // store full response so we can access both data.organization and pagination
        setOrganizations(response);
      } catch (error) {
        console.error("Error fetching organizations:", error);
      }
    };
    fetchOrganizations();
  }, []);
  return (
    <div className="  space-y-6 p-0">
      <div className="flex gap-4">
        <StatCard
          title="Total Organizations"
          value={"1,247"}
          delta={"12%"}
          deltaType="positive"
        />

        <StatCard
          title="Active Organizations"
          value={"1,089"}
          delta={"8%"}
          deltaType="positive"
          icon={<IconCheck className="text-green-600" />}
        />

        <StatCard
          title="Inactive Organizations"
          value={"158"}
          delta={"3%"}
          deltaType="negative"
          icon={<IconX className="text-red-500" />}
        />
      </div>
      {/* Organization Table */}
      <OrganizationTable
        orgData={organizations?.data?.organization ?? []}
        total={
          organizations?.data?.pagination?.totalRecords ??
          organizations?.data?.organization?.length ??
          0
        }
      />
    </div>
  );
};

export default OrganizationList;
