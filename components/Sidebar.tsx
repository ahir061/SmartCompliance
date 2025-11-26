import React from 'react';
import {
    FinArthLogoIcon,
    ClockIcon,
    SmartAcquireIcon,
    DocumentTextIcon,
    SmartAuditIcon,
    CheckCircleIcon,
    SmartInsightsIcon
} from './Icons';

interface SidebarProps {
  currentMode: 'compliance' | 'audit';
  onModeChange: (mode: 'compliance' | 'audit') => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentMode, onModeChange }) => {
    const navLinks = [
        { name: 'Dashboard', icon: ClockIcon, key: 'dashboard' },
        { name: 'SmartAcquire', icon: SmartAcquireIcon, key: 'acquire' },
        { name: 'SmartCollect', icon: DocumentTextIcon, key: 'collect' },
        { name: 'SmartAudit', icon: SmartAuditIcon, key: 'audit' },
        { name: 'SmartComply', icon: CheckCircleIcon, key: 'comply' },
        { name: 'SmartInsights', icon: SmartInsightsIcon, key: 'insights', status: 'soon' },
    ];
    
    // Determine the active key. 'acquire' is the default as per the screenshot.
    let activeKey = 'acquire';
    if (currentMode === 'compliance') {
        activeKey = 'comply';
    } else if (currentMode === 'audit') {
        activeKey = 'audit';
    }
    
    const getOnClick = (itemKey: string) => {
        if (itemKey === 'comply') return () => onModeChange('compliance');
        if (itemKey === 'audit') return () => onModeChange('audit');
        // For other items, you can define their actions here in the future
        return () => console.log(`Navigate to ${itemKey}`);
    };

  return (
    <aside className="w-64 bg-[#212936] text-white flex flex-col p-4 flex-shrink-0">
      <div className="flex items-center space-x-3 mb-10 px-2 pt-2">
        <FinArthLogoIcon className="w-9 h-9 flex-shrink-0" />
        <div>
            <span className="text-2xl font-bold block leading-tight">FinArth.AI</span>
            <span className="text-xs text-gray-400">Enterprise Banking AI</span>
        </div>
      </div>
      
      <nav className="flex-1">
        <ul className="space-y-2">
          {navLinks.map(item => (
            <li key={item.key}>
              <button 
                onClick={getOnClick(item.key)}
                className={`w-full flex items-center text-left p-3 rounded-lg transition-colors duration-200 ${
                  activeKey === item.key
                    ? 'bg-[#0F172A] text-white'
                    : 'text-gray-300 hover:bg-slate-700'
                }`}
              >
                <item.icon className="w-5 h-5 mr-4 flex-shrink-0" />
                <span className="flex-1 font-medium text-sm">{item.name}</span>
                {item.status === 'soon' && (
                    <span className="bg-amber-400 text-amber-900 text-xs font-semibold px-2 py-0.5 rounded-full">Soon</span>
                )}
              </button>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;