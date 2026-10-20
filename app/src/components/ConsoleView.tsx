import type { ExecStatus } from "../types";

export interface ConsoleViewProps {
  status?: ExecStatus;
  running: boolean;
  stdout: string;
  stderr: string;
  timeMs?: number;
}

const STATUS_LABELS: Record<ExecStatus, string> = {
  SUCCESS: "Success",
  COMPILE_ERROR: "Compile error",
  RUNTIME_ERROR: "Runtime error",
  TIMEOUT: "Timeout",
  ERROR: "Error",
  NOT_CONFIGURED: "Not configured",
};

export default function ConsoleView({ status, running, stdout, stderr, timeMs }: ConsoleViewProps) {
  if (running) {
    return (
      <div className="console-body">
        <span className="console-note">Running…</span>
      </div>
    );
  }

  if (!status) {
    return (
      <div className="console-body">
        <span className="console-note">
          Output will appear here. Press Run (or Ctrl+Enter) to execute your program.
        </span>
      </div>
    );
  }

  const hasOutput = stdout.length > 0;
  const hasError = stderr.length > 0;

  return (
    <div className="console-body">
      {hasOutput && <span className="stdout">{stdout}</span>}
      {hasOutput && hasError && "\n"}
      {hasError && <span className="stderr">{stderr}</span>}
      {!hasOutput && !hasError && <span className="console-note">(no output)</span>}
      {status === "SUCCESS" && typeof timeMs === "number" && (
        <>
          {"\n"}
          <span className="console-note">— finished in {timeMs} ms</span>
        </>
      )}
      {status === "NOT_CONFIGURED" && (
        <>
          {"\n"}
          <span className="console-note">
            JavaScript, SQL, Python, C, C++ and Java all run in your browser (Python, C/C++ and
            Java download their toolchains once, then cache). If an in-browser engine can't load,
            an optional Judge0-compatible provider can run it remotely — see README → Code
            execution.
          </span>
        </>
      )}
    </div>
  );
}

export function StatusPill({ status }: { status?: ExecStatus }) {
  if (!status) return null;
  return <span className={`status-pill status-${status}`}>{STATUS_LABELS[status]}</span>;
}
