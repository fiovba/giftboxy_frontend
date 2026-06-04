import { useEffect, useRef } from "react";
import { FiRefreshCw, FiSend, FiZap } from "react-icons/fi";

const SUGGESTIONS = [
  "My mom's birthday 🎂",
  "Valentine's for my girlfriend 💝",
  "Wedding gift for a friend 💍",
  "Graduation gift, $50 budget 🎓",
];

function ChatPanel({ messages, input, setInput, aiLoading, sendMessage, reset }) {
  const bottomRef = useRef(null);
  const inputRef  = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, aiLoading]);

  useEffect(() => {
    if (!aiLoading) inputRef.current?.focus();
  }, [aiLoading]);

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="flex flex-col bg-white rounded-[28px] shadow-[0_8px_40px_rgba(217,4,82,0.08)] border border-[#F5E0E8] overflow-hidden w-full lg:w-105 xl:w-115 lg:shrink-0 lg:h-full min-h-130">
      <ChatHeader onReset={reset} />
      <MessageList
        messages={messages}
        aiLoading={aiLoading}
        sendMessage={sendMessage}
        bottomRef={bottomRef}
      />
      <InputBar
        inputRef={inputRef}
        input={input}
        setInput={setInput}
        aiLoading={aiLoading}
        onKeyDown={handleKeyDown}
        onSend={sendMessage}
      />
    </div>
  );
}

function ChatHeader({ onReset }) {
  return (
    <div className="px-5 py-4 border-b border-[#F5E0E8] flex items-center justify-between shrink-0">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-2xl bg-linear-to-br from-[#FF6B9E] to-[#D90452] flex items-center justify-center text-lg shadow-sm">
          🎁
        </div>
        <div>
          <p className="font-black text-[#1E1B1B] text-sm leading-tight">Giftie</p>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full" />
            <p className="text-[10px] text-[#A0918B] font-semibold flex items-center gap-1">
              <FiZap size={9} className="text-amber-400" />
              Powered by Groq AI
            </p>
          </div>
        </div>
      </div>
      <button
        onClick={onReset}
        title="New conversation"
        className="w-8 h-8 rounded-full hover:bg-[#FDF0F4] flex items-center justify-center text-[#C0A8B0] hover:text-[#D90452] transition"
      >
        <FiRefreshCw size={13} />
      </button>
    </div>
  );
}

function MessageList({ messages, aiLoading, sendMessage, bottomRef }) {
  return (
    <div
      className="flex-1 overflow-y-auto overscroll-contain px-4 py-4 space-y-3"
      style={{ WebkitOverflowScrolling: "touch" }}
    >
      {messages.map((msg, idx) => (
        <ChatMessage key={idx} msg={msg} />
      ))}

      {aiLoading && <TypingIndicator />}

      {messages.length === 1 && !aiLoading && (
        <SuggestionList onSelect={sendMessage} />
      )}

      <div ref={bottomRef} />
    </div>
  );
}

function ChatMessage({ msg }) {
  const isUser = msg.role === "user";

  return (
    <div className={`flex gap-2 items-end msg-in ${isUser ? "justify-end" : "justify-start"}`}>
      {!isUser && (
        <div className="w-7 h-7 rounded-xl bg-linear-to-br from-[#FF6B9E] to-[#D90452] flex items-center justify-center text-xs shrink-0 mb-1">
          🎁
        </div>
      )}
      <div
        className={`max-w-[80%] px-4 py-2.5 text-sm leading-relaxed ${
          isUser
            ? "bg-[#D90452] text-white rounded-[18px] rounded-br-[5px] shadow-sm"
            : "bg-[#F8F1EC] text-[#1E1B1B] rounded-[18px] rounded-bl-[5px]"
        }`}
      >
        {msg.text}
      </div>
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="flex gap-2 items-end justify-start msg-in">
      <div className="w-7 h-7 rounded-xl bg-linear-to-br from-[#FF6B9E] to-[#D90452] flex items-center justify-center text-xs shrink-0">
        🎁
      </div>
      <div className="bg-[#F8F1EC] px-4 py-3 rounded-[18px] rounded-bl-[5px]">
        <div className="flex gap-1 items-center">
          <span className="typing-dot w-2 h-2 bg-[#D90452] rounded-full" />
          <span className="typing-dot w-2 h-2 bg-[#D90452] rounded-full" />
          <span className="typing-dot w-2 h-2 bg-[#D90452] rounded-full" />
        </div>
      </div>
    </div>
  );
}

function SuggestionList({ onSelect }) {
  return (
    <div className="pt-1 space-y-2">
      <p className="text-[10px] text-[#C0B0AA] font-bold uppercase tracking-widest text-center">
        Quick start
      </p>
      {SUGGESTIONS.map((s) => (
        <button
          key={s}
          onClick={() => onSelect(s)}
          className="w-full text-left text-xs bg-[#FDF8F6] border border-[#EFE4DF] text-[#5A4848] px-4 py-2.5 rounded-2xl hover:border-[#D90452] hover:bg-[#FDF0F4] hover:text-[#D90452] transition font-semibold"
        >
          {s}
        </button>
      ))}
    </div>
  );
}

function InputBar({ inputRef, input, setInput, aiLoading, onKeyDown, onSend }) {
  return (
    <div className="px-4 py-3 border-t border-[#F5E0E8] shrink-0">
      <div className="flex items-end gap-2 bg-[#FDF8F6] border border-[#EFE4DF] rounded-2xl px-4 py-2.5 focus-within:border-[#D90452] focus-within:shadow-[0_0_0_3px_rgba(217,4,82,0.07)] transition-all">
        <textarea
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder="Tell me who you're shopping for..."
          className="flex-1 bg-transparent outline-none resize-none text-sm text-[#1E1B1B] placeholder:text-[#C0B0AA] max-h-24"
          rows={1}
        />
        <button
          onClick={() => onSend()}
          disabled={aiLoading || !input.trim()}
          className="w-8 h-8 bg-[#D90452] text-white rounded-xl flex items-center justify-center shrink-0 disabled:opacity-30 btn-press transition shadow-sm"
        >
          <FiSend size={13} />
        </button>
      </div>
      <p className="text-[10px] text-[#D0C0BA] text-center mt-1.5">
        Enter to send · Shift+Enter for new line
      </p>
    </div>
  );
}

export default ChatPanel;
