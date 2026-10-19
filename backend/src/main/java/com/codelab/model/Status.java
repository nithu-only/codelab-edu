package com.codelab.model;

/**
 * Execution status per CONTRACT.md.
 */
public enum Status {
    QUEUED,
    RUNNING,
    SUCCESS,
    FAILED,
    TIMEOUT,
    ERROR,
    CANCELLED
}
