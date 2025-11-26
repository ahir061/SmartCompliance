import React, { useEffect, useState } from "react";
import {
  ClockIcon,
  CalendarIcon,
  DocumentIcon,
  LinkIcon,
  ChevronLeftIcon,
  TagIcon,
} from "./Icons";
import { Task, Circular } from "../types";
import AccordionItem from "./AccordionItem";

interface RightSidebarProps {
  circular: Circular;
  onReferenceClick: (id: string) => void;
}

const tasks: Task[] = [
  { status: "Compliant", count: 5, color: "bg-green-500" },
  { status: "Noted for Compliance", count: 2, color: "bg-orange-400" },
  { status: "Partially Compliant", count: 4, color: "bg-yellow-400" },
  { status: "Non-Compliant", count: 1, color: "bg-red-500" },
  { status: "Unassigned", count: 12, color: "bg-slate-400" },
];

const totalTasks = tasks.reduce((a, b) => a + b.count, 0);
const completedTasks = tasks.find((t) => t.status === "Compliant")?.count || 0;
const completionPercentage = Math.round((completedTasks / totalTasks) * 100);

const capitalizeFirstAlpha = (str?: string) => {
  if (!str) return "";
  const i = str.search(/[A-Za-z]/);
  if (i === -1) return str;
  return str.slice(0, i) + str[i].toUpperCase() + str.slice(i + 1);
};

const RightSidebar: React.FC<RightSidebarProps> = ({
  circular,
  onReferenceClick,
}) => {
  const [externalRefs, setExternalRefs] = useState<any[]>([]);
  const [internalRefs, setInternalRefs] = useState<any[]>([]);
  const [loadingInsights, setLoadingInsights] = useState(true);

  const insights = circular.insights;

  // =============================
  // Fetch References
  // =============================
  useEffect(() => {
    if (!circular?.id) return;

    let cancel = false;
    const loadRefs = async () => {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/circulars/${circular.id}/references`
        );
        const data = await res.json();
        if (!cancel) {
          setExternalRefs(data.external || []);
          setInternalRefs(data.internal || []);
        }
      } catch (e) {
        console.error("Reference loading failed", e);
      }
    };

    loadRefs();
    return () => (cancel = true);
  }, [circular]);

  useEffect(() => {
    if (insights) setLoadingInsights(false);
  }, [insights]);

  const insightOrNA = (text?: string) => {
    if (loadingInsights) return "Generating insights using FinArth AI...";
    if (!text || text.trim().length === 0) return "No information identified.";
    return capitalizeFirstAlpha(text.trim());
  };

  const totalRefs = externalRefs.length + internalRefs.length;

  return (
    <aside className="w-96 bg-white border-l border-slate-200 flex flex-shrink-0">
      <div className="flex-1 p-6 overflow-y-auto relative">

        {/* Back Btn */}
        <button className="absolute -left-3 top-1/2 -translate-y-1/2 bg-white border border-slate-300 rounded-full p-1 shadow-sm hover:bg-slate-100 transition">
          <ChevronLeftIcon className="w-4 h-4 text-slate-600" />
        </button>

        {/* ============================= */}
        {/* TASKS CARD */}
        {/* ============================= */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm mb-6">
          <div className="flex justify-between items-center mb-1.5">
            <h3 className="font-semibold text-slate-900 text-sm">Tasks</h3>
            <span className="text-xs text-slate-500">
              {completionPercentage}% ({completedTasks}/{totalTasks})
            </span>
          </div>

          {/* Progress */}
          <div className="flex h-2 rounded-full overflow-hidden my-2">
            {tasks.map((task) => (
              <div
                key={task.status}
                className={task.color}
                style={{ width: `${(task.count / totalTasks) * 100}%` }}
              />
            ))}
          </div>

          {/* Legend */}
          <div className="space-y-1.5 mt-3">
            {tasks.map((t) => (
              <div
                className="flex justify-between items-center text-xs"
                key={t.status}
              >
                <div className="flex items-center">
                  <span className={`w-2.5 h-2.5 rounded-full mr-2 ${t.color}`} />
                  <span className="text-slate-600">{t.status}</span>
                </div>
                <span className="font-medium text-slate-700">{t.count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ============================= */}
        {/* INSIGHTS (NO BOX) */}
        {/* ============================= */}
        <div className="mb-6 divide-y divide-slate-200">

          <AccordionItem title="Organization Impact">
            <p className="px-4 py-2 text-slate-700 text-sm leading-relaxed">
              {insightOrNA(insights?.organizationImpact)}
            </p>
          </AccordionItem>

          <AccordionItem title="Technical Changes">
            <p className="px-4 py-2 text-slate-700 text-sm leading-relaxed">
              {insightOrNA(insights?.technicalChanges)}
            </p>
          </AccordionItem>

          <AccordionItem title="Operational Changes">
            <p className="px-4 py-2 text-slate-700 text-sm leading-relaxed">
              {insightOrNA(insights?.operationalChanges)}
            </p>
          </AccordionItem>

          <AccordionItem title="Disclosure Areas">
            <p className="px-4 py-2 text-slate-700 text-sm leading-relaxed">
              {insightOrNA(insights?.disclosureAreas)}
            </p>
          </AccordionItem>

        </div>

        {/* ============================= */}
        {/* REFERENCES (SWAPPED) */}
        {/* ============================= */}
        <div className="rounded-xl border border-slate-200 shadow-sm p-5">

          {/* External = internalRefs */}
          <h3 className="font-semibold text-slate-900 text-sm flex items-center mb-3">
            <LinkIcon className="w-4 h-4 mr-2 text-slate-500" />
            External References
          </h3>

          <div className="space-y-2 mb-6">
            {internalRefs.length > 0 ? (
              internalRefs.map((ref) => (
                <button
                  key={ref.id}
                  onClick={() => onReferenceClick(ref.id)}
                  className="block text-blue-600 hover:underline text-sm text-left"
                >
                  {capitalizeFirstAlpha(ref.reference_text)}
                </button>
              ))
            ) : (
              <p className="text-slate-500 text-sm">No external references found.</p>
            )}
          </div>

          {/* Internal = externalRefs */}
          <h3 className="font-semibold text-slate-900 text-sm flex items-center mb-3">
            <LinkIcon className="w-4 h-4 mr-2 text-slate-500" />
            Internal References
          </h3>

          <div className="space-y-2 text-sm">
            {externalRefs.length > 0 ? (
              externalRefs.map((ref) => (
                <button
                  key={ref.id}
                  onClick={() => onReferenceClick(ref.id)}
                  className="block text-blue-600 hover:underline text-sm text-left"
                >
                  {capitalizeFirstAlpha(ref.reference_text)}
                </button>
              ))
            ) : (
              <p className="text-slate-500">No internal references found.</p>
            )}

            <button
              onClick={() => onReferenceClick("all_references")}
              className="block text-blue-600 font-medium hover:underline text-sm text-left mt-3"
            >
              View all references ({totalRefs})
            </button>
          </div>
        </div>
      </div>

      {/* ============================= */}
      {/* SIDE TOOLBAR */}
      {/* ============================= */}
      <div className="w-12 border-l border-slate-200 bg-slate-50 flex flex-col items-center py-4 space-y-3">

        <button className="p-2 rounded-lg hover:bg-slate-200 bg-slate-200 shadow-sm">
          <ClockIcon className="w-5 h-5 text-slate-700" />
        </button>

        <button className="p-2 rounded-lg hover:bg-slate-200">
          <CalendarIcon className="w-5 h-5 text-slate-700" />
        </button>

        <button className="p-2 rounded-lg hover:bg-slate-200">
          <DocumentIcon className="w-5 h-5 text-slate-700" />
        </button>

        <button className="p-2 rounded-lg hover:bg-slate-200">
          <TagIcon className="w-5 h-5 text-slate-700" />
        </button>
      </div>
    </aside>
  );
};

export default RightSidebar;
