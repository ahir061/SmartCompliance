import React, { useState } from 'react';
import { CheckCircleSolidIcon, LinkIcon, ChevronDownIcon, DocumentIcon, UserIcon, PencilIcon, PlusIcon, CalendarIcon, DownloadIcon, InformationCircleIcon, TrashIcon, XCircleSolidIcon } from './Icons';

interface ActionableDetailsProps {
    onEditClick: () => void;
}

const StatusIcon: React.FC<{ status: 'done' | 'pending' | 'review' }> = ({ status }) => {
    const color = {
        done: 'text-green-500',
        pending: 'text-orange-400',
        review: 'text-red-500',
    }[status];
    
    const borderColor = {
        done: 'border-green-500',
        pending: 'border-orange-400',
        review: 'border-red-500',
    }[status];

    const bgColor = {
        done: 'bg-green-500',
        pending: 'bg-orange-400',
        review: 'bg-red-500',
    }[status];

    return (
        <div className={`w-5 h-5 rounded-full border-2 ${borderColor} flex items-center justify-center flex-shrink-0`}>
            {status !== 'done' && <div className={`w-2 h-2 rounded-full ${bgColor}`}></div>}
        </div>
    );
};


const SubActionableCard: React.FC<{ title: string; status: 'done' | 'pending' | 'review', docs: number, assignees: number, onEditClick: () => void; }> = ({ title, status, docs, assignees, onEditClick }) => {
    return (
        <div onClick={onEditClick} className="bg-white p-4 rounded-lg border border-gray-200 flex flex-col justify-between min-h-[120px] cursor-pointer hover:shadow-md transition-shadow">
            <div className="flex items-start">
                <StatusIcon status={status} />
                <p className="ml-3 text-sm text-gray-800 leading-relaxed">{title}</p>
            </div>
            <div className="flex items-center justify-between mt-4">
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <span className="flex items-center"><DocumentIcon className="w-4 h-4 mr-1"/> {docs}</span>
                    <span className="flex items-center"><UserIcon className="w-4 h-4 mr-1"/> {assignees}</span>
                </div>
                <div className="p-1 text-gray-400">
                    <PencilIcon className="w-4 h-4"/>
                </div>
            </div>
        </div>
    );
};

const Tab: React.FC<{ label: string; active: boolean; onClick: () => void }> = ({ label, active, onClick }) => (
    <button
        onClick={onClick}
        className={`px-4 py-2 text-sm font-medium rounded-md flex-1 text-center ${
            active ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500 hover:bg-gray-200'
        }`}
    >
        {label}
    </button>
);

const ActionableDetails: React.FC<ActionableDetailsProps> = ({ onEditClick }) => {
    const [activeTab, setActiveTab] = useState('Compliance Checklist');
    const [showAiEvaluation, setShowAiEvaluation] = useState(false);
    const tabs = ['Compliance Checklist', 'Department Checklist', 'Reporting', 'Disclosures'];

    return (
        <div className="space-y-6">
            {/* Main Actionable Card */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-start">
                    <CheckCircleSolidIcon className="w-7 h-7 text-green-500 mr-4 flex-shrink-0 mt-0.5" />
                    <div>
                        <h1 className="text-xl font-semibold text-gray-800">
                            Ensure separate disclosure of recurring expenses for direct and regular plans.
                        </h1>
                        <p className="flex items-center text-sm text-gray-500 mt-2">
                            <LinkIcon className="w-4 h-4 mr-1.5" />
                            Disclosure of expenses, half yearly returns, yield and risk-o-met...
                        </p>
                    </div>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-200">
                     <button className="flex items-center justify-between w-full text-sm font-medium text-gray-700">
                        <span>Source Clause</span>
                        <ChevronDownIcon className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Sub-actionables Section */}
            <div>
                <h2 className="text-xs font-semibold text-gray-500 tracking-wider mb-3">SUBACTIONABLES</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <SubActionableCard 
                        title="Identify and segregate total recurring expenses for direct and regular plans as per Sl. No. 6.4 of Twelfth Schedule and Regulation 59 of SEBI (Mutual Funds) Regulations, 1996."
                        status="pending"
                        docs={0}
                        assignees={2}
                        onEditClick={onEditClick}
                    />
                    <SubActionableCard 
                        title="Prepare a detailed report showcasing separate recurring expenses for direct and regular plans along with the total scheme expenses."
                        status="pending"
                        docs={0}
                        assignees={1}
                        onEditClick={onEditClick}
                    />
                    <SubActionableCard 
                        title="Review the prepared disclosures to ensure compliance with the Twelfth Schedule and Regulation 59 requirements."
                        status="review"
                        docs={0}
                        assignees={1}
                        onEditClick={onEditClick}
                    />
                </div>
                 <button className="mt-4 flex items-center text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-md border border-gray-200">
                    <PlusIcon className="w-4 h-4 mr-2" />
                    Add Sub-actionable
                </button>
            </div>

            {/* Checklist Section */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="p-1 bg-gray-100 rounded-lg flex items-center space-x-1 mb-6">
                    {tabs.map(tab => (
                        <Tab key={tab} label={tab} active={activeTab === tab} onClick={() => setActiveTab(tab)} />
                    ))}
                </div>

                <div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label htmlFor="frequency" className="block text-sm font-medium text-gray-700 mb-1">Frequency</label>
                            <select id="frequency" className="w-full bg-white border border-gray-300 rounded-md shadow-sm pl-3 pr-10 py-2 text-left cursor-default focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                                <option>Select frequency</option>
                                <option>Daily</option>
                                <option>Weekly</option>
                                <option>Monthly</option>
                            </select>
                        </div>
                        <div>
                             <label htmlFor="testing-date" className="block text-sm font-medium text-gray-700 mb-1">Next Testing Date</label>
                             <div className="relative">
                                <input type="text" id="testing-date" placeholder="dd/mm/yyyy" className="w-full bg-white border border-gray-300 rounded-md shadow-sm pl-3 pr-10 py-2 text-left focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"/>
                                <CalendarIcon className="w-5 h-5 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2"/>
                             </div>
                        </div>
                    </div>

                    <div className="mt-8 pt-8 border-t border-gray-200 space-y-6">
                        <div>
                            <label htmlFor="compliance-status" className="block text-sm font-medium text-gray-700 mb-1">Compliance Status</label>
                            <select id="compliance-status" className="w-full bg-white border border-gray-300 rounded-md shadow-sm pl-3 pr-10 py-2 text-left cursor-default focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                                <option>Select status</option>
                            </select>
                        </div>

                        <div className="pt-2">
                            <button className="w-full bg-gray-900 text-white font-semibold py-2.5 px-4 rounded-md hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 text-sm">
                                Update Compliance Checklist
                            </button>
                        </div>
                        
                        <div className="pt-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Evidence of Testing</label>
                            <div className="flex items-center mt-2">
                                <label htmlFor="file-upload" className="cursor-pointer bg-white py-1.5 px-3 border border-gray-300 rounded-md shadow-sm text-sm leading-4 font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                                    Choose file
                                </label>
                                <input id="file-upload" name="file-upload" type="file" className="sr-only" />
                                <span className="ml-3 text-sm text-gray-500">No file chosen</span>
                            </div>
                        </div>

                        <div>
                            <h3 className="text-sm font-medium text-gray-700 mb-2">Previously Uploaded Files</h3>
                            <div className="bg-gray-100 border border-gray-200 rounded-lg p-3">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center min-w-0">
                                        <DocumentIcon className="w-10 h-10 text-blue-500 flex-shrink-0" />
                                        <div className="ml-3 min-w-0">
                                            <p className="text-sm font-medium text-gray-900 truncate">Report_on_Recurring_Expenses_for_Direct_and_Regular_Plans.pdf</p>
                                            <p className="text-xs text-gray-500">Uploaded on Mar 28th, 2025</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-1 ml-4 flex-shrink-0">
                                        <button className="p-1.5 text-gray-500 hover:bg-gray-200 rounded-md">
                                            <DownloadIcon className="w-5 h-5" />
                                        </button>
                                        <button onClick={() => setShowAiEvaluation(!showAiEvaluation)} className="p-1.5 text-gray-500 hover:bg-gray-200 rounded-md">
                                            <InformationCircleIcon className="w-5 h-5" />
                                        </button>
                                        <button className="p-1.5 text-red-500 hover:bg-red-100 rounded-md">
                                            <TrashIcon className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                            {showAiEvaluation && (
                                <div className="mt-4">
                                    <a href="#" onClick={e => e.preventDefault()} className="text-sm font-medium text-blue-600 hover:underline">
                                        View AI Evaluation Results
                                    </a>
                                    <div className="mt-3 bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-3">
                                        <div className="flex items-baseline">
                                            <h4 className="font-semibold text-gray-800 text-sm">Compliance Score:</h4>
                                            <span className="ml-2 font-bold text-green-600 text-base">90.0%</span>
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-gray-800 text-sm mb-2">Feedback Points:</h4>
                                            <ul className="space-y-2 text-sm text-gray-700">
                                                <li className="flex items-start">
                                                    <CheckCircleSolidIcon className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                                                    <span>The report clearly identifies and segregates total recurring expenses for direct and regular plans as required by Sl. No. 6.4 of Twelfth Schedule and Regulation 59 of SEBI (Mutual Funds) Regulations, 1996. The breakdown is provided in Section 2 of the report, showing separate expense categories for both direct and regular plans.</span>
                                                </li>
                                                <li className="flex items-start">
                                                    <CheckCircleSolidIcon className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                                                    <span>A detailed report has been prepared showcasing separate recurring expenses for direct and regular plans along with the total scheme expenses. This is evident in Sections 2 and 3 of the report, which provide a comprehensive breakdown of expenses and total scheme expenses for both plan types.</span>
                                                </li>
                                                <li className="flex items-start">
                                                    <CheckCircleSolidIcon className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                                                    <span>The report appears to have been reviewed to ensure compliance with the Twelfth Schedule and Regulation 59 requirements. This is indicated by the level of detail provided and the inclusion of key observations and recommendations that align with regulatory guidelines.</span>
                                                </li>
                                                <li className="flex items-start">
                                                    <XCircleSolidIcon className="w-5 h-5 text-red-500 mr-2 mt-0.5 flex-shrink-0" />
                                                    <span>While the report is comprehensive, it does not explicitly state that it has been reviewed for compliance with the Twelfth Schedule and Regulation 59 requirements. Including a statement confirming this review would enhance the report’s compliance.</span>
                                                </li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ActionableDetails;