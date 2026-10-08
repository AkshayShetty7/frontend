import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api";
import EmptyState from "../components/EmptyState.jsx";

function AssistantMessage({ message }) {
  const [showQuery, setShowQuery] = useState(false);
  return (
    <div className="msg msg-assistant">
      <div className="msg-bubble msg-bubble-assistant">
        <p className="msg-text">{message.content}</p>
        {message.retrievalQuery && message.retrievalQuery !== message.content && (
          <button className="msg-query-toggle" onClick={() => setShowQuery((v) => !v)}>
            {showQuery ? "Hide rewritten query" : "Show rewritten query"}
          </button>
        )}
        {showQuery && message.retrievalQuery && (
          <p className="msg-query">{message.retrievalQuery}</p>
        )}
        {message.citations && message.citations.length > 0 && (
          <div className="citations">
            <span className="citations-label">Sources</span>
            {message.citations.map((c, i) => (
              <span key={i} className="citation-chip">
                {c.filename} · p. {c.page}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function Chat() {
  const [groups, setGroups] = useState(null);
  const [groupId, setGroupId] = useState("");
  const [groupSources, setGroupSources] = useState([]);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const bottomRef = useRef(null);

  useEffect(() => {
    api
      .listGroups()
      .then((gs) => {
        setGroups(gs);
        if (gs.length > 0) setGroupId(gs[0].group_id);
      })
      .catch((e) => setError(e.message));
  }, []);

  useEffect(() => {
    if (!groupId) return;
    api
      .groupSources(groupId)
      .then(setGroupSources)
      .catch(() => setGroupSources([]));
    setMessages([]);
  }, [groupId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, sending]);

  async function handleSend(e) {
    e.preventDefault();
    const text = input.trim();
    if (!text || !groupId || sending) return;
    setError("");
    setMessages((m) => [...m, { role: "user", content: text }]);
    setInput("");
    setSending(true);
    const history = messages.map(({ role, content }) => ({ role, content }));
    try {
      const res = await api.chat({
        message: text,
        group_id: groupId,
        history,
      });
      setMessages((m) => [
        ...m,
        {
          role: "assistant",
          content: res.answer,
          citations: res.citations || [],
          retrievalQuery: res.retrieval_query,
        },
      ]);
    } catch (err) {
      setError(err.message);
      setMessages((m) => [...m, { role: "assistant", content: `Something went wrong: ${err.message}` }]);
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="page page-chat">
      <div className="page-header">
        <div>
          <h1>Chat</h1>
          <p className="page-sub">Ask questions grounded in the sources of a selected group.</p>
        </div>
        <select
          className="input select"
          value={groupId}
          onChange={(e) => setGroupId(e.target.value)}
          aria-label="Select group"
        >
          {groups !== null && groups.length === 0 && (
            <option value="">No groups available</option>
          )}
          {(groups || []).map((g) => (
            <option key={g.group_id} value={g.group_id}>
              {g.name}
            </option>
          ))}
        </select>
      </div>

      {error && <div className="notice notice-error">{error}</div>}

      <div className="chat-shell">
        <div className="chat-scroll" aria-live="polite">
          {messages.length === 0 ? (
            <div className="chat-empty">
              {groups !== null && groups.length === 0 ? (
                <EmptyState
                  title="Create a group first"
                  hint="Chat works on the sources inside a group."
                  action={
                    <Link className="btn btn-primary" to="/groups">
                      Go to Groups
                    </Link>
                  }
                />
              ) : groupSources.length === 0 ? (
                <EmptyState
                  title="This group has no sources"
                  hint="Add sources to the group before asking questions."
                  action={
                    <Link className="btn btn-primary" to={`/groups/${groupId}`}>
                      Manage group
                    </Link>
                  }
                />
              ) : (
                <EmptyState
                  title="Ask anything"
                  hint={`${groupSources.length} source${groupSources.length === 1 ? "" : "s"} in scope. Answers include citations.`}
                />
              )}
            </div>
          ) : (
            messages.map((message, i) =>
              message.role === "user" ? (
                <div key={i} className="msg msg-user">
                  <div className="msg-bubble msg-bubble-user">{message.content}</div>
                </div>
              ) : (
                <AssistantMessage key={i} message={message} />
              )
            )
          )}
          {sending && (
            <div className="msg msg-assistant">
              <div className="msg-bubble msg-bubble-assistant typing" aria-label="Thinking">
                <span /><span /><span />
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        <form className="composer" onSubmit={handleSend}>
          <input
            className="input composer-input"
            placeholder={
              groupId ? "Ask a question about this group's sources…" : "Select a group to start…"
            }
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={!groupId || sending}
          />
          <button
            className="btn btn-primary composer-send"
            type="submit"
            disabled={!groupId || sending || !input.trim()}
            aria-label="Send"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M4 12h15m0 0l-6-6m6 6l-6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </form>
      </div>
    </div>
  );
}
