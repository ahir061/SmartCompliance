import React, { useState } from 'react';
import { detailedAudits } from '../data';
import { Control, ControlGroup, AuditFindingItem } from '../types';
import { 
    ChevronRightIcon, 
    ChevronDownIcon,
    CheckCircleIcon, 
    TrashIcon, 
    CalendarIcon, 
    ControlIcon, 
    BarChartIcon,
    DownloadIcon,
    SearchIcon,
    UploadAltIcon,
    BookmarkIcon,
    PencilIcon,
    CircleIcon,
    InformationCircleIcon,
    PlusIcon
} from './Icons';

interface AuditDetailsProps {
  auditId: string;
  onBack: () => void;
  onOpenUploadModal: () => void;
  onOpenControlDetails: (controlId: string) => void;
}

const SummaryCard: React.FC<{ title: string; children: React.ReactNode; }> = ({ title, children }) => (
    <div className="bg-white rounded-lg border border-gray-200 p-4 flex-1">
        <h3 className="font-semibold text-gray-800 text-sm mb-3">{title}</h3>
        {children}
    </div>
);

const LegendItem: React.FC<{ color: string; label: string; value: number }> = ({ color, label, value }) => (
    <div className="flex justify-between items-center text-xs">
        <div className="flex items-center">
            <span className={`w-2 h-2 rounded-full mr-2 ${color}`}></span>
            <span className="text-gray-600">{label}</span>
        </div>
        <span className="font-medium text-gray-800">{value}</span>
    </div>
);

const ProgressBar: React.FC<{ bars: { color: string; value: number }[]; total: number }> = ({ bars, total }) => {
    if (total === 0) return <div className="h-1.5 bg-gray-200 rounded-full"></div>;
    return (
        <div className="flex h-1.5 rounded-full overflow-hidden my-1">
            {bars.map((bar, index) => (
                <div key={index} className={bar.color} style={{ width: `${(bar.value / total) * 100}%` }}></div>
            ))}
        </div>
    );
};

const ControlRow: React.FC<{ control: Control; onOpenControlDetails: (controlId: string) => void; }> = ({ control, onOpenControlDetails }) => {
    return (
        <tr className="border-b border-gray-200 text-sm text-gray-700">
            <td className="py-3 px-4">
                <div className="flex items-center font-medium">
                    <ChevronRightIcon className="w-4 h-4 mr-2" />
                    {control.name}
                    <InformationCircleIcon className="w-4 h-4 ml-1.5 text-gray-400" />
                </div>
            </td>
            <td className="py-3 px-4">{control.weightage}</td>
            <td className="py-3 px-4">{control.artifacts}</td>
            <td className="py-3 px-4"><CircleIcon className="w-5 h-5 text-gray-400" /></td>
            <td className="py-3 px-4">
                <span className={`font-semibold ${control.scoreStatus === 'good' ? 'text-green-600' : 'text-red-600'}`}>
                    {control.score.toFixed(2)}
                </span>
                <button onClick={() => control.details && onOpenControlDetails(control.id)} className="ml-1.5 align-middle p-1 rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-gray-400 disabled:opacity-50 disabled:cursor-not-allowed" disabled={!control.details}>
                  <InformationCircleIcon className={`w-4 h-4 ${!control.details ? 'text-gray-400' : (control.scoreStatus === 'good' ? 'text-green-500' : 'text-red-500')}`} />
                </button>
            </td>
            <td className="py-3 px-4"><PencilIcon className="w-5 h-5 text-gray-500 cursor-pointer hover:text-blue-600"/></td>
        </tr>
    );
};

const ScorecardChart: React.FC<{ controlGroups?: ControlGroup[] }> = ({ controlGroups }) => {
    if (!controlGroups) return null;

    const size = 320;
    const center = size / 2;
    const maxRadius = size / 2 * 0.8; // Use 80% of half size for padding
    const startAngleDeg = -180;
    const endAngleDeg = 0;

    const polarToCartesian = (centerX: number, centerY: number, radius: number, angleInDegrees: number) => {
        const angleInRadians = (angleInDegrees * Math.PI) / 180.0;
        return {
            x: centerX + radius * Math.cos(angleInRadians),
            y: centerY + radius * Math.sin(angleInRadians),
        };
    };

    const describeArc = (x: number, y: number, radius: number, startAngle: number, endAngle: number) => {
        const start = polarToCartesian(x, y, radius, endAngle);
        const end = polarToCartesian(x, y, radius, startAngle);
        const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';
        const d = ['M', start.x, start.y, 'A', radius, radius, 0, largeArcFlag, 0, end.x, end.y, 'L', x, y, 'Z'].join(' ');
        return d;
    };

    const describeScaleArc = (x: number, y: number, radius: number, startAngle: number, endAngle: number) => {
        const start = polarToCartesian(x, y, radius, startAngle);
        const end = polarToCartesian(x, y, radius, endAngle);
        const d = ['M', start.x, start.y, 'A', radius, radius, 0, 0, 1, end.x, end.y].join(' ');
        return d;
    };

    const totalWeight = controlGroups.reduce((sum, group) => sum + parseFloat(group.weight), 0);
    let angleAccumulator = startAngleDeg;

    const paths = controlGroups.map(group => {
        const weightPercentage = parseFloat(group.weight) / totalWeight;
        const sweepAngle = weightPercentage * (endAngleDeg - startAngleDeg);
        const pathStartAngle = angleAccumulator;
        const pathEndAngle = angleAccumulator + sweepAngle;
        angleAccumulator = pathEndAngle;

        const radius = (group.score / group.totalScore) * maxRadius;

        return {
            d: describeArc(center, center, radius, pathStartAngle, pathEndAngle),
            fill: group.color,
        };
    });

    const scaleValues = [2.5, 5, 7.5, 10];

    return (
        <div className="relative" style={{ width: size, height: size / 2 + 20}}>
             <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="absolute top-[-140px] left-0 transform -rotate-90">
                {/* Segments */}
                <g>
                    {paths.map((path, index) => (
                        <path key={index} d={path.d} fill={path.fill} />
                    ))}
                </g>

                {/* Scale Rings */}
                <g>
                    {scaleValues.map(value => {
                        const radius = (value / 10) * maxRadius;
                        return (
                            <path
                                key={value}
                                d={describeScaleArc(center, center, radius, startAngleDeg, endAngleDeg)}
                                fill="none"
                                stroke="white"
                                strokeWidth="1.5"
                                strokeDasharray="4,4"
                            />
                        );
                    })}
                </g>
            </svg>
            {/* Labels */}
            <div className="absolute top-[-10px] left-0 w-full h-full">
                 {scaleValues.map(value => {
                     const radius = (value / 10) * maxRadius;
                     return (
                        <span 
                            key={`label-${value}`}
                            className="absolute text-xs text-gray-700 font-medium"
                            style={{ 
                                left: '50%', 
                                top: `${center - radius}px`, 
                                transform: 'translateX(-120%)' 
                            }}
                        >
                           {value.toFixed(2)}
                        </span>
                     )
                 })}
            </div>
        </div>
    );
};

const FindingCard: React.FC<{ finding: AuditFindingItem }> = ({ finding }) => {
    const priorityColor = {
        High: 'bg-red-100 text-red-700',
        Medium: 'bg-yellow-100 text-yellow-700',
        Low: 'bg-blue-100 text-blue-700',
    }[finding.priority];

    return (
        <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex justify-between items-start mb-2">
                <h4 className="font-semibold text-gray-800 pr-4">{finding.title}</h4>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-md whitespace-nowrap ${priorityColor}`}>
                    {finding.priority}
                </span>
            </div>
            <p className="text-sm text-gray-600 leading-relaxed mb-4">
                {finding.description}
            </p>
            <div className="border-t border-gray-100 pt-3 grid grid-cols-3 gap-x-4 gap-y-2 text-sm">
                <div>
                    <p className="text-xs text-gray-500 mb-0.5">Finding Date</p>
                    <p className="font-medium text-gray-700">{finding.findingDate}</p>
                </div>
                <div>
                    <p className="text-xs text-gray-500 mb-0.5">Nature</p>
                    <p className="font-medium text-gray-700">{finding.nature}</p>
                </div>
                <div>
                    <p className="text-xs text-gray-500 mb-0.5">Linked Controls</p>
                    <p className="font-medium text-gray-700">{finding.linkedControls}</p>
                </div>
            </div>
        </div>
    );
};


const AuditDetails: React.FC<AuditDetailsProps> = ({ auditId, onBack, onOpenUploadModal, onOpenControlDetails }) => {
    const [activeTab, setActiveTab] = useState('Audit Findings');
    const audit = detailedAudits[auditId];
    
    if (!audit || !audit.details) {
        return <div className="flex-1 p-6">Audit details not found.</div>;
    }

    const { details } = audit;
    const taskProgress = details.taskDetails.compliant;
    const taskTotal = details.taskDetails.total;
    const taskPercentage = taskTotal > 0 ? Math.round((taskProgress / taskTotal) * 100) : 0;
    
    const findingsProgress = details.findingDetails.resolved;
    const findingsTotal = details.findingDetails.total;
    const findingsPercentage = findingsTotal > 0 ? Math.round((findingsProgress / findingsTotal) * 100) : 0;

    const taskBars = [
        { color: 'bg-green-500', value: details.taskDetails.compliant },
        { color: 'bg-red-500', value: details.taskDetails.nonCompliant },
        { color: 'bg-yellow-400', value: details.taskDetails.partiallyCompliant },
        { color: 'bg-orange-400', value: details.taskDetails.notedForCompliance },
    ];
    
    const findingBars = [
        { color: 'bg-red-500', value: details.findingDetails.resolved },
        { color: 'bg-green-500', value: details.findingDetails.inProgress },
        { color: 'bg-orange-400', value: details.findingDetails.open },
        { color: 'bg-yellow-400', value: details.findingDetails.new },
    ];

    const tabs = ['Controls', 'Scorecard', 'Audit Findings', 'Audit Tasks'];

    const colorMap: { [key: string]: string } = {
        fuchsia: 'bg-fuchsia-500',
        orange: 'bg-orange-500',
        green: 'bg-green-500',
        blue: 'bg-blue-500',
    };
    
  return (
    <main className="flex-1 flex flex-col p-6 bg-gray-50 overflow-y-auto">
        {/* Header */}
        <header className="flex items-center justify-between w-full mb-6">
            <div>
                <div className="flex items-center text-sm text-gray-500">
                    <button onClick={onBack} className="hover:underline">Audits</button>
                    <ChevronRightIcon className="w-4 h-4 mx-1" />
                    <span>{details.breadcrumbs[1]}</span>
                    <ChevronRightIcon className="w-4 h-4 mx-1" />
                    <span className="text-gray-800 font-medium truncate">{details.breadcrumbs[2]}</span>
                </div>
                <div className="mt-4 flex items-center space-x-4">
                    <div className="flex items-center bg-white border border-gray-200 rounded-md px-3 py-1.5">
                        <span className="text-sm">{details.lastRunDate}</span>
                        <ChevronDownIcon className="w-4 h-4 ml-2 text-gray-500" />
                    </div>
                    <button className="px-4 py-1.5 bg-gray-800 text-white font-semibold rounded-md text-sm hover:bg-gray-700">
                        Run Again
                    </button>
                    <div className="flex items-center text-sm text-green-600">
                        <CheckCircleIcon className="w-5 h-5 mr-2" />
                        <span>{details.lastRunStatus}</span>
                    </div>
                </div>
            </div>
        </header>

        {/* Summary Cards */}
        <div className="flex space-x-6 mb-6">
            <div className="bg-white rounded-lg border border-gray-200 p-4 flex-1">
                <div className="flex justify-between items-start">
                    <div>
                        <h2 className="text-lg font-semibold text-gray-800">{audit.title}</h2>
                        <p className="text-sm text-gray-500 mt-1">{audit.description}</p>
                    </div>
                    <button className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md">
                        <TrashIcon className="w-5 h-5" />
                    </button>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-3 gap-4 text-sm">
                    <div className="flex items-center text-gray-600">
                        <CalendarIcon className="w-5 h-5 mr-2 text-gray-400"/>
                        <div>
                            <span className="block text-xs">Audit date</span>
                            <span className="font-semibold text-gray-800">{audit.auditDate}</span>
                        </div>
                    </div>
                     <div className="flex items-center text-gray-600">
                        <ControlIcon className="w-5 h-5 mr-2 text-gray-400"/>
                        <div>
                            <span className="block text-xs">Controls</span>
                            <span className="font-semibold text-gray-800">{audit.controls}</span>
                        </div>
                    </div>
                     <div className="flex items-center text-gray-600">
                        <BarChartIcon className="w-5 h-5 mr-2 text-gray-400"/>
                        <div>
                            <span className="block text-xs">Audit Score</span>
                            <span className="font-semibold text-gray-800">{audit.auditScore.toFixed(2)}</span>
                        </div>
                    </div>
                </div>
            </div>
            
            <SummaryCard title={`Tasks ${taskPercentage}% (${taskProgress}/${taskTotal})`}>
                <ProgressBar bars={taskBars} total={taskTotal} />
                <div className="space-y-1.5 mt-2">
                    <LegendItem color="bg-green-500" label="Compliant" value={details.taskDetails.compliant} />
                    <LegendItem color="bg-red-500" label="Non-Compliant" value={details.taskDetails.nonCompliant} />
                    <LegendItem color="bg-yellow-400" label="Partially Compliant" value={details.taskDetails.partiallyCompliant} />
                    <LegendItem color="bg-orange-400" label="Noted for Compliance" value={details.taskDetails.notedForCompliance} />
                </div>
                <button className="w-full text-center mt-3 py-1.5 border border-gray-200 rounded-md text-sm hover:bg-gray-50 font-medium text-gray-700">
                    Download Progress Report
                </button>
            </SummaryCard>

            <SummaryCard title={`Audit Findings ${findingsPercentage}% (${findingsProgress}/${findingsTotal})`}>
                <ProgressBar bars={findingBars} total={findingsTotal} />
                <div className="space-y-1.5 mt-2">
                    <LegendItem color="bg-red-500" label="Resolved" value={details.findingDetails.resolved} />
                    <LegendItem color="bg-green-500" label="In Progress" value={details.findingDetails.inProgress} />
                    <LegendItem color="bg-orange-400" label="Open" value={details.findingDetails.open} />
                    <LegendItem color="bg-yellow-400" label="New" value={details.findingDetails.new} />
                </div>
                <button className="w-full text-center mt-3 py-1.5 border border-gray-200 rounded-md text-sm hover:bg-gray-50 font-medium text-gray-700">
                    Download Findings Report
                </button>
            </SummaryCard>
        </div>

        {/* Tabbed Content */}
        <div className="bg-white rounded-lg border border-gray-200">
            <div className="border-b border-gray-200 px-4">
                <nav className="-mb-px flex space-x-6">
                    {tabs.map(tab => (
                        <button 
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`py-3 px-1 text-sm font-medium ${
                                activeTab === tab 
                                ? 'border-b-2 border-gray-800 text-gray-800'
                                : 'border-b-2 border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                        >
                            {tab}
                        </button>
                    ))}
                </nav>
            </div>
            
            {activeTab === 'Controls' && (
                <div className="p-4">
                    <div className="flex justify-between items-center mb-4">
                         <div className="flex items-center bg-white border border-gray-200 rounded-md px-3 py-1 w-full max-w-xs">
                            <SearchIcon className="w-4 h-4 text-gray-400" />
                            <input type="text" placeholder="Search controls..." className="ml-2 bg-transparent focus:outline-none w-full text-sm"/>
                        </div>
                        <div className="flex items-center space-x-2">
                             <button onClick={onOpenUploadModal} className="p-2 bg-white border border-gray-200 rounded-md hover:bg-gray-50">
                                <UploadAltIcon className="w-5 h-5 text-gray-600" />
                            </button>
                            <button className="p-2 bg-gray-800 text-white rounded-md hover:bg-gray-700">
                                <BookmarkIcon className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 border-b border-gray-200 text-xs text-gray-500 uppercase tracking-wider">
                            <tr>
                                <th className="py-2 px-4 font-medium">Control</th>
                                <th className="py-2 px-4 font-medium">Weightage</th>
                                <th className="py-2 px-4 font-medium">Artifacts</th>
                                <th className="py-2 px-4 font-medium">Status</th>
                                <th className="py-2 px-4 font-medium">Score</th>
                                <th className="py-2 px-4 font-medium">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {details.controlsList.map(control => (
                                <ControlRow key={control.id} control={control} onOpenControlDetails={onOpenControlDetails} />
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
            {activeTab === 'Scorecard' && (
                <div className="p-6">
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 flex justify-between items-center mb-6">
                        <div>
                            <h3 className="font-semibold text-gray-800">Your AI generated audit report is ready</h3>
                            <div className="flex items-center space-x-4 text-sm mt-2">
                                <span className="bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-md font-medium">Score: {audit.auditScore.toFixed(2)}/10.00</span>
                                <span className="text-gray-600">Findings Closed: {details.findingDetails.resolved}/{details.findingDetails.total}</span>
                                <span className="text-gray-600">Controls: {audit.controls}</span>
                            </div>
                        </div>
                        <button className="bg-white border border-gray-300 rounded-md px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
                            Download Now
                        </button>
                    </div>

                    <div className="p-4">
                         <h4 className="text-sm font-medium text-gray-500 mb-4">All Controls</h4>
                         <div className="flex">
                            <div className="w-1/2 flex items-center justify-center">
                               <ScorecardChart controlGroups={details.controlGroups} />
                            </div>
                            <div className="w-1/2 grid grid-cols-2 gap-4 pl-8">
                                {details.controlGroups?.map(group => {
                                    const scoreColor = group.score < 5 ? 'text-red-600 bg-red-100' : 'text-green-600 bg-green-100';
                                    return (
                                        <div key={group.name} className="bg-white border border-gray-200 rounded-lg p-3 hover:shadow-sm cursor-pointer">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <div className="flex items-center">
                                                        <span className={`w-2 h-2 rounded-full mr-2 ${colorMap[group.color]}`}></span>
                                                        <h5 className="font-semibold text-gray-800 text-sm">{group.name}</h5>
                                                    </div>
                                                    <p className="text-xs text-gray-500 mt-1">Weight: {group.weight}</p>
                                                </div>
                                                <ChevronRightIcon className="w-4 h-4 text-gray-400" />
                                            </div>
                                            <div className={`mt-3 inline-block px-2 py-0.5 rounded-md text-sm font-semibold ${scoreColor}`}>
                                                {group.score.toFixed(2)}/{group.totalScore.toFixed(2)}
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    </div>
                </div>
            )}
            {activeTab === 'Audit Findings' && (
                 <div className="p-6">
                    <div className="flex justify-between items-center mb-6">
                         <div className="flex items-center bg-white border border-gray-200 rounded-md px-3 py-1.5 w-full max-w-xs">
                            <SearchIcon className="w-4 h-4 text-gray-400" />
                            <input type="text" placeholder="Search findings..." className="ml-2 bg-transparent focus:outline-none w-full text-sm"/>
                        </div>
                        <button className="flex items-center text-sm font-medium bg-gray-800 text-white px-4 py-2 rounded-md hover:bg-gray-700">
                            <PlusIcon className="w-4 h-4 mr-2" />
                            Add Finding
                        </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {details.auditFindingsList?.map(finding => (
                            <FindingCard key={finding.id} finding={finding} />
                        ))}
                    </div>
                </div>
            )}
            {activeTab === 'Audit Tasks' && <div className="p-6 text-center text-gray-500">Content for {activeTab}</div>}
        </div>
    </main>
  );
};

export default AuditDetails;