import React from 'react';
import { Audit } from '../types';
import { ArrowPathIcon, PlusIcon } from './Icons';

interface AuditCardProps {
    audit: Audit;
    onClick: (auditId: string) => void;
}

const AuditProgressBar: React.FC<{ audit: Audit }> = ({ audit }) => {
    const { compliant, nonCompliant, partiallyCompliant } = audit.taskStatus;
    const total = audit.totalTasks;

    if (total === 0) return <div className="h-2 bg-gray-200 rounded-full"></div>;

    const compliantWidth = (compliant / total) * 100;
    const nonCompliantWidth = (nonCompliant / total) * 100;
    const partiallyCompliantWidth = (partiallyCompliant / total) * 100;

    return (
        <div className="flex h-2 rounded-full overflow-hidden my-2">
            <div className="bg-green-500" style={{ width: `${compliantWidth}%` }}></div>
            <div className="bg-yellow-400" style={{ width: `${partiallyCompliantWidth}%` }}></div>
            <div className="bg-red-500" style={{ width: `${nonCompliantWidth}%` }}></div>
             {(compliantWidth + nonCompliantWidth + partiallyCompliantWidth) < 100 && (
                <div className="bg-gray-200" style={{ width: `${100 - (compliantWidth + nonCompliantWidth + partiallyCompliantWidth)}%` }}></div>
            )}
        </div>
    );
};

const AuditCard: React.FC<AuditCardProps> = ({ audit, onClick }) => {

    const getScoreColorClasses = (score: number) => {
        if (score > 10) return "bg-green-100 text-green-800 border-green-200";
        if (score > 0) return "bg-yellow-100 text-yellow-800 border-yellow-200";
        return "bg-red-100 text-red-800 border-red-200";
    };

    const scoreColorClasses = getScoreColorClasses(audit.auditScore);

    const completedTasks = audit.taskStatus.compliant;
    const completionPercentage = audit.totalTasks > 0 ? Math.round((completedTasks / audit.totalTasks) * 100) : 0;
    
    const isClickable = !audit.isAddNew;

    return (
        <div className={`bg-white border border-gray-200 rounded-lg p-4 shadow-sm ${isClickable ? 'cursor-pointer hover:shadow-md' : ''}`}>
            <div className="flex items-center justify-between mb-2">
                <h3 
                    onClick={() => isClickable && onClick(audit.id)}
                    className="text-base font-semibold text-gray-800 flex items-center"
                >
                    {audit.isAddNew ? <PlusIcon className="w-5 h-5 mr-2 text-gray-500"/> : <ArrowPathIcon className="w-5 h-5 mr-2 text-gray-500" />}
                    <span className={isClickable ? 'hover:underline' : ''}>{audit.title}</span>
                </h3>
            </div>

            <div className="text-sm text-gray-500 mb-3">
                <span className="font-medium">Description:</span> {audit.description}
            </div>

            <div className="flex items-center space-x-4 text-sm text-gray-600 border-t border-b border-gray-200 py-3">
                <span>Audit date: <span className="font-medium text-gray-800">{audit.auditDate}</span></span>
                <span>Controls: <span className="font-medium text-gray-800">{audit.controls}</span></span>
                <span className={`border rounded px-2 py-0.5 ${scoreColorClasses}`}>
                    Audit Score: <span className="font-bold">{audit.auditScore.toFixed(2)}</span>
                </span>
            </div>

            <div className="mt-3">
                <div className="flex justify-between items-center text-sm">
                    <h4 className="font-medium text-gray-700">Task Status</h4>
                    <span className="font-semibold text-gray-800">{audit.isAddNew ? `0% (0/${audit.totalTasks})` : `${completionPercentage}% (${completedTasks}/${audit.totalTasks})`}</span>
                </div>
                {audit.isAddNew ? <div className="h-2 bg-gray-200 rounded-full my-2"></div> : <AuditProgressBar audit={audit} />}
                <div className="flex justify-between text-xs text-gray-500 mt-2">
                    <div className="flex items-center space-x-3">
                        {audit.taskStatus.compliant > 0 && <span><span className="inline-block w-2 h-2 bg-green-500 rounded-full mr-1.5"></span>Compliant: {audit.taskStatus.compliant}</span>}
                        {audit.taskStatus.partiallyCompliant > 0 && <span><span className="inline-block w-2 h-2 bg-yellow-400 rounded-full mr-1.5"></span>Partially Compliant: {audit.taskStatus.partiallyCompliant}</span>}
                        {audit.taskStatus.nonCompliant > 0 && <span><span className="inline-block w-2 h-2 bg-red-500 rounded-full mr-1.5"></span>Non-Compliant: {audit.taskStatus.nonCompliant}</span>}
                         {audit.isAddNew && audit.totalTasks > 0 && <span><span className="inline-block w-2 h-2 bg-gray-500 rounded-full mr-1.5"></span>Non-Compliant: {audit.totalTasks}</span>}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AuditCard;