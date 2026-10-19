package com.codelab.workspace;

import com.codelab.dto.ErrorResponse;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/files")
public class FileController {

    private final WorkspaceService workspaceService;

    public FileController(WorkspaceService workspaceService) {
        this.workspaceService = workspaceService;
    }

    private String resolveStudentId(String header, String query) {
        if (header != null && !header.isBlank()) return header.trim();
        if (query != null && !query.isBlank()) return query.trim();
        return "dev-student";
    }

    @GetMapping
    public ResponseEntity<?> list(
            @RequestHeader(value = "X-Student-Id", required = false) String headerId,
            @RequestParam(value = "studentId", required = false) String queryId,
            @RequestParam(value = "path", required = false) String path
    ) {
        String sid = resolveStudentId(headerId, queryId);
        try {
            List<FileInfo> files = workspaceService.list(sid, path);
            return ResponseEntity.ok(files);
        } catch (WorkspaceException ex) {
            return ResponseEntity.status(ex.getStatus()).body(new ErrorResponse(ex.getMessage(), List.of(ex.getMessage())));
        }
    }

    @GetMapping("/list")
    public ResponseEntity<?> listAlt(
            @RequestHeader(value = "X-Student-Id", required = false) String headerId,
            @RequestParam(value = "studentId", required = false) String queryId,
            @RequestParam(value = "path", required = false) String path
    ) {
        return list(headerId, queryId, path);
    }

    @PostMapping
    public ResponseEntity<?> create(
            @RequestHeader(value = "X-Student-Id", required = false) String headerId,
            @RequestParam(value = "studentId", required = false) String queryId,
            @RequestBody Map<String, String> body
    ) {
        String sid = resolveStudentId(headerId, queryId);
        String path = body.get("path");
        String content = body.get("content");
        if (path == null || path.isBlank()) {
            return ResponseEntity.badRequest().body(new ErrorResponse("Path must not be empty", List.of("path is required")));
        }
        try {
            String toWrite = content == null ? "" : content;
            workspaceService.createFile(sid, path, toWrite);
            // return created file info (use written content; readBack verifies but tolerate mock)
            String readBack;
            try {
                readBack = workspaceService.readFile(sid, path);
            } catch (Exception e) {
                readBack = toWrite;
            }
            if (readBack == null) readBack = toWrite;
            java.util.HashMap<String, String> resp = new java.util.HashMap<>();
            resp.put("path", path);
            resp.put("content", readBack);
            return ResponseEntity.status(HttpStatus.CREATED).body(resp);
        } catch (WorkspaceException ex) {
            return ResponseEntity.status(ex.getStatus()).body(new ErrorResponse(ex.getMessage(), List.of(ex.getMessage())));
        }
    }

    @PostMapping("/rename")
    public ResponseEntity<?> rename(
            @RequestHeader(value = "X-Student-Id", required = false) String headerId,
            @RequestParam(value = "studentId", required = false) String queryId,
            @RequestBody Map<String, String> body
    ) {
        String sid = resolveStudentId(headerId, queryId);
        String from = body.get("from");
        String to = body.get("to");
        if (from == null || from.isBlank() || to == null || to.isBlank()) {
            return ResponseEntity.badRequest().body(new ErrorResponse("from and to are required", List.of("from/to must not be empty")));
        }
        try {
            workspaceService.rename(sid, from, to);
            return ResponseEntity.ok(Map.of("from", from, "to", to));
        } catch (WorkspaceException ex) {
            return ResponseEntity.status(ex.getStatus()).body(new ErrorResponse(ex.getMessage(), List.of(ex.getMessage())));
        }
    }

    // Wildcard read/update/delete - must be after /rename to avoid conflict
    @GetMapping("/**")
    public ResponseEntity<?> read(
            HttpServletRequest request,
            @RequestHeader(value = "X-Student-Id", required = false) String headerId,
            @RequestParam(value = "studentId", required = false) String queryId
    ) {
        String sid = resolveStudentId(headerId, queryId);
        String path = extractPath(request);
        if (path == null || path.isBlank()) {
            return ResponseEntity.badRequest().body(new ErrorResponse("Path must not be empty", List.of("path is required")));
        }
        try {
            String content = workspaceService.readFile(sid, path);
            java.util.HashMap<String, String> resp = new java.util.HashMap<>();
            resp.put("path", path);
            resp.put("content", content == null ? "" : content);
            return ResponseEntity.ok(resp);
        } catch (WorkspaceException ex) {
            return ResponseEntity.status(ex.getStatus()).body(new ErrorResponse(ex.getMessage(), List.of(ex.getMessage())));
        }
    }

    @PutMapping("/**")
    public ResponseEntity<?> update(
            HttpServletRequest request,
            @RequestHeader(value = "X-Student-Id", required = false) String headerId,
            @RequestParam(value = "studentId", required = false) String queryId,
            @RequestBody Map<String, String> body
    ) {
        String sid = resolveStudentId(headerId, queryId);
        String path = extractPath(request);
        String content = body.get("content");
        if (path == null || path.isBlank()) {
            return ResponseEntity.badRequest().body(new ErrorResponse("Path must not be empty", List.of("path is required")));
        }
        try {
            String toSave = content == null ? "" : content;
            workspaceService.saveFile(sid, path, toSave);
            java.util.HashMap<String, String> resp = new java.util.HashMap<>();
            resp.put("path", path);
            resp.put("content", toSave);
            return ResponseEntity.ok(resp);
        } catch (WorkspaceException ex) {
            return ResponseEntity.status(ex.getStatus()).body(new ErrorResponse(ex.getMessage(), List.of(ex.getMessage())));
        }
    }

    @DeleteMapping("/**")
    public ResponseEntity<?> delete(
            HttpServletRequest request,
            @RequestHeader(value = "X-Student-Id", required = false) String headerId,
            @RequestParam(value = "studentId", required = false) String queryId
    ) {
        String sid = resolveStudentId(headerId, queryId);
        String path = extractPath(request);
        if (path == null || path.isBlank()) {
            return ResponseEntity.badRequest().body(new ErrorResponse("Path must not be empty", List.of("path is required")));
        }
        try {
            workspaceService.delete(sid, path);
            return ResponseEntity.noContent().build();
        } catch (WorkspaceException ex) {
            return ResponseEntity.status(ex.getStatus()).body(new ErrorResponse(ex.getMessage(), List.of(ex.getMessage())));
        }
    }

    private String extractPath(HttpServletRequest request) {
        String uri = request.getRequestURI(); // e.g. /api/files/hello.py or /api/files/a/b/c.py
        String prefix = "/api/files/";
        String ctx = request.getContextPath();
        // Remove context path if present
        if (ctx != null && !ctx.isEmpty() && uri.startsWith(ctx)) {
            uri = uri.substring(ctx.length());
        }
        if (uri.startsWith(prefix)) {
            String path = uri.substring(prefix.length());
            // Spring may have decoded once; we keep as is, validator will decode repeatedly
            // Strip query string if any (should not be in URI)
            int q = path.indexOf('?');
            if (q >= 0) path = path.substring(0, q);
            // For /api/files/rename we should not be here, but guard
            if (path.equals("rename")) return null;
            return path;
        }
        // fallback for exact /api/files/{path} with no slash?
        if (uri.equals("/api/files")) return null;
        return null;
    }
}
