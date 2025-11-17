import React, { useEffect, useMemo, useState } from "react";
import FilterBar from "./Components/FilterBar";
import TestTable from "./Components/TestTable";
import type { TestRow } from "./Components/TestTable";
import apis from "../../APis/Api";
import AddTestTypeModal from "./Components/AddTestTypeModal";
import { useNavigate } from "react-router-dom";

const MOCK_TESTS: TestRow[] = [
  {
    id: "1",
    order: 1,
    name: "Serum Phosphorus",
    shortName: "Phos",
    category: "Biochemistry",
  },
  {
    id: "2",
    order: 2,
    name: "Serum Creatinine",
    shortName: "Creat",
    category: "Biochemistry",
  },
  {
    id: "3",
    order: 3,
    name: "Serum Urea",
    shortName: "Urea",
    category: "Biochemistry",
  },
  {
    id: "4",
    order: 4,
    name: "Fasting Blood Sugar",
    shortName: "FBS",
    category: "Biochemistry",
  },
  {
    id: "5",
    order: 5,
    name: "Blood Sugar PP",
    shortName: "PP",
    category: "Biochemistry",
  },
  {
    id: "6",
    order: 6,
    name: "Serum Bilirubin (Total)",
    shortName: "Bil T",
    category: "Biochemistry",
  },
  {
    id: "7",
    order: 7,
    name: "Serum Bilirubin (Direct)",
    shortName: "Bil D",
    category: "Biochemistry",
  },
];

const TestDatabase: React.FC = () => {
  const [categories, setCategories] = useState<{ id: string; name: string }[]>(
    []
  );
  const [tests] = useState<TestRow[]>(MOCK_TESTS);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      try {
        const resp = await apis.GetTestCategories(undefined, 1, 100);
        if (mounted && resp?.success && resp?.data?.categorys) {
          const catList = resp.data.categorys.map((c) => ({
            id: c.uid,
            name: c.name,
          }));
          setCategories(catList);
        }
      } catch (err) {
        console.warn("GetTestCategories failed, using mock categories", err);
        // fallback
        setCategories([
          { id: "biochem", name: "Biochemistry" },
          { id: "haema", name: "Haematology" },
          { id: "micro", name: "Microbiology" },
        ]);
      } finally {
        setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  const filtered = useMemo(() => {
    let data = tests;
    if (category)
      data = data.filter(
        (t) => t.category === categories.find((c) => c.id === category)?.name
      );
    if (query) {
      const q = query.toLowerCase();
      data = data.filter(
        (t) =>
          t.name.toLowerCase().includes(q) ||
          (t.shortName || "").toLowerCase().includes(q)
      );
    }
    return data;
  }, [tests, category, query, categories]);

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
