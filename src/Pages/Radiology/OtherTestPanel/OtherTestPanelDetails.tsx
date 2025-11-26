import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Paper,
  Button,
  Badge,
  Table,
  Text,
  Anchor,
  Loader,
} from "@mantine/core";
import { IconArrowLeft } from "@tabler/icons-react";
import apis from "../../../APis/Api";
import useAuthStore from "../../../GlobalStore/store";
import type { Panel } from "../../../APis/Types";

const OtherTestPanelDetails: React.FC = () => {
  const { id: panelId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const organizationDetails = useAuthStore((s) => s.organizationDetails);

  // State: Data
  const [panelName, setPanelName] = useState<string>("");
  const [panelDescription, setPanelDescription] = useState<string>("");
  const [panelPrice, setPanelPrice] = useState<string>("");
  const [panelStatus, setPanelStatus] = useState<string>("");
  const [tests, setTests] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load panel details
  useEffect(() => {
    if (!panelId) return;

    const loadPanelDetails = async () => {
      setLoading(true);
      try {
        const response = await apis.GetOtherTestPanelById(
          "radiology",
          organizationDetails?.organization_id ?? "",
          organizationDetails?.center_id ?? "",
          panelId
        );

        if (response?.data?.panel) {
          const panel = response.data.panel;
          setPanelName(panel.name);
          setPanelDescription(panel.description);
          setPanelPrice(panel.price);
          setPanelStatus(panel.status);
          setTests(panel.tests || []);
        } else {
          setError("Failed to load panel details");
        }
      } catch (error) {
        console.error("Failed to load panel details:", error);
        setError("Failed to fetch panel details");
      } finally {
        setLoading(false);
      }
    };

    loadPanelDetails();
  }, [
    panelId,
    organizationDetails?.organization_id,
    organizationDetails?.center_id,
  ]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <Anchor
          component="button"
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 px-3 py-1 hover:no-underline rounded-md text-blue-600 text-sm transition-colors duration-150 hover:bg-blue-50 no-underline mb-4"
        >
          <IconArrowLeft size={16} />
          <Text size="sm" fw={600} className="font-medium">
            Back
          </Text>
        </Anchor>
        <div className="text-red-600">{error}</div>
      </div>
    );
  }

  return (
    <div className="flex gap-4 h-full">
      {/* Left Side - Tests Table */}
      <div className="flex-1 bg-white rounded-lg shadow-sm p-6 ring-1 ring-gray-100">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/radiology/test-panels")}
              className="text-gray-600 hover:text-gray-800 transition-colors"
            >
              <IconArrowLeft size={20} />
            </button>
            <h2 className="text-lg font-semibold text-gray-800">
              {panelName || "Panel Details"}
            </h2>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50">
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  S. No.
                </th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Test Name
                </th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Test ID
                </th>
              </tr>
            </thead>
            <tbody>
              {tests.length > 0 ? (
                tests.map((test, idx) => (
                  <tr key={test.uid} className="hover:bg-gray-50">
                    <td className="border-b border-gray-200 px-4 py-3">
                      <span className="text-sm text-gray-600">{idx + 1}.</span>
                    </td>
                    <td className="border-b border-gray-200 px-4 py-3">
                      <div className="font-medium text-gray-900">
                        {test.test_name}
                      </div>
                    </td>
                    <td className="border-b border-gray-200 px-4 py-3">
                      <div className="text-sm text-gray-600">
                        {test.test_id}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={3}
                    className="px-4 py-8 text-center text-gray-500"
                  >
                    No tests assigned
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Right Side - Static Panel Info */}
      <div className="w-80 bg-white rounded-lg shadow-sm p-6 ring-1 ring-gray-100">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Panel Information
        </h3>
        <div className="space-y-4">
          <div>
            <p className="text-sm text-gray-500">Panel Name</p>
            <p className="text-base font-medium text-gray-900">
              {panelName || "—"}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Description</p>
            <p className="text-base font-medium text-gray-900">
              {panelDescription || "—"}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Price</p>
            <p className="text-base font-medium text-gray-900">
              {panelPrice || "—"}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Status</p>
            <Badge
              color={panelStatus === "active" ? "green" : "red"}
              className="mt-1"
            >
              {panelStatus}
            </Badge>
          </div>
          <div>
            <p className="text-sm text-gray-500">Total Tests</p>
            <p className="text-base font-medium text-gray-900">
              {tests.length}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Panel ID</p>
            <p className="text-base font-medium text-gray-900 break-all">
              {panelId || "—"}
            </p>
          </div>
          <div className="pt-4">
            <Button
              onClick={() =>
                navigate("/radiology/test-panels/edit", {
                  state: {
                    row: {
                      id: panelId,
                      uid: panelId,
                      panel_id: panelId,
                      name: panelName,
                      description: panelDescription,
                      price: panelPrice,
                      status: panelStatus,
                      data: "",
                      tests: tests.map((t) => t.test_name),
                    },
                  },
                })
              }
              variant="filled"
              color="blue"
              fullWidth
            >
              Edit Panel
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OtherTestPanelDetails;
