package com.codelab.execution;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.TimeUnit;

/**
 * Executes code inside Docker containers securely.
 * Handles temp file lifecycle, Docker CLI invocation, timeout, trimming, and cleanup.
 */
@Component
public class DockerExecutor {

    private static final Logger log = LoggerFactory.getLogger(DockerExecutor.class);

    static final long TIMEOUT_SECONDS = 10;
    static final int OUTPUT_MAX_CHARS = 102400; // 100KB

    private final ProcessRunner processRunner;

    public DockerExecutor(ProcessRunner processRunner) {
        this.processRunner = processRunner;
    }

    /**
     * Execute source code for given normalized language (lower-case).
     *
     * @param normalizedLanguage already normalized (e.g., "python")
     * @param sourceCode         source to write to temp file
     * @param stdin              optional stdin (may be null or empty)
     * @return DockerExecutionResult
     */
    public DockerExecutionResult execute(String normalizedLanguage, String sourceCode, String stdin) {
        String containerName = "codelab-" + UUID.randomUUID().toString().substring(0, 8);
        return executeWithContainer(normalizedLanguage, sourceCode, stdin, containerName);
    }

    public DockerExecutionResult executeWithContainer(String normalizedLanguage, String sourceCode, String stdin, String containerName) {
        String stdinSafe = stdin == null ? "" : stdin;
        LanguageConfig config;
        try {
            config = LanguageConfig.fromNormalized(normalizedLanguage);
        } catch (IllegalArgumentException e) {
            return new DockerExecutionResult("", e.getMessage(), -1, false, 0);
        }

        Path tempDir = null;
        long start = System.currentTimeMillis();

        try {
            tempDir = Files.createTempDirectory("codelab-");
            // Least privilege: container runs as UID 65534, needs read/exec on dir and read on file.
            // Use 755 for dir (rwxr-xr-x) and 644 for file (rw-r--r--), portable to Ubuntu and Windows fallback.
            try {
                java.util.Set<java.nio.file.attribute.PosixFilePermission> dirPerms = java.nio.file.attribute.PosixFilePermissions.fromString("rwxr-xr-x");
                Files.setPosixFilePermissions(tempDir, dirPerms);
            } catch (Exception ignored) {
                // Windows or non-POSIX fallback: world-readable/executable, owner-writable only
                tempDir.toFile().setReadable(true, false);
                tempDir.toFile().setExecutable(true, false);
                tempDir.toFile().setWritable(true, true); // owner only
            }
            Path sourceFile = tempDir.resolve(config.getFilename());
            Files.writeString(sourceFile, sourceCode, StandardCharsets.UTF_8);
            try {
                java.util.Set<java.nio.file.attribute.PosixFilePermission> filePerms = java.nio.file.attribute.PosixFilePermissions.fromString("rw-r--r--");
                Files.setPosixFilePermissions(sourceFile, filePerms);
            } catch (Exception ignored) {
                sourceFile.toFile().setReadable(true, false);
                sourceFile.toFile().setWritable(true, true); // owner only, world-readable
            }

            String hostPath = tempDir.toAbsolutePath().toString();

            List<String> dockerCmd = new ArrayList<>();
            dockerCmd.addAll(List.of(
                    "docker", "run", "--rm",
                    "--network", "none",
                    "--cpu-period", "100000",
                    "--cpu-quota", "50000",
                    "--memory", "128m",
                    "--memory-swap", "128m",
                    "--pids-limit", "64",
                    "--read-only",
                    "--tmpfs", "/tmp:exec,size=64m",
                    "--cap-drop", "ALL",
                    "--security-opt", "no-new-privileges",
                    "--user", "65534:65534",
                    "--name", containerName,
                    "-i",
                    "-v", hostPath + ":/workspace"
            ));
            dockerCmd.add(config.getImage());
            dockerCmd.addAll(config.getContainerCommand());

            ProcessResult result;
            try {
                result = processRunner.run(dockerCmd, stdinSafe, TIMEOUT_SECONDS);
            } catch (IOException e) {
                long elapsed = System.currentTimeMillis() - start;
                // Detect docker not found / not available
                String msg = e.getMessage() != null ? e.getMessage().toLowerCase() : "";
                boolean dockerMissing = msg.contains("cannot run program") || msg.contains("docker") || msg.contains("no such file");
                String stderr = "Docker not available: " + e.getMessage() + ". Ensure Docker daemon is running and 'docker' is on PATH.";
                log.warn("Docker execution failed - docker unavailable: {}", e.getMessage());
                return new DockerExecutionResult("", stderr, -1, false, elapsed, dockerMissing || true);
            }

            long elapsed = System.currentTimeMillis() - start;

            if (result.timedOut()) {
                // Ensure container is killed/removed even with --rm (docker kill is needed if timeout)
                killContainer(containerName);
                String stderr = trim(result.stderr(), OUTPUT_MAX_CHARS);
                if (!stderr.isEmpty()) stderr += "\n";
                stderr += "[Timeout after " + TIMEOUT_SECONDS + "s - execution killed]";
                String stdout = trim(result.stdout(), OUTPUT_MAX_CHARS);
                return new DockerExecutionResult(stdout, stderr, -1, true, elapsed);
            }

            String stdout = trim(result.stdout(), OUTPUT_MAX_CHARS);
            String stderr = trim(result.stderr(), OUTPUT_MAX_CHARS);

            // If exit code suggests docker image not found or docker error, map to dockerUnavailable for graceful ERROR status
            // But we still want to surface stderr to user; ExecutionServiceImpl will check dockerUnavailable flag only on IOException path.

            return new DockerExecutionResult(stdout, stderr, result.exitCode(), false, elapsed);

        } catch (IOException | InterruptedException e) {
            long elapsed = System.currentTimeMillis() - start;
            String stderr = "System error during execution: " + e.getMessage();
            log.error("Execution system error", e);
            boolean dockerUnavailable = e.getMessage() != null && e.getMessage().toLowerCase().contains("docker");
            return new DockerExecutionResult("", stderr, -1, false, elapsed, dockerUnavailable);
        } finally {
            if (tempDir != null) {
                deleteRecursively(tempDir);
            }
            // elapsed already computed above; for finally we don't need extra cleanup except ensure container removal on timeout already done
        }
    }

    /**
     * Trim string to maxChars. If truncated, append notice.
     */
    static String trim(String s, int maxChars) {
        if (s == null) return "";
        if (s.length() <= maxChars) return s;
        return s.substring(0, maxChars) + "\n[Output truncated to 100KB]";
    }

    public void killContainer(String containerName) {
        try {
            // Try docker kill, then docker rm -f as fallback
            new ProcessBuilder("docker", "kill", containerName)
                    .start().waitFor(3, TimeUnit.SECONDS);
        } catch (Exception e) {
            log.debug("docker kill failed for {}: {}", containerName, e.getMessage());
        }
        try {
            new ProcessBuilder("docker", "rm", "-f", containerName)
                    .start().waitFor(3, TimeUnit.SECONDS);
        } catch (Exception e) {
            log.debug("docker rm -f failed for {}: {}", containerName, e.getMessage());
        }
    }

    private void deleteRecursively(Path dir) {
        try {
            Files.walk(dir)
                    .sorted(Comparator.reverseOrder())
                    .forEach(p -> {
                        try {
                            Files.deleteIfExists(p);
                        } catch (IOException e) {
                            log.debug("Failed to delete temp file {}: {}", p, e.getMessage());
                        }
                    });
        } catch (IOException e) {
            log.debug("Failed to walk temp dir for deletion: {}", e.getMessage());
        }
    }

    /**
     * Check if docker CLI is available. Useful for health/fallback diagnostics.
     */
    public boolean isDockerAvailable() {
        try {
            ProcessResult pr = processRunner.run(List.of("docker", "info"), "", 5);
            return pr.exitCode() == 0 && !pr.timedOut();
        } catch (Exception e) {
            return false;
        }
    }
}
