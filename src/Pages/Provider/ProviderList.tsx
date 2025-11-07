import React from "react";
import ProviderTable from "./Components/ProviderTable";
import { IconCheck, IconX } from "@tabler/icons-react";
import StatCard from "../Organization/Components/StatCard";

const Provider = () => {
  return (
    <div className="  space-y-6 p-0">
      <div className="flex gap-4">
        <StatCard
          title="Total Providers"
          value={"187"}
          delta={"12%"}
          deltaType="positive"
        />

        <StatCard
          title="Active Providers"
          value={"654"}
          delta={"8%"}
          deltaType="positive"
          icon={<IconCheck className="text-green-600" />}
        />

        <StatCard
          title="Inactive Providers"
          value={"785"}
          delta={"3%"}
          deltaType="negative"
          icon={<IconX className="text-red-500" />}
        />
      </div>
      {/* Clinic Table */}
      <ProviderTable />
    </div>
  );
};

export default Provider;
