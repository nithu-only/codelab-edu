import { useCallback, useRef, useState } from "react";
import { execute } from "../exec";
import type { ExecStatus, LanguageId } from "../types";

export interface RunnerState {
  running: boolean;
  status?: ExecStatus;
  stdout: string;
  stderr: string;
  timeMs?: number;
}

const IDLE: RunnerState = { running: false, stdout: "", stderr: "" };

/**
 * Shared "run a program" state used by the IDE and the Learn pages.
 * Aborting a previous run never clobbers a newer one (run ids are checked).
 */
export function useRunner() {
  const [state, setState] = useState<RunnerState>(IDLE);
  const runIdRef = useRef(0);
  const abortRef = useRef<AbortController | null>(null);

  const run = useCallback(
    async (language: LanguageId, code: string, stdin: string): Promise<ExecStatus | undefined> => {
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;
      const runId = ++runIdRef.current;
      setState({ ...IDLE, running: true });
      try {
        const res = await execute({ language, code, stdin }, { signal: controller.signal });
        if (runId === runIdRef.current) {
          setState({
            running: false,
            status: res.status,
            stdout: res.stdout,
            stderr: res.stderr,
            timeMs: res.timeMs,
          });
        }
        return res.status;
      } catch (err) {
        if (runId === runIdRef.current) {
          setState({
            running: false,
            status: "ERROR",
            stdout: "",
            stderr: String(err),
          });
        }
        return "ERROR";
      }
    },
    [],
  );

  const reset = useCallback(() => {
    runIdRef.current++;
    abortRef.current?.abort();
    setState(IDLE);
  }, []);

  return { state, run, reset };
}
