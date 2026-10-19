package com.codelab.execution;

/**
 * Internal result from DockerExecutor before mapping to ExecutionResponse.
 */
public class DockerExecutionResult {

    private final String stdout;
    private final String stderr;
    private final int exitCode;
    private final boolean timedOut;
    private final long executionTimeMs;
    private final boolean dockerUnavailable;

    public DockerExecutionResult(String stdout, String stderr, int exitCode, boolean timedOut, long executionTimeMs) {
        this(stdout, stderr, exitCode, timedOut, executionTimeMs, false);
    }

    public DockerExecutionResult(String stdout, String stderr, int exitCode, boolean timedOut, long executionTimeMs, boolean dockerUnavailable) {
        this.stdout = stdout;
        this.stderr = stderr;
        this.exitCode = exitCode;
        this.timedOut = timedOut;
        this.executionTimeMs = executionTimeMs;
        this.dockerUnavailable = dockerUnavailable;
    }

    public String getStdout() {
        return stdout;
    }

    public String getStderr() {
        return stderr;
    }

    public int getExitCode() {
        return exitCode;
    }

    public boolean isTimedOut() {
        return timedOut;
    }

    public long getExecutionTimeMs() {
        return executionTimeMs;
    }

    public boolean isDockerUnavailable() {
        return dockerUnavailable;
    }
}
