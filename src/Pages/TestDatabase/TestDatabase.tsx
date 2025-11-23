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
              order: Number(test.order) || 0,
              name: test.name,
              shortName: test.short_name,
              category:
                categories.find((c) => c.id === test.category_id)?.name ||
                test.category_id,
              price: test.price || "",
              type: test.type || "",
              optional: test.optional === "1",
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
    // TODO: implement edit drawer
    console.log("edit", row);
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
