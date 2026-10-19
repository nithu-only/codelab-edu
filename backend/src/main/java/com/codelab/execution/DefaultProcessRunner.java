package com.codelab.execution;

import org.springframework.stereotype.Component;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;
import java.util.concurrent.TimeUnit;

/**
 * Default implementation using ProcessBuilder.
 * Handles stdin piping, stdout/stderr gobbling, and timeout with forcible destroy.
 */
@Component
public class DefaultProcessRunner implements ProcessRunner {

    @Override
    public ProcessResult run(List<String> command, String stdin, long timeoutSeconds) throws IOException, InterruptedException {
        ProcessBuilder pb = new ProcessBuilder(command);
        // do not merge streams; capture separately
        pb.redirectErrorStream(false);
        Process process = pb.start();

        // Write stdin asynchronously then close
        try (OutputStream os = process.getOutputStream()) {
            if (stdin != null && !stdin.isEmpty()) {
                os.write(stdin.getBytes(StandardCharsets.UTF_8));
                os.flush();
            }
        } catch (IOException e) {
            // stdin pipe broken (process exited early) - treat as non-fatal
        }

        ExecutorService executor = Executors.newFixedThreadPool(2);
        Future<String> stdoutFuture = executor.submit(() -> readStream(process.getInputStream()));
        Future<String> stderrFuture = executor.submit(() -> readStream(process.getErrorStream()));

        boolean finished = process.waitFor(timeoutSeconds, TimeUnit.SECONDS);
        if (!finished) {
            process.destroyForcibly();
            // give a short grace to reap
            process.waitFor(2, TimeUnit.SECONDS);
            // attempt to collect whatever output is available (with short timeout)
            String stdout = getFutureWithTimeout(stdoutFuture, 1);
            String stderr = getFutureWithTimeout(stderrFuture, 1);
            executor.shutdownNow();
            return new ProcessResult(stdout, stderr, -1, true);
        }

        int exitCode = process.exitValue();
        String stdout = "";
        String stderr = "";
        try {
            stdout = stdoutFuture.get(2, TimeUnit.SECONDS);
        } catch (Exception e) {
            stdoutFuture.cancel(true);
        }
        try {
            stderr = stderrFuture.get(2, TimeUnit.SECONDS);
        } catch (Exception e) {
            stderrFuture.cancel(true);
        }
        executor.shutdownNow();
        return new ProcessResult(stdout, stderr, exitCode, false);
    }

    private String readStream(InputStream is) throws IOException {
        StringBuilder sb = new StringBuilder();
        try (BufferedReader reader = new BufferedReader(new InputStreamReader(is, StandardCharsets.UTF_8))) {
            char[] buf = new char[8192];
            int len;
            while ((len = reader.read(buf)) != -1) {
                sb.append(buf, 0, len);
            }
        }
        return sb.toString();
    }

    private String getFutureWithTimeout(Future<String> future, long seconds) {
        try {
            return future.get(seconds, TimeUnit.SECONDS);
        } catch (Exception e) {
            future.cancel(true);
            return "";
        }
    }
}
