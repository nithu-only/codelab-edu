package com.codelab.execution;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;

import java.io.IOException;
import java.nio.file.Path;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

class DockerExecutorTest {

    private ProcessRunner mockRunner;
    private DockerExecutor executor;

    @BeforeEach
    void setUp() {
        mockRunner = mock(ProcessRunner.class);
        executor = new DockerExecutor(mockRunner);
    }

    @Test
    void fromNormalizedShouldSupportAllLanguages() {
        assertEquals(LanguageConfig.PYTHON, LanguageConfig.fromNormalized("python"));
        assertEquals(LanguageConfig.JAVA, LanguageConfig.fromNormalized("java"));
        assertEquals(LanguageConfig.C, LanguageConfig.fromNormalized("c"));
        assertEquals(LanguageConfig.CPP, LanguageConfig.fromNormalized("cpp"));
        assertEquals(LanguageConfig.CPP, LanguageConfig.fromNormalized("c++"));
    }

    @Test
    void fromNormalizedShouldThrowForUnsupported() {
        assertThrows(IllegalArgumentException.class, () -> LanguageConfig.fromNormalized("ruby"));
        assertThrows(IllegalArgumentException.class, () -> LanguageConfig.fromNormalized("javascript"));
    }

    @Test
    void trimShouldTruncateToLimit() {
        String longStr = "a".repeat(102401);
        String trimmed = DockerExecutor.trim(longStr, 102400);
        assertTrue(trimmed.length() > 102400); // includes notice
        assertTrue(trimmed.contains("[Output truncated to 100KB]"));
        assertTrue(trimmed.startsWith("a".repeat(102400)));
    }

    @Test
    void trimShouldLeaveShortStringUnchanged() {
        String s = "hello";
        assertEquals("hello", DockerExecutor.trim(s, 102400));
    }

    @Test
    void trimShouldHandleNull() {
        assertEquals("", DockerExecutor.trim(null, 102400));
    }

    @Test
    void executeShouldSucceedForPython() throws Exception {
        when(mockRunner.run(anyList(), anyString(), eq(10L)))
                .thenReturn(new ProcessResult("hello\n", "", 0, false));

        DockerExecutionResult result = executor.execute("python", "print('hello')", "");

        assertEquals(0, result.getExitCode());
        assertFalse(result.isTimedOut());
        assertFalse(result.isDockerUnavailable());
        assertEquals("hello\n", result.getStdout());
        assertEquals("", result.getStderr());
        assertTrue(result.getExecutionTimeMs() >= 0);

        // Verify docker command contains expected image and hardened limits
        verify(mockRunner).run(argThat(cmd -> {
            String joined = String.join(" ", cmd);
            return joined.contains("python:3.11-slim")
                    && joined.contains("--network none")
                    && joined.contains("--cpu-period 100000")
                    && joined.contains("--cpu-quota 50000")
                    && joined.contains("--memory 128m")
                    && joined.contains("--memory-swap 128m")
                    && joined.contains("--pids-limit 64")
                    && joined.contains("--read-only")
                    && joined.contains("--tmpfs /tmp:exec,size=64m")
                    && joined.contains("--cap-drop ALL")
                    && joined.contains("--security-opt no-new-privileges")
                    && joined.contains("--user 65534:65534")
                    && joined.contains("--rm");
        }), eq(""), eq(10L));
    }

    @Test
    void executeShouldPassStdinToRunner() throws Exception {
        when(mockRunner.run(anyList(), eq("test input"), eq(10L)))
                .thenReturn(new ProcessResult("got input", "", 0, false));

        DockerExecutionResult result = executor.execute("python", "print(input())", "test input");

        assertEquals("got input", result.getStdout());
        verify(mockRunner).run(anyList(), eq("test input"), eq(10L));
    }

    @Test
    void executeShouldMapCompileErrorToNonZero() throws Exception {
        when(mockRunner.run(anyList(), anyString(), eq(10L)))
                .thenReturn(new ProcessResult("", "error: expected ';'", 1, false));

        DockerExecutionResult result = executor.execute("c", "int main(){ return 0 }", "");

        assertEquals(1, result.getExitCode());
        assertFalse(result.isTimedOut());
        assertEquals("error: expected ';'", result.getStderr());
    }

    @Test
    void executeShouldHandleTimeout() throws Exception {
        when(mockRunner.run(anyList(), anyString(), eq(10L)))
                .thenReturn(new ProcessResult("partial", "", -1, true));

        DockerExecutionResult result = executor.execute("python", "while True: pass", "");

        assertTrue(result.isTimedOut());
        assertEquals(-1, result.getExitCode());
        assertTrue(result.getStderr().contains("Timeout after 10s"));
    }

    @Test
    void executeShouldTrimLargeOutput() throws Exception {
        String large = "x".repeat(200000);
        when(mockRunner.run(anyList(), anyString(), eq(10L)))
                .thenReturn(new ProcessResult(large, large, 0, false));

        DockerExecutionResult result = executor.execute("python", "print('x'*200000)", "");

        assertTrue(result.getStdout().contains("[Output truncated to 100KB]"));
        assertTrue(result.getStderr().contains("[Output truncated to 100KB]"));
        // 102400 + notice length
        assertTrue(result.getStdout().length() <= 102500);
    }

    @Test
    void executeShouldHandleDockerNotAvailableIOException() throws Exception {
        when(mockRunner.run(anyList(), anyString(), anyLong()))
                .thenThrow(new IOException("Cannot run program \"docker\": error=2, No such file or directory"));

        DockerExecutionResult result = executor.execute("python", "print('hi')", "");

        assertTrue(result.isDockerUnavailable());
        assertEquals(-1, result.getExitCode());
        assertTrue(result.getStderr().contains("Docker not available"));
    }

    @Test
    void executeShouldUseCorrectImagePerLanguage() throws Exception {
        when(mockRunner.run(anyList(), anyString(), eq(10L)))
                .thenReturn(new ProcessResult("", "", 0, false));

        executor.execute("java", "class Main{public static void main(String[]a){}}", "");
        verify(mockRunner).run(argThat(cmd -> String.join(" ", cmd).contains("eclipse-temurin:17")), anyString(), anyLong());

        reset(mockRunner);
        when(mockRunner.run(anyList(), anyString(), eq(10L))).thenReturn(new ProcessResult("", "", 0, false));
        executor.execute("c", "int main(){return 0;}", "");
        verify(mockRunner).run(argThat(cmd -> String.join(" ", cmd).contains("gcc:13")), anyString(), anyLong());

        reset(mockRunner);
        when(mockRunner.run(anyList(), anyString(), eq(10L))).thenReturn(new ProcessResult("", "", 0, false));
        executor.execute("cpp", "int main(){return 0;}", "");
        verify(mockRunner).run(argThat(cmd -> String.join(" ", cmd).contains("gcc:13")), anyString(), anyLong());
    }

    @Test
    void executeShouldHandleUnsupportedLanguageGracefully() throws Exception {
        // No mock expectation; should not call runner for unsupported
        DockerExecutionResult result = executor.execute("ruby", "puts 'hi'", "");
        assertEquals(-1, result.getExitCode());
        assertTrue(result.getStderr().contains("Unsupported language"));
        verify(mockRunner, never()).run(anyList(), anyString(), anyLong());
    }

    @Test
    void isDockerAvailableShouldReturnFalseWhenRunnerThrows() throws Exception {
        when(mockRunner.run(eq(List.of("docker", "info")), eq(""), eq(5L)))
                .thenThrow(new IOException("docker not found"));
        assertFalse(executor.isDockerAvailable());
    }

    @Test
    void isDockerAvailableShouldReturnTrueWhenExitZero() throws Exception {
        when(mockRunner.run(eq(List.of("docker", "info")), eq(""), eq(5L)))
                .thenReturn(new ProcessResult("", "", 0, false));
        assertTrue(executor.isDockerAvailable());
    }

    @Test
    void isDockerAvailableShouldReturnFalseWhenTimeout() throws Exception {
        when(mockRunner.run(eq(List.of("docker", "info")), eq(""), eq(5L)))
                .thenReturn(new ProcessResult("", "", -1, true));
        assertFalse(executor.isDockerAvailable());
    }
}
