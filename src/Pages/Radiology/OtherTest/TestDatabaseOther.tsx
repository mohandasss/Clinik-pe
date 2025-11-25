import React, { useEffect, useMemo, useState } from "react";
import FilterBar from "../../TestDatabase/Components/FilterBar";
import OtherTestTable from "./OtherTestTable";
import ConfirmDeleteModal from "./ConfirmDeleteModal";
import type { OtherTestRow } from "./OtherTestTable";
import apis from "../../../APis/Api";
import { notifications } from "@mantine/notifications";
import useAuthStore from "../../../GlobalStore/store";
import { useNavigate } from "react-router-dom";

const TestDatabaseOther: React.FC = () => {
  const [categories, setCategories] = useState<
    {
      id: string;
      name: string;
    }[]
  >([]);
  const [tests, setTests] = useState<OtherTestRow[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [deleteModalOpened, setDeleteModalOpened] = useState(false);
  const [selectedRowForDelete, setSelectedRowForDelete] =
    useState<OtherTestRow | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const organizationId = useAuthStore(
    (s) => s.organizationDetails?.organization_id ?? ""
  );
  const centerId = useAuthStore((s) => s.organizationDetails?.center_id ?? "");
  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      try {
        const resp = await apis.GetOtherTestDatabase(
          "radiology",
          1,
          5,
          organizationId,
          centerId,
          ""
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

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      try {
        const resp = await apis.GetOtherTestDatabase(
          "radiology",
          page,
          pageSize,
          organizationId,
          centerId,
          query
        );
        console.log("GetOtherTestDatabase response (radiology):", resp);
        if (mounted && resp?.data?.tests && Array.isArray(resp.data.tests)) {
          const testRows: OtherTestRow[] = resp.data.tests.map((test: any) => ({
            id: test.uid,
            order: Number(test.id) || 0,
            name: test.name,
            description: test.description,
            category: test.category_id,
            price: test.price,
            status: test.status,
          }));
          setTests(testRows);
        }
      } catch (err) {
        console.warn("GetOtherTestDatabase failed:", err);
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
  }, [organizationId, centerId, query, page, pageSize]);

  const filtered = useMemo(() => {
    let data = tests;
    if (category) data = data.filter((t) => t.category === category);
    if (query) {
      const q = query.toLowerCase();
      data = data.filter(
        (t) =>
          t.name.toLowerCase().includes(q) ||
          (t.description || "").toLowerCase().includes(q)
      );
    }
    return data;
  }, [tests, category, query]);

  const total = filtered.length;
  const rows = filtered.slice((page - 1) * pageSize, page * pageSize);

  const navigate = useNavigate();

  const handleEdit = (row: OtherTestRow) => {
    console.log("edit radiology", row);
    navigate("/radiology/test-database/add", {
      state: {
        isEdit: true,
        testData: row,
      },
    });
  };

  const handleView = (row: OtherTestRow) => {
    console.log("view radiology", row);
    navigate(`/radiology/test-database/details/${row.id}`, {
      state: {
        testId: row.id,
      },
    });
  };

  const handleDelete = (row: OtherTestRow) => {
    setSelectedRowForDelete(row);
    setDeleteModalOpened(true);
  };

  const confirmDelete = async () => {
    if (!selectedRowForDelete) return;

    setDeleteLoading(true);
    try {
      const response = await apis.DeleteOtherTestDatabase(
        organizationId,
        centerId,
        "radiology",
        selectedRowForDelete.id
      );

      if (response?.success) {
        notifications.show({
          title: "Success",
          message: "Test deleted successfully",
          color: "green",
        });
        // Refresh the data by triggering the useEffect
        setTests((prev) =>
          prev.filter((test) => test.id !== selectedRowForDelete.id)
        );
        setDeleteModalOpened(false);
        setSelectedRowForDelete(null);
      } else {
        notifications.show({
          title: "Error",
          message: response?.message || "Failed to delete test",
          color: "red",
        });
      }
    } catch (err) {
      console.error("DeleteOtherTestDatabase failed:", err);
      notifications.show({
        title: "Error",
        message: "Failed to delete test",
        color: "red",
      });
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleAdd = () => {
    // navigate to radiology add page
    navigate("/radiology/test-database/add");
  };

  // We no longer use the AddTestTypeModal for radiology; direct navigation is used.

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 ring-1 ring-gray-100">
      <div className="flex items-center justify-between mb-4">
        <div className="flex gap-4 items-center flex-1">
          <h2 className="text-lg font-semibold text-gray-800">
            Radiology Test database
          </h2>
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

        {/* Using direct Add Page instead of modal for Radiology */}
      </div>

      <OtherTestTable
        records={rows}
        page={page}
        pageSize={pageSize}
        setPage={setPage}
        setPageSize={setPageSize}
        total={total}
        onEdit={handleEdit}
        onView={handleView}
        onDelete={handleDelete}
      />

      <ConfirmDeleteModal
        opened={deleteModalOpened}
        onClose={() => {
          setDeleteModalOpened(false);
          setSelectedRowForDelete(null);
        }}
        onConfirm={confirmDelete}
        title="Delete Test"
        message={`Are you sure you want to delete "${selectedRowForDelete?.name}"? This action cannot be undone.`}
        loading={deleteLoading}
      />
    </div>
  );
};

export default TestDatabaseOther;
