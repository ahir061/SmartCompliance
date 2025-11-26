import React, { useState, useMemo, useEffect } from "react";
import { SearchIcon, ChevronRightIcon, CalendarIcon, HashtagIcon } from "./Icons";
import { Circular } from "../types";

interface CircularsListProps {
  onCircularSelect: (circular: Circular) => void;
  onCircularsLoaded?: (loaded: Record<string, Circular>) => void;
}

// Restore ALL tabs
const regulators = ["SEBI", "RBI", "NSE", "BSE", "FINRA"];

// Tag colors
const tagColors: Record<string, string> = {
  "Department of Regulation": "bg-blue-100 text-blue-700",
  "Department of Supervision": "bg-green-100 text-green-700",
  "Department of Consumer Education": "bg-purple-100 text-purple-700",
  General: "bg-gray-100 text-gray-700",
};

const CircularsList: React.FC<CircularsListProps> = ({
  onCircularSelect,
  onCircularsLoaded,
}) => {
  const [activeRegulator, setActiveRegulator] = useState<string>("RBI");
  const [searchTerm, setSearchTerm] = useState("");

  const [rbiCirculars, setRbiCirculars] = useState<Circular[]>([]);
  const [sebiCirculars, setSebiCirculars] = useState<Circular[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // =============================
  // FETCH RBI CIRCULARS
  // =============================
  const loadRbiCirculars = async () => {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/circulars`);
    const data = await res.json();

    const mapped: Circular[] = data.map((c: any) => ({
      id: String(c.id),
      regulator: "RBI",
      title: c.subject,
      breadcrumbs: ["Circulars", "RBI", c.subject],
      issueDate: c.date_of_issue,
      dueDate: "No due date assigned",
      effectiveDate: c.date_of_issue,
      circularNo: c.circular_number || null,
      commonTag: c.department || "General",
      tagColor: tagColors[c.department] || tagColors.General,
      summary: c.subject,
      hasClauses: true,
      referencesCount: 0,
    }));

    setRbiCirculars(mapped);
  };

  // =============================
  // FETCH SEBI CIRCULARS
  // =============================
  const loadSebiCirculars = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/sebi-circulars`);
      const data = await res.json();

      const mapped: Circular[] = data.map((c: any) => ({
        id: `SEBI-${c.id}`,
        regulator: "SEBI",
        title: c.subject,
        breadcrumbs: ["Circulars", "SEBI", c.subject],
        issueDate: c.date_of_issue,
        dueDate: "No due date assigned",
        effectiveDate: c.date_of_issue,
        circularNo: null,
        commonTag: c.department || "General",
        tagColor: tagColors[c.department] || tagColors.General,
        summary: c.subject,
        hasClauses: false,
        referencesCount: 0,
      }));

      setSebiCirculars(mapped);
    } catch (e) {
      console.error("SEBI fetch failed", e);
    }
  };

  // =============================
  // INITIAL LOAD — RBI + SEBI
  // =============================
  useEffect(() => {
    (async () => {
      try {
        await Promise.all([loadRbiCirculars(), loadSebiCirculars()]);
      } catch {
        setError("Failed to load circulars.");
      }
      setLoading(false);
    })();
  }, []);

  // =============================
  // MERGE RESULTS BY REGULATOR
  // =============================
  const allCirculars = useMemo(() => {
    switch (activeRegulator) {
      case "RBI":
        return rbiCirculars;
      case "SEBI":
        return sebiCirculars;
      default:
        return []; // NSE, BSE, FINRA future support
    }
  }, [activeRegulator, rbiCirculars, sebiCirculars]);

  // =============================
  // SEARCH FILTER
  // =============================
  const filteredCirculars = useMemo(() => {
    return allCirculars.filter((c) =>
      c.title.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [allCirculars, searchTerm]);

  // =============================
  // RENDER
  // =============================
  return (
    <div className="flex-1 flex flex-col overflow-y-auto bg-gray-50">
      <header className="flex flex-col mb-4">
        <h1 className="text-2xl font-semibold text-gray-800 mb-2 tracking-tight">
          Circulars
        </h1>

        {/* Tabs + Search */}
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center space-x-1 border-b border-gray-200">
            {regulators.map((reg) => (
              <button
                key={reg}
                onClick={() => setActiveRegulator(reg)}
                className={`px-4 py-2 text-sm font-medium focus:outline-none ${
                  activeRegulator === reg
                    ? "border-b-2 border-gray-800 text-gray-800"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {reg}
              </button>
            ))}
          </div>

          <div className="flex items-center bg-white border border-gray-200 rounded-md px-3 py-1.5 w-full max-w-sm">
            <SearchIcon className="w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search circulars..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="ml-2 bg-transparent focus:outline-none w-full text-sm"
            />
          </div>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="flex-1">
        {loading && (
          <div className="text-center py-16 text-gray-500">
            Loading circulars...
          </div>
        )}
        {error && (
          <div className="text-center py-16 text-red-500">{error}</div>
        )}

        {!loading && !error && (
          <div className="space-y-4">
            {filteredCirculars.length > 0 ? (
              filteredCirculars.map((circular) => (
                <div
                  key={circular.id}
                  onClick={() => onCircularSelect(circular)}
                  className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm hover:shadow-md hover:border-blue-400 transition-all cursor-pointer"
                >
                  <div className="flex justify-between items-start">
                    <h2 className="text-lg font-semibold text-gray-800 max-w-4xl">
                      {circular.title}
                    </h2>
                    <ChevronRightIcon className="w-6 h-6 text-gray-400 flex-shrink-0 ml-4 mt-1" />
                  </div>

                  <div className="flex items-center space-x-6 text-sm text-gray-500 mt-3">
                    <div className="flex items-center">
                      <CalendarIcon className="w-4 h-4 mr-2" />
                      <span>{circular.issueDate}</span>
                    </div>

                    {circular.circularNo && (
                      <div className="flex items-center">
                        <HashtagIcon className="w-4 h-4 mr-2" />
                        <span>{circular.circularNo}</span>
                      </div>
                    )}

                    <div className="flex items-center">
                      <span
                        className={`px-2.5 py-1 text-xs font-medium rounded-md ${circular.tagColor}`}
                      >
                        {circular.commonTag}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-16">
                <p className="text-gray-500">
                  No circulars found for {activeRegulator}.
                </p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default CircularsList;
