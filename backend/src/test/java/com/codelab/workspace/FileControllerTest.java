package com.codelab.workspace;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;
import java.util.Map;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(FileController.class)
class FileControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private WorkspaceService workspaceService;

    @Test
    void listShouldReturnFiles() throws Exception {
        when(workspaceService.list(eq("dev-student"), any())).thenReturn(List.of(
                new FileInfo("hello.py", "file", 10, 123456L),
                new FileInfo("programs", "dir", 0, 123456L)
        ));
        mockMvc.perform(get("/api/files"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].path").value("hello.py"))
                .andExpect(jsonPath("$[0].type").value("file"));
    }

    @Test
    void listWithStudentHeader() throws Exception {
        when(workspaceService.list(eq("alice"), any())).thenReturn(List.of());
        mockMvc.perform(get("/api/files").header("X-Student-Id", "alice"))
                .andExpect(status().isOk());
    }

    @Test
    void listWithQueryParamPath() throws Exception {
        when(workspaceService.list(eq("dev-student"), eq("mydir"))).thenReturn(List.of(
                new FileInfo("mydir/a.py", "file", 5, 123L)
        ));
        mockMvc.perform(get("/api/files").param("path", "mydir"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].path").value("mydir/a.py"));
    }

    @Test
    void createShouldReturn201() throws Exception {
        Map<String, String> body = Map.of("path", "hello.py", "content", "print('hi')");
        mockMvc.perform(post("/api/files")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.path").value("hello.py"));
    }

    @Test
    void createConflictShouldReturn409() throws Exception {
        doThrow(new WorkspaceException("File already exists: hello.py", 409))
                .when(workspaceService).createFile(any(), eq("hello.py"), any());
        Map<String, String> body = Map.of("path", "hello.py", "content", "x");
        mockMvc.perform(post("/api/files")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.error").exists());
    }

    @Test
    void createWithTraversalShouldReturn400() throws Exception {
        doThrow(new WorkspaceSecurityException("Path escapes workspace: ../evil"))
                .when(workspaceService).createFile(any(), eq("../evil"), any());
        Map<String, String> body = Map.of("path", "../evil", "content", "x");
        mockMvc.perform(post("/api/files")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void readShouldReturnContent() throws Exception {
        when(workspaceService.readFile(eq("dev-student"), eq("hello.py"))).thenReturn("print('hi')");
        mockMvc.perform(get("/api/files/hello.py"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.path").value("hello.py"))
                .andExpect(jsonPath("$.content").value("print('hi')"));
    }

    @Test
    void readNotFoundShouldReturn404() throws Exception {
        when(workspaceService.readFile(any(), any())).thenThrow(new WorkspaceException("File not found: missing.py", 404));
        mockMvc.perform(get("/api/files/missing.py"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.error").value("File not found: missing.py"));
    }

    @Test
    void updateShouldReturnOk() throws Exception {
        Map<String, String> body = Map.of("content", "new content");
        mockMvc.perform(put("/api/files/hello.py")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.path").value("hello.py"));
    }

    @Test
    void deleteShouldReturn204() throws Exception {
        mockMvc.perform(delete("/api/files/hello.py"))
                .andExpect(status().isNoContent());
    }

    @Test
    void deleteNotFoundShouldReturn404() throws Exception {
        doThrow(new WorkspaceException("File not found: nope.py", 404))
                .when(workspaceService).delete(any(), eq("nope.py"));
        mockMvc.perform(delete("/api/files/nope.py"))
                .andExpect(status().isNotFound());
    }

    @Test
    void renameShouldReturnOk() throws Exception {
        Map<String, String> body = Map.of("from", "a.py", "to", "b.py");
        mockMvc.perform(post("/api/files/rename")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.from").value("a.py"))
                .andExpect(jsonPath("$.to").value("b.py"));
    }

    @Test
    void renameWithTraversalShouldReturn400() throws Exception {
        doThrow(new WorkspaceSecurityException("Path escapes workspace"))
                .when(workspaceService).rename(any(), eq("a.py"), eq("../b.py"));
        Map<String, String> body = Map.of("from", "a.py", "to", "../b.py");
        mockMvc.perform(post("/api/files/rename")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void defaultStudentIdWhenNoHeader() throws Exception {
        when(workspaceService.list(eq("dev-student"), any())).thenReturn(List.of());
        mockMvc.perform(get("/api/files"))
                .andExpect(status().isOk());
        // verify via mock interaction - list called with dev-student
        org.mockito.Mockito.verify(workspaceService).list(eq("dev-student"), any());
    }
}
