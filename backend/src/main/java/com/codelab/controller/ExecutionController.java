package com.codelab.controller;

import com.codelab.dto.ExecutionRequest;
import com.codelab.dto.ExecutionResponse;
import com.codelab.dto.ErrorResponse;
import com.codelab.model.Language;
import com.codelab.service.ExecutionService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "http://localhost:5173")
public class ExecutionController {

    private final ExecutionService executionService;

    public ExecutionController(ExecutionService executionService) {
        this.executionService = executionService;
    }

    @PostMapping("/execute")
    public ResponseEntity<ExecutionResponse> execute(@Valid @RequestBody ExecutionRequest request) {
        ExecutionResponse response = executionService.execute(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/execute/{executionId}/cancel")
    public ResponseEntity<?> cancel(@PathVariable String executionId) {
        com.codelab.dto.ExecutionResponse result = executionService.cancel(executionId);
        if (result == null) {
            ErrorResponse err = new ErrorResponse("Not found", List.of("Execution not found: " + executionId));
            return ResponseEntity.status(404).body(err);
        }
        return ResponseEntity.ok(result);
    }

    @GetMapping("/execute/{executionId}")
    public ResponseEntity<?> getExecution(@PathVariable String executionId) {
        com.codelab.dto.ExecutionResponse result = executionService.getResult(executionId);
        if (result == null) {
            ErrorResponse error = new ErrorResponse(
                    "Not found",
                    List.of("Execution not found: " + executionId)
            );
            return ResponseEntity.status(404).body(error);
        }
        return ResponseEntity.ok(result);
    }

    @GetMapping("/languages")
    public ResponseEntity<List<String>> getLanguages() {
        List<String> languages = Language.getSupportedValues().stream().sorted().toList();
        return ResponseEntity.ok(languages);
    }

    @GetMapping("/health")
    public ResponseEntity<Map<String, String>> health() {
        return ResponseEntity.ok(Map.of("status", "UP"));
    }
}
