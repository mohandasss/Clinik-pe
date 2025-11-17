import React, { useMemo, useState, useEffect, useCallback } from "react";
import { Button, Popover, TextInput } from "@mantine/core";
import CategoryModal from "./Components/CategoryModal";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
} from "@dnd-kit/core";
import type { DragStartEvent, DragEndEvent } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { notifications } from "@mantine/notifications";
import apis from "../../APis/Api";
import type { TestCategory, TestCategoryPagination } from "../../APis/Types";
import { IconDots, IconPencil } from "@tabler/icons-react";

// Inline SVG for chevrons up/down (replaces IconChevronsUpDown)
const ChevronsUpDown: React.FC<
  React.SVGProps<SVGSVGElement> & { size?: number }
> = ({ size = 16, className, ...props }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={`${size}px`}
    height={`${size}px`}
    viewBox="0 0 24 24"
    fill="none"
    className={className}
    {...props}
  >
    <path
      d="M12.7071 3.29289C12.3166 2.90237 11.6834 2.90237 11.2929 3.29289L6.29289 8.29289C5.90237 8.68342 5.90237 9.31658 6.29289 9.70711C6.68342 10.0976 7.31658 10.0976 7.70711 9.70711L12 5.41421L16.2929 9.70711C16.6834 10.0976 17.3166 10.0976 17.7071 9.70711C18.0976 9.31658 18.0976 8.68342 17.7071 8.29289L12.7071 3.29289Z"
      fill="currentColor"
    />
    <path
      d="M7.70711 14.2929C7.31658 13.9024 6.68342 13.9024 6.29289 14.2929C5.90237 14.6834 5.90237 15.3166 6.29289 15.7071L11.2929 20.7071C11.6834 21.0976 12.3166 21.0976 12.7071 20.7071L17.7071 15.7071C18.0976 15.3166 18.0976 14.6834 17.7071 14.2929C17.3166 13.9024 16.6834 13.9024 16.2929 14.2929L12 18.5858L7.70711 14.2929Z"
      fill="currentColor"
    />
  </svg>
);
import DeleteConfirm from "../TestPackages/Components/DeleteConfirm";

// ============================================================================
// Constants
// ============================================================================

const DEFAULT_PAGE_SIZE = 5;
const DRAG_ACTIVATION_DISTANCE = 8;

// ============================================================================
// Sortable Row Component
// ============================================================================

interface SortableRowProps {
  category: TestCategory;
  onEdit: (category: TestCategory) => void;
  onDelete: (category: TestCategory) => void;
}

const SortableRow: React.FC<SortableRowProps> = ({
  category,
  onEdit,
  onDelete,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: category.id });

  const rowStyle: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <tr ref={setNodeRef} style={rowStyle} className="hover:bg-gray-50">
      <td className="border-b border-gray-200 px-4 py-3">
        <div className="flex items-center gap-2">
          <div
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing"
          >
            <ChevronsUpDown size={16} className="text-gray-400" />
          </div>
          <span className="text-sm text-gray-600">{category.order}.</span>
        </div>
      </td>

      <td className="border-b border-gray-200 px-4 py-3">
        <div className="font-medium text-gray-900">{category.name}</div>
      </td>

      <td className="border-b border-gray-200 px-4 py-3 text-right">
        <div className="flex items-center justify-end gap-2">
          <button
            className="text-blue-600 text-sm hover:text-blue-800 transition-colors"
            onClick={() => onEdit(category)}
            aria-label="Edit category"
          >
            <IconPencil size={16} />
          </button>

          <Popover position="bottom" withArrow shadow="md">
            <Popover.Target>
              <button
                className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                aria-label="More options"
              >
                <IconDots className="rotate-90" />
              </button>
            </Popover.Target>
            <Popover.Dropdown>
              <div className="flex flex-col gap-2 min-w-max">
                <Button
                  variant="subtle"
                  color="red"
                  size="xs"
                  onClick={() => onDelete(category)}
                >
                  Remove
                </Button>
              </div>
            </Popover.Dropdown>
          </Popover>
        </div>
      </td>
    </tr>
  );
};

// ============================================================================
// Main Component
// ============================================================================

const TestCategories: React.FC = () => {
  // State: Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");

  // State: Data
  const [categories, setCategories] = useState<TestCategory[]>([]);
  const [pagination, setPagination] = useState<TestCategoryPagination | null>(
    null
  );

  // State: UI
  const [isLoadingCategories, setIsLoadingCategories] = useState(false);
  const [draggedCategoryId, setDraggedCategoryId] = useState<string | null>(
    null
  );

  // State: Delete Modal
  const [categoryToDelete, setCategoryToDelete] = useState<TestCategory | null>(
    null
  );
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // State: Edit/Add Modal
  const [categoryToEdit, setCategoryToEdit] = useState<TestCategory | null>(
    null
  );
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // ============================================================================
  // Computed Values
  // ============================================================================

  const totalCategories = pagination?.totalRecords ?? categories.length;
  const totalPages = Math.max(
    1,
    Math.ceil(totalCategories / DEFAULT_PAGE_SIZE)
  );

  const filteredCategories = useMemo(() => {
    if (!searchQuery) return categories;

    const normalizedQuery = searchQuery.toLowerCase();
    return categories.filter((category) =>
      category.name.toLowerCase().includes(normalizedQuery)
    );
  }, [searchQuery, categories]);

  const sortedCategories = useMemo(() => {
    return [...filteredCategories].sort(
      (a, b) => Number(a.order) - Number(b.order)
    );
  }, [filteredCategories]);

  const draggedCategory = draggedCategoryId
    ? categories.find((cat) => cat.id === draggedCategoryId)
    : null;

  // ============================================================================
  // Drag and Drop Configuration
  // ============================================================================

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: DRAG_ACTIVATION_DISTANCE,
      },
    })
  );

  // Notification helpers used across functions - declare before usage
  const showNotification = useCallback(
    (message: string, type: "success" | "error" | "warning") => {
      const colorMap = {
        success: "blue",
        error: "red",
        warning: "yellow",
      };

      notifications.show({
        title: message,
        message,
        color: colorMap[type],
      });
    },
    []
  );

  const showSuccessNotification = useCallback(
    (message: string) => showNotification(message, "success"),
    [showNotification]
  );

  const showErrorNotification = useCallback(
    (message: string) => showNotification(message, "error"),
    [showNotification]
  );

  const showWarningNotification = useCallback(
    (message: string) => showNotification(message, "warning"),
    [showNotification]
  );

  // Notification helpers are stable using useCallback, declared here so
  // loadCategories and other callbacks can reference them safely.

  // ============================================================================
  // API Calls
  // ============================================================================

  const loadCategories = useCallback(async () => {
    setIsLoadingCategories(true);

    try {
      const response = await apis.GetTestCategories(
        searchQuery || undefined,
        currentPage,
        DEFAULT_PAGE_SIZE
      );

      if (response.success) {
        setCategories(response.data.categorys);
        setPagination(response.data.pagination);
      } else {
        showErrorNotification(response.message || "Failed to fetch categories");
      }
    } catch (error) {
      console.error("Failed to load categories:", error);
      showErrorNotification("Failed to fetch categories");
    } finally {
      setIsLoadingCategories(false);
    }
  }, [currentPage, searchQuery, showErrorNotification]);

  const deleteCategory = async (categoryId: string) => {
    setIsDeleting(true);

    try {
      const response = await apis.DeleteTestCategory(categoryId);

      if (response.success) {
        showSuccessNotification(response.message || "Category deleted");
        await loadCategories();
      } else {
        showWarningNotification(response.message || "Category deleted locally");
        removeCategoryLocally(categoryId);
      }

      closeDeleteModal();
    } catch (error) {
      console.error("Failed to delete category:", error);
      showWarningNotification("Category removed locally");
      removeCategoryLocally(categoryId);
      closeDeleteModal();
    } finally {
      setIsDeleting(false);
    }
  };

  // Save (Add/Update) category by name — invoked from the modal
  const handleAddCategory = async (name: string) => {
    if (!name || !name.trim()) {
      showErrorNotification("Category name is required");
      return;
    }

    setIsSaving(true);
    try {
      const response = categoryToEdit
        ? await apis.UpdateTestCategory(categoryToEdit.uid, { name })
        : await apis.AddTestCategory({ name });

      if (response?.success) {
        showSuccessNotification(response.message);
        await loadCategories();
        closeEditModal();
      } else {
        showErrorNotification(response?.message || "Failed to save category");
      }
    } catch (error) {
      console.error("Failed to save category:", error);
      showErrorNotification("Failed to save category");
    } finally {
      setIsSaving(false);
    }
  };

  const reorderCategories = async (draggedUid: string, afterUid: string) => {
    try {
      const response = await apis.ReorderTestCategories({
        uid: draggedUid,
        after_uid: afterUid,
      });

      const notificationType = response.success ? "success" : "error";
      showNotification(response.message, notificationType);

      if (response.success) {
        await loadCategories();
      }
    } catch (error) {
      console.error("Failed to reorder categories:", error);
      showErrorNotification("Failed to sync order");
    }
  };

  // ============================================================================
  // Event Handlers
  // ============================================================================

  const handleDragStart = (event: DragStartEvent) => {
    setDraggedCategoryId(String(event.active.id));
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setDraggedCategoryId(null);

    if (!over || active.id === over.id) return;

    // Use the visible/sorted categories (the order in UI) to compute indices
    const visible = sortedCategories;
    const oldVisibleIndex = visible.findIndex((cat) => cat.id === active.id);
    const newVisibleIndex = visible.findIndex((cat) => cat.id === over.id);

    if (oldVisibleIndex === -1 || newVisibleIndex === -1) return;

    const draggedVisibleCategory = visible[oldVisibleIndex];
    const reorderedVisible = arrayMove(
      visible,
      oldVisibleIndex,
      newVisibleIndex
    );

    // Determine after_uid (based on visible order). If placed at top, after_uid is empty
    const afterUid =
      newVisibleIndex === 0 ? "" : reorderedVisible[newVisibleIndex - 1].uid;

    // For immediate UI feedback, compute the full categories reordering using the original indices
    const oldFullIndex = categories.findIndex((cat) => cat.id === active.id);
    const newFullIndex = categories.findIndex((cat) => cat.id === over.id);
    if (oldFullIndex === -1 || newFullIndex === -1) return;
    const reorderedFull = arrayMove(categories, oldFullIndex, newFullIndex);

    setCategories(reorderedFull);
    await reorderCategories(draggedVisibleCategory.uid, afterUid);
  };

  const handleEditCategory = (category: TestCategory) => {
    setCategoryToEdit(category);
    setIsEditModalOpen(true);
  };

  const handleDeleteCategory = (category: TestCategory) => {
    setCategoryToDelete(category);
    setIsDeleteModalOpen(true);
  };

  const handleAddNewCategory = () => {
    setCategoryToEdit(null);
    setIsEditModalOpen(true);
  };

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  // ============================================================================
  // Helper Functions
  // ============================================================================

  // Name validation occurs in the handler that receives the name explicitly

  const removeCategoryLocally = (categoryId: string) => {
    setCategories((prevCategories) =>
      prevCategories.filter((cat) => cat.id !== categoryId)
    );
  };

  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setCategoryToDelete(null);
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setCategoryToEdit(null);
  };

  // ============================================================================
  // Effects
  // ============================================================================

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  // ============================================================================
  // Render Helpers
  // ============================================================================

  const renderPaginationInfo = () => {
    const startIndex = (currentPage - 1) * DEFAULT_PAGE_SIZE + 1;
    const endIndex = Math.min(currentPage * DEFAULT_PAGE_SIZE, totalCategories);

    return (
      <div className="text-sm text-gray-500">
        Showing {startIndex} to {endIndex} of {totalCategories} entries
      </div>
    );
  };

  const renderPageButton = (pageNumber: number) => {
    const isCurrentPage = currentPage === pageNumber;
    const buttonClass = isCurrentPage
      ? "bg-blue-600 text-white"
      : "border text-gray-600 hover:bg-gray-50";

    return (
      <button
        key={pageNumber}
        onClick={() => handlePageChange(pageNumber)}
        className={`w-8 h-8 rounded transition-colors ${buttonClass}`}
        aria-label={`Go to page ${pageNumber}`}
        aria-current={isCurrentPage ? "page" : undefined}
      >
        {pageNumber}
      </button>
    );
  };

  const renderPaginationButtons = () => {
    return Array.from({ length: totalPages }, (_, i) => i + 1).map(
      renderPageButton
    );
  };

  // ============================================================================
  // Main Render
  // ============================================================================

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 ring-1 ring-gray-100">
      {/* Header Section */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex gap-4 items-center flex-1">
          <h2 className="text-lg font-semibold text-gray-800">
            Test categories
          </h2>
          <div className="w-64">
            <TextInput
              placeholder="Search in page"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Search categories"
            />
          </div>
        </div>
        <Button
          onClick={handleAddNewCategory}
          variant="filled"
          color="blue"
          disabled={isLoadingCategories}
        >
          + Add new
        </Button>
      </div>

      {/* Table with Drag and Drop */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50">
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider border-b border-gray-200">
                  Order
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider border-b border-gray-200">
                  Name
                </th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider border-b border-gray-200">
                  Action
                </th>
              </tr>
            </thead>

            <tbody>
              <SortableContext
                items={sortedCategories.map((cat) => cat.id)}
                strategy={verticalListSortingStrategy}
              >
                {sortedCategories.map((category) => (
                  <SortableRow
                    key={category.id}
                    category={category}
                    onEdit={handleEditCategory}
                    onDelete={handleDeleteCategory}
                  />
                ))}
              </SortableContext>
            </tbody>
          </table>
        </div>

        {/* Drag Overlay */}
        <DragOverlay>
          {draggedCategory && (
            <div className="bg-white shadow-lg rounded border-2 border-blue-400 opacity-90">
              <table className="w-full text-sm">
                <tbody>
                  <tr>
                    <td className="px-4 py-3 w-20">
                      <div className="flex items-center gap-2">
                        <ChevronsUpDown size={16} className="text-gray-400" />
                        <span className="text-sm text-gray-600">
                          {draggedCategory.order}.
                        </span>
                      </div>
                    </td>

                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-900">
                        {draggedCategory.name}
                      </div>
                    </td>

                    {/* FIXED ACTION COLUMN */}
                    <td className="px-4 py-3 text-right">
                      {" "}
                      {/* Added text-right for right alignment */}
                      <div className="flex items-center justify-end gap-2">
                        {" "}
                        {/* Added justify-end to push icons to the right */}
                        <IconPencil size={16} className="text-blue-600" />
                        <IconDots className="rotate-90 text-gray-400" />
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </DragOverlay>
      </DndContext>

      {/* Edit/Add Modal */}
      <CategoryModal
        opened={isEditModalOpen}
        onClose={closeEditModal}
        onSave={handleAddCategory}
        initialName={categoryToEdit?.name}
        saving={isSaving}
        title={categoryToEdit ? "Edit Category" : "Add Category"}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirm
        opened={isDeleteModalOpen}
        onClose={closeDeleteModal}
        onConfirm={() =>
          categoryToDelete && deleteCategory(categoryToDelete.uid)
        }
        itemName={categoryToDelete?.name}
        loading={isDeleting}
      />

      {/* Pagination Section */}
      <div className="flex items-center justify-between text-sm text-gray-500 mt-4">
        {renderPaginationInfo()}

        <div className="inline-flex items-center gap-2">
          <button
            className="px-3 py-1 border rounded text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
            disabled={currentPage === 1}
            onClick={() => handlePageChange(currentPage - 1)}
            aria-label="Previous page"
          >
            Previous
          </button>

          <div className="inline-flex items-center gap-1">
            {renderPaginationButtons()}
          </div>

          <button
            className="px-3 py-1 border rounded text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
            disabled={currentPage >= totalPages}
            onClick={() => handlePageChange(currentPage + 1)}
            aria-label="Next page"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default TestCategories;
