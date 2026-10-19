package com.codelab.dto;

import com.codelab.validation.ValidLanguage;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class ExecutionRequest {

    @NotBlank(message = "language must not be blank")
    @ValidLanguage
    private String language;

    @NotBlank(message = "sourceCode must not be blank")
    @Size(max = 102400, message = "sourceCode must not exceed 100KB (102400 characters)")
    private String sourceCode;

    private String stdin;

    private String executionId;

    public ExecutionRequest() {
    }

    public ExecutionRequest(String language, String sourceCode, String stdin) {
        this.language = language;
        this.sourceCode = sourceCode;
        this.stdin = stdin;
    }

    public String getExecutionId() {
        return executionId;
    }

    public void setExecutionId(String executionId) {
        this.executionId = executionId;
    }

    public String getLanguage() {
        return language;
    }

    public void setLanguage(String language) {
        this.language = language;
    }

    public String getSourceCode() {
        return sourceCode;
    }

    public void setSourceCode(String sourceCode) {
        this.sourceCode = sourceCode;
    }

    public String getStdin() {
        return stdin;
    }

    public void setStdin(String stdin) {
        this.stdin = stdin;
    }

    /**
     * Returns stdin or empty string if null, per contract default "".
     */
    public String getStdinOrDefault() {
        return stdin == null ? "" : stdin;
    }

    /**
     * Returns normalized language (lower-case trimmed).
     */
    public String getNormalizedLanguage() {
        return language == null ? null : language.trim().toLowerCase();
    }
}
