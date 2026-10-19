package com.codelab.execution;

import com.codelab.dto.ExecutionRequest;
import com.codelab.dto.ExecutionResponse;
import com.codelab.service.ExecutionServiceImpl;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

class LifecycleRegressionTest {

    @Test
    void successfulExecutionShouldBeSuccess() {
        ProcessRunner runner = mock(ProcessRunner.class);
        DockerExecutor exec = new DockerExecutor(runner);
        ExecutionRegistry reg = new ExecutionRegistry();
        ExecutionServiceImpl svc = new ExecutionServiceImpl(exec, reg);
        try {
            when(runner.run(anyList(), anyString(), eq(10L))).thenReturn(new ProcessResult("hello\n", "", 0, false));
            ExecutionRequest req = new ExecutionRequest("python", "print('hello')", "");
            ExecutionResponse r = svc.execute(req);
            assertEquals("SUCCESS", r.getStatus());
            assertEquals("hello\n", r.getStdout());
            assertEquals(0, r.getExitCode());
            assertNotNull(r.getExecutionId());
            assertEquals(0, reg.runningCount());
            // cleanup: docker ps should be empty, temp dir deleted implicitly
        } catch (Exception e) { fail(e); }
    }

    @Test
    void compilationFailureShouldBeFailedAndCleaned() {
        ProcessRunner runner = mock(ProcessRunner.class);
        DockerExecutor exec = new DockerExecutor(runner);
        ExecutionRegistry reg = new ExecutionRegistry();
        ExecutionServiceImpl svc = new ExecutionServiceImpl(exec, reg);
        try {
            when(runner.run(anyList(), anyString(), eq(10L))).thenReturn(new ProcessResult("", "error: expected ';'", 1, false));
            ExecutionRequest req = new ExecutionRequest("c", "bad", "");
            ExecutionResponse r = svc.execute(req);
            assertEquals("FAILED", r.getStatus());
            assertEquals(1, r.getExitCode());
            assertEquals(0, reg.runningCount());
        } catch (Exception e) { fail(e); }
    }

    @Test
    void timeoutShouldBeTimeoutAndCleaned() {
        ProcessRunner runner = mock(ProcessRunner.class);
        DockerExecutor exec = new DockerExecutor(runner);
        ExecutionRegistry reg = new ExecutionRegistry();
        ExecutionServiceImpl svc = new ExecutionServiceImpl(exec, reg);
        try {
            when(runner.run(anyList(), anyString(), eq(10L))).thenReturn(new ProcessResult("", "", -1, true));
            ExecutionRequest req = new ExecutionRequest("python", "while True: pass", "");
            ExecutionResponse r = svc.execute(req);
            assertEquals("TIMEOUT", r.getStatus());
            assertTrue(r.getStderr().contains("Timeout after 10s"));
            assertEquals(0, reg.runningCount());
        } catch (Exception e) { fail(e); }
    }

    @Test
    void cancellationShouldBeCancelledAndIdempotent() throws Exception {
        // slow runner that blocks
        ProcessRunner blockingRunner = new ProcessRunner() {
            @Override
            public ProcessResult run(java.util.List<String> command, String stdin, long timeoutSeconds) throws java.io.IOException, InterruptedException {
                // simulate long running docker; sleep until interrupted by kill
                Thread.sleep(5000);
                return new ProcessResult("", "", -1, false);
            }
        };
        DockerExecutor exec = spy(new DockerExecutor(blockingRunner));
        // stub killContainer to not actually call docker
        doNothing().when(exec).killContainer(anyString());
        ExecutionRegistry reg = new ExecutionRegistry();
        ExecutionServiceImpl svc = new ExecutionServiceImpl(exec, reg);

        ExecutionRequest req = new ExecutionRequest("python", "import time; time.sleep(30)", "");
        String execId = "test-cancel-id-12345678";

        req.setExecutionId(execId);

        Thread t = new Thread(() -> svc.execute(req));
        t.start();
        Thread.sleep(400); // let registry register
        assertEquals(1, reg.runningCount());
        ExecutionResponse c1 = svc.cancel(execId);
        assertNotNull(c1);
        assertEquals("CANCELLED", c1.getStatus());
        // idempotent second cancel
        ExecutionResponse c2 = svc.cancel(execId);
        assertEquals("CANCELLED", c2.getStatus());
        t.join(6000);
        assertEquals(0, reg.runningCount());
        // verify kill called
        verify(exec, atLeastOnce()).killContainer(anyString());
    }

    @Test
    void getResultAfterCompletionShouldReturnCompleted() throws Exception {
        ProcessRunner runner = mock(ProcessRunner.class);
        when(runner.run(anyList(), anyString(), eq(10L))).thenReturn(new ProcessResult("done", "", 0, false));
        DockerExecutor exec = new DockerExecutor(runner);
        ExecutionRegistry reg = new ExecutionRegistry();
        ExecutionServiceImpl svc = new ExecutionServiceImpl(exec, reg);
        ExecutionRequest req = new ExecutionRequest("python", "print('done')", "");
        req.setExecutionId("known-id-1234");
        ExecutionResponse r = svc.execute(req);
        ExecutionResponse fetched = svc.getResult("known-id-1234");
        assertNotNull(fetched);
        assertEquals(r.getExecutionId(), fetched.getExecutionId());
        assertEquals("SUCCESS", fetched.getStatus());
        assertNull(svc.getResult("unknown-id"));
    }

    @Test
    void executionIdShouldBeRespectedFromRequest() throws Exception {
        ProcessRunner runner = mock(ProcessRunner.class);
        when(runner.run(anyList(), anyString(), eq(10L))).thenReturn(new ProcessResult("hi", "", 0, false));
        DockerExecutor exec = new DockerExecutor(runner);
        ExecutionRegistry reg = new ExecutionRegistry();
        ExecutionServiceImpl svc = new ExecutionServiceImpl(exec, reg);
        ExecutionRequest req = new ExecutionRequest("python", "print('hi')", "");
        String customId = "my-custom-execution-id-aaaaaaaa-bbbb";
        req.setExecutionId(customId);
        ExecutionResponse r = svc.execute(req);
        assertEquals(customId, r.getExecutionId());
    }

    @Test
    void dockerUnavailableShouldBeErrorAndCleaned() throws Exception {
        ProcessRunner runner = mock(ProcessRunner.class);
        when(runner.run(anyList(), anyString(), eq(10L))).thenThrow(new java.io.IOException("Cannot run program \"docker\""));
        DockerExecutor exec = new DockerExecutor(runner);
        ExecutionRegistry reg = new ExecutionRegistry();
        ExecutionServiceImpl svc = new ExecutionServiceImpl(exec, reg);
        ExecutionRequest req = new ExecutionRequest("python", "print('hi')", "");
        ExecutionResponse r = svc.execute(req);
        assertEquals("ERROR", r.getStatus());
        assertTrue(r.getStderr().contains("Docker not available"));
        assertEquals(0, reg.runningCount());
    }

    @Test
    void concurrentExecutionsShouldBeIsolated() throws Exception {
        ProcessRunner runner = mock(ProcessRunner.class);
        when(runner.run(anyList(), anyString(), eq(10L))).thenAnswer(inv -> {
            Thread.sleep(100);
            return new ProcessResult("ok", "", 0, false);
        });
        DockerExecutor exec = new DockerExecutor(runner);
        ExecutionRegistry reg = new ExecutionRegistry();
        ExecutionServiceImpl svc = new ExecutionServiceImpl(exec, reg);
        int n = 5;
        java.util.List<Thread> threads = new java.util.ArrayList<>();
        java.util.List<ExecutionResponse> results = java.util.Collections.synchronizedList(new java.util.ArrayList<>());
        for (int i=0;i<n;i++) {
            final int idx=i;
            Thread t = new Thread(() -> {
                ExecutionRequest req = new ExecutionRequest("python", "print("+idx+")", "");
                results.add(svc.execute(req));
            });
            threads.add(t); t.start();
        }
        for (Thread t: threads) t.join(5000);
        assertEquals(n, results.size());
        assertTrue(results.stream().allMatch(r -> "SUCCESS".equals(r.getStatus())));
        assertEquals(0, reg.runningCount());
    }
}
