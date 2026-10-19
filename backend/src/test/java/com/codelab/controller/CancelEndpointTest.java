package com.codelab.controller;

import com.codelab.dto.ExecutionResponse;
import com.codelab.service.ExecutionService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(ExecutionController.class)
class CancelEndpointTest {

    @Autowired MockMvc mockMvc;
    @Autowired ObjectMapper om;
    @MockBean ExecutionService executionService;

    @Test
    void cancelShouldReturnCancelledWhenRunning() throws Exception {
        ExecutionResponse cr = new ExecutionResponse("id123", "CANCELLED", "python", "", "[Execution cancelled by user]", -1, 1234L, "2026-01-01T00:00:00Z");
        when(executionService.cancel("id123")).thenReturn(cr);
        mockMvc.perform(post("/api/execute/id123/cancel"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("CANCELLED"))
                .andExpect(jsonPath("$.executionId").value("id123"));
    }

    @Test
    void cancelShouldBe404ForUnknown() throws Exception {
        when(executionService.cancel(anyString())).thenReturn(null);
        mockMvc.perform(post("/api/execute/unknown/cancel"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.error").value("Not found"));
    }

    @Test
    void getExecutionShouldReturnRunningOrCompleted() throws Exception {
        ExecutionResponse running = new ExecutionResponse("id123", "RUNNING", "", "", "", -1, 500L, "2026-01-01T00:00:00Z");
        when(executionService.getResult("id123")).thenReturn(running);
        mockMvc.perform(get("/api/execute/id123"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("RUNNING"));
    }

    @Test
    void getExecutionShould404ForUnknown() throws Exception {
        when(executionService.getResult(anyString())).thenReturn(null);
        mockMvc.perform(get("/api/execute/unknown"))
                .andExpect(status().isNotFound());
    }
}
