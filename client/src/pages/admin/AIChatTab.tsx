/* ==========================================================================
   BUILD LEVEL — Admin: AI Customer Service Tab
   Uses REST API: /api/admin/ai-chat/*
   ========================================================================== */

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { MessageSquare, RefreshCw, Loader2, ToggleLeft, ToggleRight, Save, ChevronRight } from "lucide-react";

const ADMIN_TOKEN_KEY = "bl_admin_token";

function getAuthHeaders(): Record<string, string> {
  const token = sessionStorage.getItem(ADMIN_TOKEN_KEY);
  if (!token) return {};
  if (token.startsWith("eyJ")) return { Authorization: `Bearer ${token}` };
  return { "x-admin-token": token };
}

async function adminFetch<T>(method: string, path: string, body?: unknown): Promise<T> {
  const res = await fetch(path, {
    method,
    credentials: "include",
    headers: { "Content-Type": "application/json", ...getAuthHeaders() },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || `HTTP ${res.status}`);
  }
  return res.json() as Promise<T>;
}

interface ChatConfig {
  enabled: boolean;
  persona: string;
  greeting: string;
}

interface ChatSession {
  sessionId: string;
  lastMessage: string;
  messageCount: number;
  lastActivity: string;
}

interface ChatMessage {
  id: number;
  role: string;
  content: string;
  createdAt: string;
}

export default function AIChatTab() {
  const [activeView, setActiveView] = useState<"config" | "history">("config");
  const [selectedSession, setSelectedSession] = useState<string | null>(null);
  const [config, setConfig] = useState<ChatConfig | null>(null);
  const [configLoading, setConfigLoading] = useState(true);
  const [personaDraft, setPersonaDraft] = useState("");
  const [greetingDraft, setGreetingDraft] = useState("");
  const [savingConfig, setSavingConfig] = useState(false);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [sessionsLoading, setSessionsLoading] = useState(false);
  const [sessionMessages, setSessionMessages] = useState<ChatMessage[]>([]);
  const [messagesLoading, setMessagesLoading] = useState(false);

  useEffect(() => {
    loadConfig();
  }, []);

  useEffect(() => {
    if (activeView === "history") loadSessions();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeView]);

  useEffect(() => {
    if (selectedSession) loadMessages(selectedSession);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSession]);

  const loadConfig = async () => {
    setConfigLoading(true);
    try {
      const data = await adminFetch<ChatConfig>("GET", "/api/admin/ai-chat/config");
      setConfig(data);
      setPersonaDraft(data.persona);
      setGreetingDraft(data.greeting);
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Failed to load config");
    } finally {
      setConfigLoading(false);
    }
  };

  const loadSessions = async () => {
    setSessionsLoading(true);
    try {
      const data = await adminFetch<{ sessions: ChatSession[] }>("GET", "/api/admin/ai-chat/sessions");
      setSessions(data.sessions || []);
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Failed to load sessions");
    } finally {
      setSessionsLoading(false);
    }
  };

  const loadMessages = async (sessionId: string) => {
    setMessagesLoading(true);
    try {
      const data = await adminFetch<{ messages: ChatMessage[] }>("GET", `/api/admin/ai-chat/sessions/${sessionId}`);
      setSessionMessages(data.messages || []);
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Failed to load messages");
    } finally {
      setMessagesLoading(false);
    }
  };

  const handleToggle = async () => {
    if (!config) return;
    setSavingConfig(true);
    try {
      await adminFetch("POST", "/api/admin/ai-chat/config", { ...config, enabled: !config.enabled });
      setConfig(c => c ? { ...c, enabled: !c.enabled } : c);
      toast.success(config.enabled ? "Chat widget disabled" : "Chat widget enabled!");
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Failed to update");
    } finally {
      setSavingConfig(false);
    }
  };

  const handleSaveConfig = async () => {
    setSavingConfig(true);
    try {
      const updated = { enabled: config?.enabled ?? false, persona: personaDraft, greeting: greetingDraft };
      await adminFetch("POST", "/api/admin/ai-chat/config", updated);
      setConfig(updated);
      toast.success("Configuration saved!");
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Failed to save");
    } finally {
      setSavingConfig(false);
    }
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-display text-white font-bold tracking-widest text-lg">AI CUSTOMER SERVICE</h1>
          <p className="font-body text-[#555] text-sm mt-1">Configure the AI chat widget and view customer conversations.</p>
        </div>
        {config && (
          <button onClick={handleToggle} disabled={savingConfig}
            className={`flex items-center gap-2 px-4 py-2 font-display text-xs tracking-widest transition-colors ${
              config.enabled
                ? "bg-green-500/10 text-green-400 border border-green-500/20 hover:bg-green-500/20"
                : "bg-white/5 text-[#555] border border-white/10 hover:bg-white/10"
            }`}>
            {savingConfig ? <Loader2 size={12} className="animate-spin" /> :
              config.enabled ? <ToggleRight size={14} /> : <ToggleLeft size={14} />}
            {config.enabled ? "WIDGET ACTIVE" : "WIDGET OFF"}
          </button>
        )}
      </div>

      {/* View Tabs */}
      <div className="flex gap-0 border-b border-white/10 mb-6">
        {[
          { id: "config", label: "CONFIGURATION" },
          { id: "history", label: "CHAT HISTORY" },
        ].map(({ id, label }) => (
          <button key={id} onClick={() => setActiveView(id as "config" | "history")}
            className={`px-5 py-3 font-display text-xs font-bold tracking-widest border-b-2 transition-colors ${
              activeView === id ? "border-[#FF6B00] text-white" : "border-transparent text-[#555] hover:text-[#888]"
            }`}>
            {label}
          </button>
        ))}
      </div>

      {/* Config View */}
      {activeView === "config" && (
        <div className="space-y-6">
          {configLoading && (
            <div className="flex items-center justify-center py-16">
              <Loader2 size={24} className="animate-spin text-[#FF6B00]" />
            </div>
          )}
          {!configLoading && config && (
            <>
              {/* Status Card */}
              <div className={`border p-4 flex items-center gap-3 ${
                config.enabled ? "border-green-500/20 bg-green-500/5" : "border-white/10 bg-[#1A1A1A]"
              }`}>
                <span className={`w-2 h-2 rounded-full ${config.enabled ? "bg-green-400" : "bg-[#444]"}`} />
                <div>
                  <p className="font-display text-white text-xs tracking-widest">
                    {config.enabled ? "CHAT WIDGET IS ACTIVE" : "CHAT WIDGET IS DISABLED"}
                  </p>
                  <p className="font-body text-[#555] text-xs mt-0.5">
                    {config.enabled
                      ? "The AI chat widget is visible to all visitors on your site."
                      : "The chat widget is hidden. Enable it to start serving customers."}
                  </p>
                </div>
              </div>

              {/* Greeting Message */}
              <div className="bg-[#1A1A1A] border border-white/10 p-5">
                <label className="font-display text-[#888] text-[10px] tracking-widest block mb-2">GREETING MESSAGE</label>
                <p className="font-body text-[#555] text-xs mb-3">The first message customers see when they open the chat.</p>
                <input
                  type="text"
                  value={greetingDraft}
                  onChange={e => setGreetingDraft(e.target.value)}
                  className="w-full bg-[#111] border border-white/10 text-white font-body text-sm px-3 py-2.5 outline-none focus:border-[#FF6B00]"
                  placeholder="Hey! How can I help you today?"
                />
              </div>

              {/* AI Persona */}
              <div className="bg-[#1A1A1A] border border-white/10 p-5">
                <div className="flex items-center justify-between mb-2">
                  <label className="font-display text-[#888] text-[10px] tracking-widest">AI PERSONA & INSTRUCTIONS</label>
                </div>
                <p className="font-body text-[#555] text-xs mb-3">
                  This is the system prompt that defines how the AI responds. Include info about shipping, returns, sizing, and products.
                </p>
                <textarea
                  value={personaDraft}
                  onChange={e => setPersonaDraft(e.target.value)}
                  rows={10}
                  className="w-full bg-[#111] border border-white/10 text-white font-body text-xs px-3 py-2.5 outline-none focus:border-[#FF6B00] resize-y"
                  placeholder="You are the BUILD LEVEL customer service assistant. Be helpful, concise, and on-brand..."
                />
              </div>

              <button onClick={handleSaveConfig} disabled={savingConfig}
                className="admin-btn-primary flex items-center gap-2 text-xs">
                {savingConfig ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />}
                SAVE CONFIGURATION
              </button>
            </>
          )}
        </div>
      )}

      {/* Chat History View */}
      {activeView === "history" && (
        <div className="flex gap-6">
          {/* Sessions List */}
          <div className="w-72 flex-shrink-0">
            <div className="flex items-center justify-between mb-3">
              <p className="font-display text-[#888] text-[10px] tracking-widest">CONVERSATIONS</p>
              <button onClick={loadSessions} className="text-[#555] hover:text-white">
                <RefreshCw size={11} />
              </button>
            </div>
            {sessionsLoading && (
              <div className="flex items-center justify-center py-8">
                <Loader2 size={18} className="animate-spin text-[#FF6B00]" />
              </div>
            )}
            {!sessionsLoading && (
              <div className="space-y-2">
                {sessions.length === 0 && (
                  <div className="text-center py-8">
                    <MessageSquare size={28} className="text-[#333] mx-auto mb-2" />
                    <p className="font-body text-[#555] text-xs">No conversations yet</p>
                  </div>
                )}
                {sessions.map(s => (
                  <button
                    key={s.sessionId}
                    onClick={() => setSelectedSession(s.sessionId)}
                    className={`w-full text-left p-3 border transition-colors ${
                      selectedSession === s.sessionId
                        ? "border-[#FF6B00]/30 bg-[#FF6B00]/5"
                        : "border-white/10 bg-[#1A1A1A] hover:border-white/20"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <p className="font-display text-white text-[10px] tracking-widest">
                        {s.sessionId.slice(0, 12)}...
                      </p>
                      <ChevronRight size={10} className="text-[#555]" />
                    </div>
                    <p className="font-body text-[#666] text-xs line-clamp-1">{s.lastMessage}</p>
                    <p className="font-body text-[#444] text-[10px] mt-1">
                      {s.messageCount} messages · {s.lastActivity ? new Date(s.lastActivity).toLocaleDateString() : ""}
                    </p>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Messages Panel */}
          <div className="flex-1 min-w-0">
            {!selectedSession && (
              <div className="flex items-center justify-center h-64 border border-white/10 bg-[#1A1A1A]">
                <div className="text-center">
                  <MessageSquare size={32} className="text-[#333] mx-auto mb-3" />
                  <p className="font-body text-[#555] text-sm">Select a conversation to view messages</p>
                </div>
              </div>
            )}
            {selectedSession && (
              <div className="bg-[#1A1A1A] border border-white/10 p-4">
                <div className="flex items-center justify-between mb-4 pb-4 border-b border-white/10">
                  <p className="font-display text-white text-xs tracking-widest">
                    Session: {selectedSession.slice(0, 16)}...
                  </p>
                </div>
                {messagesLoading && (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 size={18} className="animate-spin text-[#FF6B00]" />
                  </div>
                )}
                {!messagesLoading && (
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {sessionMessages.map(m => (
                      <div key={m.id} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                        <div className={`max-w-[80%] px-3 py-2 ${
                          m.role === "user"
                            ? "bg-[#FF6B00]/20 border border-[#FF6B00]/20"
                            : "bg-[#222] border border-white/10"
                        }`}>
                          <p className={`font-display text-[9px] tracking-widest mb-1 ${
                            m.role === "user" ? "text-[#FF6B00]" : "text-[#555]"
                          }`}>
                            {m.role === "user" ? "CUSTOMER" : "AI ASSISTANT"}
                          </p>
                          <p className="font-body text-white text-xs leading-relaxed">{m.content}</p>
                          <p className="font-body text-[#444] text-[10px] mt-1">
                            {new Date(m.createdAt).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
