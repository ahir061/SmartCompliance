import React, { useState } from "react";
import {
  ChevronRight,
  Tag,
  Download,
  Plus,
  Pencil,
  Trash2,
} from "lucide-react";
import ChapterModal from "./ChapterModal";

// ==========================
// Chapter Row Component
// ==========================
const ChapterRow = ({ id, title, onClick, onEdit, onDelete }) => (
  <div
    className="flex items-center justify-between bg-slate-50 p-4 rounded-lg border border-slate-100 hover:border-slate-200 transition"
  >
    <div
      onClick={onClick}
      className="flex items-center text-slate-700 font-medium text-sm cursor-pointer"
    >
      <span className="w-10 text-slate-500">{id}</span>
      <span>{title}</span>
    </div>

    <div className="flex items-center space-x-3">

      {/* Edit Button */}
      <button
        className="p-2 bg-blue-50 text-blue-500 rounded"
        onClick={onEdit}
      >
        <Pencil className="w-4 h-4" />
      </button>

      {/* Delete Button */}
      <button
        className="p-2 bg-red-50 text-red-500 rounded"
        onClick={onDelete}
      >
        <Trash2 className="w-4 h-4" />
      </button>

      {/* Open Button */}
      <button
        className="p-2 text-slate-400 hover:text-slate-600"
        onClick={onClick}
      >
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  </div>
);

// ==========================
// MAIN PAGE
// ==========================
const ReferenceDetailsPage = ({ reference, onBack }) => {
  const title = reference?.reference_text || "Reference";

  // Manage chapters locally so edits/deletes reflect instantly
  const [chapters, setChapters] = useState(reference.chapters || []);

  // Chapter Modal State
  const [openChapter, setOpenChapter] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // ---- Open Chapter Modal (view summary) ----
  const handleOpenChapter = (chapter) => {
    setOpenChapter(chapter);
    setIsModalOpen(true);
  };

  // ---- Edit Chapter ----
  const handleEditChapter = (chapter) => {
    const newTitle = prompt("Edit chapter title:", chapter.title);

    if (!newTitle || newTitle.trim() === "") return;

    setChapters((prev) =>
      prev.map((ch) =>
        ch.id === chapter.id ? { ...ch, title: newTitle } : ch
      )
    );
  };

  // ---- Delete Chapter ----
  const handleDeleteChapter = (chapter) => {
    if (!confirm(`Delete chapter "${chapter.title}"?`)) return;

    setChapters((prev) => prev.filter((ch) => ch.id !== chapter.id));
  };

  return (
    <div className="flex-1 overflow-y-auto p-8">

      {/* Breadcrumb */}
      <nav className="flex items-center text-xs text-slate-500 mb-6">
        <span className="hover:text-purple-600 cursor-pointer" onClick={onBack}>
          Circular
        </span>
        <ChevronRight className="w-3 h-3 mx-2" />
        <span className="font-semibold text-slate-800">{title}</span>
      </nav>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">

        {/* Title */}
        <h1 className="text-2xl font-bold text-slate-900 mb-6">{title}</h1>

        {/* Reference Type */}
        <div className="flex items-center mb-10">
          <Tag className="w-4 h-4 text-slate-400 mr-2" />
          <span className="text-sm text-slate-600 mr-2">Reference Type:</span>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded bg-purple-100 text-purple-700 text-xs font-medium">
            {reference.link_type}
          </span>
        </div>

        {/* Summary */}
        <div className="mb-12">
          <h2 className="text-lg font-semibold mb-3">Summary (AI-Generated)</h2>
          <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
            {reference.llm_summary || "Summary unavailable. (No LLM output)"}
          </p>
        </div>

        {/* Chapters */}
        <div className="pt-2">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-slate-900">Chapters</h2>

            <div className="flex items-center space-x-3">
              <button className="p-2 text-slate-400 hover:text-slate-600">
                <Download className="w-5 h-5" />
              </button>

              {/* Add Chapter */}
              <button
                className="flex items-center px-4 py-2 border border-slate-200 rounded-md text-sm font-medium text-slate-600 hover:bg-slate-50 shadow-sm"
                onClick={() => {
                  const newTitle = prompt("Enter new chapter title:");
                  if (!newTitle || newTitle.trim() === "") return;

                  const newId = `${chapters.length + 1}.0`;

                  setChapters([
                    ...chapters,
                    { id: newId, title: newTitle },
                  ]);
                }}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Chapter
              </button>
            </div>
          </div>

          {/* Chapter List */}
          <div className="space-y-3">
            {chapters.length > 0 ? (
              chapters.map((ch, i) => (
                <ChapterRow
                  key={i}
                  id={ch.id}
                  title={ch.title}
                  onClick={() => handleOpenChapter(ch)}
                  onEdit={() => handleEditChapter(ch)}
                  onDelete={() => handleDeleteChapter(ch)}
                />
              ))
            ) : (
              <p className="text-sm text-slate-500 italic">
                No chapters generated.
              </p>
            )}
          </div>
        </div>

      </div>

      {/* Chapter Summary Modal */}
      <ChapterModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        chapter={openChapter}
        reference={reference}
      />
    </div>
  );
};

export default ReferenceDetailsPage;
