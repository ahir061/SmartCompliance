import React from 'react';
import { SearchIcon, UploadIcon, ChevronRightIcon, SupportIcon } from './Icons';
import { View } from '../types';

interface HeaderProps {
    view: View;
    breadcrumbs: string[];
    onBack?: () => void;
}

const Header: React.FC<HeaderProps> = ({ view, breadcrumbs, onBack }) => {
  return (
    <header className="flex flex-col mb-6">
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
      
        <div className="flex items-center text-sm text-gray-500">
            {view === 'circularDetails' && onBack ? (
                 <>
                    <button onClick={onBack} className="hover:underline">{breadcrumbs[0]}</button>
                    {breadcrumbs.slice(1).map((crumb, index) => (
                        <React.Fragment key={index}>
                            <ChevronRightIcon className="w-4 h-4 mx-1" />
                            <span className={index === breadcrumbs.length - 2 ? "text-gray-800 font-medium truncate" : ""}>{crumb}</span>
                        </React.Fragment>
                    ))}
                </>
            ) : view === 'circularDetails' ? (
                <>
                    {breadcrumbs.map((crumb, index) => (
                        <React.Fragment key={index}>
                            <span className={index === breadcrumbs.length - 1 ? "text-gray-800 font-medium truncate" : ""}>{crumb}</span>
                            {index < breadcrumbs.length - 1 && <ChevronRightIcon className="w-4 h-4 mx-1" />}
                        </React.Fragment>
                    ))}
                </>
            ) : (
                <>
                    <span>Actionables</span>
                    <ChevronRightIcon className="w-4 h-4 mx-1" />
                    <span className="text-gray-800 font-medium truncate">Ensure separate disclosure of recurring expenses for direct and regular plans.</span>
                </>
            )}
        </div>

    </header>
  );
};

export default Header;