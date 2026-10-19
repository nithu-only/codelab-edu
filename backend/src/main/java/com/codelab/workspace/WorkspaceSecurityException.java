package com.codelab.workspace;

public class WorkspaceSecurityException extends WorkspaceException {
    public WorkspaceSecurityException(String message) {
        super(message, 400);
    }
}
