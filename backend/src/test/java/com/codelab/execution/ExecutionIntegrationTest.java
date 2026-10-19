package com.codelab.execution;

import com.codelab.dto.ExecutionRequest;
import com.codelab.dto.ExecutionResponse;
import com.codelab.service.ExecutionServiceImpl;
import com.codelab.workspace.PathValidator;
import com.codelab.workspace.StudentWorkspaceResolverImpl;
import com.codelab.workspace.WorkspaceException;
import com.codelab.workspace.WorkspaceSecurityException;
import com.codelab.workspace.WorkspaceService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;

import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/**
 * Agent C — Execution Integration regression tests.
 * Verifies persistent workspace -> temporary execution workspace integration.
 */
class ExecutionIntegrationTest {

    private WorkspaceService workspaceService;
    private StudentWorkspaceResolverImpl resolver;
    private PathValidator validator;
    private Path workspaceRoot;

    private ProcessRunner mockRunner;
    private DockerExecutor dockerExecutor;
    private ExecutionRegistry registry;
    private ExecutionServiceImpl executionService;

    private List<List<String>> capturedCommands;

    @BeforeEach
    void setUp(@TempDir Path tmp) throws Exception {
        workspaceRoot = tmp.resolve("workspaces");
        Files.createDirectories(workspaceRoot);
        validator = new PathValidator();
        resolver = new StudentWorkspaceResolverImpl(workspaceRoot, validator);
        workspaceService = new WorkspaceService(resolver, validator);

        capturedCommands = new ArrayList<>();
        mockRunner = mock(ProcessRunner.class);
        dockerExecutor = new DockerExecutor(mockRunner);
        registry = new ExecutionRegistry();
        executionService = new ExecutionServiceImpl(dockerExecutor, registry);
    }

    /** Extract host path from volume spec handling Windows drive letter (C:\path:/workspace). */
    private static String extractHostPath(String volume) {
        // volume is like "C:\Users\... \codelab-xyz:/workspace" or "/tmp/codelab-xyz:/workspace"
        if (volume.endsWith(":/workspace")) {
            return volume.substring(0, volume.length() - ":/workspace".length());
        }
        // fallback: last colon split
        int lastColon = volume.lastIndexOf(':');
        if (lastColon > 0) return volume.substring(0, lastColon);
        return volume;
    }

    private void assertHardenedFlags(List<String> cmd) {
        String joined = String.join(" ", cmd);
        assertTrue(joined.contains("--network none"), "must contain --network none, got: " + joined);
        assertTrue(joined.contains("--read-only"), "must contain --read-only");
        assertTrue(joined.contains("--tmpfs /tmp:exec,size=64m"), "must contain --tmpfs");
        assertTrue(joined.contains("--cap-drop ALL"), "must contain --cap-drop ALL");
        assertTrue(joined.contains("--security-opt no-new-privileges"), "must contain no-new-privileges");
        assertTrue(joined.contains("--user 65534:65534"), "must contain --user 65534:65534");
        assertTrue(joined.contains("--cpu-period 100000"), "must contain --cpu-period");
        assertTrue(joined.contains("--cpu-quota 50000"), "must contain --cpu-quota");
        assertTrue(joined.contains("--memory 128m"), "must contain --memory 128m");
        assertTrue(joined.contains("--memory-swap 128m"), "must contain --memory-swap");
        assertTrue(joined.contains("--pids-limit 64"), "must contain --pids-limit 64");
        assertTrue(joined.contains("--rm"), "must contain --rm");
        assertFalse(joined.contains("--privileged"), "must NOT contain --privileged");
        assertFalse(joined.contains("/var/run/docker.sock"), "must NOT mount docker.sock");
    }

    private void assertNoPersistentMount(List<String> cmd) {
        String joined = String.join(" ", cmd);
        int vIdx = cmd.indexOf("-v");
        assertTrue(vIdx >= 0 && vIdx + 1 < cmd.size(), "docker command must have -v, got: " + joined);
        String volume = cmd.get(vIdx + 1);
        assertTrue(volume.endsWith(":/workspace"), "volume must mount to /workspace, got: " + volume);
        String hostPart = extractHostPath(volume);
        assertTrue(hostPart.contains("codelab-"), "host mount must be temp codelab- dir, got: " + hostPart + " volume=" + volume);
        assertFalse(hostPart.contains("students"), "host mount must NOT be persistent workspace students dir, got: " + hostPart);
        assertFalse(joined.contains("students"), "docker command must NOT contain students mount, got: " + joined);
        assertFalse(joined.toLowerCase().contains("/codelab/students"), "must not mount /codelab/students");
    }

    @Test
    void pythonCreateSaveExecuteIntegration() throws Exception {
        when(mockRunner.run(anyList(), anyString(), anyLong()))
                .thenAnswer(inv -> {
                    @SuppressWarnings("unchecked")
                    List<String> cmd = (List<String>) inv.getArgument(0);
                    capturedCommands.add(new ArrayList<>(cmd));
                    String joined = String.join(" ", cmd);
                    assertTrue(joined.contains("python:3.11-slim"), "expected python image, got: " + joined);
                    return new ProcessResult("hello python\n", "", 0, false);
                });

        String student = "alice";
        String file = "hello.py";
        workspaceService.createFile(student, file, "print('hello python')");
        workspaceService.saveFile(student, file, "print('hello python v2')");
        String content = workspaceService.readFile(student, file);
        assertEquals("print('hello python v2')", content);

        ExecutionRequest req = new ExecutionRequest("python", content, "");
        ExecutionResponse resp = executionService.execute(req);

        assertEquals("SUCCESS", resp.getStatus());
        assertEquals("hello python\n", resp.getStdout());
        assertEquals(0, resp.getExitCode());

        assertEquals(1, capturedCommands.size());
        assertHardenedFlags(capturedCommands.get(0));
        assertNoPersistentMount(capturedCommands.get(0));
    }

    @Test
    void javaCreateSaveExecuteIntegration() throws Exception {
        when(mockRunner.run(anyList(), anyString(), anyLong()))
                .thenAnswer(inv -> {
                    @SuppressWarnings("unchecked")
                    List<String> cmd = (List<String>) inv.getArgument(0);
                    capturedCommands.add(new ArrayList<>(cmd));
                    String joined = String.join(" ", cmd);
                    assertTrue(joined.contains("eclipse-temurin:17"), "expected java image, got: " + joined);
                    return new ProcessResult("hello java\n", "", 0, false);
                });

        String student = "dev-student";
        String file = "Main.java";
        String javaCode = "public class Main{public static void main(String[]a){System.out.println(\"hello java\");}}";
        workspaceService.createFile(student, file, javaCode);
        String content = workspaceService.readFile(student, file);
        ExecutionRequest req = new ExecutionRequest("java", content, "");
        ExecutionResponse resp = executionService.execute(req);
        assertEquals("SUCCESS", resp.getStatus());
        assertEquals("hello java\n", resp.getStdout());
        assertHardenedFlags(capturedCommands.get(0));
        assertNoPersistentMount(capturedCommands.get(0));
    }

    @Test
    void cCreateSaveExecuteIntegration() throws Exception {
        when(mockRunner.run(anyList(), anyString(), anyLong()))
                .thenAnswer(inv -> {
                    @SuppressWarnings("unchecked")
                    List<String> cmd = (List<String>) inv.getArgument(0);
                    capturedCommands.add(new ArrayList<>(cmd));
                    String joined = String.join(" ", cmd);
                    assertTrue(joined.contains("gcc:13"), "expected gcc image, got: " + joined);
                    return new ProcessResult("hello c\n", "", 0, false);
                });

        String student = "bob";
        String file = "main.c";
        String cCode = "#include <stdio.h>\nint main(){printf(\"hello c\\n\");return 0;}";
        workspaceService.createFile(student, file, cCode);
        workspaceService.saveFile(student, file, cCode);
        String content = workspaceService.readFile(student, file);
        ExecutionRequest req = new ExecutionRequest("c", content, "");
        ExecutionResponse resp = executionService.execute(req);
        assertEquals("SUCCESS", resp.getStatus());
        assertEquals("hello c\n", resp.getStdout());
        assertHardenedFlags(capturedCommands.get(0));
        assertNoPersistentMount(capturedCommands.get(0));
    }

    @Test
    void cppCreateSaveExecuteIntegration() throws Exception {
        when(mockRunner.run(anyList(), anyString(), anyLong()))
                .thenAnswer(inv -> {
                    @SuppressWarnings("unchecked")
                    List<String> cmd = (List<String>) inv.getArgument(0);
                    capturedCommands.add(new ArrayList<>(cmd));
                    return new ProcessResult("hello cpp\n", "", 0, false);
                });

        String student = "carol";
        String file = "main.cpp";
        String cppCode = "#include <iostream>\nint main(){std::cout<<\"hello cpp\"<<std::endl;return 0;}";
        workspaceService.createFile(student, file, cppCode);
        ExecutionRequest req = new ExecutionRequest("cpp", cppCode, "");
        ExecutionRequest reqAlias = new ExecutionRequest("c++", cppCode, "");
        ExecutionResponse resp = executionService.execute(req);
        assertEquals("SUCCESS", resp.getStatus());
        ExecutionResponse respAlias = executionService.execute(reqAlias);
        assertEquals("SUCCESS", respAlias.getStatus());
        assertEquals(2, capturedCommands.size());
        assertTrue(capturedCommands.stream().allMatch(cmd -> String.join(" ", cmd).contains("gcc:13")));
        for (List<String> cmd : capturedCommands) {
            assertHardenedFlags(cmd);
            assertNoPersistentMount(cmd);
        }
    }

    @Test
    void saveThenExecuteReflectsUpdatedContent() throws Exception {
        when(mockRunner.run(anyList(), anyString(), anyLong()))
                .thenAnswer(inv -> {
                    @SuppressWarnings("unchecked")
                    List<String> cmd = (List<String>) inv.getArgument(0);
                    capturedCommands.add(new ArrayList<>(cmd));
                    return new ProcessResult("v2 output\n", "", 0, false);
                });

        String student = "alice";
        String file = "counter.py";
        workspaceService.createFile(student, file, "print('v1')");
        String v1 = workspaceService.readFile(student, file);
        ExecutionRequest r1 = new ExecutionRequest("python", v1, "");
        ExecutionResponse resp1 = executionService.execute(r1);
        assertEquals("SUCCESS", resp1.getStatus());

        workspaceService.saveFile(student, file, "print('v2')");
        String v2 = workspaceService.readFile(student, file);
        assertEquals("print('v2')", v2);
        ExecutionRequest r2 = new ExecutionRequest("python", v2, "");
        ExecutionResponse resp2 = executionService.execute(r2);
        assertEquals("SUCCESS", resp2.getStatus());
        assertEquals(2, capturedCommands.size());
        for (List<String> cmd : capturedCommands) {
            assertNoPersistentMount(cmd);
        }
    }

    @Test
    void isolationAnotherStudentFileInaccessibleDuringExecution() throws Exception {
        String studentA = "alice";
        String studentB = "bob";
        String secretFile = "secret.py";
        String secretContent = "print('alice secret')";
        workspaceService.createFile(studentA, secretFile, secretContent);

        assertThrows(WorkspaceException.class, () -> workspaceService.readFile(studentB, secretFile));

        when(mockRunner.run(anyList(), anyString(), anyLong()))
                .thenAnswer(inv -> {
                    @SuppressWarnings("unchecked")
                    List<String> cmd = (List<String>) inv.getArgument(0);
                    capturedCommands.add(new ArrayList<>(cmd));
                    return new ProcessResult("bob output\n", "", 0, false);
                });
        workspaceService.createFile(studentB, "hello.py", "print('bob hello')");
        String bobContent = workspaceService.readFile(studentB, "hello.py");
        ExecutionRequest bobReq = new ExecutionRequest("python", bobContent, "");
        ExecutionResponse bobResp = executionService.execute(bobReq);
        assertEquals("SUCCESS", bobResp.getStatus());
        assertEquals("bob output\n", bobResp.getStdout());
        for (List<String> cmd : capturedCommands) {
            assertNoPersistentMount(cmd);
            assertHardenedFlags(cmd);
        }
        assertThrows(WorkspaceSecurityException.class, () -> workspaceService.readFile(studentB, "../alice/secret.py"));
        assertThrows(WorkspaceSecurityException.class, () -> workspaceService.readFile(studentB, "../../students/alice/secret.py"));
    }

    @Test
    void executionUsesTemporaryDirNotPersistentMountViaCreateTempDirectory() throws Exception {
        String student = "dave";
        String file = "test.py";
        workspaceService.createFile(student, file, "print('hi')");
        String content = workspaceService.readFile(student, file);
        ExecutionRequest req = new ExecutionRequest("python", content, "stdin-input");
        when(mockRunner.run(anyList(), eq("stdin-input"), anyLong()))
                .thenAnswer(inv -> {
                    @SuppressWarnings("unchecked")
                    List<String> cmd = (List<String>) inv.getArgument(0);
                    capturedCommands.add(new ArrayList<>(cmd));
                    String volume = cmd.get(cmd.indexOf("-v") + 1);
                    String hostPath = extractHostPath(volume);
                    assertFalse(hostPath.startsWith(workspaceRoot.toAbsolutePath().toString()),
                            "temp dir must not be inside workspaceRoot, hostPath=" + hostPath);
                    assertTrue(hostPath.contains("codelab-"), "hostPath should be codelab- temp, got " + hostPath);
                    return new ProcessResult("hi\n", "", 0, false);
                });
        // fallback stub for any other stdin (should not be called, but provide safety)
        // Note: mock stub for specific stdin already set; for other calls return ok
        ExecutionResponse resp = executionService.execute(req);
        assertEquals("SUCCESS", resp.getStatus());
        assertFalse(resp.getStdout().isEmpty());
    }

    @Test
    void dockerExecutorLeastPrivilegeAndCleanupPreserved() throws Exception {
        final List<String> hostPaths = new ArrayList<>();
        when(mockRunner.run(anyList(), anyString(), anyLong()))
                .thenAnswer(inv -> {
                    @SuppressWarnings("unchecked")
                    List<String> cmd = (List<String>) inv.getArgument(0);
                    capturedCommands.add(new ArrayList<>(cmd));
                    String volume = cmd.get(cmd.indexOf("-v") + 1);
                    String hostPath = extractHostPath(volume);
                    hostPaths.add(hostPath);
                    assertTrue(Files.exists(Path.of(hostPath)), "temp dir should exist during execution, hostPath=" + hostPath);
                    Path sourceFile = Path.of(hostPath).resolve("main.py");
                    assertTrue(Files.exists(sourceFile), "source file should exist in temp dir, hostPath=" + hostPath);
                    return new ProcessResult("cleanup test\n", "", 0, false);
                });
        workspaceService.createFile("alice", "cleanup.py", "print('cleanup')");
        String content = workspaceService.readFile("alice", "cleanup.py");
        ExecutionRequest req = new ExecutionRequest("python", content, "");
        ExecutionResponse resp = executionService.execute(req);
        assertEquals("SUCCESS", resp.getStatus());
        for (String p : hostPaths) {
            assertFalse(Files.exists(Path.of(p)), "temp dir should be deleted after execution, still exists: " + p);
        }
        for (List<String> cmd : capturedCommands) {
            assertHardenedFlags(cmd);
        }
    }

    @Test
    void executionWithStdinFromWorkspaceFile() throws Exception {
        when(mockRunner.run(anyList(), eq("hello stdin"), anyLong()))
                .thenAnswer(inv -> {
                    @SuppressWarnings("unchecked")
                    List<String> cmd = (List<String>) inv.getArgument(0);
                    capturedCommands.add(new ArrayList<>(cmd));
                    return new ProcessResult("HELLO STDIN\n", "", 0, false);
                });
        String student = "alice";
        String file = "readstdin.py";
        String code = "import sys; print(sys.stdin.read().strip().upper())";
        workspaceService.createFile(student, file, code);
        String content = workspaceService.readFile(student, file);
        ExecutionRequest req = new ExecutionRequest("python", content, "hello stdin");
        ExecutionResponse resp = executionService.execute(req);
        assertEquals("SUCCESS", resp.getStatus());
        assertEquals("HELLO STDIN\n", resp.getStdout());
        verify(mockRunner).run(anyList(), eq("hello stdin"), anyLong());
    }

    @Test
    void concurrentWorkspaceExecutionsIsolated() throws Exception {
        when(mockRunner.run(anyList(), anyString(), anyLong()))
                .thenAnswer(inv -> {
                    @SuppressWarnings("unchecked")
                    List<String> cmd = (List<String>) inv.getArgument(0);
                    synchronized (capturedCommands) {
                        capturedCommands.add(new ArrayList<>(cmd));
                    }
                    Thread.sleep(50);
                    return new ProcessResult("ok\n", "", 0, false);
                });
        workspaceService.createFile("alice", "a.py", "print('a')");
        workspaceService.createFile("bob", "b.py", "print('b')");
        String aliceCode = workspaceService.readFile("alice", "a.py");
        String bobCode = workspaceService.readFile("bob", "b.py");

        ExecutionRegistry localReg = new ExecutionRegistry();
        ExecutionServiceImpl localSvc = new ExecutionServiceImpl(new DockerExecutor(mockRunner), localReg);

        List<Thread> threads = new ArrayList<>();
        List<ExecutionResponse> results = java.util.Collections.synchronizedList(new ArrayList<>());
        for (int i = 0; i < 4; i++) {
            String code = i % 2 == 0 ? aliceCode : bobCode;
            Thread t = new Thread(() -> {
                ExecutionRequest req = new ExecutionRequest("python", code, "");
                results.add(localSvc.execute(req));
            });
            threads.add(t);
            t.start();
        }
        for (Thread t : threads) t.join(5000);
        assertEquals(4, results.size());
        assertTrue(results.stream().allMatch(r -> "SUCCESS".equals(r.getStatus())));
        assertEquals(0, localReg.runningCount());
        for (List<String> cmd : capturedCommands) {
            assertNoPersistentMount(cmd);
            assertHardenedFlags(cmd);
        }
    }
}
