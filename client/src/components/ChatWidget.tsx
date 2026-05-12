/* ==========================================================================
   BUILD LEVEL — AI Customer Service Chat Widget
   Branded dark/orange chat bubble, bottom-right corner, powered by built-in LLM
   ========================================================================== */

import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Loader2, Bot, User } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { trpc } from "@/lib/trpc";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const QUICK_REPLIES = [
  "What's your return policy?",
  "How long does shipping take?",
  "What sizes do you offer?",
  "How do I track my order?",
];

const GREETING: Message = {
  role: "assistant",
  content: "Welcome to BUILD LEVEL. I'm here to help with orders, shipping, sizing, and returns. What can I help you with today?",
};

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([GREETING]);
  const [input, setInput] = useState("");
  const [unread, setUnread] = useState(0);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const sendMessage = trpc.chat.message.useMutation({
    onSuccess: (data) => {
      setMessages((prev) => [...prev, { role: "assistant", content: data.reply }]);
      if (!open) setUnread((n) => n + 1);
    },
    onError: () => {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Sorry, I'm having trouble connecting. Please email info@buildlevel.com for help." },
      ]);
    },
  });

  useEffect(() => {
    if (open) {
      setUnread(0);
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [open]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = (text?: string) => {
    const content = (text ?? input).trim();
    if (!content || sendMessage.isPending) return;

    const newMessages: Message[] = [...messages, { role: "user", content }];
    setMessages(newMessages);
    setInput("");

    sendMessage.mutate({
      messages: newMessages.filter((m) => m.role === "user" || m.role === "assistant"),
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      {/* Chat Panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="w-[340px] bg-[#1A1A1A] border border-white/10 shadow-2xl flex flex-col overflow-hidden"
            style={{ height: "480px" }}
          >
            {/* Header */}
            <div className="bg-[#FF6B00] px-4 py-3 flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 bg-white/20 flex items-center justify-center">
                  <Bot size={14} className="text-white" />
                </div>
                <div>
                  <p className="font-display text-xs font-bold text-white tracking-widest">BUILD LEVEL SUPPORT</p>
                  <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-300 animate-pulse" />
                    <p className="font-body text-[10px] text-white/80">Online — Replies instantly</p>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="text-white/70 hover:text-white transition-colors"
                aria-label="Close chat"
              >
                <X size={16} />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex gap-2 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}
                >
                  {/* Avatar */}
                  <div
                    className={`w-6 h-6 flex-shrink-0 flex items-center justify-center mt-0.5 ${
                      msg.role === "assistant" ? "bg-[#FF6B00]" : "bg-[#404040]"
                    }`}
                  >
                    {msg.role === "assistant" ? (
                      <Bot size={12} className="text-white" />
                    ) : (
                      <User size={12} className="text-white" />
                    )}
                  </div>

                  {/* Bubble */}
                  <div
                    className={`max-w-[240px] px-3 py-2 text-xs font-body leading-relaxed ${
                      msg.role === "assistant"
                        ? "bg-[#2A2A2A] text-[#C0C0B8] border border-white/5"
                        : "bg-[#FF6B00] text-white"
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>
              ))}

              {/* Typing indicator */}
              {sendMessage.isPending && (
                <div className="flex gap-2 items-center">
                  <div className="w-6 h-6 bg-[#FF6B00] flex items-center justify-center flex-shrink-0">
                    <Bot size={12} className="text-white" />
                  </div>
                  <div className="bg-[#2A2A2A] border border-white/5 px-3 py-2 flex items-center gap-1">
                    <Loader2 size={12} className="text-[#FF6B00] animate-spin" />
                    <span className="font-body text-xs text-[#888]">Typing...</span>
                  </div>
                </div>
              )}

              <div ref={bottomRef} />
            </div>

            {/* Quick Replies */}
            {messages.length <= 1 && (
              <div className="px-4 pb-2 flex flex-wrap gap-1.5 flex-shrink-0">
                {QUICK_REPLIES.map((q) => (
                  <button
                    key={q}
                    onClick={() => handleSend(q)}
                    className="font-body text-[10px] text-[#888] border border-white/10 px-2.5 py-1 hover:border-[#FF6B00]/50 hover:text-white transition-colors"
                  >
                    {q}
                  </button>
                ))}
              </div>
            )}

            {/* Input */}
            <div className="border-t border-white/5 p-3 flex gap-2 flex-shrink-0">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type your message..."
                className="flex-1 bg-[#2A2A2A] border border-white/10 text-white placeholder-[#555] px-3 py-2 font-body text-xs outline-none focus:border-[#FF6B00] transition-colors"
                disabled={sendMessage.isPending}
              />
              <button
                onClick={() => handleSend()}
                disabled={!input.trim() || sendMessage.isPending}
                className="w-9 h-9 bg-[#FF6B00] flex items-center justify-center hover:bg-[#e55f00] transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0"
                aria-label="Send message"
              >
                <Send size={14} className="text-white" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bubble Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setOpen((v) => !v)}
        className="w-14 h-14 bg-[#FF6B00] shadow-lg flex items-center justify-center hover:bg-[#e55f00] transition-colors relative"
        aria-label="Open customer support chat"
      >
        <AnimatePresence mode="wait">
          {open ? (
            <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.15 }}>
              <X size={22} className="text-white" />
            </motion.div>
          ) : (
            <motion.div key="open" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.15 }}>
              <MessageCircle size={22} className="text-white" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Unread badge */}
        {unread > 0 && !open && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-white text-[#FF6B00] font-display text-[10px] font-bold flex items-center justify-center rounded-full">
            {unread}
          </span>
        )}
      </motion.button>
    </div>
  );
}
