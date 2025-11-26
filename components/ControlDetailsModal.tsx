import React, { useState, useEffect } from 'react';
import { XIcon } from './Icons';
import { detailedAudits } from '../data';

interface ControlDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  auditId: string | null;
  controlId: string | null;
}

const ControlDetailsModal: React.FC<ControlDetailsModalProps> = ({ isOpen, onClose, auditId, controlId }) => {
  const [isMounted, setIsMounted] = useState(false);
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsMounted(true);
      const timer = setTimeout(() => setShow(true), 20);
      return () => clearTimeout(timer);
    } else {
      setShow(false);
      const timer = setTimeout(() => {
        setIsMounted(false);
      }, 300); // Match transition duration
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const audit = auditId ? detailedAudits[auditId] : null;
  const control = audit?.details?.controlsList.find(c => c.id === controlId);

  if (!isMounted || !control) {
    return null;
  }
  
  return (
    <>
      <div
        className={`fixed inset-0 bg-black z-40 transition-opacity duration-300 ease-in-out ${
          show ? 'bg-opacity-60' : 'bg-opacity-0'
        }`}
        onClick={onClose}
        aria-hidden="true"
      ></div>
      <div
        className={`fixed inset-0 flex items-center justify-center z-50 p-4 transition-all duration-300 ease-in-out ${
          show ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
        }`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="control-details-modal-title"
      >
        <div
          className="bg-white rounded-lg shadow-xl w-full max-w-3xl flex flex-col overflow-hidden max-h-[90vh]"
          onClick={(e) => e.stopPropagation()}
        >
          <header className="flex items-center justify-between p-5 border-b border-gray-200 flex-shrink-0">
            <div>
              <h2 id="control-details-modal-title" className="text-xl font-semibold text-gray-900">{control.name}</h2>
              <p className="text-sm text-gray-600 mt-1">Score: {control.score.toFixed(2)}</p>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1 rounded-full">
              <XIcon className="w-6 h-6" />
            </button>
          </header>

          <div className="p-6 flex-1 overflow-y-auto space-y-6 bg-gray-50">
            {control.details?.evidenceFiles.map((file, index) => (
                <div key={index} className="bg-white p-5 rounded-lg border border-gray-200">
                    <h3 className="font-semibold text-gray-800">{file.name}</h3>
                    <p className="text-sm font-medium text-gray-600 my-2">[Score (for this file): {file.score}]</p>
                    <p className="text-sm text-gray-700 leading-relaxed">{file.analysis}</p>
                </div>
            ))}
            
            {control.details?.findings && control.details.findings.length > 0 && (
                <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-3">Findings</h3>
                    <div className="space-y-4">
                        {control.details.findings.map((finding, index) => (
                             <div key={index} className="bg-white p-5 rounded-lg border border-gray-200">
                                <h4 className="font-semibold text-gray-800">{finding.title}</h4>
                                <p className="mt-2 text-sm text-gray-700 leading-relaxed">{finding.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default ControlDetailsModal;
