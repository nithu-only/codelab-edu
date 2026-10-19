package com.codelab.execution;

import java.io.IOException;
import java.util.List;

/**
 * Abstraction over ProcessBuilder execution for testability.
 */
public interface ProcessRunner {

    /**
     * Run command with optional stdin, waiting up to timeoutSeconds.
     * Must not throw on non-zero exit; only on failure to start process.
     *
     * @param command        full command including executable
     * @param stdin          data to pipe to process stdin (may be empty)
     * @param timeoutSeconds timeout in seconds
     * @return result with stdout/stderr/exitCode/timedOut
     */
    ProcessResult run(List<String> command, String stdin, long timeoutSeconds) throws IOException, InterruptedException;
}
