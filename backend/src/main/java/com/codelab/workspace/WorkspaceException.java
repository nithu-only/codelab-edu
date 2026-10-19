package com.codelab.workspace;

public class WorkspaceException extends RuntimeException {
    private final int status;

    public WorkspaceException(String message, int status) {
        super(message);
        this.status = status;
    }

    public WorkspaceException(String message, int status, Throwable cause) {
        super(message, cause);
        this.status = status;
    }

    public int getStatus() {
        return status;
    }
}
