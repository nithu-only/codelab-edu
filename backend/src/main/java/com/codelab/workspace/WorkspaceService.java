package com.codelab.workspace;

import org.springframework.stereotype.Service;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.*;
import java.nio.file.attribute.BasicFileAttributes;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@Service
public class WorkspaceService {

    private final StudentWorkspaceResolver resolver;
    private final PathValidator validator;

    public WorkspaceService(StudentWorkspaceResolver resolver, PathValidator validator) {
        this.resolver = resolver;
        this.validator = validator;
    }

    public List<FileInfo> list(String studentId, String subPath) {
        Path studentRoot = resolver.getWorkspaceRoot(studentId);
        Path targetDir;
        if (subPath == null || subPath.isBlank()) {
            targetDir = studentRoot;
        } else {
            targetDir = resolver.resolve(studentId, subPath);
        }
        if (!Files.exists(targetDir)) {
            return List.of();
        }
        if (!Files.isDirectory(targetDir)) {
            throw new WorkspaceException("Not a directory: " + subPath, 400);
        }
        // Symlink check for listing dir
        try {
            if (Files.exists(targetDir)) {
                Path real = targetDir.toRealPath();
                Path rootReal = studentRoot.toRealPath();
                if (!real.startsWith(rootReal)) {
                    throw new WorkspaceSecurityException("Symlink escapes workspace: " + subPath);
                }
            }
        } catch (IOException e) {
            throw new WorkspaceSecurityException("Symlink validation failed for: " + subPath);
        }

        List<FileInfo> result = new ArrayList<>();
        // List immediate children if subPath given, else recursive? Spec says list files for current student -> return [{path,...}]
        // We will do recursive listing for GET /api/files without param, and shallow for ?path=dir
        boolean recursive = (subPath == null || subPath.isBlank());
        try {
            if (recursive) {
                // Walk recursively but limit depth
                try (Stream<Path> stream = Files.walk(targetDir)) {
                    stream.filter(p -> !p.equals(targetDir))
                          .forEach(p -> {
                              try {
                                  Path real = p.toRealPath();
                                  Path rootReal = studentRoot.toRealPath();
                                  if (!real.startsWith(rootReal)) return; // skip outside symlink
                              } catch (IOException ignored) {}
                              String rel = studentRoot.relativize(p).toString().replace("\\", "/");
                              try {
                                  BasicFileAttributes attrs = Files.readAttributes(p, BasicFileAttributes.class, LinkOption.NOFOLLOW_LINKS);
                                  String type = attrs.isDirectory() ? "dir" : "file";
                                  long size = attrs.isDirectory() ? 0 : attrs.size();
                                  long modified = attrs.lastModifiedTime().toMillis();
                                  result.add(new FileInfo(rel, type, size, modified));
                              } catch (IOException ignored) {}
                          });
                }
            } else {
                try (DirectoryStream<Path> ds = Files.newDirectoryStream(targetDir)) {
                    for (Path p : ds) {
                        try {
                            if (Files.exists(p)) {
                                Path real = p.toRealPath();
                                Path rootReal = studentRoot.toRealPath();
                                if (!real.startsWith(rootReal)) continue;
                            }
                        } catch (IOException ignored) {}
                        String rel = studentRoot.relativize(p).toString().replace("\\", "/");
                        BasicFileAttributes attrs = Files.readAttributes(p, BasicFileAttributes.class, LinkOption.NOFOLLOW_LINKS);
                        String type = attrs.isDirectory() ? "dir" : "file";
                        long size = attrs.isDirectory() ? 0 : attrs.size();
                        long modified = attrs.lastModifiedTime().toMillis();
                        result.add(new FileInfo(rel, type, size, modified));
                    }
                }
            }
        } catch (IOException e) {
            throw new WorkspaceException("Failed to list files: " + e.getMessage(), 500, e);
        }
        return result;
    }

    public void createFile(String studentId, String path, String content) {
        if (path == null || path.isBlank()) throw new WorkspaceSecurityException("Path must not be empty");
        Path target = resolver.resolve(studentId, path);
        // Check not escaping is already done
        if (Files.exists(target)) {
            throw new WorkspaceException("File already exists: " + path, 409);
        }
        PathValidator.validateContentSize(content);
        try {
            Path parent = target.getParent();
            if (parent != null) Files.createDirectories(parent);
            Files.writeString(target, content == null ? "" : content, StandardCharsets.UTF_8, StandardOpenOption.CREATE_NEW);
        } catch (IOException e) {
            throw new WorkspaceException("Failed to create file: " + e.getMessage(), 500, e);
        }
    }

    public String readFile(String studentId, String path) {
        if (path == null || path.isBlank()) throw new WorkspaceSecurityException("Path must not be empty");
        Path target = resolver.resolve(studentId, path);
        if (!Files.exists(target) || Files.isDirectory(target)) {
            throw new WorkspaceException("File not found: " + path, 404);
        }
        // Symlink already checked in validator
        try {
            byte[] bytes = Files.readAllBytes(target);
            if (bytes.length > PathValidator.MAX_FILE_SIZE) {
                throw new WorkspaceSecurityException("File too large");
            }
            return new String(bytes, StandardCharsets.UTF_8);
        } catch (IOException e) {
            throw new WorkspaceException("Failed to read file: " + e.getMessage(), 500, e);
        }
    }

    public void saveFile(String studentId, String path, String content) {
        if (path == null || path.isBlank()) throw new WorkspaceSecurityException("Path must not be empty");
        Path target = resolver.resolve(studentId, path);
        PathValidator.validateContentSize(content);
        try {
            Path parent = target.getParent();
            if (parent != null) Files.createDirectories(parent);
            Files.writeString(target, content == null ? "" : content, StandardCharsets.UTF_8, StandardOpenOption.CREATE, StandardOpenOption.TRUNCATE_EXISTING);
        } catch (IOException e) {
            throw new WorkspaceException("Failed to save file: " + e.getMessage(), 500, e);
        }
    }

    public void delete(String studentId, String path) {
        if (path == null || path.isBlank()) throw new WorkspaceSecurityException("Path must not be empty");
        Path target = resolver.resolve(studentId, path);
        if (!Files.exists(target)) {
            throw new WorkspaceException("File not found: " + path, 404);
        }
        // Prevent deleting workspace root itself
        Path studentRoot = resolver.getWorkspaceRoot(studentId);
        if (target.toAbsolutePath().normalize().equals(studentRoot.toAbsolutePath().normalize())) {
            throw new WorkspaceSecurityException("Cannot delete workspace root");
        }
        try {
            if (Files.isDirectory(target, LinkOption.NOFOLLOW_LINKS)) {
                // only allow delete if empty
                try (DirectoryStream<Path> ds = Files.newDirectoryStream(target)) {
                    if (ds.iterator().hasNext()) {
                        throw new WorkspaceException("Directory not empty: " + path, 400);
                    }
                }
                Files.delete(target);
            } else {
                Files.delete(target);
            }
        } catch (IOException e) {
            // Check if it's the not-empty case already thrown
            if (e.getMessage() != null && e.getMessage().contains("not empty")) {
                throw new WorkspaceException("Directory not empty: " + path, 400);
            }
            throw new WorkspaceException("Failed to delete: " + e.getMessage(), 500, e);
        }
    }

    public void rename(String studentId, String from, String to) {
        if (from == null || from.isBlank() || to == null || to.isBlank()) {
            throw new WorkspaceSecurityException("From and to must not be empty");
        }
        Path src = resolver.resolve(studentId, from);
        Path dst = resolver.resolve(studentId, to);

        if (!Files.exists(src)) {
            throw new WorkspaceException("Source not found: " + from, 404);
        }
        if (Files.exists(dst)) {
            throw new WorkspaceException("Destination already exists: " + to, 409);
        }
        // Prevent renaming root
        Path studentRoot = resolver.getWorkspaceRoot(studentId);
        if (src.toAbsolutePath().normalize().equals(studentRoot.toAbsolutePath().normalize())) {
            throw new WorkspaceSecurityException("Cannot rename workspace root");
        }
        // Enforce boundary for both already done via resolver
        try {
            Path parent = dst.getParent();
            if (parent != null) Files.createDirectories(parent);
            Files.move(src, dst, StandardCopyOption.ATOMIC_MOVE);
        } catch (AtomicMoveNotSupportedException e) {
            try {
                Files.move(src, dst);
            } catch (IOException ex) {
                throw new WorkspaceException("Failed to rename: " + ex.getMessage(), 500, ex);
            }
        } catch (IOException e) {
            throw new WorkspaceException("Failed to rename: " + e.getMessage(), 500, e);
        }
    }
}
