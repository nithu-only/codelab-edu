package com.codelab.service;

import com.codelab.dto.ExecutionRequest;
import com.codelab.dto.ExecutionResponse;
import com.codelab.execution.DockerExecutionResult;
import com.codelab.execution.DockerExecutor;
import com.codelab.execution.ExecutionRegistry;
import com.codelab.model.Status;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.UUID;

@Service
public class ExecutionServiceImpl implements ExecutionService {

    private static final Logger log = LoggerFactory.getLogger(ExecutionServiceImpl.class);

    private final DockerExecutor dockerExecutor;
    private final ExecutionRegistry registry;

    public ExecutionServiceImpl(DockerExecutor dockerExecutor, ExecutionRegistry registry) {
        this.dockerExecutor = dockerExecutor;
        this.registry = registry;
    }

    @Override
    public ExecutionResponse execute(ExecutionRequest req) {
        String executionId = req.getExecutionId();
        if (executionId == null || executionId.isBlank()) {
            executionId = UUID.randomUUID().toString();
        }
        String normalizedLanguage = req.getNormalizedLanguage();
        String stdin = req.getStdinOrDefault();
        String sourceCode = req.getSourceCode();

        String containerName = "codelab-" + executionId.substring(0, 8);
        // register before execution so cancel can find it
        ExecutionRegistry.Entry entry = registry.register(executionId, containerName);

        DockerExecutionResult result;
        try {
            result = dockerExecutor.executeWithContainer(normalizedLanguage, sourceCode, stdin, containerName);
        } catch (Exception e) {
            log.error("Unexpected execution error for {}: {}", executionId, e.getMessage(), e);
            ExecutionResponse errResp = new ExecutionResponse(
                    executionId,
                    Status.ERROR.name(),
                    normalizedLanguage,
                    "",
                    "System error: " + (e.getMessage() != null ? e.getMessage() : "Unknown") + " [executionId=" + executionId + "]",
                    -1,
                    0L,
                    Instant.now().toString()
            );
            registry.complete(executionId, errResp);
            return errResp;
        }

        Status status;
        // cancellation takes precedence over timeout/success
        if (entry.cancelled.get()) {
            status = Status.CANCELLED;
        } else if (result.isTimedOut()) {
            status = Status.TIMEOUT;
        } else if (result.isDockerUnavailable()) {
            status = Status.ERROR;
        } else if (result.getExitCode() == 0) {
            status = Status.SUCCESS;
        } else {
            status = Status.FAILED;
        }

        String stdout = result.getStdout() != null ? result.getStdout() : "";
        String stderr = result.getStderr() != null ? result.getStderr() : "";

        if (status == Status.CANCELLED) {
            stderr = (stderr.isEmpty() ? "" : stderr + "\n") + "[Execution cancelled by user]";
            // ensure exitCode -1 for cancelled
            result = new DockerExecutionResult(stdout, stderr, -1, false, result.getExecutionTimeMs(), false);
        }

        if (result.isDockerUnavailable() && (stderr.isEmpty() || !stderr.contains("Docker not available"))) {
            stderr = (stderr.isEmpty() ? "" : stderr + "\n") + "Docker not available - ensure Docker daemon is running.";
        }

        ExecutionResponse resp = new ExecutionResponse(
                executionId,
                status.name(),
                normalizedLanguage,
                stdout,
                stderr,
                result.getExitCode(),
                result.getExecutionTimeMs(),
                Instant.now().toString()
        );
        registry.complete(executionId, resp);
        return resp;
    }

    public ExecutionResponse cancel(String executionId) {
        ExecutionRegistry.Entry running = registry.getRunning(executionId);
        if (running != null) {
            boolean newlyCancelled = running.cancelled.compareAndSet(false, true);
            if (newlyCancelled) {
                log.info("Cancelling execution {}", executionId);
                dockerExecutor.killContainer(running.containerName);
            }
            // wait briefly for execution to notice cancellation
            long deadline = System.currentTimeMillis() + 4000;
            while (System.currentTimeMillis() < deadline) {
                if (registry.getCompleted(executionId) != null) {
                    break;
                }
                try { Thread.sleep(100); } catch (InterruptedException ignored) { Thread.currentThread().interrupt(); break; }
            }
            ExecutionResponse completed = registry.getCompleted(executionId);
            if (completed != null) {
                return completed;
            }
            // still running but marked cancelled -> synthesize cancelled response
            return new ExecutionResponse(
                    executionId,
                    Status.CANCELLED.name(),
                    "",
                    "",
                    "[Execution cancelled by user]",
                    -1,
                    System.currentTimeMillis() - running.startTimeMs,
                    Instant.now().toString()
            );
        }
        ExecutionResponse completed = registry.getCompleted(executionId);
        if (completed != null) {
            // idempotent: if already cancelled return as is, if completed return completed
            return completed;
        }
        return null;
    }

    public ExecutionResponse getResult(String executionId) {
        ExecutionResponse completed = registry.getCompleted(executionId);
        if (completed != null) return completed;
        ExecutionRegistry.Entry running = registry.getRunning(executionId);
        if (running != null) {
            return new ExecutionResponse(
                    executionId,
                    Status.RUNNING.name(),
                    "",
                    "",
                    "",
                    -1,
                    System.currentTimeMillis() - running.startTimeMs,
                    Instant.now().toString()
            );
        }
        return null;
    }
}
