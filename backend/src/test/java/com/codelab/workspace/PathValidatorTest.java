package com.codelab.workspace;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;

import static org.junit.jupiter.api.Assertions.*;

class PathValidatorTest {

    private PathValidator validator;
    private Path studentRoot;

    @BeforeEach
    void setup(@TempDir Path tmp) throws IOException {
        validator = new PathValidator();
        studentRoot = tmp.resolve("students").resolve("test-student");
        Files.createDirectories(studentRoot);
    }

    @Test
    void validSimplePath() {
        Path p = validator.validateAndResolve(studentRoot, "hello.py");
        assertTrue(p.startsWith(studentRoot));
        assertTrue(p.toString().contains("hello.py"));
    }

    @Test
    void validNestedPath() {
        Path p = validator.validateAndResolve(studentRoot, "programs/calculator.py");
        assertTrue(p.startsWith(studentRoot));
    }

    @Test
    void validWithDotSegment() {
        Path p = validator.validateAndResolve(studentRoot, "a/./b/file.txt");
        assertTrue(p.startsWith(studentRoot));
        assertFalse(p.toString().contains("/./"));
    }

    @Test
    void validDoubleSlashNormalized() {
        Path p = validator.validateAndResolve(studentRoot, "a//b/file.txt");
        assertTrue(p.startsWith(studentRoot));
    }

    @Test
    void rejectTraversalSimple() {
        assertThrows(WorkspaceSecurityException.class, () -> validator.validateAndResolve(studentRoot, "../etc/passwd"));
    }

    @Test
    void rejectTraversalEncodedSingle() {
        assertThrows(WorkspaceSecurityException.class, () -> validator.validateAndResolve(studentRoot, "%2e%2e%2fetc/passwd"));
    }

    @Test
    void rejectTraversalEncodedDouble() {
        assertThrows(WorkspaceSecurityException.class, () -> validator.validateAndResolve(studentRoot, "%252e%252e%2fetc/passwd"));
    }

    @Test
    void rejectTraversalEncodedBackslash() {
        assertThrows(WorkspaceSecurityException.class, () -> validator.validateAndResolve(studentRoot, "%2e%2e%5cWindows"));
    }

    @Test
    void rejectTraversalWithBackslashSeparator() {
        assertThrows(WorkspaceSecurityException.class, () -> validator.validateAndResolve(studentRoot, "a\\..\\b"));
    }

    @Test
    void rejectAbsoluteUnix() {
        assertThrows(WorkspaceSecurityException.class, () -> validator.validateAndResolve(studentRoot, "/etc/passwd"));
    }

    @Test
    void rejectAbsoluteWindows() {
        assertThrows(WorkspaceSecurityException.class, () -> validator.validateAndResolve(studentRoot, "C:\\Windows\\System32"));
    }

    @Test
    void rejectAbsoluteWindowsForwardSlash() {
        assertThrows(WorkspaceSecurityException.class, () -> validator.validateAndResolve(studentRoot, "C:/Windows"));
    }

    @Test
    void rejectUNCPath() {
        assertThrows(WorkspaceSecurityException.class, () -> validator.validateAndResolve(studentRoot, "\\\\server\\share"));
    }

    @Test
    void rejectNullByte() {
        assertThrows(WorkspaceSecurityException.class, () -> validator.validateAndResolve(studentRoot, "hello\u0000.py"));
    }

    @Test
    void rejectNullByteEncoded() {
        assertThrows(WorkspaceSecurityException.class, () -> validator.validateAndResolve(studentRoot, "hello%00.py"));
    }

    @Test
    void rejectEmptyPath() {
        assertThrows(WorkspaceSecurityException.class, () -> validator.validateAndResolve(studentRoot, ""));
    }

    @Test
    void rejectBlankPath() {
        assertThrows(WorkspaceSecurityException.class, () -> validator.validateAndResolve(studentRoot, "   "));
    }

    @Test
    void rejectDotAlone() {
        assertThrows(WorkspaceSecurityException.class, () -> validator.validateAndResolve(studentRoot, "."));
    }

    @Test
    void rejectPathTooLong() {
        String longPath = "a".repeat(600) + ".py";
        assertThrows(WorkspaceSecurityException.class, () -> validator.validateAndResolve(studentRoot, longPath));
    }

    @Test
    void rejectTraversalDeep() {
        assertThrows(WorkspaceSecurityException.class, () -> validator.validateAndResolve(studentRoot, "a/../../b"));
    }

    @Test
    void rejectTraversalAfterNormalization() {
        assertThrows(WorkspaceSecurityException.class, () -> validator.validateAndResolve(studentRoot, "a/b/../../../etc/passwd"));
    }

    @Test
    void rejectWindowsDriveColon() {
        assertThrows(WorkspaceSecurityException.class, () -> validator.validateAndResolve(studentRoot, "C:foo"));
    }

    @Test
    void symlinkAttackBlocked(@TempDir Path tmp2) throws IOException {
        // Skip on Windows if symlink not supported
        Path targetRoot = tmp2.resolve("realRoot");
        Files.createDirectories(targetRoot);
        Path student = targetRoot.resolve("students").resolve("victim");
        Files.createDirectories(student);
        Path outside = tmp2.resolve("outside.txt");
        Files.writeString(outside, "secret");
        Path link = student.resolve("link");
        try {
            Files.createSymbolicLink(link, outside);
        } catch (UnsupportedOperationException | IOException e) {
            // Windows without privilege may fail - skip test
            return;
        }
        PathValidator v2 = new PathValidator();
        // reading via symlink should be blocked
        assertThrows(WorkspaceSecurityException.class, () -> v2.validateAndResolve(student, "link"));
        // Even nested symlink
        Path subdir = student.resolve("sub");
        Files.createDirectories(subdir);
        Path link2 = subdir.resolve("evil");
        try {
            Files.createSymbolicLink(link2, outside);
            assertThrows(WorkspaceSecurityException.class, () -> v2.validateAndResolve(student, "sub/evil"));
        } catch (UnsupportedOperationException | IOException e) {
            // ignore if not supported
        }
    }

    @Test
    void nullPathRejected() {
        assertThrows(WorkspaceSecurityException.class, () -> validator.validateAndResolve(studentRoot, null));
    }

    @Test
    void contentSizeValidation() {
        String big = "a".repeat(1024 * 1024 + 1);
        assertThrows(WorkspaceSecurityException.class, () -> PathValidator.validateContentSize(big));
    }

    @Test
    void contentSizeOk() {
        String ok = "a".repeat(1024);
        assertDoesNotThrow(() -> PathValidator.validateContentSize(ok));
    }
}
