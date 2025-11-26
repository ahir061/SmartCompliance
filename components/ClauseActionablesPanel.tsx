import React, { useState, useEffect } from 'react';
import { PencilIcon, XIcon } from './Icons';
import { Clause } from '../types';

interface ClauseActionablesPanelProps {
  isOpen: boolean;
  onClose: () => void;
  clause: Clause | null;
}

const Tag: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="flex items-center bg-blue-50 rounded-md px-2 py-0.5">
    <div className="w-1.5 h-1.5 bg-blue-400 rounded-full mr-1.5"></div>
    <span className="text-sm text-blue-700">{children}</span>
  </div>
);

const SubActionableItem: React.FC<{
  title: string;
  description: string;
  tags: string[];
}> = ({ title, description, tags }) => (
  <div className="bg-white p-4 rounded-lg border border-gray-200">
    <p className="text-gray-800 font-medium text-sm">{title}</p>
    <p className="text-gray-600 text-sm mt-2 leading-6">{description}</p>

    <div className="flex justify-between items-center mt-3">
      <div className="flex items-center space-x-2">
        {tags.map(tag => (
          <Tag key={tag}>{tag}</Tag>
        ))}
      </div>
    </div>
  </div>
);

const ClauseActionablesPanel: React.FC<ClauseActionablesPanelProps> = ({
  isOpen,
  onClose,
  clause,
}) => {
  const [isMounted, setIsMounted] = useState(false);
  const [show, setShow] = useState(false);
  const [actionables, setActionables] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // OPEN/CLOSE animation
  useEffect(() => {
    if (isOpen) {
      setIsMounted(true);
      setTimeout(() => setShow(true), 20);
    } else {
      setShow(false);
      setTimeout(() => setIsMounted(false), 300);
    }
  }, [isOpen]);

  // 🔥 Fetch LLM Actionables when clause changes
  useEffect(() => {
    if (!clause) return;

    const fetchActionables = async () => {
      setLoading(true);
      setActionables([]);

      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/generate-actionables`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ clause: clause.clause }),
        });

        const data = await res.json();
        setActionables(data.actionables || []);
      } catch (err) {
        console.error("Actionable fetch error", err);
      }

      setLoading(false);
    };

    fetchActionables();
  }, [clause]);

  if (!isMounted) return null;

  return (
    <>
      <div
        className={`fixed inset-0 bg-black z-40 transition-opacity duration-300 ${
          show ? 'bg-opacity-30' : 'bg-opacity-0'
        }`}
        onClick={onClose}
      ></div>

      <aside
        className={`fixed top-0 right-0 h-full w-[40rem] bg-gray-50 shadow-2xl z-50 transform transition-transform duration-300 ${
          show ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          <header className="flex items-center justify-between p-6 border-b bg-white">
            <h2 className="text-lg font-semibold text-gray-900">
              Clause Actionables
            </h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-800">
              <XIcon className="w-5 h-5" />
            </button>
          </header>

          <div className="flex-1 p-6 overflow-y-auto">
            {!clause ? (
              <p>No clause selected.</p>
            ) : (
              <>
                {/* Clause Title */}
                <h3 className="font-semibold text-gray-800">{clause.clause}</h3>

                <p className="text-xs font-semibold text-gray-400 mt-3 mb-2 tracking-wider">
                  AI-GENERATED ACTIONABLES
                </p>

                {loading ? (
                  <p className="text-gray-500 text-sm animate-pulse">
                    Generating actionables…
                  </p>
                ) : (
                  <div className="space-y-3">
                    {actionables.map((act, i) => (
                      <SubActionableItem
                        key={i}
                        title={act.title}
                        description={act.description}
                        tags={act.departments}
                      />
                    ))}

                    {actionables.length === 0 && !loading && (
                      <p className="text-gray-400 text-sm">No actionables generated.</p>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </aside>
    </>
  );
};

export default ClauseActionablesPanel;
