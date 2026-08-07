import React, { useState } from "react";
import { postJSON } from "../api.js";

export default function ChatCompanion() {
  const [message, setMessage] = useState("");
  const [history, setHistory] = useState([]);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    if (!message.trim()) return;
    setError("");
    try {
      const data = await postJSON("/chat/message", { message });
      setHistory([...history, { role: "user", text: message }, { role: "buddy", text: data.reply }]);
      setMessage("");
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="card">
      <h2>Virtual Gym Buddy</h2>
      <p>A simple chat companion that reacts to your mood and motivates you.</p>
      <div className="result" style={{ minHeight: 120 }}>
        {history.length === 0 && "Say hi to your gym buddy!"}
        {history.map((m, i) => (
          <div key={i}>
            <strong>{m.role === "user" ? "You" : "Buddy"}:</strong> {m.text}
          </div>
        ))}
      </div>
      <form onSubmit={handleSubmit} style={{ marginTop: 12 }}>
        <div className="field">
          <input
            placeholder="Type a message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
        </div>
        <button className="submit" type="submit">Send</button>
      </form>
      {error && <div className="error">{error}</div>}
    </div>
  );
}
