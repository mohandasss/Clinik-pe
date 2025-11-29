import React, { useEffect, useState } from "react";
import { Paper, Text, Badge, Grid, Button, Skeleton } from "@mantine/core";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import { notifications } from "@mantine/notifications";
import useAuthStore from "../../../GlobalStore/store";
import apis from "../../../APis/Api";
import { IconArrowLeft } from "@tabler/icons-react";
import { Anchor } from "@mantine/core";

interface TestDetails {
  id: string;
  uid: string;
  name: string;
  description: string;
  price: string;
  status: string;
  data: string;
  department_id: string;
  category_id: string;
  created_at: string;
  created_by: string;
  updated_at: string;
  updated_by: string;
  central_account_id: string;
  organization_id: string;
  center_id: string;
  // Display fields
  tags?: string;
  display_name?: string;
  display_category_id?: string;
  short_about?: string;
  long_about?: string;
  sample_type?: string;
  gender?: string;
  age_range?: string;
  images?: any[];
  preparation?: string;
  mrp?: string;
  faq?: string;
  home_collection_possible?: string | boolean;
  home_collection_fee?: string;
  machine_based?: string | boolean;
}

interface LocationState {
  testId?: string;
}

const OtherTestDatabaseDetails: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams();
  const state = location.state as LocationState | null;

  // Check both URL params and location state for testId
  const testId = params.id || state?.testId;

  const organizationId = useAuthStore(
    (s) => s.organizationDetails?.organization_id ?? ""
  );
  const centerId = useAuthStore((s) => s.organizationDetails?.center_id ?? "");

  const [testDetails, setTestDetails] = useState<TestDetails | null>(null);
  const [loading, setLoading] = useState(true);

  // Helper function to parse tags in various formats
  const parseTags = (tagsData: any) => {
    let organs: string[] = [];
    let topRated = false;
    let topSelling = false;

    if (!tagsData) return { organs, topRated, topSelling };

    // Handle JSON string format
    if (typeof tagsData === "string") {
      // Try JSON parsing first
      try {
        const tagsObj = JSON.parse(tagsData);
        organs = Array.isArray(tagsObj.organ) ? tagsObj.organ : [];
        topRated = tagsObj.top_rated === true || tagsObj.top_rated === "1";
        topSelling =
          tagsObj.top_selling === true || tagsObj.top_selling === "1";
        return { organs, topRated, topSelling };
      } catch {
        // Not JSON, try custom format
      }

      // Handle custom string format like "organ=heart,top_rated"
      const parts = tagsData.split(",");
      for (const part of parts) {
        const trimmed = part.trim();
        if (trimmed.startsWith("organ=")) {
          const organ = trimmed.substring(6).trim();
          if (organ) organs.push(organ);
        } else if (trimmed === "top_rated") {
          topRated = true;
        } else if (trimmed === "top_selling") {
          topSelling = true;
        }
      }
    } else if (typeof tagsData === "object") {
      // Handle object format
      organs = Array.isArray(tagsData.organ) ? tagsData.organ : [];
      topRated = tagsData.top_rated === true || tagsData.top_rated === "1";
      topSelling =
        tagsData.top_selling === true || tagsData.top_selling === "1";
    }

    return { organs, topRated, topSelling };
  };

  useEffect(() => {
    if (!testId) {
      notifications.show({
        title: "Error",
        message: "Test ID is required to view details",
        color: "red",
      });
      navigate(-1);
      return;
    }

    let mounted = true;
    (async () => {
      setLoading(true);
      try {
        const resp = await apis.GetOtherTestDatabaseDetails(
          "radiology",
          testId,
          organizationId,
          centerId
        );

        if (resp?.success && resp?.data?.test_details) {
          setTestDetails(resp.data.test_details);
        } else {
          notifications.show({
            title: "Error",
            message: resp?.message || "Failed to load test details",
            color: "red",
          });
          navigate(-1);
        }
      } catch (err) {
        console.error("GetOtherTestDatabaseDetails failed:", err);
        notifications.show({
          title: "Error",
          message: "Failed to load test details",
          color: "red",
        });
        navigate(-1);
      } finally {
        setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [testId, organizationId, centerId, navigate]);

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "active":
        return "green";
      case "inactive":
        return "red";
      case "pending":
        return "yellow";
      default:
        return "gray";
    }
  };

  if (loading) {
    return (
      <div className="p-0">
        <div className="mb-4">
          <Skeleton height={40} width={200} radius="md" />
        </div>
        <div className="mb-6">
          <Skeleton height={32} width={300} radius="md" mb="xs" />
          <Skeleton height={16} width={400} radius="md" />
        </div>
        <Paper withBorder radius="md" className="p-6">
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} height={40} radius="md" />
            ))}
          </div>
        </Paper>
      </div>
    );
  }

  if (!testDetails) {
    return (
      <div className="p-0">
        <Anchor
          component="button"
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 px-3 py-1 text-blue-600 text-sm hover:bg-blue-50 rounded-md"
        >
          <IconArrowLeft size={16} />
          <Text size="sm" fw={600}>
            Back
          </Text>
        </Anchor>
        <div className="text-center mt-8">
          <Text c="dimmed">Test details not found</Text>
        </div>
      </div>
    );
  }

  return (
    <div className="p-0">
      <div className="mb-4">
        <Anchor
          component="button"
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 px-3 py-1 text-blue-600 text-sm hover:bg-blue-50 rounded-md"
        >
          <IconArrowLeft size={16} />
          <Text size="sm" fw={600}>
            Back to Radiology Tests
          </Text>
        </Anchor>
      </div>

      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">
          Test Details
        </h2>
        <p className="text-sm text-gray-600">
          View complete information about this radiology test
        </p>
      </div>

      <Paper withBorder radius="md" className="p-6">
        {/* Header Section */}
        <div className="mb-6 pb-6 border-b border-gray-200">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-xl font-semibold text-gray-900">
                {testDetails.name}
              </h3>
              <Text size="sm" c="dimmed" className="mt-1">
                ID: {testDetails.uid}
              </Text>
            </div>
            <Badge
              color={getStatusColor(testDetails.status)}
              size="lg"
              variant="light"
              className="capitalize"
            >
              {testDetails.status}
            </Badge>
          </div>
        </div>

        {/* Details Grid */}
        <Grid mb="lg">
          <Grid.Col span={{ base: 12, sm: 6 }}>
            <div className="mb-6">
              <Text size="sm" fw={600} c="dimmed" mb="xs">
                DESCRIPTION
              </Text>
              <Text size="sm" className="text-gray-900">
                {testDetails.description || "-"}
              </Text>
            </div>
          </Grid.Col>

          <Grid.Col span={{ base: 12, sm: 6 }}>
            <div className="mb-6">
              <Text size="sm" fw={600} c="dimmed" mb="xs">
                PRICE
              </Text>
              <Text size="sm" className="text-gray-900 font-semibold">
                PKR {testDetails.price}
              </Text>
            </div>
          </Grid.Col>

          <Grid.Col span={{ base: 12, sm: 6 }}>
            <div className="mb-6">
              <Text size="sm" fw={600} c="dimmed" mb="xs">
                CATEGORY ID
              </Text>
              <Text size="sm" className="text-gray-900">
                {testDetails.category_id || "-"}
              </Text>
            </div>
          </Grid.Col>

          <Grid.Col span={{ base: 12, sm: 6 }}>
            <div className="mb-6">
              <Text size="sm" fw={600} c="dimmed" mb="xs">
                DEPARTMENT ID
              </Text>
              <Text size="sm" className="text-gray-900">
                {testDetails.department_id || "-"}
              </Text>
            </div>
          </Grid.Col>

          <Grid.Col span={{ base: 12 }}>
            <div className="mb-6">
              <Text size="sm" fw={600} c="dimmed" mb="xs">
                TEST DATA
              </Text>
              <div className="bg-gray-50 p-3 rounded-md border border-gray-200">
                <Text size="sm" className="text-gray-900 font-mono">
                  {testDetails.data || "-"}
                </Text>
              </div>
            </div>
          </Grid.Col>
        </Grid>

        {/* Display Information Section */}
        {(testDetails.display_name ||
          testDetails.short_about ||
          testDetails.long_about ||
          testDetails.tags ||
          testDetails.sample_type ||
          testDetails.gender ||
          testDetails.age_range ||
          testDetails.preparation ||
          testDetails.mrp ||
          testDetails.faq ||
          testDetails.home_collection_possible ||
          testDetails.machine_based) && (
          <>
            <div className="mt-6 pt-6 border-t border-gray-200">
              <h4 className="text-lg font-semibold text-gray-900 mb-6">
                Display Information
              </h4>
            </div>

            <Grid mb="lg">
              {testDetails.display_name && (
                <Grid.Col span={{ base: 12, sm: 6 }}>
                  <div className="mb-6">
                    <Text size="sm" fw={600} c="dimmed" mb="xs">
                      Display Name
                    </Text>
                    <Text size="sm" className="text-gray-900">
                      {testDetails.display_name}
                    </Text>
                  </div>
                </Grid.Col>
              )}

              {testDetails.display_category_id && (
                <Grid.Col span={{ base: 12, sm: 6 }}>
                  <div className="mb-6">
                    <Text size="sm" fw={600} c="dimmed" mb="xs">
                      Display Category ID
                    </Text>
                    <Text size="sm" className="text-gray-900">
                      {testDetails.display_category_id}
                    </Text>
                  </div>
                </Grid.Col>
              )}

              {testDetails.short_about && (
                <Grid.Col span={{ base: 12, sm: 6 }}>
                  <div className="mb-6">
                    <Text size="sm" fw={600} c="dimmed" mb="xs">
                      Short About
                    </Text>
                    <Text size="sm" className="text-gray-900">
                      {testDetails.short_about}
                    </Text>
                  </div>
                </Grid.Col>
              )}

              {testDetails.sample_type && (
                <Grid.Col span={{ base: 12, sm: 6 }}>
                  <div className="mb-6">
                    <Text size="sm" fw={600} c="dimmed" mb="xs">
                      Sample Type
                    </Text>
                    <Text size="sm" className="text-gray-900">
                      {testDetails.sample_type}
                    </Text>
                  </div>
                </Grid.Col>
              )}

              {testDetails.gender && (
                <Grid.Col span={{ base: 12, sm: 6 }}>
                  <div className="mb-6">
                    <Text size="sm" fw={600} c="dimmed" mb="xs">
                      Gender
                    </Text>
                    <Text size="sm" className="text-gray-900 capitalize">
                      {testDetails.gender}
                    </Text>
                  </div>
                </Grid.Col>
              )}

              {testDetails.age_range && (
                <Grid.Col span={{ base: 12, sm: 6 }}>
                  <div className="mb-6">
                    <Text size="sm" fw={600} c="dimmed" mb="xs">
                      Age Range
                    </Text>
                    <Text size="sm" className="text-gray-900">
                      {testDetails.age_range}
                    </Text>
                  </div>
                </Grid.Col>
              )}

              {testDetails.preparation && (
                <Grid.Col span={{ base: 12, sm: 6 }}>
                  <div className="mb-6">
                    <Text size="sm" fw={600} c="dimmed" mb="xs">
                      Preparation
                    </Text>
                    <Text size="sm" className="text-gray-900">
                      {testDetails.preparation}
                    </Text>
                  </div>
                </Grid.Col>
              )}

              {testDetails.mrp && (
                <Grid.Col span={{ base: 12, sm: 6 }}>
                  <div className="mb-6">
                    <Text size="sm" fw={600} c="dimmed" mb="xs">
                      MRP
                    </Text>
                    <Text size="sm" className="text-gray-900 font-semibold">
                      PKR {testDetails.mrp}
                    </Text>
                  </div>
                </Grid.Col>
              )}

              {testDetails.long_about && (
                <Grid.Col span={{ base: 12 }}>
                  <div className="mb-6">
                    <Text size="sm" fw={600} c="dimmed" mb="xs">
                      Long About
                    </Text>
                    <div
                      className="bg-gray-50 p-3 rounded-md border border-gray-200 text-gray-900 text-sm"
                      dangerouslySetInnerHTML={{
                        __html: testDetails.long_about,
                      }}
                    />
                  </div>
                </Grid.Col>
              )}

              {testDetails.tags && (
                <Grid.Col span={{ base: 12 }}>
                  <div className="mb-6">
                    <Text size="sm" fw={600} c="dimmed" mb="xs">
                      Tags
                    </Text>
                    <div className="space-y-3">
                      {(() => {
                        const { organs, topRated, topSelling } = parseTags(
                          testDetails.tags
                        );
                        return (
                          <>
                            {organs.length > 0 && (
                              <div>
                                <Text size="xs" fw={600} c="dimmed" mb="xs">
                                  Organs:
                                </Text>
                                <div className="flex flex-wrap gap-2">
                                  {organs.map((organ, idx) => (
                                    <Badge key={idx} variant="light">
                                      {organ}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            )}
                            <div className="flex items-center gap-4">
                              {topRated && (
                                <Badge color="green" variant="light">
                                  ⭐ Top Rated
                                </Badge>
                              )}
                              {topSelling && (
                                <Badge color="blue" variant="light">
                                  🔥 Top Selling
                                </Badge>
                              )}
                            </div>
                          </>
                        );
                      })()}
                    </div>
                  </div>
                </Grid.Col>
              )}

              {testDetails.faq && (
                <Grid.Col span={{ base: 12 }}>
                  <div className="mb-6">
                    <Text size="sm" fw={600} c="dimmed" mb="xs">
                      FAQs
                    </Text>
                    <div className="space-y-3">
                      {(() => {
                        try {
                          const faqs = JSON.parse(testDetails.faq);
                          if (Array.isArray(faqs)) {
                            return faqs.map((faq, idx) => (
                              <div
                                key={idx}
                                className="bg-gray-50 p-3 rounded-md border border-gray-200"
                              >
                                <Text
                                  size="sm"
                                  fw={600}
                                  className="text-gray-900 mb-1"
                                >
                                  Q: {faq.question}
                                </Text>
                                <Text size="sm" className="text-gray-700">
                                  A: {faq.answer}
                                </Text>
                              </div>
                            ));
                          }
                        } catch {
                          return null;
                        }
                      })()}
                    </div>
                  </div>
                </Grid.Col>
              )}

              <Grid.Col span={{ base: 12 }}>
                <div className="flex items-center gap-6">
                  {testDetails.home_collection_possible && (
                    <div className="mb-6">
                      <Text size="sm" fw={600} c="dimmed" mb="xs">
                        Home Collection Possible
                      </Text>
                      <Badge
                        color={
                          testDetails.home_collection_possible === "1" ||
                          testDetails.home_collection_possible === true
                            ? "green"
                            : "red"
                        }
                      >
                        {testDetails.home_collection_possible === "1" ||
                        testDetails.home_collection_possible === true
                          ? "Yes"
                          : "No"}
                      </Badge>
                    </div>
                  )}

                  {testDetails.home_collection_fee && (
                    <div className="mb-6">
                      <Text size="sm" fw={600} c="dimmed" mb="xs">
                        Home Collection Fee
                      </Text>
                      <Text size="sm" className="text-gray-900 font-semibold">
                        PKR {testDetails.home_collection_fee}
                      </Text>
                    </div>
                  )}

                  {testDetails.machine_based && (
                    <div className="mb-6">
                      <Text size="sm" fw={600} c="dimmed" mb="xs">
                        Machine Based
                      </Text>
                      <Badge
                        color={
                          testDetails.machine_based === "1" ||
                          testDetails.machine_based === true
                            ? "blue"
                            : "gray"
                        }
                      >
                        {testDetails.machine_based === "1" ||
                        testDetails.machine_based === true
                          ? "Yes"
                          : "No"}
                      </Badge>
                    </div>
                  )}
                </div>
              </Grid.Col>
            </Grid>
          </>
        )}

        {/* Metadata Section */}
        <div className="bg-gray-50 p-4 rounded-md border border-gray-200 mb-6">
          <h4 className="text-sm font-semibold text-gray-900 mb-4">METADATA</h4>
          <Grid>
            <Grid.Col span={{ base: 12, sm: 6 }}>
              <div className="mb-3">
                <Text size="xs" fw={600} c="dimmed" mb="xs">
                  Created At
                </Text>
                <Text size="sm" className="text-gray-700">
                  {testDetails.created_at}
                </Text>
              </div>
            </Grid.Col>

            <Grid.Col span={{ base: 12, sm: 6 }}>
              <div className="mb-3">
                <Text size="xs" fw={600} c="dimmed" mb="xs">
                  Updated At
                </Text>
                <Text size="sm" className="text-gray-700">
                  {testDetails.updated_at}
                </Text>
              </div>
            </Grid.Col>

            <Grid.Col span={{ base: 12, sm: 6 }}>
              <div className="mb-3">
                <Text size="xs" fw={600} c="dimmed" mb="xs">
                  Created By
                </Text>
                <Text size="sm" className="text-gray-700">
                  {testDetails.created_by || "-"}
                </Text>
              </div>
            </Grid.Col>

            <Grid.Col span={{ base: 12, sm: 6 }}>
              <div className="mb-3">
                <Text size="xs" fw={600} c="dimmed" mb="xs">
                  Updated By
                </Text>
                <Text size="sm" className="text-gray-700">
                  {testDetails.updated_by || "-"}
                </Text>
              </div>
            </Grid.Col>
          </Grid>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-start gap-3">
          <Button variant="default" onClick={() => navigate(-1)}>
            Close
          </Button>
        </div>
      </Paper>
    </div>
  );
};

export default OtherTestDatabaseDetails;
