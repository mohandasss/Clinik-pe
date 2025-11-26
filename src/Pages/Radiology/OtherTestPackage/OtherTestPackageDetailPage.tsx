import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, Badge, Loader, Button } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { IconArrowLeft } from "@tabler/icons-react";

import apis from "../../../APis/Api";
import useAuthStore from "../../../GlobalStore/store";
import type { PackageDetailsResponse } from "../../../APis/Types";

const OtherTestPackageDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { organizationDetails } = useAuthStore();

  const [loading, setLoading] = useState(true);
  const [packageData, setPackageData] = useState<
    PackageDetailsResponse["data"]["package"] | null
  >(null);

  useEffect(() => {
    const fetchPackageDetails = async () => {
      console.log("Fetching package details for id:", id);
      console.log("Organization ID:", organizationDetails?.organization_id);
      console.log("Center ID:", organizationDetails?.center_id);

      if (
        !id ||
        !organizationDetails?.organization_id ||
        !organizationDetails?.center_id
      ) {
        console.log("Missing required data, skipping fetch");
        return;
      }

      try {
        setLoading(true);
        const response = await apis.GetOtherTestPackageById(
          "radiology",
          organizationDetails.organization_id,
          organizationDetails.center_id,
          id
        );

        console.log("API Response:", response);

        if (response?.data?.package) {
          setPackageData(response.data.package);
        }
      } catch (err: any) {
        notifications.show({
          title: "Error",
          message: err?.message || "Failed to load package details",
          color: "red",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchPackageDetails();
  }, [id, organizationDetails]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader size="lg" />
      </div>
    );
  }

  if (!packageData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-gray-500 mb-4">Package not found</p>
          <Button onClick={() => navigate("/radiology/test-packages")}>
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="mb-6">
        <Button
          variant="subtle"
          leftSection={<IconArrowLeft size={16} />}
          onClick={() => navigate("/radiology/test-packages")}
          className="mb-4"
        >
          Back to Packages
        </Button>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {packageData.name}
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Package ID: {packageData.uid}
            </p>
          </div>
          <Badge
            color={packageData.status === "active" ? "green" : "red"}
            size="lg"
            className="capitalize"
          >
            {packageData.status}
          </Badge>
        </div>
      </div>

      {/* Main Info Card */}
      <Card shadow="sm" padding="lg" radius="md" className="mb-6">
        <h2 className="text-lg font-semibold mb-4">Package Information</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500">Department</p>
            <p className="font-medium">{packageData.department_name}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Price</p>
            <p className="font-medium text-lg">₹{packageData.price}</p>
          </div>
          <div className="col-span-2">
            <p className="text-sm text-gray-500">Description</p>
            <p className="font-medium">
              {packageData.description || "No description provided"}
            </p>
          </div>
          {packageData.data && (
            <div className="col-span-2">
              <p className="text-sm text-gray-500">Additional Data</p>
              <p className="font-medium">{packageData.data}</p>
            </div>
          )}
        </div>
      </Card>

      {/* Tests Card */}
      <Card shadow="sm" padding="lg" radius="md" className="mb-6">
        <h2 className="text-lg font-semibold mb-4">
          Tests ({packageData.tests.length})
        </h2>
        {packageData.tests.length > 0 ? (
          <div className="space-y-2">
            {packageData.tests.map((test, index) => (
              <div
                key={test.test_id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-gray-500">
                    {index + 1}.
                  </span>
                  <span className="font-medium">{test.test_name}</span>
                </div>
                <span className="text-xs text-gray-500">{test.test_id}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-4">No tests added</p>
        )}
      </Card>

      {/* Panels Card */}
      <Card shadow="sm" padding="lg" radius="md">
        <h2 className="text-lg font-semibold mb-4">
          Panels ({packageData.panels.length})
        </h2>
        {packageData.panels.length > 0 ? (
          <div className="space-y-2">
            {packageData.panels.map((panel, index) => (
              <div
                key={panel.panel_id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-gray-500">
                    {index + 1}.
                  </span>
                  <span className="font-medium">{panel.panel_name}</span>
                </div>
                <span className="text-xs text-gray-500">{panel.panel_id}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-4">No panels added</p>
        )}
      </Card>
    </div>
  );
};

export default OtherTestPackageDetailPage;
