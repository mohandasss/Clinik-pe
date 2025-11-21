import React, { useState } from "react";

// ---- TYPES ----
type State = "none" | "allow" | "deny" | "mixed";
interface CellData {
  read: State;
  write: State;
}

// ---- ROW LABELS ----
const items = [
  "Organization",
  "Center",
  "Provider",
  "Appointment",
  "Fees",
  "Availability",
  "Clinic",
  "Diagnostic",
];

const AccessManagement: React.FC = () => {
  const [cells, setCells] = useState<CellData[]>(
    items.map(() => ({ read: "none", write: "none" }))
  );

  // ---- STYLING ----
  const getStateClass = (state: State): string => {
    const baseStyle =
      "w-5 h-5 border-2 flex items-center justify-center cursor-pointer rounded text-xs font-bold";

    switch (state) {
      case "none":
        return `${baseStyle} border-blue-500 text-blue-500 bg-white`;
      case "allow":
        return `${baseStyle} border-green-500 bg-green-500 text-white`;
      case "deny":
        return `${baseStyle} border-red-500 bg-red-500 text-white`;
      case "mixed":
        return `${baseStyle} border-amber-500 bg-amber-300 text-black`;
      default:
        return baseStyle;
    }
  };

  const getStateSymbol = (state: State): string => {
    if (state === "allow") return "✓";
    if (state === "deny") return "✕";
    if (state === "mixed") return "?";
    return "";
  };

  // ---- LOGIC ----
  const leafNextState = (curr: State): State => {
    if (curr === "none") return "allow";
    if (curr === "allow") return "deny";
    return "none";
  };

  const parentNextState = (curr: State): State => {
    if (curr === "mixed" || curr === "none") return "allow";
    if (curr === "allow") return "deny";
    return "none";
  };

  const getRowParentState = (rowIndex: number): State => {
    const r = cells[rowIndex].read;
    const w = cells[rowIndex].write;
    if (r === w) return r;
    return "mixed";
  };

  const getColParentState = (col: "read" | "write"): State => {
    const states = cells.map((c) => c[col]);
    const allSame = states.every((s) => s === states[0]);
    return allSame ? states[0] : "mixed";
  };

  const getMasterParentState = (): State => {
    const states = cells.flatMap((c) => [c.read, c.write]);
    const allSame = states.every((s) => s === states[0]);
    return allSame ? states[0] : "mixed";
  };

  const handleCellClick = (rowIndex: number, col: "read" | "write") => {
    setCells((prev) => {
      const updated = [...prev];
      updated[rowIndex][col] = leafNextState(updated[rowIndex][col]);
      return updated;
    });
  };

  const handleRowParentClick = (rowIndex: number) => {
    const next = parentNextState(getRowParentState(rowIndex));
    setCells((prev) => {
      const updated = [...prev];
      updated[rowIndex].read = next;
      updated[rowIndex].write = next;
      return updated;
    });
  };

  const handleColParentClick = (col: "read" | "write") => {
    const next = parentNextState(getColParentState(col));
    setCells((prev) => prev.map((c) => ({ ...c, [col]: next })));
  };

  const handleMasterParentClick = () => {
    const next = parentNextState(getMasterParentState());
    setCells(() => items.map(() => ({ read: next, write: next })));
  };

  return (
    <div className="min-h-screen bg-gray-50 p-2">
      <div className="max-w-9xl mx-auto bg-white rounded-lg shadow-md p-4">
        {/* LEGEND */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">
            Access Management
          </h3>
          <div className="flex flex-wrap gap-6">
            <div className="flex items-center gap-2">
              <div
                className={getStateClass("none")}
                style={{ cursor: "default" }}
              />
              <span className="text-sm text-gray-700">None</span>
            </div>
            <div className="flex items-center gap-2">
              <div
                className={getStateClass("allow")}
                style={{ cursor: "default" }}
              >
                ✓
              </div>
              <span className="text-sm text-gray-700">Allow</span>
            </div>
            <div className="flex items-center gap-2">
              <div
                className={getStateClass("deny")}
                style={{ cursor: "default" }}
              >
                ✕
              </div>
              <span className="text-sm text-gray-700">Deny</span>
            </div>
            <div className="flex items-center gap-2">
              <div
                className={getStateClass("mixed")}
                style={{ cursor: "default" }}
              >
                ?
              </div>
              <span className="text-sm text-gray-700">Mixed (Auto)</span>
            </div>
          </div>
        </div>

        {/* TABLE HEADER */}
        <div className="border border-gray-300 rounded-lg overflow-hidden">
          {/* Header Row */}
          <div className="grid grid-cols-12 bg-gray-50 border-b border-gray-300">
            {/* Permissions Column Header */}
            <div className="col-span-2 flex items-center justify-between px-6 py-4 border-r border-gray-300">
              <span className="text-sm font-semibold text-gray-800">
                Permissions
              </span>
              <button
                onClick={handleMasterParentClick}
                className={`${getStateClass(
                  getMasterParentState()
                )} hover:opacity-80 transition-opacity`}
              >
                {getStateSymbol(getMasterParentState())}
              </button>
            </div>

            {/* Read Column Header */}
            <div className="col-span-5 flex items-center justify-center gap-2 p pr-10 py-4 border-r border-gray-300">
              <span className="text-sm font-semibold text-gray-800">Read</span>
              <button
                onClick={() => handleColParentClick("read")}
                className={`${getStateClass(
                  getColParentState("read")
                )} hover:opacity-80 transition-opacity`}
              >
                {getStateSymbol(getColParentState("read"))}
              </button>
            </div>

            {/* Write Column Header */}
            <div className="col-span-5 flex items-center justify-center gap-2  pr-11 py-4">
              <span className="text-sm font-semibold text-gray-800">Write</span>
              <button
                onClick={() => handleColParentClick("write")}
                className={`${getStateClass(
                  getColParentState("write")
                )} hover:opacity-80 transition-opacity`}
              >
                {getStateSymbol(getColParentState("write"))}
              </button>
            </div>
          </div>

          {/* Table Rows */}
          {items.map((name, rowIndex) => (
            <div
              key={rowIndex}
              className="grid grid-cols-12 border-b border-gray-200 hover:bg-gray-50 transition-colors"
            >
              {/* Permission Name + Row Button */}
              <div className="col-span-2 flex items-center justify-between px-6 py-4 border-r border-gray-300">
                <span className="text-sm text-gray-700">{name}</span>
                <button
                  onClick={() => handleRowParentClick(rowIndex)}
                  className={`${getStateClass(
                    getRowParentState(rowIndex)
                  )} hover:opacity-80 transition-opacity`}
                >
                  {getStateSymbol(getRowParentState(rowIndex))}
                </button>
              </div>

              {/* Read Cell */}
              <div className="col-span-5 flex items-center justify-center px-4 py-4 border-r border-gray-300">
                <button
                  onClick={() => handleCellClick(rowIndex, "read")}
                  className={`${getStateClass(
                    cells[rowIndex].read
                  )} hover:opacity-80 transition-opacity`}
                >
                  {getStateSymbol(cells[rowIndex].read)}
                </button>
              </div>

              {/* Write Cell */}
              <div className="col-span-5 flex items-center justify-center px-4 py-4">
                <button
                  onClick={() => handleCellClick(rowIndex, "write")}
                  className={`${getStateClass(
                    cells[rowIndex].write
                  )} hover:opacity-80 transition-opacity`}
                >
                  {getStateSymbol(cells[rowIndex].write)}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AccessManagement;
