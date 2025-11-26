import React, { useState, useEffect } from 'react';
import { XIcon, ArrowPathIcon, ClockIcon, CpuChipIcon, CubeIcon, ChatBubbleLeftIcon, ChevronRightIcon, TrashIcon } from './Icons';

interface AIChatPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const PreviousChatItem: React.FC<{text: string}> = ({ text }) => (
    <div className="flex items-center p-3 hover:bg-gray-100 rounded-lg cursor-pointer">
        <ChatBubbleLeftIcon className="w-5 h-5 text-gray-500" />
        <span className="ml-3 text-sm text-gray-800 truncate flex-1">{text}</span>
        <ChevronRightIcon className="w-4 h-4 text-gray-400 mx-2" />
        <TrashIcon className="w-4 h-4 text-gray-400 hover:text-red-500" />
    </div>
);

const AIChatPanel: React.FC<AIChatPanelProps> = ({ isOpen, onClose }) => {
  const [isMounted, setIsMounted] = useState(false);
  const [show, setShow] = useState(false);

  const previousChats = [
    "which is the latest circular t...",
    "latest circular on NBFCs by ...",
    "Master Direction - Reserve ...",
    "tell me about the circular on...",
    "latest circular by RBI on NB...",
  ];

  useEffect(() => {
    if (isOpen) {
      setIsMounted(true);
      const timer = setTimeout(() => setShow(true), 20);
      return () => clearTimeout(timer);
    } else {
      setShow(false);
      const timer = setTimeout(() => setIsMounted(false), 300); // Match transition duration
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!isMounted) {
    return null;
  }

  return (
    <>
        <div
            className={`fixed inset-0 bg-black z-40 transition-opacity duration-300 ease-in-out ${
                show ? 'bg-opacity-30' : 'bg-opacity-0'
            }`}
            onClick={onClose}
        ></div>
        <aside
            className={`fixed top-0 right-0 h-full w-[24rem] bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out flex flex-col ${
                show ? 'translate-x-0' : 'translate-x-full'
            }`}
        >
            <div className="p-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-1">
                        <button className="p-2 rounded-md hover:bg-gray-100 text-gray-500 relative">
                            <ArrowPathIcon className="w-5 h-5" />
                            <span className="absolute top-2 right-2 block w-1.5 h-1.5 bg-red-500 rounded-full"></span>
                        </button>
                        <button className="p-2 rounded-md hover:bg-gray-100 text-gray-500">
                            <ClockIcon className="w-5 h-5" />
                        </button>
                    </div>
                    <button className="flex items-center bg-gray-800 text-white text-sm font-semibold px-3 py-1.5 rounded-md">
                        <CpuChipIcon className="w-5 h-5 mr-2"/>
                        FinArthGPT
                    </button>
                    <div className="flex items-center space-x-1">
                        <button className="p-2 rounded-md hover:bg-gray-100 text-gray-500">
                            <CubeIcon className="w-5 h-5" />
                        </button>
                        <button onClick={onClose} className="p-2 rounded-md hover:bg-gray-100 text-gray-500">
                            <XIcon className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>

            <div className="flex-1 p-4 overflow-y-auto">
                <h3 className="text-sm font-semibold text-gray-800 mb-2">Previous Chats</h3>
                <div className="space-y-1">
                    {previousChats.map((chat, index) => (
                        <PreviousChatItem key={index} text={chat} />
                    ))}
                </div>
            </div>

            <div className="p-4 border-t border-gray-200">
                <div className="relative">
                    <textarea 
                        rows={1}
                        placeholder="Type your message..." 
                        className="w-full p-2 pr-10 border border-gray-300 rounded-lg resize-none text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                    ></textarea>
                </div>
                <p className="text-xs text-gray-400 text-center mt-2">Enter key to send chat</p>
            </div>
        </aside>
    </>
  );
};

export default AIChatPanel;