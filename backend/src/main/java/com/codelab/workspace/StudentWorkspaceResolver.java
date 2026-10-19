package com.codelab.workspace;

import java.nio.file.Path;

public interface StudentWorkspaceResolver {
    Path getWorkspaceRoot(String studentId);
    Path resolve(String studentId, String requestedPath);
}
