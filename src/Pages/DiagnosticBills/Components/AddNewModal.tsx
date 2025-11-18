import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Button, Select, TextInput, Textarea, Checkbox } from "@mantine/core";

interface AddNewModalItem {
  id: string;
  title: string;
  description: string;
  href?: string; // optional link to the page
}

interface AddNewModalProps {
  open: boolean;
  title?: string;
  items?: AddNewModalItem[];
  onClose: () => void;
  // Optional generic add callback - receives the new entry payload
  onAdd?: (payload: unknown) => void;
}

const AddNewModal: React.FC<AddNewModalProps> = ({
  open,
  title = "Add new entry to lab ratelist",
  items = [],
  onClose,
  onAdd,
}) => {
  const modalRootId = "add-new-modal-root";

  // Ensure root element exists synchronously so the first render of this
  // component (when `open` is true) has a valid portal target. This avoids
  // createPortal throwing if useEffect hasn't run yet.
  const ensureRoot = () => {
    if (typeof document === "undefined") return null;
    let root = document.getElementById(modalRootId);
    if (!root) {
      root = document.createElement("div");
      root.id = modalRootId;
      document.body.appendChild(root);
    }
    return root as HTMLElement | null;
  };

  useEffect(() => {
    // Ensure root exists on mount
    ensureRoot();
  }, []);

  // Hooks must be called on every render; keep below

  const isReferrerContext = items.some((it) => it.id === "referrer");
  const isCollectionAgentContext = items.some(
    (it) => it.id === "collection-agent"
  );

  const [titleSel, setTitleSel] = useState<string | null>("Dr.");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [degree, setDegree] = useState("");
  const [mobile, setMobile] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [active, setActive] = useState(true);
  const [agentName, setAgentName] = useState("");

  if (!open) return null;

  const handleCreateReferrer = () => {
    // Basic validation
    if (!firstName.trim()) {
      // We could use notifications, but keep it simple
      alert("First name is required");
      return;
    }

    const payload = {
      title: titleSel,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      degree: degree.trim(),
      mobile: mobile.trim(),
      email: email.trim(),
      address: address.trim(),
      active,
    };

    if (onAdd) onAdd({ type: "referrer", data: payload });
    // For now we simply close the modal after creating
    onClose();
  };

  const handleCreateCollectionAgent = () => {
    if (!agentName.trim()) {
      alert("Name is required");
      return;
    }
    const payload = { name: agentName.trim() };
    if (onAdd) onAdd({ type: "collection-agent", data: payload });
    onClose();
  };

  const content = (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black opacity-30"
        onClick={onClose}
        aria-hidden
      />

      <div className="bg-white rounded-lg shadow-lg w-full max-w-lg mx-4 z-10 overflow-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
          <button
            aria-label="Close Add New Modal"
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        <div className="p-6 space-y-4 text-sm text-gray-700">
          {isReferrerContext ? (
            <div className="space-y-3">
              <div className="grid grid-cols-3 gap-4 items-center">
                <div className="col-span-1">
                  <label className="text-xs text-gray-600">Title</label>
                  <Select
                    data={[
                      { value: "Dr.", label: "Dr." },
                      { value: "Mr.", label: "Mr." },
                      { value: "Ms.", label: "Ms." },
                      { value: "Mrs.", label: "Mrs." },
                    ]}
                    value={titleSel}
                    onChange={(v) => setTitleSel(v)}
                  />
                </div>

                <div className="col-span-1">
                  <label className="text-xs text-gray-600">First name</label>
                  <TextInput
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                  />
                </div>

                <div className="col-span-1">
                  <label className="text-xs text-gray-600">Last name</label>
                  <TextInput
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-gray-600">Degree</label>
                <TextInput
                  value={degree}
                  onChange={(e) => setDegree(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-gray-600">Mobile number</label>
                  <TextInput
                    placeholder="+91"
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-600">Contact email</label>
                  <TextInput
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-gray-600">Address</label>
                <Textarea
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  minRows={3}
                />
              </div>

              <div className="flex items-center gap-4">
                <Checkbox
                  checked={active}
                  onChange={(e) => setActive(e.currentTarget.checked)}
                  label="Active"
                />
              </div>
            </div>
          ) : isCollectionAgentContext ? (
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-gray-700 mb-2 block">
                  * Name
                </label>
                <TextInput
                  value={agentName}
                  onChange={(e) => setAgentName(e.target.value)}
                  placeholder="Name"
                />
              </div>
            </div>
          ) : (
            <>
              {items.length === 0 && (
                <div>
                  No pages available. Please configure links to enable adding.
                </div>
              )}

              {items.map((it) => (
                <div key={it.id} className="border rounded p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="font-semibold text-gray-800">
                        {it.title}
                      </div>
                      <div className="text-xs text-gray-600 mt-1">
                        {it.description}
                      </div>
                    </div>
                    {it.href ? (
                      <a
                        href={it.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 text-xs hover:underline ml-4 self-start"
                      >
                        Add new from {it.title.toLowerCase()} page
                      </a>
                    ) : (
                      <span className="text-xs text-gray-400 ml-4">
                        No link
                      </span>
                    )}
                  </div>
                </div>
              ))}

              <div className="text-xs text-gray-500">
                Need help?{" "}
                <a className="text-blue-600 hover:underline" href="#">
                  Contact support
                </a>
              </div>
            </>
          )}
        </div>

        <div className="flex justify-end items-center p-4 border-t gap-2">
          <Button variant="default" onClick={onClose}>
            Cancel
          </Button>
          {isReferrerContext ? (
            <Button onClick={handleCreateReferrer}>Create Referrer</Button>
          ) : isCollectionAgentContext ? (
            <Button onClick={handleCreateCollectionAgent}>Save</Button>
          ) : (
            <Button onClick={onClose}>Close</Button>
          )}
        </div>
      </div>
    </div>
  );

  const root = ensureRoot();
  if (!root) return null;
  return createPortal(content, root);
};

export default AddNewModal;
