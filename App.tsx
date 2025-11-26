import React, { useState, useRef, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import MainContent from './components/MainContent';
import RightSidebar from './components/RightSidebar';
import ClauseActionablesPanel from './components/ClauseActionablesPanel';
import CircularsList from './components/CircularsList';
import SmartAudit from './components/SmartAudit';
import ReferencesModal from './components/ReferencesModal';
import ReferenceDetailsPage from './components/ReferenceDetailsPage';
import ChapterModal from './components/ChapterModal';

import FinArthGPTDock from "./components/FinArthGPTDock";

import { View, Circular, Clause, Insights } from './types';

const App: React.FC = () => {

  const [appMode, setAppMode] = useState<'compliance' | 'audit'>('compliance');
  const [currentView, setCurrentView] = useState<View>('circularsList');

  const [circulars, setCirculars] = useState<Record<string, Circular>>({});
  const [selectedCircular, setSelectedCircular] = useState<Circular | null>(null);

  // Reference Details Page State
  const [referenceDetailsData, setReferenceDetailsData] = useState<any>(null);

  // Chapter Modal State
  const [isChapterModalOpen, setIsChapterModalOpen] = useState(false);
  const [activeChapter, setActiveChapter] = useState<any>(null);

  // LLM States
  const [summary, setSummary] = useState<string>("");
  const [loadingSummary, setLoadingSummary] = useState(false);

  const [clauses, setClauses] = useState<Clause[]>([]);
  const [loadingClauses, setLoadingClauses] = useState(false);

  const [insights, setInsights] = useState<Insights | null>(null);
  const [loadingInsights, setLoadingInsights] = useState(false);

  // Clause Panel State
  const [isClausePanelOpen, setIsClausePanelOpen] = useState(false);
  const [selectedClause, setSelectedClause] = useState<Clause | null>(null);

  // References modal
  const [isReferencesModalOpen, setIsReferencesModalOpen] = useState(false);
  const [activeReferenceId, setActiveReferenceId] = useState<string | null>(null);

  const mainContentRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (mainContentRef.current) mainContentRef.current.scrollTop = 0;
  }, [currentView, selectedCircular]);

  // =========================================================
  // FETCH SUMMARY
  // =========================================================
  const fetchSummary = async (id: string) => {
    setSummary("");
    setLoadingSummary(true);

    try {
      const r = await fetch(`${import.meta.env.VITE_API_URL}/circulars/${id}/summary-live`);
      const j = await r.json();
      setSummary(j.summary ?? "⚠ No summary generated.");
    } catch {
      setSummary("❌ Failed to load summary.");
    }

    setLoadingSummary(false);
  };

  // =========================================================
  // FETCH CLAUSES
  // =========================================================
  const fetchClauses = async (id: string) => {
    setClauses([]);
    setLoadingClauses(true);

    try {
      const r = await fetch(`${import.meta.env.VITE_API_URL}/circulars/${id}/clauses-live`);
      const j = await r.json();
      setClauses(j.clauses ?? []);
    } catch {
      setClauses([]);
    }

    setLoadingClauses(false);
  };

  // =========================================================
  // FETCH INSIGHTS
  // =========================================================
  const fetchInsights = async (id: string) => {
    setInsights(null);
    setLoadingInsights(true);

    try {
      const r = await fetch(`${import.meta.env.VITE_API_URL}/circulars/${id}/insights-live`);
      const j = await r.json();
      setInsights(j ?? null);
    } catch {
      setInsights(null);
    }

    setLoadingInsights(false);
  };

  // =========================================================
  // SELECT CIRCULAR
  // =========================================================
  const handleSelectCircular = (c: Circular) => {
    setReferenceDetailsData(null);
    setSelectedCircular(c);
    setCurrentView('circularDetails');

    fetchSummary(c.id);
    fetchClauses(c.id);
    fetchInsights(c.id);
  };

  // =========================================================
  // WHEN USER CLICKS ACTIONABLES (IMPORTANT)
  // =========================================================
  const handleOpenActionables = (clause: Clause) => {
    setSelectedClause(clause);      // store selected clause
    setIsClausePanelOpen(true);     // open panel
  };

  // =========================================================
  // OPEN REFERENCE MODAL
  // =========================================================
  const handleReferenceClick = (refId: string) => {
    setActiveReferenceId(refId);
    setIsReferencesModalOpen(true);
  };

  // =========================================================
  // OPEN FULL REFERENCE PAGE
  // =========================================================
  const handleOpenReferenceDetails = async (refData: any) => {
    if (!selectedCircular?.id || !refData?.id) return;

    let summary = "Summary unavailable.";

    try {
      const r = await fetch(
        `${import.meta.env.VITE_API_URL}/circulars/${selectedCircular.id}/references/${refData.id}/summary-live`
      );
      const j = await r.json();
      summary = j.summary || summary;
    } catch {
      summary = "Failed to fetch summary.";
    }

    let chapters: any[] = [];

    try {
      const r = await fetch(
        `${import.meta.env.VITE_API_URL}/references/${refData.id}/chapters-live`
      );
      const j = await r.json();
      chapters = j.chapters || [];
    } catch {
      chapters = [];
    }

    setReferenceDetailsData({
      ...refData,
      llm_summary: summary,
      chapters: chapters,
      id: refData.id,
    });

    setIsReferencesModalOpen(false);
    setCurrentView("referenceDetails");
  };

  // =========================================================
  // OPEN CHAPTER MODAL
  // =========================================================
  const handleOpenChapter = (chapter) => {
    setActiveChapter(chapter);
    setIsChapterModalOpen(true);
  };

  // =========================================================
  // BACK TO LIST
  // =========================================================
  const handleBackToCircularsList = () => {
    setReferenceDetailsData(null);
    setCurrentView('circularsList');
    setSelectedCircular(null);
    setSummary("");
    setClauses([]);
    setInsights(null);
  };

  // =========================================================
  // RENDER
  // =========================================================
  return (
    <div className="bg-gray-50 min-h-screen flex text-gray-800">

      <Sidebar currentMode={appMode} onModeChange={setAppMode} />

      <div className="flex-1 flex flex-col">
        <div className="h-1.5 bg-gradient-to-r from-purple-400 via-pink-500 to-yellow-400"></div>

        {appMode === 'compliance' ? (
          <div className="flex flex-1 overflow-hidden">
            <main ref={mainContentRef} className="flex-1 overflow-y-auto p-8">

              {currentView !== 'circularsList' &&
                currentView !== 'referenceDetails' &&
                selectedCircular && (
                  <Header
                    view={currentView}
                    breadcrumbs={selectedCircular.breadcrumbs}
                    onBack={handleBackToCircularsList}
                  />
                )}

              {currentView === 'circularsList' && (
                <CircularsList
                  onCircularSelect={handleSelectCircular}
                  onCircularsLoaded={(loaded) => setCirculars(loaded)}
                />
              )}

              {selectedCircular && currentView === 'circularDetails' && (
                <MainContent
                  view={currentView}
                  circular={{ ...selectedCircular, clauses, insights }}
                  summary={summary}
                  loadingSummary={loadingSummary}
                  insights={insights}
                  loadingInsights={loadingInsights}
                  onActionableClick={handleOpenActionables}
                />
              )}

              {currentView === "referenceDetails" && referenceDetailsData && (
                <ReferenceDetailsPage
                  reference={referenceDetailsData}
                  onBack={handleBackToCircularsList}
                  onOpenChapter={handleOpenChapter}
                />
              )}

            </main>

            {currentView === 'circularDetails' && selectedCircular && (
              <RightSidebar
                circular={{ ...selectedCircular, insights }}
                onReferenceClick={handleReferenceClick}
              />
            )}
          </div>
        ) : (
          <SmartAudit onAuditClick={() => {}} />
        )}
      </div>

      {/* Clause Actionables Panel */}
      <ClauseActionablesPanel
        isOpen={isClausePanelOpen}
        onClose={() => setIsClausePanelOpen(false)}
        clause={selectedClause}
      />

      {/* References Modal */}
      <ReferencesModal
        isOpen={isReferencesModalOpen}
        referenceId={activeReferenceId}
        circularId={selectedCircular?.id ?? null}
        onClose={() => setIsReferencesModalOpen(false)}
        onOpenReferencePage={handleOpenReferenceDetails}
      />

      {/* Chapter Modal */}
      <ChapterModal
        isOpen={isChapterModalOpen}
        onClose={() => setIsChapterModalOpen(false)}
        chapter={activeChapter}
        reference={referenceDetailsData}
      />

      {/* Floating BankLLM Dock */}
      <FinArthGPTDock />
    </div>
  );
};

export default App;
