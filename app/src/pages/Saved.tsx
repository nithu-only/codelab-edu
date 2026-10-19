import { useState } from "react";
import { Link } from "react-router-dom";
import { deleteProgram, listPrograms } from "../lib/storage";
import { LANGUAGE_LABELS, type LanguageId } from "../types";

export default function Saved() {
  const [programs, setPrograms] = useState(() => listPrograms());

  const remove = (id: string) => {
    deleteProgram(id);
    setPrograms(listPrograms());
  };

  return (
    <main className="page page-narrow">
      <div className="page-head">
        <h1>Saved programs</h1>
        <p>
          Stored in this browser only (localStorage). Open a program to continue editing, or delete
          it when you are done.
        </p>
      </div>

      {programs.length === 0 ? (
        <div className="empty-state">
          <h3>No saved programs yet</h3>
          <p>
            Write something in the <Link to="/ide">IDE</Link> and press Save — it will appear here.
          </p>
        </div>
      ) : (
        <div className="topic-list">
          {programs.map((p) => (
            <div className="saved-row" key={p.id}>
              <span className="badge badge-lang">{LANGUAGE_LABELS[p.language as LanguageId]}</span>
              <span className="saved-main">
                <strong>{p.name}</strong>
                <span>{new Date(p.updatedAt).toLocaleString()}</span>
              </span>
              <Link to={`/ide?open=${p.id}`} className="btn btn-sm">
                Open
              </Link>
              <button
                type="button"
                className="btn btn-sm btn-danger"
                onClick={() => remove(p.id)}
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
