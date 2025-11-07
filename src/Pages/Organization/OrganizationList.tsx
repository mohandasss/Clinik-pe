import React from "react";
import StatCard from "./Components/StatCard";
import { IconCheck, IconX } from "@tabler/icons-react";
import OrganizationTable from "./Components/OrganizationTable";

const OrganizationList: React.FC = () => {
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
      <OrganizationTable />
    </div>
  );
};

export default OrganizationList;
