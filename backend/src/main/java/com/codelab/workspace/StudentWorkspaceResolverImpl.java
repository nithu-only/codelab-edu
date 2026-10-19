package com.codelab.workspace;

import org.springframework.stereotype.Component;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;

@Component
public class StudentWorkspaceResolverImpl implements StudentWorkspaceResolver {

    private final Path workspaceRoot;
    private final PathValidator pathValidator;

    public StudentWorkspaceResolverImpl(Path workspaceRoot, PathValidator pathValidator) {
        this.workspaceRoot = workspaceRoot;
        this.pathValidator = pathValidator;
    }

    @Override
    public Path getWorkspaceRoot(String studentId) {
        String sid = sanitizeStudentId(studentId);
        Path root = workspaceRoot.resolve("students").resolve(sid).toAbsolutePath().normalize();
        try {
            Files.createDirectories(root);
        } catch (IOException e) {
            throw new RuntimeException("Failed to create workspace for student " + sid, e);
        }
        return root;
    }

    @Override
    public Path resolve(String studentId, String requestedPath) {
        Path studentRoot = getWorkspaceRoot(studentId);
        return pathValidator.validateAndResolve(studentRoot, requestedPath);
    }

    public static String sanitizeStudentId(String studentId) {
        if (studentId == null || studentId.isBlank()) {
            return "dev-student";
        }
        String trimmed = studentId.trim();
        // basic sanitization: reject path separators, traversal, null bytes
        if (trimmed.contains("/") || trimmed.contains("\\") || trimmed.contains("..") || trimmed.contains("\0")) {
            throw new WorkspaceSecurityException("Invalid studentId: " + studentId);
        }
        if (trimmed.length() > 64) {
            throw new WorkspaceSecurityException("StudentId too long");
        }
        // allow alphanumeric, -, _, .
        if (!trimmed.matches("[A-Za-z0-9._\\-]+")) {
            throw new WorkspaceSecurityException("Invalid studentId characters: " + studentId);
        }
        return trimmed;
    }
}
