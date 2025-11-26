import React, { useEffect, useState } from "react";
import { XIcon } from "./Icons";

const ChapterModal = ({ isOpen, onClose, chapter, reference }) => {
  const [loading, setLoading] = useState(false);
  const [chapterSummary, setChapterSummary] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isOpen) return;
    if (!chapter) return;

    const load = async () => {
      setLoading(true);
      setError("");
      setChapterSummary("");

      try {
        const params = new URLSearchParams();
        params.append("title", chapter.title);
        // pass parent summary if available (recommended)
        if (reference?.llm_summary) params.append("parent_summary", reference.llm_summary);

        const url = `${import.meta.env.VITE_API_URL}/references/${chapter.ref_id || reference?.id}/chapter-summary?` + params.toString();

        const r = await fetch(url);
        const j = await r.json();

        if (!r.ok) {
          setError(j.error || j.details || "Failed to load chapter summary.");
        } else {
          setChapterSummary(j.summary || j.error || "No summary returned.");
        }
      } catch (e) {
        setError("Failed to load chapter summary.");
        console.error("ChapterModal fetch error:", e);
      }

      setLoading(false);
    };

    load();
  }, [isOpen, chapter, reference]);

  if (!isOpen || !chapter) return null;

  return (
    <>
      {/* overlay */}
      <div
        className="fixed inset-0 bg-black/50 z-40"
        onClick={onClose}
      />

      {/* modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-lg w-full max-w-2xl p-6 relative">

          {/* close */}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
            aria-label="Close"
          >
            <XIcon className="w-6 h-6" />
          </button>

          {/* title */}
          <h2 className="text-xl font-bold text-slate-900 mb-3">{chapter.title}</h2>

          {/* body */}
          <div className="min-h-[80px]">
            {loading && (
              <p className="text-sm text-slate-500 italic animate-pulse">
                Generating chapter summary…
              </p>
            )}

            {!loading && error && (
              <p className="text-sm text-red-600">{error}</p>
            )}

            {!loading && !error && chapterSummary && (
              <div className="text-sm text-slate-700 whitespace-pre-line leading-relaxed">
                {chapterSummary}
              </div>
            )}

            {!loading && !error && !chapterSummary && (
              <p className="text-sm text-slate-500 italic">No summary available.</p>
            )}
          </div>

        </div>
      </div>
    </>
  );
};

export default ChapterModal;
