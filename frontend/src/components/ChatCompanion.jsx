import { useState, useRef, useEffect } from "react";
import { postJSON } from "../api.js";

export default function ChatCompanion() {
  const [message, setMessage] = useState("");
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");
  const chatRef   = useRef(null);

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [history, loading]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!message.trim()) return;
    setError("");
    const userMsg = message.trim();
    setMessage("");
    setHistory((h) => [...h, { role: "user", text: userMsg }]);
    setLoading(true);
    try {
      const data = await postJSON("/chat/message", { message: userMsg });
      setHistory((h) => [...h, { role: "buddy", text: data.reply }]);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function handleKey(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  }

  return (
    <div className="mod-card" style={{ maxWidth: 700 }}>
      <div className="mod-header">
        <div className="mod-icon-wrap" style={{ background: "rgba(123,95,255,0.15)", borderColor: "rgba(123,95,255,0.35)" }}>
          💬
        </div>
        <div className="mod-header-text">
          <h1>Virtual Gym Buddy</h1>
          <p>Your AI companion that reacts to your mood and keeps you motivated.</p>
        </div>
      </div>

      {/* Chat window */}
      <div className="chat-window" ref={chatRef}>
        {history.length === 0 && !loading && (
          <div className="chat-empty">
            <div style={{ fontSize: 28, marginBottom: 8 }}>👋</div>
            Say hi to your gym buddy!
          </div>
        )}

        {history.map((m, i) => (
          <div key={i} className={`chat-msg ${m.role}`}>
            <div className="chat-avatar">
              {m.role === "user" ? "TP" : "AI"}
            </div>
            <div className="chat-bubble">{m.text}</div>
          </div>
        ))}

        {loading && (
          <div className="chat-msg buddy">
            <div className="chat-avatar">AI</div>
            <div className="chat-bubble" style={{ display: "flex", gap: 5, alignItems: "center" }}>
              <span className="spin" style={{ width: 10, height: 10, borderTopColor: "var(--neon-green)" }} />
              <span style={{ color: "var(--text-muted)", fontSize: 12 }}>Thinking…</span>
            </div>
          </div>
        )}
      </div>

      {/* Input row */}
      <form onSubmit={handleSubmit} className="chat-input-row">
        <input
          className="mod-input"
          placeholder="Type a message… (Enter to send)"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKey}
          disabled={loading}
        />
        <button type="submit" className="chat-send-btn" disabled={loading || !message.trim()}>
          ➤ Send
        </button>
      </form>

      {error && <div className="mod-error" style={{ marginTop: 10 }}>⚠ {error}</div>}
    </div>
  );
}
