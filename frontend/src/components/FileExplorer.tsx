import { useCallback, useState } from "react";
import type { FileEntry } from "../types";

type Props = {
  files: FileEntry[];
  activeFile: string | null;
  isDirty: boolean;
  loading: boolean;
  error: string | null;
  onRefresh: () => void;
  onNewFile: () => void;
  onOpen: (path: string) => void;
  onRename: (from: string) => void;
  onDelete: (path: string) => void;
};

export default function FileExplorer({ files, activeFile, isDirty, loading, error, onRefresh, onNewFile, onOpen, onRename, onDelete }: Props) {
  const [newName, setNewName] = useState("");

  const handleNewSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (!newName.trim()) return;
      const val = newName.trim();
      setNewName("");
      (onNewFile as unknown as (path?: string) => void)(val);
    },
    [newName, onNewFile]
  );

  return (
    <div className="file-explorer" data-testid="file-explorer">
      <div className="file-explorer__head">
        <span>FILES</span>
        <button
          onClick={onRefresh}
          title="Refresh file list"
          aria-label="Refresh files"
          data-testid="refresh-files"
          className="icon-btn"
        >
          ↻
        </button>
      </div>

      <form onSubmit={handleNewSubmit} className="file-explorer__new">
        <input
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="hello.py"
          aria-label="New file name"
          data-testid="new-file-input"
          className="file-explorer__input"
        />
        <button type="submit" data-testid="new-file-button" className="btn btn--primary" title="Create file">
          + New
        </button>
      </form>

      <div className="file-explorer__list">
        {loading && <div style={{ padding: 12, color: "var(--muted)", fontSize: 13 }}>Loading...</div>}
        {error && (
          <div style={{ padding: 8, color: "var(--error)", fontSize: 12, background: "var(--error-bg)", borderRadius: 6, margin: "4px 0" }}>
            {error}
          </div>
        )}
        {!loading && files.length === 0 && !error && (
          <div style={{ padding: 12, color: "var(--muted)", fontSize: 13, textAlign: "center" }}>
            No files yet.
            <br />
            Create hello.py to start.
          </div>
        )}
        {files.map((f) => {
          const isActive = f.path === activeFile;
          return (
            <div
              key={f.path}
              data-testid={`file-item-${f.path}`}
              onClick={() => onOpen(f.path)}
              title={`${f.path} • ${f.size} bytes • ${f.modified ?? ""}`}
              className={`file-item ${isActive ? "file-item--active" : ""}`}
            >
              <span style={{ fontSize: 13 }} aria-hidden>
                {f.type === "dir" ? "📁" : "📄"}
              </span>
              <span className="file-item__name" title={f.path}>
                {f.path}
                {isActive && isDirty && <span className="file-item__dirty"> *</span>}
              </span>
              <span className="file-item__actions">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onRename(f.path);
                  }}
                  title={`Rename ${f.path}`}
                  aria-label={`Rename ${f.path}`}
                  data-testid={`rename-${f.path}`}
                  className="icon-btn"
                >
                  ✎
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(f.path);
                  }}
                  title={`Delete ${f.path}`}
                  aria-label={`Delete ${f.path}`}
                  data-testid={`delete-${f.path}`}
                  className="icon-btn icon-btn--danger"
                >
                  ×
                </button>
              </span>
            </div>
          );
        })}
      </div>

      <div className="file-explorer__foot">
        {files.length} file{files.length !== 1 ? "s" : ""} • {activeFile ? `active: ${activeFile}${isDirty ? " *" : ""}` : "no file open"}
      </div>
    </div>
  );
}
