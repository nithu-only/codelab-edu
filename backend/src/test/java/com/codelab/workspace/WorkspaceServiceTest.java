package com.codelab.workspace;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;

import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class WorkspaceServiceTest {

    private WorkspaceService service;
    private StudentWorkspaceResolver resolver;
    private Path tmpRoot;

    @BeforeEach
    void setup(@TempDir Path tmp) throws Exception {
        tmpRoot = tmp.resolve("workspaces");
        Files.createDirectories(tmpRoot);
        PathValidator validator = new PathValidator();
        // Manually construct resolver with tmpRoot
        resolver = new StudentWorkspaceResolverImpl(tmpRoot, validator);
        service = new WorkspaceService(resolver, validator);
    }

    @Test
    void createAndRead() {
        service.createFile("alice", "hello.py", "print('hi')");
        String content = service.readFile("alice", "hello.py");
        assertEquals("print('hi')", content);
    }

    @Test
    void createFailsIfExists() {
        service.createFile("alice", "dup.py", "a");
        assertThrows(WorkspaceException.class, () -> service.createFile("alice", "dup.py", "b"));
    }

    @Test
    void updateExisting() {
        service.createFile("alice", "up.py", "v1");
        service.saveFile("alice", "up.py", "v2");
        assertEquals("v2", service.readFile("alice", "up.py"));
    }

    @Test
    void saveCreatesIfNotExists() {
        service.saveFile("alice", "newfile.py", "content");
        assertEquals("content", service.readFile("alice", "newfile.py"));
    }

    @Test
    void deleteFile() {
        service.createFile("alice", "del.py", "x");
        service.delete("alice", "del.py");
        assertThrows(WorkspaceException.class, () -> service.readFile("alice", "del.py"));
    }

    @Test
    void deleteNonExistingThrows404() {
        WorkspaceException ex = assertThrows(WorkspaceException.class, () -> service.delete("alice", "nope.py"));
        assertEquals(404, ex.getStatus());
    }

    @Test
    void deleteNonEmptyDirFails() throws Exception {
        service.createFile("alice", "dir/file.py", "a");
        WorkspaceException ex = assertThrows(WorkspaceException.class, () -> service.delete("alice", "dir"));
        assertEquals(400, ex.getStatus());
    }

    @Test
    void renameFile() {
        service.createFile("alice", "a.py", "hello");
        service.rename("alice", "a.py", "b.py");
        assertThrows(WorkspaceException.class, () -> service.readFile("alice", "a.py"));
        assertEquals("hello", service.readFile("alice", "b.py"));
    }

    @Test
    void renameFailsIfDestExists() {
        service.createFile("alice", "a.py", "1");
        service.createFile("alice", "b.py", "2");
        assertThrows(WorkspaceException.class, () -> service.rename("alice", "a.py", "b.py"));
    }

    @Test
    void renameFailsIfSourceNotFound() {
        WorkspaceException ex = assertThrows(WorkspaceException.class, () -> service.rename("alice", "no.py", "yes.py"));
        assertEquals(404, ex.getStatus());
    }

    @Test
    void listRecursive() {
        service.createFile("alice", "hello.py", "a");
        service.createFile("alice", "programs/calc.py", "b");
        List<FileInfo> list = service.list("alice", null);
        assertTrue(list.size() >= 2);
        assertTrue(list.stream().anyMatch(f -> f.getPath().equals("hello.py")));
        assertTrue(list.stream().anyMatch(f -> f.getPath().equals("programs/calc.py")));
    }

    @Test
    void listSubDir() {
        service.createFile("alice", "mydir/a.py", "1");
        service.createFile("alice", "mydir/b.py", "2");
        List<FileInfo> list = service.list("alice", "mydir");
        assertEquals(2, list.size());
    }

    @Test
    void isolationBetweenStudents() {
        service.createFile("student1", "secret.py", "student1 data");
        // student2 should not see student1's file
        assertThrows(WorkspaceException.class, () -> service.readFile("student2", "secret.py"));
        // but student1 can still read own
        assertEquals("student1 data", service.readFile("student1", "secret.py"));
        // student2 list should not contain secret
        List<FileInfo> s2list = service.list("student2", null);
        assertTrue(s2list.stream().noneMatch(f -> f.getPath().equals("secret.py")));
    }

    @Test
    void traversalBlocked() {
        assertThrows(WorkspaceSecurityException.class, () -> service.createFile("alice", "../evil.py", "x"));
        assertThrows(WorkspaceSecurityException.class, () -> service.readFile("alice", "../evil.py"));
        assertThrows(WorkspaceSecurityException.class, () -> service.createFile("alice", "%2e%2e%2fetc.py", "x"));
    }

    @Test
    void fileSizeLimitEnforced() {
        String big = "a".repeat(1024 * 1024 + 1);
        assertThrows(WorkspaceSecurityException.class, () -> service.createFile("alice", "big.py", big));
    }

    @Test
    void supportsVariousExtensions() {
        service.createFile("alice", "test.java", "class A{}");
        service.createFile("alice", "test.c", "int main(){}");
        service.createFile("alice", "test.cpp", "int main(){}");
        service.createFile("alice", "readme.md", "# hi");
        service.createFile("alice", "notes.txt", "hello");
        service.createFile("alice", "data.json", "{}");
        assertEquals("class A{}", service.readFile("alice", "test.java"));
        assertEquals("{}", service.readFile("alice", "data.json"));
    }

    @Test
    void renameTraversalBlocked() {
        service.createFile("alice", "a.py", "x");
        assertThrows(WorkspaceSecurityException.class, () -> service.rename("alice", "a.py", "../b.py"));
        assertThrows(WorkspaceSecurityException.class, () -> service.rename("alice", "../a.py", "b.py"));
    }
}
