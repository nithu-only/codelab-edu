package com.codelab.workspace;

import org.springframework.stereotype.Component;

import java.io.IOException;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.regex.Pattern;

@Component
public class PathValidator {

    public static final int MAX_PATH_LENGTH = 512;
    public static final long MAX_FILE_SIZE = 1024 * 1024; // 1MB

    private static final Pattern WINDOWS_ABSOLUTE = Pattern.compile("^[a-zA-Z]:[\\\\/].*");
    private static final Pattern UNC_PATH = Pattern.compile("^\\\\\\\\.*");

    /**
     * Decode URL encoding repeatedly until stable (max 3 iterations) to catch double encoding.
     */
    public static String decodeRepeatedly(String input) {
        if (input == null) return null;
        String prev = input;
        for (int i = 0; i < 3; i++) {
            try {
                String decoded = URLDecoder.decode(prev, StandardCharsets.UTF_8);
                if (decoded.equals(prev)) {
                    break;
                }
                prev = decoded;
            } catch (IllegalArgumentException e) {
                // malformed % sequence, stop decoding
                break;
            }
        }
        return prev;
    }

    /**
     * Validate and resolve requestedPath against studentRoot.
     * @throws WorkspaceSecurityException if validation fails
     */
    public Path validateAndResolve(Path studentRoot, String requestedPath) {
        if (requestedPath == null) {
            throw new WorkspaceSecurityException("Path must not be null");
        }

        // Decode repeatedly to catch %2e%2e%2f and %252e etc.
        String decoded = decodeRepeatedly(requestedPath);

        // Reject null bytes before and after decoding
        if (decoded.contains("\0") || decoded.contains("%00") || decoded.contains("%0")) {
            throw new WorkspaceSecurityException("Path contains null byte");
        }
        if (decoded.indexOf('\0') >= 0) {
            throw new WorkspaceSecurityException("Path contains null byte");
        }

        // Normalize separators: both / and \ to /
        String normalizedSep = decoded.replace("\\", "/");

        // Trim surrounding whitespace but preserve internal
        String trimmed = normalizedSep.trim();

        if (trimmed.isEmpty()) {
            throw new WorkspaceSecurityException("Path must not be empty");
        }
        if (trimmed.equals(".") || trimmed.equals("./")) {
            throw new WorkspaceSecurityException("Path must not be '.'");
        }
        if (trimmed.length() > MAX_PATH_LENGTH) {
            throw new WorkspaceSecurityException("Path too long (max " + MAX_PATH_LENGTH + ")");
        }

        // Reject absolute paths
        if (trimmed.startsWith("/")) {
            throw new WorkspaceSecurityException("Absolute paths not allowed: " + trimmed);
        }
        if (WINDOWS_ABSOLUTE.matcher(trimmed).matches()) {
            throw new WorkspaceSecurityException("Windows absolute paths not allowed: " + trimmed);
        }
        if (UNC_PATH.matcher(trimmed).matches() || trimmed.startsWith("\\\\")) {
            throw new WorkspaceSecurityException("UNC paths not allowed: " + trimmed);
        }
        // Also reject if after trimming it still contains drive colon pattern without slash e.g. C:foo
        if (trimmed.length() >= 2 && Character.isLetter(trimmed.charAt(0)) && trimmed.charAt(1) == ':') {
            throw new WorkspaceSecurityException("Windows drive paths not allowed: " + trimmed);
        }

        // Reject if contains null byte char
        if (trimmed.indexOf('\0') >= 0) {
            throw new WorkspaceSecurityException("Path contains null byte");
        }

        // Reject any path containing ".." as a segment (conservative, blocks a\..\b etc.)
        // Even if normalized path stays inside, presence of ".." is considered traversal attempt
        String[] segments = trimmed.split("/");
        for (String seg : segments) {
            if (seg.equals("..")) {
                throw new WorkspaceSecurityException("Path contains traversal segment '..': " + trimmed);
            }
        }

        // Extra early reject for traversal segments that are clearly outside after naive split
        // but final check is startsWith validation

        Path studentRootAbs = studentRoot.toAbsolutePath().normalize();
        // Resolve and normalize
        Path resolved = studentRootAbs.resolve(trimmed).normalize();

        // Verify startsWith strictly
        if (!resolved.startsWith(studentRootAbs)) {
            throw new WorkspaceSecurityException("Path escapes workspace: " + trimmed);
        }

        // Handle symlink: if file exists, verify real path still inside root
        try {
            if (Files.exists(resolved)) {
                Path real = resolved.toRealPath();
                Path rootReal = studentRootAbs.toRealPath();
                if (!real.startsWith(rootReal)) {
                    throw new WorkspaceSecurityException("Symlink escapes workspace: " + trimmed);
                }
            } else {
                // For non-existing file, check if parent symlink points outside
                Path parent = resolved.getParent();
                // Walk up parents that exist and check their real path
                while (parent != null && !parent.equals(studentRootAbs.getParent())) {
                    if (Files.exists(parent)) {
                        // Check if this parent is a symlink escaping
                        try {
                            Path parentReal = parent.toRealPath();
                            Path rootReal = studentRootAbs.toRealPath();
                            if (!parentReal.startsWith(rootReal)) {
                                throw new WorkspaceSecurityException("Symlink in parent escapes workspace: " + trimmed);
                            }
                        } catch (IOException ignored) {
                            // parent real path unavailable, continue
                        }
                        break;
                    }
                    if (parent.equals(studentRootAbs)) break;
                    parent = parent.getParent();
                }
            }
        } catch (IOException e) {
            // toRealPath failed for existing file - treat as security if it mentions symlink?
            // If file exists and we cannot resolve, be conservative and check raw normalized again
            if (Files.exists(resolved) || Files.isSymbolicLink(resolved)) {
                throw new WorkspaceSecurityException("Symlink validation failed for: " + trimmed);
            }
        }

        return resolved;
    }

    /**
     * Validate content size (1MB)
     */
    public static void validateContentSize(String content) {
        if (content != null && content.getBytes(StandardCharsets.UTF_8).length > MAX_FILE_SIZE) {
            throw new WorkspaceSecurityException("File too large (max 1MB)");
        }
    }
}
