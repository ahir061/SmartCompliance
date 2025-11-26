import React, { useState } from "react";
import BankLLMSidebar from "./BankLLMSidebar";

const BankLLMDock = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="
          fixed bottom-6 right-6 z-50
          bg-black text-white font-semibold
          px-6 py-3 rounded-full shadow-lg
          hover:scale-105 transition-transform
        "
      >
        BankLLM
      </button>

      {/* Sidebar */}
      <BankLLMSidebar isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
};

export default BankLLMDock;
