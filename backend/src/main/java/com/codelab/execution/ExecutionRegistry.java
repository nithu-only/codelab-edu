package com.codelab.execution;

import com.codelab.dto.ExecutionResponse;
import org.springframework.stereotype.Component;

import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicBoolean;

@Component
public class ExecutionRegistry {

    public static class Entry {
        public final String executionId;
        public final String containerName;
        public final long startTimeMs;
        public final AtomicBoolean cancelled = new AtomicBoolean(false);
        public final AtomicBoolean finished = new AtomicBoolean(false);
        public volatile ExecutionResponse result;

        Entry(String executionId, String containerName) {
            this.executionId = executionId;
            this.containerName = containerName;
            this.startTimeMs = System.currentTimeMillis();
        }
    }

    private final ConcurrentHashMap<String, Entry> running = new ConcurrentHashMap<>();
    private final ConcurrentHashMap<String, ExecutionResponse> completed = new ConcurrentHashMap<>();

    public Entry register(String executionId, String containerName) {
        Entry e = new Entry(executionId, containerName);
        running.put(executionId, e);
        return e;
    }

    public Entry getRunning(String executionId) {
        return running.get(executionId);
    }

    public ExecutionResponse getCompleted(String executionId) {
        return completed.get(executionId);
    }

    public boolean markCancelled(String executionId) {
        Entry e = running.get(executionId);
        if (e != null) {
            return e.cancelled.compareAndSet(false, true);
        }
        // already completed? treat as idempotent success if was cancelled
        ExecutionResponse r = completed.get(executionId);
        return r != null && "CANCELLED".equals(r.getStatus());
    }

    public boolean isCancelled(String executionId) {
        Entry e = running.get(executionId);
        return e != null && e.cancelled.get();
    }

    public void complete(String executionId, ExecutionResponse result) {
        Entry e = running.remove(executionId);
        if (e != null) {
            e.finished.set(true);
            e.result = result;
        }
        completed.put(executionId, result);
        // keep completed for a while; simple in-memory, no eviction for V1 (controlled testing)
    }

    public int runningCount() {
        return running.size();
    }
}
