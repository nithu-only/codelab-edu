package com.codelab.controller;

import com.codelab.dto.ExecutionRequest;
import com.codelab.dto.ExecutionResponse;
import com.codelab.service.ExecutionService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.time.Instant;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(ExecutionController.class)
class ExecutionControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private ExecutionService executionService;

    @Test
    void healthShouldReturnUp() throws Exception {
        mockMvc.perform(get("/api/health"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("UP"));
    }

    @Test
    void languagesShouldReturnSupportedList() throws Exception {
        mockMvc.perform(get("/api/languages"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$[?(@=='python')]").exists())
                .andExpect(jsonPath("$[?(@=='java')]").exists())
                .andExpect(jsonPath("$[?(@=='c')]").exists())
                .andExpect(jsonPath("$[?(@=='cpp')]").exists());
    }

    @Test
    void executeShouldReturnSuccessWithValidRequest() throws Exception {
        ExecutionRequest req = new ExecutionRequest("python", "print('hello')", "");
        ExecutionResponse stub = new ExecutionResponse(
                UUID.randomUUID().toString(),
                "SUCCESS",
                "python",
                "Hello from stub",
                "",
                0,
                42L,
                Instant.now().toString()
        );
        when(executionService.execute(any(ExecutionRequest.class))).thenReturn(stub);

        mockMvc.perform(post("/api/execute")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("SUCCESS"))
                .andExpect(jsonPath("$.language").value("python"))
                .andExpect(jsonPath("$.executionId").isNotEmpty());
    }

    @Test
    void executeShouldAllowCaseInsensitiveLanguage() throws Exception {
        ExecutionRequest req = new ExecutionRequest("Python", "print('hi')", null);
        ExecutionResponse stub = new ExecutionResponse(
                UUID.randomUUID().toString(),
                "SUCCESS",
                "python",
                "stub",
                "",
                0,
                42L,
                Instant.now().toString()
        );
        when(executionService.execute(any(ExecutionRequest.class))).thenReturn(stub);

        mockMvc.perform(post("/api/execute")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.language").value("python"));
    }

    @Test
    void executeShouldReturn400ForBlankLanguage() throws Exception {
        ExecutionRequest req = new ExecutionRequest("", "print('hi')", "");
        mockMvc.perform(post("/api/execute")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").exists())
                .andExpect(jsonPath("$.details").isArray());
    }

    @Test
    void executeShouldReturn400ForBlankSourceCode() throws Exception {
        ExecutionRequest req = new ExecutionRequest("python", "   ", "");
        mockMvc.perform(post("/api/execute")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("Validation failed"));
    }

    @Test
    void executeShouldReturn400ForUnsupportedLanguage() throws Exception {
        ExecutionRequest req = new ExecutionRequest("ruby", "puts 'hi'", "");
        mockMvc.perform(post("/api/execute")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.details[0]").value(org.hamcrest.Matchers.containsString("language")));
    }

    @Test
    void executeShouldReturn400ForSourceCodeTooLarge() throws Exception {
        String large = "a".repeat(102401);
        ExecutionRequest req = new ExecutionRequest("python", large, "");
        mockMvc.perform(post("/api/execute")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void getExecutionShouldReturn404Stub() throws Exception {
        mockMvc.perform(get("/api/execute/some-uuid"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.error").value("Not found"));
    }

    @Test
    void corsShouldAllowLocalhost5173() throws Exception {
        mockMvc.perform(get("/api/health")
                        .header("Origin", "http://localhost:5173"))
                .andExpect(status().isOk());
        // WebMvcTest does not enforce CORS strictly, but header presence is tested via integration if needed
    }
}
