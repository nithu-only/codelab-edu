package com.codelab.execution;

/**
 * Result of a low-level process execution via {@link ProcessRunner}.
 */
public class ProcessResult {

    private final String stdout;
    private final String stderr;
    private final int exitCode;
    private final boolean timedOut;

    public ProcessResult(String stdout, String stderr, int exitCode, boolean timedOut) {
        this.stdout = stdout;
        this.stderr = stderr;
        this.exitCode = exitCode;
        this.timedOut = timedOut;
    }

    public String stdout() {
        return stdout;
    }

    public String stderr() {
        return stderr;
    }

    public int exitCode() {
        return exitCode;
    }

    public boolean timedOut() {
        return timedOut;
    }
}
