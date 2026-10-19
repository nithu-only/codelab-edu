package com.codelab.execution;

import com.codelab.dto.ExecutionRequest;
import com.codelab.dto.ExecutionResponse;
import com.codelab.service.ExecutionServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

class ExecutionServiceImplTest {

    private DockerExecutor mockExecutor;
    private com.codelab.execution.ExecutionRegistry registry;
    private ExecutionServiceImpl service;

    @BeforeEach
    void setUp() {
        mockExecutor = mock(DockerExecutor.class);
        registry = new com.codelab.execution.ExecutionRegistry();
        service = new ExecutionServiceImpl(mockExecutor, registry);
    }

    @Test
    void shouldMapSuccessToStatusSuccess() {
        when(mockExecutor.executeWithContainer(eq("python"), anyString(), anyString(), anyString()))
                .thenReturn(new DockerExecutionResult("hello", "", 0, false, 123));

        ExecutionRequest req = new ExecutionRequest("python", "print('hello')", "");
        ExecutionResponse res = service.execute(req);

        assertEquals("SUCCESS", res.getStatus());
        assertEquals(0, res.getExitCode());
        assertEquals("hello", res.getStdout());
        assertEquals("python", res.getLanguage());
        assertEquals(123L, res.getExecutionTimeMs());
        assertNotNull(res.getExecutionId());
        assertNotNull(res.getCreatedAt());
    }

    @Test
    void shouldMapNonZeroToFailed() {
        when(mockExecutor.executeWithContainer(anyString(), anyString(), anyString(), anyString()))
                .thenReturn(new DockerExecutionResult("", "compile error", 1, false, 50));

        ExecutionRequest req = new ExecutionRequest("c", "bad code", null);
        ExecutionResponse res = service.execute(req);

        assertEquals("FAILED", res.getStatus());
        assertEquals(1, res.getExitCode());
        assertEquals("compile error", res.getStderr());
    }

    @Test
    void shouldMapTimeoutToTimeoutStatus() {
        when(mockExecutor.executeWithContainer(anyString(), anyString(), anyString(), anyString()))
                .thenReturn(new DockerExecutionResult("partial", "Timeout after 10s", -1, true, 10000));

        ExecutionRequest req = new ExecutionRequest("python", "while True: pass", "");
        ExecutionResponse res = service.execute(req);

        assertEquals("TIMEOUT", res.getStatus());
        assertEquals(-1, res.getExitCode());
    }

    @Test
    void shouldMapDockerUnavailableToError() {
        when(mockExecutor.executeWithContainer(anyString(), anyString(), anyString(), anyString()))
                .thenReturn(new DockerExecutionResult("", "Docker not available: Cannot run program", -1, false, 10, true));

        ExecutionRequest req = new ExecutionRequest("python", "print('hi')", "");
        ExecutionResponse res = service.execute(req);

        assertEquals("ERROR", res.getStatus());
        assertTrue(res.getStderr().contains("Docker not available"));
    }

    @Test
    void shouldNormalizeLanguageToLower() {
        when(mockExecutor.executeWithContainer(eq("python"), anyString(), anyString(), anyString()))
                .thenReturn(new DockerExecutionResult("", "", 0, false, 10));

        ExecutionRequest req = new ExecutionRequest("Python", "print('hi')", null);
        ExecutionResponse res = service.execute(req);

        assertEquals("python", res.getLanguage());
        verify(mockExecutor).executeWithContainer(eq("python"), eq("print('hi')"), eq(""), anyString());
    }

    @Test
    void shouldHandleStdinNullAsEmpty() {
        when(mockExecutor.executeWithContainer(anyString(), anyString(), eq(""), anyString()))
                .thenReturn(new DockerExecutionResult("", "", 0, false, 5));

        ExecutionRequest req = new ExecutionRequest("python", "code", null);
        service.execute(req);

        verify(mockExecutor).executeWithContainer(eq("python"), eq("code"), eq(""), anyString());
    }

    @Test
    void shouldHandleExecutorExceptionAsError() {
        when(mockExecutor.executeWithContainer(anyString(), anyString(), anyString(), anyString()))
                .thenThrow(new RuntimeException("unexpected"));

        ExecutionRequest req = new ExecutionRequest("python", "code", "");
        ExecutionResponse res = service.execute(req);

        assertEquals("ERROR", res.getStatus());
        assertTrue(res.getStderr().contains("System error"));
    }

    @Test
    void executionIdShouldBeUuid() {
        when(mockExecutor.executeWithContainer(anyString(), anyString(), anyString(), anyString()))
                .thenReturn(new DockerExecutionResult("", "", 0, false, 10));

        ExecutionRequest req = new ExecutionRequest("cpp", "code", "");
        ExecutionResponse res1 = service.execute(req);
        ExecutionResponse res2 = service.execute(req);

        assertNotEquals(res1.getExecutionId(), res2.getExecutionId());
        // UUID format check
        assertDoesNotThrow(() -> java.util.UUID.fromString(res1.getExecutionId()));
    }
}
