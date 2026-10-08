import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api } from "../api";
import Modal from "../components/Modal.jsx";
import EmptyState from "../components/EmptyState.jsx";

export default function GroupDetail() {
  const { groupId } = useParams();
  const [group, setGroup] = useState(null);
  const [sources, setSources] = useState(null);
  const [library, setLibrary] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(() => {
    Promise.all([
      api.listGroups(),
      api.groupSources(groupId),
      api.listSources(),
    ])
      .then(([groups, groupSources, librarySources]) => {
        setGroup(groups.find((g) => g.group_id === groupId) || null);
        setSources(groupSources);
        setLibrary(librarySources);
      })
      .catch((e) => setError(e.message));
  }, [groupId]);

  useEffect(load, [load]);

  const availableToAdd = useMemo(() => {
    if (!sources || !library) return [];
    const inGroup = new Set(sources.map((s) => s.source_id));
    return library.filter((s) => !inGroup.has(s.source_id));
  }, [sources, library]);

  async function handleAdd(sourceId) {
    setError("");
    try {
      await api.addSourceToGroup(groupId, sourceId);
      load();
    } catch (e) {
      setError(e.message);
    }
  }

  async function handleRemove(source) {
    setError("");
    try {
      await api.removeSourceFromGroup(groupId, source.source_id);
      load();
    } catch (e) {
      setError(e.message);
    }
  }

  if (group === null && sources === null && !error) {
    return <div className="page"><div className="card skeleton-block" /></div>;
  }

  return (
    <div className="page">
      <div className="breadcrumb">
        <Link to="/groups">Groups</Link>
        <span aria-hidden="true">/</span>
        <span className="breadcrumb-current">{group?.name ?? "Group"}</span>
      </div>

      <div className="page-header">
        <div>
          <h1>{group?.name ?? "Group"}</h1>
          {group?.description && <p className="page-sub">{group.description}</p>}
        </div>
        <button className="btn btn-primary" onClick={() => setModalOpen(true)}>
          Add sources
        </button>
      </div>

      {error && <div className="notice notice-error">{error}</div>}

      {sources === null ? (
        <div className="card skeleton-block" />
      ) : sources.length === 0 ? (
        <div className="card">
          <EmptyState
            title="This group has no sources"
            hint="Add sources from the library to start asking questions about them."
            action={
              <button className="btn btn-primary" onClick={() => setModalOpen(true)}>
                Add sources
              </button>
            }
          />
        </div>
      ) : (
        <div className="card">
          <ul className="item-list">
            {sources.map((source) => (
              <li key={source.source_id} className="item-row">
                <div className="item-icon" aria-hidden="true">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <path d="M6 3h8l4 4v14H6V3z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
                    <path d="M14 3v4h4" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
                  </svg>
                </div>
                <div className="item-main">
                  <p className="item-title">{source.filename}</p>
                  <p className="item-meta">
                    {source.file_type.toUpperCase()}
                    {source.pages ? ` · ${source.pages} pages` : ""}
                    {source.chunks ? ` · ${source.chunks} chunks` : ""}
                  </p>
                </div>
                <button className="btn btn-ghost btn-sm" onClick={() => handleRemove(source)}>
                  Remove
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      <Modal open={modalOpen} title="Add sources to group" onClose={() => setModalOpen(false)}>
        {availableToAdd.length === 0 ? (
          <EmptyState
            title="Nothing to add"
            hint="Every library source is already in this group."
          />
        ) : (
          <ul className="item-list">
            {availableToAdd.map((source) => (
              <li key={source.source_id} className="item-row">
                <div className="item-main">
                  <p className="item-title">{source.filename}</p>
                  <p className="item-meta">
                    {source.pages ? `${source.pages} pages` : ""}
                    {source.chunks ? ` · ${source.chunks} chunks` : ""}
                  </p>
                </div>
                <button className="btn btn-primary btn-sm" onClick={() => handleAdd(source.source_id)}>
                  Add
                </button>
              </li>
            ))}
          </ul>
        )}
      </Modal>
    </div>
  );
}
