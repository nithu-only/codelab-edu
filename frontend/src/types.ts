export type Language = "python" | "java" | "c" | "cpp";

export type ExecutionStatus =
  | "QUEUED"
  | "RUNNING"
  | "SUCCESS"
  | "FAILED"
  | "TIMEOUT"
  | "ERROR"
  | "CANCELLED";

export interface ExecutionRequest {
  language: Language;
  sourceCode: string;
  stdin: string;
}

export interface ExecutionResponse {
  executionId: string;
  status: ExecutionStatus;
  language: string;
  stdout: string;
  stderr: string;
  exitCode: number;
  executionTimeMs: number;
  createdAt: string;
}

export interface ApiError {
  error: string;
  details?: string[];
}

export interface FileEntry {
  path: string;
  type: "file" | "dir";
  size: number;
  modified: string;
}

export interface FileContent {
  path: string;
  content: string;
}
