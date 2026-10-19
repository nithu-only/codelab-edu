package com.codelab.service;

import com.codelab.dto.ExecutionRequest;
import com.codelab.dto.ExecutionResponse;

public interface ExecutionService {
    ExecutionResponse execute(ExecutionRequest req);
    ExecutionResponse cancel(String executionId);
    ExecutionResponse getResult(String executionId);
}
