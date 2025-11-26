import React, { useState } from 'react';
import AccordionItem from './AccordionItem';
import {
  TrashIcon,
  CalendarIcon,
  HashtagIcon,
  TagIcon,
  CheckCircleIcon
} from './Icons';
import ClauseActionablesPanel from "./ClauseActionablesPanel";

import { DateInfo, TagInfo, Circular, View, Clause, Insights } from '../types';

interface MainContentProps {
  view: View;
  circular: Circular;
  summary: string | null;
  loadingSummary: boolean;
  insights: Insights | null;
  loadingInsights: boolean;
}

// ------------------------ Small UI Components ------------------------

const DateInfoCard: React.FC<DateInfo> = ({ label, date, icon: Icon }) => (
  <div className="flex flex-col">
    <label className="text-xs text-slate-500">{label}</label>
    <div className="mt-1 flex items-center bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm shadow-sm">
      <Icon className="w-4 h-4 text-slate-400 mr-2" />
      <span className="text-slate-700">{date || "N/A"}</span>
    </div>
  </div>
);

const TagInfoRow: React.FC<TagInfo> = ({ label, value, icon: Icon, color }) => (
  <div className="flex items-center space-x-2">
    <Icon className="w-4 h-4 text-slate-400" />
    <span className="text-xs text-slate-500">{label}:</span>
    <span className={`text-xs font-medium px-2 py-1 rounded-md ${color}`}>
      {value}
    </span>
  </div>
);

// ------------------------ Clause Item ------------------------

const ClauseItem: React.FC<{
  clause: Clause;
  onActionableClick: (clause: Clause) => void;
}> = ({ clause, onActionableClick }) => {
  const text =
    clause.clause ||
    clause.text ||
    clause.compliance_clause ||
    "No clause text available.";

  return (
    <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm">
      <div className="flex items-start gap-4">
        <span className="text-sm text-slate-500 font-medium mt-1 whitespace-nowrap">
          {clause.number}
        </span>

        <div className="flex-1 space-y-3">

          {/* Clause text */}
          <p className="text-sm text-slate-800 leading-relaxed whitespace-pre-line">
            {text}
          </p>

          {/* Impact */}
          {clause.impact && (
            <p className="text-xs text-blue-700 bg-blue-50 px-3 py-2 rounded border border-blue-100 leading-relaxed">
              <span className="font-semibold">Impact: </span>
              {clause.impact}
            </p>
          )}

          {/* Penalty */}
          {clause.penalty && (
            <p className="text-xs text-red-700 bg-red-50 px-3 py-2 rounded border border-red-100 leading-relaxed">
              <span className="font-semibold">Penalty: </span>
              {clause.penalty}
            </p>
          )}

          {/* Actionables */}
          <button
            onClick={() => onActionableClick(clause)}
            className="flex items-center space-x-2 text-xs text-blue-600 font-medium hover:underline"
          >
            <CheckCircleIcon className="w-4 h-4" />
            <span>Actionables</span>
          </button>
        </div>
      </div>
    </div>
  );
};

// ------------------------ Main Content Component ------------------------

const MainContent: React.FC<MainContentProps> = ({
  view,
  circular,
  summary,
  loadingSummary,
  insights,
  loadingInsights,
}) => {

  const clauses: Clause[] = circular.clauses ?? [];

  // NEW: Track selected clause + panel open state
  const [selectedClause, setSelectedClause] = useState<Clause | null>(null);
  const [isActionablesOpen, setActionablesOpen] = useState(false);

  const handleActionableClick = (clause: Clause) => {
    setSelectedClause(clause);
    setActionablesOpen(true);
  };

  return (
    <>
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">

        {/* Title row */}
        <div className="flex items-start justify-between mb-6">
          <h1 className="text-2xl font-bold text-slate-900 leading-snug max-w-4xl">
            {circular.title}
          </h1>
          <button className="p-2 text-red-500 bg-red-50 rounded-md hover:bg-red-100">
            <TrashIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Dates */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <DateInfoCard label="Issue Date" date={circular.issueDate} icon={CalendarIcon} />
          <DateInfoCard label="Due Date" date={circular.dueDate} icon={CalendarIcon} />
          <DateInfoCard label="Effective Date" date={circular.effectiveDate} icon={CalendarIcon} />
        </div>

        {/* Tags */}
        <div className="flex flex-col space-y-2 mb-10">
          {circular.circularNo && (
            <TagInfoRow
              label="Circular No"
              value={circular.circularNo}
              icon={HashtagIcon}
              color="bg-blue-100 text-blue-800"
            />
          )}

          <TagInfoRow
            label="Common Tag"
            value={circular.commonTag}
            icon={TagIcon}
            color={circular.tagColor}
          />
        </div>

        {/* Summary */}
        <div className="mb-10">
          <h2 className="text-lg font-semibold text-slate-900 mb-3">
            Summary (AI-Generated)
          </h2>

          {loadingSummary ? (
            <p className="text-sm text-slate-500 italic animate-pulse">
              Generating summary…
            </p>
          ) : summary ? (
            <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
              {summary}
            </p>
          ) : (
            <p className="text-sm text-slate-400 italic">
              No summary available.
            </p>
          )}
        </div>

        {/* Clauses */}
        <div>
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Clauses</h2>

          {clauses.length === 0 ? (
            <p className="text-sm text-slate-500 italic">Generating clauses…</p>
          ) : (
            <div className="space-y-4">
              {clauses.map((clause, i) => (
                <ClauseItem
                  key={i}
                  clause={clause}
                  onActionableClick={handleActionableClick}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 🔥 Right Panel */}
      <ClauseActionablesPanel
        isOpen={isActionablesOpen}
        onClose={() => setActionablesOpen(false)}
        clause={selectedClause}
      />
    </>
  );
};

export default MainContent;
