import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api";
import EmptyState from "../components/EmptyState.jsx";

export default function Groups() {
  const [groups, setGroups] = useState(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  function refresh() {
    api.listGroups().then(setGroups).catch((e) => setError(e.message));
  }

  useEffect(refresh, []);

  async function handleCreate(e) {
    e.preventDefault();
    if (!name.trim() || busy) return;
    setBusy(true);
    setError("");
    try {
      await api.createGroup({
        name: name.trim(),
        description: description.trim() || null,
      });
      setName("");
      setDescription("");
      refresh();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete(group) {
    if (!window.confirm(`Delete group "${group.name}"? Sources in the library are not affected.`))
      return;
    setError("");
    try {
      await api.deleteGroup(group.group_id);
      refresh();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Groups</h1>
          <p className="page-sub">Organise sources into focused collections for retrieval and chat.</p>
        </div>
      </div>

      <form className="card form-row" onSubmit={handleCreate}>
        <div className="form-fields">
          <input
            className="input"
            placeholder="Group name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <input
            className="input"
            placeholder="Description (optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
        <button className="btn btn-primary" type="submit" disabled={busy || !name.trim()}>
          Create group
        </button>
      </form>

      {error && <div className="notice notice-error">{error}</div>}

      {groups === null ? (
        <div className="card skeleton-block" aria-label="Loading groups" />
      ) : groups.length === 0 ? (
        <div className="card">
          <EmptyState
            title="No groups yet"
            hint="Create a group, then add sources from the library."
          />
        </div>
      ) : (
        <div className="card">
          <ul className="item-list">
            {groups.map((group) => (
              <li key={group.group_id} className="item-row">
                <div className="item-icon" aria-hidden="true">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <path d="M4 6a2 2 0 012-2h4l2 2h6a2 2 0 012 2v9a2 2 0 01-2 2H6a2 2 0 01-2-2V6z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
                  </svg>
                </div>
                <div className="item-main">
                  <Link className="item-title item-link" to={`/groups/${group.group_id}`}>
                    {group.name}
                  </Link>
                  {group.description && <p className="item-meta">{group.description}</p>}
                </div>
                <div className="item-actions">
                  <Link className="btn btn-ghost btn-sm" to={`/groups/${group.group_id}`}>
                    Open
                  </Link>
                  <button className="btn btn-danger btn-sm" onClick={() => handleDelete(group)}>
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
