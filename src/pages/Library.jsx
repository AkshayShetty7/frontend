import { useCallback, useEffect, useRef, useState } from "react";
import { api } from "../api";
import EmptyState from "../components/EmptyState.jsx";

function StatusBadge({ status }) {
  const indexed = status === "indexed";
  return (
    <span className={"badge" + (indexed ? " badge-solid" : " badge-muted")}>
      <span className="badge-dot" aria-hidden="true" />
      {status}
    </span>
  );
}

export default function Library() {
  const [sources, setSources] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [notice, setNotice] = useState({ type: "", text: "" });
  const inputRef = useRef(null);

  const refresh = useCallback(() => {
    api
      .listSources()
      .then(setSources)
      .catch((e) => setNotice({ type: "error", text: e.message }));
  }, []);

  useEffect(refresh, [refresh]);

  async function handleFiles(fileList) {
    const files = Array.from(fileList || []);
    if (!files.length || uploading) return;
    setNotice({ type: "", text: "" });
    setUploading(true);
    try {
      for (const file of files) {
        if (file.type !== "application/pdf") {
          setNotice({ type: "error", text: `"${file.name}" is not a PDF.` });
          continue;
        }
        const res = await api.uploadSource(file);
        setNotice({
          type: "success",
          text: `"${res.filename}" indexed — ${res.pages} pages, ${res.chunks} chunks.`,
        });
      }
      refresh();
    } catch (e) {
      setNotice({ type: "error", text: e.message });
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Library</h1>
          <p className="page-sub">All uploaded sources, ready to be organised into groups.</p>
        </div>
      </div>

      <div
        className={"dropzone" + (dragOver ? " dropzone-active" : "")}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          handleFiles(e.dataTransfer.files);
        }}
        onClick={() => inputRef.current?.click()}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") inputRef.current?.click();
        }}
      >
        <input
          ref={inputRef}
          type="file"
          accept="application/pdf"
          multiple
          hidden
          onChange={(e) => handleFiles(e.target.files)}
        />
        <div className="dropzone-icon" aria-hidden="true">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <path d="M12 16V4m0 0l-4 4m4-4l4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M4 15v3a2 2 0 002 2h12a2 2 0 002-2v-3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
        </div>
        <p className="dropzone-title">
          {uploading ? "Uploading & indexing…" : "Drop PDFs here, or click to browse"}
        </p>
        <p className="dropzone-hint">PDF only. Text is extracted, chunked and embedded automatically.</p>
      </div>

      {notice.text && (
        <div className={"notice notice-" + notice.type} role="status">
          {notice.text}
        </div>
      )}

      {sources === null ? (
        <div className="card skeleton-block" aria-label="Loading sources" />
      ) : sources.length === 0 ? (
        <div className="card">
          <EmptyState
            title="No sources yet"
            hint="Upload your first PDF to start building the library."
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
                <StatusBadge status={source.status} />
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
