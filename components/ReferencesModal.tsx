import React, { useState, useEffect } from "react";
import { XIcon, SearchIcon, ExternalLinkIcon } from "./Icons";

interface ReferencesModalProps {
  isOpen: boolean;
  onClose: () => void;
  circularId: number | null;
  referenceId: string | null;

  // ⭐ REQUIRED: App.tsx passes this
  onOpenReferencePage: (ref: any) => void;
}

const ReferencesModal: React.FC<ReferencesModalProps> = ({
  isOpen,
  onClose,
  circularId,
  referenceId,
  onOpenReferencePage,
}) => {
  const [isMounted, setIsMounted] = useState(false);
  const [show, setShow] = useState(false);

  const [references, setReferences] = useState<any[]>([]);
  const [activeRef, setActiveRef] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  /* ----------------------- Modal Animations ----------------------- */
  useEffect(() => {
    if (isOpen) {
      setIsMounted(true);
      setTimeout(() => setShow(true), 20);
    } else {
      setShow(false);
      setTimeout(() => setIsMounted(false), 250);
    }
  }, [isOpen]);

  /* ----------------------- Load Reference List ----------------------- */
  useEffect(() => {
    if (!circularId || !isOpen) return;

    const load = async () => {
      try {
        const r = await fetch(
          `${import.meta.env.VITE_API_URL}/circulars/${circularId}/references`
        );
        const j = await r.json();
        setReferences([...(j.external || []), ...(j.internal || [])]);
      } catch (e) {
        console.error("Reference load failed", e);
      }
    };

    load();
  }, [circularId, isOpen]);

  /* ----------------------- Load Single Reference ----------------------- */
  const fetchReferenceDetails = async (id: string) => {
    if (!circularId || !id) return;

    setLoading(true);
    setActiveRef(null);

    try {
      const r = await fetch(
        `${import.meta.env.VITE_API_URL}/circulars/${circularId}/references/${id}`
      );
      const j = await r.json();
      setActiveRef(j);
    } catch (e) {
      console.error("Reference details failed", e);
    }

    setLoading(false);
  };

  /* ----------------------- Auto-load initial reference ----------------------- */
  useEffect(() => {
    if (referenceId && isOpen) fetchReferenceDetails(referenceId);
  }, [referenceId, isOpen]);

  const filteredRefs = references.filter((r) =>
    (r.reference_text || "").toLowerCase().includes(search.toLowerCase())
  );

  if (!isMounted) return null;

  /* ----------------------- Render Text / PDF ----------------------- */
  const renderReferenceContent = () => {
    if (!activeRef) return null;

    const isPdf = activeRef.is_pdf === 1 || activeRef.is_pdf === true;
    const hasText = activeRef.pdf_text && activeRef.pdf_text.trim().length > 0;

    if (hasText) {
      return activeRef.pdf_text
        .split("\n")
        .map((p: string, i: number) => <p key={i}>{p}</p>);
    }

    if (isPdf)
      return (
        <p className="text-gray-500 italic">
          PDF detected, but text extraction failed.
        </p>
      );

    return (
      <p className="text-gray-500 italic">
        No text available. Use Open Source to view original file.
      </p>
    );
  };

  return (
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 bg-black/60 z-40 transition-opacity ${
          show ? "opacity-100" : "opacity-0"
        }`}
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-all ${
          show ? "opacity-100 scale-100" : "opacity-0 scale-95"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-white rounded-lg shadow-2xl w-full max-w-6xl h-[90vh] flex flex-col overflow-hidden">
          {/* Header */}
          <header className="flex items-center justify-between p-4 border-b">
            <h2 className="text-lg font-semibold">Reference Details</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-800 p-1 rounded-full"
            >
              <XIcon className="w-6 h-6" />
            </button>
          </header>

          <div className="flex flex-1 overflow-hidden">
            {/* Reference List */}
            <aside className="w-1/3 bg-gray-50 border-r flex flex-col">
              <div className="p-4 border-b">
                <div className="relative">
                  <SearchIcon className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search references..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-10 pr-3 py-2 border rounded-md text-sm"
                  />
                </div>
              </div>

              <div className="flex-1 overflow-y-auto">
                {filteredRefs.map((ref) => (
                  <div
                    key={ref.id}
                    onClick={() => fetchReferenceDetails(ref.id)}
                    className={`p-4 border-b cursor-pointer hover:bg-blue-50 ${
                      activeRef?.id === ref.id
                        ? "bg-blue-100 border-r-4 border-blue-600"
                        : ""
                    }`}
                  >
                    <h3 className="text-sm font-medium">{ref.reference_text}</h3>
                    <p className="text-xs text-gray-500">{ref.link_type}</p>
                  </div>
                ))}
              </div>
            </aside>

            {/* RIGHT PANEL */}
            <main className="flex-1 p-6 overflow-y-auto">
              {loading && (
                <p className="text-gray-500 italic text-sm">Loading…</p>
              )}

              {!loading && !activeRef && (
                <p className="text-gray-500 italic text-sm">
                  Select a reference from the left.
                </p>
              )}

              {activeRef && (
                <>
                  {/* Header */}
                  <div className="border-b pb-4 mb-4">
                    <p className="text-sm text-gray-500">
                      {activeRef.link_type}
                    </p>

                    <h1 className="text-2xl font-bold text-gray-900 mt-1">
                      {activeRef.reference_text}
                    </h1>

                    {/* Buttons */}
                    <div className="flex items-center gap-6 mt-4">
                      {/* OPEN SOURCE */}
                      {activeRef.reference_url && (
                        <a
                          href={activeRef.reference_url}
                          target="_blank"
                          className="flex items-center text-blue-600 text-sm font-medium hover:text-blue-700"
                        >
                          Open Source
                          <ExternalLinkIcon className="w-4 h-4 ml-1" />
                        </a>
                      )}

                      {/* VIEW DETAILS — FIXED */}
                      <button
                        onClick={() => {
                          onOpenReferencePage(activeRef); // ⭐ send data to App
                          onClose(); // ⭐ close modal immediately
                        }}
                        className="text-purple-600 text-sm font-semibold hover:text-purple-700"
                      >
                        View Details
                      </button>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="text-gray-700 text-sm leading-relaxed space-y-3">
                    {renderReferenceContent()}
                  </div>
                </>
              )}
            </main>
          </div>
        </div>
      </div>
    </>
  );
};

export default ReferencesModal;
