import React, { useState, useEffect, useMemo } from 'react';
import { XIcon, SearchIcon, UploadAltIcon } from './Icons';
import { detailedAudits } from '../data';
import { Control } from '../types';

interface UploadEvidenceModalProps {
  isOpen: boolean;
  onClose: () => void;
  auditId: string | null;
}

const UploadEvidenceModal: React.FC<UploadEvidenceModalProps> = ({ isOpen, onClose, auditId }) => {
  const [isMounted, setIsMounted] = useState(false);
  const [show, setShow] = useState(false);
  
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedControls, setSelectedControls] = useState<Set<string>>(new Set());

  const audit = auditId ? detailedAudits[auditId] : null;
  
  // The controls in the image are different, let's use a sample list that matches the screenshot
  const modalControls = [
      { id: '1', name: 'Non-Zero Basic Salary' },
      { id: '2', name: 'Consistent Formatting' },
      { id: '3', name: 'Income Tax Above 2% Threshold' },
      { id: '4', name: 'Income Tax INR Denomination' },
      { id: '5', name: 'Format Validity' },
      { id: '6', name: 'Net Pay Recalculation' },
  ];

  const filteredControls = useMemo(() => 
    modalControls.filter(control => 
      control.name.toLowerCase().includes(searchTerm.toLowerCase())
    ), [searchTerm]);

  useEffect(() => {
    if (isOpen) {
      setIsMounted(true);
      const timer = setTimeout(() => setShow(true), 20);
      return () => clearTimeout(timer);
    } else {
      setShow(false);
      const timer = setTimeout(() => {
        setIsMounted(false);
        // Reset state on close
        setSelectedFile(null);
        setSearchTerm('');
        setSelectedControls(new Set());
      }, 300); // Match transition duration
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!isMounted) {
    return null;
  }
  
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setSelectedFile(event.target.files[0]);
    }
  };
  
  const handleControlToggle = (controlId: string) => {
    setSelectedControls(prev => {
        const newSet = new Set(prev);
        if (newSet.has(controlId)) {
            newSet.delete(controlId);
        } else {
            newSet.add(controlId);
        }
        return newSet;
    });
  };
  
  const handleSelectAll = () => {
    const allVisibleIds = filteredControls.map(c => c.id);
    setSelectedControls(new Set(allVisibleIds));
  };
  
  const handleClear = () => {
    setSelectedControls(new Set());
  };
  
  const isUploadDisabled = !selectedFile || selectedControls.size === 0;

  return (
    <>
      <div
        className={`fixed inset-0 bg-black z-40 transition-opacity duration-300 ease-in-out ${
          show ? 'bg-opacity-50' : 'bg-opacity-0'
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
        aria-labelledby="upload-modal-title"
      >
        <div
          className="bg-white rounded-lg shadow-xl w-full max-w-lg flex flex-col overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          <header className="flex items-center justify-between p-5 border-b border-gray-200 flex-shrink-0">
            <div>
              <h2 id="upload-modal-title" className="text-lg font-semibold text-gray-900">Upload Evidence Files</h2>
              <p className="text-sm text-gray-500">First select files, then choose the controls to upload them to.</p>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1 rounded-full">
              <XIcon className="w-5 h-5" />
            </button>
          </header>

          <div className="p-6 flex-1 overflow-y-auto space-y-5">
            <div>
                <label className="text-sm font-medium text-gray-700">Select Files</label>
                <div className="mt-1">
                    <label htmlFor="file-upload" className="w-full text-left cursor-pointer bg-white border border-gray-300 rounded-md shadow-sm px-3 py-2 flex items-center text-sm">
                        <span className="text-gray-700">Choose files</span>
                        <span className="ml-3 text-gray-500">{selectedFile ? selectedFile.name : 'No file chosen'}</span>
                    </label>
                    <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleFileChange} />
                </div>
            </div>
            
            <div>
                <div className="flex items-center justify-between mb-2">
                    <div className="relative flex-grow">
                        <SearchIcon className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                            type="text"
                            placeholder="Search controls..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                    </div>
                    <div className="flex items-center space-x-2 ml-4">
                        <button onClick={handleSelectAll} className="px-3 py-1.5 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">Select All</button>
                        <button onClick={handleClear} className="px-3 py-1.5 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">Clear</button>
                    </div>
                </div>

                <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
                    {filteredControls.length > 0 ? filteredControls.map(control => (
                        <label key={control.id} className="flex items-center p-3 rounded-md border border-gray-200 bg-white hover:bg-gray-50 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={selectedControls.has(control.id)}
                                onChange={() => handleControlToggle(control.id)}
                                className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                            />
                            <span className="ml-3 text-sm text-gray-800">{control.name}</span>
                        </label>
                    )) : (
                        <p className="text-center text-sm text-gray-500 p-4">No controls found.</p>
                    )}
                </div>
            </div>
          </div>

          <footer className="p-5 bg-gray-50 border-t border-gray-200">
            <button
                type="button"
                disabled={isUploadDisabled}
                className="w-full flex justify-center items-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gray-800 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
                <UploadAltIcon className="w-5 h-5 mr-2" />
                Upload to Selected Controls
            </button>
          </footer>
        </div>
      </div>
    </>
  );
};

export default UploadEvidenceModal;
