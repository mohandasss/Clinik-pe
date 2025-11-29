import React, { useEffect, useMemo, useState } from "react";
import FilterBar from "./Components/FilterBar";
import TestTable from "./Components/TestTable";
import type { TestRow } from "./Components/TestTable";
import apis from "../../APis/Api";
import { notifications } from "@mantine/notifications";
import useAuthStore from "../../GlobalStore/store";
import AddTestTypeModal from "./Components/AddTestTypeModal";
import { useNavigate } from "react-router-dom";
import type { LabTest } from "../../APis/Types";

// Helper function to parse tags string like "organ=heart;kidney,top_rated"
const parseTagsString = (tagString: string): Record<string, any> => {
  const tags: Record<string, any> = {
    organ: [],
    top_rated: false,
    top_selling: false,
  };

  if (!tagString) return tags;

  const parts = tagString.split(",");
  parts.forEach((part) => {
    const trimmed = part.trim();
    if (trimmed.startsWith("organ=")) {
      const organs = trimmed.replace("organ=", "").split(";");
      tags.organ = organs.map((o) => o.trim()).filter(Boolean);
    } else if (trimmed === "top_rated") {
      tags.top_rated = true;
    } else if (trimmed === "top_selling") {
      tags.top_selling = true;
    }
  });

  return tags;
};

const TestDatabase: React.FC = () => {
  const [categories, setCategories] = useState<{ id: string; name: string }[]>(
    []
  );
  const [tests, setTests] = useState<TestRow[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const organizationId = useAuthStore(
    (s) => s.organizationDetails?.organization_id ?? ""
  );
  const centerId = useAuthStore((s) => s.organizationDetails?.center_id ?? "");

  // Load categories
  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      try {
        const resp = await apis.GetTestCategories(
          organizationId,
          centerId,
          undefined,
          1,
          100
        );
        if (mounted && resp?.success && resp?.data?.categorys) {
          const catList = resp.data.categorys.map((c) => ({
            id: c.uid,
            name: c.name,
          }));
          setCategories(catList);
        }
      } catch (err) {
        console.warn("GetTestCategories failed:", err);
        notifications.show({
          title: "Error",
          message: "Failed to load test categories",
          color: "red",
        });
        setCategories([]);
      } finally {
        setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [organizationId, centerId]);

  // Load tests
  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      try {
        const resp = await apis.GetAllTestsList(
          query,
          page,
          pageSize,
          organizationId,
          centerId
        );
        console.log("GetAllTestsList response:", resp);
        // @ts-expect-error: allow data
        if (mounted && resp.data.tests && Array.isArray(resp.data.tests)) {
          // @ts-expect-error: allow data
          const testRows: TestRow[] = (resp.data.tests as LabTest[]).map(
            (test) => ({
              id: test.uid,
              name: test.name,
              shortName: test.short_name,
              displayName: test.display_name || "",
              category:
                categories.find((c) => c.id === test.category_id)?.name ||
                test.category_id,
              categoryId: test.category_id || "",
              displayCategoryId: test.display_category_id || "",
              price: test.price || "",
              mrp: test.mrp || "",
              type: test.type || "",
              sampleType: test.sample_type || "",
              gender: test.gender || "",
              optional: test.optional === "1",
              homeCollection: test.home_collection_possible === "1",
              // Additional fields for edit
              unitId: test.unit_id || "",
              inputType: test.input_type || "",
              defaultResult: test.default_result || "",
              method: test.method || "",
              instrument: test.instrument || "",
              interpretation: test.interpretation || "",
              notes: test.notes || "",
              comments: test.comments || "",
              // Display tab fields
              shortAbout: test.short_about || "",
              longAbout: test.long_about || "",
              ageRange: test.age_range || "",
              preparation: test.preparation || "",
              faq: test.faq || "",
              homeCollectionFee: test.home_collection_fee || "",
              machineBased: test.machine_based === "1",
              tags: test.tags
                ? typeof test.tags === "string"
                  ? parseTagsString(test.tags)
                  : test.tags
                : {},
              images: test.images
                ? typeof test.images === "string"
                  ? JSON.parse(test.images)
                  : test.images
                : [],
            })
          );
          setTests(testRows);
        }
      } catch (err) {
        console.warn("GetAllTestsList failed:", err);
        notifications.show({
          title: "Error",
          message: "Failed to load tests",
          color: "red",
        });
        setTests([]);
      } finally {
        setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [organizationId, centerId, query, page, pageSize, categories]);

  const filtered = useMemo(() => {
    let data = tests;
    if (category) data = data.filter((t) => t.category === category);
    if (query) {
      const q = query.toLowerCase();
      data = data.filter(
        (t) =>
          t.name.toLowerCase().includes(q) ||
          (t.shortName || "").toLowerCase().includes(q)
      );
    }
    return data;
  }, [tests, category, query]);

  const total = filtered.length;
  const rows = filtered.slice((page - 1) * pageSize, page * pageSize);

  const handleEdit = (row: TestRow) => {
    // Navigate to appropriate edit page based on test type
    if (row.type === "single") {
      navigate("/test-database/edit", { state: { row } });
    } else if (row.type === "multiple") {
      navigate("/test-database/edit-multiple", { state: { row } });
    } else if (row.type === "nested") {
      navigate("/test-database/edit-nested", { state: { row } });
    } else if (row.type === "document") {
      navigate("/test-database/edit-document", { state: { row } });
    } else {
      // Default to single type edit if type is unknown
      navigate("/test-database/edit", { state: { row } });
    }
  };

  const handleView = (row: TestRow) => {
    // TODO: implement view modal
    console.log("view", row);
  };

  const [isAddTypeModalOpen, setIsAddTypeModalOpen] = useState(false);
  const navigate = useNavigate();

  const handleAdd = () => {
    setIsAddTypeModalOpen(true);
  };

  const handleAddTypeSelect = (
    type: "single" | "multiple" | "nested" | "document"
  ) => {
    if (type === "single") {
      // navigate to add page for single parameter tests
      navigate("/test-database/add");
    } else if (type === "multiple") {
      // navigate to add page for multiple parameter tests
      navigate("/test-database/add-multiple");
    } else if (type === "nested") {
      // navigate to add page for nested parameter tests
      navigate("/test-database/add-nested");
    } else if (type === "document") {
      // navigate to add document test page (document type)
      navigate("/test-database/add-document");
    } else {
      // for now, just show the current behavior — you can expand these later
      console.log("Selected type", type);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 ring-1 ring-gray-100">
      <div className="flex items-center justify-between mb-4">
        <div className="flex gap-4 items-center flex-1">
          <h2 className="text-lg font-semibold text-gray-800">Test database</h2>
        </div>
        <FilterBar
          categories={categories}
          selectedCategory={category}
          onCategoryChange={(val) => {
            setCategory(val || null);
            setPage(1);
          }}
          query={query}
          onQueryChange={(q) => {
            setQuery(q);
            setPage(1);
          }}
          onAddNew={handleAdd}
          disabled={loading}
        />

        <AddTestTypeModal
          opened={isAddTypeModalOpen}
          onClose={() => setIsAddTypeModalOpen(false)}
          onSelect={handleAddTypeSelect}
        />
      </div>

      <TestTable
        records={rows}
        page={page}
        pageSize={pageSize}
        setPage={setPage}
        setPageSize={setPageSize}
        total={total}
        onEdit={handleEdit}
        onView={handleView}
      />
    </div>
  );
};

export default TestDatabase;
