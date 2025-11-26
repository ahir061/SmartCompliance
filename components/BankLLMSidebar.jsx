import React, { useState, useEffect, useRef } from "react";

const BankLLMSidebar = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState([]); // {role: 'user'|'assistant', content: '...'}
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const chatEndRef = useRef(null);

  // Auto-scroll
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMsg = { role: "user", content: input.trim() };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMsg.content }),
      });

      const data = await res.json();

      const botMsg = {
        role: "assistant",
        content: data.reply || "I couldn’t generate a response.",
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (e) {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Server error. Try again later." },
      ]);
    }

    setLoading(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") sendMessage();
  };

  return (
    <>
      {/* BACKDROP */}
      <div
        onClick={onClose}
        className={`
          fixed inset-0 bg-black/30 backdrop-blur-sm transition-opacity duration-300 
          ${isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}
        `}
      />

      {/* SLIDING SIDEBAR */}
      <div
        className={`
          fixed top-0 right-0 h-full w-[420px] bg-white shadow-xl border-l border-gray-200
          flex flex-col z-[9999] transition-transform duration-300 ease-in-out
          ${isOpen ? "translate-x-0" : "translate-x-full"}
        `}
      >
        {/* HEADER */}
        <div className="flex items-center justify-between p-5 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 tracking-tight">
            BankLLM
          </h2>

          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl leading-none"
          >
            ×
          </button>
        </div>

        {/* CHAT WINDOW */}
        <div className="flex-1 p-5 overflow-y-auto space-y-4">
          {messages.length === 0 && (
            <div className="text-center text-gray-400 text-sm mt-4">
              Ask anything related to RBI, SEBI, FEMA, compliance or regulations.
            </div>
          )}

          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`max-w-[80%] p-3 text-sm rounded-lg ${
                msg.role === "user"
                  ? "bg-black text-white ml-auto"
                  : "bg-gray-100 text-gray-800"
              }`}
            >
              {msg.content}
            </div>
          ))}

          {loading && (
            <div className="text-gray-400 text-sm">
              BankLLM is typing…
            </div>
          )}

          <div ref={chatEndRef}></div>
        </div>

        {/* INPUT BAR */}
        <div className="p-4 border-t border-gray-200 bg-white">
          <div className="flex items-center bg-gray-100 rounded-full px-4 py-2 shadow-sm">
            <input
              type="text"
              placeholder="Type your question…"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyPress}
              className="flex-1 bg-transparent outline-none text-sm placeholder-gray-500"
            />

            <button
              onClick={sendMessage}
              disabled={loading}
              className="
                ml-2 px-5 py-2 bg-black text-white rounded-full text-sm font-medium
                hover:bg-gray-900 active:scale-95 transition disabled:opacity-50
              "
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default BankLLMSidebar;
