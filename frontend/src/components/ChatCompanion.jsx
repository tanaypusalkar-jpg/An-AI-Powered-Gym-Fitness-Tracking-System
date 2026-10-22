import { useState, useRef, useEffect } from "react";
import { postJSON } from "../api.js";

export default function ChatCompanion() {
  const [message, setMessage] = useState("");
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const chatRef = useRef(null);

  useEffect(() => {
    if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight;
  }, [history, loading]);

  async function sendMessage(rawMessage) {
    const userMsg = rawMessage.trim();
    if (!userMsg || loading) return;
    setError("");
    setMessage("");
    setHistory((h) => [...h, { role: "user", text: userMsg }]);
    setLoading(true);
    try {
      const data = await postJSON("/chat/message", { message: userMsg });
      setHistory((h) => [...h, { role: "buddy", text: data.reply }]);
    } catch (err) {
      setError(err?.message || "Couldn't connect to chat. Check that the backend is running and try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    await sendMessage(message);
  }

  function handleKey(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  }

  function retryLastMessage() {
    const lastUserMessage = history.filter((m) => m.role === "user").at(-1)?.text;
    if (lastUserMessage) {
      setHistory((h) => h.slice(0, -1));
      sendMessage(lastUserMessage);
    }
  }

  return (
    <div className="mod-card" style={{ maxWidth: 700 }}>
      <div className="mod-header">
        <div className="mod-icon-wrap" style={{ background: "rgba(123,95,255,0.15)", borderColor: "rgba(123,95,255,0.35)" }}>💬</div>
        <div className="mod-header-text">
          <h1>Virtual Gym Buddy</h1>
          <p>Ask about the app, workouts, recovery, nutrients, vitamins, and minerals.</p>
        </div>
      </div>

      <div className="chat-window" ref={chatRef} aria-live="polite">
        {history.length === 0 && !loading && (
          <div className="chat-empty">
            <div style={{ fontSize: 28, marginBottom: 8 }}>👋</div>
            Hi! I'm your gym buddy. Type your question below.
          </div>
        )}
        {history.map((m, i) => (
          <div key={i} className={`chat-msg ${m.role}`}>
            <div className="chat-avatar">{m.role === "user" ? "You" : "AI"}</div>
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

      <form onSubmit={handleSubmit} className="chat-input-row">
        <input id="gym-buddy-message" name="message" type="text" className="mod-input" placeholder="Ask about workouts, nutrients, vitamins, minerals, or the app…"
          aria-label="Message your Virtual Gym Buddy" autoComplete="off" value={message}
          onChange={(e) => setMessage(e.target.value)} onKeyDown={handleKey}
          disabled={loading} maxLength={2000} />
        <button type="submit" className="chat-send-btn" disabled={loading || !message.trim()}>➤ Send</button>
      </form>

      {error && (
        <div className="mod-error" role="alert" style={{ marginTop: 10 }}>
          ⚠ {error}
          <button type="button" className="ghost-btn" style={{ marginLeft: 8, fontSize: 12 }}
            onClick={retryLastMessage} disabled={loading || !history.some((m) => m.role === "user")}>
            Retry
          </button>
        </div>
      )}
      <p style={{ color: "var(--text-muted)", fontSize: 11, marginTop: 12 }}>
        General fitness information only. For injuries, medical symptoms, or personalized medical nutrition advice, consult a qualified professional.
      </p>
    </div>
  );
}
