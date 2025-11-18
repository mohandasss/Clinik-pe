import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Loader } from "@mantine/core";
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
import { IconArrowLeft } from "@tabler/icons-react";
import apis from "../../APis/Api";
import useAuthStore from "../../GlobalStore/store";
import type { PanelTestDetails } from "../../APis/Types";

// Inline SVG for chevrons up/down
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

interface SortableTestRowProps {
  test: PanelTestDetails;
}

const SortableTestRow: React.FC<SortableTestRowProps> = ({ test }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: test.uid });

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
          <span className="text-sm text-gray-600">{test.order}.</span>
        </div>
      </td>
      <td className="border-b border-gray-200 px-4 py-3">
        <div className="font-medium text-gray-900">{test.test_name}</div>
      </td>
      <td className="border-b border-gray-200 px-4 py-3">
        <div className="text-sm text-gray-600">{test.test_id}</div>
      </td>
    </tr>
  );
};

const TestPanelsDetails: React.FC = () => {
  const { id: panelId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const organizationDetails = useAuthStore((s) => s.organizationDetails);

  // State: Data
  const [panelName, setPanelName] = useState<string>("");
  const [tests, setTests] = useState<PanelTestDetails[]>([]);
  const [loading, setLoading] = useState(false);

  // State: Drag and Drop
  const [draggedTestId, setDraggedTestId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const draggedTest = draggedTestId
    ? tests.find((t) => t.uid === draggedTestId)
    : null;

  // Load panel details
  useEffect(() => {
    if (!panelId) return;

    const loadPanelDetails = async () => {
      setLoading(true);
      try {
        const response = await apis.GetTestpanelById(
          organizationDetails?.organization_id ?? "",
          organizationDetails?.center_id ?? "",
          panelId
        );

        if (response.success && response.data?.panel) {
          const panel = response.data.panel;
          setPanelName(panel.name);
          const sortedTests = [...panel.tests].sort(
            (a, b) => Number(a.order) - Number(b.order)
          );
          setTests(sortedTests);
        } else {
          notifications.show({
            title: "Error",
            message: "Failed to load panel details",
            color: "red",
          });
        }
      } catch (error) {
        console.error("Failed to load panel details:", error);
        notifications.show({
          title: "Error",
          message: "Failed to fetch panel details",
          color: "red",
        });
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

  const handleDragStart = (event: DragStartEvent) => {
    setDraggedTestId(String(event.active.id));
  };

  const reorderTests = async (draggedUid: string, afterUid: string) => {
    try {
      const response = await apis.ReorderTestPanelsDetails(
        organizationDetails?.organization_id ?? "",
        organizationDetails?.center_id ?? "",
        panelId ?? "",
        {
          uid: draggedUid,
          after_uid: afterUid,
        }
      );

      const notificationType = response.success ? "blue" : "red";
      notifications.show({
        title: response.success ? "Success" : "Error",
        message: response.message,
        color: notificationType,
      });
    } catch (error) {
      console.error("Failed to reorder tests:", error);
      notifications.show({
        title: "Error",
        message: "Failed to sync order",
        color: "red",
      });
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setDraggedTestId(null);

    if (!over || active.id === over.id) return;

    const oldIndex = tests.findIndex((t) => t.uid === active.id);
    const newIndex = tests.findIndex((t) => t.uid === over.id);

    if (oldIndex === -1 || newIndex === -1) return;

    const draggedTest = tests[oldIndex];
    const reordered = arrayMove(tests, oldIndex, newIndex);

    const afterUid = newIndex === 0 ? "" : reordered[newIndex - 1].uid;

    setTests(reordered);
    await reorderTests(draggedTest.uid, afterUid);
  };

  return (
    <div className="flex gap-4 h-full">
      {/* Left Side - Tests Table */}
      <div className="flex-1 bg-white rounded-lg shadow-sm p-6 ring-1 ring-gray-100">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/test-panels")}
              className="text-gray-600 hover:text-gray-800 transition-colors"
            >
              <IconArrowLeft size={20} />
            </button>
            <h2 className="text-lg font-semibold text-gray-800">
              {loading ? "Loading..." : panelName || "Panel Details"}
            </h2>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Loader size="lg" />
          </div>
        ) : (
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
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Order
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
                  <SortableContext
                    items={tests.map((t) => t.uid)}
                    strategy={verticalListSortingStrategy}
                  >
                    {tests.map((test) => (
                      <SortableTestRow key={test.uid} test={test} />
                    ))}
                  </SortableContext>
                </tbody>
              </table>
            </div>

            <DragOverlay>
              {draggedTest ? (
                <div className="bg-white shadow-lg rounded border-2 border-blue-400 opacity-90">
                  <table className="w-full text-sm">
                    <tbody>
                      <tr>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <ChevronsUpDown
                              size={16}
                              className="text-gray-400"
                            />
                            <span className="text-sm text-gray-600">
                              {draggedTest.order}.
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="font-medium text-gray-900">
                            {draggedTest.test_name}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-sm text-gray-600">
                            {draggedTest.test_id}
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              ) : null}
            </DragOverlay>
          </DndContext>
        )}
      </div>

      {/* Right Side - Static Panel */}
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
        </div>
      </div>
    </div>
  );
};

export default TestPanelsDetails;
