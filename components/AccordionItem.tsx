import React, { useState } from "react";
import { ChevronDownIcon } from "./Icons";

interface AccordionItemProps {
  title: string;
  children: React.ReactNode;
  initiallyOpen?: boolean;
}

const AccordionItem: React.FC<AccordionItemProps> = ({
  title,
  children,
  initiallyOpen = false,
}) => {
  const [isOpen, setIsOpen] = useState(initiallyOpen);

  return (
    <div className="border-b border-slate-200 last:border-none">
      {/* Header */}
      <button
        type="button"
        className="w-full flex justify-between items-center py-3 text-slate-800 font-medium hover:text-slate-900"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="text-sm">{title}</span>
        <ChevronDownIcon
          className={`w-4 h-4 text-slate-500 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Content */}
      {isOpen && (
        <div className="py-2 text-sm text-slate-700 leading-relaxed">
          {children}
        </div>
      )}
    </div>
  );
};

export default AccordionItem;
