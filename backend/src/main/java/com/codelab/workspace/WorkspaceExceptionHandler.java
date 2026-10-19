package com.codelab.workspace;

import com.codelab.dto.ErrorResponse;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.List;

@RestControllerAdvice
@Order(Ordered.HIGHEST_PRECEDENCE)
public class WorkspaceExceptionHandler {

    @ExceptionHandler(WorkspaceException.class)
    public ResponseEntity<ErrorResponse> handleWorkspace(WorkspaceException ex) {
        int status = ex.getStatus();
        ErrorResponse err = new ErrorResponse(ex.getMessage(), List.of(ex.getMessage()));
        return ResponseEntity.status(status).body(err);
    }
}
