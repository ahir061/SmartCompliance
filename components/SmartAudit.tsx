import React, { useState } from 'react';
import { SearchIcon, UploadIcon, SupportIcon, ChevronDownIcon, FolderIcon, PlusIcon } from './Icons';
import AuditCard from './AuditCard';
import { audits } from '../data';

const regulators = ['SEBI', 'RBI', 'NSE', 'BSE', 'FINRA', 'SEC', 'FCA', 'SAMA', 'MAS', 'NPCI'];

interface SmartAuditProps {
    onAuditClick: (auditId: string) => void;
}

const SmartAuditHeader: React.FC = () => (
    <div className="flex flex-col mb-6">
        <div className="flex items-center justify-between w-full mb-4">
            <div className="flex items-center bg-white border border-gray-200 rounded-md px-3 py-1.5 w-full max-w-md">
                <SearchIcon className="w-5 h-5 text-gray-400" />
                <input
                type="text"
                placeholder="Search or ask..."
                className="ml-2 bg-transparent focus:outline-none w-full text-sm"
                />
                <span className="text-xs text-gray-400 border border-gray-200 rounded px-1.5 py-0.5">Ctrl+K</span>
            </div>
            <div className="flex items-center space-x-4">
                <button className="flex items-center text-sm bg-white border border-gray-200 rounded-md px-3 py-1.5 hover:bg-gray-50">
                    <UploadIcon className="w-4 h-4 mr-2" />
                    Upload
                </button>
                <button className="flex items-center text-sm bg-yellow-400 text-black rounded-md px-3 py-1.5 font-semibold hover:bg-yellow-500">
                    <SupportIcon className="w-4 h-4 mr-2" />
                    Get Support
                </button>
            </div>
        </div>
        <div className="flex items-center space-x-2">
            {regulators.map((reg, index) => (
                <button key={reg} className={`px-4 py-1.5 text-sm font-medium rounded-md ${
                    reg === 'SEBI' 
                    ? 'bg-gray-800 text-white' 
                    : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
                }`}>
                    {reg}
                </button>
            ))}
            <button className="p-2 bg-white border border-gray-200 rounded-md hover:bg-gray-50">
                <ChevronDownIcon className="w-4 h-4 text-gray-600" />
            </button>
        </div>
    </div>
);

const SmartAudit: React.FC<SmartAuditProps> = ({ onAuditClick }) => {
    const [selectedAudit, setSelectedAudit] = useState('Internal Audit_MT13');
    const activeAudits = audits.filter(a => !a.isAddNew);
  
  return (
    <main className="flex-1 flex flex-col p-6 overflow-y-auto bg-gray-50">
      <SmartAuditHeader />
      <div className="flex-1 grid grid-cols-12 gap-6">
        <div className="col-span-3">
            <h2 className="text-base font-semibold text-gray-800 mb-4">Audits ({activeAudits.length} Active)</h2>
            <div className="space-y-1">
                {activeAudits.map(audit => (
                     <button 
                        key={audit.id} 
                        onClick={() => setSelectedAudit(audit.title)}
                        className={`w-full text-left p-2 rounded-md flex items-center ${
                            selectedAudit === audit.title ? 'bg-blue-100' : 'hover:bg-gray-100'
                        }`}
                     >
                        <FolderIcon className={`w-5 h-5 mr-3 ${selectedAudit === audit.title ? 'text-blue-600' : 'text-gray-500'}`} />
                        <span className={`text-sm font-medium ${selectedAudit === audit.title ? 'text-blue-700' : 'text-gray-700'}`}>{audit.title}</span>
                     </button>
                ))}
            </div>
        </div>
        <div className="col-span-9">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center bg-white border border-gray-200 rounded-md px-3 py-1.5 w-full max-w-xs">
                    <SearchIcon className="w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search audits..."
                        className="ml-2 bg-transparent focus:outline-none w-full text-sm"
                    />
                </div>
                <button className="flex items-center text-sm font-medium bg-white text-gray-700 border border-gray-300 px-3 py-1.5 rounded-md hover:bg-gray-50">
                    <PlusIcon className="w-4 h-4 mr-2" />
                    Add Audit
                </button>
            </div>
            <div className="grid grid-cols-2 gap-6">
                {audits.map(audit => (
                    <AuditCard key={audit.id} audit={audit} onClick={onAuditClick} />
                ))}
            </div>
        </div>
      </div>
    </main>
  );
};

export default SmartAudit;